import { Publication, ResearchPillar, LabNewsItem, TeamMember, Collaborator, LabFacility } from '../types';
import teamSeedData from '../../data/team.json';

export const LAB_PUBLICATIONS: Publication[] = [
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
  },
  {
    id: 'pub-3',
    title: 'Continuous Blood Pressure Estimation via Multimodal Signal Analysis',
    authors: 'J. Mercer, A. Rostami, V. Chen, T. Bradley',
    journal: 'Sensors / Biomedical Signal Processing and Control',
    year: 2023,
    topic: 'Signal Processing',
    doiUrl: 'https://doi.org/10.xxxx/example3',
    pdfUrl: 'https://arxiv.org/abs/example3',
    codeUrl: 'https://github.com/mindh-lab/continuous-bp-multimodal',
    abstract:
      'A novel non-invasive methodology coupling photoplethysmography (PPG) and electrocardiography (ECG) pulse transit time (PTT) calculations with adaptive Kalman filtering for beat-to-beat systolic and diastolic pressure tracking.',
    highlight: 'Meets AAMI standards with SBP error < 4.2 mmHg and DBP < 3.8 mmHg.',
    bibtex: `@article{mercer2023continuous,
  title={Continuous Blood Pressure Estimation via Multimodal Signal Analysis},
  author={Mercer, J. and Rostami, A. and Chen, V. and Bradley, T.},
  journal={Sensors / Biomedical Signal Processing and Control},
  year={2023},
  doi={10.xxxx/example3}
}`,
  },
  {
    id: 'pub-4',
    title: 'Self-Supervised Contrastive Representation Learning for Arrhythmia Detection in Wearable ECG',
    authors: 'K. Zhao, S. Kapoor, J. Mercer, MINDH Clinical Team',
    journal: 'Lancet Digital Health / IEEE JBHI',
    year: 2024,
    topic: 'Clinical AI',
    doiUrl: 'https://doi.org/10.xxxx/example4',
    pdfUrl: 'https://arxiv.org/abs/example4',
    codeUrl: 'https://github.com/mindh-lab/ecg-contrastive-arrhythmia',
    abstract:
      'Pre-training transformer backbones across 1.2M unannotated ambulatory single-lead ECG segments yielding high generalizability on paroxysmal atrial fibrillation and premature ventricular contractions.',
    highlight: 'AUC-ROC 0.962 on independent multi-hospital prospective clinical trial cohort.',
    bibtex: `@article{zhao2024arrhythmia,
  title={Self-Supervised Contrastive Representation Learning for Arrhythmia Detection in Wearable ECG},
  author={Zhao, K. and Kapoor, S. and Mercer, J.},
  journal={Lancet Digital Health / IEEE JBHI},
  year={2024},
  doi={10.xxxx/example4}
}`,
  },
  {
    id: 'pub-5',
    title: 'Non-Invasive Vascular Compliance Assessment via High-Speed Video Photoplethysmography',
    authors: 'E. Vance, R. Sharma, D. Patel',
    journal: 'IEEE Journal of Biomedical and Health Informatics',
    year: 2024,
    topic: 'Physiological Monitoring',
    doiUrl: 'https://doi.org/10.xxxx/example5',
    pdfUrl: 'https://arxiv.org/abs/example5',
    codeUrl: 'https://github.com/mindh-lab/vascular-compliance-vppg',
    abstract:
      'Quantifies systemic vascular resistance and arterial stiffness through dicrotic notch analysis extracted from contactless facial and subungual microcirculation optical recordings.',
    highlight: 'Strong correlation with applanation tonometry gold standard (r = 0.88).',
    bibtex: `@article{vance2024vascular,
  title={Non-Invasive Vascular Compliance Assessment via High-Speed Video Photoplethysmography},
  author={Vance, E. and Sharma, R. and Patel, D.},
  journal={IEEE JBHI},
  year={2024},
  doi={10.xxxx/example5}
}`,
  },
];

