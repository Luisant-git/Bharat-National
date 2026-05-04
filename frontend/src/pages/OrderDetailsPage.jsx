import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  X,
  Image as ImageIcon,
  Package,
  Loader2,
  MapPin,
  Phone,
  Mail,
  CreditCard,
  User,
  IndianRupee,
} from "lucide-react";
import { getOrderById } from "../api/Order";
import { toast } from "react-toastify";

const formatCurrency = (value) =>
  `₹${Number(value || 0).toLocaleString("en-IN")}`;

const getImageUrl = (item) => {
  const imageUrl = item?.product?.imageUrl;

  if (Array.isArray(imageUrl)) {
    return imageUrl[0] || null;
  }

  if (typeof imageUrl === "string") {
    return imageUrl;
  }

  return null;
};

// Dynamic Status Configuration (matching admin panel)
const statusConfig = {
  PLACED: {
    label: "Placed",
    className: "bg-orange-100 text-orange-700 border-orange-100",
    dot: "bg-orange-500",
  },
  ACCEPTED: {
    label: "Accepted",
    className: "bg-slate-100 text-slate-700 border-slate-100",
    dot: "bg-slate-500",
  },
  SHIPPED: {
    label: "Shipped",
    className: "bg-amber-100 text-amber-700 border-amber-100",
    dot: "bg-amber-500",
  },
  DELIVERED: {
    label: "Delivered",
    className: "bg-emerald-100 text-emerald-700 border-emerald-100",
    dot: "bg-emerald-500",
  },
  CANCELLED: {
    label: "Cancelled",
    className: "bg-rose-100 text-rose-700 border-rose-100",
    dot: "bg-rose-500",
  },
};

const getStatusConfig = (status) => {
  return statusConfig[status] || statusConfig.PLACED;
};

