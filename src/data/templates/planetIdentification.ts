import { Skill, Difficulty } from '@types';

export const planetIdentificationTemplate: Skill = {
    id: 'tmpl-3',
    grade: 'Grade 2',
    subject: 'Science',
    section: 'C. Solar System',
    skillName: 'Planet Identification (Component)',
    example: 'Which planet is the Red Planet?',
    questionType: 'Multiple Choice',
    difficulty: Difficulty.MEDIUM,
    moderationStatus: 'APPROVED',
    customLayoutId: 'default',
    tags: ['Space', 'Astronomy', 'Facts', 'Nature'],
    questionBank: [
        { questionText: 'Which planet is known as the Red Planet?', options: ['Venus', 'Mars', 'Jupiter', 'Saturn'], correctAnswer: 'Mars', explanation: 'Mars appears red due to iron oxide on its surface.' },
        { questionText: 'Which is the largest planet in our solar system?', options: ['Earth', 'Mars', 'Jupiter', 'Neptune'], correctAnswer: 'Jupiter', explanation: 'Jupiter is the massive gas giant.' },
        { questionText: 'What planet do we live on?', options: ['Mars', 'Earth', 'Venus', 'Mercury'], correctAnswer: 'Earth', explanation: 'We live on Earth!' },
    ]
};
