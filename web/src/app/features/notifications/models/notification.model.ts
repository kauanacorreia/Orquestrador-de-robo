export type NotificationKind = 'execution_success' | 'execution_failed';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  kind: NotificationKind;
  execution_id: string | null;
  link_path: string | null;
  created_at: string;
}
