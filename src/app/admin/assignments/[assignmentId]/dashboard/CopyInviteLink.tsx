"use client";

import * as React from "react";

export function CopyInviteLink({ inviteLink }: { inviteLink: string }) {
  const [copied, setCopied] = React.useState(false);
  return (
    <button
      type="button"
      className="rounded-lg border border-border bg-bg px-3 py-1.5 text-xs font-medium hover:bg-white/5"
      onClick={() => {
        navigator.clipboard.writeText(inviteLink).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        });
      }}
    >
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}
