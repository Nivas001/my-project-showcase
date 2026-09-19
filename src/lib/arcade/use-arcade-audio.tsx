import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { ArcadeAudio, type ArcadeSfx } from "./audio";

/**
 * One AudioContext for the whole arcade, shared by every game and by the
 * cabinet chrome around them.
 *
 * Browsers cap the number of live AudioContexts per document (Chrome at six),
 * and a page with five games that each built their own would run out the moment
 * someone tab-hopped. It also means the mute toggle in the cabinet header
 * genuinely mutes everything, including a sound a game scheduled a frame ago.
 */

type ArcadeAudioApi = {
  play: (kind: ArcadeSfx, n?: number) => void;
  unlock: () => void;
  muted: boolean;
  setMuted: (m: boolean) => void;
  music: boolean;
  setMusic: (on: boolean) => void;
  ready: boolean;
};

const Ctx = createContext<ArcadeAudioApi | null>(null);

const MUTE_KEY = "arcade.muted";

export function ArcadeAudioProvider({ children }: { children: React.ReactNode }) {
  const engine = useRef<ArcadeAudio | null>(null);
  const [muted, setMutedState] = useState(false);
  const [music, setMusicState] = useState(false);
  const [ready, setReady] = useState(false);

  if (engine.current === null && typeof window !== "undefined") {
    engine.current = new ArcadeAudio();
  }

  // Preference survives a reload. Read after mount — localStorage does not
  // exist during SSR, and a mismatch here would hydrate the wrong icon.
  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(MUTE_KEY);
      if (stored === "1") {
        setMutedState(true);
        engine.current?.setMuted(true);
      }
    } catch {
      /* storage blocked */
    }
    return () => engine.current?.destroy();
  }, []);

  const api = useMemo<ArcadeAudioApi>(
    () => ({
      ready,
      muted,
      music,
      unlock: () => {
        const e = engine.current;
        if (!e) return;
        e.unlock();
        if (!e.ready) return;
        setReady(true);
      },
      play: (kind, n) => {
        const e = engine.current;
        if (!e) return;
        // First sound of the session doubles as the unlock gesture: every call
        // site is already inside a click or keydown handler.
        if (!e.ready) {
          e.unlock();
          setReady(true);
        }
        e.play(kind, n);
      },
      setMuted: (m) => {
        setMutedState(m);
        engine.current?.setMuted(m);
        try {
          window.localStorage.setItem(MUTE_KEY, m ? "1" : "0");
        } catch {
          /* storage blocked */
        }
      },
      setMusic: (on) => {
        const e = engine.current;
        if (!e) return;
        if (!e.ready) e.unlock();
        setReady(true);
        if (on) e.startMusic();
        else e.stopMusic();
        setMusicState(on);
      },
    }),
    [muted, music, ready],
  );

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

/**
 * Safe outside a provider — returns a no-op API rather than throwing, so a game
 * component can be dropped anywhere (a project page, a window on the desktop)
 * without dragging the provider along.
 */
export function useArcadeAudio(): ArcadeAudioApi {
  const ctx = useContext(Ctx);
  return (
    ctx ?? {
      play: () => {},
      unlock: () => {},
      muted: true,
      setMuted: () => {},
      music: false,
      setMusic: () => {},
      ready: false,
    }
  );
}
