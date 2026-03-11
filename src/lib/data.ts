export type Course = {
  id: string;
  title: string;
  tagline: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  modules: number;
  learners: string;
  syllabus?: { title: string; lessons: string[] }[];
};

export type Problem = {
  slug: string;
  title: string;
  difficulty: "Easy" | "Medium" | "Hard";
  tags: string[];
  languages: ("javascript" | "python" | "java" | "cpp")[];
  statement: string;
  examples: { input: string; output: string; explanation?: string }[];
  hiddenTests?: { input: string; output: string }[];
  scoring?: {
    mode: "verdict" | "subtasks";
    subtasks?: {
      name: string;
      points: number; // total points for this subtask
      tests: { input: string; output: string }[];
    }[];
  };
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
      { title: "Python foundations", lessons: ["I/O", "loops", "functions", "strings"] },
      { title: "Core DSA", lessons: ["arrays", "hash maps", "stacks/queues", "recursion"] },
      { title: "Interview practice", lessons: ["patterns", "edge cases", "complexity"] }
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
      { title: "React basics", lessons: ["JSX", "components", "props/state"] },
      { title: "Hooks", lessons: ["useEffect", "useMemo", "custom hooks"] },
      { title: "Patterns", lessons: ["forms", "fetching", "state management"] }
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
      { title: "Java core", lessons: ["OOP", "collections", "exceptions"] },
      { title: "APIs", lessons: ["REST", "auth basics", "validation"] },
      { title: "Persistence", lessons: ["SQL", "ORM basics", "transactions"] }
    ]
  }
];

export function getCourse(id: string) {
  return courses.find((c) => c.id === id) ?? null;
}

export const problems: Problem[] = [
  {
    slug: "sum-of-two",
    title: "Sum of Two Numbers",
    difficulty: "Easy",
    tags: ["math", "basics"],
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
    tags: ["strings"],
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
    tags: ["arrays", "hashmap"],
    languages: ["javascript", "python", "java", "cpp"],
    statement:
      "Given an array of integers and a target, return indices of two numbers such that they add up to the target. Assume exactly one solution.",
    examples: [{ input: "nums=[2,7,11,15], target=9", output: "[0,1]" }],
    hiddenTests: [{ input: "nums=[3,2,4], target=6", output: "[1,2]" }]
    ,
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
  }
];

export function getProblem(slug: string) {
  return problems.find((p) => p.slug === slug) ?? null;
}

