import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { Trans } from '@lingui/react/macro';

import { Section, Text } from '../components';
import { withPreviewI18n } from '../preview-i18n-wrapper';
import {
  EmailHeading,
  EmailMutedNote,
  EmailParagraph,
  TemplateBaseLayout,
} from '../template-components/template-base-layout';

export type AccessAuth2FAEmailTemplateProps = {
  documentTitle: string;
  code: string;
  userEmail: string;
  userName: string;
  expiresInMinutes: number;
  assetBaseUrl?: string;
};

const FONT_STACK = 'Helvetica, Arial, sans-serif';

export const AccessAuth2FAEmailTemplate = ({
  documentTitle,
  code,
  expiresInMinutes,
}: AccessAuth2FAEmailTemplateProps) => {
  const { _ } = useLingui();
  const previewText = _(msg`Tu código de verificación es ${code}`);

  return (
    <TemplateBaseLayout previewText={previewText}>
      <EmailHeading>
        <Trans>¡Hola!</Trans>
      </EmailHeading>

      <EmailParagraph>
        <Trans>
          Usa el siguiente código para acceder al documento <strong>"{documentTitle}"</strong>.
        </Trans>
      </EmailParagraph>

      <Section style={{ textAlign: 'center', margin: '32px 0' }}>
        <Text
          style={{
            margin: '0 0 16px',
            color: '#888',
            fontSize: '11px',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '2px',
            fontFamily: FONT_STACK,
          }}
        >
          <Trans>Código de verificación</Trans>
        </Text>
        <Text
          style={{
            margin: 0,
            fontSize: '36px',
            fontWeight: 700,
            color: '#1A1A1A',
            letterSpacing: '8px',
            fontFamily: FONT_STACK,
          }}
        >
          {code}
        </Text>
        <Text
          style={{
            margin: '16px 0 0',
            color: '#AAA',
            fontSize: '12px',
            fontFamily: FONT_STACK,
          }}
        >
          <Trans>Este código expira en {expiresInMinutes} minutos</Trans>
        </Text>
      </Section>

      <EmailMutedNote>
        <Trans>Si no has solicitado este código, puedes ignorar este email de forma segura.</Trans>
      </EmailMutedNote>
    </TemplateBaseLayout>
  );
};

export default withPreviewI18n(AccessAuth2FAEmailTemplate);
