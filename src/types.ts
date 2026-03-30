export type UserRole = 'user' | 'admin';
export type UserStatus = 'active' | 'inactive' | 'blocked';
export type TransactionStatus = 'pending' | 'success' | 'declined';

export interface User {
  uid: string;
  name: string;
  email: string;
  phone: string;
  photoURL: string;
  status: UserStatus;
  role: UserRole;
  createdAt: string;
}

export interface Transaction {
  id: string;
  uid: string;
  amount: number;
  transactionId: string;
  paymentNumber: string;
  timestamp: string;
  status: TransactionStatus;
  reason?: string;
}

export interface VIPSignal {
  id: string;
  value: string;
  time: string;
  date: string;
  timestamp: string;
}

export interface Notice {
  id: string;
  message: string;
  timestamp: string;
  active: boolean;
}

export interface Stats {
  totalIncome: number;
  totalUsers: number;
}

export interface SupportChat {
  id: string;
  userId: string;
  userName: string;
  userPhoto: string;
  lastMessage: string;
  lastTimestamp: string;
  unreadCount: number;
}

export interface SupportMessage {
  id: string;
  text: string;
  senderId: string;
  timestamp: string;
  isAdmin: boolean;
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string;
    email?: string | null;
    emailVerified?: boolean;
    isAnonymous?: boolean;
    tenantId?: string | null;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}
