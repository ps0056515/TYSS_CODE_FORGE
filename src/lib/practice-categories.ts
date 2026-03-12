/**
 * CodeChef-aligned practice categories: Programming Languages, Data Structures,
 * Algorithms, Company-wise, and Projects. Used on the Practice page for browse filters.
 */

export type PracticeCategoryItem = { id: string; name: string };

/** Programming languages supported / listed on CodeChef-style practice. id matches Problem.languages. */
export const PROGRAMMING_LANGUAGES: PracticeCategoryItem[] = [
  { id: "c", name: "C" },
  { id: "cpp", name: "C++" },
  { id: "java", name: "Java" },
  { id: "python", name: "Python" },
  { id: "javascript", name: "JavaScript" },
  { id: "rust", name: "Rust" },
  { id: "go", name: "Go" },
  { id: "kotlin", name: "Kotlin" },
  { id: "csharp", name: "C#" },
  { id: "ruby", name: "Ruby" },
  { id: "php", name: "PHP" },
  { id: "swift", name: "Swift" },
];

/** Data structures (CodeChef Foundation + DSA). id = tag used in problems. */
export const DATA_STRUCTURES: PracticeCategoryItem[] = [
  { id: "arrays", name: "Arrays" },
  { id: "strings", name: "Strings" },
  { id: "stacks", name: "Stacks" },
  { id: "queues", name: "Queues" },
  { id: "linked-list", name: "Linked List" },
  { id: "trees", name: "Trees" },
  { id: "graphs", name: "Graphs" },
  { id: "hashmap", name: "Hash Maps" },
  { id: "heaps", name: "Heaps" },
  { id: "vectors", name: "Vectors" },
  { id: "2d-arrays", name: "2D Arrays" },
  { id: "prefix-sum", name: "Prefix Sum" },
  { id: "frequency-array", name: "Frequency Arrays" },
];

/** Algorithms (CodeChef syllabus). id = tag used in problems. */
export const ALGORITHMS: PracticeCategoryItem[] = [
  { id: "recursion", name: "Recursion" },
  { id: "greedy", name: "Greedy" },
  { id: "dp", name: "Dynamic Programming" },
  { id: "sorting", name: "Sorting" },
  { id: "binary-search", name: "Binary Search" },
  { id: "searching", name: "Searching" },
  { id: "string-searching", name: "String Searching" },
  { id: "math", name: "Math / Number Theory" },
  { id: "asymptotic", name: "Complexity (Big-O)" },
  { id: "backtracking", name: "Backtracking" },
  { id: "two-pointers", name: "Two Pointers" },
  { id: "sliding-window", name: "Sliding Window" },
];

/** Company-wise interview prep (CodeChef product-based track). id = tag e.g. company-google. */
export const COMPANIES: PracticeCategoryItem[] = [
  { id: "company-google", name: "Google" },
  { id: "company-amazon", name: "Amazon" },
  { id: "company-microsoft", name: "Microsoft" },
  { id: "company-meta", name: "Meta (Facebook)" },
  { id: "company-adobe", name: "Adobe" },
  { id: "company-flipkart", name: "Flipkart" },
  { id: "company-linkedin", name: "LinkedIn" },
  { id: "company-walmart", name: "Walmart Labs" },
  { id: "company-ebay", name: "eBay" },
  { id: "company-ola", name: "Ola" },
  { id: "company-olx", name: "OLX" },
  { id: "company-apple", name: "Apple" },
  { id: "company-netflix", name: "Netflix" },
  { id: "company-uber", name: "Uber" },
  { id: "company-prep", name: "General Company Prep" },
];

/** Project / use-case problem categories (CodeChef-style project practice). */
export const PROJECT_CATEGORIES: PracticeCategoryItem[] = [
  { id: "project", name: "Use-case / Codebase Projects" },
  { id: "web", name: "Web / Full-stack" },
  { id: "api", name: "APIs & Backend" },
  { id: "dsa-project", name: "DSA Projects" },
];
