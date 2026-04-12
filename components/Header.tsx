import Link from "next/link";
import TodayLink from "./TodayLink";

const navLinks = [
  { href: "/about", label: "About" },
  { href: "/years", label: "By Year" },
  { href: "/cities", label: "By City" },
  { href: "/countries", label: "By Country" },
  { href: "/songs", label: "By Song" },
  { href: "/birthday", label: "Birthday Shows" },
];

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-dead-border bg-dead-bg/90 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <Link
          href="/"
          className="flex items-center gap-2 text-dead-gold font-bold text-lg tracking-wide hover:text-dead-gold-light transition-colors shrink-0"
        >
          <span className="text-2xl">☮</span>
          <span className="hidden sm:inline">Grateful Dead Shows</span>
        </Link>
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="px-3 py-1.5 rounded-md text-sm text-gray-300 hover:text-dead-gold hover:bg-dead-card transition-colors"
            >
              {link.label}
            </Link>
          ))}
          <TodayLink />
        </nav>
        {/* Mobile nav */}
        <nav className="flex md:hidden items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="px-2 py-1 rounded text-xs text-gray-400 hover:text-dead-gold transition-colors"
            >
              {link.label.split(" ")[1] ?? link.label}
            </Link>
          ))}
          <TodayLink />
        </nav>
      </div>
    </header>
  );
}
