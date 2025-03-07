import React from "react";
import { patients } from "@/data/patients";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Edit, Package } from "lucide-react";

const CustomersStoryboard = () => {
  return (
    <div className="bg-[#0a0e17] p-6">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">Customers</h1>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="mr-2 h-4 w-4" />
            Add Customer
          </Button>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search customers by name or ID..."
            className="bg-[#1a2133] border-[#1e2738] pl-10 text-white"
          />
        </div>

        {/* Customer Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {patients.map((patient) => (
            <Card
              key={patient.id}
              className="bg-[#0d121f] border-[#1e2738] overflow-hidden"
            >
              <CardContent className="p-0">
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 text-lg font-semibold">
                        {patient.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white">
                          {patient.name}
                        </h3>
                        <p className="text-sm text-gray-400">
                          ID: {patient.id}
                        </p>
                      </div>
                    </div>
                    <Badge
                      className={`${patient.status === "active" ? "bg-green-500/20 text-green-400" : "bg-gray-500/20 text-gray-400"}`}
                    >
                      {patient.status === "active" ? "Active" : "Inactive"}
                    </Badge>
                  </div>

                  <div className="mt-4 space-y-2">
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-blue-400" />
                      <span className="text-sm text-gray-300">
                        {patient.collectionsCompleted} of{" "}
                        {patient.totalCollections} collections completed
                      </span>
                    </div>
                    <p className="text-sm text-gray-400">
                      Last collection: {patient.lastCollection}
                    </p>
                  </div>

                  <div className="mt-6 flex justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-[#1e2738] bg-[#1a2133] text-gray-300 hover:bg-[#232d42] hover:text-white"
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Edit Details
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CustomersStoryboard;
