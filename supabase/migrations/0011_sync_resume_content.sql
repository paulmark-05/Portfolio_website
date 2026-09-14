-- 0011_sync_resume_content.sql
-- One-time sync of your LIVE Supabase data to match the resume update.
-- The site reads straight from these tables (not from src/lib/content.ts),
-- so this is what actually gets the new content onto the live page.
--
-- Run in the Supabase SQL editor, top to bottom, AFTER 0001-0010.
-- Safe to re-run — experience/skills/projects/certifications are fully
-- replaced each time (delete + insert) so it can't duplicate rows.

-- ---------- profile (single row — update in place) ----------
update public.profiles set
  availability_badge = 'Open to internships & new-grad roles',
  roles = '["Full-Stack Engineer","AI Product Developer","Accessibility Engineer","CS @ KIIT, ''27"]'::jsonb,
  about_md = $md$I'm a Computer Science student at <b>KIIT, Bhubaneswar</b>, and most of what I know I've picked up by building things people actually use, not just coursework. So far that's included a live product feature at <b>Zidio Development</b>, a self-service platform at <b>Knowledge Capsules</b>, and a grievance system now used by 500+ people at the West Bengal Sainik Board.

I haven't specialised in one thing yet, and I'm fine with that. I'd rather be someone who can pick up whatever a team needs. That's meant full-stack web work, some AI integration, and more recently, accessibility testing (WCAG 2.1).

Outside of internships I keep building small things, mostly to understand how they work. I care about writing code someone else can pick up easily, and about software that still holds up once real people are using it.$md$,
  info_cards = '[
    {"icon":"🏫","text":"KIIT · CS ''27","visible":true},
    {"icon":"📍","text":"Kolkata, India","visible":true},
    {"icon":"⭐","text":"9.55 CGPA","visible":true}
  ]'::jsonb,
  commendation = '<b>Letter of Commendation</b>, awarded by the Rajya Sainik Board for technical excellence and impact on public-service transparency.'
where id = (select id from public.profiles limit 1);

-- ---------- settings (single row) ----------
update public.settings set
  seo_desc = 'Computer Science undergraduate & full-stack / AI developer. Building software that gets used, from a government grievance platform to agentic AI, computer vision, and accessibility engineering.',
  seo_keywords = array['full-stack developer','AI engineer','React','LangGraph','computer vision','accessibility','WCAG'],
  contact_heading = 'Got an interesting<br />problem? <em>Send it over.</em>',
  contact_description = 'Open to software engineering internships and new-grad roles, graduating 2027. I move comfortably across full-stack, AI/ML, and accessibility work rather than sticking to one lane.'
where id = 1;

-- ---------- experience (replace all rows) ----------
delete from public.experience;
insert into public.experience (company, role, duration, step_label, description, tags, sort_order) values
('Zidio Development','AI & Full-Stack Development Intern','June 2026 · Remote','Most recent',
 'Designed a composable middleware chain (auth → rate-limit → validation → errors) that cut code by ~70%, modelled the meeting lifecycle as a typed discriminated union (upcoming → live → completed), and shipped real-time video (WebRTC), presence sync (Socket.io), and AI meeting summaries (Gemini) to production.',
 array['TypeScript','Node.js','Gemini API'],0),
('Knowledge Capsules','AI Product Development Intern','May 2026 · Kolkata','',
 'Replaced a manual WhatsApp/form enrolment process with a self-service platform (Razorpay, OTP, waitlist), abstracted Google Drive, Sheets, and Nodemailer behind one dispatch interface, and unified 15 AI tool integrations into a shared prompt-pipeline.',
 array['Node.js','Razorpay','Gemini API'],1),
('West Bengal Sainik Board · Grievance & Visitor Management System','Full-Stack Developer','Jul 2025 to May 2026 · Kolkata','',
 'Built a full-stack grievance portal digitising workflows for 500+ personnel and cutting resolution time 60%, with backend routing and file-handling across 12 branches at 100% accuracy. Added a visitor management system with online appointment booking and an authenticated CMS admin panel, with 100+ registrations in the first 24 hours.',
 array['React','Node.js','MongoDB','Gov-tech'],2),
('The PiSquare Academy · Interactive Semiconductor Simulator','Developer: SemiLattice','Dec 2025 to Present · Bhubaneswar','Recent',
 'Built an interactive platform visualising lattice structures, covalent bonding, doping and charge-carrier motion. Instructors can demonstrate hole formation, excitation and recombination in real time instead of static diagrams.',
 array['JavaScript','Canvas','Simulation','EdTech'],3);

-- ---------- skills (replace all rows) ----------
delete from public.skills;
insert into public.skills (category,name,full_name,color,sort_order) values
('stack','React','React','#61DAFB',0),
('stack','TS','TypeScript','#3178C6',1),
('stack','JS','JavaScript','#F7DF1E',2),
('stack','Python','Python','#3776AB',3),
('stack','Java','Java','#ED8B00',4),
('stack','C++','C++','#00599C',5),
('stack','SQL','SQL','#5A7A5B',6),
('stack','Node','Node.js','#5FA04E',7),
('stack','Mongo','MongoDB','#47A248',8),
('stack','MySQL','MySQL','#4479A1',9),
('stack','Supa','Supabase','#3FCF8E',10),
('stack','Git','Git','#F05032',11),
('stack','Gemini','Gemini API','#8E75B2',12),
('stack','Lang','LangGraph','#1c3d5a',13),
('stack','OpenCV','OpenCV','#5C3EE8',14),
('stack','YOLO','YOLOv8','#00C2A8',15),
('stack','Stream','Streamlit','#FF4B4B',16),
('stack','Pandas','Pandas','#150458',17),
('stack','NumPy','NumPy','#013243',18);

