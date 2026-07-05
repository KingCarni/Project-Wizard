/**
 * Deterministic output generators.
 *
 * Every generator takes the Project DNA object and produces a string.
 * When the LLM path fails (or is disabled), these are the fallback.
 *
 * Guiding principles baked into these prompts:
 *  - Project DNA is the source of truth.
 *  - Uploaded Project Context is AUTHORITATIVE background.
 *  - Refuse generic AI-landing-page aesthetics.
 *  - Every output has explicit acceptance criteria.
 */

const NA = "_(not specified)_";
const j = (v, fallback = NA) => {
  if (v === undefined || v === null) return fallback;
  if (Array.isArray(v)) return v.length ? v.join(", ") : fallback;
  if (typeof v === "boolean") return v ? "Yes" : "No";
  const s = String(v).trim();
  return s ? s : fallback;
};
const list = (v) => (Array.isArray(v) && v.length ? v.map((x) => `- ${x}`).join("\n") : `- ${NA}`);
const header = (title) => `# ${title}\n`;
const h2 = (title) => `\n## ${title}\n`;
const kv = (k, v) => `**${k}:** ${j(v)}`;

/* -------------------------------------------------------------
   Universal prelude — every generated document leads with this.
   Establishes Project DNA + Project Context as authoritative.
   ------------------------------------------------------------- */
function prelude(dna) {
  const lines = [];
  lines.push("> **Read this first.**");
  lines.push(">");
  lines.push("> This document was exported from **Project Wizard**. It is the authoritative brief for the build.");
  lines.push("> Every fact below originates from the project's structured **Project DNA** — treat the DNA as source of truth.");
  lines.push(">");
  lines.push("> **Do not invent business facts.** If a field is marked `_(not specified)_`, leave it as a labelled placeholder and note it in the build handoff. Never fabricate a customer name, testimonial, statistic, or product feature.");
  lines.push("");
  return lines.join("\n");
}

function contextBlock(dna) {
  const { notes, files } = dna.context || { notes: "", files: [] };
  const lines = [];
  lines.push("> Anything uploaded here is **authoritative background** — treat it with equal weight to the answered questions.");
  lines.push("> Preserve any explicit constraints, terminology, positioning, or voice found in these documents.");
  lines.push("");
  if (notes) {
    lines.push("**Author note:**");
    lines.push(`> ${notes}`);
    lines.push("");
  }
  if (files.length) {
    lines.push(`**Uploaded documents (${files.length}):**`);
    lines.push("");
    files.forEach((f) => {
      lines.push(`- **\`${f.name}\`** (${(f.size / 1024).toFixed(1)} KB) — ${f.type || "file"}`);
      if (f.preview && f.preview.trim()) {
        const excerpt = f.preview.replace(/\r?\n+/g, " ").slice(0, 320);
        lines.push(`    > ${excerpt}${f.preview.length > 320 ? "…" : ""}`);
      }
    });
    lines.push("");
    lines.push("**Instruction to the builder:** Read every uploaded file in full before writing code. Any constraint, brand rule, terminology, or product decision found in these files overrides generic assumptions.");
  } else {
    lines.push("_(No additional context uploaded — rely on the answered questions above.)_");
  }
  return lines.join("\n");
}

/* -------------------------------------------------------------
   Anti-generic block — appears in every builder prompt.
   ------------------------------------------------------------- */
function antiGenericBlock() {
  return [
    "> **Do not make this look like a generic AI-generated landing page.**",
    ">",
    "> Specifically avoid: purple/blue gradient heroes, giant glowing CTAs, centered stacks of identical cards with equal spacing, oversized floating illustrations, and the 'AI startup 2024' aesthetic.",
    ">",
    "> Build a **distinctive visual identity** grounded in the brand direction below — commit to a real palette, real type hierarchy, and confident asymmetric layouts where they fit.",
  ].join("\n");
}

/* =============================================================
   Lovable prompt — visual, marketing-first
   ============================================================= */
