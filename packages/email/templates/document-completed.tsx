import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { Trans } from '@lingui/react/macro';

import { Button, Section } from '../components';
import {
  EmailHeading,
  EmailParagraph,
  TemplateBaseLayout,
} from '../template-components/template-base-layout';
import { TemplateCustomMessageBody } from '../template-components/template-custom-message-body';

export type DocumentCompletedEmailTemplateProps = {
  downloadLink?: string;
  documentName?: string;
  assetBaseUrl?: string;
  customBody?: string;
};

const FONT_STACK = 'Helvetica, Arial, sans-serif';

export const DocumentCompletedEmailTemplate = ({
  downloadLink = 'https://liux.eco',
  documentName = 'Open Source Pledge.pdf',
  customBody,
}: DocumentCompletedEmailTemplateProps) => {
  const { _ } = useLingui();

  const previewText = _(msg`"${documentName}" fue firmado por todas las partes`);

  return (
    <TemplateBaseLayout previewText={previewText}>
      <EmailHeading>
        <Trans>¡Hola!</Trans>
      </EmailHeading>

      <EmailParagraph>
        <Trans>
          El documento <strong>"{documentName}"</strong> ha sido firmado por todas las partes.
        </Trans>
      </EmailParagraph>

      {customBody && <TemplateCustomMessageBody text={customBody} />}

      <Section style={{ textAlign: 'center', margin: '32px 0 8px' }}>
        <Button
          href={downloadLink}
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
          <Trans>Descargar documento</Trans>
        </Button>
      </Section>
    </TemplateBaseLayout>
  );
};

export default DocumentCompletedEmailTemplate;
