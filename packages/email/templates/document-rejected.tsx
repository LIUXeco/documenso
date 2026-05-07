import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { Trans } from '@lingui/react/macro';

import { Button, Section } from '../components';
import { withPreviewI18n } from '../preview-i18n-wrapper';
import {
  EmailHeading,
  EmailParagraph,
  TemplateBaseLayout,
} from '../template-components/template-base-layout';

type DocumentRejectedEmailProps = {
  recipientName: string;
  documentName: string;
  documentUrl: string;
  rejectionReason: string;
  assetBaseUrl?: string;
};

const FONT_STACK = 'Helvetica, Arial, sans-serif';

export function DocumentRejectedEmail({
  recipientName,
  documentName,
  documentUrl,
  rejectionReason,
}: DocumentRejectedEmailProps) {
  const { _ } = useLingui();

  const previewText = _(msg`${recipientName} ha rechazado "${documentName}"`);

  return (
    <TemplateBaseLayout previewText={previewText}>
      <EmailHeading>
        <Trans>¡Hola!</Trans>
      </EmailHeading>

      <EmailParagraph>
        <Trans>
          <strong>{recipientName}</strong> ha rechazado firmar el documento{' '}
          <strong>"{documentName}"</strong>.
        </Trans>
      </EmailParagraph>

      {rejectionReason && (
        <EmailParagraph>
          <Trans>
            <strong>Motivo:</strong> {rejectionReason}
          </Trans>
        </EmailParagraph>
      )}

      <Section style={{ textAlign: 'center', margin: '32px 0 8px' }}>
        <Button
          href={documentUrl}
          style={{
            display: 'inline-block',
            backgroundColor: '#1D1D1F',
            color: '#FFFFFF',
            fontFamily: FONT_STACK,
            fontSize: '15px',
            fontWeight: 600,
            padding: '14px 32px',
            borderRadius: '999px',
            textDecoration: 'none',
          }}
        >
          <Trans>Ver documento</Trans>
        </Button>
      </Section>
    </TemplateBaseLayout>
  );
}

export default withPreviewI18n(DocumentRejectedEmail);
