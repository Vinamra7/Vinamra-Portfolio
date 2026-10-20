// Public content from the supplied résumé. Keep contact destinations fixed.
import resume from "./resume.json";

export const contact = {
  email: "mishravinamra5@gmail.com",
  phone: "+91 9173255769",
  linkedin: "https://www.linkedin.com/in/vinamra-mishra-vm/",
  github: "https://github.com/Vinamra7",
  whatsapp: "https://wa.me/919173255769",
  resume: `${resume.path}?v=${resume.version}`,
};
export const about = [
  "I’m Vinamra, a software engineer in Bengaluru. At Visa’s Cybersource, I work on identity services for a platform with 5M+ merchant accounts: migrations, access control and keeping systems in sync.",
  "Before that, I worked on serverless services at Openreach. I got started with competitive programming; these days I’m also building in Rust, contributing to open source and working on InScope.",
];
export const experience = [
  {
    company: "Visa",
    team: "Cybersource",
    role: "Software Engineer",
    dates: "JUN 2025 — PRESENT",
    summary: "Identity infrastructure behind a global payments platform.",
    details: [
      "Migrated user-management APIs and React portal flows to Java 17 / Vert.x, with request-header signature checks and automatic legacy fallback for a zero-downtime rollout.",
      "Built Kafka synchronization to the legacy database, holding partition offsets across three retries before routing failed events to a dead-letter queue with operator replay.",
      "Implemented SAML single sign-on and directory-group provisioning across 100+ multi-tenant roles, plus a zero-downtime SHA-256 to SHA-512 password-hashing upgrade.",
    ],
    technologies: ["JAVA 17", "VERT.X", "KAFKA", "SAML"],
    metric: "5M+",
    metricLabel: "IDENTITY AT SCALE",
    metricDescription: "merchant accounts across the platform",
    metricFootnote: "MERCHANT LIFECYCLE & ACCESS",
  },
  {
    company: "Openreach",
    team: "BT Group",
    role: "Software Development Engineer",
    dates: "AUG 2024 — JUN 2025",
    summary:
      "Making serverless order processing lighter, faster, and less expensive.",
    details: [
      "Migrated an order-processing service from Spring JPA to Quarkus and stored procedures for serverless deployment.",
      "Optimized JDBC and database calls to reduce network roundtrips and cut response time by 40%.",
      "Reduced serverless costs by 45% through more efficient resource use and stored-procedure execution.",
    ],
    technologies: ["JAVA", "QUARKUS", "JDBC", "SQL", "SERVERLESS"],
    metric: "60%",
    metricLabel: "FASTER FROM THE START",
    metricDescription: "reduction in cold-start time",
    metricFootnote: "40% LOWER RESPONSE TIME",
  },
  {
    company: "Openreach",
    team: "BT Group",
    role: "Software Engineer Intern",
    dates: "JAN 2024 — JUL 2024",
    summary:
      "Taking a product-availability service into a serverless environment.",
    details: [
      "Migrated the service to Quarkus 3.8, reducing startup time by 40% and enabling deployment on AWS Lambda.",
      "Built resilient SOAP / ESB integration, sustaining 99.9% uptime across 1,000 daily availability checks.",
    ],
    technologies: ["QUARKUS", "AWS LAMBDA", "SOAP", "ESB"],
    metric: "99.9%",
    metricLabel: "BUILT TO KEEP RUNNING",
    metricDescription: "uptime across availability checks",
    metricFootnote: "1,000 DAILY CHECKS",
  },
];
export const projects = [
  {
    name: "Arroyo",
    category: "Open source",
    year: "2025",
    description:
      "Added string-slice argument support to Rust user-defined aggregate functions in a stream-processing engine.",
    stack: "RUST / STREAM PROCESSING",
    url: "https://github.com/ArroyoSystems/arroyo/pull/870",
    mark: "a",
    symbol: "arroyo-symbol",
  },
  {
    name: "InScope",
    category: "Projects",
    year: "2026",
    description:
      "A login-free AI chat for this portfolio, built in Rust on Cloudflare Workers. A relevance classifier, Turnstile, signed sessions and atomic D1 quotas keep questions in scope and limit abuse.",
    stack: "RUST / WEBASSEMBLY / CLOUDFLARE WORKERS / D1",
    url: "https://github.com/Vinamra7/InBound",
    mark: "[ i ]",
    symbol: "inscope-symbol",
  },
  {
    name: "Zen Browser",
    category: "Open source",
    year: "2024",
    description:
      "Removed the MSYS2 / WSL dependency from Windows builds, helping make native builds possible.",
    stack: "WINDOWS / BUILD TOOLING",
    url: "https://github.com/zen-browser/www/pull/409/commits",
    mark: "z",
    symbol: "zen-symbol",
  },
];
