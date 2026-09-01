"use client";

import { seedPayload } from "./seed";
import { sanitizeMediaItem } from "./security";
import type { CmsPayload, MediaItem, SiteSettings } from "./types";

const DATA_KEY = "rizzmovies_cms_data_v1";
const AUTH_KEY = "rizzmovies_admin_session";
export const DEMO_EMAIL = "admin@rizzmovies.com";
export const DEMO_PASSWORD = "RizzMovies#2026";

function cloneSeed(): CmsPayload {
  return JSON.parse(JSON.stringify(seedPayload));
}

function localRead(): CmsPayload {
  if (typeof window === "undefined") return cloneSeed();
  const raw = localStorage.getItem(DATA_KEY);
  if (!raw) {
    const initial = cloneSeed();
    localStorage.setItem(DATA_KEY, JSON.stringify(initial));
    return initial;
  }
  try {
    return JSON.parse(raw) as CmsPayload;
  } catch {
    return cloneSeed();
  }
}

function localWrite(payload: CmsPayload): CmsPayload {
  localStorage.setItem(DATA_KEY, JSON.stringify(payload));
  window.dispatchEvent(new Event("rizzmovies:data"));
  return payload;
}

async function request<T>(action: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`/api?action=${encodeURIComponent(action)}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
    cache: "no-store",
  });
  if (!response.ok) throw new Error((await response.json().catch(() => ({}))).error || "Request failed");
  return response.json() as Promise<T>;
}

export async function loadPublicContent(): Promise<CmsPayload> {
  try {
    return await request<CmsPayload>("public");
  } catch {
    const payload = localRead();
    return { ...payload, items: payload.items.filter((item) => item.status === "published") };
  }
}

export async function loadAdminContent(): Promise<CmsPayload> {
  try {
    return await request<CmsPayload>("admin");
  } catch {
    if (localStorage.getItem(AUTH_KEY) !== "true") throw new Error("UNAUTHENTICATED");
    return localRead();
  }
}

export async function adminStatus(): Promise<boolean> {
  try {
    const data = await request<{ authenticated: boolean }>("status");
    return data.authenticated;
  } catch {
    return localStorage.getItem(AUTH_KEY) === "true";
  }
}

export async function adminLogin(email: string, password: string): Promise<void> {
  try {
    await request("login", { method: "POST", body: JSON.stringify({ email, password }) });
    localStorage.setItem(AUTH_KEY, "true");
  } catch (error) {
    if (email.toLowerCase() !== DEMO_EMAIL || password !== DEMO_PASSWORD) throw error;
    localStorage.setItem(AUTH_KEY, "true");
  }
}

export async function adminLogout(): Promise<void> {
  try { await request("logout", { method: "POST", body: "{}" }); } catch { /* local fallback */ }
  localStorage.removeItem(AUTH_KEY);
}

export async function saveMediaItem(input: Partial<MediaItem>): Promise<MediaItem> {
  try {
    return await request<MediaItem>("save-item", { method: "POST", body: JSON.stringify(input) });
  } catch {
    const payload = localRead();
    const index = payload.items.findIndex((item) => item.id === input.id);
    const saved = sanitizeMediaItem(input, index >= 0 ? payload.items[index] : undefined);
    const slugCollision = payload.items.find((item) => item.slug === saved.slug && item.id !== saved.id);
    if (slugCollision) saved.slug = `${saved.slug}-${saved.id.slice(0, 5)}`;
    if (index >= 0) payload.items[index] = saved; else payload.items.unshift(saved);
    localWrite(payload);
    return saved;
  }
}

export async function deleteMediaItem(id: string): Promise<void> {
  try {
    await request("delete-item", { method: "POST", body: JSON.stringify({ id }) });
  } catch {
    const payload = localRead();
    payload.items = payload.items.filter((item) => item.id !== id);
    localWrite(payload);
  }
}

export async function saveSiteSettings(settings: SiteSettings): Promise<SiteSettings> {
  try {
    return await request<SiteSettings>("settings", { method: "POST", body: JSON.stringify(settings) });
  } catch {
    const payload = localRead();
    payload.settings = settings;
    localWrite(payload);
    return settings;
  }
}

export function resetLocalDemo(): void {
  localStorage.setItem(DATA_KEY, JSON.stringify(cloneSeed()));
  window.dispatchEvent(new Event("rizzmovies:data"));
}
