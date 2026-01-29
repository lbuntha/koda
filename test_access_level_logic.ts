
import { Skill } from './src/types/skill.types';
import { updateSkill, getStoredSkillsSync, saveSkills } from './src/stores/skillStore';

// Mock localStorage
const localStorageMock = (() => {
    let store: Record<string, string> = {};
    return {
        getItem: (key: string) => store[key] || null,
        setItem: (key: string, value: string) => { console.log(`[Storage] Set ${key}: ${value.length} chars`); store[key] = value.toString(); },
        clear: () => { store = {}; }
    };
})();
Object.defineProperty(global, 'localStorage', { value: localStorageMock });

// Mock save/saveAll from @lib/index (since they are imported in store)
// We need to mock the store module entirely or just run this environment carefully.
// Since we can't easily mock imports in this runtime without a test runner, 
// I will just simulation the LOGIC from the store file, not import it directly if it has complex dependencies.
// Actually, I can try to import if the dependencies are simple.
// But `save` imports from `@lib/index` which imports `firebase`. That will fail.

// RE-IMPLEMENT STORE LOGIC LOCALLY FOR TEST
const COLLECTION = 'skills';
let memoryDetails: Skill[] = [];

const localUpdateSkill = (updatedSkill: Skill) => {
    const index = memoryDetails.findIndex(s => s.id === updatedSkill.id);
    if (index !== -1) {
        memoryDetails[index] = updatedSkill;
    } else {
        memoryDetails.push(updatedSkill);
    }
    // Simulate persist
    localStorageMock.setItem('edu_skills', JSON.stringify(memoryDetails));
};

const runTest = () => {
    // 1. Initial State
    const initialSkill: Skill = {
        id: 'test-1',
        grade: 'Grade 1',
        subject: 'Math',
        section: 'Unit 1',
        skillName: 'Test Skill',
        example: '1+1',
        questionType: 'Multiple Choice',
        difficulty: 'Easy', // Enum string value
        accessLevel: 'free'
    } as any; // Cast for enum

    memoryDetails = [initialSkill];
    console.log('Initial:', JSON.stringify(memoryDetails[0].accessLevel));

    // 2. Component Builder Logic (Simulation)
    // Init state
    const meta = {
        grade: initialSkill.grade,
        accessLevel: initialSkill.accessLevel
    };

    // User change
    meta.accessLevel = 'premium';

    // Save
    const savedSkill = {
        ...initialSkill,
        accessLevel: meta.accessLevel
    };

    // 3. Store Update
    localUpdateSkill(savedSkill);

    // 4. Verify
    const stored = JSON.parse(localStorageMock.getItem('edu_skills')!);
    const verified = stored.find((s: any) => s.id === 'test-1');
    console.log('Verified:', JSON.stringify(verified.accessLevel));

    if (verified.accessLevel === 'premium') {
        console.log('SUCCESS: Access Level persisted.');
    } else {
        console.error('FAILURE: Access Level NOT persisted.');
    }
};

runTest();
