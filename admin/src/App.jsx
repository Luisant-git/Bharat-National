import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AdminLayout from "./Pages/AdminLayout";
import AdminOverview from "./components/AdminOverview";
import AdminDashboard from "./components/AdminDashboard";
import LoginPage from "./Pages/LoginPage";
import { ToastContainer } from "react-toastify";
import CategoryList from "./Pages/CategoryList";
import ProductList from "./Pages/ProductList";
import ProductModal from "./Pages/ProductModel";
import CustomerList from "./Pages/CustomerList";
import OrderList from "./Pages/OrderedList";
import BrandList from "./Pages/BrandList";

export default function App() {
  return (
    <BrowserRouter>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
      <Routes>
        {/* Public */}
        <Route path="/" element={<Navigate to="/admin/login" />} />
        <Route path="/admin/login" element={<LoginPage />} />

        {/* Admin */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="overview" element={<AdminOverview />} />
          <Route path="category" element={<CategoryList />} />
          <Route path="addproduct" element={<ProductModal />} />
          <Route path="brand" element={<BrandList />} />
          <Route path="product" element={<ProductList />} />
          <Route path="customers" element={<CustomerList />} />
          <Route path="orders" element={<OrderList />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
