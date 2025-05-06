import { Link } from "react-router";

export default function ResetPassword() {
  return (
    <>
      <h2 className="text-2xl font-bold mb-2">Forgot Password?</h2>
      <h4 className="text-gray-500">
        Enter your email below to receive instructions
      </h4>
      <form className="space-y-4">
        <div className="flex flex-col">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            placeholder="Email"
            className="w-full px-2 py-2 border-2 rounded-md border-gray-500"
          />
        </div>
        <button className="w-full text-center bg-gray-950 text-white rounded-xl p-4 font-bold">
          Submit
        </button>
      </form>
      <div className="flex items-center justify-center">
        <Link to="/login">
          Back to <span className="font-bold">Sign in</span>
        </Link>
      </div>
    </>
  );
}
