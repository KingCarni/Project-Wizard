/**
 * Deterministic output generators.
 *
 * Every generator takes the Project DNA object and produces a string.
 * When we add AI later, these become the fallback / seed prompts.
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
   Shared: uploaded context block
   ------------------------------------------------------------- */
function contextBlock(dna) {
  const { notes, files } = dna.context;
  const lines = [];
  if (notes) lines.push(`> ${notes}`);
  if (files.length) {
    lines.push("\n**Uploaded documents:**");
    files.forEach((f) => {
      lines.push(`- \`${f.name}\` (${(f.size / 1024).toFixed(1)} KB)`);
      if (f.preview) lines.push(`  \n  > ${f.preview.replace(/\n/g, " ").slice(0, 200)}${f.preview.length > 200 ? "…" : ""}`);
    });
  }
  return lines.length ? lines.join("\n") : "_No additional context provided._";
}

/* =============================================================
   Lovable prompt — visual, marketing-first
   ============================================================= */
export function generateLovablePrompt(dna) {
  const p = dna;
  const out = [];
  out.push(header(`Build: ${j(p.meta.projectName)}`));
  out.push(`_This prompt is for **Lovable** — optimize for polished visual design, marketing copy, and responsive layout._\n`);

  out.push(h2("Project Overview"));
  out.push(kv("Template", p.meta.templateName));
  out.push(kv("Business / Owner", p.business.name || p.profile.fullName));
  out.push(kv("Tagline", p.business.tagline));
  out.push(kv("What it does", p.business.description || p.profile.bio));
  out.push(kv("Target audience", p.audience.description || p.business.audience));
  out.push(kv("Primary goal", p.goals.primaryGoal));
  out.push(kv("Primary CTA", p.goals.primaryCTA));

  out.push(h2("Brand Direction"));
  out.push(kv("Primary color", p.brand.primaryColor));
  out.push(kv("Secondary color", p.brand.secondaryColor));
  out.push(kv("Tone", p.brand.tone));
  out.push(kv("Design style", p.brand.designStyle));
  out.push(kv("Font style", p.brand.fontStyle));
  if (p.brand.visualReferences?.length) {
    out.push("\n**Visual references:**");
    out.push(list(p.brand.visualReferences));
  }

  out.push(h2("Pages to Build"));
  out.push(list(p.pages.list));

  out.push(h2("Section Requirements"));
  out.push("- Bold, editorial hero with clear headline + subheadline + primary CTA.");
  out.push("- About section that establishes credibility.");
  if (p.pages.services?.length) out.push("- Services section with icon + short description per service.");
  if (p.pages.showTestimonials !== false) out.push("- Social proof / testimonials.");
  if (p.pages.showFAQ) out.push("- FAQ section with an accordion pattern.");
  out.push("- Contact section with clear next step.");

  out.push(h2("Content Requirements"));
  out.push(kv("Hero headline", p.content.heroHeadline));
  out.push(kv("Hero subheadline", p.content.heroSubheadline));
  out.push(kv("Services description", p.content.servicesDescription));
  out.push(kv("About notes", p.content.aboutNotes));
  if (p.content.testimonials?.length) {
    out.push("\n**Testimonials:**");
    out.push(list(p.content.testimonials));
  }
  if (p.content.faqItems?.length) {
    out.push("\n**FAQ items:**");
    out.push(list(p.content.faqItems));
  }
  if (p.work.featuredProjects?.length) {
    out.push("\n**Featured projects:**");
    out.push(list(p.work.featuredProjects));
  }

  out.push(h2("Features"));
  out.push(list(p.features.list));
  if (p.features.socialLinks?.length) {
    out.push("\n**Social links:**");
    out.push(list(p.features.socialLinks));
  }

  out.push(h2("Responsive & Accessibility"));
  out.push("- Mobile-first responsive layout (breakpoints at 640, 768, 1024, 1280).");
  out.push("- All interactive elements reachable via keyboard.");
  out.push("- Color contrast ≥ WCAG AA.");
  out.push("- Alt text on all images.");

  out.push(h2("SEO"));
  out.push(kv("Meta title", p.seo.metaTitle));
  out.push(kv("Meta description", p.seo.metaDescription));
  out.push(kv("Open Graph summary", p.seo.ogSummary));
  if (p.seo.keywords?.length) out.push(kv("Keywords", p.seo.keywords));

  out.push(h2("Acceptance Criteria"));
  out.push("- Every page in the list above exists and is reachable from the nav.");
  out.push("- Brand colors and typography are applied consistently.");
  out.push("- Hero clearly communicates value in the first 3 seconds.");
  out.push("- Contact form or booking CTA works end-to-end.");
  out.push("- Lighthouse: Performance ≥ 85, Accessibility ≥ 95, SEO ≥ 95 on desktop.");

  out.push(h2("Project Context"));
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
  out.push(`_This prompt is for **Emergent** — architect for backend readiness, structured components, and clear acceptance criteria._\n`);

  out.push(h2("Project Overview"));
  out.push(kv("Template", p.meta.templateName));
  out.push(kv("Business / Owner", p.business.name || p.profile.fullName));
  out.push(kv("Description", p.business.description || p.profile.bio));
  out.push(kv("Audience", p.audience.description));
  out.push(kv("Primary goal", p.goals.primaryGoal));

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

  out.push(h2("Brand"));
  out.push(kv("Primary color", p.brand.primaryColor));
  out.push(kv("Secondary color", p.brand.secondaryColor));
  out.push(kv("Tone", p.brand.tone));
  out.push(kv("Design style", p.brand.designStyle));

  out.push(h2("Content Seeds"));
  out.push(kv("Hero headline", p.content.heroHeadline));
  out.push(kv("Hero subheadline", p.content.heroSubheadline));
  out.push(kv("About notes", p.content.aboutNotes));

  out.push(h2("Setup Expectations"));
  out.push("- React + Tailwind + component-driven architecture.");
  out.push("- Environment variables for any external endpoint (contact submissions, analytics).");
  out.push("- API routes structured under `/api/*` so backend can grow later.");
  out.push("- All page routes accessible via `react-router`.");

  out.push(h2("QA Acceptance Criteria"));
  out.push("- Every route renders without console errors.");
  out.push("- Contact form validates required fields and shows a success state.");
  out.push("- Mobile layout has no horizontal scroll at 375px width.");
  out.push("- All interactive elements have `data-testid` attributes for QA automation.");
  out.push("- SEO metadata is set per page.");

  out.push(h2("Launch Checklist"));
  out.push("- Deploy to Vercel (or preferred host).");
  out.push("- Connect custom domain and verify HTTPS.");
  out.push("- Wire up analytics if requested.");
  out.push("- Verify contact form delivery to: `" + j(p.launch.contactDestination) + "`");
  out.push("- Announce launch.");

  out.push(h2("Project Context"));
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
  out.push(`_Generated by Project Wizard. Template: ${j(p.meta.templateName)}. Recommended builder: **${j(p.meta.recommendedBuilder)}**._`);

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

  out.push(h2("Pages"));
  out.push(list(p.pages.list));

  out.push(h2("Features"));
  out.push(list(p.features.list));

  out.push(h2("Content"));
  out.push(kv("Hero headline", p.content.heroHeadline));
  out.push(kv("Hero subheadline", p.content.heroSubheadline));
  out.push(kv("About", p.content.aboutNotes));
  if (p.content.testimonials?.length) {
    out.push("\n**Testimonials:**");
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

  out.push(h2("Project Context"));
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
  out.push("_Walk through this list before you consider the build done._\n");

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
