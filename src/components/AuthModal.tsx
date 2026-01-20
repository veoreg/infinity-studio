import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Loader2, X, Mail, Lock, User } from 'lucide-react';

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
