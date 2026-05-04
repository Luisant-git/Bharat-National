// src/components/TopBar.jsx
import React from 'react';
import { Bell, User, Menu } from 'lucide-react';

const AdminTopbar = ({ setSidebarOpen }) => {
  return (
    <div className="bg-white border-b border-gray-200 sticky top-0 z-30">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(prev => !prev)}
            className="p-2 rounded-lg hover:bg-gray-100 lg:hidden"
          >
            <Menu className="w-5 h-5 text-gray-600" />
          </button>
          <h2 className="text-sm sm:text-base font-medium text-gray-700">Welcome back, Admin</h2>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="p-2 rounded-lg hover:bg-gray-100 relative">
            <Bell className="w-5 h-5 text-gray-600" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
          <button className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-100">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center text-white font-medium">
              A
            </div>
            <span className="hidden sm:block text-sm text-gray-700">Admin</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminTopbar;