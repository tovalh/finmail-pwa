import {
  ShoppingCart, ShoppingBag, Store, Utensils, UtensilsCrossed, Coffee, Pizza,
  Apple, Beer, IceCream2, ChefHat,
  Car, Bus, Plane, Train, Bike, Fuel, ParkingMeter, CarTaxiFront, Ship,
  Home, House, Building2, Wrench, Zap, Wifi, Package, PackageOpen, Sofa, Hammer,
  Heart, HeartPulse, Pill, Stethoscope, Activity, Dumbbell, Baby,
  Music, Gamepad2, Film, Clapperboard, Tv, BookOpen, Theater, Camera, Headphones,
  CreditCard, Wallet, DollarSign, TrendingUp, Landmark, Banknote, PiggyBank, Receipt,
  Shirt, Scissors, Sparkles, Watch, Gem,
  Smartphone, Laptop, Monitor,
  GraduationCap, PenLine,
  Gift, Dog, Globe, Star, Briefcase, Tag, HelpCircle, Leaf, Sun, Umbrella,
  RefreshCw,
} from 'lucide-react'

// Map icon name (stored in DB) → component.
// Debe cubrir todos los iconos que siembra el DataSeeder del backend;
// si falta uno, la categoría se renderiza sin icono.
export const ICON_MAP = {
  ShoppingCart,
  ShoppingBag,
  Store,
  Utensils,
  UtensilsCrossed,
  ChefHat,
  Coffee,
  Pizza,
  Apple,
  Beer,
  IceCream2,
  Car,
  Bus,
  Plane,
  Train,
  Bike,
  Fuel,
  ParkingMeter,
  CarTaxiFront,
  Ship,
  Home,
  House,
  Building2,
  Wrench,
  Zap,
  Wifi,
  Package,
  PackageOpen,
  Sofa,
  Hammer,
  Heart,
  HeartPulse,
  Pill,
  Stethoscope,
  Activity,
  Dumbbell,
  Baby,
  Music,
  Gamepad2,
  Film,
  Clapperboard,
  Tv,
  BookOpen,
  Theater,
  Camera,
  Headphones,
  CreditCard,
  Wallet,
  DollarSign,
  TrendingUp,
  Landmark,
  Banknote,
  PiggyBank,
  Receipt,
  Shirt,
  Scissors,
  Sparkles,
  Watch,
  Gem,
  Smartphone,
  Laptop,
  Monitor,
  GraduationCap,
  PenLine,
  Gift,
  Dog,
  Globe,
  Star,
  Briefcase,
  Tag,
  HelpCircle,
  Leaf,
  Sun,
  Umbrella,
  RefreshCw,
}

// Ordered list for the picker
export const ICON_LIST = Object.keys(ICON_MAP)

export function getIconComponent(name) {
  return name ? ICON_MAP[name] : null
}

// Paleta de respaldo para categorías sin color propio (o ya eliminadas).
export const FALLBACK_COLORS = [
  '#6366f1', '#22d3ee', '#f59e0b', '#10b981',
  '#f43f5e', '#a78bfa', '#34d399', '#fb923c',
  '#38bdf8', '#e879f9',
]

// El color de una categoría lo define el usuario: los gráficos deben usar ese
// mismo color y no una paleta propia, o la misma categoría se ve de dos colores
// distintos según la pantalla.
export function getCategoriaColor(categorias, nombre, index = 0) {
  const cat = categorias?.find((c) => c.nombre === nombre)
  return cat?.color || FALLBACK_COLORS[index % FALLBACK_COLORS.length]
}
