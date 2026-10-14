/**
 * Everyday phrases: the things people say most, most common first (`rank` 1 = most frequent in
 * everyday speech; ranked by hand, not from a corpus). Learned with swipe cards; known / again
 * goes into word memory (`Progress.words`, keyed by `h`), so progress syncs like any word.
 *
 * Rules (enforced by phrases.test.ts): ids `ph-NNN` are stable forever (append, never reuse);
 * `h` is fully pointed and unique; `rank` is unique; `note` is English only; `fem` is the form a
 * woman says (`to: true`: the form said *to* a woman); each tag is an exact substring of `h`
 * pointing at a bank root.
 */
export type PhraseTopic =
  | "greet"
  | "polite"
  | "react"
  | "talk"
  | "ask"
  | "wish"
  | "feel"
  | "shop"
  | "around"
  | "time";

export const PHRASE_TOPICS: readonly { id: PhraseTopic; title: string; he: string }[] = [
  { id: "greet", title: "Hello & goodbye", he: "שָׁלוֹם" },
  { id: "polite", title: "Please & thanks", he: "תּוֹדָה" },
  { id: "react", title: "Reactions", he: "סַבָּבָּה" },
  { id: "talk", title: "Small talk", he: "שִׂיחָה" },
  { id: "ask", title: "Questions", he: "שְׁאֵלוֹת" },
  { id: "wish", title: "Wishes", he: "בְּרָכוֹת" },
  { id: "feel", title: "How you feel", he: "הַרְגָּשָׁה" },
  { id: "shop", title: "Food & shopping", he: "קְנִיּוֹת" },
  { id: "around", title: "Getting around", he: "דֶּרֶךְ" },
  { id: "time", title: "Time & plans", he: "זְמַן" },
];

export interface PhraseTag {
  /** Exact substring of the phrase. */
  w: string;
  /** Bank root id. */
  r: string;
}

export interface Phrase {
  id: string;
  /** Pointed Hebrew. */
  h: string;
  /** Transliteration. */
  t: string;
  /** English meaning. */
  g: string;
  topic: PhraseTopic;
  /** Frequency order across all phrases; 1 = most common. */
  rank: number;
  /** Usage, in English. */
  note?: string;
  /** The feminine form: what a woman says, or (`to`) what is said to a woman. */
  fem?: { h: string; to?: boolean };
  tags: readonly PhraseTag[];
}

type Row = [
  h: string,
  t: string,
  g: string,
  topic: PhraseTopic,
  tags?: Record<string, string>,
  extra?: { note?: string; fem?: string; femTo?: string; rank?: number },
];

