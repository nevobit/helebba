import type { RouteOptions } from 'fastify';
import { createEmployee, deleteEmployee, getEmployee, listEmployees, updateEmployee } from '@hlb/business-logic';
import { makeFastifyRoute, RouteMethod, withPrefix } from '@hlb/constant-definitions';
import type { Employee, EmployeeId, OrganizationId, UserId } from '@hlb/contracts';
import { verifyJwt } from '@hlb/security';

const context = (req: any) => ({ organizationId: req.organization.organizationId as OrganizationId, userId: req.auth.userId as UserId });

const routes: RouteOptions[] = [
  makeFastifyRoute(RouteMethod.GET, '/', verifyJwt, { organization: 'required', auth: 'required' }, async (req, reply) => {
    const { organizationId } = context(req);
    reply.send(await listEmployees({ ...(req.query as any), organizationId }));
  }),
  makeFastifyRoute(RouteMethod.POST, '/', verifyJwt, { organization: 'required', auth: 'required' }, async (req, reply) => {
    const { organizationId, userId } = context(req);
    reply.status(201).send(await createEmployee({ ...(req.body as Partial<Employee>), organizationId, createdBy: userId, updatedBy: userId }));
  }),
  makeFastifyRoute(RouteMethod.GET, '/:employeeId', verifyJwt, { organization: 'required', auth: 'required' }, async (req, reply) => {
    const { organizationId } = context(req);
    reply.send(await getEmployee((req.params as any).employeeId as EmployeeId, organizationId));
  }),
  makeFastifyRoute(RouteMethod.PATCH, '/:employeeId', verifyJwt, { organization: 'required', auth: 'required' }, async (req, reply) => {
    const { organizationId, userId } = context(req);
    reply.send(await updateEmployee((req.params as any).employeeId as EmployeeId, organizationId, { ...(req.body as Partial<Employee>), updatedBy: userId }));
  }),
  makeFastifyRoute(RouteMethod.DELETE, '/:employeeId', verifyJwt, { organization: 'required', auth: 'required' }, async (req, reply) => {
    const { organizationId, userId } = context(req);
    reply.send(await deleteEmployee((req.params as any).employeeId as EmployeeId, organizationId, userId));
  }),
];

export const employeeRoutes = withPrefix('/employees', routes);
