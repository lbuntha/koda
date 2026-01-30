import { User, Role } from '@types';
import { getAll, getById, save, saveAll, remove, removeAll, isFirebaseConfigured } from '@lib/index';

const COLLECTION = 'users' as const;

// Mock data only used when Firebase is NOT configured (demo/development mode)
const DEMO_USERS: User[] = [
    { id: '9B7xL3mPq2vR5jNk', name: 'Sarah Connor', role: Role.TEACHER, email: 'sarah@school.edu', status: 'Active', lastLogin: '2 mins ago', permissions: ['Curriculum Generator', 'Student Analytics'], subscriptionTier: 'pro', tokenUsage: 15000, quotaResetDate: new Date().toISOString() },
    { id: '4fH8sK2wD9zX6cAv', name: 'John Doe', role: Role.STUDENT, email: 'john.d@student.edu', status: 'Active', lastLogin: '1 hour ago', subscriptionTier: 'free', tokenUsage: 2500, quotaResetDate: new Date().toISOString() },
    { id: '7nMs5tG2hQ8rL3pB', name: 'Jane Smith', role: Role.PARENT, email: 'jane.s@gmail.com', status: 'Inactive', lastLogin: '3 days ago', children: ['4fH8sK2wD9zX6cAv'], subscriptionTier: 'basic', tokenUsage: 0, quotaResetDate: new Date().toISOString() },
    { id: '2vR5jNk9B7xL3mPq', name: 'Mr. Anderson', role: Role.TEACHER, email: 'neo@matrix.edu', status: 'Suspended', lastLogin: '1 week ago', permissions: [], subscriptionTier: 'free', tokenUsage: 0, quotaResetDate: new Date().toISOString() },
    { id: 'D9zX6cAv4fH8sK2w', name: 'Alex Murphy', role: Role.STUDENT, email: 'alex@police.gov', status: 'Active', lastLogin: 'Just now', subscriptionTier: 'pro', tokenUsage: 45000, quotaResetDate: new Date().toISOString() },
];

/**
 * Get all users from Firebase Firestore.
 * When Firebase is not configured (demo mode), returns mock data for development.
 */
export const getUsers = async (): Promise<User[]> => {
    const users = await getAll<User>(COLLECTION);

    // Only seed demo data when Firebase is NOT configured (development/demo mode)
    if (users.length === 0 && !isFirebaseConfigured()) {
        await saveAll(COLLECTION, DEMO_USERS);
        return DEMO_USERS;
    }

    return users;
};

// Sync version for backwards compatibility (localStorage only, used internally)
export const getUsersSync = (): User[] => {
    const stored = localStorage.getItem('edu_users');
    if (stored) return JSON.parse(stored);

    // Only use demo data when Firebase is NOT configured
    if (!isFirebaseConfigured()) {
        localStorage.setItem('edu_users', JSON.stringify(DEMO_USERS));
        return DEMO_USERS;
    }

    return [];
};

export const saveUsers = async (users: User[]): Promise<void> => {
    await saveAll(COLLECTION, users);
    localStorage.setItem('edu_users', JSON.stringify(users));
};

export const addUser = async (user: User): Promise<void> => {
    await save(COLLECTION, user);
    const users = getUsersSync();
    const exists = users.some(u => u.id === user.id);
    if (!exists) {
        localStorage.setItem('edu_users', JSON.stringify([...users, user]));
    }
};

export const updateUser = async (updatedUser: User): Promise<void> => {
    console.log('[UserStore] updateUser called:', { id: updatedUser.id, name: updatedUser.name, role: updatedUser.role });
    await save(COLLECTION, updatedUser);
    console.log('[UserStore] Data saved to collection:', COLLECTION);
    const users = getUsersSync();
    const newUsers = users.map(u => u.id === updatedUser.id ? updatedUser : u);
    localStorage.setItem('edu_users', JSON.stringify(newUsers));
};

export const deleteUser = async (id: string): Promise<void> => {
    await remove(COLLECTION, id);
    const users = getUsersSync();
    const newUsers = users.filter(u => u.id !== id);
    localStorage.setItem('edu_users', JSON.stringify(newUsers));
};

export const bulkDeleteUsers = async (ids: string[]): Promise<void> => {
    await removeAll(COLLECTION, ids);
    const users = getUsersSync();
    const newUsers = users.filter(u => !ids.includes(u.id));
    localStorage.setItem('edu_users', JSON.stringify(newUsers));
};

export const bulkUpdateUserStatus = async (ids: string[], status: 'Active' | 'Inactive' | 'Suspended'): Promise<void> => {
    const users = getUsersSync();
    const newUsers = users.map(u => ids.includes(u.id) ? { ...u, status } : u);
    await saveAll(COLLECTION, newUsers.filter(u => ids.includes(u.id)));
    localStorage.setItem('edu_users', JSON.stringify(newUsers));
};

export const addChildToParent = async (parentId: string, childUser: User): Promise<void> => {
    // 1. Add child user to users collection
    await addUser(childUser);

    // 2. Fetch latest parent data
    const parent = await getUserById(parentId);
    if (parent) {
        const currentChildren = parent.children || [];
        // Ensure uniqueness
        if (!currentChildren.includes(childUser.id)) {
            const updatedChildren = [...currentChildren, childUser.id];
            const updatedParent = { ...parent, children: updatedChildren };

            // 3. Update parent with new children list
            await updateUser(updatedParent);
        }
    }
};

/**
 * Get a single user by ID from Firebase
 */
export const getUserById = async (id: string): Promise<User | null> => {
    return await getById<User>(COLLECTION, id);
};

/**
 * Get a user by email from Firebase
 */
export const getUserByEmail = async (email: string): Promise<User | null> => {
    const users = await getUsers();
    return users.find(u => u.email === email) || null;
};
