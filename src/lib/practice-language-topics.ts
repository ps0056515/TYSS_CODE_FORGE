/**
 * Topic-wise structure for each programming language (CodeChef-style).
 * When user clicks a language, they see numbered topics; each topic expands to show practice problems.
 * topicId is used to filter problems by tag (problems with that tag appear under the topic).
 */

export type LanguageTopic = {
  id: string;
  /** Tag used to match problems (problem.tags includes this). */
  tag: string;
  title: string;
  description: string;
  order: number;
};

const JAVA_TOPICS: LanguageTopic[] = [
  { id: "java-syntax", tag: "basics", title: "Print statement and Java Syntax", description: "Practice the basic concepts of Java, one of the most widely used object-oriented programming languages.", order: 1 },
  { id: "variables", tag: "data-types", title: "Variables and Data Types", description: "Practice problems on the concept of variables and different data types.", order: 2 },
  { id: "strings", tag: "strings", title: "Strings", description: "Practice basic concepts of strings in Java.", order: 3 },
  { id: "user-input", tag: "user-input", title: "User Input", description: "Practice problems related to taking input from the user and building custom programs.", order: 4 },
  { id: "algorithmic-1", tag: "math", title: "Algorithmic problems - 1", description: "Practice simple problems on input, output and basic math.", order: 5 },
  { id: "conditionals", tag: "conditionals", title: "Conditional statements", description: "Practice problems using if, else, and switch statements.", order: 6 },
  { id: "loops", tag: "loops", title: "Loops", description: "Practice problems using for, while, and do-while loops.", order: 7 },
  { id: "arrays", tag: "arrays", title: "Arrays", description: "Practice problems on arrays and array manipulation.", order: 8 },
  { id: "methods", tag: "methods", title: "Methods", description: "Practice problems on methods and functions in Java.", order: 9 },
  { id: "hashmap", tag: "hashmap", title: "Hash Maps", description: "Practice problems on HashMaps and key-value data structures.", order: 10 },
];

const PYTHON_TOPICS: LanguageTopic[] = [
  { id: "py-syntax", tag: "basics", title: "Print and Python Syntax", description: "Practice the basic concepts of Python, one of the most popular beginner-friendly languages.", order: 1 },
  { id: "variables", tag: "data-types", title: "Variables and Data Types", description: "Practice problems on variables and data types in Python.", order: 2 },
  { id: "strings", tag: "strings", title: "Strings", description: "Practice basic concepts of strings in Python.", order: 3 },
  { id: "user-input", tag: "user-input", title: "User Input", description: "Practice problems related to taking input from the user (input(), etc.).", order: 4 },
  { id: "algorithmic-1", tag: "math", title: "Algorithmic problems - 1", description: "Practice simple problems on input, output and basic math.", order: 5 },
  { id: "conditionals", tag: "conditionals", title: "Conditional statements", description: "Practice problems using if, elif, and else.", order: 6 },
  { id: "loops", tag: "loops", title: "Loops", description: "Practice problems using for and while loops.", order: 7 },
  { id: "arrays", tag: "arrays", title: "Lists and Arrays", description: "Practice problems on lists and array manipulation in Python.", order: 8 },
  { id: "functions", tag: "methods", title: "Functions", description: "Practice problems on functions and modular code in Python.", order: 9 },
  { id: "hashmap", tag: "hashmap", title: "Dictionaries", description: "Practice problems on dictionaries and key-value structures.", order: 10 },
];

const CPP_TOPICS: LanguageTopic[] = [
  { id: "cpp-io", tag: "basics", title: "Print, I/O and C++ Syntax", description: "Practice the basic concepts of C++, including cout, cin and syntax.", order: 1 },
  { id: "variables", tag: "data-types", title: "Variables and Data Types", description: "Practice problems on variables and data types in C++.", order: 2 },
  { id: "strings", tag: "strings", title: "Strings", description: "Practice basic concepts of strings (std::string) in C++.", order: 3 },
  { id: "user-input", tag: "user-input", title: "User Input", description: "Practice problems related to taking input from the user.", order: 4 },
  { id: "algorithmic-1", tag: "math", title: "Algorithmic problems - 1", description: "Practice simple problems on input, output and basic math.", order: 5 },
  { id: "conditionals", tag: "conditionals", title: "Conditional statements", description: "Practice problems using if, else, and switch.", order: 6 },
  { id: "loops", tag: "loops", title: "Loops", description: "Practice problems using for, while, and do-while loops.", order: 7 },
  { id: "arrays", tag: "arrays", title: "Arrays and Vectors", description: "Practice problems on arrays and std::vector.", order: 8 },
  { id: "functions", tag: "methods", title: "Functions", description: "Practice problems on functions in C++.", order: 9 },
  { id: "stl", tag: "hashmap", title: "STL and Containers", description: "Practice problems using STL containers (map, set, etc.).", order: 10 },
];

