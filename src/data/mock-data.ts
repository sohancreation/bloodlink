import { Donor, Hospital, BloodRequest, BloodInventory, Donation, SystemStats } from '@/types/bloodlink';

export const mockDonors: Donor[] = [
  { id: 'd1', fullName: 'Arif Rahman', bloodType: 'O-', phone: '+880171234567', email: 'arif@email.com', city: 'Rajshahi', latitude: 24.3745, longitude: 88.6042, lastDonationDate: '2025-11-15', isAvailable: true, donationCount: 8 },
  { id: 'd2', fullName: 'Fatima Begum', bloodType: 'A+', phone: '+880181234567', email: 'fatima@email.com', city: 'Rajshahi', latitude: 24.3636, longitude: 88.6241, lastDonationDate: '2025-12-01', isAvailable: true, donationCount: 5 },
  { id: 'd3', fullName: 'Kamal Hossain', bloodType: 'B+', phone: '+880191234567', email: 'kamal@email.com', city: 'Rajshahi', latitude: 24.3755, longitude: 88.5942, lastDonationDate: '2026-01-10', isAvailable: true, donationCount: 12 },
  { id: 'd4', fullName: 'Nusrat Jahan', bloodType: 'O+', phone: '+880161234567', email: 'nusrat@email.com', city: 'Rajshahi', latitude: 24.3845, longitude: 88.6142, lastDonationDate: '2025-10-20', isAvailable: true, donationCount: 3 },
  { id: 'd5', fullName: 'Rahim Uddin', bloodType: 'AB+', phone: '+880151234567', email: 'rahim@email.com', city: 'Rajshahi', latitude: 24.3545, longitude: 88.5842, lastDonationDate: '2025-09-05', isAvailable: false, donationCount: 15 },
  { id: 'd6', fullName: 'Sumaiya Akter', bloodType: 'O-', phone: '+880141234567', email: 'sumaiya@email.com', city: 'Rajshahi', latitude: 24.3645, longitude: 88.6342, lastDonationDate: '2025-12-20', isAvailable: true, donationCount: 6 },
  { id: 'd7', fullName: 'Imran Khan', bloodType: 'A-', phone: '+880131234567', email: 'imran@email.com', city: 'Rajshahi', latitude: 24.3955, longitude: 88.5742, lastDonationDate: '2026-02-01', isAvailable: true, donationCount: 9 },
  { id: 'd8', fullName: 'Rashida Khatun', bloodType: 'B-', phone: '+880121234567', email: 'rashida@email.com', city: 'Rajshahi', latitude: 24.3445, longitude: 88.6442, lastDonationDate: '2025-08-15', isAvailable: true, donationCount: 4 },
];

export const mockHospitals: Hospital[] = [
  { id: 'h1', name: 'Rajshahi Medical College Hospital', address: 'Medical College Rd, Rajshahi', phone: '+880721234567', email: 'rmch@hospital.bd', latitude: 24.3636, longitude: 88.6241 },
  { id: 'h2', name: 'Islami Bank Hospital', address: 'Shaheb Bazar, Rajshahi', phone: '+880721234568', email: 'ibh@hospital.bd', latitude: 24.3745, longitude: 88.6042 },
  { id: 'h3', name: 'Popular Medical Center', address: 'New Market, Rajshahi', phone: '+880721234569', email: 'pmc@hospital.bd', latitude: 24.3555, longitude: 88.5942 },
];