export const RESEARCH_PILLARS: ResearchPillar[] = [
  {
    id: 'rppg',
    title: 'Contactless Physiological Sensing',
    subtitle: 'Video-based rPPG & Thermal Imaging',
    description:
      'Pioneering optical camera-based algorithms that extract pulse, respiration, and microvascular hemodynamics without physical skin contact, ideal for neonatal ICU, infectious disease isolation, and telemedicine.',
    technologies: ['rPPG Signal Extraction', 'Spatial-Temporal Attention', 'Sub-pixel Motion Magnification', 'Ambient Noise Filtering'],
    metrics: [
      { label: 'Pulse Accuracy', value: '±1.4 BPM' },
      { label: 'Sampling Rate', value: '30 - 120 FPS' },
    ],
    icon: 'Activity',
  },
  {
    id: 'multimodal',
    title: 'Biomedical Signal Processing',
    subtitle: 'Multimodal ECG, PPG & Hemodynamics',
    description:
      'Developing rigorous mathematical pipelines for cuffless continuous blood pressure estimation, pulse transit time (PTT) derivation, and adaptive artifact cancellation in ambulatory monitors.',
    technologies: ['Wavelet Decomposition', 'Kalman Filtering', 'Beat-to-Beat PTT Tracking', 'Motion Artifact Suppression'],
    metrics: [
      { label: 'BP Deviation', value: '<4 mmHg' },
      { label: 'Signal Quality Index', value: '98.2%' },
    ],
    icon: 'Cpu',
  },
  {
    id: 'clinical-ai',
    title: 'Translational Clinical AI',
    subtitle: 'Bedside Decision Support & Foundation Models',
    description:
      'Translating deep neural networks and self-supervised biomedical foundation models into actionable, clinically verified decision support tools that integrate seamlessly with hospital Electronic Health Records (EHR).',
    technologies: ['Self-Supervised Learning', 'EHR FHIR Interoperability', 'Model Explainability (XAI)', 'Prospective Trials'],
    metrics: [
      { label: 'Inference Latency', value: '<16 ms' },
      { label: 'Clinical Partners', value: '5+ Hospital Systems' },
    ],
    icon: 'Network',
  },
  {
    id: 'interventions',
    title: 'Digital Health Interventions',
    subtitle: 'Continuous Patient Monitoring & Decentralized Care',
    description:
      'Designing closed-loop digital therapeutic interventions and passive bio-telemetry pipelines that allow clinicians to detect acute hemodynamic decompensation hours before overt clinical deterioration.',
    technologies: ['Edge Computing', 'HIPAA/GDPR Compliant Streams', 'Early Warning Scores (NEWS2/qSOFA)', 'Wearable IoT'],
    metrics: [
      { label: 'Early Detection', value: '~4.6 hrs' },
      { label: 'Monitored Cohort', value: '15,000+ patients' },
    ],
    icon: 'HeartPulse',
  },
];

