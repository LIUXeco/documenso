import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { Trans } from '@lingui/react/macro';

import { Button, Section } from '../components';
import { withPreviewI18n } from '../preview-i18n-wrapper';
import {
  EmailHeading,
  EmailMutedNote,
  EmailParagraph,
  TemplateBaseLayout,
} from '../template-components/template-base-layout';

type OrganisationAccountLinkConfirmationTemplateProps = {
  type: 'create' | 'link';
  confirmationLink: string;
  organisationName: string;
  assetBaseUrl?: string;
};

const FONT_STACK = 'Helvetica, Arial, sans-serif';

export const OrganisationAccountLinkConfirmationTemplate = ({
  type = 'link',
  confirmationLink = 'https://liux.eco',
  organisationName = '<ORGANISATION_NAME>',
}: OrganisationAccountLinkConfirmationTemplateProps) => {
  const { _ } = useLingui();
  const previewText =
    type === 'create'
      ? _(msg`Solicitud de creación de cuenta`)
      : _(msg`Solicitud de vinculación de cuenta`);

  return (
    <TemplateBaseLayout previewText={previewText}>
      <EmailHeading>
        <Trans>¡Hola!</Trans>
      </EmailHeading>

      <EmailParagraph>
        {type === 'create' ? (
          <Trans>
            <strong>{organisationName}</strong> ha solicitado crear una cuenta en tu nombre.
          </Trans>
        ) : (
          <Trans>
            <strong>{organisationName}</strong> ha solicitado vincular tu cuenta actual a su
            organización.
          </Trans>
        )}
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
          <Trans>Revisar solicitud</Trans>
        </Button>
      </Section>

      <EmailMutedNote>
        <Trans>El enlace expira en 30 minutos.</Trans>
      </EmailMutedNote>
    </TemplateBaseLayout>
  );
};

export default withPreviewI18n(OrganisationAccountLinkConfirmationTemplate);
