/*
  Toast
  --------------------------------------------------------------------------
  A brief, quiet line for the consequence of an action — chiefly how a cut man
  took the news. Auto-dismisses; click to clear early.
*/

import { useEffect } from 'react';
import { useGame } from '../state/GameContext';
import './Toast.css';

export function Toast() {
  const { flash, clearFlash } = useGame();

  useEffect(() => {
    if (!flash) return;
    const t = window.setTimeout(clearFlash, 5000);
    return () => clearTimeout(t);
  }, [flash, clearFlash]);

  if (!flash) return null;
  return (
    <button className="toast" onClick={clearFlash} title="Dismiss">
      {flash}
    </button>
  );
}
