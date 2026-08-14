import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpen, Clock3, Sparkles } from "lucide-react";
import { resourceArticles } from "@/lib/resources";

export const metadata: Metadata = {
  title: "Resources & Workforce Management Guides",
  description: "Practical guides to time tracking, team management, workforce analytics, and getting more value from Watchtower.",
  alternates: { canonical: "/resources" },
  openGraph: {
    title: "Watchtower Resources",
    description: "Practical workforce management guides for modern teams.",
    url: "/resources",
  },
};

export default function ResourcesPage() {
  const featured = resourceArticles.find((article) => article.featured) ?? resourceArticles[0];
  const remaining = resourceArticles.filter((article) => article.slug !== featured.slug);

  return (
    <>
      <section className="relative overflow-hidden border-b border-slate-200 bg-slate-950 px-5 pb-24 pt-40 text-white sm:px-8 sm:pb-32 sm:pt-48">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_20%,rgba(124,58,237,0.35),transparent_32%),radial-gradient(circle_at_10%_80%,rgba(34,211,238,0.16),transparent_28%)]" />
        <div className="relative mx-auto max-w-7xl">
          <div className="mb-5 flex items-center gap-2 text-sm font-semibold text-violet-300">
            <BookOpen className="size-4" /> Watchtower knowledge base
          </div>
          <h1 className="max-w-4xl text-5xl font-black tracking-[-0.045em] sm:text-7xl">Practical ideas for better work.</h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">Quick guides for setting up Watchtower, supporting your team, and turning workforce data into decisions.</p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-24">
        <Link href={`/resources/${featured.slug}`} className="group grid overflow-hidden rounded-[2rem] border border-violet-100 bg-white shadow-xl shadow-slate-200/50 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="p-8 sm:p-12">
            <div className="mb-8 flex items-center gap-2 text-sm font-bold text-violet-700"><Sparkles className="size-4" /> Featured guide</div>
            <p className="text-sm font-semibold text-slate-500">{featured.category}</p>
            <h2 className="mt-3 text-3xl font-black tracking-[-0.035em] sm:text-5xl">{featured.title}</h2>
            <p className="mt-5 max-w-xl text-base leading-7 text-slate-600">{featured.description}</p>
            <span className="mt-9 inline-flex items-center gap-2 font-bold text-violet-700">Read guide <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" /></span>
          </div>
          <div className="relative flex min-h-72 items-end overflow-hidden bg-slate-950 p-8 text-white sm:p-12">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_25%,rgba(139,92,246,0.8),transparent_20%),linear-gradient(135deg,transparent_20%,rgba(124,58,237,0.18)_20%,rgba(124,58,237,0.18)_21%,transparent_21%,transparent_40%,rgba(34,211,238,0.12)_40%,rgba(34,211,238,0.12)_41%,transparent_41%)]" />
            <div className="relative">
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-violet-300">Start here</p>
              <p className="mt-3 max-w-sm text-2xl font-bold leading-snug">From first login to your first useful workforce insight.</p>
            </div>
          </div>
        </Link>

        <div className="mt-20">
          <p className="text-sm font-bold text-violet-700">Latest resources</p>
          <h2 className="mt-2 text-3xl font-black tracking-[-0.035em] sm:text-4xl">Guidance you can use today</h2>
        </div>
        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {remaining.map((article) => (
            <article key={article.slug} className="group flex min-h-80 flex-col rounded-3xl border border-slate-200 bg-white p-7 transition hover:-translate-y-1 hover:border-violet-200 hover:shadow-xl hover:shadow-violet-100/50">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                <span className="rounded-full bg-violet-50 px-3 py-1.5 text-violet-700">{article.category}</span>
                <span className="flex items-center gap-1.5"><Clock3 className="size-3.5" /> {article.readTime}</span>
              </div>
              <h3 className="mt-8 text-2xl font-black tracking-[-0.025em]">{article.title}</h3>
              <p className="mt-4 flex-1 text-sm leading-6 text-slate-600">{article.description}</p>
              <Link href={`/resources/${article.slug}`} className="mt-8 inline-flex items-center gap-2 font-bold text-violet-700" aria-label={`Read ${article.title}`}>
                Read article <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="border-t border-slate-200 bg-white px-5 py-20 sm:px-8">
        <div className="mx-auto flex max-w-5xl flex-col items-start justify-between gap-8 rounded-[2rem] bg-violet-700 p-8 text-white sm:p-12 md:flex-row md:items-center">
          <div>
            <p className="text-sm font-bold text-violet-200">See it in action</p>
            <h2 className="mt-2 text-3xl font-black tracking-tight">Make workforce data useful.</h2>
          </div>
          <Link href="/request-demo" className="inline-flex h-12 items-center gap-2 rounded-full bg-white px-6 font-bold text-violet-800 transition hover:bg-violet-50">
            Request a demo <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>
    </>
  );
}
