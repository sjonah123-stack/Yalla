import type { Sentence } from "../../types";

/** Example sentences — size, nature, law, Jewish life, culture, body, clothing, weather. */
export const S_B: Readonly<Record<string, Sentence>> = {
  // — size & change —
  גָּדַל: {
    he: "הָאָח שֶׁלִּי גָּדַל וְעָבַר לְדִירָה מִשֶּׁלּוֹ.",
    en: "My brother grew up and moved to his own apartment.",
  },
  גִּדֵּל: {
    he: "הוּא גִּדֵּל שְׁלוֹשָׁה יְלָדִים לְבַד.",
    en: "He raised three children on his own.",
  },
  קָטַן: {
    he: "הַסְּוֶדֶר קָטַן אַחֲרֵי הַכְּבִיסָה.",
    en: "The sweater got smaller after the wash.",
  },
  הִקְטִין: { he: "הָרוֹפֵא הִקְטִין לִי אֶת הַמָּנָה.", en: "The doctor reduced my dose." },
  חִדֵּשׁ: {
    he: "אַבָּא חִדֵּשׁ אֶת הַדַּרְכּוֹן שֶׁלּוֹ בַּדֹּאַר.",
    en: "Dad renewed his passport at the post office.",
  },
  הִתְחַדֵּשׁ: {
    he: "הָאֲתָר הִתְחַדֵּשׁ וְנִרְאֶה מְצֻיָּן.",
    en: "The website was revamped and looks great.",
  },
  שִׁנָּה: {
    he: "הַמְּנַהֵל שִׁנָּה אֶת הַתָּכְנִית בָּרֶגַע הָאַחֲרוֹן.",
    en: "The manager changed the plan at the last minute.",
  },
  הִשְׁתַּנָּה: {
    he: "מֶזֶג הָאֲוִיר הִשְׁתַּנָּה פִּתְאוֹם אַחַר הַצָּהֳרַיִם.",
    en: "The weather suddenly changed in the afternoon.",
  },
  שָׁבַר: {
    he: "הוּא שָׁבַר אֶת הַיָּד בְּמִשְׂחָק כַּדּוּרֶגֶל.",
    en: "He broke his arm in a soccer game.",
  },
  נִשְׁבַּר: {
    he: "הַכִּסֵּא נִשְׁבַּר כְּשֶׁיָּשַׁבְתִּי עָלָיו.",
    en: "The chair broke when I sat on it.",
  },
  תִּקֵּן: {
    he: "הַשָּׁכֵן תִּקֵּן לִי אֶת הַבֶּרֶז בַּמִּטְבָּח.",
    en: "The neighbor fixed the tap in my kitchen.",
  },
  הִתְקִין: {
    he: "הַטֶּכְנַאי הִתְקִין מַזְגָן חָדָשׁ בַּסָּלוֹן.",
    en: "The technician installed a new air conditioner in the living room.",
  },
  מִלֵּא: {
    he: "הוּא מִלֵּא אֶת הַטֹּפֶס וְשָׁלַח אוֹתוֹ.",
    en: "He filled out the form and sent it.",
  },
  הִתְמַלֵּא: {
    he: "הָאוּלָם הִתְמַלֵּא אֲנָשִׁים תּוֹךְ דַּקּוֹת.",
    en: "The hall filled with people within minutes.",
  },
  רוֹקֵן: {
    he: "הוּא רוֹקֵן אֶת הַמְּגֵרָה לִפְנֵי הַמַּעֲבָר.",
    en: "He emptied the drawer before the move.",
  },
  הִתְרוֹקֵן: {
    he: "הָרְחוֹב הִתְרוֹקֵן מִיָּד אַחֲרֵי הַגֶּשֶׁם.",
    en: "The street emptied out right after the rain.",
  },
  חִזֵּק: { he: "הָאִמּוּן חִזֵּק לִי אֶת הַגַּב.", en: "The workout strengthened my back." },
  הֶחֱזִיק: {
    he: "הוּא הֶחֱזִיק אֶת הַתִּינוֹק כָּל הַדֶּרֶךְ.",
    en: "He held the baby the whole way.",
  },
  נֶחֱלַשׁ: {
    he: "סַבָּא נֶחֱלַשׁ מְאוֹד אַחֲרֵי הַנִּתּוּחַ.",
    en: "Grandpa got much weaker after the surgery.",
  },
  הֶחֱלִישׁ: {
    he: "הַגֶּשֶׁם הֶחֱלִישׁ אֶת הַקְּלִיטָה בַּטֶּלֶפוֹן.",
    en: "The rain weakened the phone reception.",
  },
  הִקְשָׁה: {
    he: "הָרַעַשׁ הִקְשָׁה עָלַי לְהִתְרַכֵּז בַּשִּׁעוּר.",
    en: "The noise made it hard for me to concentrate in class.",
  },
  הִתְקַשָּׁה: {
    he: "הוּא הִתְקַשָּׁה לִמְצוֹא חֲנָיָה לְיַד הַבַּיִת.",
    en: "He had trouble finding parking near the house.",
  },
  הֵקֵל: { he: "הַכַּדּוּר הֵקֵל עַל הַכְּאֵבִים שֶׁלִּי.", en: "The pill eased my pain." },
  קִלֵּל: {
    he: "הַנֶּהָג קִלֵּל כְּשֶׁחָסְמוּ לוֹ אֶת הַדֶּרֶךְ.",
    en: "The driver cursed when they blocked his way.",
  },
  כִּבֵּד: {
    he: "הוּא תָּמִיד כִּבֵּד אֶת הַהוֹרִים שֶׁלּוֹ.",
    en: "He always honored his parents.",
  },
  הִכְבִּיד: {
    he: "הַחֹם הִכְבִּיד עָלֵינוּ בַּטִּיּוּל.",
    en: "The heat weighed on us during the hike.",
  },
  הֶאֱרִיךְ: {
    he: "הַמּוֹרֶה הֶאֱרִיךְ לָנוּ אֶת זְמַן הַמִּבְחָן.",
    en: "The teacher extended our exam time.",
  },
  הִתְאָרֵךְ: {
    he: "הַתּוֹר בַּקֻּפָּה הִתְאָרֵךְ עוֹד וָעוֹד.",
    en: "The line at the register got longer and longer.",
  },
  קִצֵּר: {
    he: "הַחַיָּט קִצֵּר לִי אֶת הַמִּכְנָסַיִם.",
    en: "The tailor shortened my trousers.",
  },
  קָצַר: {
    he: "הָאִכָּר קָצַר אֶת הַחִטָּה בַּשָּׂדֶה.",
    en: "The farmer harvested the wheat in the field.",
  },
  הִרְחִיב: {
    he: "הוּא הִרְחִיב אֶת הַמִּרְפֶּסֶת בַּקַּיִץ.",
    en: "He widened the balcony in the summer.",
  },
  הִתְרַחֵב: {
    he: "הַכְּבִישׁ הִתְרַחֵב אַחֲרֵי הַצֹּמֶת.",
    en: "The road widened after the intersection.",
  },
  צַר: {
    he: "הַשְּׁבִיל הַזֶּה צַר מִדַּי לִמְכוֹנִית.",
    en: "This path is too narrow for a car.",
  },
  צָרָה: { he: "יֵשׁ לוֹ צָרָה גְּדוֹלָה בָּעֲבוֹדָה.", en: "He has big trouble at work." },
  הֵרִים: { he: "הוּא הֵרִים אֶת הַמִּזְוָדָה בְּקַלּוּת.", en: "He lifted the suitcase easily." },
  הִתְרוֹמֵם: {
    he: "הַמָּטוֹס הִתְרוֹמֵם מֵעַל הָעֲנָנִים.",
    en: "The plane rose above the clouds.",
  },
  נָמוּךְ: {
    he: "הַשֻּׁלְחָן הַזֶּה נָמוּךְ מִדַּי בִּשְׁבִילִי.",
    en: "This table is too low for me.",
  },
  הִנְמִיךְ: {
    he: "הַשָּׁכֵן הִנְמִיךְ אֶת הַמּוּזִיקָה אַחֲרֵי חֲצוֹת.",
    en: "The neighbor turned the music down after midnight.",
  },
  קִלְקֵל: { he: "הַגֶּשֶׁם קִלְקֵל לָנוּ אֶת הַפִּיקְנִיק.", en: "The rain ruined our picnic." },
  הִתְקַלְקֵל: {
    he: "הַמְּקָרֵר הִתְקַלְקֵל בְּאֶמְצַע הַחֹם.",
    en: "The fridge broke down in the middle of the heat wave.",
  },
  הָרַס: {
    he: "הַטְּרַקְטוֹר הָרַס אֶת הַגָּדֵר הַיְשָׁנָה.",
    en: "The tractor tore down the old fence.",
  },
  נֶהֱרַס: {
    he: "הַבִּנְיָן נֶהֱרַס בִּרְעִידַת הָאֲדָמָה.",
    en: "The building was destroyed in the earthquake.",
  },

  // — nature —
  מַיִם: {
    he: "אֲנִי שׁוֹתֶה הַרְבֵּה מַיִם בַּקַּיִץ.",
    en: "I drink a lot of water in the summer.",
  },
  מֵימִי: {
    he: "הַמָּרָק הַזֶּה יָצָא מֵימִי וְתָפֵל.",
    en: "This soup came out watery and bland.",
  },
  הֵאִיר: { he: "הַפָּנָס הֵאִיר אֶת כָּל הֶחָצֵר.", en: "The lamp lit up the whole yard." },
  אוֹר: {
    he: "נִכְנַס אוֹר נָעִים דֶּרֶךְ הַחַלּוֹן.",
    en: "Pleasant light came in through the window.",
  },
  הֶחְשִׁיךְ: {
    he: "בַּחוּץ הֶחְשִׁיךְ וְעוֹד לֹא חָזַרְנוּ הַבַּיְתָה.",
    en: "It got dark outside and we still had not come home.",
  },
  חֹשֶׁךְ: {
    he: "פִּתְאוֹם הָיָה חֹשֶׁךְ מֻחְלָט בַּחֶדֶר.",
    en: "Suddenly there was total darkness in the room.",
  },
  חִמֵּם: {
    he: "אַבָּא חִמֵּם לִי אֶת הָאֹכֶל בַּמִּיקְרוֹגַל.",
    en: "Dad heated my food in the microwave.",
  },
  הִתְחַמֵּם: {
    he: "הַתַּנּוּר הִתְחַמֵּם וְאֶפְשָׁר לְהַכְנִיס אֶת הָעוּגָה.",
    en: "The oven warmed up and we can put the cake in.",
  },
  קֵרֵר: { he: "הַמְּאַוְרֵר קֵרֵר קְצָת אֶת הַחֶדֶר.", en: "The fan cooled the room a little." },
  הִתְקָרֵר: {
    he: "הָאֹכֶל הִתְקָרֵר עַד שֶׁהִגַּעְתָּ.",
    en: "The food got cold by the time you arrived.",
  },
  גֶּשֶׁם: { he: "יָרַד גֶּשֶׁם חָזָק כָּל הַלַּיְלָה.", en: "Heavy rain fell all night." },
  הִתְגַּשֵּׁם: {
    he: "הַחֲלוֹם שֶׁלִּי הִתְגַּשֵּׁם סוֹף סוֹף.",
    en: "My dream finally came true.",
  },
  יָם: {
    he: "אֶתְמוֹל הָיָה יָם רָגוּעַ וְנָעִים.",
    en: "Yesterday the sea was calm and pleasant.",
  },
  יַמַּאי: {
    he: "סַבָּא שֶׁלִּי הָיָה יַמַּאי בִּצְעִירוּתוֹ.",
    en: "My grandfather was a sailor in his youth.",
  },
  צָמַח: { he: "עֵץ קָטָן צָמַח בְּתוֹךְ הֶחָצֵר.", en: "A small tree grew in the yard." },
  הִצְמִיחַ: {
    he: "הַגֶּשֶׁם הִצְמִיחַ עֵשֶׂב יָרוֹק בַּשָּׂדֶה.",
    en: "The rain brought up green grass in the field.",
  },
  פָּרַח: {
    he: "הַשָּׁקֵד פָּרַח מֻקְדָּם הַשָּׁנָה.",
    en: "The almond tree bloomed early this year.",
  },
  הִפְרִיחַ: {
    he: "הוּא הִפְרִיחַ אֶת הַגִּנָּה הַמּוּזְנַחַת.",
    en: "He made the neglected garden bloom.",
  },
  זָרַע: {
    he: "הָאִכָּר זָרַע חִטָּה לִפְנֵי הַחֹרֶף.",
    en: "The farmer sowed wheat before the winter.",
  },
  זֶרַע: {
    he: "הִטְמַנְתִּי זֶרַע אֶחָד בְּעָצִיץ קָטָן.",
    en: "I buried one seed in a small pot.",
  },
  פְּרִי: { he: "אָכַלְתִּי פְּרִי טָרִי מִן הָעֵץ.", en: "I ate fresh fruit off the tree." },
  פּוֹרֶה: {
    he: "הָעֵמֶק הַזֶּה פּוֹרֶה וְיָרוֹק מְאוֹד.",
    en: "This valley is fertile and very green.",
  },
  אֲדָמָה: {
    he: "אֲדָמָה טוֹבָה חֲשׁוּבָה לְכָל גִּנָּה.",
    en: "Good soil matters for every garden.",
  },
  אָדֹם: { he: "קָנִיתִי מְעִיל אָדֹם לַחֹרֶף.", en: "I bought a red coat for the winter." },
  אֶרֶץ: {
    he: "זוֹ אֶרֶץ יָפָה עִם נוֹף מַרְהִיב.",
    en: "This is a beautiful country with a stunning view.",
  },
  אַרְצִי: {
    he: "זֶה אֵרוּעַ אַרְצִי, לֹא רַק מְקוֹמִי.",
    en: "It is a nationwide event, not just a local one.",
  },
  שֹׁרֶשׁ: { he: "לְכָל מִלָּה בְּעִבְרִית יֵשׁ שֹׁרֶשׁ.", en: "Every word in Hebrew has a root." },
  שָׁרָשִׁים: {
    he: "לָעֵץ הַזֶּה יֵשׁ שָׁרָשִׁים עֲמֻקִּים מְאוֹד.",
    en: "This tree has very deep roots.",
  },
  נָהָר: {
    he: "יֵשׁ נָהָר גָּדוֹל לְיַד הַכְּפָר.",
    en: "There is a big river next to the village.",
  },
  נָהַר: {
    he: "הַקָּהָל נָהַר אֶל הַכִּכָּר אַחֲרֵי הַהוֹפָעָה.",
    en: "The crowd streamed to the square after the show.",
  },
  אֶבֶן: { he: "מָצָאתִי אֶבֶן יָפָה עַל הַחוֹף.", en: "I found a pretty stone on the beach." },
  אֲבָנִים: {
    he: "הַיְלָדִים זָרְקוּ אֲבָנִים קְטַנּוֹת לַמַּיִם.",
    en: "The kids threw small stones into the water.",
  },
  חוֹל: { he: "נִכְנַס לִי חוֹל לְתוֹךְ הַנַּעֲלַיִם.", en: "Sand got into my shoes." },
  חוֹלוֹת: {
    he: "טִיַּלְנוּ בֵּין חוֹלוֹת הַזָּהָב בַּמִּדְבָּר.",
    en: "We hiked among the golden dunes in the desert.",
  },
  יָרֵחַ: {
    he: "הַלַּיְלָה יֵשׁ יָרֵחַ מָלֵא וּבָהִיר.",
    en: "Tonight there is a full, bright moon.",
  },
  יְרֵחִי: {
    he: "הַלּוּחַ הָעִבְרִי הוּא לוּחַ יְרֵחִי.",
    en: "The Hebrew calendar is a lunar calendar.",
  },
  כּוֹכָב: {
    he: "רָאִינוּ כּוֹכָב בּוֹדֵד מֵעַל הָהָר.",
    en: "We saw a lone star above the mountain.",
  },
  כּוֹכָבִים: {
    he: "בַּמִּדְבָּר רוֹאִים הַרְבֵּה כּוֹכָבִים בַּלַּיְלָה.",
    en: "In the desert you see many stars at night.",
  },
  בָּעַר: {
    he: "הַיַּעַר בָּעַר שְׁלוֹשָׁה יָמִים בְּלִי הַפְסָקָה.",
    en: "The forest burned for three days without a break.",
  },
  הִבְעִיר: {
    he: "מִישֶׁהוּ הִבְעִיר אֶת הַשָּׂדֶה בְּכַוָּנָה.",
    en: "Someone set the field on fire on purpose.",
  },

  // — law & state —
  שָׁפַט: { he: "הוּא שָׁפַט אוֹתִי מַהֵר מִדַּי.", en: "He judged me too quickly." },
  שׁוֹפֵט: {
    he: "בַּמִּגְרָשׁ הָיָה שׁוֹפֵט אֶחָד בִּלְבַד.",
    en: "There was only one referee on the field.",
  },
  מָלַךְ: {
    he: "דָּוִד מָלַךְ בִּירוּשָׁלַיִם אַרְבָּעִים שָׁנָה.",
    en: "David reigned in Jerusalem for forty years.",
  },
  הִמְלִיךְ: {
    he: "הָעָם הִמְלִיךְ אוֹתוֹ בְּטֶקֶס גָּדוֹל.",
    en: "The people crowned him in a great ceremony.",
  },
  שָׁלַט: {
    he: "הוּא שָׁלַט בְּאַרְבַּע שָׂפוֹת בְּלִי בְּעָיָה.",
    en: "He had command of four languages with no trouble.",
  },
  הִשְׁתַּלֵּט: {
    he: "הֶחָתוּל הִשְׁתַּלֵּט עַל כָּל הַסַּפָּה.",
    en: "The cat took over the whole couch.",
  },
  בָּחַר: { he: "הוּא בָּחַר בַּמַּסְלוּל הַקָּצָר יוֹתֵר.", en: "He chose the shorter route." },
  נִבְחַר: {
    he: "רֹאשׁ הָעִיר נִבְחַר שׁוּב הַשָּׁנָה.",
    en: "The mayor was elected again this year.",
  },
  חוֹקֵק: {
    he: "הַפַּרְלָמֶנְט חוֹקֵק כְּלָלִים חֲדָשִׁים לְכֻלָּם.",
    en: "Parliament legislates new rules for everyone.",
  },
  חֹק: {
    he: "יֵשׁ חֹק שֶׁאוֹסֵר לְעַשֵּׁן בַּמָּקוֹם הַזֶּה.",
    en: "There is a law that forbids smoking in this place.",
  },
  פָּקַד: {
    he: "הַקָּצִין פָּקַד עַל הַחַיָּלִים לַחֲזוֹר לַבָּסִיס.",
    en: "The officer ordered the soldiers back to base.",
  },
  הִפְקִיד: {
    he: "הוּא הִפְקִיד אֶת הַכֶּסֶף בַּבַּנְק.",
    en: "He deposited the money at the bank.",
  },
  צָבָא: {
    he: "יֵשׁ לַמְּדִינָה צָבָא גָּדוֹל וְחָזָק.",
    en: "The country has a big, strong army.",
  },
  צְבָאִי: {
    he: "זֶה בָּסִיס צְבָאִי סָגוּר לְאֶזְרָחִים.",
    en: "This is a military base closed to civilians.",
  },
  נִלְחַם: {
    he: "הוּא נִלְחַם עַל הַזְּכֻיּוֹת שֶׁל הָעוֹבְדִים.",
    en: "He fought for the workers' rights.",
  },
  מִלְחָמָה: { he: "אַף אֶחָד לֹא רוֹצֶה מִלְחָמָה נוֹסֶפֶת.", en: "Nobody wants another war." },
  גָּנַב: {
    he: "מִישֶׁהוּ גָּנַב לִי אֶת הָאוֹפַנַּיִם מֵהֶחָצֵר.",
    en: "Someone stole my bicycle from the yard.",
  },
  הִתְגַּנֵּב: {
    he: "הוּא הִתְגַּנֵּב לַהוֹפָעָה בְּלִי כַּרְטִיס.",
    en: "He snuck into the show without a ticket.",
  },
  הָרַג: {
    he: "הַכְּפוֹר הָרַג אֶת כָּל הַפְּרָחִים בַּגִּנָּה.",
    en: "The frost killed all the flowers in the garden.",
  },
  נֶהֱרַג: {
    he: "נֶהָג נֶהֱרַג בִּתְאוּנָה קָשָׁה בַּכְּבִישׁ.",
    en: "A driver was killed in a bad road accident.",
  },
  רָצַח: {
    he: "הוּא רָצַח אָדָם וְנִשְׁלַח לְמַאֲסָר עוֹלָם.",
    en: "He murdered a man and was sent to life in prison.",
  },
  רֶצַח: {
    he: "הַמִּשְׁטָרָה חוֹקֶרֶת מִקְרֶה רֶצַח בַּשְּׁכוּנָה.",
    en: "The police are investigating a murder in the neighborhood.",
  },
  הֶאֱשִׁים: {
    he: "הוּא הֶאֱשִׁים אוֹתִי בְּלִי שׁוּם הוֹכָחָה.",
    en: "He accused me without any proof.",
  },
  אָשֵׁם: { he: "הוּא הִרְגִּישׁ אָשֵׁם כָּל הַשָּׁבוּעַ.", en: "He felt guilty all week." },
  אָסַר: {
    he: "הַמְּנַהֵל אָסַר לְהִשְׁתַּמֵּשׁ בַּטֶּלֶפוֹן בַּשִּׁעוּר.",
    en: "The principal forbade using the phone in class.",
  },
  נֶאֱסַר: {
    he: "הָעִשּׁוּן נֶאֱסַר בְּכָל הַמִּסְעָדוֹת בָּאָרֶץ.",
    en: "Smoking was banned in every restaurant in the country.",
  },
  עָצַר: {
    he: "הַשּׁוֹטֵר עָצַר אֶת הַמְּכוֹנִית בַּצֹּמֶת.",
    en: "The policeman stopped the car at the intersection.",
  },
  נֶעֱצַר: {
    he: "הֶחָשׁוּד נֶעֱצַר בִּנְמַל הַתְּעוּפָה.",
    en: "The suspect was detained at the airport.",
  },
  עָנַשׁ: {
    he: "הַמּוֹרֶה עָנַשׁ אוֹתָנוּ עַל הָרַעַשׁ.",
    en: "The teacher punished us for the noise.",
  },
  נֶעֱנַשׁ: {
    he: "הוּא נֶעֱנַשׁ עַל אִחוּר שֶׁל שָׁעָה.",
    en: "He was punished for being an hour late.",
  },
  חָשַׁד: {
    he: "הַשּׁוֹטֵר חָשַׁד בּוֹ מִן הָרֶגַע הָרִאשׁוֹן.",
    en: "The policeman suspected him from the first moment.",
  },
  נֶחְשַׁד: {
    he: "הוּא נֶחְשַׁד בְּמַשֶּׁהוּ שֶׁלֹּא עָשָׂה.",
    en: "He came under suspicion for something he did not do.",
  },
  תָּבַע: {
    he: "הַלָּקוֹחַ תָּבַע אֶת הַחֶבְרָה עַל הַנֶּזֶק.",
    en: "The customer sued the company over the damage.",
  },
  תְּבִיעָה: {
    he: "הִיא הִגִּישָׁה תְּבִיעָה נֶגֶד הַמַּעֲסִיק שֶׁלָּהּ.",
    en: "She filed a lawsuit against her employer.",
  },
  מָשַׁל: {
    he: "הוּא מָשַׁל בַּמְּדִינָה עֶשְׂרִים שָׁנָה.",
    en: "He ruled the country for twenty years.",
  },
  מֶמְשָׁלָה: {
    he: "יֵשׁ מֶמְשָׁלָה חֲדָשָׁה מֵאָז הַבְּחִירוֹת.",
    en: "There is a new government since the elections.",
  },
  אֶזְרָח: { he: "כָּל אֶזְרָח חַיָּב לְשַׁלֵּם מִסִּים.", en: "Every citizen has to pay taxes." },
  אֶזְרָחוּת: {
    he: "הוּא קִבֵּל אֶזְרָחוּת אַחֲרֵי חָמֵשׁ שָׁנִים.",
    en: "He received citizenship after five years.",
  },
  שִׁחְרֵר: {
    he: "הַשּׁוֹמֵר שִׁחְרֵר אֶת הַכֶּלֶב מֵהַשַּׁרְשֶׁרֶת.",
    en: "The guard freed the dog from the chain.",
  },
  הִשְׁתַּחְרֵר: {
    he: "אָחִי הִשְׁתַּחְרֵר מֵהַצָּבָא לִפְנֵי חֹדֶשׁ.",
    en: "My brother was discharged from the army a month ago.",
  },

  // — Jewish life —
  קִדֵּשׁ: {
    he: "סַבָּא קִדֵּשׁ עַל הַיַּיִן לִפְנֵי הָאֹכֶל.",
    en: "Grandpa said kiddush over the wine before the meal.",
  },
  הִתְקַדֵּשׁ: {
    he: "הַיּוֹם הַזֶּה הִתְקַדֵּשׁ בְּמֶשֶׁךְ הַדּוֹרוֹת.",
    en: "This day became sacred over the generations.",
  },
  בֵּרֵךְ: {
    he: "הָרַב בֵּרֵךְ אֶת הַזּוּג הַצָּעִיר.",
    en: "The rabbi blessed the young couple.",
  },
  הִתְבָּרֵךְ: {
    he: "הוּא הִתְבָּרֵךְ בְּמִשְׁפָּחָה גְּדוֹלָה וּשְׂמֵחָה.",
    en: "He was blessed with a big, happy family.",
  },
  הִתְפַּלֵּל: {
    he: "הוּא הִתְפַּלֵּל בְּבֵית הַכְּנֶסֶת כָּל בֹּקֶר.",
    en: "He prayed at the synagogue every morning.",
  },
  תְּפִלָּה: {
    he: "הַיְלָדִים לָמְדוּ תְּפִלָּה קְצָרָה בְּעַל פֶּה.",
    en: "The children learned a short prayer by heart.",
  },
  שָׁבַת: {
    he: "הַמִּפְעָל שָׁבַת שְׁלוֹשָׁה יָמִים בִּגְלַל הַסִּכְסוּךְ.",
    en: "The plant shut down for three days because of the dispute.",
  },
  הִשְׁבִּית: {
    he: "הַסַּעַר הִשְׁבִּית אֶת כָּל הַנָּמֵל.",
    en: "The storm shut down the whole port.",
  },
  צִוָּה: {
    he: "הַמְּפַקֵּד צִוָּה עָלֵינוּ לַחֲזוֹר מִיָּד.",
    en: "The commander ordered us to come back at once.",
  },
  מִצְוָה: {
    he: "עֶזְרָה לְשָׁכֵן הִיא מִצְוָה גְּדוֹלָה.",
    en: "Helping a neighbor is a great mitzvah.",
  },
  "עוֹלֶה חָדָשׁ": {
    he: "הוּא עוֹלֶה חָדָשׁ וְלוֹמֵד עִבְרִית בָּאוּלְפָּן.",
    en: "He is a new immigrant and studies Hebrew at the ulpan.",
  },
  "עָלָה לָאָרֶץ": {
    he: "הוּא עָלָה לָאָרֶץ מִצָּרְפַת בִּשְׁנוֹת הַתִּשְׁעִים.",
    en: "He made Aliyah from France in the nineties.",
  },
  קָלַט: {
    he: "הַטֶּלֶפוֹן לֹא קָלַט אֶת הָרֶשֶׁת בָּהָר.",
    en: "The phone did not pick up the network on the mountain.",
  },
  נִקְלַט: {
    he: "הוּא נִקְלַט יָפֶה בַּכִּתָּה הַחֲדָשָׁה.",
    en: "He settled in nicely in the new class.",
  },
  יָרַשׁ: {
    he: "הוּא יָרַשׁ אֶת הַבַּיִת מִסַּבְתָּא שֶׁלּוֹ.",
    en: "He inherited the house from his grandmother.",
  },
  הוֹרִישׁ: {
    he: "הַזָּקֵן הוֹרִישׁ אֶת הַכֶּסֶף לַנְּכָדִים.",
    en: "The old man left the money to his grandchildren.",
  },
  גָּאַל: {
    he: "לְפִי הַסִּפּוּר, אֱלֹהִים גָּאַל אֶת הָעָם מֵעַבְדוּת.",
    en: "According to the story, God redeemed the people from slavery.",
  },
  נִגְאַל: {
    he: "הָעָם נִגְאַל אַחֲרֵי שָׁנִים שֶׁל סֵבֶל.",
    en: "The people were redeemed after years of suffering.",
  },
  דָּת: {
    he: "כָּל דָּת מְלַמֶּדֶת לַעֲזוֹר לַזּוּלַת.",
    en: "Every religion teaches helping others.",
  },
  דָּתִי: {
    he: "הַשָּׁכֵן שֶׁלִּי דָּתִי וְשׁוֹמֵר שַׁבָּת.",
    en: "My neighbor is religious and keeps Shabbat.",
  },
  צָם: { he: "הוּא צָם עֶשְׂרִים וְאַרְבַּע שָׁעוֹת.", en: "He fasted for twenty-four hours." },
  צוֹם: {
    he: "הַיּוֹם יֵשׁ צוֹם וְאָסוּר לֶאֱכוֹל.",
    en: "Today is a fast and eating is forbidden.",
  },
  זָבַח: {
    he: "הַכֹּהֵן זָבַח כֶּבֶשׂ בְּבֵית הַמִּקְדָּשׁ.",
    en: "The priest sacrificed a lamb in the Temple.",
  },
  זֶבַח: {
    he: "בַּיָּמִים הָהֵם הִקְרִיבוּ זֶבַח בַּמִּקְדָּשׁ.",
    en: "In those days they offered a sacrifice at the Temple.",
  },
  חָטָא: {
    he: "הוּא חָטָא וּבִקֵּשׁ סְלִיחָה מִיָּד.",
    en: "He sinned and asked forgiveness right away.",
  },
  חֵטְא: {
    he: "לְפִי הַמָּסֹרֶת, כָּל חֵטְא דּוֹרֵשׁ תִּקּוּן.",
    en: "By tradition, every sin calls for repair.",
  },
  סָלַח: { he: "הוּא סָלַח לִי עַל הָאִחוּר.", en: "He forgave me for being late." },
  נִסְלַח: {
    he: "הַכֹּל נִסְלַח בְּסוֹף הַיּוֹם.",
    en: "Everything is forgiven at the end of the day.",
  },
  כִּפֵּר: {
    he: "הוּא כִּפֵּר עַל הַטָּעוּת בְּמַעֲשִׂים טוֹבִים.",
    en: "He atoned for the mistake with good deeds.",
  },
  כַּפָּרָה: {
    he: "הוּא בִּקֵּשׁ כַּפָּרָה עַל מַה שֶּׁעָשָׂה.",
    en: "He sought atonement for what he had done.",
  },
  טִהֵר: {
    he: "הַכֹּהֵן טִהֵר אֶת הַכֵּלִים לִפְנֵי הֶחָג.",
    en: "The priest purified the vessels before the holiday.",
  },
  הִטַּהֵר: {
    he: "הוּא הִטַּהֵר בַּמִּקְוֶה לִפְנֵי הַתְּפִלָּה.",
    en: "He purified himself in the mikveh before the prayer.",
  },
  נִבֵּא: {
    he: "יִרְמְיָהוּ נִבֵּא עַל חֻרְבַּן הָעִיר.",
    en: "Jeremiah prophesied the destruction of the city.",
  },
  הִתְנַבֵּא: { he: "הוּא הִתְנַבֵּא עַל יָמִים קָשִׁים.", en: "He prophesied hard days ahead." },
  חֶסֶד: { he: "הִיא עָשְׂתָה אִתִּי חֶסֶד גָּדוֹל.", en: "She did me a great kindness." },
  חֲסָדִים: {
    he: "הוּא עוֹשֶׂה חֲסָדִים עִם כָּל שָׁכֵן.",
    en: "He does kind deeds for every neighbor.",
  },

  // — culture & art —
  שָׁר: { he: "הוּא שָׁר בַּמִּקְלַחַת כָּל בֹּקֶר.", en: "He sings in the shower every morning." },
  שִׁיר: {
    he: "כָּתַבְתִּי שִׁיר קָצָר לְיוֹם הַהֻלֶּדֶת.",
    en: "I wrote a short poem for the birthday.",
  },
  רָקַד: {
    he: "הוּא רָקַד כָּל הַלַּיְלָה בַּחֲתֻנָּה.",
    en: "He danced all night at the wedding.",
  },
  רִקּוּד: { he: "לָמַדְנוּ רִקּוּד חָדָשׁ בַּחוּג.", en: "We learned a new dance at the class." },
  שִׂחֵק: {
    he: "הוּא שִׂחֵק אֶת הַתַּפְקִיד הָרָאשִׁי בַּהַצָּגָה.",
    en: "He played the lead role in the play.",
  },
  מִשְׂחָק: {
    he: "זֶה הָיָה מִשְׂחָק מְרַתֵּק עַד הַסּוֹף.",
    en: "It was a gripping game right to the end.",
  },
  צִלֵּם: {
    he: "הוּא צִלֵּם אֶת הַיְלָדִים לְיַד הָעֵץ.",
    en: "He photographed the children next to the tree.",
  },
  הִצְטַלֵּם: {
    he: "הוּא הִצְטַלֵּם עִם כָּל הַמִּשְׁפָּחָה.",
    en: "He had his picture taken with the whole family.",
  },
  צִיֵּר: {
    he: "הַיֶּלֶד צִיֵּר בַּיִת עִם גַּג אָדֹם.",
    en: "The boy drew a house with a red roof.",
  },
  צִיּוּר: {
    he: "תָּלִינוּ צִיּוּר יָפֶה בַּסָּלוֹן.",
    en: "We hung a nice painting in the living room.",
  },
  נִגֵּן: {
    he: "הוּא נִגֵּן בְּגִיטָרָה לְיַד הַמְּדוּרָה.",
    en: "He played guitar by the campfire.",
  },
  נְגִינָה: {
    he: "יֵשׁ לָהּ שִׁעוּר נְגִינָה כָּל יוֹם שְׁלִישִׁי.",
    en: "She has an instrument lesson every Tuesday.",
  },
  קוֹל: {
    he: "שָׁמַעְתִּי קוֹל מוּזָר מֵהַמִּטְבָּח.",
    en: "I heard a strange sound from the kitchen.",
  },
  קוֹלִי: { he: "הִיא שָׁלְחָה לִי מֶסֶר קוֹלִי אָרֹךְ.", en: "She sent me a long voice message." },
  יָצַר: { he: "הוּא יָצַר סִגְנוֹן חָדָשׁ לְגַמְרֵי.", en: "He created a completely new style." },
  יְצִירָה: {
    he: "זוֹ יְצִירָה מְפֻרְסֶמֶת מִן הַמֵּאָה הַקּוֹדֶמֶת.",
    en: "This is a famous work from the previous century.",
  },
  זִמֵּר: {
    he: "הַקָּהָל זִמֵּר יַחַד עִם הַלַּהֲקָה.",
    en: "The audience sang along with the band.",
  },
  זֶמֶר: {
    he: "שַׁרְנוּ זֶמֶר יָשָׁן סְבִיב הַשֻּׁלְחָן.",
    en: "We sang an old tune around the table.",
  },
  עִצֵּב: {
    he: "הוּא עִצֵּב אֶת הַלּוֹגוֹ שֶׁל הַחֶבְרָה.",
    en: "He designed the company's logo.",
  },
  עִצּוּב: {
    he: "יֵשׁ לַחֶדֶר עִצּוּב מוֹדֶרְנִי וְנָקִי.",
    en: "The room has a clean, modern design.",
  },
  פִּסֵּל: {
    he: "הָאָמָּן פִּסֵּל דְּמוּת מִשַּׁיִשׁ לָבָן.",
    en: "The artist sculpted a figure out of white marble.",
  },
  פֶּסֶל: {
    he: "בַּכִּכָּר עוֹמֵד פֶּסֶל שֶׁל מְשׁוֹרֵר.",
    en: "A statue of a poet stands in the square.",
  },
  חָגַג: {
    he: "הוּא חָגַג יוֹם הֻלֶּדֶת עִם חֲבֵרִים.",
    en: "He celebrated his birthday with friends.",
  },
  חַג: {
    he: "בְּכָל חַג אֲנַחְנוּ נִפְגָּשִׁים אֵצֶל סַבְתָּא.",
    en: "Every holiday we get together at Grandma's.",
  },
  מַחֲזֶה: {
    he: "רָאִינוּ מַחֲזֶה מְרַגֵּשׁ בַּתֵּאַטְרוֹן אֶמֶשׁ.",
    en: "We saw a moving play at the theater last night.",
  },
  מַחֲזַאי: {
    he: "הוּא מַחֲזַאי מֻכָּר שֶׁכָּתַב עֶשְׂרוֹת הַצָּגוֹת.",
    en: "He is a known playwright who wrote dozens of plays.",
  },
  "מָחָא כַּפַּיִם": {
    he: "הַקָּהָל מָחָא כַּפַּיִם בְּסוֹף הַהוֹפָעָה.",
    en: "The audience clapped at the end of the show.",
  },
  "מְחִיאוֹת כַּפַּיִם": {
    he: "נִשְׁמְעוּ מְחִיאוֹת כַּפַּיִם חֲזָקוֹת מִכָּל הָאוּלָם.",
    en: "Loud applause was heard from all over the hall.",
  },

  // — the body & health —
  כָּאַב: { he: "הַגָּרוֹן כָּאַב לִי כָּל הַלַּיְלָה.", en: "My throat hurt all night." },
  הִכְאִיב: {
    he: "הוּא הִכְאִיב לִי כְּשֶׁלָּחַץ עַל הַפֶּצַע.",
    en: "He hurt me when he pressed on the wound.",
  },
  גּוּף: { he: "יֵשׁ לוֹ גּוּף חָזָק שֶׁל שַׂחְיָן.", en: "He has the strong body of a swimmer." },
  גּוּפָנִי: {
    he: "יֵשׁ לָנוּ שִׁעוּר חִנּוּךְ גּוּפָנִי בְּיוֹם רְבִיעִי.",
    en: "We have a physical education class on Wednesday.",
  },
  רֹאשׁ: { he: "הוּא הֵנִיד רֹאשׁ לְאוֹת הַסְכָּמָה.", en: "He nodded his head in agreement." },
  רָאשִׁי: {
    he: "הוּא שַׂחְקָן רָאשִׁי בַּסֶּרֶט הֶחָדָשׁ.",
    en: "He is a lead actor in the new film.",
  },
  לֵב: { he: "יֵשׁ לוֹ לֵב טוֹב וְגָדוֹל.", en: "He has a big, good heart." },
  לְבָבִי: {
    he: "קִבַּלְנוּ יַחַס לְבָבִי מִכָּל הַמִּשְׁפָּחָה.",
    en: "We got a warm welcome from the whole family.",
  },
  דָּם: {
    he: "הוּא תָּרַם דָּם בַּתַּחֲנָה הַנַּיֶּדֶת.",
    en: "He gave blood at the mobile station.",
  },
  דִּמֵּם: {
    he: "הַפֶּצַע דִּמֵּם עַד שֶׁשַּׂמְנוּ תַּחְבֹּשֶׁת.",
    en: "The wound bled until we put on a bandage.",
  },
  רֶגֶל: {
    he: "כּוֹאֶבֶת לִי רֶגֶל אַחַת אַחֲרֵי הָרִיצָה.",
    en: "One of my legs hurts after the run.",
  },
  רָגִיל: {
    he: "זֶה יוֹם רָגִיל לְגַמְרֵי בָּעֲבוֹדָה.",
    en: "It is a completely ordinary day at work.",
  },
  יָד: { he: "הוּא הֵרִים יָד וְשָׁאַל שְׁאֵלָה.", en: "He raised a hand and asked a question." },
  יָדִית: {
    he: "צָרִיךְ לְהַחְלִיף יָדִית בַּדֶּלֶת הַזֹּאת.",
    en: "This door needs a new handle.",
  },
  עַיִן: { he: "יֵשׁ לוֹ עַיִן חַדָּה לִפְרָטִים.", en: "He has a sharp eye for detail." },
  עִיֵּן: {
    he: "הוּא עִיֵּן בַּחוֹזֶה לִפְנֵי שֶׁחָתַם.",
    en: "He looked over the contract before he signed.",
  },
  אֹזֶן: {
    he: "אֹזֶן אַחַת שֶׁלִּי לֹא שׁוֹמַעַת טוֹב.",
    en: "One of my ears does not hear well.",
  },
  הֶאֱזִין: {
    he: "הוּא הֶאֱזִין לַחֲדָשׁוֹת בָּרַדְיוֹ בַּדֶּרֶךְ.",
    en: "He listened to the news on the radio on the way.",
  },
  עֶצֶם: {
    he: "הַכֶּלֶב לָעַס עֶצֶם גְּדוֹלָה בֶּחָצֵר.",
    en: "The dog chewed a big bone in the yard.",
  },
  עַצְמִי: { he: "יֵשׁ לוֹ בִּטָּחוֹן עַצְמִי גָּבוֹהַּ.", en: "He has high self-confidence." },
  נָח: { he: "הוּא נָח קְצָת אַחַר הַצָּהֳרַיִם.", en: "He rested a little in the afternoon." },
  מְנוּחָה: {
    he: "מַגִּיעָה לְךָ מְנוּחָה אַחֲרֵי שָׁבוּעַ כָּזֶה.",
    en: "You deserve some rest after a week like this.",
  },
  טִפֵּל: {
    he: "הוּא טִפֵּל בְּסַבְתָּא כָּל הַחֹרֶף.",
    en: "He took care of Grandma all winter.",
  },
  טֻפַּל: {
    he: "הָעִנְיָן טֻפַּל כְּבָר אֶתְמוֹל בַּבֹּקֶר.",
    en: "The matter was already handled yesterday morning.",
  },
  בָּדַק: { he: "הָרוֹפֵא בָּדַק אֶת הַגָּרוֹן שֶׁלִּי.", en: "The doctor examined my throat." },
  נִבְדַּק: {
    he: "הוּא נִבְדַּק אֵצֶל מֻמְחֶה בַּשָּׁבוּעַ שֶׁעָבַר.",
    en: "He was examined by a specialist last week.",
  },
  עָיֵף: { he: "אֲנִי עָיֵף מְאוֹד אַחֲרֵי הַנְּסִיעָה.", en: "I am very tired after the trip." },
  עֲיֵפוּת: {
    he: "הָרוֹפֵא אָמַר שֶׁזּוֹ סְתָם עֲיֵפוּת.",
    en: "The doctor said it is just fatigue.",
  },
  חִסֵּן: {
    he: "הָרוֹפֵא חִסֵּן אֶת כָּל הַיְלָדִים בַּגַּן.",
    en: "The doctor vaccinated all the children at the kindergarten.",
  },
  הִתְחַסֵּן: {
    he: "הוּא הִתְחַסֵּן לִפְנֵי הַטִּיסָה לְאַפְרִיקָה.",
    en: "He got vaccinated before the flight to Africa.",
  },
  נִתֵּחַ: {
    he: "הוּא נִתֵּחַ אֶת הַנְּתוּנִים בִּזְהִירוּת.",
    en: "He analyzed the data carefully.",
  },
  נֻתַּח: {
    he: "הוּא נֻתַּח בַּבֶּרֶךְ וְחָזַר לָרוּץ.",
    en: "He had knee surgery and went back to running.",
  },
  שָׁאַף: {
    he: "הוּא שָׁאַף אֲוִיר צַח בַּפִּסְגָּה.",
    en: "He breathed in fresh air at the summit.",
  },
  נִשְׁאַף: {
    he: "הֶעָשָׁן נִשְׁאַף לְתוֹךְ הָרֵאוֹת.",
    en: "The smoke was drawn into the lungs.",
  },
  שִׁעוּל: {
    he: "יֵשׁ לוֹ שִׁעוּל חָזָק כְּבָר שָׁבוּעַ.",
    en: "He has had a bad cough for a week.",
  },
  הִשְׁתַּעֵל: {
    he: "הוּא הִשְׁתַּעֵל כָּל הַלַּיְלָה וְלֹא יָשַׁן.",
    en: "He coughed all night and did not sleep.",
  },
  חָבַשׁ: {
    he: "הָאָח חָבַשׁ אֶת הַפֶּצַע בַּמִּרְפָּאָה.",
    en: "The nurse dressed the wound at the clinic.",
  },
  נֶחְבַּשׁ: {
    he: "הַפֶּצַע נֶחְבַּשׁ מַהֵר בַּחֲדַר הַמִּיּוּן.",
    en: "The wound was bandaged quickly in the emergency room.",
  },
  הִתְעוֹרֵר: {
    he: "הוּא הִתְעוֹרֵר מֻקְדָּם בִּגְלַל הָרַעַשׁ.",
    en: "He woke up early because of the noise.",
  },
  הֵעִיר: {
    he: "אַבָּא הֵעִיר אוֹתִי בְּשֶׁבַע בַּבֹּקֶר.",
    en: "Dad woke me at seven in the morning.",
  },
  שָׁקַל: {
    he: "הוּא שָׁקַל אֶת הַהַצָּעָה כַּמָּה יָמִים.",
    en: "He weighed the offer for a few days.",
  },
  נִשְׁקַל: {
    he: "הָרַעְיוֹן נִשְׁקַל בִּרְצִינוּת בַּיְשִׁיבָה.",
    en: "The idea was seriously considered at the meeting.",
  },

  // — clothing & things —
  נַעַל: { he: "אִבַּדְתִּי נַעַל אַחַת בַּחוֹף.", en: "I lost one shoe at the beach." },
  נַעֲלַיִם: {
    he: "קָנִיתִי נַעֲלַיִם חֲדָשׁוֹת לָרִיצָה.",
    en: "I bought new shoes for running.",
  },
  חֲגוֹרָה: {
    he: "הַמִּכְנָסַיִם רְחָבִים וְצָרִיךְ חֲגוֹרָה.",
    en: "The trousers are loose and need a belt.",
  },
  חָגַר: {
    he: "הַחַיָּל חָגַר אֶת הַנֶּשֶׁק לִפְנֵי הַיְּצִיאָה.",
    en: "The soldier strapped on his weapon before setting out.",
  },
  כִּסָּה: {
    he: "הוּא כִּסָּה אֶת הַיֶּלֶד בִּשְׂמִיכָה חַמָּה.",
    en: "He covered the boy with a warm blanket.",
  },
  כִּסּוּי: { he: "אֵין כִּסּוּי לַסִּיר הַגָּדוֹל.", en: "There is no lid for the big pot." },
  תָּפַר: {
    he: "הוּא תָּפַר כַּפְתּוֹר לַחֻלְצָה שֶׁלּוֹ.",
    en: "He sewed a button onto his shirt.",
  },
  תֶּפֶר: { he: "נִפְתַּח לִי תֶּפֶר בַּמִּכְנָסַיִם.", en: "A seam came open in my trousers." },
  צֶבַע: { he: "אֵיזֶה צֶבַע אַתָּה אוֹהֵב יוֹתֵר?", en: "Which color do you like better?" },
  צָבַע: { he: "הוּא צָבַע אֶת הַקִּיר בְּלָבָן.", en: "He painted the wall white." },
  קָשַׁר: {
    he: "הוּא קָשַׁר אֶת הַשְּׂרוֹכִים לִפְנֵי הָרִיצָה.",
    en: "He tied his laces before the run.",
  },
  קֶשֶׁר: {
    he: "יֵשׁ לָהּ קֶשֶׁר טוֹב עִם הַשְּׁכֵנִים.",
    en: "She has a good connection with the neighbors.",
  },
  כַּפְתּוֹר: { he: "נָפַל לִי כַּפְתּוֹר מֵהַמְּעִיל.", en: "A button fell off my coat." },
  כִּפְתֵּר: {
    he: "הוּא כִּפְתֵּר אֶת הַחֻלְצָה עַד לְמַעְלָה.",
    en: "He buttoned the shirt all the way up.",
  },
  קִפֵּל: {
    he: "הוּא קִפֵּל אֶת הַכְּבִיסָה וְסִדֵּר בָּאָרוֹן.",
    en: "He folded the laundry and put it in the closet.",
  },
  קֶפֶל: {
    he: "יֵשׁ קֶפֶל מְכֹעָר בַּמִּכְנָסַיִם הָאֵלֶּה.",
    en: "There is an ugly crease in these trousers.",
  },
  גֶּרֶב: {
    he: "מָצָאתִי גֶּרֶב אֶחָד מִתַּחַת לַמִּטָּה.",
    en: "I found one sock under the bed.",
  },
  גַּרְבַּיִם: {
    he: "בַּחֹרֶף אֲנִי יָשֵׁן עִם גַּרְבַּיִם.",
    en: "In the winter I sleep with socks on.",
  },
  אָרַז: { he: "הוּא אָרַז אֶת הַמִּזְוָדָה בַּלַּיְלָה.", en: "He packed the suitcase at night." },
  אֲרִיזָה: {
    he: "הַמַּתָּנָה הִגִּיעָה בַּאֲרִיזָה יָפָה.",
    en: "The gift arrived in pretty packaging.",
  },
  אִבֵּד: { he: "הוּא אִבֵּד אֶת הַמַּפְתְּחוֹת בַּפַּרְק.", en: "He lost the keys in the park." },
  אָבַד: {
    he: "הַתִּיק שֶׁלִּי אָבַד בִּנְמַל הַתְּעוּפָה.",
    en: "My bag went missing at the airport.",
  },
  כִּיס: {
    he: "לַמְּעִיל הַזֶּה יֵשׁ כִּיס פְּנִימִי גָּדוֹל.",
    en: "This coat has a big inside pocket.",
  },
  כִּיסוֹן: {
    he: "יֵשׁ כִּיסוֹן קָטָן בְּתוֹךְ הַתִּיק.",
    en: "There is a small pouch inside the bag.",
  },
  טַבַּעַת: {
    he: "הִיא עוֹנֶדֶת טַבַּעַת זָהָב בַּיָּד.",
    en: "She wears a gold ring on her hand.",
  },
  מַטְבֵּעַ: {
    he: "מָצָאתִי מַטְבֵּעַ יָשָׁן בַּמְּגֵרָה.",
    en: "I found an old coin in the drawer.",
  },
  מִשְׁקָפַיִם: {
    he: "בְּלִי מִשְׁקָפַיִם אֲנִי לֹא רוֹאֶה כְּלוּם.",
    en: "Without glasses I cannot see a thing.",
  },
  מִשְׁקֶפֶת: {
    he: "לָקַחְנוּ מִשְׁקֶפֶת כְּדֵי לִרְאוֹת צִפֳּרִים.",
    en: "We took binoculars in order to see birds.",
  },
  מַגֶּבֶת: {
    he: "הֵבֵאתִי מַגֶּבֶת גְּדוֹלָה לַחוֹף.",
    en: "I brought a big towel to the beach.",
  },
  נִגֵּב: {
    he: "הוּא נִגֵּב אֶת הַשֻּׁלְחָן אַחֲרֵי הָאֹכֶל.",
    en: "He wiped the table after the meal.",
  },
  מִבְרֶשֶׁת: {
    he: "קָנִיתִי מִבְרֶשֶׁת חֲדָשָׁה לַשִּׁנַּיִם.",
    en: "I bought a new toothbrush.",
  },
  הִבְרִישׁ: {
    he: "הוּא הִבְרִישׁ אֶת הַשֵּׂעָר לִפְנֵי הַיְּצִיאָה.",
    en: "He brushed his hair before going out.",
  },
  תָּלָה: { he: "הוּא תָּלָה אֶת הַמְּעִיל עַל הַוָּו.", en: "He hung the coat on the hook." },
  מִתְלֶה: {
    he: "יֵשׁ מִתְלֶה לְיַד דֶּלֶת הַכְּנִיסָה.",
    en: "There is a coat hook by the front door.",
  },
  סְפוֹג: {
    he: "שָׁטַפְתִּי אֶת הַכֵּלִים עִם סְפוֹג יָרוֹק.",
    en: "I washed the dishes with a green sponge.",
  },
  סָפַג: { he: "הַשָּׁטִיחַ סָפַג אֶת כָּל הַמַּיִם.", en: "The rug soaked up all the water." },

  // — weather & seasons —
  שֶׁמֶשׁ: {
    he: "יֵשׁ שֶׁמֶשׁ חֲזָקָה הַיּוֹם בַּחוּץ.",
    en: "There is strong sun outside today.",
  },
  שִׁמְשִׁי: {
    he: "הִתְקַנּוּ דּוּד שִׁמְשִׁי עַל הַגַּג.",
    en: "They installed a solar water heater on the roof.",
  },
  עָנָן: { he: "עָנָן אֶחָד גָּדוֹל הִסְתִּיר אֶת הָהָר.", en: "One big cloud hid the mountain." },
  מְעֻנָּן: {
    he: "הַיּוֹם מְעֻנָּן וְקָרִיר בְּכָל הָאֵזוֹר.",
    en: "Today is cloudy and cool across the whole region.",
  },
  סְעָרָה: {
    he: "סְעָרָה חֲזָקָה עָבְרָה כָּאן אֶמֶשׁ.",
    en: "A strong storm passed through here last night.",
  },
  סַעַר: {
    he: "רוּחַ סַעַר הִפִּילָה עֵצִים בָּרְחוֹב.",
    en: "A gale knocked trees down in the street.",
  },
  שֶׁלֶג: { he: "יָרַד שֶׁלֶג לָבָן עַל הָהָר.", en: "White snow fell on the mountain." },
  הִשְׁלִיג: {
    he: "בַּלַּיְלָה הִשְׁלִיג בַּצָּפוֹן וְהַכְּבִישִׁים נִסְגְּרוּ.",
    en: "It snowed in the north at night and the roads closed.",
  },
  בָּרָק: {
    he: "רָאִינוּ בָּרָק גָּדוֹל מֵעַל הַיָּם.",
    en: "We saw a big bolt of lightning over the sea.",
  },
  הִבְרִיק: {
    he: "הַשֻּׁלְחָן הִבְרִיק אַחֲרֵי הַנִּקָּיוֹן.",
    en: "The table gleamed after the cleaning.",
  },
  רַעַם: {
    he: "שָׁמַעְנוּ רַעַם חָזָק מִיָּד אַחֲרֵי הַבָּרָק.",
    en: "We heard loud thunder right after the lightning.",
  },
  רָעַם: { he: "כָּל הַלַּיְלָה רָעַם וְיָרַד גֶּשֶׁם.", en: "All night it thundered and rained." },
  יָבֵשׁ: { he: "הַלֶּחֶם הַזֶּה יָבֵשׁ מִדַּי לַאֲכִילָה.", en: "This bread is too dry to eat." },
  יָבַשׁ: {
    he: "הַנַּחַל יָבַשׁ לְגַמְרֵי בַּקַּיִץ.",
    en: "The stream dried up completely in the summer.",
  },
  לַח: { he: "הָאֲוִיר לַח וְכָבֵד בָּעֶרֶב.", en: "The air is damp and heavy in the evening." },
  לַחוּת: {
    he: "יֵשׁ הַרְבֵּה לַחוּת בָּאֲוִיר לְיַד הַיָּם.",
    en: "There is a lot of humidity in the air near the sea.",
  },
  קָפָא: {
    he: "הָאֲגַם קָפָא לְגַמְרֵי בַּחֹרֶף הַקָּשֶׁה.",
    en: "The lake froze solid in the harsh winter.",
  },
  הִקְפִּיא: {
    he: "הוּא הִקְפִּיא אֶת הַמָּרָק לְשָׁבוּעַ הַבָּא.",
    en: "He froze the soup for next week.",
  },
  זָרַח: {
    he: "הַיָּרֵחַ זָרַח מֵעַל הַגַּגּוֹת הַשְּׁקֵטִים.",
    en: "The moon shone above the quiet rooftops.",
  },
  זְרִיחָה: {
    he: "יָצָאנוּ לַטִּיּוּל לִפְנֵי זְרִיחָה.",
    en: "We set out on the hike before sunrise.",
  },
  שָׁקַע: {
    he: "הַכַּדּוּר שָׁקַע בַּבֹּץ לְיַד הַנַּחַל.",
    en: "The ball sank into the mud by the stream.",
  },
  שְׁקִיעָה: {
    he: "רָאִינוּ שְׁקִיעָה אֲדֻמָּה מֵרֹאשׁ הָהָר.",
    en: "We saw a red sunset from the mountaintop.",
  },
  נָשַׁב: {
    he: "נָשַׁב אֲוִיר קַר מִן הַחַלּוֹן הַפָּתוּחַ.",
    en: "Cold air blew in from the open window.",
  },
  נְשִׁיבָה: {
    he: "אֲנִי אוֹהֵב נְשִׁיבָה קַלָּה שֶׁל רוּחַ בָּעֶרֶב.",
    en: "I love a light breath of wind in the evening.",
  },
  חֹרֶף: {
    he: "חֹרֶף כָּזֶה גָּשׁוּם לֹא הָיָה שָׁנִים.",
    en: "There has not been such a rainy winter in years.",
  },
  חָרְפִּי: { he: "לָבַשְׁתִּי מְעִיל חָרְפִּי כָּבֵד.", en: "I put on a heavy winter coat." },
  קַיִץ: {
    he: "קַיִץ בָּאָרֶץ הוּא חַם וְלַח מְאוֹד.",
    en: "Summer in Israel is very hot and humid.",
  },
  קֵיצִי: { he: "לָבַשְׁתִּי בֶּגֶד קֵיצִי וְקַל.", en: "I wore a light summer outfit." },
  סְתָו: { he: "סְתָו הוּא הָעוֹנָה הָאֲהוּבָה עָלַי.", en: "Autumn is my favorite season." },
  סְתָוִי: {
    he: "יֵשׁ בַּחוּץ אֲוִיר סְתָוִי נָעִים.",
    en: "There is pleasant autumn air outside.",
  },
  אָבִיב: { he: "אָבִיב הוּא זְמַן טוֹב לְטִיּוּלִים.", en: "Spring is a good time for hikes." },
  אֲבִיבִי: {
    he: "הָיָה הַיּוֹם מֶזֶג אֲוִיר אֲבִיבִי וְנָעִים.",
    en: "The weather today was springlike and pleasant.",
  },
  "מֶזֶג אֲוִיר": {
    he: "יֵשׁ הַיּוֹם מֶזֶג אֲוִיר נָעִים לְטִיּוּל.",
    en: "The weather today is pleasant for a hike.",
  },
  מֶזֶג: { he: "יֵשׁ לוֹ מֶזֶג רָגוּעַ וְנָעִים.", en: "He has a calm, pleasant temperament." },
  צִנֵּן: {
    he: "הוּא צִנֵּן אֶת הַבַּקְבּוּק לִפְנֵי הָאֲרוּחָה.",
    en: "He chilled the bottle before the meal.",
  },
  הִצְטַנֵּן: {
    he: "הוּא הִצְטַנֵּן אַחֲרֵי הַגֶּשֶׁם וְנִשְׁאַר בַּבַּיִת.",
    en: "He caught a cold after the rain and stayed home.",
  },
};
