export interface RobotField {
  name: string;
  type: string;
  label?: string;
  required: boolean;
}

export interface RobotSchema {
  fields: RobotField[];
}

export interface Robot {
  id: string;
  name: string;
  description: string;
  schema: RobotSchema;
  status: string;
  current_version: number;
  created_at: string;
  updated_at: string;
}

export interface RobotField {
  name: string;
  type: string;
  label?: string;
  required: boolean;
}

export interface RobotSchema {
  fields: RobotField[];
}

export interface Robot {
  id: string;
  name: string;
  description: string;
  department?: string;
  schema: RobotSchema;
  status: string;
  current_version: number;
  created_at: string;
  updated_at: string;
}

export interface RobotEditLog {
  id: string;
  robot_id: string;
  user_id: string | null;
  field_name: string;
  old_value: string | null;
  new_value: string | null;
  created_at: string;
}