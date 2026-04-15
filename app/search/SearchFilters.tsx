"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useRef } from "react";

interface Props {
  years: { year: string; count: number }[];
  countries: { country: string; count: number }[];
  cities: { city: string; country: string; count: number }[];
}

export default function SearchFilters({ years, countries, cities }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const year = searchParams.get("year") ?? "";
  const country = searchParams.get("country") ?? "";
  const city = searchParams.get("city") ?? "";

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const push = useCallback(
    (params: { year: string; country: string; city: string }) => {
      const q = new URLSearchParams();
      if (params.year) q.set("year", params.year);
      if (params.country) q.set("country", params.country);
      if (params.city) q.set("city", params.city);
      router.replace(`/search${q.size ? `?${q}` : ""}`);
    },
    [router],
  );

  function onYearChange(e: React.ChangeEvent<HTMLSelectElement>) {
    push({ year: e.target.value, country, city: city });
  }

  function onCountryChange(e: React.ChangeEvent<HTMLSelectElement>) {
    push({ year, country: e.target.value, city: city });
  }

  function onCityChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      push({ year, country, city: val });
    }, 350);
  }

  function onClear() {
    router.replace("/search");
  }

  const hasFilter = year || country || city;

  return (
    <div className="mb-8 p-5 rounded-xl border border-dead-border bg-dead-card flex flex-wrap gap-4 items-end">
      {/* Year */}
      <div className="flex flex-col gap-1 min-w-[120px]">
        <label htmlFor="year" className="text-xs text-gray-500 uppercase tracking-wider font-medium">
          Year
        </label>
        <select
          id="year"
          value={year}
          onChange={onYearChange}
          className="bg-dead-bg border border-dead-border rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-dead-gold"
        >
          <option value="">Any year</option>
          {years.map((y) => (
            <option key={y.year} value={y.year}>{y.year}</option>
          ))}
        </select>
      </div>

      {/* Country */}
      <div className="flex flex-col gap-1 min-w-[160px]">
        <label htmlFor="country" className="text-xs text-gray-500 uppercase tracking-wider font-medium">
          Country
        </label>
        <select
          id="country"
          value={country}
          onChange={onCountryChange}
          className="bg-dead-bg border border-dead-border rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-dead-gold"
        >
          <option value="">Any country</option>
          {countries.map((c) => (
            <option key={c.country} value={c.country}>{c.country}</option>
          ))}
        </select>
      </div>

      {/* City */}
      <div className="flex flex-col gap-1 min-w-[200px]">
        <label htmlFor="city" className="text-xs text-gray-500 uppercase tracking-wider font-medium">
          City
        </label>
        <input
          key={city}
          id="city"
          type="text"
          list="city-list"
          defaultValue={city}
          onChange={onCityChange}
          placeholder="Any city"
          className="bg-dead-bg border border-dead-border rounded-lg px-3 py-2 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-dead-gold"
        />
        <datalist id="city-list">
          {cities.map((c) => (
            <option key={`${c.city}-${c.country}`} value={c.city} />
          ))}
        </datalist>
      </div>

      {hasFilter && (
        <button
          type="button"
          onClick={onClear}
          className="px-4 py-2 rounded-lg border border-dead-border bg-dead-bg text-gray-400 text-sm font-medium hover:text-white hover:bg-dead-card transition-colors"
        >
          Clear
        </button>
      )}
    </div>
  );
}
