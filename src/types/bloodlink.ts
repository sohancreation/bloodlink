export type BloodType = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
export type UserRole = 'donor' | 'hospital' | 'admin';
export type UrgencyLevel = 'CRITICAL' | 'URGENT' | 'STABLE';
export type RequestStatus = 'OPEN' | 'MATCHED' | 'FULFILLED' | 'CANCELLED';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  createdAt: string;
}

export interface Donor {
  id: string;
  fullName: string;
  bloodType: BloodType;
  phone: string;
  email: string;
  city: string;
  latitude: number;
  longitude: number;
  lastDonationDate: string;
  isAvailable: boolean;
  donationCount: number;
}

export interface Hospital {
  id: string;
  name: string;
  address: string;
  contactNumber?: string;
  phone?: string;
  email?: string;
  latitude: number;
  longitude: number;
}

export interface BloodRequest {
  id: string;
  hospitalId: string;
  hospitalName: string;
  bloodType: BloodType;
  unitsNeeded: number;
  urgency: UrgencyLevel;
  status: RequestStatus;
  patientCondition: string;
  createdAt: string;
  latitude: number;
  longitude: number;
}

export interface BloodInventory {
  id: string;
  hospitalId: string;
  bloodType: BloodType;
  unitsAvailable: number;
  expiryDate: string;
}

export interface DonorMatchETA {
  travelMinutes: number;
  prepMinutes: number;
  totalMinutes: number;
}

export interface DonorMatch {
  donor: Donor;
  score: number;
  distance: number;
  eta: DonorMatchETA;
}

export interface Donation {
  id: string;
  donorId: string;
  requestId: string;
  hospitalName: string;
  bloodType: BloodType;
  date: string;
  status: 'completed' | 'pending' | 'cancelled';
}

export interface SystemStats {
  totalDonors: number;
  totalHospitals: number;
  activeRequests: number;
  totalDonations: number;
  livesImpacted: number;
  avgResponseTime: string;
}
