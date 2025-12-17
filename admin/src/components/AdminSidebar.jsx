import React, { useState } from "react";
import {
  Home,
  FileText,
  Box,
  ShoppingCart,
  Users,
  ChevronDown,
  PlusCircle,
  ListOrdered,
  Tag,
  FolderTree,
} from "lucide-react";
import { NavLink } from "react-router-dom";

const AdminSidebar = () => {
  const [dashboardOpen, setDashboardOpen] = useState(true);
  const [masterOpen, setMasterOpen] = useState(true);
  const [customerOpen, setCustomerOpen] = useState(false);

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-3 py-2 rounded-lg text-sm cursor-pointer transition-all duration-200
    ${
      isActive
        ? "text-blue-600 font-semibold"
        : "text-gray-700 hover:text-blue-600"
    }`;

  return (
    <div className="w-64 h-screen fixed left-0 top-0 bg-white border-r border-gray-200 shadow-md flex flex-col">
      {/* Header */}
      <div className="p-5 flex items-center justify-between border-b border-gray-200">
        <div>
          <div className="text-xs uppercase tracking-wider text-gray-400">
            Admin
          </div>
          <div className="font-bold text-lg text-gray-800">Control Panel</div>
        </div>
        <div className="w-10 h-10 rounded-full flex items-center justify-center bg-blue-600 text-white font-semibold shadow">
          A
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-4">
        {/* Dashboard */}
        <div className="px-2">
          <div
            onClick={() => setDashboardOpen(!dashboardOpen)}
            className="flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer hover:bg-gray-100 transition"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 flex items-center justify-center bg-gray-100 rounded-lg">
                <Home size={18} className="text-blue-600" />
              </div>
              <span className="font-semibold text-gray-800">Dashboard</span>
            </div>
            <ChevronDown
              size={16}
              className={`transition-transform ${
                dashboardOpen ? "rotate-180" : ""
              }`}
            />
          </div>

          {dashboardOpen && (
            <ul className="pl-10 mt-2 space-y-2">
              <NavLink to="/admin" end className={linkClass}>
                <Home size={16} />
                <span>Dashboard</span>
              </NavLink>

              <NavLink to="/admin/overview" className={linkClass}>
                <FileText size={16} />
                <span>Overview</span>
              </NavLink>
            </ul>
          )}
        </div>

        {/* Master */}
        <div className="px-2 mt-4">
          <div
            onClick={() => setMasterOpen(!masterOpen)}
            className="flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer hover:bg-gray-100 transition"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-gray-100 flex items-center justify-center rounded-lg">
                <Box size={18} className="text-blue-600" />
              </div>
              <span className="font-semibold text-gray-800">Master</span>
            </div>
            <ChevronDown
              size={16}
              className={`transition-transform ${
                masterOpen ? "rotate-180" : ""
              }`}
            />
          </div>

          {masterOpen && (
            <ul className="pl-10 mt-2 space-y-2">
             
              <NavLink to="/admin/product" className={linkClass}>
                <ListOrdered size={16} />
                <span>Product List</span>
              </NavLink>
              <NavLink to="/admin/brand" className={linkClass}>
                <Tag size={16} />
                <span>Brands</span>
              </NavLink>
              <NavLink to="/admin/category" className={linkClass}>
                <FolderTree size={16} />
                <span>Categories</span>
              </NavLink>
            </ul>
          )}
        </div>

        {/* Orders */}
        <div className="px-2 mt-4">
          <NavLink to="/admin/orders" className={linkClass}>
            <ShoppingCart size={18} />
            <span>Orders List</span>
          </NavLink>
        </div>

        {/* Customers */}
        <div className="px-2 mt-4 mb-5">
          <div
            onClick={() => setCustomerOpen(!customerOpen)}
            className="flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer hover:bg-gray-100 transition"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-gray-100 flex items-center justify-center rounded-lg">
                <Users size={18} className="text-blue-600" />
              </div>
              <span className="font-semibold text-gray-800">Customers</span>
            </div>
            <ChevronDown
              size={16}
              className={`transition-transform ${
                customerOpen ? "rotate-180" : ""
              }`}
            />
          </div>

          {customerOpen && (
            <ul className="pl-10 mt-2 space-y-2">
              <NavLink to="/admin/customers" className={linkClass}>
                <Users size={16} />
                <span>Customer List</span>
              </NavLink>
            </ul>
          )}
        </div>
      </nav>
    </div>
  );
};

export default AdminSidebar;
