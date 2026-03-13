"use client";

import * as React from "react";

function copyToClipboardFallback(text: string): boolean {
  try {
    const el = document.createElement("textarea");
    el.value = text;
    el.setAttribute("readonly", "");
    el.style.position = "fixed";
    el.style.opacity = "0";
    document.body.appendChild(el);
    el.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(el);
    return ok;
  } catch {
    return false;
  }
}

export function CopyInviteLink({ inviteLink }: { inviteLink: string }) {
  const [copied, setCopied] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleCopy = React.useCallback(() => {
    setError(null);
    const doCopy = () => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    };
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(inviteLink).then(doCopy).catch(() => {
        if (copyToClipboardFallback(inviteLink)) doCopy();
        else setError("Copy failed. Paste the link manually.");
      });
    } else if (copyToClipboardFallback(inviteLink)) {
      doCopy();
    } else {
      setError("Copy not supported. Paste the link manually.");
    }
  }, [inviteLink]);

  return (
    <div className="flex flex-col gap-1">
      <button
        type="button"
        className="rounded-lg border border-border bg-bg px-3 py-1.5 text-xs font-medium hover:bg-white/5"
        onClick={handleCopy}
      >
        {copied ? "Copied!" : "Copy"}
      </button>
      {error && <span className="text-xs text-amber-500">{error}</span>}
    </div>
  );
}
