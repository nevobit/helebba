import type { RouteOptions } from 'fastify';
import {
  createProject,
  createProjectTask,
  createProjectTimeEntry,
  deleteProject,
  deleteProjectTask,
  deleteProjectTimeEntry,
  getProject,
  getProjectSummary,
  getProjectTask,
  getProjectTimeEntry,
  listProjects,
  listProjectTasks,
  listProjectTimeEntries,
  updateProject,
  updateProjectTask,
  updateProjectTimeEntry,
} from '@hlb/business-logic';
import { makeFastifyRoute, RouteMethod, withPrefix } from '@hlb/constant-definitions';
import type {
  OrganizationId,
  Project,
  ProjectId,
  ProjectTask,
  ProjectTaskFilters,
  ProjectTaskId,
  ProjectTimeEntry,
  ProjectTimeEntryId,
  UserId,
} from '@hlb/contracts';
import { verifyJwt } from '@hlb/security';

const context = (req: { organization?: { organizationId?: unknown }; auth?: unknown }) => ({
  organizationId: req.organization?.organizationId as OrganizationId,
  userId: (req.auth as { userId: UserId }).userId,
});
const secured = { organization: 'required', auth: 'required' } as const;

const projectRoutes: RouteOptions[] = [
  makeFastifyRoute(RouteMethod.GET, '/', verifyJwt, secured, async (req, reply) => {
    reply.status(200).send(await listProjects(context(req).organizationId));
  }),
  makeFastifyRoute(RouteMethod.POST, '/', verifyJwt, secured, async (req, reply) => {
    const { organizationId, userId } = context(req);
    reply.status(201).send(await createProject({ ...(req.body as Partial<Project>), organizationId, userId }));
  }),
  makeFastifyRoute(RouteMethod.GET, '/:projectId', verifyJwt, secured, async (req, reply) => {
    const project = await getProject((req.params as { projectId: ProjectId }).projectId, context(req).organizationId);
    if (!project) return void reply.status(404).send({ message: 'Proyecto no encontrado.' });
    reply.status(200).send(project);
  }),
  makeFastifyRoute(RouteMethod.GET, '/:projectId/summary', verifyJwt, secured, async (req, reply) => {
    reply.status(200).send(
      await getProjectSummary(
        (req.params as { projectId: ProjectId }).projectId,
        context(req).organizationId,
      ),
    );
  }),
  makeFastifyRoute(RouteMethod.PATCH, '/:projectId', verifyJwt, secured, async (req, reply) => {
    const { organizationId, userId } = context(req);
    reply.status(200).send(await updateProject((req.params as { projectId: ProjectId }).projectId, organizationId, userId, req.body as Partial<Project>));
  }),
  makeFastifyRoute(RouteMethod.DELETE, '/:projectId', verifyJwt, secured, async (req, reply) => {
    const { organizationId, userId } = context(req);
    reply.status(200).send(await deleteProject((req.params as { projectId: ProjectId }).projectId, organizationId, userId));
  }),
];

const taskRoutes: RouteOptions[] = [
  makeFastifyRoute(RouteMethod.GET, '/', verifyJwt, secured, async (req, reply) => {
    reply.status(200).send(await listProjectTasks(context(req).organizationId, req.query as ProjectTaskFilters));
  }),
  makeFastifyRoute(RouteMethod.GET, '/:taskId', verifyJwt, secured, async (req, reply) => {
    const task = await getProjectTask(
      (req.params as { taskId: ProjectTaskId }).taskId,
      context(req).organizationId,
    );
    if (!task) return void reply.status(404).send({ message: 'Tarea no encontrada.' });
    reply.status(200).send(task);
  }),
  makeFastifyRoute(RouteMethod.POST, '/', verifyJwt, secured, async (req, reply) => {
    const { organizationId, userId } = context(req);
    const body = req.body as Partial<ProjectTask> & { projectId: ProjectId };
    reply.status(201).send(await createProjectTask({ ...body, organizationId, userId }));
  }),
  makeFastifyRoute(RouteMethod.PATCH, '/:taskId', verifyJwt, secured, async (req, reply) => {
    const { organizationId, userId } = context(req);
    reply.status(200).send(await updateProjectTask((req.params as { taskId: ProjectTaskId }).taskId, organizationId, userId, req.body as Partial<ProjectTask>));
  }),
  makeFastifyRoute(RouteMethod.DELETE, '/:taskId', verifyJwt, secured, async (req, reply) => {
    const { organizationId, userId } = context(req);
    reply.status(200).send(await deleteProjectTask((req.params as { taskId: ProjectTaskId }).taskId, organizationId, userId));
  }),
];

