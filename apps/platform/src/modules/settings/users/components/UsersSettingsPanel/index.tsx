import {
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
  type FormEvent,
  type KeyboardEvent,
} from 'react';
import { Button, Modal, TextInput } from '@hlb/design-system';
import { BriefcaseBusiness, ChevronRight, Plus, Search, X } from 'lucide-react';
import type { Role, RoleId } from '@hlb/contracts';
import { useSession } from '@/shared';
import {
  useCreateRole,
  useInviteUser,
  useOrganizationUsers,
  useResendInvitation,
  useRevokeInvitation,
  useRoles,
} from '../../hooks';
import styles from './UsersSettingsPanel.module.css';

type UsersSettingsPanelProps = {
  initialView?: 'users' | 'roles';
  onClose: () => void;
};

type InviteFormState = {
  emailDraft: string;
  emails: string[];
  isAdvisor: boolean;
  roleId: string;
};

type RoleFormState = {
  name: string;
  description: string;
  showDescription: boolean;
  activeTab: string;
  permissionKeys: string[];
};

type PermissionSection = {
  key: string;
  label: string;
  title: string;
  description: string;
  permissionKeys: string[];
};

const permissionSections: PermissionSection[] = [
  {
    key: 'sales',
    label: 'Ventas',
    title: 'Ventas',
    description: 'Acceso a ventas y facturación',
    permissionKeys: [
      'quotes:read',
      'quotes:create',
      'quotes:write',
      'quotes:delete',
      'sales_orders:read',
      'sales_orders:create',
      'sales_orders:write',
      'sales_orders:delete',
      'invoices:read',
      'invoices:create',
      'invoices:write',
      'invoices:delete',
    ],
  },
  {
    key: 'accounting',
    label: 'Contabilidad',
    title: 'Contabilidad',
    description: 'Acceso a contabilidad, cobros, pagos y tesorería',
    permissionKeys: [
      'payments:read',
      'payments:create',
      'payments:write',
      'payments:delete',
      'expenses:read',
      'expenses:create',
      'expenses:write',
      'expenses:delete',
      'revenues:read',
      'revenues:create',
      'revenues:write',
      'revenues:delete',
      'financial_accounts:read',
      'financial_accounts:create',
      'financial_accounts:write',
      'financial_accounts:delete',
    ],
  },
  {
    key: 'contacts',
    label: 'Contactos',
    title: 'Contactos',
    description: 'Acceso a clientes, proveedores y CRM',
    permissionKeys: [
      'contacts:read',
      'contacts:create',
      'contacts:write',
      'contacts:delete',
      'crm_leads:read',
      'crm_leads:create',
      'crm_leads:write',
      'crm_leads:delete',
      'crm_deals:read',
      'crm_deals:create',
      'crm_deals:write',
      'crm_deals:delete',
    ],
  },
  {
    key: 'team',
    label: 'Equipo',
    title: 'Equipo',
    description: 'Acceso a usuarios, invitaciones y roles',
    permissionKeys: [
      'users:read',
      'users:create',
      'users:write',
      'users:delete',
      'users:invite',
      'memberships:read',
      'memberships:create',
      'memberships:write',
      'memberships:delete',
      'roles:read',
      'roles:create',
      'roles:write',
      'roles:delete',
      'permissions:read',
    ],
  },
  {
    key: 'projects',
    label: 'Proyectos',
    title: 'Proyectos',
    description: 'Acceso a proyectos y trabajo operativo',
    permissionKeys: ['projects:read', 'projects:create', 'projects:write', 'projects:delete'],
  },
  {
    key: 'inventory',
    label: 'Inventario',
    title: 'Inventario',
    description: 'Pedidos de compra y venta, productos, stock y ajustes',
    permissionKeys: [
      'products:read',
      'products:create',
      'products:write',
      'products:delete',
      'warehouses:read',
      'warehouses:create',
      'warehouses:write',
      'warehouses:delete',
      'stock_movements:read',
      'stock_movements:create',
      'inventory:read',
      'inventory:write',
      'inventory:adjust',
      'purchase_orders:read',
      'purchase_orders:create',
      'purchase_orders:write',
      'purchase_orders:delete',
    ],
  },
  {
    key: 'account',
    label: 'Cuenta',
    title: 'Cuenta',
    description: 'Acceso a configuración, datos de la cuenta y reportes',
    permissionKeys: [
      'settings:read',
      'settings:write',
      'reports:read',
      'reports:export',
      'analytics:read',
      'analytics:export',
      'files:read',
      'files:upload',
      'files:delete',
    ],
  },
  {
    key: 'developers',
    label: 'Desarrolladores',
    title: 'Desarrolladores',
    description: 'Acceso a herramientas de desarrollo, API y webhooks',
    permissionKeys: ['platform:read', 'platform:write', 'platform:settings'],
  },
];

