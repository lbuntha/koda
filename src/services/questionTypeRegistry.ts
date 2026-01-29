export interface QuestionTypeDef {
    id: string; // The value saved in DB
    label: string; // The display label
    defaultLayoutId: string;
    /** Default AI prompt instruction for this question type */
    defaultAiPrompt: string;
    /** Optional configuration attributes for this question type */
    attributes?: AttributeSchema[];
}

export interface AttributeSchema {
    name: string;
    label: string;
    type: 'text' | 'number' | 'boolean' | 'select' | 'range';
    options?: string[]; // For select type
    min?: number; // For number/range
    max?: number; // For number/range
    defaultValue: any;
    placeholder?: string;
}

export const REGISTERED_QUESTION_TYPES: QuestionTypeDef[] = [
    {
        id: 'Multiple Choice',
        label: 'Multiple Choice',
        defaultLayoutId: 'default',
        defaultAiPrompt: 'Provide exactly 4 distinct answer options. Make distractors plausible but clearly incorrect. The correct answer should not stand out by length or format.'
    },
    {
        id: 'Fill In',
        label: 'Fill In / Short Answer',
        defaultLayoutId: 'default',
        defaultAiPrompt: 'Create questions with short, specific answers (1-3 words). The answer should be unambiguous and easy to type.'
    },
    {
        id: 'True/False',
        label: 'True/False',
        defaultLayoutId: 'default',
        defaultAiPrompt: 'Create clear true/false statements. Avoid double negatives. The statement should be definitively true or false, not ambiguous.'
    },
    {
        id: 'Visual Counter',
        label: 'Visual Counter',
        defaultLayoutId: 'visual-counter',
        defaultAiPrompt: 'Use emojis (🍎, 🚗, ⭐, 🐶, 🌸) in the questionText to represent items to count. Format: "Count the items: 🍎🍎🍎🍎". Answer should be the number.'
    },
    {
        id: 'Vertical Math',
        label: 'Vertical Math (XtraMath Style)',
        defaultLayoutId: 'vertical-math',
        defaultAiPrompt: 'Format questionText as "Number Operator Number" (e.g., "12 + 5", "8 × 3", "15 - 7"). Do NOT include words like "Solve", "Calculate", or "What is". Answer is the numeric result only.',
        attributes: [
            { name: 'digits', label: 'Number of Digits', type: 'number', defaultValue: 2, min: 1, max: 5 },
            { name: 'operation', label: 'Operation', type: 'select', options: ['Addition', 'Subtraction', 'Multiplication', 'Division', 'Mixed'], defaultValue: 'Addition' },
            { name: 'regrouping', label: 'Allow Regrouping', type: 'boolean', defaultValue: true }
        ]
    },
    {
        id: 'Direct Input',
        label: 'Direct Input (Math)',
        defaultLayoutId: 'default',
        defaultAiPrompt: 'Create math problems where the student types a numeric answer. The answer should be a single number without units.'
    },
    {
        id: 'Custom',
        label: 'Custom',
        defaultLayoutId: 'default',
        defaultAiPrompt: 'Generate questions based on the skill definition. Follow any specific formatting requirements in the skill example.'
    },
];

export const getQuestionTypeDef = (id: string) => REGISTERED_QUESTION_TYPES.find(d => d.id === id) || REGISTERED_QUESTION_TYPES[0];

/**
 * Get the AI prompt for a question type.
 * Returns the default prompt for the type.
 */
export const getDefaultAiPrompt = (questionTypeId: string): string => {
    const def = getQuestionTypeDef(questionTypeId);
    return def.defaultAiPrompt;
};
