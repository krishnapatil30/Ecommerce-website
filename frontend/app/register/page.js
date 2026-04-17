"use client";
import { useState } from 'react';
import api from '@/utils/api';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/register', formData);
      alert('✅ Registration successful! Please login.');
      router.push('/login');
    } catch (err) {
      alert('❌ ' + (err.response?.data?.message || 'Registration failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-50 px-4 relative">
      
      {/* BACK TO HOME BUTTON */}
      <Link 
          href="/" 
          className="absolute top-6 left-6 flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-md border border-slate-200 rounded-full text-slate-600 hover:text-orange-600 hover:border-orange-200 transition-all shadow-sm group z-50"
      >
          <span className="group-hover:-translate-x-1 transition-transform">←</span>
          <span className="text-sm font-semibold">Back to Home</span>
      </Link>

      <div className="w-full max-w-md">
        <div className="bg-white backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-slate-100">
          <div className="mb-8 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full mb-4">
              <span className="text-xl text-white font-bold">OC</span>
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent mb-2">
              Create Account
            </h1>
            <p className="text-slate-500">Join OrderCard and start shopping</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Full Name</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-3 pl-10 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                />
                <span className="absolute left-3 top-3.5 text-slate-400">👤</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-4 py-3 pl-10 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                />
                <span className="absolute left-3 top-3.5 text-slate-400">✉️</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Password</label>
              <div className="relative">
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="w-full px-4 py-3 pl-10 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                />
                <span className="absolute left-3 top-3.5 text-slate-400">🔒</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-6 py-3 px-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold rounded-lg transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
            >
              {loading ? '⏳ Creating Account...' : '✨ Create Account'}
            </button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-slate-500">Already have an account?</span>
              </div>
            </div>

            <Link href="/login">
              <button
                type="button"
                className="w-full py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg transition-all duration-300"
              >
                Sign In Instead
              </button>
            </Link>
          </form>

          <p className="text-center text-xs text-slate-500 mt-6">
            By registering, you agree to our<br/>
            <Link href="#" className="text-orange-600 hover:text-orange-700 font-medium">Terms & Conditions</Link>
          </p>
        </div>

        <p className="text-center text-slate-600 text-sm mt-6">
          🛍️ <span className="font-semibold">OrderCard</span> - Your Ultimate Shopping Destination
        </p>
      </div>
    </div>
  );
}