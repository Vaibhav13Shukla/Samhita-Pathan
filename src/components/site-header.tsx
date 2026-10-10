import Link from "next/link";
import { BookOpenText, MoveUpRight } from "lucide-react";

export function SiteHeader() {
  return (
    <header className="site-header">
      <Link className="brand-mark" href="/" aria-label="Samhita Pathan home">
        <span className="brand-icon" aria-hidden="true"><BookOpenText size={20} strokeWidth={1.8} /></span>
        <span><strong>samhita</strong> pathan</span>
      </Link>
      <nav className="desktop-nav" aria-label="Primary navigation">
        <Link href="/#method">method</Link>
        <Link href="/study">library</Link>
        <Link href="/about">about</Link>
      </nav>
      <Link className="ink-button header-action" href="/study">
        begin learning <MoveUpRight size={16} aria-hidden="true" />
      </Link>
    </header>
  );
}
