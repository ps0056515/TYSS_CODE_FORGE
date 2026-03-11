"use client";

import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/cn";

export function Container(props: React.PropsWithChildren<{ className?: string }>) {
  return <div className={cn("mx-auto w-full max-w-6xl px-4", props.className)}>{props.children}</div>;
}

export function Card(props: React.PropsWithChildren<{ className?: string }>) {
  return (
    <div
      className={cn(
        "rounded-2xl bg-card/80 backdrop-blur-sm border border-border shadow-soft",
        "transition-colors duration-200",
        props.className
      )}
    >
      {props.children}
    </div>
  );
}

export function Button(
  props: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "ghost" }
) {
  const { className, variant = "primary", ...rest } = props;
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all duration-200",
        "focus:outline-none focus:ring-2 focus:ring-brand/50 focus:ring-offset-2 focus:ring-offset-bg disabled:opacity-50 disabled:cursor-not-allowed",
        variant === "primary" && "bg-brand text-white hover:bg-brand/90 hover:shadow-glow active:scale-[0.98]",
        variant === "ghost" && "bg-transparent text-text hover:bg-white/5 border border-border hover:border-white/15",
        className
      )}
      {...rest}
    />
  );
}

export function A(props: React.PropsWithChildren<{ href: string; className?: string }>) {
  return (
    <Link
      href={props.href}
      className={cn("text-sm text-muted hover:text-text transition underline-offset-4 hover:underline", props.className)}
    >
      {props.children}
    </Link>
  );
}

