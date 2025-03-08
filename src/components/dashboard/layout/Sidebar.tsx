import React from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Home,
  LayoutDashboard,
  Calendar,
  Users,
  Settings,
  HelpCircle,
  Pill,
  LineChart,
  Package,
  ChevronDown,
  QrCode,
  Bell,
  LogOut,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "../../../../supabase/auth";

interface NavItem {
  icon: React.ReactNode;
  label: string;
  href?: string;
  isActive?: boolean;
}

interface SidebarProps {
  items?: NavItem[];
  activeItem?: string;
  onItemClick?: (label: string) => void;
}

const defaultNavItems: NavItem[] = [
  {
    icon: <Home size={16} />,
    label: "Dashboard",
    href: "/dashboard",
    isActive: false,
  },
  {
    icon: <QrCode size={16} />,
    label: "Scan Out",
    href: "/scan-out",
    isActive: false,
  },
  {
    icon: <Users size={16} />,
    label: "Customers",
    href: "/customers",
    isActive: false,
  },
  {
    icon: <LineChart size={16} />,
    label: "Reports",
    href: "/reports",
    isActive: false,
  },
  {
    icon: <Settings size={16} />,
    label: "Settings",
    href: "/settings",
    isActive: false,
  },
];

const Sidebar = ({
  items = defaultNavItems,
  activeItem,
  onItemClick = () => {},
}: SidebarProps) => {
  const { user, signOut } = useAuth();

  return (
    <div className="hidden w-64 flex-col border-r border-[#1e2738] bg-[#0d121f] text-white md:flex">
      <div className="flex h-14 items-center border-b border-[#1e2738] px-4">
        <Link to="/" className="flex items-center gap-2 font-semibold">
          <Pill className="h-6 w-6 text-blue-400" />
          <span className="text-lg">PillFlow</span>
        </Link>
      </div>

      <div className="flex-1 overflow-auto py-2">
        <nav className="grid items-start px-2 text-sm font-medium">
          {items.map((item) => (
            <Link
              to={item.href || "#"}
              key={item.label}
              className={`flex items-center gap-3 rounded-lg ${item.label === activeItem ? "bg-[#1e2738] text-blue-400" : "text-gray-400 hover:text-gray-100"} px-3 py-2 transition-all`}
              onClick={() => onItemClick(item.label)}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
        </nav>
      </div>

      <div className="mt-auto border-t border-[#1e2738] p-4">
        <div className="relative group">
          <div className="flex items-center gap-3 rounded-lg bg-[#1a2133] p-3">
            <Avatar className="h-10 w-10 border border-[#2a3548]">
              <AvatarImage
                src={
                  user?.user_metadata?.avatar_type === "custom" &&
                  user?.user_metadata?.avatar_url
                    ? user.user_metadata.avatar_url
                    : user?.user_metadata?.avatar_url
                      ? `https://api.dicebear.com/7.x/${user.user_metadata.avatar_url}/svg?seed=${user?.email || "default"}`
                      : `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email || "default"}`
                }
                alt="Avatar"
              />
              <AvatarFallback className="bg-[#1a2133]">
                {user?.email?.[0].toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="text-sm font-medium">
                {user?.user_metadata?.full_name || "Dr. Sarah Chen"}
              </span>
              <span className="text-xs text-gray-400">Pharmacist</span>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-gray-400 hover:text-white relative"
              >
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></div>
                <Bell className="h-4 w-4" />
                <span className="sr-only">Notifications</span>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-gray-400 hover:text-white"
              >
                <ChevronDown className="h-4 w-4" />
                <span className="sr-only">Menu</span>
              </Button>
            </div>
          </div>
          <div className="absolute w-full bottom-full mb-1 rounded-lg bg-[#1a2133] shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
            <Button
              variant="ghost"
              className="w-full justify-start text-gray-400 hover:text-white hover:bg-[#232d42] rounded-lg p-3"
              onClick={() => user && signOut()}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign out
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
