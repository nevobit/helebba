import { useState, type ChangeEvent, type FormEvent, type ReactNode } from 'react';
import { Button, TextInput } from '@hlb/design-system';
import { ChevronRight, ExternalLink, Info, LockKeyhole, Menu, Upload, X } from 'lucide-react';
import { useSession } from '@/shared';
import { updateOrganization } from '@/modules/accounts/services';
import { SETTINGS_NAVIGATION_HASH } from '@/modules/settings/hooks';
import styles from './SettingsDataPanel.module.css';

type SettingsDataPanelProps = {
  onClose: () => void;
};

type SettingsDataFormState = {
  legalName: string;
  taxId: string;
  email: string;
  phone: string;
  website: string;
  billingAddress: string;
  billingCity: string;
  billingPostalCode: string;
  billingProvince: string;
  billingCountry: string;
  currency: string;
  numericFormat: string;
  decimals: string;
  timezone: string;
  language: string;
  dateFormat: string;
  brandColor: string;
};

type SelectFieldProps = {
  label: string;
  name: keyof SettingsDataFormState;
  value: string;
  children: ReactNode;
  onChange: (event: ChangeEvent<HTMLSelectElement>) => void;
};

const SelectField = ({ children, label, name, onChange, value }: SelectFieldProps) => (
  <label className={styles.selectField}>
    <span>{label}</span>
    <select name={name} value={value} onChange={onChange}>
      {children}
    </select>
  </label>
);

const decimalOption = (value?: number) => {
  if (value === 0) return '0 (1500)';
  if (value === 4) return '4 (1500.1532)';
  return '2 (1500.15)';
};

