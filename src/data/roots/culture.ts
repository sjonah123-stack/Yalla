import type { Root } from "../../types";

/** Culture — 5 roots. */
export const CULTURE = [
  {
    r: "שיר",
    m: "sing / song",
    short: "sing",
    rank: 1,
    cat: "culture",
    unit: "culture-1",
    words: [
      { h: "שָׁר", t: "shar", g: "he sang", b: "pa'al" },
      { h: "שִׁיר", t: "shir", g: "song, poem", b: "noun" },
      { h: "שִׁירָה", t: "shira", g: "poetry; singing", b: "noun" },
      { h: "מְשׁוֹרֵר", t: "meshorer", g: "poet", b: "noun" },
      { h: "זַמָּר", t: "zamar", g: "singer (root זמר)", b: "noun" },
    ],
  },
  {
    r: "רקד",
    m: "dance",
    short: "dance",
    rank: 2,
    cat: "culture",
    unit: "culture-1",
    words: [
      { h: "רָקַד", t: "rakad", g: "he danced", b: "pa'al" },
      { h: "רִקּוּד", t: "rikud", g: "dance", b: "noun" },
      { h: "רַקְדָן", t: "rakdan", g: "dancer", b: "noun" },
      { h: "הִרְקִיד", t: "hirkid", g: "he made (people) dance", b: "hif'il" },
    ],
  },
  {
    r: "שחק",
    m: "play / laugh",
    short: "play",
    rank: 3,
    cat: "culture",
    unit: "culture-1",
    words: [
      { h: "שִׂחֵק", t: "sichek", g: "he played", b: "pi'el" },
      { h: "מִשְׂחָק", t: "mischak", g: "game", b: "noun" },
      { h: "שַׂחְקָן", t: "sachkan", g: "actor; player", b: "noun" },
      { h: "שְׂחוֹק", t: "schok", g: "laughter (biblical)", b: "noun" },
    ],
  },
  {
    r: "צלם",
    m: "photograph / image",
    short: "photograph",
    rank: 4,
    cat: "culture",
    unit: "culture-1",
    words: [
      { h: "צִלֵּם", t: "tzilem", g: "he photographed", b: "pi'el" },
      { h: "הִצְטַלֵּם", t: "hitztalem", g: "he had his picture taken", b: "hitpa'el" },
      { h: "צֶלֶם", t: "tzelem", g: "image (בצלם אלוהים)", b: "noun" },
      { h: "צַלָּם", t: "tzalam", g: "photographer", b: "noun" },
      { h: "מַצְלֵמָה", t: "matzlema", g: "camera", b: "noun" },
      { h: "תַּצְלוּם", t: "tatzlum", g: "photograph", b: "noun" },
    ],
  },
  {
    r: "ציר",
    m: "draw / axis / envoy",
    short: "draw",
    rank: 5,
    cat: "culture",
    unit: "culture-1",
    words: [
      { h: "צִיֵּר", t: "tziyer", g: "he drew, painted", b: "pi'el" },
      { h: "צִיּוּר", t: "tziyur", g: "drawing, painting", b: "noun" },
      { h: "צַיָּר", t: "tzayar", g: "painter", b: "noun" },
      { h: "צִיר", t: "tzir", g: "axis; hinge; envoy", b: "noun" },
    ],
  },
] as const satisfies readonly Root[];
