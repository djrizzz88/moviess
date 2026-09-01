"use client";

import Link from "next/link";
import { ArrowLeft, Eye, EyeOff, LockKeyhole, LogIn, ShieldCheck } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { Brand } from "@/components/Brand";
import { adminLogin, adminStatus, DEMO_EMAIL, DEMO_PASSWORD } from "@/lib/client-cms";

export default function AdminLoginPage() {
  const [email, setEmail] = useState(DEMO_EMAIL);
  const [password, setPassword] = useState(DEMO_PASSWORD);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => { adminStatus().then((ok) => { if (ok) location.href = "/admin"; }); }, []);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true); setError("");
    try {
      await adminLogin(email.trim(), password);
      location.href = "/admin";
    } catch {
      setError("Incorrect email or password. Use the test details shown below.");
    } finally { setBusy(false); }
  }

  return (
    <main className="admin-login-page">
      <div className="login-backdrop" />
      <Link href="/" className="back-home"><ArrowLeft /> Back to RizzMovies</Link>
      <section className="login-card">
        <Brand />
        <div className="login-icon"><ShieldCheck /></div>
        <div className="login-heading"><span>SECURE CMS</span><h1>Welcome back</h1><p>Sign in to manage movies, series and site settings.</p></div>
        <form onSubmit={submit}>
          <label>Email address<div className="login-input"><LogIn /><input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></div></label>
          <label>Password<div className="login-input"><LockKeyhole /><input type={showPassword ? "text" : "password"} value={password} onChange={(event) => setPassword(event.target.value)} required /><button type="button" onClick={() => setShowPassword((value) => !value)}>{showPassword ? <EyeOff /> : <Eye />}</button></div></label>
          {error && <p className="form-error">{error}</p>}
          <button className="login-submit" disabled={busy}>{busy ? "Signing in…" : "Sign in to dashboard"} <ArrowLeft className="login-arrow" /></button>
        </form>
        <div className="demo-credentials"><span>TEST LOGIN</span><p><strong>{DEMO_EMAIL}</strong><strong>{DEMO_PASSWORD}</strong></p></div>
      </section>
    </main>
  );
}
