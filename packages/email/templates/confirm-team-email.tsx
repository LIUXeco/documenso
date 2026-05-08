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

export type ConfirmTeamEmailProps = {
  assetBaseUrl?: string;
  baseUrl?: string;
  teamName?: string;
  teamUrl?: string;
  token?: string;
};

const FONT_STACK = 'Helvetica, Arial, sans-serif';

export const ConfirmTeamEmailTemplate = ({
  baseUrl = 'https://liux.eco',
  teamName = 'Team Name',
  token = '',
}: ConfirmTeamEmailProps) => {
  const { _ } = useLingui();
  const previewText = _(msg`Confirma el email del equipo ${teamName}`);

  const acceptLink = `${baseUrl}/team/verify/email/${token}`;

  return (
    <TemplateBaseLayout previewText={previewText}>
      <EmailHeading>
        <Trans>¡Hola!</Trans>
      </EmailHeading>

      <EmailParagraph>
        <Trans>
          <strong>{teamName}</strong> ha solicitado usar tu dirección de email para su equipo.
        </Trans>
      </EmailParagraph>

      <EmailParagraph>
        <Trans>
          Si aceptas, este equipo podrá ver los documentos enviados o recibidos en este email,
          permitir respuestas directas y enviar documentos en su nombre desde esta dirección.
        </Trans>
      </EmailParagraph>

      <Section style={{ textAlign: 'center', margin: '32px 0 8px' }}>
        <Button
          href={acceptLink}
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
          <Trans>Aceptar solicitud</Trans>
        </Button>
      </Section>

      <EmailMutedNote>
        <Trans>
          El enlace expira en 1 hora. Puedes revocar el acceso desde los ajustes del equipo.
        </Trans>
      </EmailMutedNote>
    </TemplateBaseLayout>
  );
};

export default ConfirmTeamEmailTemplate;
