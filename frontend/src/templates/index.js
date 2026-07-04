/**
 * Template schema — data-driven.
 *
 * Adding a new project type = adding a new template object (no wizard rewrite).
 *
 * Question types:
 *   text        — single-line
 *   textarea    — multi-line
 *   select      — one of options (segmented / dropdown)
 *   multiselect — many of options (chips)
 *   toggle      — boolean
 *   color       — hex color
 *   chips-add   — user-added chip list
 *   files       — file upload (for Project Context section)
 */

// Reusable "Project Context" section — appears on every template.
export const projectContextSection = {
  id: "context",
  title: "Project Context",
  icon: "sparkles",
  description:
    "Bring existing docs so Project Wizard understands what you've already thought through.",
  questions: [
    {
      id: "contextNotes",
      label: "One-paragraph brief (optional)",
      helperText:
        "Anything you'd tell a designer over coffee. Skip if you'd rather just answer questions.",
      type: "textarea",
      placeholder:
        "e.g. Studio for handmade ceramics in Portland — need a calm site that showcases work and takes commission requests…",
    },
    {
      id: "contextFiles",
      label: "Upload supporting documents",
      helperText:
        "README, PRD, brand notes, GDD, business plan — becomes part of your Project DNA.",
      type: "files",
      accept: ".md,.txt,.json,.csv,.pdf,.docx",
    },
  ],
};

