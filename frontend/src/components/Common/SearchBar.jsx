import React, { useState } from "react";

function SearchBar({ products, onSearch }) {
  const [query, setQuery] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);

  const handleChange = (e) => {
    const value = e.target.value;
    setQuery(value);

    // Filter products by name, slug, or category
    const filtered = products.filter(
      (p) =>
        (p.name || "").toLowerCase().includes(value.toLowerCase()) ||
        (p.slug || "").toLowerCase().includes(value.toLowerCase()) ||
        (p.category || "").toLowerCase().includes(value.toLowerCase())
    );

    onSearch(filtered);
  };

  // Sorting handler
  const handleSort = (option) => {
    let sorted = [...products];
    if (option === "new-old") {
      sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (option === "old-new") {
      sorted.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    } else if (option === "price-high") {
      sorted.sort(
        (a, b) => (b.salePrice || b.price) - (a.salePrice || a.price)
      );
    } else if (option === "price-low") {
      sorted.sort(
        (a, b) => (a.salePrice || a.price) - (b.salePrice || b.price)
      );
    }

    onSearch(
      sorted.filter(
        (p) =>
          (p.name || "").toLowerCase().includes(query.toLowerCase()) ||
          (p.slug || "").toLowerCase().includes(query.toLowerCase()) ||
          (p.category || "").toLowerCase().includes(query.toLowerCase())
      )
    );

    setFilterOpen(false); // close popup after selection
  };

  return (
    <div className="w-full max-w-md mx-auto my-4 relative">
      {/* Input + Filter button wrapper */}
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={handleChange}
          placeholder="Search products..."
          className="
            w-full border border-secondary/40 rounded-full px-4 py-2 pl-10 pr-10
            focus:outline-none focus:ring-2 focus:ring-primary/65 focus:border-transparent
            shadow-sm bg-container text-secondary placeholder-secondary/45
          "
        />
        <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary/45"></i>

        {/* Filter / Sort button */}
        <button
          onClick={() => setFilterOpen((prev) => !prev)}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 text-secondary p-1 rounded hover:bg-secondary/10 transition"
        >
          <i className="fa-solid fa-filter"></i>
        </button>

        {/* Filter Popup */}
        {filterOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white border rounded shadow-lg z-50">
            <button
              onClick={() => handleSort("new-old")}
              className="w-full text-left px-4 py-2 hover:bg-primary/10"
            >
              Newest
            </button>
            <button
              onClick={() => handleSort("old-new")}
              className="w-full text-left px-4 py-2 hover:bg-primary/10"
            >
              Oldest
            </button>
            <button
              onClick={() => handleSort("price-high")}
              className="w-full text-left px-4 py-2 hover:bg-primary/10"
            >
              Price: High to Low
            </button>
            <button
              onClick={() => handleSort("price-low")}
              className="w-full text-left px-4 py-2 hover:bg-primary/10"
            >
              Price: Low to High
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default SearchBar;
