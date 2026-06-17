import * as React from 'react';
import { Check, ChevronDown, Search, X } from 'lucide-react';
import { Field, type FieldProps } from '../Field';
import { cx } from '../../../../utils';
import styles from './SearchableSelect.module.css';

export type SearchableSelectValue = string | number;

export interface SearchableSelectOption {
  disabled?: boolean;
  label: React.ReactNode;
  searchText?: string;
  value: SearchableSelectValue;
}

export interface SearchableSelectProps
  extends Omit<FieldProps, 'children' | 'readOnly'> {
  clearable?: boolean;
  disabled?: boolean;
  emptyMessage?: string;
  icon?: React.ReactNode;
  name?: string;
  onValueChange?: (value: SearchableSelectValue | '', option?: SearchableSelectOption) => void;
  options: SearchableSelectOption[];
  placeholder?: string;
  prefix?: React.ReactNode;
  readOnly?: boolean;
  searchPlaceholder?: string;
  suffix?: React.ReactNode;
  value?: SearchableSelectValue | '';
  defaultValue?: SearchableSelectValue | '';
}

const getOptionText = (option?: SearchableSelectOption) => {
  if (!option) return '';
  if (option.searchText) return option.searchText;
  if (typeof option.label === 'string' || typeof option.label === 'number') return String(option.label);

  return String(option.value);
};

const isSameValue = (left: SearchableSelectValue | '', right: SearchableSelectValue | '') =>
  String(left) === String(right);

const getNextEnabledIndex = (
  options: SearchableSelectOption[],
  currentIndex: number,
  direction: 1 | -1,
) => {
  if (options.length === 0) return -1;

  for (let step = 1; step <= options.length; step += 1) {
    const index = (currentIndex + step * direction + options.length) % options.length;
    if (!options[index]?.disabled) return index;
  }

  return -1;
};

