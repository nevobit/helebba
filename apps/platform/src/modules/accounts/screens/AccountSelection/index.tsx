import { Avatar, LineScaleLoader } from '@hlb/design-system';
import { Link, useNavigate } from 'react-router-dom';
import { PrivateRoutes } from '@/app/router/routes';
import styles from './AccountSelection.module.css';
import { useSession } from '@/shared';
import { useLoginOrganization, useOrganizations } from '../../hooks';
import type { OrganizationId } from '@hlb/contracts';
import type { AccountListItem } from '../../services';

function getInitials(name?: string) {
  if (!name) return '';
  const parts = name.trim().split(/\s+/);
  const [a, b] = [parts[0], parts[1]];
  return (a?.[0] ?? '') + (b?.[0] ?? '');
}

const tones = (status: string) => {
  switch (status) {
    case '0':
      return 'plum';
    case '1':
      return 'mint';
    case '2':
      return 'lime';
    case '3':
      return 'blue';
  }
};

const AccountSelection = () => {
  const navigate = useNavigate();
  const setWorkspaceContext = useSession((state) => state.setWorkspaceContext);
  const { organizations, isLoading } = useOrganizations();
  const user = useSession((state) => state.user);

  const { loginOrganization } = useLoginOrganization();

  const selectOrganization = (organizationId: OrganizationId) => {
    loginOrganization(organizationId, {
      onSuccess: ({ accessToken, membershipId, organization }) => {
        setWorkspaceContext({
          workspaceToken: accessToken,
          membershipId,
          organization,
        });
        navigate(PrivateRoutes.ROOT, { replace: true });
      },
    });
  };

  if (isLoading) return <LineScaleLoader />;

  return (
    <main className={styles.page}>
      <title>Helebba</title>
      <header className={styles.topbar}>
        <Link className={styles.brand} to={PrivateRoutes.ACCOUNTS} aria-label="Helebba">
          <img src="/images/logo.svg" alt="" />
        </Link>

        <button className={styles.profileButton} type="button">
          <Avatar name={user?.name} />
          <span className={styles.profileText}>
            <strong>{user?.name}</strong>
            <span>{user?.email}</span>
          </span>
        </button>
      </header>

      <section className={styles.content} aria-labelledby="accounts-title">
        <div className={styles.hero}>
          <h1 id="accounts-title">Hola, {user?.name}</h1>
          <p>
            Selecciona una cuenta o <Link to={PrivateRoutes.NEW_ACCOUNT}>crea una nueva</Link>
          </p>
        </div>

        {/* <section className={styles.section} aria-labelledby="pending-title">
          <h2 id="pending-title">
            Invitaciones pendientes <span>({invitations.length})</span>
          </h2>

          <div className={styles.invitationGrid}>
            {invitations.map((invitation) => (
              <article className={styles.invitationCard} key={invitation.id}>
                <span className={styles.avatar} data-tone={invitation.tone}>
                  {invitation.initials}
                </span>

                <div className={styles.cardText}>
                  <strong>{invitation.name}</strong>
                  <span>Invitación pendiente</span>
                </div>

                <button className={styles.iconButton} type="button" aria-label="Más opciones">
                  ⋮
                </button>
                <Button size="medium">Aceptar</Button>
              </article>
            ))}
          </div>
        </section> */}

        <section className={styles.section} aria-labelledby="owned-title">
          <h2 id="owned-title">
            Tus cuentas <span>({organizations.length})</span>
          </h2>

          <div className={styles.accountGrid}>
            {organizations.map((organization: AccountListItem, index: number) => (
              <button
                onClick={() => selectOrganization(organization.id)}
                className={styles.accountCard}
                key={organization.id}
                type="button"
              >
                <div className={styles.accountHeader}>
                  <span className={styles.avatar} data-tone={tones(String(index))}>
                    {getInitials(organization.name)}
                  </span>

                  {/* {account.trial && (
                    <span className={styles.trialBadge}>
                      <span aria-hidden="true" />
                      Prueba
                    </span>
                  )} */}
                </div>

                {/* {account.trial && <span className={styles.trialText}>{account.trial}</span>} */}
                <strong>{organization.name}</strong>
              </button>
            ))}
          </div>
        </section>
        {/* 
        <button className={styles.endedButton} type="button">
          Prueba finalizada <span aria-hidden="true">⌄</span>
        </button> */}
      </section>
    </main>
  );
};

export default AccountSelection;
