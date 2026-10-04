import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useAuthStore } from "@/store/auth.store";
import {
  ArrowRight,
  Bot,
  FileText,
  Fingerprint,
  Layers,
  Lock,
  MousePointerClick,
  ShieldCheck,
  Workflow,
} from "lucide-react";

/* ---------------------------------- data ---------------------------------- */

const scenes = [
  {
    index: "01",
    kicker: "Knowledge base",
    title: "Upload once. Index forever.",
    copy: "Drag in PDFs, Word documents, or spreadsheets. The pipeline parses, chunks, embeds and stores every vector in pgvector — with a live status for each source.",
    image: "/landing/knowledge-base.webp",
    alt: "Knowledge Base page listing indexed documents with ready and processing statuses",
  },
  {
    index: "02",
    kicker: "Conversational RAG",
    title: "Answers that point back to the page.",
    copy: "Every answer is grounded in your documents. Source chunks ride along with each response, so you can verify instead of trust.",
    image: "/landing/chat.webp",
    alt: "Chat screen showing an assistant answer with document source pills",
  },
  {
    index: "03",
    kicker: "Control & governance",
    title: "An admin console that stays out of the way.",
    copy: "Track registrations, review accounts, and block abuse — with JWT, Google and GitHub sign-in plus rate-limited endpoints.",
    image: "/landing/admin.webp",
    alt: "Admin console with user stats and a searchable user table",
  },
];

const features = [
  {
    icon: FileText,
    name: "Multi-format ingestion",
    desc: "PDF, DOCX and XLSX files are parsed, chunked and embedded the moment they land in the knowledge base.",
  },
  {
    icon: Bot,
    name: "Grounded chat",
    desc: "A conversational assistant answers from your indexed content and cites the exact documents it used.",
  },
  {
    icon: Workflow,
    name: "Provider flexibility",
    desc: "Run on Gemini or Groq with automatic fallback — switch models without touching your data.",
  },
  {
    icon: Fingerprint,
    name: "PII redaction",
    desc: "Emails, phone numbers and SSNs are stripped from context before anything reaches an LLM.",
  },
  {
    icon: MousePointerClick,
    name: "One-line widget",
    desc: "Drop a floating assistant on any site with a single script tag — themed in one attribute.",
  },
  {
    icon: Lock,
    name: "SSO & guest access",
    desc: "Auto-login known users with signed tokens, or let visitors chat anonymously. Guest accounts clean up after themselves.",
  },
  {
    icon: ShieldCheck,
    name: "Real authentication",
    desc: "HTTP-only JWT access and refresh cookies, email verification, plus Google and GitHub OAuth.",
  },
  {
    icon: Layers,
    name: "Admin operations",
    desc: "Searchable user management, block controls, and registration statistics out of the box.",
  },
];

/* ------------------------------ scroll helper ------------------------------ */

function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>("[data-reveal]");
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.16 },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}

/* --------------------------------- nav ---------------------------------- */

