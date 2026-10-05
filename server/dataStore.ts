import fs from "fs";
import path from "path";
import {
  HomepageConfig,
  AboutConfig,
  ResearchPillar,
  GalleryItem,
  SiteSettings,
} from "../src/types";

const DATA_DIR = path.join(process.cwd(), "data");

export const HOMEPAGE_FILE = path.join(DATA_DIR, "homepage.json");
export const ABOUT_FILE = path.join(DATA_DIR, "about.json");
export const RESEARCH_FILE = path.join(DATA_DIR, "research.json");
export const GALLERY_FILE = path.join(DATA_DIR, "gallery.json");
export const SETTINGS_FILE = path.join(DATA_DIR, "settings.json");

const INITIAL_HOMEPAGE: HomepageConfig = {
  heroBadge: "Translational Digital Health & Informatics",
  heroTitle: "Precision Physiological Sensing & AI-Driven Clinical Informatics",
  heroHighlight: "Precision Physiological Sensing",
  heroSubtitle:
    "Pioneering contactless vital signs, edge-deployable bio-signal processing, and continuous bedside intelligence to prevent acute clinical deterioration.",
  stats: [
    { label: "15,000+", value: "Monitored Cohort", detail: "Sub-second anomaly alert latency" },
    { label: "±1.4 BPM", value: "rPPG Pulse Error", detail: "Validated contactless optical sensing" },
    { label: "<16 ms", value: "Bedside Inference", detail: "Edge neural network telemetry" },
    { label: "4.6 hrs", value: "Early Warning", detail: "Self-supervised bio-representation" },
  ],
  calloutTitle: "Accelerating Translational Digital Health Together",
  calloutSubtitle:
    "Whether you are a hospital clinical team seeking non-contact monitoring validation, a researcher interested in joint NSF/NIH proposals, or an industry partner, we invite you to connect.",
  calloutButtonText: "Visit Contact & Inquiry Page",
  calloutButtonLink: "/contact",
};

const INITIAL_ABOUT: AboutConfig = {
  missionTitle: "Translating Bedside Bio-Signals into Timely Clinical Interventions",
  missionDescription:
    "The Medical Informatics and Digital Health (MINDH) Laboratory develops non-invasive physiological monitoring technologies, contactless optical sensors, and foundation models designed for direct deployment at the clinical bedside and in decentralized outpatient settings.",
  translationPhilosophy:
    "Every algorithmic advancement in our laboratory is evaluated directly alongside practicing intensivists, cardiologists, and nurses to ensure that predictive power matches real-world clinical workflow constraints.",
  directorName: "David Patel, MD, PhD",
  directorRole: "Director, Medical Informatics & Digital Health Laboratory",
  directorBio:
    "Professor of Biomedical Informatics and Associate Professor of Medicine. Dr. Patel leads multi-center investigations funded by the NIH, NSF, and clinical research foundations, focusing on continuous physiological signal processing and non-invasive cardiovascular sensing.",
  directorImage:
    "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=600",
  milestones: [
    {
      year: "2020",
      title: "Laboratory Founded",
      desc: "Established with core support from University Health Sciences and Clinical Research Consortium.",
    },
    {
      year: "2022",
      title: "First In-Hospital Contactless Trial",
      desc: "Deployed non-contact camera sensing across surgical telemetry beds.",
    },
    {
      year: "2023",
      title: "NIH R01 Cuffless BP Consortium",
      desc: "Multi-center grant awarded for continuous cuffless hemodynamic tracking.",
    },
    {
      year: "2024",
      title: "Clinical Foundation Model Published",
      desc: "Landmark paper accepted to Nature Digital Medicine on video rPPG.",
    },
  ],
};

