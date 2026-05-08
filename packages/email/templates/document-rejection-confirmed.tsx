import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { Trans } from '@lingui/react/macro';

import {
  EmailHeading,
  EmailMutedNote,
  EmailParagraph,
  TemplateBaseLayout,
} from '../template-components/template-base-layout';

export type DocumentRejectionConfirmedEmailProps = {
  recipientName: string;
  documentName: string;
  documentOwnerName: string;
  reason: string;
  assetBaseUrl?: string;
};

export function DocumentRejectionConfirmedEmail({
  documentName,
  reason,
}: DocumentRejectionConfirmedEmailProps) {
  const { _ } = useLingui();

  const previewText = _(msg`Has rechazado el documento "${documentName}"`);

  return (
    <TemplateBaseLayout previewText={previewText}>
      <EmailHeading>
        <Trans>¡Hola!</Trans>
      </EmailHeading>

      <EmailParagraph>
        <Trans>
          Has rechazado firmar el documento <strong>"{documentName}"</strong>.
        </Trans>
      </EmailParagraph>

      {reason && (
        <EmailParagraph>
          <Trans>
            <strong>Motivo indicado:</strong> {reason}
          </Trans>
        </EmailParagraph>
      )}

      <EmailMutedNote>
        <Trans>
          El propietario del documento ha sido notificado de tu decisión. Puede contactarte si
          necesita información adicional.
        </Trans>
      </EmailMutedNote>
    </TemplateBaseLayout>
  );
}

export default DocumentRejectionConfirmedEmail;
