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

// -------------------- SaaS Landing Page --------------------
const saasLanding = {
  id: "saas-landing",
  name: "SaaS Landing Page",
  tagline: "High-converting landing page for a software product.",
  description:
    "A single-page (or few-page) marketing site built to drive trial signups or demo requests.",
  category: "Website",
  icon: "zap",
  recommendedBuilder: "lovable",
  status: "available",
  sections: [
    projectContextSection,
    {
      id: "product",
      title: "Product",
      icon: "layers",
      description: "The software you're launching.",
      questions: [
        { id: "productName", label: "Product name", type: "text", required: true },
        { id: "tagline", label: "One-line tagline", type: "text", placeholder: "The AI-powered way to X." },
        { id: "description", label: "What does it do?", type: "textarea", required: true, placeholder: "Explain in two or three sentences." },
        {
          id: "stage",
          label: "Product stage",
          type: "select",
          options: ["Pre-launch / waitlist", "Beta", "Public launch", "Established growth"],
        },
        { id: "targetUser", label: "Target user", type: "textarea", placeholder: "Job title, team, or persona." },
        { id: "problem", label: "Problem it solves", type: "textarea" },
        { id: "primaryCTA", label: "Primary CTA", type: "text", placeholder: "e.g. Start free trial" },
        { id: "secondaryCTA", label: "Secondary CTA (optional)", type: "text", placeholder: "e.g. Book a demo" },
      ],
    },
    {
      id: "value",
      title: "Value & Positioning",
      icon: "sparkles",
      description: "How you frame the win.",
      questions: [
        { id: "heroHeadline", label: "Hero headline", type: "text", placeholder: "The outcome, not the feature." },
        { id: "heroSubheadline", label: "Hero subheadline", type: "textarea" },
        { id: "differentiators", label: "Key differentiators", type: "chips-add", placeholder: "One per chip" },
        { id: "competitors", label: "Alternatives users compare you to", type: "chips-add" },
      ],
    },
    {
      id: "features",
      title: "Features",
      icon: "layers",
      description: "What the product actually does.",
      questions: [
        { id: "keyFeatures", label: "Key features (one per line, with a short benefit)", type: "textarea", placeholder: "Instant AI drafts — turn a brief into first draft in 30s" },
        { id: "integrations", label: "Integrations", type: "chips-add" },
      ],
    },
    {
      id: "pricing",
      title: "Pricing",
      icon: "type",
      description: "How the product monetizes.",
      questions: [
        { id: "hasPricing", label: "Show pricing publicly?", type: "toggle", default: true },
        {
          id: "pricingModel",
          label: "Pricing model",
          type: "select",
          options: ["Free", "Freemium", "Flat monthly", "Per-seat", "Usage-based", "Enterprise / contact sales"],
        },
        { id: "tiers", label: "Pricing tiers (one per line)", type: "textarea", placeholder: "Free — 5 projects, community support\nPro — $29/mo, unlimited projects\nTeam — $79/mo/seat, SSO" },
        { id: "trial", label: "Free trial available?", type: "toggle" },
      ],
    },
    {
      id: "social-proof",
      title: "Social Proof",
      icon: "user",
      description: "Evidence that this actually works.",
      questions: [
        { id: "customerLogos", label: "Customer / partner logos", type: "chips-add" },
        { id: "testimonials", label: "Testimonials (one per line)", type: "textarea" },
        { id: "metrics", label: "Impact metrics (one per line)", type: "textarea", placeholder: "10× faster onboarding\n1,200+ teams shipping weekly" },
      ],
    },
    {
      id: "brand",
      title: "Brand",
      icon: "palette",
      description: "The visual identity of the landing page.",
      questions: [
        { id: "primaryColor", label: "Primary color", type: "color", default: "#5f22cf" },
        { id: "secondaryColor", label: "Secondary color", type: "color", default: "#1a1c23" },
        {
          id: "designStyle",
          label: "Design style",
          type: "select",
          options: ["Modern minimal", "Bold & colorful", "Editorial", "Technical / developer", "Playful"],
        },
        {
          id: "brandTone",
          label: "Brand tone",
          type: "multiselect",
          options: ["Confident", "Playful", "Technical", "Warm", "Bold", "Minimal"],
        },
      ],
    },
    {
      id: "seo",
      title: "SEO",
      icon: "search",
      description: "How prospects find you.",
      questions: [
        { id: "keywords", label: "Target keywords", type: "chips-add" },
        { id: "metaTitle", label: "Meta title", type: "text" },
        { id: "metaDescription", label: "Meta description", type: "textarea" },
        { id: "ogSummary", label: "Open Graph summary", type: "textarea" },
      ],
    },
    {
      id: "launch",
      title: "Launch",
      icon: "rocket",
      description: "Getting live.",
      questions: [
        { id: "domainName", label: "Domain name", type: "text", placeholder: "product.com" },
        { id: "hosting", label: "Preferred hosting", type: "select", options: ["Vercel", "Netlify", "Cloudflare Pages", "Not sure yet"] },
        { id: "needsAnalytics", label: "Include analytics?", type: "toggle", default: true },
        { id: "waitlistDestination", label: "Where signups go (email / API endpoint)", type: "text" },
      ],
    },
  ],
  builderRules: { default: "lovable" },
  setupChecklist: [
    { id: "review", title: "Review generated landing page" },
    { id: "signup", title: "Wire up signup / waitlist form", description: "Test end-to-end." },
    { id: "analytics", title: "Install analytics (Plausible/Fathom/GA4)" },
    { id: "og", title: "Set OG image + social preview" },
    { id: "domain", title: "Connect custom domain" },
    { id: "seo", title: "Submit sitemap to Google Search Console" },
    { id: "share", title: "Post launch to social / Product Hunt" },
  ],
};