const INITIAL_RESEARCH: ResearchPillar[] = [
  {
    id: "rppg",
    title: "Contactless Physiological Sensing",
    subtitle: "Video-based rPPG & Thermal Imaging",
    description:
      "Pioneering optical camera-based algorithms that extract pulse, respiration, and microvascular hemodynamics without physical skin contact, ideal for neonatal ICU, infectious disease isolation, and telemedicine.",
    technologies: [
      "rPPG Signal Extraction",
      "Spatial-Temporal Attention",
      "Sub-pixel Motion Magnification",
      "Ambient Noise Filtering",
    ],
    metrics: [
      { label: "Pulse Accuracy", value: "±1.4 BPM" },
      { label: "Sampling Rate", value: "30 - 120 FPS" },
    ],
    icon: "Activity",
    grantNumber: "NIH R01-EB032104",
    status: "Active Clinical Trials",
    published: true,
    orderIndex: 0,
  },
  {
    id: "multimodal",
    title: "Biomedical Signal Processing",
    subtitle: "Multimodal ECG, PPG & Hemodynamics",
    description:
      "Developing rigorous mathematical pipelines for cuffless continuous blood pressure estimation, pulse transit time (PTT) derivation, and adaptive artifact cancellation in ambulatory monitors.",
    technologies: [
      "Wavelet Decomposition",
      "Kalman Filtering",
      "Beat-to-Beat PTT Tracking",
      "Motion Artifact Suppression",
    ],
    metrics: [
      { label: "BP Deviation", value: "<4 mmHg" },
      { label: "Signal Quality Index", value: "98.2%" },
    ],
    icon: "Cpu",
    grantNumber: "NSF IIS-2104921",
    status: "Bench & Pilot Validation",
    published: true,
    orderIndex: 1,
  },
  {
    id: "clinical-ai",
    title: "Translational Clinical AI",
    subtitle: "Bedside Decision Support & Foundation Models",
    description:
      "Translating deep neural networks and self-supervised biomedical foundation models into actionable, clinically verified decision support tools that integrate seamlessly with hospital Electronic Health Records (EHR).",
    technologies: [
      "Self-Supervised Learning",
      "EHR FHIR Interoperability",
      "Model Explainability (XAI)",
      "Prospective Trials",
    ],
    metrics: [
      { label: "Inference Latency", value: "<16 ms" },
      { label: "Clinical Partners", value: "5+ Hospital Systems" },
    ],
    icon: "Network",
    grantNumber: "NIH R21-LM014298",
    status: "Multi-Center Prospective Study",
    published: true,
    orderIndex: 2,
  },
  {
    id: "interventions",
    title: "Digital Health Interventions",
    subtitle: "Continuous Patient Monitoring & Decentralized Care",
    description:
      "Designing closed-loop digital therapeutic interventions and passive bio-telemetry pipelines that allow clinicians to detect acute hemodynamic decompensation hours before overt clinical deterioration.",
    technologies: [
      "Edge Computing",
      "HIPAA/GDPR Compliant Streams",
      "Early Warning Scores (NEWS2/qSOFA)",
      "Wearable IoT",
    ],
    metrics: [
      { label: "Early Detection", value: "~4.6 hrs" },
      { label: "Monitored Cohort", value: "15,000+ patients" },
    ],
    icon: "HeartPulse",
    grantNumber: "Clinical Translational Award 2023",
    status: "Active Deployment",
    published: true,
    orderIndex: 3,
  },
];

