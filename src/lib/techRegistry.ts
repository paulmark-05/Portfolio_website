/**
 * Technology registry — the single source of truth for tech metadata.
 *
 * Used by:
 *  - Skills CMS (autocomplete; selecting a tech auto-fills logo + color, so
 *    manual color/category entry is gone)
 *  - Projects CMS (tech multi-select autocomplete; no manual typing of stacks)
 *  - Project cards + stack bubbles (render the official logo via slug)
 *
 * Logos are served from Simple Icons CDN by slug, so no binary assets need to
 * be bundled and any tech here automatically gets a logo. `color` is the
 * official brand hex. `aliases` makes search forgiving ("node" → Node.js).
 */
export interface Tech {
  /** canonical key, also used as the stored value */
  name: string;
  /** label shown in the bubble (short) */
  short: string;
  /** brand hex */
  color: string;
  /** simpleicons slug for the logo; "" = no logo available */
  slug: string;
  aliases?: string[];
}

export const TECHS: Tech[] = [
  { name: "React", short: "React", color: "#61DAFB", slug: "react" },
  { name: "Next.js", short: "Next", color: "#000000", slug: "nextdotjs", aliases: ["next", "nextjs"] },
  { name: "TypeScript", short: "TS", color: "#3178C6", slug: "typescript", aliases: ["ts"] },
  { name: "JavaScript", short: "JS", color: "#F7DF1E", slug: "javascript", aliases: ["js"] },
  { name: "Python", short: "Py", color: "#3776AB", slug: "python" },
  { name: "Java", short: "Java", color: "#ED8B00", slug: "openjdk", aliases: ["jdk", "openjdk"] },
  { name: "C++", short: "C++", color: "#00599C", slug: "cplusplus", aliases: ["cpp"] },
  { name: "MySQL", short: "MySQL", color: "#4479A1", slug: "mysql" },
  { name: "SQL", short: "SQL", color: "#5A7A5B", slug: "" },
  { name: "Node.js", short: "Node", color: "#5FA04E", slug: "nodedotjs", aliases: ["node", "nodejs"] },
  { name: "Vite", short: "Vite", color: "#646CFF", slug: "vite" },
  { name: "MongoDB", short: "Mongo", color: "#47A248", slug: "mongodb", aliases: ["mongo"] },
  { name: "Supabase", short: "Supa", color: "#3FCF8E", slug: "supabase", aliases: ["supa"] },
  { name: "PostgreSQL", short: "PG", color: "#4169E1", slug: "postgresql", aliases: ["postgres", "psql"] },
  { name: "Firebase", short: "Fire", color: "#DD2C00", slug: "firebase" },
  { name: "OpenCV", short: "OpenCV", color: "#5C3EE8", slug: "opencv" },
  { name: "YOLOv8", short: "YOLO", color: "#00C2A8", slug: "", aliases: ["yolo", "yolov8", "ultralytics"] },
  { name: "LangGraph", short: "Lang", color: "#1C3D5A", slug: "langgraph", aliases: ["langchain", "lang"] },
  { name: "ChromaDB", short: "Chroma", color: "#FF6B6B", slug: "", aliases: ["chroma"] },
  { name: "Streamlit", short: "Stream", color: "#FF4B4B", slug: "streamlit" },
  { name: "Groq", short: "Groq", color: "#F55036", slug: "" },
  { name: "RAGAS", short: "RAGAS", color: "#6E56CF", slug: "", aliases: ["ragas"] },
  { name: "Tailwind", short: "Tail", color: "#06B6D4", slug: "tailwindcss", aliases: ["tailwindcss"] },
  { name: "GSAP", short: "GSAP", color: "#88CE02", slug: "greensock", aliases: ["greensock"] },
  { name: "Framer Motion", short: "Framer", color: "#0055FF", slug: "framer", aliases: ["framer"] },
  { name: "Vercel", short: "Vercel", color: "#000000", slug: "vercel" },
  { name: "Docker", short: "Docker", color: "#2496ED", slug: "docker" },
  { name: "Git", short: "Git", color: "#F05032", slug: "git" },
  { name: "GitHub", short: "GitHub", color: "#181717", slug: "github" },
  { name: "Figma", short: "Figma", color: "#F24E1E", slug: "figma" },
  { name: "Express", short: "Express", color: "#000000", slug: "express" },
  { name: "Redux", short: "Redux", color: "#764ABC", slug: "redux" },
  { name: "TensorFlow", short: "TF", color: "#FF6F00", slug: "tensorflow", aliases: ["tf"] },
  { name: "PyTorch", short: "Torch", color: "#EE4C2C", slug: "pytorch", aliases: ["torch"] },
  { name: "Canvas", short: "Canvas", color: "#E34F26", slug: "", aliases: ["html canvas"] },
  { name: "Gemini API", short: "Gemini", color: "#8E75B2", slug: "googlegemini", aliases: ["gemini", "google gemini"] },
  { name: "Nano Banana", short: "Nano", color: "#FFD54F", slug: "", aliases: ["nanobanana"] },
  { name: "IP Webcam", short: "IPcam", color: "#5A7A5B", slug: "", aliases: ["ipwebcam", "ip webcam"] },
  { name: "pyttsx3", short: "TTS", color: "#3776AB", slug: "", aliases: ["pyttsx", "tts"] },
  { name: "Gov-tech", short: "Gov", color: "#5A7A5B", slug: "", aliases: ["govtech"] },
  { name: "Simulation", short: "Sim", color: "#5A7A5B", slug: "", aliases: ["sim"] },
  { name: "EdTech", short: "Edu", color: "#5A7A5B", slug: "", aliases: ["edu"] },
  // --- extended registry ---
  { name: "CrewAI", short: "Crew", color: "#FF5A1F", slug: "crewai", aliases: ["crew"] },
  { name: "LlamaIndex", short: "Llama", color: "#7C3AED", slug: "", aliases: ["llama index", "llamaindex"] },
  { name: "Pinecone", short: "Pine", color: "#1C17FF", slug: "pinecone", aliases: ["pine"] },
  { name: "n8n", short: "n8n", color: "#EA4B71", slug: "n8n" },
  { name: "Hugging Face", short: "HF", color: "#FFD21E", slug: "huggingface", aliases: ["huggingface", "hf"] },
  { name: "OpenAI", short: "OpenAI", color: "#412991", slug: "openai" },
  { name: "Anthropic", short: "Claude", color: "#D97757", slug: "anthropic", aliases: ["claude"] },
  { name: "Weaviate", short: "Weav", color: "#00C9A7", slug: "weaviate" },
  { name: "Qdrant", short: "Qdrant", color: "#DC244C", slug: "qdrant" },
  { name: "FastAPI", short: "Fast", color: "#009688", slug: "fastapi" },
  { name: "Flask", short: "Flask", color: "#000000", slug: "flask" },
  { name: "Django", short: "Django", color: "#092E20", slug: "django" },
  { name: "PostgreSQL", short: "PG", color: "#4169E1", slug: "postgresql", aliases: ["postgres"] },
  { name: "Redis", short: "Redis", color: "#FF4438", slug: "redis" },
  { name: "GraphQL", short: "GQL", color: "#E10098", slug: "graphql" },
  { name: "Kubernetes", short: "K8s", color: "#326CE5", slug: "kubernetes", aliases: ["k8s"] },
  { name: "AWS", short: "AWS", color: "#FF9900", slug: "amazonwebservices", aliases: ["amazon"] },
  { name: "Pandas", short: "Pandas", color: "#150458", slug: "pandas" },
  { name: "NumPy", short: "NumPy", color: "#013243", slug: "numpy" },
  { name: "scikit-learn", short: "sklearn", color: "#F7931E", slug: "scikitlearn", aliases: ["sklearn", "scikit"] },
  { name: "Jupyter", short: "Jupyter", color: "#F37626", slug: "jupyter" },
  { name: "Three.js", short: "Three", color: "#000000", slug: "threedotjs", aliases: ["three", "threejs"] },
];

