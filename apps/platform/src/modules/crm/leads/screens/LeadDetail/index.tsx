import { useState } from 'react';
import {
  ArrowLeft,
  BadgeEuro,
  BookOpen,
  Check,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  Clock3,
  FileText,
  HandCoins,
  Landmark,
  Link2,
  MoreVertical,
  Plus,
  ReceiptText,
  Undo2,
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useCrmLead } from '../../hooks';
import styles from './LeadDetail.module.css';

const MONTHS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

const LeadDetail = () => {
  const navigate = useNavigate();
  const { leadId } = useParams<{ leadId: string }>();
  const { data: lead } = useCrmLead(leadId);
  const [tab, setTab] = useState('Resumen');

  if (!lead) return <main className={styles.loading}>Cargando oportunidad...</main>;

  const leadName = lead.name || 'Revoluc';
  const metricCards = [
    { label: 'Total cobrado', icon: Check, tone: 'green' },
    { label: 'Total pagado', icon: ReceiptText, tone: 'red' },
    { label: 'Pendiente de cobro', icon: Clock3, tone: 'green' },
    { label: 'Pendiente de pago', icon: Undo2, tone: 'red' },
    { label: 'Pagos a cuenta', icon: HandCoins, tone: 'green' },
    { label: 'Pagos a cuenta', icon: HandCoins, tone: 'red' },
  ] as const;

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
          <h1>{leadName}</h1>
          <span className={styles.leadBadge}>Lead</span>
        </div>
        <div className={styles.headerActions}>
          <button type="button" aria-label="Ayuda">
            <BookOpen size={19} />
          </button>
          <button type="button" aria-label="Más opciones">
            <MoreVertical size={19} />
          </button>
          <button className={styles.addButton} type="button" aria-label="Añadir">
            <Plus size={21} />
          </button>
        </div>
      </header>

      <nav className={styles.tabs} aria-label="Secciones de la oportunidad">
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
            <div className={styles.field}>
              <span>Email</span>
              <button type="button">Añadir correo electrónico</button>
            </div>
            <div className={styles.field}>
              <strong>Dirección</strong>
              <button type="button">Asignar dirección</button>
              <span>País</span>
              <p>España</p>
            </div>
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
            <strong className={styles.catalogTitle}>Catálogo B2B Holded</strong>
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
              <section className={styles.financePanel}>
                <div className={styles.financeLegend}>
                  <div>
                    <span className={styles.dotGreen} />
                    Ventas <CircleHelp size={15} />
                    <strong>0,00€</strong>
                  </div>
                  <div>
                    <span className={styles.dotRed} />
                    Compras <CircleHelp size={15} />
                    <strong>0,00€</strong>
                  </div>
                  <button type="button">
                    2026 <ChevronDown size={16} />
                  </button>
                </div>
                <div className={styles.financeBody}>
                  <div
                    className={styles.chart}
                    aria-label="Gráfico de ventas y compras sin movimientos"
                  >
                    <div className={styles.yAxis}>
                      {Array.from({ length: 10 }, (_, index) => (
                        <span key={index}>{index === 0 ? '1 €' : '0 €'}</span>
                      ))}
                    </div>
                    <div className={styles.chartLine}>
                      {MONTHS.map((month) => (
                        <span key={month}>
                          <i />
                          {month}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className={styles.financeStats}>
                    {metricCards.map(({ label, icon: Icon, tone }) => (
                      <div className={styles.metric} key={`${label}-${tone}`}>
                        <span className={tone === 'green' ? styles.greenIcon : styles.redIcon}>
                          <Icon size={18} />
                        </span>
                        <div>
                          {label}
                          <strong>0,00€</strong>
                        </div>
                      </div>
                    ))}
                    <div className={styles.budget}>
                      <span>
                        <FileText size={17} />
                      </span>
                      No hay presupuestos pendientes
                    </div>
                    <button className={styles.textButton} type="button">
                      <Plus size={18} /> Factura
                    </button>
                    <button className={styles.textButton} type="button">
                      <Plus size={18} /> Compra
                    </button>
                  </div>
                </div>
              </section>
              <div className={styles.bottomGrid}>
                <section className={styles.opportunities}>
                  <div className={styles.sectionTitle}>
                    <h2>Oportunidades abiertas</h2>
                    <button type="button">
                      Ver todos <ChevronRight size={18} />
                    </button>
                  </div>
                  <div className={styles.opportunity}>
                    <div>
                      <strong>{leadName}</strong>
                      <span>0,00€</span>
                    </div>
                    <div className={styles.stage}>
                      <span>Contacto establecido</span>
                      <div>
                        {Array.from({ length: 5 }, (_, index) => (
                          <i key={index} className={index < 2 ? styles.stageActive : undefined} />
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className={styles.funnelInfo}>
                    <BadgeEuro size={31} />
                    <div>
                      <strong>Embudo de ventas</strong>
                      <span>
                        Maximiza tus oportunidades de venta a través de un CRM personalizado
                      </span>
                    </div>
                  </div>
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

export default LeadDetail;