function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "border-b border-[#e7e4dd] bg-[#fbfaf7]/85 backdrop-blur-md"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-5 sm:px-8">
        <Link to="/" className="flex items-baseline gap-2.5">
          <span className="text-[15px] font-bold tracking-tight text-[#171a21]">
            DocIntelAI
          </span>
          <span className="hidden text-[11px] font-medium uppercase tracking-[0.18em] text-[#8a8578] sm:inline">
            Document intelligence
          </span>
        </Link>

        <nav className="hidden items-center gap-7 md:flex" aria-label="Primary">
          <a href="#product" className="text-sm text-[#5c594f] transition-colors hover:text-[#171a21]">
            Product
          </a>
          <a href="#features" className="text-sm text-[#5c594f] transition-colors hover:text-[#171a21]">
            Features
          </a>
          <a href="#widget" className="text-sm text-[#5c594f] transition-colors hover:text-[#171a21]">
            Widget
          </a>
        </nav>

        <div className="flex items-center gap-3">
          {user ? (
            <Link
              to="/chat"
              className="rounded-full bg-[#171a21] px-4 py-2 text-sm font-semibold text-[#fbfaf7] transition-colors hover:bg-[#2aaad5] hover:text-white"
            >
              Open app
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className="px-3 text-sm font-medium text-[#5c594f] transition-colors hover:text-[#171a21]"
              >
                Log in
              </Link>
              <Link
                to="/register"
                className="rounded-full bg-[#171a21] px-4 py-2 text-sm font-semibold text-[#fbfaf7] transition-colors hover:bg-[#2aaad5] hover:text-white"
              >
                Get started
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

/* ------------------------------ sticky scenes ------------------------------ */

function SceneTimeline() {
  const ref = useRef<HTMLDivElement | null>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onScroll = () => {
      const rect = el.getBoundingClientRect();
      const total = rect.height - window.innerHeight;
      const passed = Math.min(Math.max(-rect.top, 0), Math.max(total, 1));
      const next = Math.min(
        scenes.length - 1,
        Math.floor((passed / Math.max(total, 1)) * scenes.length),
      );
      setActive(next);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <section id="product" ref={ref} className="relative">
      {/* mobile: stacked scenes */}
      <div className="mx-auto w-full max-w-6xl space-y-16 px-5 py-20 sm:px-8 lg:hidden">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#2288aa]">
            How it works
          </p>
        </div>
        {scenes.map((scene) => (
          <div key={scene.index}>
            <p className="font-mono text-sm text-[#8a8578]">
              {scene.index} — {scene.kicker}
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight">{scene.title}</h2>
            <p className="mt-4 text-[15px] leading-7 text-[#5c594f]">{scene.copy}</p>
            <figure className="mt-8 overflow-hidden rounded-2xl border border-[#e7e4dd] bg-white shadow-[0_24px_60px_-30px_rgba(23,26,33,0.35)]">
              <img
                src={scene.image}
                alt={scene.alt}
                className="aspect-[4/3] w-full object-cover object-top"
                loading="lazy"
              />
            </figure>
          </div>
        ))}
      </div>

      {/* desktop: sticky timeline */}
      <div className="relative hidden h-[220vh] lg:block">
        <div className="sticky top-0 flex min-h-screen items-center">
          <div className="mx-auto grid w-full max-w-6xl grid-cols-2 items-center gap-10 px-8 py-24">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#2288aa]">
                How it works
              </p>
              <div className="relative mt-8 min-h-[220px]">
                {scenes.map((scene, i) => (
                  <div
                    key={scene.index}
                    className={`absolute inset-0 transition-all duration-500 ${
                      i === active
                        ? "translate-y-0 opacity-100"
                        : "pointer-events-none translate-y-3 opacity-0"
                    }`}
                  >
                    <p className="font-mono text-sm text-[#8a8578]">
                      {scene.index} — {scene.kicker}
                    </p>
                    <h2 className="mt-3 text-4xl font-bold tracking-tight text-[#171a21]">
                      {scene.title}
                    </h2>
                    <p className="mt-4 max-w-md text-[15px] leading-7 text-[#5c594f]">
                      {scene.copy}
                    </p>
                  </div>
                ))}
              </div>
              <div className="mt-8 flex gap-2">
                {scenes.map((scene, i) => (
                  <span
                    key={scene.index}
                    className={`h-px transition-all duration-500 ${
                      i === active ? "w-10 bg-[#171a21]" : "w-5 bg-[#d8d4c8]"
                    }`}
                  />
                ))}
              </div>
            </div>

            <div className="relative aspect-[4/3]">
              {scenes.map((scene, i) => (
                <figure
                  key={scene.image}
                  className={`absolute inset-0 overflow-hidden rounded-2xl border border-[#e7e4dd] bg-white shadow-[0_24px_60px_-30px_rgba(23,26,33,0.35)] transition-all duration-700 ${
                    i === active
                      ? "scale-100 opacity-100"
                      : "pointer-events-none scale-[1.03] opacity-0"
                  }`}
                >
                  <img
                    src={scene.image}
                    alt={scene.alt}
                    className="h-full w-full object-cover object-top"
                    loading={i === 0 ? "eager" : "lazy"}
                  />
                </figure>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* --------------------------------- page ------------------------------------ */

export default function LandingPage() {
  useReveal();

  return (
    <div className="min-h-screen bg-[#fbfaf7] text-[#171a21] antialiased">
      <Nav />

      <main>
        {/* -------------------------------- hero -------------------------------- */}
        <section className="mx-auto w-full max-w-6xl px-5 pb-16 pt-32 sm:px-8 sm:pt-36">
          <p data-reveal className="text-xs font-semibold uppercase tracking-[0.22em] text-[#2288aa]">
            Document intelligence platform
          </p>
          <h1
            data-reveal
            className="mt-5 max-w-4xl text-[2.6rem] font-bold leading-[1.05] tracking-tight sm:text-6xl"
          >
            Ask your documents.
            <br />
            <span className="text-[#8a8578]">Get answers with sources.</span>
          </h1>

          <div className="mt-10 grid grid-cols-1 items-end gap-8 lg:grid-cols-12">
            <p data-reveal className="max-w-xl text-[15px] leading-7 text-[#5c594f] lg:col-span-6">
              DocIntelAI indexes your PDFs, Word files and spreadsheets, then answers
              questions from the actual content — every reply cites the documents it
              used, and PII is redacted before it reaches the model.
            </p>
            <div data-reveal className="flex flex-col gap-6 lg:col-span-6 lg:items-end">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-[#171a21] px-6 py-3.5 text-sm font-semibold text-[#fbfaf7] transition-colors hover:bg-[#2aaad5] hover:text-white"
                >
                  Create your workspace
                  <ArrowRight className="size-4" />
                </Link>
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-[#d8d4c8] bg-transparent px-6 py-3.5 text-sm font-semibold text-[#171a21] transition-colors hover:bg-[#f1efe8]"
                >
                  Sign in
                </Link>
              </div>
              <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-[#8a8578]">
                PDF · DOCX · XLSX — grounded RAG — PII redaction
              </p>
            </div>
          </div>

          <figure data-reveal className="mt-14 overflow-hidden rounded-2xl border border-[#e7e4dd] bg-white shadow-[0_30px_70px_-35px_rgba(23,26,33,0.4)]">
            <div className="flex items-center gap-1.5 border-b border-[#e7e4dd] px-4 py-3" aria-hidden>
              <span className="size-2.5 rounded-full bg-[#e7e4dd]" />
              <span className="size-2.5 rounded-full bg-[#e7e4dd]" />
              <span className="size-2.5 rounded-full bg-[#e7e4dd]" />
              <span className="ml-3 text-[11px] font-medium text-[#8a8578]">docintel.ai / chat</span>
            </div>
            <img
              src="/landing/chat.webp"
              alt="Real DocIntelAI chat conversation with source citations"
              className="max-h-[560px] w-full object-cover object-top"
              loading="eager"
            />
          </figure>
        </section>

        {/* ------------------------------ sticky timeline ------------------------------ */}
        <SceneTimeline />

        {/* ------------------------------- features ------------------------------- */}
        <section id="features" className="mx-auto w-full max-w-6xl px-5 py-24 sm:px-8">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#2288aa]">
                Capabilities
              </p>
              <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
                Everything in one index.
              </h2>
              <p className="mt-4 text-[15px] leading-7 text-[#5c594f]">
                The same stack that runs your chat answers also guards your data and
                powers the embeddable widget.
              </p>
            </div>

            <ul className="lg:col-span-8 divide-y divide-[#e7e4dd] border-y border-[#e7e4dd]">
              {features.map((feature) => (
                <li
                  key={feature.name}
                  data-reveal
                  className="grid grid-cols-[auto_1fr] items-start gap-x-5 gap-y-1 py-6 sm:grid-cols-[auto_220px_1fr]"
                >
                  <feature.icon className="mt-1 size-4.5 text-[#2288aa]" strokeWidth={1.75} />
                  <h3 className="text-[15px] font-semibold tracking-tight text-[#171a21]">
                    {feature.name}
                  </h3>
                  <p className="col-start-2 text-sm leading-6 text-[#5c594f] sm:col-start-3">
                    {feature.desc}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* -------------------------------- widget -------------------------------- */}
        <section id="widget" className="mx-auto w-full max-w-6xl px-5 pb-24 sm:px-8">
          <div className="rounded-3xl border border-[#e7e4dd] bg-[#f3f1ea] p-8 sm:p-12">
            <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#2288aa]">
                  Embeddable widget
                </p>
                <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
                  Ship a floating assistant in one tag.
                </h2>
                <p className="mt-4 max-w-md text-[15px] leading-7 text-[#5c594f]">
                  Point the script at a document and pick a brand color. Authenticate
                  visitors with SSO tokens, or let guests chat immediately.
                </p>
                <pre className="mt-8 overflow-x-auto rounded-2xl border border-[#e7e4dd] bg-[#171a21] p-5 text-[12.5px] leading-6 text-[#d9e2ec]">
{`<script
  src="https://your-domain.com/widget.js"
  data-document-id="YOUR_DOCUMENT_ID"
  data-theme-color="#2aaad5"
  async>
</script>`}
                </pre>
              </div>

              <div className="flex justify-center" data-reveal>
                <figure className="w-full max-w-[300px] overflow-hidden rounded-[2rem] border border-[#e7e4dd] bg-white shadow-[0_24px_60px_-30px_rgba(23,26,33,0.35)]">
                  <img
                    src="/landing/widget.webp"
                    alt="DocIntelAI floating chat widget open on a site"
                    className="h-auto w-full"
                    loading="lazy"
                  />
                </figure>
              </div>
            </div>
          </div>
        </section>

        {/* ------------------------------ final CTA ------------------------------ */}
        <section className="mx-auto w-full max-w-6xl px-5 pb-28 sm:px-8">
          <div className="rounded-3xl bg-[#171a21] px-8 py-16 text-center sm:px-16">
            <h2 className="text-3xl font-bold tracking-tight text-[#fbfaf7] sm:text-5xl">
              Bring your documents into the conversation.
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-[15px] leading-7 text-[#9aa0ab]">
              Create an account to index your first document, or sign in to pick up
              where you left off.
            </p>
            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                to="/register"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#2aaad5] px-7 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-[#55bbdd]"
              >
                Get started
                <ArrowRight className="size-4" />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 px-7 py-3.5 text-sm font-semibold text-[#fbfaf7] transition-colors hover:bg-white/10"
              >
                Log in
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* -------------------------------- footer -------------------------------- */}
      <footer className="border-t border-[#e7e4dd]">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-start justify-between gap-4 px-5 py-10 sm:flex-row sm:items-center sm:px-8">
          <p className="text-sm font-bold tracking-tight">DocIntelAI</p>
          <p className="text-xs text-[#8a8578]">
            React · Express · LangChain · pgvector — Google Gemini & Groq
          </p>
          <div className="flex gap-5 text-sm text-[#5c594f]">
            <Link to="/login" className="hover:text-[#171a21]">Log in</Link>
            <Link to="/register" className="hover:text-[#171a21]">Register</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
