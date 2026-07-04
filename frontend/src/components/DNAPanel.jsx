import React from "react";
import { AlertCircle, Sparkles, Zap } from "lucide-react";

/**
 * Right panel — the live Project DNA / Health / Builder recommendation.
 * Updates continuously as the user edits questions.
 */
export default function DNAPanel({ dna, health, project, template, onOverrideBuilder }) {
  const isPortfolio = template?.id === "portfolio";
  return (
    <div className="p-5 space-y-6 h-full overflow-y-auto" data-testid="dna-panel">
      {/* Header with live dot */}
      <div className="flex items-center gap-2">
        <span className="pw-live-dot" />
        <span className="pw-eyebrow">Project DNA · live</span>
      </div>

      {/* Health */}
      <ProjectHealth health={health} />

      {/* Builder recommendation */}
      <BuilderCard
        recommended={dna?.meta.recommendedBuilder}
        selected={project?.selectedBuilder}
        onOverride={onOverrideBuilder}
      />

      {/* Missing / needs attention */}
      {health.missing?.length > 0 && (
        <div className="pw-card p-4" data-testid="dna-missing">
          <div className="flex items-center gap-2 mb-2.5">
            <AlertCircle className="w-3.5 h-3.5" style={{ color: "#d97706" }} />
            <span className="pw-eyebrow" style={{ color: "#b45309" }}>Needs your input</span>
          </div>
          <ul className="space-y-1.5">
            {health.missing.map((m) => (
              <li key={m.id} className="text-[12.5px] text-fg-muted flex items-baseline gap-2">
                <span className="text-[10px] text-fg-subtle uppercase tracking-wide">{m.sectionTitle}</span>
                <span className="text-fg">{m.label}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* DNA summary blocks */}
      <div className="space-y-3.5">
        {isPortfolio ? (
          <DNABlock title="Profile" data={{
            Name: dna?.profile.fullName,
            Title: dna?.profile.title,
            Location: dna?.profile.location,
            Email: dna?.profile.email,
            Bio: dna?.profile.bio,
          }} />
        ) : (
          <DNABlock title="Business" data={{
            Name: dna?.business.name,
            Tagline: dna?.business.tagline,
            Industry: dna?.business.industry,
            Location: dna?.business.location,
            Goal: dna?.goals.primaryGoal,
          }} />
        )}
        <DNABlock title="Brand" data={{
          Primary: dna?.brand.primaryColor,
          Secondary: dna?.brand.secondaryColor,
          Tone: fmt(dna?.brand.tone),
          Style: dna?.brand.designStyle,
        }} colors={{ Primary: dna?.brand.primaryColor, Secondary: dna?.brand.secondaryColor }} />
        <DNABlock title="Pages" data={{
          Pages: fmt(dna?.pages.list),
          Services: fmt(dna?.pages.services),
        }} />
        <DNABlock title="Features" data={{
          Selected: fmt(dna?.features.list),
        }} />
        <DNABlock title="Content" data={{
          Hero: dna?.content.heroHeadline,
          Sub: dna?.content.heroSubheadline,
        }} />
        <DNABlock title="SEO" data={{
          "Meta title": dna?.seo.metaTitle,
          Keywords: fmt(dna?.seo.keywords),
        }} />
        <DNABlock title="Launch" data={{
          Domain: dna?.launch.domainName,
          Hosting: dna?.launch.hosting,
          Contact: dna?.launch.contactDestination,
        }} />
        {dna?.context.files?.length > 0 && (
          <DNABlock title="Context" data={{
            Files: `${dna.context.files.length} document${dna.context.files.length === 1 ? "" : "s"}`,
          }} />
        )}
      </div>
    </div>
  );
}

function fmt(v) {
  if (Array.isArray(v)) return v.length ? v.join(", ") : null;
  return v || null;
}

function DNABlock({ title, data, colors }) {
  const rows = Object.entries(data).filter(([, v]) => v);
  if (rows.length === 0) {
    return (
      <div className="pw-card p-3.5" data-testid={`dna-block-${title.toLowerCase()}`}>
        <div className="pw-eyebrow mb-1.5">{title}</div>
        <div className="text-[12px] text-fg-subtle italic">Waiting for input…</div>
      </div>
    );
  }
  return (
    <div className="pw-card p-3.5 animate-fade-in" data-testid={`dna-block-${title.toLowerCase()}`}>
      <div className="pw-eyebrow mb-2">{title}</div>
      <dl className="space-y-1.5">
        {rows.map(([k, v]) => (
          <div key={k} className="flex items-start gap-2 text-[12.5px]">
            <dt className="text-fg-subtle shrink-0" style={{ minWidth: 68 }}>{k}</dt>
            <dd className="text-fg break-words min-w-0 flex items-center gap-1.5">
              {colors?.[k] && (
                <span
                  className="inline-block w-3 h-3 rounded-full border border-default"
                  style={{ background: colors[k] }}
                />
              )}
              <span className="line-clamp-2">{String(v)}</span>
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function ProjectHealth({ health }) {
  const overall = health.overall || 0;
  const stroke = 6;
  const r = 34;
  const c = 2 * Math.PI * r;
  const offset = c - (overall / 100) * c;
  const label =
    overall === 0 ? "Blank canvas" :
    overall < 25 ? "Getting started" :
    overall < 60 ? "Taking shape" :
    overall < 90 ? "Almost ready" :
    "Ready to generate";

  return (
    <div className="pw-card p-4" data-testid="project-health">
      <div className="flex items-center gap-4">
        <div className="relative w-[84px] h-[84px] shrink-0">
          <svg width="84" height="84" viewBox="0 0 84 84" className="-rotate-90">
            <circle cx="42" cy="42" r={r} stroke="var(--bg-muted)" strokeWidth={stroke} fill="none" />
            <circle
              cx="42" cy="42" r={r}
              stroke="var(--accent)"
              strokeWidth={stroke}
              fill="none"
              strokeDasharray={c}
              strokeDashoffset={offset}
              strokeLinecap="round"
              style={{ transition: "stroke-dashoffset 400ms cubic-bezier(0.2, 0.8, 0.2, 1)" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-[20px] font-semibold text-fg tabular-nums leading-none" data-testid="health-percent">{overall}<span className="text-[13px] text-fg-subtle">%</span></span>
          </div>
        </div>
        <div className="min-w-0 flex-1">
          <div className="pw-eyebrow" style={{ color: "var(--accent)" }}>Project Health</div>
          <div className="text-[15px] font-semibold text-fg mt-0.5">{label}</div>
          <div className="text-[12px] text-fg-muted mt-1 leading-snug">
            {overall < 90
              ? "Complete a few more questions to sharpen your outputs."
              : "You're ready to generate builder-ready prompts."}
          </div>
        </div>
      </div>
    </div>
  );
}

function BuilderCard({ recommended, selected, onOverride }) {
  return (
    <div className="pw-card p-4" data-testid="builder-card">
      <div className="flex items-center gap-2 mb-2">
        <Sparkles className="w-3.5 h-3.5" style={{ color: "var(--accent)" }} />
        <span className="pw-eyebrow" style={{ color: "var(--accent)" }}>Recommended builder</span>
      </div>
      <div className="text-[15px] font-semibold text-fg capitalize mb-1">{recommended}</div>
      <p className="text-[12px] text-fg-muted mb-3 leading-snug">
        {recommended === "lovable"
          ? "Best for polished marketing sites and visual iteration."
          : "Best for apps with backend logic, dashboards, or auth."}
      </p>
      <div className="pw-segmented w-full" data-testid="dna-builder-segmented">
        {["lovable", "emergent"].map((b) => (
          <button
            key={b}
            data-active={selected === b}
            onClick={() => onOverride(b)}
            className="flex-1 flex items-center justify-center gap-1"
            data-testid={`dna-builder-${b}`}
          >
            <Zap className="w-3 h-3" />
            {b === "lovable" ? "Lovable" : "Emergent"}
          </button>
        ))}
      </div>
    </div>
  );
}
