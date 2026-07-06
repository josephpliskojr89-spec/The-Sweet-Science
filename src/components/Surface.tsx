/*
  Surface — a full management screen over the game.
  --------------------------------------------------------------------------
  The scaffold every interior surface shares: charcoal sheet, cream mast
  with the title plate, optional tabs, CLOSE (Esc). Esc is ignored while a
  higher layer (fighter folder, walk-in viewer) is open above.
*/

import { useEffect, type ReactNode } from 'react';
import { useGame } from '../state/GameContext';

export interface SurfaceTab {
  key: string;
  label: string;
}

export function Surface({
  title,
  tabs,
  activeTab,
  onTab,
  onClose,
  narrow,
  children,
}: {
  title: string;
  tabs?: SurfaceTab[];
  activeTab?: string;
  onTab?: (key: string) => void;
  onClose: () => void;
  narrow?: boolean;
  children: ReactNode;
}) {
  const { profileId, viewerIds } = useGame();
  const overlayAbove = profileId !== null || viewerIds !== null;

  useEffect(() => {
    if (overlayAbove) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, overlayAbove]);

  return (
    <div className="surface" role="dialog" aria-label={title}>
      <div className={'surface__sheet' + (narrow ? ' surface__sheet--narrow' : '')}>
        <header className="surface__mast">
          <h2 className="surface__title">{title}</h2>
          <div className="surface__tabs" role={tabs ? 'tablist' : undefined}>
            {tabs?.map((t) => (
              <button
                key={t.key}
                role="tab"
                aria-selected={activeTab === t.key}
                className="surface__tab"
                onClick={() => onTab?.(t.key)}
              >
                {t.label}
              </button>
            ))}
            <button className="surface__close" onClick={onClose}>
              CLOSE <span className="surface__esc">ESC</span>
            </button>
          </div>
        </header>
        <div className="surface__body">{children}</div>
      </div>
    </div>
  );
}
