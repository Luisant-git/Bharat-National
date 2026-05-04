import React, { useEffect, useMemo, useState } from "react";
import {
  Users,
  ShoppingBag,
  TrendingUp,
  Download,
  Search,
  Phone,
  X,
  UserCheck,
  UserX,
  AlertTriangle,
  PackageCheck,
} from "lucide-react";
import { toast } from "react-toastify";
import { getOrders } from "../api/customer";
import Pagination from "../CommonComponent/Pagination";

const formatCurrency = (value) =>
  `₹${Number(value || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const formatDate = (date) => {
  if (!date) return "N/A";

  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
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

const getStoredUserKey = (order) => {
  return order.email || order.phone || order.fullName || `order-${order.id}`;
};

const getInitial = (name) => {
  return name?.trim()?.[0]?.toUpperCase() || "C";
};

const CustomerList = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("ALL");

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [page, setPage] = useState(1);
  const limit = 10;

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const data = await getOrders();
        const list = data?.data ?? data ?? [];
        setOrders(list);
      } catch (err) {
        console.error(err);
        toast.error(err?.message || "Failed to load customers");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  useEffect(() => {
    setPage(1);
  }, [search, activeTab, fromDate, toDate]);

  /**
   * Date-filter orders first.
   * This makes customer cards and table count update according to date filter.
   */
  const dateFilteredOrders = useMemo(() => {
    let list = [...orders];

    if (fromDate) {
      list = list.filter((o) => isSameOrAfterDate(o.createdAt, fromDate));
    }

    if (toDate) {
      list = list.filter((o) => isSameOrBeforeDate(o.createdAt, toDate));
    }

    return list;
  }, [orders, fromDate, toDate]);

  /**
   * Build customer-level data from orders.
   */
  const customers = useMemo(() => {
    const map = new Map();

    for (const o of dateFilteredOrders) {
      const key = getStoredUserKey(o);
      if (!key) continue;

      const createdAt = o.createdAt ? new Date(o.createdAt) : null;
      const amount = Number(o.totalAmount || 0);
      const status = o.status || "PLACED";

      const quantity = (o.orderItem || []).reduce(
        (sum, it) => sum + (Number(it.quantity) || 0),
        0
      );

      const existing = map.get(key);

      if (!existing) {
        map.set(key, {
          key,
          fullName: o.fullName || "Unknown",
          email: o.email || "",
          phone: o.phone || "",
          city: o.place || o.city || "",
          ordersCount: 1,
          totalSpent: amount,
          totalQuantity: quantity,
          joinDate: createdAt,
          lastOrderAt: createdAt,
          hasOrdered: true,
          hasCancelled: status === "CANCELLED",
          hasAbandoned: status === "ABANDONED",
        });
      } else {
        existing.ordersCount += 1;
        existing.totalSpent += amount;
        existing.totalQuantity += quantity;

        if (status === "CANCELLED") existing.hasCancelled = true;
        if (status === "ABANDONED") existing.hasAbandoned = true;

        if (createdAt && (!existing.lastOrderAt || createdAt > existing.lastOrderAt)) {
          existing.lastOrderAt = createdAt;
          existing.fullName = o.fullName || existing.fullName;
          existing.city = o.place || o.city || existing.city;
        }

        if (createdAt && (!existing.joinDate || createdAt < existing.joinDate)) {
          existing.joinDate = createdAt;
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
  }, [dateFilteredOrders]);

  /**
   * Search filter.
   * Summary cards also use this searched list.
   */
  const searchedCustomers = useMemo(() => {
    if (!search.trim()) return customers;

    const q = search.toLowerCase();

    return customers.filter((c) => {
      return (
        c.fullName?.toLowerCase().includes(q) ||
        c.email?.toLowerCase().includes(q) ||
        c.phone?.includes(q) ||
        c.city?.toLowerCase().includes(q)
      );
    });
  }, [customers, search]);

  const customerCounts = useMemo(() => {
    const totalLoggedCustomers = searchedCustomers.length;

    // Only possible if you have separate users API.
    // With orders-only API this remains 0.
    const nonOrderCustomers = searchedCustomers.filter((c) => !c.hasOrdered).length;

    const orderedCustomers = searchedCustomers.filter(
      (c) => c.hasOrdered && !c.hasCancelled && !c.hasAbandoned
    ).length;

    const cancelledCustomers = searchedCustomers.filter((c) => c.hasCancelled).length;
    const abandonedCustomers = searchedCustomers.filter((c) => c.hasAbandoned).length;

    const totalRevenue = searchedCustomers.reduce(
      (sum, c) => sum + Number(c.totalSpent || 0),
      0
    );

    return {
      totalLoggedCustomers,
      nonOrderCustomers,
      orderedCustomers,
      cancelledCustomers,
      abandonedCustomers,
      totalRevenue,
    };
  }, [searchedCustomers]);

  const tabbedCustomers = useMemo(() => {
    if (activeTab === "ALL") return searchedCustomers;

    if (activeTab === "NON_ORDER") {
      return searchedCustomers.filter((c) => !c.hasOrdered);
    }

    if (activeTab === "ORDERED") {
      return searchedCustomers.filter(
        (c) => c.hasOrdered && !c.hasCancelled && !c.hasAbandoned
      );
    }

    if (activeTab === "CANCELLED") {
      return searchedCustomers.filter((c) => c.hasCancelled);
    }

    if (activeTab === "ABANDONED") {
      return searchedCustomers.filter((c) => c.hasAbandoned);
    }

    return searchedCustomers;
  }, [searchedCustomers, activeTab]);

  const totalPages = Math.max(1, Math.ceil(tabbedCustomers.length / limit));
  const safePage = Math.min(page, totalPages);
  const startIndex = (safePage - 1) * limit;
  const paginated = tabbedCustomers.slice(startIndex, startIndex + limit);

  const resetFilters = () => {
    setSearch("");
    setFromDate("");
    setToDate("");
    setActiveTab("ALL");
    setPage(1);
  };

  const getCustomerStatus = (customer) => {
    if (customer.hasAbandoned) {
      return {
        label: "Abandoned",
        className: "bg-red-50 text-red-700 border-red-100",
      };
    }

    if (customer.hasCancelled) {
      return {
        label: "Cancelled",
        className: "bg-rose-50 text-rose-700 border-rose-100",
      };
    }

    if (customer.hasOrdered) {
      return {
        label: "Active",
        className: "bg-emerald-50 text-emerald-700 border-emerald-100",
      };
    }

    return {
      label: "Non Order",
      className: "bg-slate-50 text-slate-600 border-slate-100",
    };
  };

  const handleDownload = () => {
    if (tabbedCustomers.length === 0) {
      toast.error("No customers to download");
      return;
    }

    const headers = [
      "Customer",
      "Email",
      "Phone",
      "Orders",
      "Total Spent",
      "Status",
      "Join Date",
      "Last Order",
    ];

    const rows = tabbedCustomers.map((c) => {
      const status = getCustomerStatus(c);

      return [
        c.fullName || "",
        c.email || "",
        c.phone || "",
        c.ordersCount || 0,
        c.totalSpent || 0,
        status.label,
        formatDate(c.joinDate),
        formatDate(c.lastOrderAt),
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
    a.download = "customers-report.csv";
    a.click();

    window.URL.revokeObjectURL(url);
  };

  const summaryCards = [
    {
      label: "Total Logged Customers",
      value: customerCounts.totalLoggedCustomers,
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "Non Order Customers",
      value: customerCounts.nonOrderCustomers,
      icon: UserCheck,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      label: "Ordered Customers",
      value: customerCounts.orderedCustomers,
      icon: ShoppingBag,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
    {
      label: "Cancelled Customers",
      value: customerCounts.cancelledCustomers,
      icon: UserX,
      color: "text-red-600",
      bg: "bg-red-50",
    },
    {
      label: "Abandoned Customers",
      value: customerCounts.abandonedCustomers,
      icon: AlertTriangle,
      color: "text-rose-600",
      bg: "bg-rose-50",
    },
  ];

  const tabs = [
    {
      key: "ALL",
      label: "All",
      count: searchedCustomers.length,
    },
    {
      key: "NON_ORDER",
      label: "Non Order Customers",
      count: customerCounts.nonOrderCustomers,
    },
    {
      key: "ORDERED",
      label: "Ordered Customers",
      count: customerCounts.orderedCustomers,
    },
    {
      key: "CANCELLED",
      label: "Cancelled Customers",
      count: customerCounts.cancelledCustomers,
    },
    {
      key: "ABANDONED",
      label: "Abandoned Customers",
      count: customerCounts.abandonedCustomers,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6">
      <div className="w-full max-w-7xl mx-auto space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-950">
              Customers
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Manage your customer database
            </p>
          </div>

          <button
            type="button"
            onClick={handleDownload}
            className="hidden sm:inline-flex items-center gap-2 rounded-full bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 transition"
          >
            <Download className="w-3.5 h-3.5" />
            Download
          </button>
        </div>

        {/* Customers Summary */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 md:p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-slate-900">Customers Summary</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Counts update with search and date filters
              </p>
            </div>

            <button
              type="button"
              onClick={handleDownload}
              className="inline-flex items-center gap-1.5 bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-emerald-700 transition"
            >
              <Download className="w-3.5 h-3.5" />
              Download
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {summaryCards.map((item) => (
              <div
                key={item.label}
                className="flex items-center gap-3 border border-slate-100 bg-slate-50/50 rounded-xl p-4 shadow-sm"
              >
                <div
                  className={`w-11 h-11 rounded-xl ${item.bg} flex items-center justify-center`}
                >
                  <item.icon className={`w-5 h-5 ${item.color}`} />
                </div>

                <div>
                  <p className="text-2xl font-extrabold text-slate-950 leading-none">
                    {item.value}
                  </p>
                  <p className="mt-1 text-xs text-slate-500 leading-tight">
                    {item.label}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Tabs */}
          <div className="px-4 pt-4 overflow-x-auto">
            <div className="flex items-center gap-8 min-w-max border-b border-slate-200">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className={`relative pb-3 text-sm transition ${
                    activeTab === tab.key
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

                  {activeTab === tab.key && (
                    <span className="absolute left-0 right-0 -bottom-px h-[2px] bg-blue-600 rounded-full" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Filters */}
          <div className="p-4 space-y-3">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
              <div className="relative w-full lg:max-w-[420px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search customers..."
                  className="w-full pl-9 pr-3 py-2.5 text-sm border border-slate-200 rounded-lg bg-white outline-none focus:border-[var(--primary,#00897B)]"
                />
              </div>

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

                <button
                  type="button"
                  onClick={handleDownload}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700"
                >
                  <Download className="w-4 h-4" />
                  Download Report
                </button>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-y border-slate-200">
                <tr className="text-left text-slate-700">
                  <th className="px-4 py-3 font-semibold">Customer</th>
                  <th className="px-4 py-3 font-semibold">Contact</th>
                  <th className="px-4 py-3 font-semibold">Orders</th>
                  <th className="px-4 py-3 font-semibold">Total Spent</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Join Date</th>
                  <th className="px-4 py-3 font-semibold">Last Order</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-10 text-center text-slate-500">
                      Loading customers...
                    </td>
                  </tr>
                ) : paginated.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-10 text-center text-slate-500">
                      No customers found
                    </td>
                  </tr>
                ) : (
                  paginated.map((customer) => {
                    const status = getCustomerStatus(customer);

                    return (
                      <tr
                        key={customer.key}
                        className="border-b border-slate-200 hover:bg-slate-50/70 transition"
                      >
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
                              {getInitial(customer.fullName)}
                            </div>

                            <div>
                              <p className="font-semibold text-slate-900 leading-tight">
                                {customer.fullName || "Unknown"}
                              </p>
                              <p className="text-xs text-slate-500 leading-tight">
                                {customer.email || "N/A"}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-1.5 text-slate-700">
                            <Phone className="w-3.5 h-3.5 text-slate-400" />
                            {customer.phone || "-"}
                          </div>
                        </td>

                        <td className="px-4 py-4 whitespace-nowrap">
                          {customer.ordersCount || 0} orders
                        </td>

                        <td className="px-4 py-4 whitespace-nowrap font-semibold text-slate-900">
                          {formatCurrency(customer.totalSpent)}
                        </td>

                        <td className="px-4 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${status.className}`}
                          >
                            {status.label}
                          </span>
                        </td>

                        <td className="px-4 py-4 whitespace-nowrap">
                          {formatDate(customer.joinDate)}
                        </td>

                        <td className="px-4 py-4 whitespace-nowrap">
                          {formatDate(customer.lastOrderAt)}
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
      </div>
    </div>
  );
};

export default CustomerList;