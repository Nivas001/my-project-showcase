import { createServerFn } from "@tanstack/react-start";
import { getRequestIP } from "@tanstack/react-start/server";
import { createClient } from "@supabase/supabase-js";
import { isGameId, GAME_CONFIG, type GameScore } from "@/lib/games";
import type { Database } from "@/integrations/supabase/types";


const MAX_NICKNAME_LENGTH = 20;
const SUBMISSIONS_PER_IP_PER_DAY = 5;

function validateNickname(nickname: string) {
  const trimmed = nickname.trim();
  if (!trimmed) return { valid: false, error: "Enter a nickname." } as const;
  if (trimmed.length > MAX_NICKNAME_LENGTH)
    return { valid: false, error: "Nickname must be 20 characters or fewer." } as const;
  if (!/^[^\n\r\t<>]{1,20}$/.test(trimmed))
    return { valid: false, error: "Nickname contains invalid characters." } as const;
  return { valid: true, nickname: trimmed } as const;
}

export const getLeaderboard = createServerFn({ method: "GET" })
  .inputValidator((data: { game: string }) => data)
  .handler(async ({ data }) => {
    if (!isGameId(data.game)) throw new Error("Unknown game.");

    const { createClient } = await import("@supabase/supabase-js");
    const { default: dbTypes } = await import("@/integrations/supabase/types");
    type Database = typeof dbTypes;

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

    const ip = getRequestIP({ xForwardedFor: true }) ?? "unknown";
    const day = new Date().toISOString().slice(0, 10);
    const rateKey = `${ip}:${data.game}:${day}`;

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { count: recentCount, error: countError } = await supabaseAdmin
      .from("game_scores")
      .select("id", { count: "exact", head: true })
      .eq("game", data.game)
      .gte("created_at", `${day}T00:00:00Z`);

    if (countError) throw new Error(countError.message);
    if ((recentCount ?? 0) >= SUBMISSIONS_PER_IP_PER_DAY) {
      throw new Error("Daily score limit reached for this game. Try again tomorrow.");
    }

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
