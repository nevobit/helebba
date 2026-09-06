import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { Project, ProjectTask } from '@hlb/contracts';
import {
  createProject,
  updateProject,
  deleteProject,
  createProjectTask,
  getProject,
  getProjects,
  getProjectTasks,
  updateProjectTask,
  deleteProjectTask,
  getProjectTimeEntries,
  createProjectTimeEntry,
  updateProjectTimeEntry,
  deleteProjectTimeEntry,
} from '../services';

export const useProjects = () => useQuery({ queryKey: ['projects'], queryFn: getProjects });
export const useProject = (projectId?: string) =>
  useQuery({ queryKey: ['project', projectId], queryFn: () => getProject(projectId!), enabled: Boolean(projectId) });
export const useProjectTasks = (projectId?: string, assigneeId?: string) =>
  useQuery({
    queryKey: ['project-tasks', projectId ?? 'all', assigneeId ?? 'all'],
    queryFn: () => getProjectTasks({ projectId, assigneeId, archived: false }),
  });
export const useProjectTimeEntries = (projectId?: string) =>
  useQuery({
    queryKey: ['project-time-entries', projectId ?? 'all'],
    queryFn: () => getProjectTimeEntries(projectId),
  });
export const useProjectMutations = (projectId?: string) => {
  const client = useQueryClient();
  const create = useMutation({ mutationFn: createProject, onSuccess: () => client.invalidateQueries({ queryKey: ['projects'] }) });
  const update = useMutation({
    mutationFn: ({ projectId: id, patch }: { projectId: string; patch: Partial<Project> }) => updateProject(id, patch),
    onSuccess: (project) => {
      client.setQueryData(['project', String(project.id)], project);
      client.invalidateQueries({ queryKey: ['projects'] });
    },
  });
  const remove = useMutation({
    mutationFn: deleteProject,
    onSuccess: () => client.invalidateQueries({ queryKey: ['projects'] }),
  });
  const createTask = useMutation({
    mutationFn: createProjectTask,
    onSuccess: () => client.invalidateQueries({ queryKey: ['project-tasks', projectId ?? 'all'] }),
  });
  const moveTask = useMutation({
    mutationFn: ({ taskId, patch }: { taskId: string; patch: Partial<ProjectTask> }) => updateProjectTask(taskId, patch),
    onMutate: async ({ taskId, patch }) => {
      const key = ['project-tasks', projectId ?? 'all', 'all'] as const;
      await client.cancelQueries({ queryKey: key });
      const previous = client.getQueryData<ProjectTask[]>(key);
      client.setQueryData<ProjectTask[]>(key, (current = []) => current.map((task) => String(task.id) === taskId ? { ...task, ...patch } : task));
      return { key, previous };
    },
    onError: (_error, _variables, context) => context && client.setQueryData(context.key, context.previous),
    onSuccess: (task, variables) => client.setQueryData<ProjectTask[]>(['project-tasks', projectId ?? 'all', 'all'], (current = []) => current.map((item) => String(item.id) === variables.taskId ? task : item)),
  });
  const removeTask = useMutation({
    mutationFn: deleteProjectTask,
    onSuccess: () => client.invalidateQueries({ queryKey: ['project-tasks'] }),
  });
  return { create, update, remove, createTask, moveTask, removeTask };
};

export const useProjectTimeMutations = (projectId?: string) => {
  const client = useQueryClient();
  const invalidate = () => client.invalidateQueries({ queryKey: ['project-time-entries', projectId ?? 'all'] });
  const create = useMutation({ mutationFn: createProjectTimeEntry, onSuccess: invalidate });
  const update = useMutation({
    mutationFn: ({ entryId, payload }: { entryId: string; payload: Parameters<typeof updateProjectTimeEntry>[1] }) =>
      updateProjectTimeEntry(entryId, payload),
    onSuccess: invalidate,
  });
  const remove = useMutation({ mutationFn: deleteProjectTimeEntry, onSuccess: invalidate });
  return { create, update, remove };
};
