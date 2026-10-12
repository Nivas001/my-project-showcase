import { loadFont as loadBricolage } from "@remotion/google-fonts/BricolageGrotesque";
import { loadFont as loadInterTight } from "@remotion/google-fonts/InterTight";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { loadFont as loadMono } from "@remotion/google-fonts/JetBrainsMono";
import { loadFont as loadCaveat } from "@remotion/google-fonts/Caveat";
import { loadFont as loadTamil } from "@remotion/google-fonts/NotoSansTamil";

// Same families the site uses (src/styles.css in my-project-showcase).
export const hero = loadBricolage("normal", { weights: ["600", "700", "800"], subsets: ["latin"] }).fontFamily;
export const display = loadInterTight("normal", { weights: ["500", "600", "700", "800"], subsets: ["latin"] }).fontFamily;
export const sans = loadInter("normal", { weights: ["400", "500", "600"], subsets: ["latin"] }).fontFamily;
export const mono = loadMono("normal", { weights: ["400", "500", "700"], subsets: ["latin"] }).fontFamily;
export const hand = loadCaveat("normal", { weights: ["600", "700"], subsets: ["latin"] }).fontFamily;
export const tamil = loadTamil("normal", { weights: ["400", "500", "700"], subsets: ["tamil"] }).fontFamily;
