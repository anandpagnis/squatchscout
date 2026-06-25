/**
 * SquatchScout brand constants & microcopy.
 * Voice: witty, warm, "expedition/scouting" metaphor (scout, track down, base camp, den).
 */

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "http://localhost:3000";

export const brand = {
  name: "SquatchScout",
  tagline: "Book local help without the hunt.",
  description:
    "SquatchScout connects you with trusted, vetted local pros for home repairs, cleaning, yard work, moving, events and more. Scout, book, done.",
  cta: {
    customer: "Book local help now",
    contractor: "Apply to become a SquatchScout contractor",
    contractorShort: "Got skills? Get scouted.",
  },
  /** Area labels keep the scouting metaphor consistent across the app. */
  areas: {
    customer: "Base Camp",
    contractor: "The Den",
    admin: "Ranger Station",
  },
  /** Commission taken by the platform on each booking (configurable). */
  platformFeeRate: Number(process.env.NEXT_PUBLIC_PLATFORM_FEE_RATE ?? 0.15),
} as const;

/** Reusable witty microcopy for loading / empty states. */
export const microcopy = {
  scanning: "Scouting your area…",
  found: (n: number) => `We tracked down ${n} pro${n === 1 ? "" : "s"} near you`,
  emptyBookings: "No tracks yet — book your first job.",
  emptyFavorites: "No saved pros yet. Spot a good one? Tag it to your trail.",
  emptyMessages: "No signals yet. Reach out to a pro to start the conversation.",
  error: "We lost the trail. Try again in a moment.",
} as const;

export type Role = "customer" | "contractor" | "admin";

/** Where each role lands after auth. */
export const roleHome: Record<Role, string> = {
  customer: "/base-camp",
  contractor: "/den",
  admin: "/admin",
};
