import { randomUUID } from 'node:crypto';
import { Collection, getModel } from '@hlb/constant-definitions';
import {
  LifecycleStatus,
  ProjectSchemaMongo,
  ProjectTaskSchemaMongo,
  ProjectTimeEntrySchemaMongo,
  type OrganizationId,
  type Project,
  type ProjectId,
  type ProjectList,
  type ProjectListId,
  type ProjectTask,
  type ProjectTaskFilters,
  type ProjectTaskId,
  type ProjectTemplate,
  type ProjectTimeEntry,
  type ProjectTimeEntryId,
  type UserId,
} from '@hlb/contracts';
import { queueWebhookEvent } from '../developers/webhooks';

const projects = () => getModel<Project>(Collection.PROJECTS, ProjectSchemaMongo);
const tasks = () => getModel<ProjectTask>(Collection.PROJECT_TASKS, ProjectTaskSchemaMongo);
const timeEntries = () =>
  getModel<ProjectTimeEntry>(Collection.PROJECT_TIME_ENTRIES, ProjectTimeEntrySchemaMongo);

const list = (name: string, color: string, position: number, isCompleted = false): ProjectList => ({
  id: randomUUID() as ProjectListId,
  name,
  color,
  position,
  isCompleted,
});

export const projectTemplateLists = (template: ProjectTemplate): ProjectList[] => {
  const definitions: Record<ProjectTemplate, Array<[string, string, boolean?]>> = {
    blank: [
      ['Pendiente', '#F79009'],
      ['En curso', '#2E90FA'],
      ['Completado', '#12B76A', true],
    ],
    kanban: [
      ['Por hacer', '#98A2B3'],
      ['En curso', '#2E90FA'],
      ['En revisión', '#F79009'],
      ['Completado', '#12B76A', true],
    ],
    roadmap: [
      ['Ahora', '#2E90FA'],
      ['Siguiente', '#9E77ED'],
      ['Más adelante', '#98A2B3'],
      ['Finalizado', '#12B76A', true],
    ],
    goals: [
      ['Objetivos', '#6172F3'],
      ['En progreso', '#2E90FA'],
      ['En riesgo', '#F79009'],
      ['Alcanzado', '#12B76A', true],
    ],
    bug_tracking: [
      ['Reportado', '#F04438'],
      ['En desarrollo', '#2E90FA'],
      ['Pruebas', '#F79009'],
      ['Resuelto', '#12B76A', true],
    ],
  };
  return definitions[template].map(([name, color, done], position) =>
    list(name, color, position, done),
  );
};

const projectKey = (name: string) => {
  const words =
    name
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .match(/[a-z\d]+/gi) ?? [];
  const key = (words.length > 1 ? words.map((word) => word[0]).join('') : words[0]?.slice(0, 3))
    ?.toUpperCase()
    .slice(0, 5);
  return key || 'PRJ';
};

export const listProjects = (organizationId: OrganizationId) =>
  projects()
    .find({ organizationId, lifecycleStatus: { $ne: LifecycleStatus.DELETED } })
    .sort({ updatedAt: -1 });

export const getProject = (projectId: ProjectId, organizationId: OrganizationId) =>
  projects().findOne({
    _id: projectId,
    organizationId,
    lifecycleStatus: { $ne: LifecycleStatus.DELETED },
  });

export const getProjectSummary = async (
  projectId: ProjectId,
  organizationId: OrganizationId,
) => {
  const project = await getProject(projectId, organizationId);
  if (!project) throw new Error('Proyecto no encontrado.');
  const active = { organizationId, projectId, lifecycleStatus: { $ne: LifecycleStatus.DELETED } };
  const [taskRows, timeRows] = await Promise.all([
    tasks().find(active).lean(),
    timeEntries().find(active).lean(),
  ]);
  const completedTasks = taskRows.filter((task) => task.status === 'completed').length;
  const trackedMinutes = timeRows.reduce((total, entry) => total + entry.durationMinutes, 0);
  const billableMinutes = timeRows
    .filter((entry) => entry.billable)
    .reduce((total, entry) => total + entry.durationMinutes, 0);
  const billableAmount = timeRows
    .filter((entry) => entry.billable)
    .reduce(
      (total, entry) => total + (entry.durationMinutes / 60) * (entry.hourlyRate ?? 0),
      0,
    );
  return {
    projectId,
    tasks: {
      total: taskRows.length,
      open: taskRows.length - completedTasks,
      completed: completedTasks,
      completionPercentage: taskRows.length
        ? Math.round((completedTasks / taskRows.length) * 100)
        : 0,
    },
    time: { trackedMinutes, billableMinutes, billableAmount },
  };
};

