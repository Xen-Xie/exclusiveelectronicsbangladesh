import React, { useState } from "react";

function SearchBar({ products, onSearch }) {
  const [query, setQuery] = useState("");

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

    // Pass filtered list back to parent
    onSearch(filtered);
  };

  return (
    <div className="w-full max-w-md mx-auto my-4 relative">
      <input
        type="text"
        value={query}
        onChange={handleChange}
        placeholder="Search products..."
        className="
          w-full border border-secondary/40 rounded-full px-4 py-2 pl-10
          focus:outline-none focus:ring-2 focus:ring-primary/65 focus:border-transparent
          shadow-sm bg-container text-secondary placeholder-secondary/45
        "
      />
      <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary/45"></i>
    </div>
  );
}

export default SearchBar;
