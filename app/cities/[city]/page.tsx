import type { Metadata } from "next";
import Link from "next/link";
import { getShowsByCity } from "@/lib/db";
import { getReleasesMapForShows } from "@/lib/releases";
import ShowList from "@/components/ShowList";

interface Props {
  params: Promise<{ city: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { city } = await params;
  return { title: `Shows in ${decodeURIComponent(city)}` };
}

export default async function CityPage({ params }: Props) {
  const { city: encoded } = await params;
  const city = decodeURIComponent(encoded);
  const shows = getShowsByCity(city);
  const released = getReleasesMapForShows();

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/cities" className="hover:text-dead-gold transition-colors">
          Cities
        </Link>
        <span>/</span>
        <span className="text-gray-300">{city}</span>
      </div>
      <h1 className="text-3xl font-bold text-dead-gold mb-1">{city}</h1>
      <p className="text-gray-400 mb-8">
        {shows.length} show{shows.length !== 1 ? "s" : ""}
      </p>
      <ShowList shows={shows} releasesByDate={released} />
    </div>
  );
}
