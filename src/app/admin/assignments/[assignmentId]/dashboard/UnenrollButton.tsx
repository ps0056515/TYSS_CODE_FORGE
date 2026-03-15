"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui";

export function UnenrollButton({
  assignmentId,
  userId,
}: {
  assignmentId: string;
  userId: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleUnenroll = async () => {
    if (!confirm(`Remove ${userId} from this assignment? They will need to re-join with the invite link.`)) return;
    setLoading(true);
    try {
      const res = await fetch("/api/enrolments", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assignmentId, userId }),
      });
      const data = await res.json();
      if (data.ok) router.refresh();
      else alert(data.error ?? "Failed to remove");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      type="button"
      variant="ghost"
      className="text-xs text-rose-400 hover:text-rose-300"
      disabled={loading}
      onClick={handleUnenroll}
    >
      {loading ? "…" : "Unenroll"}
    </Button>
  );
}
