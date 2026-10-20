import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadInterTight } from "@remotion/google-fonts/InterTight";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { loadFont as loadMono } from "@remotion/google-fonts/JetBrainsMono";
import { loadFont as loadVT } from "@remotion/google-fonts/VT323";
import { loadFont as loadSilk } from "@remotion/google-fonts/Silkscreen";
import { loadFont as loadCaveat } from "@remotion/google-fonts/Caveat";
import { loadFont as loadTamil } from "@remotion/google-fonts/NotoSansTamil";

// "Desk OS": warm paper, a beige computer, pastel notes, one loud blue.
// The blue is the portrait's duotone, so the photo sits in the palette as-is.
export const K = {
  paper: "#F1EDE3",
  paperDeep: "#E7E1D3",
  paperCool: "#ECECE8",
  card: "#FCFBF8",
  ink: "#17160F",
  ink2: "#48453B",
  dim: "#8E897B",
  line: "rgba(23, 22, 15, 0.13)",
  lineSoft: "rgba(23, 22, 15, 0.07)",
  blue: "#2B37D6",
  blueDeep: "#1A23A8",
  red: "#E5352B",
  orange: "#DD6B3D",
  lime: "#D9F36B",
  phosphor: "#52F06A",
  crt: "#191B17",
  beige: "#E9E2D0",
  beigeMid: "#DCD3BD",
  beigeDark: "#BFB497",
  sticky: {
    yellow: "#FAE57C",
    pink: "#F7C5D9",
    mint: "#C8EFD4",
    blue: "#CFDFFA",
    peach: "#F9D2A6",
  },
} as const;

export const serif = loadSerif("normal", { weights: ["400"], subsets: ["latin"] }).fontFamily;
loadSerif("italic", { weights: ["400"], subsets: ["latin"] });
export const grotesk = loadInterTight("normal", { weights: ["500", "600", "700", "800", "900"], subsets: ["latin"] }).fontFamily;
export const sans = loadInter("normal", { weights: ["400", "500", "600"], subsets: ["latin"] }).fontFamily;
export const mono = loadMono("normal", { weights: ["400", "500", "700"], subsets: ["latin"] }).fontFamily;
export const vt = loadVT("normal", { weights: ["400"], subsets: ["latin"] }).fontFamily;
export const pixel = loadSilk("normal", { weights: ["400", "700"], subsets: ["latin"] }).fontFamily;
export const hand = loadCaveat("normal", { weights: ["500", "600", "700"], subsets: ["latin"] }).fontFamily;
export const tamil = loadTamil("normal", { weights: ["400", "500", "700"], subsets: ["tamil"] }).fontFamily;

/** Paper drop shadow, three layers: contact, lift, ambient. `h` is height off the desk. */
export const lift = (h = 1) =>
  [
    `0 ${1 * h}px ${2 * h}px rgba(40, 32, 18, 0.10)`,
    `0 ${8 * h}px ${18 * h}px -${4 * h}px rgba(40, 32, 18, 0.16)`,
    `0 ${30 * h}px ${60 * h}px -${18 * h}px rgba(40, 32, 18, 0.28)`,
  ].join(", ");
