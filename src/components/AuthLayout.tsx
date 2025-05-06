import { Outlet } from "react-router";

export default function AuthLayout() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full bg-white p-8 rounded-xl shadow relative space-y-2">
        <img src="/logo.png" alt="logo" className="w-48 h-24" />
        <img
          src="/right-corner-bg.png"
          alt=""
          className="absolute right-0 top-0 h-24 w-24"
        />
        <Outlet />
      </div>
    </div>
  );
}