export const LAB_NEWS: LabNewsItem[] = [
  {
    id: 'news-1',
    date: '2024-08-15',
    category: 'Paper Accepted',
    title: 'Paper on Contactless rPPG Accepted to Nature Digital Medicine',
    description: 'Our clinical trial evaluating video-based vital sign extraction across 120 ICU beds has been accepted for publication. Demonstrating sub-1.5 BPM mean absolute error without skin contact.',
    summary: 'Our clinical trial evaluating video-based vital sign extraction in 120 ICU beds has been accepted for publication.',
    image: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&q=80&w=800',
    linkText: 'Read Publication',
    linkUrl: '#publications',
    createdAt: '2024-08-15T08:00:00.000Z',
  },
  {
    id: 'news-2',
    date: '2024-06-20',
    category: 'Clinical Pilot',
    title: 'Translational Clinical Pilot Launched with Regional Medical Center',
    description: 'Commenced prospective hospital deployment of our edge-AI hemodynamic warning system across surgical step-down wards, streaming real-time bedside telemetry with sub-16ms latency.',
    summary: 'Commenced prospective hospital deployment of our edge-AI hemodynamic warning system across surgical step-down wards.',
    image: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=800',
    linkText: 'Learn More',
    linkUrl: '#research',
    createdAt: '2024-06-20T10:30:00.000Z',
  },
  {
    id: 'news-3',
    date: '2024-04-10',
    category: 'Grant Award',
    title: 'NIH R01 Grant Awarded for Continuous Cuffless Blood Pressure Research',
    description: 'A 4-year multi-center investigation into multimodal optical and bioimpedance sensor fusion for ambulatory cardiovascular assessment and non-invasive hypertension tracking.',
    summary: 'A 4-year multi-center investigation into multimodal optical and bioimpedance sensor fusion for ambulatory cardiovascular assessment.',
    image: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&q=80&w=800',
    linkText: 'Inquire Collaboration',
    linkUrl: '#contact',
    createdAt: '2024-04-10T14:15:00.000Z',
  },
  {
    id: 'news-4',
    date: '2024-02-28',
    category: 'Keynote',
    title: 'Keynote at IEEE EMBC: Foundations of Bedside Computational Physiology',
    description: 'Prof. David Patel presented our latest findings on self-supervised foundation models trained on continuous multi-lead ECG and photoplethysmography streams.',
    summary: 'Keynote presentation at IEEE Engineering in Medicine and Biology Society on wearable physiological monitoring.',
    image: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&q=80&w=800',
    linkText: 'View Presentation Details',
    linkUrl: 'https://www.linkedin.com/company/medical-informatics-and-digital-health-lab/',
    createdAt: '2024-02-28T09:00:00.000Z',
  },
];

export const LAB_TEAM: TeamMember[] = teamSeedData as unknown as TeamMember[];

