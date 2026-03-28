/* eslint-disable no-unused-vars */
import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../auth/AuthContext";
import axios from "axios";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import Btn from "./Common/Btn";

export default function ProfileDetails() {
  const { user, token } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const apiUrl = import.meta.env.VITE_API_URL;

  const [stats, setStats] = useState({
    totalOrders: 0,
    totalSpend: 0,
    avgOrderValue: 0,
  });

  useEffect(() => {
    if (!user?.id || !token) return;

    const fetchProfileAndOrders = async () => {
      try {
        // Fetch profile
        const profileRes = await axios.get(`${apiUrl}/api/user/${user.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const profileData = profileRes.data.data;
        setProfile(profileData);
        setFormData({
          name: profileData.name || "",
          phoneNumber: profileData.phoneNumber || "",
          address: profileData.address || "",
          city: profileData.city || "",
          postalCode: profileData.postalCode || "",
        });

        // Fetch user orders
        const ordersRes = await axios.get(`${apiUrl}/api/order/my`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const orders = ordersRes.data.data || [];
        const totalOrders = orders.length;
        const totalSpend = orders.reduce((sum, o) => sum + (o.total || 0), 0);
        const avgOrderValue = totalOrders > 0 ? totalSpend / totalOrders : 0;

        setStats({ totalOrders, totalSpend, avgOrderValue });
      } catch (error) {
        console.error(
          "Error fetching profile or orders:",
          error.response?.data || error.message,
        );
        toast.error("Failed to load profile data");
      } finally {
        setLoading(false);
      }
    };

    fetchProfileAndOrders();
  }, [user?.id, token, apiUrl]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdateProfile = async () => {
    try {
      const response = await axios.put(
        `${apiUrl}/api/user/${user.id}`,
        formData,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setProfile(response.data.data);
      setEditing(false);
      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    }
  };

  const handleCancelEdit = () => {
    setFormData({
      name: profile.name || "",
      phoneNumber: profile.phoneNumber || "",
      address: profile.address || "",
      city: profile.city || "",
      postalCode: profile.postalCode || "",
    });
    setEditing(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-center px-4">
          <i className="fa-solid fa-user-slash text-6xl text-gray-300 mb-4"></i>
          <p className="text-gray-500 text-lg">No profile data found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6">
      {/* Profile Header with Cover */}
      <div className="relative mb-12 sm:mb-16">
        <div className="h-24 sm:h-32 md:h-40 bg-linear-to-r from-blue-500 to-purple-600 rounded-t-2xl"></div>
        <div className="absolute -bottom-10 sm:-bottom-12 left-3 sm:left-6 md:left-8">
          <div className="bg-white rounded-full p-1 shadow-lg">
            <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-28 md:h-28 rounded-full bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <span className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">
                {profile.name?.charAt(0).toUpperCase()}
              </span>
            </div>
          </div>
        </div>
        <div className="absolute top-2 sm:top-4 right-2 sm:right-4">
          {!editing ? (
            <Btn
              onClick={() => setEditing(true)}
              variant="outline"
              className="px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 transition-all duration-200 text-white hover:text-primary flex items-center gap-1 sm:gap-2 text-xs sm:text-sm whitespace-nowrap"
            >
              <i className="fa-solid fa-pen text-xs sm:text-sm"></i>
              <span>Edit Profile</span>
            </Btn>
          ) : (
            <div className="flex gap-1 sm:gap-2">
              <Btn
                variant="success"
                onClick={handleUpdateProfile}
                className="px-2 sm:px-3 md:px-4 py-1.5 sm:py-2  rounded-lg hover:bg-green-600 transition-all duration-200 flex items-center gap-1 sm:gap-2 text-xs sm:text-sm whitespace-nowrap"
              >
                <i className="fa-solid fa-check text-xs sm:text-sm"></i>
                <span>Save</span>
              </Btn>
              <Btn
                variant="warning"
                onClick={handleCancelEdit}
                className="px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 bg-classic/55 text-white rounded-lg hover:bg-gray-600 transition-all duration-200 flex items-center gap-1 sm:gap-2 text-xs sm:text-sm whitespace-nowrap"
              >
                <i className="fa-solid fa-times text-xs sm:text-sm"></i>
                <span>Cancel</span>
              </Btn>
            </div>
          )}
        </div>
      </div>

      {/* Profile Content */}
      <div className="bg-primarybg rounded-2xl shadow-lg p-4 sm:p-6 md:p-8 mt-4 sm:mt-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {/* Personal Information Section */}
          <div className="space-y-4">
            <h3 className="text-base sm:text-lg font-semibold text-secondary flex items-center gap-2 border-b border-gray-200 pb-2">
              <i className="fa-solid fa-user text-primary text-sm sm:text-base"></i>
              Personal Information
            </h3>

            {!editing ? (
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <i className="fa-regular fa-user text-gray-400 mt-0.5 text-sm shrink-0"></i>
                  <div className="flex-1">
                    <p className="text-xs text-secondary mb-0.5">Full Name</p>
                    <p className="text-sm sm:text-base text-gray-800 font-medium wrap-break-word">
                      {profile.name}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <i className="fa-regular fa-envelope text-gray-400 mt-0.5 text-sm shrink-0"></i>
                  <div className="flex-1">
                    <p className="text-xs text-secondary mb-0.5">
                      Email Address
                    </p>
                    <p className="text-sm sm:text-base text-gray-800 font-medium break-all sm:wrap-break-word">
                      {profile.email}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <i className="fa-solid fa-phone text-gray-400 mt-0.5 text-sm shrink-0"></i>
                  <div className="flex-1">
                    <p className="text-xs text-secondary mb-0.5">
                      Phone Number
                    </p>
                    <p className="text-sm sm:text-base text-gray-800 font-medium wrap-break-word">
                      {profile.phoneNumber || "Not provided"}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs text-secondary mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs text-secondary mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Address Information Section */}
          <div className="space-y-4">
            <h3 className="text-base sm:text-lg font-semibold text-secondary flex items-center gap-2 border-b border-gray-200 pb-2">
              <i className="fa-solid fa-location-dot text-primary text-sm sm:text-base"></i>
              Address Information
            </h3>

            {!editing ? (
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <i className="fa-regular fa-house text-gray-400 mt-0.5 text-sm shrink-0"></i>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 mb-0.5">
                      Street Address
                    </p>
                    <p className="text-sm sm:text-base text-gray-800 font-medium wrap-break-word">
                      {profile.address || "Not provided"}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <i className="fa-solid fa-city text-gray-400 mt-0.5 text-sm shrink-0"></i>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 mb-0.5">City</p>
                    <p className="text-sm sm:text-base text-gray-800 font-medium wrap-break-word">
                      {profile.city || "Not provided"}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <i className="fa-solid fa-mailbox text-gray-400 mt-0.5 text-sm shrink-0"></i>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 mb-0.5">Postal Code</p>
                    <p className="text-sm sm:text-base text-gray-800 font-medium wrap-break-word">
                      {profile.postalCode || "Not provided"}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs text-secondary mb-1">
                    Street Address
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs text-secondary mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs text-secondary mb-1">
                    Postal Code
                  </label>
                  <input
                    type="text"
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Statistics Section */}
        <div className="mt-8 sm:mt-10 pt-6 sm:pt-8 border-t border-gray-200">
          <h3 className="text-base sm:text-lg font-semibold text-secondary flex items-center gap-2 mb-4 sm:mb-6">
            <i className="fa-solid fa-chart-line text-primary text-sm sm:text-base"></i>
            Order Statistics
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-linear-to-br from-blue-50 to-blue-100 rounded-xl p-4 sm:p-5 text-center"
            >
              <i className="fa-solid fa-shopping-bag text-2xl sm:text-3xl text-blue-500 mb-2 sm:mb-3"></i>
              <p className="text-2xl sm:text-3xl font-bold text-secondary">
                {stats.totalOrders}
              </p>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">
                Total Orders
              </p>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-linear-to-br from-green-50 to-green-100 rounded-xl p-4 sm:p-5 text-center"
            >
              <i className="fa-solid fa-money-bill-wave text-2xl sm:text-3xl text-green-500 mb-2 sm:mb-3"></i>
              <p className="text-xl sm:text-2xl font-bold text-secondary wrap-break-word">
                ৳{stats.totalSpend.toLocaleString()}
              </p>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">
                Total Spent
              </p>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-linear-to-br from-purple-50 to-purple-100 rounded-xl p-4 sm:p-5 text-center"
            >
              <i className="fa-solid fa-chart-simple text-2xl sm:text-3xl text-purple-500 mb-2 sm:mb-3"></i>
              <p className="text-xl sm:text-2xl font-bold text-secondary wrap-break-word">
                ৳{Math.round(stats.avgOrderValue).toLocaleString()}
              </p>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">
                Average Order
              </p>
            </motion.div>
          </div>
        </div>

        {/* Member Since */}
        <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs sm:text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <i className="fa-regular fa-clock text-sm"></i>
              <span>
                Member since {new Date(profile.createdAt).toLocaleDateString()}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <i className="fa-regular fa-id-card text-sm"></i>
              <span className="font-mono text-xs sm:text-sm">
                ID: {profile._id?.slice(-8)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
