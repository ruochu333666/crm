/** 客户实体（与后端 customers 表一致） */
export interface Customer {
  id?: number;
  name: string;
  company: string;
  contact: string;
  phone: string;
  email: string;
  region: string;
  status: "active" | "potential" | "inactive";
  industry?: string;
  address?: string;
  remark?: string;
  owner_user_id?: number | null;
  pool_status?: "private" | "pool";
  pool_reason?: string | null;
  pooled_at?: string | null;
  last_follow_up_at?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface FollowupRecord {
  id: number;
  customer_id: number;
  owner_user_id: number;
  method: "phone" | "email" | "meeting" | "im" | "other";
  content: string;
  next_follow_up_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface TaskItem {
  id: number;
  customer_id: number;
  owner_user_id: number;
  followup_id?: number | null;
  title: string;
  type?: string;
  source?: string;
  due_at: string;
  status: "open" | "done" | "cancelled";
  priority: number;
  result?: string | null;
  done_at?: string | null;
  customer_name?: string | null;
  created_at: string;
  updated_at: string;
}

export interface PoolAction {
  id: number;
  customer_id: number;
  operator_user_id: number;
  action: "take" | "to_pool" | "assign" | "recycle";
  from_owner_user_id?: number | null;
  to_owner_user_id?: number | null;
  reason?: string | null;
  created_at: string;
}

export interface PoolRule {
  recycleDays: number;
  dailyTakeLimit: number;
  followupRequiredHours: number;
  grabProtectMinutes: number;
  needApproval: boolean;
}

export interface Opportunity {
  id: number;
  customer_id: number;
  owner_user_id: number;
  team_id: number;
  stage: string;
  title: string;
  estimated_amount?: number | null;
  currency?: string;
  expected_close_at?: string | null;
  loss_reason?: string | null;
  created_at: string;
  updated_at: string;
  customer_name?: string | null;
  owner_username?: string | null;
}

export interface OpportunityStageRequest {
  id: number;
  opportunity_id: number;
  opportunity_title?: string | null;
  customer_name?: string | null;
  from_stage: string;
  to_stage: string;
  status: "pending" | "approved" | "rejected" | "cancelled";
  reason?: string | null;
  reject_reason?: string | null;
  requested_at: string;
  approved_at?: string | null;
  requested_by_username?: string | null;
}
