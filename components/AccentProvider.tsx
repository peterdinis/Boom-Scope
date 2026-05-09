"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useEffect } from "react";

export function AccentProvider({ children }: { children: React.ReactNode }) {
  const user = useQuery(api.users.viewer);

  useEffect(() => {
    if (user?.accentColor) {
      // Set the CSS variable for the accent color
      document.documentElement.style.setProperty("--primary", user.accentColor);
      // We can also set a custom one if needed, e.g. --user-accent
      document.documentElement.style.setProperty("--user-accent", user.accentColor);
    } else {
      // Default blue-500 from tailwind
      document.documentElement.style.setProperty("--primary", "#3b82f6");
      document.documentElement.style.setProperty("--user-accent", "#3b82f6");
    }
  }, [user?.accentColor]);

  return <>{children}</>;
}
