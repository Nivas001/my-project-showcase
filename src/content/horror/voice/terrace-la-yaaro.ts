import type { VoiceStory } from "@/lib/horror/voice";

/**
 * Tanglish · a Chennai apartment terrace · counting footsteps through a ceiling
 *
 * Tanglish as it is actually spoken — Tamil words inside English sentences, not
 * English sentences with Tamil sprinkled on top. The narrator is twenty-six and
 * lives in Velachery and should sound like it: fast, funny, and then not.
 *
 * STRICTLY LATIN SCRIPT. This story is read by an English voice, and a Tamil
 * glyph dropped into the middle of a sentence is either skipped silently or
 * spelled out character by character — both of which destroy the line. Tamil
 * script belongs in the `tamil` stories, which get a Tamil voice.
 *
 * The scare is entirely architectural. Everything happens directly above the
 * listener's head, which is the one place a person cannot look, and the
 * narrator never goes up to check — the story is worse if nobody ever confirms
 * anything.
 */
export const terraceLaYaaro: VoiceStory = {
  slug: "terrace-la-yaaro",
  title: "Terrace-la Yaaro",
  hook: "Top floor flat. 2 AM. Mela yaaro nadakraanga. Terrace-ku key rendu thaan iruku — onnu en kitta.",
  standfirst:
    "A top-floor flat in Velachery, a locked terrace, and somebody walking up there every night at two. Told in Tanglish, the way it would actually be told.",
  lang: "tanglish",
  fear: 5,
  minutes: "7-8 min",
  ambience: "hostel",
  tags: ["tanglish", "chennai", "apartment"],
  script: [
    {
      s: "Velachery-la oru flat. Top floor. Rent kammi, because top floor-la summer-la nee vendhu poiduva.",
      gloss: "vendhu poiduva — you will cook.",
      amb: "hostel",
    },
    {
      s: "Naan andha flat-ku move aayi eight months aachu. Enakku mela yaarum illa. Terrace mattum thaan.",
      gloss: "mela yaarum illa — nobody above me.",
      fear: 2,
    },
    { s: "And terrace-ku key rendu thaan iruku. Onnu watchman kitta. Innonnu en kitta.", fear: 3 },

    { s: "First month-la nothing. Second month-la nothing.", rate: 1.05 },
    { s: "Third month, oru Tuesday, 2 AM-ku naan vizhichen.", fear: 4, sfx: "knock" },
    {
      s: "Ceiling-la nadakra sound. Romba slow-aa. Onnu. Rendu. Moonu.",
      fear: 6,
      sfx: "steps",
      rate: 0.9,
    },

    {
      s: "Naan first-la nenachen, watchman thaan, tank check panna poyiruppaaru.",
      rate: 1.02,
    },
    {
      s: "Kaalaila kekkren. Avaru sollraaru: thambi, naan raathiri mela pove maatten.",
      speaker: "voice",
      fear: 5,
    },
    {
      s: "Andha building-la eight years-aa velai paaraaru. Eight years-la oru thadava koodapoyi irukka maatten-nu sollraaru.",
      fear: 6,
      rate: 0.95,
    },

    { s: "Sari-nu vittutten. Adhu oru mistake.", fear: 4, hold: 400 },

    { s: "Adutha vaaram. Same Tuesday. Same 2 AM.", fear: 6, sfx: "steps", amb: "corridor" },
    {
      s: "Aana indha thadava naan properly kettuten. Kaadhula pillow vechu, ceiling-kitta.",
      fear: 7,
    },
    { s: "Adhu random walking illa. Adhu oru pattern.", fear: 8, rate: 0.9, hold: 600 },

    {
      s: "Terrace door-la irundhu, en bedroom ceiling varaikkum, nadandhu vandhu, nikkum.",
      gloss: "It walks from the terrace door to a point directly above my bed, and stops.",
      fear: 9,
      sfx: "crawl",
      rate: 0.88,
    },
    {
      s: "Adhukku appuram onnum illa. Half an hour. Ore idathula.",
      fear: 10,
      sfx: "breath",
      rate: 0.85,
      hold: 900,
    },
    {
      s: "Exactly naan padukkra idathukku mela.",
      fear: 12,
      sfx: "sting",
      shake: true,
      rate: 0.8,
      hold: 1200,
    },

    { s: "Naan andha vaaram bed-a hall-ku maathinen.", fear: 6, rate: 1.0 },
    {
      s: "Adutha Tuesday adhu hall-ku vandhuchu.",
      fear: 12,
      sfx: "steps",
      shake: true,
      rate: 0.85,
      hold: 1100,
    },

    {
      s: "Ippo naan oru vishayam sollanum, and idhu thaan andha kadhaiya konjam mosam-aa aakkudhu.",
      fear: 5,
      rate: 0.95,
    },
    {
      s: "Naan oru naal count pannen. Terrace door-la irundhu en bedroom ceiling varaikkum evlo adi-nu.",
      fear: 6,
    },
    { s: "Naan mela poyi alandhen. Daylight-la. Dhairiyamaa.", rate: 1.02 },
    { s: "Nalubadhu adi. Normal-aa nadandha, nalubadhu adi.", fear: 5, hold: 400 },

    { s: "Raathiri naan count pannen. Adhu edukkra adi.", fear: 8, rate: 0.9 },
    { s: "Nooruku mela.", fear: 11, rate: 0.82, hold: 900 },
    {
      s: "Andha distance-ku nalubadhu adi podhum. Aana adhu nooru adi edukkudhu.",
      fear: 9,
      rate: 0.88,
    },
    { s: "Adhaan enakku puriyala. Rendu maasam puriyala.", fear: 7, hold: 500 },

    {
      s: "Appuram oru naal, office-la, oru friend sonnaaru. Machi, adhu chinna adi-yaa irukkalaam.",
      speaker: "voice",
      fear: 6,
      rate: 0.92,
    },
    {
      s: "Chinna adi. Chinna kaal.",
      gloss: "Small steps. Small feet.",
      fear: 13,
      sfx: "reverse",
      shake: true,
      rate: 0.76,
      hold: 1400,
    },

    {
      s: "Naan andha naal watchman kitta building history kettuten. Avaru pesa virumbala.",
      fear: 7,
      amb: "corridor",
      rate: 0.95,
    },
    {
      s: "Aana avaru wife sonnaanga. 2009-la, andha terrace-la oru paiyan.",
      fear: 9,
      rate: 0.88,
      hold: 700,
    },
    { s: "Adhukku mela avanga sollala. Naan kekkala.", fear: 8, rate: 0.9, hold: 800 },

    { s: "Rendu vaaram munnaadi naan andha flat-a vacate pannen.", fear: 6, rate: 1.0 },
    {
      s: "Ground floor. Vera area. Mela rendu floor iruku, and adhula families iruku, and naan adhukkaaga romba sandhosham-aa iruken.",
      rate: 1.05,
    },

    { s: "Last Tuesday. 2 AM.", fear: 10, amb: "silence", rate: 0.85, hold: 800 },
    { s: "Ceiling-la sound.", fear: 13, sfx: "steps", shake: true, rate: 0.8, hold: 900 },
    {
      s: "Naan nenachen, paravaala, mela family iruku, kuzhandhai iruku, adhu nadakkum.",
      fear: 8,
      rate: 0.95,
    },
    { s: "Naan count pannen. Habit aayiduchu.", fear: 9, rate: 0.9, hold: 600 },
    { s: "Nooru adi.", fear: 15, sfx: "sting", shake: true, rate: 0.75, hold: 1500 },

    {
      s: "Naan mela poyi kettuten. Andha family kitta. Unga kuzhandhai raathiri nadakkumaa-nu.",
      fear: 10,
      rate: 0.88,
    },
    {
      s: "Avanga sonnaanga: engaluku kuzhandhaiye illa.",
      speaker: "voice",
      fear: 14,
      rate: 0.8,
      hold: 1300,
    },
    { s: "Appuram avanga sonnaanga, romba medhuvaa:", fear: 11, rate: 0.82, hold: 800 },
    {
      s: "Thambi. Engalukku mela yaarum illa-nu naanga nenachom. Aana ovvoru raathiriyum.",
      speaker: "other",
      fear: 17,
      rate: 0.7,
      pitch: 0.84,
      sfx: "riser",
      hold: 1800,
    },

    {
      s: "Naan andha building-la irundhu veliya vandhutten. Ippo hotel-la iruken.",
      fear: 9,
      amb: "street",
      rate: 0.92,
    },
    { s: "Room 302. Third floor. Building-la naalu floor iruku.", fear: 8, rate: 0.9, hold: 700 },
    { s: "Innaiki 2 AM-ku naan venumne vizhichiruppen.", fear: 11, rate: 0.85, hold: 900 },
    { s: "Oru vishayam mattum therinjukkanum.", fear: 10, rate: 0.85, hold: 600 },
    { s: "Adhu andha building-a follow pannudhaa.", fear: 13, rate: 0.78, hold: 1000 },
    {
      s: "Illa ennaiya.",
      gloss: "Or me.",
      speaker: "other",
      fear: 18,
      rate: 0.68,
      pitch: 0.8,
      sfx: "flatline",
      shake: true,
      hold: 2200,
    },
  ],
};