export const mockRequests: BloodRequest[] = [
  { id: 'r1', hospitalId: 'h1', hospitalName: 'Rajshahi Medical College Hospital', bloodType: 'O-', unitsNeeded: 3, urgency: 'CRITICAL', status: 'OPEN', patientCondition: 'Severe trauma, immediate surgery required', createdAt: '2026-03-15T08:30:00Z', latitude: 24.3636, longitude: 88.6241 },
  { id: 'r2', hospitalId: 'h2', hospitalName: 'Islami Bank Hospital', bloodType: 'A+', unitsNeeded: 2, urgency: 'URGENT', status: 'OPEN', patientCondition: 'Post-operative bleeding', createdAt: '2026-03-15T09:15:00Z', latitude: 24.3745, longitude: 88.6042 },
  { id: 'r3', hospitalId: 'h3', hospitalName: 'Popular Medical Center', bloodType: 'B+', unitsNeeded: 1, urgency: 'STABLE', status: 'MATCHED', patientCondition: 'Scheduled transfusion', createdAt: '2026-03-14T14:00:00Z', latitude: 24.3555, longitude: 88.5942 },
  { id: 'r4', hospitalId: 'h1', hospitalName: 'Rajshahi Medical College Hospital', bloodType: 'AB+', unitsNeeded: 4, urgency: 'CRITICAL', status: 'OPEN', patientCondition: 'Multiple organ failure', createdAt: '2026-03-15T10:00:00Z', latitude: 24.3636, longitude: 88.6241 },
];

export const mockInventory: BloodInventory[] = [
  { id: 'i1', hospitalId: 'h1', bloodType: 'A+', unitsAvailable: 12, expiryDate: '2026-04-15' },
  { id: 'i2', hospitalId: 'h1', bloodType: 'O+', unitsAvailable: 8, expiryDate: '2026-04-10' },
  { id: 'i3', hospitalId: 'h1', bloodType: 'B+', unitsAvailable: 5, expiryDate: '2026-03-25' },
  { id: 'i4', hospitalId: 'h1', bloodType: 'O-', unitsAvailable: 2, expiryDate: '2026-04-01' },
  { id: 'i5', hospitalId: 'h1', bloodType: 'AB+', unitsAvailable: 3, expiryDate: '2026-04-20' },
  { id: 'i6', hospitalId: 'h1', bloodType: 'A-', unitsAvailable: 4, expiryDate: '2026-03-28' },
  { id: 'i7', hospitalId: 'h1', bloodType: 'B-', unitsAvailable: 1, expiryDate: '2026-03-20' },
  { id: 'i8', hospitalId: 'h1', bloodType: 'AB-', unitsAvailable: 0, expiryDate: '' },
];

export const mockDonations: Donation[] = [
  { id: 'dn1', donorId: 'd1', requestId: 'r3', hospitalName: 'Popular Medical Center', bloodType: 'O-', date: '2025-11-15', status: 'completed' },
  { id: 'dn2', donorId: 'd1', requestId: 'r2', hospitalName: 'Islami Bank Hospital', bloodType: 'O-', date: '2025-08-20', status: 'completed' },
  { id: 'dn3', donorId: 'd1', requestId: 'r1', hospitalName: 'Rajshahi Medical College Hospital', bloodType: 'O-', date: '2025-05-10', status: 'completed' },
];

export const mockStats: SystemStats = {
  totalDonors: 847,
  totalHospitals: 23,
  activeRequests: 12,
  totalDonations: 3482,
  livesImpacted: 5200,
  avgResponseTime: '4.2 min',
};

export const BLOOD_TYPE_COLORS: Record<string, string> = {
  'A+': 'bg-info text-info-foreground',
  'A-': 'bg-info/80 text-info-foreground',
  'B+': 'bg-success text-success-foreground',
  'B-': 'bg-success/80 text-success-foreground',
  'AB+': 'bg-warning text-warning-foreground',
  'AB-': 'bg-warning/80 text-warning-foreground',
  'O+': 'bg-primary text-primary-foreground',
  'O-': 'bg-primary text-primary-foreground',
};

export const URGENCY_CONFIG = {
  CRITICAL: { label: 'Critical', className: 'bg-primary text-primary-foreground', dot: 'bg-primary-foreground' },
  URGENT: { label: 'Urgent', className: 'bg-warning text-warning-foreground', dot: 'bg-warning-foreground' },
  STABLE: { label: 'Stable', className: 'bg-success text-success-foreground', dot: 'bg-success-foreground' },
};
