/**
 * MCQ (multiple-choice) questions by topic/technology.
 * Used for "Practice Java" / "Practice Python" style flows with options, solutions, and explanations.
 */

export type MCQTopic = {
  id: string;
  title: string;
  /** Order in syllabus (lower = first) */
  order: number;
  /** Optional: mark as Pro / premium */
  pro?: boolean;
};

export type MCQQuestion = {
  id: string;
  topicId: string;
  technology: string;
  title: string;
  statement: string;
  /** Answer options (code or text) */
  options: string[];
  /** Index of correct option (0-based) */
  correctIndex: number;
  /** Shown in "See Answer" section */
  explanation: string;
  /** Optional: correct answer text to show (defaults to options[correctIndex]) */
  correctAnswer?: string;
};

export type MCQTechnology = {
  id: string;
  name: string;
  description: string;
  icon?: string;
};

/** Technologies that have MCQ practice. CodeChef-aligned: Java, Python, C++, DSA. */
export const mcqTechnologies: MCQTechnology[] = [
  { id: "java", name: "Practice Java", description: "MCQ by topic: output, input, conditionals, loops, arrays, strings." },
  { id: "python", name: "Practice Python", description: "MCQ by topic: basics, strings, loops, data structures." },
  { id: "cpp", name: "Practice C++", description: "MCQ by topic: I/O, data types, loops, arrays, STL, pointers." },
  { id: "dsa", name: "DSA & Competitive Programming", description: "CodeChef-aligned: Arrays, Strings, Stacks, Queues, Recursion, Greedy, DP, Sorting, Binary Search, and more." },
];

/** Topics per technology. DSA topics match CodeChef Foundation + 1★–2★ syllabus. */
const topicsByTech: Record<string, MCQTopic[]> = {
  java: [
    { id: "getting-started", title: "Getting started", order: 0 },
    { id: "user-input", title: "User Input", order: 1 },
    { id: "conditional-statements", title: "Conditional statements", order: 2 },
    { id: "loops", title: "Loops", order: 3 },
    { id: "arrays", title: "Arrays", order: 4 },
    { id: "strings", title: "Strings", order: 5 },
    { id: "methods", title: "Methods in Java", order: 6 },
  ],
  python: [
    { id: "basics", title: "Basics", order: 0 },
    { id: "strings", title: "Strings", order: 1 },
    { id: "loops", title: "Loops", order: 2 },
    { id: "data-structures", title: "Data structures", order: 3 },
  ],
  cpp: [
    { id: "io-basics", title: "Input/Output & Basics", order: 0 },
    { id: "data-types", title: "Data Types & Variables", order: 1 },
    { id: "loops", title: "Loops & Time Complexity", order: 2 },
    { id: "arrays", title: "Arrays & Vectors", order: 3 },
    { id: "strings", title: "Strings", order: 4 },
    { id: "stl", title: "STL (containers, sort)", order: 5 },
    { id: "pointers", title: "Pointers & References", order: 6 },
  ],
  /** CodeChef Foundation + 1★ to 2★: Basic DS, Math, Recursion, Greedy, DP, Sorting, Search, etc. */
  dsa: [
    { id: "arrays", title: "Arrays", order: 0 },
    { id: "arrays-prefix-diff", title: "Arrays: Prefix Sum & Difference Arrays", order: 1 },
    { id: "arrays-frequency", title: "Arrays: Frequency Arrays", order: 2 },
    { id: "strings", title: "Strings", order: 3 },
    { id: "string-searching", title: "String Searching (naive)", order: 4 },
    { id: "string-problems", title: "String Problems (ASCII, find & replace)", order: 5 },
    { id: "stacks", title: "Stacks", order: 6 },
    { id: "queues", title: "Queues", order: 7 },
    { id: "asymptotic", title: "Asymptotic Analysis (Big-O)", order: 8 },
    { id: "data-types-loops", title: "Data Types, Loops & Time Complexity", order: 9 },
    { id: "basic-math", title: "Basic Math & Number Theory (GCD, primality)", order: 10 },
    { id: "recursion", title: "Recursion", order: 11 },
    { id: "greedy", title: "Greedy Algorithms", order: 12 },
    { id: "dp", title: "Dynamic Programming (basic)", order: 13 },
    { id: "sorting", title: "Sorting (O(n log n) & basic sorts)", order: 14 },
    { id: "binary-search", title: "Binary Search", order: 15 },
    { id: "searching-sorting", title: "Searching & Sorting (linear, binary, insertion, selection, bubble)", order: 16 },
    { id: "vectors-2d", title: "Vectors & 2D Arrays", order: 17 },
  ],
};

