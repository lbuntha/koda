import { Skill, Difficulty } from '@types';

export const simpleAdditionTemplate: Skill = {
    id: 'tmpl-2',
    grade: 'Grade 1',
    subject: 'Math',
    section: 'B. Addition',
    skillName: 'Simple Addition (Choice)',
    example: 'What is 2 + 2?',
    questionType: 'Multiple Choice',
    difficulty: Difficulty.EASY,
    moderationStatus: 'APPROVED',
    customLayoutId: 'default',
    tags: ['Arithmetic', 'Logic', 'Operations'],
    questionBank: [
        { questionText: 'What is 2 + 3?', options: ['4', '5', '6', '7'], correctAnswer: '5', explanation: 'If you have 2 and add 3 more, you get 5.' },
        { questionText: 'What is 5 + 5?', options: ['8', '9', '10', '11'], correctAnswer: '10', explanation: '5 plus 5 equals 10.' },
        { questionText: 'What is 1 + 0?', options: ['0', '1', '2', '10'], correctAnswer: '1', explanation: 'Adding zero changes nothing.' },
        { questionText: 'Sum of 4 + 4?', options: ['6', '7', '8', '9'], correctAnswer: '8', explanation: 'Double 4 is 8.' }
    ]
};
