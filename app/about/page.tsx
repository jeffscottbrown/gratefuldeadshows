import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About",
  description: "About GratefulDeadShows.com — built for the community.",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 text-gray-100">
      {/* Header Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-dead-gold mb-4">
          Built for the Community
        </h1>
        <p className="text-xl italic text-gray-400">
          &ldquo;Once in a while you get shown the light in the strangest of
          places if you look at it right.&rdquo;
        </p>
      </div>

      {/* Main Content */}
      <section className="space-y-8 leading-relaxed text-lg text-gray-300">
        <p>
          Welcome to{" "}
          <strong className="text-gray-100">GratefulDeadShows.com</strong>. This
          project was born out of appreciation for the music, the history, and
          most importantly, the incredible energy that the Grateful Dead
          community shares.
        </p>

        <div className="bg-dead-card border-l-4 border-dead-gold p-6 rounded-r-lg">
          <p className="text-gray-300">
            This site has been built to be a helpful resource for fans old and
            new. Whether you&apos;re chasing a specific sequence from &apos;77
            or discovering a hidden gem from the 90s, I hope this tool adds a
            little more joy to your journey through the tapes.
          </p>
        </div>

        <h2 className="text-2xl font-semibold text-dead-gold mt-10">
          Sharing It Back
        </h2>
        <p>
          The magic of the Dead has always been about more than just the notes
          played on stage; it&apos;s about the collective spirit of the folks
          who listen. This app is my way of contributing back to that
          &ldquo;good vibe&rdquo; ecosystem. It is intended to be a shared space
          for exploration and connection.
        </p>
      </section>

      <hr className="my-12 border-dead-border" />

      {/* GitHub Section */}
      <section className="bg-dead-card rounded-2xl p-8 border border-dead-border">
        <h2 className="text-2xl font-bold text-gray-100 mb-4">
          Help Make It Better
        </h2>

        <p className="mb-6 text-gray-300">
          This is an open-source project, and I truly encourage the community to
          get involved. Your insights are what will make this site truly shine.
          If you have:
        </p>

        <ul className="list-disc pl-6 space-y-2 mb-8 text-gray-300">
          <li>Ideas for new features or enhancements</li>
          <li>Improvements for show data or accuracy</li>
          <li>General feedback on how to make the site more helpful</li>
          <li>A desire to contribute to the code</li>
        </ul>

        <Link
          href="https://github.com/jeffscottbrown/gratefuldeadshows/"
          target="_blank"
          className="inline-flex items-center justify-center px-6 py-3 bg-dead-gold text-dead-bg font-semibold rounded-lg hover:opacity-90 transition-opacity"
        >
          Visit the GitHub Repository ↗
        </Link>
      </section>
    </div>
  );
}
