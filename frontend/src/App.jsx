import "./App.css";
import { Route, Routes } from "react-router";
import Layout from "./utils/layout";
import Home from "./pages/Home";
import SignUp from "./pages/SignUp";
import Login from "./pages/Login";
import GoogleCallback from "./pages/GoogleCallback";
import AdminRoute from "./routes/AdminRoute";
import AdminLayout from "./admin/AdminLayout";
import Dashboard from "./pages/admin/Dashboard";
import AddProduct from "./pages/admin/AddProduct";
import ProductDetails from "./pages/ProductDetails";
import Products from "./pages/Products";
import CheckOut from "./pages/CheckOut";
import Profile from "./pages/Profile";
import AboutUs from "./pages/AboutUs";
import Contact from "./pages/Contact";
import ProductsAdmin from "./pages/admin/ProductsAdmin";
import OrdersAdmin from "./pages/admin/OrdersAdmin";
import { PaymentSuccess } from "./payments/PaymentSuccess";
import { PaymentCancelled } from "./payments/PaymentCancelled";
import { PaymentFailed } from "./payments/PaymentFailed";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminHome from "./pages/admin/AdminHome";
import TermsandConditions from "./pages/TermsandConditions";
import CategoryPage from "./pages/CategoryPage";
import BannerManager from "./pages/admin/BannerManager";
import ErrorPage from "./pages/ErrorPage";

function App() {
  return (
    <>
      <Routes>
        {/* User routes */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="sign-up" element={<SignUp />} />
          <Route path="login" element={<Login />} />
          <Route path="google-callback" element={<GoogleCallback />} />
          <Route path="/products/:id/:slug" element={<ProductDetails />} />
          <Route path="products" element={<Products />} />
          <Route path="checkout" element={<CheckOut />} />
          {/* Profile routes */}
          <Route path="profile/:tab?" element={<Profile />} />
          <Route path="about" element={<AboutUs />} />
          <Route path="contact" element={<Contact />} />
          <Route path="payment-success" element={<PaymentSuccess />} />
          <Route path="payment-cancelled" element={<PaymentCancelled />} />
          <Route path="payment-failed" element={<PaymentFailed />} />
          <Route path="terms-and-conditions" element={<TermsandConditions />} />
          <Route path="/category/:categoryName" element={<CategoryPage />} />
          <Route path="*" element={<ErrorPage />} />
        </Route>

        {/* Admin routes */}
        <Route element={<AdminRoute />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route path="/admin" index element={<AdminHome />} />
            <Route path="dashboard/:tab?" element={<Dashboard />} />
            <Route path="add-product" element={<AddProduct />} />
            <Route path="products" element={<ProductsAdmin />} />
            <Route path="orders" element={<OrdersAdmin />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="banners" element={<BannerManager />} />
          </Route>
        </Route>
      </Routes>
    </>
  );
}

export default App;
