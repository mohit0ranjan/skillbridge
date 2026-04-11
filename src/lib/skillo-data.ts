export type Internship = {
  id: string;
  title: string;
  domain: string;
  duration: string;
  level: string;
  price: number;
  tasks: string[];
  includes: string[];
  description: string;
  iconName: string;
  weeklyTasks: WeeklyTask[];
};

export type WeeklyTask = {
  week: number;
  title: string;
  type: string;
  estimatedTime: string;
  description: string;
  steps: string[];
  resources?: string[];
  example?: string;
};

export const internships: Internship[] = [
  {
    id: "ai-ml-internship",
    title: "AI & Machine Learning",
    domain: "Engineering",
    duration: "4 Weeks",
    level: "Beginner Friendly",
    price: 29900,
    iconName: "Cpu",
    tasks: [
      "Build a simple prediction model",
      "Analyze a real-world dataset",
      "Create a model evaluation report",
      "Deploy a basic ML API",
    ],
    includes: ["Starter notebooks", "Dataset access", "Model review", "Verified certificate"],
    description: "Learn machine learning fundamentals through guided practical implementation. From data cleaning to model deployment.",
    weeklyTasks: [
      { week: 1, title: "Data Exploration & Cleaning", type: "Analysis", estimatedTime: "3-4 hours", description: "Load a real dataset, explore patterns, and clean messy data using Python and Pandas.", steps: ["Download the provided dataset (CSV)", "Load it in a Jupyter notebook", "Identify missing values and outliers", "Clean the dataset and export"], resources: ["Pandas documentation", "Sample notebook"], example: "Clean dataset with documented preprocessing steps" },
      { week: 2, title: "Build a Prediction Model", type: "Development", estimatedTime: "4-5 hours", description: "Train a simple ML model (linear regression or decision tree) to predict outcomes from your cleaned data.", steps: ["Split data into train/test sets", "Choose a model (start with LinearRegression)", "Train and evaluate with accuracy metrics", "Save model predictions"], resources: ["Scikit-learn fundamentals"], example: "Trained predictive model with evaluation metrics" },
      { week: 3, title: "Model Evaluation Report", type: "Research", estimatedTime: "3-4 hours", description: "Write an evaluation report with visualizations comparing model performance.", steps: ["Generate confusion matrix / metrics", "Create 3+ visualizations (matplotlib/seaborn)", "Write findings professionally", "Export as PDF report"], resources: ["Matplotlib guidelines"], example: "Professional PDF report with structured insights" },
      { week: 4, title: "Deploy a Basic API", type: "Deployment", estimatedTime: "3-4 hours", description: "Wrap your trained model into a simple Flask/FastAPI endpoint that accepts input and returns predictions.", steps: ["Create a simple API endpoint", "Load your saved model", "Accept input data and return predictions", "Document the API with examples"], resources: ["FastAPI documentation"], example: "Functional API endpoint with usage documentation" },
    ],
  },
  {
    id: "web-development-internship",
    title: "Web Development",
    domain: "Engineering",
    duration: "2 Weeks",
    level: "Beginner Friendly",
    price: 19900,
    iconName: "Code2",
    tasks: [
      "Build a responsive landing page",
      "Deploy your project on the web",
      "Write a short project summary for your resume",
    ],
    includes: ["Task templates", "Submission reviews", "Verified certificate"],
    description: "Start with core web fundamentals and complete guided deployment tasks mirroring real industry workflows.",
    weeklyTasks: [
      { week: 1, title: "Build a Responsive Landing Page", type: "Development", estimatedTime: "5-6 hours", description: "Create a modern, responsive landing page using semantic HTML, CSS, and basic JavaScript.", steps: ["Set up project structure", "Build semantic sections with responsive layouts", "Implement navigation and footer", "Ensure cross-device compatibility"], resources: ["CSS responsive design guidelines"], example: "Standard compliant, responsive landing page" },
      { week: 1, title: "Deploy Production Website", type: "Deployment", estimatedTime: "1-2 hours", description: "Deploy your web application live using standard hosting infrastructure.", steps: ["Initialize Git repository", "Push codebase to GitHub", "Configure CI/CD with Vercel or Netlify", "Verify live deployment access"], resources: ["Deployment documentation"], example: "Live application URL accessible globally" },
      { week: 2, title: "Technical Project Summary", type: "Documentation", estimatedTime: "1-2 hours", description: "Draft a concise project summary suitable for technical portfolios.", steps: ["Outline project architecture", "List core technologies utilized", "Include repository and live links", "Format for standard resume inclusion"], resources: ["Technical writing guidelines"], example: "Structured technical summary with stack details" },
    ],
  },
  {
    id: "digital-marketing-internship",
    title: "Digital Marketing",
    domain: "Marketing",
    duration: "2 Weeks",
    level: "Beginner Friendly",
    price: 9900,
    iconName: "LineChart",
    tasks: [
      "Create a campaign brief",
      "Design social media assets",
      "Write an SEO optimized article",
      "Analyze campaign performance",
      "Create final presentation",
    ],
    includes: ["Ready-to-use briefs", "Mentor checkpoints", "Verified certificate"],
    description: "Execute practical marketing workflows by researching, building, and analyzing a complete digital campaign.",
    weeklyTasks: [
      { week: 1, title: "Social Media Campaign Brief", type: "Research", estimatedTime: "2-3 hours", description: "Research competitor brands and draft a structured campaign strategy brief.", steps: ["Select an industry category", "Conduct competitor analysis", "Draft strategy: audience, tone, content pillars", "Format as professional PDF"], resources: ["Strategy brief template"], example: "Structured campaign strategy document" },
      { week: 1, title: "Marketing Asset Design", type: "Design", estimatedTime: "3-4 hours", description: "Create platform-optimized social media assets based on the approved brief.", steps: ["Select design tool", "Create 3 distinct feed assets", "Maintain brand consistency", "Export in standard formats"], resources: ["Platform dimension specifications"], example: "Collection of branded social media assets" },
      { week: 1, title: "SEO Content Generation", type: "Content", estimatedTime: "2-3 hours", description: "Draft SEO-optimized long-form content aligned with the campaign strategy.", steps: ["Perform keyword research", "Draft structured content with semantic headers", "Include meta tags and descriptions", "Ensure high readability score"], resources: ["SEO content guidelines"], example: "Optimized article with target keyword integration" },
      { week: 2, title: "Performance Data Analysis", type: "Analytics", estimatedTime: "2-3 hours", description: "Process raw campaign metrics to extract actionable insights.", steps: ["Import sample dataset", "Calculate standard metrics (Reach, Engagement)", "Identify performance trends", "Document findings in structured report"], resources: ["Data analysis documentation"], example: "Analytical report detailing performance metrics" },
      { week: 2, title: "Post-Campaign Presentation", type: "Presentation", estimatedTime: "2-3 hours", description: "Synthesize all campaign deliverables into a final stakeholder presentation.", steps: ["Structure presentation flow", "Include brief, assets, content, and data", "Summarize key learnings", "Export as standard professional deck"], resources: ["Stakeholder update template"], example: "Comprehensive presentation deck ready for review" },
    ],
  },
  {
    id: "data-analytics-internship",
    title: "Data Analytics",
    domain: "Analytics",
    duration: "2 Weeks",
    level: "Beginner Friendly",
    price: 19900,
    iconName: "Database",
    tasks: [
      "Process raw corporate dataset",
      "Develop visualization dashboard",
      "Translate data into business insights",
    ],
    includes: ["Starter dataset", "Dashboard guidance", "Verified certificate"],
    description: "Process raw datasets and develop clear corporate visualization dashboards to extract business value.",
    weeklyTasks: [
      { week: 1, title: "Exploratory Data Analysis", type: "Analysis", estimatedTime: "3-4 hours", description: "Process provided dataset to perform exploratory analysis and uncover structural trends.", steps: ["Import raw dataset", "Calculate baseline statistical metrics", "Identify anomalies and key trends", "Document process methodology"], resources: ["Statistical analysis foundations"], example: "Methodical analysis document with initial findings" },
      { week: 1, title: "Develop Business Dashboard", type: "Visualization", estimatedTime: "3-4 hours", description: "Design an interactive visualization dashboard summarizing key metrics.", steps: ["Determine primary KPIs", "Select appropriate chart typologies", "Design clean grid layout", "Implement standard color coding"], resources: ["Data visualization best practices"], example: "Structured dashboard displaying key performance indicators" },
      { week: 2, title: "Executive Insights Report", type: "Documentation", estimatedTime: "2-3 hours", description: "Translate analytical findings into a non-technical executive summary.", steps: ["Distill complex data into core findings", "Draft concise bullet points", "Propose actionable recommendations", "Format as standard executive memo"], resources: ["Executive communication guidelines"], example: "Concise executive summary with actionable insights" },
    ],
  },
];

