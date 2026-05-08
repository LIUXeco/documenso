import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { Trans } from '@lingui/react/macro';

import {
  EmailHeading,
  EmailParagraph,
  TemplateBaseLayout,
} from '../template-components/template-base-layout';

export interface DocumentRecipientSignedEmailTemplateProps {
  documentName?: string;
  recipientName?: string;
  recipientEmail?: string;
  assetBaseUrl?: string;
}

export const DocumentRecipientSignedEmailTemplate = ({
  documentName = 'Open Source Pledge.pdf',
  recipientName = 'John Doe',
  recipientEmail = 'lucas@documenso.com',
}: DocumentRecipientSignedEmailTemplateProps) => {
  const { _ } = useLingui();

  const recipientReference = recipientName || recipientEmail;

  const previewText = _(msg`${recipientReference} ha firmado "${documentName}"`);

  return (
    <TemplateBaseLayout previewText={previewText}>
      <EmailHeading>
        <Trans>¡Hola!</Trans>
      </EmailHeading>

      <EmailParagraph>
        <Trans>
          <strong>{recipientReference}</strong> ({recipientEmail}) ha firmado el documento{' '}
          <strong>"{documentName}"</strong>.
        </Trans>
      </EmailParagraph>

      <EmailParagraph>
        <Trans>
          Cuando todas las partes hayan firmado, recibirás una copia del documento completado.
        </Trans>
      </EmailParagraph>
    </TemplateBaseLayout>
  );
};

export default DocumentRecipientSignedEmailTemplate;