// -------------------- Business Website --------------------
const businessWebsite = {
  id: "business-website",
  name: "Business Website",
  tagline: "Marketing site for a small business, agency, or service.",
  description:
    "A polished multi-page site with services, testimonials, and contact — optimized to convert visitors into leads.",
  category: "Website",
  icon: "briefcase",
  recommendedBuilder: "lovable",
  status: "available",
  sections: [
    projectContextSection,
    {
      id: "business",
      title: "Business Information",
      icon: "building",
      description: "Basic facts about what you do and who you serve.",
      questions: [
        { id: "businessName", label: "Business name", type: "text", required: true, placeholder: "e.g. Riverstone Studios" },
        { id: "tagline", label: "Tagline", type: "text", placeholder: "One sentence that captures what you do." },
        {
          id: "industry",
          label: "Industry",
          type: "select",
          options: ["Professional Services", "Health & Wellness", "Creative & Design", "Retail", "Food & Beverage", "Real Estate", "Technology", "Education", "Other"],
        },
        { id: "location", label: "Location or service area", type: "text", placeholder: "Portland, OR — serving the Pacific Northwest" },
        { id: "description", label: "Short business description", type: "textarea", required: true, placeholder: "What you do, who you serve, why it matters." },
        { id: "audience", label: "Target audience", type: "textarea", placeholder: "e.g. Interior designers sourcing handmade goods for luxury clients." },
        {
          id: "primaryGoal",
          label: "Primary website goal",
          type: "select",
          options: ["Generate leads", "Book appointments", "Sell products", "Build credibility", "Announce a launch", "Grow email list"],
        },
        { id: "primaryCTA", label: "Main call to action", type: "text", placeholder: "e.g. Book a Consultation" },
      ],
    },
    {
      id: "brand",
      title: "Brand",
      icon: "palette",
      description: "The feel and personality of your site.",
      questions: [
        { id: "primaryColor", label: "Primary color", type: "color", default: "#5f22cf" },
        { id: "secondaryColor", label: "Secondary color", type: "color", default: "#1a1c23" },
        {
          id: "brandTone",
          label: "Brand tone",
          type: "multiselect",
          options: ["Warm", "Confident", "Playful", "Serious", "Minimal", "Bold", "Editorial", "Technical"],
        },
        {
          id: "designStyle",
          label: "Design style",
          type: "select",
          options: ["Editorial", "Modern minimal", "Bold & colorful", "Corporate", "Handcrafted", "Techy"],
        },
        { id: "logo", label: "Do you have a logo?", type: "toggle" },
        {
          id: "fontStyle",
          label: "Preferred font style",
          type: "select",
          options: ["Modern sans", "Classic serif", "Editorial serif", "Rounded", "Mono / technical", "Let designer choose"],
        },
        { id: "visualReferences", label: "Sites you love (URLs)", type: "textarea", placeholder: "One per line." },
      ],
    },
    {
      id: "pages",
      title: "Pages",
      icon: "layout",
      description: "The pages your visitors will navigate.",
      questions: [
        {
          id: "requiredPages",
          label: "Pages you need",
          type: "multiselect",
          options: ["Home", "About", "Services", "Portfolio / Work", "Pricing", "Testimonials", "FAQ", "Blog", "Contact", "Privacy Policy", "Terms"],
          default: ["Home", "About", "Services", "Contact"],
        },
        { id: "services", label: "Services offered", type: "chips-add", placeholder: "Add a service and press Enter" },
        { id: "showPricing", label: "Display pricing on the site?", type: "toggle" },
        { id: "showTestimonials", label: "Show testimonials?", type: "toggle", default: true },
        { id: "showFAQ", label: "Include an FAQ section?", type: "toggle" },
        { id: "showBlog", label: "Include a blog?", type: "toggle" },
      ],
    },
    {
      id: "features",
      title: "Features",
      icon: "layers",
      description: "Interactive elements to include.",
      questions: [
        {
          id: "features",
          label: "Choose the features",
          type: "multiselect",
          options: ["Contact form", "Booking link", "Newsletter signup", "Google Maps embed", "Photo gallery", "Blog", "Analytics", "Chat widget", "Social links", "Live chat"],
          default: ["Contact form", "Newsletter signup", "Analytics", "Social links"],
        },
        { id: "socialLinks", label: "Social profiles (URLs)", type: "textarea", placeholder: "One per line." },
      ],
    },
    {
      id: "content",
      title: "Content",
      icon: "type",
      description: "The words your visitors will read.",
      questions: [
        { id: "heroHeadline", label: "Hero headline", type: "text", placeholder: "Handmade ceramics for people who care." },
        { id: "heroSubheadline", label: "Hero subheadline", type: "textarea", placeholder: "One or two lines below the headline." },
        { id: "servicesDescription", label: "Services description", type: "textarea" },
        { id: "aboutNotes", label: "About section notes", type: "textarea", placeholder: "Story, mission, credentials." },
        { id: "testimonials", label: "Testimonials (one per line)", type: "textarea", placeholder: `"Sarah is a joy to work with." — Client A` },
        { id: "faqItems", label: "FAQ items (one Q/A per line)", type: "textarea" },
        { id: "specialOffers", label: "Special offers or promotions", type: "text" },
      ],
    },
    {
      id: "seo",
      title: "SEO",
      icon: "search",
      description: "How people will find you on Google.",
      questions: [
        { id: "keywords", label: "Main keywords", type: "chips-add", placeholder: "Type and press Enter" },
        { id: "locationKeywords", label: "Location keywords", type: "chips-add", placeholder: "e.g. Portland ceramics studio" },
        { id: "metaTitle", label: "Meta title", type: "text", placeholder: "Riverstone Studios — Handmade Ceramics, Portland" },
        { id: "metaDescription", label: "Meta description", type: "textarea", placeholder: "150–160 characters." },
        { id: "ogSummary", label: "Open Graph summary", type: "textarea", placeholder: "How your site looks when shared on social." },
      ],
    },
    {
      id: "launch",
      title: "Launch",
      icon: "rocket",
      description: "Getting your site live.",
      questions: [
        { id: "hasDomain", label: "Existing domain?", type: "toggle" },
        { id: "domainName", label: "Domain name (if any)", type: "text", placeholder: "yourbusiness.com" },
        { id: "needsDomainHelp", label: "Need help buying a domain?", type: "toggle" },
        {
          id: "hosting",
          label: "Preferred hosting",
          type: "select",
          options: ["Vercel", "Netlify", "Cloudflare Pages", "Not sure yet"],
        },
        { id: "needsAnalytics", label: "Include analytics?", type: "toggle", default: true },
        { id: "contactDestination", label: "Where should contact form submissions go?", type: "text", placeholder: "e.g. hello@yourbusiness.com" },
      ],
    },
  ],
  builderRules: {
    // Any of these being true tips the recommendation toward Emergent.
    emergentSignals: [
      { path: "features", contains: ["Booking link", "Live chat"] },
      { path: "features", contains: ["Analytics"], weight: 0 }, // neutral
    ],
    default: "lovable",
  },
  setupChecklist: [
    { id: "review", title: "Review generated site", description: "Open the builder output and skim every page." },
    { id: "vscode", title: "Open project in VS Code", description: "If your builder exports code, open it locally." },
    { id: "github", title: "Create GitHub repository", description: "Push the code so you have version history." },
    { id: "deploy", title: "Deploy to Vercel", description: "Connect your GitHub repo and deploy the main branch." },
    { id: "domain", title: "Connect your domain", description: "Point DNS to Vercel and verify SSL." },
    { id: "analytics", title: "Add analytics", description: "Plausible, Fathom, or GA4." },
    { id: "forms", title: "Test contact forms", description: "Submit a real message to confirm it lands in your inbox." },
    { id: "mobile", title: "Test mobile layout", description: "Every page. Real device beats devtools." },
    { id: "seo", title: "Review SEO metadata", description: "Meta titles, descriptions, OG images." },
    { id: "final", title: "Final launch review", description: "Read every page one more time. Then announce." },
  ],
};

