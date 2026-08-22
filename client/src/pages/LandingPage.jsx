import { SplineScene } from "@/components/ui/spline-scene";
import { Spotlight } from "@/components/ui/spotlight";
import { useAuthModal } from "@/context/AuthModalContext";

const FEATURES = [
  { icon: "◱", title: "Inline diff review", desc: "Issues and Copilot suggestions appear right on the line they affect, in a Monaco-powered diff viewer — no context switching." },
  { icon: "⚠", title: "Severity, not noise", desc: "Every flag is ranked — blocking, warning, or style — so your team fixes what matters before merge and ignores what doesn't." },
  { icon: "↻", title: "Learning loop", desc: "Developer reactions on GitHub train which suggestions get surfaced next time. The reviewer gets sharper with every PR." },
  { icon: "▤", title: "Role-based access", desc: "Owner, Maintainer, Contributor, Reader — permissions map cleanly to how your org already works on GitHub." },
  { icon: "⏱", title: "Real-time status", desc: "WebSocket updates push PR and review state live to every open dashboard — no polling, no stale badges." },
  { icon: "▦", title: "Team quality trends", desc: "A quiet leaderboard tracks issue rates over time by author and repo, so improvement is visible, not just felt." },
];

const STEPS = [
  { num: "01 / open", title: "PR opens on GitHub", desc: "A webhook fires the moment a pull request opens or updates — nothing to install on the developer's machine." },
  { num: "02 / analyze", title: "Copilot + rules engine review it", desc: "AI suggestions are combined with linting and security scanning, then ranked by severity before anything is posted." },
  { num: "03 / learn", title: "Feedback trains the reviewer", desc: "Reactions on each comment feed back into what gets surfaced next time — for this repo and this team specifically." },
];

const AUDIENCE = [
  { tag: "Platform teams", desc: "Drop straight into an existing GitHub Actions pipeline. No new review tool for developers to context-switch into." },
  { tag: "AI platform teams", desc: "A real example of Copilot and Azure OpenAI working together on one workflow, with a visible feedback loop." },
  { tag: "Eng leadership", desc: "Quality trends per repo and per author, without adding a single manual reporting step to anyone's week." },
];

