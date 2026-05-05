import type { Metadata } from "next";
import { Suspense } from "react";
import { getAllShows, getYears, getCountries, getCities } from "@/lib/db";
import { getReleasesMapForShows } from "@/lib/releases";
import SearchClient from "./SearchClient";

export const metadata: Metadata = {
  title: "Search Shows",
  description: "Search Grateful Dead shows by year, country, and city.",
};

export default async function SearchPage() {
  const allShows = getAllShows();
  const years = getYears();
  const countries = getCountries();
  const cities = getCities();
  const releasesByDate = getReleasesMapForShows();

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="text-3xl font-bold text-dead-gold mb-8">Search Shows</h1>
      <Suspense>
        <SearchClient
          allShows={allShows}
          years={years}
          countries={countries}
          cities={cities}
          releasesByDate={releasesByDate}
        />
      </Suspense>
    </div>
  );
}
