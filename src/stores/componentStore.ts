
import { QuestionTypeDef, REGISTERED_QUESTION_TYPES } from '@services/questionTypeRegistry';
import { getAll, save, remove } from '@lib/firestore';

const COLLECTION = 'component_definitions';

// In-memory cache
let componentsCache: QuestionTypeDef[] = [];
let isLoaded = false;

/**
 * Get all available components (System Defaults + Custom)
 */
export const getAllComponents = async (): Promise<QuestionTypeDef[]> => {
    if (isLoaded && componentsCache.length > 0) return componentsCache;

    try {
        // Fetch custom components from DB
        const customComponents = await getAll<QuestionTypeDef>(COLLECTION) || [];

        // Merge with system defaults
        // If ID conflicts, custom overrides default (allows patching system types)
        const systemIds = new Set(REGISTERED_QUESTION_TYPES.map(c => c.id));
        const merged = [...REGISTERED_QUESTION_TYPES];

        customComponents.forEach(custom => {
            if (systemIds.has(custom.id)) {
                // Find and replace
                const index = merged.findIndex(c => c.id === custom.id);
                if (index !== -1) merged[index] = custom;
            } else {
                // Append new
                merged.push(custom);
            }
        });

        componentsCache = merged;
        isLoaded = true;
        return merged;
    } catch (error) {
        console.error("Failed to load components:", error);
        // Fallback to system defaults
        return REGISTERED_QUESTION_TYPES;
    }
};

/**
 * Get a specific component definition by ID
 */
export const getComponentDef = async (id: string): Promise<QuestionTypeDef | undefined> => {
    const all = await getAllComponents();
    return all.find(c => c.id === id);
};

/**
 * Save a component definition (Create or Update)
 */
export const saveComponentDef = async (def: QuestionTypeDef): Promise<void> => {
    await save(COLLECTION, def);
    // Invalidate cache
    isLoaded = false;
    await getAllComponents(); // Reload immediately to keep cache fresh
};

/**
 * Delete a custom component
 * Note: Cannot delete system defaults, only custom ones.
 */
export const deleteComponentDef = async (id: string): Promise<void> => {
    const isSystem = REGISTERED_QUESTION_TYPES.some(c => c.id === id);
    if (isSystem) {
        throw new Error("Cannot delete a system default component.");
    }
    await remove(COLLECTION, id);
    isLoaded = false;
    await getAllComponents();
};
