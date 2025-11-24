import React, { useEffect, useState } from "react";
import { useAuth } from "../auth/useAuth";
import { useCart } from "../context/useCart";
import { useNavigate } from "react-router";
import axios from "axios";
import Btn from "../components/Common/Btn";

function DashBoard() {
  const { user, token } = useAuth();
  const { cart } = useCart();
  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_API_URL;

  const [orders, setOrders] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    if (!user?.id || !token) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        // Fetch user profile for name and wishlist(wish list for the future)
        const profileRes = await axios.get(`${apiUrl}/api/user/${user.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const profile = profileRes.data.data || profileRes.data;
        setUserProfile(profile);
        setWishlist(profile.wishlist || []);

        // 2️⃣ Fetch orders separately
        const ordersRes = await axios.get(`${apiUrl}/api/order/my`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setOrders(ordersRes.data.data || []);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
        setWishlist([]);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user?.id, token, apiUrl]);

  // Function to navigate to specific profile tabs
  const navigateToProfileTab = (tab) => {
    navigate(`/profile/${tab}`);
  };

  if (loading) return <p className="p-5 text-center">Loading...</p>;

  return (
    <div className="space-y-6 p-6 font-urbanist">
      {/* Welcome / User Info */}
      <div className="bg-[#0A0A0A]/10 p-5 rounded-lg shadow flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold">
            Welcome,{" "}
            {userProfile?.name || user?.name || user?.fullName || "User"}!
          </h2>
          <p className="text-gray-600">
            Here's a quick overview of your account.
          </p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow text-center">
          <h3 className="text-gray-500">Orders</h3>
          <p className="text-xl font-bold">{orders.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow text-center">
          <h3 className="text-gray-500">Cart Items</h3>
          <p className="text-xl font-bold">{cart.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow text-center">
          <h3 className="text-gray-500">Wishlist</h3>
          <p className="text-xl font-bold">{wishlist.length}</p>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white p-5 rounded-lg shadow space-y-3">
        <h3 className="text-lg font-semibold">Recent Orders</h3>
        {orders.length > 0 ? (
          orders.slice(0, 5).map((order) => (
            <div key={order._id} className="flex justify-between border-b py-2">
              <span>Order #{order._id.slice(-6)}</span>
              <span>{order.status || "Pending"}</span>
              <span>৳ {order.total || 0}</span>
            </div>
          ))
        ) : (
          <p className="text-gray-500">No recent orders.</p>
        )}
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3">
        <Btn onClick={() => navigateToProfileTab("profile")}>Go to Profile</Btn>
        <Btn onClick={() => navigateToProfileTab("orders")}>View Orders</Btn>
        <Btn onClick={() => navigateToProfileTab("cart")}>Go to Cart</Btn>
        <Btn onClick={() => navigateToProfileTab("dashboard")}>Dashboard</Btn>
      </div>
    </div>
  );
}

export default DashBoard;
