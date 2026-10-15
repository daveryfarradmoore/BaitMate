import { describe, expect, it } from 'vitest';
import { buildAppleMapsDirectionsUrl } from '../src/lib/appleMaps';

describe('buildAppleMapsDirectionsUrl', () => {
  it('builds a driving-directions URL from the current location', () => {
    expect(
      buildAppleMapsDirectionsUrl({
        latitude: 42.5715,
        longitude: -82.8014,
      }),
    ).toBe('https://maps.apple.com/?daddr=42.571500,-82.801400&dirflg=d');
  });

  it('rejects coordinates outside valid latitude/longitude ranges', () => {
    expect(() =>
      buildAppleMapsDirectionsUrl({ latitude: 91, longitude: 0 }),
    ).toThrow('Invalid map coordinate');
  });
});