export const faqs = [
  { question: "Do I need any experience?", answer: "No. All programs are beginner-friendly and designed for students with no prior experience." },
  { question: "When can I start?", answer: "Immediately after enrollment. Work at your own pace within the program duration." },
  { question: "Can employers verify my certificate?", answer: "Yes. Every certificate has a unique ID that can be verified at skillbridge.in/verify." },
  { question: "How much time does it take?", answer: "About 2-4 hours per week. Tasks are flexible and fit around your college schedule." },
  { question: "What if I get stuck?", answer: "Every task includes clear instructions and resources. You can also raise a support ticket from your dashboard." },
];

export const reviews = [
  { name: "Siddharth Menon", college: "IIT Madras", text: "The structured approach mimics real corporate environments perfectly. Highly recommended.", rating: 5 },
  { name: "Aanya Gupta", college: "Delhi University", text: "Professional workflows and excellent documentation provided a solid foundation.", rating: 5 },
  { name: "Rohan Desai", college: "VJTI Mumbai", text: "Clear task progression resulting in a verifiable output for my professional profile.", rating: 4 },
];

export const certificates = [
  { id: "SB-2026-7842", studentName: "Aarav Sharma", college: "IIT Delhi", internship: "Digital Marketing", issueDate: "12 April 2026", status: "Verified" },
  { id: "SB-2026-9011", studentName: "Neha Verma", college: "NIT Trichy", internship: "Web Development", issueDate: "08 April 2026", status: "Verified" },
  { id: "SB-2026-3487", studentName: "Priya Reddy", college: "BITS Pilani", internship: "Data Analytics", issueDate: "10 April 2026", status: "Verified" },
];

export function getInternshipById(id: string) {
  return internships.find((internship) => internship.id === id);
}

export function getCertificateById(id: string) {
  return certificates.find((certificate) => certificate.id.toUpperCase() === id.toUpperCase());
}
