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

export type OrganisationInviteEmailProps = {
  assetBaseUrl?: string;
  baseUrl?: string;
  senderName?: string;
  organisationName?: string;
  token?: string;
};

const FONT_STACK = 'Helvetica, Arial, sans-serif';

export const OrganisationInviteEmailTemplate = ({
  baseUrl = 'https://liux.eco',
  senderName = 'John Doe',
  organisationName = 'Organisation Name',
  token = '',
}: OrganisationInviteEmailProps) => {
  const { _ } = useLingui();
  const previewText = _(msg`Has sido invitado a unirte a ${organisationName}`);

  const acceptLink = `${baseUrl}/organisation/invite/${token}`;
  const declineLink = `${baseUrl}/organisation/decline/${token}`;

  return (
    <TemplateBaseLayout previewText={previewText}>
      <EmailHeading>
        <Trans>¡Hola!</Trans>
      </EmailHeading>

      <EmailParagraph>
        <Trans>
          <strong>{senderName}</strong> te ha invitado a unirte a la organización{' '}
          <strong>{organisationName}</strong>.
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
            marginRight: '8px',
          }}
        >
          <Trans>Aceptar invitación</Trans>
        </Button>
      </Section>

      <Section style={{ textAlign: 'center', marginBottom: '8px' }}>
        <Button
          href={declineLink}
          style={{
            display: 'inline-block',
            backgroundColor: '#F2F2F2',
            color: '#666',
            fontFamily: FONT_STACK,
            fontSize: '14px',
            fontWeight: 500,
            padding: '12px 28px',
            borderRadius: '999px',
            textDecoration: 'none',
          }}
        >
          <Trans>Rechazar</Trans>
        </Button>
      </Section>

      <EmailMutedNote>
        <Trans>Si no esperabas esta invitación, puedes ignorar este email.</Trans>
      </EmailMutedNote>
    </TemplateBaseLayout>
  );
};

export default OrganisationInviteEmailTemplate;
