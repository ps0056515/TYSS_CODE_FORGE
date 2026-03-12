"use client";

import * as React from "react";
import { Container, A } from "@/components/ui";

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-16 border-t border-border bg-black/10">
      <Container className="py-10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="text-sm text-muted">
            <span className="text-text font-semibold">CodeForge</span>
            <span className="mx-2 text-muted/70">·</span>
            <span>© {year} CodeForge. All rights reserved.</span>
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <A href="/privacy">Privacy</A>
            <A href="/terms">Terms</A>
            <A href="/contact">Contact</A>
          </div>
        </div>

        <div className="mt-6 text-sm text-muted leading-relaxed max-w-3xl">
          CodeForge is a practice and learning platform. Problem statements, tests, and sample content are provided for
          educational use.
        </div>
      </Container>
    </footer>
  );
}

