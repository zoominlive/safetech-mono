import { Outlet } from "react-router";

export default function AuthLayout() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4 py-8">
      <div className="max-w-md w-full bg-white p-4 sm:p-8 rounded-xl shadow relative space-y-2">
        <div className="flex justify-center">
          <img src="/logo.png" alt="logo" className="w-36 h-20 sm:w-48 sm:h-24" />
        </div>
        <img
          src="/right-corner-bg.png"
          alt=""
          className="absolute right-0 top-0 h-16 w-16 sm:h-24 sm:w-24"
        />
        <Outlet />
      </div>
    </div>
  );
}
