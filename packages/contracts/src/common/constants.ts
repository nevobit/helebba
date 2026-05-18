import type { Brand } from './base';

export type FeatureFlagKey = Brand<string, 'FeatureFlagKey'>;
export type CurrencyCode = Brand<string, 'CurrencyCode'>;
export type LocaleCode = Brand<string, 'LocaleCode'>;

export const LifecycleStatus = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  ARCHIVED: 'archived',
  DELETED: 'deleted',
  LOCKED: 'locked',
  EXPIRED: 'expired',
} as const;

export type LifecycleStatus = (typeof LifecycleStatus)[keyof typeof LifecycleStatus];

export const ReviewStatus = {
  DRAFT: 'draft',
  REVIEW: 'review',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  REVIEWED: 'reviewed',
  PENDING: 'pending',
} as const;

export type ReviewStatus = (typeof ReviewStatus)[keyof typeof ReviewStatus];

export const PublishStatus = {
  PUBLISHED: 'published',
  UNPUBLISHED: 'unpublished',
} as const;

export type PublishStatus = (typeof PublishStatus)[keyof typeof PublishStatus];

export const OperationalStatus = {
  SUSPENDED: 'suspended',
  MAINTENANCE: 'maintenance',
  OFFLINE: 'offline',
  ONLINE: 'online',
  DEGRADED: 'degraded',
  ERROR: 'error',
  FAILED: 'failed',
  PROCESSING: 'processing',
  RUNNING: 'running',
  QUEUED: 'queued',
  PAUSED: 'paused',
  RESUMING: 'resuming',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  ABORTED: 'aborted',
  TIMED_OUT: 'timed_out',
} as const;

export type OperationalStatus = (typeof OperationalStatus)[keyof typeof OperationalStatus];

export type Longitude = number;
export type Latitude = number;
export type Position = [longitude: Longitude, latitude: Latitude];
export type LinearRing = Position[];
export type PolygonCoordinates = LinearRing[];
export type MultiPolygonCoordinates = PolygonCoordinates[];

export type GeoPoint = {
  type: 'Point';
  coordinates: Position;
};

export type GeoPolygon = {
  type: 'Polygon';
  coordinates: PolygonCoordinates;
};

export type GeoMultiPolygon = {
  type: 'MultiPolygon';
  coordinates: MultiPolygonCoordinates;
};

export type GeoJSON = GeoPoint | GeoPolygon | GeoMultiPolygon;
