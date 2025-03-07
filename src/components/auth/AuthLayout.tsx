import { ReactNode } from "react";

import { Pill } from "lucide-react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0e17] text-white">
      <div className="max-w-md w-full px-4">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Pill className="h-8 w-8 text-blue-400 mr-2" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-teal-400 bg-clip-text text-transparent">
              PillFlow
            </h1>
          </div>
          <p className="text-gray-400 mt-2">
            Pharmacy management system for medication packs and collections
          </p>
        </div>
        {children}
      </div>
    </div>
  );
}
