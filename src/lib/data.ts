/** A single lesson or topic within a module */
export type SyllabusLesson = {
  title: string;
  description?: string;
};

/** A module in the course table of contents */
export type SyllabusModule = {
  title: string;
  description?: string;
  lessons: (string | SyllabusLesson)[];
};

export type Course = {
  id: string;
  title: string;
  tagline: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  modules: number;
  learners: string;
  /** Table of contents: modules with detailed lessons (title + optional description) */
  syllabus?: SyllabusModule[];
};

/** Use case shown to students for project-style problems */
export type UseCase = {
  id: string;
  title: string;
  description: string;
};

/** How we run and test a submitted codebase (project problems) */
export type RunConfig = {
  language: "javascript" | "python";
  /** Entry file we expect in the zip (e.g. solution.js, index.js). Default: solution.js / solution.py */
  entryFile?: string;
  /** Command to run after unpacking (e.g. "node run.js" — run.js is our test runner). */
  testCommand: string;
  timeoutSeconds: number;
};

export type ProblemType = "algorithm" | "project";

export type Problem = {
  slug: string;
  title: string;
  difficulty: "Easy" | "Medium" | "Hard";
  tags: string[];
  languages: ("javascript" | "python" | "java" | "cpp")[];
  statement: string;
  /** Algorithm problems: I/O examples. Project problems: can be empty. */
  examples: { input: string; output: string; explanation?: string }[];
  hiddenTests?: { input: string; output: string }[];
  scoring?: {
    mode: "verdict" | "subtasks";
    subtasks?: {
      name: string;
      points: number;
      tests: { input: string; output: string }[];
    }[];
  };
  /** Problem type: algorithm (single-file, I/O) or project (codebase, use cases). Default: algorithm */
  type?: ProblemType;
  /** For type === "project": use cases shown to students; assessment runs test suite. */
  useCases?: UseCase[];
  /** For type === "project": how to run the test runner against submitted code. */
  runConfig?: RunConfig;
};

export const courses: Course[] = [
  {
    id: "py-dsa",
    title: "Python + Beginner DSA",
    tagline: "Start from zero, end with problem-solving muscle.",
    level: "Beginner",
    modules: 6,
    learners: "450k+",
    syllabus: [
      {
        title: "Module 1: Python foundations",
        description: "Variables, control flow, and basic I/O",
        lessons: [
          { title: "Input and output", description: "Reading from stdin, printing to stdout" },
          { title: "Loops", description: "for, while, and iterating over sequences" },
          { title: "Functions", description: "Defining and calling functions, return values" },
          { title: "Strings", description: "Slicing, formatting, and string methods" }
        ]
      },
      {
        title: "Module 2: Core DSA",
        description: "Essential data structures and recursion",
        lessons: [
          { title: "Arrays and lists", description: "Indexing, traversal, and common patterns" },
          { title: "Hash maps", description: "Dictionaries and frequency counting" },
          { title: "Stacks and queues", description: "LIFO/FIFO and problem-solving" },
          { title: "Recursion", description: "Base cases, recurrence, and backtracking" }
        ]
      },
      {
        title: "Module 3: Interview practice",
        description: "Patterns and complexity",
        lessons: [
          { title: "Common patterns", description: "Two pointers, sliding window, prefix sum" },
          { title: "Edge cases", description: "Empty input, boundaries, overflow" },
          { title: "Complexity", description: "Time and space analysis" }
        ]
      }
    ]
  },
  {
    id: "js-frontend",
    title: "React for Frontend",
    tagline: "Hooks, patterns, and real UI builds.",
    level: "Intermediate",
    modules: 4,
    learners: "170k+",
    syllabus: [
      {
        title: "Module 1: React basics",
        description: "JSX, components, and state",
        lessons: [
          { title: "JSX", description: "Syntax, expressions, and styling" },
          { title: "Components", description: "Function and class components" },
          { title: "Props and state", description: "Passing data and local state" }
        ]
      },
      {
        title: "Module 2: Hooks",
        description: "Built-in and custom hooks",
        lessons: [
          { title: "useEffect", description: "Side effects and cleanup" },
          { title: "useMemo and useCallback", description: "Memoization and performance" },
          { title: "Custom hooks", description: "Reusable logic and composition" }
        ]
      },
      {
        title: "Module 3: Patterns",
        description: "Forms, data fetching, and state",
        lessons: [
          { title: "Forms", description: "Controlled inputs and validation" },
          { title: "Data fetching", description: "useEffect, loading, and error handling" },
          { title: "State management", description: "Context, lifting state, and libraries" }
        ]
      }
    ]
  },
  {
    id: "java-backend",
    title: "Java Backend Developer",
    tagline: "APIs, DBs, and backend essentials.",
    level: "Intermediate",
    modules: 7,
    learners: "230k+",
    syllabus: [
      {
        title: "Module 1: Java core",
        description: "OOP, collections, and exceptions",
        lessons: [
          { title: "OOP", description: "Classes, inheritance, interfaces" },
          { title: "Collections", description: "List, Set, Map, and streams" },
          { title: "Exceptions", description: "Handling and defining exceptions" }
        ]
      },
      {
        title: "Module 2: APIs",
        description: "REST and security basics",
        lessons: [
          { title: "REST", description: "Design, HTTP methods, and status codes" },
          { title: "Auth basics", description: "Sessions, JWT, and OAuth" },
          { title: "Validation", description: "Input validation and error responses" }
        ]
      },
      {
        title: "Module 3: Persistence",
        description: "Databases and transactions",
        lessons: [
          { title: "SQL", description: "Queries, joins, and indexing" },
          { title: "ORM basics", description: "JPA/Hibernate and entities" },
          { title: "Transactions", description: "ACID and isolation levels" }
        ]
      }
    ]
  }
];

