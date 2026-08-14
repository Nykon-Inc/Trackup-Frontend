import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Clock3 } from "lucide-react";
import { getResourceArticle, resourceArticles } from "@/lib/resources";

type ArticlePageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return resourceArticles.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = getResourceArticle(slug);
  if (!article) return {};
  return {
    title: article.title,
    description: article.description,
    alternates: { canonical: `/resources/${article.slug}` },
    openGraph: {
      type: "article",
      title: article.title,
      description: article.description,
      url: `/resources/${article.slug}`,
      publishedTime: article.publishedAt,
      modifiedTime: article.updatedAt,
    },
  };
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const article = getResourceArticle(slug);
  if (!article) notFound();

  const related = resourceArticles.filter((item) => item.slug !== article.slug).slice(0, 2);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.description,
    datePublished: article.publishedAt,
    dateModified: article.updatedAt,
    author: { "@type": "Organization", name: "Nykon Inc" },
    publisher: { "@type": "Organization", name: "Watchtower" },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <article>
        <header className="border-b border-slate-200 bg-white px-5 pb-16 pt-36 sm:px-8 sm:pb-24 sm:pt-44">
          <div className="mx-auto max-w-3xl">
            <Link href="/resources" className="inline-flex items-center gap-2 text-sm font-bold text-violet-700 hover:text-violet-900"><ArrowLeft className="size-4" /> All resources</Link>
            <div className="mt-10 flex items-center gap-4 text-sm font-semibold text-slate-500">
              <span className="rounded-full bg-violet-50 px-3 py-1.5 text-violet-700">{article.category}</span>
              <span className="flex items-center gap-1.5"><Clock3 className="size-4" /> {article.readTime}</span>
            </div>
            <h1 className="mt-6 text-4xl font-black tracking-[-0.045em] text-slate-950 sm:text-6xl">{article.title}</h1>
            <p className="mt-6 text-xl leading-8 text-slate-600">{article.description}</p>
            <p className="mt-8 text-sm text-slate-500">Published {new Date(`${article.publishedAt}T12:00:00`).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</p>
          </div>
        </header>

        <div className="mx-auto max-w-3xl px-5 py-16 sm:px-8 sm:py-24">
          <div className="space-y-14">
            {article.sections.map((section) => (
              <section key={section.heading}>
                <h2 className="text-2xl font-black tracking-[-0.025em] text-slate-950 sm:text-3xl">{section.heading}</h2>
                <div className="mt-5 space-y-5 text-lg leading-8 text-slate-600">
                  {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                  {section.bullets && (
                    <ul className="space-y-3 border-l-2 border-violet-200 pl-6">
                      {section.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}
                    </ul>
                  )}
                </div>
              </section>
            ))}
          </div>
          <div className="mt-20 rounded-3xl bg-slate-950 p-8 text-white sm:p-10">
            <p className="text-sm font-bold text-violet-300">Ready for a closer look?</p>
            <h2 className="mt-3 text-3xl font-black tracking-tight">See how Watchtower fits your team.</h2>
            <Link href="/request-demo" className="mt-7 inline-flex items-center gap-2 rounded-full bg-violet-600 px-6 py-3 font-bold transition hover:bg-violet-500">Request a demo <ArrowRight className="size-4" /></Link>
          </div>
        </div>
      </article>

      <aside className="border-t border-slate-200 bg-white px-5 py-16 sm:px-8">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-2xl font-black">Keep reading</h2>
          <div className="mt-7 grid gap-5 md:grid-cols-2">
            {related.map((item) => (
              <Link key={item.slug} href={`/resources/${item.slug}`} className="group rounded-2xl border border-slate-200 p-6 transition hover:border-violet-300">
                <p className="text-sm font-semibold text-violet-700">{item.category}</p>
                <h3 className="mt-2 text-xl font-black">{item.title}</h3>
                <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-slate-600">Read guide <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" /></span>
              </Link>
            ))}
          </div>
        </div>
      </aside>
    </>
  );
}
