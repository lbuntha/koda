import { GoogleGenAI, Type } from "@google/genai";
import { Skill, GeneratedQuestion, Difficulty } from '@types';
import { getSystemConfig } from '@stores/settingsStore';
import { getUsers, updateUser } from '@stores/userStore';
import { REGISTERED_QUESTION_TYPES, QuestionTypeDef } from '@services/questionTypeRegistry';
import { getComponentDef, getAllComponents } from '@stores/componentStore';

// Initialize default key from env for fallback
const defaultApiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;

// Helper to get client and model based on config
const getClient = async (requestedModel?: string) => {
  const config = await getSystemConfig();

  // 1. Try Config Key
  let key = config.apiKey;
  const source = key ? "Settings Config" : "Environment Variables (.env)";

  // 2. Fallback to Env Key if config is empty
  if (!key) {
    key = defaultApiKey;
  }

  // Debug Log (Masked)
  if (key) {
    // console.log masked key
  } else {
    console.error(`[Gemini Service] NO API KEY FOUND. Checked: Settings Config and .env`);
  }

  if (!key) {
    throw new Error("Missing Gemini API Key. Please configure it in System Settings or check your .env file.");
  }

  // Prioritize system config model if set, otherwise fallback to requested or default
  const model = config.geminiModel || requestedModel || "gemini-1.5-flash";

  return {
    ai: new GoogleGenAI({ apiKey: key }),
    model
  };
};

import { addTokenLog } from '@stores/tokenLogStore';

// Metadata interface for richer logging
interface GenerationMetadata {
  skillName?: string;
  skillId?: string;
  subject?: string;
  grade?: string;
  topic?: string;
  questionType?: string;
  difficulty?: string;
  count?: number;
  functionType: 'CURRICULUM' | 'QUESTION' | 'BANK';
}

// --- QUOTA MANAGEMENT ---
const checkAndIncrementQuota = async (
  userId: string,
  metadata: GenerationMetadata,
  modelUsed: string = 'gemini-1.5-flash'
) => {
  const { functionType, count = 1 } = metadata;

  // Estimate tokens
  // Curriculum: ~500 tokens per item
  // Question: ~300 tokens per question
  let estimatedTokens = 0;
  if (functionType === 'CURRICULUM') estimatedTokens = count * 500;
  else if (functionType === 'QUESTION') estimatedTokens = count * 300;
  else if (functionType === 'BANK') estimatedTokens = count * 350;

  const users = await getUsers();
  const user = users.find(u => u.id === userId);

  if (!user) {
    console.warn(`[Quota] User ${userId} not found in store. Proceeding with logging using ID.`);
  }

  const config = await getSystemConfig();

  // Determine Quota Limit based on subscription tier
  // If user missing, assume free tier behavior or unlimited for system ops
  const tierId = user?.subscriptionTier || 'free';
  const tier = config.subscriptionTiers.find(t => t.id === tierId);
  const monthlyQuota = tier ? tier.tokenQuota : 10000;

  // Calculate current usage
  const currentUsage = user?.tokenUsage || 0;

  // Check reset date (Simplified: if current month != reset month)
  const now = new Date();
  const lastReset = user?.quotaResetDate ? new Date(user.quotaResetDate) : new Date(0);

  let newUsage = currentUsage;

  if (user && (now.getMonth() !== lastReset.getMonth() || now.getFullYear() !== lastReset.getFullYear())) {
    newUsage = 0;
    // Update reset date
    await updateUser({ ...user, tokenUsage: 0, quotaResetDate: now.toISOString() });
  }

  if (newUsage + estimatedTokens > monthlyQuota) {
    throw new Error(`Quota Exceeded. You have used ${newUsage}/${monthlyQuota} tokens. Upgrade to Pro for more!`);
  }

  // Increment Usage (Only if user exists)
  if (user) {
    await updateUser({ ...user, tokenUsage: newUsage + estimatedTokens, quotaResetDate: user.quotaResetDate || now.toISOString() });
  }

  // Create detailed log with rich metadata
  await addTokenLog({
    userId: userId,
    userName: user?.name || 'Unknown User',
    actionType: functionType === 'CURRICULUM' ? 'CURRICULUM_GEN' : functionType === 'BANK' ? 'QUIZ_GEN' : 'STUDENT_CHAT',
    tokensUsed: estimatedTokens,
    model: modelUsed,
    timestamp: Date.now(),
    metadata: {
      count: metadata.count,
      functionType: metadata.functionType,
      skillName: metadata.skillName,
      skillId: metadata.skillId,
      subject: metadata.subject,
      grade: metadata.grade,
      topic: metadata.topic,
      questionType: metadata.questionType,
      difficulty: metadata.difficulty,
    }
  });
};

