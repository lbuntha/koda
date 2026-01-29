import { Skill, Difficulty } from '@types';

export const mentalMathOpsTemplate: Skill = {
    id: 'tmpl-4',
    grade: 'Grade 3',
    subject: 'Math',
    section: 'B. Operations',
    skillName: 'Mental Math Ops (Mixed)',
    example: 'Solve 12 x 5 (Vertical Layout)',
    questionType: 'Vertical Math',
    difficulty: Difficulty.MEDIUM,
    moderationStatus: 'APPROVED',
    customLayoutId: 'vertical-math',
    tags: ['Arithmetic', 'Speed', 'Multiplication', 'Division', 'Mixed Operations'],
    questionBank: [
        { questionText: '12 + 15', options: [], correctAnswer: '27', explanation: '12 plus 15 is 27.' },
        { questionText: '50 - 25', options: [], correctAnswer: '25', explanation: 'Half of 50 is 25.' },
        { questionText: '12 x 4', options: [], correctAnswer: '48', explanation: '12 times 4 is 48.' },
        { questionText: '81 ÷ 9', options: [], correctAnswer: '9', explanation: '9 times 9 is 81.' },
        { questionText: '100 + 250', options: [], correctAnswer: '350', explanation: 'Adding hundreds and tens.' }
    ]
};
