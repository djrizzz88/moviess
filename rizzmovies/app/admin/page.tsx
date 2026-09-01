"use client";

import Link from "next/link";
import { BarChart3, Check, ChevronDown, CirclePlay, Clapperboard, Eye, FilePenLine, Film, Globe2, LayoutDashboard, LibraryBig, LogOut, Menu, MoreHorizontal, Plus, RefreshCw, Save, Search, Settings, Sparkles, Trash2, Tv2, Upload, X } from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { Brand } from "@/components/Brand";
import { adminLogout, adminStatus, deleteMediaItem, loadAdminContent, resetLocalDemo, saveMediaItem, saveSiteSettings } from "@/lib/client-cms";
import { seedPayload } from "@/lib/seed";
import { slugify } from "@/lib/security";
import type { CastMember, CmsPayload, Episode, MediaItem, SiteSettings } from "@/lib/types";

type Tab = "dashboard" | "content" | "editor" | "settings";

function blankItem(): MediaItem {
  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID(), title: "", slug: "", type: "movie", status: "draft", synopsis: "", year: new Date().getFullYear(), runtime: "1h 45m", rating: 0,
    language: "English", maturity: "16+", genres: [], posterUrl: "", backdropUrl: "", trailerUrl: "", embedUrl: "", featured: false, trending: false,
    section: "New Releases", cast: [], episodes: [], createdAt: now, updatedAt: now, publishedAt: null,
  };
}

function Field({ label, hint, children, full = false }: { label: string; hint?: string; children: React.ReactNode; full?: boolean }) {
  return <label className={full ? "cms-field full" : "cms-field"}><span>{label}</span>{children}{hint && <small>{hint}</small>}</label>;
}

