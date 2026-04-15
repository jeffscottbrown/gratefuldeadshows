import Link from "next/link";
import { getStats } from "@/lib/db";

const navCards = [
  {
    href: "/years",
    label: "Browse by Year",
    icon: "📅",
    desc: "Explore shows decade by decade, from 1965 through 1995.",
    color: "from-purple-900/60 to-purple-800/30 border-purple-700/40",
    accent: "text-purple-300",
  },
  {
    href: "/cities",
    label: "Browse by City",
    icon: "🏙️",
    desc: "Find every city the Dead ever played, from Menlo Park to London.",
    color: "from-teal-900/60 to-teal-800/30 border-teal-700/40",
    accent: "text-teal-300",
  },
  {
    href: "/states",
    label: "Browse by State",
    icon: "🇺🇸",
    desc: "Explore shows by US state and region.",
    color: "from-emerald-900/60 to-emerald-800/30 border-emerald-700/40",
    accent: "text-emerald-300",
  },
  {
    href: "/countries",
    label: "Browse by Country",
    icon: "🌍",
    desc: "The Dead went global — see every country on the tour map.",
    color: "from-amber-900/60 to-amber-800/30 border-amber-700/40",
    accent: "text-amber-300",
  },
  {
    href: "/songs",
    label: "Browse by Song",
    icon: "🎸",
    desc: "Track every song ever played and when it appeared in the setlist.",
    color: "from-rose-900/60 to-rose-800/30 border-rose-700/40",
    accent: "text-rose-300",
  },
  {
    href: "/collections",
    label: "Browse by Collection",
    icon: "💿",
    desc: "Explore official release collections like Dick's Picks, Dave's Picks, and Boxed Sets.",
    color: "from-blue-900/60 to-blue-800/30 border-blue-700/40",
    accent: "text-blue-300",
  },
  {
    href: "/search",
    label: "Search Shows",
    icon: "🔍",
    desc: "Filter shows by year, country, and city.",
    color: "from-gray-900/60 to-gray-800/30 border-gray-700/40",
    accent: "text-gray-300",
  },
  {
    href: "/birthday",
    label: "Birthday Shows",
    icon: "🎂",
    desc: "Discover every Grateful Dead show played on your birthday.",
    color: "from-indigo-900/60 to-indigo-800/30 border-indigo-700/40",
    accent: "text-indigo-300",
  },
  {
    href: "/about",
    label: "About",
    icon: "🌈",
    desc: "Read a little about the site, why it is here, and how you could participate.",
    color: "from-indigo-900/60 to-indigo-800/30 border-indigo-700/40",
    accent: "text-indigo-300",
  },
];

function StatBadge({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center px-4 py-2">
      <div className="text-2xl font-bold text-dead-gold">{value}</div>
      <div className="text-xs text-gray-400 uppercase tracking-widest mt-0.5">
        {label}
      </div>
    </div>
  );
}

function fmt(n: number): string {
  return n.toLocaleString("en-US");
}

export default function HomePage() {
  const stats = getStats();

  return (
    <div>
      {/* Hero */}
      <section
        className="relative w-full overflow-hidden"
        style={{ minHeight: "420px" }}
      >
        <div className="absolute inset-0 bg-hero-gradient" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/hero.png"
          alt="Dancing Grateful Dead bears traveling the globe"
          className="absolute inset-0 w-full h-full object-cover opacity-80"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-dead-bg/40 via-transparent to-dead-bg" />

        {/* Hero text */}
        <div className="relative z-10 flex flex-col items-center justify-center text-center px-4 py-20">
          <h1 className="text-5xl md:text-7xl font-bold text-white drop-shadow-lg">
            <span className="text-dead-gold">Grateful</span>{" "}
            <span className="text-white">Dead</span>{" "}
            <span className="text-dead-teal-light">Shows</span>
          </h1>
          <p className="mt-4 text-lg md:text-xl text-gray-300 max-w-xl drop-shadow">
            A searchable archive of almost every concert — every city, every
            song, every year.
          </p>
        </div>
      </section>

      {/* Stats bar */}
      <section className="border-y border-dead-border bg-dead-card/60">
        <div className="mx-auto max-w-7xl px-4 py-4">
          <div className="flex flex-wrap justify-center divide-x divide-dead-border">
            <StatBadge value={fmt(stats.numberOfShows)} label="Shows" />
            <StatBadge value={fmt(stats.numberOfDistinctSongs)} label="Songs" />
            <StatBadge
              value={fmt(stats.numberOfSongPerformances)}
              label="Song Performances"
            />
            <StatBadge value={fmt(stats.numberOfVenues)} label="Venues" />
            <StatBadge value={fmt(stats.numberOfCities)} label="Cities" />
            <StatBadge value={fmt(stats.numberOfCountries)} label="Countries" />
          </div>
        </div>
      </section>

      {/* Navigation cards */}
      <section className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {navCards.map((card) => (
            <Link
              key={card.href}
              href={card.href}
              className={`group rounded-xl border bg-gradient-to-br ${card.color} p-6 hover:scale-[1.02] transition-all duration-200 hover:shadow-lg hover:shadow-black/30`}
            >
              <div className="text-3xl mb-3">{card.icon}</div>
              <h2
                className={`text-lg font-semibold ${card.accent} group-hover:text-white transition-colors`}
              >
                {card.label}
              </h2>
              <p className="mt-1 text-sm text-gray-400 group-hover:text-gray-300 transition-colors">
                {card.desc}
              </p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
