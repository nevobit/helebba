import { LifecycleStatus } from './constants';

export const opts = { timestamps: true, versionKey: false } as const;

export const baseFields = {
  lifecycleStatus: { type: String, default: LifecycleStatus.ACTIVE },
  deletedAt: { type: Date },
} as const;
