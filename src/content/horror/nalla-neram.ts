import type { Story } from "@/lib/horror/types";

/**
 * Tanglish, on a night road. The horror is a rule about time rather than a
 * place: between 3:00 and 3:30 you do not take a fare, and everyone in the
 * trade knows it, and nobody will say why in daylight.
 */
export const nallaNeram: Story = {
  slug: "nalla-neram",
  title: "Nalla Neram",
  hook: "Auto-la night shift. 3 AM to 3:30 AM sawari eduka koodadhu — ellarukkum theriyum. Inniki oruthan kai kaatraan.",
  tags: ["tanglish", "night road", "chennai"],
  fear: 5,
  minutes: "7-9 min",
  ambience: "street",
  lang: "tanglish",
  kind: "read",
  endings: 4,
  nodes: {
    start: [
      { t: "text", s: "Night shift-la auto ottradhu oru kanakku. Airport drops till one, then the IT crowd till two-thirty, then nothing until the fish market at four.", amb: "street", fear: 4 },
      { t: "text", s: "In between there is a half hour that nobody in the union talks about in daylight. 3:00 to 3:30. Un mama sollirupaaru, un driver friend sollirupaan, everybody tells you once and nobody explains.", fear: 8 },
      { t: "text", s: "Moonu manikku mela, moonare varaikkum, sawari edukka koodadhu.", slow: true, fear: 12 },
      { t: "text", s: "Twenty-two years you have followed it. Twenty-two years you have parked at the Kotturpuram signal at 2:55 and drunk tea and watched the road and started again at 3:31.", fear: 10 },
      { t: "text", s: "Today the tea shop is shut. Today your daughter's fees are due on Monday. Today the meter reads 3:04 and somebody at the far end of the bridge is waving.", sfx: "sting", fear: 20 },
      { t: "text", s: "A man. Office shirt. Bag. Standing exactly where a person would stand if they wanted an auto.", fear: 22 },
      {
        t: "choice",
        prompt: "Bridge-la vera yaarum illa. Just him, and the sodium lights, and you.",
        timer: 180,
        options: [
          { label: "Drive past. Rule is a rule.", go: "past", fear: 8 },
          { label: "Stop. It's just a man. Fees are fees.", go: "stop", fear: 18 },
          { label: "Slow down and look properly first.", go: "look", fear: 14 },
        ],
      },
    ],

    /* ---------------------------------------------------------------- */

    past: [
      { t: "text", s: "You look at the road and you keep the throttle where it is and you go past him at forty.", fear: 10 },
      { t: "text", s: "In the mirror he does not turn to watch you go. He keeps waving at the empty road, patiently, at nothing.", slow: true, fear: 18 },
      { t: "text", s: "You breathe out. Twenty-two years, still intact. You take the left at the end of the bridge towards the market.", fear: -6 },
      { t: "text", s: "There is a man at the corner. Office shirt. Bag. Waving.", slow: true, sfx: "sting", shake: true, fear: 28 },
      { t: "text", s: "Same man. He could not have got here. You did the bridge in ninety seconds and he was at the other end of it.", fear: 30 },
      {
        t: "choice",
        timer: 180,
        options: [
          { label: "Keep going. Don't slow down.", go: "keepgoing", fear: 16 },
          { label: "Stop and ask him what he wants.", go: "askhim", fear: 24 },
          { label: "Turn around. Go home. Shift over.", go: "gohome", fear: 12 },
        ],
      },
    ],

    look: [
      { t: "text", s: "You roll off the throttle and come down to twenty and you look at him the way twenty-two years teaches you to look at a fare at night.", fear: 14 },
      { t: "text", s: "Shirt is ironed. Shoes are polished. Bag is a proper office bag, not a cheap one.", fear: 12 },
      { t: "text", s: "No sweat. It is May in Chennai at three in the morning and the man has no sweat on him at all.", slow: true, fear: 24 },
      { t: "text", s: "And he is standing in the road. Not on the footpath. In the middle of the left lane, where nobody who has ever driven anything would stand.", sfx: "whisper", fear: 30 },
      { t: "text", s: "As you come level he turns his head to follow you, and the rest of him takes half a second longer to decide to follow the head.", slow: true, sfx: "sting", shake: true, fear: 38 },
      {
        t: "choice",
        prompt: "Handle is in your hand. Bridge is empty. You have about one second.",
        timer: 180,
        options: [
          { label: "Throttle. Go.", go: "keepgoing", fear: 14 },
          { label: "Stop anyway. Find out.", go: "stop", fear: 26 },
        ],
      },
    ],

    stop: [
      { t: "text", s: "You stop. The engine idles that rattling idle that every auto in this city has.", sfx: "door", fear: 20 },
      { t: "text", s: "\"Enga saar?\"", as: "voice", fear: 18 },
      { t: "text", s: "\"Besant Nagar,\" he says. Normal voice. Slightly tired. Perfectly reasonable man going home from a perfectly reasonable late shift.", as: "voice", fear: 16 },
      { t: "text", s: "He gets in behind you. The auto does not dip on its springs.", slow: true, sfx: "reverse", fear: 32 },
      { t: "text", s: "Twenty-two years. You know exactly what this vehicle does when a grown man sits in the back, and it did not do it.", fear: 34 },
      { t: "text", s: "\"Poongo saar,\" he says.", as: "voice", fear: 30 },
      {
        t: "choice",
        prompt: "Mirror-la paakalama? Or just drive?",
        timer: 180,
        options: [
          { label: "Drive. Don't look in the mirror.", go: "dontlook", fear: 20 },
          { label: "Look in the mirror.", go: "mirror", fear: 28 },
          { label: "Tell him to get out.", go: "getout", fear: 24 },
        ],
      },
    ],

    /* ---------------------------------------------------------------- */

    dontlook: [
      { t: "text", s: "You drive. You look at the road. You look at the road so hard that you could describe every pothole between Kotturpuram and the beach.", fear: 22 },
      { t: "text", s: "He does not talk. He does not move. Behind you there is no weight and no sound and no smell of a man.", fear: 26 },
      { t: "text", s: "At the Adyar signal he says, conversationally: \"Neenga rule follow panreenga-la saar. Ippo ean break panneenga?\"", as: "voice", sfx: "whisper", slow: true, fear: 36 },
      { t: "text", s: "He knows about the rule. Twenty-two years and you have never said it out loud to a passenger.", fear: 34 },
      {
        t: "choice",
        timer: 180,
        options: [
          { label: "\"Fees kattanum saar.\" Tell him the truth.", go: "truth", fear: 16 },
          { label: "Say nothing. Keep driving.", go: "nothing", fear: 22 },
        ],
      },
    ],

    truth: [
      { t: "text", s: "\"Ponnu fees saar. Monday last date. Konjam kammi aaguthu.\"", as: "voice", fear: 14 },
      { t: "text", s: "The back of the auto is quiet for a while. When he speaks again he sounds, of all things, sympathetic.", fear: 18 },
      { t: "text", s: "\"Enakkum ponnu iruntha,\" he says. \"Naanum indha time-la thaan velaila irundhen.\"", as: "voice", slow: true, fear: 26 },
      { t: "text", s: "Past tense. Iruntha. Irundhen. Every verb he uses about himself is finished.", slow: true, sfx: "sting", fear: 34 },
      { t: "text", s: "\"Besant Nagar vandhurichu saar,\" you say, because it has, and because you want this over.", as: "voice", amb: "sea", fear: 30 },
      { t: "text", s: "\"Aamaam,\" he says. \"Innaiku naan iranguven. Meter enna aachu?\"", as: "voice", fear: 28 },
      {
        t: "choice",
        prompt: "Meter-la 3:29. Fare-la eighty rupees.",
        timer: 180,
        options: [
          { label: "\"Enbadhu saar.\" Take the fare.", go: "takefare", fear: 20 },
          { label: "\"Venaam saar. Poyittu vaanga.\" Refuse it.", go: "refuse", fear: 10 },
        ],
      },
    ],

    takefare: [
      { t: "text", s: "\"Enbadhu saar.\"", as: "voice", fear: 20 },
      { t: "text", s: "He puts the money into your hand. It is warm. It is the only warm thing that has been in this auto since the bridge.", sfx: "breath", fear: 26 },
      { t: "text", s: "\"Nandri,\" he says, and gets out, and walks towards the beach road, and does not cast a shadow under the sodium light, and you do not point this out.", slow: true, fear: 30 },
      { t: "text", s: "Meter: 3:31. The half hour is over. You have survived it.", amb: "street", fear: -10 },
      { t: "text", s: "At the fish market at four you count the money to pay for tea. Eighty rupees, four twenties, and every note has the same serial number.", slow: true, sfx: "sting", shake: true, fear: 34 },
      {
        t: "ending",
        id: "same-serial",
        outcome: "doomed",
        title: "Ore Number",
        lines: [
          "The fees get paid on Monday. The notes work perfectly well; nobody at the school looks at serial numbers.",
          "Every night after that, at 3:04, wherever you are in the city, there is a man in an office shirt at the side of the road, waving.",
          "You have never stopped again and he has never stopped waving, and one day you will retire and sell the auto, and you have started to worry, quite seriously, about who buys it.",
        ],
      },
    ],

    refuse: [
      { t: "text", s: "\"Venaam saar.\" You put your hand up. \"Idhu rule-a udacha thappu. Kaasu vaanga maaten.\"", as: "voice", fear: 12 },
      { t: "text", s: "The back of the auto is silent for long enough that you turn around, finally, and there is nobody there, and there has not been for some time.", slow: true, amb: "sea", hold: 1300, fear: 26 },
      { t: "text", s: "On the seat there is a dry patch of sand in the shape of somebody sitting. Nothing else.", sfx: "wind", fear: 22 },
      { t: "text", s: "Meter: 3:31.", fear: -12 },
      {
        t: "ending",
        id: "kaasu-vaangala",
        outcome: "survived",
        title: "Kaasu Vaangala",
        lines: [
          "You drive home in the dark with an empty auto and no fare and a daughter's fees still short by six hundred rupees.",
          "Your brother-in-law lends you the six hundred on Sunday and is insufferable about it for a year. You let him be. It is the cheapest six hundred rupees anyone in this city has ever paid.",
          "The rule, as far as you can tell, is not about the half hour. It is about the fare. You took the ride and gave it back, and that turned out to be a thing you are allowed to do exactly once.",
        ],
      },
    ],

    nothing: [
      { t: "text", s: "You say nothing. You drive. The road does the rest.", fear: 24 },
      { t: "text", s: "\"Pesa maateengala?\" he says. \"Paravaala. Naanum modhalla pesala.\"", as: "voice", slow: true, sfx: "whisper", fear: 32 },
      { t: "text", s: "\"Ennaiyum oruthar kootitu vandhaaru. Ivvalavu thoorame. Avarum pesala.\"", as: "voice", fear: 36 },
      { t: "text", s: "In the mirror — you did not mean to look, your eyes went on their own — the back seat is empty, and the front seat, beside you, is not.", slow: true, sfx: "sting", shake: true, fear: 46 },
      {
        t: "ending",
        id: "front-seat",
        outcome: "worst",
        title: "Munnaadi",
        lines: [
          "The auto is found at 6 AM on the beach road, engine running, meter on, keys in it.",
          "The union collects for the family, the way they always do, and the older drivers pay more than they can afford and do not say why.",
          "There is a man on the Kotturpuram bridge at three in the morning now, in a lungi and a khaki shirt, waving at autos. Every driver in the city knows to go past him. Nobody explains it to the new boys, because explaining it is how it gets you.",
        ],
      },
    ],

    mirror: [
      { t: "text", s: "Mirror. You have adjusted this mirror ten thousand times. You could find your own eye in it blindfolded.", fear: 26 },
      { t: "text", s: "The back seat is empty. Torn rexine, your daughter's school sticker, the little Murugan photo on the frame. No man.", slow: true, fear: 32 },
      { t: "text", s: "\"Pochaa saar?\" says the man who is not there, from exactly where he is not sitting.", as: "voice", sfx: "whisper", shake: true, fear: 40 },
      { t: "text", s: "\"Mirror-la paakathenga saar,\" he says, kindly. \"Adhu mattum en velaila varaadhu.\"", as: "voice", slow: true, fear: 42 },
      {
        t: "choice",
        prompt: "The road ahead is empty. The beach is four minutes away.",
        timer: 180,
        options: [
          { label: "Drive him to Besant Nagar. Finish the ride.", go: "finish", fear: 20 },
          { label: "Stop the auto. Get out. Walk away.", go: "walkaway", fear: 26 },
          { label: "Say the temple line your mother taught you.", go: "prayer", fear: 16 },
        ],
      },
    ],

    getout: [
      { t: "text", s: "\"Saar, irangunga. Naan indha time-la ottamaaten.\"", as: "voice", fear: 22 },
      { t: "text", s: "\"Theriyum,\" he says. \"Adhukkaga thaan ungala kooptten. Vera yaarum nikkala.\"", as: "voice", slow: true, sfx: "whisper", fear: 34 },
      { t: "text", s: "You pull the brake and swing round in the seat to shout at him properly, the way twenty-two years of this city teaches you to shout.", fear: 28 },
      { t: "text", s: "The back is empty. The seat is dry. The bag is on the floor, though, standing up, office bag, zip closed.", slow: true, sfx: "sting", fear: 38 },
      {
        t: "choice",
        prompt: "Three-twenty on the meter. The bag has not moved.",
        timer: 180,
        options: [
          { label: "Throw the bag out onto the road.", go: "throwbag", fear: 20 },
          { label: "Open the bag.", go: "openbag", fear: 30 },
          { label: "Drive to Besant Nagar with it. Deliver it.", go: "deliver", fear: 18 },
        ],
      },
    ],

    /* ---------------------------------------------------------------- */

    keepgoing: [
      { t: "text", s: "You do not stop. You take the corner at a speed the auto disapproves of and you keep the throttle open all the way down the empty road.", fear: 20 },
      { t: "text", s: "Every junction. Every single junction. Office shirt. Bag. Waving.", slow: true, sfx: "steps", fear: 32 },
      { t: "text", s: "Not chasing. Waiting. He is at each corner before you are, the way a thing is that does not need to travel.", fear: 34 },
      { t: "text", s: "At the eighth junction he is not waving. He has his hand down and he is watching you, and he looks like a man whose patience is a working tool.", sfx: "sting", shake: true, fear: 40 },
      { t: "text", s: "Meter: 3:27. Three minutes.", fear: 38 },
      {
        t: "choice",
        prompt: "Moonu nimisham. You can hold out three minutes.",
        timer: 180,
        options: [
          { label: "Stop the auto and switch the engine off. Wait it out.", go: "waitout", fear: 22 },
          { label: "Keep driving until 3:31.", go: "until", fear: 24 },
        ],
      },
    ],

    waitout: [
      { t: "text", s: "You pull into a side street, kill the engine, and sit in an auto in the dark in the middle of Chennai with your hands on your knees.", amb: "silence", fear: 26 },
      { t: "text", s: "3:28. Nothing. 3:29. Nothing. The city has never been this quiet and you have driven it at every hour there is.", hold: 1100, fear: 30 },
      { t: "text", s: "3:30. Somebody gets into the back of the auto.", slow: true, sfx: "sting", shake: true, fear: 44 },
      { t: "text", s: "Not a footstep. Not a door. The springs move, this time, properly, the way they should have on the bridge.", fear: 42 },
      { t: "text", s: "\"Ippo sari-aa irukku,\" he says. \"Rule-la sollirukka, moonare varaikkum. Naan waiting panniten.\"", as: "voice", slow: true, fear: 48 },
      { t: "text", s: "Meter: 3:31.", hold: 1200, fear: 46 },
      {
        t: "ending",
        id: "he-waited-too",
        outcome: "worst",
        title: "Avanum Wait Panninaan",
        lines: [
          "Nobody ever explained the rule because the rule is not protection. It is a schedule.",
          "Between three and three-thirty, nothing can take a fare from you. After three-thirty, everything is allowed, and the only drivers it ever finds are the ones who stopped moving to be safe.",
          "The auto is found in the side street with the key in it. The union collects. A tea shop near Kotturpuram closes at 2:45 every night now instead of staying open, and the owner will tell you it is not worth it after midnight, and that is all he will tell you.",
        ],
      },
    ],

    until: [
      { t: "text", s: "You drive. Not to anywhere. Just drive — a circuit of the same four roads, fast, in an old auto, at three in the morning, like a fool or a man with a plan.", fear: 26 },
      { t: "text", s: "He is at every corner and he never gets in and you never slow down.", sfx: "steps", fear: 30 },
      { t: "text", s: "3:29. 3:30.", slow: true, fear: 34 },
      { t: "text", s: "3:31.", slow: true, hold: 1400, sfx: "bell", amb: "street", fear: 12 },
      { t: "text", s: "The next corner is empty. So is the one after it. So is the whole city, in the ordinary way a city is empty at half past three.", fear: -14 },
      { t: "text", s: "You stop and your hands shake for four full minutes and then you go to the fish market and drink tea like a human being.", fear: -18 },
      {
        t: "ending",
        id: "drove-it-out",
        outcome: "survived",
        title: "Moonare Vandhurichu",
        lines: [
          "You do the fish market run at four and two airport pickups after that and you are home by nine.",
          "Your daughter's fees get paid on Monday, late by one day, with a fine of a hundred rupees that you pay without complaining once.",
          "You have never broken the rule again, and you have started telling the new boys — properly, out loud, in daylight, with the reason — and half of them laugh, and the half that do not are the half that keep asking you questions afterwards.",
        ],
      },
    ],

    askhim: [
      { t: "text", s: "You stop three metres short of him, engine running, in gear, ready.", fear: 24 },
      { t: "text", s: "\"Saar. Neenga bridge-la nindhinga. Ippo inga. Eppadi?\"", as: "voice", fear: 26 },
      { t: "text", s: "He thinks about it. He genuinely thinks about it, like a man being asked a question about his own job that nobody has asked before.", fear: 22 },
      { t: "text", s: "\"Enakku theriyala saar,\" he says at last. \"Naan nirkiren. Autos varum. Andha rendukkum naduvula enna nadakkuthu nu enakku theriyaadhu.\"", as: "voice", slow: true, fear: 32 },
      { t: "text", s: "He says it sadly, and it is the first true thing anything has said tonight, and that is exactly what makes it unbearable.", sfx: "breath", fear: 36 },
      {
        t: "choice",
        timer: 180,
        options: [
          { label: "\"Yaaru neenga saar?\" Ask his name.", go: "hisname", fear: 22 },
          { label: "Leave him. Drive away.", go: "until", fear: 18 },
        ],
      },
    ],

    hisname: [
      { t: "text", s: "\"Unga per enna saar?\"", as: "voice", fear: 22 },
      { t: "text", s: "He opens his mouth and stops. He tries again. Nothing comes.", slow: true, amb: "silence", hold: 1200, fear: 34 },
      { t: "text", s: "Then he says, with the bewildered politeness of a man handing over a wallet he has found: \"Unga per solreengala saar? Konjam nyaabagam varum.\"", as: "voice", amb: "street", sfx: "whisper", fear: 42 },
      {
        t: "choice",
        prompt: "He is asking for a name. Any name. He is not fussy.",
        timer: 180,
        options: [
          { label: "Give him yours.", go: "givename", fear: 30 },
          { label: "Give him a false one.", go: "falsename", fear: 22 },
          { label: "Give him nothing. Drive.", go: "until", fear: 16 },
        ],
      },
    ],

    givename: [
      { t: "text", s: "You tell him your name, because he asked politely, because he looked lost, because twenty-two years of driving strangers home makes a man soft in one very specific place.", fear: 28 },
      { t: "text", s: "He says it back. Once, carefully, the way you repeat a new address.", slow: true, sfx: "reverse", fear: 38 },
      { t: "text", s: "Then he says thank you, and he puts his hand down, and he stops waving, and he walks away up the road towards the bridge with an office bag and a purpose.", fear: 40 },
      { t: "text", s: "Meter: 3:31.", hold: 1000, fear: 36 },
      { t: "text", s: "You go to the fish market. You drink your tea. The tea man looks up and says, \"Saar, ungala yaaro thedi vandhaanga. Unga per sonnaanga.\"", as: "voice", sfx: "sting", shake: true, fear: 48 },
      {
        t: "ending",
        id: "gave-the-name",
        outcome: "worst",
        title: "Per Kudutha",
        lines: [
          "Somebody with your name settles your account at the tea shop that week. Somebody with your name is seen at the union office. Somebody with your name takes fares on the bridge.",
          "You are still here, and you still drive, and nothing has been taken from you that anyone could put on a form.",
          "It is only that when you say your name now — to a passenger, to a policeman, to your daughter's school — there is the smallest pause first, while you check.",
        ],
      },
    ],

    falsename: [
      { t: "text", s: "\"Raman,\" you say. Your father's father's name. Dead thirty years. Not yours to lose.", fear: 20 },
      { t: "text", s: "He repeats it. He turns it over. He frowns, the way a man does at a shoe that is the wrong size.", slow: true, fear: 26 },
      { t: "text", s: "\"Idhu unga peru illa,\" he says. Not angry. Just accurate.", as: "voice", sfx: "whisper", fear: 34 },
      { t: "text", s: "\"Aana paravaala. Yaaroda perumaa irukkattum. Enakku per venum, adhu unga per-aana irukanum-nu ellam illa.\"", as: "voice", slow: true, fear: 32 },
      { t: "text", s: "He walks off towards the bridge with a dead man's name, and the meter turns to 3:31, and the road is a road again.", amb: "street", fear: -8 },
      {
        t: "ending",
        id: "borrowed-name",
        outcome: "survived",
        title: "Thatha Per",
        lines: [
          "Nothing follows you home. Nothing has ever followed you home since.",
          "Your father asks you, six months later, out of nowhere, whether you have been to the village temple recently, because someone left a hundred rupees in your grandfather's name and the priest wanted to know who.",
          "You say you don't know. You have paid a hundred rupees there yourself every year since, in the same name, and you have never told anybody why, and you are not entirely sure you are the only one paying.",
        ],
      },
    ],

    /* ---------------------------------------------------------------- */

    prayer: [
      { t: "text", s: "You say the line your mother made you say at every level crossing and every hospital gate and every funeral procession for the first eighteen years of your life.", fear: 14 },
      { t: "text", s: "You have not said it in a decade. It comes out complete, in her voice's rhythm, without one word missing.", sfx: "chant", fear: 10 },
      { t: "text", s: "The auto goes quiet. Not the engine — the engine rattles on. The other quiet. The one that had been sitting behind you since the bridge.", slow: true, amb: "street", fear: -12 },
      { t: "text", s: "In the mirror, the back seat is empty and looks empty, which is a different thing from being empty and you can finally tell the difference.", fear: -16 },
      { t: "text", s: "Meter: 3:31.", hold: 900, fear: -18 },
      {
        t: "ending",
        id: "amma-sonnathu",
        outcome: "survived",
        title: "Amma Solli Kuduthadhu",
        lines: [
          "You drive to the beach anyway, because you took a fare and a fare is a fare, and you sit with the engine off and watch the sea get light.",
          "You call your mother at six, which you have not done at six in years, and you talk about nothing for eleven minutes, and she asks what is wrong and you say nothing is wrong.",
          "You have never broken the rule again. You have also never removed the Murugan photo from the mirror frame, and when it fell off in 2019 you stopped the auto on a main road in traffic to put it back.",
        ],
      },
    ],

    finish: [
      { t: "text", s: "You drive him to Besant Nagar. You do not look in the mirror once and you do not say a word and the sea comes up on the left like something enormous and disinterested.", amb: "sea", fear: 26 },
      { t: "text", s: "\"Inga podhum saar,\" he says, at the beach road, at the spot where the fish stalls set up.", as: "voice", fear: 22 },
      { t: "text", s: "The auto rises very slightly on its springs — the opposite of what it did on the bridge, exactly as much, as though a debt has been settled.", slow: true, sfx: "wind", fear: 24 },
      { t: "text", s: "\"Nandri,\" he says, from the road. \"Ipdi oruthar irangi rendu varusham aayiduchu.\"", as: "voice", fear: 28 },
      { t: "text", s: "Meter: 3:31.", hold: 1000, fear: 10 },
      {
        t: "ending",
        id: "dropped-him",
        outcome: "survived",
        title: "Irakki Vitten",
        lines: [
          "You do not take a fare. He does not offer one. That, you work out much later, is the only shape of this that has ever ended well.",
          "Two years, he said. Two years of autos going past him on a bridge at three in the morning, because everybody knows the rule and nobody knows why it exists.",
          "You have kept the rule ever since and you have also started leaving the meter running through the half hour and parking on the bridge with the light on, which is not the same as taking a fare and is not quite keeping the rule either, and nobody has ever got in.",
        ],
      },
    ],

    walkaway: [
      { t: "text", s: "You stop in the middle of the road, pull the key, get out, and walk.", fear: 24 },
      { t: "text", s: "Behind you the auto idles on — key in your hand, engine running, headlight on.", slow: true, sfx: "sting", fear: 34 },
      { t: "text", s: "You do not turn round. You walk to the beach road. You walk onto the sand. You sit down.", amb: "sea", fear: 28 },
      { t: "text", s: "At 3:31 the engine behind you stops, all at once, the way an engine stops when somebody who knows the vehicle turns it off properly.", sfx: "drop", hold: 1300, fear: 34 },
      {
        t: "ending",
        id: "left-the-auto",
        outcome: "doomed",
        title: "Auto-va Vittutu Vandhuten",
        lines: [
          "You walk back at six. The auto is where you left it, tidy, key hole scratched, half a tank still in it.",
          "It drives perfectly. It has driven perfectly every day for the six years since. It does not stall, it does not overheat, and it has never once needed the mechanic.",
          "You have also never been able to drive it after two in the morning, because after two in the morning it pulls very slightly to the left, towards the bridge, and you have taken it to three mechanics and all three of them have driven it in daylight and told you there is nothing wrong.",
        ],
      },
    ],

    throwbag: [
      { t: "text", s: "You grab the bag and throw it out onto the road and it lands badly, the way a bag lands when it has something soft in it.", sfx: "drop", fear: 26 },
      { t: "text", s: "You do not look. You throttle. Fifty metres. A hundred.", fear: 22 },
      { t: "text", s: "At the next junction, on the floor of your auto, standing up, zip closed: the bag.", slow: true, sfx: "sting", shake: true, fear: 40 },
      { t: "goto", go: "openbag" },
    ],

    openbag: [
      { t: "text", s: "You stop the auto. You get in the back. You open the bag.", slow: true, fear: 30 },
      { t: "text", s: "A tiffin box. A folded shirt. An ID card on a lanyard, face down.", fear: 32 },
      { t: "text", s: "And forty-one auto keys, on forty-one different rings, most of them with a temple token or a photo or a child's sticker on them.", slow: true, sfx: "reverse", fear: 44 },
      { t: "text", s: "You turn the ID card over.", hold: 1100, fear: 46 },
      { t: "text", s: "It is your face. It is your name. The date on it is Monday.", sfx: "sting", shake: true, fear: 54 },
      {
        t: "ending",
        id: "forty-one-keys",
        outcome: "worst",
        title: "Nappathonnu Saavi",
        lines: [
          "Forty-one autos in twenty-two years. The union has a board with the names on it and nobody ever counted them, because they are spread across two decades and four police stations and none of them look like each other.",
          "Every one of them was a night driver. Every one of them was short of money that week. Every one of them broke the rule on a Friday.",
          "Your daughter's fees are due on Monday.",
        ],
      },
    ],

    deliver: [
      { t: "text", s: "You drive to Besant Nagar with a stranger's bag standing upright on the floor of your auto and you deliver it, because that is what you do with a thing somebody has left behind.", amb: "sea", fear: 20 },
      { t: "text", s: "The beach road at half past three. You put the bag down on the pavement by the fish stalls and you step back.", fear: 22 },
      { t: "text", s: "You do not see anyone pick it up. You look away for the length of one wave on the sand, which is about four seconds, and the pavement is empty.", slow: true, sfx: "wind", fear: 26 },
      { t: "text", s: "Meter: 3:31.", hold: 1000, fear: 6 },
      {
        t: "ending",
        id: "delivered-it",
        outcome: "survived",
        title: "Kondu Poi Kuduthen",
        lines: [
          "The auto rides lighter on the way back. That is not a feeling; the mechanic confirms the following week that the rear springs have somehow re-seated themselves, and charges you nothing, and looks at you strangely.",
          "You tell your wife a version of this that leaves out the bridge. You tell the union nothing at all.",
          "The one thing you cannot let go of is that you never looked inside it, and that everybody you have ever told this story to — all two of them — has asked you why not, and you have not been able to explain that not looking was the entire reason it worked.",
        ],
      },
    ],

    gohome: [
      { t: "text", s: "You turn the auto around in the middle of an empty road, which is the sort of thing that gets you a fine in daylight and saves your life at three in the morning.", fear: 14 },
      { t: "text", s: "Home is nineteen minutes. You do them in fourteen. There is a man at three of the junctions and you do not slow down at any of them.", sfx: "steps", fear: 24 },
      { t: "text", s: "At the last junction before your street he is not there. Meter: 3:31.", amb: "street", hold: 900, fear: -10 },
      { t: "text", s: "Your wife is awake because she is always awake and she asks why you are back at half three and you say the auto was making a noise.", fear: -14 },
      {
        t: "ending",
        id: "went-home",
        outcome: "survived",
        title: "Veetuku Poitten",
        lines: [
          "Six hundred rupees short. Your wife's chit fund covers it on Sunday without being asked, because she has been covering things without being asked for nineteen years.",
          "You lose a night's earnings. That is the entire cost, and you have never once resented it.",
          "The new boys on the night shift ask you why you always finish before three, and you tell them, and you keep telling them, and the union calls you superstitious, and you have buried three drivers who agreed with the union.",
        ],
      },
    ],
  },
};
