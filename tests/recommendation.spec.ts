import { describe, expect, it } from 'vitest';
import { pickWeightedRecommendation, recommendDestinations } from '@/lib/recommendation';

describe('DestinationRecommendationEngine', () => {
  it('fonctionne sans préférence', () => {
    expect(recommendDestinations({}).length).toBeGreaterThan(0);
  });

  it('exclut une destination refusée', () => {
    const rows = recommendDestinations({ rejectedDestinations:['man'] });
    expect(rows.some(x => x.slug === 'man')).toBe(false);
  });

  it('retourne une destination du top admissible', () => {
    const result = pickWeightedRecommendation({ interests:['nature'], availableTime:'weekend' });
    expect(result).toBeTruthy();
  });
});