export const createProject = async (
  data: Partial<Project> & { organizationId: OrganizationId; userId: UserId },
) => {
  const name = data.name?.trim();
  if (!name) throw new Error('Ingresa el nombre del proyecto.');
  const template = data.template ?? 'blank';
  if (!['blank', 'kanban', 'roadmap', 'goals', 'bug_tracking'].includes(template))
    throw new Error('La plantilla seleccionada no existe.');
  const baseKey = projectKey(name);
  let key = baseKey;
  let suffix = 1;
  while (await projects().exists({ organizationId: data.organizationId, key })) {
    suffix += 1;
    key = `${baseKey.slice(0, Math.max(1, 5 - String(suffix).length))}${suffix}`;
  }
  const sequence = (await projects().countDocuments({ organizationId: data.organizationId })) + 1;
  const project = await projects().create({
    organizationId: data.organizationId,
    createdBy: data.userId,
    updatedBy: data.userId,
    key,
    sequence,
    name,
    description: data.description?.trim() ?? '',
    template,
    status: 'active',
    visibility: data.visibility ?? 'organization',
    ownerId: data.userId,
    contactId: data.contactId,
    startDate: data.startDate,
    dueDate: data.dueDate,
    tags: data.tags ?? [],
    lists: projectTemplateLists(template),
    features: data.features ?? {
      summary: true,
      notes: true,
      discussions: true,
      files: true,
      forms: false,
      links: true,
    },
  });
  queueWebhookEvent(data.organizationId, data.userId, 'project.created', {
    project: project.toObject(),
  });
  return project;
};

export const updateProject = async (
  projectId: ProjectId,
  organizationId: OrganizationId,
  userId: UserId,
  patch: Partial<
    Pick<
      Project,
      | 'name'
      | 'description'
      | 'status'
      | 'visibility'
      | 'startDate'
      | 'dueDate'
      | 'tags'
      | 'lists'
      | 'features'
    >
  >,
) => {
  const project = await getProject(projectId, organizationId);
  if (!project) throw new Error('Proyecto no encontrado.');
  if (patch.name !== undefined && !patch.name.trim())
    throw new Error('Ingresa el nombre del proyecto.');
  let removedListIds: string[] = [];
  if (patch.lists !== undefined) {
    if (!patch.lists.length) throw new Error('El proyecto debe tener al menos una lista.');
    if (new Set(patch.lists.map((item) => String(item.id))).size !== patch.lists.length)
      throw new Error('Las listas del proyecto no pueden estar duplicadas.');
    patch.lists = patch.lists.map((item, position) => ({
      ...item,
      name: item.name.trim(),
      position,
    }));
    if (patch.lists.some((item) => !item.name))
      throw new Error('Todas las listas deben tener un nombre.');
    const nextIds = new Set(patch.lists.map((item) => String(item.id)));
    removedListIds = project.lists.map((item) => String(item.id)).filter((id) => !nextIds.has(id));
  }
  Object.assign(project, patch, patch.name !== undefined ? { name: patch.name.trim() } : {});
  project.set('updatedBy', userId);
  const saved = await project.save();
  if (removedListIds.length && patch.lists?.[0]) {
    await tasks().updateMany(
      { projectId, organizationId, listId: { $in: removedListIds } },
      {
        $set: {
          listId: patch.lists[0].id,
          status: patch.lists[0].isCompleted ? 'completed' : 'open',
          updatedBy: userId,
        },
      },
    );
  }
  queueWebhookEvent(organizationId, userId, 'project.updated', {
    project: saved.toObject(),
  });
  return saved;
};