// -------------------- Restaurant Website --------------------
const restaurant = {
  id: "restaurant",
  name: "Restaurant Website",
  tagline: "Menu, hours, and reservations for a restaurant.",
  description:
    "A visually appetizing site that gets diners to book a table or place an order.",
  category: "Website",
  icon: "utensils",
  recommendedBuilder: "lovable",
  status: "available",
  sections: [
    projectContextSection,
    {
      id: "restaurant-info",
      title: "Restaurant Info",
      icon: "building",
      description: "The basics.",
      questions: [
        { id: "restaurantName", label: "Restaurant name", type: "text", required: true },
        { id: "tagline", label: "Tagline", type: "text" },
        {
          id: "cuisine",
          label: "Cuisine",
          type: "select",
          options: ["Italian", "French", "Japanese", "Chinese", "Indian", "Mexican", "American", "Mediterranean", "Middle Eastern", "Thai", "Vietnamese", "Fusion", "Other"],
        },
        {
          id: "style",
          label: "Style of dining",
          type: "select",
          options: ["Fine dining", "Casual", "Bistro", "Café", "Fast casual", "Bar & grill", "Pop-up"],
        },
        { id: "description", label: "Short description", type: "textarea", required: true },
        { id: "story", label: "Chef / owner story (optional)", type: "textarea" },
      ],
    },
    {
      id: "menu",
      title: "Menu",
      icon: "type",
      description: "What you serve.",
      questions: [
        { id: "featuredDishes", label: "Featured dishes (one per line)", type: "textarea", placeholder: "Bucatini all'Amatriciana — pecorino, guanciale, tomato" },
        { id: "menuCategories", label: "Menu categories", type: "multiselect", options: ["Starters", "Salads", "Mains", "Sides", "Desserts", "Wine list", "Cocktails", "Coffee & Tea", "Kids"] },
        { id: "menuPDF", label: "Link to menu PDF (optional)", type: "text" },
        { id: "dietary", label: "Dietary options", type: "multiselect", options: ["Vegetarian", "Vegan", "Gluten-free", "Halal", "Kosher", "Nut-free"] },
        { id: "priceRange", label: "Price range", type: "select", options: ["$", "$$", "$$$", "$$$$"] },
      ],
    },
    {
      id: "location",
      title: "Location & Hours",
      icon: "layout",
      description: "Where to find you.",
      questions: [
        { id: "address", label: "Full address", type: "textarea", required: true },
        { id: "phone", label: "Phone", type: "text" },
        { id: "email", label: "Email", type: "text" },
        { id: "hours", label: "Hours (one line per day)", type: "textarea", placeholder: "Mon–Thu 17:00–22:00\nFri–Sat 17:00–23:00\nSun Closed" },
        { id: "parking", label: "Parking / transit notes", type: "text" },
      ],
    },
    {
      id: "brand",
      title: "Brand",
      icon: "palette",
      description: "The mood of the site.",
      questions: [
        { id: "primaryColor", label: "Primary color", type: "color", default: "#7c2d12" },
        { id: "secondaryColor", label: "Secondary color", type: "color", default: "#fdfcfa" },
        {
          id: "designStyle",
          label: "Design style",
          type: "select",
          options: ["Editorial / magazine", "Warm & rustic", "Modern minimal", "Bold & colorful", "Elegant / fine dining", "Playful"],
        },
        { id: "photography", label: "Photography direction", type: "textarea", placeholder: "Moody low-light close-ups, natural daylight interiors…" },
      ],
    },
    {
      id: "features",
      title: "Reservations & Features",
      icon: "layers",
      description: "How guests interact with the site.",
      questions: [
        {
          id: "features",
          label: "Features",
          type: "multiselect",
          options: ["Online reservations", "Online ordering / takeout", "Delivery link", "Gift cards", "Private events", "Newsletter", "Instagram feed", "Google Maps", "Menu download"],
          default: ["Online reservations", "Google Maps"],
        },
        { id: "reservationLink", label: "Reservation platform link (OpenTable, Resy, Tock…)", type: "text" },
        { id: "orderLink", label: "Online ordering link (if any)", type: "text" },
      ],
    },
    {
      id: "seo",
      title: "SEO",
      icon: "search",
      description: "How diners find you.",
      questions: [
        { id: "keywords", label: "Cuisine + neighbourhood keywords", type: "chips-add", placeholder: "e.g. Italian restaurant Portland Pearl District" },
        { id: "metaTitle", label: "Meta title", type: "text" },
        { id: "metaDescription", label: "Meta description", type: "textarea" },
      ],
    },
    {
      id: "launch",
      title: "Launch",
      icon: "rocket",
      description: "Going live.",
      questions: [
        { id: "domainName", label: "Domain name", type: "text" },
        { id: "socialLinks", label: "Social profiles (URLs)", type: "textarea" },
        { id: "googleBusiness", label: "Google Business Profile URL", type: "text" },
      ],
    },
  ],
  builderRules: { default: "lovable" },
  setupChecklist: [
    { id: "review", title: "Review site copy and photos" },
    { id: "reservations", title: "Test reservation flow end-to-end" },
    { id: "menu", title: "Confirm menu is up-to-date" },
    { id: "hours", title: "Double-check hours and holiday closures" },
    { id: "google", title: "Update Google Business Profile" },
    { id: "domain", title: "Connect custom domain" },
    { id: "mobile", title: "Test on mobile at the bar / on the floor" },
    { id: "social", title: "Announce on Instagram" },
  ],
};

