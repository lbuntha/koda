// Dashboard - Admin dashboard stats overview
import React from 'react';
import { Users, Activity, GraduationCap, ListChecks } from 'lucide-react';
import { StatCard } from '@shared/components/ui';

interface DashboardProps {
    totalUsers: number;
    activeStudents: number;
    totalQuizzes: number;
}

export const Dashboard: React.FC<DashboardProps> = ({ totalUsers, activeStudents, totalQuizzes }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-in fade-in duration-300">
            <StatCard
                title="Total Users"
                value={totalUsers.toString()}
                trend="+12%"
                icon={Users}
                color="bg-indigo-500"
            />
            <StatCard
                title="Active Students"
                value={activeStudents.toString()}
                trend="+5%"
                icon={GraduationCap}
                color="bg-emerald-500"
            />
            <StatCard
                title="Quizzes Taken"
                value={totalQuizzes.toString()}
                trend="+24%"
                icon={ListChecks}
                color="bg-amber-500"
            />
            <StatCard
                title="System Load"
                value="Optimal"
                icon={Activity}
                color="bg-blue-500"
            />
        </div>
    );
};