export const SettingsDataPanel = ({ onClose }: SettingsDataPanelProps) => {
  const organization = useSession((state) => state.organization);
  const user = useSession((state) => state.user);

  const [formState, setFormState] = useState<SettingsDataFormState>(() => ({
    legalName: organization?.legalName ?? organization?.name ?? '',
    taxId: organization?.taxId ?? '',
    email: organization?.email ?? user?.email ?? '',
    phone: organization?.phone ?? '',
    website: organization?.website ?? '',
    billingAddress: organization?.billingAddress ?? '',
    billingCity: organization?.billingCity ?? '',
    billingPostalCode: organization?.billingPostalCode ?? '',
    billingProvince: organization?.billingProvince ?? '',
    billingCountry: organization?.billingCountry ?? organization?.country ?? 'Colombia',
    currency: organization?.currency ?? 'COP',
    numericFormat: organization?.numericFormat ?? '1.593,50',
    decimals: decimalOption(organization?.decimals),
    timezone: organization?.timezone ?? 'America/Bogota',
    language: organization?.language ?? 'Español',
    dateFormat: organization?.dateFormat ?? 'dd/mm/yyyy',
    brandColor: organization?.brandColor ?? '#4181f2',
  }));
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const updateField = (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    setFormState((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);
    setSaveError(null);
    try {
      const { organization: updatedOrganization } = await updateOrganization({
        legalName: formState.legalName,
        taxId: formState.taxId,
        email: formState.email,
        phone: formState.phone,
        website: formState.website,
        billingAddress: formState.billingAddress,
        billingCity: formState.billingCity,
        billingPostalCode: formState.billingPostalCode,
        billingProvince: formState.billingProvince,
        billingCountry: formState.billingCountry,
        country: formState.billingCountry,
        currency: formState.currency,
        numericFormat: formState.numericFormat,
        decimals: Number.parseInt(formState.decimals, 10),
        timezone: formState.timezone,
        language: formState.language,
        dateFormat: formState.dateFormat,
        brandColor: formState.brandColor,
      });
      useSession.setState({ organization: updatedOrganization });
      onClose();
    } catch {
      setSaveError('No pudimos guardar los datos de la empresa. Inténtalo de nuevo.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className={styles.overlay} role="presentation">
      <aside className={styles.panel} aria-label="Preferencias generales de la cuenta">
        <form className={styles.form} onSubmit={handleSubmit}>
          <header className={styles.header}>
            <h2>{formState.legalName || 'Configuración'}</h2>
            <div className={styles.headerActions}>
              <Button
                type="button"
                theme="optional"
                size="slim"
                variant="outline"
                onClick={onClose}
                disabled={isSaving}
              >
                Cancelar
              </Button>
              <Button size="slim" type="submit" loading={isSaving} disabled={isSaving}>
                Guardar
              </Button>
              <button
                className={styles.closeButton}
                type="button"
                aria-label="Cerrar"
                onClick={onClose}
              >
                <X size={20} />
              </button>
            </div>
          </header>

          <div className={styles.content}>
            {saveError && <p className={styles.saveError}>{saveError}</p>}
            <nav className={styles.breadcrumb} aria-label="Ruta de configuración">
              <span>Configuración</span>
              <ChevronRight size={16} />
              <strong>Preferencias generales</strong>
            </nav>

            <section className={styles.card} aria-labelledby="navigation-settings-title">
              <div className={styles.lockHeader}>
                <div>
                  <h3 id="navigation-settings-title">Menú principal</h3>
                  <p className={styles.mutedText}>
                    Elige los módulos y opciones que quieres mostrar en la navegación superior.
                  </p>
                </div>
                <Menu size={20} />
              </div>
              <Button
                size="medium"
                theme="optional"
                variant="outline"
                onClick={() => {
                  window.location.hash = SETTINGS_NAVIGATION_HASH;
                }}
              >
                Configurar menú
              </Button>
            </section>

            <section className={styles.card} aria-labelledby="account-data-title">
              <div className={styles.cardHeader}>
                <h3 id="account-data-title">Datos de la cuenta</h3>
              </div>

              <div className={styles.cardBody}>
                <div className={styles.formGrid}>
                  <TextInput
                    label="Nombre de la empresa"
                    name="legalName"
                    value={formState.legalName}
                    fullWidth
                    onChange={updateField}
                  />
                  <TextInput
                    label="Núm. identificación fiscal"
                    name="taxId"
                    value={formState.taxId}
                    fullWidth
                    onChange={updateField}
                  />

                  <button className={styles.inlineAction} type="button">
                    + Introducir nombre comercial <Info size={14} />
                  </button>
                  <button className={styles.inlineAction} type="button">
                    + Introducir VAT
                  </button>

                  <TextInput
                    label="Email"
                    name="email"
                    type="email"
                    value={formState.email}
                    fullWidth
                    onChange={updateField}
                  />
                  <TextInput
                    label="Teléfono"
                    name="phone"
                    value={formState.phone}
                    fullWidth
                    onChange={updateField}
                  />

                  <TextInput
                    label="Página web"
                    hint="Opcional"
                    name="website"
                    value={formState.website}
                    placeholder="URL del sitio web de tu empresa"
                    fullWidth
                    onChange={updateField}
                  />

                  <div className={styles.photoField}>
                    <span className={styles.photoLabel}>
                      Foto de la cuenta <Info size={13} />
                    </span>
                    <div className={styles.photoControls}>
                      <span className={styles.logoPlaceholder}>Logo</span>
                      <Button
                        theme="optional"
                        size="medium"
                        variant="outline"
                        icon={<Upload size={16} />}
                      >
                        Subir foto
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className={styles.card} aria-labelledby="holded-id-title">
              <div className={styles.lockHeader}>
                <h3 id="holded-id-title">Helebba ID</h3>
                <LockKeyhole size={20} />
              </div>
              <p>
                Crea tu propia URL para utilizar tu marca en el acceso y el Portal del cliente,
                entre otras cosas.
              </p>
              <a
                className={styles.link}
                href="https://snapbdzrtsvjq.holded.com"
                target="_blank"
                rel="noreferrer"
              >
                https://snapbdzrtsvjq.holded.com <ExternalLink size={15} />
              </a>
              <Button
                className={styles.planButton}
                size="medium"
                theme="optional"
                variant="outline"
                icon={<LockKeyhole size={15} />}
              >
                Mejora tu plan y crea tu propio enlace
              </Button>
            </section>

            <section className={styles.card} aria-labelledby="billing-address-title">
              <div className={styles.cardHeader}>
                <h3 id="billing-address-title">Dirección de facturación</h3>
              </div>
              <div className={styles.cardBody}>
                <p className={styles.mutedText}>
                  La información que aparecerá en los documentos que emitas.
                </p>
                <div className={styles.formGrid}>
                  <TextInput
                    className={styles.fullField}
                    label="Dirección"
                    name="billingAddress"
                    value={formState.billingAddress}
                    placeholder="Dirección"
                    fullWidth
                    onChange={updateField}
                  />
                  <TextInput
                    label="Población"
                    name="billingCity"
                    value={formState.billingCity}
                    placeholder="Población"
                    fullWidth
                    onChange={updateField}
                  />
                  <TextInput
                    label="Código postal"
                    name="billingPostalCode"
                    value={formState.billingPostalCode}
                    placeholder="Código postal"
                    fullWidth
                    onChange={updateField}
                  />
                  <SelectField
                    label="Provincia"
                    name="billingProvince"
                    value={formState.billingProvince}
                    onChange={updateField}
                  >
                    <option value="">Seleccionar provincia</option>
                    <option value="Antioquia">Antioquia</option>
                    <option value="Cundinamarca">Cundinamarca</option>
                    <option value="Madrid">Madrid</option>
                  </SelectField>
                  <SelectField
                    label="País"
                    name="billingCountry"
                    value={formState.billingCountry}
                    onChange={updateField}
                  >
                    <option value="Colombia">Colombia</option>
                    <option value="España">España</option>
                    <option value="México">México</option>
                  </SelectField>
                </div>
              </div>
            </section>

            <section className={styles.card} aria-labelledby="preferences-title">
              <div className={styles.cardHeader}>
                <h3 id="preferences-title">Preferencias</h3>
              </div>
              <div className={styles.cardBody}>
                <div className={styles.formGrid}>
                  <SelectField
                    label="Moneda"
                    name="currency"
                    value={formState.currency}
                    onChange={updateField}
                  >
                    <option value="COP">Peso colombiano (COP)</option>
                    <option value="EUR">Euro (eur)</option>
                    <option value="USD">Dólar estadounidense (USD)</option>
                  </SelectField>
                  <SelectField
                    label="Formato numérico"
                    name="numericFormat"
                    value={formState.numericFormat}
                    onChange={updateField}
                  >
                    <option value="1.593,50">1.593,50</option>
                    <option value="1,593.50">1,593.50</option>
                  </SelectField>
                  <SelectField
                    label="Decimales"
                    name="decimals"
                    value={formState.decimals}
                    onChange={updateField}
                  >
                    <option value="2 (1500.15)">2 (1500.15)</option>
                    <option value="0 (1500)">0 (1500)</option>
                    <option value="4 (1500.1532)">4 (1500.1532)</option>
                  </SelectField>
                  <SelectField
                    label="Zona horaria"
                    name="timezone"
                    value={formState.timezone}
                    onChange={updateField}
                  >
                    <option value="America/Bogota">America/Bogota</option>
                    <option value="Europe/Madrid">Europe/Madrid</option>
                    <option value="America/Mexico_City">America/Mexico_City</option>
                  </SelectField>
                  <SelectField
                    label="Idioma"
                    name="language"
                    value={formState.language}
                    onChange={updateField}
                  >
                    <option value="Español">Español</option>
                    <option value="English">English</option>
                  </SelectField>
                  <SelectField
                    label="Formato de fecha"
                    name="dateFormat"
                    value={formState.dateFormat}
                    onChange={updateField}
                  >
                    <option value="dd/mm/yyyy">dd/mm/yyyy</option>
                    <option value="mm/dd/yyyy">mm/dd/yyyy</option>
                    <option value="yyyy-mm-dd">yyyy-mm-dd</option>
                  </SelectField>
                  <TextInput
                    label="Color corporativo"
                    name="brandColor"
                    value={formState.brandColor}
                    prefix={
                      <span
                        className={styles.colorSwatch}
                        style={{ backgroundColor: formState.brandColor }}
                      />
                    }
                    fullWidth
                    onChange={updateField}
                  />
                </div>
              </div>
            </section>

            <section className={styles.legalCard} aria-label="Documentos legales">
              <div className={styles.legalRow}>
                <span>Términos y condiciones</span>
                <a href="/terms" target="_blank" rel="noreferrer">
                  Ver
                </a>
              </div>
              <div className={styles.legalRow}>
                <span>Política de Cookies</span>
                <a href="/cookies" target="_blank" rel="noreferrer">
                  Ver
                </a>
              </div>
              <div className={styles.legalRow}>
                <span>Política de Privacidad</span>
                <a href="/privacy" target="_blank" rel="noreferrer">
                  Ver
                </a>
              </div>
              <div className={styles.legalRow}>
                <span>GDPR {formState.email}</span>
                <a href="/gdpr" target="_blank" rel="noreferrer">
                  Ver
                </a>
              </div>
            </section>

            <section className={styles.dangerSection} aria-labelledby="delete-account-title">
              <div>
                <h3 id="delete-account-title">Eliminar cuenta</h3>
                <p>
                  Al borrar tu cuenta, perderás la información sobre tu negocio y dejarás de tener
                  acceso a Helebba. Por ello, es aconsejable que exportes todos tus datos antes de
                  continuar.
                  <a href="/help/export-data" target="_blank" rel="noreferrer">
                    {' '}
                    Aprende más sobre la exportación de datos.
                  </a>
                </p>
              </div>
              <Button size="medium" variant="outline" tone="critical">
                Eliminar cuenta
              </Button>
            </section>
          </div>
        </form>
      </aside>
    </div>
  );
};
