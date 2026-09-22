/**
 * Yalla's daily reminder. Every 15 minutes: read the `push/{uid}` docs that are switched on, pick
 * the ones whose local reminder hour starts now and that haven't been reminded today, skip anyone
 * who already played today (per their `users/{uid}` progress record), and send one Web Push.
 * The decisions are pure and live in remind.ts; this file only does I/O.
 */
import { onSchedule } from "firebase-functions/v2/scheduler";
import { defineSecret } from "firebase-functions/params";
import * as logger from "firebase-functions/logger";
import { initializeApp } from "firebase-admin/app";
import { getFirestore, type QueryDocumentSnapshot } from "firebase-admin/firestore";
import webpush from "web-push";
import { VAPID_PUBLIC_KEY, VAPID_SUBJECT } from "./config";
import {
  compose,
  dueNow,
  isGone,
  readPlayState,
  runTime,
  TOPIC,
  ttlToMidnight,
  type LocalTime,
  type SubJSON,
} from "./remind";

initializeApp();

const VAPID_PRIVATE_KEY = defineSecret("VAPID_PRIVATE_KEY");

/** Sends in flight at once. */
const BATCH = 25;
/** Per-request timeout: web-push only aborts a stalled request when this is set. */
const SEND_TIMEOUT_MS = 10_000;
/** Stop starting new batches this long into the run (the function times out at 300 s). */
const RUN_DEADLINE_MS = 240_000;

interface Job {
  doc: QueryDocumentSnapshot;
  day: string;
  local: LocalTime;
  sub: SubJSON;
}

type Outcome = "sent" | "played" | "gone" | "failed";

export const remind = onSchedule(
  {
    // Aligned to :00/:15/:30/:45 UTC, which is also :00/:15/:30/:45 in every real time zone.
    schedule: "*/15 * * * *",
    timeZone: "Etc/UTC",
    region: "us-central1",
    secrets: [VAPID_PRIVATE_KEY],
    retryCount: 0,
    timeoutSeconds: 300,
    memory: "256MiB",
    maxInstances: 1,
  },
  async (event) => {
    const started = Date.now();
    const now = runTime(event.scheduleTime, new Date());
    webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY.value());
    const db = getFirestore();
    // Only the fields the decision needs, so an oversized doc can't bloat the run.
    const on = await db
      .collection("push")
      .where("on", "==", true)
      .select("sub", "hour", "tz", "on", "lastSent")
      .get();

    const jobs: Job[] = [];
    let badSub = 0;
    for (const doc of on.docs) {
      const d = dueNow(doc.data(), now);
      if (d.due) jobs.push({ doc, day: d.day, local: d.local, sub: d.sub });
      else if (d.reason === "bad-sub") badSub++;
    }

    const tally: Record<Outcome, number> = { sent: 0, played: 0, gone: 0, failed: 0 };
    let skipped = 0;
    for (let i = 0; i < jobs.length; i += BATCH) {
      if (Date.now() - started > RUN_DEADLINE_MS) {
        skipped = jobs.length - i;
        logger.warn("remind: run deadline reached", { skipped });
        break;
      }
      const outcomes = await Promise.all(jobs.slice(i, i + BATCH).map(run));
      for (const o of outcomes) tally[o]++;
    }
    logger.info("remind", {
      at: now.toISOString(),
      on: on.size,
      due: jobs.length,
      badSub,
      skipped,
      ...tally,
    });

    async function run({ doc, day, local, sub }: Job): Promise<Outcome> {
      const uid = doc.id;
      try {
        const user = await db.doc(`users/${uid}`).get();
        const msg = compose(user.exists ? readPlayState(user.get("json")) : null, day);
        if (!msg) return "played";
        await webpush.sendNotification(sub, JSON.stringify(msg), {
          TTL: ttlToMidnight(local),
          urgency: "normal",
          topic: TOPIC,
          timeout: SEND_TIMEOUT_MS,
        });
        await doc.ref.update({ lastSent: day, lastSentAt: Date.now() });
        return "sent";
      } catch (e) {
        if (isGone(e)) {
          // Only switch off the subscription we tried: if the learner re-enabled (new endpoint)
          // since the query, the precondition fails and their fresh doc is left alone.
          await doc.ref
            .update({ on: false, goneAt: Date.now() }, { lastUpdateTime: doc.updateTime })
            .catch(() => undefined);
          return "gone";
        }
        logger.warn("remind: send failed", {
          uid,
          status: (e as { statusCode?: number }).statusCode,
          message: (e as Error).message?.slice(0, 200),
        });
        return "failed";
      }
    }
  },
);
