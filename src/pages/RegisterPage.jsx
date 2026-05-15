import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function RegisterPage() {
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await api.post("/auth/register", form);
      login(data, data.token);
      navigate("/chat");
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#030712] flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-950/40 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="w-11 h-11 bg-indigo-600 rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-indigo-950">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h1 className="text-xl font-semibold text-white tracking-tight">Create account</h1>
          <p className="text-sm text-gray-500 mt-1">Join the conversation</p>
        </div>

        <div className="bg-[#0d1117] border border-[#1f2937] rounded-2xl p-6">
          {error && (
            <div className="mb-5 px-4 py-3 bg-red-950/50 border border-red-900/50 rounded-xl text-red-400 text-sm">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-2">Username</label>
              <input
                type="text" name="username" value={form.username} onChange={handleChange}
                required minLength={3} maxLength={20} placeholder="cooluser123"
                className="w-full bg-[#111827] border border-[#1f2937] text-gray-100 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-600 transition-colors placeholder-gray-600"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-2">Email</label>
              <input
                type="email" name="email" value={form.email} onChange={handleChange}
                required placeholder="you@example.com"
                className="w-full bg-[#111827] border border-[#1f2937] text-gray-100 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-600 transition-colors placeholder-gray-600"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-2">Password</label>
              <input
                type="password" name="password" value={form.password} onChange={handleChange}
                required minLength={6} placeholder="••••••••"
                className="w-full bg-[#111827] border border-[#1f2937] text-gray-100 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-600 transition-colors placeholder-gray-600"
              />
            </div>
            <button
              type="submit" disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium py-2.5 rounded-xl transition-colors mt-1"
            >
              {loading ? "Creating account..." : "Create account"}
            </button>
          </form>
        </div>

        <p className="text-center text-gray-600 text-sm mt-5">
          Already have an account?{" "}
          <Link to="/login" className="text-indigo-400 hover:text-indigo-300 transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}