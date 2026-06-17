import { useState, type ChangeEvent, type FormEvent } from 'react';
import { Button, TextInput } from '@hlb/design-system';
import { Building2, ChevronDown, CreditCard, Landmark, Receipt, Trash2 } from 'lucide-react';
import { useContactFormOptions, useCreateContact, useUpdateContact } from '../../hooks';
import type { CreateContactPayload } from '../../services';
import type { ContactRow } from '../../types';
import type { CompanyId, UserId } from '@hlb/contracts';
import styles from './ContactForm.module.css';

export const CONTACT_FORM_ID = 'contact-form';

type ContactFormProps = {
  contact?: ContactRow;
  onDirtyChange?: (dirty: boolean) => void;
  onCancel: () => void;
  onSuccess?: () => void;
};

type FormState = {
  name: string;
  code: string;
  isPerson: boolean;
  companyId: string;
  address: string;
  city: string;
  postalCode: string;
  department: string;
  country: string;
  tradeName: string;
  assignedUsers: string;
  email: string;
  phone: string;
  mobile: string;
  website: string;
  tags: string;
  type: string;
  salesAccount: string;
  purchaseAccount: string;
  language: string;
  currency: string;
  paymentMethod: string;
  paymentDue: string;
  discount: string;
  rate: string;
  paymentDay: string;
  showTradeNameOnInvoices: boolean;
  showCountryOnInvoices: boolean;
  salesTax: string;
  purchaseTax: string;
  customerAccount: string;
  supplierAccount: string;
  operation: string;
  model347: string;
};

type BankAccountForm = {
  id: string;
  bank: string;
  accountNumber: string;
  swift: string;
  accountType: string;
  holderName: string;
  currency: string;
  reference: string;
  isDefault: boolean;
};

const initialState: FormState = {
  name: '',
  code: '',
  isPerson: false,
  companyId: '',
  address: '',
  city: '',
  postalCode: '',
  department: '',
  country: 'Colombia',
  tradeName: '',
  assignedUsers: '',
  email: '',
  phone: '',
  mobile: '',
  website: '',
  tags: '',
  type: '',
  salesAccount: '',
  purchaseAccount: '',
  language: 'Español - Colombia',
  currency: 'COP',
  paymentMethod: '',
  paymentDue: '',
  discount: '',
  rate: 'Predeterminado',
  paymentDay: '',
  showTradeNameOnInvoices: false,
  showCountryOnInvoices: true,
  salesTax: '',
  purchaseTax: '',
  customerAccount: '',
  supplierAccount: '',
  operation: 'General',
  model347: 'No',
};

const createBankAccountForm = (index: number): BankAccountForm => ({
  id: `bank-${Date.now()}-${index}`,
  bank: '',
  accountNumber: '',
  swift: '',
  accountType: '',
  holderName: '',
  currency: '',
  reference: '',
  isDefault: index === 0,
});

const trimOrUndefined = (value: string) => {
  const trimmed = value.trim();
  return trimmed || undefined;
};

const trimForSave = (value: string, preserveEmpty: boolean) => {
  const trimmed = value.trim();
  return trimmed || (preserveEmpty ? '' : undefined);
};

const getInitialState = (contact?: ContactRow): FormState => {
  if (!contact) return initialState;

  return {
    ...initialState,
    name: contact.name,
    code: contact.code,
    isPerson: contact.isPerson,
    companyId: contact.companyId,
    address: contact.address,
    city: contact.city,
    postalCode: contact.postalCode,
    department: contact.department,
    country: contact.country || initialState.country,
    tradeName: contact.tradeName,
    email: contact.email,
    phone: contact.phone,
    mobile: contact.mobile,
    website: contact.website,
    tags: contact.tags,
    type: contact.kind === 'Empresa' || contact.kind === 'Persona' ? '' : contact.kind,
  };
};

