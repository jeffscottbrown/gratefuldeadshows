'use client';

import Link from 'next/link';

export default function TodayLink() {
  const now = new Date();
  const month = now.getMonth() + 1;
  const day = now.getDate();
  return (
    <Link
      href={`/birthday?month=${month}&day=${day}`}
      className="px-3 py-1.5 rounded-md text-sm text-dead-gold border border-dead-gold/40 hover:bg-dead-gold hover:text-dead-bg transition-colors font-medium"
    >
      Today
    </Link>
  );
}