export const deleteProject = async (
  projectId: ProjectId,
  organizationId: OrganizationId,
  userId: UserId,
) => {
  const project = await getProject(projectId, organizationId);
  if (!project) throw new Error('Proyecto no encontrado.');
  project.lifecycleStatus = LifecycleStatus.DELETED;
  project.deletedAt = new Date();
  project.set('deletedBy', userId);
  await project.save();
  await tasks().updateMany(
    { projectId, organizationId },
    {
      $set: { lifecycleStatus: LifecycleStatus.DELETED, deletedAt: new Date(), deletedBy: userId },
    },
  );
  queueWebhookEvent(organizationId, userId, 'project.deleted', {
    projectId,
  });
  return { success: true };
};

export const listProjectTasks = (organizationId: OrganizationId, filters: ProjectTaskFilters) => {
  const query: Record<string, unknown> = {
    organizationId,
    lifecycleStatus: { $ne: LifecycleStatus.DELETED },
  };
  if (filters.projectId) query.projectId = filters.projectId;
  if (filters.listId) query.listId = filters.listId;
  if (filters.assigneeId) query.assigneeIds = filters.assigneeId;
  if (filters.status) query.status = filters.status;
  if (filters.priority) query.priority = filters.priority;
  if (filters.archived !== undefined) query.archived = filters.archived;
  if (filters.search)
    query.$or = [
      { name: { $regex: filters.search, $options: 'i' } },
      { key: { $regex: filters.search, $options: 'i' } },
    ];
  return tasks().find(query).sort({ position: 1, createdAt: -1 });
};

export const getProjectTask = (taskId: ProjectTaskId, organizationId: OrganizationId) =>
  tasks().findOne({
    _id: taskId,
    organizationId,
    lifecycleStatus: { $ne: LifecycleStatus.DELETED },
  });

export const createProjectTask = async (
  data: Partial<ProjectTask> & {
    projectId: ProjectId;
    organizationId: OrganizationId;
    userId: UserId;
  },
) => {
  const project = await getProject(data.projectId, data.organizationId);
  if (!project) throw new Error('Proyecto no encontrado.');
  const listId = data.listId ?? project.lists[0]?.id;
  if (!listId || !project.lists.some((item) => String(item.id) === String(listId)))
    throw new Error('La lista seleccionada no existe.');
  const name = data.name?.trim();
  if (!name) throw new Error('Ingresa el nombre de la tarea.');
  const number =
    (await tasks().countDocuments({
      organizationId: data.organizationId,
      projectId: data.projectId,
    })) + 1;
  const task = await tasks().create({
    organizationId: data.organizationId,
    createdBy: data.userId,
    updatedBy: data.userId,
    projectId: data.projectId,
    listId,
    key: `${project.key}-${number}`,
    number,
    name,
    description: data.description?.trim() ?? '',
    status: data.status ?? 'open',
    priority: data.priority ?? 'none',
    reporterId: data.userId,
    assigneeIds: data.assigneeIds ?? [],
    tags: data.tags ?? [],
    estimatedMinutes: data.estimatedMinutes,
    startDate: data.startDate,
    dueDate: data.dueDate,
    position: data.position ?? Date.now(),
    archived: false,
  });
  queueWebhookEvent(data.organizationId, data.userId, 'project.task.created', {
    task: task.toObject(),
  });
  return task;
};

export const updateProjectTask = async (
  taskId: ProjectTaskId,
  organizationId: OrganizationId,
  userId: UserId,
  patch: Partial<ProjectTask>,
) => {
  const task = await tasks().findOne({
    _id: taskId,
    organizationId,
    lifecycleStatus: { $ne: LifecycleStatus.DELETED },
  });
  if (!task) throw new Error('Tarea no encontrada.');
  if (patch.listId && String(patch.listId) !== String(task.listId)) {
    const project = await getProject(task.projectId, organizationId);
    if (!project?.lists.some((item) => String(item.id) === String(patch.listId)))
      throw new Error('La lista seleccionada no existe.');
  }
  const allowed = [
    'name',
    'description',
    'listId',
    'status',
    'priority',
    'assigneeIds',
    'tags',
    'estimatedMinutes',
    'startDate',
    'dueDate',
    'position',
    'archived',
  ] as const;
  for (const key of allowed) if (patch[key] !== undefined) task.set(key, patch[key]);
  task.set('updatedBy', userId);
  if (patch.status === 'completed') task.completedAt = new Date();
  const saved = await task.save();
  queueWebhookEvent(organizationId, userId, 'project.task.updated', {
    task: saved.toObject(),
  });
  return saved;
};

