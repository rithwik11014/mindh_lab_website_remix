import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { requireAdminAuth, extractToken, getSession } from "./server/auth";
import { registerAdminAndConfigRoutes } from "./server/routes";

interface NewsItem {
  id: string;
  title: string;
  description: string;
  summary?: string;
  image: string;
  date: string; // ISO date YYYY-MM-DD or formatted date
  category: string;
  linkText?: string;
  linkUrl?: string;
  createdAt: string;
  updatedAt?: string;
  published?: boolean;
  orderIndex?: number;
}

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "15mb" }));
app.use("/uploads", express.static(path.join(process.cwd(), "public", "uploads")));

// File storage path for news, team, collaborators, publications, facilities, and contact inquiries
const DATA_DIR = path.join(process.cwd(), "data");
const NEWS_FILE = path.join(DATA_DIR, "news.json");
const TEAM_FILE = path.join(DATA_DIR, "team.json");
const COLLABORATORS_FILE = path.join(DATA_DIR, "collaborators.json");
const PUBLICATIONS_FILE = path.join(DATA_DIR, "publications.json");
const FACILITIES_FILE = path.join(DATA_DIR, "facilities.json");
const INQUIRIES_FILE = path.join(DATA_DIR, "inquiries.json");

const INITIAL_NEWS: NewsItem[] = [
  {
    id: "news-1",
    title: "Paper on Contactless rPPG Accepted to Nature Digital Medicine",
    description: "Our prospective clinical trial evaluating video-based vital sign extraction across 120 ICU beds has been accepted for publication. Demonstrating sub-1.5 BPM mean absolute error without physical skin contact under varied ambient hospital lighting conditions.",
    summary: "Our clinical trial evaluating video-based vital sign extraction in 120 ICU beds has been accepted for publication.",
    image: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&q=80&w=800",
    date: "2024-08-15",
    category: "Paper Accepted",
    linkText: "Read Publication Details",
    linkUrl: "#publications",
    createdAt: "2024-08-15T08:00:00.000Z",
  },
  {
    id: "news-2",
    title: "Translational Clinical Pilot Launched with Regional Medical Center",
    description: "Commenced prospective hospital deployment of our edge-AI hemodynamic warning system across surgical step-down wards, processing real-time bedside telemetry streams with sub-16ms latency.",
    summary: "Commenced prospective hospital deployment of our edge-AI hemodynamic warning system across surgical step-down wards.",
    image: "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=800",
    date: "2024-06-20",
    category: "Clinical Pilot",
    linkText: "Explore Clinical Pilot",
    linkUrl: "#research",
    createdAt: "2024-06-20T10:30:00.000Z",
  },
  {
    id: "news-3",
    title: "NIH R01 Grant Awarded for Continuous Cuffless Blood Pressure Research",
    description: "A 4-year multi-center investigation into multimodal optical and bioimpedance sensor fusion for ambulatory cardiovascular assessment and non-invasive continuous arterial blood pressure monitoring.",
    summary: "A 4-year multi-center investigation into multimodal optical and bioimpedance sensor fusion for ambulatory cardiovascular assessment.",
    image: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&q=80&w=800",
    date: "2024-04-10",
    category: "Grant Award",
    linkText: "Inquire Collaboration",
    linkUrl: "#contact",
    createdAt: "2024-04-10T14:15:00.000Z",
  },
  {
    id: "news-4",
    title: "Keynote at IEEE EMBC: Computational Foundations of Bedside Physiology",
    description: "Prof. David Patel presented our laboratory's benchmark findings on self-supervised foundation models trained on continuous multi-lead ECG and photoplethysmography streams.",
    summary: "Keynote presentation at IEEE Engineering in Medicine and Biology Society on wearable physiological monitoring.",
    image: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&q=80&w=800",
    date: "2024-02-28",
    category: "Keynote",
    linkText: "View Conference Program",
    linkUrl: "https://www.linkedin.com/company/medical-informatics-and-digital-health-lab/",
    createdAt: "2024-02-28T09:00:00.000Z",
  },
];

// Helper to ensure data directory and file exist
function getNewsData(): NewsItem[] {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(NEWS_FILE)) {
      fs.writeFileSync(NEWS_FILE, JSON.stringify(INITIAL_NEWS, null, 2), "utf-8");
      return INITIAL_NEWS;
    }
    const raw = fs.readFileSync(NEWS_FILE, "utf-8");
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    return INITIAL_NEWS;
  } catch (err) {
    console.error("Error reading news data file, falling back to initial data:", err);
    return INITIAL_NEWS;
  }
}

function saveNewsData(items: NewsItem[]) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(NEWS_FILE, JSON.stringify(items, null, 2), "utf-8");
  } catch (err) {
    console.error("Error saving news data file:", err);
  }
}

// Reverse chronological sort helper:
// Newest publication date first; if equal date, newest createdAt first.
function sortNewsReverseChronological(items: NewsItem[]): NewsItem[] {
  return [...items].sort((a, b) => {
    const timeA = new Date(a.date).getTime();
    const timeB = new Date(b.date).getTime();
    if (!isNaN(timeA) && !isNaN(timeB) && timeB !== timeA) {
      return timeB - timeA;
    }
    const createdA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const createdB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return createdB - createdA;
  });
}

// ----------------------------------------------------
// API ROUTES
// ----------------------------------------------------

// GET /api/health
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", service: "MINDH Lab Backend API", timestamp: new Date().toISOString() });
});

// Register private admin and configuration endpoints
registerAdminAndConfigRoutes(app);

// GET /api/news: List all news sorted in reverse chronological order
app.get("/api/news", (req, res) => {
  try {
    const token = extractToken(req);
    const session = getSession(token || undefined);
    const isAdmin = !!session;

    let items = getNewsData();
    if (!isAdmin) {
      items = items.filter((it: any) => it.published !== false);
    }
    const sorted = sortNewsReverseChronological(items);
    res.json({ success: true, count: sorted.length, news: sorted });
  } catch (err: any) {
    res.status(500).json({ success: false, message: "Failed to retrieve news items", error: err?.message });
  }
});

