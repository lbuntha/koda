
import { save, getAll, getById, query } from '@lib/firestore';

export interface TokenLog {
    id: string;
    userId: string;
    userName?: string; // Cache for easier display
    actionType: 'CURRICULUM_GEN' | 'QUIZ_GEN' | 'STUDENT_CHAT' | 'OTHER';
    tokensUsed: number;
    model: string;
    timestamp: number;
    metadata?: any; // Extra info like skill name, subject, etc.
}

const COLLECTION = 'token_logs';

export const addTokenLog = async (log: Omit<TokenLog, 'id'>) => {
    const id = `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Sanitize log to remove undefined values (Firestore rejects undefined)
    const sanitize = (obj: any): any => {
        return JSON.parse(JSON.stringify(obj, (key, value) => {
            return value === undefined ? null : value;
        }));
    };

    await save(COLLECTION, { id, ...sanitize(log) });
    return id;
};

export const getTokenLogs = async (): Promise<TokenLog[]> => {
    const logs = await getAll<TokenLog>(COLLECTION);
    return logs.sort((a, b) => b.timestamp - a.timestamp); // Newest first
};

export const getTokenLogsForUser = async (userId: string): Promise<TokenLog[]> => {
    // In a real DB we'd use a query. For local/mock firestore lib we filter manually if needed, 
    // but assuming 'query' function exists or we just filter client side for now.
    const all = await getTokenLogs();
    return all.filter(l => l.userId === userId);
};
