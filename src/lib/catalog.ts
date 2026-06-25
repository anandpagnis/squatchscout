/**
 * Canonical service categories (mirrors supabase/seed.sql).
 * Used for static marketing UI (home grid, footer) without hitting the DB.
 * `icon` values are Lucide icon names — see components/brand/category-icon.tsx.
 */
export type Category = {
  name: string;
  slug: string;
  icon: string;
  blurb: string;
};

export type City = { name: string; slug: string; state: string };

/** Cities for programmatic local-SEO landing pages (/local/[service]-in-[city]). */
export const CITIES: City[] = [
  { name: "Seattle", slug: "seattle", state: "WA" },
  { name: "Bellevue", slug: "bellevue", state: "WA" },
  { name: "Redmond", slug: "redmond", state: "WA" },
  { name: "Portland", slug: "portland", state: "OR" },
  { name: "Omaha", slug: "omaha", state: "NE" },
  { name: "Denver", slug: "denver", state: "CO" },
  { name: "Austin", slug: "austin", state: "TX" },
  { name: "Chicago", slug: "chicago", state: "IL" },
];

/** Parse a "house-cleaning-in-omaha" slug into its category + city parts. */
export function parseLocalSlug(slug: string): { category: Category; city: City } | null {
  for (const category of CATEGORIES) {
    const prefix = `${category.slug}-in-`;
    if (slug.startsWith(prefix)) {
      const citySlug = slug.slice(prefix.length);
      const city = CITIES.find((c) => c.slug === citySlug);
      if (city) return { category, city };
    }
  }
  return null;
}

export const CATEGORIES: Category[] = [
  { name: "Handyman & Repairs", slug: "handyman-repairs", icon: "wrench", blurb: "Fixes, assembly & mounting" },
  { name: "Cleaning", slug: "cleaning", icon: "sparkles", blurb: "Standard, deep & move-out" },
  { name: "Plumbing", slug: "plumbing", icon: "droplets", blurb: "Leaks, fixtures & drains" },
  { name: "Electrical", slug: "electrical", icon: "zap", blurb: "Outlets, fixtures & EV" },
  { name: "Painting", slug: "painting", icon: "paint-roller", blurb: "Interior & exterior" },
  { name: "Yard & Landscaping", slug: "yard-landscaping", icon: "trees", blurb: "Mowing, trimming & cleanup" },
  { name: "Moving & Hauling", slug: "moving-hauling", icon: "truck", blurb: "Moving, junk & delivery" },
  { name: "Event Setup", slug: "event-setup", icon: "party-popper", blurb: "Setup, AV & teardown" },
  { name: "Appliance Repair", slug: "appliance-repair", icon: "washing-machine", blurb: "Washer, fridge & oven" },
  { name: "HVAC", slug: "hvac", icon: "thermometer", blurb: "AC, heating & thermostats" },
  { name: "Pest Control", slug: "pest-control", icon: "bug", blurb: "Inspection & treatment" },
  { name: "Home Improvement", slug: "home-improvement", icon: "hammer", blurb: "Flooring, carpentry & decks" },
];
