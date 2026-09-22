// Public content from the supplied résumé. Keep contact destinations fixed.
export const contact = {
  email: "mishravinamra5@gmail.com",
  phone: "+91 9173255769",
  linkedin: "https://www.linkedin.com/in/vinamra-mishra-vm/",
  github: "https://github.com/Vinamra7",
  whatsapp: "https://wa.me/919173255769",
  resume: "/Vinamra-Mishra-Resume.pdf",
};
export const experience = [
  {
    company: "Visa",
    team: "Cybersource",
    role: "Software Engineer",
    dates: "JUN 2025 — PRESENT",
    summary: "Identity infrastructure behind a global payments platform.",
    details: [
      "Building Java 17 / Vert.x services for merchant lifecycle management, with dual-database persistence and Kafka event streaming.",
      "Implementing SAML single sign-on and directory-group provisioning across a multi-tenant hierarchy of 100+ roles.",
      "Shipped a zero-downtime password-hashing upgrade and an internal MCP tool for plain-English database queries used by 500+ engineers daily.",
    ],
    technologies: ["JAVA 17", "VERT.X", "KAFKA", "SAML", "MCP"],
    metric: "5M+",
    metricLabel: "IDENTITY AT SCALE",
    metricDescription: "user accounts across the platform",
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
    name: "Cacher",
    category: "Projects",
    year: "2023",
    description:
      "A distributed cache with Bloom filters, consistent hashing, and automated scaling. Built to make finding data a little less expensive.",
    stack: "REDIS / NODE.JS / AZURE / POWERSHELL",
    url: "https://github.com/Vinamra7/cacher",
    mark: "{ / }",
    symbol: "cache-symbol",
  },
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