export default function OrderDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const data = await getOrderById(id);
        setOrder(data);
      } catch (err) {
        console.error(err);
        toast.error(err?.message || "Failed to load order details");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchOrder();
  }, [id]);

  const totalItems = useMemo(() => {
    if (!order?.orderItem) return 0;
    return order.orderItem.reduce((sum, item) => sum + item.quantity, 0);
  }, [order]);

  const status = getStatusConfig(order?.status || "PLACED");

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-slate-500">
          <Loader2 className="w-7 h-7 animate-spin text-[var(--primary,#00897B)]" />
          <p className="text-sm font-medium">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-6 text-center max-w-sm w-full">
          <Package className="w-10 h-10 mx-auto text-slate-300 mb-3" />
          <p className="text-sm font-semibold text-slate-900">
            Order not found
          </p>
          <button
            type="button"
            onClick={() => navigate("/orders")}
            className="mt-4 px-4 py-2 rounded-xl text-sm font-semibold text-white"
            style={{
              background:
                "linear-gradient(135deg, var(--primary,#00897B), #00695C)",
            }}
          >
            Back to Orders
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg md:text-xl font-bold text-slate-950">
              Order Details - #{order.id}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="w-9 h-9 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-900 flex items-center justify-center transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="grid lg:grid-cols-[0.9fr_1.35fr] gap-6">
          <div className="space-y-6">
            <section className="bg-white rounded-xl border border-slate-200 p-5 md:p-6 shadow-sm">
              <h2 className="text-base font-bold text-slate-950">
                Order Information
              </h2>
              <div className="h-px bg-slate-200 my-3" />

              <div className="space-y-4 text-sm">
                <div className="grid grid-cols-[90px_1fr] gap-2">
                  <p className="font-bold text-slate-950 flex items-center gap-1">
                    <User className="w-3.5 h-3.5" />
                    Customer:
                  </p>
                  <p className="text-slate-700">{order.fullName || "—"}</p>
                </div>

                <div className="grid grid-cols-[90px_1fr] gap-2">
                  <p className="font-bold text-slate-950 flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5" />
                    Email:
                  </p>
                  <p className="text-slate-700 break-all">
                    {order.email || "—"}
                  </p>
                </div>

                <div className="grid grid-cols-[90px_1fr] gap-2">
                  <p className="font-bold text-slate-950">Status:</p>
                  <span
                    className={`inline-flex w-fit items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-bold ${status.className}`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                    {status.label}
                  </span>
                </div>

                <div className="grid grid-cols-[90px_1fr] gap-2">
                  <p className="font-bold text-slate-950 flex items-center gap-1">
                    <CreditCard className="w-3.5 h-3.5" />
                    Payment:
                  </p>
                  <p className="text-slate-700 uppercase">
                    {order.paymentMethod || "—"}
                  </p>
                </div>

                <div className="grid grid-cols-[90px_1fr] gap-2">
                  <p className="font-bold text-slate-950 flex items-center gap-1">
                    <IndianRupee className="w-3.5 h-3.5" />
                    Total:
                  </p>
                  <p className="font-bold text-slate-900">
                    {formatCurrency(order.totalAmount)}
                  </p>
                </div>

                <div className="grid grid-cols-[90px_1fr] gap-2">
                  <p className="font-bold text-slate-950">Items:</p>
                  <p className="text-slate-700">
                    {totalItems} {totalItems === 1 ? "item" : "items"}
                  </p>
                </div>
              </div>
            </section>

            <section className="bg-white rounded-xl border border-slate-200 p-5 md:p-6 shadow-sm">
              <h2 className="text-base font-bold text-slate-950">
                Shipping Address
              </h2>
              <div className="h-px bg-slate-200 my-3" />

              <div className="space-y-4 text-sm">
                <div className="grid grid-cols-[110px_1fr] gap-2">
                  <p className="font-bold text-slate-950 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    Address:
                  </p>
                  <p className="text-slate-700">{order.address || "—"}</p>
                </div>

                <div className="grid grid-cols-[110px_1fr] gap-2">
                  <p className="font-bold text-slate-950">City:</p>
                  <p className="text-slate-700">{order.place || "—"}</p>
                </div>

                <div className="grid grid-cols-[110px_1fr] gap-2">
                  <p className="font-bold text-slate-950">Pincode:</p>
                  <p className="text-slate-700">{order.pincode || "—"}</p>
                </div>

                <div className="grid grid-cols-[110px_1fr] gap-2">
                  <p className="font-bold text-slate-950 flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5" />
                    Phone:
                  </p>
                  <p className="text-slate-700">
                    {order.phone ? `+91 ${order.phone}` : "—"}
                  </p>
                </div>
              </div>
            </section>
          </div>

          <section className="bg-white rounded-xl border border-slate-200 p-5 md:p-6 shadow-sm">
            <h2 className="text-base font-bold text-slate-950">
              Order Items
            </h2>
            <div className="h-px bg-slate-200 my-3" />

            <div className="space-y-3">
              {order.orderItem?.map((item) => {
                const imageUrl = getImageUrl(item);

                return (
                  <div
                    key={item.id}
                    className="rounded-xl border border-slate-200 bg-slate-50/60 p-3 md:p-4 flex gap-4"
                  >
                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-lg bg-white border border-slate-200 overflow-hidden flex items-center justify-center shrink-0">
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={item.productName}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "https://via.placeholder.com/80?text=No+Image";
                          }}
                        />
                      ) : (
                        <Package className="w-7 h-7 text-slate-300" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm md:text-base font-extrabold text-slate-950 leading-snug">
                        {item.productName}
                      </h3>

                      <p className="mt-2 text-sm text-slate-700">
                        Qty:{" "}
                        <span className="font-semibold">{item.quantity}</span>{" "}
                        × {formatCurrency(item.unitPrice)}
                      </p>

                      <p className="mt-1 text-sm font-bold text-slate-950">
                        Total:{" "}
                        {formatCurrency(item.unitPrice * item.quantity)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}