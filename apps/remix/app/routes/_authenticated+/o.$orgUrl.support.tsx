import { useState } from 'react';

import { msg } from '@lingui/core/macro';
import { Trans } from '@lingui/react/macro';
import { HelpCircleIcon, InfoIcon, MailIcon } from 'lucide-react';
import { Link, useSearchParams } from 'react-router';

import { useCurrentOrganisation } from '@documenso/lib/client-only/providers/organisation';
import { IS_BILLING_ENABLED } from '@documenso/lib/constants/app';
import { Button } from '@documenso/ui/primitives/button';

import { SupportTicketForm } from '~/components/forms/support-ticket-form';
import { appMetaTags } from '~/utils/meta';

export function meta() {
  return appMetaTags(msg`Support`);
}

export default function SupportPage() {
  const [showForm, setShowForm] = useState(false);
  const organisation = useCurrentOrganisation();

  const [searchParams] = useSearchParams();
  const teamId = searchParams.get('team');

  const subscriptionStatus = organisation.subscription?.status;

  const handleSuccess = () => setShowForm(false);
  const handleCloseForm = () => setShowForm(false);

  return (
    <div className="mx-auto w-full max-w-screen-xl px-4 md:px-8">
      <div className="mb-8">
        <h1 className="flex flex-row items-center gap-2 text-3xl font-bold">
          <HelpCircleIcon className="h-8 w-8 text-muted-foreground" />
          <Trans>Soporte</Trans>
        </h1>

        <p className="mt-2 font-normal text-muted-foreground">
          <Trans>¿Necesitas ayuda con LIUX Sign? Ponte en contacto con nuestro equipo.</Trans>
        </p>

        <div className="mt-6 flex flex-col gap-4">
          <div className="rounded-lg border p-4">
            <h2 className="flex items-center gap-2 text-lg font-bold">
              <MailIcon className="h-5 w-5 text-muted-foreground" />
              <Link to="mailto:legal@liux.eco" className="hover:underline">
                legal@liux.eco
              </Link>
            </h2>
            <p className="mt-1 font-normal text-muted-foreground">
              <Trans>Escríbenos a esta dirección y te responderemos lo antes posible.</Trans>
            </p>
          </div>

          {organisation && IS_BILLING_ENABLED() && subscriptionStatus && (
            <div className="rounded-lg border p-4">
              <h2 className="flex items-center gap-2 text-lg font-bold">
                <MailIcon className="h-5 w-5 text-muted-foreground" />
                <Trans>Crear un ticket de soporte</Trans>
              </h2>
              <p className="mt-1 font-normal text-muted-foreground">
                <Trans>Te responderemos lo antes posible por correo electrónico.</Trans>
              </p>
              <div className="mt-4">
                {!showForm ? (
                  <Button variant="outline" size="sm" onClick={() => setShowForm(true)}>
                    <Trans>Crear un ticket de soporte</Trans>
                  </Button>
                ) : (
                  <SupportTicketForm
                    organisationId={organisation.id}
                    teamId={teamId}
                    onSuccess={handleSuccess}
                    onClose={handleCloseForm}
                  />
                )}
              </div>
            </div>
          )}

          <div className="mt-4 rounded-lg border p-4">
            <h2 className="flex items-center gap-2 text-lg font-bold">
              <InfoIcon className="h-5 w-5 text-muted-foreground" />
              <Trans>Acerca de LIUX Sign</Trans>
            </h2>
            <p className="mt-2 font-normal text-muted-foreground">
              <Trans>
                LIUX Sign está basado en{' '}
                <Link
                  to="https://github.com/documenso/documenso"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#0073EC] hover:underline"
                >
                  Documenso
                </Link>
                , una plataforma open-source de firma electrónica licenciada bajo{' '}
                <Link
                  to="https://www.gnu.org/licenses/agpl-3.0.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#0073EC] hover:underline"
                >
                  AGPL-3.0
                </Link>
                . El código fuente modificado de esta versión está disponible en{' '}
                <Link
                  to="https://github.com/LIUXeco/documenso"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#0073EC] hover:underline"
                >
                  github.com/LIUXeco/documenso
                </Link>
                .
              </Trans>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
