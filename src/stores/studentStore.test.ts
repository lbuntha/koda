import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getSkillMasteryStatus } from '../studentStore';
import * as skillStore from '../skillStore'; // We will mock this
import { SystemConfig } from '../settingsStore';

// Mock dependencies
vi.mock('../skillStore', () => ({
    getStoredSkillsSync: vi.fn()
}));

// Mock Data
const MOCK_SKILL_ID = 'skill-123';
const MOCK_STUDENT_ID = 'student-1';

// Default System Config for testing
const MOCK_SYSTEM_CONFIG: SystemConfig = {
    grades: [], subjects: [], questionTypes: [], subscriptionTiers: [],
    minQuestionsPerQuiz: 1, maxQuestionsPerQuiz: 10,
    questionsToMasterSkill: 10, // Legacy field
    defaultAiInstruction: '', geminiModel: '',
    tokenUsage: { teacher: 0, student: 0, parent: 0, kid: 0 },
    defaultMasteryRequirements: {
        type: 'QUESTIONS',
        value: 10,
        minAccuracy: 60
    }
};

describe('Mastery Logic (getSkillMasteryStatus)', () => {

    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();

        // Default: No overrides on the skill
        (skillStore.getStoredSkillsSync as any).mockReturnValue([
            { id: MOCK_SKILL_ID, masteryRequirements: undefined }
        ]);
    });

    const setMockResults = (results: any[]) => {
        localStorage.setItem('edu_results', JSON.stringify(results));
    };

    it('should return 0 progress when no results exist', () => {
        setMockResults([]);
        const status = getSkillMasteryStatus(MOCK_SKILL_ID, MOCK_STUDENT_ID, MOCK_SYSTEM_CONFIG);
        expect(status.progress).toBe(0);
        expect(status.isMastered).toBe(false);
    });

    describe('Strategy: QUESTIONS (Default)', () => {
        it('should calculate progress based on correct answers', () => {
            // 5 Correct answers (Target 10) -> 50%
            const results = Array(5).fill(0).map((_, i) => ({
                id: `r-${i}`, studentId: MOCK_STUDENT_ID, skillId: MOCK_SKILL_ID,
                score: 100, // Correct
                timestamp: Date.now()
            }));
            setMockResults(results);

            const status = getSkillMasteryStatus(MOCK_SKILL_ID, MOCK_STUDENT_ID, MOCK_SYSTEM_CONFIG);
            expect(status.progress).toBe(50);
            expect(status.progressLabel).toBe("5 / 10 Questions");
            expect(status.isMastered).toBe(false);
        });

        it('should NOT count wrong answers towards progress', () => {
            // 5 Correct, 5 Wrong
            const correct = Array(5).fill(0).map((_, i) => ({
                id: `c-${i}`, studentId: MOCK_STUDENT_ID, skillId: MOCK_SKILL_ID, score: 100
            }));
            const wrong = Array(5).fill(0).map((_, i) => ({
                id: `w-${i}`, studentId: MOCK_STUDENT_ID, skillId: MOCK_SKILL_ID, score: 0
            }));
            setMockResults([...correct, ...wrong]);

            const status = getSkillMasteryStatus(MOCK_SKILL_ID, MOCK_STUDENT_ID, MOCK_SYSTEM_CONFIG);

            // Still only 5 correct / 10 target -> 50%
            expect(status.progress).toBe(50);
            expect(status.isMastered).toBe(false);
        });

        it('should master skill when target is reached', () => {
            // 10 Correct
            const results = Array(10).fill(0).map((_, i) => ({
                id: `r-${i}`, studentId: MOCK_STUDENT_ID, skillId: MOCK_SKILL_ID, score: 100
            }));
            setMockResults(results);

            const status = getSkillMasteryStatus(MOCK_SKILL_ID, MOCK_STUDENT_ID, MOCK_SYSTEM_CONFIG);
            expect(status.progress).toBe(100);
            expect(status.isMastered).toBe(true);
            expect(status.rankIndex).toBe(4); // Master
        });

        it('should FAIL mastery if Accuracy is below threshold', () => {
            // Config: Min Accuracy 60%
            // Scenario: 10 Correct, 10 Wrong (Total 20) -> Accuracy 50%
            const correct = Array(10).fill(0).map((_, i) => ({
                id: `c-${i}`, studentId: MOCK_STUDENT_ID, skillId: MOCK_SKILL_ID, score: 100
            }));
            const wrong = Array(10).fill(0).map((_, i) => ({
                id: `w-${i}`, studentId: MOCK_STUDENT_ID, skillId: MOCK_SKILL_ID, score: 0
            }));
            setMockResults([...correct, ...wrong]);

            const status = getSkillMasteryStatus(MOCK_SKILL_ID, MOCK_STUDENT_ID, MOCK_SYSTEM_CONFIG);

            expect(status.progress).toBe(100); // Progress is full (enough questions)
            expect(status.isMastered).toBe(false); // But NOT mastered
            expect(status.rankIndex).toBe(3); // Capped at Scholar (3)
        });
    });

    describe('Strategy: SCORE (Override)', () => {
        beforeEach(() => {
            // Override skill to use SCORE
            (skillStore.getStoredSkillsSync as any).mockReturnValue([
                {
                    id: MOCK_SKILL_ID,
                    masteryRequirements: { type: 'SCORE', value: 500 } // Target 500 XP
                }
            ]);
        });

        it('should calculate progress based on total score', () => {
            // 2 results of 100 XP each -> 200 XP
            const results = Array(2).fill(0).map((_, i) => ({
                id: `r-${i}`, studentId: MOCK_STUDENT_ID, skillId: MOCK_SKILL_ID, score: 100
            }));
            setMockResults(results);

            const status = getSkillMasteryStatus(MOCK_SKILL_ID, MOCK_STUDENT_ID, MOCK_SYSTEM_CONFIG);

            // 200 is 40% of 500
            expect(status.progress).toBe(40);
            expect(status.progressLabel).toBe("200 / 500 XP");
            expect(status.isMastered).toBe(false);
        });

        it('should master skill when score target reached', () => {
            // 500 XP total
            const results = [{
                id: 'r-1', studentId: MOCK_STUDENT_ID, skillId: MOCK_SKILL_ID, score: 500
            }];
            setMockResults(results);

            const status = getSkillMasteryStatus(MOCK_SKILL_ID, MOCK_STUDENT_ID, MOCK_SYSTEM_CONFIG);
            expect(status.isMastered).toBe(true);
        });
    });
});
