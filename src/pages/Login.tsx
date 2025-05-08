import { Link } from "react-router";

export default function Login() {
  return (
    <>
      <h2 className="font-inter font-extrabold text-xl sm:text-2xl mt-4">
        Sign in to your account
      </h2>
      <h4 className="text-gray-400 mb-4">Welcome back!</h4>
      <form className="space-y-4">
        <div className="flex flex-col">
          <label htmlFor="email" className="mb-1">Email</label>
          <input 
            type="email" 
            id="email"
            placeholder="Email" 
            className="w-full px-3 py-2 border-2 rounded-md border-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-300" 
          />
        </div>
        <div className="flex flex-col">
          <label htmlFor="password" className="mb-1">Password</label>
          <input 
            type="password" 
            id="password"
            placeholder="Password" 
            className="w-full px-3 py-2 border-2 rounded-md border-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-300" 
          />
        </div>
        <div className="flex flex-wrap justify-between text-sm">
          <div className="flex items-center mb-2 sm:mb-0">
            <input 
              type="checkbox" 
              id="remember"
              className="mr-2 h-4 w-4 rounded border-gray-300" 
            />
            <label htmlFor="remember">Remember Me</label>
          </div>
          <Link to="/reset-password" className="text-blue-600 hover:underline">
            Forgot Password?
          </Link>
        </div>
        <button
          className="w-full text-center bg-gray-950 text-white rounded-xl p-3 sm:p-4 font-bold hover:bg-gray-800 transition-colors"
          type="submit"
        >
          Sign in
        </button>
      </form>
    </>
  );
}
