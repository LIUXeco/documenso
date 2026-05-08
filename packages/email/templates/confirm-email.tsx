import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { Trans } from '@lingui/react/macro';

import { Button, Section } from '../components';
import {
  EmailHeading,
  EmailMutedNote,
  EmailParagraph,
  TemplateBaseLayout,
} from '../template-components/template-base-layout';

export type ConfirmEmailTemplateProps = {
  confirmationLink: string;
  assetBaseUrl?: string;
};

const FONT_STACK = 'Helvetica, Arial, sans-serif';

export const ConfirmEmailTemplate = ({
  confirmationLink = 'https://liux.eco',
}: ConfirmEmailTemplateProps) => {
  const { _ } = useLingui();
  const previewText = _(msg`Confirma tu dirección de email`);

  return (
    <TemplateBaseLayout previewText={previewText}>
      <EmailHeading>
        <Trans>¡Hola!</Trans>
      </EmailHeading>

      <EmailParagraph>
        <Trans>Confirma tu dirección de email para terminar de configurar tu cuenta.</Trans>
      </EmailParagraph>

      <Section style={{ textAlign: 'center', margin: '32px 0 8px' }}>
        <Button
          href={confirmationLink}
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
          <Trans>Confirmar email</Trans>
        </Button>
      </Section>

      <EmailMutedNote>
        <Trans>Si no creaste esta cuenta, puedes ignorar este email de forma segura.</Trans>
      </EmailMutedNote>
    </TemplateBaseLayout>
  );
};

export default ConfirmEmailTemplate;
