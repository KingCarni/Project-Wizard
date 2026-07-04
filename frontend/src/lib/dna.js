/**
 * Project DNA — the single source of truth for a project.
 * Prompts, specs, and checklists are exports from this object.
 *
 * We keep the DNA _shape_ stable and independent of any single template,
 * so future templates can slot in without breaking generators.
 */
import { getTemplate } from "../templates";

/**
 * Given a project + template, return a structured DNA object.
 * Missing fields are simply undefined — generators handle absence gracefully.
 */
export function buildProjectDNA(project) {
  if (!project) return null;
  const template = getTemplate(project.templateId);
  const a = project.answers || {};

  return {
    meta: {
      projectName: project.name,
      templateId: project.templateId,
      templateName: template?.name,
      builder: project.selectedBuilder,
      recommendedBuilder: computeRecommendedBuilder(project, template),
      status: project.status,
      updatedAt: project.updatedAt,
    },
    business: {
      name: a.businessName,
      tagline: a.tagline,
      industry: a.industry,
      location: a.location,
      description: a.description,
      audience: a.audience,
      primaryGoal: a.primaryGoal,
      primaryCTA: a.primaryCTA,
    },
    profile: {
      fullName: a.fullName,
      title: a.title,
      bio: a.bio,
      location: a.location,
      email: a.email,
      socials: splitLines(a.socials),
    },
    brand: {
      primaryColor: a.primaryColor,
      secondaryColor: a.secondaryColor,
      tone: a.brandTone || a.tone,
      designStyle: a.designStyle || a.visualStyle,
      hasLogo: a.logo,
      fontStyle: a.fontStyle,
      visualReferences: splitLines(a.visualReferences),
      personality: a.personality,
    },
    audience: {
      description: a.audience,
      searchTerms: a.searchTerms,
    },
    goals: {
      primaryGoal: a.primaryGoal,
      primaryCTA: a.primaryCTA,
    },
    pages: {
      list: a.requiredPages,
      services: a.services,
      showPricing: a.showPricing,
      showTestimonials: a.showTestimonials,
      showFAQ: a.showFAQ,
      showBlog: a.showBlog,
    },
    features: {
      list: a.features,
      socialLinks: splitLines(a.socialLinks),
    },
    content: {
      heroHeadline: a.heroHeadline,
      heroSubheadline: a.heroSubheadline,
      servicesDescription: a.servicesDescription,
      aboutNotes: a.aboutNotes,
      testimonials: splitLines(a.testimonials),
      faqItems: splitLines(a.faqItems),
      specialOffers: a.specialOffers,
    },
    work: {
      projectTypes: a.projectTypes,
      featuredProjects: splitLines(a.featuredProjects),
      skills: a.skills,
      experience: a.experience,
      resume: a.resume,
      caseStudies: a.caseStudies,
    },
    seo: {
      keywords: a.keywords,
      locationKeywords: a.locationKeywords,
      metaTitle: a.metaTitle,
      metaDescription: a.metaDescription,
      ogSummary: a.ogSummary,
      niche: a.niche,
    },
    launch: {
      hasDomain: a.hasDomain,
      domainName: a.domainName,
      needsDomainHelp: a.needsDomainHelp,
      hosting: a.hosting,
      needsAnalytics: a.needsAnalytics,
      contactDestination: a.contactDestination,
      github: a.github,
      linkedin: a.linkedin,
    },
    context: {
      notes: a.contextNotes,
      files: (project.contextFiles || []).map((f) => ({
        name: f.name,
        size: f.size,
        type: f.type,
        preview: (f.content || "").slice(0, 500),
      })),
    },
  };
}

function splitLines(v) {
  if (!v) return [];
  if (Array.isArray(v)) return v;
  return String(v).split(/\r?\n/).map((s) => s.trim()).filter(Boolean);
}

/**
 * Builder recommendation logic (simple, deterministic).
 * Marketing / content sites → Lovable.
 * Auth, dashboard, booking, payments, backend workflows → Emergent.
 */
export function computeRecommendedBuilder(project, template) {
  if (!template) return "lovable";
  const a = project.answers || {};
  const features = a.features || [];
  const backendSignals = ["Booking link", "Live chat"];
  const usesBackend = features.some((f) => backendSignals.includes(f));
  if (usesBackend) return "emergent";
  // Templates carry their own default
  return template.recommendedBuilder || template.builderRules?.default || "lovable";
}

/**
 * Section-by-section progress + overall completion + missing items.
 * Autopilots our Project Health widget.
 */
export function computeHealth(project) {
  const template = getTemplate(project?.templateId);
  if (!template) return { overall: 0, sections: [], missing: [], gradient: "empty" };
  const a = project.answers || {};
  const sections = template.sections.map((section) => {
    const questions = section.questions || [];
    const total = questions.length;
    const answered = questions.filter((q) => {
      if (q.type === "files") return (project.contextFiles || []).length > 0;
      const val = a[q.id];
      if (val === undefined || val === null) return false;
      if (Array.isArray(val)) return val.length > 0;
      if (typeof val === "string") return val.trim().length > 0;
      if (typeof val === "boolean") return val === true;
      return true;
    }).length;
    return {
      id: section.id,
      title: section.title,
      icon: section.icon,
      answered,
      total,
      progress: total === 0 ? 0 : answered / total,
    };
  });

  const totalQ = sections.reduce((n, s) => n + s.total, 0);
  const totalA = sections.reduce((n, s) => n + s.answered, 0);
  const overall = totalQ === 0 ? 0 : Math.round((totalA / totalQ) * 100);

  // Missing = flagged high-value items not answered
  const missing = collectMissing(project, template);

  const gradient =
    overall < 25 ? "empty" : overall < 60 ? "starting" : overall < 90 ? "shaping" : "ready";

  return { overall, sections, missing, gradient };
}

const HIGH_VALUE_FIELDS = new Set([
  "businessName", "description", "primaryGoal", "primaryCTA",
  "heroHeadline", "metaTitle", "metaDescription", "ogSummary",
  "primaryColor", "requiredPages", "features",
  "fullName", "title", "bio", "email", "featuredProjects",
  "contactDestination", "showTestimonials",
]);

function collectMissing(project, template) {
  const a = project.answers || {};
  const missing = [];
  for (const s of template.sections) {
    for (const q of s.questions) {
      if (!HIGH_VALUE_FIELDS.has(q.id)) continue;
      const val = a[q.id];
      const empty =
        val === undefined ||
        val === null ||
        (Array.isArray(val) && val.length === 0) ||
        (typeof val === "string" && val.trim() === "");
      if (empty) {
        missing.push({ id: q.id, label: q.label, sectionId: s.id, sectionTitle: s.title });
      }
    }
  }
  return missing.slice(0, 6);
}
