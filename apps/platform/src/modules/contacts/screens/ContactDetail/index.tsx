import { useState } from 'react';
import {
  ArrowLeft,
  Building2,
  ChevronDown,
  ChevronRight,
  Globe2,
  Landmark,
  Link2,
  Mail,
  MapPin,
  MoreVertical,
  Phone,
  Plus,
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useCrmLeads } from '@/modules/crm/leads/hooks';
import { useContact } from '../../hooks';
import styles from './ContactDetail.module.css';

const ContactDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { contact, isLoading } = useContact(id);
  const { data: leadsData } = useCrmLeads({ contactId: id, status: 'open' });
  const [tab, setTab] = useState('Resumen');

  if (isLoading) return <main className={styles.loading}>Cargando contacto...</main>;
  if (!contact) return <main className={styles.loading}>Contacto no encontrado</main>;

  const displayName =
    contact.tradeName && contact.tradeName !== contact.name
      ? `${contact.tradeName} (${contact.name})`
      : contact.name;

  const address = [
    contact.address,
    contact.city,
    contact.postalCode,
    contact.department,
    contact.country,
  ]
    .filter(Boolean)
    .join(', ');

  const infoRows = [
    { label: 'Correo electrónico', value: contact.email, icon: Mail },
    { label: 'Teléfono', value: contact.phone || contact.mobile, icon: Phone },
    { label: 'Dirección', value: address || contact.country, icon: MapPin },
    { label: 'Página web', value: contact.website, icon: Globe2 },
  ].filter((row) => row.value);

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div className={styles.titleGroup}>
          <button
            className={styles.backButton}
            type="button"
            onClick={() => navigate(-1)}
            aria-label="Volver"
          >
            <ArrowLeft size={20} />
          </button>
          <div className={styles.building} aria-hidden="true">
            <Landmark size={29} />
          </div>
          <h1>{displayName}</h1>
          {contact.type && <span className={styles.contactBadge}>{contact.type}</span>}
        </div>
        <div className={styles.headerActions}>
          <button type="button" aria-label="Más opciones">
            <MoreVertical size={19} />
          </button>
          <button className={styles.addButton} type="button" aria-label="Añadir">
            <Plus size={21} />
          </button>
        </div>
      </header>

      <nav className={styles.tabs} aria-label="Secciones del contacto">
        {['Resumen', 'Oportunidades', 'Notas', 'Archivos'].map((item) => (
          <button
            key={item}
            type="button"
            className={tab === item ? styles.activeTab : undefined}
            onClick={() => setTab(item)}
          >
            {item}
          </button>
        ))}
      </nav>

      <div className={styles.layout}>
        <aside className={styles.sidebar}>
          <section className={styles.sideCard}>
            <h2>Información del contacto</h2>
            {infoRows.map((row) => (
              <div key={row.label} className={styles.field}>
                <span>{row.label}</span>
                <strong>{row.value}</strong>
              </div>
            ))}
            {!infoRows.length && (
              <div className={styles.field}>
                <span>Sin información adicional</span>
              </div>
            )}
            <div className={styles.field}>
              <strong>Campos personalizados</strong>
              <button className={styles.softButton} type="button">
                Añadir campos personalizados
              </button>
            </div>
            <button className={styles.socialLink} type="button">
              <Link2 size={18} /> Redes sociales
            </button>
            <button className={styles.showMore} type="button">
              Mostrar más <ChevronDown size={17} />
            </button>
          </section>

          <section className={styles.sideCard}>
            <h2>Personas de contacto</h2>
            <button className={styles.textButton} type="button">
              <Plus size={18} /> Añadir persona
            </button>
          </section>

          <section className={styles.sideCard}>
            <h2>Portal del cliente</h2>
            <div className={styles.settingRow}>
              <strong>Contraseña</strong>
              <button type="button">Establecer</button>
            </div>
            <div className={styles.settingRow}>
              <strong>Ajustes de visibilidad</strong>
              <button type="button">Configurar</button>
            </div>
            <p className={styles.hint}>
              Selecciona qué documentos podrá ver este contacto en su Portal del cliente.
            </p>
            <strong className={styles.catalogTitle}>Catálogo B2B</strong>
            <p className={styles.hint}>
              Elige o crea un catálogo de tus productos para realizar pedidos de venta online.
            </p>
            <button type="button" className={styles.selectButton}>
              No asignado <ChevronDown size={17} />
            </button>
            <button type="button" className={styles.portalButton}>
              Ver portal del cliente
            </button>
            <button type="button" className={styles.sendLink}>
              Enviar link al contacto
            </button>
          </section>

          <section className={styles.sideCard}>
            <h2>Informes</h2>
            {[
              'Productos vendidos',
              'Servicios vendidos',
              'Productos comprados',
              'Servicios comprados',
            ].map((item) => (
              <button className={styles.reportButton} type="button" key={item}>
                {item}
              </button>
            ))}
          </section>
        </aside>

        <section className={styles.content}>
          {tab === 'Resumen' ? (
            <>
              <section className={styles.activities}>
                <h2>Próximas actividades</h2>
                <button className={styles.textButton} type="button">
                  <Plus size={18} /> Nueva actividad
                </button>
              </section>
              <div className={styles.bottomGrid}>
                <section className={styles.opportunities}>
                  <div className={styles.sectionTitle}>
                    <h2>Oportunidades abiertas</h2>
                    <button type="button">
                      Ver todos <ChevronRight size={18} />
                    </button>
                  </div>
                  {leadsData?.data && leadsData.data.length > 0 ? (
                    leadsData.data.map((lead) => (
                      <div key={lead.id} className={styles.opportunityCard}>
                        <div className={styles.opportunityInfo}>
                          <strong>{lead.name}</strong>
                          <span>{lead.contactName}</span>
                        </div>
                        <div className={styles.opportunityMeta}>
                          <span>
                            {lead.value.toLocaleString('es-CO', {
                              style: 'currency',
                              currency: lead.currency || 'COP',
                            })}
                          </span>
                          <span className={styles.opportunityStage}>{lead.status}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className={styles.funnelInfo}>
                      <Building2 size={31} />
                      <div>
                        <strong>Sin oportunidades abiertas</strong>
                        <span>Crea una oportunidad para hacer seguimiento a este contacto</span>
                      </div>
                    </div>
                  )}
                </section>
                <section className={styles.notes}>
                  <h2>Notas</h2>
                  <button className={styles.textButton} type="button">
                    <Plus size={18} /> Nueva nota
                  </button>
                </section>
              </div>
            </>
          ) : (
            <section className={styles.emptyPanel}>
              <h2>{tab}</h2>
              <p>Esta sección todavía no tiene contenido.</p>
            </section>
          )}
        </section>
      </div>
    </main>
  );
};

export default ContactDetail;
