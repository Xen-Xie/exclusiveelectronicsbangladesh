/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useAuth } from "../../auth/useAuth";
import { useNavigate } from "react-router";
import Btn from "../../components/Common/Btn";
import Select from "react-select";
import SearchBar from "../../components/Common/SearchBar";

// Helper: safe parse tags string -> array
const parseTags = (s) =>
  (s || "")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

// Basic client-side unique id for previews before upload
const makeId = () => Math.random().toString(36).slice(2, 9);

// Separate ImageThumbnails component
const ImageThumbnails = ({ images, onRemove, onMove }) => {
  const [dragItemIndex, setDragItemIndex] = useState(null);

  const handleDragStart = (e, index) => {
    setDragItemIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDrop = (e, index) => {
    e.preventDefault();
    if (dragItemIndex === null || dragItemIndex === index) return;

    const from = dragItemIndex;
    const to = index;
    if (from !== to) {
      onMove(from, to);
    }
    setDragItemIndex(null);
  };

  return (
    <div className="space-y-4">
      {/* Mobile: List view */}
      <div className="sm:hidden space-y-3">
        {images.map((img, index) => (
          <div
            key={img.id}
            className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200 shadow-sm"
          >
            {/* Number badge */}
            <div className="shrink-0 w-8 h-8 bg-primary text-primarybg rounded-full flex items-center justify-center text-sm font-semibold">
              {index + 1}
            </div>

            {/* Image preview */}
            <div className="w-16 h-16 rounded overflow-hidden border border-gray-300 shrink-0">
              <img
                src={img.url}
                alt={`Preview ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </div>

            {/* File info */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-800 truncate">
                {img.file?.name || "Image"}
              </p>
              <div className="flex items-center gap-2 mt-1">
                {img.file && (
                  <span className="text-xs text-gray-500">
                    {(img.file.size / 1024 / 1024).toFixed(2)} MB
                  </span>
                )}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col gap-1">
              {index > 0 && (
                <button
                  type="button"
                  onClick={() => onMove(index, -1)}
                  className="p-1.5 text-secondary rounded"
                  aria-label="Move up"
                >
                  <i className="fa-solid fa-arrow-up text-xs"></i>
                </button>
              )}
              <button
                type="button"
                onClick={() => onRemove(img.id)}
                className=" text-danger p-1.5 rounded"
                aria-label="Remove"
              >
                <i className="fa-solid fa-trash text-xs"></i>
              </button>
              {index < images.length - 1 && (
                <button
                  type="button"
                  onClick={() => onMove(index, 1)}
                  className="p-1.5 text-secondary rounded"
                  aria-label="Move down"
                >
                  <i className="fa-solid fa-arrow-down text-xs"></i>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Desktop: Grid view */}
      <div className="hidden sm:grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {images.map((img, index) => (
          <div
            key={img.id}
            className="group relative bg-white rounded-xl border border-gray-200 p-3 hover:border-primary transition-colors"
            draggable
            onDragStart={(e) => handleDragStart(e, index)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => handleDrop(e, index)}
          >
            {/* Number badge */}
            <div className="absolute -top-2 -left-2 z-10 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-semibold shadow-lg">
              {index + 1}
            </div>

            {/* Image container */}
            <div className="relative w-full aspect-square rounded-lg overflow-hidden mb-3">
              <img
                src={img.url}
                alt={`Preview ${index + 1}`}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />

              {/* Hover overlay with actions */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                {index > 0 && (
                  <button
                    type="button"
                    onClick={() => onMove(index, -1)}
                    className="px-2.5 py-2 bg-white rounded-full hover:bg-gray-100 transition-colors shadow-lg cursor-pointer"
                    aria-label="Move left"
                  >
                    <i className="fa-solid fa-arrow-left text-gray-700"></i>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => onRemove(img.id)}
                  className="px-2.5 py-2 bg-primarybg rounded-full hover:bg-container transition-colors shadow-lg cursor-pointer"
                  aria-label="Remove"
                >
                  <i className="fa-solid fa-trash text-danger"></i>
                </button>
                {index < images.length - 1 && (
                  <button
                    type="button"
                    onClick={() => onMove(index, 1)}
                    className="px-2.5 py-2 bg-white rounded-full hover:bg-gray-100 transition-colors shadow-lg cursor-pointer"
                    aria-label="Move right"
                  >
                    <i className="fa-solid fa-arrow-right text-gray-700"></i>
                  </button>
                )}
              </div>
            </div>

            {/* File info */}
            <div className="space-y-1">
              <p
                className="text-sm font-medium text-gray-800 truncate"
                title={img.file?.name}
              >
                {img.file?.name || "Image"}
              </p>
              {img.file && (
                <div className="flex justify-between items-center">
                  <p className="text-xs text-gray-500">
                    {(img.file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function AddProductPage() {
  const apiUrl = import.meta.env.VITE_API_URL || "";
  const { token } = useAuth() || {};
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);

  // Form state
  const [form, setForm] = useState({
    name: "",
    description: "",
    category: "",
    price: "",
    salePrice: "",
    onSale: false,
    stock: "",
    sku: "",
    tags: "",
    featured: false,
  });

  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState([]);
  const [dragOver, setDragOver] = useState(false);
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [currentProductId, setCurrentProductId] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const formRef = useRef(null);

  // Fetch products and extract unique categories
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get(`${apiUrl}/api/products`);

        // Handle different response structures
        let productsData = [];
        if (Array.isArray(res.data)) {
          productsData = res.data;
        } else if (res.data && Array.isArray(res.data.data)) {
          productsData = res.data.data;
        } else if (res.data && Array.isArray(res.data.products)) {
          productsData = res.data.products;
        }

        setProducts(productsData);

        // Extract unique categories from products
        const uniqueCategories = [
          ...new Set(
            productsData.map((product) => product.category).filter(Boolean)
          ),
        ].map((category) => ({ name: category }));

        setCategories(uniqueCategories);
      } catch (error) {
        console.error("Failed to fetch Products:", error);
      }
    };

    fetchProducts();
  }, [apiUrl]);

  // Handle search from global SearchBar
  const handleSearch = (searchResults, searchTerm) => {
    setSearchResults(searchResults);
    setIsSearching(searchTerm.trim().length > 0);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();

    try {
      setLoading(true);

      const data = new FormData();

      // Build the data object
      const requestData = {};

      // Include fields that have values
      if (form.name) requestData.name = form.name;
      if (form.description) requestData.description = form.description;
      if (form.category) requestData.category = form.category;
      if (form.price) requestData.price = parseFloat(form.price);

      // Only send discountPrice, NOT salePrice
      if (form.salePrice) {
        requestData.discountPrice = parseFloat(form.salePrice);
      } else {
        requestData.discountPrice = null;
      }

      if (form.stock) requestData.stock = parseInt(form.stock);
      if (form.sku) requestData.sku = form.sku;
      if (form.tags) requestData.tags = form.tags;
      requestData.onSale = form.onSale;
      requestData.featured = form.featured;

      // Append to FormData
      Object.keys(requestData).forEach((key) => {
        if (requestData[key] !== null && requestData[key] !== undefined) {
          data.append(key, requestData[key].toString());
        }
      });

      // Append images
      images.forEach((img) => {
        if (img.file) {
          data.append("images", img.file);
        }
      });

      const authToken = token || localStorage.getItem("token");

      let res;
      let message = "";

      if (isEditing && currentProductId) {
        // Update existing product
        res = await axios.put(
          `${apiUrl}/api/products/${currentProductId}`,
          data,
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );
        message = "Product updated successfully!";
      } else {
        // Create new product
        res = await axios.post(`${apiUrl}/api/products`, data, {
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "multipart/form-data",
          },
        });
        message = "Product created successfully!";
      }

      // Refresh products list
      const refreshRes = await axios.get(`${apiUrl}/api/products`);
      let productsData = [];
      if (Array.isArray(refreshRes.data)) {
        productsData = refreshRes.data;
      } else if (refreshRes.data && Array.isArray(refreshRes.data.data)) {
        productsData = refreshRes.data.data;
      }
      setProducts(productsData);

      alert(message);
      resetForm();
    } catch (err) {
      console.error("Error saving product:", err);
      const errorMessage =
        err.response?.data?.message || "Error saving product";
      alert(`Error: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  // Delete product
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?"))
      return;

    try {
      const authToken = token || localStorage.getItem("token");
      await axios.delete(`${apiUrl}/api/products/${id}`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      // Refresh products list
      const refreshRes = await axios.get(`${apiUrl}/api/products`);
      let productsData = [];
      if (Array.isArray(refreshRes.data)) {
        productsData = refreshRes.data;
      } else if (refreshRes.data && Array.isArray(refreshRes.data.data)) {
        productsData = refreshRes.data.data;
      }
      setProducts(productsData);

      alert("Product deleted successfully!");
      resetForm();
    } catch (err) {
      console.error("Failed to delete product:", err);
      alert("Failed to delete product");
    }
  };

  // Edit product
  const handleEdit = (product) => {
    setIsEditing(true);
    setCurrentProductId(product._id);

    const price = product.price || 0;
    const salePrice = product.salePrice || 0;

    // Check if salePrice is valid, if not show warning
    if (salePrice > price) {
      alert(
        "Warning: This product has an invalid sale price (higher than regular price). The sale price has been cleared."
      );
    }

    setForm({
      name: product.name || "",
      description: product.description || "",
      category: product.category || "",
      price: price,
      salePrice: salePrice <= price ? salePrice : "",
      onSale: product.onSale && salePrice <= price,
      stock: product.stock || "",
      sku: product.sku || "",
      tags: Array.isArray(product.tags)
        ? product.tags.join(", ")
        : product.tags || "",
      featured: product.featured || false,
    });

    // Populate images for editing
    const imgs = (product.images || []).map((it) => ({
      id: makeId(),
      url: it.url,
      public_id: it.public_id,
    }));
    setImages(imgs);

    // Scroll to form
    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // Cancel edit operation
  const cancelEdit = () => {
    if (window.confirm("Cancel editing? All unsaved changes will be lost.")) {
      resetForm();
    }
  };

  // Reset form
  const resetForm = () => {
    setForm({
      name: "",
      description: "",
      category: "",
      price: "",
      salePrice: "",
      onSale: false,
      stock: "",
      sku: "",
      tags: "",
      featured: false,
    });
    setImages([]);
    setIsEditing(false);
    setCurrentProductId(null);
    setNewCategory("");
    setIsSearching(false);
    setSearchResults([]);
  };

  // Form change handler
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm((prev) => {
      const newForm = {
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      };

      // Auto-validate salePrice when price changes
      if (name === "price" && newForm.salePrice) {
        const priceNum = parseFloat(value) || 0;
        const salePriceNum = parseFloat(newForm.salePrice) || 0;
        if (salePriceNum > priceNum) {
          newForm.salePrice = "";
          newForm.onSale = false;
        }
      }

      // Auto-validate salePrice when salePrice changes
      if (name === "salePrice" && value && newForm.price) {
        const priceNum = parseFloat(newForm.price) || 0;
        const salePriceNum = parseFloat(value) || 0;
        if (salePriceNum > priceNum) {
          alert("Sale price cannot be higher than regular price");
          newForm.salePrice = "";
          newForm.onSale = false;
        }
      }

      return newForm;
    });
  };

  // File handling functions
  const handleFilesSelected = (fileList) => {
    const filesArray = Array.from(fileList);
    const newItems = filesArray.map((file) => ({
      id: makeId(),
      file,
      url: URL.createObjectURL(file),
    }));
    setImages((prev) => [...prev, ...newItems]);
  };

  const onFileInputChange = (e) => {
    if (!e.target.files) return;
    handleFilesSelected(e.target.files);
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
    if (e.dataTransfer?.files) handleFilesSelected(e.dataTransfer.files);
  };

  // Image management
  const removeImage = (id) => {
    setImages((prev) => prev.filter((img) => img.id !== id));
  };

  // Fix the moveImage function
  const moveImage = (index, direction) => {
    if (direction === -1 && index === 0) return;
    if (direction === 1 && index === images.length - 1) return;

    const newIndex = index + direction;
    setImages((prev) => {
      const arr = [...prev];
      [arr[index], arr[newIndex]] = [arr[newIndex], arr[index]];
      return arr;
    });
  };

  // Add category to local state
  const addCategory = () => {
    if (!newCategory.trim()) {
      alert("⚠️ Please enter a category name");
      return;
    }

    if (
      !categories.find(
        (cat) => cat.name.toLowerCase() === newCategory.toLowerCase()
      )
    ) {
      setCategories((prev) => [...prev, { name: newCategory.trim() }]);
      setForm((prev) => ({ ...prev, category: newCategory.trim() }));
    }
    setNewCategory("");
  };

  // Remove category from local state
  const deleteCategory = (categoryName) => {
    if (!window.confirm(`🗑️ Remove category "${categoryName}" from list?`))
      return;
    setCategories((prev) => prev.filter((cat) => cat.name !== categoryName));
    if (form.category === categoryName) {
      setForm((prev) => ({ ...prev, category: "" }));
    }
  };

  return (
    <div className="p-4 max-w-7xl mx-auto space-y-8 font-urbanist">
      {/* Header Section */}
      <div className="text-center space-y-3">
        <h1 className="text-3xl md:text-4xl font-bold bg-linear-to-r from-primary to-secondary bg-clip-text text-transparent">
          Product Management
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          {isEditing
            ? "Edit existing product details below"
            : "Add new products or search existing ones to edit"}
        </p>
      </div>

      {/* Search Section with Card */}
      <div className="bg-linear-to-br from-white to-gray-50 rounded-2xl shadow-lg p-6 space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              <i className="fa-solid fa-magnifying-glass text-primary"></i>
              Find & Edit Products
            </h2>
            <p className="text-gray-600 text-sm">
              Search for products by name, category, or SKU
            </p>
          </div>
          {isEditing && (
            <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full">
              <i className="fa-solid fa-pen"></i>
              <span className="font-medium">Editing Mode</span>
            </div>
          )}
        </div>

        <div className="max-w-lg">
          <SearchBar products={products} onSearch={handleSearch} />
        </div>

        {/* Search Results */}
        {isSearching && searchResults.length > 0 && (
          <div className="mt-4 animate-fadeIn">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <i className="fa-solid fa-list text-primary"></i>
                Found {searchResults.length} Product
                {searchResults.length !== 1 && "s"}
              </h3>
              <span className="text-sm text-gray-500">Click to edit</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto p-1">
              {searchResults.map((product) => (
                <div
                  key={product._id}
                  className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md hover:border-primary/30 cursor-pointer transition-all duration-300 group"
                  onClick={() => handleEdit(product)}
                >
                  <div className="flex items-start gap-4">
                    <div className="relative">
                      {product.images && product.images[0] ? (
                        <img
                          src={product.images[0].url}
                          alt={product.name}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-linear-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center">
                          <i className="fa-solid fa-image text-gray-400"></i>
                        </div>
                      )}
                      {product.featured && (
                        <div className="absolute -top-1 -right-1 bg-yellow-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                          ★
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-800 truncate group-hover:text-primary transition-colors">
                        {product.name}
                      </h4>
                      <p className="text-sm text-gray-600 mt-1">
                        {product.category}
                      </p>
                      <div className="flex justify-between items-center mt-3">
                        <span className="font-bold text-lg text-primary">
                          ৳{product.price}
                        </span>
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            product.stock > 0
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {product.stock > 0
                            ? `${product.stock} in stock`
                            : "Out of stock"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {isSearching && searchResults.length === 0 && (
          <div className="mt-6 text-center py-8 bg-linear-to-b from-gray-50 to-white rounded-xl animate-fadeIn">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-linear-to-br from-gray-100 to-gray-200 rounded-full mb-4">
              <i className="fa-solid fa-search text-2xl text-gray-400"></i>
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              No products found
            </h3>
            <p className="text-gray-500 max-w-md mx-auto">
              Try searching with different keywords or check your spelling
            </p>
          </div>
        )}
      </div>

      {/* Main Form & Preview Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Form Card */}
        <div
          ref={formRef}
          className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden"
        >
          <div className="bg-linear-to-r from-primary to-secondary p-6">
            <div className="flex justify-between items-center">
              <h2 className="text-sm sm:text-xl font-bold text-white flex items-center gap-2 whitespace-nowrap">
                <i className="fa-solid fa-pencil-alt"></i>
                {isEditing ? "Edit Product" : "Create New Product"}
              </h2>
              <div className="flex gap-1 sm:gap-2">
                {isEditing && (
                  <>
                    <Btn
                      variant="danger"
                      onClick={() =>
                        currentProductId && handleDelete(currentProductId)
                      }
                      className="px-2 sm:px-4 py-2 rounded-lg shadow"
                      title="Delete"
                    >
                      <i className="fa-solid fa-trash sm:mr-2"></i>
                      <span className="hidden sm:inline">Delete</span>
                    </Btn>
                    <Btn
                      variant="warning"
                      onClick={cancelEdit}
                      className="px-2 sm:px-4 py-2 rounded-lg shadow"
                      title="Cancel"
                    >
                      <i className="fa-solid fa-times sm:mr-2"></i>
                      <span className="hidden sm:inline">Cancel</span>
                    </Btn>
                  </>
                )}
                <Btn
                  variant="secondary"
                  onClick={resetForm}
                  className="px-2 sm:px-4 py-2 rounded-lg shadow"
                  title="Reset"
                >
                  <i className="fa-solid fa-rotate sm:mr-2"></i>
                  <span className="hidden sm:inline">Reset</span>
                </Btn>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-secondary flex items-center gap-2">
                <i className="fa-solid fa-info-circle text-primary"></i>
                Basic Information
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-secondary">
                    Product Name *
                  </label>
                  <input
                    name="name"
                    placeholder="Enter product name"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-1 focus:ring-primary/30 focus:outline-none transition"
                    value={form.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-secondary">
                    Description
                  </label>
                  <textarea
                    name="description"
                    placeholder="Describe your product in detail..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-1 focus:ring-primary/30 focus:outline-none transition min-h-[120px]"
                    value={form.description}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            {/* Category Management */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-secondary flex items-center gap-2">
                <i className="fa-solid fa-tags text-primary"></i>
                Category Management
              </h3>

              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    name="category"
                    placeholder="Enter category"
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-1 focus:ring-primary/30 transition focus:outline-none text-sm sm:text-base"
                    value={form.category}
                    onChange={handleChange}
                    required
                  />
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      placeholder="New category"
                      className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-1 focus:ring-primary/30 transition focus:outline-none text-sm sm:text-base flex-1"
                    />
                    <Btn
                      variant="success"
                      onClick={addCategory}
                      className="px-4 py-3 rounded-xl whitespace-nowrap text-sm sm:text-base"
                    >
                      <i className="fa-solid fa-plus mr-2"></i> Add
                    </Btn>
                  </div>
                </div>

                <div>
                  <Select
                    options={categories.map((cat) => ({
                      value: cat.name,
                      label: cat.name,
                    }))}
                    value={
                      form.category
                        ? { value: form.category, label: form.category }
                        : null
                    }
                    onChange={(selectedOption) =>
                      setForm((prev) => ({
                        ...prev,
                        category: selectedOption ? selectedOption.value : "",
                      }))
                    }
                    placeholder="Select from existing categories"
                    isClearable
                    isSearchable
                    className="react-select-container"
                    classNamePrefix="react-select"
                    styles={{
                      control: (base) => ({
                        ...base,
                        border: "1px solid #d1d5db",
                        borderRadius: "0.75rem",
                        padding: "0.5rem",
                        minHeight: "44px",
                        fontSize: "14px",
                        "@media (min-width: 640px)": {
                          minHeight: "52px",
                          fontSize: "16px",
                        },
                      }),
                      menu: (base) => ({
                        ...base,
                        borderRadius: "0.75rem",
                        zIndex: 50,
                      }),
                    }}
                  />
                </div>

                <div className="flex flex-wrap gap-2 mt-2">
                  {categories.map((cat, index) => (
                    <div
                      key={index}
                      className="group flex items-center gap-2 bg-linear-to-r from-gray-50 to-gray-100 hover:from-primary/10 hover:to-primary/5 px-3 py-1 rounded-full border border-gray-200 transition-all"
                    >
                      <span className="text-sm font-medium text-gray-700">
                        {cat.name}
                      </span>
                      <button
                        type="button"
                        onClick={() => deleteCategory(cat.name)}
                        className="text-secondary/45 hover:text-danger transition-colors cursor-pointer"
                        aria-label={`Delete ${cat.name}`}
                      >
                        <i className="fa-solid fa-times text-xs"></i>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Pricing & Stock */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-secondary flex items-center gap-2">
                <i className="fa-solid fa-tag text-primary"></i>
                Pricing & Stock
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-secondary">
                    Price (৳) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary">
                      ৳
                    </span>
                    <input
                      name="price"
                      placeholder="0.00"
                      type="number"
                      step="0.01"
                      min="0"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-1 focus:ring-primary/30 focus:outline-none transition"
                      value={form.price}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-secondary">
                    Sale Price (৳)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary">
                      ৳
                    </span>
                    <input
                      name="salePrice"
                      placeholder="0.00"
                      type="number"
                      step="0.01"
                      min="0"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-1 focus:ring-primary/30 focus:outline-none transition"
                      value={form.salePrice}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-secondary">
                    Stock *
                  </label>
                  <input
                    name="stock"
                    placeholder="0"
                    type="number"
                    min="0"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-1 focus:ring-primary/30 focus:outline-none transition"
                    value={form.stock}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <i className="fa-solid fa-barcode text-primary"></i>
                Additional Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-secondary">
                    SKU
                  </label>
                  <input
                    name="sku"
                    placeholder="PRODUCT-SKU-001"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-1 focus:ring-primary/30 focus:outline-none transition"
                    value={form.sku}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-secondary">
                    Tags
                  </label>
                  <input
                    name="tags"
                    placeholder="electronics, premium, new"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-1 focus:ring-primary/30 focus:outline-none transition"
                    value={form.tags}
                    onChange={handleChange}
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Separate tags with commas
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-6">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative">
                    <input
                      type="checkbox"
                      name="onSale"
                      checked={form.onSale}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <div
                      className={`w-10 h-5 rounded-full transition ${
                        form.onSale ? "bg-primary" : "bg-secondary/30"
                      }`}
                    ></div>
                    <div
                      className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-primarybg transition-transform ${
                        form.onSale ? "translate-x-5" : ""
                      }`}
                    ></div>
                  </div>
                  <span className="select-none font-medium text-secondary group-hover:text-primary transition-colors">
                    On Sale
                  </span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative">
                    <input
                      type="checkbox"
                      name="featured"
                      checked={form.featured}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <div
                      className={`w-10 h-5 rounded-full transition ${
                        form.featured ? "bg-warning" : "bg-secondary/30"
                      }`}
                    ></div>
                    <div
                      className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-primarybg transition-transform ${
                        form.featured ? "translate-x-5" : ""
                      }`}
                    ></div>
                  </div>
                  <span className="select-none font-medium text-gray-700 group-hover:text-warning transition-colors">
                    Featured
                  </span>
                </label>
              </div>
            </div>

            {/* Image Upload */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-secondary flex items-center gap-2">
                <i className="fa-solid fa-images text-primary"></i>
                <span className="text-sm sm:text-lg">Product Images</span>
              </h3>

              <div
                onDragEnter={onDragEnter}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
                className={`border-2 border-dashed rounded-xl sm:rounded-2xl p-4 sm:p-8 text-center transition-all duration-300 ${
                  dragOver
                    ? "border-primary bg-primary/5"
                    : "border-gray-300 hover:border-primary/50 bg-gray-50/50"
                }`}
              >
                <div className="flex flex-col items-center justify-center space-y-3 sm:space-y-4">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-linear-to-br from-primary/10 to-primary/5 rounded-full flex items-center justify-center">
                    <i className="fa-solid fa-cloud-arrow-up text-xl sm:text-2xl text-primary"></i>
                  </div>
                  <div className="text-center">
                    <p className="font-semibold text-gray-800 text-sm sm:text-base">
                      Drag & drop images here
                    </p>
                    <p className="text-xs sm:text-sm text-gray-500 mt-1">
                      or click to browse files
                    </p>
                  </div>
                  <div>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={onFileInputChange}
                      className="hidden"
                      id="file-upload"
                    />
                    <label
                      htmlFor="file-upload"
                      className="inline-block px-4 sm:px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors cursor-pointer text-sm sm:text-base"
                    >
                      <i className="fa-solid fa-folder-open mr-2"></i>
                      Browse Files
                    </label>
                  </div>
                </div>

                {images.length > 0 && (
                  <div className="mt-6 sm:mt-8">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4">
                      <div>
                        <p className="font-medium text-gray-800 text-sm sm:text-base">
                          {images.length} image{images.length !== 1 && "s"}{" "}
                          selected
                        </p>
                        <p className="text-xs sm:text-sm text-gray-500 mt-1">
                          Drag to reorder or use arrows to move
                        </p>
                      </div>
                      <Btn
                        variant="danger"
                        type="button"
                        onClick={() => setImages([])}
                        className="px-3 py-1.5 rounded-sm transition-colors text-sm w-fit self-end sm:self-auto"
                      >
                        Clear All
                      </Btn>
                    </div>
                    <ImageThumbnails
                      images={images}
                      onRemove={removeImage}
                      onMove={(index, direction) => moveImage(index, direction)}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t">
              {isEditing ? (
                <Btn
                  variant="primary"
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-shadow"
                >
                  {loading ? (
                    <>
                      <i className="fa-solid fa-spinner fa-spin mr-2"></i>
                      Updating...
                    </>
                  ) : (
                    <>
                      <i className="fa-solid fa-save mr-2"></i>
                      Update Product
                    </>
                  )}
                </Btn>
              ) : (
                <Btn
                  variant="success"
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-shadow"
                >
                  {loading ? (
                    <>
                      <i className="fa-solid fa-spinner fa-spin mr-2"></i>
                      Creating...
                    </>
                  ) : (
                    <>
                      <i className="fa-solid fa-plus-circle mr-2"></i>
                      Create Product
                    </>
                  )}
                </Btn>
              )}

              <Btn
                variant="warning"
                onClick={resetForm}
                type="button"
                className="px-6 py-3 rounded-xl"
              >
                <i className="fa-solid fa-eraser mr-2"></i>
                Clear Form
              </Btn>
            </div>
          </form>
        </div>

        {/* Preview Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden h-fit sticky top-6">
          <div className="bg-linear-to-r from-green-500 to-emerald-600 p-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <i className="fa-solid fa-eye"></i>
              Live Preview
            </h2>
            <p className="text-emerald-100 text-sm mt-1">
              How your product will appear to customers
            </p>
          </div>

          <div className="p-6 space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
            {/* Product Image Preview */}
            <div className="bg-linear-to-br from-gray-50 to-gray-100 rounded-2xl overflow-hidden">
              {images.length > 0 ? (
                <img
                  src={images[0].url}
                  alt="Product preview"
                  className="w-full h-64 md:h-72 object-cover"
                />
              ) : (
                <div className="w-full h-64 md:h-72 flex flex-col items-center justify-center text-gray-400">
                  <i className="fa-solid fa-image text-5xl mb-4"></i>
                  <p>No product image</p>
                  <p className="text-sm mt-1">Upload images to see preview</p>
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="space-y-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 line-clamp-2">
                  {form.name || "Product Name"}
                </h2>
                <div className="flex items-center gap-2 mt-2">
                  <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                    {form.category || "Uncategorized"}
                  </span>
                  {form.featured && (
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium flex items-center gap-1">
                      <i className="fa-solid fa-star text-xs"></i>
                      Featured
                    </span>
                  )}
                </div>
              </div>

              <p className="text-gray-600 leading-relaxed">
                {form.description || "No description provided."}
              </p>

              {/* Pricing */}
              <div className="space-y-3">
                <div className="flex items-baseline gap-3">
                  {form.onSale && form.salePrice ? (
                    <>
                      <span className="text-3xl font-bold text-danger">
                        ৳{form.salePrice}
                      </span>
                      <span className="text-xl line-through text-secondary/70">
                        ৳{form.price || "0.00"}
                      </span>
                      <span className="px-3 py-1 bg-danger/10 text-danger rounded-full text-xs xs:text-sm font-bold whitespace-nowrap">
                        SAVE{" "}
                        {(
                          ((parseFloat(form.price) -
                            parseFloat(form.salePrice)) /
                            parseFloat(form.price)) *
                          100
                        ).toFixed(0)}
                        %
                      </span>
                    </>
                  ) : (
                    <span className="text-3xl font-bold text-gray-900">
                      ৳{form.price || "0.00"}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-linear-to-br from-blue-50 to-blue-100 p-4 rounded-xl">
                    <p className="text-sm text-blue-600 font-medium">Stock</p>
                    <p className="text-xl font-bold text-blue-800">
                      {form.stock || "0"}
                    </p>
                    <p className="text-xs text-blue-600 mt-1">
                      units available
                    </p>
                  </div>
                  <div className="bg-linear-to-br from-gray-50 to-gray-100 p-4 rounded-xl">
                    <p className="text-sm text-gray-600 font-medium">SKU</p>
                    <p className="text-lg font-bold text-gray-800 truncate">
                      {form.sku || "Not specified"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Tags */}
              {form.tags && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Tags</p>
                  <div className="flex flex-wrap gap-2">
                    {parseTags(form.tags).map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1.5 bg-linear-to-r from-gray-100 to-gray-200 text-gray-700 rounded-lg text-sm font-medium whitespace-nowrap"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-3 pt-4 border-t">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {images.length}
                  </div>
                  <div className="text-xs text-gray-500">Images</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {form.onSale ? "Yes" : "No"}
                  </div>
                  <div className="text-xs text-gray-500">On Sale</div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="pt-6 border-t">
              <div className="flex flex-col sm:flex-row gap-3">
                <Btn
                  variant={isEditing ? "primary" : "success"}
                  onClick={handleSubmit}
                  className="flex-1 px-4 py-3 rounded-xl shadow hover:shadow-md transition-shadow"
                >
                  <i className="fa-solid fa-bolt mr-2"></i>
                  {isEditing ? "Update Now" : "Quick Create"}
                </Btn>

                {isEditing && currentProductId && (
                  <Btn
                    variant="info"
                    onClick={() => {
                      // Find the product to get its slug
                      const product = products.find(
                        (p) => p._id === currentProductId
                      );
                      if (product && product.slug) {
                        navigate(
                          `/products/${currentProductId}/${product.slug}`
                        );
                      } else {
                        // Fallback to just ID if no slug
                        navigate(`/products/${currentProductId}`);
                      }
                    }}
                    className="px-4 py-3 rounded-xl"
                  >
                    <i className="fa-solid fa-external-link mr-2"></i>
                    View Live
                  </Btn>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
