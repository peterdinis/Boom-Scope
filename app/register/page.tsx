"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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

export default function RegisterPage() {
  const { signIn } = useAuthActions();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    formData.set("flow", "signUp");
    setSubmitting(true);
    try {
      await signIn("password", formData);
      toast.success("Účet bol vytvorený!");
      router.push("/dashboard");
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
        <form onSubmit={onSubmit}>
          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="vy@firma.sk"
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="password">Heslo</Label>
              <PasswordInput
                id="password"
                name="password"
                autoComplete="new-password"
                placeholder="Aspoň 8 znakov"
                required
                minLength={8}
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
