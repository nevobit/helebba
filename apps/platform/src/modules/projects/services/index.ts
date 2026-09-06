import { api } from '@/shared/api';
import type { Project, ProjectTask, ProjectTaskFilters, ProjectTimeEntry } from '@hlb/contracts';

export const getProjects = async () => (await api.get<Project[]>('/projects')).data;
export const getProject = async (projectId: string) =>
  (await api.get<Project>(`/projects/${projectId}`)).data;
export const createProject = async (payload: Partial<Project>) =>
  (await api.post<Project>('/projects', payload)).data;
export const updateProject = async (projectId: string, payload: Partial<Project>) =>
  (await api.patch<Project>(`/projects/${projectId}`, payload)).data;
export const deleteProject = async (projectId: string) =>
  (await api.delete<{ success: boolean }>(`/projects/${projectId}`)).data;
export const getProjectTasks = async (filters: ProjectTaskFilters = {}) =>
  (await api.get<ProjectTask[]>('/project-tasks', { params: filters })).data;
export const createProjectTask = async (payload: Omit<Partial<ProjectTask>, 'projectId'> & { projectId: string }) =>
  (await api.post<ProjectTask>('/project-tasks', payload)).data;
export const updateProjectTask = async (taskId: string, payload: Partial<ProjectTask>) =>
  (await api.patch<ProjectTask>(`/project-tasks/${taskId}`, payload)).data;
export const deleteProjectTask = async (taskId: string) =>
  (await api.delete<{ success: boolean }>(`/project-tasks/${taskId}`)).data;
export const getProjectTimeEntries = async (projectId?: string) =>
  (await api.get<ProjectTimeEntry[]>('/project-time-entries', { params: { projectId } })).data;
export const createProjectTimeEntry = async (
  payload: Omit<Partial<ProjectTimeEntry>, 'projectId'> & { projectId: string },
) => (await api.post<ProjectTimeEntry>('/project-time-entries', payload)).data;
export const updateProjectTimeEntry = async (entryId: string, payload: Partial<ProjectTimeEntry>) =>
  (await api.patch<ProjectTimeEntry>(`/project-time-entries/${entryId}`, payload)).data;
export const deleteProjectTimeEntry = async (entryId: string) =>
  (await api.delete<{ success: boolean }>(`/project-time-entries/${entryId}`)).data;
