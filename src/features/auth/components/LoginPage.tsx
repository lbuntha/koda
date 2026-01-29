import React, { useState, useEffect } from 'react';
import { AuthLayout } from './AuthLayout';
import { Input, Button } from '@shared/components/ui';
import { loginUser } from '../services/authService';
import { LogIn, AlertCircle } from 'lucide-react';

const LOGIN_ERROR_KEY = 'koda_login_error';

interface LoginPageProps {
    onNavigateToRegister: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onNavigateToRegister }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Check for persisted error on mount (survives component remount)
    useEffect(() => {
        const persistedError = sessionStorage.getItem(LOGIN_ERROR_KEY);
        if (persistedError) {
            setError(persistedError);
            sessionStorage.removeItem(LOGIN_ERROR_KEY);
        }
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        sessionStorage.removeItem(LOGIN_ERROR_KEY);
        setLoading(true);

        try {
            await loginUser({ email, password });
            // App.tsx auth listener will handle navigation
        } catch (err: any) {
            const errorMessage = err.message || 'Failed to login';
            // Persist error to sessionStorage in case component remounts
            sessionStorage.setItem(LOGIN_ERROR_KEY, errorMessage);
            setLoading(false);
            setError(errorMessage);
        }
    };

    return (
        <AuthLayout
            title="Welcome back"
            subtitle="Sign in to your account to continue learning"
        >
            <form className="space-y-6" onSubmit={handleSubmit}>
                {error && (
                    <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4 rounded-md">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <AlertCircle className="h-5 w-5 text-red-500" />
                            </div>
                            <div className="ml-3">
                                <p className="text-sm text-red-700">{error}</p>
                            </div>
                        </div>
                    </div>
                )}

                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-slate-700">
                        Email address
                    </label>
                    <div className="mt-1">
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            required
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full"
                        />
                    </div>
                </div>

                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                        Password
                    </label>
                    <div className="mt-1">
                        <Input
                            id="password"
                            name="password"
                            type="password"
                            autoComplete="current-password"
                            required
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full"
                        />
                    </div>
                </div>

                <div>
                    <Button
                        type="submit"
                        disabled={loading}
                        className="w-full flex justify-center py-2 px-4"
                        variant="primary"
                    >
                        {loading ? 'Signing in...' : (
                            <div className="flex items-center">
                                <LogIn className="w-4 h-4 mr-2" />
                                Sign in
                            </div>
                        )}
                    </Button>
                </div>
            </form>

            <div className="mt-6">
                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-slate-200" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-white text-slate-500">
                            New to Koda?
                        </span>
                    </div>
                </div>

                <div className="mt-6">
                    <Button
                        onClick={onNavigateToRegister}
                        variant="outline"
                        className="w-full"
                    >
                        Create an account
                    </Button>
                </div>
            </div>
        </AuthLayout>
    );
};