// -------------------- Booking App --------------------
const bookingApp = {
  id: "booking",
  name: "Booking App",
  tagline: "Calendar-first scheduling for a service business.",
  description:
    "A lightweight app where clients pick a service, choose a time, and confirm — with clear rules around availability.",
  category: "App",
  icon: "calendar",
  recommendedBuilder: "emergent",
  status: "available",
  sections: [
    projectContextSection,
    {
      id: "business",
      title: "Business",
      icon: "building",
      description: "The service business behind the booking.",
      questions: [
        { id: "businessName", label: "Business name", type: "text", required: true },
        { id: "tagline", label: "Tagline", type: "text" },
        { id: "description", label: "What you offer", type: "textarea", required: true },
        {
          id: "industry",
          label: "Industry",
          type: "select",
          options: ["Salon / Spa", "Fitness / Personal training", "Health / Therapy", "Coaching / Consulting", "Photography", "Tutoring", "Home services", "Other"],
        },
        { id: "location", label: "Location or service area", type: "text" },
      ],
    },
    {
      id: "services",
      title: "Services",
      icon: "layers",
      description: "What clients can book.",
      questions: [
        { id: "services", label: "Services (one per line: name — duration — price)", type: "textarea", required: true, placeholder: "60-min Deep Tissue — 60m — $95\nInitial Consultation — 30m — Free" },
        { id: "categories", label: "Service categories", type: "chips-add", placeholder: "e.g. Massage, Facial, Bodywork" },
        { id: "hasProviders", label: "Multiple providers / staff?", type: "toggle" },
        { id: "providers", label: "Providers (one per line, if multiple)", type: "textarea" },
      ],
    },
    {
      id: "scheduling",
      title: "Scheduling Rules",
      icon: "type",
      description: "The rules the calendar must obey.",
      questions: [
        { id: "hours", label: "Working hours (per day)", type: "textarea", placeholder: "Mon–Fri 09:00–18:00\nSat 10:00–14:00\nSun Closed" },
        { id: "slotInterval", label: "Slot interval", type: "select", options: ["15 min", "30 min", "45 min", "60 min"] },
        { id: "buffer", label: "Buffer between appointments", type: "select", options: ["None", "10 min", "15 min", "30 min"] },
        { id: "leadTime", label: "Minimum lead time before booking", type: "select", options: ["None", "1 hour", "4 hours", "12 hours", "24 hours"] },
        { id: "cancellation", label: "Cancellation policy", type: "textarea", placeholder: "Free cancellation up to 24h before…" },
      ],
    },
    {
      id: "flow",
      title: "Booking Flow",
      icon: "layout",
      description: "The client's journey.",
      questions: [
        {
          id: "flowSteps",
          label: "Steps in the booking flow",
          type: "multiselect",
          options: ["Choose service", "Choose provider", "Choose date & time", "Enter contact info", "Enter details / intake form", "Confirm & pay"],
          default: ["Choose service", "Choose date & time", "Enter contact info", "Confirm & pay"],
        },
        { id: "requiresAccount", label: "Require account creation?", type: "toggle" },
        { id: "intakeFields", label: "Custom intake fields (one per line)", type: "textarea", placeholder: "Any injuries?\nHow did you hear about us?" },
      ],
    },
    {
      id: "payments",
      title: "Payments",
      icon: "type",
      description: "How money moves.",
      questions: [
        { id: "paymentTiming", label: "When do clients pay?", type: "select", options: ["At time of booking", "Deposit at booking, rest at appointment", "Pay at appointment", "No online payment"] },
        {
          id: "paymentProvider",
          label: "Payment provider",
          type: "select",
          options: ["Stripe", "PayPal", "Square", "Not sure yet", "None"],
        },
        { id: "acceptTips", label: "Accept tips?", type: "toggle" },
      ],
    },
    {
      id: "notifications",
      title: "Notifications",
      icon: "sparkles",
      description: "Reminders and confirmations.",
      questions: [
        {
          id: "channels",
          label: "Notification channels",
          type: "multiselect",
          options: ["Email confirmation", "Email reminder", "SMS reminder", "iCal / Google Calendar invite"],
          default: ["Email confirmation", "Email reminder"],
        },
        { id: "reminderTiming", label: "Reminder timing", type: "select", options: ["1 hour before", "3 hours before", "24 hours before", "48 hours before"] },
      ],
    },
    {
      id: "brand",
      title: "Brand",
      icon: "palette",
      description: "How the app looks.",
      questions: [
        { id: "primaryColor", label: "Primary color", type: "color", default: "#5f22cf" },
        { id: "designStyle", label: "Design style", type: "select", options: ["Clean & minimal", "Warm & welcoming", "Bold & confident", "Clinical / professional"] },
      ],
    },
    {
      id: "launch",
      title: "Launch",
      icon: "rocket",
      description: "Going live.",
      questions: [
        { id: "domainName", label: "Domain name", type: "text" },
        { id: "adminEmail", label: "Admin notification email", type: "text" },
        { id: "existingCalendar", label: "Sync with an existing calendar? (Google, iCloud)", type: "text" },
      ],
    },
  ],
  builderRules: { default: "emergent" },
  setupChecklist: [
    { id: "review", title: "Review generated app" },
    { id: "services", title: "Enter real service list, prices, durations" },
    { id: "calendar", title: "Configure availability + working hours" },
    { id: "payments", title: "Connect payment provider" },
    { id: "email", title: "Verify confirmation + reminder emails" },
    { id: "test", title: "Book a test appointment as a client" },
    { id: "domain", title: "Connect custom domain" },
    { id: "launch", title: "Share with first customers" },
  ],
};

