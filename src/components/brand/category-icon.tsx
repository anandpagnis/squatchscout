import { cn } from "@/lib/utils";
import {
  Wrench,
  Sparkles,
  Droplets,
  Zap,
  PaintRoller,
  Trees,
  Truck,
  PartyPopper,
  WashingMachine,
  Thermometer,
  Bug,
  Hammer,
  type LucideIcon,
} from "lucide-react";

const ICONS: Record<string, LucideIcon> = {
  wrench: Wrench,
  sparkles: Sparkles,
  droplets: Droplets,
  zap: Zap,
  "paint-roller": PaintRoller,
  trees: Trees,
  truck: Truck,
  "party-popper": PartyPopper,
  "washing-machine": WashingMachine,
  thermometer: Thermometer,
  bug: Bug,
  hammer: Hammer,
};

export function CategoryIcon({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  const Icon = ICONS[name] ?? Hammer;
  // 1.75 stroke reads more crafted than Lucide's default 2 at display sizes.
  return <Icon className={className} strokeWidth={1.75} aria-hidden />;
}

/**
 * Brand tile treatment for category icons: duotone forest-on-soft-green
 * squircle that warms to amber on hover. Use inside links/cards — the
 * `group` class on the parent drives the hover shift.
 */
export function CategoryTile({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex size-12 shrink-0 items-center justify-center rounded-2xl bg-forest-soft text-forest",
        "transition-all duration-300 ease-spring",
        "group-hover:-rotate-3 group-hover:bg-amber-soft group-hover:text-amber-deep",
        className,
      )}
    >
      <CategoryIcon name={name} className="size-6" />
    </span>
  );
}
