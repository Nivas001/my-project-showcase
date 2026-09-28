import type { VoiceStory } from "@/lib/horror/voice";

/**
 * Tamil · the night watch beside a body · two rules, one broken
 *
 * Built on a real custom rather than an invented one: in much of Tamil Nadu the
 * body is not left alone before the cremation, and somebody sits with it until
 * dawn. That is the whole engine. The story adds two prohibitions and then
 * spends forty lines making the listener want one of them broken.
 *
 * Every line carries a transliteration and an English sense, so a listener who
 * does not read the script can still follow it line by line. The gloss is never
 * a full translation — it is the meaning, not the words, because a word-for-word
 * gloss in a horror story gives the ending away two lines early.
 */
export const mukkaadu: VoiceStory = {
  slug: "mukkaadu",
  title: "முக்காடு",
  hook: "இரவு முழுக்க உடலோடு உட்கார்ந்திருக்கணும். முக்காட்டை எடுக்கக்கூடாது. பதில் சொல்லக்கூடாது.",
  standfirst:
    "A grandson sits the night watch beside his grandmother's body. Two rules: do not lift the veil, and whatever you hear, do not answer it.",
  note: "Narrated in Tamil. If your device has no Tamil voice installed, the story still runs as a timed reading with the full sound design — and the transliteration under each line carries you through.",
  lang: "tamil",
  fear: 5,
  minutes: "8-9 min",
  ambience: "rain",
  tags: ["tamil", "folk horror", "night watch"],
  script: [
    {
      s: "இது நடந்தது பத்து வருஷத்துக்கு முன்னாடி.",
      gloss: "Idhu nadandhadhu pathu varushathukku munnadi. — This happened ten years ago.",
      amb: "rain",
    },
    {
      s: "என் பாட்டி இறந்த அன்று இரவு, அந்த வீட்டில் நான் மட்டும் தான் விழித்திருந்தேன்.",
      gloss:
        "En paatti irandha andru iravu, andha veettil naan mattum thaan vizhithirundhen. — The night my grandmother died, I was the only one awake in that house.",
      fear: 3,
    },
    {
      s: "எங்க ஊரில் ஒரு வழக்கம் இருக்கு.",
      gloss: "Enga ooril oru vazhakkam irukku. — There is a custom in our village.",
    },
    {
      s: "உடலை விடியற்காலை வரை தனியா விடக்கூடாது.",
      gloss:
        "Udalai vidiyarkaalai varai thaniyaa vidakoodaadhu. — The body must not be left alone until dawn.",
      fear: 3,
    },
    {
      s: "யாராவது ஒருத்தர் பக்கத்தில் உட்கார்ந்திருக்கணும். அன்னிக்கு அது நான்.",
      gloss:
        "Yaaraavadhu oruthar pakkathil utkaarndhirukkanum. Annikku adhu naan. — Someone must sit beside it. That night, it was me.",
    },

    {
      s: "போற முன்னாடி என் சித்தப்பா ரெண்டு விதி சொன்னாரு.",
      gloss:
        "Pora munnadi en chithappa rendu vidhi sonnaru. — Before he left, my uncle gave me two rules.",
      fear: 4,
      hold: 300,
    },
    {
      s: "ஒன்னு — முகத்தை மூடியிருக்கும் முக்காட்டை எடுக்கவே கூடாது.",
      gloss:
        "Onnu — mugathai moodiyirukkum mukkaattai edukkave koodaadhu. — One: never lift the veil covering the face.",
      fear: 4,
    },
    {
      s: "ரெண்டு — என்ன கேட்டாலும், பதில் சொல்லக்கூடாது.",
      gloss:
        "Rendu — enna kettaalum, badhil sollakoodaadhu. — Two: whatever you hear, do not answer it.",
      fear: 6,
      rate: 0.88,
      hold: 700,
    },
    {
      s: "காரணம் கேட்டேன். அவரு பதில் சொல்லலை. கதவை சாத்திட்டு போயிட்டாரு.",
      gloss:
        "Kaaranam ketten. Avaru badhil sollalai. Kadhavai saathittu poyittaaru. — I asked why. He did not answer. He closed the door and left.",
      fear: 4,
      sfx: "door",
    },

    {
      s: "பன்னிரண்டு மணி வரை ஒன்னும் நடக்கலை.",
      gloss: "Panniradu mani varai onnum nadakkalai. — Until twelve o'clock, nothing happened.",
      rate: 1.02,
    },
    {
      s: "மண்ணெண்ணெய் விளக்கு எரிஞ்சுகிட்டு இருந்தது. வெளியே மழை.",
      gloss:
        "Mannennai vilakku erinjukittu irundhadhu. Veliye mazhai. — The kerosene lamp was burning. Rain outside.",
      amb: "rain",
      fear: 2,
    },
    {
      s: "உள்ளே நானும், அவங்களும், அந்த வெள்ளைத் துணியும்.",
      gloss:
        "Ulle naanum, avangalum, andha vellai thuniyum. — Inside: me, her, and that white cloth.",
      fear: 4,
      hold: 500,
    },

    {
      s: "ஒரு மணிக்கு, முக்காடு அசைஞ்சது.",
      gloss: "Oru manikku, mukkaadu asainjadhu. — At one o'clock, the veil moved.",
      fear: 8,
      sfx: "scrape",
      rate: 0.9,
      hold: 600,
    },
    {
      s: "காத்து இல்லை. ஜன்னல் எல்லாம் மூடியிருந்தது. நான் சரி பார்த்தேன்.",
      gloss:
        "Kaathu illai. Jannal ellaam moodiyirundhadhu. Naan sari paarthen. — There was no wind. Every window was shut. I checked.",
      fear: 5,
    },
    {
      s: "நான் என்னையே சமாதானப்படுத்திக்கிட்டேன். பயம் தான், வேற ஒன்னும் இல்லை.",
      gloss:
        "Naan ennaiye samaadhaanapaduthikitten. Bayam thaan, vera onnum illai. — I talked myself down. It was only fear, nothing else.",
      rate: 1.02,
    },

    {
      s: "ரெண்டு மணிக்கு, அது மறுபடியும் அசைஞ்சது.",
      gloss: "Rendu manikku, adhu marubadiyum asainjadhu. — At two o'clock, it moved again.",
      fear: 7,
      sfx: "crawl",
    },
    {
      s: "இந்த தடவை — உள்ளிருந்து.",
      gloss: "Indha thadavai — ullirundhu. — This time — from underneath.",
      fear: 11,
      sfx: "sting",
      shake: true,
      rate: 0.82,
      hold: 1100,
    },

    {
      s: "மூணு மணிக்கு, பாட்டி பேசினாங்க.",
      gloss: "Moonu manikku, paatti pesinaanga. — At three o'clock, my grandmother spoke.",
      fear: 9,
      amb: "silence",
      rate: 0.85,
      hold: 700,
    },
    {
      s: "கண்ணா. விளக்கை அணைக்காதே.",
      gloss: 'Kanna. Vilakkai anaikkaadhe. — "Child. Do not put out the lamp."',
      speaker: "voice",
      fear: 10,
      sfx: "whisper",
      rate: 0.85,
      hold: 800,
    },
    {
      s: "அது அவங்க குரல். சந்தேகமே இல்லை. நாற்பது வருஷம் கேட்ட குரல்.",
      gloss:
        "Adhu avanga kural. Sandhegame illai. Narpadhu varusham ketta kural. — It was her voice. No doubt at all. A voice I had heard for forty years.",
      fear: 7,
    },
    {
      s: "வாயை மூடிக்கிட்டேன். பதில் சொல்லலை.",
      gloss: "Vaayai moodikitten. Badhil sollalai. — I shut my mouth. I did not answer.",
      fear: 6,
      rate: 0.92,
    },

    {
      s: "அப்புறம் அது கேக்க ஆரம்பிச்சது.",
      gloss: "Appuram adhu kekka aarambichadhu. — Then it began to ask.",
      fear: 8,
      rate: 0.88,
    },
    {
      s: "நீ சாப்பிட்டியா? ஜன்னல் பக்கம் யாரு நிக்கிறாங்க? எனக்கு ஏன் குளிருது?",
      gloss:
        'Nee saapittiyaa? Jannal pakkam yaaru nikkiraanga? Enakku en kuliradhu? — "Have you eaten? Who is standing by the window? Why am I cold?"',
      speaker: "voice",
      fear: 10,
      sfx: "whisper",
      rate: 0.88,
    },
    {
      s: "ஒவ்வொரு கேள்வியும் என்னை பேச வைக்க முயற்சி பண்ணிச்சு.",
      gloss:
        "Ovvoru kelviyum ennai pesa vaikka muyarchi pannichu. — Every question was trying to make me speak.",
      fear: 7,
      rate: 0.9,
    },
    {
      s: "ஒரு கேள்வி மட்டும் ரொம்ப கஷ்டமா இருந்தது.",
      gloss: "Oru kelvi mattum romba kashtamaa irundhadhu. — One question was very hard.",
      fear: 6,
      hold: 500,
    },
    {
      s: "கண்ணா, நான் இறந்துட்டேனா?",
      gloss: 'Kanna, naan irandhutteinaa? — "Child. Am I dead?"',
      speaker: "voice",
      fear: 12,
      sfx: "breath",
      rate: 0.8,
      hold: 1200,
    },

    {
      s: "நாலு மணிக்கு, விளக்கு அணைஞ்சது.",
      gloss: "Naalu manikku, vilakku anainjadhu. — At four o'clock, the lamp went out.",
      fear: 10,
      sfx: "drop",
      shake: true,
      rate: 0.85,
      hold: 900,
    },
    {
      s: "காத்து இல்லாம. எண்ணெய் இருந்தது. திரி இருந்தது.",
      gloss:
        "Kaathu illaama. Ennai irundhadhu. Thiri irundhadhu. — Without any wind. There was oil. There was wick.",
      fear: 8,
    },
    {
      s: "இருட்டில், ரொம்ப ரொம்ப பக்கத்தில், அவங்க சொன்னாங்க:",
      gloss:
        "Iruttil, romba romba pakkathil, avanga sonnaanga: — In the dark, very close, she said:",
      fear: 11,
      rate: 0.82,
      hold: 800,
    },
    {
      s: "நீ பதில் சொல்லலை. நல்லது.",
      gloss: 'Nee badhil sollalai. Nalladhu. — "You did not answer. Good."',
      speaker: "other",
      fear: 12,
      rate: 0.72,
      pitch: 0.85,
      hold: 900,
    },
    {
      s: "அப்படின்னா, இந்த ரூம்ல ரெண்டு பேரு பதில் சொல்லலை.",
      gloss:
        'Appadinnaa, indha room-la rendu peru badhil sollalai. — "Then there are two of us in this room who did not answer."',
      speaker: "other",
      fear: 16,
      sfx: "reverse",
      shake: true,
      rate: 0.7,
      pitch: 0.82,
      hold: 1600,
    },

    {
      s: "மீதி இரவு எப்படி போச்சுன்னு எனக்கு நினைவில்லை.",
      gloss:
        "Meedhi iravu eppadi pochunnu enakku ninaivillai. — I do not remember how the rest of the night passed.",
      fear: 6,
      amb: "silence",
      rate: 0.92,
    },
    {
      s: "விடியற்காலை ஐந்து மணிக்கு என் அம்மா வந்தாங்க. கதவை திறந்தாங்க.",
      gloss:
        "Vidiyarkaalai ainthu manikku en amma vandhaanga. Kadhavai thirandhaanga. — At five in the morning my mother came. She opened the door.",
      fear: 5,
      sfx: "door",
    },
    {
      s: "அவங்க கத்தலை. அழலை. ஒரே ஒரு கேள்வி தான் கேட்டாங்க.",
      gloss:
        "Avanga kathalai. Azhalai. Ore oru kelvi thaan kettaanga. — She did not scream. She did not cry. She asked one question only.",
      fear: 8,
      rate: 0.88,
      hold: 700,
    },
    {
      s: "நீ ஏன் முக்காட்டுக்கு உள்ள படுத்திருக்க?",
      gloss: 'Nee en mukkaattukku ulla paduthirukka? — "Why are you lying underneath the veil?"',
      speaker: "voice",
      fear: 18,
      sfx: "riser",
      shake: true,
      rate: 0.75,
      hold: 2000,
    },
    {
      s: "நான் பதில் சொல்லலை.",
      gloss: "Naan badhil sollalai. — I did not answer.",
      fear: 10,
      rate: 0.72,
      hold: 1400,
    },
    {
      s: "இன்னும் சொல்லலை.",
      gloss: "Innum sollalai. — I still have not.",
      speaker: "other",
      fear: 12,
      rate: 0.68,
      pitch: 0.8,
      sfx: "flatline",
      hold: 2000,
    },
  ],
};
