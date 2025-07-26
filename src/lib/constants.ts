// Data Science Skills
export const DATA_SCIENCE_SKILLS = [
  'Python',
  'R',
  'SQL',
  'Machine Learning',
  'Deep Learning',
  'Data Visualization',
  'Statistical Analysis',
  'TensorFlow',
  'PyTorch',
  'Pandas',
  'NumPy',
  'Scikit-learn',
  'Tableau',
  'Power BI',
  'Apache Spark',
  'Hadoop',
  'AWS',
  'Azure',
  'GCP',
  'Docker',
  'Kubernetes',
  'Git',
  'Jupyter',
  'NoSQL',
  'MongoDB',
  'PostgreSQL',
  'ETL',
  'Data Mining',
  'NLP',
  'Computer Vision',
  'Time Series Analysis',
  'A/B Testing',
  'Business Intelligence',
  'Data Engineering',
  'MLOps',
] as const;

// Job Categories
export const JOB_CATEGORIES = [
  'Data Analysis',
  'Machine Learning',
  'Data Engineering',
  'Data Science',
  'Business Intelligence',
  'Data Visualization',
  'Statistical Analysis',
  'AI/ML Engineering',
  'Data Architecture',
  'Research & Analytics',
] as const;

// Experience Levels
export const EXPERIENCE_LEVELS = [
  'Entry Level (0-2 years)',
  'Mid Level (2-5 years)',
  'Senior Level (5-10 years)',
  'Expert Level (10+ years)',
] as const;

// Subscription Plans
export const SUBSCRIPTION_PLANS = {
  FREELANCER: {
    name: 'Freelancer',
    price: 20,
    interval: 'month',
    features: [
      'Apply to unlimited jobs',
      'Create professional profile',
      'Direct client messaging',
      'Skill verification badges',
      'Priority support',
    ],
  },
  CLIENT: {
    name: 'Client',
    price: 30,
    interval: 'month',
    features: [
      'Post unlimited jobs',
      'Access to curated talent pool',
      'Advanced search filters',
      'Candidate matching',
      'Priority support',
      'Analytics dashboard',
    ],
  },
} as const;

// Job Types
export const JOB_TYPES = [
  'Full-time Contract',
  'Part-time Contract',
  'Project-based',
  'Hourly',
  'Fixed Price',
] as const;

// Location Types
export const LOCATION_TYPES = [
  'Remote',
  'On-site',
  'Hybrid',
] as const;
