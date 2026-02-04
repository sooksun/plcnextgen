/**
 * Mock data for Curator Dashboard and other screens.
 * Keep clearly separated from real data (useNotes / API).
 */
import type { StatCard, PipelineItem, InboxItem, FollowUpItem } from '@/types';

export const statCards: StatCard[] = [
  { status: 'PROPOSED', label: 'รอพิจารณา', count: 8, color: 'text-blue-700', bgColor: 'bg-blue-50 border-blue-200' },
  { status: 'IN_TRIAL', label: 'กำลังทดลอง', count: 5, color: 'text-yellow-700', bgColor: 'bg-yellow-50 border-yellow-200' },
  { status: 'TESTED', label: 'ทดลองแล้ว', count: 3, color: 'text-purple-700', bgColor: 'bg-purple-50 border-purple-200' },
  { status: 'RECOMMENDED', label: 'แนะนำให้ใช้', count: 12, color: 'text-green-700', bgColor: 'bg-green-50 border-green-200' }
];

export const pipelineItems: PipelineItem[] = [
  { id: 'pipeline-1', title: 'Active Learning ในคณิตศาสตร์', status: 'PROPOSED', submittedBy: 'ครูสมชาย', daysAgo: 2 },
  { id: 'pipeline-2', title: 'การใช้เทคโนโลยีในการสอน', status: 'PROPOSED', submittedBy: 'ครูสมหญิง', daysAgo: 1 },
  { id: 'pipeline-3', title: 'แนวทางแก้ปัญหาการอ่าน', status: 'IN_TRIAL', submittedBy: 'ครูวิชัย', daysAgo: 14 },
  { id: 'pipeline-4', title: 'กิจกรรมกลุ่มสัมพันธ์', status: 'IN_TRIAL', submittedBy: 'ครูสุดา', daysAgo: 7 },
  { id: 'pipeline-5', title: 'โครงงานวิทยาศาสตร์', status: 'TESTED', submittedBy: 'ครูประเสริฐ', daysAgo: 3 },
  { id: 'pipeline-6', title: 'การจัดห้องเรียน Growth Mindset', status: 'RECOMMENDED', submittedBy: 'ครูมานะ', daysAgo: 30 }
];

export const initialInboxItems: InboxItem[] = [
  { id: 'inbox-1', title: 'Active Learning ในคณิตศาสตร์', submittedBy: 'ครูสมชาย', submittedDate: '2569-12-12', topic: 'การสอน' },
  { id: 'inbox-2', title: 'การใช้เทคโนโลยีในการสอน', submittedBy: 'ครูสมหญิง', submittedDate: '2569-12-13', topic: 'เทคโนโลยี' },
  { id: 'inbox-3', title: 'แนวทางสร้างแรงจูงใจนักเรียน', submittedBy: 'ครูอนุชา', submittedDate: '2569-12-10', topic: 'การสอน' },
  { id: 'inbox-4', title: 'กิจกรรมลดความเครียดสอบ', submittedBy: 'ครูสมบูรณ์', submittedDate: '2569-12-09', topic: 'จิตวิทยา' },
  { id: 'inbox-5', title: 'โครงการอาหารเช้าเพื่อสุขภาพ', submittedBy: 'ครูนิภา', submittedDate: '2569-12-08', topic: 'สุขภาพ' }
];

export const followUpItems: FollowUpItem[] = [
  { id: 'followup-1', title: 'แนวทางแก้ปัญหาการอ่าน', type: 'trial_ending', detail: 'สิ้นสุดการทดลอง 20 ธ.ค. 69', urgency: 'high' },
  { id: 'followup-2', title: 'กิจกรรมกลุ่มสัมพันธ์', type: 'trial_ending', detail: 'สิ้นสุดการทดลอง 25 ธ.ค. 69', urgency: 'medium' },
  { id: 'followup-3', title: 'โครงงานวิทยาศาสตร์', type: 'tested_needs_summary', detail: 'รอสรุปผลการทดลอง', urgency: 'high' }
];

export const topicsData = [
  { topic: 'การสอน', count: 15 },
  { topic: 'PLC', count: 12 },
  { topic: 'เทคโนโลยี', count: 10 },
  { topic: 'จิตวิทยา', count: 8 },
  { topic: 'สุขภาพ', count: 6 }
];
