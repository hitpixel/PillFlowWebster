import React, { useState, useEffect } from "react";
import DashboardLayout from "../dashboard/layout/DashboardLayout";
import { getCustomers, createCustomer, updateCustomer } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Edit, Package } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { supabase } from "../../../supabase/supabase";

const CustomersPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editForm, setEditForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    address: "",
  });
  const [addForm, setAddForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    address: "",
  });

  useEffect(() => {
    const loadCustomers = async () => {
      try {
        setLoading(true);
        const data = await getCustomers();
        setCustomers(data);
      } catch (err) {
        console.error("Error loading customers:", err);
        setError("Failed to load customers");
      } finally {
        setLoading(false);
      }
    };

    loadCustomers();
  }, []);

  const filteredPatients = customers.filter((customer) => {
    if (!searchTerm) return true;

    const search = searchTerm.toLowerCase();
    const fullName = customer.full_name.toLowerCase();
    const nameParts = fullName.split(" ");
    const id = customer.id.toLowerCase();

    return (
      fullName.includes(search) ||
      id.includes(search) ||
      nameParts.some((part) => part.includes(search))
    );
  });

  const handleEditClick = (customer) => {
    setSelectedPatient(customer);
    setEditForm({
      full_name: customer.full_name,
      email: customer.email || "",
      phone: customer.phone || "",
      address: customer.address || "",
    });
    setIsEditDialogOpen(true);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    if (!selectedPatient) return;

    try {
      const updatedCustomer = await updateCustomer(selectedPatient.id, {
        full_name: editForm.full_name,
        email: editForm.email,
        phone: editForm.phone,
        address: editForm.address,
      });

      // Update the customer in the local state
      setCustomers(
        customers.map((c) =>
          c.id === updatedCustomer.id ? updatedCustomer : c,
        ),
      );

      setIsEditDialogOpen(false);
    } catch (err) {
      console.error("Error updating customer:", err);
      setError("Failed to update customer");
    }
  };

  const handleAddFormChange = (e) => {
    const { name, value } = e.target;
    setAddForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddCustomer = async () => {
    if (!addForm.full_name) return;

    try {
      setError("");
      // Get current user
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData?.user?.id;

      if (!userId) {
        throw new Error("User not authenticated");
      }

      // Create avatar URL using dicebear
      const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${addForm.full_name.replace(/ /g, "")}`;

      // Prepare customer data with proper null handling
      const customerData = {
        full_name: addForm.full_name,
        user_id: userId, // Associate with current user
      };

      // Try to add optional fields that might not exist in schema yet
      try {
        customerData.avatar_url = avatarUrl;
      } catch (e) {
        console.warn("avatar_url column might not exist yet", e);
      }

      try {
        customerData.status = "active";
      } catch (e) {
        console.warn("status column might not exist yet", e);
      }

      // Only add non-empty fields
      if (addForm.email) customerData.email = addForm.email;
      if (addForm.phone) customerData.phone = addForm.phone;
      if (addForm.address) customerData.address = addForm.address;

      // Add the new customer to the database
      const newCustomer = await createCustomer(customerData);

      // Update the local state with the new customer
      setCustomers([newCustomer, ...customers]);

      setIsAddDialogOpen(false);

      // Reset form
      setAddForm({
        full_name: "",
        email: "",
        phone: "",
        address: "",
      });
    } catch (err) {
      console.error("Error adding customer:", err);
      setError("Failed to add customer: " + (err.message || err));
    }
  };

  return (
    <DashboardLayout title="Customers">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">Customers</h1>
          <Button
            className="bg-blue-600 hover:bg-blue-700"
            onClick={() => setIsAddDialogOpen(true)}
          >
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
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Customer Cards */}
        {loading ? (
          <div className="flex justify-center p-8">
            <div className="text-white">Loading customers...</div>
          </div>
        ) : error ? (
          <div className="flex justify-center p-8">
            <div className="text-red-400">{error}</div>
          </div>
        ) : filteredPatients.length === 0 ? (
          <div className="flex justify-center p-8">
            <div className="text-gray-400">No customers found</div>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredPatients.map((customer) => (
              <Card
                key={customer.id}
                className="bg-[#0d121f] border-[#1e2738] overflow-hidden"
              >
                <CardContent className="p-0">
                  <div className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 text-lg font-semibold overflow-hidden">
                          {customer.avatar_url ? (
                            <img
                              src={customer.avatar_url}
                              alt={customer.full_name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            customer.full_name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                          )}
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-white">
                            {customer.full_name}
                          </h3>
                          <p className="text-sm text-gray-400">
                            ID: {customer.id.substring(0, 8)}
                          </p>
                        </div>
                      </div>
                      <Badge
                        className={`${!customer.status || customer.status === "active" ? "bg-green-500/20 text-green-400" : "bg-gray-500/20 text-gray-400"}`}
                      >
                        {!customer.status || customer.status === "active"
                          ? "Active"
                          : "Inactive"}
                      </Badge>
                    </div>

                    <div className="mt-4 space-y-2">
                      {customer.email && (
                        <p className="text-sm text-gray-300">
                          Email: {customer.email}
                        </p>
                      )}
                      {customer.phone && (
                        <p className="text-sm text-gray-300">
                          Phone: {customer.phone}
                        </p>
                      )}
                      {customer.address && (
                        <p className="text-sm text-gray-300">
                          Address: {customer.address}
                        </p>
                      )}
                    </div>

                    <div className="mt-6 flex justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-[#1e2738] bg-[#1a2133] text-gray-300 hover:bg-[#232d42] hover:text-white"
                        onClick={() => handleEditClick(customer)}
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
        )}

        {/* Edit Customer Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="bg-[#0d121f] text-white border-[#1e2738] sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Customer Details</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name</Label>
                <Input
                  id="full_name"
                  name="full_name"
                  className="bg-[#1a2133] border-[#1e2738]"
                  value={editForm.full_name}
                  onChange={handleFormChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  className="bg-[#1a2133] border-[#1e2738]"
                  value={editForm.email}
                  onChange={handleFormChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  name="phone"
                  className="bg-[#1a2133] border-[#1e2738]"
                  value={editForm.phone}
                  onChange={handleFormChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  name="address"
                  className="bg-[#1a2133] border-[#1e2738]"
                  value={editForm.address}
                  onChange={handleFormChange}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                className="bg-blue-600 hover:bg-blue-700"
                onClick={handleSave}
              >
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Add Customer Dialog */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent className="bg-[#0d121f] text-white border-[#1e2738] sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Customer</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="add-name">Full Name</Label>
                <Input
                  id="add-name"
                  name="full_name"
                  className="bg-[#1a2133] border-[#1e2738]"
                  value={addForm.full_name}
                  onChange={handleAddFormChange}
                  placeholder="John Doe"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="add-email">Email</Label>
                <Input
                  id="add-email"
                  name="email"
                  type="email"
                  className="bg-[#1a2133] border-[#1e2738]"
                  value={addForm.email}
                  onChange={handleAddFormChange}
                  placeholder="john.doe@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="add-phone">Phone Number</Label>
                <Input
                  id="add-phone"
                  name="phone"
                  className="bg-[#1a2133] border-[#1e2738]"
                  value={addForm.phone}
                  onChange={handleAddFormChange}
                  placeholder="(555) 123-4567"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="add-address">Address</Label>
                <Input
                  id="add-address"
                  name="address"
                  className="bg-[#1a2133] border-[#1e2738]"
                  value={addForm.address}
                  onChange={handleAddFormChange}
                  placeholder="123 Main St, Anytown, USA"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsAddDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                className="bg-blue-600 hover:bg-blue-700"
                onClick={handleAddCustomer}
                disabled={!addForm.full_name}
              >
                Add Customer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default CustomersPage;
