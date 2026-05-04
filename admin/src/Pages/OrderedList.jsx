import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Eye,
  X,
  Download,
  Package,
  Users,
  Layers,
  Receipt,
  ImageIcon,
  CheckCircle2,
  Truck,
  AlertTriangle,
  BadgeCheck,
  Search,
  Pencil,
} from "lucide-react";
import { toast } from "react-toastify";
import html2canvas from "html2canvas";

import Pagination from "../CommonComponent/Pagination";
import PageHeader from "../CommonComponent/PageHeader";
import { getOrders, getOrderStatusStats, getSalesStats, updateOrder } from "../api/order";

// Updated status list - removed ABANDONED
const ORDER_STATUSES = [
  "PLACED",
  "ACCEPTED",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
];

const statusConfig = {
  PLACED: {
    label: "Placed",
    pill: "bg-orange-100 text-orange-700 border-orange-100",
    cardColor: "text-blue-600",
    cardBg: "bg-blue-50",
  },
  ACCEPTED: {
    label: "Accepted",
    pill: "bg-slate-100 text-slate-700 border-slate-100",
    cardColor: "text-indigo-600",
    cardBg: "bg-indigo-50",
  },
  SHIPPED: {
    label: "Shipped",
    pill: "bg-amber-50 text-amber-700 border-amber-100",
    cardColor: "text-amber-600",
    cardBg: "bg-amber-50",
  },
  DELIVERED: {
    label: "Delivered",
    pill: "bg-emerald-50 text-emerald-700 border-emerald-100",
    cardColor: "text-emerald-600",
    cardBg: "bg-emerald-50",
  },
  CANCELLED: {
    label: "Cancelled",
    pill: "bg-rose-50 text-rose-700 border-rose-100",
    cardColor: "text-rose-600",
    cardBg: "bg-rose-50",
  },
};

const statusIconMap = {
  PLACED: Package,
  ACCEPTED: BadgeCheck,
  SHIPPED: Truck,
  DELIVERED: CheckCircle2,
  CANCELLED: AlertTriangle,
};

const getStatusConfig = (status) => {
  return statusConfig[status || "PLACED"] || statusConfig.PLACED;
};

const formatCurrency = (value) =>
  `₹${Number(value || 0).toLocaleString("en-IN")}`;

