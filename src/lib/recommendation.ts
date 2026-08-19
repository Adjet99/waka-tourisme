import { cities } from '@/data/cities';
import { haversineKm } from '@/lib/geo';
import type { City, RecommendationInput, ScoredCity } from '@/types';

const durationDays: Record<string, number> = { heures: .4, journee: 1, weekend: 2, '3jours': 3, '4-5jours': 4.5, semaine: 7 };
const budgetTargets: Record<string, number> = { economique: 35000, modere: 60000, confortable: 100000, premium: 180000 };

function maxPracticalDistance(input: RecommendationInput) {
  if (!input.availableTime) return 2000;
  const available = input.availableTime;
  if (available === 'heures') return 90;
  if (available === 'journee') return input.transport === 'avion' ? 700 : 280;
  if (available === 'weekend') return input.transport === 'voiture' ? 700 : 1200;
  return 2000;
}

export function recommendDestinations(input: RecommendationInput, catalog: City[] = cities): ScoredCity[] {
  const rejected = new Set(input.rejectedDestinations ?? []);
  const previous = new Set(input.previousDestinations ?? []);
  const desiredDays = input.availableTime ? durationDays[input.availableTime] : undefined;
  const budget = input.budgetMaxXof ?? (input.budget ? budgetTargets[input.budget] : undefined);
  const interests = (input.interests ?? []).map(x => x.toLowerCase());
  const maxDistance = maxPracticalDistance(input);

  return catalog
    .filter(city => city.active && !rejected.has(city.slug))
    .filter(city => !input.origin?.cityName || city.name.toLowerCase() !== input.origin.cityName.toLowerCase())
    .map(city => {
      let score = 44;
      const reasons: string[] = [];
      let distanceKm: number | undefined;

      if (input.origin) {
        distanceKm = haversineKm(input.origin, city);
        if (distanceKm > maxDistance) score -= Math.min(42, (distanceKm - maxDistance) / 18);
        else {
          score += Math.max(2, 24 - distanceKm / 35);
          if (distanceKm < 160) reasons.push('Escapade accessible depuis votre départ');
        }
      }

      if (desiredDays !== undefined) {
        const durationFit = desiredDays >= city.minDays && desiredDays <= city.maxDays + .5;
        score += durationFit ? 20 : Math.max(-18, 8 - Math.abs(desiredDays - city.minDays) * 7);
        if (durationFit) reasons.push('Durée cohérente avec votre disponibilité');
      }

      if (budget !== undefined) {
        const budgetRatio = budget / Math.max(city.averageBudgetXof, 1);
        score += budgetRatio >= 1 ? Math.min(14, 8 + (budgetRatio - 1) * 4) : Math.max(-24, (budgetRatio - 1) * 36);
        if (budgetRatio >= 1) reasons.push('Budget indicatif compatible');
      }

      const interestMatches = interests.filter(interest => city.tags.some(tag => tag.toLowerCase() === interest)).length;
      score += interestMatches * 10;
      if (interestMatches > 0) reasons.push(`${interestMatches} envie${interestMatches > 1 ? 's' : ''} correspondante${interestMatches > 1 ? 's' : ''}`);

      if (input.children && (city.tags.includes('famille') || city.tags.includes('plage') || city.tags.includes('culture'))) {
        score += 9;
        reasons.push('Bon potentiel pour un séjour en famille');
      }
      if (input.travellers === 'couple' && (city.tags.includes('couple') || city.tags.includes('repos') || city.tags.includes('plage'))) score += 7;
      if (input.travellers === 'famille' && city.tags.includes('famille')) score += 8;

      if (previous.has(city.slug)) score -= 22;
      else score += 8;

      const relevance = Math.max(0, Math.min(100, score));
      // Keep genuine surprise without allowing randomness to dominate relevance.
      const randomness = Math.random() * 100;
      const finalScore = relevance * .78 + randomness * .22;
      return { ...city, recommendationScore: Math.round(finalScore * 10) / 10, reasons, distanceKm };
    })
    .filter(city => city.recommendationScore > 10)
    .sort((a, b) => b.recommendationScore - a.recommendationScore);
}

export function pickWeightedRecommendation(input: RecommendationInput, catalog: City[] = cities) {
  const top = recommendDestinations(input, catalog).slice(0, 10);
  if (!top.length) return undefined;
  const weights = top.map(city => Math.max(1, city.recommendationScore) ** 1.35);
  const total = weights.reduce((sum, value) => sum + value, 0);
  let cursor = Math.random() * total;
  for (let i = 0; i < top.length; i += 1) {
    cursor -= weights[i];
    if (cursor <= 0) return top[i];
  }
  return top[0];
}
