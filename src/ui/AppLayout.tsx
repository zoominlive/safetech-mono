import { Outlet } from "react-router";
import Sidebar from "./Sidebar";
import Header from "./Header";

export default function AppLayout() {
  return (
    <div className="min-h-screen flex bg-slate-100">
      <Sidebar />
      <main className="w-full my-1">
        <Header />
        <div className="px-4 py-6 overflow-y-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
