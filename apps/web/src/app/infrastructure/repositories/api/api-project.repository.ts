import { HttpClient } from "@angular/common/http";
import { Inject, Injectable } from "@angular/core";
import { firstValueFrom } from "rxjs";
import {
  ProjectRepository, Project, CreateProjectPayload, UpdateProjectPayload,
  Milestone, Task, PaginatedProjects,
} from "src/app/domain/repositories/project.repository";
import { API_BASE_URL } from "../../http/api-base-url.token";

@Injectable()
export class ApiProjectRepository implements ProjectRepository {
  private readonly base: string;

  constructor(
    private readonly http: HttpClient,
    @Inject(API_BASE_URL) base: string
  ) {
    this.base = base.replace(/\/$/, "");
  }

  async list(params: { status?: string; client_id?: string; health?: string; page?: number; pageSize?: number } = {}): Promise<PaginatedProjects> {
    const qp = new URLSearchParams();
    if (params.status)    qp.set("status", params.status);
    if (params.client_id) qp.set("client_id", params.client_id);
    if (params.health)    qp.set("health", params.health);
    if (params.page)      qp.set("page", String(params.page));
    if (params.pageSize)  qp.set("pageSize", String(params.pageSize));

    const qs = qp.toString() ? `?${qp.toString()}` : "";
    return firstValueFrom(
      this.http.get<PaginatedProjects>(`${this.base}/api/v1/projects${qs}`, { withCredentials: true })
    );
  }

  async get(id: string): Promise<Project | null> {
    try {
      return await firstValueFrom(
        this.http.get<Project>(`${this.base}/api/v1/projects/${id}`, { withCredentials: true })
      );
    } catch { return null; }
  }

  async create(data: CreateProjectPayload): Promise<Project> {
    return firstValueFrom(
      this.http.post<Project>(`${this.base}/api/v1/projects`, data, { withCredentials: true })
    );
  }

  async update(id: string, data: UpdateProjectPayload): Promise<Project> {
    return firstValueFrom(
      this.http.put<Project>(`${this.base}/api/v1/projects/${id}`, data, { withCredentials: true })
    );
  }

  async delete(id: string): Promise<void> {
    await firstValueFrom(
      this.http.delete(`${this.base}/api/v1/projects/${id}`, { withCredentials: true })
    );
  }

  async createMilestone(projectId: string, data: { name: string; description?: string | null; due_date?: string | null; sort_order?: number }): Promise<Milestone> {
    return firstValueFrom(
      this.http.post<Milestone>(`${this.base}/api/v1/projects/${projectId}/milestones`, data, { withCredentials: true })
    );
  }

  async createTask(projectId: string, data: { title: string; description?: string | null; status?: string; priority?: string; due_date?: string | null; milestone_id?: string | null; assigned_to?: string | null }): Promise<Task> {
    return firstValueFrom(
      this.http.post<Task>(`${this.base}/api/v1/projects/${projectId}/tasks`, data, { withCredentials: true })
    );
  }

  async updateTaskStatus(taskId: string, status: string): Promise<Task> {
    return firstValueFrom(
      this.http.patch<Task>(`${this.base}/api/v1/projects/tasks/${taskId}/status`, { status }, { withCredentials: true })
    );
  }
}