export const LAB_COLLABORATORS: Collaborator[] = [
  {
    id: 'collab-1',
    name: 'Massachusetts General Hospital & Harvard Medical School',
    shortName: 'Mass General / Harvard',
    category: 'Clinical & Hospital',
    location: 'Boston, Massachusetts, USA',
    logoUrl: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=400',
    description:
      'Primary clinical trial partner for multi-bed ICU contactless optical telemetry, continuous neonatal hemodynamic monitoring, and acute sepsis early warning deployment.',
    jointFocus: [
      'Zero-Contact ICU Hemodynamics',
      'Continuous Pediatric Monitoring',
      'Infectious Disease Isolation Telemetry',
      'Clinical Protocol Adjudication'
    ],
    keyContacts: ['Dr. Sarah Al-Mansoor, MD (ICU Director)', 'Prof. Robert Lang, MD (Pulmonary Medicine)'],
    activeTrials: [
      'Contactless ICU Vital Sign Extraction Trial (NCT05128911)',
      'Pediatric Respiratory Distress Early Warning Pilot'
    ],
    websiteUrl: 'https://www.massgeneral.org',
    isFeatured: true,
    orderIndex: 1,
  },
  {
    id: 'collab-2',
    name: 'Johns Hopkins Medicine & Whiting School of Engineering',
    shortName: 'Johns Hopkins University',
    category: 'Academic Institution',
    location: 'Baltimore, Maryland, USA',
    logoUrl: 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&q=80&w=400',
    description:
      'Pioneering collaborative research on explainable concept bottleneck architectures, physician alert fatigue mitigation, and human-in-the-loop clinical decision support.',
    jointFocus: [
      'Explainable AI (XAI) for Critical Care',
      'Concept Bottleneck Architectures',
      'Physician Trust & Recourse Audits',
      'Bedside Diagnostic Usability'
    ],
    keyContacts: ['Dr. Marcus Thorne, PhD (Assistant Professor)', 'Prof. Elena Rostova, MD, PhD'],
    activeTrials: [
      'Multi-Hospital Clinician Diagnostic Usability Benchmark',
      'Counterfactual Explanations in Emergency Triage'
    ],
    websiteUrl: 'https://www.hopkinsmedicine.org',
    isFeatured: true,
    orderIndex: 2,
  },
  {
    id: 'collab-3',
    name: 'Stanford Health Care - Division of Cardiovascular Health',
    shortName: 'Stanford Health Care',
    category: 'Clinical & Hospital',
    location: 'Stanford, California, USA',
    logoUrl: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=400',
    description:
      'Multi-center clinical site evaluating wearable photoplethysmography and bio-impedance sensor fusion for ambulatory continuous blood pressure tracking and arrhythmia prediction.',
    jointFocus: [
      'Cuffless Continuous Arterial Pressure',
      'Ambulatory Arrhythmia Telemetry',
      'Photoplethysmography Sensor Fusion',
      'AAMI Protocol Validation'
    ],
    keyContacts: ['Prof. David K. Patel, MD, PhD (Adjunct Investigator)', 'Dr. Michael Chen, MD, FACC'],
    activeTrials: [
      'CardioState Ambulatory Hypertension Cohort (1,500 Patients)',
      'Beat-to-Beat PTT Hemodynamic Validation'
    ],
    websiteUrl: 'https://stanfordhealthcare.org',
    isFeatured: true,
    orderIndex: 3,
  },
  {
    id: 'collab-4',
    name: 'MIT Institute for Medical Engineering and Science (IMES)',
    shortName: 'MIT IMES & CSAIL',
    category: 'Academic Institution',
    location: 'Cambridge, Massachusetts, USA',
    logoUrl: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&q=80&w=400',
    description:
      'Joint theoretical engineering on foundational physiological representation learning, high-dimensional wavelet manifolds, and edge-deployable temporal transformer models.',
    jointFocus: [
      'Self-Supervised Biosignal Foundation Models',
      'CardioState-10M Pre-training Benchmark',
      'Wavelet Signal Decomposition',
      'Edge Microprocessor Optimization'
    ],
    keyContacts: ['Prof. Alex Vance, PhD', 'Dr. Clara Zhang, PhD (Postdoctoral Affiliate)'],
    activeTrials: [
      '10-Million-Hour Ambience Waveform Benchmark',
      'Cross-Modal ECG-to-PPG Synthetic Reconstruction'
    ],
    websiteUrl: 'https://imes.mit.edu',
    isFeatured: true,
    orderIndex: 4,
  },
  {
    id: 'collab-5',
    name: 'Philips Healthcare - Clinical Informatics Research',
    shortName: 'Philips Healthcare',
    category: 'Industry & Technology',
    location: 'Cambridge, MA & Eindhoven, Netherlands',
    logoUrl: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=400',
    description:
      'Industry co-development of HL7 FHIR real-time physiological telemetry interfaces and next-generation bedside patient monitor micro-services.',
    jointFocus: [
      'HL7 FHIR Interoperability Protocols',
      'Patient Monitor Hardware Integration',
      'Medical Device Regulatory Pathways',
      'Real-Time Telemetry Streaming'
    ],
    keyContacts: ['Dr. Jennifer Krause, PhD (Principal Scientist)', 'Markus Lindqvist (VP Clinical Systems)'],
    activeTrials: [
      'Next-Generation Bedside Edge Module Pilot',
      'Hospital Electronic Health Record Integration Verification'
    ],
    websiteUrl: 'https://www.philips.com/healthcare',
    isFeatured: true,
    orderIndex: 5,
  },
  {
    id: 'collab-6',
    name: 'NVIDIA Healthcare & Life Sciences (Inception Partner)',
    shortName: 'NVIDIA Healthcare',
    category: 'Industry & Technology',
    location: 'Santa Clara, California, USA',
    logoUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=400',
    description:
      'Accelerating bedside inference latency using NVIDIA Clara Holoscan and TensorRT, achieving sub-16ms multimodal model execution directly at point-of-care.',
    jointFocus: [
      'Clara Holoscan Deployment Architecture',
      'Sub-16ms Real-Time Inference Validation',
      'TensorRT Biosignal Quantization',
      'Bedside GPU Acceleration'
    ],
    keyContacts: ['Healthcare AI Solutions Engineering Team'],
    activeTrials: [
      'Real-Time 60 FPS rPPG Video Processing Benchmarks',
      'Hospital Point-of-Care Neural Engine Testing'
    ],
    websiteUrl: 'https://www.nvidia.com/en-us/industries/healthcare-and-life-sciences',
    isFeatured: true,
    orderIndex: 6,
  },
  {
    id: 'collab-7',
    name: 'National Institutes of Health (NIH - NHLBI & NIBIB)',
    shortName: 'National Institutes of Health',
    category: 'Project Funding Companies',
    location: 'Bethesda, Maryland, USA',
    logoUrl: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&q=80&w=600',
    description:
      'Primary federal grant sponsor for multi-year translational research on cuffless continuous arterial blood pressure monitoring and contactless optical physiological sensing.',
    jointFocus: [
      'Grant NIH R01 HL158921 (Continuous BP)',
      'Grant NIH R21 EB032114 (Contactless ICU Telemetry)',
      'Translational Clinical Science Governance',
      'Open-Science Bio-Signal Benchmarks'
    ],
    keyContacts: ['Division of Cardiovascular Sciences Program Directorate'],
    activeTrials: [
      '4-Year Multi-Center Translation Grant Pipeline',
      'Physiological Telemetry Open Research Repository'
    ],
    websiteUrl: 'https://www.nih.gov',
    isFeatured: true,
    orderIndex: 7,
  },
  {
    id: 'collab-8',
    name: 'National Science Foundation (NSF - Smart & Connected Health)',
    shortName: 'National Science Foundation',
    category: 'Project Funding Companies',
    location: 'Alexandria, Virginia, USA',
    logoUrl: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=600',
    description:
      'Federal co-sponsor funding algorithmic foundations of edge-computing spatial-temporal neural networks and sub-16ms bedside streaming models under the SCH initiative.',
    jointFocus: [
      'NSF IIS-2104921 (Smart & Connected Health)',
      'CPS: Real-Time Closed-Loop Critical Care',
      'Edge Machine Learning Verification'
    ],
    keyContacts: ['Information & Intelligent Systems Division'],
    activeTrials: [
      'Mathematical Wavelet Decomposition for ICU Artifacts',
      'Bedside Privacy-Preserving Federated Learning'
    ],
    websiteUrl: 'https://www.nsf.gov',
    isFeatured: true,
    orderIndex: 8,
  },
  {
    id: 'collab-9',
    name: 'American Heart Association (AHA) - Health Tech Collaborative',
    shortName: 'American Heart Association',
    category: 'Project Funding Companies',
    location: 'Dallas, Texas, USA',
    logoUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=600',
    description:
      'Supporting decentralized clinical trials and cardiovascular health equity research to provide ambulatory hemodynamic telemetry across underserved patient populations.',
    jointFocus: [
      'Innovative Project Award: Wearable Optical Hemodynamics',
      'Cardiovascular Health Disparity Reduction',
      'Decentralized Tele-Cardiology Protocols',
      'Longitudinal Patient Engagement'
    ],
    keyContacts: ['AHA Institute for Precision Cardiovascular Medicine'],
    activeTrials: [
      'Community Ambulatory Hypertension Longitudinal Study',
      'Mobile Health Equivalence Trials'
    ],
    websiteUrl: 'https://www.heart.org',
    isFeatured: false,
    orderIndex: 9,
  },
];

export const LAB_FACILITIES: LabFacility[] = [
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