export default function AdminPage() {
  const [data, setData] = useState<CmsPayload>(seedPayload);
  const [tab, setTab] = useState<Tab>("dashboard");
  const [editing, setEditing] = useState<MediaItem>(blankItem());
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  async function refresh() {
    const payload = await loadAdminContent();
    setData(payload);
  }

  useEffect(() => {
    adminStatus().then(async (ok) => {
      if (!ok) { location.href = "/admin/login"; return; }
      try { await refresh(); } catch { location.href = "/admin/login"; }
      finally { setLoading(false); }
    });
  }, []);

  function notify(message: string) { setToast(message); window.setTimeout(() => setToast(""), 2400); }
  function change<K extends keyof MediaItem>(key: K, value: MediaItem[K]) { setEditing((current) => ({ ...current, [key]: value })); }
  function openNew(type: "movie" | "series" = "movie") { setEditing({ ...blankItem(), type, section: type === "series" ? "Series" : "New Releases" }); setTab("editor"); setSidebarOpen(false); }
  function openEdit(item: MediaItem) { setEditing(JSON.parse(JSON.stringify(item))); setTab("editor"); setSidebarOpen(false); }

  async function submitItem(event: FormEvent, status?: "draft" | "published") {
    event.preventDefault();
    setSaving(true);
    try {
      const next = { ...editing, status: status ?? editing.status, slug: editing.slug || slugify(editing.title) } as MediaItem;
      const saved = await saveMediaItem(next);
      setEditing(saved);
      await refresh();
      notify(saved.status === "published" ? "Published — the post is now live." : "Draft saved successfully.");
    } catch (error) { notify(error instanceof Error ? error.message : "Could not save post."); }
    finally { setSaving(false); }
  }

  async function remove(item: MediaItem) {
    if (!confirm(`Delete “${item.title}”? This cannot be undone.`)) return;
    await deleteMediaItem(item.id); await refresh(); notify("Post deleted.");
  }

  async function togglePublish(item: MediaItem) {
    await saveMediaItem({ ...item, status: item.status === "published" ? "draft" : "published" });
    await refresh(); notify(item.status === "published" ? "Post moved to drafts." : "Post published.");
  }

  async function saveSettings(event: FormEvent) {
    event.preventDefault(); setSaving(true);
    const settings = await saveSiteSettings(data.settings); setData((current) => ({ ...current, settings }));
    setSaving(false); notify("Site settings saved.");
  }

  const filtered = useMemo(() => data.items.filter((item) => {
    const matchesQuery = `${item.title} ${item.type} ${item.genres.join(" ")}`.toLowerCase().includes(query.toLowerCase());
    const matchesFilter = filter === "all" || item.status === filter || item.type === filter;
    return matchesQuery && matchesFilter;
  }), [data.items, query, filter]);

  const stats = {
    total: data.items.length,
    published: data.items.filter((item) => item.status === "published").length,
    movies: data.items.filter((item) => item.type === "movie").length,
    series: data.items.filter((item) => item.type === "series").length,
  };

  if (loading) return <main className="cms-loading"><span className="loader-ring" /><Brand /><p>Opening your studio…</p></main>;

  return (
    <div className="cms-shell">
      {toast && <div className="cms-toast"><Check /> {toast}</div>}
      <aside className={sidebarOpen ? "cms-sidebar open" : "cms-sidebar"}>
        <div className="cms-brand"><Brand /><button onClick={() => setSidebarOpen(false)}><X /></button></div>
        <div className="cms-workspace"><span>WORKSPACE</span><strong>RizzMovies Studio</strong><small>Administrator</small></div>
        <nav className="cms-nav">
          <button className={tab === "dashboard" ? "active" : ""} onClick={() => { setTab("dashboard"); setSidebarOpen(false); }}><LayoutDashboard /> Dashboard</button>
          <button className={tab === "content" ? "active" : ""} onClick={() => { setTab("content"); setSidebarOpen(false); }}><LibraryBig /> All content <i>{data.items.length}</i></button>
          <button className={tab === "editor" ? "active" : ""} onClick={() => openNew()}><FilePenLine /> Add new post</button>
          <span className="nav-label">MANAGE</span>
          <button onClick={() => { setFilter("movie"); setTab("content"); }}><Film /> Movies</button>
          <button onClick={() => { setFilter("series"); setTab("content"); }}><Tv2 /> Series</button>
          <button className={tab === "settings" ? "active" : ""} onClick={() => { setTab("settings"); setSidebarOpen(false); }}><Settings /> Site settings</button>
        </nav>
        <div className="cms-sidebar-bottom"><Link href="/" target="_blank"><Globe2 /> View live website</Link><button onClick={async () => { await adminLogout(); location.href = "/admin/login"; }}><LogOut /> Sign out</button></div>
      </aside>

      <div className="cms-main">
        <header className="cms-topbar">
          <button className="cms-menu-button" onClick={() => setSidebarOpen(true)}><Menu /></button>
          <div><span>{tab === "editor" ? editing.title || "New post" : tab[0].toUpperCase() + tab.slice(1)}</span><small>RizzMovies / {tab}</small></div>
          <div className="cms-top-actions"><Link href="/" target="_blank"><Eye /> Preview site</Link><button onClick={() => openNew()}><Plus /> New post</button></div>
        </header>

        <main className="cms-content">
          {tab === "dashboard" && (
            <>
              <section className="cms-welcome"><div><span><Sparkles /> CMS CONTROL ROOM</span><h1>Good evening, Razi.</h1><p>Everything you need to publish your next movie or series is ready.</p><div><button onClick={() => openNew("movie")}><Plus /> Add movie</button><button onClick={() => openNew("series")}><Plus /> Add series</button></div></div><div className="welcome-orb"><Clapperboard /><span>{stats.published}</span><small>live titles</small></div></section>
              <section className="stats-grid">
                <article><span><LibraryBig /></span><div><small>Total posts</small><strong>{stats.total}</strong><em>All content</em></div></article>
                <article><span><Globe2 /></span><div><small>Published</small><strong>{stats.published}</strong><em className="positive">Visible on site</em></div></article>
                <article><span><Film /></span><div><small>Movies</small><strong>{stats.movies}</strong><em>Feature films</em></div></article>
                <article><span><Tv2 /></span><div><small>Series</small><strong>{stats.series}</strong><em>Episode ready</em></div></article>
              </section>
              <section className="dashboard-grid">
                <div className="recent-panel"><div className="panel-heading"><div><span>CONTENT</span><h2>Recently updated</h2></div><button onClick={() => setTab("content")}>View all</button></div>{data.items.slice(0, 5).map((item) => <button className="recent-item" key={item.id} onClick={() => openEdit(item)}><img src={item.posterUrl} alt="" /><span><strong>{item.title}</strong><small>{item.type} · {item.updatedAt.slice(0, 10)}</small></span><i className={item.status}>{item.status}</i><MoreHorizontal /></button>)}</div>
                <aside className="quick-panel"><div className="panel-heading"><div><span>QUICK START</span><h2>Publish in 3 steps</h2></div></div><ol><li><span>1</span><div><strong>Add the details</strong><small>Title, artwork and description</small></div></li><li><span>2</span><div><strong>Paste embed code</strong><small>HTTPS iframe or player URL</small></div></li><li><span>3</span><div><strong>Press publish</strong><small>Instantly appears on the homepage</small></div></li></ol><button onClick={() => openNew()}><CirclePlay /> Create a post</button></aside>
              </section>
            </>
          )}

          {tab === "content" && (
            <section className="content-manager">
              <div className="page-title"><div><span>LIBRARY</span><h1>All content</h1><p>Create, edit, publish or unpublish every movie and series.</p></div><button onClick={() => openNew()}><Plus /> Add new</button></div>
              <div className="manager-toolbar"><div className="manager-search"><Search /><input placeholder="Search posts…" value={query} onChange={(event) => setQuery(event.target.value)} /></div><label><span>Show</span><select value={filter} onChange={(event) => setFilter(event.target.value)}><option value="all">All content</option><option value="published">Published</option><option value="draft">Drafts</option><option value="movie">Movies</option><option value="series">Series</option></select><ChevronDown /></label></div>
              <div className="content-table"><div className="content-row header"><span>Title</span><span>Type</span><span>Status</span><span>Updated</span><span>Actions</span></div>{filtered.map((item) => <div className="content-row" key={item.id}><span className="content-title"><img src={item.posterUrl} alt="" /><span><strong>{item.title}</strong><small>/{item.slug}</small></span></span><span><i className="type-pill">{item.type}</i></span><span><button className={`status-pill ${item.status}`} onClick={() => togglePublish(item)}><i />{item.status}</button></span><span>{new Date(item.updatedAt).toLocaleDateString()}</span><span className="row-actions"><button title="Edit" onClick={() => openEdit(item)}><FilePenLine /></button><Link title="Preview" href={`/watch/${item.slug}`} target="_blank"><Eye /></Link><button title="Delete" className="danger" onClick={() => remove(item)}><Trash2 /></button></span></div>)}</div>
              {!filtered.length && <div className="manager-empty"><LibraryBig /><h3>No posts found</h3><p>Try a different filter or create a new post.</p></div>}
            </section>
          )}

          {tab === "editor" && (
            <form className="post-editor" onSubmit={(event) => submitItem(event)}>
              <div className="editor-heading"><div><span>{editing.id && data.items.some((item) => item.id === editing.id) ? "EDIT POST" : "CREATE POST"}</span><h1>{editing.title || "Untitled post"}</h1><p>Complete the details, paste your authorised embed code and publish.</p></div><div><button type="button" className="editor-secondary" onClick={(event) => submitItem(event as unknown as FormEvent, "draft")} disabled={saving}><Save /> Save draft</button><button type="button" className="editor-publish" onClick={(event) => submitItem(event as unknown as FormEvent, "published")} disabled={saving}><Upload /> {saving ? "Saving…" : "Publish"}</button></div></div>
              <div className="editor-layout">
                <div className="editor-primary">
                  <section className="editor-card"><div className="editor-card-title"><span>01</span><div><h2>Core details</h2><p>The information viewers see first.</p></div></div><div className="field-grid"><Field label="Title" full><input value={editing.title} onChange={(event) => { change("title", event.target.value); if (!data.items.some((item) => item.id === editing.id)) change("slug", slugify(event.target.value)); }} placeholder="e.g. Shadow Protocol" required /></Field><Field label="URL slug" full hint={`Preview: /watch/${editing.slug || "your-title"}`}><input value={editing.slug} onChange={(event) => change("slug", slugify(event.target.value))} /></Field><Field label="Content type"><select value={editing.type} onChange={(event) => change("type", event.target.value as "movie" | "series")}><option value="movie">Movie</option><option value="series">Series</option></select></Field><Field label="Release year"><input type="number" value={editing.year} onChange={(event) => change("year", Number(event.target.value))} /></Field><Field label="Runtime"><input value={editing.runtime} onChange={(event) => change("runtime", event.target.value)} placeholder="1h 45m" /></Field><Field label="Rating (0–10)"><input type="number" min="0" max="10" step="0.1" value={editing.rating} onChange={(event) => change("rating", Number(event.target.value))} /></Field><Field label="Language"><input value={editing.language} onChange={(event) => change("language", event.target.value)} /></Field><Field label="Maturity rating"><input value={editing.maturity} onChange={(event) => change("maturity", event.target.value)} placeholder="16+" /></Field><Field label="Genres" full hint="Separate genres with commas."><input value={editing.genres.join(", ")} onChange={(event) => change("genres", event.target.value.split(",").map((value) => value.trim()).filter(Boolean))} placeholder="Action, Thriller, Mystery" /></Field><Field label="Synopsis" full><textarea rows={6} value={editing.synopsis} onChange={(event) => change("synopsis", event.target.value)} placeholder="Write an engaging description…" /></Field></div></section>

                  <section className="editor-card embed-card"><div className="editor-card-title"><span>02</span><div><h2>Video player</h2><p>Paste an HTTPS iframe embed code or its direct player URL.</p></div></div><div className="embed-security"><ShieldIcon /><p><strong>Safe embed processing</strong>The CMS extracts the HTTPS player URL and removes scripts or unwanted markup.</p></div><Field label={editing.type === "series" ? "Main / fallback embed code" : "Movie embed code"} full hint={'Example: <iframe src="https://player.example.com/embed/123"></iframe>'}><textarea className="code-input" rows={5} value={editing.embedUrl} onChange={(event) => change("embedUrl", event.target.value)} placeholder={'<iframe src="https://…" allowfullscreen></iframe>'} /></Field>{editing.embedUrl && <div className="embed-preview"><span>PLAYER PREVIEW</span><iframe src={extractPreviewUrl(editing.embedUrl)} title="Embed preview" sandbox="allow-scripts allow-same-origin allow-presentation allow-forms" /></div>}</section>

                  {editing.type === "series" && <EpisodeEditor episodes={editing.episodes} onChange={(episodes) => change("episodes", episodes)} />}
                  <CastEditor cast={editing.cast} onChange={(cast) => change("cast", cast)} />
                </div>

                <aside className="editor-sidebar">
                  <section className="editor-card publish-card"><div className="editor-card-title"><div><h2>Publishing</h2><p>Control where this post appears.</p></div></div><Field label="Status"><select value={editing.status} onChange={(event) => change("status", event.target.value as "draft" | "published")}><option value="draft">Draft</option><option value="published">Published</option></select></Field><Field label="Homepage section"><select value={editing.section} onChange={(event) => change("section", event.target.value)}><option>New Releases</option><option>Top Rated</option><option>Series</option><option>Hidden Gems</option><option>Kids</option></select></Field><label className="toggle-row"><span><strong>Featured hero</strong><small>Show as the large homepage banner</small></span><input type="checkbox" checked={editing.featured} onChange={(event) => change("featured", event.target.checked)} /></label><label className="toggle-row"><span><strong>Trending</strong><small>Add to the trending carousel</small></span><input type="checkbox" checked={editing.trending} onChange={(event) => change("trending", event.target.checked)} /></label><button type="submit" className="full-save" disabled={saving}><Save /> {saving ? "Saving…" : `Save as ${editing.status}`}</button>{editing.slug && <Link className="preview-link" href={`/watch/${editing.slug}`} target="_blank"><Eye /> Preview post</Link>}</section>
                  <section className="editor-card artwork-card"><div className="editor-card-title"><div><h2>Artwork</h2><p>Use public HTTPS image URLs.</p></div></div><Field label="Poster URL"><input value={editing.posterUrl} onChange={(event) => change("posterUrl", event.target.value)} placeholder="https://…" /></Field><div className="poster-preview">{editing.posterUrl ? <img src={editing.posterUrl} alt="Poster preview" /> : <span><Film /> Poster preview</span>}</div><Field label="Backdrop URL"><input value={editing.backdropUrl} onChange={(event) => change("backdropUrl", event.target.value)} placeholder="https://…" /></Field>{editing.backdropUrl && <div className="backdrop-preview" style={{ backgroundImage: `url("${editing.backdropUrl}")` }} />}</section>
                </aside>
              </div>
            </form>
          )}

          {tab === "settings" && (
            <form className="settings-page" onSubmit={saveSettings}><div className="page-title"><div><span>CONFIGURATION</span><h1>Site settings</h1><p>Update the public identity and homepage message.</p></div><button disabled={saving}><Save /> Save changes</button></div><section className="settings-card"><div className="settings-preview" style={{ "--accent": data.settings.accent } as React.CSSProperties}><Brand /><span>{data.settings.announcement}</span><h2>{data.settings.tagline}</h2><i /></div><div className="settings-fields"><Field label="Website name" full><input value={data.settings.siteName} onChange={(event) => setData((current) => ({ ...current, settings: { ...current.settings, siteName: event.target.value } }))} /></Field><Field label="Tagline" full><input value={data.settings.tagline} onChange={(event) => setData((current) => ({ ...current, settings: { ...current.settings, tagline: event.target.value } }))} /></Field><Field label="Homepage announcement" full><input value={data.settings.announcement} onChange={(event) => setData((current) => ({ ...current, settings: { ...current.settings, announcement: event.target.value } }))} /></Field><Field label="Accent colour"><input type="color" value={data.settings.accent} onChange={(event) => setData((current) => ({ ...current, settings: { ...current.settings, accent: event.target.value } }))} /></Field><div className="reset-demo"><RefreshCw /><div><strong>Reset sample content</strong><p>Restore the original RizzMovies demonstration posts in this browser.</p></div><button type="button" onClick={() => { resetLocalDemo(); refresh(); notify("Demo content restored."); }}>Reset demo</button></div></div></section></form>
          )}
        </main>
      </div>
    </div>
  );
}

