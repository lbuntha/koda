import {
    collection,
    doc,
    getDocs,
    getDoc,
    setDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    limit,
    DocumentData,
    QueryConstraint,
    writeBatch,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from './config';

// Generic Firestore operations with localStorage fallback

type CollectionName = 'skills' | 'users' | 'results' | 'rewards' | 'goals' | 'settings' | 'menuItems' | 'menuPermissions' | 'token_logs';

const STORAGE_PREFIX = 'edu_';

// Fallback to localStorage when Firebase is not configured
const getLocalData = <T>(collectionName: CollectionName): T[] => {
    const key = `${STORAGE_PREFIX}${collectionName}`;
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : [];
};

const setLocalData = <T>(collectionName: CollectionName, data: T[]): void => {
    const key = `${STORAGE_PREFIX}${collectionName}`;
    localStorage.setItem(key, JSON.stringify(data));
};

// Get all documents from a collection (Merging Remote + Local for robustness)
export const getAll = async <T extends { id: string }>(
    collectionName: CollectionName
): Promise<T[]> => {
    const localData = getLocalData<T>(collectionName);

    if (!isFirebaseConfigured() || !db) {
        return localData;
    }

    try {
        const snapshot = await getDocs(collection(db, collectionName));
        const remoteData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as T));

        // Merge strategy: Remote wins if conflict, but include Local-only items (e.g. failed saves)
        const remoteIds = new Set(remoteData.map(d => d.id));
        const missingFromRemote = localData.filter(l => !remoteIds.has(l.id));

        return [...remoteData, ...missingFromRemote];
    } catch (error) {
        if ((error as any).code === 'permission-denied') {
            console.warn(`[Firestore] Permission denied for ${collectionName}. Using local demo data.`);
        } else {
            console.error(`Error fetching ${collectionName}:`, error);
        }
        return localData;
    }
};

// Get a single document by ID
export const getById = async <T extends { id: string }>(
    collectionName: CollectionName,
    id: string
): Promise<T | null> => {
    if (!isFirebaseConfigured() || !db) {
        const local = getLocalData<T>(collectionName);
        return local.find(item => item.id === id) || null;
    }

    try {
        const docRef = doc(db, collectionName, id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() } as T;
        }
        return null;
    } catch (error) {
        if ((error as any).code === 'permission-denied') {
            console.warn(`[Firestore] Permission denied for ${collectionName}/${id}. Using local data.`);
        } else {
            console.error(`Error fetching ${collectionName}/${id}:`, error);
        }
        return null;
    }
};

// Create or update a document
export const save = async <T extends { id: string }>(
    collectionName: CollectionName,
    data: T
): Promise<void> => {
    if (!isFirebaseConfigured() || !db) {
        const local = getLocalData<T>(collectionName);
        const index = local.findIndex(item => item.id === data.id);
        if (index >= 0) {
            local[index] = data;
        } else {
            local.push(data);
        }
        setLocalData(collectionName, local);
        return;
    }

    try {
        const docRef = doc(db, collectionName, data.id);
        await setDoc(docRef, data, { merge: true });
    } catch (error) {
        console.error(`Error saving to ${collectionName} (falling back to local):`, error);
        // Fallback to local
        const local = getLocalData<T>(collectionName);
        const index = local.findIndex(item => item.id === data.id);
        if (index >= 0) {
            local[index] = data;
        } else {
            local.push(data);
        }
        setLocalData(collectionName, local);
    }
};

// Save multiple documents
export const saveAll = async <T extends { id: string }>(
    collectionName: CollectionName,
    items: T[]
): Promise<void> => {
    if (!isFirebaseConfigured() || !db) {
        setLocalData(collectionName, items);
        return;
    }

    try {
        const batch = writeBatch(db);
        items.forEach(item => {
            const docRef = doc(db, collectionName, item.id);
            batch.set(docRef, item);
        });
        await batch.commit();
    } catch (error) {
        console.error(`Error batch saving to ${collectionName} (falling back to local):`, error);
        // Fallback to local
        setLocalData(collectionName, items);
    }
};

// Delete a document
export const remove = async (
    collectionName: CollectionName,
    id: string
): Promise<void> => {
    if (!isFirebaseConfigured() || !db) {
        const local = getLocalData<{ id: string }>(collectionName);
        setLocalData(collectionName, local.filter(item => item.id !== id));
        return;
    }

    try {
        await deleteDoc(doc(db, collectionName, id));
    } catch (error) {
        console.error(`Error deleting from ${collectionName} (falling back to local):`, error);
        // Fallback to local
        const local = getLocalData<{ id: string }>(collectionName);
        setLocalData(collectionName, local.filter(item => item.id !== id));
    }
};

// Delete multiple documents
export const removeAll = async (
    collectionName: CollectionName,
    ids: string[]
): Promise<void> => {
    if (!isFirebaseConfigured() || !db) {
        const local = getLocalData<{ id: string }>(collectionName);
        setLocalData(collectionName, local.filter(item => !ids.includes(item.id)));
        return;
    }

    try {
        const batch = writeBatch(db);
        ids.forEach(id => {
            batch.delete(doc(db, collectionName, id));
        });
        await batch.commit();
    } catch (error) {
        console.error(`Error batch deleting from ${collectionName} (falling back to local):`, error);
        // Fallback to local
        const local = getLocalData<{ id: string }>(collectionName);
        setLocalData(collectionName, local.filter(item => !ids.includes(item.id)));
    }
};

// Query documents with filters
export const queryDocs = async <T extends { id: string }>(
    collectionName: CollectionName,
    constraints: QueryConstraint[]
): Promise<T[]> => {
    if (!isFirebaseConfigured() || !db) {
        // For localStorage, just return all (filtering would need custom impl)
        return getLocalData<T>(collectionName);
    }

    try {
        const q = query(collection(db, collectionName), ...constraints);
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as T));
    } catch (error) {
        console.error(`Error querying ${collectionName}:`, error);
        return [];
    }
};

// Clear all data (for reset functionality)
export const clearAll = async (): Promise<void> => {
    const collections: CollectionName[] = ['skills', 'users', 'results', 'rewards', 'goals', 'settings', 'token_logs'];

    collections.forEach(col => {
        localStorage.removeItem(`${STORAGE_PREFIX}${col}`);
    });

    // Also clear old keys for backwards compatibility
    localStorage.removeItem('edu_global_settings');
    localStorage.removeItem('edu_system_config');
    localStorage.removeItem('edu_library');
    localStorage.removeItem('edu_skill_ranks');

    console.log('All local data cleared');
};