/** All MCQ questions. In production could be loaded from DB or JSON. */
const mcqQuestions: MCQQuestion[] = [
  {
    id: "java-print-diff",
    topicId: "getting-started",
    technology: "java",
    title: "Print difference of 10 and 3",
    statement: "How do you print the result of difference between 10 and 3?",
    options: [
      "System.out.println(10 - 3);",
      "System.out.println(diff(10 - 3));",
      "diff(10 - 3)",
      "print(10 - 3);",
    ],
    correctIndex: 0,
    explanation: "The code subtracts 3 from 10 and outputs the result using System.out.println().",
  },
  {
    id: "java-print-sum",
    topicId: "getting-started",
    technology: "java",
    title: "Print sum of two numbers",
    statement: "How do you print the sum of 5 and 7 in Java?",
    options: [
      "System.out.println(5 + 7);",
      "System.out.print(5 + 7);",
      "println(5 + 7);",
      "echo 5 + 7;",
    ],
    correctIndex: 0,
    explanation: "System.out.println() prints the value and adds a newline. The expression 5 + 7 is evaluated and the result (12) is printed.",
  },
  {
    id: "java-read-input",
    topicId: "user-input",
    technology: "java",
    title: "Read integer from user",
    statement: "Which class is commonly used to read integer input from the user in Java?",
    options: [
      "Scanner",
      "Reader",
      "InputStream",
      "BufferedReader",
    ],
    correctIndex: 0,
    explanation: "Scanner (from java.util.Scanner) is the standard way to read user input, including integers via nextInt().",
  },
  {
    id: "java-if-syntax",
    topicId: "conditional-statements",
    technology: "java",
    title: "Correct if statement",
    statement: "Which is the correct syntax for an if statement in Java?",
    options: [
      "if (x > 0) { }",
      "if x > 0:",
      "if [ x -gt 0 ]",
      "if (x > 0) then",
    ],
    correctIndex: 0,
    explanation: "In Java, if requires parentheses around the condition and curly braces for the body.",
  },
  {
    id: "java-for-loop",
    topicId: "loops",
    technology: "java",
    title: "Print numbers 1 to 5",
    statement: "How do you print numbers 1 to 5 using a for loop in Java?",
    options: [
      "for (int i = 1; i <= 5; i++) System.out.println(i);",
      "for i in range(1, 6): print(i)",
      "for (i = 1; i <= 5; i++)",
      "loop (1 to 5) System.out.println(i);",
    ],
    correctIndex: 0,
    explanation: "Standard Java for-loop: initialize i, condition i <= 5, increment i++. println(i) prints each value.",
  },
  {
    id: "java-array-declare",
    topicId: "arrays",
    technology: "java",
    title: "Declare an integer array",
    statement: "Which is the correct way to declare an array of 5 integers in Java?",
    options: [
      "int[] arr = new int[5];",
      "int arr[5];",
      "array int arr = [5];",
      "int arr = new int(5);",
    ],
    correctIndex: 0,
    explanation: "In Java, int[] arr = new int[5]; declares an array of 5 integers. Size is in square brackets.",
  },
  {
    id: "java-string-length",
    topicId: "strings",
    technology: "java",
    title: "Get length of a string",
    statement: "How do you get the length of a String variable s in Java?",
    options: [
      "s.length()",
      "s.length",
      "len(s)",
      "s.size()",
    ],
    correctIndex: 0,
    explanation: "In Java, String uses .length() (method). Arrays use .length (field).",
  },
  // Python samples
  {
    id: "py-print-hello",
    topicId: "basics",
    technology: "python",
    title: "Print Hello",
    statement: "How do you print \"Hello\" in Python?",
    options: [
      "print(\"Hello\")",
      "echo \"Hello\"",
      "System.out.println(\"Hello\");",
      "printf(\"Hello\");",
    ],
    correctIndex: 0,
    explanation: "In Python, the print() function is used to output text to the console.",
  },
  {
    id: "py-string-concat",
    topicId: "strings",
    technology: "python",
    title: "Concatenate two strings",
    statement: "How do you concatenate two strings a and b in Python?",
    options: [
      "a + b",
      "a.concat(b)",
      "concat(a, b)",
      "a & b",
    ],
    correctIndex: 0,
    explanation: "In Python, the + operator concatenates strings.",
  },
  // --- C++ ---
  {
    id: "cpp-cout-cin",
    topicId: "io-basics",
    technology: "cpp",
    title: "Output and input",
    statement: "Which is the correct way to read an integer and print it in C++?",
    options: [
      "cin >> x; cout << x;",
      "scanf(\"%d\", &x); printf(\"%d\", x);",
      "read(x); write(x);",
      "cout >> x; cin << x;",
    ],
    correctIndex: 0,
    explanation: "cin and cout are the standard C++ stream objects for input and output.",
  },
  {
    id: "cpp-data-type-size",
    topicId: "data-types",
    technology: "cpp",
    title: "Size of int",
    statement: "What is typically the size (in bytes) of an int on a 32-bit system?",
    options: ["4", "2", "8", "1"],
    correctIndex: 0,
    explanation: "On most 32-bit systems, int is 4 bytes (32 bits).",
  },
  {
    id: "cpp-for-loop",
    topicId: "loops",
    technology: "cpp",
    title: "For loop syntax",
    statement: "Which is valid C++ for loop to run 10 times?",
    options: [
      "for (int i = 0; i < 10; i++) { }",
      "for i in range(10):",
      "for (i = 0; i < 10; i++)",
      "loop (10) { }",
    ],
    correctIndex: 0,
    explanation: "C++ for loop: for (init; condition; update) { }.",
  },
  {
    id: "cpp-vector-size",
    topicId: "arrays",
    technology: "cpp",
    title: "Vector size",
    statement: "How do you get the number of elements in a std::vector<int> v?",
    options: ["v.size()", "v.length()", "v.count()", "sizeof(v)"],
    correctIndex: 0,
    explanation: "std::vector provides the size() member function.",
  },
  {
    id: "cpp-sort-stl",
    topicId: "stl",
    technology: "cpp",
    title: "Sort a vector",
    statement: "How do you sort a std::vector<int> v in ascending order?",
    options: [
      "sort(v.begin(), v.end());",
      "v.sort();",
      "std::sort(v);",
      "sort(v);",
    ],
    correctIndex: 0,
    explanation: "sort from <algorithm> takes two iterators: begin and end.",
  },
  // --- DSA (CodeChef-aligned) ---
  {
    id: "dsa-array-access",
    topicId: "arrays",
    technology: "dsa",
    title: "Array access time",
    statement: "What is the time complexity of accessing the i-th element in an array?",
    options: ["O(1)", "O(n)", "O(log n)", "O(n²)"],
    correctIndex: 0,
    explanation: "Arrays support random access in constant time using the index.",
  },
  {
    id: "dsa-prefix-sum",
    topicId: "arrays-prefix-diff",
    technology: "dsa",
    title: "Prefix sum use",
    statement: "Prefix sum is mainly used for:",
    options: [
      "Answering range sum queries in O(1) after O(n) precomputation",
      "Sorting an array",
      "Finding the maximum element",
      "Reversing an array",
    ],
    correctIndex: 0,
    explanation: "Prefix sum allows sum of range [l, r] as P[r] - P[l-1] in O(1).",
  },
  {
    id: "dsa-frequency-array",
    topicId: "arrays-frequency",
    technology: "dsa",
    title: "Frequency array",
    statement: "A frequency array is used to:",
    options: [
      "Count how many times each value (in a range) appears",
      "Sort elements by frequency",
      "Store cumulative sums",
      "Implement a stack",
    ],
    correctIndex: 0,
    explanation: "freq[x] = count of x in the array; useful for counting and lookups.",
  },
  {
    id: "dsa-string-mutable",
    topicId: "strings",
    technology: "dsa",
    title: "String immutability",
    statement: "In C++ and Java, are strings mutable?",
    options: [
      "In C++ (std::string) yes; in Java (String) no",
      "Both are mutable",
      "Both are immutable",
      "In Java yes; in C++ no",
    ],
    correctIndex: 0,
    explanation: "C++ std::string is mutable. Java String is immutable.",
  },
  {
    id: "dsa-naive-search",
    topicId: "string-searching",
    technology: "dsa",
    title: "Naive string search",
    statement: "What is the worst-case time complexity of naive string searching (pattern length m, text length n)?",
    options: ["O(n*m)", "O(n + m)", "O(n log m)", "O(n²)"],
    correctIndex: 0,
    explanation: "For each position we may compare up to m characters; n positions → O(n*m).",
  },
  {
    id: "dsa-stack-lifo",
    topicId: "stacks",
    technology: "dsa",
    title: "Stack order",
    statement: "A stack follows which order?",
    options: ["LIFO (Last In First Out)", "FIFO (First In First Out)", "Random access", "Sorted order"],
    correctIndex: 0,
    explanation: "Stack: last pushed element is the first popped (LIFO).",
  },
  {
    id: "dsa-queue-fifo",
    topicId: "queues",
    technology: "dsa",
    title: "Queue order",
    statement: "A queue follows which order?",
    options: ["FIFO (First In First Out)", "LIFO", "Priority order", "Random"],
    correctIndex: 0,
    explanation: "Queue: first enqueued is the first dequeued (FIFO).",
  },
  {
    id: "dsa-bigo-def",
    topicId: "asymptotic",
    technology: "dsa",
    title: "Big-O meaning",
    statement: "Big-O notation describes:",
    options: [
      "Upper bound on growth rate of a function (worst case)",
      "Exact number of operations",
      "Lower bound (best case) only",
      "Average case only",
    ],
    correctIndex: 0,
    explanation: "Big-O gives an upper bound: algorithm does no worse than this growth.",
  },
  {
    id: "dsa-loop-complexity",
    topicId: "data-types-loops",
    technology: "dsa",
    title: "Loop and complexity",
    statement: "A single loop that runs n times typically has time complexity:",
    options: ["O(n)", "O(1)", "O(n²)", "O(log n)"],
    correctIndex: 0,
    explanation: "One loop over n elements → linear time O(n).",
  },
  {
    id: "dsa-gcd-euclid",
    topicId: "basic-math",
    technology: "dsa",
    title: "Euclid GCD",
    statement: "Euclid's algorithm for GCD(a, b) has time complexity:",
    options: ["O(log min(a,b))", "O(a+b)", "O(min(a,b))", "O(1)"],
    correctIndex: 0,
    explanation: "Euclidean algorithm reduces the problem size quickly; logarithmic in min(a,b).",
  },
  {
    id: "dsa-recursion-base",
    topicId: "recursion",
    technology: "dsa",
    title: "Recursion base case",
    statement: "In recursion, a base case is necessary to:",
    options: ["Prevent infinite recursion and terminate the recursion", "Improve time complexity", "Allocate memory", "Define the return type"],
    correctIndex: 0,
    explanation: "Without a base case, the function would call itself indefinitely.",
  },
  {
    id: "dsa-greedy-choice",
    topicId: "greedy",
    technology: "dsa",
    title: "Greedy property",
    statement: "A greedy algorithm makes a choice that is:",
    options: [
      "Locally optimal at each step (hoping for global optimum)",
      "Always globally optimal",
      "Random",
      "The same as dynamic programming",
    ],
    correctIndex: 0,
    explanation: "Greedy picks the best local choice; it does not always yield global optimum.",
  },
  {
    id: "dsa-dp-overlapping",
    topicId: "dp",
    technology: "dsa",
    title: "DP and overlapping subproblems",
    statement: "Dynamic programming is useful when the problem has:",
    options: [
      "Overlapping subproblems and optimal substructure",
      "Only optimal substructure",
      "Only overlapping subproblems",
      "Neither",
    ],
    correctIndex: 0,
    explanation: "DP avoids recomputing the same subproblems (overlapping) and builds on optimal sub-solutions (optimal substructure).",
  },
  {
    id: "dsa-sort-nlogn",
    topicId: "sorting",
    technology: "dsa",
    title: "O(n log n) sorts",
    statement: "Which sorting algorithms achieve O(n log n) average time?",
    options: ["Merge sort, Quick sort, Heap sort", "Bubble sort, Insertion sort", "Selection sort", "Only Merge sort"],
    correctIndex: 0,
    explanation: "Merge sort, quicksort (average), and heapsort are O(n log n) comparison sorts.",
  },
  {
    id: "dsa-binary-search-condition",
    topicId: "binary-search",
    technology: "dsa",
    title: "Binary search requirement",
    statement: "Binary search can be applied when:",
    options: ["The array (or range) is sorted or has a monotonic condition", "The array is unsorted", "We need to find all occurrences", "The array has duplicates only"],
    correctIndex: 0,
    explanation: "Binary search relies on discarding half of the range using order (sorted or monotonic predicate).",
  },
  {
    id: "dsa-linear-search",
    topicId: "searching-sorting",
    technology: "dsa",
    title: "Linear search complexity",
    statement: "Worst-case time complexity of linear search in an array of n elements is:",
    options: ["O(n)", "O(log n)", "O(1)", "O(n²)"],
    correctIndex: 0,
    explanation: "In the worst case we check every element once → O(n).",
  },
  {
    id: "dsa-2d-array-access",
    topicId: "vectors-2d",
    technology: "dsa",
    title: "2D array access",
    statement: "To access element at row i, column j in a 2D array (row-major), we use:",
    options: ["arr[i][j] or arr[i*cols + j] for 1D mapping", "arr[j][i]", "arr(i, j)", "arr[i,j]"],
    correctIndex: 0,
    explanation: "Row-major: row index first, then column; 1D mapping is i*cols + j.",
  },
];

export function getMCQTopics(technology: string): MCQTopic[] {
  const topics = topicsByTech[technology] ?? [];
  return [...topics].sort((a, b) => a.order - b.order);
}

export function getMCQQuestions(technology: string, topicId?: string): MCQQuestion[] {
  let list = mcqQuestions.filter((q) => q.technology === technology);
  if (topicId) list = list.filter((q) => q.topicId === topicId);
  return list;
}

export function getMCQQuestionById(id: string): MCQQuestion | null {
  return mcqQuestions.find((q) => q.id === id) ?? null;
}

/** All question IDs in order for a technology (optionally for one topic). Used for Prev/Next. */
export function getMCQQuestionOrder(technology: string, topicId?: string): string[] {
  const questions = getMCQQuestions(technology, topicId);
  return questions.map((q) => q.id);
}
