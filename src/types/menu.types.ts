// Menu and Permission Types

export interface MenuItem {
    id: string;
    name: string;
    code: string;           // Unique identifier like 'CURRICULUM_GENERATOR'
    description: string;
    icon?: string;          // lucide icon name
    category: 'TEACHER' | 'STUDENT' | 'PARENT' | 'ADMIN' | 'SHARED';
    isActive: boolean;
    order: number;
    parentId?: string;      // For nested menus
    createdAt: number;
    updatedAt: number;
}

export interface MenuPermission {
    id: string;
    userId: string;
    menuItemIds: string[];  // Array of MenuItem IDs the user has access to
    customPermissions?: string[];  // Legacy string permissions for backward compat
    grantedBy: string;      // Admin user ID who granted
    grantedAt: number;
}

// Predefined menu items for seeding
export const DEFAULT_MENU_ITEMS: Omit<MenuItem, 'id' | 'createdAt' | 'updatedAt'>[] = [
    // Teacher menus
    { name: 'Curriculum Generator', code: 'CURRICULUM_GENERATOR', description: 'AI-powered curriculum and quiz generation', category: 'TEACHER', isActive: true, order: 1, icon: 'Wand2' },
    { name: 'Student Analytics', code: 'STUDENT_ANALYTICS', description: 'View student progress and performance', category: 'TEACHER', isActive: true, order: 2, icon: 'BarChart3' },
    { name: 'Classroom Settings', code: 'CLASSROOM_SETTINGS', description: 'Manage classroom configuration', category: 'TEACHER', isActive: true, order: 3, icon: 'Settings' },
    { name: 'Advanced Reporting', code: 'ADVANCED_REPORTING', description: 'Generate detailed reports', category: 'TEACHER', isActive: true, order: 4, icon: 'FileText' },
    { name: 'Edit Question Bank', code: 'EDIT_QUESTION_BANK', description: 'Create and edit questions', category: 'TEACHER', isActive: true, order: 5, icon: 'PenTool' },
    { name: 'Skill Library', code: 'SKILL_LIBRARY', description: 'Access and manage skill library', category: 'TEACHER', isActive: true, order: 6, icon: 'Library' },

    // Student menus
    { name: 'My Learning Path', code: 'LEARNING_PATH', description: 'Access personalized learning journey', category: 'STUDENT', isActive: true, order: 1, icon: 'Map' },
    { name: 'Practice Mode', code: 'PRACTICE_MODE', description: 'Practice skills and earn XP', category: 'STUDENT', isActive: true, order: 2, icon: 'Zap' },
    { name: 'Achievements', code: 'ACHIEVEMENTS', description: 'View badges and achievements', category: 'STUDENT', isActive: true, order: 3, icon: 'Trophy' },
    { name: 'Leaderboard', code: 'LEADERBOARD', description: 'See rankings and compete', category: 'STUDENT', isActive: true, order: 4, icon: 'Medal' },

    // Parent menus
    { name: 'Child Progress', code: 'CHILD_PROGRESS', description: 'Monitor child learning progress', category: 'PARENT', isActive: true, order: 1, icon: 'LineChart' },
    { name: 'Activity Reports', code: 'ACTIVITY_REPORTS', description: 'View activity and time spent', category: 'PARENT', isActive: true, order: 2, icon: 'Clock' },

    // Admin menus
    { name: 'User Management', code: 'USER_MANAGEMENT', description: 'Manage all users', category: 'ADMIN', isActive: true, order: 1, icon: 'Users' },
    { name: 'System Settings', code: 'SYSTEM_SETTINGS', description: 'Configure platform settings', category: 'ADMIN', isActive: true, order: 2, icon: 'Settings2' },
    { name: 'Component Library', code: 'COMPONENT_LIBRARY', description: 'Manage reusable components', category: 'ADMIN', isActive: true, order: 3, icon: 'Boxes' },
    { name: 'Menu Management', code: 'MENU_MANAGEMENT', description: 'Manage menus and permissions', category: 'ADMIN', isActive: true, order: 4, icon: 'Menu' },
];