export function getCourse(id: string) {
  return courses.find((c) => c.id === id) ?? null;
}

/** Practice page sections (CodeChef-style: All, Topic-wise, Company Prep, Beginner, Projects) */
export type PracticeSectionId = "all" | "topic-wise" | "company-prep" | "beginner" | "projects";

export type PracticeSection = {
  id: PracticeSectionId;
  name: string;
  shortName: string;
  description: string;
  /** Filter problems for this section. */
  filter: (p: Problem) => boolean;
  /** If true, show topic-wise grouping (by tag) inside this section. */
  groupByTag?: boolean;
};

export const practiceSections: PracticeSection[] = [
  {
    id: "all",
    name: "All Problems",
    shortName: "All",
    description: "Browse the full problem set. Use filters below to narrow by difficulty and tags.",
    filter: () => true,
    groupByTag: false
  },
  {
    id: "topic-wise",
    name: "Topic-wise Practice",
    shortName: "Topic-wise",
    description: "Practice by topic: arrays, strings, hashmap, math, and more. Build strength in one area at a time.",
    filter: () => true,
    groupByTag: true
  },
  {
    id: "company-prep",
    name: "Company Preparation",
    shortName: "Company Prep",
    description: "Curated problems for interview preparation. Focus on patterns and problems often asked in technical interviews.",
    filter: (p) => p.tags.some((t) => t === "company-prep" || t.startsWith("company-")),
    groupByTag: false
  },
  {
    id: "beginner",
    name: "Beginner / Get Started",
    shortName: "Beginner",
    description: "Easy problems to build confidence. Start here if you're new to coding or competitive programming.",
    filter: (p) => p.difficulty === "Easy",
    groupByTag: false
  },
  {
    id: "projects",
    name: "Project & Use-case Problems",
    shortName: "Projects",
    description: "Submit a codebase (ZIP) and get assessed on use cases. Real-world style tasks with multiple requirements.",
    filter: (p) => p.type === "project",
    groupByTag: false
  }
];

