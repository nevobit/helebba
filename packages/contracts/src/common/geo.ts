import type { Brand } from './brand';

export type Longitude = Brand<number, 'Longitude'>;
export type Latitude = Brand<number, 'Latitude'>;

export type Position = readonly [longitude: Longitude, latitude: Latitude];

export type LinearRing = readonly Position[];

export type PolygonCoordinates = readonly LinearRing[];

export type MultiPolygonCoordinates = readonly PolygonCoordinates[];

export type GeoPoint = {
  readonly type: 'Point';
  readonly coordinates: Position;
};

export type GeoPolygon = {
  readonly type: 'Polygon';
  readonly coordinates: PolygonCoordinates;
};

export type GeoMultiPolygon = {
  readonly type: 'MultiPolygon';
  readonly coordinates: MultiPolygonCoordinates;
};

export type GeoJSON = GeoPoint | GeoPolygon | GeoMultiPolygon;

export function toLongitude(value: number): Longitude {
  if (!Number.isFinite(value) || value < -180 || value > 180) {
    throw new RangeError(`Longitude must be between -180 and 180. Received: ${value}`);
  }

  return value as Longitude;
}

export function toLatitude(value: number): Latitude {
  if (!Number.isFinite(value) || value < -90 || value > 90) {
    throw new RangeError(`Latitude must be between -90 and 90. Received: ${value}`);
  }

  return value as Latitude;
}
