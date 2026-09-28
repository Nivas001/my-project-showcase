import type { VoiceStory } from "@/lib/horror/voice";

/**
 * Tanglish · a family WhatsApp group · somebody is still typing
 *
 * The most modern haunting available: a group chat nobody can leave, an old
 * number nobody will remove, and a "typing…" that will not stop.
 *
 * Deliberately funny for the first third. A family group is inherently comic —
 * the forwards, the good-morning images, the uncle who replies to everything
 * with a single full stop — and the comedy is load-bearing, because the turn
 * only lands if the listener has relaxed first.
 *
 * Latin script throughout: this one is read by an English voice. See the note
 * in terrace-la-yaaro.ts.
 */
export const groupLaOruthar: VoiceStory = {
  slug: "group-la-oruthar",
  title: "Group-la Oruthar",
  hook: "Family WhatsApp group. 47 members. Onnu ezhudhitte irukaaru — rendu varusham munnaadi iranthavaru.",
  standfirst:
    "Every family has the group nobody leaves. Ours has forty-seven members. One of them died two years ago, and one of them is typing.",
  lang: "tanglish",
  fear: 5,
  minutes: "7-8 min",
  ambience: "street",
  tags: ["tanglish", "family", "phone"],
  script: [
    {
      s: "Ellaa family-kkum oru WhatsApp group irukkum. Adhula irundhu yaarum veliya vara maattaanga.",
      gloss: "Nobody ever leaves the family group.",
      amb: "street",
    },
    {
      s: "Engaluku 47 members. Kaalaila good morning flowers. Madhyaanam oru forward. Raathiri oru uncle ellaa message-kkum ore oru full stop podhuvaaru.",
      rate: 1.05,
    },
    { s: "Adhu thaan group. Adhaan enga family. Rendum ore maadhiri.", rate: 1.05, hold: 300 },

    {
      s: "Rendu varusham munnaadi en Prabha chithi iranthaanga.",
      gloss: "chithi — mother's younger sister.",
      fear: 3,
    },
    {
      s: "Neraya vayasu illa. Romba sudden. Onnu solli mudiyala, onnu kekka mudiyala.",
      fear: 4,
    },
    {
      s: "Group-la avanga number innum iruku. Yaarum remove pannala.",
      fear: 4,
      rate: 0.95,
    },
    {
      s: "Ellaarum nenaichom: adhu remove panradhu konjam kevalamaa irukkum-nu. So adhu apdiye irundhuchu. Rendu varusham.",
      fear: 5,
      rate: 0.95,
      hold: 400,
    },

    {
      s: "Poi maasam, oru raathiri, naan phone-a paathen. 1:40 AM.",
      fear: 6,
      sfx: "phone",
    },
    {
      s: "Group-la mela oru line: Prabha chithi is typing.",
      speaker: "text",
      fear: 9,
      sfx: "sting",
      shake: true,
      hold: 1000,
    },

    {
      s: "Naan sirichen. Enna nenachen-na, yaaro andha number-a vaangiyiruppaanga. Recycled number. Adhu normal.",
      rate: 1.05,
      fear: 5,
    },
    {
      s: "Aana message varala. Typing mattum. Naalu nimisham.",
      fear: 7,
      rate: 0.92,
    },
    { s: "Appuram nindruchu.", fear: 6, hold: 700 },

    {
      s: "Adutha naal kaalaila naan group-la kettuten. Yaaravadhu neettu raathiri paathaangalaa-nu.",
      fear: 5,
      rate: 1.0,
    },
    {
      s: "Ezhu per paathirukaanga. Ellaarum ore same time. 1:40.",
      fear: 8,
      rate: 0.9,
      hold: 600,
    },
    {
      s: "En periyappa andha number-ku direct-aa call pannaaru. Switched off.",
      fear: 7,
      sfx: "radio",
    },
    {
      s: "Network kitta check pannom. Andha number rendu varushathukku munnaadiye deactivate aayiduchu. Yaarukkum kudukkala.",
      fear: 10,
      rate: 0.88,
      hold: 900,
    },

    {
      s: "Ippo, adhu thaan technically impossible. Deactivate aana number-la WhatsApp typing varave varaadhu.",
      fear: 8,
      rate: 0.92,
    },
    {
      s: "Naan IT-la velai paaren. Naan adha proper-aa check pannen. Adhu nadakka mudiyaadhu.",
      fear: 7,
    },
    { s: "Aana adhu nadanthuchu. Ovvoru raathiriyum.", fear: 10, rate: 0.85, hold: 800 },

    {
      s: "Rendu vaarathukku appuram, first message vandhuchu.",
      fear: 11,
      sfx: "knock",
      shake: true,
      rate: 0.88,
      hold: 700,
    },
    { s: "Ore oru vaarthai.", fear: 9, hold: 600 },
    { s: "kadhava", speaker: "text", fear: 13, rate: 0.75, hold: 1200 },
    {
      s: "Adhu mattum thaan. Half-la nindruchu. Mudikkave illa.",
      gloss: "kadhava — 'the door…', cut off mid-word.",
      fear: 10,
      rate: 0.88,
    },

    {
      s: "Adutha naal raathiri, innoru vaarthai.",
      fear: 9,
      amb: "corridor",
      rate: 0.9,
    },
    { s: "thirandhu", speaker: "text", fear: 12, rate: 0.75, hold: 1000 },
    {
      s: "Moonaavadhu naal: vechurukeenga.",
      speaker: "text",
      fear: 14,
      sfx: "reverse",
      shake: true,
      rate: 0.72,
      hold: 1400,
    },
    {
      s: "Kadhava thirandhu vechurukeenga.",
      gloss: "You have left the door open.",
      fear: 15,
      rate: 0.75,
      hold: 1500,
    },

    {
      s: "Andha message vandha appo, enga family-la naalu veetla kadhavu poottiyirundhadhu. Naanga ellaarum check pannom. Ellaarum photo anuppinom.",
      fear: 9,
      rate: 0.92,
    },
    {
      s: "Oru veedu mattum reply pannala.",
      fear: 12,
      rate: 0.82,
      hold: 1000,
    },
    {
      s: "Prabha chithi veedu. Rendu varusham-aa poottiyiruku. Yaarum ulla poradhilla.",
      fear: 13,
      sfx: "breath",
      rate: 0.8,
      hold: 1200,
    },

    {
      s: "En periyappa andha raathiri poi paathaaru. Naanga vendaam-nu sonnom. Avaru kettukala.",
      fear: 10,
      amb: "silence",
      rate: 0.9,
    },
    {
      s: "Avaru group-la oru photo anuppinaaru. Front door. Thirandhu irukku.",
      fear: 14,
      sfx: "door",
      shake: true,
      rate: 0.82,
      hold: 1200,
    },
    { s: "Appuram avaru type panna aarambichaaru.", fear: 12, rate: 0.85, hold: 900 },
    {
      s: "Naanga ellaarum paathuttu irundhom. Naappadhu ezhu per. Onnume pesala.",
      fear: 11,
      rate: 0.85,
    },
    { s: "Typing. Moonu nimisham. Naalu nimisham.", fear: 13, rate: 0.8, hold: 1100 },
    { s: "Appuram nindruchu.", fear: 10, hold: 1000 },

    {
      s: "Adhukku appuram avaru kitta irundhu onnume varala. Phone-um switched off.",
      fear: 12,
      rate: 0.85,
    },
    {
      s: "Rendu naal kazhichu avara kandupudichaanga. Avaru nallaa thaan irukaaru. Aspathri-la illa, onnume illa.",
      fear: 8,
      rate: 0.95,
    },
    {
      s: "Aana avaru andha raathiri pathi onnume nyaabagam vechukala. Andha veedu, andha kadhavu, andha photo — onnume.",
      fear: 10,
      rate: 0.9,
      hold: 800,
    },

    {
      s: "Ippo group-la 47 members illa.",
      fear: 11,
      amb: "silence",
      rate: 0.85,
      hold: 900,
    },
    { s: "48.", fear: 16, sfx: "sting", shake: true, rate: 0.72, hold: 1600 },
    {
      s: "Puthusaa oru number. Yaarukkum theriyala. Yaaru add pannaanga-nu admin log-la kaatla.",
      fear: 12,
      rate: 0.82,
    },
    {
      s: "Adhu ellaa message-aiyum padikkudhu. Rendu tick, blue-vaa maarudhu.",
      fear: 13,
      rate: 0.8,
      hold: 1000,
    },
    {
      s: "Aana adhu oru thadava kooda type pannadhilla.",
      fear: 11,
      rate: 0.85,
      hold: 900,
    },

    {
      s: "Naan neettu raathiri andha number-ku personal-aa message pannen. Ore oru kelvi.",
      fear: 12,
      rate: 0.85,
      hold: 700,
    },
    { s: "Neenga yaaru.", speaker: "text", fear: 13, rate: 0.78, hold: 1100 },
    {
      s: "Reply varala. Aana mela andha line vandhuchu.",
      fear: 14,
      rate: 0.78,
      hold: 1000,
    },
    {
      s: "Neenga is typing.",
      speaker: "other",
      gloss: "Your own name, at the top of your own screen.",
      fear: 19,
      sfx: "riser",
      shake: true,
      rate: 0.68,
      pitch: 0.82,
      hold: 2200,
    },
    {
      s: "Naan type pannala.",
      gloss: "I was not typing.",
      speaker: "other",
      fear: 14,
      rate: 0.66,
      pitch: 0.8,
      sfx: "flatline",
      hold: 2400,
    },
  ],
};
