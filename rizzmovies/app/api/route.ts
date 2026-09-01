import { env } from "cloudflare:workers";
import { seedPayload } from "@/lib/seed";
import { sanitizeMediaItem } from "@/lib/security";
import type { CmsPayload, MediaItem, SiteSettings } from "@/lib/types";

export const dynamic = "force-dynamic";

type D1Result = { results?: Array<Record<string, unknown>> };
type D1Statement = { bind: (...values: unknown[]) => D1Statement; first: <T = Record<string, unknown>>() => Promise<T | null>; run: () => Promise<unknown>; all: () => Promise<D1Result> };
type D1Database = { prepare: (sql: string) => D1Statement; exec: (sql: string) => Promise<unknown> };

const encoder = new TextEncoder();

function db(): D1Database {
  if (!env.DB) throw new Error("Database binding is unavailable");
  return env.DB as D1Database;
}

async function ensureDatabase(database: D1Database): Promise<void> {
  await database.exec(`
    CREATE TABLE IF NOT EXISTS cms_state (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      payload TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS audit_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      action TEXT NOT NULL,
      entity_id TEXT,
      created_at TEXT NOT NULL
    );
  `);
  await database.prepare("INSERT OR IGNORE INTO cms_state (id, payload, updated_at) VALUES (1, ?, ?)")
    .bind(JSON.stringify(seedPayload), new Date().toISOString()).run();
}

async function readPayload(): Promise<CmsPayload> {
  const database = db();
  await ensureDatabase(database);
  const row = await database.prepare("SELECT payload FROM cms_state WHERE id = 1").first<{ payload: string }>();
  return row?.payload ? JSON.parse(row.payload) as CmsPayload : seedPayload;
}

async function writePayload(payload: CmsPayload, action: string, entityId?: string): Promise<void> {
  const database = db();
  await ensureDatabase(database);
  const timestamp = new Date().toISOString();
  await database.prepare("UPDATE cms_state SET payload = ?, updated_at = ? WHERE id = 1")
    .bind(JSON.stringify(payload), timestamp).run();
  await database.prepare("INSERT INTO audit_log (action, entity_id, created_at) VALUES (?, ?, ?)")
    .bind(action, entityId ?? null, timestamp).run();
}

function json(data: unknown, status = 200, extraHeaders?: HeadersInit): Response {
  return Response.json(data, { status, headers: { "Cache-Control": "no-store", ...(extraHeaders ?? {}) } });
}

function cookieValue(request: Request, name: string): string {
  const cookie = request.headers.get("cookie") ?? "";
  return cookie.split(";").map((part) => part.trim()).find((part) => part.startsWith(`${name}=`))?.slice(name.length + 1) ?? "";
}

function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

async function sign(value: string): Promise<string> {
  const secret = String(env.SESSION_SECRET || "rizzmovies-local-session-secret");
  const key = await crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return bytesToBase64Url(new Uint8Array(await crypto.subtle.sign("HMAC", key, encoder.encode(value))));
}

async function createSession(): Promise<string> {
  const payload = `${Date.now() + 7 * 24 * 60 * 60 * 1000}.${crypto.randomUUID()}`;
  return `${payload}.${await sign(payload)}`;
}

async function authenticated(request: Request): Promise<boolean> {
  const token = cookieValue(request, "rm_admin");
  const parts = token.split(".");
  if (parts.length !== 3 || Number(parts[0]) < Date.now()) return false;
  const payload = `${parts[0]}.${parts[1]}`;
  return (await sign(payload)) === parts[2];
}

function safeSettings(value: Partial<SiteSettings>): SiteSettings {
  const text = (input: unknown, max: number) => String(input ?? "").replace(/[<>]/g, "").trim().slice(0, max);
  const accent = /^#[0-9a-f]{6}$/i.test(String(value.accent ?? "")) ? String(value.accent) : "#ff3158";
  return {
    siteName: text(value.siteName, 50) || "RizzMovies",
    tagline: text(value.tagline, 160),
    accent,
    announcement: text(value.announcement, 180),
  };
}

export async function GET(request: Request): Promise<Response> {
  const action = new URL(request.url).searchParams.get("action") ?? "public";
  try {
    if (action === "status") return json({ authenticated: await authenticated(request) });
    if (action === "public") {
      const payload = await readPayload();
      return json({ ...payload, items: payload.items.filter((item) => item.status === "published") });
    }
    if (action === "admin") {
      if (!await authenticated(request)) return json({ error: "Unauthorised" }, 401);
      return json(await readPayload());
    }
    return json({ error: "Unknown action" }, 404);
  } catch {
    return json({ error: "CMS storage is unavailable; the browser demo will be used." }, 503);
  }
}

export async function POST(request: Request): Promise<Response> {
  const action = new URL(request.url).searchParams.get("action") ?? "";
  const body = await request.json().catch(() => ({})) as Record<string, unknown>;
  try {
    if (action === "login") {
      const email = String(env.ADMIN_EMAIL || "admin@rizzmovies.com").toLowerCase();
      const password = String(env.ADMIN_PASSWORD || "RizzMovies#2026");
      if (String(body.email ?? "").toLowerCase() !== email || String(body.password ?? "") !== password) return json({ error: "Incorrect email or password" }, 401);
      const secure = new URL(request.url).protocol === "https:" ? "; Secure" : "";
      return json({ ok: true }, 200, { "Set-Cookie": `rm_admin=${await createSession()}; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800${secure}` });
    }
    if (action === "logout") return json({ ok: true }, 200, { "Set-Cookie": "rm_admin=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0; Secure" });
    if (!await authenticated(request)) return json({ error: "Unauthorised" }, 401);

    const payload = await readPayload();
    if (action === "save-item") {
      const input = body as unknown as Partial<MediaItem>;
      const index = payload.items.findIndex((item) => item.id === input.id);
      const saved = sanitizeMediaItem(input, index >= 0 ? payload.items[index] : undefined);
      const collision = payload.items.find((item) => item.slug === saved.slug && item.id !== saved.id);
      if (collision) saved.slug = `${saved.slug}-${saved.id.slice(0, 5)}`;
      if (index >= 0) payload.items[index] = saved; else payload.items.unshift(saved);
      await writePayload(payload, index >= 0 ? "update" : "create", saved.id);
      return json(saved);
    }
    if (action === "delete-item") {
      const id = String(body.id ?? "");
      payload.items = payload.items.filter((item) => item.id !== id);
      await writePayload(payload, "delete", id);
      return json({ ok: true });
    }
    if (action === "settings") {
      payload.settings = safeSettings(body as Partial<SiteSettings>);
      await writePayload(payload, "settings");
      return json(payload.settings);
    }
    return json({ error: "Unknown action" }, 404);
  } catch {
    return json({ error: "CMS storage is unavailable; the browser demo will be used." }, 503);
  }
}
