/**
 * Icon helper — maps template icon names to lucide-react components.
 * Isolated so template data stays serializable.
 */
import {
  Briefcase, Building2, Palette, Layout, Layers, Type, Search, Rocket,
  User, Zap, Utensils, Wrench, Gamepad2, ShoppingBag, GraduationCap,
  Smartphone, Calendar, Heart, Megaphone, Sparkles,
} from "lucide-react";

const map = {
  briefcase: Briefcase,
  building: Building2,
  palette: Palette,
  layout: Layout,
  layers: Layers,
  type: Type,
  search: Search,
  rocket: Rocket,
  user: User,
  zap: Zap,
  utensils: Utensils,
  wrench: Wrench,
  gamepad2: Gamepad2,
  "shopping-bag": ShoppingBag,
  "graduation-cap": GraduationCap,
  smartphone: Smartphone,
  calendar: Calendar,
  heart: Heart,
  megaphone: Megaphone,
  sparkles: Sparkles,
};

export function TemplateIcon({ name, className }) {
  const Cmp = map[name] || Sparkles;
  return <Cmp className={className} />;
}
