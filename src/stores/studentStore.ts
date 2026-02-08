import { StudentResult, StudentGoal, Skill } from '@types';
import { getAll, save, remove, saveAll } from '@lib/index';
import { getSkillRank, getMasteryThreshold } from './settingsStore';

const RESULTS_COLLECTION = 'results' as const;
const GOALS_COLLECTION = 'goals' as const;

// --- Student Results ---

export const getStudentResults = async (): Promise<StudentResult[]> => {
    return await getAll<StudentResult>(RESULTS_COLLECTION);
};

export const getStudentResultsByStudentId = async (studentId: string): Promise<StudentResult[]> => {
    // Dynamically import queryDocs to avoid circular dependency issues if any,
    // though usually safe to import from lib.
    // Checking previous userStore example, dynamic import was used for safety/optimization.
    // Here we can try to use the imported queryDocs if we add it to imports, 
    // but looking at imports: import { getAll, save, remove, saveAll } from '@lib/index';
    // queryDocs is available in @lib/index.

    // Let's rely on dynamic import or update imports. 
    // Updating imports is cleaner.
    const { queryDocs } = await import('@lib/index');
    const { where } = await import('firebase/firestore');

    try {
        const results = await queryDocs<StudentResult>(RESULTS_COLLECTION, [
            where('studentId', '==', studentId)
        ]);
        return results;
    } catch (e) {
        console.error("Error fetching student results", e);
        // Fallback to local filter if query fails (e.g. offline/local storage)
        const all = await getStudentResults();
        return all.filter(r => r.studentId === studentId);
    }
};

export const getStudentResultsSync = (): StudentResult[] => {
    const stored = localStorage.getItem('edu_results');
    return stored ? JSON.parse(stored) : [];
};

import { getUsers, updateUser } from './userStore';
// getStoredSkillsSync is imported later, avoiding duplicate


export const saveStudentResult = async (result: StudentResult): Promise<void> => {
    // 1. Save Result (Existing Logic)
    await save(RESULTS_COLLECTION, result);
    const current = getStudentResultsSync();
    localStorage.setItem('edu_results', JSON.stringify([...current, result]));

    // 2. Aggregate Stats on User Object (Optimization)
    const allUsers = await getUsers();
    const student = allUsers.find(u => u.id === result.studentId);

    if (student) {
        const now = Date.now();
        const today = new Date().setHours(0, 0, 0, 0);
        const yesterday = today - 86400000;

        const stats = student.stats || {
            totalQuestions: 0,
            correctQuestions: 0,
            skillsMastered: 0,
            streak: 0,
            lastActivityDate: 0
        };

        // Update Questions
        stats.totalQuestions++;
        if (result.score > 0) {
            stats.correctQuestions++;
        }

        // Update Streak
        const lastActivityDay = new Date(stats.lastActivityDate).setHours(0, 0, 0, 0);

        if (lastActivityDay === today) {
            // Already active today, streak keeps same
        } else if (lastActivityDay === yesterday) {
            // Consecutive day
            stats.streak++;
        } else {
            // Broken streak or first time
            stats.streak = 1;
        }
        stats.lastActivityDate = now;

        // Update Mastery Count (Re-check all skills or just this one? 
        // Ideally just check total mastery count from helper)
        // Since we are inside store, we can use the helper but need to be careful with imports.
        // Let's rely on a fresh calculation of "Mastered Skills" count.
        const skills = getStoredSkillsSync();
        // We need to pass the *updated* results list to get accurate status
        // But getStudentResultsSync() already returns updated list because we pushed to LS above.
        let masteredCount = 0;
        skills.forEach(skill => {
            // We use the helper defined below in this file
            const status = getSkillMasteryStatus(skill, student.id);
            if (status.isMastered) masteredCount++;
        });
        stats.skillsMastered = masteredCount;

        // Save updated student
        await updateUser({ ...student, stats });
    }
};

