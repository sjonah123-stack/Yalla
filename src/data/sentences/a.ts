import type { Sentence } from "../../types";

/** Example sentences — speech, movement, senses, home, people, time, feelings, work, food. */
export const S_A: Readonly<Record<string, Sentence>> = {
  // Speech
  אָמַר: { he: "הוּא אָמַר לִי שֶׁהַכֹּל בְּסֵדֶר.", en: "He told me that everything is fine." },
  מַאֲמָר: {
    he: "הוּא פִּרְסֵם מַאֲמָר חָדָשׁ בָּעִתּוֹן.",
    en: "He published a new article in the newspaper.",
  },
  דִּבֵּר: {
    he: "הוּא דִּבֵּר עִם הַמּוֹרָה אֶתְמוֹל.",
    en: "He spoke with the teacher yesterday.",
  },
  דָּבָר: { he: "אֵין שׁוּם דָּבָר בַּמְּקָרֵר.", en: "There is nothing in the fridge." },
  קָרָא: {
    he: "הוּא קָרָא סֵפֶר מְעַנְיֵן בָּעֶרֶב.",
    en: "He read an interesting book in the evening.",
  },
  הִקְרִיא: {
    he: "הַמּוֹרֶה הִקְרִיא אֶת הַסִּפּוּר בְּקוֹל.",
    en: "The teacher read the story aloud.",
  },
  כָּתַב: {
    he: "הוּא כָּתַב שִׁיר יָפֶה לְאִמָּא שֶׁלּוֹ.",
    en: "He wrote a beautiful poem for his mom.",
  },
  הִכְתִּיב: {
    he: "הוּא הִכְתִּיב לִי אֶת הַמִּסְפָּרִים בַּטֶּלֶפוֹן.",
    en: "He dictated the numbers to me over the phone.",
  },
  סָפַר: { he: "הוּא סָפַר אֶת הַכֶּסֶף בַּקֻּפָּה.", en: "He counted the money in the register." },
  סִפֵּר: { he: "הוּא סִפֵּר לִי בְּדִיחָה מַצְחִיקָה.", en: "He told me a funny joke." },
  שָׁאַל: { he: "הוּא שָׁאַל אוֹתִי אֵיפֹה הַתַּחֲנָה.", en: "He asked me where the station is." },
  הִשְׁאִיל: { he: "הוּא הִשְׁאִיל לִי אֶת הָאוֹפַנַּיִם שֶׁלּוֹ.", en: "He lent me his bicycle." },
  עָנָה: { he: "הוּא לֹא עָנָה לַטֶּלֶפוֹן שֶׁלִּי.", en: "He did not answer my phone call." },
  נַעֲנָה: {
    he: "הַמְּנַהֵל נַעֲנָה לַבַּקָּשָׁה שֶׁל הָעוֹבְדִים.",
    en: "The manager granted the workers' request.",
  },
  בִּקֵּשׁ: {
    he: "הוּא בִּקֵּשׁ מִמֶּנִּי לְחַכּוֹת בַּחוּץ.",
    en: "He asked me to wait outside.",
  },
  הִתְבַּקֵּשׁ: {
    he: "הוּא הִתְבַּקֵּשׁ לְהַגִּיעַ מֻקְדָּם לַפְּגִישָׁה.",
    en: "He was asked to arrive early to the meeting.",
  },
  שָׁלַח: { he: "הוּא שָׁלַח לִי הוֹדָעָה בַּבֹּקֶר.", en: "He sent me a message in the morning." },
  נִשְׁלַח: {
    he: "הַמִּכְתָּב נִשְׁלַח כְּבָר לִפְנֵי שָׁבוּעַ.",
    en: "The letter was already sent a week ago.",
  },
  סִכֵּם: {
    he: "הוּא סִכֵּם אֶת הַשִּׁעוּר בְּכַמָּה מִשְׁפָּטִים.",
    en: "He summarized the lesson in a few sentences.",
  },
  הִסְכִּים: {
    he: "הוּא הִסְכִּים לָבוֹא אִתָּנוּ לַיָּם.",
    en: "He agreed to come with us to the sea.",
  },
  תֵּאֵר: {
    he: "הָעֵד תֵּאֵר אֶת הַגַּנָּב לַשּׁוֹטְרִים.",
    en: "The witness described the thief to the police.",
  },
  תֵּאוּר: {
    he: "הוּא נָתַן תֵּאוּר מְדֻיָּק שֶׁל הַמָּקוֹם.",
    en: "He gave an exact description of the place.",
  },
  הִסְבִּיר: {
    he: "הַמּוֹרֶה הִסְבִּיר אֶת הַתַּרְגִּיל פַּעֲמַיִם.",
    en: "The teacher explained the exercise twice.",
  },
  הֶסְבֵּר: {
    he: "הַתַּלְמִידִים בִּקְּשׁוּ הֶסְבֵּר נוֹסָף מֵהַמּוֹרָה.",
    en: "The students asked the teacher for another explanation.",
  },
  דָּרַשׁ: {
    he: "הַלָּקוֹחַ דָּרַשׁ אֶת הַכֶּסֶף בַּחֲזָרָה.",
    en: "The customer demanded the money back.",
  },
  נִדְרַשׁ: {
    he: "כָּל עוֹבֵד נִדְרַשׁ לַחְתֹּם עַל הַטֹּפֶס.",
    en: "Every employee was required to sign the form.",
  },
  תִּרְגֵּם: {
    he: "הוּא תִּרְגֵּם אֶת הַסֵּפֶר מֵאַנְגְּלִית לְעִבְרִית.",
    en: "He translated the book from English into Hebrew.",
  },
  תַּרְגּוּם: {
    he: "הַתַּרְגּוּם שֶׁל הַשִּׁיר הַזֶּה מְצֻיָּן.",
    en: "The translation of this poem is excellent.",
  },
  פֵּרֵשׁ: {
    he: "הָרַב פֵּרֵשׁ אֶת הַפָּסוּק בְּדֶרֶךְ חֲדָשָׁה.",
    en: "The rabbi interpreted the verse in a new way.",
  },
  פָּרַשׁ: {
    he: "הַשַּׂחְקָן פָּרַשׁ מֵהַקְּבוּצָה בְּסוֹף הָעוֹנָה.",
    en: "The player retired from the team at the end of the season.",
  },
  // Movement
  הָלַךְ: {
    he: "הוּא הָלַךְ בָּרֶגֶל עַד הַתַּחֲנָה.",
    en: "He walked on foot all the way to the station.",
  },
  הֲלִיכָה: {
    he: "יָצָאנוּ לַהֲלִיכָה קְצָרָה אַחֲרֵי הָאֹכֶל.",
    en: "We went out for a short walk after the meal.",
  },
  בָּא: { he: "הוּא בָּא אֵלֵינוּ לְבִקּוּר בְּשַׁבָּת.", en: "He came to visit us on Shabbat." },
  הֵבִיא: {
    he: "הוּא הֵבִיא לִי פְּרָחִים לְיוֹם הַהֻלֶּדֶת.",
    en: "He brought me flowers for my birthday.",
  },
  יָצָא: {
    he: "הוּא יָצָא מֵהַבַּיִת בְּשֶׁבַע בַּבֹּקֶר.",
    en: "He left the house at seven in the morning.",
  },
  הוֹצִיא: { he: "הוּא הוֹצִיא אֶת הַכֶּלֶב לְטִיּוּל.", en: "He took the dog out for a walk." },
  נִכְנַס: {
    he: "הוּא נִכְנַס לַחֶדֶר בְּלִי לְהַקִּישׁ.",
    en: "He entered the room without knocking.",
  },
  הִכְנִיס: { he: "הוּא הִכְנִיס אֶת הֶחָלָב לַמְּקָרֵר.", en: "He put the milk in the fridge." },
  עָלָה: {
    he: "הוּא עָלָה בַּמַּדְרֵגוֹת עַד הַקּוֹמָה הַשְּׁלִישִׁית.",
    en: "He went up the stairs to the third floor.",
  },
  הֶעֱלָה: {
    he: "הוּא הֶעֱלָה תְּמוּנוֹת מֵהַטִּיּוּל לָרֶשֶׁת.",
    en: "He uploaded photos from the trip to the internet.",
  },
  יָרַד: {
    he: "הוּא יָרַד לַמַּכֹּלֶת לִקְנוֹת לֶחֶם.",
    en: "He went down to the grocery store to buy bread.",
  },
  הוֹרִיד: {
    he: "הוּא הוֹרִיד אֶת הַמְּעִיל וְתָלָה אוֹתוֹ.",
    en: "He took off the coat and hung it up.",
  },
  יָשַׁב: { he: "הוּא יָשַׁב עַל הַסַּפָּה וְנָח.", en: "He sat on the couch and rested." },
  הוֹשִׁיב: {
    he: "הַמֶּלְצַר הוֹשִׁיב אוֹתָנוּ לְיַד הַחַלּוֹן.",
    en: "The waiter seated us next to the window.",
  },
  עָמַד: { he: "הוּא עָמַד בַּתּוֹר חֲצִי שָׁעָה.", en: "He stood in line for half an hour." },
  הֶעֱמִיד: {
    he: "הוּא הֶעֱמִיד אֶת הַסֻּלָּם לְיַד הַקִּיר.",
    en: "He placed the ladder next to the wall.",
  },
  קָם: { he: "הוּא קָם מֻקְדָּם כָּל בֹּקֶר.", en: "He gets up early every morning." },
  הֵקִים: {
    he: "הוּא הֵקִים חֶבְרָה קְטַנָּה לִפְנֵי שָׁנָה.",
    en: "He founded a small company a year ago.",
  },
  נָפַל: {
    he: "הַסֵּפֶר נָפַל מֵהַשֻּׁלְחָן לָרִצְפָּה.",
    en: "The book fell from the table to the floor.",
  },
  הִפִּיל: {
    he: "הוּא הִפִּיל אֶת הַכּוֹס וְהִיא נִשְׁבְּרָה.",
    en: "He dropped the glass and it broke.",
  },
  רָץ: {
    he: "הוּא רָץ לַתַּחֲנָה כְּדֵי לִתְפֹּס אוֹטוֹבּוּס.",
    en: "He ran to the station to catch a bus.",
  },
  רִיצָה: { he: "אֲנִי אוֹהֵב רִיצָה קַלָּה בַּבֹּקֶר.", en: "I like an easy run in the morning." },
  נָסַע: {
    he: "הוּא נָסַע לַיָּם עִם הַחֲבֵרִים שֶׁלּוֹ.",
    en: "He drove to the sea with his friends.",
  },
  הִסִּיעַ: { he: "אַבָּא הִסִּיעַ אוֹתִי לְבֵית הַסֵּפֶר.", en: "Dad drove me to school." },
  שָׁב: {
    he: "הוּא שָׁב הַבַּיְתָה אַחֲרֵי שָׁנָה בְּחוּץ לָאָרֶץ.",
    en: "He returned home after a year abroad.",
  },
  הֵשִׁיב: {
    he: "הוּא הֵשִׁיב לִי אֶת הַסֵּפֶר בַּזְּמַן.",
    en: "He gave me back the book on time.",
  },
  עָבַר: {
    he: "הוּא עָבַר לְדִירָה חֲדָשָׁה בָּעִיר.",
    en: "He moved to a new apartment in the city.",
  },
  הֶעֱבִיר: {
    he: "הַמּוֹרֶה הֶעֱבִיר אֶת הַשִּׁעוּר בְּאַנְגְּלִית.",
    en: "The teacher gave the lesson in English.",
  },
  חָזַר: { he: "הוּא חָזַר מֵהָעֲבוֹדָה מְאֻחָר מְאוֹד.", en: "He came back from work very late." },
  הֶחֱזִיר: {
    he: "הוּא הֶחֱזִיר אֶת הַסְּפָרִים לַסִּפְרִיָּה.",
    en: "He returned the books to the library.",
  },
  הִתְקָרֵב: {
    he: "הַכֶּלֶב הִתְקָרֵב אֵלַי לְאַט לְאַט.",
    en: "The dog came closer to me slowly.",
  },
  הִקְרִיב: {
    he: "הוּא הִקְרִיב הַרְבֵּה לְמַעַן הַמִּשְׁפָּחָה שֶׁלּוֹ.",
    en: "He sacrificed a lot for his family.",
  },
  הִתְרַחֵק: {
    he: "הוּא הִתְרַחֵק מֵהַחֲבֵרִים הַיְשָׁנִים שֶׁלּוֹ.",
    en: "He drifted away from his old friends.",
  },
  הִרְחִיק: {
    he: "הַשּׁוֹטֵר הִרְחִיק אֶת הַסַּקְרָנִים מֵהַזִּירָה.",
    en: "The policeman moved the onlookers away from the scene.",
  },
  נָהַג: { he: "הוּא נָהַג לְאַט בִּגְלַל הַגֶּשֶׁם.", en: "He drove slowly because of the rain." },
  הִתְנַהֵג: {
    he: "הַיֶּלֶד הִתְנַהֵג יָפֶה אֵצֶל הָרוֹפֵא.",
    en: "The boy behaved nicely at the doctor's.",
  },
  פָּנָה: {
    he: "הוּא פָּנָה אֵלַי בִּשְׁאֵלָה קְצָרָה.",
    en: "He turned to me with a short question.",
  },
  פִּנָּה: {
    he: "הוּא פִּנָּה אֶת הַשֻּׁלְחָן אַחֲרֵי הָאֹכֶל.",
    en: "He cleared the table after the meal.",
  },
  סוֹבֵב: {
    he: "הַיֶּלֶד סוֹבֵב אֶת הַגַּלְגַּל בִּמְהִירוּת.",
    en: "The boy spun the wheel quickly.",
  },
  הִסְתּוֹבֵב: {
    he: "הוּא הִסְתּוֹבֵב בַּשּׁוּק כָּל הַבֹּקֶר.",
    en: "He wandered around the market all morning.",
  },
  // Senses
  רָאָה: {
    he: "הוּא רָאָה סֶרֶט מְצֻיָּן אֶתְמוֹל בָּעֶרֶב.",
    en: "He saw an excellent movie last night.",
  },
  הֶרְאָה: {
    he: "הוּא הֶרְאָה לִי אֶת הַתְּמוּנוֹת מֵהַחֲתֻנָּה.",
    en: "He showed me the photos from the wedding.",
  },
  שָׁמַע: {
    he: "הוּא שָׁמַע רַעַשׁ מוּזָר בַּלַּיְלָה.",
    en: "He heard a strange noise at night.",
  },
  הִשְׁמִיעַ: {
    he: "הַמּוֹרֶה הִשְׁמִיעַ לָנוּ שִׁיר בְּעִבְרִית.",
    en: "The teacher played us a song in Hebrew.",
  },
  יָדַע: {
    he: "הוּא לֹא יָדַע אֶת הַתְּשׁוּבָה בַּמִּבְחָן.",
    en: "He did not know the answer on the test.",
  },
  הוֹדִיעַ: {
    he: "הַמְּנַהֵל הוֹדִיעַ שֶׁהַפְּגִישָׁה נִדְחֲתָה לְמָחָר.",
    en: "The manager announced that the meeting was postponed to tomorrow.",
  },
  חָשַׁב: {
    he: "הוּא חָשַׁב הַרְבֵּה לִפְנֵי שֶׁהֶחְלִיט.",
    en: "He thought a lot before he decided.",
  },
  חִשֵּׁב: {
    he: "הַמּוֹכֵר חִשֵּׁב אֶת הַמְּחִיר הַסּוֹפִי.",
    en: "The salesman calculated the final price.",
  },
  הֵבִין: {
    he: "הוּא לֹא הֵבִין אֶת הַהֶסְבֵּר שֶׁלִּי.",
    en: "He did not understand my explanation.",
  },
  הִתְבּוֹנֵן: {
    he: "הוּא הִתְבּוֹנֵן בַּתְּמוּנָה זְמַן רַב.",
    en: "He gazed at the picture for a long time.",
  },
  זָכַר: {
    he: "הוּא לֹא זָכַר אֵיפֹה שָׂם אֶת הַמַּפְתְּחוֹת.",
    en: "He did not remember where he put the keys.",
  },
  הִזְכִּיר: {
    he: "הוּא הִזְכִּיר לִי לְשַׁלֵּם אֶת הַחֶשְׁבּוֹן.",
    en: "He reminded me to pay the bill.",
  },
  שָׁכַח: {
    he: "הוּא שָׁכַח אֶת הַמִּטְרִיָּה בָּאוֹטוֹבּוּס.",
    en: "He forgot the umbrella on the bus.",
  },
  הִשְׁכִּיחַ: {
    he: "הַזְּמַן הִשְׁכִּיחַ מִמֶּנּוּ אֶת הַכְּאֵב.",
    en: "Time made him forget the pain.",
  },
  לָמַד: { he: "הוּא לָמַד לְמִבְחָן כָּל הַלַּיְלָה.", en: "He studied for a test all night." },
  לִמֵּד: { he: "סַבָּא לִמֵּד אוֹתִי לְשַׂחֵק שַׁחְמָט.", en: "Grandpa taught me to play chess." },
  רָצָה: { he: "הוּא רָצָה לָלֶכֶת הַבַּיְתָה מֻקְדָּם.", en: "He wanted to go home early." },
  רָצוֹן: {
    he: "אֵין לוֹ שׁוּם רָצוֹן לָקוּם מֻקְדָּם.",
    en: "He has no desire at all to get up early.",
  },
  הֵטִיב: {
    he: "הַשִּׁנּוּי הֵטִיב עִם כָּל הָעוֹבְדִים.",
    en: "The change did all the workers good.",
  },
  טוֹב: {
    he: "הָאֹכֶל בַּמִּסְעָדָה הַזֹּאת טוֹב מְאוֹד.",
    en: "The food at this restaurant is very good.",
  },
  יִפָּה: {
    he: "הוּא יִפָּה אֶת הַגִּנָּה לִקְרַאת הַחַג.",
    en: "He beautified the garden for the holiday.",
  },
  הִתְיַפָּה: {
    he: "הִיא הִתְיַפָּה לִקְרַאת הַחֲתֻנָּה שֶׁל אֲחוֹתָהּ.",
    en: "She got dressed up for her sister's wedding.",
  },
  נִסָּה: {
    he: "הוּא נִסָּה לִפְתֹּחַ אֶת הַדֶּלֶת בְּכֹחַ.",
    en: "He tried to force the door open.",
  },
  הִתְנַסָּה: {
    he: "הוּא הִתְנַסָּה בַּעֲבוֹדָה חֲדָשָׁה בַּקַּיִץ.",
    en: "He got a taste of a new job in the summer.",
  },
  הֶחְלִיט: { he: "הוּא הֶחְלִיט לַעֲזֹב אֶת הָעֲבוֹדָה.", en: "He decided to quit his job." },
  הַחְלָטָה: { he: "זֹאת הָיְתָה הַחְלָטָה קָשָׁה מְאוֹד.", en: "That was a very hard decision." },
  הֶאֱמִין: { he: "הוּא לֹא הֶאֱמִין לְמָה שֶׁשָּׁמַע.", en: "He did not believe what he heard." },
  הִתְאַמֵּן: {
    he: "הוּא הִתְאַמֵּן בַּחֲדַר הַכּוֹשֶׁר פַּעֲמַיִם בְּשָׁבוּעַ.",
    en: "He worked out at the gym twice a week.",
  },
  טָעָה: {
    he: "הוּא טָעָה בַּדֶּרֶךְ וְהִגִּיעַ מְאֻחָר.",
    en: "He took a wrong turn and arrived late.",
  },
  הִטְעָה: {
    he: "הַשֶּׁלֶט הִטְעָה אוֹתָנוּ וְנָסַעְנוּ לַכִּוּוּן הַהָפוּךְ.",
    en: "The sign misled us and we drove the wrong way.",
  },
  צָדַק: {
    he: "הוּא צָדַק לְגַמְרֵי בַּוִּכּוּחַ הַזֶּה.",
    en: "He was completely right in that argument.",
  },
  הִצְדִּיק: {
    he: "הוּא הִצְדִּיק אֶת הָאִחוּר שֶׁלּוֹ בִּפְקָקִים.",
    en: "He justified his lateness with traffic jams.",
  },
  רַע: { he: "מֶזֶג הָאֲוִיר הָיָה רַע כָּל הַשָּׁבוּעַ.", en: "The weather was bad all week." },
  רָעָה: { he: "הַשָּׁכֵן עָשָׂה לוֹ רָעָה גְּדוֹלָה.", en: "The neighbor did him great harm." },
  נָעִים: {
    he: "הָיָה נָעִים מְאוֹד לְטַיֵּל בַּפַּרְק.",
    en: "It was very pleasant to walk in the park.",
  },
  נֹעַם: {
    he: "הִיא דִּבְּרָה אֵלָיו בְּנֹעַם וּבְסַבְלָנוּת.",
    en: "She spoke to him gently and patiently.",
  },
  // Home
  בָּנָה: { he: "הוּא בָּנָה אָרוֹן חָדָשׁ לַחֶדֶר.", en: "He built a new closet for the room." },
  נִבְנָה: {
    he: "הַגֶּשֶׁר הֶחָדָשׁ נִבְנָה תּוֹךְ שְׁנָתַיִם.",
    en: "The new bridge was built within two years.",
  },
  פָּתַח: {
    he: "הוּא פָּתַח אֶת הַחַלּוֹן בִּגְלַל הַחֹם.",
    en: "He opened the window because of the heat.",
  },
  פִּתֵּחַ: {
    he: "הוּא פִּתֵּחַ מִשְׂחָק חָדָשׁ לַמַּחְשֵׁב.",
    en: "He developed a new computer game.",
  },
  סָגַר: { he: "הוּא סָגַר אֶת הַדֶּלֶת בְּשֶׁקֶט.", en: "He closed the door quietly." },
  הִסְגִּיר: {
    he: "הוּא הִסְגִּיר אֶת הַסּוֹד בְּלִי לָשִׂים לֵב.",
    en: "He gave away the secret without noticing.",
  },
  שָׁמַר: {
    he: "הוּא שָׁמַר עַל הַכֶּלֶב שֶׁל הַשְּׁכֵנִים.",
    en: "He looked after the neighbors' dog.",
  },
  נִשְׁמַר: {
    he: "הָאֹכֶל נִשְׁמַר טָרִי בַּמְּקָרֵר כַּמָּה יָמִים.",
    en: "The food stayed fresh in the fridge for a few days.",
  },
  סִדֵּר: {
    he: "הוּא סִדֵּר אֶת הַחֶדֶר לִפְנֵי הָאוֹרְחִים.",
    en: "He tidied the room before the guests came.",
  },
  הִסְתַּדֵּר: {
    he: "הוּא הִסְתַּדֵּר יָפֶה בָּעֲבוֹדָה הַחֲדָשָׁה.",
    en: "He got along nicely at the new job.",
  },
  גָּר: {
    he: "הוּא גָּר בְּתֵל אָבִיב חָמֵשׁ שָׁנִים.",
    en: "He lived in Tel Aviv for five years.",
  },
  הִתְגּוֹרֵר: {
    he: "הוּא הִתְגּוֹרֵר בְּחוּץ לָאָרֶץ תְּקוּפָה אֲרֻכָּה.",
    en: "He resided abroad for a long period.",
  },
  לָבַשׁ: {
    he: "הוּא לָבַשׁ מְעִיל חַם לִפְנֵי הַיְּצִיאָה.",
    en: "He put on a warm coat before going out.",
  },
  הִלְבִּישׁ: {
    he: "אַבָּא הִלְבִּישׁ אֶת הַתִּינוֹק בַּבֹּקֶר.",
    en: "Dad dressed the baby in the morning.",
  },
  בִּשֵּׁל: {
    he: "הוּא בִּשֵּׁל מָרָק יְרָקוֹת לְכָל הַמִּשְׁפָּחָה.",
    en: "He cooked vegetable soup for the whole family.",
  },
  הִבְשִׁיל: {
    he: "הָאֲבַטִּיחַ הִבְשִׁיל וְעַכְשָׁו הוּא מָתוֹק.",
    en: "The watermelon ripened and now it is sweet.",
  },
  נִקָּה: {
    he: "הוּא נִקָּה אֶת הַמִּטְבָּח אַחֲרֵי הָאֲרוּחָה.",
    en: "He cleaned the kitchen after the meal.",
  },
  נָקִי: {
    he: "הַחֶדֶר שֶׁלּוֹ תָּמִיד מְסֻדָּר וְנָקִי.",
    en: "His room is always tidy and clean.",
  },
  רָחַץ: {
    he: "הוּא רָחַץ אֶת הַיָּדַיִם לִפְנֵי הָאֹכֶל.",
    en: "He washed his hands before the meal.",
  },
  הִתְרַחֵץ: {
    he: "הוּא הִתְרַחֵץ בְּמַיִם קָרִים אַחֲרֵי הָרִיצָה.",
    en: "He showered in cold water after the run.",
  },
  דָּלַק: {
    he: "הָאוֹר דָּלַק בַּמִּרְפֶּסֶת כָּל הַלַּיְלָה.",
    en: "The light was on all night on the balcony.",
  },
  הִדְלִיק: {
    he: "הוּא הִדְלִיק נֵר לִכְבוֹד הַחַג.",
    en: "He lit a candle in honor of the holiday.",
  },
  כָּבָה: {
    he: "הָאוֹר כָּבָה פִּתְאוֹם בְּאֶמְצַע הַסֶּרֶט.",
    en: "The light went out suddenly in the middle of the movie.",
  },
  כִּבָּה: {
    he: "הוּא כִּבָּה אֶת הַטֵּלֵוִיזְיָה וְהָלַךְ לִישֹׁן.",
    en: "He turned off the television and went to sleep.",
  },
  שָׁכַן: {
    he: "הַמִּשְׂרָד שָׁכַן בַּבִּנְיָן הַזֶּה שָׁנִים רַבּוֹת.",
    en: "The office was located in this building for many years.",
  },
  שִׁכֵּן: {
    he: "הוּא שִׁכֵּן אֶת הָאוֹרְחִים בְּמָלוֹן קָרוֹב.",
    en: "He housed the guests in a nearby hotel.",
  },
  דּוֹר: {
    he: "כָּל דּוֹר מְדַבֵּר בְּשָׂפָה קְצָת אַחֶרֶת.",
    en: "Every generation speaks a slightly different language.",
  },
  דִּירָה: {
    he: "הֵם קָנוּ דִּירָה קְטַנָּה בְּמֶרְכַּז הָעִיר.",
    en: "They bought a small apartment in the city center.",
  },
  שָׁטַף: {
    he: "הוּא שָׁטַף אֶת הַכֵּלִים אַחֲרֵי הָאֲרוּחָה.",
    en: "He washed the dishes after the meal.",
  },
  שֶׁטֶף: {
    he: "הוּא מְדַבֵּר אַנְגְּלִית בְּשֶׁטֶף מֻשְׁלָם.",
    en: "He speaks English with perfect fluency.",
  },
  כִּבֵּס: {
    he: "הוּא כִּבֵּס אֶת הַחֻלְצוֹת בְּמַיִם קָרִים.",
    en: "He washed the shirts in cold water.",
  },
  כְּבִיסָה: {
    he: "יֵשׁ עֲרֵמַת כְּבִיסָה גְּדוֹלָה בַּחֶדֶר.",
    en: "There is a big pile of laundry in the room.",
  },
  צִחְצֵחַ: {
    he: "הוּא צִחְצֵחַ שִׁנַּיִם לִפְנֵי הַשֵּׁנָה.",
    en: "He brushed his teeth before bed.",
  },
  מְצֻחְצָח: {
    he: "הָאוּלָם הָיָה מְצֻחְצָח לִקְרַאת הָאֵרוּעַ.",
    en: "The hall was spotless for the event.",
  },
  // People
  נָתַן: { he: "הוּא נָתַן לִי עֵצָה טוֹבָה מְאוֹד.", en: "He gave me very good advice." },
  נִתָּן: {
    he: "לֹא נִתָּן לְהַחְזִיר אֶת הַכַּרְטִיס הַזֶּה.",
    en: "It is not possible to return this ticket.",
  },
  לָקַח: { he: "הוּא לָקַח אֶת הַמִּטְרִיָּה וְיָצָא.", en: "He took the umbrella and went out." },
  לֶקַח: {
    he: "הוּא לָמַד לֶקַח חָשׁוּב מֵהַטָּעוּת הַזֹּאת.",
    en: "He learned an important lesson from that mistake.",
  },
  קִבֵּל: {
    he: "הוּא קִבֵּל מִכְתָּב מֵהָאוּנִיבֶרְסִיטָה בַּדֹּאַר.",
    en: "He received a letter from the university in the mail.",
  },
  הִתְקַבֵּל: {
    he: "הוּא הִתְקַבֵּל לָעֲבוֹדָה אַחֲרֵי שָׁלוֹשׁ פְּגִישׁוֹת.",
    en: "He was accepted for the job after three interviews.",
  },
  עָזַר: { he: "הוּא עָזַר לִי לְהָזִיז אֶת הָאָרוֹן.", en: "He helped me move the closet." },
  נֶעֱזַר: {
    he: "הוּא נֶעֱזַר בַּמּוֹרֶה כְּדֵי לְהָבִין אֶת הַחֹמֶר.",
    en: "He got help from the teacher to understand the material.",
  },
  פָּגַשׁ: {
    he: "הוּא פָּגַשׁ חָבֵר יָשָׁן בָּרְחוֹב.",
    en: "He met an old friend in the street.",
  },
  נִפְגַּשׁ: {
    he: "הוּא נִפְגַּשׁ עִם הַמְּנַהֵל בַּבֹּקֶר.",
    en: "He met with the manager in the morning.",
  },
  חִבֵּר: {
    he: "הוּא חִבֵּר אֶת הַמַּדְפֶּסֶת לַמַּחְשֵׁב.",
    en: "He connected the printer to the computer.",
  },
  הִתְחַבֵּר: {
    he: "הוּא הִתְחַבֵּר לָרֶשֶׁת הָאַלְחוּטִית בְּבֵית הַקָּפֶה.",
    en: "He connected to the wifi at the coffee shop.",
  },
  שִׁתֵּף: {
    he: "הוּא שִׁתֵּף אוֹתִי בַּתָּכְנִיּוֹת שֶׁלּוֹ.",
    en: "He shared his plans with me.",
  },
  הִשְׁתַּתֵּף: {
    he: "הוּא הִשְׁתַּתֵּף בַּתַּחֲרוּת וְזָכָה בַּמָּקוֹם הָרִאשׁוֹן.",
    en: "He took part in the competition and won first place.",
  },
  יָלְדָה: {
    he: "הִיא יָלְדָה תְּאוֹמִים בְּבֵית הַחוֹלִים.",
    en: "She gave birth to twins at the hospital.",
  },
  נוֹלַד: {
    he: "הָאָח הַקָּטָן שֶׁלִּי נוֹלַד בַּקַּיִץ.",
    en: "My little brother was born in the summer.",
  },
  חַי: {
    he: "הַסַּבָּא שֶׁלִּי חַי בְּחֵיפָה שָׁנִים רַבּוֹת.",
    en: "My grandfather lived in Haifa for many years.",
  },
  הֶחֱיָה: {
    he: "הָרוֹפֵא הֶחֱיָה אֶת הַפָּצוּעַ בְּעֶזְרַת הַמַּכְשִׁיר.",
    en: "The doctor revived the injured man with the device.",
  },
  מֵת: {
    he: "הַכֶּלֶב הַזָּקֵן מֵת אַחֲרֵי מַחֲלָה אֲרֻכָּה.",
    en: "The old dog died after a long illness.",
  },
  הֵמִית: {
    he: "הַקֹּר הֵמִית אֶת כָּל הַצְּמָחִים בַּגִּנָּה.",
    en: "The cold killed all the plants in the garden.",
  },
  מִשְׁפָּחָה: {
    he: "כָּל הַמִשְׁפָּחָה נִפְגֶּשֶׁת אֵצֶל סַבְתָּא בְּשַׁבָּת.",
    en: "The whole family meets at Grandma's on Shabbat.",
  },
  מִשְׁפַּחְתִּי: {
    he: "בֵּית הַקָּפֶה הַזֶּה מְאוֹד מִשְׁפַּחְתִּי וְנָעִים.",
    en: "This coffee shop is very family-friendly and pleasant.",
  },
  אָב: { he: "הוּא הָיָה אָב לְשִׁשָּׁה יְלָדִים.", en: "He was a father of six children." },
  אַבָּא: { he: "אַבָּא שֶׁלִּי מְבַשֵּׁל אֲרוּחַת עֶרֶב.", en: "My dad is cooking dinner." },
  אֵם: {
    he: "הָאֵם שֶׁל הַתִּינוֹק חִכְּתָה בַּמִּרְפָּאָה.",
    en: "The baby's mother waited at the clinic.",
  },
  אִמָּא: { he: "אִמָּא שֶׁלִּי מְלַמֶּדֶת בְּבֵית סֵפֶר.", en: "My mom teaches at a school." },
  אָח: { he: "הָאָח הַגָּדוֹל שֶׁלִּי גָּר בַּצָּפוֹן.", en: "My big brother lives in the north." },
  אָחוֹת: {
    he: "הָאָחוֹת שֶׁלִּי לוֹמֶדֶת רְפוּאָה בָּעִיר.",
    en: "My sister studies medicine in the city.",
  },
  הִתְחַתֵּן: {
    he: "הוּא הִתְחַתֵּן בַּקַּיִץ שֶׁעָבַר בְּטֶקֶס קָטָן.",
    en: "He got married last summer in a small ceremony.",
  },
  חָתָן: {
    he: "הֶחָתָן הָיָה מְאֻשָּׁר מְאוֹד בַּמְּסִבָּה.",
    en: "The groom was very happy at the party.",
  },
  נָשָׂא: {
    he: "הוּא נָשָׂא אֶת הַתִּינוֹק עַל הַיָּדַיִם.",
    en: "He carried the baby in his arms.",
  },
  נָשׂוּי: {
    he: "הוּא נָשׂוּי כְּבָר עֶשְׂרִים שָׁנָה.",
    en: "He has been married for twenty years.",
  },
  דּוֹד: {
    he: "הַדּוֹד שֶׁלִּי מְבַקֵּר אוֹתָנוּ כָּל שַׁבָּת.",
    en: "My uncle visits us every Shabbat.",
  },
  דּוֹדָה: {
    he: "הַדּוֹדָה שֶׁלִּי אָפְתָה עוּגָה לַחַג.",
    en: "My aunt baked a cake for the holiday.",
  },
  גֵּרֵשׁ: {
    he: "הַשּׁוֹמֵר גֵּרֵשׁ אֶת הַיְּלָדִים מֵהֶחָצֵר.",
    en: "The guard chased the children out of the yard.",
  },
  הִתְגָּרֵשׁ: {
    he: "הוּא הִתְגָּרֵשׁ אַחֲרֵי חָמֵשׁ שְׁנוֹת נִשּׂוּאִים.",
    en: "He got divorced after five years of marriage.",
  },
  רָב: {
    he: "הוּא רָב עִם הָאָח שֶׁלּוֹ עַל הַשַּׁלָּט.",
    en: "He quarreled with his brother over the remote.",
  },
  רִיב: { he: "הָיָה לָהֶם רִיב קָטָן עַל הַכֶּסֶף.", en: "They had a small quarrel about money." },
  // Time
  הִזְמִין: {
    he: "הוּא הִזְמִין פִּיצָה לְכָל הַכִּתָּה.",
    en: "He ordered pizza for the whole class.",
  },
  זְמַן: { he: "אֵין לִי זְמַן לְהִתְקַשֵּׁר עַכְשָׁו.", en: "I do not have time to call now." },
  גָּמַר: {
    he: "הוּא גָּמַר אֶת כָּל הָעוּגָה לְבַד.",
    en: "He finished the whole cake by himself.",
  },
  נִגְמַר: {
    he: "הֶחָלָב נִגְמַר, צָרִיךְ לִקְנוֹת עוֹד.",
    en: "The milk ran out, we need to buy more.",
  },
  הִתְחִיל: {
    he: "הַסֶּרֶט הִתְחִיל לִפְנֵי עֶשֶׂר דַּקּוֹת.",
    en: "The movie started ten minutes ago.",
  },
  הַתְחָלָה: {
    he: "זֹאת הַתְחָלָה טוֹבָה לַשָּׁנָה הַחֲדָשָׁה.",
    en: "That is a good start to the new year.",
  },
  חִכָּה: {
    he: "הוּא חִכָּה לָאוֹטוֹבּוּס חֲצִי שָׁעָה.",
    en: "He waited for the bus for half an hour.",
  },
  חַכֵּה: { he: "חַכֵּה לִי רֶגַע, אֲנִי כְּבָר בָּא!", en: "Wait for me a second, I am coming!" },
  מִהֵר: {
    he: "הוּא מִהֵר לַתַּחֲנָה כְּדֵי לֹא לְאַחֵר.",
    en: "He hurried to the station so as not to be late.",
  },
  מַהֵר: {
    he: "בּוֹא מַהֵר, הַהַצָּגָה כְּבָר מַתְחִילָה!",
    en: "Come quickly, the show is already starting!",
  },
  אִחֵר: {
    he: "הוּא אִחֵר לַפְּגִישָׁה בְּעֶשְׂרִים דַּקּוֹת.",
    en: "He was twenty minutes late to the meeting.",
  },
  אַחֲרֵי: {
    he: "אֲנַחְנוּ הוֹלְכִים לַיָּם אַחֲרֵי הָעֲבוֹדָה.",
    en: "We are going to the beach after work.",
  },
  הִתְקַדֵּם: {
    he: "הוּא הִתְקַדֵּם מְאוֹד בָּעִבְרִית שֶׁלּוֹ.",
    en: "He made a lot of progress in his Hebrew.",
  },
  הִקְדִּים: {
    he: "הוּא הִקְדִּים לָבוֹא כְּדֵי לִתְפֹּס מָקוֹם.",
    en: "He came early in order to grab a seat.",
  },
  סִיֵּם: {
    he: "הוּא סִיֵּם אֶת הַתֹּאַר בְּהִצְטַיְּנוּת.",
    en: "He finished the degree with honors.",
  },
  הִסְתַּיֵּם: {
    he: "הַשִּׁעוּר הִסְתַּיֵּם מֻקְדָּם בִּגְלַל הַגֶּשֶׁם.",
    en: "The lesson ended early because of the rain.",
  },
  יוֹם: {
    he: "כָּל יוֹם אֲנִי שׁוֹתֶה קָפֶה בַּבֹּקֶר.",
    en: "Every day I drink coffee in the morning.",
  },
  הַיּוֹם: {
    he: "הַיּוֹם קַר בַּחוּץ, קְחִי מְעִיל.",
    en: "Today it is cold outside, take a coat.",
  },
  שָׁעָה: {
    he: "הַנְּסִיעָה לוֹקַחַת שָׁעָה וָחֵצִי בְּעֵרֶךְ.",
    en: "The trip takes about an hour and a half.",
  },
  שָׁעוֹן: { he: "יֵשׁ לוֹ שָׁעוֹן חָדָשׁ עַל הַיָּד.", en: "He has a new watch on his wrist." },
  שָׁבוּעַ: {
    he: "הַחֻפְשָׁה נִמְשְׁכָה שָׁבוּעַ אֶחָד בִּלְבַד.",
    en: "The vacation lasted only one week.",
  },
  שְׁבוּעִי: {
    he: "יֵשׁ לָנוּ שִׁעוּר שְׁבוּעִי בְּיוֹם שְׁלִישִׁי.",
    en: "We have a weekly lesson on Tuesday.",
  },
  בֹּקֶר: { he: "אֲנִי קָם כָּל בֹּקֶר בְּשֶׁבַע.", en: "I get up every morning at seven." },
  בַּבֹּקֶר: {
    he: "הוּא שׁוֹתֶה קָפֶה שָׁחֹר בַּבֹּקֶר.",
    en: "He drinks black coffee in the morning.",
  },
  עֶרֶב: { he: "אֲרוּחַת עֶרֶב מוּכָנָה בְּעוֹד רֶגַע.", en: "Dinner will be ready in a moment." },
  בָּעֶרֶב: {
    he: "אֲנַחְנוּ הוֹלְכִים לַקּוֹלְנוֹעַ בָּעֶרֶב עִם חֲבֵרִים.",
    en: "We are going to the movies in the evening with friends.",
  },
  רֶגַע: { he: "תֵּן לִי רֶגַע אֶחָד לַחְשֹׁב.", en: "Give me one moment to think." },
  רִגְעִי: {
    he: "זֶה הָיָה כְּאֵב רִגְעִי שֶׁעָבַר מַהֵר.",
    en: "It was a momentary pain that passed quickly.",
  },
  עִכֵּב: {
    he: "הַגֶּשֶׁם עִכֵּב אֶת הַטִּיסָה בְּשָׁעָה.",
    en: "The rain held the flight up by an hour.",
  },
  הִתְעַכֵּב: {
    he: "הוּא הִתְעַכֵּב בַּפְּקָקִים וְהִגִּיעַ מְאֻחָר.",
    en: "He was held up in traffic and arrived late.",
  },
  תָּמִיד: {
    he: "הוּא תָּמִיד שׁוֹכֵחַ אֶת הַמִּטְרִיָּה בָּאוֹטוֹבּוּס.",
    en: "He always forgets his umbrella on the bus.",
  },
  הִתְמִיד: {
    he: "הוּא הִתְמִיד בַּלִּמּוּדִים לַמְרוֹת הַקְּשָׁיִים.",
    en: "He persevered with his studies despite the difficulties.",
  },
  חָלַף: { he: "הַזְּמַן חָלַף מַהֵר בַּחֻפְשָׁה.", en: "Time passed quickly on the vacation." },
  הֶחְלִיף: {
    he: "הוּא הֶחְלִיף אֶת הַנַּעֲלַיִם הַיְשָׁנוֹת בַּחֲנוּת.",
    en: "He exchanged the old shoes at the store.",
  },
  // Feelings
  אָהַב: { he: "הוּא אָהַב אֶת הַסֵּפֶר הַזֶּה מְאוֹד.", en: "He loved this book very much." },
  הִתְאַהֵב: {
    he: "הוּא הִתְאַהֵב בָּהּ מֵהָרֶגַע הָרִאשׁוֹן.",
    en: "He fell in love with her from the first moment.",
  },
  שָׂמַח: {
    he: "הוּא שָׂמַח מְאוֹד לִשְׁמֹעַ אֶת הַחֲדָשׁוֹת.",
    en: "He was very glad to hear the news.",
  },
  שִׂמַּח: {
    he: "הַבִּקּוּר שֶׁלָּהּ שִׂמַּח אֶת סַבְתָּא מְאוֹד.",
    en: "Her visit made Grandma very happy.",
  },
  פָּחַד: {
    he: "הוּא פָּחַד לְהִשָּׁאֵר לְבַד בַּחֹשֶׁךְ.",
    en: "He was afraid to stay alone in the dark.",
  },
  הִפְחִיד: {
    he: "הָרַעַשׁ הַפִּתְאוֹמִי הִפְחִיד אֶת הַכֶּלֶב.",
    en: "The sudden noise frightened the dog.",
  },
  כָּעַס: {
    he: "הוּא כָּעַס עָלַי בִּגְלַל הָאִחוּר.",
    en: "He was angry at me because of the delay.",
  },
  הִכְעִיס: {
    he: "הוּא הִכְעִיס אֶת כָּל הַשְּׁכֵנִים בָּרַעַשׁ.",
    en: "He angered all the neighbors with the noise.",
  },
  דָּאַג: { he: "הוּא דָּאַג לָהּ כָּל הַלַּיְלָה.", en: "He worried about her all night." },
  הִדְאִיג: {
    he: "הַמַּצָּב בָּעֲבוֹדָה הִדְאִיג אוֹתִי מְאוֹד.",
    en: "The situation at work worried me a lot.",
  },
  בָּטַח: {
    he: "הוּא בָּטַח בַּחֲבֵרִים שֶׁלּוֹ בְּעֵינַיִם עֲצוּמוֹת.",
    en: "He trusted his friends blindly.",
  },
  הִבְטִיחַ: {
    he: "הוּא הִבְטִיחַ לַחְזֹר לִפְנֵי חֲצוֹת.",
    en: "He promised to come back before midnight.",
  },
  קִוָּה: {
    he: "הוּא קִוָּה שֶׁהַגֶּשֶׁם יַפְסִיק עַד הָעֶרֶב.",
    en: "He hoped the rain would stop by evening.",
  },
  תִּקְוָה: {
    he: "יֵשׁ עֲדַיִן תִּקְוָה לִמְצֹא אֶת הַכֶּלֶב.",
    en: "There is still hope of finding the dog.",
  },
  צָחַק: { he: "הוּא צָחַק מֵהַבְּדִיחָה שֶׁל אַבָּא.", en: "He laughed at Dad's joke." },
  הִצְחִיק: {
    he: "הַסֶּרֶט הִצְחִיק אֶת כָּל הָאוּלָם.",
    en: "The movie made the whole hall laugh.",
  },
  שָׂנֵא: {
    he: "הוּא שָׂנֵא לְחַכּוֹת בַּתּוֹר בַּבַּנְק.",
    en: "He hated waiting in line at the bank.",
  },
  שִׂנְאָה: {
    he: "אֵין מָקוֹם לְשִׂנְאָה בְּבֵית הַסֵּפֶר.",
    en: "There is no place for hatred at school.",
  },
  בָּכָה: {
    he: "הַתִּינוֹק בָּכָה כָּל הַלַּיְלָה בִּגְלַל הַשִּׁנַּיִם.",
    en: "The baby cried all night because of teething.",
  },
  בֶּכִי: {
    he: "שָׁמַעְנוּ בֶּכִי חָזָק מֵהַחֶדֶר הַסָּמוּךְ.",
    en: "We heard loud crying from the next room.",
  },
  הִרְגִּישׁ: {
    he: "הוּא הִרְגִּישׁ לֹא טוֹב אַחֲרֵי הָאֲרוּחָה.",
    en: "He felt unwell after the meal.",
  },
  הִתְרַגֵּשׁ: {
    he: "הוּא הִתְרַגֵּשׁ מְאוֹד לִפְנֵי הַטִּיסָה הָרִאשׁוֹנָה.",
    en: "He got very excited before his first flight.",
  },
  עָצוּב: {
    he: "הוּא נִרְאֶה עָצוּב מֵאָז שֶׁהַכֶּלֶב בָּרַח.",
    en: "He has looked sad since the dog ran away.",
  },
  עֶצֶב: {
    he: "הָיָה עֶצֶב גָּדוֹל בַּבַּיִת אַחֲרֵי הַפְּרֵדָה.",
    en: "There was great sorrow in the house after the parting.",
  },
  הִתְגַּעְגֵּעַ: {
    he: "הוּא הִתְגַּעְגֵּעַ לַמִּשְׁפָּחָה שֶׁלּוֹ בְּחוּץ לָאָרֶץ.",
    en: "He missed his family while abroad.",
  },
  גַּעְגּוּעִים: {
    he: "יֵשׁ לוֹ גַּעְגּוּעִים גְּדוֹלִים לַבַּיִת.",
    en: "He has a great longing for home.",
  },
  גֵּאֶה: { he: "אַבָּא גֵּאֶה מְאוֹד בַּבֵּן שֶׁלּוֹ.", en: "Dad is very proud of his son." },
  גַּאֲוָה: {
    he: "הוּא סִפֵּר עַל הַהֶשֵּׂגִים בְּגַּאֲוָה גְּדוֹלָה.",
    en: "He talked about the achievements with great pride.",
  },
  הִתְבַּיֵּשׁ: {
    he: "הוּא הִתְבַּיֵּשׁ לְדַבֵּר מוּל כָּל הַכִּתָּה.",
    en: "He was embarrassed to speak in front of the whole class.",
  },
  בִּיֵּשׁ: {
    he: "הוּא בִּיֵּשׁ אוֹתָהּ מוּל כָּל הָאוֹרְחִים.",
    en: "He shamed her in front of all the guests.",
  },
  קִנֵּא: { he: "הוּא קִנֵּא בָּאָח הַגָּדוֹל שֶׁלּוֹ.", en: "He envied his big brother." },
  קִנְאָה: {
    he: "הוּא הִסְתַּכֵּל עָלֶיהָ בְּקִנְאָה גְּלוּיָה.",
    en: "He looked at her with open envy.",
  },
  הִשְׁתַּעֲמֵם: {
    he: "הַיֶּלֶד הִשְׁתַּעֲמֵם בַּבַּיִת כָּל הַיּוֹם.",
    en: "The boy was bored at home all day.",
  },
  שִׁעֲמֵם: {
    he: "הַסֶּרֶט שִׁעֲמֵם אֶת כָּל הַצּוֹפִים.",
    en: "The movie bored all the viewers.",
  },
  רִחֵם: {
    he: "הוּא רִחֵם עַל הַכֶּלֶב הָרָעֵב בָּרְחוֹב.",
    en: "He took pity on the hungry dog in the street.",
  },
  רַחֲמִים: {
    he: "הַשּׁוֹפֵט לֹא גִּלָּה רַחֲמִים כְּלַפֵּי הַנֶּאֱשָׁם.",
    en: "The judge showed no mercy toward the defendant.",
  },
  הִתְאַכְזֵב: {
    he: "הוּא הִתְאַכְזֵב מֵהַתּוֹצָאוֹת שֶׁל הַמִּבְחָן.",
    en: "He was disappointed by the test results.",
  },
  אִכְזֵב: {
    he: "הוּא אִכְזֵב אוֹתִי כְּשֶׁלֹּא הִגִּיעַ לַפְּגִישָׁה.",
    en: "He let me down when he did not show up to the meeting.",
  },
  // Work
  עָשָׂה: {
    he: "הוּא עָשָׂה אֶת כָּל הַשִּׁעוּרִים לְבַד.",
    en: "He did all the homework by himself.",
  },
  נַעֲשָׂה: {
    he: "הַתִּקּוּן נַעֲשָׂה כְּבָר אֶתְמוֹל בַּבֹּקֶר.",
    en: "The repair was done yesterday morning.",
  },
  עָבַד: {
    he: "הוּא עָבַד בַּמִּסְעָדָה כָּל הַקַּיִץ.",
    en: "He worked at the restaurant all summer.",
  },
  עִבֵּד: {
    he: "הוּא עִבֵּד אֶת הַתְּמוּנוֹת לִפְנֵי הַהַדְפָּסָה.",
    en: "He edited the photos before printing.",
  },
  פָּעַל: {
    he: "הַמַּזְגָּן פָּעַל כָּל הַלַּיְלָה בְּלִי הַפְסָקָה.",
    en: "The air conditioner ran all night without stopping.",
  },
  הִפְעִיל: {
    he: "הוּא הִפְעִיל אֶת הַמְּכוֹנָה בִּלְחִיצַת כַּפְתּוֹר.",
    en: "He turned the machine on with the press of a button.",
  },
  שִׁלֵּם: {
    he: "הוּא שִׁלֵּם עַל הָאֹכֶל בְּכַרְטִיס אַשְׁרַאי.",
    en: "He paid for the food with a credit card.",
  },
  הִשְׁלִים: {
    he: "הוּא הִשְׁלִים אֶת הַקּוּרְס בְּתוֹךְ חֹדֶשׁ.",
    en: "He completed the course within a month.",
  },
  קָנָה: {
    he: "הוּא קָנָה לֶחֶם טָרִי בַּמַּאֲפִיָּה.",
    en: "He bought fresh bread at the bakery.",
  },
  הִקְנָה: {
    he: "בֵּית הַסֵּפֶר הִקְנָה לָהֶם הֶרְגֵּלִים טוֹבִים.",
    en: "The school instilled good habits in them.",
  },
  מָכַר: { he: "הוּא מָכַר אֶת הַמְּכוֹנִית הַיְשָׁנָה שֶׁלּוֹ.", en: "He sold his old car." },
  מְכִירָה: {
    he: "יֵשׁ מְכִירָה גְּדוֹלָה בַּחֲנוּת בְּסוֹף הָעוֹנָה.",
    en: "There is a big sale at the store at the end of the season.",
  },
  נִהֵל: {
    he: "הוּא נִהֵל אֶת הַמִּסְעָדָה עֶשֶׂר שָׁנִים.",
    en: "He ran the restaurant for ten years.",
  },
  הִתְנַהֵל: {
    he: "הַדִּיּוּן בַּוַּעֲדָה הִתְנַהֵל בְּשֶׁקֶט וּבְכָבוֹד.",
    en: "The committee discussion was conducted quietly and respectfully.",
  },
  צָרִיךְ: {
    he: "אֲנִי צָרִיךְ לָלֶכֶת לַדֹּאַר הַיּוֹם.",
    en: "I need to go to the post office today.",
  },
  הִצְטָרֵךְ: {
    he: "הוּא הִצְטָרֵךְ לַחֲזֹר הַבַּיְתָה בְּאֶמְצַע הַיּוֹם.",
    en: "He had to go back home in the middle of the day.",
  },
  שָׂכַר: {
    he: "הוּא שָׂכַר דִּירָה קְטַנָּה לְיַד הָאוּנִיבֶרְסִיטָה.",
    en: "He rented a small apartment near the university.",
  },
  הִשְׂכִּיר: {
    he: "הוּא הִשְׂכִּיר אֶת הַבַּיִת לְמִשְׁפָּחָה צְעִירָה.",
    en: "He rented the house out to a young family.",
  },
  הִצְלִיחַ: {
    he: "הוּא הִצְלִיחַ בַּמִּבְחָן לַמְרוֹת הַלַּחַץ.",
    en: "He succeeded on the test despite the pressure.",
  },
  הַצְלָחָה: {
    he: "הַמְּסִבָּה הָיְתָה הַצְלָחָה גְּדוֹלָה מְאוֹד.",
    en: "The party was a very big success.",
  },
  נִכְשַׁל: {
    he: "הוּא נִכְשַׁל בַּמִּבְחָן וְנִרְשַׁם שׁוּב.",
    en: "He failed the test and signed up again.",
  },
  הִכְשִׁיל: {
    he: "הוּא הִכְשִׁיל אֶת הַתָּכְנִית שֶׁל הַקְּבוּצָה.",
    en: "He sabotaged the group's plan.",
  },
  נִצֵּחַ: {
    he: "הוּא נִצֵּחַ בַּתַּחֲרוּת בְּלִי מַאֲמָץ.",
    en: "He won the competition effortlessly.",
  },
  נִצָּחוֹן: {
    he: "זֶה הָיָה נִצָּחוֹן חָשׁוּב לַקְּבוּצָה.",
    en: "That was an important victory for the team.",
  },
  הִרְוִיחַ: {
    he: "הוּא הִרְוִיחַ יָפֶה בָּעֲבוֹדָה הַחֲדָשָׁה.",
    en: "He earned well at the new job.",
  },
  רֶוַח: {
    he: "הַחֲנוּת סָגְרָה אֶת הַשָּׁנָה בְּרֶוַח נָאֶה.",
    en: "The store ended the year with a nice profit.",
  },
  חָסַךְ: {
    he: "הוּא חָסַךְ כֶּסֶף לְטִיּוּל גָּדוֹל בְּחוּץ לָאָרֶץ.",
    en: "He saved money for a big trip abroad.",
  },
  חִסָּכוֹן: {
    he: "יֵשׁ לוֹ חִסָּכוֹן קָטָן בַּבַּנְק.",
    en: "He has a small savings account at the bank.",
  },
  הִפְסִיד: {
    he: "הוּא הִפְסִיד בַּמִּשְׂחָק בַּדַּקָּה הָאַחֲרוֹנָה.",
    en: "He lost the game in the last minute.",
  },
  הֶפְסֵד: {
    he: "זֶה הָיָה הֶפְסֵד כָּבֵד לַחֶבְרָה.",
    en: "That was a heavy loss for the company.",
  },
  // Food
  אָכַל: { he: "הוּא אָכַל אֲרוּחַת בֹּקֶר גְּדוֹלָה.", en: "He ate a big breakfast." },
  הֶאֱכִיל: {
    he: "הוּא הֶאֱכִיל אֶת הַיְּלָדִים לִפְנֵי הַגַּן.",
    en: "He fed the children before preschool.",
  },
  שָׁתָה: { he: "הוּא שָׁתָה כּוֹס מַיִם קָרִים.", en: "He drank a glass of cold water." },
  שְׁתִיָּה: {
    he: "הֵבֵאתִי אֹכֶל וּשְׁתִיָּה קָרָה לַפִּיקְנִיק.",
    en: "I brought food and a cold drink to the picnic.",
  },
  יָשַׁן: {
    he: "הוּא יָשַׁן שְׁמוֹנֶה שָׁעוֹת בַּלַּיְלָה.",
    en: "He slept eight hours at night.",
  },
  שֵׁנָה: {
    he: "חָסְרָה לוֹ שֵׁנָה אַחֲרֵי הַטִּיסָה הָאֲרֻכָּה.",
    en: "He was short on sleep after the long flight.",
  },
  חָלָה: {
    he: "הוּא חָלָה בְּשַׁפַּעַת וְנִשְׁאַר בַּבַּיִת.",
    en: "He came down with the flu and stayed home.",
  },
  חוֹלֶה: {
    he: "הוּא הִרְגִּישׁ חוֹלֶה וְלֹא הִגִּיעַ לָעֲבוֹדָה.",
    en: "He felt sick and did not come to work.",
  },
  רִפֵּא: {
    he: "הוּא רִפֵּא אֶת הַכֶּלֶב הַפָּצוּעַ בְּעַצְמוֹ.",
    en: "He healed the injured dog himself.",
  },
  הִתְרַפֵּא: {
    he: "הוּא הִתְרַפֵּא לְגַמְרֵי אַחֲרֵי חֹדֶשׁ בַּבַּיִת.",
    en: "He fully recovered after a month at home.",
  },
  הִבְרִיא: {
    he: "הוּא הִבְרִיא מַהֵר אַחֲרֵי הַנִּתּוּחַ.",
    en: "He got better quickly after the surgery.",
  },
  בָּרִיא: {
    he: "הַתִּינוֹק נוֹלַד בָּרִיא וְחָזָק בְּבֵית הַחוֹלִים.",
    en: "The baby was born healthy and strong at the hospital.",
  },
  נָשַׁם: {
    he: "הוּא נָשַׁם עָמֹק וְנִרְגַּע לִפְנֵי הַהוֹפָעָה.",
    en: "He breathed deeply and calmed down before the show.",
  },
  נְשִׁימָה: {
    he: "הוּא לָקַח נְשִׁימָה עֲמֻקָּה לִפְנֵי הַצְּלִילָה.",
    en: "He took a deep breath before the dive.",
  },
  פָּצַע: { he: "הַסַּכִּין פָּצַע אֶת הָאֶצְבַּע שֶׁלּוֹ.", en: "The knife cut his finger." },
  נִפְצַע: {
    he: "הוּא נִפְצַע בָּרֶגֶל בְּמִשְׂחַק הַכַּדּוּרֶגֶל.",
    en: "He was injured in the leg in the soccer game.",
  },
  הִשְׁתַּכֵּר: {
    he: "הוּא הִשְׁתַּכֵּר בַּמְּסִבָּה וְלֹא זָכַר כְּלוּם.",
    en: "He got drunk at the party and did not remember a thing.",
  },
  שִׁכּוֹר: {
    he: "הוּא הָיָה שִׁכּוֹר לְגַמְרֵי אַחֲרֵי הַחֲתֻנָּה.",
    en: "He was completely drunk after the wedding.",
  },
  טָעַם: {
    he: "הוּא טָעַם אֶת הַמָּרָק וְהוֹסִיף מֶלַח.",
    en: "He tasted the soup and added salt.",
  },
  הִטְעִים: {
    he: "הַמַּרְצֶה הִטְעִים אֶת הַנְּקֻדָּה הַחֲשׁוּבָה בְּיוֹתֵר.",
    en: "The lecturer emphasized the most important point.",
  },
  אָפָה: {
    he: "הוּא אָפָה עוּגַת שׁוֹקוֹלָד לְיוֹם הַהֻלֶּדֶת.",
    en: "He baked a chocolate cake for the birthday.",
  },
  נֶאֱפָה: {
    he: "הַלֶּחֶם נֶאֱפָה הַבֹּקֶר בַּתַּנּוּר.",
    en: "The bread was baked this morning in the oven.",
  },
  רָעֵב: {
    he: "הַיֶּלֶד חָזַר רָעֵב מְאוֹד מִבֵּית הַסֵּפֶר.",
    en: "The boy came home very hungry from school.",
  },
  רָעָב: {
    he: "הָיָה רָעָב כָּבֵד בָּאֵזוֹר אַחֲרֵי הַבַּצֹּרֶת.",
    en: "There was a severe famine in the region after the drought.",
  },
  צָמֵא: {
    he: "אֲנִי צָמֵא, אֶפְשָׁר כּוֹס מַיִם?",
    en: "I am thirsty, could I have a glass of water?",
  },
  צָמָא: {
    he: "הַחֹם הַכָּבֵד גָּרַם לְצָמָא נוֹרָא.",
    en: "The heavy heat caused terrible thirst.",
  },
  מָתוֹק: { he: "הַתֵּה הַזֶּה מָתוֹק מִדַּי בִּשְׁבִילִי.", en: "This tea is too sweet for me." },
  מַמְתָּק: {
    he: "הוּא קִבֵּל מַמְתָּק קָטָן אַחֲרֵי הַחִסּוּן.",
    en: "He got a small candy after the shot.",
  },
  מֶלַח: {
    he: "שַׂמְתִּי קְצָת מֶלַח וּפִלְפֵּל בַּסָּלָט.",
    en: "I put a little salt and pepper in the salad.",
  },
  מָלוּחַ: {
    he: "הַמָּרָק יָצָא מָלוּחַ מִדַּי הַפַּעַם.",
    en: "The soup came out too salty this time.",
  },
  שֶׁמֶן: {
    he: "יָצַקְתִּי קְצָת שֶׁמֶן זַיִת עַל הַסָּלָט.",
    en: "I poured a little olive oil on the salad.",
  },
  שָׁמֵן: {
    he: "הַכֶּלֶב שֶׁלָּהֶם קְצָת שָׁמֵן וְעָצֵל.",
    en: "Their dog is a bit fat and lazy.",
  },
  בֶּטֶן: {
    he: "כּוֹאֶבֶת לוֹ הַבֶּטֶן מֵאָז הַבֹּקֶר.",
    en: "His stomach has hurt since this morning.",
  },
  "כְּאֵב בֶּטֶן": {
    he: "יֵשׁ לוֹ כְּאֵב בֶּטֶן מֵהָאֹכֶל הֶחָרִיף.",
    en: "He has a stomach ache from the spicy food.",
  },
  בָּלַע: { he: "הוּא בָּלַע אֶת הַכַּדּוּר עִם מַיִם.", en: "He swallowed the pill with water." },
  נִבְלַע: {
    he: "הַמַּטְבֵּעַ נִבְלַע בֵּין כָּרִיּוֹת הַסַּפָּה.",
    en: "The coin got swallowed up between the sofa cushions.",
  },
};
