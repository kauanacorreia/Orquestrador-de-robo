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