const getDifficultyInstruction = (difficulty: string) => {
  switch (difficulty) {
    case 'Easy':
      return "Focus on basic recall, recognition, and simple definitions. Use simple, direct language. The answer should be immediately obvious to someone who knows the basics. Single-step thinking.";
    case 'Medium':
      return "Require application of the concept in a familiar context. The question should involve a small logical step, comparison, or inference. Options should be distinct but not too obvious.";
    case 'Hard':
      return "Challenge the student with complex scenarios, multi-step problems, exceptions to rules, or by requiring them to synthesize information. Options should be plausible distractors that test deep understanding.";
    default:
      return "Ensure the complexity matches the grade level.";
  }
};

export const generateCurriculumSkills = async (
  userId: string,
  grade: string,
  subject: string,
  topic: string,
  count: number = 5,
  section?: string,
  customInstruction?: string,
  questionType?: string,
  geminiModel: string = "gemini-1.5-flash",
  maxTokens: number = 2048
): Promise<Skill[]> => {
  try {
    await checkAndIncrementQuota(userId, {
      functionType: 'CURRICULUM',
      count,
      subject,
      grade,
      topic,
      questionType,
    }, geminiModel);
    const { ai, model } = await getClient(geminiModel);

    const allComponents = await getAllComponents();
    const availableTypes = allComponents.map(t => t.id).join(', ');
    const questionTypePrompt = questionType || `best suited for a web app from this list: ${availableTypes}`;

    const prompt = `
    You are an expert curriculum designer. Create a list of exactly ${count} specific educational skills / learning objectives for:
    Grade: ${grade}
    Subject: ${subject}
    Core Topic: ${topic}
    ${section ? `Specific Category/Unit Name: ${section}` : 'Category: Auto-assign a relevant broad category (e.g., "Number and Place Value")'}
    ${customInstruction ? `\nIMPORTANT INSTRUCTION FROM TEACHER: ${customInstruction}\n` : ''}
    ${questionType ? `PREFERRED QUESTION TYPE: ${questionType}` : ''}

    Structure the output similar to a formal curriculum document with a 3-level hierarchy:
    1. Category (Broad Section, e.g. "Geometry")
    2. Topic (Sub-theme, e.g. "2D Shapes")
    3. Skill (Specific actionable objective, e.g. "Identify triangles")

    CRITICAL RULE FOR SKILL NAMES:
    - Keep them SHORT, SIMPLE, and CLEAR.
    - Use 3-6 words maximum.
    - Avoid jargon. Use student-friendly language.
    - Examples: "Add 2-digit numbers", "Identify the noun", "Count objects to 10".
    
    The 'topic' field is the sub-theme.
    The 'section' field is the broad category.
    `;

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              section: { type: Type.STRING, description: "Broad Category (e.g. Number and Place Value)" },
              topic: { type: Type.STRING, description: "Sub-theme (e.g. Counting)" },
              skillName: { type: Type.STRING, description: "Actionable, short skill name (max 6 words)" },
              example: { type: Type.STRING, description: "A concrete example of a question" },
              questionType: { type: Type.STRING },
              difficulty: { type: Type.STRING, enum: ["Easy", "Medium", "Hard"] }
            },
            required: ["section", "topic", "skillName", "example", "questionType", "difficulty"],
          },
        },
        maxOutputTokens: maxTokens,
      },
    });

    const rawData = cleanAndParseJson(response.text || "[]", "CurriculumGen");

    // Resolve Layout from Registry (Async map handling)
    const skills = await Promise.all(rawData.map(async (item: any, index: number) => {
      const def = await getComponentDef(item.questionType);
      const layout = def ? def.defaultLayoutId : 'default';

      return {
        id: `gen-${Date.now()}-${index}`,
        grade,
        subject,
        section: item.section,
        topic: item.topic || 'General', // Fallback
        skillId: `S${100 + index}`,
        skillName: item.skillName,
        example: item.example,
        questionType: item.questionType,
        difficulty: item.difficulty as Difficulty,
        customLayoutId: layout
      };
    }));

    return skills;

  } catch (error: any) {
    console.error("Gemini Curriculum Gen Error:", error);
    let msg = "Failed to generate curriculum.";
    if (error.message?.includes('API key')) msg = "Invalid or missing API Key.";
    if (error.message?.includes('quota')) msg = "API Quota exceeded.";
    throw new Error(msg + ` Details: ${error.message || error}`);
  }
};

