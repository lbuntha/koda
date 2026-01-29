import React, { useState } from 'react';
import { AuthLayout } from './AuthLayout';
import { Input, Button } from '@shared/components/ui';
import { registerUser } from '../services/authService';
import { Role } from '@types';
import { UserPlus, AlertCircle, GraduationCap, Users, LineChart, ShieldCheck } from 'lucide-react';

interface SignUpPageProps {
    onNavigateToLogin: () => void;
}

export const SignUpPage: React.FC<SignUpPageProps> = ({ onNavigateToLogin }) => {
    const [step, setStep] = useState<1 | 2>(1); // 1: Role Selection, 2: Details
    const [role, setRole] = useState<Role | null>(null);
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleRoleSelect = (selectedRole: Role) => {
        setRole(selectedRole);
        setStep(2);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!role) return;

        setError(null);
        setLoading(true);

        try {
            await registerUser({ email, password, fullName, role });
            // App.tsx auth listener will handle navigation
        } catch (err: any) {
            setError(err.message || 'Failed to create account');
            setLoading(false);
        }
    };

    if (step === 1) {
        return (
            <AuthLayout
                title="Create an account"
                subtitle="Select your role to get started"
            >
                <div className="space-y-4">
                    <button
                        onClick={() => handleRoleSelect(Role.TEACHER)}
                        className="w-full group relative p-4 border border-slate-200 rounded-lg hover:border-indigo-500 hover:ring-1 hover:ring-indigo-500 transition-all flex items-start space-x-4 text-left"
                    >
                        <div className="flex-shrink-0 p-2 bg-indigo-50 rounded-lg group-hover:bg-indigo-100">
                            <GraduationCap className="h-6 w-6 text-indigo-600" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-slate-900">I am a Teacher</h3>
                            <p className="text-sm text-slate-500 mt-1">Manage classes, create AI curriculum, and track progress.</p>
                        </div>
                    </button>

                    <button
                        onClick={() => handleRoleSelect(Role.STUDENT)}
                        className="w-full group relative p-4 border border-slate-200 rounded-lg hover:border-emerald-500 hover:ring-1 hover:ring-emerald-500 transition-all flex items-start space-x-4 text-left"
                    >
                        <div className="flex-shrink-0 p-2 bg-emerald-50 rounded-lg group-hover:bg-emerald-100">
                            <Users className="h-6 w-6 text-emerald-600" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-slate-900">I am a Student</h3>
                            <p className="text-sm text-slate-500 mt-1">Access personalized learning, quizzes, and gamified goals.</p>
                        </div>
                    </button>

                    <button
                        onClick={() => handleRoleSelect(Role.PARENT)}
                        className="w-full group relative p-4 border border-slate-200 rounded-lg hover:border-purple-500 hover:ring-1 hover:ring-purple-500 transition-all flex items-start space-x-4 text-left"
                    >
                        <div className="flex-shrink-0 p-2 bg-purple-50 rounded-lg group-hover:bg-purple-100">
                            <LineChart className="h-6 w-6 text-purple-600" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-slate-900">I am a Parent</h3>
                            <p className="text-sm text-slate-500 mt-1">Monitor your child's mastery and growth over time.</p>
                        </div>
                    </button>

                    <div className="mt-4 pt-4 border-t border-slate-200 text-center">
                        <button
                            onClick={() => handleRoleSelect(Role.ADMIN)}
                            className="text-xs text-slate-400 hover:text-slate-600 font-medium"
                        >
                            Sign up as Administrator
                        </button>
                    </div>

                    <div className="mt-2 text-center">
                        <span className="text-sm text-slate-500">Already have an account? </span>
                        <button onClick={onNavigateToLogin} className="text-sm text-indigo-600 hover:text-indigo-500 font-medium">
                            Sign in
                        </button>
                    </div>
                </div>
            </AuthLayout>
        );
    }

    return (
        <AuthLayout
            title="Create your profile"
            subtitle={`Signing up as a ${role}`}
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
                    <label htmlFor="fullName" className="block text-sm font-medium text-slate-700">
                        Full Name
                    </label>
                    <div className="mt-1">
                        <Input
                            id="fullName"
                            name="fullName"
                            type="text"
                            required
                            placeholder="John Doe"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            className="w-full"
                        />
                    </div>
                </div>

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
                            required
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full"
                        />
                        <p className="mt-1 text-xs text-slate-500">Must be at least 6 characters.</p>
                    </div>
                </div>

                <div className="flex space-x-3">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => setStep(1)}
                        className="w-1/3"
                    >
                        Back
                    </Button>
                    <Button
                        type="submit"
                        disabled={loading}
                        className="w-2/3 flex justify-center py-2 px-4"
                        variant="primary"
                    >
                        {loading ? 'Creating...' : (
                            <div className="flex items-center">
                                <UserPlus className="w-4 h-4 mr-2" />
                                Create Account
                            </div>
                        )}
                    </Button>
                </div>
            </form>

            <div className="mt-6 text-center">
                <span className="text-sm text-slate-500">Already have an account? </span>
                <button onClick={onNavigateToLogin} className="text-sm text-indigo-600 hover:text-indigo-500 font-medium">
                    Sign in
                </button>
            </div>
        </AuthLayout>
    );
};