const JAVASCRIPT_TOPICS: LanguageTopic[] = [
  { id: "js-syntax", tag: "basics", title: "Console and JavaScript Syntax", description: "Practice the basic concepts of JavaScript (console.log, syntax).", order: 1 },
  { id: "variables", tag: "data-types", title: "Variables and Data Types", description: "Practice problems on variables, let, const, and data types.", order: 2 },
  { id: "strings", tag: "strings", title: "Strings", description: "Practice basic concepts of strings in JavaScript.", order: 3 },
  { id: "user-input", tag: "user-input", title: "User Input", description: "Practice problems related to reading input (e.g. stdin, readline).", order: 4 },
  { id: "algorithmic-1", tag: "math", title: "Algorithmic problems - 1", description: "Practice simple problems on input, output and basic math.", order: 5 },
  { id: "conditionals", tag: "conditionals", title: "Conditional statements", description: "Practice problems using if, else, and switch.", order: 6 },
  { id: "loops", tag: "loops", title: "Loops", description: "Practice problems using for, while, and forEach.", order: 7 },
  { id: "arrays", tag: "arrays", title: "Arrays", description: "Practice problems on arrays and array methods.", order: 8 },
  { id: "functions", tag: "methods", title: "Functions", description: "Practice problems on functions and callbacks in JavaScript.", order: 9 },
  { id: "hashmap", tag: "hashmap", title: "Objects and Maps", description: "Practice problems on objects and Map data structures.", order: 10 },
];

const C_TOPICS: LanguageTopic[] = [
  { id: "c-io", tag: "basics", title: "Printf, Scanf and C Syntax", description: "Practice the basic concepts of C (printf, scanf, syntax).", order: 1 },
  { id: "variables", tag: "data-types", title: "Variables and Data Types", description: "Practice problems on variables and data types in C.", order: 2 },
  { id: "strings", tag: "strings", title: "Strings", description: "Practice basic concepts of strings (char arrays) in C.", order: 3 },
  { id: "user-input", tag: "user-input", title: "User Input", description: "Practice problems related to taking input (scanf, getchar).", order: 4 },
  { id: "algorithmic-1", tag: "math", title: "Algorithmic problems - 1", description: "Practice simple problems on input, output and basic math.", order: 5 },
  { id: "conditionals", tag: "conditionals", title: "Conditional statements", description: "Practice problems using if, else, and switch.", order: 6 },
  { id: "loops", tag: "loops", title: "Loops", description: "Practice problems using for and while loops.", order: 7 },
  { id: "arrays", tag: "arrays", title: "Arrays", description: "Practice problems on arrays in C.", order: 8 },
  { id: "functions", tag: "methods", title: "Functions", description: "Practice problems on functions in C.", order: 9 },
];

/** Topics for languages we have content for. Others get a default list. */
const LANGUAGE_TOPICS: Record<string, LanguageTopic[]> = {
  java: JAVA_TOPICS,
  python: PYTHON_TOPICS,
  cpp: CPP_TOPICS,
  javascript: JAVASCRIPT_TOPICS,
  c: C_TOPICS,
};

const DEFAULT_TOPICS: LanguageTopic[] = [
  { id: "basics", tag: "basics", title: "Basics & Syntax", description: "Practice basic syntax and I/O.", order: 1 },
  { id: "data-types", tag: "data-types", title: "Variables and Data Types", description: "Practice variables and data types.", order: 2 },
  { id: "strings", tag: "strings", title: "Strings", description: "Practice string problems.", order: 3 },
  { id: "math", tag: "math", title: "Algorithmic problems", description: "Practice input, output and basic math.", order: 4 },
  { id: "arrays", tag: "arrays", title: "Arrays", description: "Practice array problems.", order: 5 },
  { id: "loops", tag: "loops", title: "Loops", description: "Practice loop-based problems.", order: 6 },
  { id: "conditionals", tag: "conditionals", title: "Conditional statements", description: "Practice conditional logic.", order: 7 },
  { id: "hashmap", tag: "hashmap", title: "Hash Maps / Containers", description: "Practice key-value and container problems.", order: 8 },
];

export function getLanguageTopics(lang: string): LanguageTopic[] {
  const topics = LANGUAGE_TOPICS[lang] ?? DEFAULT_TOPICS;
  return [...topics].sort((a, b) => a.order - b.order);
}