const norm = (s: string) => s.toLowerCase().replace(/[.\s_-]/g, "");

const INDEX = new Map<string, Tech>();
for (const t of TECHS) {
  INDEX.set(norm(t.name), t);
  t.aliases?.forEach((a) => INDEX.set(norm(a), t));
}

/** Resolve a stored tech string to its registry entry (or a sensible default). */
export function resolveTech(value: string): Tech {
  const hit = INDEX.get(norm(value));
  if (hit) return hit;
  return { name: value, short: value.slice(0, 6), color: "#5A7A5B", slug: "" };
}

/** Public CDN logo URL for a tech, themed to its brand color. "" if no logo. */
export function techLogoUrl(t: Tech): string {
  if (!t.slug) return "";
  const hex = t.color.replace("#", "");
  return `https://cdn.simpleicons.org/${t.slug}/${hex}`;
}

/** Autocomplete search over names + aliases. */
export function searchTechs(query: string, limit = 8): Tech[] {
  const q = norm(query);
  if (!q) return TECHS.slice(0, limit);
  const starts: Tech[] = [];
  const contains: Tech[] = [];
  for (const t of TECHS) {
    const keys = [t.name, ...(t.aliases ?? [])].map(norm);
    if (keys.some((k) => k.startsWith(q))) starts.push(t);
    else if (keys.some((k) => k.includes(q))) contains.push(t);
  }
  return [...starts, ...contains].slice(0, limit);
}