-- ---------- projects (replace all rows) ----------
delete from public.projects;
insert into public.projects (slug,title,description,date_label,featured,active,tech_stack,github_url,live_url,image,sort_order) values
('accessibility-audit','Accessibility Audit: Unity Run 2026 & ZSB VMS',
 'Audited two production web apps for <span class="m">WCAG 2.1 AA</span> compliance with axe-core, identifying 4 violation types across 18 elements. Manually cross-checked automated findings with VoiceOver and NVDA to separate confirmed violations from flags needing human judgment.',
 'Sept 2026', true, true, array['axe-core','WCAG 2.1','VoiceOver','NVDA'],
 '','','',0),
('unity-run-2026','Unity Run 2026: Event Registration Platform',
 'Full-stack registration site for a government-run sports event: multi-step flow, payment capture, and slot-cap enforcement, live in production. Real-time seat counters via Socket.IO with <span class="m">no polling</span>, email OTP verification, and a QR-first fallback after diagnosing a bank-side UPI deep-link restriction.',
 '2026', true, true, array['Node.js','Express','Google Sheets API','Socket.io'],
 '','','',1),
('medbot','MedBot: Agentic AI Healthcare Assistant',
 'Agentic RAG assistant built in LangGraph with a multi-node workflow (retrieval, tool use, self-evaluation), reaching <span class="m">90% task success</span> and <span class="m">0.84 faithfulness / 0.87 relevance</span> on RAGAS. Conversational memory + live web search to cut hallucination.',
 'Apr 2026', true, true, array['Python','LangGraph','ChromaDB','Streamlit','Groq','RAGAS'],
 'https://github.com/nayanipaul/medbot','https://medbot-demo.streamlit.app','/images/medbot.png',2),
('vision-assist','Vision Assistance for the Visually Impaired',
 'Real-time object detection (YOLOv8n) with threaded capture at <span class="m">25 to 30 FPS at 640x480 on CPU-only hardware</span>. Pinhole-geometry distance/direction estimation and a priority-based offline voice-alert engine for nearby hazards.',
 'Mar 2026', false, true, array['Python','YOLOv8','OpenCV','pyttsx3','IP Webcam'],
 'https://github.com/nayanipaul/vision-assist','https://github.com/nayanipaul/vision-assist#demo','/images/vision-assist.png',3),
('nutricoach','NutriCoach: AI Diet Agent',
 'AI agent using <span class="m">Gemini Vision</span> for photo-to-macro conversion, Supabase OTP auth, an AI recipe generator, cheat-meal tracker, and automated weekly PDF progress reports.',
 'Dec 2025', false, true, array['React','Supabase','Gemini API','Nano Banana'],
 'https://github.com/nayanipaul/nutricoach','https://nutricoach-demo.vercel.app','/images/nutricoach.png',4),
('datavizard','DataVizard: AI Analytics Dashboard',
 'Flask backend for secure Gemini integration turning raw datasets into <span class="m">actionable AI insights</span>, with dynamic filtering, an automated cleaning pipeline, and CSV/PDF export.',
 'Jun 2025', false, false, array['Flask','Vanilla JS','Gemini API','Pandas'],
 'https://github.com/nayanipaul/datavizard','https://datavizard-demo.onrender.com','/images/datavizard.png',5);

-- ---------- certifications (replace all rows) ----------
delete from public.certifications;
insert into public.certifications (title,issuer,date_label,description,image,sort_order) values
('Letter of Commendation','Rajya Sainik Board','2025','Awarded for technical excellence and impact on public-service transparency through the West Bengal Sainik Board grievance redressal platform.','/certificates/commendation.png',0),
('Agentic AI: 70-Hour Professional Training','ExcelR · in association with KIIT University','2026','70-hour professional training covering agentic AI system design, tool-use workflows, and evaluation.','',1),
('AI in Action: Job Simulation','Vista Equity Partners · Forage','Apr 2026', e'Completed Vista\'s AI in Action job simulation: modelling AI use-cases, evaluation pipelines, and stakeholder framing.','/certificates/vista-ai.png',2),
('Introduction to Agile and Scrum','Alison','Nov 2025','Foundations of Agile delivery and the Scrum framework: roles, ceremonies, and iterative planning.','',3),
('Prime Code Champ','TechGig.com','Jan 2025', e'Competitive programming recognition on TechGig\'s Prime Code Champ challenge.','',4);

-- ---------- sections (belt-and-suspenders — matches 0010) ----------
update public.settings
set sections = '[
  {"key":"work","visible":true},
  {"key":"stack","visible":true},
  {"key":"achievements","visible":false},
  {"key":"projects","visible":true},
  {"key":"certs","visible":true}
]'::jsonb
where id = 1 and sections is null;
