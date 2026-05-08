"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import {
  classifySignInResult,
  credentialsSchema,
  firstZodIssueMessage,
} from "@/lib/auth-forms";

export default function RegisterPage() {
  const { signIn } = useAuthActions();
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const parsed = credentialsSchema.safeParse({
      email: String(new FormData(form).get("email") ?? ""),
      password: String(new FormData(form).get("password") ?? ""),
    });
    if (!parsed.success) {
      toast.error("Skontrolujte formulár", {
        description: firstZodIssueMessage(parsed.error),
      });
      return;
    }

    const fd = new FormData();
    fd.set("email", parsed.data.email);
    fd.set("password", parsed.data.password);
    fd.set("flow", "signUp");

    setSubmitting(true);
    try {
      const result = await signIn("password", fd);
      const outcome = classifySignInResult(result);
      if (outcome === "fail") {
        toast.error("Registráciu sa nepodarilo dokončiť.", {
          description:
            "Tento email môže byť už zaregistrovaný. Skúste sa prihlásiť.",
        });
        return;
      }
      if (outcome === "redirect") {
        return;
      }
      toast.success("Účet bol vytvorený!");
      window.location.assign("/dashboard");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Registrácia zlyhala.";
      toast.error("Registráciu sa nepodarilo dokončiť.", {
        description: message,
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-1 items-center justify-center bg-zinc-50 px-4 py-16 dark:bg-black">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Vytvoriť účet</CardTitle>
          <CardDescription>
            Zaregistrujte sa pomocou emailu a hesla pre prístup do dashboardu.
          </CardDescription>
        </CardHeader>
        <form noValidate onSubmit={onSubmit}>
          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="vy@firma.sk"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="password">Heslo</Label>
              <PasswordInput
                id="password"
                name="password"
                autoComplete="new-password"
                placeholder="Aspoň 8 znakov"
              />
              <p className="text-xs text-muted-foreground">
                Heslo musí mať minimálne 8 znakov.
              </p>
            </div>
          </CardContent>
          <CardFooter className="mt-6 flex flex-col items-stretch gap-3">
            <Button type="submit" disabled={submitting} size="lg">
              {submitting ? "Registrujem…" : "Zaregistrovať sa"}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              Už máte účet?{" "}
              <Link
                href="/login"
                className="font-medium text-primary underline-offset-4 hover:underline"
              >
                Prihlásiť sa
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
