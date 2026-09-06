import type { RouteOptions } from 'fastify';
import {
  approveTimeClockEntry,
  clockInEmployee,
  clockOutEmployee,
  createTimeClockEntry,
  createEmploymentContract,
  createLeaveRequest,
  createPayrollRecord,
  deleteTimeClockEntry,
  getEmploymentContract,
  getTimeClockEntry,
  listEmploymentContracts,
  listLeaveRequests,
  listPayrollRecords,
  listTimeClockEntries,
  pauseTimeClockEntry,
  resumeTimeClockEntry,
  resolveLeaveRequest,
  updateEmploymentContract,
  updatePayrollStatus,
  updateTimeClockEntry,
} from '@hlb/business-logic';
import { makeFastifyRoute, RouteMethod, withPrefix } from '@hlb/constant-definitions';
import type {
  EmployeeId,
  EmploymentContract,
  EmploymentContractId,
  LeaveRequest,
  LeaveRequestId,
  OrganizationId,
  PayrollRecord,
  PayrollRecordId,
  TimeClockEntry,
  TimeClockEntryId,
  UserId,
} from '@hlb/contracts';
import { verifyJwt } from '@hlb/security';

const context = (req: any) => ({ organizationId: req.organization.organizationId as OrganizationId, userId: req.auth.userId as UserId });
const secured = { organization: 'required' as const, auth: 'required' as const };

