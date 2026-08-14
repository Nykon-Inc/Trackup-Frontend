export type ResourceSection = {
  heading: string;
  paragraphs: string[];
  bullets?: string[];
};

export type ResourceArticle = {
  slug: string;
  title: string;
  description: string;
  category: "Getting started" | "Time tracking" | "Team management" | "Productivity";
  readTime: string;
  publishedAt: string;
  updatedAt: string;
  featured?: boolean;
  sections: ResourceSection[];
};

export const resourceArticles: ResourceArticle[] = [
  {
    slug: "getting-started-with-watchtower",
    title: "Getting started with Watchtower",
    description: "Set up your organization, create a project, invite your team, and begin tracking meaningful work.",
    category: "Getting started",
    readTime: "5 min read",
    publishedAt: "2026-08-13",
    updatedAt: "2026-08-13",
    featured: true,
    sections: [
      {
        heading: "Build your workspace around real work",
        paragraphs: [
          "Watchtower organizes work in two layers: organizations and projects. Your organization represents your company or team, while projects represent the client work, departments, or initiatives you want to measure.",
          "Start with a simple structure. You can always add more projects as your reporting needs grow.",
        ],
      },
      {
        heading: "Create your first project",
        paragraphs: ["Open Projects from your organization dashboard and select Create project. Give the project a clear name and a short description that helps team members understand what belongs there."],
        bullets: [
          "Use a client, department, or initiative name.",
          "Keep project descriptions specific and easy to scan.",
          "Archive inactive projects so current work stays easy to find.",
        ],
      },
      {
        heading: "Invite your team",
        paragraphs: [
          "Invite colleagues with their work email address and assign the role that matches their responsibilities. Administrators manage workspace settings, managers oversee projects and reports, and members track their work.",
          "Once everyone joins, confirm that each person can see the projects they need before your first tracking period begins.",
        ],
      },
      {
        heading: "Review your first week",
        paragraphs: ["After a few days of activity, use the dashboard to review hours, activity patterns, and project coverage. Treat the first week as a baseline: look for missing time, unclear project ownership, or unusual patterns before drawing conclusions."],
      },
    ],
  },
  {
    slug: "accurate-time-tracking-guide",
    title: "A practical guide to accurate time tracking",
    description: "Create a time-tracking habit that gives leaders reliable data without slowing the team down.",
    category: "Time tracking",
    readTime: "6 min read",
    publishedAt: "2026-08-13",
    updatedAt: "2026-08-13",
    sections: [
      {
        heading: "Accuracy starts with clear expectations",
        paragraphs: ["Time data becomes useful when everyone follows the same basic rules. Decide what should be tracked, when entries should be completed, and how corrections are handled. Write those rules down and keep them short."],
      },
      {
        heading: "Choose the right level of detail",
        paragraphs: ["Too little detail makes reports vague. Too much detail turns tracking into administration. For most teams, selecting the correct project and adding a brief description of the outcome is enough."],
        bullets: [
          "Track work against the project that benefits from it.",
          "Use descriptions that explain the result, not every action.",
          "Correct mistakes while the work is still fresh.",
        ],
      },
      {
        heading: "Review exceptions, not every minute",
        paragraphs: ["Managers get better results by reviewing gaps and outliers instead of policing every entry. Look for missing days, unexpectedly long sessions, or work assigned to the wrong project, then ask for context."],
      },
      {
        heading: "Make the data useful",
        paragraphs: ["Share what the team learns from time data. When people see that accurate tracking improves planning, staffing, and workload balance, the habit feels purposeful rather than administrative."],
      },
    ],
  },
  {
    slug: "build-a-healthy-remote-work-culture",
    title: "How to build a healthy remote work culture",
    description: "Use visibility, trust, and clear operating rhythms to help distributed teams do their best work.",
    category: "Team management",
    readTime: "7 min read",
    publishedAt: "2026-08-13",
    updatedAt: "2026-08-13",
    sections: [
      {
        heading: "Visibility should reduce uncertainty",
        paragraphs: ["The goal of workforce visibility is to help teams coordinate, not to recreate the office through constant surveillance. People should know what success looks like, where work stands, and when help is needed."],
      },
      {
        heading: "Agree on operating rhythms",
        paragraphs: ["Distributed teams benefit from predictable moments for planning, focused work, progress updates, and reflection. Keep meetings intentional and use shared systems for information that does not require a live conversation."],
        bullets: [
          "Define core collaboration hours across time zones.",
          "Document decisions where everyone can find them.",
          "Measure outcomes alongside activity and hours.",
        ],
      },
      {
        heading: "Use data as the start of a conversation",
        paragraphs: ["A dashboard can reveal a pattern, but it cannot explain the full context. Ask curious questions when activity changes. A quiet week may indicate focused deep work, a blocked project, time off, or a tracking issue."],
      },
      {
        heading: "Protect sustainable performance",
        paragraphs: ["Watch for consistently long days, fragmented work, and uneven workloads. These patterns are signals to improve planning and support—not badges of commitment. Healthy teams can sustain their pace without relying on repeated overtime."],
      },
    ],
  },
  {
    slug: "turn-workforce-data-into-decisions",
    title: "Turn workforce data into better decisions",
    description: "A straightforward framework for moving from dashboard metrics to practical management action.",
    category: "Productivity",
    readTime: "6 min read",
    publishedAt: "2026-08-13",
    updatedAt: "2026-08-13",
    sections: [
      {
        heading: "Begin with a decision",
        paragraphs: ["Do not open a dashboard and hope the right insight appears. Begin with a question: Do we have enough capacity for a new project? Is work distributed fairly? Which projects are consuming more time than planned?"],
      },
      {
        heading: "Combine signals",
        paragraphs: ["No single metric describes performance. Hours show effort, activity can show work patterns, and project outcomes show impact. Read them together and add the context only the team can provide."],
        bullets: [
          "Compare current data with a relevant baseline.",
          "Separate one-off events from recurring patterns.",
          "Check whether the metric is within the team's control.",
        ],
      },
      {
        heading: "Choose one useful action",
        paragraphs: ["The best analysis ends with a clear next step. Rebalance a workload, clarify a project scope, protect focus time, or update an estimate. Small, testable changes make it easier to learn what actually improves performance."],
      },
      {
        heading: "Review the result",
        paragraphs: ["Set a date to check whether the action helped. A consistent review cycle turns workforce analytics into an operating habit and prevents dashboards from becoming passive reporting tools."],
      },
    ],
  },
];

export function getResourceArticle(slug: string) {
  return resourceArticles.find((article) => article.slug === slug);
}
