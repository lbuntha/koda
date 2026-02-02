import { Role } from '@types';
import { getUsers } from './userStore';
import { getStudentResultsSync, getSkillMasteryStatus } from './studentStore';
import { getStoredSkillsSync } from './skillStore';
import { getSystemConfig, DEFAULT_SYSTEM_CONFIG } from './settingsStore';

export interface LeaderboardEntry {
    userId: string;
    name: string;
    displayName?: string;
    avatar?: string;
    masteredCount: number;      // Primary ranking metric
    progressPercent?: number;   // For per-skill view
    rank: number;
}

/**
 * Get leaderboard for a specific grade, ranked by skills mastered
 * @param grade - The grade to filter students by
 * @param skillId - Optional skill ID to show mastery progress for that skill
 * @returns Promise<LeaderboardEntry[]> - Sorted by mastered count (or progress %) descending
 */
export const getLeaderboard = async (
    grade: string,
    skillId?: string
): Promise<LeaderboardEntry[]> => {
    // Get all users
    const allUsers = await getUsers();

    // Filter to students in the specified grade
    const students = allUsers.filter(user =>
        user.role === Role.STUDENT &&
        (user.grades?.includes(grade) || (user as any).grade === grade)
    );

    // Get all skills and config for mastery calculation
    const allSkills = getStoredSkillsSync();
    const config = await getSystemConfig() || DEFAULT_SYSTEM_CONFIG;

    // Calculate mastery for each student
    const entries: Omit<LeaderboardEntry, 'rank'>[] = students.map(student => {
        if (skillId) {
            // Per-skill view: show progress % for this specific skill
            const skill = allSkills.find(s => s.id === skillId);
            if (!skill) {
                return {
                    userId: student.id,
                    name: student.name,
                    displayName: student.displayName,
                    avatar: student.avatar,
                    masteredCount: 0,
                    progressPercent: 0
                };
            }

            const status = getSkillMasteryStatus(skill, student.id, config);
            return {
                userId: student.id,
                name: student.name,
                displayName: student.displayName,
                avatar: student.avatar,
                masteredCount: status.isMastered ? 1 : 0,
                progressPercent: status.progress
            };
        } else {
            // All skills view: count mastered skills
            let masteredCount = 0;

            allSkills.forEach(skill => {
                const status = getSkillMasteryStatus(skill, student.id, config);
                if (status.isMastered) {
                    masteredCount++;
                }
            });

            return {
                userId: student.id,
                name: student.name,
                displayName: student.displayName,
                avatar: student.avatar,
                masteredCount
            };
        }
    });

    // Sort: by progressPercent if per-skill, otherwise by masteredCount
    if (skillId) {
        entries.sort((a, b) => (b.progressPercent || 0) - (a.progressPercent || 0));
    } else {
        entries.sort((a, b) => b.masteredCount - a.masteredCount);
    }

    // Add rank (handle ties by giving same rank)
    const rankedEntries: LeaderboardEntry[] = entries.map((entry, index) => ({
        ...entry,
        rank: index + 1
    }));

    return rankedEntries;
};

/**
 * Get a student's rank in the leaderboard
 */
export const getStudentRank = async (
    studentId: string,
    grade: string,
    skillId?: string
): Promise<{ rank: number; total: number; masteredCount: number } | null> => {
    const leaderboard = await getLeaderboard(grade, skillId);
    const entry = leaderboard.find(e => e.userId === studentId);

    if (!entry) return null;

    return {
        rank: entry.rank,
        total: leaderboard.length,
        masteredCount: entry.masteredCount
    };
};
