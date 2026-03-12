/**
 * UI metadata for Programming Language cards: strip color, description, level.
 * Matches the reference design (colored top strip, description, "Beginner level").
 */

export type LanguageCardMeta = {
  /** Top strip and accent color (hex) */
  color: string;
  /** Short description for the card */
  description: string;
  /** Level label, e.g. "Beginner level" */
  level: string;
};

export const LANGUAGE_CARD_META: Record<string, LanguageCardMeta> = {
  cpp: {
    color: "#426BFF",
    description: "Practice C++ with problems on syntax, STL, and competitive programming.",
    level: "Beginner to Advanced",
  },
  python: {
    color: "#D9A300",
    description: "Practice Python with problems on basics, data structures, and algorithms.",
    level: "Beginner level",
  },
  java: {
    color: "#A65B33",
    description: "Practice Java with OOP, collections, and problem-solving.",
    level: "Beginner level",
  },
  c: {
    color: "#6A5ACD",
    description: "Practice C with pointers, arrays, and low-level concepts.",
    level: "Beginner level",
  },
  javascript: {
    color: "#F7DF1E",
    description: "Practice JavaScript with problems on arrays, strings, and logic.",
    level: "Beginner level",
  },
  rust: {
    color: "#CE422B",
    description: "Practice Rust with ownership, borrowing, and systems programming.",
    level: "Intermediate",
  },
  go: {
    color: "#00ADD8",
    description: "Practice Go with concurrency, simplicity, and performance.",
    level: "Beginner level",
  },
  kotlin: {
    color: "#7F52FF",
    description: "Practice Kotlin with concise syntax and Android development.",
    level: "Beginner level",
  },
  csharp: {
    color: "#239120",
    description: "Practice C# with .NET and object-oriented problem-solving.",
    level: "Beginner level",
  },
  ruby: {
    color: "#CC342D",
    description: "Practice Ruby with elegant syntax and scripting problems.",
    level: "Beginner level",
  },
  php: {
    color: "#777BB4",
    description: "Practice PHP with web and server-side problem-solving.",
    level: "Beginner level",
  },
  swift: {
    color: "#F05138",
    description: "Practice Swift with iOS development and modern syntax.",
    level: "Beginner level",
  },
};

export function getLanguageCardMeta(langId: string): LanguageCardMeta {
  return (
    LANGUAGE_CARD_META[langId] ?? {
      color: "#6D5EF1",
      description: `Practice ${langId} with curated problems.`,
      level: "Beginner level",
    }
  );
}