// POST /api/news: Admin add new news post
app.post("/api/news", requireAdminAuth, (req, res) => {
  try {
    const { title, description, summary, image, date, category, linkText, linkUrl, published } = req.body;

    if (!title || typeof title !== "string" || !title.trim()) {
      return res.status(400).json({ success: false, message: "Title is required." });
    }
    if (!description || typeof description !== "string" || !description.trim()) {
      return res.status(400).json({ success: false, message: "Description is required." });
    }

    const items = getNewsData();
    const nowIso = new Date().toISOString();
    const newId = `news-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    const newItem: NewsItem = {
      id: newId,
      title: title.trim(),
      description: description.trim(),
      summary: summary?.trim() || description.trim().substring(0, 160) + "...",
      image: image?.trim() || "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&q=80&w=800",
      date: date?.trim() || nowIso.split("T")[0],
      category: category?.trim() || "Lab Update",
      linkText: linkText?.trim() || (linkUrl ? "Read More" : undefined),
      linkUrl: linkUrl?.trim() || undefined,
      published: published !== false,
      createdAt: nowIso,
    };

    // Add to items
    items.push(newItem);
    saveNewsData(items);

    const sorted = sortNewsReverseChronological(items);
    return res.status(201).json({
      success: true,
      message: "News post published successfully. Placed in reverse chronological order.",
      item: newItem,
      news: sorted,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: "Failed to create news post", error: err?.message });
  }
});

// PUT /api/news/:id: Admin edit existing news post
app.put("/api/news/:id", requireAdminAuth, (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, summary, image, date, category, linkText, linkUrl, published } = req.body;

    const items = getNewsData();
    const index = items.findIndex((item) => item.id === id);

    if (index === -1) {
      return res.status(404).json({ success: false, message: `News post with id "${id}" not found.` });
    }

    const existing = items[index];
    const updatedItem: NewsItem = {
      ...existing,
      title: title !== undefined ? String(title).trim() : existing.title,
      description: description !== undefined ? String(description).trim() : existing.description,
      summary: summary !== undefined ? String(summary).trim() : existing.summary,
      image: image !== undefined ? String(image).trim() : existing.image,
      date: date !== undefined ? String(date).trim() : existing.date,
      category: category !== undefined ? String(category).trim() : existing.category,
      linkText: linkText !== undefined ? String(linkText).trim() : existing.linkText,
      linkUrl: linkUrl !== undefined ? String(linkUrl).trim() : existing.linkUrl,
      published: published !== undefined ? Boolean(published) : existing.published,
      updatedAt: new Date().toISOString(),
    };

    items[index] = updatedItem;
    saveNewsData(items);

    const sorted = sortNewsReverseChronological(items);
    return res.json({
      success: true,
      message: "News post updated successfully.",
      item: updatedItem,
      news: sorted,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: "Failed to update news post", error: err?.message });
  }
});

// DELETE /api/news/:id: Admin delete news post
app.delete("/api/news/:id", requireAdminAuth, (req, res) => {
  try {
    const { id } = req.params;
    let items = getNewsData();
    const initialLen = items.length;
    items = items.filter((item) => item.id !== id);

    if (items.length === initialLen) {
      return res.status(404).json({ success: false, message: `News post with id "${id}" not found.` });
    }

    saveNewsData(items);
    const sorted = sortNewsReverseChronological(items);
    return res.json({
      success: true,
      message: "News post deleted successfully.",
      deletedId: id,
      news: sorted,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: "Failed to delete news post", error: err?.message });
  }
});

// PUT /api/news-reorder: Admin reorder news
app.put("/api/news-reorder", requireAdminAuth, (req, res) => {
  try {
    const { orderIds } = req.body;
    if (!Array.isArray(orderIds)) {
      return res.status(400).json({ success: false, message: "orderIds array required" });
    }
    const items = getNewsData();
    const idMap = new Map<string, number>();
    orderIds.forEach((id, idx) => idMap.set(id, idx));

    items.forEach((it) => {
      if (idMap.has(it.id)) {
        it.orderIndex = idMap.get(it.id);
      }
    });
    items.sort((a, b) => (a.orderIndex ?? 999) - (b.orderIndex ?? 999));
    saveNewsData(items);

    return res.json({ success: true, message: "News items reordered successfully.", news: items });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: "Failed to reorder news", error: err?.message });
  }
});

// POST /api/news/reset: Reset to initial news seed
app.post("/api/news/reset", requireAdminAuth, (_req, res) => {
  try {
    saveNewsData(INITIAL_NEWS);
    const sorted = sortNewsReverseChronological(INITIAL_NEWS);
    return res.json({
      success: true,
      message: "News posts reset to default lab announcements.",
      news: sorted,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: "Failed to reset news posts", error: err?.message });
  }
});

// ----------------------------------------------------
// TEAM MANAGEMENT BACKEND API & PERSISTENCE
// ----------------------------------------------------

interface TeamMemberServer {
  id: string;
  name: string;
  role: string;
  category: 'Faculty' | 'Researchers' | 'PhD Scholars' | 'Students' | 'Alumni' | 'Collaborators';
  credentials: string;
  bio: string;
  detailedBio?: string;
  labRoleDetail?: string;
  focus: string[];
  skills?: string[];
  contributions?: string[];
  projects?: Array<{ id?: string; title: string; status: string; description?: string; link?: string }>;
  publications?: Array<{ id?: string; title: string; year: number | string; journalOrConference: string; link?: string; doi?: string }>;
  awards?: Array<{ id?: string; title: string; year?: string | number; organization?: string }>;
  avatarUrl: string;
  email?: string;
  scholarUrl?: string;
  orcidUrl?: string;
  researchGateUrl?: string;
  websiteUrl?: string;
  linkedinUrl?: string;
  twitterUrl?: string;
  instagramUrl?: string;
  showEmail?: boolean;
  showSocialLinks?: boolean;
  showPublications?: boolean;
  showProjects?: boolean;
  isPublic?: boolean;
  orderIndex?: number;
}

const INITIAL_TEAM: TeamMemberServer[] = [
  {
    id: "member-1",
    name: "Prof. David K. Patel, MD, PhD",
    role: "Principal Investigator & Lab Director",
    category: "Faculty",
    credentials: "MD (Cardiology), PhD (Biomedical Engineering, MIT)",
    bio: "Associate Professor of Medical Informatics leading translational clinical AI, bedside telemetry foundation models, and contactless physiological monitoring.",
    detailedBio: "Prof. David K. Patel is the Director of the Medical Informatics and Digital Health (MINDH) Laboratory. With dual board certification in Cardiovascular Medicine and a PhD in Biomedical Engineering, he directs multi-center clinical trials bridging raw bedside sensor streams with clinician-facing decision support systems. He previously held research appointments at Harvard Medical School and has authored over 95 peer-reviewed papers in Nature Digital Medicine, IEEE TBME, and Lancet Digital Health.",
    labRoleDetail: "Oversees overall laboratory research strategy, multi-center hospital deployments, NIH R01 grant management, and clinical mentorship.",
    focus: ["Translational Informatics", "Contactless Physiological Sensing", "Bedside Foundation Models", "Clinical Trial Leadership"],
    skills: ["Clinical Trial Design", "Physiological Signal Processing", "Translational AI Governance", "Multimodal Biosensors", "Hemodynamic Modeling"],
    contributions: [
      "Pioneered sub-1.5 BPM video-based contactless rPPG pulse rate estimation across 120 intensive care beds.",
      "Architected edge-AI hemodynamic collapse early warning scoring system deployed across 3 regional hospitals.",
      "Recipient of 3 NIH R01 and R21 translational medical instrumentation awards.",
    ],
    projects: [
      { title: "Contactless Multi-Spectral ICU Vital Sensing (NIH R01)", status: "Active", description: "Multi-center clinical trial deploying 4K chromatic sensors for zero-contact pediatric and ICU patient telemetry." },
      { title: "Continuous Cuffless Arterial Pressure Monitoring", status: "Active", description: "Sensor fusion of optical photoplethysmography and bio-impedance for ambulatory hypertension tracking." },
      { title: "Self-Supervised ECG Foundation Model (CardioState-10M)", status: "Completed", description: "Trained on 10 million hours of continuous telemetry to predict arrhythmia onset 4 hours in advance." },
    ],
    publications: [
      { title: "Prospective Multi-Center Trial of Contactless Video Photoplethysmography in Critically Ill Adults", year: 2024, journalOrConference: "Nature Digital Medicine", doi: "10.1038/s41746-024-01120-x", link: "https://nature.com" },
      { title: "Foundations of Bedside Computational Physiology: Self-Supervised Waveform Representation", year: 2023, journalOrConference: "IEEE Trans. Biomedical Engineering", doi: "10.1109/TBME.2023.3289012" },
      { title: "Real-Time Hemodynamic Decompensation Warning Using Multimodal Deep Attention", year: 2022, journalOrConference: "Lancet Digital Health", doi: "10.1016/S2589-7500(22)00145-8" },
    ],
    awards: [
      { title: "NIH Director's Transformative Research Award", year: "2023", organization: "National Institutes of Health" },
      { title: "IEEE EMBC Outstanding Clinical Engineering Paper", year: "2021", organization: "IEEE Engineering in Medicine & Biology" },
    ],
    avatarUrl: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=600",
    email: "d.patel@mindh-lab.org",
    scholarUrl: "https://scholar.google.com",
    orcidUrl: "https://orcid.org/0000-0002-1825-0097",
    researchGateUrl: "https://researchgate.net",
    websiteUrl: "https://mindh-lab.org/david-patel",
    linkedinUrl: "https://www.linkedin.com/company/medical-informatics-and-digital-health-lab/",
    twitterUrl: "https://twitter.com",
    showEmail: true,
    showSocialLinks: true,
    showPublications: true,
    showProjects: true,
    isPublic: true,
    orderIndex: 1,
  },
  {
    id: "member-2",
    name: "Dr. Elena Vance, PhD",
    role: "Senior Research Scientist & Vision Lead",
    category: "Researchers",
    credentials: "PhD in Computer Science (Computer Vision, Stanford)",
    bio: "Specializes in video photoplethysmography, spatial-temporal graph networks, and illumination invariance in surgical and intensive care environments.",
    detailedBio: "Dr. Vance is a Senior Research Scientist leading the Optical Sensing and Computer Vision core at MINDH Lab. Her research centers on extracting micro-chromatic skin color fluctuations caused by sub-surface capillary blood flow using consumer and industrial video streams. Prior to joining MINDH, she completed a postdoctoral fellowship at the Stanford AI Lab, focusing on robust video processing under erratic motion and variable illumination.",
    labRoleDetail: "Directs computer vision algorithm development, camera rig calibration, and benchmark dataset curation.",
    focus: ["rPPG Extraction", "Computer Vision in Healthcare", "Microcirculation Imaging", "Optical Physics"],
    skills: ["PyTorch / JAX", "OpenCV", "Chrominance Physics Models", "Optical Flow Estimation", "Real-Time C++ Video Pipelines"],
    contributions: [
      "Created the ChromPhys benchmark containing 500+ hours of synchronized ground-truth multi-wavelength clinical video.",
      "Designed motion-compensated face and palm tracker maintaining signal-to-noise ratio during pediatric agitation.",
      "Holder of 2 US patents on contactless vital sign extraction under non-stationary lighting.",
    ],
    projects: [
      { title: "Deep Chromatic Diffusion for Contactless SpO2", status: "Active", description: "Multi-wavelength reflectance estimation overcoming skin pigmentation bias in contactless pulse oximetry." },
      { title: "Microcirculation Perfusion Index Video Mapping", status: "Completed", description: "High-speed 120fps mapping of localized peripheral perfusion changes during induced septic shock models." },
    ],
    publications: [
      { title: "Illumination-Invariant Neural Photoplethysmography with Spatio-Temporal Attention", year: 2024, journalOrConference: "IEEE CVPR (Healthcare Vision)", doi: "10.1109/CVPR.2024.08912" },
      { title: "Mitigating Pigmentation Bias in Non-Contact Oxygen Saturation Estimation", year: 2023, journalOrConference: "Nature Digital Medicine", doi: "10.1038/s41746-023-00914-1" },
    ],
    awards: [
      { title: "MIT Technology Review 35 Under 35 Honoree", year: "2023", organization: "MIT Tech Review" },
    ],
    avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=600",
    email: "e.vance@mindh-lab.org",
    scholarUrl: "https://scholar.google.com",
    orcidUrl: "https://orcid.org/0000-0001-9042-4521",
    linkedinUrl: "https://www.linkedin.com/company/medical-informatics-and-digital-health-lab/",
    twitterUrl: "https://twitter.com",
    showEmail: true,
    showSocialLinks: true,
    showPublications: true,
    showProjects: true,
    isPublic: true,
    orderIndex: 2,
  },
  {
    id: "member-3",
    name: "Dr. Rohan Sharma, PhD",
    role: "Postdoctoral Research Fellow",
    category: "Researchers",
    credentials: "PhD in Electrical & Biomedical Engineering (Georgia Tech)",
    bio: "Pioneers multimodal bio-impedance and optical sensor fusion algorithms for continuous ambulatory blood pressure estimation.",
    detailedBio: "Dr. Rohan Sharma joined MINDH in 2023 following doctoral research on ultra-low-power biomedical micro-instrumentation. His work focuses on wearable sensor fusion—coupling high-frequency bio-impedance plethysmography with miniaturized reflective PPG to calculate continuous pulse wave transit time (PWTT) and pulse wave velocity (PWV) without an occlusive cuff.",
    labRoleDetail: "Leads wearable hardware prototyping, microcontroller firmware design, and benchtop artifact simulation.",
    focus: ["Biomedical Signal Processing", "Wearable Hemodynamics", "Embedded Edge AI", "Cuffless Blood Pressure"],
    skills: ["Embedded C/C++", "DSP & Wavelet Transforms", "BLE Telemetry", "Analog Front-End Design", "Physiological Modeling"],
    contributions: [
      "Developed sub-5mW wrist-worn bio-impedance acquisition board with continuous 500Hz sampling.",
      "Reduced mean absolute error in diastolic blood pressure tracking by 42% on standard MIMIC-IV benchmark.",
    ],
    projects: [
      { title: "Ambulatory 24h Cuffless BP Patch", status: "Active", description: "Clinical trial assessing 24-hour ambulatory blood pressure monitoring compared to A-line ground truth in CCU." },
    ],
    publications: [
      { title: "Nonlinear Pulse Wave Transit Time Calibration for Ambulatory Blood Pressure", year: 2024, journalOrConference: "IEEE Trans. Biomedical Circuits & Systems", doi: "10.1109/TBCAS.2024.33120" },
    ],
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=600",
    email: "r.sharma@mindh-lab.org",
    scholarUrl: "https://scholar.google.com",
    orcidUrl: "https://orcid.org/0000-0003-4512-9810",
    linkedinUrl: "https://www.linkedin.com/company/medical-informatics-and-digital-health-lab/",
    showEmail: true,
    showSocialLinks: true,
    showPublications: true,
    showProjects: true,
    isPublic: true,
    orderIndex: 3,
  },
  {
    id: "member-4",
    name: "Kevin Zhao, MS",
    role: "Doctoral Candidate",
    category: "PhD Scholars",
    credentials: "PhD Candidate in Health Informatics & Computer Science",
    bio: "Developing self-supervised contrastive learning algorithms on high-frequency streaming ECG and vital sign telemetry for early shock warning.",
    detailedBio: "Kevin Zhao is a 4th-year PhD candidate co-advised by Prof. Patel and the Department of Computer Science. His dissertation investigates foundational representations of high-dimensional multi-lead electrophysiological time-series data, specifically self-supervised masking objectives for predicting acute hemodynamic decompensation.",
    labRoleDetail: "Maintains the lab's GPU cluster compute pipeline and leads transformer model development.",
    focus: ["Foundation Models for ECG", "Time-series Transformers", "Clinical Decision Support", "Sepsis Early Warning"],
    skills: ["PyTorch", "HuggingFace", "Distributed Training (DDP/DeepSpeed)", "EHR Data Mining", "Survival Analysis"],
    contributions: [
      "Open-sourced CardioTransformer, achieving state-of-the-art F1 score on PhysioNet 2021 CinC Challenge.",
      "Demonstrated 3.2-hour median lead time for septic shock prediction using continuous waveform pre-training.",
    ],
    projects: [
      { title: "CardioState: Continuous Latent Space Representation", status: "Active", description: "Multi-channel masked autoencoding on 12-lead ECG telemetry." },
    ],
    publications: [
      { title: "Self-Supervised Contrastive Learning Across Heterogeneous Physiological Waveforms", year: 2023, journalOrConference: "NeurIPS Workshop on Machine Learning for Health (ML4H)", doi: "10.48550/arXiv.2310.12941" },
    ],
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=600",
    email: "k.zhao@mindh-lab.org",
    scholarUrl: "https://scholar.google.com",
    linkedinUrl: "https://www.linkedin.com/company/medical-informatics-and-digital-health-lab/",
    twitterUrl: "https://twitter.com",
    showEmail: true,
    showSocialLinks: true,
    showPublications: true,
    showProjects: true,
    isPublic: true,
    orderIndex: 4,
  },
  {
    id: "member-5",
    name: "Maya Lin, BS",
    role: "Graduate Research Assistant",
    category: "Students",
    credentials: "MS Student in Biomedical Engineering",
    bio: "Investigating vocal acoustics and prosodic biomarkers for continuous cognitive workload and respiratory insufficiency assessment.",
    detailedBio: "Maya Lin is a master's graduate researcher conducting experiments in the MINDH Prosodic & Affect Chamber. Her research investigates how acoustic micro-variations in formant frequencies, jitter, and shimmer correlate with early diaphragmatic fatigue and nocturnal dyspnea.",
    labRoleDetail: "Coordinates human participant testing in the acoustic chamber and oversees audio feature engineering.",
    focus: ["Vocal Biomarkers", "Respiratory Acoustics", "Audio Signal Processing", "Human Factors"],
    skills: ["Librosa", "Audio Feature Extraction", "Acoustic Chamber Calibration", "Statistical Testing"],
    contributions: [
      "Constructed calibrated speech corpus with concurrent spirometry and plethysmography baselines across 60 volunteers.",
    ],
    projects: [
      { title: "Vocal Prosody for Pulmonary Exacerbation Detection", status: "Active", description: "Mobile microphone acoustic analysis for outpatient chronic lung disease flare-up triage." },
    ],
    publications: [
      { title: "Acoustic Glottal Features as Proxies for Minute Ventilation During Physical Exertion", year: 2024, journalOrConference: "Interspeech (Bio-Acoustics Session)", doi: "10.21437/Interspeech.2024-1182" },
    ],
    avatarUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=600",
    email: "m.lin@mindh-lab.org",
    linkedinUrl: "https://www.linkedin.com/company/medical-informatics-and-digital-health-lab/",
    showEmail: true,
    showSocialLinks: true,
    showPublications: true,
    showProjects: true,
    isPublic: true,
    orderIndex: 5,
  },
  {
    id: "member-6",
    name: "Dr. Marcus Thorne, PhD",
    role: "Alumni (Former Senior Postdoc)",
    category: "Alumni",
    credentials: "PhD in Bioengineering (Now Assistant Professor at Johns Hopkins)",
    bio: "Former MINDH Postdoctoral Fellow (2020-2023) who pioneered explainable concept bottleneck models for bedside risk interpretation.",
    detailedBio: "Dr. Marcus Thorne was a postdoctoral fellow in the MINDH Lab from 2020 to 2023, where he co-developed the XAI Bedside Testbed. He is now a tenure-track Assistant Professor of Biomedical Engineering at Johns Hopkins University, continuing active research collaboration with MINDH on clinician interpretability.",
    labRoleDetail: "Adjunct collaborator and alumni mentor.",
    focus: ["Explainable AI (XAI)", "Concept Bottleneck Models", "Clinical Recourse", "Human-AI Teaming"],
    skills: ["Interpretability Frameworks", "Counterfactual Explanations", "Clinician Usability Audits"],
    contributions: [
      "Led the first clinical trial comparing clinician diagnostic speed with black-box vs concept-bottleneck ICU risk predictors.",
    ],
    projects: [
      { title: "Clinician Interpretability & Alert Fatigue Mitigation", status: "Completed", description: "Bedside trial measuring provider trust calibration under conflicting model recommendations." },
    ],
    publications: [
      { title: "Concept Bottleneck Models Reduce Clinician Automation Bias in Critical Care", year: 2023, journalOrConference: "Nature Machine Intelligence", doi: "10.1038/s42256-023-00712-4" },
    ],
    avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=600",
    email: "m.thorne@jhu.edu",
    scholarUrl: "https://scholar.google.com",
    orcidUrl: "https://orcid.org/0000-0002-8812-4019",
    linkedinUrl: "https://www.linkedin.com/company/medical-informatics-and-digital-health-lab/",
    showEmail: true,
    showSocialLinks: true,
    showPublications: true,
    showProjects: true,
    isPublic: true,
    orderIndex: 6,
  },
  {
    id: "member-7",
    name: "Dr. Sarah Al-Mansoor, MD",
    role: "Clinical Collaborator & Critical Care Physician",
    category: "Collaborators",
    credentials: "MD, Associate Professor of Pulmonary & Critical Care Medicine",
    bio: "Director of Medical ICU at Regional Hospital, overseeing prospective validation and bedside clinical usability of MINDH algorithms.",
    detailedBio: "Dr. Sarah Al-Mansoor is an attending critical care physician and clinical co-investigator with the MINDH Lab. She directs the medical intensive care unit where our contactless optical monitoring and hemodynamic early-warning systems are clinically piloted. Her clinical expertise ensures that mathematical models translate directly into actionable bedside alerts.",
    labRoleDetail: "Principal clinical collaborator; leads institutional review board (IRB) protocols and clinical ground truth adjudication.",
    focus: ["Critical Care Medicine", "Sepsis Phenotyping", "Bedside Usability", "Clinical Trial Oversight"],
    skills: ["Critical Care Hemodynamics", "ICU Bedside Telemetry", "IRB Clinical Protocol Design", "EHR Chart Abstraction"],
    contributions: [
      "Established prospective multi-center telemetry bio-bank linking continuous high-frequency waveforms with clinical outcomes.",
    ],
    projects: [
      { title: "Prospective Sepsis Decompensation Alerting Trial", status: "Active", description: "Randomized controlled trial evaluating early bedside notification response times." },
    ],
    publications: [
      { title: "Impact of Continuous Bedside Physiological AI on Nursing Alert Response Times", year: 2024, journalOrConference: "Critical Care Medicine", doi: "10.1097/CCM.0000000000006240" },
    ],
    avatarUrl: "https://images.unsplash.com/photo-1594824813571-638f02614d3f?auto=format&fit=crop&q=80&w=600",
    email: "s.almansoor@regional-health.org",
    scholarUrl: "https://scholar.google.com",
    linkedinUrl: "https://www.linkedin.com/company/medical-informatics-and-digital-health-lab/",
    showEmail: true,
    showSocialLinks: true,
    showPublications: true,
    showProjects: true,
    isPublic: true,
    orderIndex: 7,
  },
];

function getTeamData(): TeamMemberServer[] {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(TEAM_FILE)) {
      fs.writeFileSync(TEAM_FILE, JSON.stringify(INITIAL_TEAM, null, 2), "utf-8");
      return INITIAL_TEAM;
    }
    const raw = fs.readFileSync(TEAM_FILE, "utf-8");
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return INITIAL_TEAM;
  } catch (err) {
    console.error("Error reading team data file, fallback to initial data:", err);
    return INITIAL_TEAM;
  }
}

function saveTeamData(data: TeamMemberServer[]): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(TEAM_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error("Error saving team data:", err);
  }
}

function sortTeamMembers(members: TeamMemberServer[]): TeamMemberServer[] {
  return [...members].sort((a, b) => (a.orderIndex ?? 999) - (b.orderIndex ?? 999));
}

// GET /api/team: Retrieve all team members
app.get("/api/team", (req, res) => {
  try {
    const token = extractToken(req);
    const session = getSession(token || undefined);
    const isAdmin = !!session;

    let items = getTeamData();
    if (!isAdmin) {
      items = items.filter((m: any) => m.isPublic !== false && m.published !== false);
    }
    return res.json({
      success: true,
      team: sortTeamMembers(items),
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: "Failed to retrieve team members", error: err?.message });
  }
});

// POST /api/team: Admin create team member
app.post("/api/team", requireAdminAuth, (req, res) => {
  try {
    const {
      name,
      role,
      category = "Researchers",
      credentials = "",
      bio = "",
      detailedBio = "",
      labRoleDetail = "",
      focus = [],
      skills = [],
      contributions = [],
      projects = [],
      publications = [],
      awards = [],
      avatarUrl = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=600",
      email,
      scholarUrl,
      orcidUrl,
      researchGateUrl,
      websiteUrl,
      linkedinUrl,
      twitterUrl,
      instagramUrl,
      showEmail = true,
      showSocialLinks = true,
      showPublications = true,
      showProjects = true,
      isPublic = true,
      orderIndex,
    } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: "Team member name is required." });
    }

    if (!role || !role.trim()) {
      return res.status(400).json({ success: false, message: "Team member role/position is required." });
    }

    const items = getTeamData();
    const maxOrder = items.reduce((max, item) => Math.max(max, item.orderIndex || 0), 0);

    const newMember: TeamMemberServer = {
      id: `member-${Date.now()}`,
      name: name.trim(),
      role: role.trim(),
      category: (category as any) || "Researchers",
      credentials: credentials.trim(),
      bio: bio.trim(),
      detailedBio: detailedBio.trim(),
      labRoleDetail: labRoleDetail.trim(),
      focus: Array.isArray(focus) ? focus.filter(Boolean) : [],
      skills: Array.isArray(skills) ? skills.filter(Boolean) : [],
      contributions: Array.isArray(contributions) ? contributions.filter(Boolean) : [],
      projects: Array.isArray(projects) ? projects : [],
      publications: Array.isArray(publications) ? publications : [],
      awards: Array.isArray(awards) ? awards : [],
      avatarUrl: avatarUrl.trim() || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=600",
      email: email?.trim(),
      scholarUrl: scholarUrl?.trim(),
      orcidUrl: orcidUrl?.trim(),
      researchGateUrl: researchGateUrl?.trim(),
      websiteUrl: websiteUrl?.trim(),
      linkedinUrl: linkedinUrl?.trim(),
      twitterUrl: twitterUrl?.trim(),
      instagramUrl: instagramUrl?.trim(),
      showEmail: Boolean(showEmail),
      showSocialLinks: Boolean(showSocialLinks),
      showPublications: Boolean(showPublications),
      showProjects: Boolean(showProjects),
      isPublic: Boolean(isPublic !== false),
      orderIndex: typeof orderIndex === "number" ? orderIndex : maxOrder + 1,
    };

    items.push(newMember);
    saveTeamData(items);

    return res.status(201).json({
      success: true,
      message: "Team member added successfully.",
      member: newMember,
      team: sortTeamMembers(items),
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: "Failed to create team member", error: err?.message });
  }
});

// PUT /api/team/:id: Admin update team member
app.put("/api/team/:id", requireAdminAuth, (req, res) => {
  try {
    const { id } = req.params;
    const items = getTeamData();
    const index = items.findIndex((m) => m.id === id);

    if (index === -1) {
      return res.status(404).json({ success: false, message: `Team member with id "${id}" not found.` });
    }

    const current = items[index];
    const updateData = req.body;

    const updated: TeamMemberServer = {
      ...current,
      ...updateData,
      id: current.id, // Preserve immutable ID
      name: updateData.name !== undefined ? updateData.name.trim() : current.name,
      role: updateData.role !== undefined ? updateData.role.trim() : current.role,
      category: updateData.category || current.category,
      credentials: updateData.credentials !== undefined ? updateData.credentials.trim() : current.credentials,
      bio: updateData.bio !== undefined ? updateData.bio.trim() : current.bio,
      detailedBio: updateData.detailedBio !== undefined ? updateData.detailedBio.trim() : current.detailedBio,
      labRoleDetail: updateData.labRoleDetail !== undefined ? updateData.labRoleDetail.trim() : current.labRoleDetail,
      focus: Array.isArray(updateData.focus) ? updateData.focus.filter(Boolean) : current.focus,
      skills: Array.isArray(updateData.skills) ? updateData.skills.filter(Boolean) : current.skills,
      contributions: Array.isArray(updateData.contributions) ? updateData.contributions.filter(Boolean) : current.contributions,
      projects: Array.isArray(updateData.projects) ? updateData.projects : current.projects,
      publications: Array.isArray(updateData.publications) ? updateData.publications : current.publications,
      awards: Array.isArray(updateData.awards) ? updateData.awards : current.awards,
      avatarUrl: updateData.avatarUrl !== undefined && updateData.avatarUrl.trim() ? updateData.avatarUrl.trim() : current.avatarUrl,
      orderIndex: typeof updateData.orderIndex === "number" ? updateData.orderIndex : current.orderIndex,
    };

    items[index] = updated;
    saveTeamData(items);

    return res.json({
      success: true,
      message: "Team member updated successfully.",
      member: updated,
      team: sortTeamMembers(items),
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: "Failed to update team member", error: err?.message });
  }
});

// DELETE /api/team/:id: Admin delete team member
app.delete("/api/team/:id", requireAdminAuth, (req, res) => {
  try {
    const { id } = req.params;
    let items = getTeamData();
    const initialLen = items.length;
    items = items.filter((m) => m.id !== id);

    if (items.length === initialLen) {
      return res.status(404).json({ success: false, message: `Team member with id "${id}" not found.` });
    }

    saveTeamData(items);
    return res.json({
      success: true,
      message: "Team member deleted successfully.",
      deletedId: id,
      team: sortTeamMembers(items),
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: "Failed to delete team member", error: err?.message });
  }
});

// PUT /api/team-reorder: Admin update team ordering
app.put("/api/team-reorder", requireAdminAuth, (req, res) => {
  try {
    const { orderedIds } = req.body;
    if (!Array.isArray(orderedIds)) {
      return res.status(400).json({ success: false, message: "orderedIds must be an array of member IDs." });
    }

    const items = getTeamData();
    const itemMap = new Map(items.map((item) => [item.id, item]));

    const reordered: TeamMemberServer[] = [];
    orderedIds.forEach((id: string, index: number) => {
      const item = itemMap.get(id);
      if (item) {
        item.orderIndex = index + 1;
        reordered.push(item);
        itemMap.delete(id);
      }
    });

    // Append any remaining items that were not in orderedIds
    itemMap.forEach((item) => {
      item.orderIndex = reordered.length + 1;
      reordered.push(item);
    });

    saveTeamData(reordered);
    return res.json({
      success: true,
      message: "Team members reordered successfully.",
      team: sortTeamMembers(reordered),
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: "Failed to reorder team members", error: err?.message });
  }
});

// POST /api/team/reset: Reset to initial team seed
app.post("/api/team/reset", requireAdminAuth, (_req, res) => {
  try {
    saveTeamData(INITIAL_TEAM);
    return res.json({
      success: true,
      message: "Team members reset to default laboratory personnel.",
      team: sortTeamMembers(INITIAL_TEAM),
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: "Failed to reset team members", error: err?.message });
  }
});

// ----------------------------------------------------
// COLLABORATORS API & DATA STORAGE
// ----------------------------------------------------

interface CollaboratorServer {
  id: string;
  name: string;
  shortName?: string;
  category: 'Clinical & Hospital' | 'Academic Institution' | 'Industry & Technology' | 'Grant & Funding';
  location: string;
  logoUrl?: string;
  description: string;
  jointFocus: string[];
  keyContacts?: string[];
  activeTrials?: string[];
  websiteUrl?: string;
  isFeatured?: boolean;
  orderIndex?: number;
}

const INITIAL_COLLABORATORS: CollaboratorServer[] = [
  {
    id: "collab-1",
    name: "Massachusetts General Hospital & Harvard Medical School",
    shortName: "Mass General / Harvard",
    category: "Clinical & Hospital",
    location: "Boston, Massachusetts, USA",
    logoUrl: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=400",
    description: "Primary clinical trial partner for multi-bed ICU contactless optical telemetry, continuous neonatal hemodynamic monitoring, and acute sepsis early warning deployment.",
    jointFocus: [
      "Zero-Contact ICU Hemodynamics",
      "Continuous Pediatric Monitoring",
      "Infectious Disease Isolation Telemetry",
      "Clinical Protocol Adjudication"
    ],
    keyContacts: ["Dr. Sarah Al-Mansoor, MD (ICU Director)", "Prof. Robert Lang, MD (Pulmonary Medicine)"],
    activeTrials: [
      "Contactless ICU Vital Sign Extraction Trial (NCT05128911)",
      "Pediatric Respiratory Distress Early Warning Pilot"
    ],
    websiteUrl: "https://www.massgeneral.org",
    isFeatured: true,
    orderIndex: 1,
  },
  {
    id: "collab-2",
    name: "Johns Hopkins Medicine & Whiting School of Engineering",
    shortName: "Johns Hopkins University",
    category: "Academic Institution",
    location: "Baltimore, Maryland, USA",
    logoUrl: "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&q=80&w=400",
    description: "Pioneering collaborative research on explainable concept bottleneck architectures, physician alert fatigue mitigation, and human-in-the-loop clinical decision support.",
    jointFocus: [
      "Explainable AI (XAI) for Critical Care",
      "Concept Bottleneck Architectures",
      "Physician Trust & Recourse Audits",
      "Bedside Diagnostic Usability"
    ],
    keyContacts: ["Dr. Marcus Thorne, PhD (Assistant Professor)", "Prof. Elena Rostova, MD, PhD"],
    activeTrials: [
      "Multi-Hospital Clinician Diagnostic Usability Benchmark",
      "Counterfactual Explanations in Emergency Triage"
    ],
    websiteUrl: "https://www.hopkinsmedicine.org",
    isFeatured: true,
    orderIndex: 2,
  },
  {
    id: "collab-3",
    name: "Stanford Health Care - Division of Cardiovascular Health",
    shortName: "Stanford Health Care",
    category: "Clinical & Hospital",
    location: "Stanford, California, USA",
    logoUrl: "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=400",
    description: "Multi-center clinical site evaluating wearable photoplethysmography and bio-impedance sensor fusion for ambulatory continuous blood pressure tracking and arrhythmia prediction.",
    jointFocus: [
      "Cuffless Continuous Arterial Pressure",
      "Ambulatory Arrhythmia Telemetry",
      "Photoplethysmography Sensor Fusion",
      "AAMI Protocol Validation"
    ],
    keyContacts: ["Prof. David K. Patel, MD, PhD (Adjunct Investigator)", "Dr. Michael Chen, MD, FACC"],
    activeTrials: [
      "CardioState Ambulatory Hypertension Cohort (1,500 Patients)",
      "Beat-to-Beat PTT Hemodynamic Validation"
    ],
    websiteUrl: "https://stanfordhealthcare.org",
    isFeatured: true,
    orderIndex: 3,
  },
  {
    id: "collab-4",
    name: "MIT Institute for Medical Engineering and Science (IMES)",
    shortName: "MIT IMES & CSAIL",
    category: "Academic Institution",
    location: "Cambridge, Massachusetts, USA",
    logoUrl: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&q=80&w=400",
    description: "Joint theoretical engineering on foundational physiological representation learning, high-dimensional wavelet manifolds, and edge-deployable temporal transformer models.",
    jointFocus: [
      "Self-Supervised Biosignal Foundation Models",
      "CardioState-10M Pre-training Benchmark",
      "Wavelet Signal Decomposition",
      "Edge Microprocessor Optimization"
    ],
    keyContacts: ["Prof. Alex Vance, PhD", "Dr. Clara Zhang, PhD (Postdoctoral Affiliate)"],
    activeTrials: [
      "10-Million-Hour Ambience Waveform Benchmark",
      "Cross-Modal ECG-to-PPG Synthetic Reconstruction"
    ],
    websiteUrl: "https://imes.mit.edu",
    isFeatured: true,
    orderIndex: 4,
  },
  {
    id: "collab-5",
    name: "Philips Healthcare - Clinical Informatics Research",
    shortName: "Philips Healthcare",
    category: "Industry & Technology",
    location: "Cambridge, MA & Eindhoven, Netherlands",
    logoUrl: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=400",
    description: "Industry co-development of HL7 FHIR real-time physiological telemetry interfaces and next-generation bedside patient monitor micro-services.",
    jointFocus: [
      "HL7 FHIR Interoperability Protocols",
      "Patient Monitor Hardware Integration",
      "Medical Device Regulatory Pathways",
      "Real-Time Telemetry Streaming"
    ],
    keyContacts: ["Dr. Jennifer Krause, PhD (Principal Scientist)", "Markus Lindqvist (VP Clinical Systems)"],
    activeTrials: [
      "Next-Generation Bedside Edge Module Pilot",
      "Hospital Electronic Health Record Integration Verification"
    ],
    websiteUrl: "https://www.philips.com/healthcare",
    isFeatured: true,
    orderIndex: 5,
  },
  {
    id: "collab-6",
    name: "NVIDIA Healthcare & Life Sciences (Inception Partner)",
    shortName: "NVIDIA Healthcare",
    category: "Industry & Technology",
    location: "Santa Clara, California, USA",
    logoUrl: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=400",
    description: "Accelerating bedside inference latency using NVIDIA Clara Holoscan and TensorRT, achieving sub-16ms multimodal model execution directly at point-of-care.",
    jointFocus: [
      "Clara Holoscan Deployment Architecture",
      "Sub-16ms Real-Time Inference Validation",
      "TensorRT Biosignal Quantization",
      "Bedside GPU Acceleration"
    ],
    keyContacts: ["Healthcare AI Solutions Engineering Team"],
    activeTrials: [
      "Real-Time 60 FPS rPPG Video Processing Benchmarks",
      "Hospital Point-of-Care Neural Engine Testing"
    ],
    websiteUrl: "https://www.nvidia.com/en-us/industries/healthcare-and-life-sciences",
    isFeatured: true,
    orderIndex: 6,
  },
  {
    id: "collab-7",
    name: "National Institutes of Health (NIH - NHLBI & NIBIB)",
    shortName: "National Institutes of Health",
    category: "Grant & Funding",
    location: "Bethesda, Maryland, USA",
    logoUrl: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&q=80&w=400",
    description: "Primary federal grant supporter for multi-year translational research on cuffless continuous arterial blood pressure monitoring and contactless optical physiological sensing.",
    jointFocus: [
      "Grant NIH R01 HL158921 (Continuous BP)",
      "Grant NIH R21 EB032114 (Contactless ICU Telemetry)",
      "Translational Clinical Science Governance",
      "Open-Science Bio-Signal Benchmarks"
    ],
    keyContacts: ["Division of Cardiovascular Sciences Program Directorate"],
    activeTrials: [
      "4-Year Multi-Center Translation Grant Pipeline",
      "Physiological Telemetry Open Research Repository"
    ],
    websiteUrl: "https://www.nih.gov",
    isFeatured: true,
    orderIndex: 7,
  },
  {
    id: "collab-8",
    name: "American Heart Association (AHA) - Health Tech Collaborative",
    shortName: "American Heart Association",
    category: "Grant & Funding",
    location: "Dallas, Texas, USA",
    logoUrl: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=400",
    description: "Supporting decentralized clinical trials and cardiovascular health equity research to provide ambulatory hemodynamic telemetry across underserved patient populations.",
    jointFocus: [
      "Innovative Project Award: Wearable Optical Hemodynamics",
      "Cardiovascular Health Disparity Reduction",
      "Decentralized Tele-Cardiology Protocols",
      "Longitudinal Patient Engagement"
    ],
    keyContacts: ["AHA Institute for Precision Cardiovascular Medicine"],
    activeTrials: [
      "Community Ambulatory Hypertension Longitudinal Study",
      "Mobile Health Equivalence Trials"
    ],
    websiteUrl: "https://www.heart.org",
    isFeatured: false,
    orderIndex: 8,
  },
];

function getCollaboratorsData(): CollaboratorServer[] {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(COLLABORATORS_FILE)) {
      fs.writeFileSync(COLLABORATORS_FILE, JSON.stringify(INITIAL_COLLABORATORS, null, 2), "utf-8");
      return INITIAL_COLLABORATORS;
    }
    const raw = fs.readFileSync(COLLABORATORS_FILE, "utf-8");
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return INITIAL_COLLABORATORS;
  } catch (err) {
    console.error("Error reading collaborators data file, falling back:", err);
    return INITIAL_COLLABORATORS;
  }
}

function saveCollaboratorsData(collaborators: CollaboratorServer[]): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(COLLABORATORS_FILE, JSON.stringify(collaborators, null, 2), "utf-8");
  } catch (err) {
    console.error("Error saving collaborators data:", err);
    throw err;
  }
}

function sortCollaborators(items: CollaboratorServer[]): CollaboratorServer[] {
  return [...items].sort((a, b) => (a.orderIndex ?? 999) - (b.orderIndex ?? 999));
}

// GET /api/collaborators
app.get("/api/collaborators", (req, res) => {
  try {
    const token = extractToken(req);
    const session = getSession(token || undefined);
    const isAdmin = !!session;

    let list = getCollaboratorsData();
    if (!isAdmin) {
      list = list.filter((c: any) => c.published !== false);
    }
    return res.json({ success: true, collaborators: sortCollaborators(list) });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: "Failed to fetch collaborators", error: err?.message });
  }
});

// POST /api/collaborators
app.post("/api/collaborators", requireAdminAuth, (req, res) => {
  try {
    const list = getCollaboratorsData();
    const { name, shortName, category, location, logoUrl, description, jointFocus, keyContacts, activeTrials, websiteUrl, isFeatured } = req.body;

    if (!name || !category || !location || !description) {
      return res.status(400).json({ success: false, message: "Name, category, location, and description are required." });
    }

    const newCollaborator: CollaboratorServer = {
      id: `collab-${Date.now()}`,
      name: name.trim(),
      shortName: shortName?.trim() || undefined,
      category,
      location: location.trim(),
      logoUrl: logoUrl?.trim() || "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=400",
      description: description.trim(),
      jointFocus: Array.isArray(jointFocus) ? jointFocus : [],
      keyContacts: Array.isArray(keyContacts) ? keyContacts : [],
      activeTrials: Array.isArray(activeTrials) ? activeTrials : [],
      websiteUrl: websiteUrl?.trim() || undefined,
      isFeatured: isFeatured !== false,
      orderIndex: list.length + 1,
    };

    const updated = [...list, newCollaborator];
    saveCollaboratorsData(updated);
    return res.status(201).json({ success: true, message: "Collaborator created successfully", collaborator: newCollaborator, collaborators: sortCollaborators(updated) });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: "Failed to create collaborator", error: err?.message });
  }
});

// PUT /api/collaborators/:id
app.put("/api/collaborators/:id", requireAdminAuth, (req, res) => {
  try {
    const { id } = req.params;
    const list = getCollaboratorsData();
    const index = list.findIndex((c) => c.id === id);

    if (index === -1) {
      return res.status(404).json({ success: false, message: `Collaborator with ID ${id} not found.` });
    }

    const existing = list[index];
    const updatedCollaborator: CollaboratorServer = {
      ...existing,
      ...req.body,
      id: existing.id, // Preserve ID
    };

    const updated = [...list];
    updated[index] = updatedCollaborator;
    saveCollaboratorsData(updated);

    return res.json({ success: true, message: "Collaborator updated successfully", collaborator: updatedCollaborator, collaborators: sortCollaborators(updated) });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: "Failed to update collaborator", error: err?.message });
  }
});

// DELETE /api/collaborators/:id
app.delete("/api/collaborators/:id", requireAdminAuth, (req, res) => {
  try {
    const { id } = req.params;
    const list = getCollaboratorsData();
    const filtered = list.filter((c) => c.id !== id);

    if (filtered.length === list.length) {
      return res.status(404).json({ success: false, message: `Collaborator with ID ${id} not found.` });
    }

    saveCollaboratorsData(filtered);
    return res.json({ success: true, message: "Collaborator removed successfully", collaborators: sortCollaborators(filtered) });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: "Failed to delete collaborator", error: err?.message });
  }
});

// PUT /api/collaborators-reorder
app.put("/api/collaborators-reorder", requireAdminAuth, (req, res) => {
  try {
    const { orderedIds } = req.body;
    if (!Array.isArray(orderedIds)) {
      return res.status(400).json({ success: false, message: "orderedIds must be an array of IDs" });
    }

    const list = getCollaboratorsData();
    const reordered: CollaboratorServer[] = [];

    orderedIds.forEach((id: string, idx: number) => {
      const found = list.find((c) => c.id === id);
      if (found) {
        reordered.push({ ...found, orderIndex: idx + 1 });
      }
    });

    list.forEach((c) => {
      if (!orderedIds.includes(c.id)) {
        reordered.push({ ...c, orderIndex: reordered.length + 1 });
      }
    });

    saveCollaboratorsData(reordered);
    return res.json({ success: true, message: "Collaborators reordered successfully.", collaborators: sortCollaborators(reordered) });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: "Failed to reorder collaborators", error: err?.message });
  }
});

// POST /api/collaborators/reset
app.post("/api/collaborators/reset", requireAdminAuth, (_req, res) => {
  try {
    saveCollaboratorsData(INITIAL_COLLABORATORS);
    return res.json({ success: true, message: "Collaborators reset to default initial consortium.", collaborators: sortCollaborators(INITIAL_COLLABORATORS) });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: "Failed to reset collaborators", error: err?.message });
  }
});

// ----------------------------------------------------
// PUBLICATIONS API & DATA STORAGE
// ----------------------------------------------------

interface PublicationServer {
  id: string;
  title: string;
  authors: string;
  journal: string;
  year: number;
  topic: 'Physiological Monitoring' | 'Clinical AI' | 'Signal Processing' | 'Digital Health';
  doiUrl: string;
  pdfUrl: string;
  codeUrl?: string;
  abstract: string;
  highlight?: string;
  bibtex: string;
  published?: boolean;
  orderIndex?: number;
  createdAt?: string;
}

const INITIAL_PUBLICATIONS: PublicationServer[] = [
  {
    id: 'pub-1',
    title: 'Contactless Physiological Monitoring Using Video-Based rPPG',
    authors: 'R. Sharma, E. Vance, C. Zhang, D. Patel, MINDH Consortium',
    journal: 'IEEE Transactions on Biomedical Engineering / Nature Digital Medicine',
    year: 2024,
    topic: 'Physiological Monitoring',
    doiUrl: 'https://doi.org/10.xxxx/example1',
    pdfUrl: 'https://arxiv.org/abs/example1',
    codeUrl: 'https://github.com/mindh-lab/rppg-contactless-vitals',
    abstract:
      'We present a robust deep learning framework for remote photoplethysmography (rPPG) that extracts pulse wave signals and respiratory rates from standard RGB video feeds under ambient hospital lighting variations.',
    highlight: 'Mean Absolute Error: 1.42 BPM across 120 intensive care subjects.',
    bibtex: `@article{sharma2024contactless,
  title={Contactless Physiological Monitoring Using Video-Based rPPG},
  author={Sharma, R. and Vance, E. and Zhang, C. and Patel, D.},
  journal={IEEE / Nature Digital Medicine},
  year={2024},
  doi={10.xxxx/example1}
}`,
    createdAt: '2024-11-15T08:00:00.000Z'
  },
  {
    id: 'pub-2',
    title: 'Deep Learning Architectures for Real-Time Clinical Vital Sign Estimation',
    authors: 'H. Lin, K. Zhao, M. Thorne, S. Al-Mansoor',
    journal: 'Frontiers in Digital Health',
    year: 2023,
    topic: 'Clinical AI',
    doiUrl: 'https://doi.org/10.xxxx/example2',
    pdfUrl: 'https://arxiv.org/abs/example2',
    codeUrl: 'https://github.com/mindh-lab/dl-clinical-vitals',
    abstract:
      'Investigates edge-deployable spatio-temporal convolutional neural networks combined with transformer attention to estimate heart rate, heart rate variability (HRV), and oxygen saturation in real-time.',
    highlight: 'Real-time inference at 60 FPS on low-power bedside edge microprocessors.',
    bibtex: `@article{lin2023deeplearning,
  title={Deep Learning Architectures for Real-Time Clinical Vital Sign Estimation},
  author={Lin, H. and Zhao, K. and Thorne, M. and Al-Mansoor, S.},
  journal={Frontiers in Digital Health},
  year={2023},
  doi={10.xxxx/example2}
}`,
    createdAt: '2023-08-20T10:00:00.000Z'
  },
  {
    id: 'pub-3',
    title: 'Motion Artifact Reduction in Wearable PPG Signals via Wavelet Transforms',
    authors: 'R. Sharma, K. Zhao, C. Zhang',
    journal: 'Physiological Measurement',
    year: 2022,
    topic: 'Signal Processing',
    doiUrl: 'https://doi.org/10.xxxx/example3',
    pdfUrl: 'https://arxiv.org/abs/example3',
    abstract:
      'Proposes a dual-tree complex wavelet transform combined with adaptive noise cancellation to reconstruct corrupted PPG morphologies during intense physical locomotion.',
    highlight: 'SNR improvement of 8.6 dB during ambulatory stress testing.',
    bibtex: `@article{sharma2022wavelet,
  title={Motion Artifact Reduction in Wearable PPG Signals via Wavelet Transforms},
  author={Sharma, R. and Zhao, K. and Zhang, C.},
  journal={Physiological Measurement},
  year={2022},
  doi={10.xxxx/example3}
}`,
    createdAt: '2022-05-10T12:00:00.000Z'
  },
  {
    id: 'pub-4',
    title: 'Explainable AI for Early Sepsis Detection in Intensive Care Units',
    authors: 'E. Vance, R. Sharma, D. Patel, S. Al-Mansoor',
    journal: 'Journal of the American Medical Informatics Association (JAMIA)',
    year: 2024,
    topic: 'Clinical AI',
    doiUrl: 'https://doi.org/10.xxxx/example4',
    pdfUrl: 'https://arxiv.org/abs/example4',
    codeUrl: 'https://github.com/mindh-lab/xai-sepsis-triage',
    abstract:
      'Introduces a concept bottleneck architecture mapping continuous bedside telemetry into clinical intermediate concepts (hypoperfusion, microcirculatory dysfunction) before predicting organ failure.',
    highlight: 'Area Under the ROC Curve (AUROC) of 0.89 with clinician-verified attribution paths.',
    bibtex: `@article{vance2024sepsis,
  title={Explainable AI for Early Sepsis Detection in Intensive Care Units},
  author={Vance, E. and Sharma, R. and Patel, D. and Al-Mansoor, S.},
  journal={JAMIA},
  year={2024},
  doi={10.xxxx/example4}
}`,
    createdAt: '2024-09-01T09:00:00.000Z'
  },
  {
    id: 'pub-5',
    title: 'Continuous Cuffless Blood Pressure Estimation with Multi-Wavelength Photoplethysmography',
    authors: 'C. Zhang, R. Sharma, M. Thorne, D. Patel',
    journal: 'Nature Biomedical Engineering',
    year: 2024,
    topic: 'Physiological Monitoring',
    doiUrl: 'https://doi.org/10.xxxx/example5',
    pdfUrl: 'https://arxiv.org/abs/example5',
    abstract:
      'Demonstrates pulse transit time (PTT) and pulse arrival time (PAT) calibration protocols without intermittent inflatable cuff inflation, meeting IEEE 1708 and AAMI standards across 800 outpatient subjects.',
    highlight: 'Systolic error standard deviation <= 6.8 mmHg across normotensive and hypertensive cohorts.',
    bibtex: `@article{zhang2024cuffless,
  title={Continuous Cuffless Blood Pressure Estimation with Multi-Wavelength Photoplethysmography},
  author={Zhang, C. and Sharma, R. and Thorne, M. and Patel, D.},
  journal={Nature Biomedical Engineering},
  year={2024},
  doi={10.xxxx/example5}
}`,
    createdAt: '2024-06-12T14:00:00.000Z'
  },
  {
    id: 'pub-6',
    title: 'Self-Supervised Representation Learning for Multimodal Bio-Signals',
    authors: 'K. Zhao, H. Lin, R. Sharma',
    journal: 'NeurIPS Workshop on Learning from Time Series in Healthcare',
    year: 2023,
    topic: 'Signal Processing',
    doiUrl: 'https://doi.org/10.xxxx/example6',
    pdfUrl: 'https://arxiv.org/abs/example6',
    codeUrl: 'https://github.com/mindh-lab/biosignal-ssl',
    abstract:
      'We formulate a contrastive masking autoencoder trained on 100,000+ hours of continuous electro-cardiac and photoplethysmographic telemetry, showing transferability to low-data clinical downstream tasks.',
    highlight: '94.2% top-1 accuracy on rare arrhythmia classification with only 10 annotated patient trajectories.',
    bibtex: `@article{zhao2023selfsupervised,
  title={Self-Supervised Representation Learning for Multimodal Bio-Signals},
  author={Zhao, K. and Lin, H. and Sharma, R.},
  journal={NeurIPS Workshop on Health Time Series},
  year={2023},
  doi={10.xxxx/example6}
}`,
    createdAt: '2023-12-05T11:00:00.000Z'
  }
];

function sortPublications(pubs: PublicationServer[]): PublicationServer[] {
  return [...pubs].sort((a, b) => {
    if (b.year !== a.year) return b.year - a.year;
    return (b.createdAt || "").localeCompare(a.createdAt || "") || b.id.localeCompare(a.id);
  });
}

function getPublicationsData(): PublicationServer[] {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(PUBLICATIONS_FILE)) {
      fs.writeFileSync(PUBLICATIONS_FILE, JSON.stringify(INITIAL_PUBLICATIONS, null, 2), "utf-8");
      return INITIAL_PUBLICATIONS;
    }
    const raw = fs.readFileSync(PUBLICATIONS_FILE, "utf-8");
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return INITIAL_PUBLICATIONS;
  } catch (err) {
    console.error("Error reading publications file, falling back:", err);
    return INITIAL_PUBLICATIONS;
  }
}

function savePublicationsData(pubs: PublicationServer[]): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(PUBLICATIONS_FILE, JSON.stringify(pubs, null, 2), "utf-8");
  } catch (err) {
    console.error("Error saving publications data:", err);
    throw err;
  }
}

// GET /api/publications
app.get("/api/publications", (req, res) => {
  try {
    const token = extractToken(req);
    const session = getSession(token || undefined);
    const isAdmin = !!session;

    let list = getPublicationsData();
    if (!isAdmin) {
      list = list.filter((p: any) => p.published !== false);
    }
    return res.json({ success: true, publications: sortPublications(list) });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: "Failed to fetch publications", error: err?.message });
  }
});

// POST /api/publications (newest first)
app.post("/api/publications", requireAdminAuth, (req, res) => {
  try {
    const list = getPublicationsData();
    const { title, authors, journal, year, topic, doiUrl, pdfUrl, codeUrl, abstract, highlight, bibtex, published } = req.body;

    if (!title || !authors || !journal || !year || !topic || !abstract) {
      return res.status(400).json({ success: false, message: "Title, authors, journal, year, topic, and abstract are required." });
    }

    const newPub: PublicationServer = {
      id: `pub-${Date.now()}`,
      title: title.trim(),
      authors: authors.trim(),
      journal: journal.trim(),
      year: Number(year) || new Date().getFullYear(),
      topic,
      doiUrl: doiUrl?.trim() || "#",
      pdfUrl: pdfUrl?.trim() || "#",
      codeUrl: codeUrl?.trim() || undefined,
      abstract: abstract.trim(),
      highlight: highlight?.trim() || undefined,
      bibtex: bibtex?.trim() || `@article{mindh${Date.now()},\n  title={${title}},\n  author={${authors}},\n  journal={${journal}},\n  year={${year}}\n}`,
      published: published !== false,
      createdAt: new Date().toISOString(),
    };

    // Prepend to list so newest entry appears first
    const updated = [newPub, ...list];
    savePublicationsData(updated);
    return res.status(201).json({ success: true, message: "Publication added successfully", publication: newPub, publications: sortPublications(updated) });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: "Failed to create publication", error: err?.message });
  }
});

// PUT /api/publications/:id
app.put("/api/publications/:id", requireAdminAuth, (req, res) => {
  try {
    const { id } = req.params;
    const list = getPublicationsData();
    const index = list.findIndex((p) => p.id === id);

    if (index === -1) {
      return res.status(404).json({ success: false, message: `Publication with ID ${id} not found.` });
    }

    const existing = list[index];
    const updatedPub: PublicationServer = {
      ...existing,
      ...req.body,
      id: existing.id,
      year: req.body.year ? Number(req.body.year) : existing.year,
      published: req.body.published !== undefined ? Boolean(req.body.published) : (existing as any).published,
    };

    const updated = [...list];
    updated[index] = updatedPub;
    savePublicationsData(updated);

    return res.json({ success: true, message: "Publication updated successfully", publication: updatedPub, publications: sortPublications(updated) });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: "Failed to update publication", error: err?.message });
  }
});

// DELETE /api/publications/:id
app.delete("/api/publications/:id", requireAdminAuth, (req, res) => {
  try {
    const { id } = req.params;
    const list = getPublicationsData();
    const filtered = list.filter((p) => p.id !== id);

    if (filtered.length === list.length) {
      return res.status(404).json({ success: false, message: `Publication with ID ${id} not found.` });
    }

    savePublicationsData(filtered);
    return res.json({ success: true, message: "Publication removed successfully", publications: sortPublications(filtered) });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: "Failed to delete publication", error: err?.message });
  }
});

// PUT /api/publications-reorder
app.put("/api/publications-reorder", requireAdminAuth, (req, res) => {
  try {
    const { orderedIds } = req.body;
    if (!Array.isArray(orderedIds)) {
      return res.status(400).json({ success: false, message: "orderedIds must be an array of IDs" });
    }

    const list = getPublicationsData();
    const reordered: PublicationServer[] = [];

    orderedIds.forEach((id: string, idx: number) => {
      const found = list.find((p) => p.id === id);
      if (found) {
        reordered.push({ ...found, orderIndex: idx + 1 } as any);
      }
    });

    list.forEach((p) => {
      if (!orderedIds.includes(p.id)) {
        reordered.push({ ...p, orderIndex: reordered.length + 1 } as any);
      }
    });

    savePublicationsData(reordered);
    return res.json({ success: true, message: "Publications reordered successfully.", publications: reordered });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: "Failed to reorder publications", error: err?.message });
  }
});

// POST /api/publications/reset
app.post("/api/publications/reset", requireAdminAuth, (_req, res) => {
  try {
    savePublicationsData(INITIAL_PUBLICATIONS);
    return res.json({ success: true, message: "Publications reset to defaults.", publications: sortPublications(INITIAL_PUBLICATIONS) });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: "Failed to reset publications", error: err?.message });
  }
});

// ----------------------------------------------------
// FACILITIES API & DATA STORAGE
// ----------------------------------------------------

interface FacilityServer {
  id: string;
  title: string;
  tag: string;
  desc: string;
  specs: string[];
  status: string;
  iconName?: string;
  imageUrl?: string;
  orderIndex?: number;
}

const INITIAL_FACILITIES: FacilityServer[] = [
  {
    id: "optical-rig",
    title: "Contactless Optical Rig",
    tag: "Optics & Vision",
    iconName: "Camera",
    desc: "Calibrated ambient illumination array with synchronized reference contact PPG for contactless vital sign estimation algorithms.",
    specs: ["4K 120fps Chromatic Sensors", "Calibrated Lux Chamber (0-2000 lx)", "Synchronized Medical ECG/PPG Baseline"],
    status: "Operational",
    imageUrl: "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=800",
    orderIndex: 1
  },
  {
    id: "wearable-chamber",
    title: "Wearable Telemetry Chamber",
    tag: "Embedded Bio-Sensing",
    iconName: "Radio",
    desc: "Micro-power signal acquisition testbench for bio-impedance, galvanic skin response, and motion-artifact simulation.",
    specs: ["Sub-mW Power Analyzers", "Programmable Motion Artifact Gimbal", "Micro-Electrode Skin Interface Bench"],
    status: "Operational",
    imageUrl: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=800",
    orderIndex: 2
  },
  {
    id: "sim-cluster",
    title: "Clinical Simulation Cluster",
    tag: "Compute & Streaming",
    iconName: "Server",
    desc: "Dedicated high-throughput compute cluster for sequential state-space modeling, triage risk calibration, and synthetic patient generation.",
    specs: ["GPU Inference Blades (48GB VRAM)", "Low-Latency Bedside Stream Pipeline (<16ms)", "Synthetic EHR Sandbox Isolation"],
    status: "24/7 Compute",
    imageUrl: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=800",
    orderIndex: 3
  },
  {
    id: "phantom-workstation",
    title: "Phantom Imaging Workstation",
    tag: "Acoustic & Volumetric",
    iconName: "Microscope",
    desc: "Volumetric slice analysis and diffusion prior testbed for synthetic anatomical phantoms and low-dose imaging reconstruction.",
    specs: ["Tissue-Equivalent Polyacrylamide Phantoms", "Sparse-Sampling Simulators", "3D Deformable Motion Visualizers"],
    status: "Operational",
    imageUrl: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&q=80&w=800",
    orderIndex: 4
  },
  {
    id: "prosodic-lab",
    title: "Prosodic & Affect Chamber",
    tag: "Acoustic Biomarkers",
    iconName: "Headphones",
    desc: "Acoustically isolated chamber for continuous vocal prosody, pupil dilation tracking, and simulated cognitive workload protocols.",
    specs: ["Acoustic Isolation (<22 dBA ambient)", "High-Fidelity Studio Condenser Mics", "Binocular 250Hz Infrared Eye Tracker"],
    status: "Active Protocols",
    imageUrl: "https://images.unsplash.com/photo-1507668077129-56e32842fceb?auto=format&fit=crop&q=80&w=800",
    orderIndex: 5
  },
  {
    id: "xai-bedside",
    title: "XAI Bedside Clinical Suite",
    tag: "Human-in-the-Loop",
    iconName: "ShieldCheck",
    desc: "Clinician-in-the-loop audit suite evaluating concept bottleneck interpretability, counterfactual recourse, and alert fatigue reduction.",
    specs: ["Dual Bedside High-DPI Monitors", "Interactive Saliency Audit Logging", "Clinician Usability Latency Profiler"],
    status: "Clinical Trials",
    imageUrl: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&q=80&w=800",
    orderIndex: 6
  }
];

function getFacilitiesData(): FacilityServer[] {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(FACILITIES_FILE)) {
      fs.writeFileSync(FACILITIES_FILE, JSON.stringify(INITIAL_FACILITIES, null, 2), "utf-8");
      return INITIAL_FACILITIES;
    }
    const raw = fs.readFileSync(FACILITIES_FILE, "utf-8");
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return INITIAL_FACILITIES;
  } catch (err) {
    console.error("Error reading facilities file, falling back:", err);
    return INITIAL_FACILITIES;
  }
}

function saveFacilitiesData(facilities: FacilityServer[]): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(FACILITIES_FILE, JSON.stringify(facilities, null, 2), "utf-8");
  } catch (err) {
    console.error("Error saving facilities data:", err);
    throw err;
  }
}

// GET /api/facilities
app.get("/api/facilities", (req, res) => {
  try {
    const token = extractToken(req);
    const session = getSession(token || undefined);
    const isAdmin = !!session;

    let list = getFacilitiesData();
    if (!isAdmin) {
      list = list.filter((f: any) => f.published !== false);
    }
    return res.json({ success: true, facilities: list.sort((a, b) => (a.orderIndex ?? 999) - (b.orderIndex ?? 999)) });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: "Failed to fetch facilities", error: err?.message });
  }
});

// POST /api/facilities
app.post("/api/facilities", requireAdminAuth, (req, res) => {
  try {
    const list = getFacilitiesData();
    const { title, tag, desc, specs, status, iconName, imageUrl, published } = req.body;

    if (!title || !tag || !desc) {
      return res.status(400).json({ success: false, message: "Title, tag, and desc are required." });
    }

    const newFacility: FacilityServer = {
      id: `facility-${Date.now()}`,
      title: title.trim(),
      tag: tag.trim(),
      desc: desc.trim(),
      specs: Array.isArray(specs) ? specs : [],
      status: status || "Operational",
      iconName: iconName || "Cpu",
      imageUrl: imageUrl?.trim() || "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=800",
      orderIndex: list.length + 1,
      published: published !== false,
    } as any;

    const updated = [...list, newFacility];
    saveFacilitiesData(updated);
    return res.status(201).json({ success: true, message: "Facility added successfully", facility: newFacility, facilities: updated });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: "Failed to create facility", error: err?.message });
  }
});

// PUT /api/facilities/:id
app.put("/api/facilities/:id", requireAdminAuth, (req, res) => {
  try {
    const { id } = req.params;
    const list = getFacilitiesData();
    const index = list.findIndex((f) => f.id === id);

    if (index === -1) {
      return res.status(404).json({ success: false, message: `Facility with ID ${id} not found.` });
    }

    const updatedFacility: FacilityServer = {
      ...list[index],
      ...req.body,
      id: list[index].id,
      published: req.body.published !== undefined ? Boolean(req.body.published) : (list[index] as any).published,
    };

    const updated = [...list];
    updated[index] = updatedFacility;
    saveFacilitiesData(updated);

    return res.json({ success: true, message: "Facility updated successfully", facility: updatedFacility, facilities: updated });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: "Failed to update facility", error: err?.message });
  }
});

// DELETE /api/facilities/:id
app.delete("/api/facilities/:id", requireAdminAuth, (req, res) => {
  try {
    const { id } = req.params;
    const list = getFacilitiesData();
    const filtered = list.filter((f) => f.id !== id);

    if (filtered.length === list.length) {
      return res.status(404).json({ success: false, message: `Facility with ID ${id} not found.` });
    }

    saveFacilitiesData(filtered);
    return res.json({ success: true, message: "Facility removed successfully", facilities: filtered });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: "Failed to delete facility", error: err?.message });
  }
});

// PUT /api/facilities-reorder
app.put("/api/facilities-reorder", requireAdminAuth, (req, res) => {
  try {
    const { orderedIds } = req.body;
    if (!Array.isArray(orderedIds)) {
      return res.status(400).json({ success: false, message: "orderedIds must be an array of IDs" });
    }

    const list = getFacilitiesData();
    const reordered: FacilityServer[] = [];

    orderedIds.forEach((id: string, idx: number) => {
      const found = list.find((f) => f.id === id);
      if (found) {
        reordered.push({ ...found, orderIndex: idx + 1 });
      }
    });

    list.forEach((f) => {
      if (!orderedIds.includes(f.id)) {
        reordered.push({ ...f, orderIndex: reordered.length + 1 });
      }
    });

    saveFacilitiesData(reordered);
    return res.json({ success: true, message: "Facilities reordered successfully.", facilities: reordered });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: "Failed to reorder facilities", error: err?.message });
  }
});

// POST /api/facilities/reset
app.post("/api/facilities/reset", requireAdminAuth, (_req, res) => {
  try {
    saveFacilitiesData(INITIAL_FACILITIES);
    return res.json({ success: true, message: "Facilities reset to defaults.", facilities: INITIAL_FACILITIES });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: "Failed to reset facilities", error: err?.message });
  }
});

// ----------------------------------------------------
// CONTACT & INQUIRIES API
// ----------------------------------------------------

interface ContactInquiryServer {
  id: string;
  name: string;
  email: string;
  affiliation?: string;
  role?: string;
  interestType: string;
  message: string;
  createdAt: string;
  status?: string;
}

function getInquiriesData(): ContactInquiryServer[] {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(INQUIRIES_FILE)) {
      fs.writeFileSync(INQUIRIES_FILE, JSON.stringify([], null, 2), "utf-8");
      return [];
    }
    const raw = fs.readFileSync(INQUIRIES_FILE, "utf-8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error("Error reading inquiries file:", err);
    return [];
  }
}

function saveInquiriesData(inquiries: ContactInquiryServer[]): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(INQUIRIES_FILE, JSON.stringify(inquiries, null, 2), "utf-8");
  } catch (err) {
    console.error("Error saving inquiries:", err);
    throw err;
  }
}

// GET /api/contact: Retrieve submitted inquiries
app.get("/api/contact", (_req, res) => {
  try {
    const list = getInquiriesData();
    return res.json({ success: true, inquiries: list });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: "Failed to fetch inquiries", error: err?.message });
  }
});

// POST /api/contact: Submit an inquiry
app.post("/api/contact", (req, res) => {
  try {
    const { name, email, affiliation, role, interestType, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ success: false, message: "Name, email, and message are required." });
    }

    const list = getInquiriesData();
    const newInquiry: ContactInquiryServer = {
      id: `inq-${Date.now()}`,
      name: name.trim(),
      email: email.trim(),
      affiliation: affiliation?.trim() || undefined,
      role: role?.trim() || undefined,
      interestType: interestType?.trim() || "General Inquiry",
      message: message.trim(),
      createdAt: new Date().toISOString(),
      status: "New",
    };

    const updated = [newInquiry, ...list];
    saveInquiriesData(updated);

    return res.status(201).json({
      success: true,
      message: "Thank you for contacting MINDH Lab! Your inquiry has been securely logged and our team will get in touch shortly.",
      inquiry: newInquiry,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: "Failed to save inquiry", error: err?.message });
  }
});

// ----------------------------------------------------
// VITE MIDDLEWARE & SERVER STARTUP
// ----------------------------------------------------

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`MINDH Lab Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
});