export const problems: Problem[] = [
  {
    slug: "sum-of-two",
    title: "Sum of Two Numbers",
    difficulty: "Easy",
    tags: ["math", "basics", "arrays"],
    languages: ["javascript", "python", "java", "cpp"],
    statement:
      "Given two integers a and b, print their sum. This problem is meant to verify your I/O and language setup.",
    examples: [
      { input: "2 3", output: "5", explanation: "2 + 3 = 5" },
      { input: "-10 7", output: "-3" }
    ],
    hiddenTests: [
      { input: "0 0", output: "0" },
      { input: "999999999 1", output: "1000000000" },
      { input: "-5 -6", output: "-11" }
    ]
  },
  {
    slug: "count-vowels",
    title: "Count Vowels",
    difficulty: "Easy",
    tags: ["strings", "loops", "company-prep", "company-microsoft"],
    languages: ["javascript", "python", "java", "cpp"],
    statement:
      "Given a string s, count how many vowels it contains (a, e, i, o, u) ignoring case.",
    examples: [{ input: "QSpiders", output: "2", explanation: "i and e are vowels." }],
    hiddenTests: [
      { input: "AEIOU", output: "5" },
      { input: "bcdfg", output: "0" },
      { input: "Interview Prep", output: "4" }
    ]
  },
  {
    slug: "two-sum-index",
    title: "Two Sum (Index Pair)",
    difficulty: "Medium",
    tags: ["arrays", "hashmap", "conditionals", "company-prep", "company-google", "company-amazon"],
    languages: ["javascript", "python", "java", "cpp"],
    statement:
      "Given an array of integers and a target, return indices of two numbers such that they add up to the target. Assume exactly one solution.",
    examples: [{ input: "nums=[2,7,11,15], target=9", output: "[0,1]" }],
    hiddenTests: [{ input: "nums=[3,2,4], target=6", output: "[1,2]" }],
    scoring: {
      mode: "subtasks",
      subtasks: [
        {
          name: "Basics",
          points: 40,
          tests: [{ input: "nums=[2,7,11,15], target=9", output: "[0,1]" }]
        },
        {
          name: "Edge cases",
          points: 60,
          tests: [{ input: "nums=[3,2,4], target=6", output: "[1,2]" }]
        }
      ]
    }
  },
  {
    slug: "cart-module",
    title: "Shopping Cart Module",
    difficulty: "Medium",
    tags: ["javascript", "project", "use-cases"],
    languages: ["javascript"],
    statement:
      "Implement a small shopping cart module that supports adding items, quantities, and computing the total. Your solution will be assessed against the use cases below. Submit your codebase as a ZIP containing **solution.js** that exports a function **createCart()** returning an object with: **addItem(productId, quantity)**, **getCount()** (total item count), **getTotal()** (total price). Assume product prices: A=5, B=3, C=10.",
    examples: [],
    type: "project",
    useCases: [
      {
        id: "uc1",
        title: "Add item and get count",
        description: "After adding an item (e.g. productId 'A', quantity 2), getCount() returns the total number of items (2)."
      },
      {
        id: "uc2",
        title: "Multiple products and total",
        description: "After adding product 'A' qty 10 (price 5) and product 'B' qty 2 (price 3), getTotal() returns the correct total (e.g. 56 if price is per-unit)."
      },
      {
        id: "uc3",
        title: "Update quantity",
        description: "Adding the same productId again updates the quantity (e.g. add A:2 then A:3 results in quantity 5 for A)."
      }
    ],
    runConfig: {
      language: "javascript",
      entryFile: "solution.js",
      testCommand: "node run.js",
      timeoutSeconds: 30
    }
  },
  // ---- Easy ----
  {
    slug: "reverse-string",
    title: "Reverse a String",
    difficulty: "Easy",
    tags: ["strings", "basics", "loops"],
    languages: ["javascript", "python", "java", "cpp"],
    statement: "Given a string s, output the string reversed. Example: \"hello\" → \"olleh\".",
    examples: [
      { input: "hello", output: "olleh" },
      { input: "Code", output: "edoC" }
    ],
    hiddenTests: [
      { input: "a", output: "a" },
      { input: "ab", output: "ba" }
    ]
  },
  {
    slug: "fizz-buzz",
    title: "Fizz Buzz",
    difficulty: "Easy",
    tags: ["loops", "conditionals", "math", "company-prep", "company-microsoft"],
    languages: ["javascript", "python", "java", "cpp"],
    statement: "Given an integer n, for each integer from 1 to n output: \"Fizz\" if divisible by 3, \"Buzz\" if by 5, \"FizzBuzz\" if by both, otherwise the number. Output one per line.",
    examples: [
      { input: "15", output: "1\n2\nFizz\n4\nBuzz\nFizz\n7\n8\nFizz\nBuzz\n11\nFizz\n13\n14\nFizzBuzz" }
    ],
    hiddenTests: [{ input: "5", output: "1\n2\nFizz\n4\nBuzz" }]
  },
  {
    slug: "max-of-three",
    title: "Maximum of Three Numbers",
    difficulty: "Easy",
    tags: ["conditionals", "math", "basics"],
    languages: ["javascript", "python", "java", "cpp"],
    statement: "Given three integers a, b, c (one per line or space-separated), output the maximum of the three.",
    examples: [
      { input: "1\n2\n3", output: "3" },
      { input: "10 5 8", output: "10" }
    ],
    hiddenTests: [
      { input: "-1 -2 -3", output: "-1" },
      { input: "7 7 7", output: "7" }
    ]
  },
  {
    slug: "factorial",
    title: "Factorial",
    difficulty: "Easy",
    tags: ["math", "recursion", "loops"],
    languages: ["javascript", "python", "java", "cpp"],
    statement: "Given a non-negative integer n, output n! (factorial). Assume n ≤ 20.",
    examples: [
      { input: "5", output: "120", explanation: "5! = 5×4×3×2×1 = 120" },
      { input: "0", output: "1" }
    ],
    hiddenTests: [
      { input: "1", output: "1" },
      { input: "10", output: "3628800" }
    ]
  },
  {
    slug: "check-prime",
    title: "Check Prime",
    difficulty: "Easy",
    tags: ["math", "loops", "conditionals"],
    languages: ["javascript", "python", "java", "cpp"],
    statement: "Given an integer n (2 ≤ n ≤ 10^6), output \"YES\" if n is prime, otherwise \"NO\".",
    examples: [
      { input: "7", output: "YES" },
      { input: "10", output: "NO" }
    ],
    hiddenTests: [
      { input: "2", output: "YES" },
      { input: "1", output: "NO" }
    ]
  },
  {
    slug: "palindrome-number",
    title: "Palindrome Number",
    difficulty: "Easy",
    tags: ["math", "strings", "company-prep", "company-google"],
    languages: ["javascript", "python", "java", "cpp"],
    statement: "Given an integer x, output \"YES\" if it is a palindrome (reads same backward), else \"NO\". Negative numbers are not palindromic.",
    examples: [
      { input: "121", output: "YES" },
      { input: "-121", output: "NO" },
      { input: "10", output: "NO" }
    ],
    hiddenTests: [
      { input: "0", output: "YES" },
      { input: "12321", output: "YES" }
    ]
  },
  {
    slug: "remove-duplicates-sorted",
    title: "Remove Duplicates from Sorted Array",
    difficulty: "Easy",
    tags: ["arrays", "two-pointers", "company-prep", "company-amazon"],
    languages: ["javascript", "python", "java", "cpp"],
    statement: "Given a sorted array of integers (space-separated), output the count of unique elements. You may output the unique array instead if the runner expects it.",
    examples: [
      { input: "1 1 2 2 3", output: "3" },
      { input: "1 2 3 4", output: "4" }
    ],
    hiddenTests: [
      { input: "1 1 1", output: "1" },
      { input: "1", output: "1" }
    ]
  },
  {
    slug: "first-non-repeating-char",
    title: "First Non-Repeating Character",
    difficulty: "Easy",
    tags: ["strings", "hashmap", "company-prep", "company-microsoft"],
    languages: ["javascript", "python", "java", "cpp"],
    statement: "Given a string s, output the first character that does not repeat (or -1 / empty if none). Assume lowercase letters.",
    examples: [
      { input: "leetcode", output: "l" },
      { input: "aabbcc", output: "-1" }
    ],
    hiddenTests: [
      { input: "a", output: "a" },
      { input: "zzyy", output: "z" }
    ]
  },
  {
    slug: "sum-array",
    title: "Sum of Array",
    difficulty: "Easy",
    tags: ["arrays", "loops", "basics"],
    languages: ["javascript", "python", "java", "cpp"],
    statement: "Given n and n space-separated integers, output their sum.",
    examples: [
      { input: "5\n1 2 3 4 5", output: "15" },
      { input: "3\n10 -2 5", output: "13" }
    ],
    hiddenTests: [
      { input: "1\n42", output: "42" },
      { input: "4\n0 0 0 0", output: "0" }
    ]
  },
  {
    slug: "second-largest",
    title: "Second Largest in Array",
    difficulty: "Easy",
    tags: ["arrays", "conditionals", "loops"],
    languages: ["javascript", "python", "java", "cpp"],
    statement: "Given n and n space-separated integers, output the second largest distinct value. If there is no second largest, output the largest.",
    examples: [
      { input: "5\n1 2 3 4 5", output: "4" },
      { input: "3\n5 5 5", output: "5" }
    ],
    hiddenTests: [
      { input: "2\n10 20", output: "10" },
      { input: "4\n3 1 2 2", output: "2" }
    ]
  },
  {
    slug: "valid-anagram",
    title: "Valid Anagram",
    difficulty: "Easy",
    tags: ["strings", "hashmap", "sorting", "company-prep", "company-google"],
    languages: ["javascript", "python", "java", "cpp"],
    statement: "Given two strings s and t (one per line), output \"YES\" if t is an anagram of s, else \"NO\".",
    examples: [
      { input: "anagram\nnagaram", output: "YES" },
      { input: "rat\ncar", output: "NO" }
    ],
    hiddenTests: [
      { input: "a\na", output: "YES" },
      { input: "ab\nabc", output: "NO" }
    ]
  },
  {
    slug: "contains-duplicate",
    title: "Contains Duplicate",
    difficulty: "Easy",
    tags: ["arrays", "hashmap", "company-prep", "company-amazon"],
    languages: ["javascript", "python", "java", "cpp"],
    statement: "Given n and n space-separated integers, output \"YES\" if any value appears at least twice, else \"NO\".",
    examples: [
      { input: "4\n1 2 3 1", output: "YES" },
      { input: "4\n1 2 3 4", output: "NO" }
    ],
    hiddenTests: [
      { input: "1\n1", output: "NO" },
      { input: "3\n1 1 2", output: "YES" }
    ]
  },
  {
    slug: "single-number",
    title: "Single Number",
    difficulty: "Easy",
    tags: ["arrays", "bitwise", "hashmap", "company-prep"],
    languages: ["javascript", "python", "java", "cpp"],
    statement: "Given n and n space-separated integers where every element appears twice except one, output that single number.",
    examples: [
      { input: "5\n2 2 1 3 3", output: "1" },
      { input: "1\n4", output: "4" }
    ],
    hiddenTests: [
      { input: "3\n1 1 2", output: "2" },
      { input: "7\n4 1 2 1 2 4 5", output: "5" }
    ]
  },
  {
    slug: "merge-sorted-arrays",
    title: "Merge Two Sorted Arrays",
    difficulty: "Medium",
    tags: ["arrays", "two-pointers", "sorting", "company-prep", "company-microsoft"],
    languages: ["javascript", "python", "java", "cpp"],
    statement: "Given two sorted arrays (first line: m and m integers, second line: n and n integers), output the merged sorted array as space-separated values.",
    examples: [
      { input: "3\n1 2 4\n3\n1 3 5", output: "1 1 2 3 4 5" },
      { input: "1\n1\n0\n", output: "1" }
    ],
    hiddenTests: [
      { input: "2\n1 2\n2\n3 4", output: "1 2 3 4" },
      { input: "0\n\n1\n7", output: "7" }
    ]
  },
  {
    slug: "valid-palindrome",
    title: "Valid Palindrome (Ignore Non-Alphanumeric)",
    difficulty: "Easy",
    tags: ["strings", "two-pointers", "company-prep", "company-meta"],
    languages: ["javascript", "python", "java", "cpp"],
    statement: "Given a string s, output \"YES\" if it is a palindrome ignoring non-alphanumeric characters and case, else \"NO\".",
    examples: [
      { input: "A man, a plan, a canal: Panama", output: "YES" },
      { input: "race a car", output: "NO" }
    ],
    hiddenTests: [
      { input: "0P", output: "NO" },
      { input: "a", output: "YES" }
    ]
  },
  {
    slug: "binary-search-target",
    title: "Binary Search",
    difficulty: "Easy",
    tags: ["binary-search", "arrays", "company-prep", "company-google"],
    languages: ["javascript", "python", "java", "cpp"],
    statement: "Given a sorted array (space-separated) and a target integer on the next line, output the index of target (0-based), or -1 if not found.",
    examples: [
      { input: "5\n-1 0 3 5 9\n9", output: "4" },
      { input: "4\n1 2 3 4\n5", output: "-1" }
    ],
    hiddenTests: [
      { input: "1\n5\n5", output: "0" },
      { input: "2\n1 3\n2", output: "-1" }
    ]
  },
  {
    slug: "climb-stairs",
    title: "Climbing Stairs",
    difficulty: "Easy",
    tags: ["dp", "recursion", "math", "company-prep", "company-amazon"],
    languages: ["javascript", "python", "java", "cpp"],
    statement: "You climb stairs: each step you can take 1 or 2 steps. Given n (number of steps), output the number of distinct ways to reach the top. n ≤ 45.",
    examples: [
      { input: "2", output: "2", explanation: "1+1 or 2" },
      { input: "3", output: "3" }
    ],
    hiddenTests: [
      { input: "1", output: "1" },
      { input: "4", output: "5" }
    ]
  },
  {
    slug: "max-subarray-sum",
    title: "Maximum Subarray Sum (Kadane)",
    difficulty: "Medium",
    tags: ["arrays", "dp", "greedy", "company-prep", "company-google", "company-amazon"],
    languages: ["javascript", "python", "java", "cpp"],
    statement: "Given n and n space-separated integers (can include negatives), output the maximum sum of any contiguous subarray.",
    examples: [
      { input: "9\n-2 1 -3 4 -1 2 1 -5 4", output: "6", explanation: "subarray [4,-1,2,1]" },
      { input: "1\n5", output: "5" }
    ],
    hiddenTests: [
      { input: "5\n-1 -2 -3 -4 -5", output: "-1" },
      { input: "3\n1 2 3", output: "6" }
    ]
  },
  {
    slug: "two-sum-value",
    title: "Two Sum (Return Values)",
    difficulty: "Easy",
    tags: ["arrays", "hashmap", "company-prep"],
    languages: ["javascript", "python", "java", "cpp"],
    statement: "Given an array and a target (e.g. first line: space-separated numbers, second: target), output two distinct indices (0-based) whose values add to target, as \"i j\". Assume exactly one solution.",
    examples: [
      { input: "2 7 11 15\n9", output: "0 1" },
      { input: "3 2 4\n6", output: "1 2" }
    ],
    hiddenTests: [
      { input: "1 1\n2", output: "0 1" },
      { input: "1 2 3 4\n7", output: "2 3" }
    ]
  },
  {
    slug: "reverse-integer",
    title: "Reverse Integer",
    difficulty: "Medium",
    tags: ["math", "conditionals", "company-prep", "company-google"],
    languages: ["javascript", "python", "java", "cpp"],
    statement: "Given a 32-bit signed integer x, output the reverse of its digits. If reversing goes outside [-2^31, 2^31-1], output 0. Preserve sign.",
    examples: [
      { input: "123", output: "321" },
      { input: "-123", output: "-321" },
      { input: "120", output: "21" }
    ],
    hiddenTests: [
      { input: "0", output: "0" },
      { input: "1534236469", output: "0" }
    ]
  },
  {
    slug: "longest-common-prefix",
    title: "Longest Common Prefix",
    difficulty: "Easy",
    tags: ["strings", "arrays", "company-prep", "company-amazon"],
    languages: ["javascript", "python", "java", "cpp"],
    statement: "Given n and n strings (one per line), output the longest common prefix. If none, output empty line.",
    examples: [
      { input: "3\nflower\nflow\nflight", output: "fl" },
      { input: "2\ndog\nracecar", output: "" }
    ],
    hiddenTests: [
      { input: "1\nabc", output: "abc" },
      { input: "2\na\nab", output: "a" }
    ]
  },
  {
    slug: "sqrt-floor",
    title: "Square Root (Floor)",
    difficulty: "Easy",
    tags: ["math", "binary-search", "company-prep"],
    languages: ["javascript", "python", "java", "cpp"],
    statement: "Given a non-negative integer x, output the integer square root (floor of sqrt(x)).",
    examples: [
      { input: "4", output: "2" },
      { input: "8", output: "2" }
    ],
    hiddenTests: [
      { input: "0", output: "0" },
      { input: "1", output: "1" },
      { input: "15", output: "3" }
    ]
  },
  {
    slug: "valid-parentheses",
    title: "Valid Parentheses",
    difficulty: "Easy",
    tags: ["stacks", "strings", "company-prep", "company-google", "company-amazon"],
    languages: ["javascript", "python", "java", "cpp"],
    statement: "Given a string s containing only '(', ')', '{', '}', '[', ']', output \"YES\" if the brackets are balanced and valid, else \"NO\".",
    examples: [
      { input: "()", output: "YES" },
      { input: "()[]{}", output: "YES" },
      { input: "(]", output: "NO" }
    ],
    hiddenTests: [
      { input: "([)]", output: "NO" },
      { input: "{[]}", output: "YES" }
    ]
  },
  {
    slug: "min-stack",
    title: "Min Stack (Get Minimum)",
    difficulty: "Medium",
    tags: ["stacks", "design", "company-prep", "company-amazon"],
    languages: ["javascript", "python", "java", "cpp"],
    statement: "Simulate a stack that supports push, pop, top, and getMin. Input: first line n = number of operations; then n lines: PUSH x, POP, TOP, or GETMIN. Output the result of each TOP and GETMIN (one per line), ignore PUSH/POP output.",
    examples: [
      { input: "6\nPUSH -2\nPUSH 0\nPUSH -3\nGETMIN\nPOP\nTOP", output: "-3\n0" }
    ],
    hiddenTests: [
      { input: "2\nPUSH 1\nGETMIN", output: "1" }
    ]
  },
  {
    slug: "fibonacci",
    title: "Fibonacci Number",
    difficulty: "Easy",
    tags: ["recursion", "dp", "math", "loops"],
    languages: ["javascript", "python", "java", "cpp"],
    statement: "Given n (0 ≤ n ≤ 30), output the n-th Fibonacci number (F(0)=0, F(1)=1, F(n)=F(n-1)+F(n-2)).",
    examples: [
      { input: "2", output: "1" },
      { input: "3", output: "2" },
      { input: "4", output: "3" }
    ],
    hiddenTests: [
      { input: "0", output: "0" },
      { input: "1", output: "1" },
      { input: "10", output: "55" }
    ]
  },
  {
    slug: "power-of-two",
    title: "Power of Two",
    difficulty: "Easy",
    tags: ["math", "bitwise", "conditionals"],
    languages: ["javascript", "python", "java", "cpp"],
    statement: "Given an integer n, output \"YES\" if it is a power of 2 (1,2,4,8,...), else \"NO\". n can be negative; only positive powers count.",
    examples: [
      { input: "1", output: "YES" },
      { input: "16", output: "YES" },
      { input: "3", output: "NO" }
    ],
    hiddenTests: [
      { input: "0", output: "NO" },
      { input: "1024", output: "YES" }
    ]
  },
  {
    slug: "count-primes",
    title: "Count Primes (Sieve)",
    difficulty: "Medium",
    tags: ["math", "arrays", "company-prep", "company-microsoft"],
    languages: ["javascript", "python", "java", "cpp"],
    statement: "Given an integer n (2 ≤ n ≤ 5*10^6), output the number of prime numbers strictly less than n.",
    examples: [
      { input: "10", output: "4", explanation: "2,3,5,7" },
      { input: "2", output: "0" }
    ],
    hiddenTests: [
      { input: "3", output: "1" },
      { input: "1", output: "0" }
    ]
  },
  {
    slug: "gcd-euclid",
    title: "GCD (Euclidean)",
    difficulty: "Easy",
    tags: ["math", "recursion", "company-prep"],
    languages: ["javascript", "python", "java", "cpp"],
    statement: "Given two positive integers a and b (one per line or space-separated), output their greatest common divisor.",
    examples: [
      { input: "12 8", output: "4" },
      { input: "7 5", output: "1" }
    ],
    hiddenTests: [
      { input: "48 18", output: "6" },
      { input: "100 1", output: "1" }
    ]
  },
  {
    slug: "bubble-sort-count",
    title: "Bubble Sort (Count Swaps)",
    difficulty: "Easy",
    tags: ["sorting", "arrays", "loops"],
    languages: ["javascript", "python", "java", "cpp"],
    statement: "Given n and n space-separated integers, output the number of swaps performed by a standard bubble sort.",
    examples: [
      { input: "5\n5 1 4 2 8", output: "4" },
      { input: "3\n1 2 3", output: "0" }
    ],
    hiddenTests: [
      { input: "2\n2 1", output: "1" },
      { input: "1\n1", output: "0" }
    ]
  },
  {
    slug: "first-bad-version",
    title: "First Bad Version",
    difficulty: "Easy",
    tags: ["binary-search", "company-prep", "company-meta"],
    languages: ["javascript", "python", "java", "cpp"],
    statement: "You have n versions [1..n]. First line: n. Second line: space-separated 0/1 for each version (1=bad). Output the first index (1-based) that is bad. Assume at least one bad.",
    examples: [
      { input: "5\n0 0 0 1 1", output: "4" },
      { input: "2\n1 1", output: "1" }
    ],
    hiddenTests: [
      { input: "1\n1", output: "1" },
      { input: "4\n0 0 1 1", output: "3" }
    ]
  },
  {
    slug: "move-zeros",
    title: "Move Zeroes",
    difficulty: "Easy",
    tags: ["arrays", "two-pointers", "company-prep", "company-amazon"],
    languages: ["javascript", "python", "java", "cpp"],
    statement: "Given n and n space-separated integers, output the array with all zeroes moved to the end, preserving relative order of non-zero elements. Output space-separated.",
    examples: [
      { input: "5\n0 1 0 3 12", output: "1 3 12 0 0" },
      { input: "1\n0", output: "0" }
    ],
    hiddenTests: [
      { input: "3\n1 2 3", output: "1 2 3" },
      { input: "4\n0 0 1 0", output: "1 0 0 0" }
    ]
  },
  {
    slug: "majority-element",
    title: "Majority Element",
    difficulty: "Easy",
    tags: ["arrays", "hashmap", "greedy", "company-prep", "company-google"],
    languages: ["javascript", "python", "java", "cpp"],
    statement: "Given n and n space-separated integers, output the element that appears more than n/2 times. Assume exactly one such element exists.",
    examples: [
      { input: "3\n3 2 3", output: "3" },
      { input: "7\n2 2 1 1 1 2 2", output: "2" }
    ],
    hiddenTests: [
      { input: "1\n5", output: "5" },
      { input: "5\n1 1 1 1 1", output: "1" }
    ]
  },
  {
    slug: "best-time-stock",
    title: "Best Time to Buy and Sell Stock",
    difficulty: "Easy",
    tags: ["arrays", "greedy", "dp", "company-prep", "company-amazon", "company-microsoft"],
    languages: ["javascript", "python", "java", "cpp"],
    statement: "Given n and n space-separated integers (prices on consecutive days), output the maximum profit from at most one buy and one sell. If no profit, output 0.",
    examples: [
      { input: "6\n7 1 5 3 6 4", output: "5", explanation: "buy 1, sell 6" },
      { input: "5\n7 6 4 3 1", output: "0" }
    ],
    hiddenTests: [
      { input: "2\n1 2", output: "1" },
      { input: "1\n10", output: "0" }
    ]
  },
  {
    slug: "length-of-last-word",
    title: "Length of Last Word",
    difficulty: "Easy",
    tags: ["strings", "company-prep", "company-microsoft"],
    languages: ["javascript", "python", "java", "cpp"],
    statement: "Given a string s (may have leading/trailing spaces), output the length of the last word. A word is a maximal substring of non-space characters.",
    examples: [
      { input: "Hello World", output: "5" },
      { input: "   fly me   to   the moon  ", output: "4" }
    ],
    hiddenTests: [
      { input: "a", output: "1" },
      { input: "  x  ", output: "1" }
    ]
  },
  {
    slug: "plus-one",
    title: "Plus One",
    difficulty: "Easy",
    tags: ["arrays", "math", "company-prep"],
    languages: ["javascript", "python", "java", "cpp"],
    statement: "Given a non-empty array of digits representing a non-negative integer (most significant first), output the array representing the integer + 1. Space-separated digits.",
    examples: [
      { input: "1 2 3", output: "1 2 4" },
      { input: "9 9", output: "1 0 0" }
    ],
    hiddenTests: [
      { input: "9", output: "1 0" },
      { input: "1 0 0", output: "1 0 1" }
    ]
  },
  {
    slug: "add-binary",
    title: "Add Binary",
    difficulty: "Easy",
    tags: ["strings", "math", "company-prep", "company-google"],
    languages: ["javascript", "python", "java", "cpp"],
    statement: "Given two binary strings a and b (one per line), output their sum as a binary string.",
    examples: [
      { input: "11\n1", output: "100" },
      { input: "1010\n1011", output: "10101" }
    ],
    hiddenTests: [
      { input: "0\n0", output: "0" },
      { input: "1\n1", output: "10" }
    ]
  },
  {
    slug: "pascal-triangle-row",
    title: "Pascal's Triangle (Kth Row)",
    difficulty: "Easy",
    tags: ["arrays", "math", "company-prep"],
    languages: ["javascript", "python", "java", "cpp"],
    statement: "Given an integer k (0-based row index), output the k-th row of Pascal's triangle as space-separated values.",
    examples: [
      { input: "0", output: "1" },
      { input: "3", output: "1 3 3 1" }
    ],
    hiddenTests: [
      { input: "1", output: "1 1" },
      { input: "4", output: "1 4 6 4 1" }
    ]
  },
  {
    slug: "trapping-rain-water",
    title: "Trapping Rain Water",
    difficulty: "Hard",
    tags: ["arrays", "two-pointers", "stacks", "company-prep", "company-google", "company-amazon"],
    languages: ["javascript", "python", "java", "cpp"],
    statement: "Given n and n non-negative integers (elevation map), output how much rain water can be trapped after raining.",
    examples: [
      { input: "12\n0 1 0 2 1 0 1 3 2 1 2 1", output: "6" },
      { input: "2\n1 2", output: "0" }
    ],
    hiddenTests: [
      { input: "5\n3 0 2 0 4", output: "7" },
      { input: "1\n5", output: "0" }
    ]
  },
  {
    slug: "longest-substring-no-repeat",
    title: "Longest Substring Without Repeating Characters",
    difficulty: "Medium",
    tags: ["strings", "hashmap", "sliding-window", "company-prep", "company-google", "company-amazon"],
    languages: ["javascript", "python", "java", "cpp"],
    statement: "Given a string s, output the length of the longest substring without repeating characters.",
    examples: [
      { input: "abcabcbb", output: "3", explanation: "abc" },
      { input: "bbbbb", output: "1" },
      { input: "pwwkew", output: "3" }
    ],
    hiddenTests: [
      { input: " ", output: "1" },
      { input: "aab", output: "2" }
    ]
  },
  {
    slug: "merge-intervals",
    title: "Merge Intervals",
    difficulty: "Medium",
    tags: ["arrays", "sorting", "company-prep", "company-google", "company-meta"],
    languages: ["javascript", "python", "java", "cpp"],
    statement: "Given n intervals (each line: start end), output merged overlapping intervals. Format: each line \"start end\", sorted by start.",
    examples: [
      { input: "4\n1 3\n2 6\n8 10\n15 18", output: "1 6\n8 10\n15 18" },
      { input: "2\n1 4\n4 5", output: "1 5" }
    ],
    hiddenTests: [
      { input: "1\n1 2", output: "1 2" },
      { input: "2\n1 4\n2 3", output: "1 4" }
    ]
  },
  {
    slug: "product-except-self",
    title: "Product of Array Except Self",
    difficulty: "Medium",
    tags: ["arrays", "prefix-sum", "company-prep", "company-amazon", "company-meta"],
    languages: ["javascript", "python", "java", "cpp"],
    statement: "Given n and n integers, output an array where output[i] = product of all elements except nums[i]. No division. Output space-separated.",
    examples: [
      { input: "4\n1 2 3 4", output: "24 12 8 6" },
      { input: "2\n-1 1", output: "1 -1" }
    ],
    hiddenTests: [
      { input: "1\n5", output: "1" },
      { input: "3\n2 3 4", output: "12 8 6" }
    ]
  },
  {
    slug: "search-insert-position",
    title: "Search Insert Position",
    difficulty: "Easy",
    tags: ["binary-search", "arrays", "company-prep"],
    languages: ["javascript", "python", "java", "cpp"],
    statement: "Given a sorted array (space-separated) and target on next line, output the index where target would be inserted to keep sorted. If found, output that index.",
    examples: [
      { input: "4\n1 3 5 6\n5", output: "2" },
      { input: "4\n1 3 5 6\n2", output: "1" },
      { input: "4\n1 3 5 6\n7", output: "4" }
    ],
    hiddenTests: [
      { input: "1\n1\n1", output: "0" },
      { input: "2\n1 3\n0", output: "0" }
    ]
  }
];

export function getProblem(slug: string) {
  return problems.find((p) => p.slug === slug) ?? null;
}

