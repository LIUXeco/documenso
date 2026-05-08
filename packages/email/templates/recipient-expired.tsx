import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { Trans } from '@lingui/react/macro';

import { Button, Section } from '../components';
import {
  EmailHeading,
  EmailParagraph,
  TemplateBaseLayout,
} from '../template-components/template-base-layout';

export type RecipientExpiredEmailTemplateProps = {
  documentName?: string;
  recipientName?: string;
  recipientEmail?: string;
  documentLink?: string;
  assetBaseUrl?: string;
};

const FONT_STACK = 'Helvetica, Arial, sans-serif';

export const RecipientExpiredTemplate = ({
  documentName = 'Open Source Pledge.pdf',
  recipientName = 'John Doe',
  recipientEmail = 'john@example.com',
  documentLink = 'https://liux.eco',
}: RecipientExpiredEmailTemplateProps) => {
  const { _ } = useLingui();
  const previewText = _(
    msg`El plazo de firma de "${recipientName}" para "${documentName}" ha expirado`,
  );

  return (
    <TemplateBaseLayout previewText={previewText}>
      <EmailHeading>
        <Trans>¡Hola!</Trans>
      </EmailHeading>

      <EmailParagraph>
        <Trans>
          El plazo para firmar el documento <strong>"{documentName}"</strong> de{' '}
          <strong>{recipientName}</strong> ({recipientEmail}) ha expirado.
        </Trans>
      </EmailParagraph>

      <Section style={{ textAlign: 'center', margin: '32px 0 8px' }}>
        <Button
          href={documentLink}
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
};

export default RecipientExpiredTemplate;
