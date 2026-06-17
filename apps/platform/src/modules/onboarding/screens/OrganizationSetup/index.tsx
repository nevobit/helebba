import { useState, type ChangeEvent, type FormEvent } from 'react';
import { Avatar, Button, TextInput } from '@hlb/design-system';
import styles from './OrganizationSetup.module.css';
import { PrivateRoutes, PublicRoutes } from '@/app/router/routes';
import { Link, useNavigate } from 'react-router-dom';
import { useSession } from '@/shared';
import { useCreateOrganization } from '@/modules/onboarding/hooks';

const activityTypes = [
  { label: 'Empresa', value: 'company' },
  { label: 'Independiente', value: 'independent' },
  { label: 'Firma de contabilidad', value: 'accounting_firm' },
] as const;

const employeeRanges = ['1', '2-5', '6-10', '11-25', '26-50', '+51'] as const;

const OrganizationSetup = () => {
  const navigate = useNavigate();
  const user = useSession((state) => state.user);
  const signOut = useSession((state) => state.signOut);
  const setWorkspaceContext = useSession((state) => state.setWorkspaceContext);
  const { createOrganization, isCreatingOrganization } = useCreateOrganization();
  const [activityType, setActivityType] =
    useState<(typeof activityTypes)[number]['value']>('company');
  const [employeeRange, setEmployeeRange] = useState<(typeof employeeRanges)[number]>('1');
  const [formState, setFormState] = useState({
    legalName: '',
    country: 'CO',
    structure: 'company',
    website: '',
  });
  const [error, setError] = useState<string | null>(null);
  const profileName = user?.name || user?.email || 'Usuario';
  const profileEmail = user?.email || 'Sin correo';

  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    setFormState((current) => ({
      ...current,
      [name]: value,
    }));
    setError(null);
  };

  const handleSignOut = () => {
    signOut();
    navigate(PublicRoutes.LOGIN, { replace: true });
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!formState.legalName.trim()) {
      setError('Ingresa la razón social de tu empresa.');
      return;
    }

    setError(null);
    createOrganization(
      {
        legalName: formState.legalName.trim(),
        type: activityType,
        size: employeeRange,
        country: formState.country,
        structure: formState.structure,
        website: formState.website.trim() || undefined,
      },
      {
        onSuccess: ({ accessToken, membershipId, organization, refreshToken, roleId }) => {
          setWorkspaceContext({
            workspaceToken: accessToken,
            membershipId,
            organization,
            refreshToken,
            roleId,
          });
          navigate(PrivateRoutes.ROOT, { replace: true });
        },
        onError: (err) => {
          setError(err instanceof Error ? err.message : 'No pudimos crear la cuenta.');
        },
      },
    );
  };

  return (
    <main className={styles.page}>
      <title>Crear cuenta - Helebba</title>
      <header className={styles.topbar}>
        <Link className={styles.brand} to={PublicRoutes.LOGIN} aria-label="Helebba">
          <img src="/images/logo.svg" alt="" />
        </Link>

        <div className={styles.topbarAction}>
          <details className={styles.profileMenu}>
            <summary className={styles.profileSummary} aria-label="Abrir menú de cuenta">
              <Avatar name={profileName} size="sm" />
              <div className={styles.topbarInfo}>
                <h6>{profileName}</h6>
                <span>{profileEmail}</span>
              </div>
            </summary>

            <div className={styles.profileDropdown}>
              <button type="button" onClick={handleSignOut}>
                Cerrar sesión
              </button>
            </div>
          </details>
        </div>
      </header>
      <section className={styles.card} aria-labelledby="organization-setup-title">
        <form className={styles.form} onSubmit={submit}>
          <div className={styles.header}>
            <h1 id="organization-setup-title">Introduce los datos de tu empresa</h1>
            <p className={styles.eyebrow}>
              Necesitamos algunos datos para configurar tu cuenta correctamente.
            </p>
          </div>

          <div className={styles.fieldGroup}>
            <span className={styles.groupLabel}>¿Qué tipo de negocio tienes?</span>
            <div className={styles.segmentGrid}>
              {activityTypes.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  className={styles.segmentButton}
                  data-selected={activityType === item.value || undefined}
                  disabled={isCreatingOrganization}
                  onClick={() => setActivityType(item.value)}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.fields}>
            <TextInput
              type="text"
              label="Razón Social *"
              placeholder="Nombre de la empresa"
              name="legalName"
              value={formState.legalName}
              onChange={handleChange}
              error={error ?? undefined}
              disabled={isCreatingOrganization}
            />
            <div className={styles.fieldGroup}>
              <span className={styles.groupLabel}>Número de empleados</span>
              <div className={styles.employeeGrid}>
                {employeeRanges.map((range) => (
                  <button
                    key={range}
                    type="button"
                    className={styles.employeeButton}
                    data-selected={employeeRange === range || undefined}
                    disabled={isCreatingOrganization}
                    onClick={() => setEmployeeRange(range)}
                  >
                    {range}
                  </button>
                ))}
              </div>
            </div>

            <label className={styles.selectField}>
              <span>País</span>
              <select
                name="country"
                value={formState.country}
                onChange={handleChange}
                disabled={isCreatingOrganization}
              >
                <option value="CO">Colombia</option>
                <option value="US">Estados Unidos</option>
                <option value="MX">México</option>
                <option value="ES">España</option>
              </select>
            </label>

            <label className={styles.selectField}>
              <span>Estructura legal</span>
              <select
                name="structure"
                value={formState.structure}
                onChange={handleChange}
                disabled={isCreatingOrganization}
              >
                <option value="company">Empresa</option>
                <option value="person">Persona natural</option>
                <option value="foundation">Fundación</option>
                <option value="other">Otra</option>
              </select>
            </label>
          </div>

          <TextInput
            type="url"
            label="Página web"
            placeholder="https://helebba.com"
            name="website"
            value={formState.website}
            onChange={handleChange}
            disabled={isCreatingOrganization}
          />

          <div className={styles.actions}>
            <Button
              variant="plain"
              type="button"
              disabled={isCreatingOrganization}
              onClick={() => navigate(PrivateRoutes.ACCOUNTS)}
            >
              Cancelar
            </Button>
            <Button type="submit" loading={isCreatingOrganization} disabled={isCreatingOrganization}>
              Continuar
            </Button>
          </div>
        </form>
      </section>
    </main>
  );
};

export default OrganizationSetup;
