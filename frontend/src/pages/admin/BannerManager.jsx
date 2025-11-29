/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import { useAuth } from "../../auth/useAuth";
import Btn from "../../components/Common/Btn";

// Helper: Generate unique ID for previews
const makeId = () => Math.random().toString(36).slice(2, 9);

export default function BannerManager() {
  const apiUrl = import.meta.env.VITE_API_URL || "";
  const { token } = useAuth() || {};

  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [selectedBanner, setSelectedBanner] = useState(null);
  const [image, setImage] = useState(null);
  const fileInputRef = useRef(null);

  // Form state
  const [form, setForm] = useState({
    title: "",
    link: "",
    isActive: true,
    order: 0,
    startDate: new Date().toISOString().split("T")[0],
    endDate: "",
    target: "_self",
  });

  // Fetch all banners
  const fetchBanners = useCallback(async () => {
    try {
      const authToken = token || localStorage.getItem("token");
      const res = await axios.get(`${apiUrl}/api/banners`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      setBanners(res.data.data || []);
    } catch (error) {
      console.error("Failed to fetch banners:", error);
      alert("Failed to load banners");
    }
  }, [apiUrl, token]);
  useEffect(() => {
    fetchBanners();
  }, [fetchBanners]);

  // Handle form changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Handle file selection
  const handleFileSelect = (file) => {
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("Image size should be less than 5MB");
      return;
    }

    const imageData = {
      id: makeId(),
      file: file,
      url: URL.createObjectURL(file),
    };
    setImage(imageData);
  };

  // File input change handler
  const onFileInputChange = (e) => {
    if (!e.target.files?.[0]) return;
    handleFileSelect(e.target.files[0]);
    e.target.value = "";
  };

  // Drag and drop handlers
  const onDragEnter = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const onDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const onDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer?.files?.[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  // Remove image
  const removeImage = () => {
    if (image) {
      URL.revokeObjectURL(image.url);
      setImage(null);
    }
  };

  // Reset form
  const resetForm = () => {
    setForm({
      title: "",
      link: "",
      isActive: true,
      order: 0,
      startDate: new Date().toISOString().split("T")[0],
      endDate: "",
      target: "_self",
    });
    removeImage();
    setSelectedBanner(null);
  };

  // Create new banner
  const createBanner = async () => {
    if (!image?.file) {
      alert("Please select a banner image");
      return;
    }

    try {
      setLoading(true);
      const authToken = token || localStorage.getItem("token");

      const formData = new FormData();
      formData.append("title", form.title || "");
      formData.append("link", form.link);
      formData.append("isActive", form.isActive);
      formData.append("order", form.order);
      formData.append("startDate", form.startDate);
      if (form.endDate) formData.append("endDate", form.endDate);
      formData.append("target", form.target);
      formData.append("image", image.file);

      await axios.post(`${apiUrl}/api/banners`, formData, {
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "multipart/form-data",
        },
      });

      alert("Banner created successfully!");
      resetForm();
      await fetchBanners();
    } catch (error) {
      console.error("Failed to create banner:", error);
      alert(error.response?.data?.message || "Failed to create banner");
    } finally {
      setLoading(false);
    }
  };

  // Edit banner
  const editBanner = (banner) => {
    setSelectedBanner(banner);
    setForm({
      title: banner.title || "",
      link: banner.link || "",
      isActive: banner.isActive,
      order: banner.order || 0,
      startDate: banner.startDate
        ? new Date(banner.startDate).toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0],
      endDate: banner.endDate
        ? new Date(banner.endDate).toISOString().split("T")[0]
        : "",
      target: banner.target || "_self",
    });

    // Set existing image for preview
    if (banner.image) {
      setImage({
        id: makeId(),
        url: banner.image.url,
        public_id: banner.image.public_id,
      });
    }
  };

  // Update banner
  const updateBanner = async () => {
    if (!selectedBanner) return;

    try {
      setLoading(true);
      const authToken = token || localStorage.getItem("token");

      const formData = new FormData();
      formData.append("title", form.title || "");
      formData.append("link", form.link);
      formData.append("isActive", form.isActive);
      formData.append("order", form.order);
      formData.append("startDate", form.startDate);
      if (form.endDate) formData.append("endDate", form.endDate);
      formData.append("target", form.target);

      // Only append new image if selected
      if (image?.file) {
        formData.append("image", image.file);
      }

      await axios.put(`${apiUrl}/api/banners/${selectedBanner._id}`, formData, {
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "multipart/form-data",
        },
      });

      alert("Banner updated successfully!");
      resetForm();
      await fetchBanners();
    } catch (error) {
      console.error("Failed to update banner:", error);
      alert(error.response?.data?.message || "Failed to update banner");
    } finally {
      setLoading(false);
    }
  };

  // Delete banner
  const deleteBanner = async (bannerId) => {
    if (!window.confirm("Are you sure you want to delete this banner?")) return;

    try {
      const authToken = token || localStorage.getItem("token");
      await axios.delete(`${apiUrl}/api/banners/${bannerId}`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      alert("Banner deleted successfully!");
      if (selectedBanner?._id === bannerId) {
        resetForm();
      }
      await fetchBanners();
    } catch (error) {
      console.error("Failed to delete banner:", error);
      alert("Failed to delete banner");
    }
  };

  // Toggle banner status
  const toggleBannerStatus = async (bannerId, currentStatus) => {
    try {
      const authToken = token || localStorage.getItem("token");
      const res = await axios.patch(
        `${apiUrl}/api/banners/${bannerId}/toggle`,
        {},
        {
          headers: { Authorization: `Bearer ${authToken}` },
        }
      );

      // Update local state
      setBanners((prev) =>
        prev.map((banner) => (banner._id === bannerId ? res.data.data : banner))
      );

      if (selectedBanner?._id === bannerId) {
        setSelectedBanner(res.data.data);
      }
    } catch (error) {
      console.error("Failed to toggle banner status:", error);
      alert("Failed to update banner status");
    }
  };

  return (
    <div className="p-4 max-w-6xl mx-auto space-y-6 font-urbanist">
      <h1 className="text-2xl font-bold mb-6">Banner Management</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Banner Form */}
        <div className="space-y-4 border p-4 rounded bg-primarybg">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">
              {selectedBanner ? "Edit Banner" : "Create New Banner"}
            </h2>
            <div className="flex gap-2">
              {selectedBanner && (
                <Btn
                  variant="danger"
                  onClick={() => deleteBanner(selectedBanner._id)}
                  className="px-3 py-1 rounded"
                >
                  Delete
                </Btn>
              )}
              <Btn
                variant="warning"
                onClick={resetForm}
                className="px-3 py-1 rounded"
              >
                Reset
              </Btn>
            </div>
          </div>

          {/* Banner Title */}
          <input
            name="title"
            placeholder="Banner Title (optional)"
            className="border px-3 py-1.5 rounded-md outline-none transition w-full border-secondary"
            value={form.title}
            onChange={handleChange}
          />

          {/* Banner Link */}
          <input
            name="link"
            placeholder="Banner Link (optional)"
            className="border px-3 py-1.5 rounded-md outline-none transition w-full border-secondary"
            value={form.link}
            onChange={handleChange}
          />

          {/* Settings Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Order</label>
              <input
                name="order"
                type="number"
                min="0"
                className="border px-3 py-1.5 rounded-md outline-none transition w-full border-secondary"
                value={form.order}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Target</label>
              <select
                name="target"
                className="border px-3 py-1.5 rounded-md outline-none transition w-full border-secondary"
                value={form.target}
                onChange={handleChange}
              >
                <option value="_self">Same Tab</option>
                <option value="_blank">New Tab</option>
                <option value="_parent">Parent</option>
                <option value="_top">Top</option>
              </select>
            </div>
          </div>

          {/* Date Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">
                Start Date
              </label>
              <input
                name="startDate"
                type="date"
                className="border px-3 py-1.5 rounded-md outline-none transition w-full border-secondary"
                value={form.startDate}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                End Date (optional)
              </label>
              <input
                name="endDate"
                type="date"
                className="border px-3 py-1.5 rounded-md outline-none transition w-full border-secondary"
                value={form.endDate}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Checkboxes */}
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="isActive"
                checked={form.isActive}
                onChange={handleChange}
              />
              Active
            </label>
          </div>

          {/* Image Upload Area */}
          <div
            onDragEnter={onDragEnter}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            className={`border-dashed border-2 rounded p-4 text-center cursor-pointer ${
              dragOver ? "border-success bg-success/50" : "border-secondary/30"
            }`}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={onFileInputChange}
              className="hidden"
            />

            {image ? (
              <div className="relative">
                <img
                  src={image.url}
                  alt="Banner preview"
                  className="max-h-64 mx-auto object-contain bg-white rounded"
                />
                <Btn
                  variant="danger"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeImage();
                  }}
                  className="absolute top-2 right-2 px-2 py-1 rounded-full"
                >
                  <i className="fa-solid fa-x text-xs"></i>
                </Btn>
              </div>
            ) : (
              <div className="py-8">
                <i className="fa-solid fa-cloud-arrow-up text-4xl text-secondary mb-2"></i>
                <p className="mb-2">
                  Drag & drop banner image here or click to choose
                </p>
                <p className="text-sm text-gray-500">
                  Recommended: 1920x600px, max 5MB
                </p>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex gap-2">
            {selectedBanner ? (
              <Btn
                variant="primary"
                onClick={updateBanner}
                disabled={loading}
                className="flex-1 px-4 py-2 rounded disabled:bg-secondary"
              >
                {loading ? "Updating..." : "Update Banner"}
              </Btn>
            ) : (
              <Btn
                variant="success"
                onClick={createBanner}
                disabled={loading || !image}
                className="flex-1 px-4 py-2 rounded disabled:bg-gray-400"
              >
                {loading ? "Creating..." : "Create Banner"}
              </Btn>
            )}
          </div>
        </div>

        {/* Banners List */}
        <div className="border p-4 rounded bg-container">
          <h3 className="text-lg font-semibold mb-4">
            Active Banners ({banners.filter((b) => b.isActive).length})
          </h3>

          {banners.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <i className="fa-solid fa-images text-4xl mb-3"></i>
              <p>No banners created yet</p>
            </div>
          ) : (
            <div className="space-y-4 max-h-[70vh] overflow-auto">
              {banners
                .sort((a, b) => a.order - b.order)
                .map((banner) => (
                  <div
                    key={banner._id}
                    className={`border rounded p-3 ${
                      selectedBanner?._id === banner._id
                        ? "border-primary bg-primary/5"
                        : ""
                    } ${!banner.isActive ? "opacity-60" : ""}`}
                  >
                    <div className="flex gap-3">
                      {/* Banner Image */}
                      <div className="shrink-0 w-24 h-16">
                        <img
                          src={banner.image.url}
                          alt={banner.title || "Banner"}
                          className="w-full h-full object-contain bg-white rounded"
                        />
                      </div>

                      {/* Banner Info */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold truncate">
                          {banner.title || "No Title"}
                        </h4>
                        <p className="text-sm text-gray-600 truncate">
                          {banner.link || "No link"}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                          <span>Order: {banner.order}</span>
                          <span>•</span>
                          <span
                            className={`px-1 rounded ${
                              banner.isActive
                                ? "bg-success/20 text-success"
                                : "bg-danger/20 text-danger"
                            }`}
                          >
                            {banner.isActive ? "Active" : "Inactive"}
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col gap-1">
                        <Btn
                          variant="secondary"
                          onClick={() => editBanner(banner)}
                          className="px-2 py-1 text-xs"
                        >
                          Edit
                        </Btn>
                        <Btn
                          variant={banner.isActive ? "warning" : "success"}
                          onClick={() =>
                            toggleBannerStatus(banner._id, banner.isActive)
                          }
                          className="px-2 py-1 text-xs"
                        >
                          {banner.isActive ? "Deactivate" : "Activate"}
                        </Btn>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
