'use client';

import { useEffect, useState } from 'react';
import { quotes } from '@/lib/quotes';

export default function Footer() {
  const [quote, setQuote] = useState('');

  useEffect(() => {
    const pick = () => quotes[Math.floor(Math.random() * quotes.length)];
    setQuote(pick());
    const interval = setInterval(() => setQuote(pick()), 8000);
    return () => clearInterval(interval);
  }, []);

  return (
    <footer className="border-t border-dead-border bg-dead-card mt-auto">
      <div className="mx-auto max-w-7xl px-4 py-6 text-center">
        {quote && (
          <p className="text-dead-gold italic text-sm transition-all duration-700 opacity-100">
            &ldquo;{quote}&rdquo;
          </p>
        )}
        <p className="mt-3 text-gray-600 text-xs">
          Grateful Dead Shows &mdash; {new Date().getFullYear()}
        </p>
      </div>
    </footer>
  );
}
