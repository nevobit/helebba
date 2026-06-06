import { type ReactNode, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { canUseDOM } from '../../../../utils';

type Props = {
  children: ReactNode;
  id?: string;
  appendTo?: HTMLElement | null;
};

const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

export function Portal({ children, id = 'ds-portal-root', appendTo }: Props) {
  const [container, setContainer] = useState<HTMLElement | null>(null);
  const createdByPortal = useRef(false);

  useIsomorphicLayoutEffect(() => {
    if (!canUseDOM) return;

    const parent = appendTo ?? document.body;

    let node = document.getElementById(id) as HTMLElement | null;
    if (!node) {
      node = document.createElement('div');
      node.setAttribute('id', id);
      node.setAttribute('data-ds-portal', 'true');
      parent.appendChild(node);
      createdByPortal.current = true;
    } else {
      createdByPortal.current = false;
    }

    setContainer(node);

    return () => {
      if (createdByPortal.current && node?.parentNode) {
        node.parentNode.removeChild(node);
      }
    };
  }, [id, appendTo]);

  if (!container) return null;
  return createPortal(children, container);
}