export const ContactForm = ({ contact, onCancel, onDirtyChange, onSuccess }: ContactFormProps) => {
  const [formState, setFormState] = useState<FormState>(() => getInitialState(contact));
  const [bankAccounts, setBankAccounts] = useState<BankAccountForm[]>([]);
  const [activeTab, setActiveTab] = useState('basic');
  const [error, setError] = useState<string | null>(null);
  const { createContact, isCreatingContact } = useCreateContact();
  const { updateContact, isUpdatingContact } = useUpdateContact();
  const { companies, isLoadingCompanies, isLoadingUsers, users } = useContactFormOptions();
  const isSavingContact = isCreatingContact || isUpdatingContact;
  const isEditing = Boolean(contact);

  const setDirty = () => onDirtyChange?.(true);

  const updateField = (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    setFormState((current) => ({ ...current, [name]: value }));
    setError(null);
    setDirty();
  };

  const updateCheckbox = (event: ChangeEvent<HTMLInputElement>) => {
    const { checked, name } = event.target;
    setFormState((current) => ({ ...current, [name]: checked }));
    setDirty();
  };

  const setContactKind = (isPerson: boolean) => {
    setFormState((current) => ({ ...current, companyId: isPerson ? current.companyId : '', isPerson }));
    setDirty();
  };

  const addBankAccount = () => {
    setBankAccounts((current) => [...current, createBankAccountForm(current.length)]);
    setActiveTab('banks');
    setDirty();
  };

  const removeBankAccount = (bankId: string) => {
    setBankAccounts((current) => {
      const nextAccounts = current.filter((account) => account.id !== bankId);

      if (nextAccounts.length > 0 && !nextAccounts.some((account) => account.isDefault)) {
        return nextAccounts.map((account, index) => ({ ...account, isDefault: index === 0 }));
      }

      return nextAccounts;
    });
    setDirty();
  };

  const updateBankAccountField =
    (bankId: string, field: keyof Omit<BankAccountForm, 'id' | 'isDefault'>) =>
    (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { value } = event.target;
      setBankAccounts((current) =>
        current.map((account) => (account.id === bankId ? { ...account, [field]: value } : account)),
      );
      setDirty();
    };

  const setDefaultBankAccount = (bankId: string, isDefault: boolean) => {
    setBankAccounts((current) =>
      current.map((account) => ({
        ...account,
        isDefault: isDefault ? account.id === bankId : account.id === bankId ? false : account.isDefault,
      })),
    );
    setDirty();
  };

  const getNormalizedBankAccounts = () => {
    const normalized = bankAccounts
      .map((account) => ({
        bank: trimOrUndefined(account.bank),
        accountNumber: trimOrUndefined(account.accountNumber),
        swift: trimOrUndefined(account.swift),
        accountType: trimOrUndefined(account.accountType),
        holderName: trimOrUndefined(account.holderName),
        currency: trimOrUndefined(account.currency),
        reference: trimOrUndefined(account.reference),
        isDefault: account.isDefault,
      }))
      .filter((account) =>
        Boolean(
          account.bank ||
            account.accountNumber ||
            account.swift ||
            account.accountType ||
            account.holderName ||
            account.currency ||
            account.reference,
        ),
      );

    if (normalized.length === 0) {
      return undefined;
    }

    if (normalized.some((account) => account.isDefault)) {
      return normalized;
    }

    return normalized.map((account, index) => ({ ...account, isDefault: index === 0 }));
  };

  const buildPayload = (): CreateContactPayload => {
    const normalizedBankAccounts = getNormalizedBankAccounts();
    const preserveEmpty = isEditing;

    return {
      name: formState.name.trim(),
      code: trimForSave(formState.code, preserveEmpty),
      isPerson: formState.isPerson,
      companyId: trimOrUndefined(formState.companyId) as CompanyId | undefined,
      address: trimForSave(formState.address, preserveEmpty),
      city: trimForSave(formState.city, preserveEmpty),
      postalCode: trimForSave(formState.postalCode, preserveEmpty),
      department: trimForSave(formState.department, preserveEmpty),
      country: trimForSave(formState.country, preserveEmpty),
      tradeName: trimForSave(formState.tradeName, preserveEmpty),
      email: trimForSave(formState.email, preserveEmpty),
      phone: trimForSave(formState.phone, preserveEmpty),
      mobile: trimForSave(formState.mobile, preserveEmpty),
      website: trimForSave(formState.website, preserveEmpty),
      tags: formState.tags
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean),
      type: trimForSave(formState.type, preserveEmpty),
      assignedUserIds: formState.assignedUsers ? [formState.assignedUsers as UserId] : undefined,
      bankAccounts: normalizedBankAccounts,
      iban: normalizedBankAccounts?.[0]?.accountNumber,
      swift: normalizedBankAccounts?.[0]?.swift,
    };
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!formState.name.trim()) {
      setError('Ingresa el nombre del contacto.');
      return;
    }

    const handleSuccess = () => {
      onDirtyChange?.(false);
      onSuccess?.();
    };

    const handleError = (err: unknown) => {
      setError(
        err instanceof Error
          ? err.message
          : isEditing
            ? 'No pudimos actualizar el contacto.'
            : 'No pudimos crear el contacto.',
      );
    };

    if (contact) {
      updateContact(
        { contactId: contact.id, payload: buildPayload() },
        { onSuccess: handleSuccess, onError: handleError },
      );
      return;
    }

    createContact(buildPayload(), { onSuccess: handleSuccess, onError: handleError });
  };

  return (
    <form id={CONTACT_FORM_ID} className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.topFields}>
        <TextInput
          label="Nombre"
          labelHidden
          placeholder="Nombre"
          name="name"
          value={formState.name}
          error={error ?? undefined}
          disabled={isSavingContact}
          autoFocus
          onChange={updateField}
        />

        <TextInput
          label="Número de identificación"
          placeholder="Número de identificación"
          name="code"
          value={formState.code}
          disabled={isSavingContact}
          onChange={updateField}
        />

        <fieldset className={styles.kindField}>
          <legend>Este contacto es...</legend>
          <div className={styles.kindControl}>
            <button
              type="button"
              data-active={!formState.isPerson || undefined}
              disabled={isSavingContact}
              onClick={() => setContactKind(false)}
            >
              Empresa
            </button>
            <button
              type="button"
              data-active={formState.isPerson || undefined}
              disabled={isSavingContact}
              onClick={() => setContactKind(true)}
            >
              Persona
            </button>
          </div>
        </fieldset>
      </div>

      <nav className={styles.tabs} aria-label="Secciones del contacto">
        {[
          ['basic', 'Básico'],
          ['banks', 'Bancos'],
          ['preferences', 'Preferencias'],
          ['accounting', 'Contabilidad'],
        ].map(([key, label]) => (
          <button
            key={key}
            type="button"
            data-active={activeTab === key || undefined}
            onClick={() => setActiveTab(key)}
          >
            {label}
          </button>
        ))}
      </nav>

      {activeTab === 'basic' ? (
        <div className={styles.fieldsGrid}>
          <div className={styles.column}>
            <TextInput
              label="Dirección"
              placeholder="Dirección"
              name="address"
              value={formState.address}
              disabled={isSavingContact}
              onChange={updateField}
            />

            <div className={styles.twoColumns}>
              <TextInput
                label="Ciudad"
                placeholder="Ciudad"
                name="city"
                value={formState.city}
                disabled={isSavingContact}
                onChange={updateField}
              />
              <TextInput
                label="Código postal"
                placeholder="Código postal"
                name="postalCode"
                value={formState.postalCode}
                disabled={isSavingContact}
                onChange={updateField}
              />
            </div>

            <div className={styles.twoColumns}>
              <TextInput
                label="Departamento"
                placeholder="Departamento"
                name="department"
                value={formState.department}
                disabled={isSavingContact}
                onChange={updateField}
              />
              <label className={styles.selectField}>
                <span>País</span>
                <select
                  name="country"
                  value={formState.country}
                  disabled={isSavingContact}
                  onChange={updateField}
                >
                  <option value="Colombia">Colombia</option>
                  <option value="Estados Unidos">Estados Unidos</option>
                  <option value="México">México</option>
                  <option value="España">España</option>
                </select>
              </label>
            </div>

            <TextInput
              label="Nombre comercial"
              placeholder="Nombre comercial"
              name="tradeName"
              value={formState.tradeName}
              disabled={isSavingContact}
              onChange={updateField}
            />

            <label className={styles.selectField}>
              <span>Asignar usuarios</span>
              <select
                name="assignedUsers"
                value={formState.assignedUsers}
                disabled={isSavingContact || isLoadingUsers}
                onChange={updateField}
              >
                <option value="">{isLoadingUsers ? 'Cargando usuarios...' : 'Usuarios'}</option>
                {users.map((user) => (
                  <option key={user.userId} value={user.userId}>
                    {user.name} ({user.email})
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className={styles.column}>
            {formState.isPerson && (
              <label className={styles.selectField}>
                <span>Empresa</span>
                <select
                  name="companyId"
                  value={formState.companyId}
                  disabled={isSavingContact || isLoadingCompanies}
                  onChange={updateField}
                >
                  <option value="">
                    {isLoadingCompanies ? 'Cargando compañías...' : 'Sin empresa asociada'}
                  </option>
                  {companies.map((company) => (
                    <option key={company.id} value={company.id}>
                      {company.name || company.tradeName}
                    </option>
                  ))}
                </select>
              </label>
            )}

            <TextInput
              label="Correo electrónico"
              placeholder="Correo electrónico"
              name="email"
              type="email"
              value={formState.email}
              disabled={isSavingContact}
              onChange={updateField}
            />

            <div className={styles.twoColumns}>
              <TextInput
                label="Teléfono"
                placeholder="Teléfono"
                name="phone"
                value={formState.phone}
                disabled={isSavingContact}
                onChange={updateField}
              />
              <TextInput
                label="Móvil"
                placeholder="Móvil"
                name="mobile"
                value={formState.mobile}
                disabled={isSavingContact}
                onChange={updateField}
              />
            </div>

            <TextInput
              label="Website"
              placeholder="Website"
              name="website"
              type="url"
              value={formState.website}
              disabled={isSavingContact}
              onChange={updateField}
            />

            <TextInput
              label="Tags"
              placeholder="Tags"
              name="tags"
              value={formState.tags}
              disabled={isSavingContact}
              onChange={updateField}
            />

            <label className={styles.selectField}>
              <span>Tipo de contacto</span>
              <select
                name="type"
                value={formState.type}
                disabled={isSavingContact}
                onChange={updateField}
              >
                <option value="">Sin especificar</option>
                <option value="Cliente">Cliente</option>
                <option value="Proveedor">Proveedor</option>
                <option value="Lead">Lead</option>
                <option value="Deudor">Deudor</option>
                <option value="Acreedor">Acreedor</option>
              </select>
            </label>
          </div>
        </div>
      ) : activeTab === 'banks' ? (
        bankAccounts.length === 0 ? (
          <div className={styles.banksEmpty}>
            <div className={styles.bankIllustration} aria-hidden="true">
              <div className={styles.bankDevice}>
                <span />
                <span />
              </div>
              <div className={`${styles.bankBubble} ${styles.bankBubbleGreen}`}>
                <Building2 size={24} strokeWidth={2.2} />
              </div>
              <div className={`${styles.bankBubble} ${styles.bankBubblePurple}`}>
                <Landmark size={24} strokeWidth={2.2} />
              </div>
              <div className={`${styles.bankBubble} ${styles.bankBubbleYellow}`}>
                <CreditCard size={23} strokeWidth={2.2} />
              </div>
              <div className={`${styles.bankBubble} ${styles.bankBubbleRed}`}>
                <Receipt size={23} strokeWidth={2.2} />
              </div>
            </div>

            <h3>Añade el primer banco para tu contacto</h3>
            <Button
              type="button"
              theme="optional"
              variant="outline"
              size="medium"
              onClick={addBankAccount}
            >
              Añadir banco
            </Button>
          </div>
        ) : (
          <div className={styles.banksList}>
            {bankAccounts.map((bankAccount) => (
              <fieldset key={bankAccount.id} className={styles.bankCard}>
                <legend>
                  <ChevronDown size={17} strokeWidth={2.2} />
                  Banco
                </legend>

                <div className={styles.bankGrid}>
                  <label className={styles.selectField}>
                    <span>Banco</span>
                    <select
                      value={bankAccount.bank}
                      disabled={isSavingContact}
                      onChange={updateBankAccountField(bankAccount.id, 'bank')}
                    >
                      <option value="">Escoger</option>
                      <option value="Bancolombia">Bancolombia</option>
                      <option value="Banco de Bogotá">Banco de Bogotá</option>
                      <option value="Davivienda">Davivienda</option>
                      <option value="BBVA">BBVA</option>
                      <option value="Nequi">Nequi</option>
                    </select>
                  </label>

                  <TextInput
                    label="Número de cuenta"
                    placeholder="Número de cuenta"
                    value={bankAccount.accountNumber}
                    disabled={isSavingContact}
                    onChange={updateBankAccountField(bankAccount.id, 'accountNumber')}
                  />

                  <TextInput
                    label="Código SWIFT/BIC"
                    placeholder="Código SWIFT/BIC"
                    value={bankAccount.swift}
                    disabled={isSavingContact}
                    onChange={updateBankAccountField(bankAccount.id, 'swift')}
                  />

                  <TextInput
                    label="Tipo de cuenta"
                    placeholder="Tipo de cuenta"
                    value={bankAccount.accountType}
                    disabled={isSavingContact}
                    onChange={updateBankAccountField(bankAccount.id, 'accountType')}
                  />

                  <TextInput
                    label="Nombre del titular"
                    placeholder="Nombre del titular"
                    value={bankAccount.holderName}
                    disabled={isSavingContact}
                    onChange={updateBankAccountField(bankAccount.id, 'holderName')}
                  />

                  <TextInput
                    label="Moneda"
                    placeholder="Moneda"
                    value={bankAccount.currency}
                    disabled={isSavingContact}
                    onChange={updateBankAccountField(bankAccount.id, 'currency')}
                  />
                </div>

                <TextInput
                  label="Referencia"
                  placeholder="Referencia"
                  value={bankAccount.reference}
                  disabled={isSavingContact}
                  onChange={updateBankAccountField(bankAccount.id, 'reference')}
                />

                <div className={styles.bankActions}>
                  <label className={styles.inlineCheckbox}>
                    <input
                      type="checkbox"
                      checked={bankAccount.isDefault}
                      disabled={isSavingContact}
                      onChange={(event) =>
                        setDefaultBankAccount(bankAccount.id, event.target.checked)
                      }
                    />
                    Banco predeterminado
                  </label>

                  <button
                    type="button"
                    className={styles.deleteBankButton}
                    disabled={isSavingContact}
                    onClick={() => removeBankAccount(bankAccount.id)}
                  >
                    <Trash2 size={14} strokeWidth={2} />
                    Eliminar
                  </button>
                </div>
              </fieldset>
            ))}

            <button
              type="button"
              className={styles.addBankLink}
              disabled={isSavingContact}
              onClick={addBankAccount}
            >
              Añadir banco
            </button>
          </div>
        )
      ) : activeTab === 'preferences' ? (
        <div className={styles.fieldsGrid}>
          <div className={styles.column}>
            <div className={styles.twoColumns}>
              <label className={styles.selectField}>
                <span>Idioma</span>
                <select
                  name="language"
                  value={formState.language}
                  disabled={isSavingContact}
                  onChange={updateField}
                >
                  <option value="Español - Colombia">Español - Colombia</option>
                  <option value="Español - México">Español - México</option>
                  <option value="English - United States">English - United States</option>
                </select>
              </label>

              <label className={styles.selectField}>
                <span>Moneda</span>
                <select
                  name="currency"
                  value={formState.currency}
                  disabled={isSavingContact}
                  onChange={updateField}
                >
                  <option value="COP">Colombian Peso (COP)</option>
                  <option value="USD">US Dollar (USD)</option>
                  <option value="MXN">Mexican Peso (MXN)</option>
                </select>
              </label>
            </div>

            <div className={styles.twoColumns}>
              <label className={styles.selectField}>
                <span>Cuenta de ventas</span>
                <select
                  name="salesAccount"
                  value={formState.salesAccount}
                  disabled={isSavingContact}
                  onChange={updateField}
                >
                  <option value="">Seleccionar cuenta</option>
                </select>
              </label>

              <label className={styles.selectField}>
                <span>Cuenta de compras</span>
                <select
                  name="purchaseAccount"
                  value={formState.purchaseAccount}
                  disabled={isSavingContact}
                  onChange={updateField}
                >
                  <option value="">Seleccionar cuenta</option>
                </select>
              </label>
            </div>

            <TextInput
              label="Referencia"
              placeholder="Referencia interna"
              name="code"
              value={formState.code}
              disabled={isSavingContact}
              onChange={updateField}
            />
          </div>

          <div className={styles.column}>
            <div className={styles.twoColumns}>
              <label className={styles.selectField}>
                <span>Método de pago</span>
                <select
                  name="paymentMethod"
                  value={formState.paymentMethod}
                  disabled={isSavingContact}
                  onChange={updateField}
                >
                  <option value="">Nada seleccionado</option>
                </select>
              </label>

              <label className={styles.selectField}>
                <span>Pendiente</span>
                <select
                  name="paymentDue"
                  value={formState.paymentDue}
                  disabled={isSavingContact}
                  onChange={updateField}
                >
                  <option value="">Sin fecha de vencimiento</option>
                </select>
              </label>
            </div>

            <div className={styles.twoColumns}>
              <TextInput
                label="Descuento %"
                placeholder="Sin descuento"
                name="discount"
                value={formState.discount}
                disabled={isSavingContact}
                onChange={updateField}
              />

              <label className={styles.selectField}>
                <span>Tarifa</span>
                <select
                  name="rate"
                  value={formState.rate}
                  disabled={isSavingContact}
                  onChange={updateField}
                >
                  <option value="Predeterminado">Predeterminado</option>
                </select>
              </label>
            </div>

            <label className={styles.selectField}>
              <span>Día de pago</span>
              <select
                name="paymentDay"
                value={formState.paymentDay}
                disabled={isSavingContact}
                onChange={updateField}
              >
                <option value="">Nada seleccionado</option>
              </select>
            </label>

            <div className={styles.checkList}>
              <label>
                <input
                  type="checkbox"
                  name="showTradeNameOnInvoices"
                  checked={formState.showTradeNameOnInvoices}
                  disabled={isSavingContact}
                  onChange={updateCheckbox}
                />
                Mostrar nombre comercial en facturas
              </label>
              <label>
                <input
                  type="checkbox"
                  name="showCountryOnInvoices"
                  checked={formState.showCountryOnInvoices}
                  disabled={isSavingContact}
                  onChange={updateCheckbox}
                />
                Mostrar país en facturas
              </label>
            </div>

            <div className={styles.links}>
              <button type="button">Asignar líneas de numeración predeterminadas</button>
              <button type="button">Campos de Factura electrónica</button>
            </div>
          </div>
        </div>
      ) : activeTab === 'accounting' ? (
        <div className={styles.accountingGrid}>
          <section>
            <h3>Impuestos</h3>
            <div className={styles.twoColumns}>
              <TextInput
                label="Impuesto de venta"
                placeholder="Impuestos por defecto"
                name="salesTax"
                value={formState.salesTax}
                disabled={isSavingContact}
                onChange={updateField}
              />
              <TextInput
                label="Impuesto de compras"
                placeholder="Impuestos por defecto"
                name="purchaseTax"
                value={formState.purchaseTax}
                disabled={isSavingContact}
                onChange={updateField}
              />
            </div>
          </section>

          <section>
            <h3>Número de identificación</h3>
            <div className={styles.twoColumns}>
              <label className={styles.selectField}>
                <span>Cuenta cliente / deudor</span>
                <select
                  name="customerAccount"
                  value={formState.customerAccount}
                  disabled={isSavingContact}
                  onChange={updateField}
                >
                  <option value="">Seleccionar cuenta</option>
                </select>
              </label>

              <label className={styles.selectField}>
                <span>Cuenta de proveedor / acreedor</span>
                <select
                  name="supplierAccount"
                  value={formState.supplierAccount}
                  disabled={isSavingContact}
                  onChange={updateField}
                >
                  <option value="">Seleccionar cuenta</option>
                </select>
              </label>
            </div>
          </section>

          <section>
            <h3>Otros</h3>
            <div className={styles.twoColumns}>
              <label className={styles.selectField}>
                <span>Operación</span>
                <select
                  name="operation"
                  value={formState.operation}
                  disabled={isSavingContact}
                  onChange={updateField}
                >
                  <option value="General">General</option>
                </select>
              </label>

              <label className={styles.selectField}>
                <span>Acumular en el modelo 347</span>
                <select
                  name="model347"
                  value={formState.model347}
                  disabled={isSavingContact}
                  onChange={updateField}
                >
                  <option value="No">No</option>
                  <option value="Sí">Sí</option>
                </select>
              </label>
            </div>
          </section>
        </div>
      ) : (
        <div className={styles.placeholder}>
          <p>Esta sección estará disponible pronto.</p>
        </div>
      )}

      <div className={styles.footer}>
        <Button
          type="button"
          theme="optional"
          variant="outline"
          disabled={isSavingContact}
          onClick={onCancel}
        >
          Cancelar
        </Button>
        <Button form={CONTACT_FORM_ID} type="submit" loading={isSavingContact}>
          {isEditing ? 'Guardar cambios' : 'Crear'}
        </Button>
      </div>
    </form>
  );
};
