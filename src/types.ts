export interface VoxCall {
  call_session_history_id: number;
  account_id: number;
  start_date: string;
  duration?: number;
  cost?: number;
  remote_number?: string;
}

export interface VoxUser {
  user_id: number;
  user_name: string;
  user_display_name?: string;
  user_active?: boolean;
}

export interface VoxSmsResult {
  result: number;
  message_id?: string;
}
