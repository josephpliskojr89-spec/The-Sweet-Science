/*
  MAIL — the tray, as a management surface.
  --------------------------------------------------------------------------
  Open letters first, each expandable to the full text and its answers —
  costs and facts printed on the options. Below, the short answered trail.
  The letters speak in their senders' voices; the frame is the system's.
*/

import { useState } from 'react';
import { useGame } from '../state/GameContext';
import { Surface } from '../components/Surface';
import { formatDate } from '../game/time';
import type { MailItem } from '../game/mail/types';
import './MailRoom.css';

export function MailRoom() {
  const { save, closeRoom, answerMail } = useGame();
  const [openId, setOpenId] = useState<string | null>(null);
  if (!save) return null;

  const open = save.mail.filter((m) => !m.answered);
  const trail = save.mail.filter((m) => m.answered);
  const shownId = openId ?? open[0]?.id ?? null;

  return (
    <Surface title="MAIL" onClose={closeRoom} narrow>
      <section aria-label="Waiting on an answer">
        <h3 className="surface__section">
          WAITING ON AN ANSWER{open.length > 0 ? ` — ${open.length}` : ''}
        </h3>
        {open.length === 0 ? (
          <p className="surface__note">The tray is empty. It won’t stay that way.</p>
        ) : (
          <ul className="rows">
            {open.map((m) => (
              <li key={m.id}>
                <Letter
                  item={m}
                  expanded={shownId === m.id}
                  onToggle={() => setOpenId(shownId === m.id ? '' : m.id)}
                  onAnswer={(optionId) => answerMail(m.id, optionId)}
                  today={save.dayCount}
                />
              </li>
            ))}
          </ul>
        )}
      </section>

      {trail.length > 0 && (
        <section aria-label="Answered">
          <h3 className="surface__section">THE PAPER TRAIL</h3>
          <ul className="rows">
            {trail.map((m) => {
              const chosen = m.options.find((o) => o.id === m.answered!.optionId);
              const d = formatDate(m.answered!.day);
              return (
                <li className="ml-done" key={m.id}>
                  <span className="row__main ml-done__subject">{m.subject.toUpperCase()}</span>
                  <span className="row__detail">
                    {m.from.toUpperCase()} — ANSWERED {d.month.slice(0, 3).toUpperCase()} {d.day}:{' '}
                    <span className="ml-done__choice">{chosen?.label ?? m.answered!.optionId}</span>
                  </span>
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </Surface>
  );
}

function Letter({
  item,
  expanded,
  onToggle,
  onAnswer,
  today,
}: {
  item: MailItem;
  expanded: boolean;
  onToggle: () => void;
  onAnswer: (optionId: string) => void;
  today: number;
}) {
  const arrived = formatDate(item.arrivedDay);
  const expires = item.expiresDay !== null ? formatDate(item.expiresDay) : null;
  const daysLeft = item.expiresDay !== null ? item.expiresDay - today : null;

  return (
    <div className="ml-letter">
      <button className="ml-letter__head" onClick={onToggle} aria-expanded={expanded}>
        <span className="ml-letter__headmain">
          <span className="row__main">{item.subject.toUpperCase()}</span>
          <span className="row__detail">
            {item.form.toUpperCase()} · {item.from.toUpperCase()} · ARRIVED{' '}
            {arrived.month.slice(0, 3).toUpperCase()} {arrived.day}
          </span>
        </span>
        {expires && (
          <span className={'tag' + (daysLeft !== null && daysLeft <= 3 ? ' tag--bad' : '')}>
            ANSWER BY {expires.month.slice(0, 3).toUpperCase()} {expires.day}
          </span>
        )}
      </button>

      {expanded && (
        <div className="ml-letter__open">
          <div className="ml-letter__paper">
            <p className="ml-letter__from">{item.from}</p>
            <p className="ml-letter__body">{item.body}</p>
          </div>
          <div className="ml-letter__answers">
            {item.options.map((o) => (
              <button className="ml-answer" key={o.id} onClick={() => onAnswer(o.id)}>
                <span className="ml-answer__label">{o.label}</span>
                {o.detail && <span className="ml-answer__detail">{o.detail}</span>}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
