import type { Metadata } from "next";
import Link from "next/link";
import { getAllCollections, getCollectionSlug } from "@/lib/releases";

export const metadata: Metadata = {
  title: "Official Release Collections",
  description:
    "Browse Grateful Dead official release collections like Dick's Picks, Dave's Picks, and Boxed Sets.",
};

export default function CollectionsPage() {
  const collections = getAllCollections();

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="text-3xl font-bold text-dead-gold mb-8">
        Official Release Collections
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {collections.map((c) => (
          <Link
            key={c.name}
            href={`/collections/${getCollectionSlug(c.name)}`}
            className="group p-6 rounded-xl border border-dead-border bg-dead-card hover:border-dead-gold hover:bg-dead-card-hover transition-all"
          >
            <h2 className="text-lg font-semibold text-white group-hover:text-dead-gold transition-colors">
              {c.name}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {c.showCount} show{c.showCount !== 1 ? "s" : ""}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
