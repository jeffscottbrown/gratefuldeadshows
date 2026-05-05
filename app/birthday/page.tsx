import type { Metadata } from "next";
import { getAllShows } from "@/lib/db";
import BirthdayClient from "./BirthdayClient";

export const metadata: Metadata = { title: "Birthday Shows" };

export default async function BirthdayPage() {
  const allShows = getAllShows();

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-3xl font-bold text-dead-gold mb-2">Birthday Shows</h1>
      <p className="text-gray-400 mb-8">
        Find every Grateful Dead concert played on your birthday.
      </p>
      <BirthdayClient allShows={allShows} />
    </div>
  );
}