const routes: RouteOptions[] = [
  makeFastifyRoute(RouteMethod.GET, '/contracts', verifyJwt, secured, async (req, reply) => {
    const { organizationId } = context(req);
    reply.send(await listEmploymentContracts({ ...(req.query as any), organizationId }));
  }),
  makeFastifyRoute(RouteMethod.POST, '/contracts', verifyJwt, secured, async (req, reply) => {
    const { organizationId, userId } = context(req);
    reply.status(201).send(await createEmploymentContract({ ...(req.body as Partial<EmploymentContract>), organizationId, createdBy: userId, updatedBy: userId }));
  }),
  makeFastifyRoute(RouteMethod.GET, '/contracts/:contractId', verifyJwt, secured, async (req, reply) => {
    const { organizationId } = context(req);
    reply.send(await getEmploymentContract((req.params as any).contractId as EmploymentContractId, organizationId));
  }),
  makeFastifyRoute(RouteMethod.PATCH, '/contracts/:contractId', verifyJwt, secured, async (req, reply) => {
    const { organizationId, userId } = context(req);
    reply.send(await updateEmploymentContract((req.params as any).contractId as EmploymentContractId, organizationId, { ...(req.body as Partial<EmploymentContract>), updatedBy: userId }));
  }),
  makeFastifyRoute(RouteMethod.GET, '/time-clock', verifyJwt, secured, async (req, reply) => {
    const { organizationId } = context(req);
    reply.send(await listTimeClockEntries({ ...(req.query as any), organizationId }));
  }),
  makeFastifyRoute(RouteMethod.POST, '/time-clock/clock-in', verifyJwt, secured, async (req, reply) => {
    const { organizationId, userId } = context(req);
    reply.status(201).send(await clockInEmployee({ ...(req.body as Partial<TimeClockEntry>), organizationId, createdBy: userId, updatedBy: userId }));
  }),
  makeFastifyRoute(RouteMethod.POST, '/time-clock/:entryId/clock-out', verifyJwt, secured, async (req, reply) => {
    const { organizationId, userId } = context(req);
    reply.send(await clockOutEmployee((req.params as any).entryId as TimeClockEntryId, organizationId, userId, req.body as any));
  }),
  makeFastifyRoute(RouteMethod.POST, '/time-clock/:entryId/approve', verifyJwt, secured, async (req, reply) => {
    const { organizationId, userId } = context(req);
    reply.send(await approveTimeClockEntry((req.params as any).entryId as TimeClockEntryId, organizationId, userId));
  }),
  makeFastifyRoute(RouteMethod.GET, '/employees/times', verifyJwt, secured, async (req, reply) => {
    reply.send(await listTimeClockEntries({ ...(req.query as any), organizationId: context(req).organizationId }));
  }),
  makeFastifyRoute(RouteMethod.GET, '/employees/times/:employeeTimeId', verifyJwt, secured, async (req, reply) => {
    reply.send(await getTimeClockEntry((req.params as any).employeeTimeId as TimeClockEntryId, context(req).organizationId));
  }),
  makeFastifyRoute(RouteMethod.POST, '/employees/:employeeId/times', verifyJwt, secured, async (req, reply) => {
    const { organizationId, userId } = context(req);
    reply.status(201).send(await createTimeClockEntry({ ...(req.body as Partial<TimeClockEntry>), employeeId: (req.params as any).employeeId, organizationId, createdBy: userId, updatedBy: userId, source: 'api' }));
  }),
  makeFastifyRoute(RouteMethod.PATCH, '/employees/times/:employeeTimeId', verifyJwt, secured, async (req, reply) => {
    const { organizationId, userId } = context(req);
    reply.send(await updateTimeClockEntry((req.params as any).employeeTimeId as TimeClockEntryId, organizationId, userId, req.body as Partial<TimeClockEntry>));
  }),
  makeFastifyRoute(RouteMethod.DELETE, '/employees/times/:employeeTimeId', verifyJwt, secured, async (req, reply) => {
    reply.send(await deleteTimeClockEntry((req.params as any).employeeTimeId as TimeClockEntryId, context(req).organizationId));
  }),
  makeFastifyRoute(RouteMethod.POST, '/employees/:employeeId/times/clockin', verifyJwt, secured, async (req, reply) => {
    const { organizationId, userId } = context(req);
    reply.status(201).send(await clockInEmployee({ ...(req.body as Partial<TimeClockEntry>), employeeId: (req.params as any).employeeId, organizationId, createdBy: userId, updatedBy: userId, source: 'api' }));
  }),
  makeFastifyRoute(RouteMethod.POST, '/employees/:employeeId/times/clockout', verifyJwt, secured, async (req, reply) => {
    const { organizationId, userId } = context(req);
    const openEntries = await listTimeClockEntries({ organizationId, employeeId: (req.params as any).employeeId, open: true, limit: 1 });
    const entry = openEntries.items[0];
    if (!entry) return void reply.status(404).send({ message: 'El empleado no tiene un fichaje abierto.' });
    reply.send(await clockOutEmployee(entry.id, organizationId, userId, req.body as any));
  }),
  makeFastifyRoute(RouteMethod.POST, '/employees/:employeeId/times/pause', verifyJwt, secured, async (req, reply) => {
    const { organizationId, userId } = context(req);
    reply.send(await pauseTimeClockEntry(
      (req.params as any).employeeId as EmployeeId,
      organizationId,
      userId,
      (req.body as any)?.pausedAt ? new Date((req.body as any).pausedAt) : new Date(),
    ));
  }),
  makeFastifyRoute(RouteMethod.POST, '/employees/:employeeId/times/resume', verifyJwt, secured, async (req, reply) => {
    const { organizationId, userId } = context(req);
    reply.send(await resumeTimeClockEntry(
      (req.params as any).employeeId as EmployeeId,
      organizationId,
      userId,
      (req.body as any)?.resumedAt ? new Date((req.body as any).resumedAt) : new Date(),
    ));
  }),
  makeFastifyRoute(RouteMethod.GET, '/payroll', verifyJwt, secured, async (req, reply) => {
    const { organizationId } = context(req);
    reply.send(await listPayrollRecords({ ...(req.query as any), organizationId }));
  }),
  makeFastifyRoute(RouteMethod.POST, '/payroll', verifyJwt, secured, async (req, reply) => {
    const { organizationId, userId } = context(req);
    reply.status(201).send(await createPayrollRecord({ ...(req.body as Partial<PayrollRecord>), organizationId, createdBy: userId, updatedBy: userId }));
  }),
  makeFastifyRoute(RouteMethod.PATCH, '/payroll/:recordId/status', verifyJwt, secured, async (req, reply) => {
    const { organizationId, userId } = context(req);
    reply.send(await updatePayrollStatus((req.params as any).recordId as PayrollRecordId, organizationId, userId, (req.body as any).status));
  }),
  makeFastifyRoute(RouteMethod.GET, '/leave-requests', verifyJwt, secured, async (req, reply) => {
    const { organizationId } = context(req);
    reply.send(await listLeaveRequests({ ...(req.query as any), organizationId }));
  }),
  makeFastifyRoute(RouteMethod.POST, '/leave-requests', verifyJwt, secured, async (req, reply) => {
    const { organizationId, userId } = context(req);
    reply.status(201).send(await createLeaveRequest({ ...(req.body as Partial<LeaveRequest>), organizationId, createdBy: userId, updatedBy: userId }));
  }),
  makeFastifyRoute(RouteMethod.PATCH, '/leave-requests/:requestId/status', verifyJwt, secured, async (req, reply) => {
    const { organizationId, userId } = context(req);
    reply.send(await resolveLeaveRequest((req.params as any).requestId as LeaveRequestId, organizationId, userId, (req.body as any).status));
  }),
];

export const workforceRoutes = withPrefix('/team-hr', routes);
