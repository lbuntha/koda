import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut as firebaseSignOut,
    User as FirebaseUser,
    updateProfile
} from 'firebase/auth';
import { auth } from '@lib/config';
import { User, Role } from '@types';
import { addUser, getUsers, updateUser } from '@stores';

// Define the Login Credentials type
export interface LoginCredentials {
    email: string;
    password: string;
}

// Define the Registration Data type
export interface RegisterData {
    email: string;
    password: string;
    fullName: string;
    role: Role;
}

export const loginUser = async ({ email, password }: LoginCredentials): Promise<FirebaseUser> => {
    if (!auth) throw new Error("Authentication service is not configured.");

    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const firebaseUser = userCredential.user;

        // Check user status in our app store
        const allUsers = await getUsers();
        const appUser = allUsers.find(u => u.id === firebaseUser.uid || u.email === firebaseUser.email);

        if (appUser) {
            // Check if user is active
            if (appUser.status === 'Inactive') {
                // Sign out the user since they shouldn't be logged in
                await firebaseSignOut(auth);
                throw new Error('Your account is currently inactive. Please contact your administrator to reactivate your account.');
            }

            if (appUser.status === 'Suspended') {
                // Sign out the user since they shouldn't be logged in
                await firebaseSignOut(auth);
                throw new Error('Your account has been suspended. Please contact support for assistance.');
            }

            // Update last login timestamp
            const updatedUser = { ...appUser, lastLogin: new Date().toISOString() };
            await updateUser(updatedUser);
        }

        return firebaseUser;
    } catch (error: any) {
        console.error("Login error:", error);

        // If it's already a custom error message (our status errors), re-throw as-is
        if (error.message && !error.code) {
            throw error;
        }

        // Otherwise, it's a Firebase error - convert to user-friendly message
        throw new Error(getErrorMessage(error.code));
    }
};

export const registerUser = async ({ email, password, fullName, role }: RegisterData): Promise<User> => {
    if (!auth) throw new Error("Authentication service is not configured.");

    try {
        // 1. Create user in Firebase Auth
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const firebaseUser = userCredential.user;

        // 2. Update display name
        await updateProfile(firebaseUser, { displayName: fullName });

        // 3. Create app user profile with timestamps
        const now = new Date().toISOString();
        const newUser: User = {
            id: firebaseUser.uid,
            email: email,
            name: fullName,
            role: role,
            status: 'Active',
            lastLogin: now,
            createdAt: now,
            // Add default permissions/children based on role if needed
            permissions: role === Role.TEACHER ? ['Curriculum Generator', 'Student Analytics'] : [],
            children: []
        };

        // 4. Save to Firestore/Local Store via userStore
        await addUser(newUser);

        return newUser;
    } catch (error: any) {
        throw new Error(getErrorMessage(error.code));
    }
};

export const logoutUser = async (): Promise<void> => {
    if (!auth) return;
    await firebaseSignOut(auth);
};

// Helper to map Firebase error codes to user-friendly messages
const getErrorMessage = (errorCode: string): string => {
    switch (errorCode) {
        case 'auth/invalid-email':
            return 'Invalid email address format.';
        case 'auth/user-disabled':
            return 'This user account has been disabled.';
        case 'auth/user-not-found':
            return 'No account found with this email.';
        case 'auth/wrong-password':
            return 'Incorrect password.';
        case 'auth/email-already-in-use':
            return 'An account already exists with this email.';
        case 'auth/weak-password':
            return 'Password should be at least 6 characters.';
        case 'auth/operation-not-allowed':
            return 'Email/password accounts are not enabled in Firebase Console.';
        default:
            return 'An unexpected authentication error occurred.';
    }
};
