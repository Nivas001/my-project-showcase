/**
 * Projects defined in code rather than in the `projects` table.
 *
 * Every other project is a database row edited from /admin. These four were
 * added straight from their repositories, so they ship with the site and need
 * no database write to appear. They merge into the list by slug
 * (see selectAllProjects): the moment a row with the same slug exists — for
 * example after saving one of these from the admin editor — the row wins and
 * the entry here is ignored.
 *
 * Media for each slug lives in content/project-media.ts.
 */

import type { Project } from "@/lib/projects";

/** Ids of code-defined projects start with this, so the admin can tell them apart. */
export const STATIC_ID_PREFIX = "static-";

const base = {
  doc_url: null,
  doc_path: null,
  slides_url: null,
  slides_path: null,
  video_url: null,
  downloads: [],
  screenshots: [],
  designs: [],
} satisfies Partial<Project>;

export const STATIC_PROJECTS: Project[] = [
  {
    ...base,
    id: `${STATIC_ID_PREFIX}suganniya-construction`,
    slug: "suganniya-construction",
    title: "Suganniya Construction - Builder Website",
    category: "Live",
    period: "Oct 2026",
    role: "Sole Full-Stack Developer & Designer",
    featured: true,
    sort_order: 4,
    live_url: "https://suganniya-construction-nivas01.vercel.app",
    github_url: "https://github.com/Nivas001/suganniya-construction",
    github_visibility: "private",
    summary:
      "A fast, static, multi-page website for a Trichy builder, in a hand-made “Site Work” look: concrete textures, safety-yellow and bold type. It has a cost estimator, a scroll-driven 3D story of a building going up, a two-minute About video made entirely in code, and a Supabase-backed admin for enquiries and content.",
    description: [
      "Suganniya Construction builds houses, apartments and commercial buildings across Tamil Nadu from a head office in Trichy. The website has fourteen plain HTML pages: services, projects with a service-area map, a seven-stage build process, pricing, reviews, building guides, careers and contact. Every icon, floor plan and the map itself is drawn in code (js/art.js), so the site does not depend on stock illustration.",
      "How it works: the pages are static HTML, CSS and vanilla JavaScript, so they load instantly and need no framework. Content (company details, projects, reviews, gallery, accent colour, homepage figures) comes from js/data.js. When Supabase is connected, it comes from the database instead. A build script bundles the Supabase browser client and writes the sitemap, robots.txt and canonical URLs. Vercel serves the folder plus two serverless functions, one for content and one for enquiries.",
      "Enquiries go through a validated, write-only Postgres function with per-phone throttling. The public can submit a request but can never read one back. Row-level security protects customer records, and admin access needs an explicit row in sc_admins, not just a signed-in account. The admin panel lists, searches, filters and exports requests as CSV, with one-tap call or WhatsApp. It also edits business details, the accent colour (with a contrast check), the homepage banner, projects, gallery photos and reviews. Without Supabase on localhost, it runs in a browser-only preview mode.",
      "“Watch a complex go up” (build.html) is a scroll-driven Three.js scene of a G+4 apartment block over 24 months: pen sketch, blueprint, excavation, the frame, a services x-ray, plaster and paint, a section through the furnished flats, then a dusk handover. It is modelled entirely in code, with photo-scanned textures and HDR skies.",
      "The About-page video is generated, not edited. A script.json holds the narration, an HTML composition animates every scene in the site's style, the music and sound effects are synthesised in Python, Indian English neural voices read the voiceover, and build.py renders the MP4, its poster and the chapter list on the page. When the phone number or photos change, it is rebuilt with one command.",
      "Status: the site is a working preview. Projects, figures, team and reviews are sample content, flagged with an on-page notice until the business supplies verified details.",
    ].join("\n\n"),
    highlights: [
      "14 static pages that load instantly: no framework, no hydration, no layout shift",
      "Cost estimator with Basic / Standard / Premium packages and a stage-wise payment schedule",
      "Scroll-driven 3D build story in Three.js: sketch → blueprint → foundation → frame → interiors → dusk handover",
      "Two-minute About video built from code: narration script, animated composition, synthesised sound, neural voiceover",
      "Admin panel: enquiries with search, status, CSV export and call/WhatsApp, plus content, colour and banner editing",
      "Write-only enquiry RPC with per-phone throttling; row-level security on every table",
      "Projects map of central Tamil Nadu and per-project pages with floor plan, timeline and quality record",
      "Browser QA script checks all 14 pages at desktop and mobile widths, including backend failure paths",
    ],
    tech: [
      "HTML",
      "CSS",
      "JavaScript",
      "Three.js",
      "esbuild",
      "Supabase",
      "PostgreSQL",
      "Row-level security",
      "Vercel Functions",
      "Python",
      "ffmpeg",
      "Playwright",
    ],
    decisions: [
      {
        problem:
          "A builder's site is read on mid-range phones over mobile data, mostly by people deciding whether to call.",
        options: ["React / Next.js app", "WordPress theme"],
        chose: "Static multi-page HTML with vanilla JavaScript",
        because:
          "Every page is just a file, so first paint is immediate, hosting is free and nothing breaks when a dependency updates. Shared header, footer and cards come from one small site.js.",
        cost: "No component system, so shared markup is generated by script, and the 3D page needs its own esbuild bundle.",
      },
      {
        problem:
          "Explaining how a building goes up in stages, without filming a real site that does not exist yet.",
        options: ["Pre-rendered video", "Static stage photos"],
        chose: "A Three.js scene modelled in code and scrubbed by scroll",
        because:
          "The visitor controls the pace, every stage is the same building, and the camera can cut a section through the finished flats, which no photo can do.",
        cost: "Heavy on low-end GPUs. Assets need care (compressed textures, glTF props), and the page ships a separate bundle.",
      },
      {
        problem: "Public enquiry forms must write customer data without ever exposing it.",
        options: ["Direct insert into the table from the browser", "Third-party form service"],
        chose: "A validated, write-only Postgres RPC behind RLS",
        because:
          "The browser can call exactly one function that checks the input and throttles per phone number. It has no read path at all, so a leaked key reveals nothing.",
        cost: "CAPTCHA and broader abuse limits are still needed before running paid advertising.",
      },
      {
        problem:
          "The About video has to change whenever the phone number, address or photos change.",
        options: ["Edit it by hand in a video editor"],
        chose:
          "Generate it from code: script → composition → synthesised sound → neural voice → ffmpeg",
        because:
          "One command rebuilds it. The voiceover never reads the phone number aloud, so new details need no new recordings, and cached voice clips keep rebuilds to about six minutes.",
        cost: "A Python, ffmpeg and Playwright toolchain just to make one video.",
      },
    ],
  },
  {
    ...base,
    id: `${STATIC_ID_PREFIX}jobtrail`,
    slug: "jobtrail",
    title: "Jobtrail - AI Job Application Tracker",
    category: "Web",
    period: "Oct 2026 — ongoing",
    role: "Solo developer",
    featured: false,
    sort_order: 5,
    live_url: null,
    github_url: "https://github.com/Nivas001/jobtrail",
    github_visibility: "public",
    summary:
      "A job application tracker that tells you which resume to send, writes the cover letter, preps you for the interview and fills in the application form, all with AI that runs through a helper on your own computer instead of a paid API key.",
    description: [
      "Job hunting with several versions of a resume gets messy fast: which one went to whom, which one fits this posting, what it is missing, and whether you ever followed up. Jobtrail keeps every application on one drag-and-drop board (Wishlist → Applied → Interview → Offer → Rejected), logs every move to the application's timeline, and answers those questions with AI.",
      "How it works: the app is Next.js 16 with React 19 and Server Actions, backed by Appwrite for GitHub sign-in, tables and a private resume bucket. Every row and file has owner-only permissions, and sign-in is limited to an allowlist. Resumes are uploaded as PDFs, and their text is extracted with unpdf so the AI can read them.",
      "The AI is not a hosted API. A small Node helper (helper/server.mjs) runs on your computer on 127.0.0.1:4777. The browser calls it directly, and it turns each request into an Antigravity CLI call with a JSON schema (agy --print --output-format json --json-schema …), so every answer comes back as validated JSON. Each call runs in an empty temporary workspace with tools disabled. The helper answers only allowlisted origins and refuses to fetch local-network URLs. Because the hosted site talks to localhost, it sends Chrome's Private Network Access header, and the browser asks once for permission.",
      "From one job link or pasted posting, it extracts company, role, location, work mode and salary. It then compares all your resumes against the posting, picks the best one, scores the fit from 0 to 100, lists matched and missing keywords, and suggests concrete edits. It can also draft a cover letter in the tone you choose, an interview prep sheet (likely technical and behavioural questions with tips tied to your real projects, plus questions to ask them), and follow-up or thank-you emails.",
      "Auto-fill opens the company's Greenhouse, Lever or Ashby form in its own Chromium window using playwright-core. It attaches the best-matching resume, waits until the site has really accepted the upload, fills standard fields from your profile, and sends the remaining questions to the AI, which answers only from your profile and resume. It leaves blank what it cannot honestly answer, plus legal agreements, declines demographic questions and never ticks marketing opt-ins. It never clicks Submit. You review and send, and the card moves to Applied when the confirmation page appears.",
      "The dashboard shows active applications, response rate, interviews, offers, a weekly chart, the pipeline breakdown, follow-ups due and applications that have gone quiet. A notification bell surfaces interviews in the next three days and overdue follow-ups. Interviews export as calendar invites (.ics), and the whole pipeline exports as a CSV with spreadsheet-formula injection neutralised. When the helper is unreachable (on a phone, say), the AI buttons disable and everything else keeps working.",
    ].join("\n\n"),
    highlights: [
      "Drag-and-drop pipeline board with a per-application activity timeline",
      "Paste a job link → AI fills company, role, location, work mode and salary",
      "Resume match: compares every resume, picks the best, 0–100 fit score, missing keywords, suggested edits",
      "AI cover letters, interview prep sheets, and follow-up / thank-you emails grounded in your real resume",
      "Greenhouse / Lever / Ashby auto-fill in a separate Chromium window that stops before Submit",
      "Local AI helper: Antigravity CLI with JSON-schema output, tools disabled, origin allowlist, no API key",
      "Dashboard with response rate, weekly chart, follow-ups due, gone-quiet applications and a notification bell",
      "Interview .ics invites, CSV export, resume versions; GitHub sign-in with owner-only permissions",
    ],
    tech: [
      "Next.js 16",
      "React 19",
      "TypeScript",
      "Tailwind CSS 4",
      "shadcn/ui",
      "dnd-kit",
      "Recharts",
      "Appwrite",
      "unpdf",
      "playwright-core",
      "Node.js",
      "Antigravity CLI",
      "Zod",
      "Vercel",
    ],
    decisions: [
      {
        problem: "AI features normally mean a paid API key, and resumes are personal data.",
        options: ["Call a hosted LLM API from the server", "Ship a key to the browser"],
        chose: "A localhost helper that drives the Antigravity CLI already signed in on my machine",
        because:
          "There is no key to leak or pay for, resume text goes only to the model I already use, and JSON-schema output makes every answer machine-checkable.",
        cost: "AI works only on a computer running the helper. The hosted site needs Private Network Access permission, and the AI buttons are disabled on a phone.",
      },
      {
        problem: "Auto-filling job applications can easily submit something wrong in your name.",
        options: ["Full auto-apply", "Browser extension"],
        chose: "Fill the form in a separate Chromium profile, then stop before Submit",
        because:
          "The AI answers only from the profile and resume, leaves blank anything it cannot honestly answer, and the human always makes the final click. Jobtrail detects the confirmation page itself.",
        cost: "Only Greenhouse, Lever and Ashby are supported properly. LinkedIn Easy Apply, Indeed and Naukri are left out because their terms forbid automation.",
      },
      {
        problem:
          "The database lives in Appwrite's Singapore region, but Vercel runs functions in the US by default.",
        options: ["Default US region"],
        chose: "Pin Vercel functions to Singapore (sin1), next to the Appwrite region",
        because:
          "Server Actions make several database calls per interaction. Putting compute beside the data removes a cross-ocean hop from every one of them.",
        cost: "Cold starts are slower for visitors far from Asia.",
      },
    ],
  },
  {
    ...base,
    id: `${STATIC_ID_PREFIX}miss-minutes`,
    slug: "miss-minutes",
    title: "Miss Minutes - Desktop Voice Assistant",
    category: "Desktop",
    period: "Oct 2026 — ongoing",
    role: "Solo developer",
    featured: true,
    sort_order: 5,
    live_url: null,
    github_url: null,
    github_visibility: "none",
    summary:
      "A voice assistant for my KDE Plasma desktop, living as an animated cartoon clock. Say “Hey Minutes” and she listens, works out what you meant through three tiers of brains (instant rules, a local GPU model, then a cloud model), does it, and answers out loud. Wake word, speech-to-text and voice all run locally.",
    description: [
      "Miss Minutes is a personal assistant that lives on my Linux desktop as a widget and a floating Meta+M overlay. She is a hand-built QML character, a flat orange clock with lashed eyes, rubber-hose arms and white gloves, rendered as a glowing hologram. She has eight moods (idle, listening, thinking, speaking, acting, confirming, sad and sleeping), each with its own pose. Her mouth follows her voice level, her hour ticks light up as a mic meter while she listens and chase around while she thinks, she hops through a ripple of “time-door” rings when she does something, and she does a little hop at the top of every hour.",
      "How a request flows: Vosk listens continuously for “Hey Minutes” with a tiny grammar. Silero VAD records the command, picking up audio spoken while the models were still loading, and faster-whisper transcribes it on the GPU. The text then goes through three routing tiers. First is a 700-line regex router with speech clean-up and compound-command planning, which handles time, timers, volume and apps instantly. Unmatched requests go to “minutes-brain”, Qwen3-1.7B on Ollama with a generated prompt and a strict JSON schema, which either picks skills, makes small talk, or hands off. Anything that needs knowledge goes to Gemini through the Antigravity CLI in a warm session, with web snippets when needed. The reply is spoken by Kokoro TTS while the UI updates over a local WebSocket.",
      "She can do around fifty things: open and close apps, play songs, artists and playlists on Spotify, set reminders that survive restarts, run focus sessions with Do Not Disturb, check battery and system load, toggle Wi-Fi and Bluetooth, take screenshots, and keep the screen awake. As a developer assistant she can open projects in VS Code, start dev servers, run tests, builds and lint, show git status, write a stand-up summary, draft commit messages, and report pull requests, CI and Vercel deploys. She can also explain, review or translate the clipboard.",
      "She remembers. Personal facts, people, important dates, likes and plans you mention are kept in a local JSON memory, and she follows up on them: how did the interview go, a birthday reminder, a break nudge after 90 minutes of non-stop work, a check-in the day after a rough one. All of this respects mute, focus and quiet hours.",
      "Safety is built in, not bolted on. Shell commands proposed by the cloud model are shown and need explicit approval; a conservative parser lets negative or ambiguous wording win (“okay, don't run it” never runs it). Every turn carries its own cancellation token, so a late cloud reply can't fire actions after you've interrupted. Local-only mode blocks every cloud path, including clipboard AI and commit-message drafting.",
      "Engineering: a Python daemon (PySide6) runs as a systemd user service, exposes a D-Bus API (org.minutes.Assistant) and a CLI (minutes ask / say / listen), and keeps speech models in a child process that unloads after inactivity. A KWin script binds Meta+M. Ollama starts on demand and is stopped when idle, and the GPU guard skips the local model when memory is tight. 281 tests cover routing, the local brain, memory, safety, wake timing and latency budgets. Measured on my machine, deterministic answers take about 0.01 s and warm cloud answers about 4 s.",
    ].join("\n\n"),
    highlights: [
      "Hand-built animated QML character with 8 moods, lip-sync to voice level, blinking, glances and hologram effects",
      "Fully local speech: Vosk wake word, Silero VAD, faster-whisper on CUDA, Kokoro neural voice",
      "Three-tier brain: instant regex router → Qwen3-1.7B on Ollama (JSON schema) → Gemini via Antigravity",
      "About 50 skills: apps, Spotify, reminders, focus mode, Wi-Fi/Bluetooth, screenshots, weather, screen time",
      "Developer skills: open projects, dev servers, tests/builds, git status, stand-ups, commit messages, PRs, CI and deploys",
      "Personal memory with caring follow-ups: birthdays, plans, break nudges, quiet hours",
      "Safety: approval for shell commands, per-turn cancellation, a local-only mode that blocks every cloud path",
      "systemd service + D-Bus API + CLI + KWin Meta+M hotkey + Plasma widget; 281 passing tests",
    ],
    tech: [
      "Python",
      "PySide6",
      "Qt Quick / QML",
      "KDE Plasma",
      "KWin scripting",
      "D-Bus",
      "WebSockets",
      "Vosk",
      "Silero VAD",
      "faster-whisper",
      "Kokoro TTS",
      "Ollama",
      "Qwen3-1.7B",
      "Gemini (Antigravity CLI)",
      "systemd",
      "PipeWire",
      "pytest",
    ],
    decisions: [
      {
        problem:
          "Most requests (“what's the time”, “volume up”) need an instant answer, but some need real knowledge.",
        options: ["Send everything to one cloud model", "Run one large local model for everything"],
        chose:
          "Three tiers: deterministic rules → a 1.7B local model on the GPU → a cloud model, each handing off only what it can't do",
        because:
          "The rules answer in about 10 ms with zero hallucination risk. The small model handles loose phrasing (“crank the tunes up a bit”) in well under a second, and the cloud is used only when it adds value. Both brains read their skill list from one source, so they always agree on what she can do.",
        cost: "Three places a request can be misrouted, so an evaluation set (model/cases.jsonl), separate from the prompt's own examples, is needed to keep the local model honest.",
      },
      {
        problem:
          "The wake word fired, but the assistant still seemed deaf: a short Whisper re-check of the wake phrase kept rejecting it as “HEMNIT” or “a minute”.",
        options: ["Add more spelling aliases", "Raise the Vosk confidence bar"],
        chose:
          "Trust Vosk's acoustic word-end timing, start recording immediately, and give Whisper the whole command instead",
        because:
          "Whisper is good at sentences and bad at spelling a made-up name from half a second of audio. Keeping the audio spoken while models load means nothing is lost.",
        cost: "The lightweight recogniser now gets continuous idle audio, about 3% of one CPU core.",
      },
      {
        problem:
          "A cloud model that can propose shell commands is dangerous if “okay, don't run it” sounds like a yes.",
        options: ["Match YES before NO", "Auto-run “safe-looking” commands"],
        chose: "A conservative confirmation parser where any negative or ambiguous wording rejects",
        because:
          "Executing is the irreversible side, so only an explicit, unambiguous yes approves, and the WebSocket API requires a JSON boolean true.",
        cost: "She sometimes asks twice when you meant yes.",
      },
      {
        problem: "Cold cloud answers sometimes took 40–55 seconds, or never arrived.",
        options: ["Always use the strongest model", "Keep every model loaded all the time"],
        chose:
          "A faster model for ordinary questions, a 30-minute warm session, and a 25-second budget shared across retries, fallbacks and web lookups",
        because:
          "Measured on my machine: 16 s from a cold start, about 4 s once warm. When the budget runs out she says so out loud instead of hanging, and “think harder about …” still reaches the deep model.",
        cost: "The warm session holds memory between questions, and very long answers need an explicit request.",
      },
    ],
  },
  {
    ...base,
    id: `${STATIC_ID_PREFIX}jlab-buds-linux`,
    slug: "jlab-buds-linux",
    title: "JLab Buds for Linux - Reverse-Engineered Headphone Control",
    category: "Desktop",
    period: "Oct 2026",
    role: "Solo — reverse engineering & app",
    featured: false,
    sort_order: 5,
    live_url: null,
    github_url: null,
    github_visibility: "none",
    summary:
      "My JLab JBuds Lux ANC headphones could only be controlled from a phone app. I decompiled the Android app, recovered the JieLi RCSP protocol and its native authentication, reimplemented both in Python, and built a native KDE app, a CLI, a background service and global shortcuts for noise cancelling, EQ and every other setting.",
    description: [
      "The JBuds Lux ANC's noise cancelling, EQ, volume limit, Clear Voice and touch controls are only exposed through JLab's Android app. On a Linux laptop the earbuds play audio fine, but none of those settings can be reached. This project closes that gap without touching the audio path.",
      "Finding the protocol: I pulled the APK and decompiled it with JADX. The model maps to device pid 17 on a JieLi chip, which means the app speaks JieLi's RCSP protocol over classic Bluetooth SPP, not BLE. I traced the frame format through ParseHelper (FE DC BA | flags | opcode | length | body | EF), the system-info attributes (battery, EQ, noise mode) and JLab's own custom opcode (0xFF), and checked everything against bytes captured from the phone's Bluetooth logs and from the real headphones.",
      "Breaking the handshake: the earbuds refuse commands until a challenge-response authentication succeeds, and that lives in native code (libjl_bluetooth.so). I loaded the ARM64 library into the Unicorn CPU emulator and called its E1 function directly, which identified it as Bluetooth's standard E1 (SAFER+) with a fixed key and address stored in the library's .data section. I then reimplemented SAFER+ in pure Python (auth.py) and verified it matches the native code 20 out of 20 times, and against live challenges from the device.",
      "The app: BlueZ opens the RFCOMM socket. A Profile1 client is registered for the SPP UUID and Device1.ConnectProfile is called, so A2DP/HFP audio is never interrupted. A background service (jlab-budsd, a D-Bus-activated systemd user unit) owns the connection, reconnects with backoff, polls battery, and publishes its state over D-Bus. The PySide6 + Kirigami app has a live battery ring, Noise Cancelling / Be Aware / Off, a draggable 10-band EQ graph with presets and saved profiles, volume limit, Clear Voice, spatial audio, touch controls, voice prompts and which modes the ANC button cycles through. A jlab-buds CLI does the same from the terminal, and Meta+Alt+N / E / B cycle noise mode, cycle EQ or show battery with an on-screen display.",
      "I kept a strict list of what is never sent: OTA firmware opcodes, reboot, factory reset and JLab's “clear pair record”. Everything in PROTOCOL.md is documented from the decompiled source and confirmed against the real device.",
    ].join("\n\n"),
    highlights: [
      "Decompiled the JLab Android app (JADX) and mapped the JieLi RCSP protocol: framing, opcodes, attributes",
      "Emulated the native ARM64 auth library in Unicorn to identify Bluetooth E1 / SAFER+ with JieLi's fixed key",
      "Pure-Python SAFER+ authentication that matches the native library 20/20 and the live device",
      "BlueZ Profile1 SPP transport that never interrupts A2DP / HFP audio",
      "Native KDE app: battery ring, ANC modes, draggable 10-band EQ, saved profiles, every hidden setting",
      "D-Bus-activated systemd service with reconnect backoff, low-battery notifications and live state",
      "CLI (jlab-buds anc|eq|set|profile) and global shortcuts with on-screen display",
      "Written protocol spec (PROTOCOL.md) with a do-not-send list for firmware, reset and pairing opcodes",
    ],
    tech: [
      "Python",
      "Reverse engineering",
      "JADX",
      "Unicorn Engine",
      "ARM64",
      "pyelftools",
      "Bluetooth SPP / RFCOMM",
      "BlueZ",
      "D-Bus",
      "PySide6",
      "Kirigami / QML",
      "systemd",
      "KDE Plasma",
    ],
    decisions: [
      {
        problem: "The authentication algorithm lived only in a stripped native ARM64 library.",
        options: [
          "Disassemble and port it instruction by instruction",
          "Replay a captured handshake",
        ],
        chose:
          "Run the library's own E1 function in the Unicorn emulator and treat it as an oracle",
        because:
          "Feeding it chosen inputs showed it was standard Bluetooth E1 (SAFER+) with a fixed key. That made a clean Python reimplementation possible, testable against the oracle and against live device challenges. Replays fail because the challenge is random every time.",
        cost: "Malloc, free and the stack guard had to be stubbed by hand so the emulated code could run outside Android.",
      },
      {
        problem:
          "Opening a control channel to Bluetooth headphones can knock out the audio stream.",
        options: ["Open a raw RFCOMM socket on a guessed channel"],
        chose:
          "Register a BlueZ Profile1 client for the SPP UUID and let BlueZ hand over the socket",
        because:
          "BlueZ does the SDP lookup and manages the channel alongside A2DP/HFP, so music keeps playing while settings change.",
        cost: "It needs a GLib main loop thread for dbus-python next to the Qt event loop.",
      },
      {
        problem:
          "The GUI, the CLI and the keyboard shortcuts all need the headphones at the same time.",
        options: ["Each client opens its own Bluetooth connection"],
        chose: "One D-Bus-activated service owns the link; every client talks D-Bus",
        because:
          "The headphones accept a single control channel. A service serialises commands, keeps state in one place, and starts on demand when any client calls it.",
        cost: "One more moving part to install: a systemd unit and a D-Bus activation file.",
      },
    ],
  },
];

