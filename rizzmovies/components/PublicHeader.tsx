"use client";

import Link from "next/link";
import { Bell, Menu, Search, UserRound, X } from "lucide-react";
import { useState } from "react";
import { Brand } from "./Brand";

export function PublicHeader({ onSearch }: { onSearch?: (value: string) => void }) {
  const [menu, setMenu] = useState(false);
  const [searching, setSearching] = useState(false);

  return (
    <header className="public-header">
      <div className="header-inner">
        <Link href="/" className="brand-link" aria-label="RizzMovies home"><Brand /></Link>
        <nav className={menu ? "main-nav open" : "main-nav"}>
          <Link href="/">Home</Link>
          <Link href="/#movies">Movies</Link>
          <Link href="/#series">Series</Link>
          <Link href="/#genres">Genres</Link>
          <Link href="/#new">New & Popular</Link>
          <Link href="/admin/login" className="mobile-admin-link">Admin</Link>
        </nav>
        <div className="header-actions">
          <div className={searching ? "header-search active" : "header-search"}>
            <Search size={18} />
            {searching && <input autoFocus placeholder="Search titles…" onChange={(event) => onSearch?.(event.target.value)} />}
          </div>
          <button className="icon-button" aria-label="Search" onClick={() => setSearching((value) => !value)}>{searching ? <X size={19} /> : <Search size={19} />}</button>
          <button className="icon-button desktop-only" aria-label="Notifications"><Bell size={19} /></button>
          <Link href="/admin/login" className="user-chip" aria-label="Admin login"><UserRound size={17} /><span>Admin</span></Link>
          <button className="icon-button mobile-menu" aria-label="Menu" onClick={() => setMenu((value) => !value)}>{menu ? <X /> : <Menu />}</button>
        </div>
      </div>
    </header>
  );
}
