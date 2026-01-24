import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Loader2, X, Mail, Lock } from 'lucide-react';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setMessage(null);

        try {
            if (isLogin) {
                // Sign In
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;
                onClose(); // Close modal on success
            } else {
                // Sign Up
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                });
                if (error) throw error;
                setMessage('Check your email for the confirmation link!');
            }
        } catch (err: any) {
            setError(err.message || 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-[#0a0a0a] border border-[#d2ac47]/30 rounded-3xl w-full max-w-md p-8 relative shadow-[0_0_50px_rgba(210,172,71,0.1)]">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-[#d2ac47]/50 hover:text-[#d2ac47] transition-colors"
                >
                    <X size={20} />
                </button>

                {/* Header */}
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-serif text-[#F9F1D8] italic mb-2">
                        {isLogin ? 'Welcome Back' : 'Join the Elite'}
                    </h2>
                    <p className="text-[#d2ac47]/60 text-xs uppercase tracking-widest">
                        {isLogin ? 'Access your private collection' : 'Begin your legacy'}
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleAuth} className="space-y-4">
                    {/* Error / Message */}
                    {error && (
                        <div className="bg-red-900/20 border border-red-500/30 text-red-200 text-xs p-3 rounded-xl text-center">
                            {error}
                        </div>
                    )}
                    {message && (
                        <div className="bg-green-900/20 border border-green-500/30 text-green-200 text-xs p-3 rounded-xl text-center">
                            {message}
                        </div>
                    )}

                    <div className="space-y-2">
                        <div className="relative group">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-[#d2ac47]/40 group-focus-within:text-[#d2ac47] transition-colors" size={16} />
                            <input
                                type="email"
                                placeholder="Email Address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-[#050505] border border-[#d2ac47]/20 rounded-xl py-3 pl-10 pr-4 text-[#F9F1D8] placeholder-[#d2ac47]/20 focus:outline-none focus:border-[#d2ac47]/60 transition-colors text-sm"
                                required
                            />
                        </div>
                        <div className="relative group">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-[#d2ac47]/40 group-focus-within:text-[#d2ac47] transition-colors" size={16} />
                            <input
                                type="password"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-[#050505] border border-[#d2ac47]/20 rounded-xl py-3 pl-10 pr-4 text-[#F9F1D8] placeholder-[#d2ac47]/20 focus:outline-none focus:border-[#d2ac47]/60 transition-colors text-sm"
                                required
                                minLength={6}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-[#d2ac47] to-[#b8860b] text-black font-bold uppercase tracking-wider py-3 rounded-xl hover:shadow-[0_0_20px_rgba(210,172,71,0.4)] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {loading ? <Loader2 size={16} className="animate-spin" /> : (isLogin ? 'Sign In' : 'Create Account')}
                    </button>

                    {/* Divider */}
                    <div className="flex items-center gap-3 my-4 opacity-50">
                        <div className="h-[1px] flex-1 bg-[#d2ac47]/30"></div>
                        <span className="text-[#d2ac47] text-[10px] uppercase tracking-widest">OR</span>
                        <div className="h-[1px] flex-1 bg-[#d2ac47]/30"></div>
                    </div>

                    {/* Google Login */}
                    <button
                        type="button"
                        onClick={async () => {
                            setLoading(true);
                            try {
                                await supabase.auth.signInWithOAuth({
                                    provider: 'google',
                                    options: { redirectTo: window.location.origin }
                                });
                            } catch (err: any) {
                                setError(err.message);
                                setLoading(false);
                            }
                        }}
                        disabled={loading}
                        className="w-full bg-white text-black font-bold uppercase tracking-wider py-3 rounded-xl hover:bg-gray-100 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        <span>Continue with Google</span>
                    </button>
                </form>

                {/* Switcher */}
                <div className="mt-6 text-center">
                    <button
                        onClick={() => setIsLogin(!isLogin)}
                        className="text-[#d2ac47]/60 hover:text-[#d2ac47] text-xs underline decoration-dotted underline-offset-4 transition-colors"
                    >
                        {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AuthModal;
