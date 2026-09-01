import Link from "next/link";
import { Brand } from "./Brand";

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-glow" />
      <div className="footer-grid">
        <div className="footer-brand"><Brand /><p>Your cinematic home for movies and series.</p><small>© 2026 RizzMovies. All rights reserved.</small></div>
        <div><strong>Explore</strong><Link href="/#movies">Movies</Link><Link href="/#series">Series</Link><Link href="/#genres">Genres</Link><Link href="/#new">New releases</Link></div>
        <div><strong>Information</strong><a href="#">About</a><a href="#">How it works</a><a href="#">Contact</a><Link href="/admin/login">Admin panel</Link></div>
        <div><strong>Legal</strong><a href="#">Privacy policy</a><a href="#">Terms of service</a><a href="#">DMCA</a><p className="legal-note">RizzMovies does not host videos. Authorised third-party players are embedded by the site administrator.</p></div>
      </div>
    </footer>
  );
}