export const generateQuestionForSkill = async (
  userId: string,
  skill: Skill,
  customInstruction: string = "",
  geminiModel: string = "gemini-1.5-flash",
  maxTokens: number = 1024
): Promise<GeneratedQuestion> => {
  try {
    await checkAndIncrementQuota(userId, {
      functionType: 'QUESTION',
      count: 1,
      skillName: skill.skillName,
      skillId: skill.id,
      subject: skill.subject,
      grade: skill.grade,
      questionType: skill.questionType,
      difficulty: skill.difficulty,
    }, geminiModel);
    const { ai, model } = await getClient(geminiModel);
    const difficultyGuide = getDifficultyInstruction(skill.difficulty);

    // Process Component Attributes
    let attributeConstraints = "";
    if (skill.componentAttributes) {
      attributeConstraints = Object.entries(skill.componentAttributes)
        .map(([key, value]) => `${key}: ${value}`)
        .join(', ');
    }

    let layoutConstraints = "";
    if (skill.customLayoutId === 'vertical-math' || skill.questionType === 'Vertical Math') {
      layoutConstraints = `
      - STRICTLY format the 'questionText' as a mathematical expression like "12 + 5" or "10 x 2".
        - Do NOT include text like "Calculate", "What is", or "Solve".Just the numbers and operator.
        - Ensure the equation is solvable by a student at this grade level.
      `;
    }
    if (skill.customLayoutId === 'visual-counter') {
      layoutConstraints = `- You have TWO options for format:
      1. VISUAL COUNTING: "Count the [item]: [emojis]" (e.g. "Count the apples: 🍎🍎🍎")
      2. WORD PROBLEM: A short story problem (e.g. "John has 5 apples and eats 2. How many are left?").
      - Do NOT generate simple math equations like "5 + 3" or "Which number is missing: 1, 2, _".
      - Do NOT include 'options'. Users must type the answer using a keypad.`;
    }

    const config = await getSystemConfig();
    const typeId = skill.questionType;

    // Resolve Base Prompt: Skill Override > Global Config Override > Registry Default
    let basePromptTemplate = skill.aiPromptInstruction;

    if (!basePromptTemplate) {
      basePromptTemplate = config.questionTypePrompts?.[typeId];
    }

    if (!basePromptTemplate) {
      // Fallback to registry default (or a generic one if missing)
      const def = await getComponentDef(typeId);
      basePromptTemplate = def?.defaultAiPrompt || "Generate a high-quality question.";
    }

    const prompt = `
    ${basePromptTemplate}
    
    CONTEXT:
    Grade: ${skill.grade}
    Subject: ${skill.subject}
    Skill: ${skill.skillName}
    Difficulty: ${skill.difficulty}
    Question Type: ${skill.questionType}
    
    DIFFICULTY GUIDE: ${difficultyGuide}
    ADDITIONAL INSTRUCTION: ${customInstruction}
    COMPONENT SETTINGS: ${attributeConstraints}
    LAYOUT RESTRICTIONS: ${layoutConstraints}
    
    REQUIRED OUTPUT:
    Generate a single, unique, interactive quiz question in JSON format.
    `;

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            questionText: { type: Type.STRING },
            options: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Only required for Multiple Choice. Leave empty otherwise."
            },
            correctAnswer: { type: Type.STRING },
            explanation: { type: Type.STRING, description: "Helpful feedback for the student" }
          },
          required: ["questionText", "correctAnswer", "explanation"]
        },
        maxOutputTokens: maxTokens,
      },
    });

    return cleanAndParseJson(response.text || "{}", "QuestionGen");
  } catch (error: any) {
    console.error("Gemini Question Gen Error:", error);
    // Return fallback for single question generation to avoid crashing the experience
    console.warn("Falling back to practice mode due to error.");
    return {
      questionText: `Practice: ${skill.example} `,
      correctAnswer: "varies",
      explanation: "This is a fallback question due to connection issues."
    };
  }
};

