// src/pages/AdminDashboard.jsx
import React from "react";
import {
  ShoppingCart,
  DollarSign,
  Package,
  Users,
  TrendingUp,
  Sparkles,
} from "lucide-react";
import PremiumBarChart from "./Barchart";


const AdminDashboard = () => {
  const salesData = [
    { day: "Mon", value: 9000 },
    { day: "Tue", value: 180 },
    { day: "Wed", value: 90 },
    { day: "Thu", value: 220 },
    { day: "Fri", value: 160 },
    { day: "Sat", value: 260 },
    { day: "Sun", value: 140 },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-2.5 py-1 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            <span className="text-[11px] font-medium text-indigo-600">
              Today’s snapshot · Updated live
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-semibold text-slate-900">
            Dashboard
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Monitor orders, revenue, inventory and customers for your
            electronics store.
          </p>
        </div>
        <button className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm bg-slate-900 text-slate-50 hover:bg-slate-800 shadow-sm">
          <TrendingUp className="w-4 h-4" />
          Download report
        </button>
      </div>

      {/* Top stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Card 1 */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
              Total Orders
            </p>
            <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] text-emerald-700">
              +8.4% vs last week
            </span>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-2xl font-semibold text-slate-900">1,248</p>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
              <ShoppingCart className="w-5 h-5 text-indigo-600" />
            </div>
          </div>
          <p className="text-[11px] text-slate-500">
            312 new orders in the last 24 hours.
          </p>
        </div>

        {/* Card 2 */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
              Revenue
            </p>
            <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] text-emerald-700">
              +₹46,200 today
            </span>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-2xl font-semibold text-slate-900">₹4,28,500</p>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-emerald-600" />
            </div>
          </div>
          <p className="text-[11px] text-slate-500">
            Includes online + COD settlements.
          </p>
        </div>

        {/* Card 3 */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
              Products In Stock
            </p>
            <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[11px] text-slate-700">
              24 categories
            </span>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-2xl font-semibold text-slate-900">382</p>
            <div className="w-10 h-10 rounded-xl bg-sky-50 flex items-center justify-center">
              <Package className="w-5 h-5 text-sky-600" />
            </div>
          </div>
          <p className="text-[11px] text-slate-500">
            9 SKUs are in low stock. Consider reordering.
          </p>
        </div>

        {/* Card 4 */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
              Active Customers
            </p>
            <span className="inline-flex items-center rounded-full bg-violet-50 px-2 py-0.5 text-[11px] text-violet-700">
              +112 new
            </span>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-2xl font-semibold text-slate-900">812</p>
            <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center">
              <Users className="w-5 h-5 text-violet-600" />
            </div>
          </div>
          <p className="text-[11px] text-slate-500">
            Customers who purchased in the last 30 days.
          </p>
        </div>
      </div>

      {/* Middle row: chart + top categories */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Chart */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">
                Weekly Sales (Orders)
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Online + COD orders for the last 7 days.
              </p>
            </div>
            <span className="text-xs text-slate-500">
              Compared to previous week
            </span>
          </div>

          <PremiumBarChart data={salesData} />

          <div className="mt-3 flex gap-4 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-indigo-500" />
              Total Orders
            </div>
          </div>
        </div>

        {/* Top Categories */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
          <h2 className="text-sm font-semibold text-slate-900 mb-3">
            Top Categories
          </h2>
          <ul className="space-y-3 text-xs">
            <li className="flex items-center justify-between">
              <div>
                <p className="font-medium text-slate-900">Smartphones</p>
                <p className="text-slate-500">38% of total sales</p>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-[11px]">
                472 orders
              </span>
            </li>
            <li className="flex items-center justify-between">
              <div>
                <p className="font-medium text-slate-900">Televisions</p>
                <p className="text-slate-500">22% of total sales</p>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px]">
                268 orders
              </span>
            </li>
            <li className="flex items-center justify-between">
              <div>
                <p className="font-medium text-slate-900">Accessories</p>
                <p className="text-slate-500">19% of total sales</p>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-violet-50 text-violet-700 text-[11px]">
                189 orders
              </span>
            </li>
            <li className="flex items-center justify-between">
              <div>
                <p className="font-medium text-slate-900">Laptops</p>
                <p className="text-slate-500">12% of total sales</p>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[11px]">
                132 orders
              </span>
            </li>
          </ul>
        </div>
      </div>

      {/* Recent orders table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">
              Recent Orders
            </h2>
            <p className="text-xs text-slate-500">
              Latest orders placed in your store.
            </p>
          </div>
          <button className="text-xs text-slate-600 hover:text-slate-900">
            View all
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-xs">
            <thead>
              <tr className="border-b bg-slate-50">
                <th className="text-left px-3 py-2 font-medium text-slate-600">
                  Order #
                </th>
                <th className="text-left px-3 py-2 font-medium text-slate-600">
                  Customer
                </th>
                <th className="text-left px-3 py-2 font-medium text-slate-600">
                  Items
                </th>
                <th className="text-left px-3 py-2 font-medium text-slate-600">
                  Amount
                </th>
                <th className="text-left px-3 py-2 font-medium text-slate-600">
                  Status
                </th>
                <th className="text-right px-3 py-2 font-medium text-slate-600">
                  Date
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b last:border-0">
                <td className="px-3 py-2 text-slate-800">#INV-2051</td>
                <td className="px-3 py-2 text-slate-600">Revi</td>
                <td className="px-3 py-2 text-slate-600">
                  1 × Smartphone, 1 × Earbuds
                </td>
                <td className="px-3 py-2 text-slate-800">₹24,999</td>
                <td className="px-3 py-2">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] bg-emerald-50 text-emerald-700">
                    Paid
                  </span>
                </td>
                <td className="px-3 py-2 text-right text-slate-500">28 Nov</td>
              </tr>
              <tr className="border-b last:border-0">
                <td className="px-3 py-2 text-slate-800">#INV-2050</td>
                <td className="px-3 py-2 text-slate-600">John</td>
                <td className="px-3 py-2 text-slate-600">1 × 55&quot; 4K TV</td>
                <td className="px-3 py-2 text-slate-800">₹39,990</td>
                <td className="px-3 py-2">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] bg-sky-50 text-sky-700">
                    Shipped
                  </span>
                </td>
                <td className="px-3 py-2 text-right text-slate-500">28 Nov</td>
              </tr>
              <tr className="border-b last:border-0">
                <td className="px-3 py-2 text-slate-800">#INV-2049</td>
                <td className="px-3 py-2 text-slate-600">Ram</td>
                <td className="px-3 py-2 text-slate-600">
                  1 × Laptop, 1 × Mouse
                </td>
                <td className="px-3 py-2 text-slate-800">₹58,499</td>
                <td className="px-3 py-2">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] bg-amber-50 text-amber-700">
                    COD Pending
                  </span>
                </td>
                <td className="px-3 py-2 text-right text-slate-500">27 Nov</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
