import React, { useState, useEffect } from "react";
import DashboardLayout from "../dashboard/layout/DashboardLayout";
import { useAuth } from "../../../supabase/auth";
import { supabase } from "../../../supabase/supabase";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Building2, MapPin, Phone, Mail, Save } from "lucide-react";

const Settings = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const [profile, setProfile] = useState({
    username: "",
    fullName: "",
    email: "",
    pharmacyName: "",
    pharmacyAddress: "",
    phone: "",
    avatarUrl: "",
    avatarType: "generated", // "generated" or "custom"
  });

  useEffect(() => {
    if (user) {
      // Load user data from Supabase auth
      setProfile({
        username: user.user_metadata?.username || "",
        fullName: user.user_metadata?.full_name || "",
        email: user.email || "",
        pharmacyName: user.user_metadata?.pharmacy_name || "",
        pharmacyAddress: user.user_metadata?.pharmacy_address || "",
        phone: user.user_metadata?.phone || "",
        avatarUrl: user.user_metadata?.avatar_url || "",
        avatarType: user.user_metadata?.avatar_type || "generated",
      });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfile((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess("");
    setError("");

    try {
      // Update user metadata
      const { error } = await supabase.auth.updateUser({
        data: {
          username: profile.username,
          full_name: profile.fullName,
          pharmacy_name: profile.pharmacyName,
          pharmacy_address: profile.pharmacyAddress,
          phone: profile.phone,
          avatar_url: profile.avatarUrl,
          avatar_type: profile.avatarType,
        },
      });

      if (error) throw error;

      setSuccess("Profile updated successfully");

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess("");
      }, 3000);
    } catch (err) {
      console.error("Error updating profile:", err);
      setError("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout title="Settings">
      <div className="container mx-auto py-6">
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-[#1a2133]">
            <TabsTrigger
              value="profile"
              className="data-[state=active]:bg-[#232d42]"
            >
              <User className="mr-2 h-4 w-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger
              value="pharmacy"
              className="data-[state=active]:bg-[#232d42]"
            >
              <Building2 className="mr-2 h-4 w-4" />
              Pharmacy
            </TabsTrigger>
            <TabsTrigger
              value="security"
              className="data-[state=active]:bg-[#232d42]"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mr-2 h-4 w-4"
              >
                <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              Security
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-4 mt-4">
            <Card className="bg-[#0d121f] text-white border-[#1e2738]">
              <CardHeader>
                <CardTitle>Profile</CardTitle>
                <CardDescription className="text-gray-400">
                  Manage your personal information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit}>
                  <div className="space-y-6">
                    <div className="flex items-center gap-6">
                      <div className="relative group">
                        <Avatar className="h-20 w-20 border-2 border-[#1e2738] group-hover:opacity-80 transition-opacity">
                          <AvatarImage
                            src={
                              profile.avatarType === "custom" &&
                              profile.avatarUrl
                                ? profile.avatarUrl
                                : `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.email}`
                            }
                            alt="Avatar"
                          />
                          <AvatarFallback className="bg-[#1a2133] text-xl">
                            {profile.fullName?.charAt(0) || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="bg-black/50 text-white hover:bg-black/70"
                            onClick={() =>
                              document
                                .getElementById("avatar-menu")
                                .classList.toggle("hidden")
                            }
                          >
                            Change
                          </Button>
                        </div>
                        <div
                          id="avatar-menu"
                          className="absolute top-full mt-2 left-0 bg-[#1a2133] border border-[#1e2738] rounded-md p-2 w-64 z-10 hidden"
                        >
                          <div className="space-y-3">
                            <h4 className="text-sm font-medium">
                              Choose Avatar Style
                            </h4>
                            <div className="grid grid-cols-4 gap-2">
                              {[
                                "default",
                                "micah",
                                "pixel-art",
                                "bottts",
                                "adventurer",
                              ].map((style) => (
                                <div
                                  key={style}
                                  className={`cursor-pointer rounded-md overflow-hidden border-2 ${profile.avatarType === "generated" && profile.avatarUrl === style ? "border-blue-500" : "border-transparent"}`}
                                  onClick={() =>
                                    setProfile((prev) => ({
                                      ...prev,
                                      avatarType: "generated",
                                      avatarUrl: style,
                                    }))
                                  }
                                >
                                  <img
                                    src={`https://api.dicebear.com/7.x/${style}/svg?seed=${profile.email}`}
                                    alt={style}
                                    className="w-full h-auto"
                                  />
                                </div>
                              ))}
                            </div>
                            <Separator className="bg-[#1e2738]" />
                            <div className="space-y-2">
                              <h4 className="text-sm font-medium">
                                Custom URL
                              </h4>
                              <Input
                                placeholder="https://example.com/avatar.jpg"
                                className="bg-[#0d121f] border-[#1e2738] text-sm"
                                value={
                                  profile.avatarType === "custom"
                                    ? profile.avatarUrl
                                    : ""
                                }
                                onChange={(e) =>
                                  setProfile((prev) => ({
                                    ...prev,
                                    avatarType: "custom",
                                    avatarUrl: e.target.value,
                                  }))
                                }
                              />
                              <p className="text-xs text-gray-400">
                                Enter a URL for your custom avatar image
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div>
                        <h3 className="text-lg font-medium">
                          {profile.fullName || "User"}
                        </h3>
                        <p className="text-sm text-gray-400">{profile.email}</p>
                      </div>
                    </div>

                    <Separator className="bg-[#1e2738]" />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="username">Username</Label>
                        <Input
                          id="username"
                          name="username"
                          placeholder="username"
                          className="bg-[#1a2133] border-[#1e2738]"
                          value={profile.username}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="fullName">Full Name</Label>
                        <Input
                          id="fullName"
                          name="fullName"
                          placeholder="John Doe"
                          className="bg-[#1a2133] border-[#1e2738]"
                          value={profile.fullName}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          placeholder="john@example.com"
                          className="bg-[#1a2133] border-[#1e2738]"
                          value={profile.email}
                          disabled
                        />
                        <p className="text-xs text-gray-400">
                          Email cannot be changed
                        </p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                          id="phone"
                          name="phone"
                          placeholder="+1 (555) 123-4567"
                          className="bg-[#1a2133] border-[#1e2738]"
                          value={profile.phone}
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                  </div>
                </form>
              </CardContent>
              <CardFooter className="flex justify-between border-t border-[#1e2738] pt-5">
                <p className="text-sm">
                  {error && <span className="text-red-500">{error}</span>}
                  {success && <span className="text-green-500">{success}</span>}
                </p>
                <Button
                  type="submit"
                  onClick={handleSubmit}
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {loading ? (
                    "Saving..."
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="pharmacy" className="space-y-4 mt-4">
            <Card className="bg-[#0d121f] text-white border-[#1e2738]">
              <CardHeader>
                <CardTitle>Pharmacy Details</CardTitle>
                <CardDescription className="text-gray-400">
                  Manage your pharmacy information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit}>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="pharmacyName">
                          <Building2 className="inline-block mr-2 h-4 w-4" />
                          Pharmacy Name
                        </Label>
                        <Input
                          id="pharmacyName"
                          name="pharmacyName"
                          placeholder="PillFlow Pharmacy"
                          className="bg-[#1a2133] border-[#1e2738]"
                          value={profile.pharmacyName}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="pharmacyAddress">
                          <MapPin className="inline-block mr-2 h-4 w-4" />
                          Pharmacy Address
                        </Label>
                        <Input
                          id="pharmacyAddress"
                          name="pharmacyAddress"
                          placeholder="123 Main St, Sydney NSW 2000"
                          className="bg-[#1a2133] border-[#1e2738]"
                          value={profile.pharmacyAddress}
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                  </div>
                </form>
              </CardContent>
              <CardFooter className="flex justify-between border-t border-[#1e2738] pt-5">
                <p className="text-sm">
                  {error && <span className="text-red-500">{error}</span>}
                  {success && <span className="text-green-500">{success}</span>}
                </p>
                <Button
                  type="submit"
                  onClick={handleSubmit}
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {loading ? (
                    "Saving..."
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-4 mt-4">
            <Card className="bg-[#0d121f] text-white border-[#1e2738]">
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription className="text-gray-400">
                  Manage your account security
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <h3 className="text-lg font-medium">Password</h3>
                    <p className="text-sm text-gray-400">
                      For security reasons, you cannot change your password
                      directly here. Please use the "Forgot Password" option on
                      the login page to reset your password.
                    </p>
                  </div>

                  <Separator className="bg-[#1e2738]" />

                  <div className="space-y-2">
                    <h3 className="text-lg font-medium">
                      Two-Factor Authentication
                    </h3>
                    <p className="text-sm text-gray-400">
                      Two-factor authentication adds an extra layer of security
                      to your account. This feature will be available soon.
                    </p>
                    <Button
                      className="mt-2 bg-[#1a2133] hover:bg-[#232d42] text-gray-400"
                      disabled
                    >
                      Enable Two-Factor Authentication
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