// -------------------- Portfolio Website --------------------
const portfolio = {
  id: "portfolio",
  name: "Portfolio Website",
  tagline: "Personal site to showcase your work and get hired.",
  description:
    "A clean, credibility-building site for freelancers, creatives, and job seekers.",
  category: "Website",
  icon: "user",
  recommendedBuilder: "lovable",
  status: "available",
  sections: [
    projectContextSection,
    {
      id: "profile",
      title: "Profile",
      icon: "user",
      description: "Who you are and how to reach you.",
      questions: [
        { id: "fullName", label: "Full name", type: "text", required: true },
        { id: "title", label: "Professional title", type: "text", placeholder: "e.g. Product Designer" },
        { id: "bio", label: "Short bio", type: "textarea", placeholder: "Two or three sentences." },
        { id: "location", label: "Location", type: "text", placeholder: "Remote · Berlin" },
        { id: "email", label: "Contact email", type: "text" },
        { id: "socials", label: "Social links (URLs)", type: "textarea", placeholder: "One per line: LinkedIn, GitHub, X, Dribbble…" },
      ],
    },
    {
      id: "work",
      title: "Work",
      icon: "briefcase",
      description: "The work you want the world to see.",
      questions: [
        {
          id: "projectTypes",
          label: "Types of work you do",
          type: "multiselect",
          options: ["Product Design", "Brand Design", "Illustration", "Photography", "Engineering", "Writing", "Motion", "Research", "Consulting"],
        },
        { id: "featuredProjects", label: "Featured projects (one per line)", type: "textarea", placeholder: "Title — one-sentence description" },
        { id: "skills", label: "Skills", type: "chips-add", placeholder: "Type and press Enter" },
        { id: "experience", label: "Experience summary", type: "textarea" },
        { id: "resume", label: "Include a downloadable resume?", type: "toggle" },
        { id: "caseStudies", label: "Include case studies?", type: "toggle", default: true },
      ],
    },
    {
      id: "brand",
      title: "Brand",
      icon: "palette",
      description: "Your visual identity.",
      questions: [
        { id: "primaryColor", label: "Primary color", type: "color", default: "#5f22cf" },
        {
          id: "visualStyle",
          label: "Visual style",
          type: "select",
          options: ["Editorial", "Modern minimal", "Bold & expressive", "Playful", "Technical", "Analog / crafted"],
        },
        {
          id: "tone",
          label: "Tone",
          type: "multiselect",
          options: ["Confident", "Warm", "Direct", "Playful", "Introspective", "Bold"],
        },
        { id: "personality", label: "Personality in one line", type: "text", placeholder: "e.g. Curious, calm, precise." },
      ],
    },
    {
      id: "pages",
      title: "Pages",
      icon: "layout",
      description: "The pages your visitors will navigate.",
      questions: [
        {
          id: "requiredPages",
          label: "Pages you need",
          type: "multiselect",
          options: ["Home", "About", "Work", "Case Studies", "Resume", "Writing / Blog", "Contact"],
          default: ["Home", "About", "Work", "Contact"],
        },
      ],
    },
    {
      id: "seo",
      title: "SEO",
      icon: "search",
      description: "How employers and clients will find you.",
      questions: [
        { id: "searchTerms", label: "Target search terms", type: "chips-add", placeholder: "e.g. senior product designer freelance" },
        { id: "niche", label: "Professional niche", type: "text" },
        { id: "metaTitle", label: "Meta title", type: "text" },
        { id: "metaDescription", label: "Meta description", type: "textarea" },
      ],
    },
    {
      id: "launch",
      title: "Launch",
      icon: "rocket",
      description: "Getting your portfolio live.",
      questions: [
        { id: "hasDomain", label: "Existing domain?", type: "toggle" },
        { id: "domainName", label: "Domain name", type: "text", placeholder: "yourname.com" },
        { id: "github", label: "GitHub URL", type: "text" },
        { id: "linkedin", label: "LinkedIn URL", type: "text" },
        { id: "contactDestination", label: "Contact form destination email", type: "text" },
      ],
    },
  ],
  builderRules: { default: "lovable" },
  setupChecklist: [
    { id: "review", title: "Review generated site", description: "Skim every section for tone and accuracy." },
    { id: "assets", title: "Upload project imagery", description: "High-quality screenshots or photography." },
    { id: "github", title: "Push code to GitHub" },
    { id: "deploy", title: "Deploy to Vercel" },
    { id: "domain", title: "Connect your custom domain", description: "yourname.com is worth it." },
    { id: "meta", title: "Set up OG image", description: "This is the image people see when they share your site." },
    { id: "resume", title: "Upload latest resume PDF" },
    { id: "share", title: "Share the launch on LinkedIn" },
  ],
};

