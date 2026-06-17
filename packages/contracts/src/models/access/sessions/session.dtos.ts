import type { Session } from './schemas';

export type CreateSessionDto = Omit<Session, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateSessionDto = Partial<CreateSessionDto>;