const formatDateTime = (date) => {
  if (!date) return "-";
  return new Date(date).toLocaleString("en-IN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const isSameOrAfterDate = (orderDate, filterDate) => {
  return (
    new Date(orderDate).setHours(0, 0, 0, 0) >=
    new Date(filterDate).setHours(0, 0, 0, 0)
  );
};

const isSameOrBeforeDate = (orderDate, filterDate) => {
  return (
    new Date(orderDate).setHours(23, 59, 59, 999) <=
    new Date(filterDate).setHours(23, 59, 59, 999)
  );
};

const OrderList = () => {
  const [orders, setOrders] = useState([]);
  const [apiStatusStats, setApiStatusStats] = useState({});
  const [loading, setLoading] = useState(false);

  const [activeStatus, setActiveStatus] = useState("ALL");
  const [statusUpdatingId, setStatusUpdatingId] = useState(null);

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const limit = 8;

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [viewData, setViewData] = useState(null);

  const [editStatusOpen, setEditStatusOpen] = useState(false);
  const [editStatusOrder, setEditStatusOrder] = useState(null);
  const [selectedNewStatus, setSelectedNewStatus] = useState("");
  const [stats, setStats] = useState({
  totalSales: 0,
  uniqueCustomers: 0,
  totalQuantity: 0,
  totalValue: 0,
});
 

  const modalRef = useRef(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);

        const [ordersData, statsData] = await Promise.all([
          getOrders(),
          getOrderStatusStats(),
        ]);

        const list = ordersData?.data ?? ordersData ?? [];
        setOrders(list);

        const formattedStats = {};
        (statsData?.data || []).forEach((item) => {
          formattedStats[item.status] = item.count;
        });
        setApiStatusStats(formattedStats);
      } catch (err) {
        console.error(err);
        toast.error(err?.message || "Failed to load orders");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

useEffect(() => {
  const fetchStats = async () => {
    try {
      const res = await getSalesStats();

      const data = res?.data || res;

      setStats({
        totalSales: data.totalSales || 0,
        uniqueCustomers: data.uniqueCustomers || 0,
        totalQuantity: data.totalQuantity || 0,
        totalValue: data.totalValue || 0,
      });

    } catch (err) {
      console.error(err);
    }
  };

  fetchStats();
}, []);

  useEffect(() => {
    setPage(1);
  }, [search, fromDate, toDate, activeStatus]);

  

  const searchDateFiltered = useMemo(() => {
    let list = [...orders];

    if (search.trim()) {
      const q = search.toLowerCase();

      list = list.filter((o) => {
        const itemsText = (o.orderItem || [])
          .map((it) => `${it.productName || ""} ${it.product?.name || ""}`)
          .join(" ")
          .toLowerCase();

        return (
          o.fullName?.toLowerCase().includes(q) ||
          o.email?.toLowerCase().includes(q) ||
          o.phone?.includes(q) ||
          String(o.id).includes(q) ||
          o.status?.toLowerCase().includes(q) ||
          o.paymentMethod?.toLowerCase().includes(q) ||
          itemsText.includes(q)
        );
      });
    }

    if (fromDate) {
      list = list.filter((o) => isSameOrAfterDate(o.createdAt, fromDate));
    }

    if (toDate) {
      list = list.filter((o) => isSameOrBeforeDate(o.createdAt, toDate));
    }

    list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return list;
  }, [orders, search, fromDate, toDate]);

const currentStatusCounts = useMemo(() => {
  const counts = {
    PLACED: 0,
    ACCEPTED: 0,
    SHIPPED: 0,
    DELIVERED: 0,
    CANCELLED: 0,
  };

  searchDateFiltered.forEach((o) => {
    const status = (o.status || "PLACED").toUpperCase().trim();

    if (counts[status] !== undefined) {
      counts[status] += 1;
    }
  });

  return counts;
}, [searchDateFiltered]);
  const filtered = useMemo(() => {
    if (activeStatus === "ALL") return searchDateFiltered;
    return searchDateFiltered.filter(
      (o) => (o.status || "PLACED") === activeStatus
    );
  }, [searchDateFiltered, activeStatus]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / limit));
  const safePage = Math.min(page, totalPages);
  const startIndex = (safePage - 1) * limit;
  const paginated = filtered.slice(startIndex, startIndex + limit);

  const resetFilters = () => {
    setSearch("");
    setFromDate("");
    setToDate("");
    setActiveStatus("ALL");
    setPage(1);
  };

  const handleDownload = () => {
    if (filtered.length === 0) {
      toast.error("No data to download");
      return;
    }

    const headers = [
      "Order ID",
      "Customer",
      "Email",
      "Phone",
      "Status",
      "Payment",
      "Date",
      "Items",
      "Quantity",
      "Total Amount",
    ];

    const rows = filtered.map((o) => {
      const itemCount = o.orderItem?.length || 0;
      const qty = (o.orderItem || []).reduce(
        (sum, it) => sum + (Number(it.quantity) || 0),
        0
      );

      return [
        `#ORD-${o.id}`,
        o.fullName || "",
        o.email || "",
        o.phone || "",
        o.status || "PLACED",
        o.paymentMethod || "",
        formatDateTime(o.createdAt),
        itemCount,
        qty,
        o.totalAmount || 0,
      ];
    });

    const csvContent = [headers, ...rows]
      .map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
      )
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "orders-report.csv";
    a.click();

    window.URL.revokeObjectURL(url);
  };

  const handleScreenshot = async () => {
    if (!modalRef.current || !viewData) return;

    try {
      const canvas = await html2canvas(modalRef.current, {
        backgroundColor: "#ffffff",
        scale: 2,
      });

      const link = document.createElement("a");
      link.download = `order-${viewData.id}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (err) {
      console.error(err);
      toast.error("Failed to download screenshot");
    }
  };

  const refreshStatusStats = async () => {
    try {
      const statsData = await getOrderStatusStats();
      const formattedStats = {};
      (statsData?.data || []).forEach((item) => {
        formattedStats[item.status] = item.count;
      });
      setApiStatusStats(formattedStats);
    } catch (err) {
      console.error(err);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      setStatusUpdatingId(orderId);

      await updateOrder(orderId, { status: newStatus });

      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );

      setViewData((prev) =>
        prev?.id === orderId ? { ...prev, status: newStatus } : prev
      );

      setEditStatusOrder((prev) =>
        prev?.id === orderId ? { ...prev, status: newStatus } : prev
      );

      await refreshStatusStats();

      toast.success(
        `Order status updated to ${getStatusConfig(newStatus).label}`
      );
      setEditStatusOpen(false);
      setEditStatusOrder(null);
      setSelectedNewStatus("");
    } catch (err) {
      console.error(err);
      toast.error(err?.message || "Failed to update order status");
    } finally {
      setStatusUpdatingId(null);
    }
  };

  const openViewModal = (order) => {
    setViewData(order);
    setViewModalOpen(true);
  };

  const openEditStatus = (order) => {
    // Prevent editing if status is CANCELLED or DELIVERED
    if (order.status === "CANCELLED" || order.status === "DELIVERED") {
      toast.warning("Cannot edit cancelled or delivered orders");
      return;
    }
    setEditStatusOrder(order);
    setSelectedNewStatus(order.status || "PLACED");
    setEditStatusOpen(true);
  };

  const tableRows = paginated;

  return (
    <div className="min-h-screen bg-slate-50 flex justify-center px-4 py-6">
      <div className="w-full max-w-7xl space-y-4">
        <PageHeader title="Orders" subtitle="Manage your customer orders" />

        {/* Status Summary */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 md:p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-slate-900">
                Order Status Summary
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Count updates with search and date filters
              </p>
            </div>

            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-emerald-700 transition"
            >
              <Download className="w-3.5 h-3.5" />
              Download
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {ORDER_STATUSES.map((status) => {
              const cfg = getStatusConfig(status);
              const Icon = statusIconMap[status] || Package;

              return (
                <button
                  type="button"
                  key={status}
                  onClick={() => setActiveStatus(status)}
                  className={`flex items-center gap-3 border rounded-xl p-3 text-left transition ${
                    activeStatus === status
                      ? "border-[var(--primary,#00897B)] bg-[var(--primary-lighthead,#E0F2F1)]/40"
                      : "border-slate-100 bg-slate-50/50 hover:bg-slate-100/70"
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-xl ${cfg.cardBg} flex items-center justify-center`}
                  >
                    <Icon className={`w-5 h-5 ${cfg.cardColor}`} />
                  </div>

                  <div>
                    <p className="text-xs text-slate-500">{cfg.label}</p>
                    <p className="text-lg font-bold text-slate-900">
                      {currentStatusCounts?.[status] || 0}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Sales Summary */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 md:p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-900">Sales Summary</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                label: "Total Orders",
                val: stats.totalSales,
                icon: Package,
                color: "text-blue-600",
                bg: "bg-blue-50",
              },
              {
                label: "Total Customers",
                val: stats.uniqueCustomers,
                icon: Users,
                color: "text-emerald-600",
                bg: "bg-emerald-50",
              },
              {
                label: "Total Quantity",
                val: stats.totalQuantity,
                icon: Layers,
                color: "text-amber-600",
                bg: "bg-amber-50",
              },
              {
                label: "Total Value",
                val: formatCurrency(stats.totalValue),
                icon: Receipt,
                color: "text-indigo-600",
                bg: "bg-indigo-50",
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 border border-slate-100 bg-slate-50/50 rounded-xl p-3"
              >
                <div
                  className={`w-10 h-10 rounded-xl ${item.bg} flex items-center justify-center`}
                >
                  <item.icon className={`w-5 h-5 ${item.color}`} />
                </div>
                <div>
                  <p className="text-xs text-slate-500">{item.label}</p>
                  <p className="text-lg font-bold text-slate-900">
                    {item.val}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Status Tabs + Filters */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Tabs */}
          <div className="px-4 pt-4 overflow-x-auto">
            <div className="flex items-center gap-8 min-w-max border-b border-slate-200">
              {[
                {
                  key: "ALL",
                  label: "All",
                  count: searchDateFiltered.length,
                },
                ...ORDER_STATUSES.map((status) => ({
                  key: status,
                  label: getStatusConfig(status).label,
                  count: currentStatusCounts?.[status] || 0,
                })),
              ].map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveStatus(tab.key)}
                  className={`relative pb-3 text-sm transition ${
                    activeStatus === tab.key
                      ? "text-blue-600 font-semibold"
                      : "text-slate-700 hover:text-slate-950"
                  }`}
                >
                  {tab.label}
                  {tab.key !== "ALL" && (
                    <span className="ml-1 text-xs text-slate-500">
                      ({tab.count})
                    </span>
                  )}

                  {activeStatus === tab.key && (
                    <span className="absolute left-0 right-0 -bottom-px h-[2px] bg-blue-600 rounded-full" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Filter Area */}
          <div className="p-4 space-y-3">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
              <div className="relative w-full lg:max-w-[320px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search orders..."
                  className="w-full pl-9 pr-3 py-2.5 text-sm border border-slate-200 rounded-lg bg-white outline-none focus:border-[var(--primary,#00897B)]"
                />
              </div>
            </div>

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-2 border border-slate-200 rounded-lg px-3 py-2 bg-white">
                  <span className="text-sm text-slate-600">From:</span>
                  <input
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    className="text-sm outline-none"
                  />
                </div>

                <div className="flex items-center gap-2 border border-slate-200 rounded-lg px-3 py-2 bg-white">
                  <span className="text-sm text-slate-600">To:</span>
                  <input
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    className="text-sm outline-none"
                  />
                </div>

                <button
                  type="button"
                  onClick={resetFilters}
                  className="w-10 h-10 rounded-lg bg-blue-100 text-slate-700 hover:bg-blue-200 flex items-center justify-center"
                  title="Reset filters"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <button
                onClick={handleDownload}
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700"
              >
                <Download className="w-4 h-4" />
                Download Report
              </button>
            </div>
          </div>

          {/* Custom Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-y border-slate-200">
                <tr className="text-left text-slate-700">
                  <th className="px-4 py-3 font-semibold">Order ID</th>
                  <th className="px-4 py-3 font-semibold">Customer</th>
                  <th className="px-4 py-3 font-semibold">Products</th>
                  <th className="px-4 py-3 font-semibold">Quantity</th>
                  <th className="px-4 py-3 font-semibold">Final Total</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Payment</th>
                  <th className="px-4 py-3 font-semibold">Date</th>
                  <th className="px-4 py-3 font-semibold text-right">
                    Actions
                  </th>
                 </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-10 text-center text-slate-500">
                      Loading orders...
                    </td>
                  </tr>
                ) : tableRows.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-10 text-center text-slate-500">
                      No orders found
                    </td>
                  </tr>
                ) : (
                  tableRows.map((o) => {
                    const cfg = getStatusConfig(o.status || "PLACED");

                    const productCount = o.orderItem?.length || 0;
                    const quantity = (o.orderItem || []).reduce(
                      (sum, it) => sum + (Number(it.quantity) || 0),
                      0
                    );

                    return (
                      <tr
                        key={o.id}
                        className="border-b border-slate-200 hover:bg-slate-50/70 transition"
                      >
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className="font-medium text-slate-900">
                            #ORD-{o.id}
                          </span>
                        </td>

                        <td className="px-4 py-4">
                          <div className="font-semibold text-slate-900 leading-tight">
                            {o.fullName || "Unknown"}
                          </div>
                          <div className="text-xs text-slate-500 leading-tight">
                            {o.place || o.city || "-"}
                          </div>
                          <div className="text-xs text-slate-900 leading-tight">
                            {o.phone || "-"}
                          </div>
                        </td>

                        <td className="px-4 py-4 whitespace-nowrap">
                          {productCount} {productCount === 1 ? "item" : "items"}
                        </td>

                        <td className="px-4 py-4 whitespace-nowrap">
                          {quantity}
                        </td>

                        <td className="px-4 py-4 whitespace-nowrap font-semibold text-slate-900">
                          {formatCurrency(o.totalAmount)}
                        </td>

                        <td className="px-4 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${cfg.pill}`}
                          >
                            {cfg.label}
                          </span>
                        </td>

                        <td className="px-4 py-4 whitespace-nowrap">
                          {o.paymentMethod || "-"}
                        </td>

                        <td className="px-4 py-4 min-w-[130px]">
                          {formatDateTime(o.createdAt)}
                        </td>

                        <td className="px-4 py-4">
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => openViewModal(o)}
                              className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 hover:bg-blue-600 hover:text-white flex items-center justify-center transition"
                              title="View"
                            >
                              <Eye className="w-4 h-4" />
                            </button>

                            {/* Edit button - disabled for CANCELLED or DELIVERED */}
                            {(o.status !== "CANCELLED" && o.status !== "DELIVERED") ? (
                              <button
                                type="button"
                                onClick={() => openEditStatus(o)}
                                className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 hover:bg-amber-500 hover:text-white flex items-center justify-center transition"
                                title="Edit Status"
                              >
                                <Pencil className="w-4 h-4" />
                              </button>
                            ) : (
                              <button
                                type="button"
                                disabled
                                className="w-8 h-8 rounded-lg bg-gray-100 text-gray-400 cursor-not-allowed flex items-center justify-center"
                                title="Cannot edit cancelled or delivered orders"
                              >
                                <Pencil className="w-4 h-4" />
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => {
                                setViewData(o);
                                setTimeout(handleScreenshot, 200);
                              }}
                              className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 hover:bg-emerald-600 hover:text-white flex items-center justify-center transition"
                              title="Download"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="p-4 border-t border-slate-200">
            <Pagination
              page={safePage}
              totalPages={totalPages}
              onChange={setPage}
            />
          </div>
        </div>

        {/* View Modal */}
        {viewModalOpen && viewData && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div
              ref={modalRef}
              className="bg-white w-full max-w-5xl rounded-xl shadow-xl max-h-[90vh] overflow-hidden flex flex-col relative"
            >
              <div className="flex justify-between items-center p-4 border-b bg-white">
                <div>
                  <h2 className="font-bold text-lg text-slate-800">
                    Order Details - #ORD-{viewData.id}
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Customer, shipping and item details
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={handleScreenshot}
                    className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white flex items-center justify-center transition"
                    title="Download Screenshot"
                  >
                    <ImageIcon className="w-5 h-5" />
                  </button>

                  <button
                    className="w-9 h-9 rounded-xl bg-slate-50 text-slate-500 hover:bg-slate-200 hover:text-slate-900 flex items-center justify-center transition"
                    onClick={() => {
                      setViewModalOpen(false);
                      setViewData(null);
                    }}
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-[350px_1fr] gap-6 bg-slate-50">
                <div className="space-y-6">
                  <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                    <h3 className="font-bold text-slate-800 mb-4 border-b pb-2">
                      Order Information
                    </h3>

                    <div className="space-y-3 text-sm">
                      <p>
                        <span className="font-semibold text-slate-600">
                          Customer:
                        </span>{" "}
                        {viewData.fullName || "-"}
                      </p>

                      <p>
                        <span className="font-semibold text-slate-600">
                          Email:
                        </span>{" "}
                        {viewData.email || "-"}
                      </p>

                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-600">
                          Status:
                        </span>
                        {(() => {
                          const cfg = getStatusConfig(
                            viewData.status || "PLACED"
                          );
                          return (
                            <span
                              className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-bold ${cfg.pill}`}
                            >
                              {cfg.label}
                            </span>
                          );
                        })()}
                      </div>

                      <p>
                        <span className="font-semibold text-slate-600">
                          Payment:
                        </span>{" "}
                        {viewData.paymentMethod?.toLowerCase() || "online"}
                      </p>

                      <div className="border-t pt-3 mt-2 space-y-1">
                        <p className="font-bold text-base pt-1">
                          <span className="text-slate-700">Total:</span>{" "}
                          {formatCurrency(viewData.totalAmount)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                    <h3 className="font-bold text-slate-800 mb-4 border-b pb-2">
                      Shipping Address
                    </h3>

                    <div className="space-y-3 text-sm">
                      <p>
                        <span className="font-semibold text-slate-600">
                          Address:
                        </span>{" "}
                        {viewData.address || "N/A"}
                      </p>

                      <p>
                        <span className="font-semibold text-slate-600">
                          City:
                        </span>{" "}
                        {viewData.city || viewData.place || "N/A"}
                      </p>

                      <p>
                        <span className="font-semibold text-slate-600">
                          Pincode:
                        </span>{" "}
                        {viewData.pincode || "N/A"}
                      </p>

                      <p>
                        <span className="font-semibold text-slate-600">
                          Phone:
                        </span>{" "}
                        {viewData.phone || "N/A"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                  <h3 className="font-bold text-slate-800 mb-4 border-b pb-2">
                    Order Items
                  </h3>

                  <div className="space-y-4">
                    {viewData.orderItem?.map((it, idx) => {
                      const p = it.product || {};
                      const img =
                        (Array.isArray(p.imageUrl)
                          ? p.imageUrl[0]
                          : p.imageUrl) ||
                        p.image ||
                        "";

                      return (
                        <div
                          key={idx}
                          className="flex gap-4 p-3 border border-slate-100 rounded-xl bg-slate-50/50"
                        >
                          <img
                            src={img || "https://via.placeholder.com/80"}
                            alt={it.productName || p.name || "Product"}
                            className="w-16 h-16 object-cover rounded-lg border border-slate-200 bg-white"
                          />

                          <div className="flex-1">
                            <p className="font-bold text-sm text-slate-900 leading-snug mb-2">
                              {it.productName || p.name || "Product"}
                            </p>

                            <p className="text-xs text-slate-500">
                              Product ID:{" "}
                              <span className="font-semibold text-slate-700">
                                {it.productId}
                              </span>
                            </p>

                            <p className="text-sm font-semibold text-slate-700 mt-1">
                              Qty: {it.quantity} ×{" "}
                              {formatCurrency(it.unitPrice)}
                            </p>

                            <p className="text-sm font-bold text-slate-900 mt-1">
                              Total:{" "}
                              {formatCurrency(
                                Number(it.quantity || 0) *
                                  Number(it.unitPrice || 0)
                              )}
                            </p>
                          </div>
                        </div>
                      );
                    })}

                    {!viewData.orderItem?.length && (
                      <div className="text-sm text-slate-500 text-center py-8">
                        No items found for this order.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Status Modal - White background with dropdown */}
        {editStatusOpen && editStatusOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden">
              <div className="flex items-center justify-between p-5 border-b">
                <div>
                  <h3 className="font-bold text-lg text-slate-900">
                    Update Order Status
                  </h3>
                  <p className="text-sm text-slate-500 mt-0.5">
                    Order #{editStatusOrder.id}
                  </p>
                </div>

                <button
                  onClick={() => {
                    setEditStatusOpen(false);
                    setEditStatusOrder(null);
                    setSelectedNewStatus("");
                  }}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-5">
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Select Status
                </label>
                <select
                  value={selectedNewStatus}
                  onChange={(e) => setSelectedNewStatus(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:border-[var(--primary,#00897B)] focus:ring-1 focus:ring-[var(--primary,#00897B)] text-sm"
                >
                  {ORDER_STATUSES.filter(status => {
                    // Once cancelled or delivered, can't change
                    if (editStatusOrder.status === "CANCELLED" || editStatusOrder.status === "DELIVERED") {
                      return false;
                    }
                    return true;
                  }).map((status) => {
                    const cfg = getStatusConfig(status);
                    return (
                      <option key={status} value={status}>
                        {cfg.label}
                      </option>
                    );
                  })}
                </select>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => {
                      setEditStatusOpen(false);
                      setEditStatusOrder(null);
                      setSelectedNewStatus("");
                    }}
                    className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() =>
                      handleStatusChange(editStatusOrder.id, selectedNewStatus)
                    }
                    disabled={statusUpdatingId === editStatusOrder.id}
                    className="flex-1 px-4 py-2.5 bg-[var(--primary,#00897B)] text-white rounded-lg text-sm font-semibold hover:bg-[var(--primary-dark,#00695C)] transition disabled:opacity-50"
                  >
                    {statusUpdatingId === editStatusOrder.id ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Updating...
                      </div>
                    ) : (
                      "Update Status"
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderList;