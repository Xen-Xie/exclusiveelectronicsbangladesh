import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../auth/AuthContext";
import axios from "axios";

export default function ProfileDetails() {
  const { user, token } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const apiUrl = import.meta.env.VITE_API_URL;

  const [stats, setStats] = useState({ totalOrders: 0, totalSpend: 0 });

  useEffect(() => {
    if (!user?.id || !token) return;

    const fetchProfileAndOrders = async () => {
      try {
        // Fetch profile
        const profileRes = await axios.get(`${apiUrl}/api/user/${user.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProfile(profileRes.data.data);

        // Fetch user orders
        const ordersRes = await axios.get(`${apiUrl}/api/order/my`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const orders = ordersRes.data.data || [];
        const totalOrders = orders.length;
        const totalSpend = orders.reduce((sum, o) => sum + (o.total || 0), 0);

        setStats({ totalOrders, totalSpend });
      } catch (error) {
        console.error(
          "Error fetching profile or orders:",
          error.response?.data || error.message
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProfileAndOrders();
  }, [user?.id, token, apiUrl]);

  if (loading) return <div>Loading profile...</div>;
  if (!profile) return <div>No profile data found</div>;

  return (
    <div className="bg-white rounded-lg shadow p-6 flex flex-col gap-4 max-w-xl mx-auto">
      <h2 className="text-2xl font-semibold">{profile.name}</h2>
      <p className="text-secondary">
        <i class="fa-regular fa-envelope"></i> {profile.email}
      </p>
      {profile.phoneNumber && (
        <p className="text-secondary">
          <i class="fa-solid fa-phone"></i> {profile.phoneNumber}
        </p>
      )}
      {profile.address && (
        <p className="text-secondary">
          <i class="fa-regular fa-house"></i> {profile.address}
        </p>
      )}
      {profile.city && <p className="text-secondary">City: {profile.city}</p>}
      {profile.postalCode && (
        <p className="text-secondary">Postal Code: {profile.postalCode}</p>
      )}

      <div className="mt-4 flex gap-6">
        <div>
          <h3 className="text-lg font-medium">Total Orders</h3>
          <p className="text-secondary">{stats.totalOrders}</p>
        </div>
        <div>
          <h3 className="text-lg font-medium">Total Spend</h3>
          <p className="text-secondary">৳{stats.totalSpend}</p>
        </div>
      </div>
    </div>
  );
}
