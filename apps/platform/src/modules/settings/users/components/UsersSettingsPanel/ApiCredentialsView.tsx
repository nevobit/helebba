import { useMemo, useState, type FormEvent } from 'react';
import { Button, Modal, TextInput, useModal } from '@hlb/design-system';
import { Code2, Copy, KeyRound, Plus, Search, ShieldCheck, TriangleAlert } from 'lucide-react';
import { useApiKeys, useCreateApiKey, useRevokeApiKey } from '../../hooks';
import type { ExternalApiKey } from '../../services';
import styles from './UsersSettingsPanel.module.css';

type CreateApiKeyForm = {
  name: string;
  search: string;
  scopes: string[];
};

const availableScopes = [
  {
    key: 'inventory',
    label: 'Inventario',
    description: 'Leer productos, marcas y categorías desde aplicaciones externas.',
    scopes: ['inventory:read'],
  },
];

const initialCreateForm: CreateApiKeyForm = {
  name: '',
  search: '',
  scopes: ['inventory:read'],
};

const getApiKeyId = (apiKey: ExternalApiKey) => String(apiKey.id ?? apiKey._id ?? '');

const formatDate = (value?: string | null) => {
  if (!value) return '-';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';

  return new Intl.DateTimeFormat('es-CO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
};

const formatScopes = (scopes: string[]) => {
  if (!scopes.length) return 'Sin permisos';
  if (scopes.includes('inventory:read')) return 'Inventario lectura';
  return `${scopes.length} permisos seleccionados`;
};

export const ApiCredentialsView = () => {
  const { apiKeys, isLoading } = useApiKeys();
  const { createApiKey, isCreatingApiKey, resetCreatedApiKey } = useCreateApiKey();
  const { isRevokingApiKey, revokeApiKey, revokingApiKeyId } = useRevokeApiKey();
  const { requestCloseModal } = useModal();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [generatedToken, setGeneratedToken] = useState<string | null>(null);
  const [isTokenVisible, setIsTokenVisible] = useState(true);
  const [hasCopiedToken, setHasCopiedToken] = useState(false);
  const [form, setForm] = useState<CreateApiKeyForm>(initialCreateForm);

  const filteredScopes = useMemo(() => {
    const term = form.search.trim().toLowerCase();
    if (!term) return availableScopes;

    return availableScopes.filter(
      (scope) =>
        scope.label.toLowerCase().includes(term) ||
        scope.description.toLowerCase().includes(term) ||
        scope.scopes.some((item) => item.toLowerCase().includes(term)),
    );
  }, [form.search]);

  const activeKeys = apiKeys.filter((apiKey) => apiKey.status === 'active');

  const openCreateModal = () => {
    setForm(initialCreateForm);
    setIsCreateModalOpen(true);
  };

  const closeCreateModal = () => {
    setIsCreateModalOpen(false);
    setForm(initialCreateForm);
  };

  const closeGeneratedTokenModal = () => {
    setGeneratedToken(null);
    setHasCopiedToken(false);
    setIsTokenVisible(true);
    resetCreatedApiKey();
  };

  const toggleScopeGroup = (scopes: string[]) => {
    setForm((current) => {
      const currentScopes = new Set(current.scopes);
      const hasAllScopes = scopes.every((scope) => currentScopes.has(scope));

      if (hasAllScopes) {
        scopes.forEach((scope) => currentScopes.delete(scope));
      } else {
        scopes.forEach((scope) => currentScopes.add(scope));
      }

      return { ...current, scopes: [...currentScopes] };
    });
  };

  const submitApiKey = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.name.trim() || !form.scopes.length) return;

    createApiKey(
      {
        name: form.name.trim(),
        scopes: form.scopes,
      },
      {
        onSuccess: (created) => {
          closeCreateModal();
          setGeneratedToken(created.apiKey);
        },
      },
    );
  };

  const copyGeneratedToken = async () => {
    if (!generatedToken) return;

    await navigator.clipboard.writeText(generatedToken);
    setHasCopiedToken(true);
  };

  const confirmRevokeApiKey = (apiKey: ExternalApiKey) => {
    if (apiKey.status !== 'active') return;
    const apiKeyId = getApiKeyId(apiKey);
    if (!apiKeyId) return;

    requestCloseModal({
      title: 'Revocar API Token',
      description: `El token "${apiKey.name}" dejará de funcionar inmediatamente en las aplicaciones conectadas.`,
      confirmLabel: 'Revocar token',
      cancelLabel: 'Cancelar',
      onConfirm: () => revokeApiKey(apiKeyId),
    });
  };

  return (
    <>
      <section className={styles.card}>
        <div className={styles.apiCredentialsHeader}>
          <div>
            <h3>API Tokens</h3>
            <p>Conecta Helebba con aplicaciones externas usando tokens seguros.</p>
          </div>
          <div className={styles.headerControls}>
            <Button
              theme="optional"
              variant="outline"
              size="medium"
              icon={<Code2 size={17} />}
              disabled
              title="Próximamente"
            >
              Documentación API
            </Button>
            <Button size="medium" icon={<Plus size={17} />} onClick={openCreateModal}>
              Agregar API Token
            </Button>
          </div>
        </div>

        <div className={styles.apiTable}>
          <div className={styles.apiHeaderRow}>
            <span>Descripción</span>
            <span>Ámbitos</span>
            <span>Último uso</span>
            <span>Creado</span>
            <span>Estado</span>
          </div>

          {!isLoading && apiKeys.length === 0 ? (
            <div className={styles.apiEmptyState}>
              <span className={styles.apiEmptyIcon}>
                <Code2 size={30} />
              </span>
              <h3>Aún no tienes API Tokens</h3>
              <p>Conecta tus aplicaciones y automatiza flujos usando tokens de acceso seguros.</p>
              <Button size="medium" onClick={openCreateModal}>
                Crea tu primer API Token
              </Button>
            </div>
          ) : (
            apiKeys.map((apiKey) => {
              const apiKeyId = getApiKeyId(apiKey);
              const isRevoking = isRevokingApiKey && revokingApiKeyId === apiKeyId;

              return (
                <div className={styles.apiRow} key={apiKeyId || apiKey.keyLast4}>
                  <span className={styles.apiNameCell}>
                    <strong>{apiKey.name}</strong>
                    <small>
                      {apiKey.keyPrefix}_••••{apiKey.keyLast4}
                    </small>
                  </span>
                  <span className={styles.apiScopes}>
                    <ShieldCheck size={15} />
                    {formatScopes(apiKey.scopes)}
                  </span>
                  <span>{formatDate(apiKey.lastUsedAt)}</span>
                  <span>{formatDate(apiKey.createdAt)}</span>
                  <button
                    className={styles.apiStatusSwitch}
                    type="button"
                    data-active={apiKey.status === 'active'}
                    disabled={apiKey.status !== 'active' || isRevoking}
                    aria-label={
                      apiKey.status === 'active' ? 'Revocar API Token' : 'API Token revocado'
                    }
                    onClick={() => confirmRevokeApiKey(apiKey)}
                  >
                    <span />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </section>

      {activeKeys.length > 0 && (
        <p className={styles.apiHelperText}>
          Las claves secretas solo se muestran al crearlas. Guarda el token en un gestor seguro.
        </p>
      )}

      {isCreateModalOpen && (
        <Modal.Window
          isOpen
          ariaLabel="Crear API Token"
          className={styles.apiTokenModal}
          closeOnEsc
          closeOnOverlay
          onClose={closeCreateModal}
          size={{ width: '92rem', maxWidth: 'calc(100vw - 3.2rem)' }}
        >
          <Modal.Header className={styles.apiTokenModalHeader}>
            <div>
              <h2>Crear API Token</h2>
              <p>Genera credenciales para el acceso programático y seguro a tus datos.</p>
            </div>
            <Modal.CloseButton onClick={closeCreateModal} label="Cerrar" />
          </Modal.Header>
          <form onSubmit={submitApiKey}>
            <Modal.Body className={styles.apiTokenModalBody}>
              <TextInput
                label="Descripción"
                name="name"
                value={form.name}
                placeholder="Descripción"
                required
                fullWidth
                onChange={(event) =>
                  setForm((current) => ({ ...current, name: event.target.value }))
                }
              />

              <div className={styles.apiPermissionGrid}>
                <section className={styles.apiPermissionBox}>
                  <h3>Permisos</h3>
                  <TextInput
                    labelHidden
                    label="Filtrar permisos"
                    icon={<Search size={17} />}
                    value={form.search}
                    placeholder="Filtrar por área o recurso"
                    fullWidth
                    onChange={(event) =>
                      setForm((current) => ({ ...current, search: event.target.value }))
                    }
                  />
                  <div className={styles.apiPermissionList}>
                    {filteredScopes.map((scopeGroup) => {
                      const isSelected = scopeGroup.scopes.every((scope) =>
                        form.scopes.includes(scope),
                      );

                      return (
                        <button
                          key={scopeGroup.key}
                          type="button"
                          className={styles.apiPermissionItem}
                          data-selected={isSelected}
                          onClick={() => toggleScopeGroup(scopeGroup.scopes)}
                        >
                          <span>
                            <span className={styles.apiPermissionDot} />
                            <strong>{scopeGroup.label}</strong>
                            <small>{scopeGroup.description}</small>
                          </span>
                          <em>{isSelected ? 'Lectura' : 'None'}</em>
                        </button>
                      );
                    })}
                  </div>
                </section>

                <section className={styles.apiPermissionBox}>
                  <h3>Permisos seleccionados</h3>
                  {form.scopes.length === 0 ? (
                    <p className={styles.apiNoPermissions}>No hay permisos seleccionados</p>
                  ) : (
                    <div className={styles.apiSelectedPermissions}>
                      {availableScopes
                        .filter((scopeGroup) =>
                          scopeGroup.scopes.some((scope) => form.scopes.includes(scope)),
                        )
                        .map((scopeGroup) => (
                          <span key={scopeGroup.key}>
                            <ShieldCheck size={15} />
                            {scopeGroup.label}: lectura
                          </span>
                        ))}
                    </div>
                  )}
                </section>
              </div>

              <section className={styles.apiUsageBox}>
                <h3>
                  <KeyRound size={16} />
                  Uso del token
                </h3>
                <ul>
                  <li>
                    Usa el header <code>api-key: &lt;tu_clave_secreta&gt;</code>
                  </li>
                  <li>Los tokens solo tienen acceso a los permisos seleccionados.</li>
                  <li>Las claves secretas solo se muestran una vez.</li>
                </ul>
              </section>
            </Modal.Body>
            <footer className={styles.apiModalFooter}>
              <Button theme="optional" variant="outline" type="button" onClick={closeCreateModal}>
                Cancelar
              </Button>
              <Button
                type="submit"
                loading={isCreatingApiKey}
                disabled={!form.name.trim() || !form.scopes.length}
              >
                Crear Token
              </Button>
            </footer>
          </form>
        </Modal.Window>
      )}

      {generatedToken && (
        <Modal.Window
          isOpen
          ariaLabel="API Token generado"
          className={styles.generatedTokenModal}
          closeOnEsc
          closeOnOverlay={false}
          onClose={closeGeneratedTokenModal}
          size={{ width: '68rem', maxWidth: 'calc(100vw - 3.2rem)' }}
        >
          <Modal.Header className={styles.apiTokenModalHeader}>
            <h2>API Token generado</h2>
            <Modal.CloseButton onClick={closeGeneratedTokenModal} label="Cerrar" />
          </Modal.Header>
          <Modal.Body className={styles.generatedTokenBody}>
            <p>
              Copia tu API Token ahora. Una vez que cierres este diálogo, no volverá a mostrarse.
            </p>
            <div className={styles.generatedTokenValue}>
              <code>
                {isTokenVisible ? generatedToken : '•'.repeat(Math.min(generatedToken.length, 48))}
              </code>
              <button
                type="button"
                aria-label={isTokenVisible ? 'Ocultar token' : 'Mostrar token'}
                onClick={() => setIsTokenVisible((current) => !current)}
              >
                <KeyRound size={16} />
              </button>
              <button type="button" aria-label="Copiar token" onClick={copyGeneratedToken}>
                <Copy size={16} />
              </button>
            </div>
            <div className={styles.apiWarningBox}>
              <TriangleAlert size={18} />
              <span>
                Mantén este token seguro. Cualquier persona con acceso a él puede leer los datos
                habilitados de tu organización.
              </span>
            </div>
          </Modal.Body>
          <footer className={styles.apiModalFooter}>
            <Button onClick={closeGeneratedTokenModal}>
              {hasCopiedToken ? 'Copiado' : 'Listo'}
            </Button>
          </footer>
        </Modal.Window>
      )}
    </>
  );
};
