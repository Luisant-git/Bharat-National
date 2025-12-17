// src/pages/AdminOverview.jsx
import React from "react";
import {
  ShoppingCart,
  DollarSign,
  Package,
  AlertTriangle,
  TrendingUp,
  MoreHorizontal,
} from "lucide-react";

const AdminOverview = () => {
  return (
    <div className="min-h-screen bg-slate-100">
      {/* Page container */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Page header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-slate-800">
              Overview
            </h1>
            <p className="text-sm text-slate-500">
              Quick snapshot of your electronics store performance.
            </p>
          </div>
          <button className="px-3 py-1.5 text-sm border rounded-lg bg-white hover:bg-slate-50 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Last 7 days
          </button>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
          {/* Total Orders */}
          <div className="bg-white rounded-xl border shadow-sm p-4 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">
                Total Orders
              </p>
              <p className="mt-1 text-2xl font-semibold text-slate-800">
                1,248
              </p>
              <p className="mt-1 text-xs text-emerald-600">
                +8.4% vs last week
              </p>
            </div>
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
              <ShoppingCart className="w-5 h-5 text-blue-600" />
            </div>
          </div>

          {/* Revenue */}
          <div className="bg-white rounded-xl border shadow-sm p-4 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">
                Revenue
              </p>
              <p className="mt-1 text-2xl font-semibold text-slate-800">
                ₹4,28,500
              </p>
              <p className="mt-1 text-xs text-emerald-600">
                +12.1% vs last week
              </p>
            </div>
            <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-emerald-600" />
            </div>
          </div>

          {/* Products in stock */}
          <div className="bg-white rounded-xl border shadow-sm p-4 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">
                Products in Stock
              </p>
              <p className="mt-1 text-2xl font-semibold text-slate-800">382</p>
              <p className="mt-1 text-xs text-slate-500">
                Across 24 categories
              </p>
            </div>
            <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center">
              <Package className="w-5 h-5 text-indigo-600" />
            </div>
          </div>

          {/* Low stock alerts */}
          <div className="bg-white rounded-xl border shadow-sm p-4 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">
                Low Stock
              </p>
              <p className="mt-1 text-2xl font-semibold text-slate-800">9</p>
              <p className="mt-1 text-xs text-amber-600">
                Reorder trending items
              </p>
            </div>
            <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
            </div>
          </div>
        </div>

        {/* Middle row: Sales overview + Top products */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
          {/* Sales overview card */}
          <div className="bg-white rounded-xl border shadow-sm p-4 lg:col-span-2">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-slate-800">
                Sales Overview
              </h2>
              <button className="text-xs text-slate-500 hover:text-slate-700 flex items-center gap-1">
                View details
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </div>
            {/* Placeholder for chart */}
            <div className="h-40 rounded-lg border border-dashed border-slate-200 flex items-center justify-center text-xs text-slate-400">
              Chart placeholder – plug your sales graph here
            </div>
            <div className="mt-3 flex gap-4 text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-blue-500" />
                Online Orders
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" />
                COD Orders
              </div>
            </div>
          </div>

          {/* Top products */}
          <div className="bg-white rounded-xl border shadow-sm p-4">
            <h2 className="text-sm font-semibold text-slate-800 mb-3">
              Top Selling Products
            </h2>
            <ul className="space-y-2">
              <li className="flex items-center justify-between text-xs">
                <div>
                  <p className="font-medium text-slate-800">
                    Wireless Bluetooth Headphones
                  </p>
                  <p className="text-slate-500">SKU: WH-102</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-slate-800">142</p>
                  <p className="text-slate-500">units sold</p>
                </div>
              </li>
              <li className="flex items-center justify-between text-xs">
                <div>
                  <p className="font-medium text-slate-800">
                    65&quot; 4K Smart LED TV
                  </p>
                  <p className="text-slate-500">SKU: TV-6500</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-slate-800">87</p>
                  <p className="text-slate-500">units sold</p>
                </div>
              </li>
              <li className="flex items-center justify-between text-xs">
                <div>
                  <p className="font-medium text-slate-800">
                    Fast Charging Adapter 33W
                  </p>
                  <p className="text-slate-500">SKU: CH-033</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-slate-800">210</p>
                  <p className="text-slate-500">units sold</p>
                </div>
              </li>
              <li className="flex items-center justify-between text-xs">
                <div>
                  <p className="font-medium text-slate-800">
                    Gaming Mouse RGB Series
                  </p>
                  <p className="text-slate-500">SKU: GM-901</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-slate-800">63</p>
                  <p className="text-slate-500">units sold</p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom row: Recent orders */}
        <div className="bg-white rounded-xl border shadow-sm p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-slate-800">
              Recent Orders
            </h2>
            <button className="text-xs text-slate-500 hover:text-slate-700">
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
                  <td className="px-3 py-2 text-slate-800">#INV-2048</td>
                  <td className="px-3 py-2 text-slate-600">Karthik</td>
                  <td className="px-3 py-2 text-slate-600">
                    2 × Headphone, 1 × Charger
                  </td>
                  <td className="px-3 py-2 text-slate-800">₹12,499</td>
                  <td className="px-3 py-2">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] bg-emerald-50 text-emerald-700">
                      Paid
                    </span>
                  </td>
                  <td className="px-3 py-2 text-right text-slate-500">
                    27 Nov
                  </td>
                </tr>
                <tr className="border-b last:border-0">
                  <td className="px-3 py-2 text-slate-800">#INV-2047</td>
                  <td className="px-3 py-2 text-slate-600">Priya</td>
                  <td className="px-3 py-2 text-slate-600">
                    1 × 4K TV, 1 × Wall Mount
                  </td>
                  <td className="px-3 py-2 text-slate-800">₹48,990</td>
                  <td className="px-3 py-2">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] bg-amber-50 text-amber-700">
                      COD Pending
                    </span>
                  </td>
                  <td className="px-3 py-2 text-right text-slate-500">
                    27 Nov
                  </td>
                </tr>
                <tr className="border-b last:border-0">
                  <td className="px-3 py-2 text-slate-800">#INV-2046</td>
                  <td className="px-3 py-2 text-slate-600">Rahul</td>
                  <td className="px-3 py-2 text-slate-600">1 × Gaming Mouse</td>
                  <td className="px-3 py-2 text-slate-800">₹1,899</td>
                  <td className="px-3 py-2">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] bg-sky-50 text-sky-700">
                      Shipped
                    </span>
                  </td>
                  <td className="px-3 py-2 text-right text-slate-500">
                    26 Nov
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOverview;
