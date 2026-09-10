import type { Sentence } from "../../types";

/** Example sentences — technology, education, military, city, commerce, animals, science, sport. */
export const S_C: Readonly<Record<string, Sentence>> = {
  // technology & media
  חַשְׁמַל: {
    he: "אֵין חַשְׁמַל בַּבַּיִת מֵאָז הַסְּעָרָה.",
    en: "There is no electricity in the house since the storm.",
  },
  חַשְׁמַלִּי: {
    he: "קָנִינוּ קֻמְקוּם חַשְׁמַלִּי חָדָשׁ לַמִּטְבָּח.",
    en: "We bought a new electric kettle for the kitchen.",
  },
  שִׁדֵּר: {
    he: "הָעָרוּץ שִׁדֵּר אֶת הַמִּשְׂחָק בְּשַׁבָּת בָּעֶרֶב.",
    en: "The channel broadcast the game on Saturday evening.",
  },
  שִׁדּוּר: {
    he: "יֵשׁ שִׁדּוּר חַי מִן הָאִצְטַדְיוֹן עַכְשָׁו.",
    en: "There is a live broadcast from the stadium now.",
  },
  הִדְפִּיס: {
    he: "הוּא הִדְפִּיס אֶת הַכַּרְטִיס לִפְנֵי הַטִּיסָה.",
    en: "He printed the ticket before the flight.",
  },
  מַדְפֶּסֶת: {
    he: "מַדְפֶּסֶת חֲדָשָׁה עוֹמֶדֶת עַל הַשֻּׁלְחָן בַּמִּשְׂרָד.",
    en: "A new printer stands on the desk in the office.",
  },
  תֹּכֶן: {
    he: "תֹּכֶן הַמַּאֲמָר לֹא הִתְאִים לִילָדִים.",
    en: "The content of the article was not suitable for children.",
  },
  תָּכְנִית: {
    he: "יֵשׁ תָּכְנִית חֲדָשָׁה בַּטֶּלֶוִיזְיָה הָעֶרֶב.",
    en: "There is a new program on television tonight.",
  },
  תִּכְנֵת: {
    he: "אָחִי תִּכְנֵת מִשְׂחָק קָטָן בַּמַּחְשֵׁב.",
    en: "My brother coded a small game on the computer.",
  },
  תִּכְנוּת: {
    he: "לָמַדְתִּי תִּכְנוּת בְּקוּרְס מְקֻוָּן.",
    en: "I studied programming in an online course.",
  },
  טִלְפֵּן: {
    he: "הוּא טִלְפֵּן לְאִמָּא שֶׁלּוֹ מִן הָעֲבוֹדָה.",
    en: "He phoned his mother from work.",
  },
  טֶלֶפוֹן: {
    he: "יֵשׁ לִי טֶלֶפוֹן חָדָשׁ עִם מַצְלֵמָה טוֹבָה.",
    en: "I have a new phone with a good camera.",
  },
  הִצִּיג: {
    he: "הַמְּנַהֵל הִצִּיג אֶת הָרַעְיוֹן בַּיְשִׁיבָה.",
    en: "The manager presented the idea at the meeting.",
  },
  צָג: { he: "צָג הַמַּחְשֵׁב שֶׁלִּי גָּדוֹל מְאוֹד.", en: "My computer monitor is very big." },
  גָּלַשׁ: {
    he: "הוּא גָּלַשׁ בָּאִינְטֶרְנֶט כָּל הָעֶרֶב.",
    en: "He browsed the internet all evening.",
  },
  גְּלִישָׁה: {
    he: "אֲנִי אוֹהֵב גְּלִישָׁה עַל גַּלִּים בַּקַּיִץ.",
    en: "I love surfing waves in the summer.",
  },
  זָרַם: {
    he: "הַנַּחַל זָרַם בְּחָזְקָה אַחֲרֵי הַגֶּשֶׁם.",
    en: "The stream flowed strongly after the rain.",
  },
  זֶרֶם: { he: "זֶרֶם חָזָק סָחַף אֶת הַסִּירָה.", en: "A strong current swept the boat away." },
  לָחַץ: {
    he: "הוּא לָחַץ עַל הַכַּפְתּוֹר וְהַדֶּלֶת נִפְתְּחָה.",
    en: "He pressed the button and the door opened.",
  },
  לַחַץ: {
    he: "יֵשׁ עָלַי הַרְבֵּה לַחַץ לִפְנֵי הַבְּחִינָה.",
    en: "I am under a lot of pressure before the exam.",
  },
  הִקִּישׁ: {
    he: "הוּא הִקִּישׁ אֶת הַסִּיסְמָה וְנִכְנַס לַחֶשְׁבּוֹן.",
    en: "He keyed in the password and got into the account.",
  },
  מַקֶּשֶׁת: {
    he: "מַקֶּשֶׁת חֲדָשָׁה עוֹלָה מֵאָה שְׁקָלִים.",
    en: "A new keyboard costs a hundred shekels.",
  },
  מְכוֹנָה: {
    he: "מְכוֹנָה גְּדוֹלָה מְמַלֵּאת אֶת הַבַּקְבּוּקִים.",
    en: "A big machine fills the bottles.",
  },
  מְכוֹנִית: {
    he: "מְכוֹנִית אֲדֻמָּה חוֹנָה מוּל הַבַּיִת.",
    en: "A red car is parked opposite the house.",
  },
  מָצָא: {
    he: "הוּא מָצָא אֶת הַמַּפְתְּחוֹת מִתַּחַת לַסַּפָּה.",
    en: "He found the keys under the sofa.",
  },
  הִמְצִיא: { he: "מִי הִמְצִיא אֶת הַגַּלְגַּל?", en: "Who invented the wheel?" },
  סֶרֶט: {
    he: "רָאִינוּ סֶרֶט מַצְחִיק בַּקּוֹלְנוֹעַ אֶתְמוֹל.",
    en: "We saw a funny movie at the cinema yesterday.",
  },
  סִרְטוֹן: {
    he: "הִיא הֶעֶלְתָה סִרְטוֹן קָצָר לָרֶשֶׁת.",
    en: "She uploaded a short video clip to the net.",
  },
  שִׁדְרֵג: {
    he: "הוּא שִׁדְרֵג אֶת הַמַּחְשֵׁב לִפְנֵי הַלִּמּוּדִים.",
    en: "He upgraded the computer before his studies.",
  },
  שִׁדְרוּג: {
    he: "שִׁדְרוּג הַמִּטְבָּח עָלָה לָנוּ הַרְבֵּה כֶּסֶף.",
    en: "The kitchen upgrade cost us a lot of money.",
  },
  אִחְסֵן: {
    he: "הוּא אִחְסֵן אֶת הַתְּמוּנוֹת בֶּעָנָן.",
    en: "He stored the photos in the cloud.",
  },
  אִחְסוּן: {
    he: "אֵין לָנוּ מַסְפִּיק אִחְסוּן בַּמַּחְשֵׁב.",
    en: "We do not have enough storage on the computer.",
  },
  פִּרְסֵם: {
    he: "הָעִתּוֹן פִּרְסֵם אֶת הַכַּתָּבָה הַבֹּקֶר.",
    en: "The newspaper published the article this morning.",
  },
  פִּרְסוּם: {
    he: "יֵשׁ פִּרְסוּם גָּדוֹל לַסֶּרֶט הֶחָדָשׁ.",
    en: "There is big advertising for the new film.",
  },
  תִּקְשֹׁרֶת: {
    he: "תִּקְשֹׁרֶת טוֹבָה חֲשׁוּבָה בְּכָל מִשְׁפָּחָה.",
    en: "Good communication is important in every family.",
  },
  תִּקְשֵׁר: {
    he: "הוּא תִּקְשֵׁר עִם הַצֶּוֶת דֶּרֶךְ הָרַדְיוֹ.",
    en: "He communicated with the team over the radio.",
  },
  הֶעֱתִיק: {
    he: "הַתַּלְמִיד הֶעֱתִיק אֶת הַתְּשׁוּבוֹת מֵחָבֵר.",
    en: "The pupil copied the answers from a friend.",
  },
  עֹתֶק: { he: "שָׁלַחְתִּי לָךְ עֹתֶק שֶׁל הַחוֹזֶה.", en: "I sent you a copy of the contract." },
  מָחַק: { he: "הוּא מָחַק אֶת הַהוֹדָעָה בְּטָעוּת.", en: "He deleted the message by mistake." },
  נִמְחַק: {
    he: "הַקֹּבֶץ נִמְחַק וְלֹא הִצְלַחְנוּ לְשַׁחְזֵר אוֹתוֹ.",
    en: "The file was deleted and we could not restore it.",
  },
  עִדְכֵּן: {
    he: "הוּא עִדְכֵּן אוֹתִי עַל הַשִּׁנּוּיִים בַּלּוּחַ.",
    en: "He updated me on the changes in the schedule.",
  },
  עִדְכּוּן: {
    he: "יָצָא עִדְכּוּן חָדָשׁ לָאַפְלִיקַצְיָה.",
    en: "A new update came out for the app.",
  },

  // education & thought
  חִנֵּךְ: {
    he: "הוּא חִנֵּךְ אֶת יְלָדָיו לְכַבֵּד אֲחֵרִים.",
    en: "He raised his children to respect others.",
  },
  חִנּוּךְ: {
    he: "הִיא לוֹמֶדֶת חִנּוּךְ בָּאוּנִיבֶרְסִיטָה.",
    en: "She studies education at the university.",
  },
  בָּחַן: {
    he: "הַמּוֹרֶה בָּחַן אֶת הַכִּתָּה בְּדִקְדּוּק.",
    en: "The teacher tested the class on grammar.",
  },
  מִבְחָן: {
    he: "יֵשׁ לָנוּ מִבְחָן בְּמָתֵמָטִיקָה בְּיוֹם רִאשׁוֹן.",
    en: "We have a math exam on Sunday.",
  },
  תִּרְגֵּל: {
    he: "הוּא תִּרְגֵּל פְּסַנְתֵּר שָׁעָה כָּל יוֹם.",
    en: "He practised piano an hour every day.",
  },
  תַּרְגִּיל: {
    he: "הַמּוֹרָה נָתְנָה תַּרְגִּיל קָשֶׁה לְשִׁעוּרֵי בַּיִת.",
    en: "The teacher gave a hard exercise for homework.",
  },
  שִׁנֵּן: {
    he: "הוּא שִׁנֵּן אֶת כָּל הַתַּאֲרִיכִים לִפְנֵי הַמִּבְחָן.",
    en: "He memorised all the dates before the exam.",
  },
  שִׁנּוּן: {
    he: "יֵשׁ בַּכִּתָּה יוֹתֵר מִדַּי שִׁנּוּן וּפָחוֹת הֲבָנָה.",
    en: "There is too much rote learning and less understanding in class.",
  },
  חָקַר: {
    he: "הַמַּדְעָן חָקַר אֶת הַתּוֹפָעָה בְּמֶשֶׁךְ שָׁנִים.",
    en: "The scientist researched the phenomenon for years.",
  },
  מֶחְקָר: {
    he: "הִיא פִּרְסְמָה מֶחְקָר חָדָשׁ עַל הַשֵּׁנָה.",
    en: "She published a new study about sleep.",
  },
  פָּתַר: {
    he: "הוּא פָּתַר אֶת הַחִידָה תּוֹךְ דַּקָּה.",
    en: "He solved the riddle within a minute.",
  },
  פִּתְרוֹן: {
    he: "מָצָאנוּ פִּתְרוֹן פָּשׁוּט לַבְּעָיָה.",
    en: "We found a simple solution to the problem.",
  },
  חָכָם: {
    he: "סַבָּא שֶׁלִּי אִישׁ חָכָם וְשָׁקֵט.",
    en: "My grandfather is a wise and quiet man.",
  },
  חָכְמָה: {
    he: "צְרִיכָה חָכְמָה רַבָּה כְּדֵי לְנַהֵל מִשְׁפָּחָה.",
    en: "It takes great wisdom to run a family.",
  },
  שֵׂכֶל: {
    he: "יֵשׁ לוֹ שֵׂכֶל אֲבָל אֵין לוֹ סַבְלָנוּת.",
    en: "He has brains but no patience.",
  },
  הִשְׂכִּיל: {
    he: "הוּא הִשְׂכִּיל לִשְׁתֹּק בָּרֶגַע הַנָּכוֹן.",
    en: "He had the sense to keep quiet at the right moment.",
  },
  יָעַץ: {
    he: "הָרוֹפֵא יָעַץ לִי לָנוּחַ שָׁבוּעַ.",
    en: "The doctor advised me to rest a week.",
  },
  יוֹעֵץ: {
    he: "הַחֶבְרָה שָׂכְרָה יוֹעֵץ חָדָשׁ לְעִנְיְנֵי כְּסָפִים.",
    en: "The company hired a new adviser for financial matters.",
  },
  רָשַׁם: {
    he: "הוּא רָשַׁם אֶת הַכְּתֹבֶת עַל פֶּתֶק.",
    en: "He wrote the address down on a note.",
  },
  נִרְשַׁם: {
    he: "הוּא נִרְשַׁם לַקּוּרְס בָּרֶגַע הָאַחֲרוֹן.",
    en: "He registered for the course at the last moment.",
  },
  דַּרְגָּה: {
    he: "הוּא עָלָה דַּרְגָּה אַחֲרֵי חָמֵשׁ שָׁנִים.",
    en: "He went up a rank after five years.",
  },
  דֵּרֵג: {
    he: "הַשּׁוֹפֵט דֵּרֵג אֶת הַמִּתְחָרִים לְפִי הַזְּמַן.",
    en: "The judge ranked the contestants by time.",
  },
  צִיּוּן: {
    he: "קִבַּלְתִּי צִיּוּן טוֹב בַּבְּחִינָה בְּהִיסְטוֹרְיָה.",
    en: "I got a good mark on the history exam.",
  },
  צִיֵּן: {
    he: "הַמּוֹרֶה צִיֵּן שֶׁהָעֲבוֹדָה שֶׁלִּי מְעֻלָּה.",
    en: "The teacher noted that my work is excellent.",
  },
  הִקְשִׁיב: {
    he: "הוּא הִקְשִׁיב לַהוֹרִים שֶׁלּוֹ בְּשֶׁקֶט.",
    en: "He listened to his parents quietly.",
  },
  קֶשֶׁב: {
    he: "לַיֶּלֶד יֵשׁ בְּעָיוֹת קֶשֶׁב בַּכִּתָּה.",
    en: "The child has attention problems in class.",
  },
  כִּשָּׁרוֹן: {
    he: "יֵשׁ לָהּ כִּשָּׁרוֹן נָדִיר לְצִיּוּר.",
    en: "She has a rare talent for drawing.",
  },
  מֻכְשָׁר: {
    he: "הוּא זַמָּר מֻכְשָׁר מְאוֹד לְגִילוֹ.",
    en: "He is a very talented singer for his age.",
  },
  מִקְצוֹעַ: {
    he: "רְפוּאָה הִיא מִקְצוֹעַ קָשֶׁה וְחָשׁוּב.",
    en: "Medicine is a hard and important profession.",
  },
  מִקְצוֹעִי: {
    he: "הוּא צַלָּם מִקְצוֹעִי כְּבָר עֶשֶׂר שָׁנִים.",
    en: "He has been a professional photographer for ten years.",
  },
  דִּיֵּק: {
    he: "הוּא דִּיֵּק בְּכָל מִלָּה שֶׁאָמַר.",
    en: "He was precise in every word he said.",
  },
  מְדֻיָּק: {
    he: "צָרִיךְ תַּרְגּוּם מְדֻיָּק שֶׁל הַמִּסְמָךְ.",
    en: "We need an accurate translation of the document.",
  },
  בִּטֵּא: {
    he: "הוּא בִּטֵּא אֶת דַּעְתּוֹ בְּלִי פַּחַד.",
    en: "He expressed his opinion without fear.",
  },
  בִּטּוּי: {
    he: "זֶה בִּטּוּי נָפוֹץ בְּעִבְרִית מְדֻבֶּרֶת.",
    en: "That is a common expression in spoken Hebrew.",
  },
  נָאַם: {
    he: "רֹאשׁ הָעִיר נָאַם לִפְנֵי כָּל הַתּוֹשָׁבִים.",
    en: "The mayor gave a speech before all the residents.",
  },
  נְאוּם: {
    he: "שָׁמַעְנוּ נְאוּם אָרֹךְ וּמְשַׁעֲמֵם בַּטֶּקֶס.",
    en: "We heard a long, boring speech at the ceremony.",
  },
  טָעַן: {
    he: "הוּא טָעַן שֶׁלֹּא רָאָה אֶת הַשֶּׁלֶט.",
    en: "He claimed that he did not see the sign.",
  },
  טַעֲנָה: {
    he: "יֵשׁ לִי טַעֲנָה אַחַת נֶגֶד הַהַחְלָטָה.",
    en: "I have one complaint against the decision.",
  },
  הוֹכִיחַ: { he: "הוּא הוֹכִיחַ שֶׁהוּא צוֹדֵק.", en: "He proved that he was right." },
  הוֹכָחָה: {
    he: "אֵין שׁוּם הוֹכָחָה שֶׁהוּא הָיָה שָׁם.",
    en: "There is no proof that he was there.",
  },
  בָּגַר: { he: "הוּא בָּגַר מְאוֹד מֵאָז הַצָּבָא.", en: "He matured a lot since the army." },
  בּוֹגֵר: {
    he: "אָחִי בּוֹגֵר טֶכְנִיּוֹן וְעוֹבֵד בְּחֵיפָה.",
    en: "My brother is a Technion graduate and works in Haifa.",
  },

  // army & security
  חַיָּל: {
    he: "אָחִי חַיָּל בְּבָסִיס לְיַד בְּאֵר שֶׁבַע.",
    en: "My brother is a soldier at a base near Beersheba.",
  },
  חַיֶּלֶת: {
    he: "חַיֶּלֶת צְעִירָה עָמְדָה בַּתַּחֲנָה עִם תִּיק גָּדוֹל.",
    en: "A young female soldier stood at the station with a big bag.",
  },
  הִתְגַּיֵּס: {
    he: "הוּא הִתְגַּיֵּס לַצָּבָא בְּגִיל שְׁמוֹנֶה עֶשְׂרֵה.",
    en: "He enlisted in the army at eighteen.",
  },
  גִּיֵּס: {
    he: "הָאִרְגּוּן גִּיֵּס מִתְנַדְּבִים רַבִּים לַחֹרֶף.",
    en: "The organization recruited many volunteers for the winter.",
  },
  יָרָה: {
    he: "הַשּׁוֹטֵר יָרָה בָּאֲוִיר כְּדֵי לְהַזְהִיר.",
    en: "The policeman fired into the air to warn.",
  },
  יְרִיָּה: {
    he: "שָׁמַעְנוּ יְרִיָּה אַחַת מִכִּוּוּן הַיַּעַר.",
    en: "We heard one gunshot from the direction of the forest.",
  },
  חִמֵּשׁ: {
    he: "הַצָּבָא חִמֵּשׁ אֶת הַכּוֹחוֹת בַּגְּבוּל.",
    en: "The army armed the forces at the border.",
  },
  הִתְחַמֵּשׁ: {
    he: "הָאוֹיֵב הִתְחַמֵּשׁ בְּנֶשֶׁק חָדָשׁ.",
    en: "The enemy armed itself with new weapons.",
  },
  הֵגֵן: {
    he: "הַכֶּלֶב הֵגֵן עַל הַבַּיִת כָּל הַלַּיְלָה.",
    en: "The dog protected the house all night.",
  },
  הֲגָנָה: {
    he: "אֵין לָהֶם הֲגָנָה טוֹבָה מִפְּנֵי הַגֶּשֶׁם.",
    en: "They have no good protection from the rain.",
  },
  תָּקַף: {
    he: "הַכֶּלֶב תָּקַף אֶת הַדַּוָּר בַּבֹּקֶר.",
    en: "The dog attacked the postman in the morning.",
  },
  הַתְקָפָה: {
    he: "הָיְתָה הַתְקָפָה פִּתְאוֹמִית עַל הַכְּפָר.",
    en: "There was a sudden attack on the village.",
  },
  אוֹיֵב: { he: "הוּא לֹא אוֹיֵב שֶׁלִּי אֶלָּא יָדִיד.", en: "He is not my enemy but a friend." },
  אוֹיֶבֶת: {
    he: "הִיא הָיְתָה אוֹיֶבֶת מָרָה שֶׁל הַמַּלְכָּה.",
    en: "She was a bitter enemy of the queen.",
  },
  שֵׁרֵת: {
    he: "הוּא שֵׁרֵת שָׁלוֹשׁ שָׁנִים בַּצָּפוֹן.",
    en: "He served three years in the north.",
  },
  שֵׁרוּת: {
    he: "יֵשׁ שֵׁרוּת טוֹב מְאוֹד בַּמִּסְעָדָה הַזֹּאת.",
    en: "There is very good service at this restaurant.",
  },
  כָּבַשׁ: {
    he: "הַצָּבָא כָּבַשׁ אֶת הָעִיר תּוֹךְ יוֹמַיִם.",
    en: "The army conquered the city within two days.",
  },
  כִּבּוּשׁ: {
    he: "כִּבּוּשׁ הַפִּסְגָּה לָקַח לָהֶם שְׁמוֹנֶה שָׁעוֹת.",
    en: "Conquering the summit took them eight hours.",
  },
  נָסוֹג: {
    he: "הַכּוֹחַ נָסוֹג אַחֲרֵי שָׁעָה שֶׁל קְרָב.",
    en: "The force retreated after an hour of battle.",
  },
  נְסִיגָה: {
    he: "הַצָּבָא הוֹדִיעַ עַל נְסִיגָה מְלֵאָה.",
    en: "The army announced a full withdrawal.",
  },
  קָצִין: {
    he: "קָצִין צָעִיר הִסְבִּיר לָנוּ אֶת הַכְּלָלִים.",
    en: "A young officer explained the rules to us.",
  },
  קְצִינָה: {
    he: "הִיא קְצִינָה בְּחֵיל הַיָּם כְּבָר שָׁנָה.",
    en: "She has been an officer in the navy for a year.",
  },
  רִגֵּל: {
    he: "הוּא רִגֵּל אַחֲרֵי הַשְּׁכֵנִים מִן הַגַּג.",
    en: "He spied on the neighbours from the roof.",
  },
  מְרַגֵּל: {
    he: "בַּסֶּרֶט הָיָה מְרַגֵּל שֶׁעָבַד לִשְׁנֵי צְדָדִים.",
    en: "In the film there was a spy who worked for two sides.",
  },
  אַזְעָקָה: {
    he: "נִשְׁמְעָה אַזְעָקָה בְּאֶמְצַע הַלַּיְלָה.",
    en: "An alarm sounded in the middle of the night.",
  },
  זָעַק: {
    he: "הַיֶּלֶד זָעַק כְּשֶׁרָאָה אֶת הָאֵשׁ.",
    en: "The boy cried out when he saw the fire.",
  },
  מִבְצָע: {
    he: "יֵשׁ מִבְצָע גָּדוֹל עַל יְרָקוֹת בַּסּוּפֶּר.",
    en: "There is a big sale on vegetables at the supermarket.",
  },
  בִּצַּע: {
    he: "הַצֶּוֶת בִּצַּע אֶת הָעֲבוֹדָה בִּזְמַן.",
    en: "The team carried out the work on time.",
  },
  טָס: { he: "הוּא טָס לְלוֹנְדוֹן בְּיוֹם חֲמִישִׁי.", en: "He flew to London on Thursday." },
  טִיסָה: {
    he: "יֵשׁ לָנוּ טִיסָה מֻקְדֶּמֶת מָחָר בַּבֹּקֶר.",
    en: "We have an early flight tomorrow morning.",
  },
  פְּצָצָה: {
    he: "הַמִּשְׁטָרָה מָצְאָה פְּצָצָה לְיַד הַתַּחֲנָה.",
    en: "The police found a bomb next to the station.",
  },
  פִּצּוּץ: {
    he: "הָיָה פִּצּוּץ חָזָק בַּמִּפְעָל אֶתְמוֹל.",
    en: "There was a loud explosion at the factory yesterday.",
  },
  חִלֵּץ: {
    he: "הַכַּבַּאי חִלֵּץ יֶלֶד מִן הָרֶכֶב.",
    en: "The firefighter pulled a child out of the car.",
  },
  חִלּוּץ: {
    he: "חִלּוּץ הַפְּצוּעִים לָקַח שָׁעוֹת אֲרֻכּוֹת.",
    en: "Extricating the injured took long hours.",
  },
  צֹפֶן: {
    he: "אַף אֶחָד לֹא הִצְלִיחַ לְפַעֲנֵחַ צֹפֶן כָּזֶה.",
    en: "Nobody managed to crack a code like that.",
  },
  הִצְפִּין: {
    he: "הוּא הִצְפִּין אֶת כָּל הַקְּבָצִים בַּמַּחְשֵׁב.",
    en: "He encrypted all the files on the computer.",
  },
  גְּבוּל: { he: "יֵשׁ גְּבוּל לַסַּבְלָנוּת שֶׁלִּי.", en: "There is a limit to my patience." },
  הִגְבִּיל: {
    he: "הָרוֹפֵא הִגְבִּיל אוֹתוֹ לִשְׁתֵּי כּוֹסוֹת קָפֶה.",
    en: "The doctor limited him to two cups of coffee.",
  },
  אַלּוּף: {
    he: "הוּא הָיָה אַלּוּף הָעוֹלָם בְּשַׁחְמָט.",
    en: "He was world champion in chess.",
  },
  אֶלֶף: { he: "בָּאוּ אֶלֶף אֲנָשִׁים לַהַצָּגָה.", en: "A thousand people came to the show." },
  סֵמֶל: { he: "הַיּוֹנָה הִיא סֵמֶל שֶׁל שָׁלוֹם.", en: "The dove is a symbol of peace." },
  סַמָּל: {
    he: "סַמָּל צָעִיר צָעַק עָלֵינוּ בַּמִּסְדָּר.",
    en: "A young sergeant shouted at us at the parade.",
  },

  // city & travel
  דֶּרֶךְ: {
    he: "הַדֶּרֶךְ לִירוּשָׁלַיִם הָיְתָה עֲמוּסָה מְאוֹד.",
    en: "The road to Jerusalem was very crowded.",
  },
  דָּרַךְ: {
    he: "הוּא דָּרַךְ עַל זְכוּכִית שְׁבוּרָה בַּחוֹף.",
    en: "He stepped on broken glass at the beach.",
  },
  רָכַב: { he: "הוּא רָכַב עַל סוּס בַּחַוָּה.", en: "He rode a horse on the farm." },
  רֶכֶב: { he: "יֵשׁ לָנוּ רֶכֶב יָשָׁן אֲבָל אָמִין.", en: "We have an old but reliable car." },
  עִיר: {
    he: "תֵּל אָבִיב הִיא עִיר גְּדוֹלָה וְרוֹעֶשֶׁת.",
    en: "Tel Aviv is a big, noisy city.",
  },
  עִירוֹנִי: {
    he: "יֵשׁ בָּרְחוֹב גַּן עִירוֹנִי קָטָן וְיָפֶה.",
    en: "There is a small, pretty municipal garden on the street.",
  },
  נָתִיב: {
    he: "יֵשׁ נָתִיב מְיֻחָד לָאוֹטוֹבּוּסִים בָּרְחוֹב הַזֶּה.",
    en: "There is a special lane for buses on this street.",
  },
  נִתֵּב: {
    he: "הַשּׁוֹטֵר נִתֵּב אֶת הַתְּנוּעָה לִרְחוֹב צְדָדִי.",
    en: "The policeman directed the traffic to a side street.",
  },
  תּוֹר: {
    he: "יֵשׁ תּוֹר אָרֹךְ בַּקֻּפָּה שֶׁל הַסּוּפֶּר.",
    en: "There is a long queue at the supermarket checkout.",
  },
  תַּיָּר: {
    he: "תַּיָּר מִצָּרְפַת שָׁאַל אוֹתִי אֵיךְ לְהַגִּיעַ.",
    en: "A tourist from France asked me how to get there.",
  },
  כַּרְטִיס: {
    he: "קָנִיתִי כַּרְטִיס לָרַכֶּבֶת בָּאַפְלִיקַצְיָה.",
    en: "I bought a train ticket in the app.",
  },
  כִּרְטֵס: {
    he: "הַסַּפְרָן כִּרְטֵס אֶת כָּל הַסְּפָרִים הַחֲדָשִׁים.",
    en: "The librarian catalogued all the new books.",
  },
  מֶרְכָּז: {
    he: "נִפְגַּשְׁנוּ בְּמֶרְכָּז הָעִיר לְיַד הַשָּׁעוֹן.",
    en: "We met in the city center by the clock.",
  },
  מֶרְכָּזִי: {
    he: "הַמָּלוֹן נִמְצָא בְּמָקוֹם מֶרְכָּזִי מְאוֹד.",
    en: "The hotel is in a very central spot.",
  },
  גֶּשֶׁר: {
    he: "עָבַרְנוּ אֶת הַנָּהָר עַל גֶּשֶׁר עַתִּיק.",
    en: "We crossed the river on an old bridge.",
  },
  גִּשֵּׁר: {
    he: "הוּא גִּשֵּׁר בֵּין שְׁנֵי הַצְּדָדִים בַּוִּכּוּחַ.",
    en: "He bridged the gap between the two sides in the argument.",
  },
  מָלוֹן: {
    he: "הִזְמַנּוּ חֶדֶר בְּמָלוֹן קָטָן בְּיָפוֹ.",
    en: "We booked a room in a small hotel in Jaffa.",
  },
  לָן: {
    he: "הוּא לָן אֵצֶל חֲבֵרִים בַּצָּפוֹן.",
    en: "He stayed overnight at friends in the north.",
  },
  עָף: {
    he: "הַכּוֹבַע שֶׁלִּי עָף בָּרוּחַ הַחֲזָקָה.",
    en: "My hat flew off in the strong wind.",
  },
  תְּעוּפָה: {
    he: "שְׂדֵה תְּעוּפָה חָדָשׁ נִפְתַּח בַּדָּרוֹם.",
    en: "A new airfield opened in the south.",
  },
  נָחַת: {
    he: "הַמָּטוֹס נָחַת בְּשָׁלוֹם לַמְרוֹת הָרוּחַ.",
    en: "The plane landed safely despite the wind.",
  },
  נְחִיתָה: {
    he: "הָיְתָה נְחִיתָה קָשָׁה בִּגְלַל הַסְּעָרָה.",
    en: "It was a rough landing because of the storm.",
  },
  רָצִיף: {
    he: "הָרַכֶּבֶת מַגִּיעָה לְרָצִיף שָׁלוֹשׁ.",
    en: "The train arrives at platform three.",
  },
  רִצְפָּה: {
    he: "הַיְלָדִים יָשְׁבוּ עַל רִצְפָּה קָרָה.",
    en: "The children sat on a cold floor.",
  },
  חוּץ: {
    he: "הוּא חִכָּה בַּחוּץ עַד שֶׁגָּמַרְנוּ.",
    en: "He waited outside until we finished.",
  },
  חִיצוֹנִי: {
    he: "הַקִּיר הַחִיצוֹנִי שֶׁל הַבַּיִת נִצְבַּע לָבָן.",
    en: "The outer wall of the house was painted white.",
  },
  בָּלַם: {
    he: "הַנֶּהָג בָּלַם חָזָק לִפְנֵי הַצֹּמֶת.",
    en: "The driver braked hard before the junction.",
  },
  בֶּלֶם: {
    he: "יֵשׁ בְּעָיָה בַּבֶּלֶם הָאֲחוֹרִי שֶׁל הָאוֹפַנַּיִם.",
    en: "There is a problem with the rear brake of the bike.",
  },
  עָקַף: {
    he: "הוּא עָקַף מַשָּׂאִית אִטִּית בַּכְּבִישׁ.",
    en: "He overtook a slow truck on the road.",
  },
  עֲקִיפָה: {
    he: "עֲקִיפָה מְסֻכֶּנֶת גּוֹרֶמֶת לְהַרְבֵּה תְּאוּנוֹת.",
    en: "Dangerous overtaking causes many accidents.",
  },
  שַׁעַר: {
    he: "יֵשׁ שַׁעַר בַּרְזֶל גָּדוֹל בַּכְּנִיסָה לַגַּן.",
    en: "There is a big iron gate at the entrance to the park.",
  },
  שׁוֹעֵר: {
    he: "שׁוֹעֵר עָמַד בַּכְּנִיסָה וּבָדַק תְּעוּדוֹת.",
    en: "A gatekeeper stood at the entrance and checked papers.",
  },
  גָּדֵר: {
    he: "יֵשׁ גָּדֵר נְמוּכָה סְבִיב הֶחָצֵר.",
    en: "There is a low fence around the yard.",
  },
  גָּדַר: {
    he: "הוּא גָּדַר אֶת הַשָּׂדֶה לִפְנֵי הַחֹרֶף.",
    en: "He fenced in the field before the winter.",
  },
  אֵזוֹר: { he: "אֲנִי גָּר בְּאֵזוֹר שָׁקֵט בָּעִיר.", en: "I live in a quiet area of the city." },
  אֲזוֹרִי: {
    he: "יֵשׁ בֵּית סֵפֶר אֲזוֹרִי לְכָל הַכְּפָרִים.",
    en: "There is a regional school for all the villages.",
  },
  סְפִינָה: {
    he: "סְפִינָה גְּדוֹלָה עָגְנָה בַּנָּמָל אֶתְמוֹל.",
    en: "A big ship anchored in the port yesterday.",
  },
  סַפָּן: {
    he: "סַפָּן זָקֵן סִפֵּר לָנוּ עַל הַיָּם.",
    en: "An old sailor told us about the sea.",
  },
  נָמָל: {
    he: "יֵשׁ בְּחֵיפָה נָמָל גָּדוֹל וְעָסוּק.",
    en: "There is a big, busy port in Haifa.",
  },
  "נְמַל תְּעוּפָה": {
    he: "נָסַעְנוּ לִנְמַל תְּעוּפָה חָדָשׁ בְּאֵילַת.",
    en: "We travelled to a new airport in Eilat.",
  },
  נִוֵּט: {
    he: "הוּא נִוֵּט אוֹתָנוּ הַבַּיְתָה בְּלִי מַפָּה.",
    en: "He navigated us home without a map.",
  },
  נִוּוּט: {
    he: "לָמַדְנוּ נִוּוּט בַּיָּם בַּקּוּרְס שֶׁל הַקַּיִץ.",
    en: "We learned sea navigation in the summer course.",
  },
  אַכְסַנְיָה: {
    he: "יָשַׁנּוּ בְּאַכְסַנְיָה זוֹלָה לְיַד הַתַּחֲנָה.",
    en: "We slept in a cheap hostel near the station.",
  },
  אִכְסֵן: {
    he: "הוּא אִכְסֵן אוֹתָנוּ שָׁבוּעַ שָׁלֵם בְּבֵיתוֹ.",
    en: "He put us up for a whole week at his home.",
  },
  רַמְזוֹר: {
    he: "עֲצֹר! יֵשׁ רַמְזוֹר אָדֹם בַּצֹּמֶת.",
    en: "Stop! There is a red traffic light at the junction.",
  },
  רָמַז: {
    he: "הוּא רָמַז לִי שֶׁכְּדַאי לָלֶכֶת.",
    en: "He hinted to me that it was worth going.",
  },
  סָלַל: {
    he: "הַקַּבְּלָן סָלַל כְּבִישׁ חָדָשׁ לַכְּפָר.",
    en: "The contractor paved a new road to the village.",
  },
  מְסִלָּה: {
    he: "הָרַכֶּבֶת נָסְעָה עַל מְסִלָּה יְשָׁנָה.",
    en: "The train travelled on an old track.",
  },
  שְׁבִיל: {
    he: "הָלַכְנוּ בִּשְׁבִיל צַר בֵּין הָעֵצִים.",
    en: "We walked on a narrow path between the trees.",
  },
  "שְׁבִיל הַזָּהָב": {
    he: "צָרִיךְ לִמְצֹא אֶת שְׁבִיל הַזָּהָב בֵּין הַצְּדָדִים.",
    en: "One has to find the golden mean between the sides.",
  },
  מִקּוּם: {
    he: "מִקּוּם הַבַּיִת קָרוֹב מְאוֹד לַיָּם.",
    en: "The location of the house is very close to the sea.",
  },
  מִקֵּם: {
    he: "הוּא מִקֵּם אֶת הַשֻּׁלְחָן לְיַד הַחַלּוֹן.",
    en: "He placed the table next to the window.",
  },
  יַעַד: {
    he: "בָּחַרְנוּ יַעַד חָדָשׁ לַחֻפְשָׁה הַבָּאָה.",
    en: "We chose a new destination for the next holiday.",
  },
  יִעֵד: {
    he: "הַמְּנַהֵל יִעֵד אוֹתוֹ לְתַפְקִיד בָּכִיר.",
    en: "The manager designated him for a senior post.",
  },

  // money & commerce
  שׁוּק: {
    he: "יֵשׁ שׁוּק גָּדוֹל לְיַד תַּחֲנַת הָאוֹטוֹבּוּס.",
    en: "There is a big market next to the bus station.",
  },
  שִׁוֵּק: {
    he: "הוּא שִׁוֵּק אֶת הַמּוּצָר בְּכָל הָאָרֶץ.",
    en: "He marketed the product all over the country.",
  },
  סָחַר: {
    he: "הוּא סָחַר בְּתַבְלִינִים בְּכָל הַמִּזְרָח.",
    en: "He traded in spices all over the East.",
  },
  מִסְחָר: {
    he: "יֵשׁ מִסְחָר עָנֵף בֵּין שְׁתֵּי הַמְּדִינוֹת.",
    en: "There is brisk trade between the two countries.",
  },
  כֶּסֶף: {
    he: "אֵין לִי מַסְפִּיק כֶּסֶף לְשַׁלֵּם עַכְשָׁו.",
    en: "I do not have enough money to pay now.",
  },
  כַּסְפּוֹמָט: {
    he: "מָשַׁכְתִּי מָאתַיִם שֶׁקֶל מִן הַכַּסְפּוֹמָט.",
    en: "I withdrew two hundred shekels from the cash machine.",
  },
  יָקָר: {
    he: "הַמְּעִיל הַזֶּה יָקָר מִדַּי בִּשְׁבִילִי.",
    en: "This coat is too expensive for me.",
  },
  הִתְיַקֵּר: {
    he: "הֶחָלָב הִתְיַקֵּר שׁוּב הַחֹדֶשׁ.",
    en: "Milk went up in price again this month.",
  },
  זוֹל: { he: "מָצָאתִי כַּרְטִיס זוֹל לְאִיטַלְיָה.", en: "I found a cheap ticket to Italy." },
  הוֹזִיל: {
    he: "הַמִּפְעָל הוֹזִיל אֶת הַמְּחִירִים לִפְנֵי הֶחָג.",
    en: "The factory lowered the prices before the holiday.",
  },
  חוֹב: { he: "יֵשׁ לוֹ חוֹב גָּדוֹל לַבַּנְק.", en: "He has a big debt to the bank." },
  חִיֵּב: {
    he: "הַבַּנְק חִיֵּב אוֹתִי בְּעֶשְׂרִים שֶׁקֶל.",
    en: "The bank charged me twenty shekels.",
  },
  עֵסֶק: {
    he: "פָּתַחְנוּ עֵסֶק קָטָן בְּמֶרְכַּז הָעִיר.",
    en: "We opened a small business in the city center.",
  },
  עָסַק: {
    he: "הוּא עָסַק בִּמְכִירַת רָהִיטִים שָׁנִים רַבּוֹת.",
    en: "He dealt in selling furniture for many years.",
  },
  עֵרֶךְ: { he: "לַתְּמוּנָה הַזֹּאת יֵשׁ עֵרֶךְ רַב.", en: "This picture has great value." },
  הֶעֱרִיךְ: {
    he: "הַשַּׁמַּאי הֶעֱרִיךְ אֶת הַדִּירָה בְּמִילְיוֹן שֶׁקֶל.",
    en: "The appraiser valued the flat at a million shekels.",
  },
  סִפֵּק: {
    he: "הַמִּפְעָל סִפֵּק לָנוּ אֶת הַחֹמֶר בַּזְּמַן.",
    en: "The factory supplied us the material on time.",
  },
  סַפָּק: {
    he: "הַמִּסְעָדָה מְחַפֶּשֶׂת סַפָּק חָדָשׁ שֶׁל בָּשָׂר.",
    en: "The restaurant is looking for a new meat supplier.",
  },
  רָכַשׁ: {
    he: "הוּא רָכַשׁ נִסָּיוֹן רַב בָּעֲבוֹדָה הַזֹּאת.",
    en: "He acquired a lot of experience in this job.",
  },
  רְכִישָׁה: {
    he: "רְכִישָׁה שֶׁל דִּירָה דּוֹרֶשֶׁת הַרְבֵּה כֶּסֶף.",
    en: "Buying a flat requires a lot of money.",
  },
  פָּחַת: {
    he: "מִסְפַּר הַתַּלְמִידִים פָּחַת בַּשָּׁנִים הָאַחֲרוֹנוֹת.",
    en: "The number of pupils decreased in recent years.",
  },
  הִפְחִית: {
    he: "הַמּוֹכֵר הִפְחִית עֲשָׂרָה אֲחוּזִים מִן הַמְּחִיר.",
    en: "The seller took ten percent off the price.",
  },
  עֹדֶף: {
    he: "הַמּוֹכֵר נָתַן לִי עֹדֶף שֶׁל חֲמִשָּׁה שְׁקָלִים.",
    en: "The seller gave me five shekels change.",
  },
  עָדַף: {
    he: "הַמַּסְלוּל הַקָּצָר עָדַף עַל הָאָרֹךְ.",
    en: "The short route was preferable to the long one.",
  },
  לָוָה: {
    he: "הוּא לָוָה מִמֶּנִּי מָאתַיִם שֶׁקֶל.",
    en: "He borrowed two hundred shekels from me.",
  },
  הִלְוָה: { he: "אַבָּא הִלְוָה לִי כֶּסֶף לָאוֹטוֹ.", en: "Dad lent me money for the car." },
  חָתַם: { he: "הוּא חָתַם עַל הַחוֹזֶה בַּבֹּקֶר.", en: "He signed the contract in the morning." },
  חֲתִימָה: {
    he: "הַטֹּפֶס דּוֹרֵשׁ חֲתִימָה שֶׁל שְׁנֵי הַהוֹרִים.",
    en: "The form requires the signature of both parents.",
  },
  גָּבָה: {
    he: "הַמֶּלְצַר גָּבָה מֵאִתָּנוּ יוֹתֵר מִדַּי.",
    en: "The waiter charged us too much.",
  },
  גְּבִיָּה: {
    he: "גְּבִיָּה שֶׁל חוֹבוֹת יְשָׁנִים הִיא עֲבוֹדָה קָשָׁה.",
    en: "Collecting old debts is hard work.",
  },
  נִכָּה: {
    he: "הַמַּעֲסִיק נִכָּה מַס מִן הַמַּשְׂכֹּרֶת.",
    en: "The employer deducted tax from the salary.",
  },
  נִכּוּי: {
    he: "יֵשׁ נִכּוּי גָּדוֹל בַּתְּלוּשׁ שֶׁל הַחֹדֶשׁ.",
    en: "There is a big deduction on this month's payslip.",
  },
  בִּזְבֵּז: {
    he: "הוּא בִּזְבֵּז אֶת כָּל הַחִסָּכוֹן בְּחֹדֶשׁ.",
    en: "He blew all his savings in a month.",
  },
  בִּזְבּוּז: {
    he: "זֶה בִּזְבּוּז שֶׁל זְמַן וְשֶׁל כֶּסֶף.",
    en: "That is a waste of time and of money.",
  },
  עָמַס: {
    he: "הַנֶּהָג עָמַס אֶת הַתִּיקִים עַל הָרֶכֶב.",
    en: "The driver loaded the bags onto the car.",
  },
  עֹמֶס: {
    he: "יֵשׁ עֹמֶס גָּדוֹל בַּכְּבִישִׁים בַּבֹּקֶר.",
    en: "There is heavy congestion on the roads in the morning.",
  },
  פְּשָׁרָה: {
    he: "מָצָאנוּ פְּשָׁרָה טוֹבָה בֵּין שְׁנֵי הַצְּדָדִים.",
    en: "We found a good compromise between the two sides.",
  },
  הִתְפַּשֵּׁר: {
    he: "הוּא לֹא הִתְפַּשֵּׁר עַל הַמְּחִיר בִּכְלָל.",
    en: "He did not compromise on the price at all.",
  },
  חָכַר: {
    he: "הָאִכָּר חָכַר אֶת הָאֲדָמָה לְעֶשֶׂר שָׁנִים.",
    en: "The farmer leased the land for ten years.",
  },
  חֲכִירָה: {
    he: "יֵשׁ לָהֶם חֲכִירָה אֲרֻכָּה עַל הַמִּגְרָשׁ.",
    en: "They have a long lease on the plot.",
  },
  קָבַע: {
    he: "הָרוֹפֵא קָבַע לִי תּוֹר לְיוֹם שְׁלִישִׁי.",
    en: "The doctor set me an appointment for Tuesday.",
  },
  קָבוּעַ: {
    he: "יֵשׁ לוֹ מָקוֹם קָבוּעַ בְּבֵית הַכְּנֶסֶת.",
    en: "He has a regular seat in the synagogue.",
  },
  צָבַר: {
    he: "הוּא צָבַר הַרְבֵּה יְמֵי חֻפְשָׁה הַשָּׁנָה.",
    en: "He accumulated a lot of vacation days this year.",
  },
  צְבִירָה: {
    he: "צְבִירָה שֶׁל נְקֻדּוֹת מְזַכָּה בְּמַתָּנָה.",
    en: "Accumulating points earns you a gift.",
  },
  סִמֵּן: {
    he: "הַמּוֹרֶה סִמֵּן אֶת הַטָּעֻיּוֹת בְּאָדֹם.",
    en: "The teacher marked the mistakes in red.",
  },
  סִימָנִיָּה: {
    he: "שַׂמְתִּי סִימָנִיָּה בָּעַמּוּד הָאַחֲרוֹן שֶׁקָּרָאתִי.",
    en: "I put a bookmark on the last page I read.",
  },
  מוּתָג: {
    he: "זֶה מוּתָג יָקָר שֶׁכֻּלָּם מַכִּירִים.",
    en: "That is an expensive brand that everyone knows.",
  },
  מִתֵּג: {
    he: "הַמִּפְעָל מִתֵּג אֶת הַמּוּצָר מֵחָדָשׁ.",
    en: "The factory rebranded the product.",
  },
  תָּרַם: {
    he: "הוּא תָּרַם דָּם בַּתַּחֲנָה הַנַּיֶּדֶת.",
    en: "He donated blood at the mobile station.",
  },
  תּוֹרֵם: {
    he: "תּוֹרֵם אַלְמוֹנִי נָתַן מִילְיוֹן שֶׁקֶל לְבֵית הַחוֹלִים.",
    en: "An anonymous donor gave a million shekels to the hospital.",
  },
  מִכְרָז: {
    he: "הָעִירִיָּה פִּרְסְמָה מִכְרָז חָדָשׁ לַקַּבְּלָנִים.",
    en: "The municipality published a new tender for contractors.",
  },
  הִכְרִיז: {
    he: "הַשּׁוֹפֵט הִכְרִיז עַל נִצָּחוֹן שֶׁל הָאוֹרְחִים.",
    en: "The referee declared a win for the visitors.",
  },
  פִּצָּה: {
    he: "הַמִּפְעָל פִּצָּה אֶת הָעוֹבְדִים שֶׁפֻּטְּרוּ.",
    en: "The factory compensated the workers who were laid off.",
  },
  פִּצּוּי: {
    he: "הֵם קִבְּלוּ פִּצּוּי גָּבוֹהַ מִן הַבִּטּוּחַ.",
    en: "They received high compensation from the insurance.",
  },

  // animals & farming
  כֶּלֶב: { he: "יֵשׁ לָנוּ כֶּלֶב שָׁחֹר וְשָׂמֵחַ.", en: "We have a black, happy dog." },
  כַּלְבָּה: {
    he: "הַכַּלְבָּה שֶׁל הַשְּׁכֵנִים יָלְדָה שִׁשָּׁה גּוּרִים.",
    en: "The neighbours' female dog had six puppies.",
  },
  חָתוּל: { he: "חָתוּל שָׁמֵן יָשַׁן עַל הַמִּרְפֶּסֶת.", en: "A fat cat slept on the balcony." },
  חֲתוּלָה: {
    he: "הַחֲתוּלָה שֶׁלָּנוּ מְפַחֶדֶת מִזָּרִים.",
    en: "Our cat is afraid of strangers.",
  },
  דָּג: {
    he: "אָכַלְנוּ דָּג טָרִי בַּמִּסְעָדָה בַּנָּמָל.",
    en: "We ate fresh fish at the restaurant in the port.",
  },
  דָּגָה: {
    he: "הַדָּגָה בַּכִּנֶּרֶת הִתְמַעֲטָה מְאוֹד הַשָּׁנָה.",
    en: "The fish stock in the Kinneret shrank a lot this year.",
  },
  צִפּוֹר: {
    he: "צִפּוֹר קְטַנָּה בָּנְתָה קֵן עַל הָעֵץ.",
    en: "A small bird built a nest in the tree.",
  },
  צַפָּר: {
    he: "צַפָּר סַבְלָנִי חִכָּה שָׁעוֹת עִם מִשְׁקֶפֶת.",
    en: "A patient birdwatcher waited hours with binoculars.",
  },
  רוֹעֶה: {
    he: "רוֹעֶה צָעִיר הוֹלֵךְ אַחֲרֵי הַכְּבָשִׂים.",
    en: "A young shepherd walks behind the sheep.",
  },
  רוֹעָה: {
    he: "רוֹעָה זְקֵנָה יָשְׁבָה עַל הַסֶּלַע.",
    en: "An old shepherdess sat on the rock.",
  },
  חָלָב: {
    he: "יַלְדָּה שׁוֹתָה כּוֹס חָלָב לִפְנֵי הַשֵּׁנָה.",
    en: "A girl drinks a glass of milk before sleep.",
  },
  חָלַב: {
    he: "הָאִכָּר חָלַב אֶת הַפָּרוֹת בַּבֹּקֶר.",
    en: "The farmer milked the cows in the morning.",
  },
  עֵדֶר: { he: "עֵדֶר כְּבָשִׂים חָצָה אֶת הַכְּבִישׁ.", en: "A flock of sheep crossed the road." },
  עָדַר: {
    he: "הָאִכָּר עָדַר בַּגִּנָּה כָּל הַבֹּקֶר.",
    en: "The farmer hoed in the garden all morning.",
  },
  שָׁתַל: {
    he: "הוּא שָׁתַל פְּרָחִים לְיַד הַכְּנִיסָה.",
    en: "He planted flowers by the entrance.",
  },
  שְׁתִיל: {
    he: "כָּל שְׁתִיל צָרִיךְ מַיִם וְשֶׁמֶשׁ.",
    en: "Every seedling needs water and sun.",
  },
  חָרַשׁ: {
    he: "הָאִכָּר חָרַשׁ אֶת הַשָּׂדֶה לִפְנֵי הַגֶּשֶׁם.",
    en: "The farmer plowed the field before the rain.",
  },
  חֲרִישָׁה: { he: "חֲרִישָׁה עֲמֻקָּה עוֹזֶרֶת לָאֲדָמָה.", en: "Deep plowing helps the soil." },
  סוּס: { he: "סוּס לָבָן רָץ בַּשָּׂדֶה הַפָּתוּחַ.", en: "A white horse ran in the open field." },
  סוּסָה: { he: "סוּסָה חוּמָה עָמְדָה לְיַד הַגָּדֵר.", en: "A brown mare stood by the fence." },
  גָּמָל: {
    he: "גָּמָל אֶחָד יָכוֹל לִשְׁתּוֹת הַרְבֵּה מַיִם.",
    en: "One camel can drink a lot of water.",
  },
  גָּמַל: {
    he: "הָרוֹעֶה גָּמַל אֶת הַטָּלֶה מֵאִמּוֹ.",
    en: "The shepherd weaned the lamb from its mother.",
  },
  עֵז: {
    he: "עֵז לְבָנָה אָכְלָה אֶת הַפְּרָחִים בַּגִּנָּה.",
    en: "A white goat ate the flowers in the garden.",
  },
  עַז: { he: "יֵשׁ לוֹ רָצוֹן עַז לְנַצֵּחַ.", en: "He has a fierce desire to win." },
  אָסַף: {
    he: "הָאִכָּר אָסַף אֶת הַתְּבוּאָה בַּקַּיִץ.",
    en: "The farmer gathered in the grain in the summer.",
  },
  אָסִיף: {
    he: "חַג הָאָסִיף חָל בְּסוֹף הַקַּיִץ.",
    en: "The ingathering festival falls at the end of summer.",
  },
  נָטַע: {
    he: "סַבָּא נָטַע עֵץ זַיִת בֶּחָצֵר.",
    en: "Grandpa planted an olive tree in the yard.",
  },
  נְטִיעָה: {
    he: "נְטִיעָה שֶׁל עֵצִים עוֹזֶרֶת לָאֲוִיר בָּעִיר.",
    en: "Planting trees helps the air in the city.",
  },
  הִשְׁקָה: {
    he: "הוּא הִשְׁקָה אֶת הַגִּנָּה בָּעֶרֶב.",
    en: "He watered the garden in the evening.",
  },
  הַשְׁקָיָה: {
    he: "יֵשׁ הַשְׁקָיָה אוֹטוֹמָטִית בַּפַּרְדֵּס.",
    en: "There is automatic irrigation in the orchard.",
  },
  טָרַף: { he: "זְאֵב טָרַף כֶּבֶשׂ בַּלַּיְלָה.", en: "A wolf preyed on a sheep at night." },
  טוֹרֵף: {
    he: "הַנָּמֵר הוּא טוֹרֵף מָהִיר וְחָכָם.",
    en: "The leopard is a fast, clever predator.",
  },
  לָכַד: {
    he: "הַצַּיָּד לָכַד שׁוּעָל בַּיַּעַר.",
    en: "The hunter trapped a fox in the forest.",
  },
  מַלְכֹּדֶת: {
    he: "שַׂמְנוּ מַלְכֹּדֶת קְטַנָּה לָעַכְבָּרִים בַּמַּחְסָן.",
    en: "We set a small trap for the mice in the storeroom.",
  },
  זָחַל: {
    he: "נָחָשׁ קָטָן זָחַל בֵּין הָאֲבָנִים.",
    en: "A small snake crawled between the stones.",
  },
  זוֹחֵל: {
    he: "הַצָּב הוּא זוֹחֵל אִטִּי וְשָׁקֵט.",
    en: "The tortoise is a slow, quiet reptile.",
  },
  קָטַף: {
    he: "הַיֶּלֶד קָטַף תַּפּוּחַ מִן הָעֵץ.",
    en: "The boy picked an apple from the tree.",
  },
  קְטִיף: {
    he: "יָצָאנוּ לִקְטִיף דֻּבְדְּבָנִים בַּצָּפוֹן.",
    en: "We went out cherry picking in the north.",
  },
  גָּזַז: {
    he: "הָרוֹעֶה גָּזַז אֶת הַצֹּאן בָּאָבִיב.",
    en: "The shepherd sheared the flock in the spring.",
  },
  גְּזִיזָה: {
    he: "גְּזִיזָה שֶׁל צֶמֶר נִמְשֶׁכֶת יָמִים אֲחָדִים.",
    en: "Shearing wool goes on for several days.",
  },
  קֵן: {
    he: "יֵשׁ קֵן שֶׁל דְּרוֹרִים מֵאֲחוֹרֵי הַתְּרִיס.",
    en: "There is a sparrows' nest behind the shutter.",
  },
  קִנֵּן: {
    he: "זוּג יוֹנִים קִנֵּן עַל הַמִּרְפֶּסֶת שֶׁלָּנוּ.",
    en: "A pair of doves nested on our balcony.",
  },
  הִמְלִיטָה: {
    he: "הַפָּרָה הִמְלִיטָה עֵגֶל בָּרִיא בַּלַּיְלָה.",
    en: "The cow calved a healthy calf at night.",
  },
  הַמְלָטָה: {
    he: "הָיְתָה הַמְלָטָה קָשָׁה בָּרֶפֶת אֶמֶשׁ.",
    en: "There was a hard birthing in the cowshed last night.",
  },
  עָקַץ: { he: "יַתּוּשׁ עָקַץ אוֹתִי בָּרֶגֶל.", en: "A mosquito stung me on the leg." },
  עֲקִיצָה: { he: "יֵשׁ לִי עֲקִיצָה אֲדֻמָּה עַל הַיָּד.", en: "I have a red sting on my hand." },
  נָשַׁךְ: {
    he: "הַכֶּלֶב נָשַׁךְ אֶת הַדַּוָּר בָּרֶגֶל.",
    en: "The dog bit the postman on the leg.",
  },
  נְשִׁיכָה: {
    he: "הַכֶּלֶב הִשְׁאִיר נְשִׁיכָה קְטַנָּה עַל הַיָּד.",
    en: "The dog left a small bite on the hand.",
  },
  טָחַן: {
    he: "הוּא טָחַן פִּלְפֵּל שָׁחֹר עַל הַסָּלָט.",
    en: "He ground black pepper onto the salad.",
  },
  טַחֲנָה: { he: "יֵשׁ טַחֲנָה יְשָׁנָה עַל הַגִּבְעָה.", en: "There is an old mill on the hill." },
  זֶבֶל: {
    he: "הָאִכָּר פִּזֵּר זֶבֶל עַל הַשָּׂדֶה.",
    en: "The farmer spread manure on the field.",
  },
  זִבֵּל: {
    he: "הוּא זִבֵּל אֶת הַגִּנָּה לִפְנֵי הַשְּׁתִילָה.",
    en: "He fertilized the garden before the planting.",
  },
  יְבוּל: {
    he: "הָיָה יְבוּל טוֹב מְאוֹד הַשָּׁנָה בַּכֶּרֶם.",
    en: "There was a very good crop this year in the vineyard.",
  },
  הוֹבִיל: {
    he: "הַנֶּהָג הוֹבִיל אֶת הַסְּחוֹרָה לַצָּפוֹן.",
    en: "The driver hauled the goods to the north.",
  },

  // numbers & science
  מָדַד: {
    he: "הָרוֹפֵא מָדַד לִי חֹם בָּאֹזֶן.",
    en: "The doctor measured my temperature in the ear.",
  },
  נִמְדַּד: {
    he: "כָּל תַּלְמִיד נִמְדַּד לְפִי הַמַּאֲמָץ שֶׁלּוֹ.",
    en: "Every pupil is measured by his own effort.",
  },
  חִלֵּק: {
    he: "הַמּוֹרֶה חִלֵּק אֶת הַדַּפִּים לַתַּלְמִידִים.",
    en: "The teacher handed out the pages to the pupils.",
  },
  הִתְחַלֵּק: {
    he: "הַכֶּסֶף הִתְחַלֵּק בֵּין שְׁלוֹשֶׁת הָאַחִים.",
    en: "The money was split among the three brothers.",
  },
  הִכְפִּיל: {
    he: "הוּא הִכְפִּיל אֶת הַמִּסְפָּר בְּשָׁלוֹשׁ.",
    en: "He multiplied the number by three.",
  },
  כֶּפֶל: {
    he: "תַּרְגִּיל כֶּפֶל קָשֶׁה יוֹתֵר מֵחִבּוּר.",
    en: "A multiplication exercise is harder than addition.",
  },
  הוֹסִיף: { he: "הוּא הוֹסִיף עוֹד מֶלַח לַמָּרָק.", en: "He added more salt to the soup." },
  הוֹסָפָה: {
    he: "בִּקַּשְׁתִּי הוֹסָפָה שֶׁל אֹרֶז בַּצַּלַּחַת.",
    en: "I asked for an extra helping of rice on the plate.",
  },
  חִסֵּר: {
    he: "הַיֶּלֶד חִסֵּר שְׁתַּיִם מֵעֶשֶׂר וְקִבֵּל שְׁמוֹנֶה.",
    en: "The boy subtracted two from ten and got eight.",
  },
  חָסֵר: { he: "חָסֵר לִי סֵפֶר אֶחָד בָּאֹסֶף.", en: "I am missing one book in the collection." },
  מָנָה: { he: "הוּא מָנָה אֶת הַכִּסְאוֹת בָּאוּלָם.", en: "He counted the chairs in the hall." },
  מִנָּה: {
    he: "רֹאשׁ הַמֶּמְשָׁלָה מִנָּה שַׂר חָדָשׁ.",
    en: "The prime minister appointed a new minister.",
  },
  כַּמָּה: {
    he: "כַּמָּה זְמַן לוֹקַחַת הַנְּסִיעָה לְחֵיפָה?",
    en: "How long does the trip to Haifa take?",
  },
  כַּמּוּת: {
    he: "יֵשׁ כָּאן כַּמּוּת גְּדוֹלָה שֶׁל אֹכֶל.",
    en: "There is a large quantity of food here.",
  },
  הִשְׁוָה: {
    he: "הוּא הִשְׁוָה אֶת הַמְּחִירִים בִּשְׁתֵּי חֲנֻיּוֹת.",
    en: "He compared the prices in two shops.",
  },
  הַשְׁוָאָה: {
    he: "אֵין הַשְׁוָאָה בֵּין הַבַּיִת הַיָּשָׁן לֶחָדָשׁ.",
    en: "There is no comparison between the old house and the new one.",
  },
  גִּלָּה: {
    he: "הוּא גִּלָּה אֶת הָאֱמֶת רַק אֶתְמוֹל.",
    en: "He discovered the truth only yesterday.",
  },
  הִתְגַּלָּה: {
    he: "בַּסּוֹף הִתְגַּלָּה שֶׁהַכֹּל הָיָה בְּדִיחָה.",
    en: "In the end it turned out that it was all a joke.",
  },
  שָׁלוֹשׁ: {
    he: "יֵשׁ לִי שָׁלוֹשׁ אֲחָיוֹת בַּצָּפוֹן.",
    en: "I have three sisters in the north.",
  },
  שְׁלִישִׁי: {
    he: "הוּא הִגִּיעַ שְׁלִישִׁי בַּמֵּרוֹץ אֶתְמוֹל.",
    en: "He came third in the race yesterday.",
  },
  אַרְבַּע: { he: "יֵשׁ אַרְבַּע עוֹנוֹת בַּשָּׁנָה.", en: "There are four seasons in the year." },
  רֶבַע: {
    he: "הוּא אִחֵר רֶבַע שָׁעָה לַפְּגִישָׁה.",
    en: "He was a quarter of an hour late to the meeting.",
  },
  מֵאָה: {
    he: "סַבָּא שֶׁלִּי חַי כִּמְעַט מֵאָה שָׁנָה.",
    en: "My grandfather lived almost a hundred years.",
  },
  מָאתַיִם: {
    he: "שִׁלַּמְנוּ מָאתַיִם שֶׁקֶל עַל הַכַּרְטִיסִים.",
    en: "We paid two hundred shekels for the tickets.",
  },
  אָחוּז: {
    he: "רַק אָחוּז אֶחָד מִן הַכִּתָּה נִכְשַׁל.",
    en: "Only one percent of the class failed.",
  },
  אָחַז: {
    he: "הוּא אָחַז בַּיָּד שֶׁל הַיֶּלֶד בַּכְּבִישׁ.",
    en: "He held the child's hand on the road.",
  },
  זוּג: {
    he: "יָשַׁב לְיָדֵנוּ זוּג צָעִיר עִם תִּינוֹק.",
    en: "A young couple with a baby sat next to us.",
  },
  זוּגִי: {
    he: "מִסְפָּר זוּגִי מִתְחַלֵּק תָּמִיד בִּשְׁנַיִם.",
    en: "An even number is always divisible by two.",
  },
  נְקֻדָּה: { he: "יֵשׁ נְקֻדָּה שְׁחֹרָה עַל הַקִּיר.", en: "There is a black dot on the wall." },
  נִקֵּד: {
    he: "הַמּוֹרֶה נִקֵּד אֶת הַשִּׁיר לַתַּלְמִידִים.",
    en: "The teacher put the vowel marks on the poem for the pupils.",
  },
  זִהָה: {
    he: "הָעֵד זִהָה אֶת הַגַּנָּב בְּלִי הִסּוּס.",
    en: "The witness identified the thief without hesitation.",
  },
  זֶהוּת: {
    he: "צָרִיךְ לְהָבִיא תְּעוּדַת זֶהוּת לַבְּחִינָה.",
    en: "You have to bring an identity card to the exam.",
  },
  מִין: {
    he: "יֵשׁ בַּגַּן מִין נָדִיר שֶׁל פְּרָחִים.",
    en: "There is a rare species of flower in the garden.",
  },
  מִיֵּן: {
    he: "הוּא מִיֵּן אֶת הַבְּגָדִים לְפִי צֶבַע.",
    en: "He sorted the clothes by colour.",
  },
  דֶּגֶם: {
    he: "קָנִינוּ דֶּגֶם יָשָׁן וְזוֹל שֶׁל מְכוֹנַת כְּבִיסָה.",
    en: "We bought an old, cheap model of washing machine.",
  },
  דֻּגְמָה: {
    he: "תֵּן לִי דֻּגְמָה אַחַת שֶׁל מִשְׁפָּט כָּזֶה.",
    en: "Give me one example of such a sentence.",
  },
  אִמֵּת: {
    he: "הָעִתּוֹנַאי אִמֵּת אֶת הַסִּפּוּר עִם שְׁנֵי עֵדִים.",
    en: "The journalist verified the story with two witnesses.",
  },
  אֱמֶת: { he: "הוּא אָמַר אֶת הָאֱמֶת לְכֻלָּם.", en: "He told the truth to everyone." },
  בִּסֵּס: {
    he: "הוּא בִּסֵּס אֶת הַטַּעֲנָה עַל מִסְפָּרִים.",
    en: "He based the claim on numbers.",
  },
  בָּסִיס: {
    he: "לַבִּנְיָן יֵשׁ בָּסִיס חָזָק מְאוֹד.",
    en: "The building has a very strong base.",
  },
  גָּרַם: {
    he: "הַגֶּשֶׁם גָּרַם לִתְאוּנָה קָשָׁה בַּכְּבִישׁ.",
    en: "The rain caused a bad accident on the road.",
  },
  גּוֹרֵם: {
    he: "הָעֲיֵפוּת הִיא גּוֹרֵם מֶרְכָּזִי בַּתְּאוּנוֹת.",
    en: "Fatigue is a central factor in accidents.",
  },
  מָשַׁךְ: {
    he: "הוּא מָשַׁךְ אֶת הַכִּסֵּא לְיַד הַשֻּׁלְחָן.",
    en: "He pulled the chair up to the table.",
  },
  מְשִׁיכָה: {
    he: "יֵשׁ מְשִׁיכָה חֲזָקָה בֵּין שְׁנֵי הַמַּגְנֵטִים.",
    en: "There is a strong attraction between the two magnets.",
  },
  יְסוֹד: {
    he: "הַחַמְצָן הוּא יְסוֹד חָשׁוּב בַּטֶּבַע.",
    en: "Oxygen is an important element in nature.",
  },
  יִסֵּד: {
    he: "הוּא יִסֵּד אֶת בֵּית הַסֵּפֶר לִפְנֵי שָׁנִים.",
    en: "He founded the school years ago.",
  },
  נִסֵּחַ: {
    he: "הוּא נִסֵּחַ אֶת הַמִּכְתָּב בִּזְהִירוּת.",
    en: "He worded the letter carefully.",
  },
  נֻסְחָה: {
    he: "לַמּוֹרֶה יֵשׁ נֻסְחָה פְּשׁוּטָה לְחִשּׁוּב הַשֶּׁטַח.",
    en: "The teacher has a simple formula for calculating area.",
  },
  הִסִּיק: {
    he: "מִן הַשֶּׁקֶט הוּא הִסִּיק שֶׁכֻּלָּם יְשֵׁנִים.",
    en: "From the silence he concluded that everyone was asleep.",
  },
  מַסְקָנָה: {
    he: "הִגַּעְנוּ לְמַסְקָנָה שֶׁצָּרִיךְ לְחַכּוֹת.",
    en: "We reached the conclusion that we have to wait.",
  },
  פֵּרֵק: {
    he: "הוּא פֵּרֵק אֶת הָאוֹפַנַּיִם בֶּחָצֵר.",
    en: "He took the bike apart in the yard.",
  },
  הִתְפָּרֵק: {
    he: "הַכִּסֵּא הַיָּשָׁן הִתְפָּרֵק תַּחַת הַמִּשְׁקָל.",
    en: "The old chair fell apart under the weight.",
  },
  גִּבֵּשׁ: {
    he: "הַמְּנַהֵל גִּבֵּשׁ תָּכְנִית חֲדָשָׁה לַשָּׁנָה.",
    en: "The manager put together a new plan for the year.",
  },
  הִתְגַּבֵּשׁ: {
    he: "הָרַעְיוֹן הִתְגַּבֵּשׁ אַחֲרֵי כַּמָּה יָמִים.",
    en: "The idea took shape after a few days.",
  },

  // sport & leisure
  הִתְחָרָה: {
    he: "הוּא הִתְחָרָה נֶגֶד רָצִים מְנֻסִּים.",
    en: "He competed against experienced runners.",
  },
  תַּחֲרוּת: {
    he: "יֵשׁ תַּחֲרוּת שְׂחִיָּה בַּבְּרֵכָה בְּשַׁבָּת.",
    en: "There is a swimming competition at the pool on Saturday.",
  },
  זָכָה: {
    he: "הוּא זָכָה בַּמָּקוֹם הָרִאשׁוֹן בַּמֵּרוֹץ.",
    en: "He won first place in the race.",
  },
  זְכִיָּה: {
    he: "זְכִיָּה בַּלּוֹטוֹ שִׁנְּתָה לָהֶם אֶת הַחַיִּים.",
    en: "A lottery win changed their life.",
  },
  כַּדּוּר: {
    he: "יֵשׁ כַּדּוּר אָדֹם מִתַּחַת לַסַּפָּה.",
    en: "There is a red ball under the sofa.",
  },
  כַּדּוּרֶגֶל: {
    he: "אָחִי מְשַׂחֵק כַּדּוּרֶגֶל כָּל יוֹם שִׁשִּׁי.",
    en: "My brother plays football every Friday.",
  },
  בָּעַט: { he: "הוּא בָּעַט חָזָק וְהִבְקִיעַ שַׁעַר.", en: "He kicked hard and scored a goal." },
  בְּעִיטָה: {
    he: "הָיְתָה בְּעִיטָה מְצֻיֶּנֶת בַּדַּקָּה הָאַחֲרוֹנָה.",
    en: "There was an excellent kick in the last minute.",
  },
  זָרַק: { he: "הוּא זָרַק אֶת הָאַשְׁפָּה לַפַּח.", en: "He threw the rubbish into the bin." },
  זְרִיקָה: {
    he: "הָאָחוֹת נָתְנָה לִי זְרִיקָה בַּזְּרוֹעַ.",
    en: "The nurse gave me an injection in the arm.",
  },
  תָּפַס: {
    he: "הוּא תָּפַס אֶת הַכַּדּוּר בְּיָד אַחַת.",
    en: "He caught the ball with one hand.",
  },
  נִתְפַּס: {
    he: "הַגַּנָּב נִתְפַּס בַּמַּצְלֵמָה בַּכְּנִיסָה.",
    en: "The thief was caught on camera at the entrance.",
  },
  שָׂחָה: {
    he: "הוּא שָׂחָה קִילוֹמֶטֶר בַּיָּם הַבֹּקֶר.",
    en: "He swam a kilometre in the sea this morning.",
  },
  שְׂחִיָּה: {
    he: "יֵשׁ שִׁעוּר שְׂחִיָּה לַיְלָדִים בְּיוֹם שֵׁנִי.",
    en: "There is a swimming lesson for the children on Monday.",
  },
  טִיֵּל: {
    he: "הוּא טִיֵּל בַּגָּלִיל בְּסוֹף הַשָּׁבוּעַ.",
    en: "He hiked in the Galilee at the weekend.",
  },
  טִיּוּל: {
    he: "יָצָאנוּ לְטִיּוּל אָרֹךְ בַּמִּדְבָּר.",
    en: "We went on a long trip in the desert.",
  },
  בִּלָּה: {
    he: "הוּא בִּלָּה אֶת כָּל הָעֶרֶב עִם חֲבֵרִים.",
    en: "He spent the whole evening with friends.",
  },
  בִּלּוּי: {
    he: "הָיָה לָנוּ בִּלּוּי נֶחְמָד בַּחוֹף.",
    en: "We had a nice night out at the beach.",
  },
  טִפֵּס: {
    he: "הַיֶּלֶד טִפֵּס עַל הָעֵץ בַּגִּנָּה.",
    en: "The boy climbed the tree in the garden.",
  },
  טִפּוּס: {
    he: "טִפּוּס עַל קִירוֹת הוּא סְפּוֹרְט מְסֻכָּן.",
    en: "Wall climbing is a dangerous sport.",
  },
  מָסַר: {
    he: "הוּא מָסַר לִי אֶת הַמַּפְתֵּחַ בַּבֹּקֶר.",
    en: "He handed me the key in the morning.",
  },
  מְסִירָה: {
    he: "הָיְתָה מְסִירָה יָפָה לִפְנֵי הַשַּׁעַר.",
    en: "There was a lovely pass before the goal.",
  },
  קָלַע: {
    he: "הוּא קָלַע יָשָׁר לַמַּטָּרָה מֵרָחוֹק.",
    en: "He hit the target straight on from far away.",
  },
  קְלִיעָה: {
    he: "לָמַדְנוּ קְלִיעָה בְּקֶשֶׁת בַּמַּחֲנֶה.",
    en: "We learned archery at the camp.",
  },
  חָנָה: {
    he: "הוּא חָנָה עִם הַמִּשְׁפָּחָה לְיַד הַכִּנֶּרֶת.",
    en: "He camped with the family by the Kinneret.",
  },
  מַחֲנֶה: {
    he: "הַיְלָדִים נָסְעוּ לְמַחֲנֶה קַיִץ בַּצָּפוֹן.",
    en: "The children went to a summer camp in the north.",
  },
  חֻפְשָׁה: {
    he: "יֵשׁ לִי חֻפְשָׁה שֶׁל שָׁבוּעַ בְּאוֹגוּסְט.",
    en: "I have a week of vacation in August.",
  },
  חֹפֶשׁ: {
    he: "כֻּלָּם רוֹצִים חֹפֶשׁ לְדַבֵּר וְלִבְחֹר.",
    en: "Everyone wants the freedom to speak and to choose.",
  },
  שָׁט: {
    he: "הוּא שָׁט בְּסִירָה קְטַנָּה בַּיָּם.",
    en: "He sailed in a small boat on the sea.",
  },
  שַׁיִט: { he: "יָצָאנוּ לְשַׁיִט בְּסוֹף הַשָּׁבוּעַ.", en: "We went boating at the weekend." },
  עוֹדֵד: {
    he: "הַקָּהָל עוֹדֵד אֶת הַקְּבוּצָה כָּל הַמִּשְׂחָק.",
    en: "The crowd cheered the team on the whole game.",
  },
  עִדּוּד: {
    he: "הוּא קִבֵּל הַרְבֵּה עִדּוּד מִן הַמִּשְׁפָּחָה.",
    en: "He got a lot of encouragement from the family.",
  },
  בִּדֵּר: {
    he: "הַלֵּיצָן בִּדֵּר אֶת הַיְלָדִים בַּמְּסִבָּה.",
    en: "The clown entertained the children at the party.",
  },
  בִּדּוּר: {
    he: "אֵין הַרְבֵּה בִּדּוּר בַּכְּפָר הַקָּטָן.",
    en: "There is not much entertainment in the small village.",
  },
  נֶאֱבַק: {
    he: "הוּא נֶאֱבַק שָׁנִים בַּמַּחֲלָה.",
    en: "He struggled with the illness for years.",
  },
  מַאֲבָק: {
    he: "הָיָה מַאֲבָק אָרֹךְ עַל הַזְּכוּיוֹת שֶׁלָּהֶם.",
    en: "There was a long struggle over their rights.",
  },
  הִתְאַמֵּץ: {
    he: "הוּא הִתְאַמֵּץ מְאוֹד וְהִצְלִיחַ בַּסּוֹף.",
    en: "He exerted himself a lot and succeeded in the end.",
  },
  מַאֲמָץ: {
    he: "זֶה דּוֹרֵשׁ מַאֲמָץ גָּדוֹל מִכֻּלָּנוּ.",
    en: "It demands a big effort from all of us.",
  },
  גָּבַר: {
    he: "הוּא גָּבַר עַל הַיָּרִיב בַּסֵּט הָאַחֲרוֹן.",
    en: "He prevailed over the rival in the last set.",
  },
  הִתְגַּבֵּר: {
    he: "הוּא הִתְגַּבֵּר עַל הַפַּחַד וְקָפַץ.",
    en: "He overcame the fear and jumped.",
  },
  כִּוֵּן: {
    he: "הוּא כִּוֵּן אֶת הַמַּצְלֵמָה אֶל הַשֶּׁמֶשׁ.",
    en: "He aimed the camera at the sun.",
  },
  כִּוּוּן: {
    he: "אֲנִי לֹא בָּטוּחַ בְּאֵיזֶה כִּוּוּן לִנְסֹעַ.",
    en: "I am not sure which direction to drive in.",
  },
  מָתַח: {
    he: "הוּא מָתַח אֶת הַחֶבֶל בֵּין הָעֵצִים.",
    en: "He stretched the rope taut between the trees.",
  },
  מְתִיחָה: {
    he: "עָשִׂינוּ לוֹ מְתִיחָה בְּיוֹם הַהֻלֶּדֶת.",
    en: "We played a prank on him on his birthday.",
  },
  אוֹהֵד: { he: "הוּא אוֹהֵד שָׂרוּף שֶׁל מַכַּבִּי.", en: "He is a die-hard Maccabi fan." },
  אָהַד: {
    he: "הַקָּהָל אָהַד אֶת הַקְּבוּצָה הַצְּעִירָה.",
    en: "The crowd favoured the young team.",
  },
  חָתַר: {
    he: "הוּא חָתַר בַּסִּירָה עַד הַגֶּשֶׁר.",
    en: "He rowed the boat as far as the bridge.",
  },
  חֲתִירָה: {
    he: "חֲתִירָה הִיא סְפּוֹרְט קָשֶׁה לַגַּב.",
    en: "Rowing is a sport that is hard on the back.",
  },
  אוֹפַנַּיִם: {
    he: "קָנִיתִי אוֹפַנַּיִם חֲדָשִׁים לַיֶּלֶד.",
    en: "I bought a new bicycle for the child.",
  },
  אוֹפַנּוֹעַ: {
    he: "הוּא נוֹסֵעַ לָעֲבוֹדָה עַל אוֹפַנּוֹעַ.",
    en: "He rides a motorcycle to work.",
  },
  צָד: { he: "הַזְּאֵב צָד אַרְנָב בַּיַּעַר.", en: "The wolf hunted a rabbit in the forest." },
  צַיִד: {
    he: "יָצָאנוּ לְצַיִד עִם הַכְּלָבִים בַּבֹּקֶר.",
    en: "We went out hunting with the dogs in the morning.",
  },
  הִשְׁתַּזֵּף: {
    he: "הוּא הִשְׁתַּזֵּף כָּל הַיּוֹם עַל הַחוֹף.",
    en: "He sunbathed all day on the beach.",
  },
  שִׁזּוּף: {
    he: "יֵשׁ לָהּ שִׁזּוּף יָפֶה מִן הַקַּיִץ.",
    en: "She has a nice tan from the summer.",
  },
};
