"use client";
import { useState } from 'react';
import api from '@/utils/api';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const router = useRouter();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await api.post('/auth/login', { email, password });
            
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user', JSON.stringify(res.data.user));
            window.dispatchEvent(new Event("storage"));
            
            const isAdmin = res.data.user?.role === 'admin';
            alert("✅ Login Successful!");
            router.push(isAdmin ? '/admin' : '/'); 
        } catch (err) {
            alert('❌ ' + (err.response?.data?.message || "Invalid Credentials"));
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
                            Welcome Back
                        </h1>
                        <p className="text-slate-500">Sign in to your OrderCard account</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Email Address</label>
                            <div className="relative">
                                <input
                                    type="email"
                                    placeholder="you@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
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
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="w-full px-4 py-3 pl-10 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                                />
                                <span className="absolute left-3 top-3.5 text-slate-400">🔒</span>
                            </div>
                        </div>

                        <div className="flex items-center justify-between py-1">
                            <label className="flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                    className="w-4 h-4 rounded border-slate-300 text-orange-600 focus:ring-orange-500"
                                />
                                <span className="ml-2 text-sm text-slate-600">Remember me</span>
                            </label>
                            <Link href="#" className="text-sm text-orange-600 hover:text-orange-700 font-medium">
                                Forgot password?
                            </Link>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full mt-6 py-3 px-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold rounded-lg transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                        >
                            {loading ? '⏳ Signing in...' : '🚀 Sign In'}
                        </button>

                        <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-slate-200"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white text-slate-500">New to OrderCard?</span>
                            </div>
                        </div>

                        <Link href="/register">
                            <button
                                type="button"
                                className="w-full py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg transition-all duration-300"
                            >
                                Create Account
                            </button>
                        </Link>
                    </form>

                    <div className="mt-6 p-3 bg-orange-50 border border-orange-100 rounded-lg">
                        <p className="text-xs font-semibold text-orange-700 mb-1">Demo Credentials:</p>
                        <p className="text-xs text-orange-600">Email: testuser@example.com</p>
                        <p className="text-xs text-orange-600">Pass: test123456</p>
                    </div>
                </div>

                <p className="text-center text-slate-600 text-sm mt-6">
                    🛍️ <span className="font-semibold">OrderCard</span> - Your Ultimate Shopping Destination
                </p>
            </div>
        </div>
    );
}