export const SearchableSelect = React.forwardRef<HTMLInputElement, SearchableSelectProps>(
  (
    {
      label,
      labelHidden,
      hint,
      error,
      success,
      loading,
      required,
      fullWidth,
      id,
      size = 'md',
      clearable = false,
      defaultValue = '',
      disabled,
      emptyMessage = 'No hay resultados',
      icon,
      name,
      onValueChange,
      options,
      placeholder = 'Seleccionar',
      prefix,
      readOnly,
      searchPlaceholder = 'Buscar...',
      suffix,
      value,
      className,
    },
    ref,
  ) => {
    const rootRef = React.useRef<HTMLDivElement | null>(null);
    const isControlled = value !== undefined;
    const [internalValue, setInternalValue] = React.useState<SearchableSelectValue | ''>(defaultValue);
    const selectedValue = isControlled ? (value ?? '') : internalValue;
    const selectedOption = options.find((option) => isSameValue(option.value, selectedValue));
    const [query, setQuery] = React.useState('');
    const [open, setOpen] = React.useState(false);
    const [activeIndex, setActiveIndex] = React.useState(-1);
    const effectiveDisabled = disabled || readOnly;
    const showClear = clearable && !effectiveDisabled && selectedValue !== '';
    const displayValue = open ? query : getOptionText(selectedOption);

    const filteredOptions = React.useMemo(() => {
      const normalizedQuery = query.trim().toLowerCase();

      if (!normalizedQuery) return options;

      return options.filter((option) =>
        getOptionText(option).toLowerCase().includes(normalizedQuery),
      );
    }, [options, query]);

    React.useEffect(() => {
      if (!open) return undefined;

      const onPointerDown = (event: MouseEvent) => {
        if (!rootRef.current?.contains(event.target as Node)) {
          setOpen(false);
          setQuery('');
          setActiveIndex(-1);
        }
      };

      document.addEventListener('mousedown', onPointerDown, true);

      return () => document.removeEventListener('mousedown', onPointerDown, true);
    }, [open]);

    React.useEffect(() => {
      if (!open) return;

      setActiveIndex((current) => {
        if (current >= 0 && filteredOptions[current] && !filteredOptions[current]?.disabled) {
          return current;
        }

        return getNextEnabledIndex(filteredOptions, -1, 1);
      });
    }, [filteredOptions, open]);

    const commitValue = (nextValue: SearchableSelectValue | '', option?: SearchableSelectOption) => {
      if (!isControlled) setInternalValue(nextValue);
      onValueChange?.(nextValue, option);
    };

    const selectOption = (option: SearchableSelectOption) => {
      if (option.disabled) return;

      commitValue(option.value, option);
      setQuery('');
      setOpen(false);
      setActiveIndex(-1);
    };

    const clearSelection = () => {
      commitValue('');
      setQuery('');
      setOpen(false);
      setActiveIndex(-1);
    };

    const openList = () => {
      if (effectiveDisabled) return;

      setOpen(true);
      setActiveIndex((current) => {
        if (current >= 0 && filteredOptions[current] && !filteredOptions[current]?.disabled) {
          return current;
        }

        return getNextEnabledIndex(filteredOptions, -1, 1);
      });
    };

    return (
      <Field
        id={id}
        label={label}
        labelHidden={labelHidden}
        hint={hint}
        error={error}
        success={success}
        loading={loading}
        required={required}
        disabled={effectiveDisabled}
        readOnly={readOnly}
        fullWidth={fullWidth}
        size={size}
        className={className}
      >
        {({ controlId, describedBy, status, invalid }) => {
          const listboxId = `${controlId}-listbox`;
          const activeOption = filteredOptions[activeIndex];
          const activeOptionId = activeOption ? `${controlId}-option-${activeIndex}` : undefined;

          return (
            <div ref={rootRef} className={styles.root}>
              {name && <input type="hidden" name={name} value={selectedValue} />}
              <div
                className={cx(styles.field, styles[size])}
                data-status={status}
                data-open={open || undefined}
              >
                <span className={styles.affix} aria-hidden="true">
                  {icon ?? prefix ?? <Search size={16} strokeWidth="1.5px" />}
                </span>

                <input
                  id={controlId}
                  ref={ref}
                  className={styles.control}
                  value={displayValue}
                  placeholder={open ? searchPlaceholder : placeholder}
                  disabled={effectiveDisabled}
                  readOnly={readOnly}
                  aria-required={required || undefined}
                  role="combobox"
                  aria-autocomplete="list"
                  aria-expanded={open}
                  aria-controls={listboxId}
                  aria-activedescendant={open ? activeOptionId : undefined}
                  aria-invalid={invalid}
                  aria-describedby={describedBy}
                  onFocus={openList}
                  onClick={openList}
                  onChange={(event) => {
                    setQuery(event.target.value);
                    setOpen(true);
                    setActiveIndex(getNextEnabledIndex(filteredOptions, -1, 1));
                  }}
                  onKeyDown={(event) => {
                    if (event.key === 'ArrowDown') {
                      event.preventDefault();
                      if (!open) {
                        openList();
                        return;
                      }
                      setActiveIndex((current) => getNextEnabledIndex(filteredOptions, current, 1));
                    } else if (event.key === 'ArrowUp') {
                      event.preventDefault();
                      if (!open) {
                        openList();
                        return;
                      }
                      setActiveIndex((current) => getNextEnabledIndex(filteredOptions, current, -1));
                    } else if (event.key === 'Enter') {
                      if (!open || activeIndex < 0) return;
                      event.preventDefault();
                      const option = filteredOptions[activeIndex];
                      if (option) selectOption(option);
                    } else if (event.key === 'Escape') {
                      setOpen(false);
                      setQuery('');
                      setActiveIndex(-1);
                    }
                  }}
                />

                {showClear && (
                  <button
                    type="button"
                    className={styles.action}
                    onClick={clearSelection}
                    aria-label="Limpiar selección"
                  >
                    <X size={16} strokeWidth="1.5px" />
                  </button>
                )}

                {suffix && (
                  <span className={styles.affix} aria-hidden="true">
                    {suffix}
                  </span>
                )}

                <span className={styles.indicator} aria-hidden="true">
                  <ChevronDown size={16} strokeWidth="1.5px" />
                </span>
              </div>

              {open && (
                <ul id={listboxId} className={styles.listbox} role="listbox">
                  {filteredOptions.length > 0 ? (
                    filteredOptions.map((option, index) => {
                      const selected = isSameValue(option.value, selectedValue);
                      return (
                        <li
                          id={`${controlId}-option-${index}`}
                          key={String(option.value)}
                          className={styles.option}
                          role="option"
                          aria-selected={selected}
                          data-active={activeIndex === index || undefined}
                          data-selected={selected || undefined}
                          data-disabled={option.disabled || undefined}
                          onMouseEnter={() => {
                            if (!option.disabled) setActiveIndex(index);
                          }}
                          onMouseDown={(event) => {
                            event.preventDefault();
                            selectOption(option);
                          }}
                        >
                          <span className={styles.optionText}>{option.label}</span>
                          {selected && <Check size={16} strokeWidth="1.5px" />}
                        </li>
                      );
                    })
                  ) : (
                    <li className={styles.empty}>{emptyMessage}</li>
                  )}
                </ul>
              )}
            </div>
          );
        }}
      </Field>
    );
  },
);

SearchableSelect.displayName = 'SearchableSelect';
