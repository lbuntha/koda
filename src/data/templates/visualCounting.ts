import { Skill, Difficulty } from '@types';

export const visualCountingTemplate: Skill = {
    id: 'tmpl-1',
    grade: 'Kindergarten',
    subject: 'Math',
    section: 'A. Counting',
    skillName: 'Counting to 10 (Interactive)',
    example: 'How many apples are there?',
    questionType: 'Visual Counter',
    difficulty: Difficulty.EASY,
    moderationStatus: 'APPROVED',
    customLayoutId: 'visual-counter', // Uses the custom visual renderer
    tags: ['Foundational', 'Visual', 'Counting', 'Early Math'],
    questionBank: [
        { questionText: 'Count the red dots: 🔴 🔴 🔴', options: ['2', '3', '4', '5'], correctAnswer: '3', explanation: 'There are 3 red dots.' },
        { questionText: 'Count the stars: ⭐ ⭐ ⭐ ⭐ ⭐', options: ['4', '5', '6', '10'], correctAnswer: '5', explanation: 'There are 5 stars.' },
        { questionText: 'Count the squares: 🟦 🟦', options: ['1', '2', '3', '4'], correctAnswer: '2', explanation: 'There are exactly 2 squares.' }
    ]
};