const cleanAndParseJson = (text: string, context: string) => {
  try {
    // 1. Remove Markdown code blocks if present
    let cleanText = text.replace(/```json\n ?| ```/g, '').trim();

    // 2. Attempt Parse
    return JSON.parse(cleanText);
  } catch (e) {
    console.warn(`[Gemini Service] initial JSON parse failed in ${context}. Attempting repair...`);

    // 3. Attempt to repair truncated array
    try {
      let cleanText = text.replace(/```json\n ?| ```/g, '').trim();

      // If it looks like an array start but no end
      if (cleanText.startsWith('[') && !cleanText.endsWith(']')) {
        // Find the last completely closed object
        const lastClosingBrace = cleanText.lastIndexOf('}');
        if (lastClosingBrace !== -1) {
          // Keep everything up to the last valid object and close the array
          const repairedText = cleanText.substring(0, lastClosingBrace + 1) + ']';
          return JSON.parse(repairedText);
        }
      }
    } catch (repairError) {
      console.error(`[Gemini Service] JSON Repair Failed.Raw: `, text);
    }

    // Rethrow original if repair failed
    console.error(`[Gemini Service] Final JSON Parse Error in ${context}. Raw Text: `, text);
    throw new Error(`Failed to parse AI response.The response may be incomplete.Try reducing the number of questions.`);
  }
};

