import type { Metadata } from "next";
import { Suspense } from "react";
import { getYears, getCountries, getCities, searchShows } from "@/lib/db";
import { getReleasesMapForShows } from "@/lib/releases";
import ShowList from "@/components/ShowList";
import SearchFilters from "./SearchFilters";

export const metadata: Metadata = {
  title: "Search Shows",
  description: "Search Grateful Dead shows by year, country, and city.",
};

interface Props {
  searchParams: Promise<{ year?: string; country?: string; city?: string }>;
}

export default async function SearchPage({ searchParams }: Props) {
  const { year, country, city } = await searchParams;

  const years = getYears();
  const countries = getCountries();
  const cities = getCities();

  const hasFilter = year || country || city;
  const shows = hasFilter ? searchShows({ year, country, city }) : [];
  const releasesByDate = getReleasesMapForShows();

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="text-3xl font-bold text-dead-gold mb-8">Search Shows</h1>

      <Suspense>
        <SearchFilters years={years} countries={countries} cities={cities} />
      </Suspense>

      {hasFilter ? (
        <>
          <p className="text-gray-400 mb-6 text-sm">
            {shows.length} show{shows.length !== 1 ? "s" : ""} found
            {year ? ` in ${year}` : ""}
            {country ? ` in ${country}` : ""}
            {city ? ` in ${city}` : ""}
          </p>
          <ShowList shows={shows} releasesByDate={releasesByDate} />
        </>
      ) : (
        <p className="text-gray-500 italic text-center py-16">
          Select a year, country, or city to browse shows.
        </p>
      )}
    </div>
  );
}