const initialInviteForm: InviteFormState = {
  emailDraft: '',
  emails: [],
  isAdvisor: false,
  roleId: '',
};

const initialRoleForm: RoleFormState = {
  name: '',
  description: '',
  showDescription: false,
  activeTab: permissionSections[0]?.key ?? 'sales',
  permissionKeys: [],
};

const roleDescription = (role?: Role) =>
  role?.description || (role?.name === 'Propietario' ? 'Acceso total a toda la cuenta' : 'Acceso completo');

const getInitials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'U';

const INVITATION_LIMIT = 24;

const normalizeEmail = (email: string) => email.trim().toLowerCase();

const isPendingInvite = (status: string) => status === 'invited' || status === 'pending';

const formatLastSession = (value?: string, status?: string) => {
  if (status === 'invited' || status === 'pending') return 'Invitado';
  if (!value) return 'Hace unos segundos';

  const diff = Date.now() - new Date(value).getTime();
  const seconds = Math.max(1, Math.floor(diff / 1000));
  if (seconds < 60) return `Hace ${seconds} segundos`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `Hace ${minutes} minutos`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Hace ${hours} horas`;
  return `Hace ${Math.floor(hours / 24)} días`;
};

export const UsersSettingsPanel = ({ initialView = 'users', onClose }: UsersSettingsPanelProps) => {
  const organization = useSession((state) => state.organization);
  const [view, setView] = useState<'users' | 'roles'>(initialView);
  const [search, setSearch] = useState('');
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [inviteForm, setInviteForm] = useState<InviteFormState>(initialInviteForm);
  const [roleForm, setRoleForm] = useState<RoleFormState>(initialRoleForm);
  const { users } = useOrganizationUsers();
  const { roles } = useRoles();
  const { createRole, isCreatingRole } = useCreateRole();
  const { inviteUser, isInvitingUser } = useInviteUser();
  const { isResendingInvitation, resendInvitation, resendingInvitationId } =
    useResendInvitation();
  const { isRevokingInvitation, revokeInvitation, revokingInvitationId } = useRevokeInvitation();

  useEffect(() => {
    setView(initialView);
  }, [initialView]);

  const rolesById = useMemo(
    () => new Map(roles.map((role) => [String(role.id), role])),
    [roles],
  );
  const usersByRole = useMemo(() => {
    const counts = new Map<string, number>();
    users.filter((user) => user.status === 'active').forEach((user) => {
      counts.set(String(user.roleId), (counts.get(String(user.roleId)) ?? 0) + 1);
    });
    return counts;
  }, [users]);

  const activeUsers = users.filter((user) => user.status === 'active');
  const pendingUsers = users.filter((user) => isPendingInvite(user.status));
  const invitationsRemaining = Math.max(0, INVITATION_LIMIT - pendingUsers.length);

  const filteredUsers = activeUsers.filter((user) => {
    const term = search.trim().toLowerCase();
    if (!term) return true;
    return (
      user.name.toLowerCase().includes(term) ||
      user.email.toLowerCase().includes(term) ||
      user.roleName.toLowerCase().includes(term)
    );
  });

  const selectedInviteRole = rolesById.get(inviteForm.roleId);
  const activePermissionSection =
    permissionSections.find((section) => section.key === roleForm.activeTab) ?? permissionSections[0];

  const openRolesView = () => {
    setView('roles');
    window.history.replaceState(
      null,
      '',
      `${window.location.pathname}${window.location.search}#settings:/users/roles`,
    );
  };

  const openUsersView = () => {
    setView('users');
    window.history.replaceState(
      null,
      '',
      `${window.location.pathname}${window.location.search}#settings:/users`,
    );
  };

  const updateInviteField = (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, type, value } = event.target;
    const nextValue = type === 'checkbox' ? (event.target as HTMLInputElement).checked : value;
    setInviteForm((current) => ({ ...current, [name]: nextValue }));
  };

  const openInviteModal = () => {
    const adminRole =
      roles.find((role) => role.name.toLowerCase() === 'administrador') ??
      roles.find((role) => role.name.toLowerCase() === 'admin') ??
      roles[0];

    setInviteForm((current) => ({
      ...current,
      roleId: adminRole ? String(adminRole.id) : current.roleId,
    }));
    setIsInviteModalOpen(true);
  };

  const addInviteEmail = (rawEmail = inviteForm.emailDraft) => {
    const email = normalizeEmail(rawEmail);
    if (!email || !email.includes('@')) return;

    setInviteForm((current) => ({
      ...current,
      emailDraft: '',
      emails: current.emails.includes(email) ? current.emails : [...current.emails, email],
    }));
  };

  const removeInviteEmail = (email: string) => {
    setInviteForm((current) => ({
      ...current,
      emails: current.emails.filter((item) => item !== email),
    }));
  };

  const handleInviteEmailKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Enter' && event.key !== ',' && event.key !== 'Tab') return;
    if (!inviteForm.emailDraft.trim()) return;

    event.preventDefault();
    addInviteEmail();
  };

  const updateRoleField = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setRoleForm((current) => ({ ...current, [name]: value }));
  };

  const closeInviteModal = () => {
    setIsInviteModalOpen(false);
    setInviteForm(initialInviteForm);
  };

  const closeRoleModal = () => {
    setIsRoleModalOpen(false);
    setRoleForm(initialRoleForm);
  };

  const togglePermissionSection = (section: PermissionSection) => {
    setRoleForm((current) => {
      const currentKeys = new Set(current.permissionKeys);
      const isSelected = section.permissionKeys.every((key) => currentKeys.has(key));

      if (isSelected) {
        section.permissionKeys.forEach((key) => currentKeys.delete(key));
      } else {
        section.permissionKeys.forEach((key) => currentKeys.add(key));
      }

      return { ...current, permissionKeys: [...currentKeys] };
    });
  };

  const submitInvite = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const email = inviteForm.emails[0] ?? normalizeEmail(inviteForm.emailDraft);
    if (!email || !inviteForm.roleId) return;

    inviteUser(
      {
        email,
        isAdvisor: inviteForm.isAdvisor,
        roleId: inviteForm.roleId as RoleId,
      },
      { onSuccess: closeInviteModal },
    );
  };

  const submitRole = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!roleForm.name.trim()) return;

    createRole(
      {
        name: roleForm.name.trim(),
        description: roleForm.description.trim() || undefined,
        permissionKeys: roleForm.permissionKeys,
      },
      { onSuccess: closeRoleModal },
    );
  };

  return (
    <div className={styles.overlay} role="presentation">
      <aside className={styles.panel} aria-label="Usuarios de la cuenta">
        <div className={styles.shell}>
          <header className={styles.header}>
            <h2>{organization?.legalName || organization?.name || 'Configuración'}</h2>
            <button className={styles.closeButton} type="button" aria-label="Cerrar" onClick={onClose}>
              <X size={20} />
            </button>
          </header>

          <div className={styles.content}>
            <nav className={styles.breadcrumb} aria-label="Ruta de configuración">
              <button type="button" onClick={openUsersView}>
                Configuración
              </button>
              <ChevronRight size={16} />
              <button type="button" onClick={openUsersView}>
                Usuarios
              </button>
              {view === 'roles' && (
                <>
                  <ChevronRight size={16} />
                  <strong>Gestionar roles</strong>
                </>
              )}
            </nav>

            {view === 'users' ? (
              <>
                <section className={styles.card}>
                <div className={styles.cardHeader}>
                  <div>
                    <h3>Usuarios</h3>
                    <p>
                      {invitationsRemaining} Invitaciones restantes.{' '}
                      <button type="button">Cambia tu plan</button>
                    </p>
                  </div>
                  <div className={styles.headerControls}>
                    <TextInput
                      labelHidden
                      label="Buscar usuarios"
                      icon={<Search size={17} />}
                      value={search}
                      placeholder=""
                      onChange={(event) => setSearch(event.target.value)}
                    />
                    <Button theme="optional" variant="outline" size="medium" onClick={openRolesView}>
                      Gestionar roles
                    </Button>
                    <Button size="medium" icon={<Plus size={17} />} onClick={openInviteModal}>
                      Invitar usuarios
                    </Button>
                  </div>
                </div>

                <div className={styles.table}>
                  <div className={styles.userHeaderRow}>
                    <span>Nombre</span>
                    <span>Email</span>
                    <span>Rol</span>
                    <span>Perfil</span>
                    <span>Última sesión</span>
                  </div>
                  {filteredUsers.map((user) => (
                    <div className={styles.userRow} key={user.membershipId}>
                      <span className={styles.userName}>
                        <span className={styles.avatar}>{getInitials(user.name)}</span>
                        {user.name}
                      </span>
                      <span>{user.email}</span>
                      <span>
                        {rolesById.get(String(user.roleId))?.name ?? user.roleName ?? 'Usuario'}
                      </span>
                      <span>No asignado</span>
                      <span>{formatLastSession(user.lastSelectedAt, user.status)}</span>
                    </div>
                  ))}
                </div>
              </section>
                {pendingUsers.length > 0 && (
                  <section className={`${styles.card} ${styles.pendingCard}`}>
                    <div className={styles.pendingHeader}>
                      <h3>Invitaciones pendientes</h3>
                      <p>
                        Comprueba qué usuarios no han aceptado aún tus invitaciones. Tienes la
                        opción de reenviarlas o revocarlas según el caso.
                      </p>
                    </div>
                    <div className={styles.table}>
                      <div className={styles.pendingHeaderRow}>
                        <span>Email</span>
                        <span>Rol</span>
                        <span />
                      </div>
                      {pendingUsers.map((user) => (
                        <div className={styles.pendingRow} key={user.membershipId}>
                          <span className={styles.userName}>
                            <span className={styles.pendingAvatar}>{getInitials(user.email)}</span>
                            {user.email}
                          </span>
                          <span>{rolesById.get(String(user.roleId))?.name ?? user.roleName}</span>
                          <span className={styles.pendingActions}>
                            <Button
                              size="slim"
                              loading={
                                isResendingInvitation && resendingInvitationId === user.membershipId
                              }
                              onClick={() => resendInvitation(user.membershipId)}
                            >
                              Reenviar
                            </Button>
                            <button
                              type="button"
                              disabled={
                                isRevokingInvitation && revokingInvitationId === user.membershipId
                              }
                              onClick={() => revokeInvitation(user.membershipId)}
                            >
                              Revocar
                            </button>
                          </span>
                        </div>
                      ))}
                    </div>
                  </section>
                )}
              </>
            ) : (
              <section className={styles.card}>
                <div className={styles.cardHeader}>
                  <div>
                    <h3>Roles</h3>
                    <p>Controla cómo interactúan los miembros de tu equipo con Helebba.</p>
                  </div>
                  <Button size="medium" icon={<Plus size={17} />} onClick={() => setIsRoleModalOpen(true)}>
                    Crear rol
                  </Button>
                </div>

                <div className={styles.table}>
                  <div className={styles.roleHeaderRow}>
                    <span>Rol</span>
                    <span>Descripción</span>
                    <span>Usuarios</span>
                  </div>
                  {roles.map((role) => {
                    const count = usersByRole.get(String(role.id)) ?? 0;
                    return (
                      <div className={styles.roleRow} key={String(role.id)}>
                        <span className={styles.roleName}>
                          <BriefcaseBusiness size={15} />
                          {role.name}
                        </span>
                        <span>{roleDescription(role)}</span>
                        <span>
                          {count}
                          <br />
                          {count === 1 ? 'Usuario' : 'Usuarios'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}
          </div>
        </div>
      </aside>

      {isInviteModalOpen && (
        <Modal.Window
          isOpen
          ariaLabel="Invitar usuarios"
          className={styles.inviteModal}
          closeOnEsc
          closeOnOverlay
          onClose={closeInviteModal}
          size={{ width: '60rem', maxWidth: 'calc(100vw - 3.2rem)' }}
        >
          <Modal.Header className={styles.modalHeader}>
            <h2>Invitar usuarios</h2>
            <Modal.CloseButton onClick={closeInviteModal} label="Cerrar" />
          </Modal.Header>
          <form onSubmit={submitInvite}>
            <Modal.Body className={styles.modalBody}>
              <label className={styles.emailChipField}>
                <span>Dirección email</span>
                <div className={styles.emailChipControl}>
                  {inviteForm.emails.map((email) => (
                    <span className={styles.emailChip} key={email}>
                      {email}
                      <button type="button" aria-label={`Quitar ${email}`} onClick={() => removeInviteEmail(email)}>
                        ×
                      </button>
                    </span>
                  ))}
                  <input
                    name="emailDraft"
                    type="email"
                    value={inviteForm.emailDraft}
                    placeholder={inviteForm.emails.length ? '' : 'Escribe un email'}
                    onBlur={() => addInviteEmail()}
                    onChange={updateInviteField}
                    onKeyDown={handleInviteEmailKeyDown}
                  />
                </div>
              </label>
              <label className={styles.checkboxField}>
                <input
                  type="checkbox"
                  name="isAdvisor"
                  checked={inviteForm.isAdvisor}
                  onChange={updateInviteField}
                />
                Es una asesoría
              </label>

              <div className={styles.inviteRoleBox}>
                <div className={styles.inviteRoleHeader}>
                  <strong>Rol de usuario</strong>
                  <span>
                    Invitado
                    <span className={styles.toggle} />
                  </span>
                </div>
                <label className={styles.selectField}>
                  <select name="roleId" value={inviteForm.roleId} onChange={updateInviteField}>
                    <option value="">Seleccionar rol</option>
                    {roles.map((role) => (
                      <option key={String(role.id)} value={String(role.id)}>
                        {role.name}
                      </option>
                    ))}
                  </select>
                </label>
                <p>
                  <strong>Descripción del rol:</strong> {roleDescription(selectedInviteRole)}
                </p>
              </div>
            </Modal.Body>
            <footer className={styles.inviteFooter}>
              <div className={styles.inviteCounter}>
                <span>{invitationsRemaining}</span>
                <p>
                  Invitaciones restantes
                  <button type="button">Cambia tu plan</button>
                </p>
              </div>
              <Button type="submit" size="medium" loading={isInvitingUser}>
                Invitar
              </Button>
            </footer>
          </form>
        </Modal.Window>
      )}

      {isRoleModalOpen && (
        <Modal.Window
          isOpen
          ariaLabel="Nuevo rol"
          className={styles.roleModal}
          closeOnEsc
          closeOnOverlay
          onClose={closeRoleModal}
          size={{ width: '90rem', maxWidth: 'calc(100vw - 3.2rem)' }}
        >
          <Modal.Header className={styles.modalHeader}>
            <h2>Nuevo rol</h2>
            <Modal.CloseButton onClick={closeRoleModal} label="Cerrar" />
          </Modal.Header>
          <form className={styles.roleForm} onSubmit={submitRole}>
            <Modal.Body className={styles.roleModalBody}>
              <TextInput
                labelHidden
                label="Título del rol"
                name="name"
                value={roleForm.name}
                placeholder="Título del rol"
                fullWidth
                autoFocus
                onChange={updateRoleField}
              />
              {!roleForm.showDescription ? (
                <button
                  className={styles.inlineLink}
                  type="button"
                  onClick={() => setRoleForm((current) => ({ ...current, showDescription: true }))}
                >
                  <ChevronRight size={16} /> Añadir una descripción
                </button>
              ) : (
                <label className={styles.textareaField}>
                  Descripción
                  <textarea
                    name="description"
                    value={roleForm.description}
                    placeholder="Describe el alcance del rol"
                    onChange={updateRoleField}
                  />
                </label>
              )}

              <div className={styles.tabs}>
                {permissionSections.map((section) => {
                  const hasAll = section.permissionKeys.every((key) =>
                    roleForm.permissionKeys.includes(key),
                  );
                  return (
                    <button
                      key={section.key}
                      type="button"
                      className={section.key === roleForm.activeTab ? styles.activeTab : undefined}
                      onClick={() => setRoleForm((current) => ({ ...current, activeTab: section.key }))}
                    >
                      {section.label}
                      {!hasAll && <span />}
                    </button>
                  );
                })}
              </div>

              {activePermissionSection && (
                <div className={styles.permissionCard}>
                  <div>
                    <strong>{activePermissionSection.title}</strong>
                    <p>{activePermissionSection.description}</p>
                  </div>
                  <button
                    className={styles.switchButton}
                    type="button"
                    data-checked={activePermissionSection.permissionKeys.every((key) =>
                      roleForm.permissionKeys.includes(key),
                    )}
                    onClick={() => togglePermissionSection(activePermissionSection)}
                    aria-label={`Activar ${activePermissionSection.title}`}
                  >
                    <span />
                  </button>
                </div>
              )}
            </Modal.Body>
            <footer className={styles.roleFooter}>
              <Button type="submit" size="medium" loading={isCreatingRole}>
                Guardar rol
              </Button>
            </footer>
          </form>
        </Modal.Window>
      )}
    </div>
  );
};
