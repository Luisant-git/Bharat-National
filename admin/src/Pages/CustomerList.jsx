import React, { useEffect, useMemo, useState } from "react";
import { Users, ShoppingBag, TrendingUp } from "lucide-react";
import { toast } from "react-toastify";
import { getOrders } from "../api/customer";

import SearchInput from "../CommonComponent/SearchBar";
import DataTable from "../CommonComponent/Table";
import Pagination from "../CommonComponent/Pagination";

const CustomerList = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const limit = 10;

  // Load orders
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const data = await getOrders();
        setOrders(data || []);
      } catch (err) {
        console.error(err);
        toast.error(err?.message || "Failed to load orders");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  // Build customer-level view
  const customers = useMemo(() => {
    const map = new Map();

    for (const o of orders) {
      const key = o.email || o.phone;
      if (!key) continue;

      const createdAt = o.createdAt ? new Date(o.createdAt) : null;
      const orderAmount = o.totalAmount || 0;

      const existing = map.get(key);

      if (!existing) {
        map.set(key, {
          key,
          fullName: o.fullName,
          email: o.email,
          phone: o.phone,
          ordersCount: 1,
          totalAmount: orderAmount,
          lastOrderAt: createdAt,
        });
      } else {
        existing.ordersCount += 1;
        existing.totalAmount += orderAmount;

        if (
          createdAt &&
          (!existing.lastOrderAt || createdAt > existing.lastOrderAt)
        ) {
          existing.lastOrderAt = createdAt;
          existing.fullName = o.fullName || existing.fullName;
        }
      }
    }

    const arr = Array.from(map.values());
    arr.sort((a, b) => {
      const aTime = a.lastOrderAt ? a.lastOrderAt.getTime() : 0;
      const bTime = b.lastOrderAt ? b.lastOrderAt.getTime() : 0;
      return bTime - aTime;
    });

    return arr;
  }, [orders]);

  // Stats
  const stats = useMemo(() => {
    const totalCustomers = customers.length;
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce(
      (sum, o) => sum + (o.totalAmount || 0),
      0
    );

    return {
      totalCustomers,
      totalOrders,
      totalRevenue,
      avgSpend: totalCustomers
        ? Math.round(totalRevenue / Math.max(totalCustomers, 1))
        : 0,
    };
  }, [customers, orders]);

  // Filter by search
  const filtered = useMemo(() => {
    if (!search.trim()) return customers;

    const q = search.toLowerCase();
    return customers.filter((c) => {
      return (
        (c.fullName && c.fullName.toLowerCase().includes(q)) ||
        (c.email && c.email.toLowerCase().includes(q)) ||
        (c.phone && c.phone.toLowerCase().includes(q))
      );
    });
  }, [customers, search]);

  // Reset page when search changes
  useEffect(() => setPage(1), [search]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filtered.length / limit));
  const safePage = Math.min(page, totalPages);
  const startIndex = (safePage - 1) * limit;
  const paginated = filtered.slice(startIndex, startIndex + limit);

  // Columns (for DataTable)
  const columns = [
    {
      key: "customer",
      label: "Customer",
      render: (c) => (
        <div className="flex items-start gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900/5 text-xs font-semibold text-slate-700">
            {c.fullName?.charAt(0)?.toUpperCase() || "C"}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-slate-900">
              {c.fullName || "Unknown"}
            </p>
            <p className="mt-0.5 truncate text-[11px] text-slate-500 max-w-xs">
              {c.email || "-"}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "phone",
      label: "Phone",
      render: (c) => <span className="text-slate-700">{c.phone || "-"}</span>,
    },
    {
      key: "orders",
      label: "Orders",
      render: (c) => (
        <span className="inline-flex items-center rounded-full bg-slate-900/5 px-2.5 py-0.5 text-[11px] font-medium">
          {c.ordersCount} order{c.ordersCount !== 1 ? "s" : ""}
        </span>
      ),
    },
    {
      key: "amount",
      label: "Total Amount",
      render: (c) => (
        <span className="text-slate-900 font-medium">
          ₹{Number(c.totalAmount || 0).toLocaleString("en-IN")}
        </span>
      ),
    },
    {
      key: "lastOrder",
      label: "Last Order",
      render: (c) => (
        <span className="text-slate-500 text-xs">
          {c.lastOrderAt
            ? c.lastOrderAt.toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })
            : "-"}
        </span>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-slate-100/80 px-4 py-8 flex justify-center">
      <div className="w-full max-w-6xl space-y-6">
        {/* ✅ Heading */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold tracking-[0.18em] text-slate-400 uppercase">
              Customers
            </p>
            <h1 className="mt-1 text-2xl md:text-3xl font-semibold tracking-tight text-slate-900">
              Customers Overview
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              See customer orders, total spend and last order date.
            </p>
          </div>

          {/* Total revenue (right) */}
          <div className="hidden sm:flex flex-col items-end gap-1 text-xs">
            <span className="text-slate-500">Total Revenue</span>
            <span className="text-lg font-semibold text-emerald-600">
              ₹{stats.totalRevenue.toLocaleString("en-IN")}
            </span>
          </div>
        </div>

        {/* ✅ Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Customers */}
          <div className="flex items-center justify-between rounded-2xl border border-slate-100 bg-white/95 px-4 py-3 shadow-sm">
            <div>
              <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wide">
                Customers
              </p>
              <p className="mt-1 text-xl font-semibold text-slate-900">
                {stats.totalCustomers}
              </p>
            </div>
            <div className="h-9 w-9 rounded-full bg-slate-900/5 flex items-center justify-center">
              <Users className="w-4 h-4 text-slate-700" />
            </div>
          </div>

          {/* Orders */}
          <div className="flex items-center justify-between rounded-2xl border border-slate-100 bg-white/95 px-4 py-3 shadow-sm">
            <div>
              <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wide">
                Orders
              </p>
              <p className="mt-1 text-xl font-semibold text-slate-900">
                {stats.totalOrders}
              </p>
            </div>
            <div className="h-9 w-9 rounded-full bg-slate-900/5 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4 text-slate-700" />
            </div>
          </div>

          {/* Avg spend */}
          <div className="flex items-center justify-between rounded-2xl border border-slate-100 bg-white/95 px-4 py-3 shadow-sm">
            <div>
              <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wide">
                Avg Spend / Customer
              </p>
              <p className="mt-1 text-lg font-semibold text-slate-900">
                ₹{stats.avgSpend.toLocaleString("en-IN")}
              </p>
            </div>
            <div className="h-9 w-9 rounded-full bg-emerald-50 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
            </div>
          </div>
        </div>

        {/* ✅ Table Card + Search */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-3.5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">
                Customers
              </h2>
              <p className="text-xs text-slate-500">
                Showing {filtered.length} customer
                {filtered.length !== 1 ? "s" : ""} (page {safePage} of{" "}
                {totalPages})
              </p>
            </div>

            {/* ✅ Reusable Search */}
            <div className="w-full sm:w-72">
              <SearchInput value={search} onChange={setSearch} />
            </div>
          </div>

          {/* ✅ Reusable Table */}
          <DataTable
            columns={columns}
            data={paginated}
            loading={loading}
            emptyText="No customers found"
          />

          {/* ✅ Reusable Pagination */}
          <div className="border-t border-slate-100">
            <Pagination
              page={safePage}
              totalPages={totalPages}
              onChange={setPage}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerList;
