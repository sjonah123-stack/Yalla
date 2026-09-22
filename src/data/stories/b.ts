// Mini stories — food, size, nature, law, Jewish life, culture, body, clothing.
import type { Story } from "./types";

export const STORIES_B: readonly Story[] = [
  {
    id: "st-b01",
    title: "Friday Night at Grandma's",
    he: "לֵיל שַׁבָּת אֵצֶל סַבְתָּא",
    lines: [
      {
        he: "בְּיוֹם שִׁשִּׁי בָּאנוּ לְסַבְתָּא לַאֲרוּחַת שַׁבָּת.",
        en: "On Friday we came to Grandma's for Shabbat dinner.",
        tags: [
          { w: "בָּאנוּ", r: "בוא" },
          { w: "שַׁבָּת", r: "שבת" },
        ],
      },
      {
        he: "סָבָא קִדֵּשׁ עַל הַיַּיִן, וְכֻלָּם שָׁתוּ מִן הַכּוֹס הַגְּדוֹלָה.",
        en: "Grandpa made kiddush over the wine, and everyone drank from the big cup.",
        tags: [
          { w: "קִדֵּשׁ", r: "קדש" },
          { w: "שָׁתוּ", r: "שתה" },
          { w: "הַגְּדוֹלָה", r: "גדל" },
        ],
      },
      {
        he: "אַחַר כָּךְ בֵּרַכְנוּ עַל הַחַלָּה שֶׁסַּבְתָּא אָפְתָה בַּבֹּקֶר.",
        en: "Then we said the blessing over the challah Grandma had baked that morning.",
        tags: [
          { w: "בֵּרַכְנוּ", r: "ברך" },
          { w: "אָפְתָה", r: "אפה" },
        ],
      },
      {
        he: "הַמָּרָק הָיָה חַם וְטָעִים, אֲבָל קְצָת מָלוּחַ מִדַּי.",
        en: "The soup was hot and tasty, but a little too salty.",
        tags: [
          { w: "חַם", r: "חמם" },
          { w: "וְטָעִים", r: "טעם" },
          { w: "מָלוּחַ", r: "מלח" },
        ],
      },
      {
        he: 'סַבְתָּא אָמְרָה: "אִם אַתֶּם עוֹד רְעֵבִים, יֵשׁ עוּגָה מְתוּקָה!"',
        en: "Grandma said: \"If you're still hungry, there's sweet cake!\"",
        tags: [
          { w: "אָמְרָה", r: "אמר" },
          { w: "רְעֵבִים", r: "רעב" },
          { w: "מְתוּקָה", r: "מתק" },
        ],
      },
      {
        he: "בַּסּוֹף כֻּלָּנוּ אָכַלְנוּ יוֹתֵר מִדַּי וְיָשַׁנּוּ עַל הַסַּפָּה.",
        en: "In the end we all ate too much and slept on the couch.",
        tags: [
          { w: "אָכַלְנוּ", r: "אכל" },
          { w: "וְיָשַׁנּוּ", r: "ישן" },
        ],
      },
    ],
    qs: [
      {
        q: "Who baked the challah?",
        opts: ["Grandpa", "A bakery", "Grandma", "The narrator"],
        a: 2,
      },
      {
        q: "What was wrong with the soup?",
        opts: ["It was a bit too salty", "It was cold", "It was too sweet"],
        a: 0,
      },
      {
        q: "Where did everyone end up?",
        opts: ["At the synagogue", "Asleep on the couch", "Out on a walk"],
        a: 1,
      },
    ],
  },
  {
    id: "st-b02",
    title: "A Night in the Galilee",
    he: "לַיְלָה בַּגָּלִיל",
    lines: [
      {
        he: "בְּסוֹף הַשָּׁבוּעַ נָסַעְנוּ לַגָּלִיל עִם אֹהֶל וְהַרְבֵּה אֹכֶל.",
        en: "At the weekend we drove to the Galilee with a tent and lots of food.",
        tags: [
          { w: "נָסַעְנוּ", r: "נסע" },
          { w: "אֹכֶל", r: "אכל" },
        ],
      },
      {
        he: "הָלַכְנוּ לְאֹרֶךְ הַנָּהָר, וְהַמַּיִם הָיוּ קָרִים מְאוֹד.",
        en: "We walked along the river, and the water was very cold.",
        tags: [
          { w: "הָלַכְנוּ", r: "הלך" },
          { w: "לְאֹרֶךְ", r: "ארך" },
          { w: "הַנָּהָר", r: "נהר" },
          { w: "וְהַמַּיִם", r: "מים" },
          { w: "קָרִים", r: "קרר" },
        ],
      },
      {
        he: "הַיְּלָדִים יָשְׁבוּ עַל אֶבֶן גְּדוֹלָה וְזָרְקוּ אֲבָנִים קְטַנּוֹת לַמַּיִם.",
        en: "The kids sat on a big rock and threw little stones into the water.",
        tags: [
          { w: "יָשְׁבוּ", r: "ישב" },
          { w: "אֶבֶן", r: "אבן" },
          { w: "גְּדוֹלָה", r: "גדל" },
          { w: "אֲבָנִים", r: "אבן" },
          { w: "קְטַנּוֹת", r: "קטן" },
          { w: "לַמַּיִם", r: "מים" },
        ],
      },
      {
        he: "כְּשֶׁהֶחְשִׁיךְ, הִדְלַקְנוּ מְדוּרָה קְטַנָּה וְיָשַׁבְנוּ סְבִיבָהּ.",
        en: "When it got dark, we lit a small campfire and sat around it.",
        tags: [
          { w: "כְּשֶׁהֶחְשִׁיךְ", r: "חשך" },
          { w: "קְטַנָּה", r: "קטן" },
          { w: "וְיָשַׁבְנוּ", r: "ישב" },
          { w: "סְבִיבָהּ", r: "סבב" },
        ],
      },
      {
        he: "בַּלַּיְלָה רָאִינוּ אֶת הַיָּרֵחַ וְאֵין סְפוֹר כּוֹכָבִים.",
        en: "At night we saw the moon and countless stars.",
        tags: [
          { w: "הַיָּרֵחַ", r: "ירח" },
          { w: "סְפוֹר", r: "ספר" },
          { w: "כּוֹכָבִים", r: "כוכב" },
        ],
      },
      {
        he: "בַּבֹּקֶר הִתְעוֹרַרְנוּ עֲיֵפִים, אֲבָל כֻּלָּם רָצוּ לַחֲזֹר בַּשָּׁנָה הַבָּאָה.",
        en: "In the morning we woke up tired, but everyone wanted to come back next year.",
        tags: [
          { w: "הִתְעוֹרַרְנוּ", r: "עור" },
          { w: "עֲיֵפִים", r: "עיף" },
          { w: "לַחֲזֹר", r: "חזר" },
          { w: "בַּשָּׁנָה", r: "שנה" },
          { w: "הַבָּאָה", r: "בוא" },
        ],
      },
    ],
    qs: [
      {
        q: "Where did they walk?",
        opts: ["Along the beach", "Along the river", "Through the old city"],
        a: 1,
      },
      {
        q: "What did the kids throw into the water?",
        opts: ["Bread", "Leaves", "Small stones", "Coins"],
        a: 2,
      },
      {
        q: "How did they feel in the morning?",
        opts: ["Tired, but keen to come back", "Sick and cold", "Hungry and grumpy"],
        a: 0,
      },
    ],
  },
  {
    id: "st-b03",
    title: "The Parking Fine",
    he: "קְנַס הַחֲנָיָה",
    lines: [
      {
        he: "דָּנִי חָנָה לְיַד הַבַּיִת וְקִבֵּל קְנָס שֶׁל מָאתַיִם וַחֲמִשִּׁים שֶׁקֶל.",
        en: "Dani parked next to his house and got a fine of two hundred and fifty shekels.",
        tags: [{ w: "שֶׁקֶל", r: "שקל" }],
      },
      {
        he: 'הוּא אָמַר: "אֲנִי לֹא אָשֵׁם! הַשֶּׁלֶט הָיָה מֵאֲחוֹרֵי עֵץ."',
        en: 'He said: "It\'s not my fault! The sign was behind a tree."',
        tags: [
          { w: "אָמַר", r: "אמר" },
          { w: "אָשֵׁם", r: "אשם" },
          { w: "הַשֶּׁלֶט", r: "שלט" },
        ],
      },
      {
        he: "דָּנִי בִּקֵּשׁ לְהִשָּׁפֵט וּבָא לְבֵית הַמִּשְׁפָּט עִם תַּצְלוּמִים.",
        en: "Dani asked for a trial and came to court with photos.",
        tags: [
          { w: "בִּקֵּשׁ", r: "בקש" },
          { w: "לְהִשָּׁפֵט", r: "שפט" },
          { w: "וּבָא", r: "בוא" },
          { w: "הַמִּשְׁפָּט", r: "שפט" },
          { w: "תַּצְלוּמִים", r: "צלם" },
        ],
      },
      {
        he: 'הַשּׁוֹפֶטֶת הִסְתַּכְּלָה בַּתַּצְלוּמִים וְשָׁאֲלָה: "אֵיפֹה בְּדִיּוּק הַשֶּׁלֶט?"',
        en: 'The judge looked at the photos and asked: "Where exactly is the sign?"',
        tags: [
          { w: "הַשּׁוֹפֶטֶת", r: "שפט" },
          { w: "בַּתַּצְלוּמִים", r: "צלם" },
          { w: "וְשָׁאֲלָה", r: "שאל" },
          { w: "הַשֶּׁלֶט", r: "שלט" },
        ],
      },
      {
        he: 'דָּנִי עָנָה בְּחִיּוּךְ: "זֹאת בְּדִיּוּק הַשְּׁאֵלָה שֶׁלִּי, כְּבוֹד הַשּׁוֹפֶטֶת."',
        en: 'Dani answered with a smile: "That\'s exactly my question, Your Honor."',
        tags: [
          { w: "עָנָה", r: "ענה" },
          { w: "הַשְּׁאֵלָה", r: "שאל" },
          { w: "כְּבוֹד", r: "כבד" },
          { w: "הַשּׁוֹפֶטֶת", r: "שפט" },
        ],
      },
      {
        he: "הַשּׁוֹפֶטֶת צָחֲקָה וּבִטְּלָה אֶת הַקְּנָס, וְדָנִי יָצָא מְאֻשָּׁר.",
        en: "The judge laughed and cancelled the fine, and Dani walked out happy.",
        tags: [
          { w: "הַשּׁוֹפֶטֶת", r: "שפט" },
          { w: "יָצָא", r: "יצא" },
        ],
      },
    ],
    qs: [
      {
        q: "Why did Dani say it wasn't his fault?",
        opts: ["He had paid for parking", "It wasn't his car", "The sign was hidden behind a tree"],
        a: 2,
      },
      {
        q: "What did Dani bring to court?",
        opts: ["Photos", "A lawyer", "His neighbor", "The sign"],
        a: 0,
      },
      {
        q: "How did the case end?",
        opts: ["Dani had to pay double", "The judge cancelled the fine", "The trial was postponed"],
        a: 1,
      },
    ],
  },
  {
    id: "st-b04",
    title: "A Dress for the Wedding",
    he: "שִׂמְלָה לַחֲתֻנָּה",
    lines: [
      {
        he: "מִיכַל הָלְכָה לַקַּנְיוֹן לִקְנוֹת שִׂמְלָה לַחֲתֻנָּה שֶׁל אָחִיהָ.",
        en: "Michal went to the mall to buy a dress for her brother's wedding.",
        tags: [{ w: "הָלְכָה", r: "הלך" }],
      },
      {
        he: "הַשִּׂמְלָה הָרִאשׁוֹנָה הָיְתָה אֲרֻכָּה מִדַּי, וְהַשְּׁנִיָּה הָיְתָה צָרָה בַּמָּתְנַיִם.",
        en: "The first dress was too long, and the second was tight at the waist.",
        tags: [
          { w: "הָרִאשׁוֹנָה", r: "ראש" },
          { w: "אֲרֻכָּה", r: "ארך" },
          { w: "צָרָה", r: "צר" },
        ],
      },
      {
        he: "הַשְּׁלִישִׁית הָיְתָה בְּצֶבַע כָּחֹל יָפֶה, עִם כַּפְתּוֹרֵי זָהָב קְטַנִּים.",
        en: "The third was a lovely blue, with little gold buttons.",
        tags: [
          { w: "בְּצֶבַע", r: "צבע" },
          { w: "כַּפְתּוֹרֵי", r: "כפתר" },
          { w: "קְטַנִּים", r: "קטן" },
        ],
      },
      {
        he: "הִיא הָיְתָה קְצָת רְחָבָה, אָז הַתּוֹפֶרֶת תִּקְּנָה אוֹתָהּ בְּיוֹם אֶחָד.",
        en: "It was a bit wide, so the seamstress altered it in a single day.",
        tags: [
          { w: "רְחָבָה", r: "רחב" },
          { w: "הַתּוֹפֶרֶת", r: "תפר" },
          { w: "תִּקְּנָה", r: "תקן" },
        ],
      },
      {
        he: "בַּחֲתֻנָּה כֻּלָּם שָׁאֲלוּ אוֹתָהּ אֵיפֹה קָנְתָה אֶת הַשִּׂמְלָה הַיָּפָה.",
        en: "At the wedding everyone asked her where she had bought the beautiful dress.",
        tags: [{ w: "שָׁאֲלוּ", r: "שאל" }],
      },
      {
        he: "רַק הַנַּעֲלַיִם הַחֲדָשׁוֹת כָּאֲבוּ לָהּ, אָז הִיא רָקְדָה יְחֵפָה כָּל הַלַּיְלָה.",
        en: "Only her new shoes hurt, so she danced barefoot all night.",
        tags: [
          { w: "הַנַּעֲלַיִם", r: "נעל" },
          { w: "הַחֲדָשׁוֹת", r: "חדש" },
          { w: "כָּאֲבוּ", r: "כאב" },
          { w: "רָקְדָה", r: "רקד" },
        ],
      },
    ],
    qs: [
      {
        q: "What was wrong with the first dress?",
        opts: ["It was too short", "It was too long", "It was too expensive"],
        a: 1,
      },
      { q: "What color was the dress she chose?", opts: ["Red", "Black", "White", "Blue"], a: 3 },
      {
        q: "Why did Michal dance barefoot?",
        opts: ["Her new shoes hurt", "She lost her shoes", "The wedding was on the beach"],
        a: 0,
      },
    ],
  },
  {
    id: "st-b05",
    title: "Yossi Catches a Cold",
    he: "יוֹסִי הִתְקָרֵר",
    lines: [
      {
        he: "בְּיוֹם רִאשׁוֹן יוֹסִי הִתְעוֹרֵר עִם כְּאֵב רֹאשׁ וְחֹם גָּבוֹהַּ.",
        en: "On Sunday Yossi woke up with a headache and a high fever.",
        tags: [
          { w: "רִאשׁוֹן", r: "ראש" },
          { w: "הִתְעוֹרֵר", r: "עור" },
          { w: "כְּאֵב", r: "כאב" },
          { w: "רֹאשׁ", r: "ראש" },
          { w: "וְחֹם", r: "חמם" },
        ],
      },
      {
        he: "הוּא הִשְׁתַּעֵל בְּלִי הַפְסָקָה וְלֹא הִצְלִיחַ לִנְשֹׁם דֶּרֶךְ הָאַף.",
        en: "He coughed nonstop and couldn't breathe through his nose.",
        tags: [
          { w: "הִשְׁתַּעֵל", r: "שעל" },
          { w: "לִנְשֹׁם", r: "נשם" },
        ],
      },
      {
        he: 'אִמָּא שֶׁלּוֹ אָמְרָה: "מַסְפִּיק! הוֹלְכִים לָרוֹפְאָה."',
        en: "His mom said: \"That's enough! We're going to the doctor.\"",
        tags: [
          { w: "אָמְרָה", r: "אמר" },
          { w: "הוֹלְכִים", r: "הלך" },
          { w: "לָרוֹפְאָה", r: "רפא" },
        ],
      },
      {
        he: "הָרוֹפְאָה בָּדְקָה אוֹתוֹ וְאָמְרָה שֶׁזּוֹ רַק שַׁפַּעַת, לֹא מַחֲלָה רְצִינִית.",
        en: "The doctor examined him and said it was just the flu, not a serious illness.",
        tags: [
          { w: "הָרוֹפְאָה", r: "רפא" },
          { w: "בָּדְקָה", r: "בדק" },
          { w: "וְאָמְרָה", r: "אמר" },
          { w: "מַחֲלָה", r: "חלה" },
        ],
      },
      {
        he: "הִיא נָתְנָה לוֹ תְּרוּפָה וְאָמְרָה לוֹ לִשְׁתּוֹת הַרְבֵּה תֵּה חַם וְלָנוּחַ.",
        en: "She gave him medicine and told him to drink lots of hot tea and rest.",
        tags: [
          { w: "תְּרוּפָה", r: "רפא" },
          { w: "וְאָמְרָה", r: "אמר" },
          { w: "לִשְׁתּוֹת", r: "שתה" },
          { w: "חַם", r: "חמם" },
          { w: "וְלָנוּחַ", r: "נוח" },
        ],
      },
      {
        he: "אַחֲרֵי שָׁבוּעַ בַּמִּטָּה יוֹסִי הִבְרִיא וְחָזַר לַכִּתָּה – עִם הֲמוֹן שִׁעוּרֵי בַּיִת.",
        en: "After a week in bed Yossi got better and went back to class – to a pile of homework.",
        tags: [
          { w: "הִבְרִיא", r: "בריא" },
          { w: "וְחָזַר", r: "חזר" },
        ],
      },
    ],
    qs: [
      {
        q: "What was wrong with Yossi on Sunday morning?",
        opts: ["A broken leg", "A stomach ache", "A headache and a high fever"],
        a: 2,
      },
      {
        q: "What did the doctor say?",
        opts: [
          "It's only the flu",
          "He needs surgery",
          "It's a serious illness",
          "He's pretending",
        ],
        a: 0,
      },
      {
        q: "What was waiting for him back in class?",
        opts: ["A surprise party", "Lots of homework", "A new teacher"],
        a: 1,
      },
    ],
  },
  {
    id: "st-b06",
    title: "The School Play",
    he: "הַהַצָּגָה בְּבֵית הַסֵּפֶר",
    lines: [
      {
        he: "הַכִּתָּה שֶׁל נוֹעָה הֶעֶלְתָה מַחֲזֶה עַל הַמֶּלֶךְ דָּוִד.",
        en: "Noa's class put on a play about King David.",
        tags: [
          { w: "הֶעֶלְתָה", r: "עלה" },
          { w: "מַחֲזֶה", r: "חזה" },
          { w: "הַמֶּלֶךְ", r: "מלך" },
        ],
      },
      {
        he: "נוֹעָה שִׂחֲקָה אֶת הַמַּלְכָּה, וְהָיָה לָהּ שִׁיר אָרֹךְ לָשִׁיר לְבַד.",
        en: "Noa played the queen, and she had a long song to sing solo.",
        tags: [
          { w: "שִׂחֲקָה", r: "שחק" },
          { w: "הַמַּלְכָּה", r: "מלך" },
          { w: "שִׁיר", r: "שיר" },
          { w: "אָרֹךְ", r: "ארך" },
          { w: "לָשִׁיר", r: "שיר" },
        ],
      },
      {
        he: "אַבָּא שֶׁלָּהּ יָשַׁב בַּשּׁוּרָה הָרִאשׁוֹנָה וְצִלֵּם כָּל רֶגַע.",
        en: "Her dad sat in the front row and photographed every moment.",
        tags: [
          { w: "יָשַׁב", r: "ישב" },
          { w: "הָרִאשׁוֹנָה", r: "ראש" },
          { w: "וְצִלֵּם", r: "צלם" },
        ],
      },
      {
        he: "בְּאֶמְצַע הַשִּׁיר הַכֶּתֶר נָפַל לָהּ מֵהָרֹאשׁ עַל הַבָּמָה.",
        en: "In the middle of the song her crown fell off her head onto the stage.",
        tags: [
          { w: "הַשִּׁיר", r: "שיר" },
          { w: "נָפַל", r: "נפל" },
          { w: "מֵהָרֹאשׁ", r: "ראש" },
        ],
      },
      {
        he: "הִיא לֹא הִפְסִיקָה לָשִׁיר, הֵרִימָה אֶת הַכֶּתֶר וְרָקְדָה אִתּוֹ.",
        en: "She didn't stop singing – she picked up the crown and danced with it.",
        tags: [
          { w: "לָשִׁיר", r: "שיר" },
          { w: "הֵרִימָה", r: "רום" },
          { w: "וְרָקְדָה", r: "רקד" },
        ],
      },
      {
        he: "בַּסּוֹף כָּל הַקָּהָל עָמַד וּמָחָא כַּפַּיִם, וְנוֹעָה קִבְּלָה פְּרָחִים.",
        en: "At the end the whole audience stood and clapped, and Noa got flowers.",
        tags: [
          { w: "עָמַד", r: "עמד" },
          { w: "וּמָחָא", r: "מחא" },
          { w: "פְּרָחִים", r: "פרח" },
        ],
      },
    ],
    qs: [
      {
        q: "What was the play about?",
        opts: ["King David", "A queen of Egypt", "Noa's school"],
        a: 0,
      },
      {
        q: "What happened in the middle of the song?",
        opts: [
          "Noa forgot the words",
          "The lights went out",
          "Her crown fell off",
          "Her dad started singing",
        ],
        a: 2,
      },
      {
        q: "What did Noa do then?",
        opts: [
          "She ran off the stage",
          "She picked up the crown and danced with it",
          "She started the song over",
        ],
        a: 1,
      },
    ],
  },
  {
    id: "st-b07",
    title: "The Lost Ring",
    he: "הַטַּבַּעַת שֶׁאָבְדָה",
    lines: [
      {
        he: "דּוֹדָה רוּת אִבְּדָה אֶת טַבַּעַת הַזָּהָב שֶׁלָּהּ.",
        en: "Aunt Ruth lost her gold ring.",
        tags: [
          { w: "אִבְּדָה", r: "אבד" },
          { w: "טַבַּעַת", r: "טבע" },
        ],
      },
      {
        he: "הִיא חִפְּשָׂה בַּמִּטְבָּח, בָּאַמְבַּטְיָה וּבַכִּיסִים שֶׁל כָּל הַמְּעִילִים.",
        en: "She searched the kitchen, the bathroom and the pockets of every coat.",
        tags: [{ w: "וּבַכִּיסִים", r: "כיס" }],
      },
      {
        he: "הִיא חָשְׁדָה בַּשָּׁכֵן הַקָּטָן, כִּי הוּא שִׂחֵק אֶצְלָהּ בַּבֹּקֶר.",
        en: "She suspected the little boy next door, because he had played at her place that morning.",
        tags: [
          { w: "חָשְׁדָה", r: "חשד" },
          { w: "הַקָּטָן", r: "קטן" },
          { w: "שִׂחֵק", r: "שחק" },
        ],
      },
      {
        he: 'הַיֶּלֶד נֶעֱלַב וְאָמַר: "אֲנִי לֹא גַּנָּב!"',
        en: 'The boy was offended and said: "I\'m not a thief!"',
        tags: [
          { w: "וְאָמַר", r: "אמר" },
          { w: "גַּנָּב", r: "גנב" },
        ],
      },
      {
        he: "בָּעֶרֶב, כְּשֶׁשָּׁטְפָה כֵּלִים, הִיא מָצְאָה אֶת הַטַּבַּעַת בְּתוֹךְ הַסְּפוֹג.",
        en: "In the evening, while washing the dishes, she found the ring inside the sponge.",
        tags: [
          { w: "הַטַּבַּעַת", r: "טבע" },
          { w: "הַסְּפוֹג", r: "ספג" },
        ],
      },
      {
        he: "דּוֹדָה רוּת בִּקְּשָׁה סְלִיחָה מֵהַשָּׁכֵן הַקָּטָן וְהֵבִיאָה לוֹ עוּגִיּוֹת.",
        en: "Aunt Ruth apologized to the little neighbor and brought him cookies.",
        tags: [
          { w: "בִּקְּשָׁה", r: "בקש" },
          { w: "סְלִיחָה", r: "סלח" },
          { w: "הַקָּטָן", r: "קטן" },
          { w: "וְהֵבִיאָה", r: "בוא" },
        ],
      },
    ],
    qs: [
      { q: "What did Aunt Ruth lose?", opts: ["Her glasses", "Her keys", "Her gold ring"], a: 2 },
      {
        q: "Whom did she suspect?",
        opts: ["The little boy next door", "The mailman", "Her sister"],
        a: 0,
      },
      {
        q: "Where was the ring in the end?",
        opts: ["In a coat pocket", "Inside the sponge", "Under the bed", "In the garden"],
        a: 1,
      },
    ],
  },
  {
    id: "st-b08",
    title: "Yom Kippur",
    he: "יוֹם כִּפּוּר",
    lines: [
      {
        he: "בְּיוֹם כִּפּוּר כָּל הַמִּשְׁפָּחָה צָמָה, חוּץ מֵהַיְּלָדִים הַקְּטַנִּים.",
        en: "On Yom Kippur the whole family fasted, except the little kids.",
        tags: [
          { w: "כִּפּוּר", r: "כפר" },
          { w: "צָמָה", r: "צום" },
          { w: "הַקְּטַנִּים", r: "קטן" },
        ],
      },
      {
        he: "בַּבֹּקֶר הָלַכְנוּ לְבֵית הַכְּנֶסֶת, וְאַבָּא הִתְפַּלֵּל שָׁעוֹת אֲרֻכּוֹת.",
        en: "In the morning we went to synagogue, and Dad prayed for hours and hours.",
        tags: [
          { w: "הָלַכְנוּ", r: "הלך" },
          { w: "הַכְּנֶסֶת", r: "כנס" },
          { w: "הִתְפַּלֵּל", r: "פלל" },
          { w: "אֲרֻכּוֹת", r: "ארך" },
        ],
      },
      {
        he: 'אָחִי הַקָּטָן שָׁאַל: "לָמָּה מְבַקְּשִׁים סְלִיחָה כָּל כָּךְ הַרְבֵּה פְּעָמִים?"',
        en: 'My little brother asked: "Why do we ask for forgiveness so many times?"',
        tags: [
          { w: "הַקָּטָן", r: "קטן" },
          { w: "שָׁאַל", r: "שאל" },
          { w: "מְבַקְּשִׁים", r: "בקש" },
          { w: "סְלִיחָה", r: "סלח" },
        ],
      },
      {
        he: 'אַבָּא הִסְבִּיר: "כִּי כֻּלָּנוּ חוֹטְאִים לִפְעָמִים, וְהַיּוֹם אֶפְשָׁר לְתַקֵּן."',
        en: 'Dad explained: "Because we all sin sometimes, and today we can put it right."',
        tags: [
          { w: "הִסְבִּיר", r: "סבר" },
          { w: "חוֹטְאִים", r: "חטא" },
          { w: "לְתַקֵּן", r: "תקן" },
        ],
      },
      {
        he: "בְּשָׁעָה חָמֵשׁ כֻּלָּם כְּבָר הָיוּ רְעֵבִים וּצְמֵאִים מְאוֹד.",
        en: "By five o'clock everyone was already very hungry and thirsty.",
        tags: [
          { w: "רְעֵבִים", r: "רעב" },
          { w: "וּצְמֵאִים", r: "צמא" },
        ],
      },
      {
        he: "כְּשֶׁשָּׁמַעְנוּ אֶת הַשּׁוֹפָר, חָזַרְנוּ הַבַּיְתָה, אָכַלְנוּ עוּגָה וְשָׁתִינוּ מִיץ.",
        en: "When we heard the shofar, we went home, ate cake and drank juice.",
        tags: [
          { w: "חָזַרְנוּ", r: "חזר" },
          { w: "אָכַלְנוּ", r: "אכל" },
          { w: "וְשָׁתִינוּ", r: "שתה" },
        ],
      },
    ],
    qs: [
      { q: "Who didn't fast?", opts: ["Dad", "Grandma", "The little kids"], a: 2 },
      {
        q: "What did the little brother ask?",
        opts: [
          "When they could eat",
          "Why they ask for forgiveness so many times",
          "Why the synagogue was so full",
        ],
        a: 1,
      },
      {
        q: "What did they do after the shofar?",
        opts: ["Went home and ate cake", "Went straight to sleep", "Stayed to pray some more"],
        a: 0,
      },
    ],
  },
  {
    id: "st-b09",
    title: "Grandpa's Garden",
    he: "הַגִּנָּה שֶׁל סָבָא",
    lines: [
      {
        he: "בָּאָבִיב סָבָא זָרַע זַרְעֵי עַגְבָנִיּוֹת בַּגִּנָּה.",
        en: "In spring Grandpa sowed tomato seeds in the garden.",
        tags: [
          { w: "זָרַע", r: "זרע" },
          { w: "זַרְעֵי", r: "זרע" },
        ],
      },
      {
        he: "כָּל בֹּקֶר הוּא נָתַן לָהֶם מַיִם וְדִבֵּר אִתָּם בְּשֶׁקֶט.",
        en: "Every morning he gave them water and talked to them quietly.",
        tags: [
          { w: "מַיִם", r: "מים" },
          { w: "וְדִבֵּר", r: "דבר" },
        ],
      },
      {
        he: "אַחֲרֵי שָׁבוּעַ צָמְחוּ צְמָחִים קְטַנִּים מִן הָאֲדָמָה.",
        en: "After a week, little plants came up out of the soil.",
        tags: [
          { w: "צָמְחוּ", r: "צמח" },
          { w: "צְמָחִים", r: "צמח" },
          { w: "קְטַנִּים", r: "קטן" },
          { w: "הָאֲדָמָה", r: "אדם" },
        ],
      },
      {
        he: "בַּקַּיִץ הֵם גָּדְלוּ וְהָיוּ גְּבוֹהִים יוֹתֵר מִמֶּנִּי.",
        en: "By summer they had grown taller than me.",
        tags: [{ w: "גָּדְלוּ", r: "גדל" }],
      },
      {
        he: "הַפְּרָחִים הַצְּהֻבִּים הָפְכוּ לְעַגְבָנִיּוֹת אֲדֻמּוֹת, מְתוּקוֹת וּמְלֵאוֹת מִיץ.",
        en: "The yellow flowers turned into red tomatoes, sweet and full of juice.",
        tags: [
          { w: "הַפְּרָחִים", r: "פרח" },
          { w: "אֲדֻמּוֹת", r: "אדם" },
          { w: "מְתוּקוֹת", r: "מתק" },
          { w: "וּמְלֵאוֹת", r: "מלא" },
        ],
      },
      {
        he: 'סָבָא טָעַם אַחַת וְאָמַר: "זֶה הַפְּרִי שֶׁל הַסַּבְלָנוּת."',
        en: 'Grandpa tasted one and said: "This is the fruit of patience."',
        tags: [
          { w: "טָעַם", r: "טעם" },
          { w: "וְאָמַר", r: "אמר" },
          { w: "הַפְּרִי", r: "פרה" },
        ],
      },
    ],
    qs: [
      { q: "What did Grandpa plant?", opts: ["Cucumbers", "Tomatoes", "Sunflowers"], a: 1 },
      {
        q: "What did Grandpa do every morning?",
        opts: [
          "Watered the seeds and talked to them",
          "Picked flowers for Grandma",
          "Read the paper in the garden",
        ],
        a: 0,
      },
      {
        q: "What were the tomatoes like?",
        opts: ["Small and sour", "Green and hard", "Sweet and juicy"],
        a: 2,
      },
    ],
  },
  {
    id: "st-b10",
    title: "Moving Day",
    he: "יוֹם הַמַּעֲבָר",
    lines: [
      {
        he: "בְּיוֹם חֲמִישִׁי עָבַרְנוּ לְדִירָה חֲדָשָׁה בַּקּוֹמָה הַשְּׁלִישִׁית.",
        en: "On Thursday we moved into a new apartment on the third floor.",
        tags: [
          { w: "עָבַרְנוּ", r: "עבר" },
          { w: "חֲדָשָׁה", r: "חדש" },
          { w: "בַּקּוֹמָה", r: "קום" },
        ],
      },
      {
        he: "כָּל הַלַּיְלָה אָרַזְנוּ קֻפְסָאוֹת וְקִפַּלְנוּ בְּגָדִים.",
        en: "All night long we packed boxes and folded clothes.",
        tags: [
          { w: "אָרַזְנוּ", r: "ארז" },
          { w: "וְקִפַּלְנוּ", r: "קפל" },
        ],
      },
      {
        he: "הַמַּעֲלִית הָיְתָה קְטַנָּה מִדַּי, אָז סָחַבְנוּ הַכֹּל בַּמַּדְרֵגוֹת.",
        en: "The elevator was too small, so we hauled everything up the stairs.",
        tags: [
          { w: "הַמַּעֲלִית", r: "עלה" },
          { w: "קְטַנָּה", r: "קטן" },
        ],
      },
      {
        he: "הָאָרוֹן הָיָה כָּבֵד מְאוֹד, וְהַמַּרְאָה נָפְלָה וְנִשְׁבְּרָה.",
        en: "The wardrobe was very heavy, and the mirror fell and broke.",
        tags: [
          { w: "כָּבֵד", r: "כבד" },
          { w: "נָפְלָה", r: "נפל" },
          { w: "וְנִשְׁבְּרָה", r: "שבר" },
        ],
      },
      {
        he: "בָּעֶרֶב תָּלִינוּ תְּמוּנוֹת, וְהַמְּקָרֵר הָיָה עֲדַיִן רֵיק.",
        en: "In the evening we hung pictures, and the fridge was still empty.",
        tags: [
          { w: "תָּלִינוּ", r: "תלה" },
          { w: "וְהַמְּקָרֵר", r: "קרר" },
          { w: "רֵיק", r: "ריק" },
        ],
      },
      {
        he: "הִזְמַנּוּ פִּיצָה, יָשַׁבְנוּ עַל הָרִצְפָּה בֵּין הַקֻּפְסָאוֹת, וְהָיִינוּ עֲיֵפִים וּמְאֻשָּׁרִים.",
        en: "We ordered pizza, sat on the floor among the boxes, and were tired and happy.",
        tags: [
          { w: "יָשַׁבְנוּ", r: "ישב" },
          { w: "עֲיֵפִים", r: "עיף" },
        ],
      },
    ],
    qs: [
      {
        q: "Which floor is the new apartment on?",
        opts: ["The first", "The second", "The third"],
        a: 2,
      },
      {
        q: "Why did they carry everything up the stairs?",
        opts: ["The elevator was too small", "The elevator was broken", "They wanted the exercise"],
        a: 0,
      },
      { q: "What broke?", opts: ["A lamp", "The mirror", "The fridge", "A window"], a: 1 },
    ],
  },
];
