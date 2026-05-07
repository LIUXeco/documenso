import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { Trans } from '@lingui/react/macro';

import { withPreviewI18n } from '../preview-i18n-wrapper';
import {
  EmailHeading,
  EmailMutedNote,
  EmailParagraph,
  TemplateBaseLayout,
} from '../template-components/template-base-layout';

export type DocumentCancelEmailTemplateProps = {
  inviterName?: string;
  inviterEmail?: string;
  documentName?: string;
  assetBaseUrl?: string;
  cancellationReason?: string;
  organisationName?: string;
};

export const DocumentCancelTemplate = ({
  documentName = 'Open Source Pledge.pdf',
  cancellationReason,
  organisationName = '',
}: DocumentCancelEmailTemplateProps) => {
  const { _ } = useLingui();

  const previewText = _(
    msg`${organisationName} ha cancelado el documento "${documentName}", ya no necesitas firmarlo.`,
  );

  return (
    <TemplateBaseLayout previewText={previewText}>
      <EmailHeading>
        <Trans>¡Hola!</Trans>
      </EmailHeading>

      <EmailParagraph>
        <Trans>
          <strong>{organisationName}</strong> ha cancelado el documento{' '}
          <strong>"{documentName}"</strong>. Todas las firmas anteriores se han anulado y ya no
          necesitas firmarlo.
        </Trans>
      </EmailParagraph>

      {cancellationReason && (
        <EmailParagraph>
          <Trans>
            <strong>Motivo:</strong> {cancellationReason}
          </Trans>
        </EmailParagraph>
      )}

      <EmailMutedNote>
        <Trans>
          Si tienes dudas, ponte en contacto con quien envió el documento originalmente.
        </Trans>
      </EmailMutedNote>
    </TemplateBaseLayout>
  );
};

export default withPreviewI18n(DocumentCancelTemplate);
