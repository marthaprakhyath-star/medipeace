import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import { getSql } from "@/lib/db";
import { LOOKS, type LookId } from "@/lib/looks";

export type ProfileRow = {
  displayName: string | null;
  avatarUrl: string | null;
  lookId: LookId;
};

function asLookId(value: string | null | undefined): LookId {
  return LOOKS.some((l) => l.id === value) ? (value as LookId) : "moonlit";
}

export const getProfile = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }): Promise<ProfileRow> => {
    const sql = await getSql();
    const rows = await sql<{
      display_name: string | null;
      avatar_url: string | null;
      look_id: string;
    }>`
      select display_name, avatar_url, look_id
      from profiles
      where user_id = ${context.userId}
      limit 1
    `;
    const row = rows[0];
    if (!row) {
      return { displayName: null, avatarUrl: null, lookId: "moonlit" };
    }
    return {
      displayName: row.display_name,
      avatarUrl: row.avatar_url,
      lookId: asLookId(row.look_id),
    };
  });

export const saveProfile = createServerFn({ method: "POST" })
  .validator((input: ProfileRow) => {
    const displayName = input.displayName?.trim().slice(0, 40) || null;
    const raw = input.avatarUrl;
    const avatarUrl =
      raw &&
      (raw.startsWith("data:image/") ||
        raw.startsWith("https://") ||
        raw.startsWith("/"))
        ? raw.slice(0, 350_000)
        : null;
    return {
      displayName,
      avatarUrl,
      lookId: asLookId(input.lookId),
    };
  })
  .middleware([authMiddleware])
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    await sql`
      insert into profiles (user_id, display_name, avatar_url, look_id, updated_at)
      values (${context.userId}, ${data.displayName}, ${data.avatarUrl}, ${data.lookId}, now())
      on conflict (user_id) do update set
        display_name = excluded.display_name,
        avatar_url = excluded.avatar_url,
        look_id = excluded.look_id,
        updated_at = now()
    `;
    return data;
  });