export function generateLovablePrompt(dna) {
  const p = dna;
  const out = [];
  out.push(header(`Build: ${j(p.meta.projectName)}`));
  out.push(`_Target builder: **Lovable**. Optimize for polished visual design, marketing copy, and responsive layout._`);
  out.push("");
  out.push(prelude(dna));

  out.push(h2("Project Overview"));
  out.push(kv("Template", p.meta.templateName));
  out.push(kv("Business / Owner", p.business.name || p.profile.fullName));
  out.push(kv("Tagline", p.business.tagline));
  out.push(kv("What it does", p.business.description || p.profile.bio));
  out.push(kv("Target audience", p.audience.description || p.business.audience));
  out.push(kv("Primary goal", p.goals.primaryGoal));
  out.push(kv("Primary CTA", p.goals.primaryCTA));

  out.push(h2("Visual Identity — read carefully"));
  out.push(antiGenericBlock());
  out.push("");
  out.push("**Brand direction from Project DNA:**");
  out.push(kv("Primary color", p.brand.primaryColor));
  out.push(kv("Secondary color", p.brand.secondaryColor));
  out.push(kv("Tone", p.brand.tone));
  out.push(kv("Design style", p.brand.designStyle));
  out.push(kv("Font style preference", p.brand.fontStyle));
  out.push(kv("Personality", p.brand.personality));
  if (p.brand.visualReferences?.length) {
    out.push("");
    out.push("**Visual references (study these before designing):**");
    out.push(list(p.brand.visualReferences));
  }

  out.push(h2("Pages to Build"));
  out.push(list(p.pages.list));

  out.push(h2("Section Requirements"));
  out.push("- Editorial, opinionated hero with a clear headline, subheadline, and single primary CTA. No 'AI-startup' stock aesthetic.");
  out.push("- About / story section that establishes credibility. Real voice, not marketing filler.");
  if (p.pages.services?.length) out.push("- Services section — icon or numbered index + concise description per service. Avoid identical-card gridlock.");
  if (p.pages.showTestimonials !== false) out.push("- Social proof — quote only real testimonials from the DNA. If none, use a placeholder card labelled 'Add testimonial'.");
  if (p.pages.showFAQ) out.push("- FAQ — accordion pattern, one question per row.");
  out.push("- Contact section — clear next step, respects the tone of the rest of the site.");

  out.push(h2("Content Seeds (from Project DNA)"));
  out.push(kv("Hero headline", p.content.heroHeadline));
  out.push(kv("Hero subheadline", p.content.heroSubheadline));
  out.push(kv("Services description", p.content.servicesDescription));
  out.push(kv("About notes", p.content.aboutNotes));
  if (p.content.testimonials?.length) {
    out.push("");
    out.push("**Testimonials (verbatim — do not rewrite):**");
    out.push(list(p.content.testimonials));
  }
  if (p.content.faqItems?.length) {
    out.push("");
    out.push("**FAQ items:**");
    out.push(list(p.content.faqItems));
  }
  if (p.work.featuredProjects?.length) {
    out.push("");
    out.push("**Featured projects:**");
    out.push(list(p.work.featuredProjects));
  }

  out.push(h2("Features"));
  out.push(list(p.features.list));
  if (p.features.socialLinks?.length) {
    out.push("");
    out.push("**Social links:**");
    out.push(list(p.features.socialLinks));
  }

  out.push(h2("Responsive & Accessibility"));
  out.push("- Mobile-first responsive layout (breakpoints at 640, 768, 1024, 1280).");
  out.push("- All interactive elements reachable via keyboard, visible focus rings.");
  out.push("- Color contrast ≥ WCAG AA on primary buttons and body text.");
  out.push("- Alt text on every image.");

  out.push(h2("SEO"));
  out.push(kv("Meta title", p.seo.metaTitle));
  out.push(kv("Meta description", p.seo.metaDescription));
  out.push(kv("Open Graph summary", p.seo.ogSummary));
  if (p.seo.keywords?.length) out.push(kv("Keywords", p.seo.keywords));

  out.push(h2("Acceptance Criteria"));
  out.push("- [ ] Every page listed above exists and is reachable from the primary nav.");
  out.push("- [ ] Brand colors, typography, and personality are applied **consistently** — the site does not look like a generic AI-built landing page.");
  out.push("- [ ] Hero communicates value in the first 3 seconds without reading below the fold.");
  out.push("- [ ] Contact form (or primary CTA) works end-to-end.");
  out.push("- [ ] Lighthouse: Performance ≥ 85, Accessibility ≥ 95, SEO ≥ 95 on desktop.");
  out.push("- [ ] Any constraint from uploaded Project Context is honoured (voice, terminology, positioning).");

  out.push(h2("Project Context — authoritative background"));
  out.push(contextBlock(dna));

  return out.join("\n");
}