// Row n is ph-n (ids never change, so new phrases are appended). Rank defaults to n; an
// appended phrase that is more common than that slots in with `rank` (fractions are fine).
const ROWS: Row[] = [
  ["שָׁלוֹם", "shalom", "hello; goodbye", "greet", { שָׁלוֹם: "שלם" }],
  ["תּוֹדָה", "toda", "thank you", "polite"],
  ["בְּסֵדֶר", "beseder", "OK; fine", "react", { סֵדֶר: "סדר" }],
  ["כֵּן", "ken", "yes", "react"],
  ["לֹא", "lo", "no", "react"],
  ["בְּבַקָּשָׁה", "bevakasha", "please; here you go", "polite", { בַקָּשָׁה: "בקש" }, {
    note: "Also the reply to thank you: you're welcome.",
  }],
  ["מָה נִשְׁמָע?", "ma nishma?", "how's it going?", "greet", { נִשְׁמָע: "שמע" }, {
    note: "Literally 'what is heard?'. Reply: beseder, or tov, toda.",
  }],
  ["סְלִיחָה", "slicha", "excuse me; sorry", "polite", { סְלִיחָה: "סלח" }],
  ["יַאלְלָה", "yalla", "come on; let's go", "react", undefined, {
    note: "From Arabic. Also 'OK then' to wrap something up.",
  }],
  ["רַק רֶגַע", "rak rega", "just a moment", "time", { רֶגַע: "רגע" }],
  ["אֲנִי לֹא יוֹדֵעַ", "ani lo yode'a", "I don't know", "talk", { יוֹדֵעַ: "ידע" }, {
    fem: "אֲנִי לֹא יוֹדַעַת",
  }],
  ["תּוֹדָה רַבָּה", "toda raba", "thank you very much", "polite"],
  ["סַבָּבָּה", "sababa", "cool; fine by me", "react", undefined, { note: "Slang, from Arabic." }],
  ["מָה שְׁלוֹמְךָ?", "ma shlomcha?", "how are you?", "greet", { שְׁלוֹמְךָ: "שלם" }, {
    femTo: "מָה שְׁלוֹמֵךְ?",
  }],
  ["טוֹב, תּוֹדָה", "tov, toda", "good, thanks", "talk", { טוֹב: "טוב" }],
  ["בֹּקֶר טוֹב", "boker tov", "good morning", "greet", { בֹּקֶר: "בקר", טוֹב: "טוב" }],
  ["אֵין בְּעָיָה", "ein be'aya", "no problem", "react"],
  ["אֲנִי לֹא מֵבִין", "ani lo mevin", "I don't understand", "ask", { מֵבִין: "בין" }, {
    fem: "אֲנִי לֹא מְבִינָה",
  }],
  ["לְהִתְרָאוֹת", "lehitra'ot", "see you; goodbye", "greet", { לְהִתְרָאוֹת: "ראה" }],
  ["בֶּטַח", "betach", "sure; of course", "react", { בֶּטַח: "בטח" }],
  ["כַּמָּה זֶה עוֹלֶה?", "kama ze ole?", "how much is it?", "shop", { עוֹלֶה: "עלה" }, {
    note: "Ole literally means 'goes up'. It is also the everyday verb for 'costs'.",
  }],
  ["אֵיפֹה הַשֵּׁרוּתִים?", "eifo hasherutim?", "where's the restroom?", "around"],
  ["מָה הַשָּׁעָה?", "ma hasha'a?", "what time is it?", "time", { שָּׁעָה: "שעה" }],
  ["בֶּאֱמֶת?", "be'emet?", "really?", "react", { אֱמֶת: "אמת" }],
  ["נָכוֹן", "nachon", "right; true", "react"],
  ["אֵין עַל מָה", "ein al ma", "you're welcome", "polite", undefined, {
    note: "Short for 'there's nothing to thank me for'. More formal: ein be'ad ma.",
  }],
  ["בַּיי", "bai", "bye", "greet"],
  ["הַכֹּל בְּסֵדֶר?", "hakol beseder?", "is everything OK?", "talk", { סֵדֶר: "סדר" }],
  ["הַכֹּל טוֹב", "hakol tov", "all good", "talk", { טוֹב: "טוב" }],
  ["מָה קוֹרֶה?", "ma kore?", "what's up?", "greet"],
  ["נָעִים מְאוֹד", "na'im me'od", "nice to meet you", "greet", { נָעִים: "נעם" }, {
    note: "Literally 'very pleasant'.",
  }],
  ["אֲנִי מִצְטַעֵר", "ani mitzta'er", "I'm sorry", "polite", undefined, {
    fem: "אֲנִי מִצְטַעֶרֶת",
  }],
  ["מַמָּשׁ", "mamash", "really; totally", "react"],
  ["בְּדִיּוּק", "bediyuk", "exactly", "react", { בְּדִיּוּק: "דיק" }],
  ["אֵין לִי מֻשָּׂג", "ein li musag", "I have no idea", "talk"],
  ["מָה אַתָּה עוֹשֶׂה?", "ma ata ose?", "what are you doing?", "talk", { עוֹשֶׂה: "עשה" }, {
    femTo: "מָה אַתְּ עוֹשָׂה?",
  }],
  ["אֵיךְ אוֹמְרִים…?", "eich omrim…?", "how do you say …?", "ask", { אוֹמְרִים: "אמר" }],
  ["אַתָּה מְדַבֵּר אַנְגְּלִית?", "ata medaber anglit?", "do you speak English?", "ask", {
    מְדַבֵּר: "דבר",
  }, { femTo: "אַתְּ מְדַבֶּרֶת אַנְגְּלִית?" }],
  ["מָה זֶה?", "ma ze?", "what's this?", "ask"],
  ["לָמָּה לֹא?", "lama lo?", "why not?", "react"],
  ["חֲבָל", "chaval", "too bad; what a shame", "react"],
  ["מַזָּל טוֹב", "mazal tov", "congratulations", "wish", { טוֹב: "טוב" }],
  ["בְּהַצְלָחָה", "behatzlacha", "good luck", "wish", { הַצְלָחָה: "צלח" }],
  ["שַׁבָּת שָׁלוֹם", "shabbat shalom", "have a good Shabbat", "wish", {
    שַׁבָּת: "שבת",
    שָׁלוֹם: "שלם",
  }],
  ["אַחְלָה", "achla", "great; excellent", "react", undefined, { note: "Slang, from Arabic." }],
  ["יֹפִי", "yofi", "great; nice", "react", { יֹפִי: "יפה" }, { note: "Literally 'beauty'." }],
  ["חַכֵּה רֶגַע", "chake rega", "wait a second", "time", { חַכֵּה: "חכה", רֶגַע: "רגע" }, {
    femTo: "חַכִּי רֶגַע",
  }],
  ["בּוֹא נֵלֵךְ", "bo nelech", "let's go", "around", { בּוֹא: "בוא", נֵלֵךְ: "הלך" }, {
    femTo: "בּוֹאִי נֵלֵךְ",
  }],
  ["מָה חָדָשׁ?", "ma chadash?", "what's new?", "greet", { חָדָשׁ: "חדש" }],
  ["מָה הַמַּצָּב?", "ma hamatzav?", "how are things?", "greet"],
  ["אֵיךְ קוֹרְאִים לְךָ?", "eich kor'im lecha?", "what's your name?", "talk", {
    קוֹרְאִים: "קרא",
  }, { femTo: "אֵיךְ קוֹרְאִים לָךְ?" }],
  ["קוֹרְאִים לִי…", "kor'im li…", "my name is …", "talk", { קוֹרְאִים: "קרא" }, {
    note: "Literally 'they call me …'.",
  }],
  ["מֵאֵיפֹה אַתָּה?", "me'eifo ata?", "where are you from?", "talk", undefined, {
    femTo: "מֵאֵיפֹה אַתְּ?",
  }],
  ["עַכְשָׁו", "achshav", "now", "time"],
  ["אַחַר כָּךְ", "achar kach", "later; afterwards", "time", { אַחַר: "אחר" }],
  ["מָחָר", "machar", "tomorrow", "time", { מָחָר: "אחר" }],
  ["הַיּוֹם", "hayom", "today", "time", { הַיּוֹם: "יום" }],
  ["אֶתְמוֹל", "etmol", "yesterday", "time"],
  ["עוֹד מְעַט", "od me'at", "soon; in a bit", "time"],
  ["תֵּכֶף", "techef", "in a moment; right away", "time"],
  ["נִתְרָאֶה", "nitra'e", "see you", "greet", { נִתְרָאֶה: "ראה" }],
  ["נְדַבֵּר", "nedaber", "talk soon", "greet", { נְדַבֵּר: "דבר" }, {
    note: "Literally 'we'll talk'.",
  }],
  ["יוֹם טוֹב", "yom tov", "have a good day", "greet", { יוֹם: "יום", טוֹב: "טוב" }, {
    note: "Also the traditional name for a festival day.",
  }],
  ["לַיְלָה טוֹב", "layla tov", "good night", "greet", { טוֹב: "טוב" }],
  ["עֶרֶב טוֹב", "erev tov", "good evening", "greet", { עֶרֶב: "ערב", טוֹב: "טוב" }],
  ["שָׁבוּעַ טוֹב", "shavua tov", "have a good week", "wish", { שָׁבוּעַ: "שבע", טוֹב: "טוב" }, {
    note: "Said from Saturday night, as Shabbat ends, into Sunday.",
  }],
  ["חַג שָׂמֵחַ", "chag same'ach", "happy holiday", "wish", { שָׂמֵחַ: "שמח" }],
  ["שָׁנָה טוֹבָה", "shana tova", "happy new year", "wish", { שָׁנָה: "שנה", טוֹב: "טוב" }, {
    note: "The Rosh Hashanah greeting.",
  }],
  ["בְּתֵאָבוֹן", "bete'avon", "enjoy your meal", "shop", undefined, {
    note: "Literally 'with appetite'.",
  }],
  ["לְחַיִּים", "lechayim", "cheers!", "shop", { חַיִּים: "חיה" }, { note: "Literally 'to life'." }],
  ["כָּל הַכָּבוֹד", "kol hakavod", "well done!", "react", { כָּבוֹד: "כבד" }, {
    note: "Literally 'all the honor'.",
  }],
  ["אֵין מַצָּב", "ein matzav", "no way!", "react", undefined, {
    note: "Literally 'there's no situation'.",
  }],
  ["מָה פִּתְאוֹם!", "ma pit'om!", "no way! of course not!", "react"],
  ["אוּלַי", "ulai", "maybe", "react"],
  ["אֲנִי לֹא בָּטוּחַ", "ani lo batu'ach", "I'm not sure", "talk", { בָּטוּחַ: "בטח" }, {
    fem: "אֲנִי לֹא בְּטוּחָה",
  }],
  ["לֹא נוֹרָא", "lo nora", "never mind; no big deal", "react", undefined, {
    note: "Literally 'not terrible'.",
  }],
  ["אֵין דָּבָר", "ein davar", "no worries; it's nothing", "polite", { דָּבָר: "דבר" }],
  ["אַל תִּדְאַג", "al tid'ag", "don't worry", "talk", { תִּדְאַג: "דאג" }, {
    femTo: "אַל תִּדְאֲגִי",
  }],
  ["זֶה לֹא מְשַׁנֶּה", "ze lo meshane", "it doesn't matter", "react", { מְשַׁנֶּה: "שנה" }],
  ["לֹא אִכְפַּת לִי", "lo ichpat li", "I don't mind; I don't care", "react"],
  ["אֲנִי מַסְכִּים", "ani maskim", "I agree", "talk", { מַסְכִּים: "סכם" }, {
    fem: "אֲנִי מַסְכִּימָה",
  }],
  ["אֶפְשָׁר לְדַבֵּר יוֹתֵר לְאַט?", "efshar ledaber yoter le'at?", "can you speak more slowly?", "ask", {
    לְדַבֵּר: "דבר",
  }],
  ["מָה זֶה אוֹמֵר?", "ma ze omer?", "what does it mean?", "ask", { אוֹמֵר: "אמר" }],
  ["אַתָּה יָכוֹל לַעֲזֹר לִי?", "ata yachol la'azor li?", "can you help me?", "ask", {
    לַעֲזֹר: "עזר",
  }, { femTo: "אַתְּ יְכוֹלָה לַעֲזֹר לִי?" }],
  ["אֲנִי צָרִיךְ…", "ani tzarich…", "I need …", "feel", { צָרִיךְ: "צרך" }, {
    fem: "אֲנִי צְרִיכָה…",
  }],
  ["אֲנִי רוֹצֶה…", "ani rotze…", "I'd like …; I want …", "shop", { רוֹצֶה: "רצה" }, {
    fem: "אֲנִי רוֹצָה…",
  }],
  ["אֶת הַחֶשְׁבּוֹן, בְּבַקָּשָׁה", "et hacheshbon, bevakasha", "the check, please", "shop", {
    חֶשְׁבּוֹן: "חשב",
    בַקָּשָׁה: "בקש",
  }],
  ["אֶפְשָׁר לְשַׁלֵּם בְּכַרְטִיס?", "efshar leshalem bekartis?", "can I pay by card?", "shop", {
    לְשַׁלֵּם: "שלם",
    כַרְטִיס: "כרטס",
  }, { note: "The pointing reads bechartis, but most people keep the k hard." }],
  ["בִּמְזֻמָּן", "bimzuman", "in cash", "shop", { מְזֻמָּן: "זמן" }],
  ["זֶה יָקָר מִדַּי", "ze yakar midai", "that's too expensive", "shop", { יָקָר: "יקר" }],
  ["יֵשׁ לָכֶם…?", "yesh lachem…?", "do you have …?", "shop", undefined, {
    note: "Asking a shop or a restaurant (you, plural).",
  }],
  ["תּוֹדָה, רַק מִסְתַּכֵּל", "toda, rak mistakel", "thanks, just looking", "shop", undefined, {
    fem: "תּוֹדָה, רַק מִסְתַּכֶּלֶת",
  }],
  ["פֹּה אוֹ לָקַחַת?", "po o lakachat?", "for here or to go?", "shop", { לָקַחַת: "לקח" }, {
    note: "Literally 'here or to take?'. Also asked as lashevet o lakachat?",
  }],
  ["קָפֶה הָפוּךְ", "kafe hafuch", "latte", "shop", undefined, {
    note: "Literally 'upside-down coffee'.",
  }],
  ["מָתַי סוֹגְרִים?", "matai sogrim?", "when do you close?", "shop", { סוֹגְרִים: "סגר" }],
  ["מִי אַחֲרוֹן?", "mi acharon?", "who's last in line?", "shop", { אַחֲרוֹן: "אחר" }, {
    note: "Ask when you join a queue, then go after whoever answers.",
  }],
  ["טָעִים מְאוֹד", "ta'im me'od", "very tasty", "shop", { טָעִים: "טעם" }],
  ["מַיִם, בְּבַקָּשָׁה", "mayim, bevakasha", "water, please", "shop", {
    מַיִם: "מים",
    בַקָּשָׁה: "בקש",
  }],
  ["אֲנִי רָעֵב", "ani ra'ev", "I'm hungry", "feel", { רָעֵב: "רעב" }, { fem: "אֲנִי רְעֵבָה" }],
  ["אֲנִי עָיֵף", "ani ayef", "I'm tired", "feel", { עָיֵף: "עיף" }, { fem: "אֲנִי עֲיֵפָה" }],
  ["אֲנִי לֹא מַרְגִּישׁ טוֹב", "ani lo margish tov", "I don't feel well", "feel", {
    מַרְגִּישׁ: "רגש",
    טוֹב: "טוב",
  }, { fem: "אֲנִי לֹא מַרְגִּישָׁה טוֹב" }],
  ["כּוֹאֵב לִי", "ko'ev li", "it hurts", "feel", { כּוֹאֵב: "כאב" }],
  ["אֵין לִי כֹּחַ", "ein li ko'ach", "I can't be bothered", "feel", undefined, {
    note: "Literally 'I have no strength'.",
  }],
  ["אֲנִי אוֹהֵב אֶת זֶה", "ani ohev et ze", "I love it", "feel", { אוֹהֵב: "אהב" }, {
    fem: "אֲנִי אוֹהֶבֶת אֶת זֶה",
  }],
  ["אֵיפֹה הַתַּחֲנָה?", "eifo hatachana?", "where's the stop?", "around", { תַּחֲנָה: "חנה" }, {
    note: "A bus or train stop.",
  }],
  ["זֶה רָחוֹק?", "ze rachok?", "is it far?", "around", { רָחוֹק: "רחק" }],
  ["זֶה קָרוֹב", "ze karov", "it's close", "around", { קָרוֹב: "קרב" }],
  ["יָשָׁר", "yashar", "straight ahead", "around"],
  ["יָמִינָה", "yamina", "to the right", "around"],
  ["שְׂמֹאלָה", "smola", "to the left", "around"],
  ["אֲנִי בַּדֶּרֶךְ", "ani baderech", "I'm on my way", "around", { דֶּרֶךְ: "דרך" }],
  ["אֲנִי הוֹלֵךְ הַבַּיְתָה", "ani holech habayta", "I'm going home", "around", {
    הוֹלֵךְ: "הלך",
  }, { fem: "אֲנִי הוֹלֶכֶת הַבַּיְתָה" }],
  ["תַּעֲצֹר פֹּה", "ta'atzor po", "stop here", "around", { תַּעֲצֹר: "עצר" }, {
    note: "To a driver.",
    femTo: "תַּעַצְרִי פֹּה",
  }],
  ["אֵיךְ מַגִּיעִים לְ…?", "eich magi'im le…?", "how do I get to …?", "around"],
  ["כַּמָּה זְמַן?", "kama zman?", "how long?", "time", { זְמַן: "זמן" }],
  ["אֵין לִי זְמַן", "ein li zman", "I don't have time", "time", { זְמַן: "זמן" }],
  ["מָתַי נִפָּגֵשׁ?", "matai nipagesh?", "when shall we meet?", "time", { נִפָּגֵשׁ: "פגש" }],
  ["לְאַט לְאַט", "le'at le'at", "slowly; little by little", "react"],
  ["בָּרוּךְ הַבָּא", "baruch haba", "welcome", "greet", { בָּרוּךְ: "ברך", בָּא: "בוא" }, {
    femTo: "בְּרוּכָה הַבָּאָה",
  }],
  ["תִּתְחַדֵּשׁ", "titchadesh", "enjoy your new things!", "wish", { תִּתְחַדֵּשׁ: "חדש" }, {
    note: "Said about new clothes or a new purchase.",
    femTo: "תִּתְחַדְּשִׁי",
  }],
  ["רְפוּאָה שְׁלֵמָה", "refu'a shlema", "get well soon", "wish", {
    רְפוּאָה: "רפא",
    שְׁלֵמָה: "שלם",
  }, { note: "Literally 'a complete recovery'." }],
  ["נְסִיעָה טוֹבָה", "nesi'a tova", "have a good trip", "wish", { נְסִיעָה: "נסע", טוֹב: "טוב" }],
  ["בְּשָׁעָה טוֹבָה", "besha'a tova", "congratulations (on happy news)", "wish", {
    שָׁעָה: "שעה",
    טוֹב: "טוב",
  }, { note: "For a pregnancy or a new start. Literally 'in a good hour'." }],
  ["סָגוּר", "sagur", "deal; it's settled", "react", { סָגוּר: "סגר" }, {
    note: "Slang. Literally 'closed'.",
  }],
  ["בְּכֵּיף", "bekef", "gladly; with pleasure", "polite"],
  ["תּוֹדָה, גַּם לְךָ", "toda, gam lecha", "thanks, you too", "polite", undefined, {
    femTo: "תּוֹדָה, גַּם לָךְ",
  }],
  ["סְלִיחָה עַל הָאִחוּר", "slicha al ha'ichur", "sorry I'm late", "polite", {
    סְלִיחָה: "סלח",
    אִחוּר: "אחר",
  }],
  ["תַּגִּיד לִי", "tagid li", "tell me", "talk", undefined, {
    note: "Also a filler: 'say, …'.",
    femTo: "תַּגִּידִי לִי",
  }],
  ["בְּעֶצֶם", "be'etzem", "actually", "talk", { עֶצֶם: "עצם" }],
  ["כְּאִלּוּ", "ke'ilu", "like; as if", "talk", undefined, {
    note: "The everyday filler word.",
  }],
  ["אָז מָה?", "az ma?", "so what?", "react"],
  ["מַגְנִיב", "magniv", "cool!", "react"],
  ["חֲבָל עַל הַזְּמַן", "chaval al hazman", "awesome", "react", { זְּמַן: "זמן" }, {
    note: "Slang. Literally 'a waste of time'.",
  }],
  ["עַל הַפָּנִים", "al hapanim", "awful", "react", { פָּנִים: "פנה" }, {
    note: "Slang. Literally 'on the face'.",
  }],
  ["תִּמְסֹר דַּ״שׁ", "timsor dash", "say hi for me", "greet", { תִּמְסֹר: "מסר" }, {
    note: "Dash is short for 'regards'.",
    femTo: "תִּמְסְרִי דַּ״שׁ",
  }],
  ["הַצִּילוּ!", "hatzilu!", "help!", "feel"],
  ["תִּתְקַשֵּׁר אֵלַי", "titkasher elai", "call me", "talk", { תִּתְקַשֵּׁר: "קשר" }, {
    femTo: "תִּתְקַשְּׁרִי אֵלַי",
  }],
  ["בָּרוּר", "barur", "obviously; sure", "react"],
  ["אַהְלָן", "ahlan", "hi", "greet", undefined, { note: "Slang, from Arabic." }],
  ["הַיי", "hai", "hi", "greet"],
  ["מָה אִתְּךָ?", "ma itcha?", "what's up with you?", "greet", undefined, {
    femTo: "מָה אִתָּךְ?",
  }],
  ["צָהֳרַיִם טוֹבִים", "tzohorayim tovim", "good afternoon", "greet", { טוֹב: "טוב" }],
  ["בֹּקֶר אוֹר", "boker or", "good morning (reply)", "greet", { בֹּקֶר: "בקר" }, {
    note: "Literally 'morning of light'.",
  }],
  ["אֵיפֹה אַתָּה גָּר?", "eifo ata gar?", "where do you live?", "talk", { גָּר: "גור" }, {
    femTo: "אֵיפֹה אַתְּ גָּרָה?",
  }],
  ["מָה אַתָּה מַמְלִיץ?", "ma ata mamlitz?", "what do you recommend?", "shop", undefined, {
    femTo: "מָה אַתְּ מַמְלִיצָה?",
  }],
  ["אֲנִי צִמְחוֹנִי", "ani tzimchoni", "I'm vegetarian", "shop", { צִמְחוֹנִי: "צמח" }, {
    fem: "אֲנִי צִמְחוֹנִית",
  }],
  ["בְּלִי חָרִיף", "bli charif", "not spicy, please", "shop", undefined, {
    note: "Literally 'without hot (sauce)'.",
  }],
  ["אֶפְשָׁר לְהַזְמִין?", "efshar lehazmin?", "can we order?", "shop", { לְהַזְמִין: "זמן" }],
  ["יֵשׁ תּוֹר?", "yesh tor?", "is there a line?", "shop", { תּוֹר: "תור" }],
  ["תֵּן לִי…", "ten li…", "give me …", "shop", { תֵּן: "נתן" }, { femTo: "תְּנִי לִי…" }],
  ["שָׁכַחְתִּי", "shachachti", "I forgot", "talk", { שָׁכַחְתִּי: "שכח" }],
  ["בִּשְׂמָחוֹת", "bismachot", "at happy occasions!", "wish", { שְׂמָחוֹת: "שמח" }, {
    note: "Said at a celebration, and when parting at a sad occasion: may we meet only at happy ones.",
  }],
  ["חֲלוֹמוֹת פַּזִּים", "chalomot pazim", "sweet dreams", "wish", undefined, {
    note: "Literally 'golden dreams'.",
  }],
  ["בְּקִצּוּר", "bekitzur", "in short", "talk", { קִצּוּר: "קצר" }],
  ["תִּהְיֶה בָּרִיא", "tihye bari", "be well; take care", "wish", undefined, {
    note: "A goodbye or a thanks. After a sneeze, Israelis say labri'ut.",
    femTo: "תִּהְיִי בְּרִיאָה",
  }],
  ["יַאלְלָה בַּיי", "yalla bai", "OK, bye", "greet"],
];

export const PHRASES: readonly Phrase[] = ROWS.map(([h, t, g, topic, tags, extra], i) => ({
  id: `ph-${String(i + 1).padStart(3, "0")}`,
  h,
  t,
  g,
  topic,
  rank: extra?.rank ?? i + 1,
  ...(extra?.note ? { note: extra.note } : {}),
  ...(extra?.fem
    ? { fem: { h: extra.fem } }
    : extra?.femTo
      ? { fem: { h: extra.femTo, to: true } }
      : {}),
  tags: Object.entries(tags ?? {}).map(([w, r]) => ({ w, r })),
}));

export const TOPIC_BY_ID: Readonly<Record<PhraseTopic, (typeof PHRASE_TOPICS)[number]>> =
  Object.fromEntries(PHRASE_TOPICS.map((x) => [x.id, x])) as Record<
    PhraseTopic,
    (typeof PHRASE_TOPICS)[number]
  >;
