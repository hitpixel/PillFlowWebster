import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Package, Users } from "lucide-react";

const ActivityFeedStoryboard = () => {
  return (
    <div className="bg-[#0a0e17] p-6 h-[600px]">
      <Card className="bg-[#0d121f] text-white border-[#1e2738]">
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription className="text-gray-400">
            Latest system events
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="rounded-full bg-blue-500/20 p-1">
                <Package className="h-4 w-4 text-blue-400" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium leading-none">
                  Collection completed
                </p>
                <p className="text-xs text-gray-400">John Doe • 3 days ago</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="rounded-full bg-purple-500/20 p-1">
                <Package className="h-4 w-4 text-purple-400" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium leading-none">
                  Collection completed
                </p>
                <p className="text-xs text-gray-400">Mary Smith • 1 week ago</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="rounded-full bg-green-500/20 p-1">
                <Users className="h-4 w-4 text-green-400" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium leading-none">
                  New customer added
                </p>
                <p className="text-xs text-gray-400">System • 2 weeks ago</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ActivityFeedStoryboard;
