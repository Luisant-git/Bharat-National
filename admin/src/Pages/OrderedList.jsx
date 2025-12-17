
import React, { useEffect, useMemo, useState } from "react";
import { Eye, X, Mail, Phone, MapPin } from "lucide-react";
import { toast } from "react-toastify";
import { getOrders } from "../api/customer";


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

  // Filter by search only (no status)
  const filtered = useMemo(() => {
    let list = [...orders];

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((o) => {
        return (
          (o.fullName && o.fullName.toLowerCase().includes(q)) ||
          (o.email && o.email.toLowerCase().includes(q)) ||
          (o.phone && o.phone.toLowerCase().includes(q)) ||
          String(o.id).includes(q)
        );
      });
    }

    // newest first
    list.sort((a, b) => {
      const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return bTime - aTime;
    });

    return list;
  }, [orders, search]);

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

        {/* ✅ search only */}
        <div className="flex items-center justify-between gap-3">
          <SearchInput value={search} onChange={setSearch} />
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

        {/* ✅ VIEW MODAL (Left = customer, Right = order items) */}
        {viewModalOpen && viewData && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
            <div className="bg-white w-full max-w-5xl rounded-2xl shadow-xl border overflow-hidden relative">
              {/* close */}
              <button
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-700"
                onClick={() => {
                  setViewModalOpen(false);
                  setViewData(null);
                }}
              >
                <X className="w-5 h-5" />
              </button>

              {/* header */}
              <div className="px-6 py-5 border-b">
                <h2 className="text-lg font-semibold text-slate-900">
                  Order Details
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Order ID:{" "}
                  <span className="font-semibold">#ORD-{viewData.id}</span>
                </p>
              </div>

              {/* body */}
              <div className="grid grid-cols-1 lg:grid-cols-2">
                {/* LEFT: Customer */}
                <div className="p-6 border-b lg:border-b-0 lg:border-r">
                  <h3 className="text-sm font-semibold text-slate-900 mb-4">
                    Customer Details
                  </h3>

                  <div className="space-y-3 text-sm">
                    <div>
                      <p className="text-xs text-slate-500">Name</p>
                      <p className="font-medium text-slate-900">
                        {viewData.fullName || "Unknown"}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 text-slate-700">
                      <Mail className="w-4 h-4 text-slate-400" />
                      <span>{viewData.email || "-"}</span>
                    </div>

                    <div className="flex items-center gap-2 text-slate-700">
                      <Phone className="w-4 h-4 text-slate-400" />
                      <span>{viewData.phone || "-"}</span>
                    </div>

                    <div className="flex items-start gap-2 text-slate-700">
                      <MapPin className="w-4 h-4 text-slate-400 mt-0.5" />
                      <span className="whitespace-pre-line">
                        {viewData.place || "No place provided."}
                      </span>
                    </div>

                    <div className="pt-3 border-t">
                      <p className="text-xs text-slate-500">Total Amount</p>
                      <p className="font-semibold text-slate-900">
                        ₹{(viewData.totalAmount || 0).toLocaleString("en-IN")}
                      </p>
                    </div>
                  </div>
                </div>

                {/* RIGHT: Order Items */}
                <div className="p-6">
                  <h3 className="text-sm font-semibold text-slate-900 mb-4">
                    Order Items
                  </h3>

                  <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                    {Array.isArray(viewData.orderItem) &&
                    viewData.orderItem.length > 0 ? (
                      viewData.orderItem.map((it) => {
                        const p = it.product || {};
                        const img =
                          (Array.isArray(p.imageUrl)
                            ? p.imageUrl[0]
                            : p.imageUrl) ||
                          p.image ||
                          p.thumbnail ||
                          "";

                        const unit = it.unitPrice ?? p.price ?? 0;
                        const qty = it.quantity ?? 1;

                        return (
                          <div
                            key={it.id}
                            className="flex items-center justify-between gap-3 rounded-xl border bg-white px-3 py-2"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-100 flex items-center justify-center">
                                {img ? (
                                  <img
                                    src={img}
                                    alt={p.name || "Product"}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <span className="text-[10px] text-slate-400">
                                    No image
                                  </span>
                                )}
                              </div>

                              <div className="min-w-0">
                                <p className="truncate text-sm font-medium text-slate-900">
                                  {p.name || "Product"}
                                </p>
                                <p className="text-[11px] text-slate-500">
                                  Qty: {qty} • Unit: ₹
                                  {Number(unit).toLocaleString("en-IN")}
                                </p>
                              </div>
                            </div>

                            <div className="text-right">
                              <p className="text-sm font-semibold text-slate-900">
                                ₹
                                {(Number(unit) * Number(qty)).toLocaleString(
                                  "en-IN"
                                )}
                              </p>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="rounded-xl border border-dashed p-6 text-center text-sm text-slate-500">
                        No items found for this order.
                      </div>
                    )}
                  </div>

                  {/* summary */}
                  <div className="mt-4 border-t pt-3 flex items-center justify-between text-sm">
                    <span className="text-slate-500">Grand Total</span>
                    <span className="font-semibold text-slate-900">
                      ₹{(viewData.totalAmount || 0).toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>
              </div>

              {/* footer */}
              <div className="px-6 py-4 border-t flex justify-end">
                <button
                  onClick={() => {
                    setViewModalOpen(false);
                    setViewData(null);
                  }}
                  className="px-4 py-2 rounded-lg border text-sm text-slate-700 hover:bg-slate-50"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderList;
