import type { SiteContent } from "./types";

/**
 * SEED CONTENT — extracted verbatim from the original portfolio HTML.
 * Used as: (1) Supabase seed source, (2) typed fallback so the public
 * site renders fully even before Supabase is configured.
 * Image paths point to /images/* static fallbacks; once Supabase
 * Storage is wired, these are replaced by stored URLs via useContent().
 */
export const SEED: SiteContent = {
  profile: {
    name: "Nayani Paul",
    title: "Building software people actually use.",
    availabilityBadge: "Open to internships & new-grad roles",
    subtitle:
      "I'm Nayani, a CS undergrad at <b>KIIT</b> shipping full-stack and AI systems with measurable impact. From a <b>government grievance platform</b> serving 500+ personnel to <b>agentic-AI</b> assistants and real-time <b>computer vision</b>.",
    roles: [
      "Full-Stack Engineer",
      "AI Product Developer",
      "Accessibility Engineer",
      "CS @ KIIT, '27",
    ],
    ctaPrimary: { label: "See the work →", href: "#projects" },
    ctaGhost: { label: "Get in touch", href: "#contact" },
    resumeUrl: "#",
    aboutTitle: "A bit about me",
    aboutParagraphs: [
      "I'm a Computer Science student at <b>KIIT, Bhubaneswar</b>, and most of what I know I've picked up by building things people actually use, not just coursework. So far that's included a live product feature at <b>Zidio Development</b>, a self-service platform at <b>Knowledge Capsules</b>, and a grievance system now used by 500+ people at the West Bengal Sainik Board.",
      "I haven't specialised in one thing yet, and I'm fine with that. I'd rather be someone who can pick up whatever a team needs. That's meant full-stack web work, some AI integration, and more recently, accessibility testing (WCAG 2.1).",
      "Outside of internships I keep building small things, mostly to understand how they work. I care about writing code someone else can pick up easily, and about software that still holds up once real people are using it.",
    ],
    quickFacts: [
      { label: "Location", value: "Kolkata, India" },
      { label: "Degree", value: "B.Tech CSE" },
      { label: "Graduation", value: "Aug 2027" },
      { label: "Focus", value: "Full-Stack · AI" },
      { label: "Status", value: "Open to roles" },
    ],
    infoCards: [
      { icon: "🏫", text: "KIIT · CS '27", visible: true },
      { icon: "📍", text: "Kolkata, India", visible: true },
      { icon: "⭐", text: "9.55 CGPA", visible: true },
    ],
    highlights: [
      {
        icon: "🏅",
        text: "<b>Letter of Commendation</b>, awarded by the Rajya Sainik Board for technical excellence and impact on public-service transparency.",
      },
    ],
    aboutImage: "",
    heroImage: "",
    stackImage: "",
  },
  experience: [
    {
      id: "exp-1",
      stepLabel: "Most recent",
      role: "AI & Full-Stack Development Intern",
      company: "Zidio Development",
      duration: "June 2026 · Remote",
      description:
        "Designed a composable middleware chain (auth → rate-limit → validation → errors) that cut code by ~70%, modelled the meeting lifecycle as a typed discriminated union (upcoming → live → completed), and shipped real-time video (WebRTC), presence sync (Socket.io), and AI meeting summaries (Gemini) to production.",
      tags: ["TypeScript", "Node.js", "Gemini API"],
      logo: "",
      sortOrder: 0,
    },
    {
      id: "exp-2",
      stepLabel: "",
      role: "AI Product Development Intern",
      company: "Knowledge Capsules",
      duration: "May 2026 · Kolkata",
      description:
        "Replaced a manual WhatsApp/form enrolment process with a self-service platform (Razorpay, OTP, waitlist), abstracted Google Drive, Sheets, and Nodemailer behind one dispatch interface, and unified 15 AI tool integrations into a shared prompt-pipeline.",
      tags: ["Node.js", "Razorpay", "Gemini API"],
      logo: "",
      sortOrder: 1,
    },
    {
      id: "exp-3",
      stepLabel: "",
      role: "Full-Stack Developer",
      company: "West Bengal Sainik Board · Grievance & Visitor Management System",
      duration: "Jul 2025 to May 2026 · Kolkata",
      description:
        "Built a full-stack grievance portal digitising workflows for 500+ personnel and cutting resolution time 60%, with backend routing and file-handling across 12 branches at 100% accuracy. Added a visitor management system with online appointment booking and an authenticated CMS admin panel, with 100+ registrations in the first 24 hours.",
      tags: ["React", "Node.js", "MongoDB", "Gov-tech"],
      logo: "",
      sortOrder: 2,
    },
  ],
  skills: [
    { id: "s1", category: "stack", name: "React", fullName: "React", color: "#61DAFB", logo: "", sortOrder: 0 },
    { id: "s2", category: "stack", name: "TS", fullName: "TypeScript", color: "#3178C6", logo: "", sortOrder: 1 },
    { id: "s3", category: "stack", name: "JS", fullName: "JavaScript", color: "#F7DF1E", logo: "", sortOrder: 2 },
    { id: "s4", category: "stack", name: "Python", fullName: "Python", color: "#3776AB", logo: "", sortOrder: 3 },
    { id: "s5", category: "stack", name: "Java", fullName: "Java", color: "#ED8B00", logo: "", sortOrder: 4 },
    { id: "s6", category: "stack", name: "C++", fullName: "C++", color: "#00599C", logo: "", sortOrder: 5 },
    { id: "s7", category: "stack", name: "SQL", fullName: "SQL", color: "#5A7A5B", logo: "", sortOrder: 6 },
    { id: "s8", category: "stack", name: "Node", fullName: "Node.js", color: "#5FA04E", logo: "", sortOrder: 7 },
    { id: "s9", category: "stack", name: "Mongo", fullName: "MongoDB", color: "#47A248", logo: "", sortOrder: 8 },
    { id: "s10", category: "stack", name: "MySQL", fullName: "MySQL", color: "#4479A1", logo: "", sortOrder: 9 },
    { id: "s11", category: "stack", name: "Supa", fullName: "Supabase", color: "#3FCF8E", logo: "", sortOrder: 10 },
    { id: "s12", category: "stack", name: "Git", fullName: "Git", color: "#F05032", logo: "", sortOrder: 11 },
    { id: "s13", category: "stack", name: "Gemini", fullName: "Gemini API", color: "#8E75B2", logo: "", sortOrder: 12 },
    { id: "s14", category: "stack", name: "Lang", fullName: "LangGraph", color: "#1c3d5a", logo: "", sortOrder: 13 },
    { id: "s15", category: "stack", name: "OpenCV", fullName: "OpenCV", color: "#5C3EE8", logo: "", sortOrder: 14 },
    { id: "s16", category: "stack", name: "YOLO", fullName: "YOLOv8", color: "#00C2A8", logo: "", sortOrder: 15 },
    { id: "s17", category: "stack", name: "Stream", fullName: "Streamlit", color: "#FF4B4B", logo: "", sortOrder: 16 },
    { id: "s18", category: "stack", name: "Pandas", fullName: "Pandas", color: "#150458", logo: "", sortOrder: 17 },
    { id: "s19", category: "stack", name: "NumPy", fullName: "NumPy", color: "#013243", logo: "", sortOrder: 18 },
  ],
  projects: [
    {
      id: "p1", slug: "accessibility-audit", title: "Accessibility Audit: Unity Run 2026 & ZSB VMS",
      dateLabel: "Sept 2026", featured: true, active: true,
      description:
        'Audited two production web apps for <span class="m">WCAG 2.1 AA</span> compliance with axe-core, identifying 4 violation types across 18 elements. Manually cross-checked automated findings with VoiceOver and NVDA to separate confirmed violations from flags needing human judgment.',
      techStack: ["axe-core", "WCAG 2.1", "VoiceOver", "NVDA"],
      githubUrl: "", liveUrl: "",
      image: "", sortOrder: 0,
    },
    {
      id: "p2", slug: "unity-run-2026", title: "Unity Run 2026: Event Registration Platform",
      dateLabel: "2026", featured: true, active: true,
      description:
        'Full-stack registration site for a government-run sports event: multi-step flow, payment capture, and slot-cap enforcement, live in production. Real-time seat counters via Socket.IO with <span class="m">no polling</span>, email OTP verification, and a QR-first fallback after diagnosing a bank-side UPI deep-link restriction.',
      techStack: ["Node.js", "Express", "Google Sheets API", "Socket.io"],
      githubUrl: "", liveUrl: "",
      image: "", sortOrder: 1,
    },
    {
      id: "p3", slug: "medbot", title: "MedBot: Agentic AI Healthcare Assistant",
      dateLabel: "Apr 2026", featured: true, active: true,
      description:
        'Agentic RAG assistant built in LangGraph with a multi-node workflow (retrieval, tool use, self-evaluation), reaching <span class="m">90% task success</span> and <span class="m">0.84 faithfulness / 0.87 relevance</span> on RAGAS. Conversational memory + live web search to cut hallucination.',
      techStack: ["Python", "LangGraph", "ChromaDB", "Streamlit", "Groq", "RAGAS"],
      githubUrl: "https://github.com/nayanipaul/medbot",
      liveUrl: "https://medbot-demo.streamlit.app",
      image: "/images/medbot.png", sortOrder: 2,
    },
    {
      id: "p4", slug: "vision-assist", title: "Vision Assistance for the Visually Impaired",
      dateLabel: "Mar 2026", featured: false, active: true,
      description:
        'Real-time object detection (YOLOv8n) with threaded capture at <span class="m">25 to 30 FPS at 640x480 on CPU-only hardware</span>. Pinhole-geometry distance/direction estimation and a priority-based offline voice-alert engine for nearby hazards.',
      techStack: ["Python", "YOLOv8", "OpenCV", "pyttsx3", "IP Webcam"],
      githubUrl: "https://github.com/nayanipaul/vision-assist",
      liveUrl: "https://github.com/nayanipaul/vision-assist#demo",
      image: "/images/vision-assist.png", sortOrder: 3,
    },
    {
      id: "p5", slug: "nutricoach", title: "NutriCoach: AI Diet Agent",
      dateLabel: "Dec 2025", featured: false, active: true,
      description:
        'AI agent using <span class="m">Gemini Vision</span> for photo-to-macro conversion, Supabase OTP auth, an AI recipe generator, cheat-meal tracker, and automated weekly PDF progress reports.',
      techStack: ["React", "Supabase", "Gemini API", "Nano Banana"],
      githubUrl: "https://github.com/nayanipaul/nutricoach",
      liveUrl: "https://nutricoach-demo.vercel.app",
      image: "/images/nutricoach.png", sortOrder: 4,
    },
    {
      id: "p6", slug: "datavizard", title: "DataVizard: AI Analytics Dashboard",
      dateLabel: "Jun 2025", featured: false, active: false,
      description:
        'Flask backend for secure Gemini integration turning raw datasets into <span class="m">actionable AI insights</span>, with dynamic filtering, an automated cleaning pipeline, and CSV/PDF export.',
      techStack: ["Flask", "Vanilla JS", "Gemini API", "Pandas"],
      githubUrl: "https://github.com/nayanipaul/datavizard",
      liveUrl: "https://datavizard-demo.onrender.com",
      image: "/images/datavizard.png", sortOrder: 5,
    },
  ],
  achievements: [
    { id: "a1", title: "Letter of Commendation", description: "Awarded by the Rajya Sainik Board for technical excellence and impact on public-service transparency.", icon: "\u2605", category: "Award", organization: "", year: "", link: "", image: "", visible: true, highlight: true, sortOrder: 0 },
  ],
  certifications: [
    {
      id: "c1", title: "Letter of Commendation", issuer: "Rajya Sainik Board", dateLabel: "2025",
      description:
        "Awarded for technical excellence and impact on public-service transparency through the West Bengal Sainik Board grievance redressal platform.",
      image: "/certificates/commendation.png", sortOrder: 0,
    },
    {
      id: "c2", title: "Agentic AI: 70-Hour Professional Training", issuer: "ExcelR · in association with KIIT University", dateLabel: "2026",
      description: "70-hour professional training covering agentic AI system design, tool-use workflows, and evaluation.",
      image: "", sortOrder: 1,
    },
    {
      id: "c3", title: "AI in Action: Job Simulation", issuer: "Vista Equity Partners · Forage", dateLabel: "Apr 2026",
      description:
        "Completed Vista's AI in Action job simulation: modelling AI use-cases, evaluation pipelines, and stakeholder framing.",
      image: "/certificates/vista-ai.png", sortOrder: 2,
    },
    {
      id: "c4", title: "Introduction to Agile and Scrum", issuer: "Alison", dateLabel: "Nov 2025",
      description: "Foundations of Agile delivery and the Scrum framework: roles, ceremonies, and iterative planning.",
      image: "", sortOrder: 3,
    },
    {
      id: "c5", title: "Prime Code Champ", issuer: "TechGig.com", dateLabel: "Jan 2025",
      description: "Competitive programming recognition on TechGig's Prime Code Champ challenge.",
      image: "", sortOrder: 4,
    },
  ],
  settings: {
    email: "nayanipaul27@gmail.com",
    linkedin: "https://www.linkedin.com/in/nayanipaul",
    github: "https://github.com/nayanipaul",
    contactImage: "",
    contactEyebrow: "Let's talk",
    contactHeading: "Got an interesting<br />problem? <em>Send it over.</em>",
    contactDescription: "Open to software engineering internships and new-grad roles, graduating 2027. I move comfortably across full-stack, AI/ML, and accessibility work rather than sticking to one lane.",
    stackTitle: "The tools I <em>reach for</em>",
    stackQuote: "I pick tools by what gets the thing built and shipped fastest, with the right ceiling for impact.",
    stackDescription: "I work full-stack with a slight pull toward <b>AI/ML</b>. Strongest in React, Python, and the LangChain / LangGraph ecosystem; comfortable in OpenCV, Supabase, and modern build tooling.",
    seoTitle: "Nayani Paul | Software Engineer",
    seoDesc:
      "Computer Science undergraduate & full-stack / AI developer. Building software that gets used, from a government grievance platform to agentic AI, computer vision, and accessibility engineering.",
    seoKeywords: ["full-stack developer", "AI engineer", "React", "LangGraph", "computer vision", "accessibility", "WCAG"],
    sections: [
      { key: "work", visible: true },
      { key: "stack", visible: true },
      { key: "achievements", visible: false },
      { key: "projects", visible: true },
      { key: "certs", visible: true },
    ],
  },
};