const timeEntryRoutes: RouteOptions[] = [
  makeFastifyRoute(RouteMethod.GET, '/', verifyJwt, secured, async (req, reply) => {
    reply.status(200).send(await listProjectTimeEntries(context(req).organizationId, (req.query as { projectId?: string }).projectId));
  }),
  makeFastifyRoute(RouteMethod.GET, '/:entryId', verifyJwt, secured, async (req, reply) => {
    const entry = await getProjectTimeEntry(
      (req.params as { entryId: ProjectTimeEntryId }).entryId,
      context(req).organizationId,
    );
    if (!entry) return void reply.status(404).send({ message: 'Registro horario no encontrado.' });
    reply.status(200).send(entry);
  }),
  makeFastifyRoute(RouteMethod.PATCH, '/:entryId', verifyJwt, secured, async (req, reply) => {
    const { organizationId, userId } = context(req);
    reply.status(200).send(
      await updateProjectTimeEntry(
        (req.params as { entryId: ProjectTimeEntryId }).entryId,
        organizationId,
        userId,
        req.body as Partial<ProjectTimeEntry>,
      ),
    );
  }),
  makeFastifyRoute(RouteMethod.POST, '/', verifyJwt, secured, async (req, reply) => {
    const { organizationId, userId } = context(req);
    reply.status(201).send(await createProjectTimeEntry({ ...(req.body as Partial<ProjectTimeEntry>), organizationId, userId }));
  }),
  makeFastifyRoute(RouteMethod.DELETE, '/:entryId', verifyJwt, secured, async (req, reply) => {
    const { organizationId, userId } = context(req);
    reply.status(200).send(await deleteProjectTimeEntry((req.params as { entryId: ProjectTimeEntryId }).entryId, organizationId, userId));
  }),
];

const nestedTimeRoutes: RouteOptions[] = [
  makeFastifyRoute(RouteMethod.GET, '/:projectId/times', verifyJwt, secured, async (req, reply) => {
    reply.status(200).send(await listProjectTimeEntries(context(req).organizationId, (req.params as { projectId: string }).projectId));
  }),
  makeFastifyRoute(RouteMethod.POST, '/:projectId/times', verifyJwt, secured, async (req, reply) => {
    const { organizationId, userId } = context(req);
    reply.status(201).send(await createProjectTimeEntry({ ...(req.body as Partial<ProjectTimeEntry>), projectId: (req.params as { projectId: ProjectId }).projectId, organizationId, userId }));
  }),
  makeFastifyRoute(RouteMethod.GET, '/:projectId/times/:timeTrackingId', verifyJwt, secured, async (req, reply) => {
    const entry = await getProjectTimeEntry((req.params as { timeTrackingId: ProjectTimeEntryId }).timeTrackingId, context(req).organizationId);
    if (!entry || entry.projectId !== (req.params as { projectId: ProjectId }).projectId) return void reply.status(404).send({ message: 'Registro horario no encontrado.' });
    reply.status(200).send(entry);
  }),
  makeFastifyRoute(RouteMethod.PATCH, '/:projectId/times/:timeTrackingId', verifyJwt, secured, async (req, reply) => {
    const { organizationId, userId } = context(req);
    const params = req.params as { projectId: ProjectId; timeTrackingId: ProjectTimeEntryId };
    const entry = await getProjectTimeEntry(params.timeTrackingId, organizationId);
    if (!entry || entry.projectId !== params.projectId) return void reply.status(404).send({ message: 'Registro horario no encontrado.' });
    reply.status(200).send(await updateProjectTimeEntry(params.timeTrackingId, organizationId, userId, req.body as Partial<ProjectTimeEntry>));
  }),
  makeFastifyRoute(RouteMethod.DELETE, '/:projectId/times/:timeTrackingId', verifyJwt, secured, async (req, reply) => {
    const { organizationId, userId } = context(req);
    const params = req.params as { projectId: ProjectId; timeTrackingId: ProjectTimeEntryId };
    const entry = await getProjectTimeEntry(params.timeTrackingId, organizationId);
    if (!entry || entry.projectId !== params.projectId) return void reply.status(404).send({ message: 'Registro horario no encontrado.' });
    reply.status(200).send(await deleteProjectTimeEntry(params.timeTrackingId, organizationId, userId));
  }),
];

export const projectsRoutes: RouteOptions[] = [
  ...withPrefix('/projects', projectRoutes),
  ...withPrefix('/projects', nestedTimeRoutes),
  ...withPrefix('/project-tasks', taskRoutes),
  ...withPrefix('/project-time-entries', timeEntryRoutes),
];
