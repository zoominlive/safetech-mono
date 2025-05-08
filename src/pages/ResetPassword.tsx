import { Link } from "react-router";

export default function ResetPassword() {
  return (
    <>
      <h2 className="text-xl sm:text-2xl font-bold mb-2 mt-4">Forgot Password?</h2>
      <h4 className="text-gray-500 mb-4">
        Enter your email below to receive instructions
      </h4>
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
        <button 
          type="submit"
          className="w-full text-center bg-gray-950 text-white rounded-xl p-3 sm:p-4 font-bold hover:bg-gray-800 transition-colors"
        >
          Submit
        </button>
      </form>
      <div className="flex items-center justify-center mt-4 py-2">
        <Link 
          to="/login" 
          className="text-blue-600 hover:underline"
        >
          Back to <span className="font-bold">Sign in</span>
        </Link>
      </div>
    </>
  );
}
