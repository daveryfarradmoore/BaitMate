export interface MapCoordinate {
  latitude: number;
  longitude: number;
}

function validateCoordinate({ latitude, longitude }: MapCoordinate): void {
  if (
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude) ||
    latitude < -90 ||
    latitude > 90 ||
    longitude < -180 ||
    longitude > 180
  ) {
    throw new Error('Invalid map coordinate');
  }
}

export function buildAppleMapsDirectionsUrl(
  coordinate: MapCoordinate,
): string {
  validateCoordinate(coordinate);
  const destination = `${coordinate.latitude.toFixed(6)},${coordinate.longitude.toFixed(6)}`;
  return `https://maps.apple.com/?daddr=${destination}&dirflg=d`;
}

