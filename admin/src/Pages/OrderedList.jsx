
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Eye, X, Mail, Phone, MapPin, Download, Package, Users, Layers, Receipt, ImageIcon } from "lucide-react";
import { toast } from "react-toastify";
import { getOrders } from "../api/customer";
import html2canvas from "html2canvas";


import SearchInput from "../CommonComponent/SearchBar";
import DataTable from "../CommonComponent/Table";
import Pagination from "../CommonComponent/Pagination";
import PageHeader from "../CommonComponent/PageHeader";

const OrderList = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  // search + pagination
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const limit = 8;

  // view modal
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [viewData, setViewData] = useState(null);

  // Add these states
const [fromDate, setFromDate] = useState("");
const [toDate, setToDate] = useState("");

// Add Reset helper
const resetFilters = () => {
  setSearch("");
  setFromDate("");
  setToDate("");
  setPage(1);
};

// Add Download helper
const handleDownload = () => {
  if (filtered.length === 0) return toast.error("No data to download");
  
  const headers = ["Order ID", "Customer", "Date", "Total Amount"];
  const rows = filtered.map(o => [
    `#ORD-${o.id}`,
    o.fullName,
    new Date(o.createdAt).toLocaleDateString(),
    o.totalAmount
  ]);

  const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
  const blob = new Blob([csvContent], { type: "text/csv" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `orders-report.csv`;
  a.click();
};


  const modalRef = useRef(null);

const handleScreenshot = async () => {
  if (modalRef.current) {
    const canvas = await html2canvas(modalRef.current);
    const link = document.createElement("a");
    link.download = `order-${viewData.id}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  }
};
  // Load orders
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const data = await getOrders();
        const list = data?.data ?? data ?? [];
        setOrders(list);
      } catch (err) {
        console.error(err);
        toast.error(err?.message || "Failed to load orders");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  // reset to page 1 when search changes
  useEffect(() => {
    setPage(1);
  }, [search]);


  const stats = useMemo(() => {
  const totalSales = orders.length;
  const totalValue = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const uniqueCustomers = new Set(orders.map((o) => o.email || o.phone)).size;
  const totalQuantity = orders.reduce((sum, o) => {
    const items = Array.isArray(o.orderItem) ? o.orderItem : [];
    return sum + items.reduce((qty, it) => qty + (Number(it.quantity) || 0), 0);
  }, 0);
  return { totalSales, totalValue, uniqueCustomers, totalQuantity };
}, [orders]);

  // Filter by search only (no status)
 const filtered = useMemo(() => {
  let list = [...orders];

  // 1. Search Filter
  if (search.trim()) {
    const q = search.toLowerCase();
    list = list.filter((o) => (o.fullName?.toLowerCase().includes(q)) || (o.email?.toLowerCase().includes(q)) || (o.phone?.includes(q)) || String(o.id).includes(q));
  }

  // 2. Date Filter
  if (fromDate) {
    list = list.filter(o => new Date(o.createdAt).setHours(0,0,0,0) >= new Date(fromDate).setHours(0,0,0,0));
  }
  if (toDate) {
    list = list.filter(o => new Date(o.createdAt).setHours(23,59,59,999) <= new Date(toDate).setHours(23,59,59,999));
  }

  list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  return list;
}, [orders, search, fromDate, toDate]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filtered.length / limit));
  const safePage = Math.min(page, totalPages);
  const startIndex = (safePage - 1) * limit;
  const paginated = filtered.slice(startIndex, startIndex + limit);

  // ✅ columns for reusable DataTable (removed Payment column)
  const columns = [
    {
      key: "orderId",
      label: "Order ID",
      render: (o) => (
        <span className="text-xs font-semibold text-indigo-600">
          #ORD-{o.id}
        </span>
      ),
    },
    {
      key: "customer",
      label: "Customer",
      render: (o) => (
        <div className="min-w-0">
          <div className="font-medium text-slate-900 truncate">
            {o.fullName || "Unknown"}
          </div>
          <div className="text-[11px] text-slate-500 truncate">
            {o.email || "-"}
          </div>
        </div>
      ),
    },
    {
      key: "date",
      label: "Date",
      render: (o) =>
        o.createdAt
          ? new Date(o.createdAt).toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })
          : "-",
    },
    {
      key: "total",
      label: "Total",
      render: (o) => (
        <span className="font-medium text-slate-900">
          ₹{(o.totalAmount || 0).toLocaleString("en-IN")}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      align: "right",
      render: (o) => (
        <div className="flex justify-end">
          <button
            type="button"
            className="text-blue-600 hover:text-blue-800"
            title="View"
            onClick={() => {
              setViewData(o);
              setViewModalOpen(true);
            }}
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex justify-center px-4 py-6">
      <div className="w-full max-w-6xl space-y-4">
        {/* ✅ reusable header */}
        <PageHeader title="Orders" subtitle="Manage your customer orders" />
        {/* ✅ Sales Summary Card */}
<div className="bg-white rounded-2xl border border-slate-200 p-4 md:p-5 shadow-sm">
  <div className="flex items-center justify-between mb-4">
    <h3 className="font-semibold text-slate-900">Sales Summary</h3>
    <button className="flex items-center gap-1.5 bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-emerald-700 transition">
      <Download className="w-3.5 h-3.5" /> Download
    </button>
  </div>
  
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
    {[
      { label: "Total Sales", val: stats.totalSales, icon: Package, color: "text-blue-600", bg: "bg-blue-50" },
      { label: "Total Customers", val: stats.uniqueCustomers, icon: Users, color: "text-emerald-600", bg: "bg-emerald-50" },
      { label: "Total Quantity", val: stats.totalQuantity, icon: Layers, color: "text-amber-600", bg: "bg-amber-50" },
      { label: "Total Value", val: `₹${stats.totalValue.toLocaleString("en-IN")}`, icon: Receipt, color: "text-indigo-600", bg: "bg-indigo-50" },
    ].map((item, idx) => (
      <div key={idx} className="flex items-center gap-3 border border-slate-100 bg-slate-50/50 rounded-xl p-3">
        <div className={`w-10 h-10 rounded-xl ${item.bg} flex items-center justify-center`}>
          <item.icon className={`w-5 h-5 ${item.color}`} />
        </div>
        <div>
          <p className="text-xs text-slate-500">{item.label}</p>
          <p className="text-lg font-bold text-slate-900">{item.val}</p>
        </div>
      </div>
    ))}
  </div>
</div>

       <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-[1fr_auto_auto_auto] gap-3 items-end">
  <div className="w-full">
    <label className="text-xs font-medium text-slate-500 mb-1 block">Search</label>
    <SearchInput value={search} onChange={setSearch} />
  </div>
  
  <div>
    <label className="text-xs font-medium text-slate-500 mb-1 block">From</label>
    <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="border border-slate-300 rounded-lg px-3 py-2 text-sm w-full" />
  </div>

  <div>
    <label className="text-xs font-medium text-slate-500 mb-1 block">To</label>
    <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="border border-slate-300 rounded-lg px-3 py-2 text-sm w-full" />
  </div>

  <div className="flex gap-2">
    <button onClick={resetFilters} className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50">
      Reset
    </button>
    <button onClick={handleDownload} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700">
      <Download className="w-4 h-4" /> Export
    </button>
  </div>
</div>
        {/* ✅ reusable table */}
        <DataTable
          columns={columns}
          data={paginated}
          loading={loading}
          emptyText="No orders found"
        />

        {/* ✅ reusable pagination */}
        <Pagination
          page={safePage}
          totalPages={totalPages}
          onChange={setPage}
        />

{viewModalOpen && viewData && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
    {/* The ref is attached here to capture the modal content */}
    <div ref={modalRef} className="bg-white w-full max-w-5xl rounded-lg shadow-xl max-h-[90vh] overflow-hidden flex flex-col relative">
      
      {/* Header */}
      <div className="flex justify-between items-center p-4 border-b bg-white">
        <h2 className="font-bold text-lg text-slate-800">Order Details - #ORD-{viewData.id}</h2>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleScreenshot}
            className="text-emerald-600 hover:text-emerald-800 p-2"
            title="Download Screenshot"
          >
            <ImageIcon className="w-6 h-6" />
          </button>
          <button 
            className="text-slate-500 hover:text-slate-800" 
            onClick={() => { setViewModalOpen(false); setViewData(null); }}
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-[350px_1fr] gap-6 bg-slate-50">
        
        {/* Left Column: Info */}
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
            <h3 className="font-bold text-slate-800 mb-4 border-b pb-2">Order Information</h3>
            <div className="space-y-3 text-sm">
              <p><span className="font-semibold text-slate-600">Customer:</span> {viewData.fullName}</p>
              <p><span className="font-semibold text-slate-600">Email:</span> {viewData.email}</p>
              <p><span className="font-semibold text-slate-600">Status:</span> Placed</p>
              <p><span className="font-semibold text-slate-600">Payment:</span> {viewData.paymentMethod?.toLowerCase() || "online"}</p>
              <div className="border-t pt-3 mt-2 space-y-1">
                <p><span className="font-semibold text-slate-600">Subtotal:</span> ₹{(viewData.totalAmount || 0).toLocaleString()}</p>
                <p className="font-bold text-base pt-1"><span className="text-slate-700">Total:</span> ₹{(viewData.totalAmount || 0).toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
            <h3 className="font-bold text-slate-800 mb-4 border-b pb-2">Shipping Address</h3>
            <div className="space-y-3 text-sm">
              <p><span className="font-semibold text-slate-600">Address:</span> {viewData.address || "N/A"}</p>
              <p><span className="font-semibold text-slate-600">City:</span> {viewData.city || viewData.place || "N/A"}</p>
              <p><span className="font-semibold text-slate-600">Pincode:</span> {viewData.pincode || "N/A"}</p>
            </div>
          </div>
        </div>

        {/* Right Column: Items */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
          <h3 className="font-bold text-slate-800 mb-4 border-b pb-2">Order Items</h3>
          <div className="space-y-4">
            {viewData.orderItem?.map((it, idx) => {
              const p = it.product || {};
              const img = (Array.isArray(p.imageUrl) ? p.imageUrl[0] : p.imageUrl) || p.image || "";
              
              return (
                <div key={idx} className="flex gap-4 p-3 border border-slate-100 rounded-lg">
                  <img 
                    src={img || "https://via.placeholder.com/60"} 
                    alt="Product" 
                    className="w-16 h-16 object-cover rounded border border-slate-200"
                  />
                  <div className="flex-1">
                    <p className="font-bold text-sm text-slate-900 leading-snug mb-2">{p.name || "Product"}</p>
                    <p className="text-sm font-semibold text-slate-700">Qty: {it.quantity} × ₹{Number(it.unitPrice).toLocaleString()}</p>
                  </div>
                </div>
              );
            })}
          </div>
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
