import { describe, expect, it } from 'vitest';
import { haversineKm } from '@/lib/geo';

describe('geo', () => {
  it('retourne zéro pour un même point', () => {
    expect(haversineKm({latitude:5,longitude:-4},{latitude:5,longitude:-4})).toBeCloseTo(0);
  });
  it('retourne une distance positive', () => {
    expect(haversineKm({latitude:5.36,longitude:-4.01},{latitude:5.21,longitude:-3.74})).toBeGreaterThan(0);
  });
});
