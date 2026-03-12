"use client";

import * as React from "react";
import { cn } from "@/lib/cn";

/** Strip color for the card; logo may use it for fill where appropriate */
type Props = { langId: string; stripColor: string; className?: string };

/**
 * Inline SVG logos for programming languages. Fallback: colored circle with initials.
 */
export function LanguageLogo({ langId, stripColor, className }: Props) {
  const s = 40; // viewBox size
  const shared = { width: s, height: s, className: cn("shrink-0", className) };

  switch (langId) {
    case "cpp": {
      // C++: C and ++
      return (
        <svg {...shared} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="20" cy="20" r="18" fill={stripColor} opacity={0.2} />
          <text x="12" y="26" textAnchor="middle" fill={stripColor} fontSize="16" fontWeight="bold" fontFamily="system-ui, sans-serif">C</text>
          <text x="28" y="26" textAnchor="middle" fill={stripColor} fontSize="10" fontWeight="bold" fontFamily="system-ui, sans-serif">++</text>
        </svg>
      );
    }
    case "python": {
      // Python: blue/yellow brand colors
      return (
        <svg {...shared} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="20" cy="20" r="18" fill="#3776AB" opacity={0.3} />
          <path d="M14 14h6v6h-6v-6zm10 0h6v6h-6v-6z" fill="#FFD43B" />
          <circle cx="17" cy="17" r="2" fill="#3776AB" />
          <circle cx="23" cy="23" r="2" fill="#3776AB" />
        </svg>
      );
    }
    case "java": {
      return (
        <svg {...shared} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="20" cy="20" r="18" fill="#A65B33" opacity={0.25} />
          <text x="20" y="26" textAnchor="middle" fill="#A65B33" fontSize="12" fontWeight="bold" fontFamily="system-ui, sans-serif">Java</text>
        </svg>
      );
    }
    case "c": {
      // C: letter C in circle
      return (
        <svg {...shared} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="20" cy="20" r="18" fill={stripColor} opacity={0.2} />
          <text x="20" y="26" textAnchor="middle" fill={stripColor} fontSize="18" fontWeight="bold" fontFamily="system-ui, sans-serif">C</text>
        </svg>
      );
    }
    case "javascript": {
      // JS: letters JS
      return (
        <svg {...shared} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="40" height="40" rx="8" fill="#F7DF1E" />
          <path d="M10 31V17h4v10l5-5 2 2-7 7H10zm14 0l-4-4 4-4 2 2-2 2 2 2-2 2zm-4-14h4v14h-4V17z" fill="#000" />
        </svg>
      );
    }
    case "rust": {
      return (
        <svg {...shared} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="20" cy="20" r="18" fill="#CE422B" opacity={0.3} />
          <text x="20" y="26" textAnchor="middle" fill="#CE422B" fontSize="14" fontWeight="bold" fontFamily="system-ui">R</text>
        </svg>
      );
    }
    case "go": {
      return (
        <svg {...shared} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="20" cy="20" r="18" fill="#00ADD8" opacity={0.3} />
          <text x="20" y="26" textAnchor="middle" fill="#00ADD8" fontSize="12" fontWeight="bold" fontFamily="system-ui">Go</text>
        </svg>
      );
    }
    case "kotlin": {
      return (
        <svg {...shared} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="20" cy="20" r="18" fill="#7F52FF" opacity={0.3} />
          <text x="20" y="26" textAnchor="middle" fill="#7F52FF" fontSize="10" fontWeight="bold" fontFamily="system-ui">Kt</text>
        </svg>
      );
    }
    case "csharp": {
      return (
        <svg {...shared} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="20" cy="20" r="18" fill="#239120" opacity={0.3} />
          <text x="20" y="26" textAnchor="middle" fill="#239120" fontSize="10" fontWeight="bold" fontFamily="system-ui">C#</text>
        </svg>
      );
    }
    case "ruby": {
      return (
        <svg {...shared} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="20" cy="20" r="18" fill="#CC342D" opacity={0.3} />
          <text x="20" y="26" textAnchor="middle" fill="#CC342D" fontSize="10" fontWeight="bold" fontFamily="system-ui">Rb</text>
        </svg>
      );
    }
    case "php": {
      return (
        <svg {...shared} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="20" cy="20" r="18" fill="#777BB4" opacity={0.3} />
          <text x="20" y="26" textAnchor="middle" fill="#777BB4" fontSize="10" fontWeight="bold" fontFamily="system-ui">PHP</text>
        </svg>
      );
    }
    case "swift": {
      return (
        <svg {...shared} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="20" cy="20" r="18" fill="#F05138" opacity={0.3} />
          <text x="20" y="26" textAnchor="middle" fill="#F05138" fontSize="9" fontWeight="bold" fontFamily="system-ui">Swift</text>
        </svg>
      );
    }
    default: {
      // Fallback: circle with first two letters
      const initials = langId.slice(0, 2).toUpperCase();
      return (
        <svg {...shared} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="20" cy="20" r="18" fill={stripColor} opacity={0.25} />
          <text x="20" y="26" textAnchor="middle" fill={stripColor} fontSize="11" fontWeight="bold" fontFamily="system-ui">{initials}</text>
        </svg>
      );
    }
  }
}
