import React, { useContext } from "react";
import { Navigate, Outlet } from "react-router";
import { AuthContext } from "../auth/AuthContext";

const AdminRoute = () => {
  const { user, token } = useContext(AuthContext);

  // If token is still loading (user null but token exists), show nothing or loading
  if (!user && token) return <div>Loading admin...</div>;
  if (!user) return <Navigate to="/login" />;
  if (user.role !== "admin") return <Navigate to="/" />;

  return <Outlet />;
};

export default AdminRoute;
