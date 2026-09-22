import type { Story } from "./types";

/** Mini stories — weather, technology, education, military, city, commerce, animals, science, sport. */
export const STORIES_C: readonly Story[] = [
  {
    id: "st-c01",
    title: "Haggling at the Shuk",
    he: "מַשָּׂא וּמַתָּן בַּשּׁוּק",
    lines: [
      {
        he: "בְּיוֹם שִׁשִּׁי בַּבֹּקֶר הָלַכְתִּי לַשּׁוּק לִקְנוֹת אֲבַטִּיחַ.",
        en: "On Friday morning I went to the shuk to buy a watermelon.",
        tags: [
          { w: "הָלַכְתִּי", r: "הלך" },
          { w: "לַשּׁוּק", r: "שוק" },
          { w: "לִקְנוֹת", r: "קנה" },
        ],
      },
      {
        he: 'הַסּוֹחֵר צָעַק: "אֲבַטִּיחַ מָתוֹק, רַק חֲמִשִּׁים שֶׁקֶל!"',
        en: 'The vendor shouted: "Sweet watermelon, only fifty shekels!"',
        tags: [
          { w: "הַסּוֹחֵר", r: "סחר" },
          { w: "חֲמִשִּׁים", r: "חמש" },
        ],
      },
      {
        he: "אָמַרְתִּי לוֹ שֶׁזֶּה יָקָר מִדַּי, וְשֶׁבַּדּוּכָן הַשָּׁכֵן זֶה יוֹתֵר זוֹל.",
        en: "I told him it was too expensive, and that the stall next door was cheaper.",
        tags: [
          { w: "אָמַרְתִּי", r: "אמר" },
          { w: "יָקָר", r: "יקר" },
          { w: "זוֹל", r: "זול" },
        ],
      },
      {
        he: "הוּא צָחַק, הִפְחִית עֲשָׂרָה שְׁקָלִים וְהוֹסִיף שְׁלוֹשָׁה לִימוֹנִים בְּמַתָּנָה.",
        en: "He laughed, knocked off ten shekels and threw in three lemons for free.",
        tags: [
          { w: "הִפְחִית", r: "פחת" },
          { w: "וְהוֹסִיף", r: "יסף" },
          { w: "שְׁלוֹשָׁה", r: "שלש" },
        ],
      },
      {
        he: "שִׁלַּמְתִּי בִּשְׁטָר שֶׁל חֲמִשִּׁים וְקִבַּלְתִּי עֹדֶף שֶׁל עֲשָׂרָה שְׁקָלִים.",
        en: "I paid with a fifty-shekel note and got ten shekels in change.",
        tags: [
          { w: "שִׁלַּמְתִּי", r: "שלם" },
          { w: "חֲמִשִּׁים", r: "חמש" },
          { w: "עֹדֶף", r: "עדף" },
        ],
      },
      {
        he: "בַּבַּיִת גִּלִּינוּ שֶׁהָאֲבַטִּיחַ לֹא מָתוֹק בִּכְלָל – אֲבָל הַלִּימוֹנִים מְצֻיָּנִים.",
        en: "At home we discovered the watermelon wasn't sweet at all – but the lemons are excellent.",
        tags: [
          { w: "גִּלִּינוּ", r: "גלה" },
          { w: "מְצֻיָּנִים", r: "צין" },
        ],
      },
    ],
    qs: [
      {
        q: "How much did the vendor first ask for the watermelon?",
        opts: ["Forty shekels", "Fifty shekels", "Ten shekels", "Sixty shekels"],
        a: 1,
      },
      {
        q: "What did the vendor add for free?",
        opts: ["Three lemons", "Two tomatoes", "A second watermelon"],
        a: 0,
      },
      {
        q: "How did it turn out at home?",
        opts: [
          "The watermelon was very sweet",
          "They took the watermelon back",
          "The watermelon wasn't sweet, but the lemons were great",
        ],
        a: 2,
      },
    ],
  },
  {
    id: "st-c02",
    title: "Grandma's Shopping List",
    he: "הָרְשִׁימָה שֶׁל סַבְתָּא",
    lines: [
      {
        he: "סַבְתָּא שָׁלְחָה אֶת יוֹנִי לַשּׁוּק עִם רְשִׁימָה וּמֵאָה שֶׁקֶל.",
        en: "Grandma sent Yoni to the shuk with a list and a hundred shekels.",
        tags: [
          { w: "שָׁלְחָה", r: "שלח" },
          { w: "לַשּׁוּק", r: "שוק" },
          { w: "רְשִׁימָה", r: "רשם" },
          { w: "וּמֵאָה", r: "מאה" },
        ],
      },
      {
        he: 'בְּיוֹם שִׁשִּׁי הַשּׁוּק הָיָה עָמוּס, וְכָל הַסּוֹחֲרִים צָעֲקוּ: "מִבְצָע!"',
        en: 'On Friday the shuk was packed, and all the vendors were shouting: "Special offer!"',
        tags: [
          { w: "הַשּׁוּק", r: "שוק" },
          { w: "עָמוּס", r: "עמס" },
          { w: "הַסּוֹחֲרִים", r: "סחר" },
          { w: "מִבְצָע", r: "בצע" },
        ],
      },
      {
        he: "יוֹנִי קָנָה שְׁלוֹשָׁה קִילוֹ תּוּתִים, כִּי הֵם נִמְכְּרוּ בְּזוֹל.",
        en: "Yoni bought three kilos of strawberries, because they were going cheap.",
        tags: [
          { w: "קָנָה", r: "קנה" },
          { w: "שְׁלוֹשָׁה", r: "שלש" },
          { w: "נִמְכְּרוּ", r: "מכר" },
          { w: "בְּזוֹל", r: "זול" },
        ],
      },
      {
        he: "אַחַר כָּךְ הוּא הוֹצִיא עוֹד כֶּסֶף עַל גְּבִינָה, זֵיתִים וְחַלָּה עֲנָקִית.",
        en: "Then he spent more money on cheese, olives and a giant challah.",
        tags: [
          { w: "הוֹצִיא", r: "יצא" },
          { w: "כֶּסֶף", r: "כסף" },
        ],
      },
      {
        he: "כְּשֶׁחָזַר הַבַּיְתָה, סַבְתָּא קָרְאָה שׁוּב אֶת הָרְשִׁימָה וְשָׁאֲלָה: אֵיפֹה הָעַגְבָנִיּוֹת?",
        en: "When he got home, Grandma read the list again and asked: where are the tomatoes?",
        tags: [
          { w: "כְּשֶׁחָזַר", r: "חזר" },
          { w: "קָרְאָה", r: "קרא" },
          { w: "שׁוּב", r: "שוב" },
          { w: "הָרְשִׁימָה", r: "רשם" },
          { w: "וְשָׁאֲלָה", r: "שאל" },
        ],
      },
      {
        he: "יוֹנִי הִסְבִּיר שֶׁלֹּא נִשְׁאַר לוֹ מַסְפִּיק כֶּסֶף – רַק עֹדֶף שֶׁל שְׁנֵי שְׁקָלִים.",
        en: "Yoni explained that he didn't have enough money left – just two shekels in change.",
        tags: [
          { w: "הִסְבִּיר", r: "סבר" },
          { w: "מַסְפִּיק", r: "ספק" },
          { w: "כֶּסֶף", r: "כסף" },
          { w: "עֹדֶף", r: "עדף" },
        ],
      },
    ],
    qs: [
      {
        q: "How much money did Grandma give Yoni?",
        opts: ["Fifty shekels", "Two hundred shekels", "A hundred shekels"],
        a: 2,
      },
      {
        q: "Why did Yoni buy strawberries?",
        opts: ["They were cheap", "They were on the list", "A friend recommended them"],
        a: 0,
      },
      {
        q: "What was missing when he got home?",
        opts: ["The challah", "The tomatoes", "The cheese", "The olives"],
        a: 1,
      },
    ],
  },
  {
    id: "st-c03",
    title: "The Night Before the Exam",
    he: "הַלַּיְלָה שֶׁלִּפְנֵי הַמִּבְחָן",
    lines: [
      {
        he: "בַּלַּיְלָה לִפְנֵי הַמִּבְחָן בְּהִיסְטוֹרְיָה, נוֹעָה יָשְׁבָה מוּל הַמַּחְשֵׁב.",
        en: "The night before the history exam, Noa sat in front of the computer.",
        tags: [
          { w: "לִפְנֵי", r: "פנה" },
          { w: "הַמִּבְחָן", r: "בחן" },
          { w: "יָשְׁבָה", r: "ישב" },
        ],
      },
      {
        he: "פִּתְאֹם הַמָּסָךְ הֶחְשִׁיךְ, וְנִרְאָה שֶׁכָּל הַסִּכּוּמִים שֶׁלָּהּ נִמְחֲקוּ.",
        en: "Suddenly the screen went dark, and it looked as if all her summaries had been deleted.",
        tags: [
          { w: "הַסִּכּוּמִים", r: "סכם" },
          { w: "נִמְחֲקוּ", r: "מחק" },
        ],
      },
      {
        he: "הִיא לָחֲצָה עַל כָּל הַמַּקָּשִׁים, אֲבָל שׁוּם דָּבָר לֹא עָזַר.",
        en: "She pressed every key, but nothing helped.",
        tags: [
          { w: "לָחֲצָה", r: "לחץ" },
          { w: "הַמַּקָּשִׁים", r: "נקש" },
          { w: "דָּבָר", r: "דבר" },
        ],
      },
      {
        he: "אָחִיהָ הַקָּטָן בָּא, חִבֵּר אֶת הַמַּטְעֵן וְאָמַר: הַסּוֹלְלָה פָּשׁוּט רֵיקָה.",
        en: "Her little brother came, plugged in the charger and said: the battery is just empty.",
        tags: [
          { w: "בָּא", r: "בוא" },
          { w: "הַמַּטְעֵן", r: "טען" },
          { w: "וְאָמַר", r: "אמר" },
          { w: "הַסּוֹלְלָה", r: "סלל" },
        ],
      },
      {
        he: "הַמַּחְשֵׁב נִדְלַק, וְכָל הַקְּבָצִים הָיוּ שָׁם – וְגַם מְאֻחְסָנִים בָּעָנָן.",
        en: "The computer came back on, and all the files were there – and stored in the cloud too.",
        tags: [
          { w: "מְאֻחְסָנִים", r: "אחסן" },
          { w: "בָּעָנָן", r: "ענן" },
        ],
      },
      {
        he: "לְמָחֳרָת הִיא נִבְחֲנָה וְקִבְּלָה צִיּוּן מְצֻיָּן: תִּשְׁעִים וְחָמֵשׁ.",
        en: "The next day she sat the exam and got an excellent grade: ninety-five.",
        tags: [
          { w: "נִבְחֲנָה", r: "בחן" },
          { w: "צִיּוּן", r: "צין" },
          { w: "מְצֻיָּן", r: "צין" },
          { w: "וְחָמֵשׁ", r: "חמש" },
        ],
      },
    ],
    qs: [
      {
        q: "Why did the screen go dark?",
        opts: [
          "The computer caught a virus",
          "The battery was empty",
          "Her brother deleted the files",
        ],
        a: 1,
      },
      {
        q: "Where else were her files stored?",
        opts: ["In the cloud", "On a printout", "On her brother's phone"],
        a: 0,
      },
      {
        q: "What grade did Noa get?",
        opts: ["Seventy-five", "Eighty", "Ninety-five", "One hundred"],
        a: 2,
      },
    ],
  },
  {
    id: "st-c04",
    title: "Football in the Rain",
    he: "כַּדּוּרֶגֶל בַּגֶּשֶׁם",
    lines: [
      {
        he: "בְּשַׁבָּת בַּבֹּקֶר הַשָּׁמַיִם הָיוּ מְעֻנָּנִים, אֲבָל הַמִּשְׂחָק לֹא בֻּטַּל.",
        en: "On Saturday morning the sky was cloudy, but the game wasn't called off.",
        tags: [{ w: "מְעֻנָּנִים", r: "ענן" }],
      },
      {
        he: "הַקְּבוּצָה שֶׁל אָבִי שִׂחֲקָה נֶגֶד הַשְּׁכוּנָה הַשְּׁכֵנָה, וְהָאוֹהֲדִים עוֹדְדוּ מִן הַצַּד.",
        en: "Avi's team played the neighborhood next door, and the fans cheered from the sidelines.",
        tags: [
          { w: "וְהָאוֹהֲדִים", r: "אהד" },
          { w: "עוֹדְדוּ", r: "עוד" },
        ],
      },
      {
        he: "פִּתְאֹם הָיוּ בְּרָקִים וּרְעָמִים, וְגֶשֶׁם חָזָק יָרַד עַל הַמִּגְרָשׁ.",
        en: "Suddenly there was lightning and thunder, and heavy rain came down on the pitch.",
        tags: [
          { w: "בְּרָקִים", r: "ברק" },
          { w: "וּרְעָמִים", r: "רעם" },
          { w: "וְגֶשֶׁם", r: "גשם" },
          { w: "יָרַד", r: "ירד" },
        ],
      },
      {
        he: "הַכַּדּוּר נִתְקַע בַּבֹּץ, וְאָבִי נָפַל פַּעֲמַיִם לִפְנֵי שֶׁהִצְלִיחַ לִבְעֹט.",
        en: "The ball got stuck in the mud, and Avi fell twice before he managed to kick it.",
        tags: [
          { w: "הַכַּדּוּר", r: "כדר" },
          { w: "נָפַל", r: "נפל" },
          { w: "לִפְנֵי", r: "פנה" },
          { w: "לִבְעֹט", r: "בעט" },
        ],
      },
      {
        he: "בַּסּוֹף הוּא כָּבַשׁ שַׁעַר מַדְהִים מֵרָחוֹק, וְכָל הַקְּבוּצָה קָפְצָה עָלָיו.",
        en: "In the end he scored an amazing goal from far out, and the whole team jumped on him.",
        tags: [
          { w: "כָּבַשׁ", r: "כבש" },
          { w: "שַׁעַר", r: "שער" },
          { w: "מֵרָחוֹק", r: "רחק" },
        ],
      },
      {
        he: "הֵם זָכוּ בַּמִּשְׂחָק, וְחָזְרוּ הַבַּיְתָה רְטֻבִּים, מְלֻכְלָכִים וּמְאֻשָּׁרִים.",
        en: "They won the game and went home wet, muddy and happy.",
        tags: [
          { w: "זָכוּ", r: "זכה" },
          { w: "וְחָזְרוּ", r: "חזר" },
        ],
      },
    ],
    qs: [
      {
        q: "What happened to the weather during the game?",
        opts: ["It snowed", "There was thunder and heavy rain", "It got very hot"],
        a: 1,
      },
      {
        q: "Who scored the goal?",
        opts: ["Avi", "One of the fans", "The other team's captain"],
        a: 0,
      },
      {
        q: "How did the players go home?",
        opts: ["Sad after losing", "Dry and tired", "Wet, muddy and happy"],
        a: 2,
      },
    ],
  },
  {
    id: "st-c05",
    title: "The Dog Who Ran Away",
    he: "הַכֶּלֶב שֶׁבָּרַח",
    lines: [
      {
        he: "בְּעֶרֶב חַם בְּתֵל אָבִיב, הַכֶּלֶב שֶׁל מִיכַל רָאָה חָתוּל וּבָרַח.",
        en: "On a hot evening in Tel Aviv, Michal's dog saw a cat and ran off.",
        tags: [
          { w: "אָבִיב", r: "אבב" },
          { w: "הַכֶּלֶב", r: "כלב" },
          { w: "חָתוּל", r: "חתל" },
        ],
      },
      {
        he: "הוּא רָץ לְאֹרֶךְ הַטַּיֶּלֶת, עָבַר אֶת הַכְּבִישׁ וְנֶעְלַם בֵּין הָאֲנָשִׁים.",
        en: "He ran along the promenade, crossed the road and disappeared into the crowd.",
        tags: [
          { w: "רָץ", r: "רוץ" },
          { w: "הַטַּיֶּלֶת", r: "טיל" },
          { w: "עָבַר", r: "עבר" },
          { w: "הַכְּבִישׁ", r: "כבש" },
        ],
      },
      {
        he: "מִיכַל פִּרְסְמָה תְּמוּנָה שֶׁלּוֹ בָּרְשָׁתוֹת, וְכָתְבָה אֶת מִסְפַּר הַטֶּלֶפוֹן שֶׁלָּהּ.",
        en: "Michal posted his picture on social media and wrote down her phone number.",
        tags: [
          { w: "פִּרְסְמָה", r: "פרסם" },
          { w: "וְכָתְבָה", r: "כתב" },
          { w: "מִסְפַּר", r: "ספר" },
          { w: "הַטֶּלֶפוֹן", r: "טלפן" },
        ],
      },
      {
        he: "אַחֲרֵי שָׁעָה טִלְפֵּן דַּיָּג זָקֵן וְאָמַר שֶׁהַכֶּלֶב אֶצְלוֹ בַּנָּמָל.",
        en: "An hour later an old fisherman called and said the dog was with him at the port.",
        tags: [
          { w: "טִלְפֵּן", r: "טלפן" },
          { w: "דַּיָּג", r: "דוג" },
          { w: "וְאָמַר", r: "אמר" },
          { w: "שֶׁהַכֶּלֶב", r: "כלב" },
          { w: "בַּנָּמָל", r: "נמל" },
        ],
      },
      {
        he: "מִיכַל מָצְאָה אוֹתוֹ שָׁם, יוֹשֵׁב לְיַד דְּלִי מָלֵא דָּגִים, מְאֻשָּׁר מְאוֹד.",
        en: "Michal found him there, sitting by a bucket full of fish, very happy.",
        tags: [
          { w: "מָצְאָה", r: "מצא" },
          { w: "יוֹשֵׁב", r: "ישב" },
          { w: "דָּגִים", r: "דוג" },
        ],
      },
      {
        he: 'הַדַּיָּג צָחַק: "נִרְאֶה שֶׁהוּא רוֹצֶה לִהְיוֹת חָתוּל!"',
        en: 'The fisherman laughed: "Looks like he wants to be a cat!"',
        tags: [
          { w: "הַדַּיָּג", r: "דוג" },
          { w: "חָתוּל", r: "חתל" },
        ],
      },
    ],
    qs: [
      {
        q: "Why did the dog run away?",
        opts: ["He heard thunder", "He saw a cat", "He smelled fish"],
        a: 1,
      },
      {
        q: "How did Michal find out where the dog was?",
        opts: ["A fisherman phoned her", "She saw him on TV", "A police officer brought him home"],
        a: 0,
      },
      {
        q: "Where was the dog found?",
        opts: ["On the beach", "In a park", "At the port, next to a bucket of fish"],
        a: 2,
      },
    ],
  },
  {
    id: "st-c06",
    title: "Reserve Duty",
    he: "מִלּוּאִים",
    lines: [
      {
        he: "רוֹנִי, מוֹרֶה לְמָתֵמָטִיקָה, גֻּיַּס לְשָׁבוּעַ שֶׁל מִלּוּאִים בַּצָּפוֹן.",
        en: "Roni, a math teacher, was called up for a week of reserve duty in the north.",
        tags: [
          { w: "גֻּיַּס", r: "גיס" },
          { w: "בַּצָּפוֹן", r: "צפן" },
        ],
      },
      {
        he: "הוּא הָיָה הַחַיָּל הֲכִי מְבֻגָּר בַּיְּחִידָה, וְהַמַּדִּים כְּבָר הָיוּ קְטַנִּים עָלָיו.",
        en: "He was the oldest soldier in the unit, and his uniform was already too small for him.",
        tags: [
          { w: "הַחַיָּל", r: "חיל" },
          { w: "מְבֻגָּר", r: "בגר" },
        ],
      },
      {
        he: "בַּבָּסִיס הִתְגַּלָּה שֶׁהַקָּצִין הֶחָדָשׁ הוּא תַּלְמִיד שֶׁלּוֹ מִן הַתִּיכוֹן.",
        en: "At the base it turned out that the new officer was one of his students from high school.",
        tags: [
          { w: "בַּבָּסִיס", r: "בסס" },
          { w: "הִתְגַּלָּה", r: "גלה" },
          { w: "שֶׁהַקָּצִין", r: "קצן" },
        ],
      },
      {
        he: "הַקָּצִין הַצָּעִיר שָׁלַח אוֹתוֹ לִשְׁמֹר לְיַד הַגָּדֵר כָּל לַיְלָה.",
        en: "The young officer sent him to stand guard by the fence every night.",
        tags: [
          { w: "הַקָּצִין", r: "קצן" },
          { w: "שָׁלַח", r: "שלח" },
          { w: "הַגָּדֵר", r: "גדר" },
        ],
      },
      {
        he: "רוֹנִי חָשַׁב שֶׁזֶּה בִּגְלַל כָּל הַמִּבְחָנִים שֶׁהוּא נָתַן לוֹ פַּעַם.",
        en: "Roni thought it was because of all the tests he had once given him.",
        tags: [{ w: "הַמִּבְחָנִים", r: "בחן" }],
      },
      {
        he: "בְּסוֹף הַשָּׁבוּעַ הוּא חָזַר לַכִּתָּה, וְהִבְטִיחַ לָתֵת פָּחוֹת מִבְחָנִים.",
        en: "At the end of the week he went back to his class and promised to give fewer tests.",
        tags: [
          { w: "חָזַר", r: "חזר" },
          { w: "פָּחוֹת", r: "פחת" },
          { w: "מִבְחָנִים", r: "בחן" },
        ],
      },
    ],
    qs: [
      {
        q: "What is Roni's regular job?",
        opts: ["Army officer", "Math teacher", "Fisherman"],
        a: 1,
      },
      {
        q: "Who turned out to be the new officer?",
        opts: ["Roni's former student", "Roni's brother", "An old army friend"],
        a: 0,
      },
      {
        q: "What did Roni promise at the end?",
        opts: ["To guard every night", "To buy a new uniform", "To give fewer tests"],
        a: 2,
      },
    ],
  },
  {
    id: "st-c07",
    title: "Hummus or Falafel?",
    he: "חוּמוּס אוֹ פָלָאפֶל?",
    lines: [
      {
        he: "הַמּוֹרָה לְמַדָּעִים בִּקְּשָׁה מֵאִתָּנוּ לַעֲשׂוֹת סֶקֶר בְּבֵית הַסֵּפֶר.",
        en: "The science teacher asked us to do a survey at school.",
        tags: [
          { w: "בִּקְּשָׁה", r: "בקש" },
          { w: "הַסֵּפֶר", r: "ספר" },
        ],
      },
      {
        he: "הַשְּׁאֵלָה שֶׁלָּנוּ הָיְתָה פְּשׁוּטָה: מָה יוֹתֵר טָעִים, חוּמוּס אוֹ פָלָאפֶל?",
        en: "Our question was simple: which is tastier, hummus or falafel?",
        tags: [{ w: "הַשְּׁאֵלָה", r: "שאל" }],
      },
      {
        he: "שָׁאַלְנוּ מֵאָה תַּלְמִידִים וְחִלַּקְנוּ אֶת הַתְּשׁוּבוֹת לִשְׁלוֹשָׁה סוּגִים.",
        en: "We asked a hundred students and sorted the answers into three kinds.",
        tags: [
          { w: "שָׁאַלְנוּ", r: "שאל" },
          { w: "מֵאָה", r: "מאה" },
          { w: "וְחִלַּקְנוּ", r: "חלק" },
          { w: "הַתְּשׁוּבוֹת", r: "שוב" },
          { w: "לִשְׁלוֹשָׁה", r: "שלש" },
          { w: "סוּגִים", r: "סוג" },
        ],
      },
      {
        he: "אַרְבָּעִים אָחוּז בָּחֲרוּ בְּחוּמוּס, וְאַרְבָּעִים אָחוּז בְּפָלָאפֶל.",
        en: "Forty percent chose hummus, and forty percent chose falafel.",
        tags: [
          { w: "אַרְבָּעִים", r: "רבע" },
          { w: "אָחוּז", r: "אחז" },
        ],
      },
      {
        he: "הַשְּׁאָר, עֶשְׂרִים אָחוּז, עָנוּ שֶׁהֵם רוֹצִים פִּיתָה עִם שְׁנֵיהֶם בְּיַחַד.",
        en: "The rest, twenty percent, answered that they want a pita with both together.",
        tags: [
          { w: "אָחוּז", r: "אחז" },
          { w: "עָנוּ", r: "ענה" },
        ],
      },
      {
        he: "הַתּוֹצָאָה הָיְתָה שָׁוָה, אָז הֶחְלַטְנוּ לַחֲזֹר עַל הַסֶּקֶר אַחֲרֵי אֲרוּחַת הַצָּהֳרַיִם.",
        en: "The result was a tie, so we decided to repeat the survey after lunch.",
        tags: [
          { w: "הַתּוֹצָאָה", r: "יצא" },
          { w: "שָׁוָה", r: "שוה" },
          { w: "לַחֲזֹר", r: "חזר" },
        ],
      },
    ],
    qs: [
      {
        q: "Who asked for the survey?",
        opts: ["The principal", "The science teacher", "The students' parents"],
        a: 1,
      },
      {
        q: "How many students did they ask?",
        opts: ["Forty", "Twenty", "A hundred"],
        a: 2,
      },
      {
        q: "What did twenty percent answer?",
        opts: ["A pita with both together", "Only falafel", "Neither of them"],
        a: 0,
      },
    ],
  },
  {
    id: "st-c08",
    title: "Snow in Jerusalem",
    he: "שֶׁלֶג בִּירוּשָׁלַיִם",
    lines: [
      {
        he: "בַּחֹרֶף שֶׁעָבַר יָרַד שֶׁלֶג כָּבֵד בִּירוּשָׁלַיִם, וְכָל הָעִיר נֶעֶצְרָה.",
        en: "Last winter heavy snow fell in Jerusalem, and the whole city came to a halt.",
        tags: [
          { w: "בַּחֹרֶף", r: "חרף" },
          { w: "שֶׁעָבַר", r: "עבר" },
          { w: "יָרַד", r: "ירד" },
          { w: "שֶׁלֶג", r: "שלג" },
          { w: "הָעִיר", r: "עיר" },
        ],
      },
      {
        he: "הַכְּבִישִׁים נִסְגְּרוּ, הָאוֹטוֹבּוּסִים לֹא נָסְעוּ, וּבָתֵּי הַסֵּפֶר הִכְרִיזוּ עַל יוֹם חֹפֶשׁ.",
        en: "The roads were closed, the buses didn't run, and the schools announced a day off.",
        tags: [
          { w: "הַכְּבִישִׁים", r: "כבש" },
          { w: "נָסְעוּ", r: "נסע" },
          { w: "הַסֵּפֶר", r: "ספר" },
          { w: "הִכְרִיזוּ", r: "כרז" },
          { w: "חֹפֶשׁ", r: "חפש" },
        ],
      },
      {
        he: "הַיְּלָדִים יָצְאוּ לַפַּארְק וְזָרְקוּ כַּדּוּרֵי שֶׁלֶג עַל כָּל מִי שֶׁעָבַר.",
        en: "The kids went out to the park and threw snowballs at everyone who walked by.",
        tags: [
          { w: "יָצְאוּ", r: "יצא" },
          { w: "וְזָרְקוּ", r: "זרק" },
          { w: "כַּדּוּרֵי", r: "כדר" },
          { w: "שֶׁלֶג", r: "שלג" },
          { w: "שֶׁעָבַר", r: "עבר" },
        ],
      },
      {
        he: "אֲפִלּוּ רֹאשׁ הָעִיר בָּנָה אִישׁ שֶׁלֶג לְיַד הָעִירִיָּה.",
        en: "Even the mayor built a snowman next to city hall.",
        tags: [
          { w: "הָעִיר", r: "עיר" },
          { w: "שֶׁלֶג", r: "שלג" },
          { w: "הָעִירִיָּה", r: "עיר" },
        ],
      },
      {
        he: "בַּלַּיְלָה הַכֹּל קָפָא, וּבַבֹּקֶר הַמִּדְרָכוֹת הָיוּ כְּמוֹ מִגְלָשָׁה.",
        en: "At night everything froze, and in the morning the sidewalks were like a slide.",
        tags: [
          { w: "קָפָא", r: "קפא" },
          { w: "הַמִּדְרָכוֹת", r: "דרך" },
          { w: "מִגְלָשָׁה", r: "גלש" },
        ],
      },
      {
        he: 'סַבָּא שֶׁלִּי הֶחְלִיק, נָפַל בַּשֶּׁלֶג וְצָחַק: "סוֹף סוֹף עָשִׂיתִי סְקִי!"',
        en: 'My grandpa slipped, fell in the snow and laughed: "At last I\'ve been skiing!"',
        tags: [
          { w: "נָפַל", r: "נפל" },
          { w: "בַּשֶּׁלֶג", r: "שלג" },
        ],
      },
    ],
    qs: [
      {
        q: "What happened to the schools?",
        opts: ["They moved lessons online", "The kids got a day off", "They stayed open as usual"],
        a: 1,
      },
      {
        q: "What did the mayor do?",
        opts: ["Built a snowman near city hall", "Drove a snowplow", "Threw snowballs at the kids"],
        a: 0,
      },
      {
        q: "Why were the sidewalks like a slide?",
        opts: [
          "Kids poured water on them",
          "It rained all morning",
          "Everything froze during the night",
        ],
        a: 2,
      },
    ],
  },
  {
    id: "st-c09",
    title: "Passports in the Freezer",
    he: "הַדַּרְכּוֹנִים בַּמַּקְפִּיא",
    lines: [
      {
        he: "מִשְׁפַּחַת לֵוִי הִגִּיעָה לִשְׂדֵה הַתְּעוּפָה שָׁלוֹשׁ שָׁעוֹת לִפְנֵי הַטִּיסָה לְיָוָן.",
        en: "The Levi family got to the airport three hours before their flight to Greece.",
        tags: [
          { w: "הַתְּעוּפָה", r: "עוף" },
          { w: "שָׁלוֹשׁ", r: "שלש" },
          { w: "לִפְנֵי", r: "פנה" },
          { w: "הַטִּיסָה", r: "טוס" },
        ],
      },
      {
        he: "הֵם עָמְדוּ בַּתּוֹר הָאָרֹךְ, וְאָז אַבָּא שָׁאַל: מִי לָקַח אֶת הַדַּרְכּוֹנִים?",
        en: "They stood in the long queue, and then Dad asked: who took the passports?",
        tags: [
          { w: "עָמְדוּ", r: "עמד" },
          { w: "בַּתּוֹר", r: "תור" },
          { w: "שָׁאַל", r: "שאל" },
          { w: "הַדַּרְכּוֹנִים", r: "דרך" },
        ],
      },
      {
        he: "כֻּלָּם הִסְתַּכְּלוּ עַל אִמָּא, וְאִמָּא פָּתְחָה אֶת הַתִּיק: אֵין דַּרְכּוֹנִים.",
        en: "Everyone looked at Mom, and Mom opened her bag: no passports.",
        tags: [{ w: "דַּרְכּוֹנִים", r: "דרך" }],
      },
      {
        he: "הַבֵּן הַגָּדוֹל נָסַע הַבַּיְתָה בְּמוֹנִית, וּמָצָא אוֹתָם בַּמַּקְפִּיא, לְיַד הַגְּלִידָה.",
        en: "The eldest son took a taxi home and found them in the freezer, next to the ice cream.",
        tags: [
          { w: "נָסַע", r: "נסע" },
          { w: "וּמָצָא", r: "מצא" },
          { w: "בַּמַּקְפִּיא", r: "קפא" },
        ],
      },
      {
        he: "אִמָּא הִסְבִּירָה שֶׁהִיא רָצְתָה לִשְׁמֹר אוֹתָם בְּמָקוֹם בָּטוּחַ וְקַר.",
        en: "Mom explained that she wanted to keep them somewhere safe and cool.",
        tags: [
          { w: "הִסְבִּירָה", r: "סבר" },
          { w: "בְּמָקוֹם", r: "קום" },
        ],
      },
      {
        he: "הַבֵּן חָזַר בְּדִיּוּק בַּזְּמַן, וְהַמָּטוֹס הִמְרִיא עִם כָּל הַמִּשְׁפָּחָה.",
        en: "The son made it back just in time, and the plane took off with the whole family.",
        tags: [
          { w: "חָזַר", r: "חזר" },
          { w: "בְּדִיּוּק", r: "דיק" },
          { w: "וְהַמָּטוֹס", r: "טוס" },
        ],
      },
    ],
    qs: [
      {
        q: "Where was the family flying?",
        opts: ["To Greece", "To Eilat", "To Italy"],
        a: 0,
      },
      {
        q: "Where were the passports?",
        opts: ["In Dad's pocket", "In the freezer at home", "In the taxi", "At the check-in desk"],
        a: 1,
      },
      {
        q: "Why did Mom put them there?",
        opts: [
          "The son hid them there as a joke",
          "By mistake, while putting away the ice cream",
          "She wanted to keep them somewhere safe and cool",
        ],
        a: 2,
      },
    ],
  },
  {
    id: "st-c10",
    title: "The Goat and the Hat",
    he: "הָעֵז וְהַכּוֹבַע",
    lines: [
      {
        he: "בַּחֻפְשָׁה נָסַעְנוּ לְמוֹשָׁב קָטָן בַּגָּלִיל, לַחֲוָה שֶׁל דּוֹד אֵלִי.",
        en: "On vacation we drove to a small moshav in the Galilee, to Uncle Eli's farm.",
        tags: [
          { w: "בַּחֻפְשָׁה", r: "חפש" },
          { w: "נָסַעְנוּ", r: "נסע" },
          { w: "לְמוֹשָׁב", r: "ישב" },
        ],
      },
      {
        he: "בַּבֹּקֶר עָזַרְנוּ לוֹ לַחְלֹב אֶת הַפָּרוֹת וּלְהַאֲכִיל אֶת הָעִזִּים.",
        en: "In the morning we helped him milk the cows and feed the goats.",
        tags: [
          { w: "לַחְלֹב", r: "חלב" },
          { w: "הָעִזִּים", r: "עזז" },
        ],
      },
      {
        he: "עֵז לְבָנָה אַחַת הִתְקָרְבָה אֵלַי וְתָפְסָה אֶת הַכּוֹבַע שֶׁלִּי בַּשִּׁנַּיִם.",
        en: "One white goat came up to me and grabbed my hat in her teeth.",
        tags: [
          { w: "עֵז", r: "עזז" },
          { w: "הִתְקָרְבָה", r: "קרב" },
          { w: "וְתָפְסָה", r: "תפס" },
          { w: "בַּשִּׁנַּיִם", r: "שנן" },
        ],
      },
      {
        he: "הִיא בָּרְחָה לְכָל הַכִּוּוּנִים, וַאֲנִי רַצְתִּי אַחֲרֶיהָ בְּתוֹךְ הָעֵדֶר.",
        en: "She bolted in every direction, and I ran after her through the herd.",
        tags: [
          { w: "הַכִּוּוּנִים", r: "כון" },
          { w: "רַצְתִּי", r: "רוץ" },
          { w: "הָעֵדֶר", r: "עדר" },
        ],
      },
      {
        he: "הַכֶּלֶב שֶׁל הַחֲוָה עָזַר לִי, וְהָעֵז סוֹף סוֹף עָצְרָה לְיַד הַגָּדֵר.",
        en: "The farm dog helped me, and the goat finally stopped by the fence.",
        tags: [
          { w: "הַכֶּלֶב", r: "כלב" },
          { w: "וְהָעֵז", r: "עזז" },
          { w: "הַגָּדֵר", r: "גדר" },
        ],
      },
      {
        he: "קִבַּלְתִּי אֶת הַכּוֹבַע בַּחֲזָרָה – עִם חוֹר גָּדוֹל, אֲבָל גַּם עִם סִפּוּר מְצֻיָּן.",
        en: "I got my hat back – with a big hole, but also with a great story.",
        tags: [
          { w: "בַּחֲזָרָה", r: "חזר" },
          { w: "סִפּוּר", r: "ספר" },
          { w: "מְצֻיָּן", r: "צין" },
        ],
      },
    ],
    qs: [
      {
        q: "Where did the family go on vacation?",
        opts: ["A farm on a moshav in the Galilee", "A hotel in Eilat", "A kibbutz by the sea"],
        a: 0,
      },
      {
        q: "What did the goat grab?",
        opts: ["A sandwich", "The narrator's hat", "The dog's ball"],
        a: 1,
      },
      {
        q: "Who helped catch the goat?",
        opts: ["Uncle Eli", "A shepherd", "The farm dog"],
        a: 2,
      },
    ],
  },
];
