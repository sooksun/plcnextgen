/**
 * Central type definitions for the School KM App.
 * Import from '@/types' or '@/types/index'.
 */

// ---- Record & Notes ----
export type RecordTypeLabel = 'ประชุม' | 'PLC' | 'ไอเดีย' | 'การสอน';
export type RecordVisibility = 'ส่วนตัว' | 'PLC' | 'ข้อเสนอ';

export interface RecordItem {
  id: string;
  title: string;
  type: RecordTypeLabel;
  visibility: RecordVisibility;
  date: string;
  tags?: string[];
  source?: 'typed' | 'voice';
}

/** คำเสนอแนะและคำชี้แนะจาก AI (เก็บใน notes.ai_reflection) */
export interface AIReflectionStored {
  keyPoints: string[];
  questions: string[];
  suggestions: string[];
}

/** Raw note as stored in localStorage (school_notes) / Supabase notes */
export interface StoredNote {
  id: string;
  title: string;
  content?: string;
  type: string;
  visibility: string;
  date?: string;
  timestamp?: string;
  tags?: string[];
  source?: 'typed' | 'voice';
  /** คำเสนอแนะและคำชี้แนะจาก AI (บันทึกพร้อมบันทึกเสียง) */
  ai_reflection?: AIReflectionStored;
}

// ---- Transcript & Review ----
export interface TranscriptLine {
  id: string;
  speaker: string;
  text: string;
  timestamp: string;
}

// ---- Share & Proposal ----
export type ShareLevel = 'private' | 'plc' | 'proposal';

export type ProposalStatus = 'PROPOSED' | 'IN_TRIAL' | 'TESTED' | 'RECOMMENDED' | 'PAUSED';

// ---- Record Capture ----
export type RecordState = 'idle' | 'recording' | 'paused' | 'stopped';

export type RecordType =
  | 'การสอน'
  | 'ประชุมผู้บริหาร'
  | 'ประชุมครู'
  | 'PLC'
  | 'ไอเดียส่วนตัว'
  | 'อื่น ๆ';

export type PermissionState = 'granted' | 'denied' | 'prompt' | 'unknown';

// ---- Curator Dashboard ----
export interface StatCard {
  status: ProposalStatus;
  label: string;
  count: number;
  color: string;
  bgColor: string;
}

export interface PipelineItem {
  id: string;
  title: string;
  status: ProposalStatus;
  submittedBy: string;
  daysAgo: number;
}

export interface InboxItem {
  id: string;
  title: string;
  submittedBy: string;
  submittedDate: string;
  topic: string;
}

export interface FollowUpItem {
  id: string;
  title: string;
  type: 'trial_ending' | 'tested_needs_summary';
  detail: string;
  urgency: 'high' | 'medium';
}

// ---- Knowledge Library & Detail ----
export interface ArchivedItem {
  id: string;
  title: string;
  summary: string;
  tags: string[];
  academicYear: string;
  archivedDate: string;
  originalStatus: string;
  submittedBy: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  action: string;
  actor: string;
  note?: string;
}

// ---- PLC ----
export type TabType = 'shared' | 'discussion' | 'insights';

export interface SharedRecord {
  id: string;
  title: string;
  owner?: string;
  tags: string[];
  commentCount: number;
  isOwner: boolean;
}

export interface PLCCard {
  id: string;
  name: string;
  members: number;
  status: 'new' | 'updated';
  statusText: string;
}

// ---- Home ----
export interface RecentItem {
  id: string;
  title: string;
  type: RecordTypeLabel;
  visibility: RecordVisibility;
  time: string;
}

// ---- Authentication ----
export type UserRole = 'TEACHER' | 'PRINCIPAL' | 'MENTOR' | 'PROJECT_MANAGER' | 'ADMIN';

export interface AuthUser {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  teacher_id: string | null;
  is_active: boolean;
  last_login: string | null;
}

export interface TeacherProfile {
  id: string;
  citizen_id: string;
  full_name: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  birth_date: string;
  cohort: number;
  appointment_date: string;
  position: string;
  major: string;
  email: string | null;
  phone: string | null;
  school_id: string;
  status: 'ACTIVE' | 'TRANSFERRED' | 'RESIGNED' | 'ON_LEAVE';
}

export interface AuthState {
  user: AuthUser | null;
  profile: TeacherProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

// Helper to check if user is curator (admin/principal)
export function isCurator(role?: UserRole): boolean {
  return role === 'ADMIN' || role === 'PRINCIPAL';
}