export const getStudentStats = (studentId: string, preLoadedResults?: StudentResult[]) => {
    const results = (preLoadedResults || getStudentResultsSync()).filter(r => r.studentId === studentId);

    // 1. Total XP
    const totalXP = results.reduce((acc, curr) => acc + (curr.score || 0), 0);

    // 2. Daily Streak Calculation
    // Extract unique dates of activity
    const activityDates = Array.from(new Set(results.map(r => new Date(r.timestamp).toDateString())));

    // Convert to timestamps for sorting
    const sortedDates = activityDates.map(d => new Date(d).getTime()).sort((a, b) => b - a); // Descending (Newest first)

    let streak = 0;
    const today = new Date().setHours(0, 0, 0, 0);
    const yesterday = today - 86400000;

    // Check if active today
    const activeToday = sortedDates.some(d => d === today);
    const activeYesterday = sortedDates.some(d => d === yesterday);

    if (sortedDates.length > 0) {
        // If active today, start counting. If not today but active yesterday, allow streak to continue (streak valid for today).
        // If neither, streak is broken (0).
        if (activeToday || activeYesterday) {
            streak = 1;
            // Iterate backwards
            // Start check from "Yesterday" relative to the latest active date we found being valid
            let currentCheck = activeToday ? yesterday : (yesterday - 86400000);

            for (let i = 1; i < sortedDates.length; i++) { // Skip the first one we established
                if (sortedDates.some(d => d === currentCheck)) {
                    streak++;
                    currentCheck -= 86400000;
                } else {
                    break;
                }
            }
        }
    }

    return { totalXP, streak };
};

export const resetStudentSkillProgress = async (studentId: string, skillId: string): Promise<void> => {
    const current = getStudentResultsSync();

    // 1. Identify IDs to delete from Firestore
    const toDelete = current.filter(r => r.studentId === studentId && r.skillId === skillId);

    // 2. Delete from Firestore (Batch via Promise.all for now, or use batch delete if available in lib)
    await Promise.all(toDelete.map(r => remove(RESULTS_COLLECTION, r.id)));

    // 3. Update Local Storage
    const updated = current.filter(r => !(r.studentId === studentId && r.skillId === skillId));
    localStorage.setItem('edu_results', JSON.stringify(updated));
};

import { DEFAULT_SYSTEM_CONFIG, DEFAULT_SKILL_RANKS } from './settingsStore';
import { getStoredSkillsSync } from './skillStore';

// ... (existing imports need to change slightly to avoid circular dependency if settingsStore imports types that import this)
// Ideally we pass config IN, but for now we'll fetch defaults if needed.

