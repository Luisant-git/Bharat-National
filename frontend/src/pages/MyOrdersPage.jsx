import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Package,
  ChevronRight,
  Loader2,
  ShoppingBag,
  Calendar,
  Truck,
  CheckCircle,
  Sparkles,
} from "lucide-react";
import { getOrdersByUser } from "../api/Order";
import { toast } from "react-toastify";
import PageHeroBreadcrumb from "../components/Breadcrumb";

const getStoredUser = () => {
  try {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const formatDate = (iso) => {
  if (!iso) return "-";
  const d = new Date(iso);
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatCurrency = (val) =>
  `₹${Number(val || 0).toLocaleString("en-IN")}`;

// Image helper
const getProductImage = (order) => {
  if (order.orderItem && order.orderItem.length > 0) {
    const firstItem = order.orderItem[0];
    const imageUrl = firstItem?.product?.imageUrl || firstItem?.imageUrl;
    
    if (Array.isArray(imageUrl)) {
      return imageUrl[0] || null;
    }
    if (typeof imageUrl === "string" && imageUrl) {
      return imageUrl;
    }
  }
  
  if (order.productImage) {
    return order.productImage;
  }
  
  return null;
};

const getProductName = (order) => {
  if (order.orderItem && order.orderItem.length > 0) {
    return order.orderItem[0]?.productName || "Order Items";
  }
  return "Order Items";
};

const getItemCount = (order) => {
  if (order.orderItem && order.orderItem.length > 0) {
    return order.orderItem.length;
  }
  return 1;
};

const getStatusDetails = (order) => {
  const createdAt = new Date(order.createdAt);
  const now = new Date();
  const daysDiff = Math.floor((now - createdAt) / (1000 * 60 * 60 * 24));
  
  if (daysDiff > 7) return { label: "Delivered", icon: CheckCircle, color: "emerald" };
  if (daysDiff > 3) return { label: "Shipped", icon: Truck, color: "blue" };
  if (daysDiff > 1) return { label: "Processing", icon: Loader2, color: "amber" };
  return { label: "Confirmed", icon: Sparkles, color: "purple" };
};

const statusConfig = {
  Delivered: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
  Shipped: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" },
  Processing: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" },
  Confirmed: { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200" },
  Cancelled: { bg: "bg-rose-50", text: "text-rose-700", border: "border-rose-200" },
};

export default function MyOrdersPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(() => getStoredUser());
  const [orders, setOrders] = useState([]);
  const [loadingList, setLoadingList] = useState(false);
  const [error, setError] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");

  useEffect(() => {
    const stored = getStoredUser();
    setUser(stored);
    if (!stored?.id) {
      toast.info("Please login to view your orders");
    }
  }, []);

  useEffect(() => {
    if (!user?.id) return;
    const fetchOrders = async () => {
      try {
        setLoadingList(true);
        setError("");
        const data = await getOrdersByUser(user.id);
        console.log("Orders data:", data);
        setOrders(data || []);
      } catch (err) {
        console.error(err);
        setError(err?.message || "Failed to load orders");
      } finally {
        setLoadingList(false);
      }
    };
    fetchOrders();
  }, [user?.id]);

  const filteredOrders = orders.filter(order => {
    if (activeFilter === "all") return true;
    const status = getStatusDetails(order).label.toLowerCase();
    return status === activeFilter.toLowerCase();
  });

  const isEmpty = !loadingList && filteredOrders.length === 0;
  const totalOrders = orders.length;

  const handleLoginRedirect = () => {
    navigate("/login", { state: { redirectTo: "/orders" } });
  };

  const handleOrderClick = (orderId) => {
    navigate(`/orders/${orderId}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Hero Section with Breadcrumb */}
      <PageHeroBreadcrumb
        title="My Orders"
        currentLabel="Orders"
        bgColor="#0f615dff"
      />

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 md:px-8 py-8 md:py-10">
        {/* Not Logged In */}
        {!user?.id && (
          <div className="bg-white rounded-xl border p-8 text-center shadow-sm">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: "rgba(var(--primary-rgb), 0.1)" }}>
              <ShoppingBag className="w-8 h-8" style={{ color: "var(--primary)" }} />
            </div>
            <h3 className="text-lg font-semibold mb-1" style={{ color: "#0f172a" }}>Sign in to view orders</h3>
            <p className="text-sm mb-6" style={{ color: "#64748b" }}>Track your purchases and manage returns</p>
            <button
              onClick={handleLoginRedirect}
              className="px-6 py-2.5 text-white rounded-lg text-sm font-medium transition-all shadow-sm hover:shadow-md"
              style={{ backgroundColor: "var(--primary)" }}
            >
              Sign In
            </button>
          </div>
        )}

        {/* Loading */}
        {loadingList && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin" style={{ color: "var(--primary)" }} />
          </div>
        )}

        {/* Error */}
        {error && !loadingList && (
          <div className="bg-red-50 border border-red-100 rounded-lg p-4 text-center">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* Empty State */}
        {isEmpty && user?.id && (
          <div className="bg-white rounded-xl border p-12 text-center shadow-sm">
            <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: "rgba(var(--primary-rgb), 0.1)" }}>
              <Package className="w-10 h-10" style={{ color: "var(--primary)" }} />
            </div>
            <h3 className="text-lg font-semibold mb-1" style={{ color: "#0f172a" }}>No orders yet</h3>
            <p className="text-sm mb-6" style={{ color: "#64748b" }}>Start shopping to see your orders here</p>
            <button
              onClick={() => navigate("/products")}
              className="px-5 py-2 text-white rounded-lg text-sm font-medium shadow-sm hover:shadow-md"
              style={{ backgroundColor: "var(--primary)" }}
            >
              Browse Products
            </button>
          </div>
        )}

        {/* Orders List */}
        {!loadingList && !error && filteredOrders.length > 0 && user?.id && (
          <div className="space-y-6">
            {/* Stats Bar */}
            <div className="bg-white rounded-lg border p-4 flex items-center justify-between flex-wrap gap-3 shadow-sm">
              <div>
                <p className="text-sm text-slate-600">Total Orders</p>
                <p className="text-2xl font-bold" style={{ color: "var(--primary)" }}>{totalOrders}</p>
              </div>
              <div className="h-8 w-px bg-slate-200 hidden sm:block" />
              <div>
                <p className="text-sm text-slate-600">Showing</p>
                <p className="text-lg font-semibold text-slate-800">{filteredOrders.length} orders</p>
              </div>
            </div>

            {/* Filters */}
            <div className="flex gap-2 flex-wrap">
              {["all", "delivered", "shipped", "processing", "confirmed"].map((filter) => {
                const labels = { all: "All Orders", delivered: "Delivered", shipped: "Shipped", processing: "Processing", confirmed: "Confirmed" };
                const isActive = activeFilter === filter;
                return (
                  <button
                    key={filter}
                    onClick={() => setActiveFilter(filter)}
                    className={`px-4 py-2 rounded-full text-sm transition-all ${
                      isActive
                        ? "text-white shadow-sm"
                        : "bg-white text-slate-600 border hover:bg-slate-50"
                    }`}
                    style={{
                      backgroundColor: isActive ? "var(--primary)" : "white",
                      borderColor: isActive ? "var(--primary)" : "#e2e8f0"
                    }}
                  >
                    {labels[filter]}
                  </button>
                );
              })}
            </div>

            {/* Order Cards */}
            <div className="space-y-4">
              {filteredOrders.map((order) => {
                const { label: status, icon: StatusIcon } = getStatusDetails(order);
                const config = statusConfig[status] || statusConfig.Delivered;
                const imageUrl = getProductImage(order);
                const productName = getProductName(order);
                const itemCount = getItemCount(order);

                return (
                  <div
                    key={order.id}
                    onClick={() => handleOrderClick(order.id)}
                    className="bg-white rounded-xl border shadow-sm hover:shadow-md transition-all cursor-pointer overflow-hidden group"
                    style={{ borderColor: "#e2e8f0" }}
                  >
                    <div className="p-5">
                      {/* Header */}
                      <div className="flex items-center justify-between mb-3 pb-3 border-b" style={{ borderColor: "#f1f5f9" }}>
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-semibold" style={{ color: "#0f172a" }}>
                            Order #{order.id}
                          </span>
                          <span className="text-xs" style={{ color: "#94a3b8" }}>•</span>
                          <div className="flex items-center gap-1.5 text-xs" style={{ color: "#64748b" }}>
                            <Calendar className="w-3 h-3" />
                            {formatDate(order.createdAt)}
                          </div>
                        </div>
                        <div className={`${config.bg} ${config.text} px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 border ${config.border}`}>
                          <StatusIcon className="w-3 h-3" />
                          {status}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex gap-4">
                        {/* Image */}
                        <div className="w-20 h-20 rounded-lg bg-slate-50 border overflow-hidden flex-shrink-0" style={{ borderColor: "#e2e8f0" }}>
                          {imageUrl ? (
                            <img 
                              src={imageUrl} 
                              alt={productName}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.parentElement.innerHTML = '<div class="w-full h-full flex items-center justify-center"><svg class="w-7 h-7" style="color: #cbd5e1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg></div>';
                              }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="w-7 h-7" style={{ color: "#cbd5e1" }} />
                            </div>
                          )}
                        </div>

                        {/* Details */}
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-slate-900 mb-1">
                            {productName}
                            {itemCount > 1 && (
                              <span className="text-xs ml-1" style={{ color: "var(--primary)" }}>+{itemCount - 1} more</span>
                            )}
                          </p>
                          <p className="text-lg font-bold" style={{ color: "var(--primary)" }}>
                            {formatCurrency(order.totalAmount)}
                          </p>
                          <p className="text-xs mt-1" style={{ color: "#64748b" }}>
                            {itemCount} {itemCount === 1 ? "item" : "items"}
                          </p>
                        </div>

                        {/* Arrow */}
                        <div className="flex items-center">
                          <ChevronRight className="w-5 h-5 transition-transform group-hover:translate-x-1" style={{ color: "var(--primary)" }} />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}