"use client";

import { AnimatePresence, motion, type Variants } from "motion/react";
import {
  ArrowUpRight,
  FileText,
  Palette,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

const contentVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.22, 1, 0.36, 1],
      staggerChildren: 0.07,
      delayChildren: 0.05,
    },
  },
};

const childVariants: Variants = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
};

type FeatureCard = {
  id: "notes" | "design" | "generate";
  title: string;
  description: string;
  icon: LucideIcon;
  accent: string;
  iconWrap: string;
  ring: string;
};

const featureCards: FeatureCard[] = [
  {
    id: "notes",
    title: "Poznámky k projektu",
    description:
      "Zapisujte myšlienky, požiadavky and kontext priamo k projektu — všetko na jednom mieste.",
    icon: FileText,
    accent: "from-sky-500/15 via-sky-500/5 to-transparent",
    iconWrap:
      "bg-sky-500/10 text-sky-600 dark:text-sky-300 ring-1 ring-sky-500/20",
    ring: "group-hover:ring-sky-500/40",
  },
  {
    id: "design",
    title: "Dizajn",
    description:
      "Priestor na návrh, iterácie a vizuálnu prácu. Pripravíme rozhranie pre vaše mockupy a štýly.",
    icon: Palette,
    accent: "from-emerald-500/15 via-emerald-500/5 to-transparent",
    iconWrap:
      "bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 ring-1 ring-emerald-500/20",
    ring: "group-hover:ring-emerald-500/40",
  },
  {
    id: "generate",
    title: "Generovať nový dizajn",
    description:
      "Spustite generovanie nových variantov dizajnu podľa zadania. Funkcia bude dostupná v ďalšej fáze.",
    icon: Sparkles,
    accent: "from-amber-500/15 via-amber-500/5 to-transparent",
    iconWrap:
      "bg-amber-500/10 text-amber-600 dark:text-amber-300 ring-1 ring-amber-500/20",
    ring: "group-hover:ring-amber-500/40",
  },
];

export function DashboardContent({ viewer }: { viewer: any }) {
  const greetingName = viewer?.email ? viewer.email.split("@")[0] : null;

  return (
    <motion.div
      variants={contentVariants}
      initial="hidden"
      animate="show"
      className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-10 px-4 py-8 md:px-8 md:py-10"
    >
      <motion.section
        variants={childVariants}
        className="relative overflow-hidden rounded-2xl border border-border/70 bg-card/50 p-6 md:p-8"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_120%_at_0%_0%,oklch(0.65_0.15_242_/_0.18)_0%,transparent_60%),radial-gradient(40%_80%_at_100%_100%,oklch(0.78_0.13_180_/_0.14)_0%,transparent_60%)]"
        />
        <div className="relative flex flex-col gap-3">
          <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-border/60 bg-background/60 px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground backdrop-blur">
            <span className="size-1.5 rounded-full bg-emerald-500" />
            Pracovný priestor
          </span>
          <motion.div
            key="hero-text"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="flex flex-col gap-3"
          >
            <h1 className="font-heading text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
              {greetingName
                ? `Vitajte späť, ${greetingName}`
                : "Vitajte v Boom Scope"}
            </h1>
            <p className="max-w-2xl text-balance text-sm text-muted-foreground md:text-base">
              Toto je váš pracovný priestor pre projekt. Robte si
              poznámky, navrhujte rozhranie a generujte nové varianty
              dizajnu — všetko z jedného miesta.
            </p>
          </motion.div>
        </div>
      </motion.section>

      <motion.section
        variants={childVariants}
        className="flex flex-col gap-4"
      >
        <div className="flex items-end justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h2 className="font-heading text-lg font-semibold tracking-tight text-foreground">
              Moduly
            </h2>
            <p className="text-sm text-muted-foreground">
              Zvoľte oblasť, na ktorej chcete pracovať.
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {featureCards.map((card, index) => {
            const Icon = card.icon;
            const isSoon = card.id !== "notes";
            const href = card.id === "notes" ? "/dashboard/notes" : "#";

            return (
              <motion.div
                key={card.id}
                variants={childVariants}
                custom={index}
                whileHover={!isSoon ? { y: -2 } : undefined}
                transition={{ duration: 0.2, ease: "easeOut" }}
              >
                <Link 
                  href={href as any}
                  className={cn(
                    "block h-full outline-none",
                    isSoon && "cursor-not-allowed"
                  )}
                >
                  <Card
                    className={cn(
                      "group relative flex h-full flex-col overflow-hidden border border-border/70 bg-card/60 ring-1 ring-transparent transition-all duration-200",
                      !isSoon && "hover:border-border hover:bg-card hover:shadow-sm",
                      card.ring
                    )}
                  >
                    <div
                      aria-hidden
                      className={cn(
                        "pointer-events-none absolute inset-0 bg-gradient-to-br opacity-70",
                        card.accent
                      )}
                    />
                    <CardHeader className="relative gap-3">
                      <div className="flex items-start justify-between gap-2">
                        <div
                          className={cn(
                            "flex size-11 shrink-0 items-center justify-center rounded-xl",
                            card.iconWrap
                          )}
                        >
                          <Icon className="size-5" aria-hidden />
                        </div>
                        {isSoon && (
                          <span className="shrink-0 rounded-full border border-border/60 bg-background/60 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground backdrop-blur">
                            Čoskoro
                          </span>
                        )}
                      </div>
                      <CardTitle className="text-lg leading-tight">
                        {card.title}
                      </CardTitle>
                      <CardDescription className="text-pretty">
                        {card.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="relative mt-auto pt-0">
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors group-hover:text-foreground">
                        {isSoon ? "Čoskoro k dispozícii" : "Otvoriť modul"}
                        {!isSoon && (
                          <ArrowUpRight
                            className="size-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                            aria-hidden
                          />
                        )}
                      </span>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </motion.section>
    </motion.div>
  );
}
