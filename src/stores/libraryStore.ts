import { Skill, Difficulty } from "@types";

import { visualCountingTemplate } from '@/data/templates/visualCounting';
import { mentalMathOpsTemplate } from '@/data/templates/mentalMathOps';
import { simpleAdditionTemplate } from '@/data/templates/simpleAddition';
import { planetIdentificationTemplate } from '@/data/templates/planetIdentification';

// --- Predefined Component Templates (The Initial Collection) ---
export const PREDEFINED_COMPONENT_TEMPLATES: Skill[] = [
    visualCountingTemplate,
    mentalMathOpsTemplate,
    simpleAdditionTemplate,
    planetIdentificationTemplate
];

// --- Library Management ---

export const getComponentLibrary = (): Skill[] => {
    const stored = localStorage.getItem('edu_library');
    if (stored) return JSON.parse(stored);

    // Initialize with defaults if empty
    localStorage.setItem('edu_library', JSON.stringify(PREDEFINED_COMPONENT_TEMPLATES));
    return PREDEFINED_COMPONENT_TEMPLATES;
};

export const addLibraryComponent = (component: Skill) => {
    const current = getComponentLibrary();
    // Ensure it has a unique ID and is approved
    const newComponent = { ...component, moderationStatus: 'APPROVED' as const };
    localStorage.setItem('edu_library', JSON.stringify([...current, newComponent]));
};

export const updateLibraryComponent = (updatedComponent: Skill) => {
    const current = getComponentLibrary();
    const index = current.findIndex(c => c.id === updatedComponent.id);
    if (index !== -1) {
        const newLibrary = [...current];
        newLibrary[index] = updatedComponent;
        localStorage.setItem('edu_library', JSON.stringify(newLibrary));
    }
};

export const deleteLibraryComponent = (id: string) => {
    const current = getComponentLibrary();
    const updated = current.filter(c => c.id !== id);
    localStorage.setItem('edu_library', JSON.stringify(updated));
};
