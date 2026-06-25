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
  return <Icon className={className} aria-hidden />;
}