// -------------------- Coming Soon --------------------
const comingSoon = [
  { id: "saas-landing", name: "SaaS Landing Page", tagline: "High-converting hero + features + pricing.", icon: "zap", recommendedBuilder: "lovable" },
  { id: "restaurant", name: "Restaurant Website", tagline: "Menu, hours, reservations.", icon: "utensils", recommendedBuilder: "lovable" },
  { id: "local-service", name: "Local Service Website", tagline: "Plumbers, cleaners, contractors.", icon: "wrench", recommendedBuilder: "lovable" },
  { id: "game-studio", name: "Game Studio Website", tagline: "Showcase your games and team.", icon: "gamepad2", recommendedBuilder: "lovable" },
  { id: "ecommerce", name: "Ecommerce Store", tagline: "Products, cart, checkout.", icon: "shopping-bag", recommendedBuilder: "emergent" },
  { id: "education", name: "Educational Platform", tagline: "Courses, lessons, enrollment.", icon: "graduation-cap", recommendedBuilder: "emergent" },
  { id: "mobile-app", name: "Mobile App", tagline: "iOS / Android product.", icon: "smartphone", recommendedBuilder: "emergent" },
  { id: "booking", name: "Booking App", tagline: "Calendar-first scheduling.", icon: "calendar", recommendedBuilder: "emergent" },
  { id: "nonprofit", name: "Nonprofit Website", tagline: "Mission, programs, donations.", icon: "heart", recommendedBuilder: "lovable" },
  { id: "marketing-campaign", name: "Marketing Campaign", tagline: "Landing page + email sequence.", icon: "megaphone", recommendedBuilder: "lovable" },
].map((t) => ({ ...t, status: "coming-soon", sections: [], setupChecklist: [] }));

export const templates = [businessWebsite, portfolio, ...comingSoon];

export function getTemplate(id) {
  return templates.find((t) => t.id === id);
}

export function getAvailableTemplates() {
  return templates.filter((t) => t.status === "available");
}

export function getComingSoonTemplates() {
  return templates.filter((t) => t.status === "coming-soon");
}
