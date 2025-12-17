import { Outlet } from "react-router-dom";
import AdminSidebar from "../components/AdminSidebar";
import AdminTopbar from "../components/TopBar";


export default function AdminLayout() {
  return (
    <div className="flex bg-[#f5f7fa]">
      <AdminSidebar />

      <div className="flex-1 ml-64 flex flex-col min-h-screen">
        <AdminTopbar />

        <div className="p-4">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