export const getSkillMasteryStatus = (
    skill: Skill,
    studentId?: string,
    systemConfig = DEFAULT_SYSTEM_CONFIG,
    ranks = DEFAULT_SKILL_RANKS,
    preLoadedResults?: StudentResult[]
) => {
    const results = preLoadedResults || getStudentResultsSync();
    let skillResults = results.filter(r => r.skillId === skill.id);

    if (studentId) {
        skillResults = skillResults.filter(r => r.studentId === studentId);
    }

    const totalScore = skillResults.reduce((acc, curr) => acc + curr.score, 0);

    // 2. Determine Requirements (Use passed skill object)
    const requirements = skill.masteryRequirements || systemConfig.defaultMasteryRequirements;

    let progress = 0;
    let progressLabel = "";
    let isMastered = false;

    // Sort ranks to ensure we check correctly
    const sortedRanks = [...ranks].sort((a, b) => a.threshold - b.threshold);
    const masterRank = sortedRanks[sortedRanks.length - 1];
    const masterThreshold = masterRank ? masterRank.threshold : 1000;

    let currentEquivalentXP = 0;

    if (requirements.type === 'QUESTIONS') {
        const correctResults = skillResults.filter(r => r.score > 0);
        let correctCount = 0;
        const hasIds = correctResults.some(r => !!r.questionId);
        if (hasIds) {
            const uniqueIds = new Set(correctResults.map(r => r.questionId || `legacy-${r.id}`));
            correctCount = uniqueIds.size;
        } else {
            correctCount = correctResults.length;
        }

        // Determine Target (Fixed vs Percentage)
        let target = requirements.value;
        if (requirements.isPercentage && skill.questionBank && skill.questionBank.length > 0) {
            target = Math.ceil((requirements.value / 100) * skill.questionBank.length);
            // Safety: Ensure target is at least 1 if bank exists
            target = Math.max(1, target);
        }

        // Calculate Progress %
        progress = Math.min(100, (correctCount / target) * 100);
        progressLabel = `${correctCount} / ${target} Questions`;

        // Calculate Equivalent XP to map to Ranks
        currentEquivalentXP = (progress / 100) * masterThreshold;

        // Final Mastery Check
        isMastered = correctCount >= target;

        if (requirements.minAccuracy) {
            const totalAttempts = skillResults.length;
            if (totalAttempts > 0) {
                const rawCorrect = skillResults.filter(r => r.score > 0).length;
                const accuracy = (rawCorrect / totalAttempts) * 100;

                if (accuracy < requirements.minAccuracy) {
                    isMastered = false;
                }
            }
        }

    } else {
        // SCORE Based (Legacy)
        const targetScore = requirements.value;
        progress = Math.min(100, (totalScore / targetScore) * 100);
        progressLabel = `${totalScore} / ${targetScore} XP`;

        currentEquivalentXP = totalScore;

        isMastered = totalScore >= targetScore;
    }

    // Determine Rank
    const descendingRanks = [...sortedRanks].sort((a, b) => b.threshold - a.threshold);
    let currentRank = descendingRanks.find(r => currentEquivalentXP >= r.threshold) || sortedRanks[0];

    // Accuracy Penalty: Prevent reaching highest rank if accuracy is low
    if (requirements.type === 'QUESTIONS' && requirements.minAccuracy) {
        const totalAttempts = skillResults.length;
        if (totalAttempts > 0) {
            const rawCorrect = skillResults.filter(r => r.score > 0).length;
            const accuracy = (rawCorrect / totalAttempts) * 100;
            if (accuracy < requirements.minAccuracy && currentRank.threshold >= masterThreshold) {
                // Downgrade to one rank below Master
                currentRank = descendingRanks.length > 1 ? descendingRanks[1] : descendingRanks[0];
            }
        }
    }

    // Collect IDs of unique correct questions for smart selection
    const completedQuestionIds: string[] = [];
    if (requirements.type === 'QUESTIONS') {
        const correctResults = skillResults.filter(r => r.score > 0);
        const uniqueIds = new Set(correctResults.map(r => r.questionId || `legacy-${r.id}`));
        completedQuestionIds.push(...Array.from(uniqueIds));
    }

    return {
        totalScore,
        isMastered,
        progress,
        progressLabel,
        rankIndex: sortedRanks.findIndex(r => r.name === currentRank.name),
        rank: currentRank,
        completedQuestionIds
    };
};

// --- Student Goals ---

export const getStudentGoals = async (): Promise<StudentGoal[]> => {
    return await getAll<StudentGoal & { id: string }>(GOALS_COLLECTION);
};

export const getStudentGoalsSync = (): StudentGoal[] => {
    const stored = localStorage.getItem('edu_goals');
    return stored ? JSON.parse(stored) : [];
};

export const addStudentGoal = async (goal: StudentGoal): Promise<void> => {
    const current = getStudentGoalsSync();
    // Prevent duplicates
    if (current.some(g => g.studentId === goal.studentId && g.skillId === goal.skillId)) return;

    const goalWithId = { ...goal, id: `${goal.studentId}_${goal.skillId}` };
    await save(GOALS_COLLECTION, goalWithId);
    localStorage.setItem('edu_goals', JSON.stringify([...current, goal]));
};

export const removeStudentGoal = async (studentId: string, skillId: string): Promise<void> => {
    await remove(GOALS_COLLECTION, `${studentId}_${skillId}`);
    const current = getStudentGoalsSync();
    const updated = current.filter(g => !(g.studentId === studentId && g.skillId === skillId));
    localStorage.setItem('edu_goals', JSON.stringify(updated));
};
