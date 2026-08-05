import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { isGameId, GAME_CONFIG, type GameScore } from "@/lib/games";
import type { Database } from "@/integrations/supabase/types";

const MAX_NICKNAME_LENGTH = 20;

function validateNickname(nickname: string) {
  const trimmed = nickname.trim();
  if (!trimmed) return { valid: false, error: "Enter a nickname." } as const;
  if (trimmed.length > MAX_NICKNAME_LENGTH)
    return { valid: false, error: "Nickname must be 20 characters or fewer." } as const;
  if (!/^[\p{L}\p{N}_\- ]{1,20}$/u.test(trimmed))
    return { valid: false, error: "Nickname contains invalid characters." } as const;
  return { valid: true, nickname: trimmed } as const;
}

export const getLeaderboard = createServerFn({ method: "GET" })
  .inputValidator((data: { game: string }) => data)
  .handler(async ({ data }) => {
    if (!isGameId(data.game)) throw new Error("Unknown game.");

    const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
    const supabase = createClient<Database>(process.env["SUPABASE_URL"]!, key, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: {
        fetch: (input, init) => {
          const h = new Headers(init?.headers);
          if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) h.delete("Authorization");
          h.set("apikey", key);
          return fetch(input, { ...init, headers: h });
        },
      },
    });

    const cfg = GAME_CONFIG[data.game as keyof typeof GAME_CONFIG];
    const { data: rows, error } = await supabase
      .from("game_scores")
      .select("id, game, nickname, score, created_at")
      .eq("game", data.game)
      .order("score", { ascending: cfg.ascending })
      .order("created_at", { ascending: true })
      .limit(10);

    if (error) throw new Error(error.message);
    return (rows ?? []) as unknown as GameScore[];
  });

export const submitScore = createServerFn({ method: "POST" })
  .inputValidator((data: { game: string; nickname: string; score: number }) => data)
  .handler(async ({ data }) => {
    if (!isGameId(data.game)) throw new Error("Unknown game.");
    const cfg = GAME_CONFIG[data.game as keyof typeof GAME_CONFIG];
    const nicknameCheck = validateNickname(data.nickname);
    if (!nicknameCheck.valid) throw new Error(nicknameCheck.error);

    const scoreNum = Number(data.score);
    if (!Number.isFinite(scoreNum) || scoreNum < 0 || scoreNum > cfg.maxScore || Math.floor(scoreNum) !== scoreNum) {
      throw new Error("Score looks invalid.");
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: inserted, error } = await supabaseAdmin
      .from("game_scores")
      .insert({
        game: data.game,
        nickname: nicknameCheck.nickname,
        score: scoreNum,
      })
      .select("id, game, nickname, score, created_at")
      .single();

    if (error) throw new Error(error.message);
    return inserted as unknown as GameScore;
  });