export default function LandingPage() {
  const { openModal } = useAuthModal();

  return (
    <div>
      {/* NAV */}
      <nav className="sticky top-0 z-50 flex items-center justify-between border-b border-gray-700 bg-gray-800/85 px-8 py-4 backdrop-blur-md">
        <div className="flex items-center gap-2.5 font-display text-lg font-bold tracking-tight">
          <span className="flex h-6.5 w-6.5 items-center justify-center rounded-md bg-gradient-to-br from-white to-gray-400 font-mono text-sm font-semibold text-gray-800">
            R
          </span>
          Reviewly
        </div>
        <div className="hidden gap-8 text-sm text-gray-400 md:flex">
          <a href="#features" className="hover:text-white">Features</a>
          <a href="#how" className="hover:text-white">How it works</a>
          <a href="#audience" className="hover:text-white">Who it's for</a>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => openModal()}
            className="rounded-md border border-gray-700 px-4 py-2 text-sm font-semibold text-gray-400 transition hover:border-gray-500 hover:text-white"
          >
            Sign in
          </button>
          <button
            onClick={() => openModal("Get started")}
            className="rounded-md bg-white px-4 py-2 text-sm font-semibold text-gray-800 transition hover:bg-gray-100"
          >
            Get started
          </button>
        </div>
      </nav>

      {/* HERO — full-bleed Spline scene as background, text pinned to the left 50% */}
      <div className="relative flex min-h-[640px] items-center overflow-hidden px-8 py-24">
        <div className="absolute inset-0 z-0 bg-gray-800">
          <div className="pointer-events-auto absolute inset-0 origin-center scale-110 translate-x-[18%]">
            <SplineScene
              scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
              className="h-full w-full"
            />
          </div>
        </div>

        {/* Left-to-right fade so the copy stays readable against the 3D scene */}
        <div
          className="pointer-events-none absolute inset-0 z-[1]"
          style={{
            background:
              "linear-gradient(90deg, #212529 0%, rgba(33,37,41,0.88) 25%, rgba(33,37,41,0.35) 46%, rgba(33,37,41,0.05) 55%)",
          }}
        />
        <Spotlight className="z-[1]" size={420} fill="#F8F9FA" />

        {/* pointer-events-none lets mouse reach the Spline canvas on the right; buttons/links opt back in. */}
        <div className="pointer-events-none relative z-[2] mx-auto flex w-full max-w-[1180px]">
          <div className="w-1/2 max-w-[560px]">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-gray-600 bg-white/5 px-3 py-1.5 font-mono text-xs text-gray-300">
              <span className="h-1.5 w-1.5 rounded-full bg-white" />
              Powered by GitHub Copilot + Azure OpenAI
            </div>

            <h1 className="mb-5 font-display text-[clamp(34px,4.6vw,54px)] font-semibold leading-[1.06] tracking-tight">
              Stop reviewing{" "}
              <span className="text-gray-500 line-through decoration-2">everything</span>.
              <br />
              Start reviewing{" "}
              <span className="bg-gradient-to-b from-white to-gray-300 bg-clip-text text-transparent">
                what matters
              </span>
              .
            </h1>

            <p className="mb-8 max-w-[480px] text-[16.5px] leading-relaxed text-gray-400">
              Reviewly reads every pull request the moment it opens, flags real issues inline, and
              teaches your team as it goes — so review time goes down and code quality goes up.
            </p>

            <div className="mb-10 flex items-center gap-3.5">
              <button
                onClick={() =>
                  openModal(
                    "Connect a repository",
                    "Sign in with GitHub to connect a repository. You can keep exploring the page without an account."
                  )
                }
                className="pointer-events-auto rounded-md bg-white px-6 py-3.5 text-sm font-semibold text-gray-800 transition hover:bg-gray-100"
              >
                Connect a repository
              </button>
              <a
                href="#features"
                className="pointer-events-auto rounded-md border border-gray-700 px-6 py-3.5 text-sm font-semibold text-gray-400 transition hover:border-gray-500 hover:text-white"
              >
                See how it works ↓
              </a>
            </div>

            <div className="flex gap-9">
              <div>
                <b className="block font-display text-[22px] font-bold">38%</b>
                <span className="text-xs text-gray-400">fewer review round-trips</span>
              </div>
              <div>
                <b className="block font-display text-[22px] font-bold">&lt;90s</b>
                <span className="text-xs text-gray-400">avg. time to first comment</span>
              </div>
              <div>
                <b className="block font-display text-[22px] font-bold">4</b>
                <span className="text-xs text-gray-400">role tiers, zero config</span>
              </div>
            </div>
          </div>
          <div className="pointer-events-none w-1/2" aria-hidden="true" />
        </div>
      </div>

      {/* FEATURES */}
      <section id="features" className="px-8 py-24">
        <div className="mx-auto mb-14 max-w-[600px]">
          <div className="mb-3.5 font-mono text-xs uppercase tracking-wider text-gray-400">What it does</div>
          <h2 className="font-display text-[clamp(26px,3vw,36px)] font-semibold leading-tight tracking-tight">
            Everything a senior reviewer would catch, on every PR, instantly.
          </h2>
          <p className="mt-3.5 text-[15.5px] leading-relaxed text-gray-400">
            Built as a bridge between your MERN stack and Copilot's API — not a bot that leaves
            noise, but a reviewer that learns what your team actually cares about.
          </p>
        </div>
        <div className="mx-auto grid max-w-[1180px] grid-cols-1 gap-px overflow-hidden rounded-2xl border border-gray-700 bg-gray-700 md:grid-cols-3">
          {FEATURES.map((f) => (
            <div key={f.title} className="bg-[#24282c] p-7">
              <div className="mb-4.5 flex h-8.5 w-8.5 items-center justify-center rounded-lg bg-gray-700 font-mono text-sm font-semibold text-gray-200">
                {f.icon}
              </div>
              <h3 className="mb-2 font-display text-base font-semibold">{f.title}</h3>
              <p className="text-[13.8px] leading-relaxed text-gray-400">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="px-8 py-24">
        <div className="mx-auto mb-14 max-w-[600px]">
          <div className="mb-3.5 font-mono text-xs uppercase tracking-wider text-gray-400">Flow</div>
          <h2 className="font-display text-[clamp(26px,3vw,36px)] font-semibold leading-tight tracking-tight">
            Three steps, no new habits to learn.
          </h2>
        </div>
        <div className="mx-auto grid max-w-[1180px] grid-cols-1 gap-7 md:grid-cols-3">
          {STEPS.map((s) => (
            <div key={s.num} className="rounded-2xl border border-gray-700 bg-[#292d31] p-7">
              <div className="mb-4 font-mono text-xs text-gray-300">{s.num}</div>
              <h3 className="mb-2.5 font-display text-[17px] font-semibold">{s.title}</h3>
              <p className="text-[13.8px] leading-relaxed text-gray-400">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* AUDIENCE */}
      <section id="audience" className="px-8 py-24">
        <div className="mx-auto mb-14 max-w-[600px]">
          <div className="mb-3.5 font-mono text-xs uppercase tracking-wider text-gray-400">Built for</div>
          <h2 className="font-display text-[clamp(26px,3vw,36px)] font-semibold leading-tight tracking-tight">
            Teams already living inside GitHub.
          </h2>
        </div>
        <div className="mx-auto flex max-w-[1180px] flex-col gap-px overflow-hidden rounded-2xl border border-gray-700 bg-gray-700 md:flex-row">
          {AUDIENCE.map((a) => (
            <div key={a.tag} className="flex-1 bg-[#24282c] p-6.5">
              <div className="mb-3.5 inline-block rounded-full border border-gray-700 px-2.5 py-0.5 font-mono text-[11px] text-gray-400">
                {a.tag}
              </div>
              <p className="text-[13.8px] leading-relaxed text-gray-400">{a.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <div className="border-t border-gray-700 px-8 py-28 text-center">
        <h2 className="mb-4.5 font-display text-[clamp(28px,4vw,42px)] font-semibold tracking-tight">
          Your next PR is already waiting.
        </h2>
        <p className="mb-8 text-gray-400">
          Connect a repository and Reviewly starts on the very next pull request — no history to
          backfill, nothing to migrate.
        </p>
        <button
          onClick={() => openModal("Connect a repository")}
          className="rounded-md bg-white px-6 py-3.5 text-sm font-semibold text-gray-800 transition hover:bg-gray-100"
        >
          Connect a repository
        </button>
      </div>

      <footer className="flex items-center justify-between border-t border-gray-700 px-8 py-9 text-sm text-gray-400">
        <div className="flex items-center gap-2 font-display text-sm font-bold">
          <span className="flex h-5 w-5 items-center justify-center rounded-md bg-gradient-to-br from-white to-gray-400 font-mono text-[11px] font-semibold text-gray-800">
            R
          </span>
          Reviewly
        </div>
        <div>© 2026 Reviewly. Not affiliated with GitHub or Microsoft.</div>
      </footer>
    </div>
  );
}
