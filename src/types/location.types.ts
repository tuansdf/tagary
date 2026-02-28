export interface Location {
  id: string;
  name: string;
  icon?: string;
  color: string;
  createdAt: string;
}

export const DEFAULT_LOCATIONS: Omit<Location, "id" | "createdAt">[] = [
  { name: "Nhà", icon: "home", color: "#4ade80" },
  { name: "Văn phòng", icon: "building-2", color: "#60a5fa" },
  { name: "Quán cà phê", icon: "coffee", color: "#a78bfa" },
  { name: "Phòng gym", icon: "dumbbell", color: "#f472b6" },
  { name: "Ngoài trời", icon: "sun", color: "#34d399" },
  { name: "Trường học", icon: "graduation-cap", color: "#fbbf24" },
  { name: "Nhà hàng", icon: "utensils", color: "#fb923c" },
];
