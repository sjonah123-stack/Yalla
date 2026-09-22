import type { Story } from "./types";

export const STORIES_A: readonly Story[] = [
  {
    id: "st-a01",
    title: "A Story on the Phone",
    he: "סִפּוּר בַּטֶּלֶפוֹן",
    lines: [
      {
        he: "דָּנָה כָּתְבָה סִפּוּר קָצָר עַל כֶּלֶב שֶׁנָּסַע לַיָּם.",
        en: "Dana wrote a short story about a dog who went to the sea.",
        tags: [
          { w: "כָּתְבָה", r: "כתב" },
          { w: "סִפּוּר", r: "ספר" },
          { w: "שֶׁנָּסַע", r: "נסע" },
        ],
      },
      {
        he: "הִיא הִתְקַשְּׁרָה לְסַבְתָּא וְקָרְאָה לָהּ אֶת הַסִּפּוּר בַּטֶּלֶפוֹן.",
        en: "She called Grandma and read her the story over the phone.",
        tags: [
          { w: "וְקָרְאָה", r: "קרא" },
          { w: "הַסִּפּוּר", r: "ספר" },
        ],
      },
      {
        he: 'סַבְתָּא שָׁאֲלָה: "וּלְאָן הַכֶּלֶב הָלַךְ מִשָּׁם?"',
        en: 'Grandma asked: "And where did the dog go from there?"',
        tags: [
          { w: "שָׁאֲלָה", r: "שאל" },
          { w: "הָלַךְ", r: "הלך" },
        ],
      },
      {
        he: 'דָּנָה עָנְתָה: "הוּא חָזַר הַבַּיְתָה, כִּי הַמַּיִם הָיוּ קָרִים מִדַּי!"',
        en: 'Dana answered: "He went back home, because the water was too cold!"',
        tags: [
          { w: "עָנְתָה", r: "ענה" },
          { w: "חָזַר", r: "חזר" },
        ],
      },
      {
        he: 'סַבְתָּא אָמְרָה: "תָּבוֹאִי אֵלַי בְּשַׁבָּת, וְנִכְתֹּב סִפּוּר חָדָשׁ בְּיַחַד."',
        en: 'Grandma said: "Come over on Shabbat, and we\'ll write a new story together."',
        tags: [
          { w: "אָמְרָה", r: "אמר" },
          { w: "תָּבוֹאִי", r: "בוא" },
          { w: "וְנִכְתֹּב", r: "כתב" },
          { w: "סִפּוּר", r: "ספר" },
        ],
      },
      {
        he: "בְּשַׁבָּת דָּנָה בָּאָה, וְהֵן יָשְׁבוּ וְכָתְבוּ סִפּוּר עַל חָתוּל שֶׁטָּס לַיָּרֵחַ.",
        en: "On Shabbat Dana came, and they sat and wrote a story about a cat who flew to the moon.",
        tags: [
          { w: "בָּאָה", r: "בוא" },
          { w: "יָשְׁבוּ", r: "ישב" },
          { w: "וְכָתְבוּ", r: "כתב" },
          { w: "סִפּוּר", r: "ספר" },
        ],
      },
    ],
    qs: [
      {
        q: "What was Dana's first story about?",
        opts: ["A cat", "A dog", "Her grandma", "A bus"],
        a: 1,
      },
      {
        q: "Why did the dog go back home?",
        opts: ["He was hungry", "It was getting late", "The water was too cold"],
        a: 2,
      },
      {
        q: "What did Dana and Grandma do on Shabbat?",
        opts: ["Wrote a new story", "Went to the sea", "Read a book"],
        a: 0,
      },
    ],
  },
  {
    id: "st-a02",
    title: "The Bus That Got Away",
    he: "הָאוֹטוֹבּוּס שֶׁבָּרַח",
    lines: [
      {
        he: "יוֹסִי יָצָא מֵהַבַּיִת מְאֻחָר וְרָץ לַתַּחֲנָה.",
        en: "Yossi left the house late and ran to the bus stop.",
        tags: [
          { w: "יָצָא", r: "יצא" },
          { w: "מְאֻחָר", r: "אחר" },
          { w: "וְרָץ", r: "רוץ" },
        ],
      },
      {
        he: "הוּא רָאָה אֶת הָאוֹטוֹבּוּס עוֹמֵד בַּתַּחֲנָה, וְאָז – הוּא נָסַע.",
        en: "He saw the bus standing at the stop, and then – it drove off.",
        tags: [
          { w: "רָאָה", r: "ראה" },
          { w: "עוֹמֵד", r: "עמד" },
          { w: "נָסַע", r: "נסע" },
        ],
      },
      {
        he: 'יוֹסִי צָעַק: "חַכֵּה! חַכֵּה!" אֲבָל הַנֶּהָג לֹא שָׁמַע.',
        en: 'Yossi shouted: "Wait! Wait!" but the driver didn\'t hear.',
        tags: [
          { w: "חַכֵּה", r: "חכה" },
          { w: "הַנֶּהָג", r: "נהג" },
          { w: "שָׁמַע", r: "שמע" },
        ],
      },
      {
        he: "הוּא יָשַׁב עַל הַסַּפְסָל וְחִכָּה עֶשְׂרִים דַּקּוֹת לָאוֹטוֹבּוּס הַבָּא.",
        en: "He sat on the bench and waited twenty minutes for the next bus.",
        tags: [
          { w: "יָשַׁב", r: "ישב" },
          { w: "וְחִכָּה", r: "חכה" },
          { w: "הַבָּא", r: "בוא" },
        ],
      },
      {
        he: 'כְּשֶׁהוּא נִכְנַס לַכִּתָּה, הַמּוֹרָה שָׁאֲלָה: "גַּם הַיּוֹם הָאוֹטוֹבּוּס בָּרַח?"',
        en: 'When he walked into class, the teacher asked: "Did the bus run away today too?"',
        tags: [
          { w: "נִכְנַס", r: "כנס" },
          { w: "שָׁאֲלָה", r: "שאל" },
          { w: "הַיּוֹם", r: "יום" },
        ],
      },
      {
        he: 'יוֹסִי עָנָה: "כֵּן, וּמָחָר אֲנִי קָם מֻקְדָּם!"',
        en: 'Yossi answered: "Yes, and tomorrow I\'m getting up early!"',
        tags: [
          { w: "עָנָה", r: "ענה" },
          { w: "וּמָחָר", r: "אחר" },
          { w: "קָם", r: "קום" },
          { w: "מֻקְדָּם", r: "קדם" },
        ],
      },
    ],
    qs: [
      {
        q: "Why did Yossi miss the bus?",
        opts: ["He left home late", "He forgot his bag", "The bus was full"],
        a: 0,
      },
      {
        q: "How long did Yossi wait for the next bus?",
        opts: ["Five minutes", "An hour", "Twenty minutes", "Ten minutes"],
        a: 2,
      },
      {
        q: "What does Yossi promise the teacher?",
        opts: ["To take a taxi", "To get up early tomorrow", "To walk to school"],
        a: 1,
      },
    ],
  },
  {
    id: "st-a03",
    title: "Where Are the Keys?",
    he: "אֵיפֹה הַמַּפְתְּחוֹת?",
    lines: [
      {
        he: "רוֹנִית חָזְרָה הַבַּיְתָה בָּעֶרֶב וְרָצְתָה לִפְתֹּחַ אֶת הַדֶּלֶת.",
        en: "Ronit came home in the evening and wanted to open the door.",
        tags: [
          { w: "חָזְרָה", r: "חזר" },
          { w: "בָּעֶרֶב", r: "ערב" },
          { w: "וְרָצְתָה", r: "רצה" },
          { w: "לִפְתֹּחַ", r: "פתח" },
        ],
      },
      {
        he: "הִיא חִפְּשָׂה בַּתִּיק, אֲבָל הַמַּפְתְּחוֹת לֹא הָיוּ שָׁם.",
        en: "She searched her bag, but the keys weren't there.",
        tags: [{ w: "הַמַּפְתְּחוֹת", r: "פתח" }],
      },
      {
        he: "הִיא נִזְכְּרָה שֶׁבַּבֹּקֶר הִיא שָׁכְחָה אוֹתָם עַל הַשֻּׁלְחָן בָּעֲבוֹדָה.",
        en: "She remembered that in the morning she had forgotten them on the table at work.",
        tags: [
          { w: "נִזְכְּרָה", r: "זכר" },
          { w: "שֶׁבַּבֹּקֶר", r: "בקר" },
          { w: "שָׁכְחָה", r: "שכח" },
          { w: "הַשֻּׁלְחָן", r: "שלח" },
          { w: "בָּעֲבוֹדָה", r: "עבד" },
        ],
      },
      {
        he: "הִיא הִתְקַשְּׁרָה לַשָּׁכֵן, כִּי יֵשׁ לוֹ מַפְתֵּחַ נוֹסָף.",
        en: "She called the neighbor, because he has a spare key.",
        tags: [
          { w: "לַשָּׁכֵן", r: "שכן" },
          { w: "מַפְתֵּחַ", r: "פתח" },
        ],
      },
      {
        he: 'הַשָּׁכֵן בָּא עִם הַמַּפְתֵּחַ וְאָמַר: "אֲנִי שׁוֹמֵר אוֹתוֹ בִּשְׁבִילֵךְ כְּבָר שָׁנָה."',
        en: 'The neighbor came with the key and said: "I\'ve been keeping it for you for a year now."',
        tags: [
          { w: "הַשָּׁכֵן", r: "שכן" },
          { w: "בָּא", r: "בוא" },
          { w: "הַמַּפְתֵּחַ", r: "פתח" },
          { w: "וְאָמַר", r: "אמר" },
          { w: "שׁוֹמֵר", r: "שמר" },
        ],
      },
      {
        he: 'רוֹנִית צָחֲקָה: "טוֹב שֶׁיֵּשׁ לִי שָׁכֵן עִם זִכָּרוֹן טוֹב!"',
        en: 'Ronit laughed: "Good thing I have a neighbor with a good memory!"',
        tags: [
          { w: "צָחֲקָה", r: "צחק" },
          { w: "טוֹב", r: "טוב" },
          { w: "שָׁכֵן", r: "שכן" },
          { w: "זִכָּרוֹן", r: "זכר" },
        ],
      },
    ],
    qs: [
      {
        q: "Where were Ronit's keys?",
        opts: ["In her bag", "At the neighbor's", "On the table at work", "In the car"],
        a: 2,
      },
      { q: "Who had a spare key?", opts: ["The neighbor", "Her mother", "Her boss"], a: 0 },
      {
        q: "How long had the neighbor been keeping the key?",
        opts: ["A week", "A year", "A month"],
        a: 1,
      },
    ],
  },
  {
    id: "st-a04",
    title: "Dinner for a Friend",
    he: "אֲרוּחַת עֶרֶב לְחָבֵר",
    lines: [
      {
        he: "נוֹעָה הִזְמִינָה אֶת הֶחָבֵר שֶׁלָּהּ, עוֹמֶר, לַאֲרוּחַת עֶרֶב.",
        en: "Noa invited her friend Omer to dinner.",
        tags: [
          { w: "הִזְמִינָה", r: "זמן" },
          { w: "הֶחָבֵר", r: "חבר" },
          { w: "עֶרֶב", r: "ערב" },
        ],
      },
      {
        he: "הִיא רָצְתָה לְבַשֵּׁל מַשֶּׁהוּ מְיֻחָד, וְהֶחְלִיטָה לְנַסּוֹת מָרָק שֶׁל סַבְתָּא.",
        en: "She wanted to cook something special, and decided to try Grandma's soup.",
        tags: [
          { w: "רָצְתָה", r: "רצה" },
          { w: "לְבַשֵּׁל", r: "בשל" },
          { w: "וְהֶחְלִיטָה", r: "חלט" },
          { w: "לְנַסּוֹת", r: "נסה" },
        ],
      },
      {
        he: "הִיא שָׁאֲלָה אֶת אִמָּא שֶׁלָּהּ בַּטֶּלֶפוֹן, וְאִמָּא הִסְבִּירָה לָהּ הַכֹּל.",
        en: "She asked her mom on the phone, and Mom explained everything to her.",
        tags: [
          { w: "שָׁאֲלָה", r: "שאל" },
          { w: "אִמָּא", r: "אמם" },
          { w: "וְאִמָּא", r: "אמם" },
          { w: "הִסְבִּירָה", r: "סבר" },
        ],
      },
      {
        he: "בָּעֶרֶב הַמִּטְבָּח הָיָה מְלֻכְלָךְ, אֲבָל הַמָּרָק הָיָה מֻשְׁלָם.",
        en: "By evening the kitchen was a mess, but the soup was perfect.",
        tags: [
          { w: "בָּעֶרֶב", r: "ערב" },
          { w: "מֻשְׁלָם", r: "שלם" },
        ],
      },
      {
        he: 'עוֹמֶר אָכַל שְׁתֵּי קְעָרוֹת וְאָמַר: "זֶה הַמָּרָק הֲכִי טוֹב שֶׁטָּעַמְתִּי!"',
        en: 'Omer ate two bowls and said: "This is the best soup I\'ve ever tasted!"',
        tags: [
          { w: "וְאָמַר", r: "אמר" },
          { w: "טוֹב", r: "טוב" },
        ],
      },
      {
        he: "אַחֲרֵי הָאֲרוּחָה הֵם נִקּוּ אֶת הַמִּטְבָּח בְּיַחַד וְשָׁטְפוּ אֶת הַכֵּלִים.",
        en: "After the meal they cleaned the kitchen together and washed the dishes.",
        tags: [
          { w: "אַחֲרֵי", r: "אחר" },
          { w: "נִקּוּ", r: "נקה" },
          { w: "וְשָׁטְפוּ", r: "שטף" },
        ],
      },
    ],
    qs: [
      {
        q: "What did Noa decide to make?",
        opts: ["Pasta", "A cake", "Grandma's soup", "A salad"],
        a: 2,
      },
      { q: "Who explained the recipe to Noa?", opts: ["Her mom", "Omer", "Her grandma"], a: 0 },
      {
        q: "What did Noa and Omer do after the meal?",
        opts: ["Went for a walk", "Cleaned the kitchen together", "Watched a movie"],
        a: 1,
      },
    ],
  },
  {
    id: "st-a05",
    title: "The New Neighbors",
    he: "הַשְּׁכֵנִים הַחֲדָשִׁים",
    lines: [
      {
        he: "מִשְׁפָּחָה חֲדָשָׁה עָבְרָה לַדִּירָה שֶׁמִּמּוּל.",
        en: "A new family moved into the apartment across the hall.",
        tags: [
          { w: "מִשְׁפָּחָה", r: "שפח" },
          { w: "עָבְרָה", r: "עבר" },
          { w: "לַדִּירָה", r: "דור" },
        ],
      },
      {
        he: "יֵשׁ לָהֶם שְׁלוֹשָׁה יְלָדִים וְכֶלֶב גָּדוֹל שֶׁנּוֹבֵחַ כָּל הַלַּיְלָה.",
        en: "They have three kids and a big dog that barks all night.",
        tags: [{ w: "יְלָדִים", r: "ילד" }],
      },
      {
        he: "בַּשַּׁבָּת הָרִאשׁוֹנָה אִמָּא שֶׁלִּי אָפְתָה עוּגָה וְשָׁלְחָה אוֹתִי אֲלֵיהֶם.",
        en: "On the first Shabbat my mom baked a cake and sent me over to them.",
        tags: [
          { w: "אִמָּא", r: "אמם" },
          { w: "וְשָׁלְחָה", r: "שלח" },
        ],
      },
      {
        he: "הָאַבָּא פָּתַח אֶת הַדֶּלֶת, וְהַיְלָדִים רָצוּ לִרְאוֹת מִי בָּא.",
        en: "The dad opened the door, and the kids ran to see who had come.",
        tags: [
          { w: "הָאַבָּא", r: "אב" },
          { w: "פָּתַח", r: "פתח" },
          { w: "וְהַיְלָדִים", r: "ילד" },
          { w: "רָצוּ", r: "רוץ" },
          { w: "לִרְאוֹת", r: "ראה" },
          { w: "בָּא", r: "בוא" },
        ],
      },
      {
        he: "הֵם הִזְמִינוּ אוֹתִי לְהִכָּנֵס, וְהַסַּבְתָּא שֶׁלָּהֶם סִפְּרָה לִי עַל הַחַיִּים בְּמָרוֹקוֹ.",
        en: "They invited me in, and their grandma told me about life in Morocco.",
        tags: [
          { w: "הִזְמִינוּ", r: "זמן" },
          { w: "לְהִכָּנֵס", r: "כנס" },
          { w: "סִפְּרָה", r: "ספר" },
          { w: "הַחַיִּים", r: "חיה" },
        ],
      },
      {
        he: "חָזַרְתִּי הַבַּיְתָה אַחֲרֵי שָׁלוֹשׁ שָׁעוֹת, עִם קֻפְסָה מְלֵאָה עוּגִיּוֹת.",
        en: "I came home three hours later, with a box full of cookies.",
        tags: [
          { w: "חָזַרְתִּי", r: "חזר" },
          { w: "אַחֲרֵי", r: "אחר" },
          { w: "שָׁעוֹת", r: "שעה" },
        ],
      },
    ],
    qs: [
      {
        q: "Where did the new family move?",
        opts: ["Upstairs", "Across the hall", "Next to the school"],
        a: 1,
      },
      {
        q: "What did the narrator's mom bake?",
        opts: ["Cookies", "Bread", "A cake", "Pita"],
        a: 2,
      },
      {
        q: "What did the neighbors' grandma talk about?",
        opts: ["Life in Morocco", "Her dog", "Her recipes"],
        a: 0,
      },
    ],
  },
  {
    id: "st-a06",
    title: "Late for the Movie",
    he: "מְאַחֲרִים לַסֶּרֶט",
    lines: [
      {
        he: "הַסֶּרֶט הָיָה אָמוּר לְהַתְחִיל בְּשָׁעָה שְׁמוֹנֶה, וּמִיכַל עוֹד לֹא גָּמְרָה לְהִתְלַבֵּשׁ.",
        en: "The movie was supposed to start at eight, and Michal still hadn't finished getting dressed.",
        tags: [
          { w: "אָמוּר", r: "אמר" },
          { w: "לְהַתְחִיל", r: "תחל" },
          { w: "בְּשָׁעָה", r: "שעה" },
          { w: "גָּמְרָה", r: "גמר" },
          { w: "לְהִתְלַבֵּשׁ", r: "לבש" },
        ],
      },
      {
        he: 'הֶחָבֵר שֶׁלָּהּ, דָּן, חִכָּה לְיַד הַדֶּלֶת וְאָמַר: "מַהֵר, אֲנַחְנוּ מְאַחֲרִים!"',
        en: 'Her friend Dan waited by the door and said: "Hurry, we\'re late!"',
        tags: [
          { w: "הֶחָבֵר", r: "חבר" },
          { w: "חִכָּה", r: "חכה" },
          { w: "וְאָמַר", r: "אמר" },
          { w: "מַהֵר", r: "מהר" },
          { w: "מְאַחֲרִים", r: "אחר" },
        ],
      },
      {
        he: 'מִיכַל עָנְתָה: "רַק עוֹד רֶגַע, אֲנִי לֹא מוֹצֵאת אֶת הַנַּעֲלַיִם!"',
        en: 'Michal answered: "Just one more moment, I can\'t find my shoes!"',
        tags: [
          { w: "עָנְתָה", r: "ענה" },
          { w: "רֶגַע", r: "רגע" },
        ],
      },
      {
        he: "אַחֲרֵי עֶשְׂרִים דַּקּוֹת הֵם יָצְאוּ מֵהַבַּיִת וְרָצוּ כָּל הַדֶּרֶךְ לַקּוֹלְנוֹעַ.",
        en: "Twenty minutes later they left the house and ran all the way to the cinema.",
        tags: [
          { w: "אַחֲרֵי", r: "אחר" },
          { w: "יָצְאוּ", r: "יצא" },
          { w: "וְרָצוּ", r: "רוץ" },
        ],
      },
      {
        he: "כְּשֶׁהֵם הִגִּיעוּ, הַסֶּרֶט עוֹד לֹא הִתְחִיל – הָיוּ עוֹד עֶשֶׂר דַּקּוֹת שֶׁל פִּרְסוֹמוֹת.",
        en: "When they arrived, the movie hadn't started yet – there were ten more minutes of ads.",
        tags: [{ w: "הִתְחִיל", r: "תחל" }],
      },
      {
        he: 'דָּן צָחַק: "בַּפַּעַם הַבָּאָה אֲנִי מְחַכֶּה לָךְ עִם הַנַּעֲלַיִם בַּיָּד."',
        en: 'Dan laughed: "Next time I\'ll wait for you with your shoes in my hand."',
        tags: [
          { w: "צָחַק", r: "צחק" },
          { w: "הַבָּאָה", r: "בוא" },
          { w: "מְחַכֶּה", r: "חכה" },
        ],
      },
    ],
    qs: [
      { q: "What time was the movie supposed to start?", opts: ["Seven", "Eight", "Nine"], a: 1 },
      {
        q: "Why was Michal running late?",
        opts: ["She couldn't find her shoes", "She was on the phone", "She missed the bus"],
        a: 0,
      },
      {
        q: "What was on the screen when they arrived?",
        opts: ["The end of the movie", "Nothing, the cinema was closed", "Ads"],
        a: 2,
      },
    ],
  },
  {
    id: "st-a07",
    title: "A Present for Dad",
    he: "מַתָּנָה לְאַבָּא",
    lines: [
      {
        he: "לִפְנֵי שָׁבוּעַ הָיָה לְאַבָּא יוֹם הֻלֶּדֶת, וְהָאַחִים רָצוּ לְהַפְתִּיעַ אוֹתוֹ.",
        en: "A week ago it was Dad's birthday, and the siblings wanted to surprise him.",
        tags: [
          { w: "לִפְנֵי", r: "פנה" },
          { w: "שָׁבוּעַ", r: "שבע" },
          { w: "לְאַבָּא", r: "אב" },
          { w: "יוֹם", r: "יום" },
          { w: "הֻלֶּדֶת", r: "ילד" },
          { w: "וְהָאַחִים", r: "אח" },
          { w: "רָצוּ", r: "רצה" },
        ],
      },
      {
        he: 'הָאָחוֹת הַגְּדוֹלָה, שִׁירָה, אָמְרָה: "בּוֹאוּ נִקְנֶה לוֹ שָׁעוֹן חָדָשׁ!"',
        en: 'The big sister, Shira, said: "Let\'s buy him a new watch!"',
        tags: [
          { w: "הָאָחוֹת", r: "אח" },
          { w: "אָמְרָה", r: "אמר" },
          { w: "בּוֹאוּ", r: "בוא" },
          { w: "נִקְנֶה", r: "קנה" },
          { w: "שָׁעוֹן", r: "שעה" },
        ],
      },
      {
        he: "אֲבָל הָאָח הַקָּטָן, אֵלִי, פָּחַד שֶׁלֹּא יִהְיֶה לָהֶם מַסְפִּיק כֶּסֶף.",
        en: "But their little brother, Eli, was afraid they wouldn't have enough money.",
        tags: [
          { w: "הָאָח", r: "אח" },
          { w: "פָּחַד", r: "פחד" },
        ],
      },
      {
        he: "אָז הֵם הֶחְלִיטוּ לְבַשֵּׁל לוֹ אֲרוּחָה וּלְהָכִין כַּרְטִיס עִם צִיּוּרִים.",
        en: "So they decided to cook him a meal and make a card with drawings.",
        tags: [
          { w: "הֶחְלִיטוּ", r: "חלט" },
          { w: "לְבַשֵּׁל", r: "בשל" },
        ],
      },
      {
        he: "כְּשֶׁאַבָּא קָרָא אֶת הַכַּרְטִיס, הוּא הִתְרַגֵּשׁ וּבָכָה קְצָת.",
        en: "When Dad read the card, he was moved and cried a little.",
        tags: [
          { w: "כְּשֶׁאַבָּא", r: "אב" },
          { w: "קָרָא", r: "קרא" },
          { w: "הִתְרַגֵּשׁ", r: "רגש" },
          { w: "וּבָכָה", r: "בכה" },
        ],
      },
      {
        he: 'הוּא אָמַר: "זֹאת הַמַּתָּנָה הֲכִי טוֹבָה שֶׁקִּבַּלְתִּי – וְגַם הֲכִי טְעִימָה!"',
        en: 'He said: "This is the best present I\'ve ever gotten – and the tastiest, too!"',
        tags: [
          { w: "אָמַר", r: "אמר" },
          { w: "הַמַּתָּנָה", r: "נתן" },
          { w: "טוֹבָה", r: "טוב" },
          { w: "שֶׁקִּבַּלְתִּי", r: "קבל" },
        ],
      },
    ],
    qs: [
      { q: "What did Shira want to buy Dad?", opts: ["A new watch", "A book", "A shirt"], a: 0 },
      {
        q: "Why was Eli worried?",
        opts: ["Dad would find out", "They didn't have enough money", "He didn't know how to cook"],
        a: 1,
      },
      {
        q: "What did the siblings give Dad in the end?",
        opts: ["A watch", "Flowers", "A meal and a card"],
        a: 2,
      },
    ],
  },
  {
    id: "st-a08",
    title: "The Job Interview",
    he: "רֵאָיוֹן עֲבוֹדָה",
    lines: [
      {
        he: "הַיּוֹם הָיָה לְאוֹרִי רֵאָיוֹן עֲבוֹדָה בְּחֶבְרָה גְּדוֹלָה בְּתֵל אָבִיב.",
        en: "Today Ori had a job interview at a big company in Tel Aviv.",
        tags: [
          { w: "הַיּוֹם", r: "יום" },
          { w: "רֵאָיוֹן", r: "ראה" },
          { w: "עֲבוֹדָה", r: "עבד" },
          { w: "בְּחֶבְרָה", r: "חבר" },
        ],
      },
      {
        he: "הוּא קָם מֻקְדָּם, לָבַשׁ חֻלְצָה לְבָנָה וְהִתְאַמֵּן מוּל הַמַּרְאָה.",
        en: "He got up early, put on a white shirt and practiced in front of the mirror.",
        tags: [
          { w: "קָם", r: "קום" },
          { w: "מֻקְדָּם", r: "קדם" },
          { w: "לָבַשׁ", r: "לבש" },
          { w: "וְהִתְאַמֵּן", r: "אמן" },
          { w: "הַמַּרְאָה", r: "ראה" },
        ],
      },
      {
        he: "בָּרֵאָיוֹן הוּא הִרְגִּישׁ לַחַץ, אֲבָל נִסָּה לְהֵרָגַע וּלְחַיֵּךְ.",
        en: "In the interview he felt nervous, but he tried to calm down and smile.",
        tags: [
          { w: "בָּרֵאָיוֹן", r: "ראה" },
          { w: "הִרְגִּישׁ", r: "רגש" },
          { w: "נִסָּה", r: "נסה" },
          { w: "לְהֵרָגַע", r: "רגע" },
        ],
      },
      {
        he: 'הַמְּנַהֶלֶת שָׁאֲלָה: "לָמָּה אַתָּה רוֹצֶה לַעֲבֹד אֶצְלֵנוּ?"',
        en: 'The manager asked: "Why do you want to work for us?"',
        tags: [
          { w: "הַמְּנַהֶלֶת", r: "נהל" },
          { w: "שָׁאֲלָה", r: "שאל" },
          { w: "רוֹצֶה", r: "רצה" },
          { w: "לַעֲבֹד", r: "עבד" },
        ],
      },
      {
        he: 'אוֹרִי עָנָה בְּכֵנוּת: "בִּגְלַל הַמַּשְׂכֹּרֶת… וּמְכוֹנַת הַקָּפֶה."',
        en: 'Ori answered honestly: "Because of the salary… and the coffee machine."',
        tags: [
          { w: "עָנָה", r: "ענה" },
          { w: "הַמַּשְׂכֹּרֶת", r: "שכר" },
        ],
      },
      {
        he: 'הַמְּנַהֶלֶת צָחֲקָה, וּבָעֶרֶב אוֹרִי קִבֵּל הוֹדָעָה: "הִתְקַבַּלְתָּ! בְּהַצְלָחָה!"',
        en: 'The manager laughed, and in the evening Ori got a message: "You\'re hired! Good luck!"',
        tags: [
          { w: "הַמְּנַהֶלֶת", r: "נהל" },
          { w: "צָחֲקָה", r: "צחק" },
          { w: "וּבָעֶרֶב", r: "ערב" },
          { w: "קִבֵּל", r: "קבל" },
          { w: "הוֹדָעָה", r: "ידע" },
          { w: "הִתְקַבַּלְתָּ", r: "קבל" },
          { w: "בְּהַצְלָחָה", r: "צלח" },
        ],
      },
    ],
    qs: [
      {
        q: "What did Ori do before the interview?",
        opts: [
          "Drank coffee with a friend",
          "Practiced in front of the mirror",
          "Read the newspaper",
        ],
        a: 1,
      },
      {
        q: "Why did Ori say he wanted the job?",
        opts: ["The salary and the coffee machine", "He loves Tel Aviv", "His friend works there"],
        a: 0,
      },
      {
        q: "What happened in the evening?",
        opts: ["He got a second interview", "He called the manager", "He got the job"],
        a: 2,
      },
    ],
  },
  {
    id: "st-a09",
    title: "A Bargain at the Market",
    he: "מְצִיאָה בַּשּׁוּק",
    lines: [
      {
        he: "בְּיוֹם שִׁשִּׁי מָיָה הָלְכָה לְשׁוּק הַפִּשְׁפְּשִׁים בְּיָפוֹ.",
        en: "On Friday Maya went to the flea market in Jaffa.",
        tags: [
          { w: "בְּיוֹם", r: "יום" },
          { w: "הָלְכָה", r: "הלך" },
        ],
      },
      {
        he: "הִיא חָסְכָה כֶּסֶף כָּל הַחֹדֶשׁ, כִּי הִיא צְרִיכָה כִּסֵּא לַדִּירָה הַחֲדָשָׁה.",
        en: "She had saved money all month, because she needed a chair for her new apartment.",
        tags: [
          { w: "חָסְכָה", r: "חסך" },
          { w: "צְרִיכָה", r: "צרך" },
          { w: "לַדִּירָה", r: "דור" },
        ],
      },
      {
        he: 'מוֹכֵר זָקֵן הֶרְאָה לָהּ כִּסֵּא עָתִיק וְאָמַר: "רַק שְׁלוֹשׁ מֵאוֹת שְׁקָלִים!"',
        en: 'An old seller showed her an antique chair and said: "Only three hundred shekels!"',
        tags: [
          { w: "מוֹכֵר", r: "מכר" },
          { w: "הֶרְאָה", r: "ראה" },
          { w: "וְאָמַר", r: "אמר" },
        ],
      },
      {
        he: 'מָיָה חָשְׁבָה רֶגַע וְעָנְתָה: "מֵאָה וַחֲמִשִּׁים, וַאֲנִי לוֹקַחַת אוֹתוֹ עַכְשָׁו."',
        en: 'Maya thought for a moment and answered: "A hundred and fifty, and I\'ll take it right now."',
        tags: [
          { w: "חָשְׁבָה", r: "חשב" },
          { w: "רֶגַע", r: "רגע" },
          { w: "וְעָנְתָה", r: "ענה" },
          { w: "לוֹקַחַת", r: "לקח" },
        ],
      },
      {
        he: "הֵם הִסְכִּימוּ עַל מָאתַיִם, מָיָה שִׁלְּמָה, וְהַמּוֹכֵר נִרְאָה מְרֻצֶּה מְאוֹד.",
        en: "They agreed on two hundred, Maya paid, and the seller looked very pleased.",
        tags: [
          { w: "הִסְכִּימוּ", r: "סכם" },
          { w: "שִׁלְּמָה", r: "שלם" },
          { w: "וְהַמּוֹכֵר", r: "מכר" },
          { w: "נִרְאָה", r: "ראה" },
          { w: "מְרֻצֶּה", r: "רצה" },
        ],
      },
      {
        he: "כְּשֶׁהִיא הָלְכָה מִשָּׁם, הִיא רָאֲתָה כִּסֵּא בְּדִיּוּק כָּזֶה בַּדּוּכָן הַבָּא – בְּמֵאָה שְׁקָלִים.",
        en: "On her way out, she saw exactly the same chair at the next stall – for a hundred shekels.",
        tags: [
          { w: "הָלְכָה", r: "הלך" },
          { w: "רָאֲתָה", r: "ראה" },
          { w: "הַבָּא", r: "בוא" },
        ],
      },
    ],
    qs: [
      { q: "What did Maya want to buy?", opts: ["Old books", "A chair", "A lamp"], a: 1 },
      {
        q: "How much did Maya pay in the end?",
        opts: ["300 shekels", "150 shekels", "200 shekels", "100 shekels"],
        a: 2,
      },
      {
        q: "What did Maya see at the next stall?",
        opts: ["The same chair for less", "A nicer table", "The seller's brother"],
        a: 0,
      },
    ],
  },
  {
    id: "st-a10",
    title: "Chess with My Brother",
    he: "שַׁחְמָט עִם אָחִי",
    lines: [
      {
        he: "כָּל יוֹם חֲמִישִׁי אֲנִי מְשַׂחֵק שַׁחְמָט עִם אָחִי הַקָּטָן, אִיתַי.",
        en: "Every Thursday I play chess with my little brother, Itai.",
        tags: [
          { w: "יוֹם", r: "יום" },
          { w: "אָחִי", r: "אח" },
        ],
      },
      {
        he: "תָּמִיד אֲנִי מְנַצֵּחַ, וְאִיתַי כּוֹעֵס וְהוֹלֵךְ לַחֶדֶר שֶׁלּוֹ.",
        en: "I always win, and Itai gets angry and goes to his room.",
        tags: [
          { w: "תָּמִיד", r: "תמד" },
          { w: "מְנַצֵּחַ", r: "נצח" },
          { w: "כּוֹעֵס", r: "כעס" },
          { w: "וְהוֹלֵךְ", r: "הלך" },
        ],
      },
      {
        he: "אֲבָל בַּשָּׁבוּעַ שֶׁעָבַר הוּא לָמַד מַהֲלָךְ חָדָשׁ בָּאִינְטֶרְנֶט.",
        en: "But last week he learned a new move on the internet.",
        tags: [
          { w: "בַּשָּׁבוּעַ", r: "שבע" },
          { w: "שֶׁעָבַר", r: "עבר" },
          { w: "לָמַד", r: "למד" },
          { w: "מַהֲלָךְ", r: "הלך" },
        ],
      },
      {
        he: "אַחֲרֵי עֶשֶׂר דַּקּוֹת הִפְסַדְתִּי, וְלֹא הֵבַנְתִּי מָה קָרָה.",
        en: "After ten minutes I lost, and I didn't understand what had happened.",
        tags: [
          { w: "אַחֲרֵי", r: "אחר" },
          { w: "הִפְסַדְתִּי", r: "פסד" },
          { w: "הֵבַנְתִּי", r: "בין" },
        ],
      },
      {
        he: 'אִיתַי קָפַץ מִשִּׂמְחָה וְצָעַק: "נִצַּחְתִּי אוֹתְךָ!"',
        en: 'Itai jumped for joy and shouted: "I beat you!"',
        tags: [
          { w: "מִשִּׂמְחָה", r: "שמח" },
          { w: "נִצַּחְתִּי", r: "נצח" },
        ],
      },
      {
        he: "הָיִיתִי קְצָת מְאֻכְזָב, אֲבָל גַּם גֵּאֶה, וּבִקַּשְׁתִּי מִמֶּנּוּ לְלַמֵּד אוֹתִי אֶת הַמַּהֲלָךְ.",
        en: "I was a little disappointed, but also proud, and I asked him to teach me the move.",
        tags: [
          { w: "מְאֻכְזָב", r: "אכזב" },
          { w: "גֵּאֶה", r: "גאה" },
          { w: "וּבִקַּשְׁתִּי", r: "בקש" },
          { w: "לְלַמֵּד", r: "למד" },
          { w: "הַמַּהֲלָךְ", r: "הלך" },
        ],
      },
    ],
    qs: [
      {
        q: "What usually happens when they play?",
        opts: ["Itai wins", "The narrator wins and Itai gets angry", "They stop in the middle"],
        a: 1,
      },
      {
        q: "Where did Itai learn the new move?",
        opts: ["From his dad", "At school", "On the internet"],
        a: 2,
      },
      {
        q: "How did the narrator feel at the end?",
        opts: ["Disappointed but proud", "Angry and jealous", "Bored"],
        a: 0,
      },
    ],
  },
];
