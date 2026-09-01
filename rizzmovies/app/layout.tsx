import type { ReactNode } from "react";
import "./globals.css";

export const metadata = {
  title: "RizzMovies — Movies & Series",
  description: "A premium cinematic catalogue for movies and series.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
