import { useState } from 'react';

import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { Trans } from '@lingui/react/macro';
import { ChevronLeft, Globe } from 'lucide-react';
import { Link, Outlet, isRouteErrorResponse } from 'react-router';

import { useOptionalSession } from '@documenso/lib/client-only/providers/session';
import { LanguageSwitcherDialog } from '@documenso/ui/components/common/language-switcher-dialog';
import { cn } from '@documenso/ui/lib/utils';
import { Button } from '@documenso/ui/primitives/button';

import { Header as AuthenticatedHeader } from '~/components/general/app-header';
import { GenericErrorLayout } from '~/components/general/generic-error-layout';

import type { Route } from './+types/_layout';

/**
 * A layout to handle scenarios where the user is a recipient of a given resource
 * where we do not care whether they are authenticated or not.
 *
 * Such as direct template access, or signing.
 */
export default function RecipientLayout({ matches }: Route.ComponentProps) {
  const { sessionData } = useOptionalSession();
  const { _ } = useLingui();
  const [languageOpen, setLanguageOpen] = useState(false);

  // Hide the header for signing routes.
  const hideHeader = matches.some(
    (match) =>
      match?.id === 'routes/_recipient+/sign.$token+/_index' ||
      match?.id === 'routes/_recipient+/d.$token+/_index',
  );

  return (
    <div className="min-h-screen">
      {!hideHeader && sessionData?.user && <AuthenticatedHeader />}

      <main
        className={cn({
          'mb-8 mt-8 px-4 md:mb-12 md:mt-12 md:px-8': !hideHeader,
        })}
      >
        <Outlet />
      </main>

      <button
        type="button"
        onClick={() => setLanguageOpen(true)}
        aria-label={_(msg`Change language`)}
        className="fixed bottom-6 right-6 z-20 flex h-12 w-12 items-center justify-center rounded-full border border-border bg-white text-foreground shadow-sm transition hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        <Globe className="h-5 w-5" />
      </button>

      <LanguageSwitcherDialog open={languageOpen} setOpen={setLanguageOpen} />
    </div>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  const errorCode = isRouteErrorResponse(error) ? error.status : 500;

  return (
    <GenericErrorLayout
      errorCode={errorCode}
      secondaryButton={null}
      primaryButton={
        <Button asChild className="w-32">
          <Link to="/">
            <ChevronLeft className="mr-2 h-4 w-4" />
            <Trans>Go Back</Trans>
          </Link>
        </Button>
      }
    />
  );
}