/* =============================================================
   Emergent prompt — structured, architecture-aware
   ============================================================= */
export function generateEmergentPrompt(dna) {
  const p = dna;
  const out = [];
  out.push(header(`Build: ${j(p.meta.projectName)}`));
  out.push(`_Target builder: **Emergent**. Architect for backend readiness, structured components, and explicit acceptance criteria._`);
  out.push("");
  out.push(prelude(dna));

  out.push(h2("Project Overview"));
  out.push(kv("Template", p.meta.templateName));
  out.push(kv("Business / Owner", p.business.name || p.profile.fullName));
  out.push(kv("Description", p.business.description || p.profile.bio));
  out.push(kv("Audience", p.audience.description));
  out.push(kv("Primary goal", p.goals.primaryGoal));

  out.push(h2("Visual Identity — do not skip"));
  out.push(antiGenericBlock());
  out.push("");
  out.push(kv("Primary color", p.brand.primaryColor));
  out.push(kv("Secondary color", p.brand.secondaryColor));
  out.push(kv("Tone", p.brand.tone));
  out.push(kv("Design style", p.brand.designStyle));

  out.push(h2("App Structure — Routes"));
  const pages = p.pages.list?.length ? p.pages.list : ["Home", "About", "Contact"];
  pages.forEach((page) => {
    out.push(`- \`${routeFor(page)}\` → ${page}`);
  });

  out.push(h2("Components (per page)"));
  out.push("- `Header` (nav, logo, primary CTA)");
  out.push("- `Hero` (headline, subheadline, CTA)");
  out.push("- `SectionServices` (grid of services)");
  if (p.pages.showTestimonials !== false) out.push("- `Testimonials`");
  if (p.pages.showFAQ) out.push("- `FAQ` (accordion)");
  out.push("- `ContactForm`");
  out.push("- `Footer` (social + legal links)");
  out.push("- All interactive elements have `data-testid` attributes for automation.");

  out.push(h2("Data Model (future-ready)"));
  out.push("```ts");
  out.push("type ContactSubmission = { id: string; name: string; email: string; message: string; createdAt: string };");
  if (p.features.list?.includes("Newsletter signup")) {
    out.push("type NewsletterSubscriber = { id: string; email: string; createdAt: string };");
  }
  if (p.features.list?.includes("Booking link")) {
    out.push("type Booking = { id: string; name: string; email: string; slot: string; createdAt: string };");
  }
  if (p.pages.showBlog || p.pages.list?.includes("Blog") || p.pages.list?.includes("Writing / Blog")) {
    out.push("type BlogPost = { id: string; slug: string; title: string; body: string; publishedAt: string };");
  }
  out.push("```");

  out.push(h2("Feature Behaviour"));
  (p.features.list || []).forEach((f) => {
    out.push(`- **${f}**: ${featureSpec(f)}`);
  });

  out.push(h2("Content Seeds (from Project DNA)"));
  out.push(kv("Hero headline", p.content.heroHeadline));
  out.push(kv("Hero subheadline", p.content.heroSubheadline));
  out.push(kv("About notes", p.content.aboutNotes));

  out.push(h2("Setup Expectations"));
  out.push("- React + Tailwind + component-driven architecture.");
  out.push("- Environment variables for any external endpoint (contact submissions, analytics).");
  out.push("- API routes structured under `/api/*` so the backend can grow later.");
  out.push("- All page routes accessible via `react-router`.");

  out.push(h2("Acceptance Criteria"));
  out.push("- [ ] Every route renders without console errors.");
  out.push("- [ ] Contact form validates required fields and shows a success state.");
  out.push("- [ ] Mobile layout has no horizontal scroll at 375px width.");
  out.push("- [ ] All interactive elements have `data-testid` attributes.");
  out.push("- [ ] SEO metadata is set per page.");
  out.push("- [ ] Distinctive visual identity — does **not** look like a generic AI-generated landing page.");
  out.push("- [ ] Any constraint from uploaded Project Context is preserved.");

  out.push(h2("Launch Checklist"));
  out.push("- Deploy to Vercel (or preferred host).");
  out.push("- Connect custom domain and verify HTTPS.");
  out.push("- Wire up analytics if requested.");
  out.push("- Verify contact form delivery to: `" + j(p.launch.contactDestination) + "`");
  out.push("- Announce launch.");

  out.push(h2("Project Context — authoritative background"));
  out.push(contextBlock(dna));

  return out.join("\n");
}

