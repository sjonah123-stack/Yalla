import { describe, expect, it } from "vitest";
import { authDomainFor, FIRST_PARTY_AUTH_HOSTS, firebaseConfig } from "./firebase-config";

describe("authDomainFor", () => {
  it("is first-party on every registered hosting origin", () => {
    for (const h of FIRST_PARTY_AUTH_HOSTS) expect(authDomainFor(h)).toBe(h);
  });
  it("falls back to the default domain elsewhere (dev server, previews)", () => {
    expect(authDomainFor("localhost")).toBe(firebaseConfig.authDomain);
    expect(authDomainFor("192.168.1.20")).toBe(firebaseConfig.authDomain);
  });
  it("keeps the default domain registered", () => {
    expect(FIRST_PARTY_AUTH_HOSTS).toContain(firebaseConfig.authDomain);
  });
});
