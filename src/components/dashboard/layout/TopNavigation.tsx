import React from "react";
import { Mail, Pill } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface TopNavigationProps {
  title?: string;
}

const TopNavigation = ({ title = "Dashboard" }: TopNavigationProps) => {
  return (
    <header className="flex h-14 items-center gap-4 border-b border-[#1e2738] bg-[#0d121f] px-4 lg:px-6">
      <Link to="/" className="lg:hidden">
        <Pill className="h-6 w-6 text-blue-400" />
        <span className="sr-only">Home</span>
      </Link>
      <div className="w-full flex-1">
        <h1 className="text-xl font-semibold text-white">{title}</h1>
      </div>
      <Button
        variant="outline"
        size="sm"
        className="ml-auto h-8 border-blue-600 bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 hover:text-white"
        onClick={() => window.open("https://pillflow.com.au", "_blank")}
      >
        <Mail className="mr-2 h-4 w-4" />
        Contact Us
      </Button>
    </header>
  );
};

export default TopNavigation;