function routeFor(page) {
  const slug = page.toLowerCase().replace(/\s*\/\s*/g, "-").replace(/\s+/g, "-");
  return slug === "home" ? "/" : `/${slug}`;
}

function featureSpec(f) {
  const map = {
    "Contact form": "Client-side validation, POST to `/api/contact`, success + error states.",
    "Booking link": "External or embedded scheduler; keep CTA prominent above the fold.",
    "Newsletter signup": "Single email field; POST to `/api/subscribe`; double opt-in optional.",
    "Google Maps embed": "Static map image or iframe with lazy load; include address caption.",
    "Photo gallery": "Responsive masonry or grid; lightbox on click; lazy-loaded images.",
    "Blog": "Markdown or MDX posts; list + detail routes; RSS feed.",
    "Analytics": "Privacy-friendly analytics (Plausible/Fathom) or GA4.",
    "Chat widget": "Deferred load; only show after user has been on page 5s.",
    "Social links": "Icon-only footer set; open in new tab.",
    "Live chat": "Deferred load; hide on mobile if intrusive.",
  };
  return map[f] || "Standard implementation.";
}

/* =============================================================
   Markdown spec — human-readable brief
   ============================================================= */
export function generateMarkdownSpec(dna) {
  const p = dna;
  const out = [];
  out.push(header(`${j(p.meta.projectName)} — Project Specification`));
  out.push(`_Generated by **Project Wizard**. Template: ${j(p.meta.templateName)}. Recommended builder: **${j(p.meta.recommendedBuilder)}**._`);
  out.push("");
  out.push(prelude(dna));

  out.push(h2("Summary"));
  out.push(j(p.business.description || p.profile.bio, "No description provided."));

  out.push(h2("Goals"));
  out.push(kv("Primary goal", p.goals.primaryGoal));
  out.push(kv("Primary CTA", p.goals.primaryCTA));

  out.push(h2("Audience"));
  out.push(j(p.audience.description, "Not specified."));

  out.push(h2("Brand"));
  out.push(kv("Primary color", p.brand.primaryColor));
  out.push(kv("Secondary color", p.brand.secondaryColor));
  out.push(kv("Tone", p.brand.tone));
  out.push(kv("Design style", p.brand.designStyle));
  out.push(kv("Font style", p.brand.fontStyle));
  out.push("");
  out.push("> The visual identity must be distinctive and grounded in these choices. Do not settle for generic AI-startup aesthetics.");

  out.push(h2("Pages"));
  out.push(list(p.pages.list));

  out.push(h2("Features"));
  out.push(list(p.features.list));

  out.push(h2("Content"));
  out.push(kv("Hero headline", p.content.heroHeadline));
  out.push(kv("Hero subheadline", p.content.heroSubheadline));
  out.push(kv("About", p.content.aboutNotes));
  if (p.content.testimonials?.length) {
    out.push("");
    out.push("**Testimonials:**");
    out.push(list(p.content.testimonials));
  }

  out.push(h2("SEO"));
  out.push(kv("Meta title", p.seo.metaTitle));
  out.push(kv("Meta description", p.seo.metaDescription));
  out.push(kv("Keywords", p.seo.keywords));

  out.push(h2("Builder Recommendation"));
  out.push(`Recommended: **${j(p.meta.recommendedBuilder)}**. Selected: **${j(p.meta.builder)}**.`);

  out.push(h2("Launch Notes"));
  out.push(kv("Has domain", p.launch.hasDomain));
  out.push(kv("Domain name", p.launch.domainName));
  out.push(kv("Hosting", p.launch.hosting));
  out.push(kv("Analytics", p.launch.needsAnalytics));
  out.push(kv("Contact destination", p.launch.contactDestination));

  out.push(h2("Project Context — authoritative background"));
  out.push(contextBlock(dna));

  return out.join("\n");
}

/* =============================================================
   QA checklist — generated from selected features + pages
   ============================================================= */
