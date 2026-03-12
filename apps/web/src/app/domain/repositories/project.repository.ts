import { InjectionToken } from "@angular/core";

export type ProjectStatus = "discovery" | "planning" | "active" | "paused" | "review" | "completed" | "cancelled";
export type ProjectHealth = "on_track" | "at_risk" | "off_track";
export type ProjectType = "web_dev" | "automation" | "ai_system" | "chatbot" | "saas" | "consulting" | "custom";

export type Milestone = {
  id: string;
  name: string;
  description?: string | null;
  status: "pending" | "in_progress" | "completed" | "cancelled";
  due_date?: string | null;
  completed_at?: string | null;
  sort_order: number;
  project_id: string;
  created_at: string;
  updated_at: string;
};

export type Task = {
  id: string;
  title: string;
  description?: string | null;
  status: "backlog" | "todo" | "in_progress" | "review" | "done";
  priority: "low" | "medium" | "high" | "critical";
  due_date?: string | null;
  estimated_hours?: number | null;
  actual_hours?: number | null;
  sort_order: number;
  project_id: string;
  milestone_id?: string | null;
  assigned_to?: string | null;
  assigned_name?: string | null;
  created_at: string;
  updated_at: string;
};

export type Project = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  type: ProjectType;
  status: ProjectStatus;
  priority: "low" | "medium" | "high" | "critical";
  health: ProjectHealth;
  start_date?: string | null;
  end_date?: string | null;
  deadline?: string | null;
  budget?: number | null;
  invoiced_amount: number;
  notes?: string | null;
  client_id: string;
  client_name?: string;
  lead_id?: string | null;
  milestones?: Milestone[];
  tasks?: Task[];
  created_at: string;
  updated_at: string;
};

export type CreateProjectPayload = {
  name: string;
  slug?: string;
  description?: string | null;
  type?: ProjectType;
  status?: ProjectStatus;
  priority?: "low" | "medium" | "high" | "critical";
  health?: ProjectHealth;
  start_date?: string | null;
  end_date?: string | null;
  deadline?: string | null;
  budget?: number | null;
  notes?: string | null;
  client_id: string;
  lead_id?: string | null;
};

export type UpdateProjectPayload = Partial<Omit<CreateProjectPayload, "client_id">>;

export type PaginatedProjects = {
  items: Project[];
  total: number;
  page: number;
  pageSize: number;
};

export interface ProjectRepository {
  list(params?: { status?: string; client_id?: string; health?: string; page?: number; pageSize?: number }): Promise<PaginatedProjects>;
  get(id: string): Promise<Project | null>;
  create(data: CreateProjectPayload): Promise<Project>;
  update(id: string, data: UpdateProjectPayload): Promise<Project>;
  delete(id: string): Promise<void>;
  createMilestone(projectId: string, data: { name: string; description?: string | null; due_date?: string | null; sort_order?: number }): Promise<Milestone>;
  createTask(projectId: string, data: { title: string; description?: string | null; status?: string; priority?: string; due_date?: string | null; milestone_id?: string | null; assigned_to?: string | null }): Promise<Task>;
  updateTaskStatus(taskId: string, status: string): Promise<Task>;
}

export const PROJECT_REPOSITORY = new InjectionToken<ProjectRepository>("PROJECT_REPOSITORY");
