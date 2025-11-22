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
          <Route path="products" element={<Products/>}/>
        </Route>

        {/* Admin routes */}
        <Route element={<AdminRoute />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="add-product" element={<AddProduct />} />
          </Route>
        </Route>
      </Routes>
    </>
  );
}

export default App;