export const generateQuestionBankForSkill = async (
  userId: string,
  skill: Skill,
  count: number = 5,
  customInstruction: string = "",
  geminiModel: string = "gemini-1.5-flash",
  maxTokens: number = 8192
): Promise<GeneratedQuestion[]> => {
  // Batch size - generate in chunks for better reliability
  const BATCH_SIZE = 15;
  const MAX_RETRIES = 6;

  // Calculate quota upfront is NOT sufficient for retries/batches
  // We will check quota *before* the loop for safety, but LOG/INCREMENT inside the loop for accuracy.

  // Initial Safety Check (Approximate)
  const users = await getUsers();
  const user = users.find(u => u.id === userId);
  const config = await getSystemConfig();
  const tier = config.subscriptionTiers.find(t => t.id === (user?.subscriptionTier || 'free'));
  const monthlyQuota = tier ? tier.tokenQuota : 10000;
  const currentUsage = user?.tokenUsage || 0;

  if (currentUsage >= monthlyQuota) {
    throw new Error(`Quota Exceeded. Please upgrade plan.`);
  }

  const allQuestions: GeneratedQuestion[] = [];
  let remaining = count;
  let retryCount = 0;

  const { ai, model } = await getClient(geminiModel);
  const difficultyGuide = getDifficultyInstruction(skill.difficulty);

  // Process Component Attributes
  let attributeConstraints = "";
  if (skill.componentAttributes) {
    attributeConstraints = Object.entries(skill.componentAttributes)
      .map(([key, value]) => `${key}: ${value}`)
      .join(', ');
  }

  // Generate questions in batches until we have enough
  while (remaining > 0 && retryCount < MAX_RETRIES) {
    const batchCount = Math.min(remaining, BATCH_SIZE);

    // LOGGING AND QUOTA: Incremental per batch
    await checkAndIncrementQuota(userId, {
      functionType: 'BANK',
      count: batchCount, // Log for this specific batch
      skillName: skill.skillName,
      skillId: skill.id,
      subject: skill.subject,
      grade: skill.grade,
      questionType: skill.questionType,
      difficulty: skill.difficulty,
    }, geminiModel);


    try {
      const examples = skill.questionBank && skill.questionBank.length > 0
        ? skill.questionBank.slice(0, 3).map(q =>
          `Example Q: ${q.questionText} \nExample Answer: ${q.correctAnswer} \nExample Feedback: ${q.explanation} `
        ).join('\n---\n')
        : `Example context: ${skill.example} `;

      // Include already generated questions to avoid duplicates (Optimization: Last 20 only)
      const existingQuestions = allQuestions.length > 0
        ? `\n\nAVOID DUPLICATES - Already generated questions (Last 20):\n${allQuestions.slice(-20).map((q, i) => `${i + 1}. ${q.questionText}`).join('\n')}\n\nGenerate ${batchCount} NEW and DIFFERENT questions.`
        : '';

      const config = await getSystemConfig();
      const typeId = skill.questionType;

      // Resolve Base Prompt: Skill Override > Global Config Override > Registry Default
      let basePromptTemplate = skill.aiPromptInstruction;

      if (!basePromptTemplate) {
        basePromptTemplate = config.questionTypePrompts?.[typeId];
      }

      if (!basePromptTemplate) {
        // Fallback to registry default (or a generic one if missing)
        const def = await getComponentDef(typeId);
        basePromptTemplate = def?.defaultAiPrompt || "Generate high-quality questions.";
      }

      const prompt = `
      ${basePromptTemplate}
      
      CONTEXT:
      Grade: ${skill.grade}
      Subject: ${skill.subject}
      Skill: ${skill.skillName}
      Difficulty: ${skill.difficulty}
      Question Type: ${skill.questionType}
      
      DIFFICULTY GUIDE: ${difficultyGuide}
      ADDITIONAL INSTRUCTION: ${customInstruction}
      COMPONENT SETTINGS: ${attributeConstraints}
      
      REFERENCE MATERIAL:
      ${examples}
      ${existingQuestions}
      
      OUTPUT MANIFEST:
      1. Generate EXACTLY ${batchCount} questions.
      2. Return ONLY a valid JSON array.
      3. Each item must follow the specified schema.
      4. Ensure all questions are unique.
      5. VARY the scenarios, numbers, and phrasing significantly.
      `;

      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                questionText: { type: Type.STRING },
                options: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: "Array of options if Multiple Choice. Empty array [] otherwise."
                },
                correctAnswer: { type: Type.STRING },
                explanation: { type: Type.STRING }
              },
              required: ["questionText", "correctAnswer", "explanation"]
            },
          },
          maxOutputTokens: maxTokens,
        },
      });

      const batchQuestions = cleanAndParseJson(response.text || "[]", "QuestionBank");

      if (Array.isArray(batchQuestions) && batchQuestions.length > 0) {
        // Filter out potential duplicates (based on questionText similarity)
        const newQuestions = batchQuestions.filter(newQ => {
          const isDuplicate = allQuestions.some(existingQ =>
            existingQ.questionText.toLowerCase().trim() === newQ.questionText.toLowerCase().trim()
          );
          return !isDuplicate;
        });

        allQuestions.push(...newQuestions);
        remaining = count - allQuestions.length;

        // If we got significantly fewer than requested, increment retry
        if (newQuestions.length < batchCount / 2) {
          retryCount++;
        }
      } else {
        retryCount++;
        console.warn(`[QuestionBank] Empty batch returned. Retry ${retryCount}/${MAX_RETRIES}`);
      }

    } catch (batchError: any) {
      console.error(`[QuestionBank] Batch error:`, batchError.message);
      retryCount++;

      // If we have some questions, don't fail completely
      if (allQuestions.length === 0) {
        throw batchError;
      }
    }
  }

  // Log final results
  if (allQuestions.length < count) {
    console.warn(`[QuestionBank] Generated ${allQuestions.length}/${count} questions after ${retryCount} retries`);
  } else {
    // Success
  }

  // Return what we have (may be less than requested, but better than failing)
  return allQuestions.slice(0, count);
};