/**
 * “How it works” — the request path through each system, step by step.
 * Rendered as a numbered flow on the project page. Miss Minutes has its own,
 * richer version (components/projects/miss-minutes).
 */
export type FlowStep = { title: string; detail: string; tech: string };

export const PROJECT_FLOWS: Record<string, FlowStep[]> = {
  "suganniya-construction": [
    {
      title: "Content",
      detail:
        "Company details, projects, reviews and gallery live in js/data.js, or in Supabase once it is connected.",
      tech: "js/data.js · Supabase",
    },
    {
      title: "Build",
      detail:
        "npm run build bundles the 3D story and the Supabase client, then writes the sitemap, robots.txt and canonical URLs.",
      tech: "esbuild · scripts/build.js",
    },
    {
      title: "Serve",
      detail:
        "Vercel serves fourteen static pages straight from public/. Nothing renders on the server.",
      tech: "Vercel static",
    },
    {
      title: "Enquire",
      detail:
        "Forms post to a serverless function that calls a write-only, throttled Postgres RPC. The public can never read requests back.",
      tech: "api/enquiry.js · RLS",
    },
    {
      title: "Manage",
      detail:
        "The owner signs in at /admin.html to handle requests and edit content, colours and photos. RLS checks sc_admins on every write.",
      tech: "Supabase Auth · Storage",
    },
  ],
  jobtrail: [
    {
      title: "Capture",
      detail:
        "Paste a job link or the posting text. The helper fetches the page and AI extracts the role details into a new card.",
      tech: "Server Actions · helper",
    },
    {
      title: "Store",
      detail:
        "Applications, timelines and notifications go into Appwrite tables, and resumes into a private bucket. Every row is owner-only.",
      tech: "Appwrite TablesDB · Storage",
    },
    {
      title: "Ask the AI",
      detail:
        "The browser calls the helper on 127.0.0.1:4777, which runs agy --json-schema in an empty workspace and returns validated JSON.",
      tech: "Node helper · Antigravity CLI",
    },
    {
      title: "Match & write",
      detail:
        "It picks the best resume with a fit score and missing keywords, then drafts the cover letter, interview prep and follow-up emails.",
      tech: "unpdf · JSON schema",
    },
    {
      title: "Apply",
      detail:
        "Playwright opens the Greenhouse, Lever or Ashby form, attaches the resume and fills it, then stops. You press Submit and the card moves to Applied.",
      tech: "playwright-core · Chromium",
    },
  ],
  "jlab-buds-linux": [
    {
      title: "Decompile",
      detail:
        "JADX on the JLab Android app identified a JieLi chip speaking RCSP over classic Bluetooth SPP.",
      tech: "JADX · APK",
    },
    {
      title: "Emulate",
      detail:
        "The native auth library ran in Unicorn, which revealed Bluetooth E1 / SAFER+ with a fixed key.",
      tech: "Unicorn · ARM64",
    },
    {
      title: "Reimplement",
      detail:
        "Pure-Python SAFER+ handshake and RCSP framing, tested against the emulator and live device bytes.",
      tech: "auth.py · rcsp.py",
    },
    {
      title: "Connect",
      detail:
        "A BlueZ Profile1 client for the SPP UUID hands over the RFCOMM socket without interrupting audio.",
      tech: "BlueZ · D-Bus",
    },
    {
      title: "Control",
      detail:
        "A D-Bus service owns the link. The KDE app, the CLI and the global shortcuts all talk to it.",
      tech: "systemd · PySide6 · Kirigami",
    },
  ],
};