export const deleteProjectTask = async (
  taskId: ProjectTaskId,
  organizationId: OrganizationId,
  userId: UserId,
) => {
  const task = await tasks().findOne({
    _id: taskId,
    organizationId,
    lifecycleStatus: { $ne: LifecycleStatus.DELETED },
  });
  if (!task) throw new Error('Tarea no encontrada.');
  task.lifecycleStatus = LifecycleStatus.DELETED;
  task.deletedAt = new Date();
  task.set('deletedBy', userId);
  await task.save();
  queueWebhookEvent(organizationId, userId, 'project.task.deleted', {
    taskId,
    projectId: task.projectId,
  });
  return { success: true };
};

export const listProjectTimeEntries = (organizationId: OrganizationId, projectId?: string) =>
  timeEntries()
    .find({
      organizationId,
      ...(projectId ? { projectId } : {}),
      lifecycleStatus: { $ne: LifecycleStatus.DELETED },
    })
    .sort({ date: -1 });

export const getProjectTimeEntry = (
  entryId: ProjectTimeEntryId,
  organizationId: OrganizationId,
) =>
  timeEntries().findOne({
    _id: entryId,
    organizationId,
    lifecycleStatus: { $ne: LifecycleStatus.DELETED },
  });

export const createProjectTimeEntry = async (
  data: Partial<ProjectTimeEntry> & { organizationId: OrganizationId; userId: UserId },
) => {
  if (!data.projectId || !(await getProject(data.projectId, data.organizationId)))
    throw new Error('Proyecto no encontrado.');
  if (!data.durationMinutes || data.durationMinutes < 1)
    throw new Error('La duración debe ser mayor que cero.');
  const entry = await timeEntries().create({
    ...data,
    organizationId: data.organizationId,
    createdBy: data.userId,
    updatedBy: data.userId,
    userId: data.userId,
    date: data.date ?? new Date(),
    description: data.description?.trim() ?? '',
    billable: data.billable ?? false,
  });
  queueWebhookEvent(data.organizationId, data.userId, 'project.time-entry.created', {
    timeEntry: entry.toObject(),
  });
  return entry;
};

export const updateProjectTimeEntry = async (
  entryId: ProjectTimeEntryId,
  organizationId: OrganizationId,
  userId: UserId,
  patch: Partial<ProjectTimeEntry>,
) => {
  const entry = await timeEntries().findOne({
    _id: entryId,
    organizationId,
    lifecycleStatus: { $ne: LifecycleStatus.DELETED },
  });
  if (!entry) throw new Error('Registro horario no encontrado.');
  if (patch.durationMinutes !== undefined && patch.durationMinutes < 1)
    throw new Error('La duración debe ser mayor que cero.');
  const allowed = [
    'taskId',
    'date',
    'durationMinutes',
    'description',
    'billable',
    'hourlyRate',
  ] as const;
  for (const key of allowed) if (patch[key] !== undefined) entry.set(key, patch[key]);
  entry.set('updatedBy', userId);
  const saved = await entry.save();
  queueWebhookEvent(organizationId, userId, 'project.time-entry.updated', {
    timeEntry: saved.toObject(),
  });
  return saved;
};

export const deleteProjectTimeEntry = async (
  entryId: ProjectTimeEntryId,
  organizationId: OrganizationId,
  userId: UserId,
) => {
  const entry = await timeEntries().findOne({
    _id: entryId,
    organizationId,
    lifecycleStatus: { $ne: LifecycleStatus.DELETED },
  });
  if (!entry) throw new Error('Registro horario no encontrado.');
  entry.lifecycleStatus = LifecycleStatus.DELETED;
  entry.deletedAt = new Date();
  entry.set('deletedBy', userId);
  await entry.save();
  queueWebhookEvent(organizationId, userId, 'project.time-entry.deleted', {
    timeEntryId: entryId,
    projectId: entry.projectId,
    taskId: entry.taskId,
  });
  return { success: true };
};
