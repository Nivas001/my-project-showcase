import type { VoiceStory } from "@/lib/horror/voice";

/**
 * Tamil · a house where every clock stops at the same minute
 *
 * A puzzle story rather than a haunting: the listener is given one strange fact
 * in the first minute and then handed the pieces to solve it roughly two lines
 * before the narrator does. The half hour is the whole story, and the answer to
 * "why half an hour" is the scare.
 *
 * Paced deliberately slower than `mukkaadu` — long holds, a low fear floor for
 * the first third — because a story whose ending is an arrival has to make the
 * listener want the arrival before it gives them one.
 */
export const padhinonnarai: VoiceStory = {
  slug: "padhinonnarai",
  title: "பதினொன்றரை",
  hook: "அந்த வீட்டில் இருக்கிற எல்லா கடிகாரமும் இரவு பதினொன்றரைக்கு நின்னுடும். ஒவ்வொரு நாளும்.",
  standfirst:
    "A rented house where every clock stops at half past eleven at night. The last tenant died at eleven. The story is about the thirty minutes in between.",
  note: "Narrated in Tamil. With no Tamil voice installed the story still runs — timed, scored, and glossed line by line.",
  lang: "tamil",
  fear: 5,
  minutes: "8-9 min",
  ambience: "hostel",
  tags: ["tamil", "house", "countdown"],
  script: [
    {
      s: "வாடகை ரொம்ப கம்மி. அது தான் முதல் பிரச்சினை.",
      gloss:
        "Vaadagai romba kammi. Adhu thaan mudhal pirachinai. — The rent was very low. That was the first problem.",
      amb: "hostel",
    },
    {
      s: "நடு நகரத்தில் ரெண்டு பெட்ரூம் வீடு, சந்தைக்கு பாதி விலை. நான் கேள்வி கேட்கலை. நான் முட்டாள்.",
      gloss:
        "Nadu nagarathil rendu bedroom veedu, sandhaikku paadhi vilai. Naan kelvi ketkalai. Naan muttaal. — A two-bedroom house in the middle of town at half the market price. I did not ask questions. I was a fool.",
      fear: 2,
    },

    {
      s: "முதல் வாரத்திலேயே கவனிச்சேன்.",
      gloss: "Mudhal vaarathileye kavanichen. — I noticed it in the very first week.",
      fear: 3,
    },
    {
      s: "ஹாலில் இருந்த சுவர் கடிகாரம் பதினொன்றரைல நின்னுருந்தது.",
      gloss:
        "Hall-il irundha suvar kadigaaram padhinonnarai-la ninnurundhadhu. — The wall clock in the hall had stopped at half past eleven.",
      fear: 3,
    },
    {
      s: "பேட்டரி மாத்தினேன். அடுத்த நாள் காலையில, அதே நேரம்.",
      gloss:
        "Battery maathinen. Adutha naal kaalaiyila, adhe neram. — I changed the battery. The next morning, the same time.",
      fear: 5,
      sfx: "knock",
    },
    {
      s: "அது கடிகாரம் தானே-ன்னு விட்டுட்டேன். அப்புறம் என் கைக்கடிகாரம்.",
      gloss:
        "Adhu kadigaaram thaane-nnu vittutten. Appuram en kaikkadigaaram. — It is only a clock, I told myself. Then my wristwatch.",
      fear: 5,
    },
    {
      s: "அப்புறம் மைக்ரோவேவ். அப்புறம் ஓவன். அப்புறம் என் ஃபோன்.",
      gloss:
        "Appuram microwave. Appuram oven. Appuram en phone. — Then the microwave. Then the oven. Then my phone.",
      fear: 7,
      rate: 0.9,
    },
    {
      s: "ஃபோன் கடிகாரம் நிக்காது. அது நெட்வொர்க்கில் இருந்து நேரம் எடுக்கும். ஆனா அன்னிக்கு காலையில அது பதினொன்றரையை காட்டிச்சு.",
      gloss:
        "Phone kadigaaram nikkaadhu. Adhu network-il irundhu neram edukkum. Aanaa annikku kaalaiyila adhu padhinonnaraiyai kaattichu. — A phone clock cannot stop. It takes the time from the network. That morning it read half past eleven.",
      fear: 9,
      sfx: "sting",
      shake: true,
      rate: 0.88,
      hold: 800,
    },

    {
      s: "வீட்டுக்காரர் கிட்ட கேட்டேன். அவரு சிரிச்சாரு. பழைய வீடு, வயரிங் பிரச்சினைன்னாரு.",
      gloss:
        "Veettukkaarar kitta ketten. Avaru sirichaaru. Pazhaiya veedu, wiring pirachinai-nnaaru. — I asked the landlord. He laughed. Old house, wiring trouble, he said.",
      fear: 4,
      rate: 1.0,
    },
    {
      s: "பக்கத்து வீட்டுல ஒரு பாட்டி இருந்தாங்க. அவங்க சிரிக்கலை.",
      gloss:
        "Pakkathu veettula oru paatti irundhaanga. Avanga sirikkalai. — There was an old woman next door. She did not laugh.",
      fear: 6,
      rate: 0.92,
      hold: 500,
    },
    {
      s: "அவங்க ஒரே ஒரு விஷயம் மட்டும் சொன்னாங்க.",
      gloss: "Avanga ore oru vishayam mattum sonnaanga. — She told me one thing only.",
      fear: 6,
    },
    {
      s: "இதுக்கு முன்னாடி இருந்தவரு இறந்துட்டாரு. இரவு சரியா பதினொரு மணிக்கு.",
      gloss:
        "Idhukku munnadi irundhavaru irandhuttaaru. Iravu sariyaa padhinoru manikku. — The man who lived here before died. At exactly eleven at night.",
      fear: 8,
      sfx: "bell",
      rate: 0.85,
      hold: 900,
    },

    {
      s: "பதினொரு மணிக்கு அவரு இறந்தாரு. கடிகாரம் பதினொன்றரைல நிக்குது.",
      gloss:
        "Padhinoru manikku avaru irandhaaru. Kadigaaram padhinonnarai-la nikkudhu. — He died at eleven. The clocks stop at half past.",
      fear: 7,
      amb: "corridor",
      rate: 0.9,
    },
    {
      s: "அந்த முப்பது நிமிஷம். அது தான் என்னை பைத்தியமா ஆக்கிச்சு.",
      gloss:
        "Andha muppadhu nimisham. Adhu thaan ennai paithiyamaa aakkichu. — That thirty minutes. That is what drove me mad.",
      fear: 8,
      rate: 0.88,
      hold: 700,
    },

    {
      s: "நான் ஒரு விஷயம் பண்ணேன். இப்ப நினைச்சா முட்டாள்தனம்.",
      gloss:
        "Naan oru vishayam pannen. Ippa ninaicha muttaalthanam. — I did something. Thinking of it now, it was idiotic.",
      fear: 5,
    },
    {
      s: "வெளியே கேட் கிட்ட இருந்து, என் படுக்கை அறை கதவு வரைக்கும், நடந்து பாத்தேன். நேரம் கணக்கு பண்ணேன்.",
      gloss:
        "Veliye gate kitta irundhu, en padukkai arai kadhavu varaikkum, nadandhu paarthen. Neram kanakku pannen. — I walked from the gate outside to my bedroom door, and I timed it.",
      fear: 6,
      sfx: "steps",
    },
    {
      s: "சாதாரணமா நடந்தா — நாற்பது விநாடி.",
      gloss: "Saadhaaranamaa nadandhaa — narpadhu vinaadi. — Walking normally: forty seconds.",
      rate: 1.0,
    },
    {
      s: "ரொம்ப ரொம்ப மெதுவா நடந்தா — ஒரு அடி, ஒரு நிறுத்தம், ஒரு அடி —",
      gloss:
        "Romba romba medhuvaa nadandhaa — oru adi, oru niruththam, oru adi — — Walking very, very slowly: one step, one stop, one step —",
      fear: 9,
      rate: 0.78,
      sfx: "crawl",
      hold: 900,
    },
    {
      s: "முப்பது நிமிஷம்.",
      gloss: "Muppadhu nimisham. — Thirty minutes.",
      fear: 13,
      sfx: "sting",
      shake: true,
      rate: 0.75,
      hold: 1500,
    },

    {
      s: "அன்னிக்கு ராத்திரி நான் தூங்கலை. விளக்கு எல்லாம் அணைச்சுட்டு, கட்டில்ல உட்கார்ந்தேன்.",
      gloss:
        "Annikku raathiri naan thoongalai. Vilakku ellaam anaichuttu, kattil-la utkaarnthen. — That night I did not sleep. I switched off every light and sat on the bed.",
      fear: 8,
      amb: "silence",
    },
    {
      s: "பதினொரு மணி. வெளியே கேட் திறந்தது.",
      gloss:
        "Padhinoru mani. Veliye gate thirandhadhu. — Eleven o'clock. Outside, the gate opened.",
      fear: 12,
      sfx: "door",
      shake: true,
      rate: 0.85,
      hold: 1000,
    },
    {
      s: "காத்து இல்லை. நாய் குரைக்கலை. ஒரே ஒரு சத்தம் தான் — கேட் திறந்தது, மூடலை.",
      gloss:
        "Kaathu illai. Naai kuraikkalai. Ore oru satham thaan — gate thirandhadhu, moodalai. — No wind. No dog barked. One sound only: the gate opened, and did not close.",
      fear: 9,
      rate: 0.88,
    },

    {
      s: "நான் எண்ண ஆரம்பிச்சேன்.",
      gloss: "Naan enna aarambichen. — I began to count.",
      fear: 7,
      rate: 0.9,
      hold: 600,
    },
    {
      s: "ஐந்து நிமிஷத்துல வராந்தா. ஒவ்வொரு அடியும் தனியா கேட்டுச்சு.",
      gloss:
        "Ainthu nimishathula veraandhaa. Ovvoru adiyum thaniyaa kettuchu. — At five minutes, the verandah. Every step arrived on its own.",
      fear: 9,
      sfx: "steps",
    },
    {
      s: "பதினைந்து நிமிஷத்துல ஹால்.",
      gloss: "Padhinainthu nimishathula hall. — At fifteen minutes, the hall.",
      fear: 10,
      sfx: "crawl",
      rate: 0.85,
    },
    {
      s: "இருபத்தி ஐந்து நிமிஷத்துல — கதவுக்கு வெளியே.",
      gloss:
        "Irubathi ainthu nimishathula — kadhavukku veliye. — At twenty-five minutes: just outside the door.",
      fear: 13,
      sfx: "breath",
      shake: true,
      rate: 0.8,
      hold: 1200,
    },
    {
      s: "இருபத்தி ஒன்பது நிமிஷம். ஒன்னும் இல்லை. ஒரு சத்தமும் இல்லை.",
      gloss:
        "Irubathi onbadhu nimisham. Onnum illai. Oru sathamum illai. — Twenty-nine minutes. Nothing. Not one sound.",
      fear: 11,
      amb: "silence",
      rate: 0.82,
      hold: 1400,
    },

    {
      s: "அப்புறம் என் ஃபோன் ஒளிர்ந்தது.",
      gloss: "Appuram en phone olirndhadhu. — Then my phone lit up.",
      fear: 12,
      sfx: "phone",
      rate: 0.85,
      hold: 800,
    },
    {
      s: "பதினொன்றரை.",
      gloss: "Padhinonnarai. — Half past eleven.",
      fear: 16,
      sfx: "flatline",
      shake: true,
      rate: 0.72,
      hold: 1800,
    },
    {
      s: "அப்பத்தான் எனக்கு புரிஞ்சது. கடிகாரம் அவரு செத்த நேரத்தை காட்டலை.",
      gloss:
        "Appathaan enakku purinjadhu. Kadigaaram avaru chetha nerathai kaattalai. — That is when I understood. The clocks are not showing the time he died.",
      fear: 10,
      rate: 0.85,
    },
    {
      s: "அது வந்து சேர்ற நேரத்தை காட்டுது.",
      gloss: "Adhu vandhu serra nerathai kaattudhu. — They are showing the time it arrives.",
      speaker: "other",
      fear: 15,
      rate: 0.72,
      pitch: 0.84,
      sfx: "reverse",
      hold: 1600,
    },
    {
      s: "எல்லா கடிகாரமும் அந்த நேரத்துல நிக்குது — ஏன்னா, அதுக்கு அப்புறம் எத்தனை நேரம் ஆச்சுன்னு நான் தெரிஞ்சுக்கக் கூடாது.",
      gloss:
        "Ellaa kadigaaramum andha nerathula nikkudhu — yennaa, adhukku appuram ethanai neram aachunnu naan therinjukkak koodaadhu. — Every clock stops there for one reason: so that I cannot tell how long it has been standing in the room.",
      fear: 18,
      rate: 0.72,
      sfx: "riser",
      hold: 2000,
    },

    {
      s: "நான் அந்த வீட்டை காலி பண்ணிட்டேன். ரெண்டு வருஷம் ஆச்சு.",
      gloss:
        "Naan andha veettai kaali pannitten. Rendu varusham aachu. — I moved out of that house. That was two years ago.",
      fear: 8,
      amb: "street",
      rate: 0.92,
    },
    {
      s: "புது வீடு. புது ஊரு. எல்லாம் நல்லா இருக்கு.",
      gloss:
        "Pudhu veedu. Pudhu ooru. Ellaam nallaa irukku. — New house. New town. Everything is fine.",
      rate: 1.0,
      hold: 500,
    },
    {
      s: "ஒரே ஒரு விஷயம் தான்.",
      gloss: "Ore oru vishayam thaan. — Only one thing.",
      fear: 9,
      rate: 0.85,
      hold: 900,
    },
    {
      s: "இப்ப என் கடிகாரம் பதினொன்றரைல நிக்கலை.",
      gloss:
        "Ippa en kadigaaram padhinonnarai-la nikkalai. — Now my clocks do not stop at half past eleven.",
      fear: 10,
      rate: 0.82,
      hold: 1100,
    },
    {
      s: "பதினொரு மணி பத்து நிமிஷத்துல நிக்குது.",
      gloss: "Padhinoru mani pathu nimishathula nikkudhu. — They stop at ten past eleven.",
      speaker: "other",
      fear: 16,
      rate: 0.7,
      pitch: 0.82,
      shake: true,
      hold: 1600,
    },
    {
      s: "இந்த வீடு சின்னது.",
      gloss: "Indha veedu chinnadhu. — This house is smaller.",
      speaker: "other",
      fear: 14,
      rate: 0.66,
      pitch: 0.8,
      sfx: "flatline",
      hold: 2200,
    },
  ],
};
