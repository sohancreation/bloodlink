import { Donor, BloodRequest, DonorMatch, BloodType, DonorMatchETA } from '@/types/Redova';

const BLOOD_COMPATIBILITY: Record<BloodType, BloodType[]> = {
  'O-': ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'],
  'O+': ['O+', 'A+', 'B+', 'AB+'],
  'A-': ['A-', 'A+', 'AB-', 'AB+'],
  'A+': ['A+', 'AB+'],
  'B-': ['B-', 'B+', 'AB-', 'AB+'],
  'B+': ['B+', 'AB+'],
  'AB-': ['AB-', 'AB+'],
  'AB+': ['AB+'],
};

function getHaversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function calculateETA(distanceKm: number): DonorMatchETA {
  const avgSpeedKmPerMin = 0.5; // ~30 km/h urban
  const travelMinutes = Math.round(distanceKm / avgSpeedKmPerMin);
  const prepMinutes = 10; // blood prep + paperwork
  return {
    travelMinutes: Math.max(1, travelMinutes),
    prepMinutes,
    totalMinutes: Math.max(1, travelMinutes) + prepMinutes,
  };
}

export function findDonorMatches(donors: Donor[], request: BloodRequest, topN = 5): DonorMatch[] {
  const compatibleTypes = Object.entries(BLOOD_COMPATIBILITY)
    .filter(([, canDonateTo]) => canDonateTo.includes(request.bloodType))
    .map(([type]) => type as BloodType);

  const eligible = donors.filter(d =>
    d.isAvailable &&
    compatibleTypes.includes(d.bloodType)
  );

  const scored = eligible.map(donor => {
    const distance = getHaversineDistance(donor.latitude, donor.longitude, request.latitude, request.longitude);
    const daysSinceDonation = (Date.now() - new Date(donor.lastDonationDate).getTime()) / (1000 * 60 * 60 * 24);
    
    let score = (1 / (distance + 0.5)) * 0.6;
    if (daysSinceDonation > 56) score += 0.4;
    else if (daysSinceDonation > 28) score += 0.2;
    
    if (donor.bloodType === request.bloodType) score *= 1.2;

    const eta = calculateETA(distance);

    return { donor, score, distance: Math.round(distance * 10) / 10, eta };
  });

  return scored.sort((a, b) => b.score - a.score).slice(0, topN);
}
