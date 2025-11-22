/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import { useAuth } from "../../auth/useAuth";
import { useNavigate } from "react-router";
import Btn from "../../components/Common/Btn";
import Select from "react-select";

// Helper: safe parse tags string -> array
const parseTags = (s) =>
  (s || "")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

// Basic client-side unique id for previews before upload
const makeId = () => Math.random().toString(36).slice(2, 9);

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
  const [searchTerm, setSearchTerm] = useState("");
  const [searchedProduct, setSearchedProduct] = useState(null);

  const formRef = useRef(null);
  const dragItemIndex = useRef(null);

  // Fetch products and extract unique categories
  const fetchProducts = useCallback(async () => {
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
  }, [apiUrl]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Handle form submission - PRODUCTION VERSION
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
      if (form.sku)
        requestData.sku = Array.isArray(form.sku) ? form.sku[0] : form.sku;
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
      if (searchedProduct) {
        res = await axios.put(
          `${apiUrl}/api/products/${searchedProduct._id}`,
          data,
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );
        alert("Product updated successfully!");
      } else {
        res = await axios.post(`${apiUrl}/api/products`, data, {
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "multipart/form-data",
          },
        });
        alert("Product created successfully!");
      }

      await fetchProducts();
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
      setProducts(products.filter((p) => p._id !== id));
      alert("Product deleted successfully!");
      resetForm();
    } catch (err) {
      console.error("Failed to delete product:", err);
      alert("Failed to delete product");
    }
  };

  // Edit product
  const handleEdit = (product) => {
    setSearchedProduct(product);

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
      salePrice: salePrice <= price ? salePrice : "", // Clear invalid salePrice
      onSale: product.onSale && salePrice <= price, // Only set onSale if salePrice is valid
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

    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
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
    setSearchedProduct(null);
    setSearchTerm("");
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
        if (parseFloat(newForm.salePrice) > parseFloat(value)) {
          // If salePrice becomes higher than new price, clear salePrice
          newForm.salePrice = "";
          newForm.onSale = false;
        }
      }

      // Auto-validate salePrice when salePrice changes
      if (name === "salePrice" && value && newForm.price) {
        if (parseFloat(value) > parseFloat(newForm.price)) {
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

  const onDragStart = (e, index) => {
    dragItemIndex.current = index;
    e.dataTransfer.effectAllowed = "move";
  };

  const onDropOnItem = (e, index) => {
    e.preventDefault();
    const from = dragItemIndex.current;
    const to = index;
    if (from === null || from === to) return;
    setImages((prev) => {
      const arr = [...prev];
      const [item] = arr.splice(from, 1);
      arr.splice(to, 0, item);
      return arr;
    });
    dragItemIndex.current = null;
  };

  const moveImage = (index, dir) => {
    setImages((prev) => {
      const arr = [...prev];
      const newIndex = index + dir;
      if (newIndex < 0 || newIndex >= arr.length) return prev;
      [arr[index], arr[newIndex]] = [arr[newIndex], arr[index]];
      return arr;
    });
  };

  // Search product
  const searchProductByName = async (name) => {
    if (!name.trim()) {
      alert("Please enter a product name to search");
      return;
    }

    try {
      // Search locally since we don't have a search endpoint
      const foundProduct = products.find((product) =>
        product.name.toLowerCase().includes(name.toLowerCase())
      );

      if (foundProduct) {
        handleEdit(foundProduct);
      } else {
        alert("Product not found");
        setSearchedProduct(null);
      }
    } catch (err) {
      console.error("Search error:", err);
      alert("Error searching product");
    }
  };

  // Add category to local state
  const addCategory = () => {
    if (!newCategory.trim()) {
      alert("Please enter a category name");
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
    if (!window.confirm(`Remove category "${categoryName}" from list?`)) return;
    setCategories((prev) => prev.filter((cat) => cat.name !== categoryName));
    if (form.category === categoryName) {
      setForm((prev) => ({ ...prev, category: "" }));
    }
  };

  // Action handlers
  const updateProduct = () => {
    if (!searchedProduct) {
      alert("No product selected for editing");
      return;
    }
    handleSubmit();
  };

  const deleteProduct = () => {
    if (!searchedProduct) {
      alert("No product selected for deletion");
      return;
    }
    handleDelete(searchedProduct._id);
  };

  const createProduct = () => {
    if (!form.name.trim()) {
      alert("Please enter a product name first");
      return;
    }
    handleSubmit();
  };

  // Image Thumbnails Component (responsive grid tweak)
  const ImageThumbnails = () => (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
      {images.map((img, idx) => (
        <div
          key={img.id}
          draggable
          onDragStart={(e) => onDragStart(e, idx)}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => onDropOnItem(e, idx)}
          className="relative border rounded overflow-hidden h-28"
        >
          <img
            src={img.url}
            alt=""
            className="w-full h-full object-cover"
            draggable={false}
          />
          <div className="absolute top-1 right-1 flex flex-col gap-1">
            <Btn
              variant="danger"
              onClick={() => removeImage(img.id)}
              className="px-1.5 py-0.3 rounded"
              title="Remove"
            >
              <i className="fa-solid fa-x text-xs"></i>
            </Btn>
            <button
              type="button"
              onClick={() => moveImage(idx, -1)}
              className="bg-secondary px-1.5 py-0.5 text-xs rounded text-primarybg"
              title="Move up"
            >
              ▲
            </button>
            <button
              type="button"
              onClick={() => moveImage(idx, 1)}
              className="bg-secondary px-1.5 py-0.5 text-xs rounded text-primarybg"
              title="Move down"
            >
              ▼
            </button>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="p-4 max-w-6xl mx-auto space-y-6 font-urbanist">
      {/* Search area - stacked on mobile */}
      <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-end">
        <input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search product by name..."
          className="border p-2 flex-1 border-secondary rounded-md w-full"
        />
        <div className="flex gap-2 w-full sm:w-auto">
          <Btn
            variant="primary"
            onClick={() => searchProductByName(searchTerm)}
            className="rounded-lg w-full sm:w-auto"
          >
            Search <i className="fa-solid fa-magnifying-glass ml-2"></i>
          </Btn>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form */}
        <form
          ref={formRef}
          onSubmit={handleSubmit}
          className="space-y-4 border p-4 rounded bg-primarybg w-full"
        >
          <div className="flex justify-between items-center gap-2 flex-wrap">
            <h2 className="text-xl font-semibold">
              {searchedProduct ? "Edit Product" : "Add New Product"}
            </h2>
            <div className="flex gap-2 flex-wrap">
              {searchedProduct && (
                <>
                  <Btn
                    variant="primary"
                    onClick={updateProduct}
                    className="px-3 py-1 rounded"
                  >
                    Save
                  </Btn>
                  <Btn
                    variant="danger"
                    onClick={deleteProduct}
                    className="px-3 py-1 rounded"
                  >
                    Delete
                  </Btn>
                </>
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

          <input
            name="name"
            placeholder="Product Name"
            className="border px-3 py-1.5 rounded-md outline-none transition w-full border-secondary"
            value={form.name}
            onChange={handleChange}
            required
          />

          <textarea
            name="description"
            placeholder="Description"
            className="border p-2 w-full rounded-md outline-none transition border-secondary"
            value={form.description}
            onChange={handleChange}
            rows={5}
          />

          {/* Category management */}
          {/* Category management */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {/* Category Text Input */}
            <input
              name="category"
              placeholder="Enter category or select below"
              className="border p-2 md:col-span-2 px-3 py-1.5 rounded-md outline-none transition border-secondary w-full truncate"
              value={form.category}
              onChange={handleChange}
            />

            {/* New Category + Add btn */}
            <div className="flex flex-col sm:flex-row gap-2 items-stretch w-full">
              <input
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="New category"
                className="border p-2 flex-1 px-3 py-1.5 rounded-md outline-none transition w-full border-secondary truncate"
              />
              <Btn
                variant="success"
                onClick={addCategory}
                className="px-3 py-2 rounded shrink-0 w-full sm:w-auto"
              >
                Add
              </Btn>
            </div>

            {/* React Select */}
            <div className="col-span-1 sm:col-span-2 md:col-span-3">
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
                placeholder="Select existing category"
                isClearable
                isSearchable
                className="react-select-container"
                classNamePrefix="react-select"
                styles={{
                  control: (base) => ({
                    ...base,
                    border: "1px solid #d1d5db",
                    borderRadius: "0.375rem",
                    padding: "0.25rem",
                  }),
                  menu: (base) => ({
                    ...base,
                    zIndex: 40,
                  }),
                }}
              />
            </div>

            {/* Category list */}
            <div className="col-span-1 sm:col-span-2 md:col-span-3">
              <div className="flex flex-wrap gap-2 mt-2">
                {categories.map((cat, index) => (
                  <div
                    key={index}
                    className="px-2 py-1 border rounded flex items-center gap-2"
                  >
                    <span className="text-sm">{cat.name}</span>
                    <Btn
                      variant="danger"
                      onClick={() => deleteCategory(cat.name)}
                      className="text-xs px-0.5 py-0.3 rounded"
                    >
                      <i className="fa-solid fa-x text-xs"></i>
                    </Btn>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <input
              name="price"
              placeholder="Price"
              type="number"
              step="0.01"
              min="0"
              className="border p-2 px-3 py-1.5 rounded-md outline-none transition border-secondary w-full"
              value={form.price}
              onChange={handleChange}
            />
            <input
              name="salePrice"
              placeholder="Sale Price"
              type="number"
              step="0.01"
              min="0"
              className="border p-2 px-3 py-1.5 rounded-md outline-none transition border-secondary w-full"
              value={form.salePrice}
              onChange={handleChange}
            />
          </div>

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="onSale"
                checked={form.onSale}
                onChange={handleChange}
              />
              On Sale
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="featured"
                checked={form.featured}
                onChange={handleChange}
              />
              Featured
            </label>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <input
              name="stock"
              placeholder="Stock"
              type="number"
              min="0"
              className="border p-2 px-3 py-1.5 rounded-md outline-none transition border-secondary w-full"
              value={form.stock}
              onChange={handleChange}
            />
            <input
              name="sku"
              placeholder="SKU"
              className="border p-2 px-3 py-1.5 rounded-md outline-none transition border-secondary w-full"
              value={form.sku}
              onChange={handleChange}
            />
            <input
              name="tags"
              placeholder="Tags (comma separated)"
              className="border p-2 px-3 py-1.5 rounded-md outline-none transition border-secondary w-full truncate"
              value={form.tags}
              onChange={handleChange}
            />
          </div>

          {/* Drag-drop area */}
          <div
            onDragEnter={onDragEnter}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            className={`border-dashed border-2 rounded p-4 text-center ${
              dragOver ? "border-success bg-success/50" : "border-secondary/30"
            }`}
          >
            <p className="mb-2">Drag & drop images here or click to choose</p>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={onFileInputChange}
              className="block mx-auto w-full max-w-md"
            />
            <p className="text-sm text-gray-500 mt-2">
              You can reorder thumbnails by drag or ▲▼ buttons
            </p>
            <div className="mt-3">
              <ImageThumbnails />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            {!searchedProduct ? (
              <Btn
                variant="success"
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2 rounded disabled:bg-secondary w-full sm:w-auto"
              >
                {loading ? "Creating..." : "Create Product"}
              </Btn>
            ) : (
              <Btn
                variant="secondary"
                onClick={updateProduct}
                disabled={loading}
                className="flex-1 px-4 py-2 rounded disabled:bg-gray-secondary w-full sm:w-auto"
              >
                {loading ? "Saving..." : "Save Changes"}
              </Btn>
            )}
            <Btn
              variant="warning"
              onClick={resetForm}
              className="px-4 py-2 rounded w-full sm:w-auto"
            >
              Reset
            </Btn>
          </div>
        </form>

        {/* Preview */}
        <aside className="border p-4 rounded bg-container w-full">
          <h3 className="text-lg font-semibold mb-2">Live Preview</h3>
          <div className="space-y-3 max-h-[70vh] overflow-auto p-1">
            <div className="border rounded overflow-hidden">
              {images.length > 0 ? (
                <img
                  src={images[0].url}
                  alt=""
                  className="w-full h-56 md:h-72 object-cover"
                />
              ) : (
                <div className="w-full h-56 md:h-72 bg-gray-100 flex items-center justify-center text-gray-400">
                  No image
                </div>
              )}
            </div>

            <h2 className="text-xl font-bold">{form.name || "Product name"}</h2>
            <p className="text-sm text-gray-600">
              {form.category || "Category"}
            </p>
            <p className="text-gray-700">
              {form.description || "Short description..."}
            </p>

            <div className="flex items-baseline gap-3">
              {form.onSale && form.salePrice ? (
                <>
                  <span className="text-2xl font-bold text-danger">
                    ৳{form.salePrice}
                  </span>
                  <span className="line-through text-secondary">
                    ৳{form.price || 0}
                  </span>
                </>
              ) : (
                <span className="text-2xl font-bold">৳{form.price || 0}</span>
              )}
            </div>

            <p className="text-sm text-secondary">Stock: {form.stock || 0}</p>
            <p className="text-sm text-secondary/50">SKU: {form.sku || "-"}</p>
            <div className="flex gap-2 flex-wrap mt-2">
              {parseTags(form.tags).map((t) => (
                <span key={t} className="text-xs bg-secondary/10 px-2 py-1 rounded">
                  {t}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-4 flex flex-col sm:flex-row gap-2">
            <Btn
            variant="success"
              type="button"
              onClick={createProduct}
              className="flex-1 px-3 py-2 rounded w-full sm:w-auto"
            >
              Quick Create
            </Btn>
            {searchedProduct && (
              <Btn
                type="button"
                onClick={() =>
                  navigate(
                    `/products/${searchedProduct.slug || searchedProduct._id}`
                  )
                }
                className="px-3 py-2 bg-blue-600 text-white rounded w-full sm:w-auto"
              >
                View Product
              </Btn>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