function ShieldIcon() { return <span className="shield-icon">✓</span>; }

function extractPreviewUrl(value: string) {
  const match = value.match(/<iframe[^>]+src=["']([^"']+)["']/i);
  const candidate = match?.[1] || value;
  try { const url = new URL(candidate); return url.protocol === "https:" ? url.toString() : ""; } catch { return ""; }
}

function EpisodeEditor({ episodes, onChange }: { episodes: Episode[]; onChange: (episodes: Episode[]) => void }) {
  function add() { onChange([...episodes, { id: crypto.randomUUID(), season: 1, number: episodes.length + 1, title: `Episode ${episodes.length + 1}`, synopsis: "", embedUrl: "", thumbnailUrl: "" }]); }
  function update(index: number, key: keyof Episode, value: string | number) { onChange(episodes.map((episode, current) => current === index ? { ...episode, [key]: value } : episode)); }
  return <section className="editor-card episode-editor"><div className="editor-card-title"><span>03</span><div><h2>Seasons & episodes</h2><p>Add an individual embed player for every episode.</p></div><button type="button" onClick={add}><Plus /> Add episode</button></div>{episodes.length ? <div className="episode-editor-list">{episodes.map((episode, index) => <details key={episode.id} open={index === episodes.length - 1}><summary><span>S{episode.season} E{episode.number}</span><strong>{episode.title}</strong><ChevronDown /></summary><div className="field-grid"><Field label="Season"><input type="number" min="1" value={episode.season} onChange={(event) => update(index, "season", Number(event.target.value))} /></Field><Field label="Episode"><input type="number" min="1" value={episode.number} onChange={(event) => update(index, "number", Number(event.target.value))} /></Field><Field label="Episode title" full><input value={episode.title} onChange={(event) => update(index, "title", event.target.value)} /></Field><Field label="Synopsis" full><textarea rows={3} value={episode.synopsis} onChange={(event) => update(index, "synopsis", event.target.value)} /></Field><Field label="Embed code / URL" full><textarea className="code-input" rows={3} value={episode.embedUrl} onChange={(event) => update(index, "embedUrl", event.target.value)} /></Field><Field label="Thumbnail URL" full><input value={episode.thumbnailUrl} onChange={(event) => update(index, "thumbnailUrl", event.target.value)} /></Field><button type="button" className="remove-subitem" onClick={() => onChange(episodes.filter((_, current) => current !== index))}><Trash2 /> Remove episode</button></div></details>)}</div> : <div className="subitem-empty"><Tv2 /><p>No episodes yet.</p><button type="button" onClick={add}>Add the first episode</button></div>}</section>;
}

function CastEditor({ cast, onChange }: { cast: CastMember[]; onChange: (cast: CastMember[]) => void }) {
  function add() { onChange([...cast, { name: "", role: "", image: "" }]); }
  function update(index: number, key: keyof CastMember, value: string) { onChange(cast.map((member, current) => current === index ? { ...member, [key]: value } : member)); }
  return <section className="editor-card cast-editor"><div className="editor-card-title"><span>04</span><div><h2>Cast & characters</h2><p>Optional people shown on the detail page.</p></div><button type="button" onClick={add}><Plus /> Add person</button></div>{cast.map((member, index) => <div className="cast-edit-row" key={index}><div className="cast-edit-photo">{member.image ? <img src={member.image} alt="" /> : <span>{member.name.slice(0, 1) || "?"}</span>}</div><input placeholder="Actor name" value={member.name} onChange={(event) => update(index, "name", event.target.value)} /><input placeholder="Character / role" value={member.role} onChange={(event) => update(index, "role", event.target.value)} /><input placeholder="Photo URL" value={member.image} onChange={(event) => update(index, "image", event.target.value)} /><button type="button" onClick={() => onChange(cast.filter((_, current) => current !== index))}><X /></button></div>)}</section>;
}
