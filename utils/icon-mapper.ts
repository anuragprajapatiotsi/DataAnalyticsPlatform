import {
  Bell,
  Server,
  Users,
  Database,
  Globe,
  HardDrive,
  Shield,
  Settings,
  Mail,
  Lock,
  Eye,
  Activity,
  Box,
  Cpu,
  Cloud,
  Layers,
  Search,
  CheckCircle,
  AlertCircle,
  HelpCircle,
  type LucideIcon,
} from "lucide-react";

export const iconMap: Record<string, LucideIcon> = {
  bell: Bell,
  server: Server,
  users: Users,
  database: Database,
  globe: Globe,
  drive: HardDrive,
  shield: Shield,
  settings: Settings,
  mail: Mail,
  lock: Lock,
  eye: Eye,
  activity: Activity,
  box: Box,
  cpu: Cpu,
  cloud: Cloud,
  layers: Layers,
  search: Search,
  check: CheckCircle,
  alert: AlertCircle,
  help: HelpCircle,
};

export function getIcon(iconName: string): LucideIcon {
  const normalizedIcon = iconName.toLowerCase().replace(/[-_]/g, "");
  return iconMap[normalizedIcon] || Settings;
}
