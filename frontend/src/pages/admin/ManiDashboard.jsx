import React, { useEffect, useState } from "react";
import { useAuth } from "../../auth/useAuth";
import axios from "axios";
import Btn from "../../components/Common/Btn";
import Select from "react-select";
import { Link } from "react-router";

function MainDashboard() {
  const { user, token } = useAuth();
  const apiUrl = import.meta.env.VITE_API_URL;
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);
  const [showRevenuePopup, setShowRevenuePopup] = useState(false);

  // Time period state
  const [timePeriod, setTimePeriod] = useState({
    type: "today",
    value: new Date().toISOString().split("T")[0],
    customStart: "",
    customEnd: "",
  });

  const [stats, setStats] = useState({
    totalUsers: 0,
    totalOrders: 0,
    totalRevenue: 0,
    newCustomers: 0,
    ordersData: [],
    recentOrders: [],
  });

  // Auto-update to current period on mount
  useEffect(() => {
    const now = new Date();
    const currentDate = now.toISOString().split("T")[0];
    const currentMonth = `${now.getFullYear()}-${String(
      now.getMonth() + 1
    ).padStart(2, "0")}`;
    const currentYear = now.getFullYear().toString();

    setTimePeriod((prev) => {
      let newValue = prev.value;

      // Update value based on type to ensure current period
      switch (prev.type) {
        case "today":
          newValue = currentDate;
          break;
        case "week":
          newValue = currentDate;
          break;
        case "month":
          newValue = currentMonth;
          break;
        case "year":
          newValue = currentYear;
          break;
        default:
          break;
      }

      return {
        ...prev,
        value: newValue,
      };
    });
  }, []);

  useEffect(() => {
    if (!token || !user?.id) {
      setLoading(false);
      return;
    }

    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // Fetch user profile
        const profileRes = await axios.get(`${apiUrl}/api/user/${user.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const profile = profileRes.data.data || profileRes.data;
        setUserProfile(profile);

        // Build API URL based on time period
        let ordersUrl = `${apiUrl}/api/order/period`;
        let params = {};

        if (
          timePeriod.type === "custom" &&
          timePeriod.customStart &&
          timePeriod.customEnd
        ) {
          params = {
            startDate: timePeriod.customStart,
            endDate: timePeriod.customEnd,
          };
        } else {
          params = {
            period: timePeriod.type,
            date: timePeriod.value,
          };
        }

        const [usersRes, ordersRes] = await Promise.all([
          axios.get(`${apiUrl}/api/user`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(ordersUrl, {
            headers: { Authorization: `Bearer ${token}` },
            params: params,
          }),
        ]);

        const users = usersRes.data.data || usersRes.data || [];
        const orders = ordersRes.data.data || ordersRes.data || [];

        // Calculate stats
        const totalRevenue = orders.reduce(
          (sum, order) => sum + (order.total || 0),
          0
        );

        // Calculate new customers based on selected period
        const periodRange = getPeriodRange(timePeriod);
        const newCustomers = users.filter((user) => {
          const userDate = new Date(user.createdAt);
          return userDate >= periodRange.start && userDate <= periodRange.end;
        }).length;

        const recentOrders = orders.slice(0, 5);

        setStats({
          totalUsers: users.length,
          totalOrders: orders.length,
          totalRevenue,
          newCustomers,
          ordersData: orders,
          recentOrders,
        });
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
        setStats({
          totalUsers: 0,
          totalOrders: 0,
          totalRevenue: 0,
          newCustomers: 0,
          ordersData: [],
          recentOrders: [],
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [token, apiUrl, user?.id, timePeriod]);

  // Get date range for the selected period
  const getPeriodRange = (period) => {
    const now = new Date();
    let start, end;

    switch (period.type) {
      case "today": {
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        end = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate(),
          23,
          59,
          59
        );
        break;
      }

      case "week": {
        const selectedDate = new Date(period.value);
        const dayOfWeek = selectedDate.getDay();
        start = new Date(selectedDate);
        start.setDate(selectedDate.getDate() - dayOfWeek);
        start.setHours(0, 0, 0, 0);
        end = new Date(start);
        end.setDate(start.getDate() + 6);
        end.setHours(23, 59, 59, 999);
        break;
      }

      case "month": {
        const [year, month] = period.value.split("-");
        start = new Date(year, month - 1, 1);
        end = new Date(year, month, 0, 23, 59, 59);
        break;
      }

      case "year": {
        start = new Date(period.value, 0, 1);
        end = new Date(period.value, 11, 31, 23, 59, 59);
        break;
      }

      case "custom": {
        start = new Date(period.customStart);
        end = new Date(period.customEnd);
        end.setHours(23, 59, 59, 999);
        break;
      }

      default: {
        start = new Date(0);
        end = new Date();
      }
    }

    return { start, end };
  };

  // Format currency for display (full amount)
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-BD", {
      style: "currency",
      currency: "BDT",
    }).format(amount);
  };

  // Format numbers to compact form (2k, 2M, etc.)
  const formatCompactNumber = (number) => {
    if (number === 0) return "0";

    const formatter = Intl.NumberFormat("en", {
      notation: "compact",
      maximumFractionDigits: 1,
    });

    return formatter.format(number);
  };

  // Format currency to compact form (৳2k, ৳2M, etc.)
  const formatCompactCurrency = (amount) => {
    if (amount === 0) return "৳0";

    if (amount < 1000) {
      return `৳${amount}`;
    }

    const formatter = Intl.NumberFormat("en", {
      notation: "compact",
      maximumFractionDigits: 1,
      style: "currency",
      currency: "BDT",
    });

    return formatter.format(amount);
  };

  // Get period display text
  const getPeriodText = () => {
    const { type, value, customStart, customEnd } = timePeriod;

    switch (type) {
      case "today":
        return "Today";
      case "week": {
        const weekDate = new Date(value);
        const weekStart = new Date(weekDate);
        weekStart.setDate(weekDate.getDate() - weekDate.getDay());
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        return `Week of ${weekStart.toLocaleDateString()} - ${weekEnd.toLocaleDateString()}`;
      }
      case "month": {
        const [year, month] = value.split("-");
        return new Date(year, month - 1).toLocaleDateString("en-US", {
          month: "long",
          year: "numeric",
        });
      }
      case "year":
        return `Year ${value}`;
      case "custom":
        return `Custom: ${new Date(
          customStart
        ).toLocaleDateString()} - ${new Date(customEnd).toLocaleDateString()}`;
      default:
        return "Select Period";
    }
  };

  // Generate weeks for React Select (last 12 weeks)
  const getWeekOptions = () => {
    const weeks = [];
    const today = new Date();

    for (let i = 0; i < 12; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - i * 7);
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());

      const optionValue = weekStart.toISOString().split("T")[0];
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);

      const label = `Week of ${weekStart.toLocaleDateString()} - ${weekEnd.toLocaleDateString()}`;

      weeks.push({ value: optionValue, label });
    }

    return weeks;
  };

  // Generate months for React Select (last 12 months)
  const getMonthOptions = () => {
    const months = [];
    const today = new Date();

    for (let i = 0; i < 12; i++) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const value = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}`;
      const label = date.toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      });

      months.push({ value, label });
    }

    return months;
  };

  // Generate years for React Select (always current + last 4 years)
  const getYearOptions = () => {
    const years = [];
    const currentYear = new Date().getFullYear();

    for (let i = 0; i < 5; i++) {
      const year = currentYear - i;
      years.push({ value: year.toString(), label: year.toString() });
    }

    return years;
  };

  const getDisplayName = () => {
    return userProfile?.name || user?.name || user?.fullName || "Admin";
  };

  const handlePeriodTypeChange = (type) => {
    const now = new Date();
    let value;

    // Always use current date for the selected period type
    switch (type) {
      case "today":
        value = now.toISOString().split("T")[0];
        break;
      case "week":
        value = now.toISOString().split("T")[0];
        break;
      case "month":
        value = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
          2,
          "0"
        )}`;
        break;
      case "year":
        value = now.getFullYear().toString();
        break;
      default:
        value = now.toISOString().split("T")[0];
    }

    setTimePeriod((prev) => ({
      ...prev,
      type,
      value,
      customStart: "",
      customEnd: "",
    }));
  };

  // Add refresh functionality
  const refreshToCurrentPeriod = () => {
    handlePeriodTypeChange(timePeriod.type);
  };

  // React Select custom styles
  const selectStyles = {
    control: (base, state) => ({
      ...base,
      border: "1px solid #D1D5DB",
      borderRadius: "0.375rem",
      fontSize: "0.75rem",
      minHeight: "auto",
      padding: "2px 4px",
      boxShadow: state.isFocused ? "0 0 0 2px rgba(59, 130, 246, 0.1)" : "none",
      borderColor: state.isFocused ? "#3B82F6" : "#D1D5DB",
      "&:hover": {
        borderColor: state.isFocused ? "#3B82F6" : "#9CA3AF",
      },
      "@media (min-width: 640px)": {
        fontSize: "0.875rem",
        padding: "8px 12px",
      },
    }),
    menu: (base) => ({
      ...base,
      fontSize: "0.75rem",
      zIndex: 20,
      "@media (min-width: 640px)": {
        fontSize: "0.875rem",
      },
    }),
    option: (base, state) => ({
      ...base,
      fontSize: "0.75rem",
      padding: "6px 12px",
      backgroundColor: state.isSelected
        ? "#3B82F6"
        : state.isFocused
        ? "#F3F4F6"
        : "white",
      color: state.isSelected ? "white" : "#374151",
      "@media (min-width: 640px)": {
        fontSize: "0.875rem",
        padding: "8px 12px",
      },
    }),
    singleValue: (base) => ({
      ...base,
      fontSize: "0.75rem",
      "@media (min-width: 640px)": {
        fontSize: "0.875rem",
      },
    }),
    placeholder: (base) => ({
      ...base,
      fontSize: "0.75rem",
      "@media (min-width: 640px)": {
        fontSize: "0.875rem",
      },
    }),
    dropdownIndicator: (base) => ({
      ...base,
      padding: "4px",
      "@media (min-width: 640px)": {
        padding: "6px",
      },
    }),
  };

  // Get current selected value for React Select
  const getCurrentSelectValue = () => {
    switch (timePeriod.type) {
      case "week":
        return (
          getWeekOptions().find((week) => week.value === timePeriod.value) ||
          null
        );
      case "month":
        return (
          getMonthOptions().find((month) => month.value === timePeriod.value) ||
          null
        );
      case "year":
        return (
          getYearOptions().find((year) => year.value === timePeriod.value) ||
          null
        );
      default:
        return null;
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-classic"></div>
      </div>
    );

  return (
    <div className="space-y-6 p-4 sm:p-6 font-urbanist max-w-full overflow-x-hidden">
      {/* Revenue Details Popup */}
      {showRevenuePopup && (
        <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-primarybg rounded-xl shadow-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-secondary">
                Revenue Details
              </h3>
              <button
                onClick={() => setShowRevenuePopup(false)}
                className="text-danger hover:text-secondary transition-colors cursor-pointer"
              >
                <i className="fa-solid fa-xmark text-xl"></i>
              </button>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-600">Total Revenue</span>
                <span className="font-semibold text-secondary text-lg">
                  {formatCurrency(stats.totalRevenue)}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-600">Total Orders</span>
                <span className="font-semibold text-secondary">
                  {stats.totalOrders.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-secondary">Average Order Value</span>
                <span className="font-semibold text-gray-900">
                  {stats.totalOrders > 0
                    ? formatCurrency(stats.totalRevenue / stats.totalOrders)
                    : formatCurrency(0)}
                </span>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <Btn variant="warning" onClick={() => setShowRevenuePopup(false)}>
                Close
              </Btn>
            </div>
          </div>
        </div>
      )}

      {/* Header with Time Period Selector */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
        <div className="w-full xl:w-auto">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 wrap-break-word">
            Dashboard Overview
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">
            Welcome back, {getDisplayName()}!
          </p>
        </div>

        {/* Time Period Selector */}
        <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4 space-y-3 sm:space-y-4 w-full xl:w-80">
          <div className="flex justify-between items-center">
            <h3 className="text-xs sm:text-sm font-medium text-gray-700">
              Time Period
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded wrap-break-word text-right max-w-[140px]">
                {getPeriodText()}
              </span>
              <button
                onClick={refreshToCurrentPeriod}
                className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                title="Refresh to current period"
              >
                <i className="fa-solid fa-rotate text-xs"></i>
              </button>
            </div>
          </div>

          {/* Period Type Selector */}
          <div className="flex flex-wrap gap-1 bg-gray-100 rounded-lg p-1">
            {["today", "week", "month", "year", "custom"].map((type) => (
              <button
                key={type}
                onClick={() => handlePeriodTypeChange(type)}
                className={`flex-1 min-w-[60px] px-2 py-2 text-xs font-medium rounded-md transition-colors capitalize ${
                  timePeriod.type === type
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          {/* Dynamic Period Selector with React Select */}
          <div className="space-y-2 sm:space-y-3">
            {timePeriod.type === "week" && (
              <Select
                value={getCurrentSelectValue()}
                onChange={(selectedOption) =>
                  setTimePeriod((prev) => ({
                    ...prev,
                    value: selectedOption.value,
                  }))
                }
                options={getWeekOptions()}
                placeholder="Select a week..."
                styles={selectStyles}
                isSearchable={false}
              />
            )}

            {timePeriod.type === "month" && (
              <Select
                value={getCurrentSelectValue()}
                onChange={(selectedOption) =>
                  setTimePeriod((prev) => ({
                    ...prev,
                    value: selectedOption.value,
                  }))
                }
                options={getMonthOptions()}
                placeholder="Select a month..."
                styles={selectStyles}
                isSearchable={false}
              />
            )}

            {timePeriod.type === "year" && (
              <Select
                value={getCurrentSelectValue()}
                onChange={(selectedOption) =>
                  setTimePeriod((prev) => ({
                    ...prev,
                    value: selectedOption.value,
                  }))
                }
                options={getYearOptions()}
                placeholder="Select a year..."
                styles={selectStyles}
                isSearchable={false}
              />
            )}

            {timePeriod.type === "custom" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={timePeriod.customStart}
                    onChange={(e) =>
                      setTimePeriod((prev) => ({
                        ...prev,
                        customStart: e.target.value,
                      }))
                    }
                    className="w-full p-2 border border-gray-300 rounded-md text-xs sm:text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={timePeriod.customEnd}
                    onChange={(e) =>
                      setTimePeriod((prev) => ({
                        ...prev,
                        customEnd: e.target.value,
                      }))
                    }
                    className="w-full p-2 border border-gray-300 rounded-md text-xs sm:text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats Grid - Improved for mobile */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-3 sm:gap-4 lg:gap-6">
        {/* Total Users Card */}
        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-gray-600">
                Total Users
              </p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-1 truncate">
                {formatCompactNumber(stats.totalUsers)}
              </p>
            </div>
            <div className="p-2 sm:p-3 bg-blue-50 rounded-lg shrink-0 ml-3">
              <i className="fa-solid fa-users text-blue-600 text-lg sm:text-xl"></i>
            </div>
          </div>
          <div className="mt-3 sm:mt-4 flex items-center text-xs sm:text-sm">
            <span className="text-green-600 font-medium">
              +{formatCompactNumber(stats.newCustomers)} new
            </span>
            <span className="text-gray-500 ml-2">this period</span>
          </div>
        </div>

        {/* Total Orders Card */}
        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-gray-600">
                Total Orders
              </p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-1 truncate">
                {formatCompactNumber(stats.totalOrders)}
              </p>
            </div>
            <div className="p-2 sm:p-3 bg-green-50 rounded-lg shrink-0 ml-3">
              <i className="fa-solid fa-shopping-bag text-green-600 text-lg sm:text-xl"></i>
            </div>
          </div>
          <div className="mt-3 sm:mt-4">
            <p className="text-xs sm:text-sm text-gray-500 truncate">
              {getPeriodText()}
            </p>
          </div>
        </div>

        {/* Revenue Card */}
        <div className="bg-primarybg p-4 sm:p-6 rounded-xl shadow-sm border border-secondary/15">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-gray-600">
                Total Revenue
              </p>
              <div className="flex items-center gap-2">
                <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-1 truncate">
                  {formatCompactCurrency(stats.totalRevenue)}
                </p>
                <button
                  onClick={() => setShowRevenuePopup(true)}
                  className="p-1 text-info hover:text-gray-600 transition-colors shrink-0 cursor-pointer"
                  title="View full amount"
                >
                  <i className="fa-solid fa-eye text-xs"></i>
                </button>
              </div>
            </div>
            <div className="p-2 sm:p-3 bg-purple-50 rounded-lg shrink-0 ml-3">
              <i className="fa-solid fa-chart-line text-purple-600 text-lg sm:text-xl"></i>
            </div>
          </div>
          <div className="mt-3 sm:mt-4">
            <p className="text-xs sm:text-sm text-gray-500 truncate">
              {getPeriodText()}
            </p>
          </div>
        </div>

        {/* New Customers Card */}
        <div className="bg-primarybg p-4 sm:p-6 rounded-xl shadow-sm border border-secondary/15">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-gray-600">
                New Customers
              </p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-1 truncate">
                {formatCompactNumber(stats.newCustomers)}
              </p>
            </div>
            <div className="p-2 sm:p-3 bg-warning/15 rounded-lg shrink-0 ml-3">
              <i className="fa-solid fa-user-plus text-warning text-lg sm:text-xl"></i>
            </div>
          </div>
          <div className="mt-3 sm:mt-4">
            <p className="text-xs sm:text-sm text-gray-500 truncate">
              {getPeriodText()}
            </p>
          </div>
        </div>
      </div>

      {/* Charts and Recent Orders Section - Improved for mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Recent Orders */}
        <div className="bg-primarybg p-4 sm:p-6 rounded-xl shadow-sm border border-secondary/10">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
            <h3 className="text-lg font-semibold text-gray-900">
              Recent Orders
            </h3>
            <Btn variant="outline" size="sm" className="w-full sm:w-auto">
              <Link to="/admin/orders">View All</Link>
            </Btn>
          </div>
          <div className="space-y-2 sm:space-y-3">
            {stats.recentOrders.length > 0 ? (
              stats.recentOrders.map((order) => (
                <div
                  key={order._id}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors gap-2"
                >
                  <div className="flex items-center space-x-3 w-full sm:w-auto">
                    <div
                      className={`w-2 h-2 rounded-full shrink-0 ${
                        order.status === "delivered"
                          ? "bg-success"
                          : order.status === "shipped"
                          ? "bg-primary"
                          : order.status === "processing"
                          ? "bg-warning"
                          : "bg-secondary"
                      }`}
                    ></div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-gray-900 truncate">
                        Order #{order._id?.slice(-8) || "N/A"}
                      </p>
                      <p className="text-xs sm:text-sm text-gray-500 capitalize">
                        {order.status || "Pending"}
                      </p>
                    </div>
                  </div>
                  <div className="text-left sm:text-right w-full sm:w-auto">
                    <p className="font-semibold text-gray-900">
                      {formatCompactCurrency(order.total || 0)}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-500">
                      {order.createdAt
                        ? new Date(order.createdAt).toLocaleDateString()
                        : "N/A"}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6 sm:py-8 text-gray-500">
                <i className="fa-solid fa-inbox text-2xl sm:text-3xl mb-2 opacity-50"></i>
                <p className="text-sm sm:text-base">
                  No orders found for {getPeriodText().toLowerCase()}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Stats Summary */}
        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Performance Summary
          </h3>
          <div className="space-y-3 sm:space-y-4">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">Avg Order Value</span>
              <span className="font-semibold text-gray-900 text-sm sm:text-base">
                {stats.totalOrders > 0
                  ? formatCompactCurrency(
                      stats.totalRevenue / stats.totalOrders
                    )
                  : formatCompactCurrency(0)}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">Conversion Rate</span>
              <span className="font-semibold text-gray-900 text-sm sm:text-base">
                {stats.totalUsers > 0
                  ? ((stats.totalOrders / stats.totalUsers) * 100).toFixed(1)
                  : 0}
                %
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">Customer Growth</span>
              <span className="font-semibold text-green-600 text-sm sm:text-base">
                +{formatCompactNumber(stats.newCustomers)} ({getPeriodText()})
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-primarybg p-4 sm:p-6 rounded-xl shadow-sm border border-secondary/20">
        <h3 className="text-lg font-semibold text-info mb-3 sm:mb-4">
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3 ">
          <Btn size="sm" className="text-classic" variant="outline">
            <i className="fa-solid fa-plus mr-2"></i>
            <Link to="/admin/add-product">Add Product</Link>
          </Btn>
          <Btn variant="outline">
            <i className="fa-solid fa-users mr-2"></i>
            <Link to="/admin/users">Manage Users</Link>
          </Btn>
          <Btn variant="outline">
            <i className="fa-solid fa-box mr-2"></i>
            <Link to="/admin/orders">View Orders</Link>
          </Btn>
          <Btn variant="outline">
            <i className="fa-solid fa-chart-bar mr-2"></i>
            View Analytics
          </Btn>
        </div>
      </div>
    </div>
  );
}

export default MainDashboard;
