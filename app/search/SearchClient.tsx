"use client";

import { useSearchParams } from "next/navigation";
import { useMemo } from "react";
import type { Show } from "@/lib/db";
import type { Collection } from "@/lib/releases";
import ShowList from "@/components/ShowList";
import SearchFilters from "./SearchFilters";

interface Props {
  allShows: Show[];
  years: { year: string; count: number }[];
  countries: { country: string; count: number }[];
  cities: { city: string; country: string; count: number }[];
  releasesByDate: Map<string, Collection[]>;
}

export default function SearchClient({
  allShows,
  years,
  countries,
  cities,
  releasesByDate,
}: Props) {
  const searchParams = useSearchParams();
  const year = searchParams.get("year") ?? "";
  const country = searchParams.get("country") ?? "";
  const city = searchParams.get("city") ?? "";

  const filteredShows = useMemo(() => {
    if (!year && !country && !city) return [];
    return allShows.filter((show) => {
      if (year && show.year !== year) return false;
      if (country && show.country.toLowerCase() !== country.toLowerCase())
        return false;
      if (city && show.city.toLowerCase() !== city.toLowerCase()) return false;
      return true;
    });
  }, [allShows, year, country, city]);

  const hasFilter = year || country || city;

  return (
    <>
      <SearchFilters years={years} countries={countries} cities={cities} />

      {hasFilter ? (
        <>
          <p className="text-gray-400 mb-6 text-sm">
            {filteredShows.length} show{filteredShows.length !== 1 ? "s" : ""}{" "}
            found
            {year ? ` in ${year}` : ""}
            {country ? ` in ${country}` : ""}
            {city ? ` in ${city}` : ""}
          </p>
          <ShowList shows={filteredShows} releasesByDate={releasesByDate} />
        </>
      ) : (
        <p className="text-gray-500 italic text-center py-16">
          Select a year, country, or city to browse shows.
        </p>
      )}
    </>
  );
}
