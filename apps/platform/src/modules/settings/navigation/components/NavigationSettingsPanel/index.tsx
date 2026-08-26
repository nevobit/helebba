import { useMemo, useState } from 'react';
import { Button } from '@hlb/design-system';
import { ChevronRight, Menu, X } from 'lucide-react';
import type { OrganizationNavigationPreference } from '@hlb/contracts';
import { defaultNavigation } from '@/app/components/Layout/Header/default-navigation';
import { useOrganizationNavigation, useUpdateOrganizationNavigation } from '../../hooks';
import styles from './NavigationSettingsPanel.module.css';

export const NavigationSettingsPanel = ({ onClose }: { onClose: () => void }) => {
  const { data: preferences = [] } = useOrganizationNavigation();
  const { mutate: update, isPending } = useUpdateOrganizationNavigation();
  const [overrides, setOverrides] = useState<Record<string, boolean>>({});
  const saved = useMemo(
    () => new Map(preferences.map((item) => [item.itemId, item.isVisible])),
    [preferences],
  );
  const visible = (id: string, fallback: boolean) => overrides[id] ?? saved.get(id) ?? fallback;
  const configurable = defaultNavigation.filter((item) => item.isVisible || saved.has(item.id));
  const toggle = (id: string, value: boolean) =>
    setOverrides((current) => ({ ...current, [id]: value }));
  const save = () => {
    const items: OrganizationNavigationPreference[] = [];
    for (const item of configurable) {
      items.push({
        itemId: item.id,
        isVisible: visible(item.id, item.isVisible),
        position: item.position,
      });
      for (const child of item.children?.filter(
        (option) => option.isVisible || saved.has(option.id),
      ) ?? [])
        items.push({
          itemId: child.id,
          isVisible: visible(child.id, child.isVisible),
          position: child.position,
        });
    }
    update(items, { onSuccess: onClose });
  };
  return (
    <div className={styles.overlay}>
      <aside className={styles.panel} aria-label="Configurar menú principal">
        <header className={styles.header}>
          <div>
            <Menu size={21} />
            <h2>Menú principal</h2>
          </div>
          <div>
            <Button size="slim" theme="optional" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button size="slim" loading={isPending} onClick={save}>
              Guardar
            </Button>
            <button className={styles.close} onClick={onClose} aria-label="Cerrar">
              <X size={20} />
            </button>
          </div>
        </header>
        <main className={styles.content}>
          <nav className={styles.breadcrumb}>
            <span>Configuración</span>
            <ChevronRight size={16} />
            <strong>Menú principal</strong>
          </nav>
          <section className={styles.intro}>
            <h3>Personaliza la navegación</h3>
            <p>
              Selecciona los módulos y opciones que quieres mostrar en el menú superior para esta
              organización.
            </p>
          </section>
          <div className={styles.modules}>
            {configurable.map((item) => {
              const parentVisible = visible(item.id, item.isVisible);
              const children =
                item.children?.filter((child) => child.isVisible || saved.has(child.id)) ?? [];
              return (
                <section className={styles.module} key={item.id}>
                  <label className={styles.moduleToggle}>
                    <span>
                      <strong>{item.name}</strong>
                      <small>
                        {children.length
                          ? `${children.length} opciones disponibles`
                          : 'Acceso directo'}
                      </small>
                    </span>
                    <input
                      type="checkbox"
                      checked={parentVisible}
                      onChange={(event) => toggle(item.id, event.target.checked)}
                    />
                    <i />
                  </label>
                  {children.length > 0 && (
                    <div className={styles.children}>
                      {children.map((child) => (
                        <label key={child.id}>
                          <span>{child.name}</span>
                          <input
                            type="checkbox"
                            disabled={!parentVisible}
                            checked={visible(child.id, child.isVisible)}
                            onChange={(event) => toggle(child.id, event.target.checked)}
                          />
                          <i />
                        </label>
                      ))}
                    </div>
                  )}
                </section>
              );
            })}
          </div>
        </main>
      </aside>
    </div>
  );
};