const INITIAL_GALLERY: GalleryItem[] = [
  {
    id: "gal-1",
    title: "High-Speed Optical Sensing Gantry",
    caption: "Synchronized dual-spectrum RGB and near-infrared camera array with calibrated ambient lux control.",
    category: "Experimental Setup",
    imageUrl: "https://images.unsplash.com/photo-1581093588401-fbb62a02f120?auto=format&fit=crop&q=80&w=1000",
    date: "2024-05-10",
    published: true,
    orderIndex: 0,
  },
  {
    id: "gal-2",
    title: "Pulsatile Hemodynamic Simulator Suite",
    caption: "Fluke Biomedical physiological signal simulator connected to programmable pulsatile fluid phantom.",
    category: "Experimental Setup",
    imageUrl: "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&q=80&w=1000",
    date: "2024-04-18",
    published: true,
    orderIndex: 1,
  },
  {
    id: "gal-3",
    title: "High-Density GPU Compute Rack",
    caption: "Dual 8x NVIDIA A100 node cluster dedicated to training self-supervised bio-signal foundation models.",
    category: "Experimental Setup",
    imageUrl: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&q=80&w=1000",
    date: "2024-03-22",
    published: true,
    orderIndex: 2,
  },
  {
    id: "gal-4",
    title: "Clinical ICU Telemetry Validation",
    caption: "Bedside validation in medical intensive care unit with simultaneous multi-lead ECG and invasive catheter lines.",
    category: "Clinical Site",
    imageUrl: "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=1000",
    date: "2024-02-14",
    published: true,
    orderIndex: 3,
  },
  {
    id: "gal-5",
    title: "IEEE EMBC 2024 Keynote Presentation",
    caption: "Prof. Patel presenting real-time contactless blood pressure benchmarks to the international informatics community.",
    category: "Conference",
    imageUrl: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&q=80&w=1000",
    date: "2024-07-16",
    published: true,
    orderIndex: 4,
  },
];

const INITIAL_SETTINGS: SiteSettings = {
  labName: "MINDH Laboratory",
  tagline: "Medical Informatics and Digital Health Laboratory",
  headerLogoUrl: "",
  footerLogoUrl: "",
  bottomRightLogoUrl: "",
  bottomRightLogoText: "Division of Medical Informatics & Health Sciences",
  bottomRightLogoLink: "",
  contactEmail: "contact@mindh-lab.org",
  contactPhone: "+1 (415) 555-0198",
  address: "Division of Medical Informatics, Health Sciences Center, University Medical Campus",
  roomLocation: "Health Sciences Tower, Suite 740, Clinical Simulation Wing",
  visitingHours: "Monday - Friday: 09:00 - 17:00 (By Appointment)",
  socialLinks: {
    linkedin: "https://www.linkedin.com/company/medical-informatics-and-digital-health-lab/",
    twitter: "https://twitter.com/MINDHLab",
    github: "https://github.com/mindh-lab",
    scholar: "https://scholar.google.com/citations?user=mindh-lab",
    youtube: "https://youtube.com/@mindh-lab",
  },
};

function readJsonFile<T>(filePath: string, fallback: T): T {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify(fallback, null, 2), "utf-8");
      return fallback;
    }
    const raw = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(raw) as T;
  } catch (err) {
    console.warn(`Error reading ${filePath}, using fallback:`, err);
    return fallback;
  }
}

function writeJsonFile<T>(filePath: string, data: T): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error(`Error saving ${filePath}:`, err);
    throw err;
  }
}

export function getHomepageData(): HomepageConfig {
  return readJsonFile<HomepageConfig>(HOMEPAGE_FILE, INITIAL_HOMEPAGE);
}
export function saveHomepageData(data: HomepageConfig): void {
  writeJsonFile(HOMEPAGE_FILE, data);
}

export function getAboutData(): AboutConfig {
  return readJsonFile<AboutConfig>(ABOUT_FILE, INITIAL_ABOUT);
}
export function saveAboutData(data: AboutConfig): void {
  writeJsonFile(ABOUT_FILE, data);
}

export function getResearchData(): ResearchPillar[] {
  return readJsonFile<ResearchPillar[]>(RESEARCH_FILE, INITIAL_RESEARCH);
}
export function saveResearchData(data: ResearchPillar[]): void {
  writeJsonFile(RESEARCH_FILE, data);
}

export function getGalleryData(): GalleryItem[] {
  return readJsonFile<GalleryItem[]>(GALLERY_FILE, INITIAL_GALLERY);
}
export function saveGalleryData(data: GalleryItem[]): void {
  writeJsonFile(GALLERY_FILE, data);
}

export function getSettingsData(): SiteSettings {
  return readJsonFile<SiteSettings>(SETTINGS_FILE, INITIAL_SETTINGS);
}
export function saveSettingsData(data: SiteSettings): void {
  writeJsonFile(SETTINGS_FILE, data);
}
