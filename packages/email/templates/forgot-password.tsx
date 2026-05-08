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

export type ForgotPasswordTemplateProps = {
  resetPasswordLink?: string;
  assetBaseUrl?: string;
};

const FONT_STACK = 'Helvetica, Arial, sans-serif';

export const ForgotPasswordTemplate = ({
  resetPasswordLink = 'https://liux.eco',
}: ForgotPasswordTemplateProps) => {
  const { _ } = useLingui();
  const previewText = _(msg`Restablece tu contraseña`);

  return (
    <TemplateBaseLayout previewText={previewText}>
      <EmailHeading>
        <Trans>¡Hola!</Trans>
      </EmailHeading>

      <EmailParagraph>
        <Trans>
          Hemos recibido una solicitud para restablecer la contraseña de tu cuenta. Pulsa el botón
          de abajo para crear una nueva contraseña.
        </Trans>
      </EmailParagraph>

      <Section style={{ textAlign: 'center', margin: '32px 0 8px' }}>
        <Button
          href={resetPasswordLink}
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
          <Trans>Restablecer contraseña</Trans>
        </Button>
      </Section>

      <EmailMutedNote>
        <Trans>
          Si no has solicitado restablecer tu contraseña, puedes ignorar este email de forma segura.
        </Trans>
      </EmailMutedNote>
    </TemplateBaseLayout>
  );
};

export default ForgotPasswordTemplate;
