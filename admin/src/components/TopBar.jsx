// src/components/AdminTopbar.jsx
import React, { useState } from "react";
import { Search, User, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify"; 

const AdminTopbar = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  const handleProfile = () => {
    // Later you can navigate to profile page:
    // navigate("/admin/profile");
    console.log("Go to profile");
    setIsModalOpen(false);
  };

  const handleLogout = () => {
   
    localStorage.removeItem("admin");
    localStorage.removeItem("isAdminLoggedIn");

    
    toast.success("Logged out successfully");

    
    setIsModalOpen(false);

    // Redirect to login page
    navigate("/admin/login", { replace: true });
  };

  return (
    <>
      {/* Top Bar */}
      <header className="w-full h-14 px-4 md:px-6 flex items-center justify-between bg-white border-b shadow-sm">
        {/* Left: Search bar */}
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              className="w-full pl-9 pr-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/60 focus:border-primary/80 bg-gray-50"
            />
          </div>
        </div>

        {/* Right: Admin avatar */}
        <div className="ml-4">
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-2 py-1 rounded-full hover:bg-gray-100 transition"
          >
            <div className="w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center text-sm font-semibold">
              A
            </div>
            <span className="hidden md:inline text-sm font-medium text-gray-700">
              Admin
            </span>
          </button>
        </div>
      </header>

      {/* Modal for Profile + Logout (compact) */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-40 flex justify-end items-start bg-transparent"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="mt-14 mr-4 w-52 bg-white rounded-lg shadow-lg border p-2"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center text-xs font-semibold">
                A
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-800">
                  Admin User
                </p>
                <p className="text-[10px] text-gray-500">admin@example.com</p>
              </div>
            </div>

            <hr className="my-1" />

            <button
              onClick={handleProfile}
              className="w-full flex items-center gap-2 px-2 py-1 rounded-md hover:bg-gray-100 text-xs text-gray-700"
            >
              <User className="w-3 h-3" />
              Profile
            </button>

            <button
              onClick={handleLogout}
              className="mt-1 w-full flex items-center gap-2 px-2 py-1 rounded-md hover:bg-red-50 text-xs text-red-600"
            >
              <LogOut className="w-3 h-3" />
              Logout
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminTopbar;
