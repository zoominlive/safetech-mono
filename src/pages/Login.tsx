import { Link } from "react-router";

export default function Login() {
  return (
    <>
      <h2 className="font-inter font-extrabold text-2xl">
        Sign in to your account
      </h2>
      <h4 className="text-gray-400">Welcome back!</h4>
      <form className="space-y-4">
        <div className="flex flex-col">
          <label htmlFor="email">Email</label>
          <input type="email" placeholder="Email" className="input" />
        </div>
        <div className="flex flex-col">
          <label htmlFor="password">Password</label>
          <input type="password" placeholder="Password" className="input" />
        </div>
        <div className="flex justify-between">
          <div>Remember Me</div>
          <Link to="/reset-password">Forgot Password?</Link>
        </div>
        <button
          className="w-full text-center bg-gray-950 text-white rounded-xl p-4 font-bold"
          type="submit"
        >
          Sign in
        </button>
      </form>
    </>
  );
}
