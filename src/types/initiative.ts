export type InitiativeCategory =
  | 'Environment'
  | 'Education'
  | 'Community Relief'
  | 'Disaster Response'
  | 'Health'
  | 'Animal Welfare'
  | 'Livelihood';

export interface Comment {
  id: string;
  author: string;
  text: string;
  time: string;
  authorId?: string;
  avatarColor?: string;
  createdAt?: any;
}

export interface Initiative {
  id: string;
  title: string;
  category: InitiativeCategory;
  date: string;
  location: string;
  region: 'Cagayan de Oro' | 'Misamis Oriental' | 'Bukidnon' | 'Other Region X';
  description: string;
  capacity: number;
  joined: number;
  joinedUserIds: string[];
  whatToBring: string[];
  meetPoint?: string;
  organizerName: string;
  organizerContact?: string;
  impactGoal?: string;
  perks?: string[];
  comments: Comment[];
  createdAt: any;
  userId?: string;
  lat?: number;
  lng?: number;
}

export interface Registration {
  id: string;
  initiativeId: string;
  userId: string;
  userName: string;
  userEmail?: string;
  userPhone?: string;
  userBloodType?: string;
  checkedIn: boolean;
  registeredAt: any;
}

export interface ChatMessage {
  id: string;
  initiativeId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  text: string;
  createdAt: any;
}

export interface OrganizerRequest {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  reason: string;
  organizationOrBarangay: string;
  phone: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: any;
  reviewedAt?: any;
  reviewedBy?: string;
}

export interface VolunteerCertificate {
  id: string;
  initiativeId: string;
  initiativeTitle: string;
  userId: string;
  volunteerName: string;
  dateIssued: string;
  organizerName: string;
  verificationCode: string;
  createdAt: any;
}
