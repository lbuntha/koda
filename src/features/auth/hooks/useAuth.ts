import { useState, useEffect } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth } from '@lib/config';
import { User, Role } from '@types';
import { getUsers } from '@stores';

interface AuthState {
    currentUser: User | null;
    loading: boolean;
    isAuthenticated: boolean;
}

export const useAuth = () => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        if (!auth) {
            setLoading(false);
            return;
        }

        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
            if (firebaseUser) {
                // User is signed in, fetch their profile from our store
                try {
                    // Try to find the user in the store with more retries and longer delays
                    // This gives registerUser enough time to complete saving
                    let appUser = await findUserWithRetry(firebaseUser, 5, 500);

                    if (appUser) {
                        // Ensure name is synced with Firebase displayName if it was updated
                        if (firebaseUser.displayName && appUser.name !== firebaseUser.displayName) {
                            appUser = { ...appUser, name: firebaseUser.displayName };
                        }
                        setUser(appUser);
                    } else {
                        // User exists in Firebase but not in our store
                        // This can happen during signup race condition
                        // DON'T auto-create - use temp session object only
                        const tempUser: User = {
                            id: firebaseUser.uid,
                            email: firebaseUser.email || '',
                            name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
                            role: Role.NONE,
                            status: 'Active',
                            lastLogin: 'Just now'
                        };
                        // Note: This is NOT saved to store - just for session
                        setUser(tempUser);
                    }
                } catch (err) {
                    console.error("Failed to fetch user profile", err);
                    // Last resort fallback
                    const fallbackUser: User = {
                        id: firebaseUser.uid,
                        email: firebaseUser.email || '',
                        name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
                        role: Role.NONE,
                        status: 'Active',
                        lastLogin: 'Just now'
                    };
                    setUser(fallbackUser);
                }
            } else {
                // User is signed out
                setUser(null);
            }
            setLoading(false);
        });

        // Listen for local profile updates
        const handleProfileUpdate = async () => {
            if (auth.currentUser) {
                const updatedUser = await getUsers().then(users =>
                    users.find(u => u.id === auth.currentUser?.uid)
                );
                if (updatedUser) {
                    setUser(updatedUser);
                }
            }
        };

        window.addEventListener('user-profile-updated', handleProfileUpdate);

        return () => {
            unsubscribe();
            window.removeEventListener('user-profile-updated', handleProfileUpdate);
        };
    }, []);

    return {
        user,
        loading,
        isAuthenticated: !!user
    };
};

// Helper function to retry finding user in store (handles async timing issues)
const findUserWithRetry = async (
    firebaseUser: FirebaseUser,
    maxRetries: number,
    delayMs: number
): Promise<User | null> => {
    for (let attempt = 0; attempt < maxRetries; attempt++) {
        const allUsers = await getUsers();
        const appUser = allUsers.find(u => u.id === firebaseUser.uid || u.email === firebaseUser.email);

        if (appUser) {
            return appUser;
        }

        // Wait before retrying (only if not the last attempt)
        if (attempt < maxRetries - 1) {
            await new Promise(resolve => setTimeout(resolve, delayMs));
        }
    }

    return null;
};

