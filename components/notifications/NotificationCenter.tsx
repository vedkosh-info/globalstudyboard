'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bell, CalendarClock, Heart, Smartphone, UserRound, X } from 'lucide-react';
import SignInButton from '@/components/auth/SignInButton';
import { useAuth } from '@/components/auth/AuthProvider';
import { openTesterInvite } from '@/lib/tester-invite';
import { buildFeed, relativeTime, unreadCount } from '@/lib/notifications/feed';
import { EMPTY_STORE, loadStore, saveStore } from '@/lib/notifications/store';
import type { FeedItem, NoticeStore } from '@/lib/notifications/types';
import { lockBackground, trapTab, FOCUSABLE } from '@/lib/dialog-a11y';

/**
 * Header bell and notification panel.
 *
 * Phone and desktop share one panel. CSS keeps it inside the screen: a phone
 * gets a full-width sheet and desktop a card beside the header controls. No
 * resize listener or first-frame coordinate correction is needed. The page
 * behind it is inert while it is open.
 */

export default function NotificationCenter() {
  const { hasSession, ready: authReady } = useAuth();
  const pathname = usePathname();
  const panelId = useId();
  const titleId = useId();
  const btnRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [store, setStore] = useState<NoticeStore>(EMPTY_STORE);

  useEffect(() => setMounted(true), []);
  useEffect(() => {
    setStore(loadStore());
  }, []);

  const items = mounted && authReady ? buildFeed(new Date(), hasSession, store) : [];
  const unread = unreadCount(items);

  function commit(next: NoticeStore) {
    setStore(next);
    saveStore(next);
  }

  function markRead(id: string) {
    if (store.read[id]) return;
    commit({ ...store, read: { ...store.read, [id]: new Date().toISOString() } });
  }

  function markAll() {
    const iso = new Date().toISOString();
    const read = { ...store.read };
    for (const item of items) read[item.id] = iso;
    commit({ ...store, read });
  }

  function dismiss(id: string) {
    commit({ ...store, dismissed: { ...store.dismissed, [id]: new Date().toISOString() } });
  }

  function close() {
    setOpen(false);
  }

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const panel = panelRef.current;
    const opener = btnRef.current;
    const unlock = lockBackground(panel);
    const openedPath = window.location.pathname;
    const focusables = () =>
      Array.from(
        panel?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? [],
      ).filter((el) => el.getClientRects().length > 0);
    (focusables()[0] ?? panel)?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        setOpen(false);
        return;
      }
      trapTab(e, panel);
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      unlock();
      if (window.location.pathname === openedPath && opener?.isConnected) opener.focus();
    };
  }, [open]);

  const label = unread > 0 ? `Notifications, ${unread} unread` : 'Notifications';

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        aria-label={label}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-controls={open ? panelId : undefined}
        onClick={() => setOpen((v) => !v)}
        className="relative inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-forest-800 transition-colors hover:bg-forest-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-500 focus-visible:ring-offset-1"
      >
        <Bell className="h-[22px] w-[22px]" strokeWidth={1.75} aria-hidden="true" />
        {unread > 0 ? (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-forest-700 px-1 text-[10px] font-semibold leading-none text-cream-50">
            {unread > 9 ? '9+' : unread}
          </span>
        ) : null}
      </button>
      {mounted && open
        ? createPortal(
            <div data-gsb-notifications>
              <div
                className="fixed inset-0 z-[70] bg-stone-900/35 sm:bg-stone-900/20"
                onClick={close}
              />
              <div
                ref={panelRef}
                id={panelId}
                role="dialog"
                aria-modal="true"
                aria-labelledby={titleId}
                tabIndex={-1}
                className="fixed inset-x-3 top-[5.625rem] z-[80] flex max-h-[min(32rem,calc(100dvh-6.375rem))] flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-[0_24px_60px_-28px_rgba(28,46,36,0.55)] outline-none sm:inset-x-auto sm:right-[max(1rem,calc((100vw-80rem)/2+1rem))] sm:w-[23.25rem]"
              >
                <div className="h-0.5 shrink-0 bg-forest-700" aria-hidden="true" />
                <header className="flex items-center justify-between gap-2 border-b border-stone-100 px-3 py-2">
                  <h2 id={titleId} className="font-display text-lg font-bold tracking-editorial text-ink">
                    Notifications
                  </h2>
                  <div className="flex items-center gap-1">
                    {unread > 0 ? (
                      <button
                        type="button"
                        onClick={markAll}
                        className="rounded-full px-2.5 py-2 text-xs font-semibold text-forest-700 hover:bg-forest-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-500"
                      >
                        Mark all read
                      </button>
                    ) : null}
                    <button
                      type="button"
                      onClick={close}
                      aria-label="Close notifications"
                      className="inline-flex h-9 w-9 items-center justify-center rounded-full text-stone-600 hover:bg-stone-100 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-500"
                    >
                      <X className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>
                </header>
                {items.length === 0 ? (
                  <div className="px-6 py-10 text-center">
                    <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-forest-50 text-forest-700">
                      <Bell className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <p className="mt-3 font-display text-base font-bold text-ink">You are up to date</p>
                    <p className="mt-1 text-sm leading-relaxed text-stone-600">
                      Exam dates and deadlines will appear here.
                    </p>
                  </div>
                ) : (
                  <ul className="flex min-h-0 flex-1 flex-col gap-1.5 overflow-y-auto overscroll-contain p-2">
                    {items.map((item) => (
                      <NotificationRow
                        key={item.id}
                        item={item}
                        now={Date.now()}
                        onRead={() => markRead(item.id)}
                        onDismiss={() => dismiss(item.id)}
                        onClose={close}
                      />
                    ))}
                  </ul>
                )}
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}

function RowIcon({ item }: { item: FeedItem }) {
  if (item.kind === 'sites') {
    return <Heart className="h-4 w-4 shrink-0 fill-red-600 text-red-600" aria-hidden="true" />;
  }
  if (item.kind === 'account') {
    return <UserRound className="h-4 w-4 shrink-0 text-forest-700" aria-hidden="true" />;
  }
  if (item.kind === 'app') {
    return <Smartphone className="h-4 w-4 shrink-0 text-forest-700" aria-hidden="true" />;
  }
  return <CalendarClock className="h-4 w-4 shrink-0 text-forest-700" aria-hidden="true" />;
}

const ROW_BUTTON =
  'mt-2 inline-flex h-9 w-full items-center justify-center whitespace-nowrap rounded-full bg-forest-700 px-3 text-[13px] font-semibold text-cream-50 no-underline hover:bg-forest-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-500 focus-visible:ring-offset-2';

function NotificationRow({
  item,
  now,
  onRead,
  onDismiss,
  onClose,
}: {
  item: FeedItem;
  now: number;
  onRead: () => void;
  onDismiss: () => void;
  onClose: () => void;
}) {
  const time = relativeTime(item.createdAtISO, now);
  return (
    <li className={`rounded-xl border px-2.5 py-2 ${item.read ? 'border-stone-200 bg-white' : 'border-forest-200 bg-forest-50/80'}`}>
      {!item.read ? <span className="sr-only">Unread. </span> : null}
      <div className="flex items-center gap-1">
        <p className="flex min-w-0 flex-1 items-center gap-1.5 font-display text-[15px] font-bold leading-none text-ink">
          <RowIcon item={item} />
          <span className="truncate">{item.title}</span>
        </p>
        {time ? <p className="shrink-0 text-[11px] font-medium leading-none text-stone-500">{time}</p> : null}
        <button
          type="button"
          aria-label={`Dismiss ${item.title}`}
          onClick={onDismiss}
          className="-mr-1 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-stone-500 hover:bg-white hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-500"
        >
          <X className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      </div>
      <p className="mt-1 text-sm leading-snug text-stone-700">{item.body}</p>
      {item.links ? (
        <ul className="mt-1 list-none p-0">
          {item.links.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                onClick={onRead}
                className="inline-flex items-center py-0.5 text-sm font-medium leading-snug text-forest-700 underline underline-offset-2 hover:text-forest-800"
              >
                {link.label}
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            </li>
          ))}
        </ul>
      ) : null}
      {item.action === 'sign-in' ? (
        <SignInButton
          onNavigate={() => {
            onRead();
            onClose();
          }}
          className={ROW_BUTTON}
        >
          Sign in or create an account
        </SignInButton>
      ) : null}
      {item.action === 'app' ? (
        <button
          type="button"
          onClick={() => {
            onRead();
            onClose();
            openTesterInvite();
          }}
          className={ROW_BUTTON}
        >
          Enroll for early access
        </button>
      ) : null}
      {item.href ? (
        <Link
          href={item.href}
          onClick={() => {
            onRead();
            onClose();
          }}
          className="mt-1 inline-flex text-sm font-semibold text-forest-700 underline underline-offset-2"
        >
          Open
        </Link>
      ) : null}
    </li>
  );
}