// -------------------- Coming Soon --------------------
const comingSoon = [
  { id: "local-service", name: "Local Service Website", tagline: "Plumbers, cleaners, contractors.", icon: "wrench", recommendedBuilder: "lovable" },
  { id: "game-studio", name: "Game Studio Website", tagline: "Showcase your games and team.", icon: "gamepad2", recommendedBuilder: "lovable" },
  { id: "ecommerce", name: "Ecommerce Store", tagline: "Products, cart, checkout.", icon: "shopping-bag", recommendedBuilder: "emergent" },
  { id: "education", name: "Educational Platform", tagline: "Courses, lessons, enrollment.", icon: "graduation-cap", recommendedBuilder: "emergent" },
  { id: "mobile-app", name: "Mobile App", tagline: "iOS / Android product.", icon: "smartphone", recommendedBuilder: "emergent" },
  { id: "nonprofit", name: "Nonprofit Website", tagline: "Mission, programs, donations.", icon: "heart", recommendedBuilder: "lovable" },
  { id: "marketing-campaign", name: "Marketing Campaign", tagline: "Landing page + email sequence.", icon: "megaphone", recommendedBuilder: "lovable" },
].map((t) => ({ ...t, status: "coming-soon", sections: [], setupChecklist: [] }));

export const templates = [businessWebsite, portfolio, saasLanding, restaurant, bookingApp, ...comingSoon];

export function getTemplate(id) {
  return templates.find((t) => t.id === id);
}

export function getAvailableTemplates() {
  return templates.filter((t) => t.status === "available");
}

export function getComingSoonTemplates() {
  return templates.filter((t) => t.status === "coming-soon");
}
