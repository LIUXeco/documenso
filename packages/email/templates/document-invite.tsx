import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { Trans } from '@lingui/react/macro';
import type { RecipientRole } from '@prisma/client';

import { RECIPIENT_ROLES_DESCRIPTION } from '@documenso/lib/constants/recipient-roles';

import { Button, Section } from '../components';
import {
  EmailHeading,
  EmailMutedNote,
  EmailParagraph,
  TemplateBaseLayout,
} from '../template-components/template-base-layout';
import { TemplateCustomMessageBody } from '../template-components/template-custom-message-body';

export type DocumentInviteEmailTemplateProps = {
  inviterName?: string;
  inviterEmail?: string;
  documentName?: string;
  signDocumentLink?: string;
  assetBaseUrl?: string;
  customBody?: string;
  role: RecipientRole;
  selfSigner?: boolean;
  teamName?: string;
  organisationName?: string;
  includeSenderDetails?: boolean;
  recipientName?: string;
  organisationType?: unknown;
};

const FONT_STACK = 'Helvetica, Arial, sans-serif';

export const DocumentInviteEmailTemplate = ({
  documentName = 'Open Source Pledge.pdf',
  signDocumentLink = 'https://liux.eco',
  customBody,
  role,
  selfSigner = false,
  teamName = '',
  organisationName = '',
}: DocumentInviteEmailTemplateProps) => {
  const { _ } = useLingui();

  const action = _(RECIPIENT_ROLES_DESCRIPTION[role].actionVerb).toLowerCase();
  const senderLabel = organisationName || teamName || '';

  const previewText = selfSigner
    ? _(msg`Please ${action} your document ${documentName}`)
    : _(msg`${senderLabel} has invited you to ${action} ${documentName}`);

  return (
    <TemplateBaseLayout previewText={previewText}>
      <EmailHeading>
        <Trans>¡Hola!</Trans>
      </EmailHeading>

      <EmailParagraph>
        {selfSigner ? (
          <Trans>
            Por favor, firma tu documento <strong>"{documentName}"</strong>.
          </Trans>
        ) : (
          <Trans>
            <strong>{senderLabel}</strong> te ha invitado a firmar el documento{' '}
            <strong>"{documentName}"</strong>.
          </Trans>
        )}
      </EmailParagraph>

      {customBody && <TemplateCustomMessageBody text={customBody} />}

      <Section style={{ textAlign: 'center', margin: '32px 0 8px' }}>
        <Button
          href={signDocumentLink}
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
          <Trans>Firmar documento</Trans>
        </Button>
      </Section>

      <EmailMutedNote>
        <Trans>Si no esperabas este email, puedes ignorarlo de forma segura.</Trans>
      </EmailMutedNote>
    </TemplateBaseLayout>
  );
};

export default DocumentInviteEmailTemplate;
