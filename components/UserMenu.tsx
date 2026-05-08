"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import { useQuery } from "convex/react";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { api } from "@/convex/_generated/api";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

function getInitials(value: string | null | undefined) {
  if (!value) return "?";
  const trimmed = value.trim();
  if (trimmed.length === 0) return "?";
  const [local] = trimmed.split("@");
  return local.slice(0, 2).toUpperCase();
}

export function UserMenu() {
  const viewer = useQuery(api.users.viewer);
  const { signOut } = useAuthActions();
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);

  async function handleSignOut() {
    setSigningOut(true);
    try {
      await signOut();
      toast.success("Boli ste odhlásený.", {
        description: "Dovidenia! Vraciame vás na prihlásenie.",
      });
      router.push("/login");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Skúste to znova prosím.";
      toast.error("Odhlásenie zlyhalo.", { description: message });
      setSigningOut(false);
    }
  }

  const isLoading = viewer === undefined;
  const email = viewer?.email ?? null;
  const name = viewer?.name ?? null;
  const image = viewer?.image ?? undefined;
  const display = name ?? email ?? "Neznámy používateľ";

  return (
    <div
      data-slot="user-menu"
      className="flex items-center gap-3 rounded-full border border-border bg-background py-1 pr-1 pl-1 shadow-xs"
    >
      <Avatar className="size-8">
        {image ? <AvatarImage src={image} alt={display} /> : null}
        <AvatarFallback>{getInitials(name ?? email)}</AvatarFallback>
      </Avatar>

      <div className="flex flex-col leading-tight">
        <span className="text-xs font-medium text-foreground">
          {isLoading ? "Načítavam…" : display}
        </span>
        {email && name ? (
          <span className="text-[11px] text-muted-foreground">{email}</span>
        ) : null}
      </div>

      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        onClick={handleSignOut}
        disabled={signingOut || isLoading}
        aria-label="Odhlásiť sa"
        title="Odhlásiť sa"
      >
        <LogOut />
      </Button>
    </div>
  );
}