export function generateQAChecklist(dna) {
  const p = dna;
  const out = [];
  out.push(header(`QA Checklist — ${j(p.meta.projectName)}`));
  out.push("_Walk through this list before you consider the build done._");
  out.push("");

  out.push(h2("Brand Fidelity"));
  out.push("- [ ] Site does **not** look like a generic AI-generated landing page.");
  out.push("- [ ] Primary and secondary brand colors are applied consistently and used with intent.");
  out.push("- [ ] Typography hierarchy is clear and matches the brand direction.");
  out.push("- [ ] Voice matches the tone declared in the Project DNA.");
  out.push("- [ ] Any constraint or vocabulary from uploaded Project Context files is preserved.");

  out.push(h2("Navigation"));
  out.push("- [ ] Every page in the site map is reachable from the main nav.");
  out.push("- [ ] Logo links back to home from every page.");
  out.push("- [ ] Footer links (privacy, terms, social) work on every page.");
  out.push("- [ ] 404 page exists and links back home.");

  out.push(h2("Mobile Responsiveness"));
  out.push("- [ ] No horizontal scroll at 375px, 414px, 768px.");
  out.push("- [ ] Nav collapses to a hamburger on mobile and reopens.");
  out.push("- [ ] Tap targets are ≥ 44px.");
  out.push("- [ ] Images scale without cropping subjects.");

  out.push(h2("Forms & Interactions"));
  (p.features.list || []).forEach((f) => {
    if (f === "Contact form") {
      out.push("- [ ] Contact form validates required fields.");
      out.push("- [ ] Contact form shows a success confirmation.");
      out.push(`- [ ] A test submission arrives at: \`${j(p.launch.contactDestination)}\``);
    }
    if (f === "Newsletter signup") {
      out.push("- [ ] Newsletter form accepts an email and shows confirmation.");
      out.push("- [ ] Invalid emails are rejected with a clear error.");
    }
    if (f === "Booking link") out.push("- [ ] Booking link opens correctly and books a real slot.");
    if (f === "Chat widget" || f === "Live chat") out.push("- [ ] Chat widget loads asynchronously and doesn't block the page.");
    if (f === "Google Maps embed") out.push("- [ ] Map loads on mobile without pushing layout.");
    if (f === "Photo gallery") out.push("- [ ] Gallery images lazy-load and lightbox works.");
    if (f === "Analytics") out.push("- [ ] Analytics fires a page-view on every route change.");
  });

  out.push(h2("Accessibility"));
  out.push("- [ ] All images have descriptive alt text.");
  out.push("- [ ] All interactive elements are reachable via keyboard.");
  out.push("- [ ] Visible focus rings on all focusable elements.");
  out.push("- [ ] Color contrast meets WCAG AA on primary buttons and body text.");
  out.push("- [ ] Skip-to-content link at the top of every page.");

  out.push(h2("SEO Metadata"));
  out.push("- [ ] `<title>` is set per page.");
  out.push("- [ ] Meta description is set per page.");
  out.push("- [ ] Open Graph image + description set for social sharing.");
  out.push("- [ ] `robots.txt` and `sitemap.xml` are present.");
  out.push("- [ ] Canonical URLs set.");

  out.push(h2("Content Review"));
  out.push("- [ ] Read every headline out loud.");
  out.push("- [ ] Check for typos with fresh eyes (or a friend).");
  out.push("- [ ] Every CTA has a clear next step.");
  out.push("- [ ] Legal/policy pages exist if you collect data.");
  out.push("- [ ] No invented facts — every business claim traces back to Project DNA or uploaded context.");

  out.push(h2("Performance"));
  out.push("- [ ] Largest Contentful Paint < 2.5s on 4G.");
  out.push("- [ ] All hero images are optimized (WebP/AVIF).");
  out.push("- [ ] No render-blocking third-party scripts above the fold.");

  out.push(h2("Launch Readiness"));
  out.push("- [ ] Domain resolves and HTTPS certificate is valid.");
  out.push("- [ ] Analytics installed and firing.");
  out.push("- [ ] Contact form delivery confirmed.");
  out.push("- [ ] Mobile layout reviewed on a real device.");
  out.push("- [ ] Final read-through complete.");

  return out.join("\n");
}

export function generateAll(dna) {
  return {
    lovablePrompt: generateLovablePrompt(dna),
    emergentPrompt: generateEmergentPrompt(dna),
    markdownSpec: generateMarkdownSpec(dna),
    qaChecklist: generateQAChecklist(dna),
  };
}
