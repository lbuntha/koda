import { Skill, Difficulty } from '@types';
import { getAll, save, saveAll, remove } from '@lib/index';

const COLLECTION = 'skills' as const;

const INITIAL_SKILLS: Skill[] = [];

export const getStoredSkills = async (): Promise<Skill[]> => {
    const skills = await getAll<Skill>(COLLECTION);
    // We don't need to backfill anymore as the data is migrated.
    // If we wanted to be safe, we could keep a check, but for code cleanup we'll trust the migration is done.
    return skills;

    if (skills.length === 0) {
        await saveAll(COLLECTION, INITIAL_SKILLS);
        return INITIAL_SKILLS;
    }
    // The original return hydratedSkills; is now unreachable.
    // The original hydration logic is removed.
};

// Sync version for backwards compatibility
export const getStoredSkillsSync = (): Skill[] => {
    const stored = localStorage.getItem('edu_skills');
    return stored ? JSON.parse(stored) : INITIAL_SKILLS;
};

export const saveSkills = async (skills: Skill[]): Promise<void> => {
    await saveAll(COLLECTION, skills);
    // Also update localStorage for sync access
    localStorage.setItem('edu_skills', JSON.stringify(skills));
};

export const addSkills = async (newSkills: Skill[]): Promise<void> => {
    const current = await getStoredSkills();
    const pendingSkills = newSkills.map(s => ({
        ...s,
        moderationStatus: 'PENDING' as const,
        createdAt: new Date().toISOString()
    }));
    await saveSkills([...current, ...pendingSkills]);
};

export const updateSkill = async (updatedSkill: Skill): Promise<void> => {
    await save(COLLECTION, updatedSkill);
    // Also update localStorage
    const current = getStoredSkillsSync();
    const index = current.findIndex(s => s.id === updatedSkill.id);
    if (index !== -1) {
        current[index] = updatedSkill;
        localStorage.setItem('edu_skills', JSON.stringify(current));
    }
};

export const publishSkill = async (id: string, publisherName?: string): Promise<void> => {
    const current = await getStoredSkills();
    const skill = current.find(s => s.id === id);
    if (skill) {
        await updateSkill({
            ...skill,
            moderationStatus: 'APPROVED',
            publishedAt: new Date().toISOString(),
            publishedBy: publisherName || 'Admin'
        });
    }
};

export const deleteSkill = async (id: string): Promise<void> => {
    await remove(COLLECTION, id);
    const current = getStoredSkillsSync();
    const updated = current.filter(s => s.id !== id);
    localStorage.setItem('edu_skills', JSON.stringify(updated));
};
