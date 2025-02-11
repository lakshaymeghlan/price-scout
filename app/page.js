"use client";

import React, { useState, useEffect } from "react";
import {
  Filter,
  Star,
  Search,
  TrendingUp,
  ShoppingCart,
  ChevronDown,
  AlertCircle,
  SlidersHorizontal,
} from "lucide-react";

const fetchProductPrices = async (searchTerm) => {
  try {
    const response = await fetch(
      `/api/search?q=${encodeURIComponent(searchTerm)}`
    );
    const data = await response.json();

    // Transform the shopping results into our app's format
    return data.shopping_results.map((item) => {
      // Extract the price and convert to number
      let price = item.price;
      if (typeof price === "string") {
        // Remove currency symbols and convert to number
        price = parseFloat(price.replace(/[^0-9.]/g, ""));

        // If price is in USD, convert to INR
        // Using approximate conversion rate
        price = price * 83; // USD to INR conversion rate
      }

      return {
        store: item.source || item.seller || "Unknown Store",
        price: price,
        link: item.link,
        rating: item.rating || 0,
        brand: item.snippet?.split(" ")[0] || "Unknown Brand",
        image: item.thumbnail || "/api/placeholder/80/80",
        delivery: item.shipping || "Shipping info unavailable",
        inStock: !item.out_of_stock,
        title: item.title,
        description: item.snippet,
      };
    });
  } catch (error) {
    console.error("Failed to fetch product data:", error);
    throw error;
  }
};

const PriceComparisonApp = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [products, setProducts] = useState([]);
  const [filters, setFilters] = useState({
    minPrice: 0,
    maxPrice: 10000,
    minRating: 0,
    showOutOfStock: true,
    sortBy: "price-asc",
  });
  const [showFilters, setShowFilters] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showAlert, setShowAlert] = useState(true); // state for alert visibility

  const handleCloseAlert = () => {
    setShowAlert(false); // hide the alert when close button is clicked
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    setIsLoading(true);
    setError(null);
    try {
      const results = await fetchProductPrices(searchTerm);
      setProducts(results);
    } catch (error) {
      setError("Failed to fetch product data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const sortProducts = (products) => {
    switch (filters.sortBy) {
      case "price-asc":
        return [...products].sort((a, b) => a.price - b.price);
      case "price-desc":
        return [...products].sort((a, b) => b.price - a.price);
      case "rating-desc":
        return [...products].sort((a, b) => b.rating - a.rating);
      default:
        return products;
    }
  };

  const filteredProducts = sortProducts(
    products.filter(
      (product) =>
        product.price >= filters.minPrice &&
        product.price <= filters.maxPrice &&
        product.rating >= filters.minRating &&
        (filters.showOutOfStock || product.inStock)
    )
  );

  const renderStars = (rating) => {
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`h-4 w-4 ${
              i < Math.floor(rating)
                ? "text-yellow-400 fill-yellow-400"
                : "text-gray-300"
            }`}
          />
        ))}
        <span className="ml-2 text-sm text-gray-600">{rating.toFixed(1)}</span>
      </div>
    );
  };

  // Add a formatter function for Indian Rupees
  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getBestDealBadge = (product, index) => {
    if (index === 0 && filters.sortBy === "price-asc") {
      return (
        <div className="absolute -top-2 -left-2 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium shadow-md">
          Best Deal
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Alert message */}
        {/* Alert message */}
        {showAlert && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800 p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 mr-2" />
              <p>
                "View Deal" feature is currently not working due to the paid API. We are
                working on a solution to restore full functionality.
              </p>
            </div>
            <button
              onClick={handleCloseAlert}
              className="text-yellow-800 hover:text-yellow-600 focus:outline-none"
            >
              X
            </button>
          </div>
        </div>
      )}

      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
                PriceScout
              </h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4">
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Find the Best Deals
          </h2>
          <div className="relative">
            <div className="flex items-center space-x-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search for products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                />
              </div>
              <button
                onClick={handleSearch}
                disabled={isLoading}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {isLoading ? "Searching..." : "Search"}
              </button>
              <button
                className={`p-3 rounded-lg border transition-colors ${
                  showFilters
                    ? "bg-blue-50 border-blue-200"
                    : "hover:bg-gray-50"
                }`}
                onClick={() => setShowFilters(!showFilters)}
              >
                <SlidersHorizontal className="h-5 w-5 text-gray-600" />
              </button>
            </div>

            {showFilters && (
              <div className="absolute top-full left-0 right-0 mt-2 p-4 bg-white rounded-lg shadow-lg border border-gray-100 z-10">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Price Range
                    </label>
                    <div className="flex space-x-2">
                      <input
                        type="number"
                        placeholder="Min"
                        value={filters.minPrice}
                        onChange={(e) =>
                          setFilters({
                            ...filters,
                            minPrice: Number(e.target.value),
                          })
                        }
                        className="w-full px-3 py-2 border rounded-md text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <input
                        type="number"
                        placeholder="Max"
                        value={filters.maxPrice}
                        onChange={(e) =>
                          setFilters({
                            ...filters,
                            maxPrice: Number(e.target.value),
                          })
                        }
                        className="w-full px-3 py-2 border rounded-md text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Sort By
                    </label>
                    <select
                      value={filters.sortBy}
                      onChange={(e) =>
                        setFilters({ ...filters, sortBy: e.target.value })
                      }
                      className="w-full px-3 py-2 border rounded-md text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="price-asc">Price: Low to High</option>
                      <option value="price-desc">Price: High to Low</option>
                      <option value="rating-desc">Highest Rated</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Minimum Rating
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="5"
                      step="0.5"
                      value={filters.minRating}
                      onChange={(e) =>
                        setFilters({
                          ...filters,
                          minRating: Number(e.target.value),
                        })
                      }
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="text-sm text-gray-600 text-center">
                      {filters.minRating} stars and above
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              <p>{error}</p>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Searching across stores...</p>
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="space-y-4">
            {filteredProducts.map((product, index) => (
              <div
                key={index}
                className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden relative"
              >
                {getBestDealBadge(product, index)}
                <div className="p-6">
                  <div className="flex items-start space-x-4">
                    <img
                      src={product.image}
                      alt={product.title}
                      className="w-20 h-20 rounded-lg object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {product.title}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {product.store}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-blue-600">
                            {formatPrice(product.price)}
                          </div>
                          <p className="text-sm text-gray-500">
                            {product.delivery}
                          </p>
                        </div>
                      </div>
                      <p className="mt-2 text-sm text-gray-600">
                        {product.description}
                      </p>
                      <div className="mt-2">{renderStars(product.rating)}</div>
                      <div className="mt-4 flex items-center justify-between">
                        <div className="flex items-center">
                          <ShoppingCart className="h-5 w-5 text-gray-400 mr-2" />
                          <span
                            className={`text-sm ${
                              product.inStock
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            {product.inStock ? "In Stock" : "Out of Stock"}
                          </span>
                        </div>
                        <button
                          onClick={() => window.open(product.link, "_blank")}
                          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                        >
                          <span>View Deal</span>
                          <ChevronDown className="h-4 w-4 transform -rotate-90" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
         ) : searchTerm ? (
          <div className="text-center py-12">
            <p className="text-gray-600">No products found for "{searchTerm}". Please try again with different terms.</p>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600">Search for products to compare prices.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default PriceComparisonApp;
