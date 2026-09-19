'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { OPEN_SIGN_IN_EVENT, registerSignInHost, settleSignIn, type SignInRequest, type SignInVerdict } from '@/lib/auth-events';
import { isAuthConfigured } from '@/lib/supabase/config';
import SignInSheet from '@/components/auth/SignInSheet';

/**
 * Global host for the sign-in sheet. Mounted ONCE as a flat sibling in the root
 * layout (next to TesterInviteModal — never inside <header>, which the dialog
 * makes inert). Renders nothing until a request arrives; the dialog frame is
 * then rendered synchronously (no dead click) while the form — and the Supabase
 * SDK behind it — arrives as a `next/dynamic` chunk, so no static page pays for it.
 *
 * Two entrances share it: the `gsb:open-sign-in` event (fire-and-forget
 * triggers) and the `requireAuth()` promise bus (actions that resume once a
 * session exists). A route change closes it as dismissed; a SIGNED_IN from
 * another tab is picked up by the AuthProvider's cookie re-read instead.
 */

export default function SignInHost() {
  const pathname = usePathname();
  const [request, setRequest] = useState<SignInRequest | null>(null);
  const openerRef = useRef<Element | null>(null);
  const closedByNavigation = useRef(false);

  const open = useCallback((req: SignInRequest) => {
    openerRef.current = document.activeElement;
    closedByNavigation.current = false;
    setRequest({ ...req, next: req.next ?? window.location.pathname + window.location.search });
  }, []);

  const close = useCallback((verdict: SignInVerdict) => {
    setRequest(null);
    settleSignIn(verdict);
  }, []);

  useEffect(() => {
    if (!isAuthConfigured()) return;
    const onEvent = (e: Event) => open((e as CustomEvent<SignInRequest>).detail ?? {});
    window.addEventListener(OPEN_SIGN_IN_EVENT, onEvent);
    const unregister = registerSignInHost(open);
    return () => {
      window.removeEventListener(OPEN_SIGN_IN_EVENT, onEvent);
      unregister();
    };
  }, [open]);

  // Close on navigation, flagged so the sheet skips focus restoration.
  useEffect(() => {
    setRequest((current) => {
      if (current) {
        closedByNavigation.current = true;
        settleSignIn('dismissed');
      }
      return null;
    });
  }, [pathname]);

  if (!request) return null;
  return <SignInSheet request={request} opener={openerRef.current} closedByNavigation={closedByNavigation} onClose={close} />;
}
