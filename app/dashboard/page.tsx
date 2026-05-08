"use client";

import { useConvexAuth, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { UserMenu } from "@/components/UserMenu";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function DashboardPage() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const viewer = useQuery(api.users.viewer);

  return (
    <div className="flex flex-1 flex-col bg-zinc-50 dark:bg-black">
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-background/80 px-6 py-4 backdrop-blur">
        <h1 className="font-heading text-lg font-semibold">Boom Scope</h1>
        <UserMenu />
      </header>

      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 px-6 py-12">
        <div className="flex flex-col gap-2">
          <h2 className="font-heading text-3xl font-semibold tracking-tight">
            Dashboard
          </h2>
          <p className="text-muted-foreground">
            {isLoading
              ? "Overujem prihlásenie…"
              : viewer?.email
                ? `Vitajte späť, ${viewer.email}!`
                : "Vitajte! Toto je váš chránený priestor."}
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Stav prihlásenia</CardTitle>
            <CardDescription>
              Tento obsah uvidia iba prihlásení používatelia.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-sm">
              <span
                className={
                  isAuthenticated
                    ? "inline-block size-2 rounded-full bg-emerald-500"
                    : "inline-block size-2 rounded-full bg-zinc-400"
                }
              />
              <span className="text-muted-foreground">
                {isAuthenticated ? "Prihlásený" : "Neprihlásený"}
              </span>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
