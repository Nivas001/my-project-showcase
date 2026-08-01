import resumeAsset from "@/assets/resume.pdf.asset.json";

export const site = {
  name: "Srinivas M",
  role: "Python Developer | Full Stack & Flutter Developer",
  shortRole: "Python · Full Stack · Flutter",
  location: "Pondicherry – 605007, India",
  email: "nivassri183@gmail.com",
  phone: "+91 7448724920",
  github: "https://github.com/Nivas001",
  linkedin: "https://www.linkedin.com/in/srinivas-m-734631259",
  // Google Drive share link to the video resume
  videoResumeUrl:
    "https://drive.google.com/file/d/1Je7F4RgD1ZJHG-qXUjjUAcm8ToFKYOLj/view?usp=sharing",
  resumeUrl: resumeAsset.url,
  summary:
    "Motivated MCA graduate (GPA 8.79/10) with hands-on project experience in Python, NLP and full-stack development. I build real-world applications with React.js, Firebase and Flutter, and completed a research-level postgraduate project on Tamil text summarization using NER and deep learning.",
};

export const skills = [
  { group: "Languages", items: ["Python", "Java", "C++", "C#", "PHP", "Dart"] },
  {
    group: "Python / ML",
    items: ["Pandas", "NumPy", "NLTK", "SpaCy", "TensorFlow", "Scikit-learn", "Flask"],
  },
  {
    group: "Web & Mobile",
    items: ["React.js", "Flutter", "HTML", "CSS", "Bootstrap", "Firebase", "REST APIs"],
  },
  { group: "Databases", items: ["MySQL", "Firebase Firestore"] },
  {
    group: "Tools",
    items: ["Git", "GitHub", "Android Studio", "VS Code", "JetBrains IDE", "Jupyter"],
  },
  {
    group: "Concepts",
    items: ["NLP", "NER", "Deep Learning", "Machine Learning", "Abstractive Summarization", "Agile"],
  },
];

export const education = [
  {
    degree: "Master of Computer Application (MCA)",
    school: "Pondicherry University",
    period: "2023 – 2025",
    score: "GPA 8.79/10",
  },
  {
    degree: "Bachelor of Computer Application (BCA)",
    school: "Indira Gandhi College of Arts and Science",
    period: "2020 – 2023",
    score: "GPA 7.7/10",
  },
  {
    degree: "Higher Secondary (12th)",
    school: "Petit Seminaire, Pondicherry",
    period: "2019 – 2020",
    score: "74%",
  },
  {
    degree: "Secondary (10th)",
    school: "Petit Seminaire, Pondicherry",
    period: "2017 – 2018",
    score: "85%",
  },
];

export const certifications = [
  "Python Bootcamp — NPTEL & Udemy, 2025",
  "Ethical Hacking — NPTEL & Udemy, 2025",
  "Web Development — Udemy, 2025",
  "Android Development — Udemy, 2023",
  "Cisco Packet Tracer Networking Workshop — 2022",
];

export const strengths = [
  "Research-level NLP project (Tamil NER + abstractive summarization)",
  "End-to-end mobile and web application development",
  "Fast self-learner: Firebase, NLP frameworks, Flutter",
  "Strong academics: 8.79 GPA in MCA",
];

/** Turn a YouTube or Google Drive share link into an embeddable URL. */
export function toEmbedUrl(url: string): string | null {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes("youtu.be")) {
      return `https://www.youtube.com/embed${parsed.pathname}`;
    }
    if (parsed.hostname.includes("youtube.com")) {
      const id = parsed.searchParams.get("v");
      if (id) return `https://www.youtube.com/embed/${id}`;
      if (parsed.pathname.startsWith("/embed/")) return url;
    }
    if (parsed.hostname.includes("drive.google.com")) {
      const match = parsed.pathname.match(/\/d\/([^/]+)/);
      if (match) return `https://drive.google.com/file/d/${match[1]}/preview`;
    }
    return url;
  } catch {
    return null;
  }
}
