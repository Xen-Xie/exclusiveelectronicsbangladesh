import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { debounce } from "lodash";

function SearchBar({ products, onSearch }) {
  const [query, setQuery] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [loading, setLoading] = useState(false);
  const [searchType, setSearchType] = useState("name");
  const [error, setError] = useState(null);

  const searchRef = useRef(null);
  const suggestionsRef = useRef(null);
  const apiUrl = import.meta.env.VITE_API_URL;

  // Click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target) &&
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Create the debounced function with useRef to persist across renders
  const debouncedFetchSuggestions = useRef(
    debounce(async (searchTerm) => {
      console.log("Fetching suggestions for:", searchTerm);

      if (!searchTerm.trim() || searchTerm.length < 2) {
        console.log("Search term too short");
        setSuggestions([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        console.log(
          "Making API call to:",
          `${apiUrl}/api/products/search/suggestions?q=${searchTerm}`
        );

        const response = await axios.get(
          `${apiUrl}/api/products/search/suggestions`,
          {
            params: { q: searchTerm },
          }
        );

        console.log("API Response:", response.data);
        setSuggestions(response.data.data || []);
      } catch (error) {
        console.error("Error fetching suggestions:", error);
        setError(error.message);
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 500)
  ).current;

  // Improved SKU detection
  const isLikelySku = (value) => {
    const trimmedValue = value.trim();

    // SKUs are usually shorter and follow specific patterns
    if (trimmedValue.length > 30) return false; // Too long for SKU

    // Check if it looks like a product name (contains spaces, common words)
    const hasSpaces = trimmedValue.includes(" ");
    const hasCommonWords =
      /(phone|laptop|tablet|watch|charger|case|cover|adapter)/i.test(
        trimmedValue
      );

    if (hasSpaces || hasCommonWords) {
      return false;
    }

    // Check for SKU-like pattern (alphanumeric with possible dashes/underscores)
    const skuPattern = /^[A-Za-z0-9][A-Za-z0-9\-_]{2,29}$/;
    const looksLikeSku = skuPattern.test(trimmedValue);

    // Additional check: if it looks like a model number (mix of letters and numbers)
    const hasLettersAndNumbers = /[A-Za-z].*[0-9]|[0-9].*[A-Za-z]/.test(
      trimmedValue
    );

    return looksLikeSku && hasLettersAndNumbers && !hasSpaces;
  };

  // Handle query change
  const handleChange = (e) => {
    const value = e.target.value;
    setQuery(value);

    // Always show suggestions when typing (if not SKU)
    if (value.length >= 2) {
      const likelySku = isLikelySku(value);

      if (likelySku && value.length >= 3) {
        setSearchType("sku");
        setShowSuggestions(false); // Don't show suggestions for SKU

        // Perform immediate SKU search (exact match)
        const filtered = products.filter(
          (p) => p.sku && p.sku.toLowerCase() === value.toLowerCase()
        );
        onSearch(filtered, value); // Pass search term
      } else {
        setSearchType("name");
        setShowSuggestions(true);

        // Fetch suggestions for name/category search using debounced function
        debouncedFetchSuggestions(value);

        // Also filter local products for instant results
        const filtered = products.filter(
          (p) =>
            (p.name || "").toLowerCase().includes(value.toLowerCase()) ||
            (p.slug || "").toLowerCase().includes(value.toLowerCase()) ||
            (p.category || "").toLowerCase().includes(value.toLowerCase()) ||
            (p.tags || []).some((tag) =>
              tag.toLowerCase().includes(value.toLowerCase())
            ) ||
            (p.sku || "").toLowerCase().includes(value.toLowerCase()) // Also search SKU partially
        );
        onSearch(filtered, value); // Pass search term
      }
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
      onSearch(products, ""); // Reset to all products when query is empty
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion) => {
    console.log("Suggestion clicked:", suggestion);
    setQuery(suggestion.name);
    setShowSuggestions(false);

    // Filter products by the selected suggestion
    const filtered = products.filter(
      (p) =>
        p._id === suggestion._id || // Match by ID if available
        p.name.toLowerCase().includes(suggestion.name.toLowerCase()) ||
        p.slug === suggestion.slug
    );
    onSearch(filtered, suggestion.name); // Pass search term
  };

  // Clear search
  const handleClear = () => {
    setQuery("");
    setSuggestions([]);
    setShowSuggestions(false);
    setError(null);
    onSearch(products, ""); // Pass empty search term
  };

  // Handle form submit
  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    setShowSuggestions(false);

    if (!query.trim()) {
      onSearch(products, "");
      return;
    }

    if (searchType === "sku") {
      // Exact SKU match
      const filtered = products.filter(
        (p) => p.sku && p.sku.toLowerCase() === query.toLowerCase()
      );
      onSearch(filtered, query);
    } else {
      // Partial match for name, category, slug, tags, and SKU
      const filtered = products.filter(
        (p) =>
          (p.name || "").toLowerCase().includes(query.toLowerCase()) ||
          (p.slug || "").toLowerCase().includes(query.toLowerCase()) ||
          (p.category || "").toLowerCase().includes(query.toLowerCase()) ||
          (p.tags || []).some((tag) =>
            tag.toLowerCase().includes(query.toLowerCase())
          ) ||
          (p.sku || "").toLowerCase().includes(query.toLowerCase()) // Include SKU in regular search
      );
      onSearch(filtered, query);
    }
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

    const filtered = sorted.filter(
      (p) =>
        query.trim() === "" ||
        (p.name || "").toLowerCase().includes(query.toLowerCase()) ||
        (p.slug || "").toLowerCase().includes(query.toLowerCase()) ||
        (p.category || "").toLowerCase().includes(query.toLowerCase()) ||
        (p.sku || "").toLowerCase().includes(query.toLowerCase())
    );

    onSearch(filtered, query);
    setFilterOpen(false);
  };

  return (
    <div className="w-full max-w-md mx-auto my-4 relative" ref={searchRef}>
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={handleChange}
            onFocus={() => {
              if (query.length >= 2 && !isLikelySku(query)) {
                setShowSuggestions(true);
              }
            }}
            placeholder="Search by name, category, or SKU..."
            className="
              w-full border border-secondary/40 rounded-full px-4 py-2 pl-10 pr-10
              focus:outline-none focus:ring-2 focus:ring-primary/65 focus:border-transparent
              shadow-sm bg-container text-secondary placeholder-secondary/45 truncate
            "
          />
          <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary/45"></i>

          {/* Clear button */}
          {query && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-10 top-1/2 transform -translate-y-1/2 text-secondary/60 hover:text-secondary p-1"
            >
              <i className="fa-solid fa-times"></i>
            </button>
          )}

          {/* Filter / Sort button */}
          <button
            type="button"
            onClick={() => setFilterOpen((prev) => !prev)}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-secondary p-1 rounded hover:bg-secondary/10 transition"
          >
            <i className="fa-solid fa-filter"></i>
          </button>

          {/* Search type indicator */}
          {query && searchType === "sku" && (
            <div className="absolute -top-6 right-0 text-xs bg-primary/10 text-primary px-2 py-1 rounded">
              Searching by SKU (exact match)
            </div>
          )}
        </div>
      </form>

      {/* Debug info */}
      {error && <div className="mt-1 text-xs text-red-500">Error: {error}</div>}

      {/* Suggestions Dropdown */}
      {showSuggestions && query.length >= 2 && searchType === "name" && (
        <div
          ref={suggestionsRef}
          className="absolute left-0 right-0 mt-1 bg-primarybg border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto"
        >
          {loading ? (
            <div className="p-4 text-center text-gray-500">
              <i className="fa-solid fa-spinner fa-spin mr-2"></i>
              Loading suggestions...
            </div>
          ) : suggestions.length > 0 ? (
            <>
              <div className="px-4 py-2 border-b text-xs text-gray-500 bg-gray-50">
                Found {suggestions.length} suggestions
              </div>
              <ul className="py-2">
                {suggestions.map((suggestion, index) => (
                  <li key={index}>
                    <button
                      type="button"
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center justify-between"
                    >
                      <div>
                        <div className="font-medium">{suggestion.name}</div>
                        <div className="text-xs text-gray-500">
                          {suggestion.category}
                          {suggestion.sku && ` • SKU: ${suggestion.sku}`}
                        </div>
                      </div>
                      <i className="fa-solid fa-arrow-right text-gray-400"></i>
                    </button>
                  </li>
                ))}
              </ul>
            </>
          ) : query.length >= 2 && !loading ? (
            <div className="p-4 text-center text-gray-500">
              No suggestions found for "{query}"
            </div>
          ) : null}
        </div>
      )}

      {/* Filter Popup */}
      {filterOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white border rounded-lg shadow-lg z-50">
          <div className="p-2 border-b">
            <div className="text-xs font-semibold text-gray-500 mb-1">
              Sort By
            </div>
          </div>
          <button
            onClick={() => handleSort("new-old")}
            className="w-full text-left px-4 py-2 hover:bg-primary/10 flex items-center"
          >
            <i className="fa-solid fa-calendar-plus mr-2 text-gray-400"></i>
            Newest
          </button>
          <button
            onClick={() => handleSort("old-new")}
            className="w-full text-left px-4 py-2 hover:bg-primary/10 flex items-center"
          >
            <i className="fa-solid fa-calendar-minus mr-2 text-gray-400"></i>
            Oldest
          </button>
          <button
            onClick={() => handleSort("price-high")}
            className="w-full text-left px-4 py-2 hover:bg-primary/10 flex items-center"
          >
            <i className="fa-solid fa-arrow-down-wide-short mr-2 text-gray-400"></i>
            Price: High to Low
          </button>
          <button
            onClick={() => handleSort("price-low")}
            className="w-full text-left px-4 py-2 hover:bg-primary/10 flex items-center"
          >
            <i className="fa-solid fa-arrow-up-short-wide mr-2 text-gray-400"></i>
            Price: Low to High
          </button>
        </div>
      )}
    </div>
  );
}

export default SearchBar;
