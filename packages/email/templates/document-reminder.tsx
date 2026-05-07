import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { Trans } from '@lingui/react/macro';
import { RecipientRole } from '@prisma/client';

import { RECIPIENT_ROLES_DESCRIPTION } from '@documenso/lib/constants/recipient-roles';

import { Button, Section } from '../components';
import { withPreviewI18n } from '../preview-i18n-wrapper';
import {
  EmailHeading,
  EmailMutedNote,
  EmailParagraph,
  TemplateBaseLayout,
} from '../template-components/template-base-layout';
import { TemplateCustomMessageBody } from '../template-components/template-custom-message-body';

export type DocumentReminderEmailTemplateProps = {
  recipientName?: string;
  documentName?: string;
  signDocumentLink?: string;
  assetBaseUrl?: string;
  customBody?: string;
  role?: RecipientRole;
};

const FONT_STACK = 'Helvetica, Arial, sans-serif';

export const DocumentReminderEmailTemplate = ({
  documentName = 'Open Source Pledge.pdf',
  signDocumentLink = 'https://liux.eco',
  customBody,
  role = RecipientRole.SIGNER,
}: DocumentReminderEmailTemplateProps) => {
  const { _ } = useLingui();

  const action = _(RECIPIENT_ROLES_DESCRIPTION[role].actionVerb).toLowerCase();
  const previewText = _(msg`Recordatorio: ${action} "${documentName}"`);

  return (
    <TemplateBaseLayout previewText={previewText}>
      <EmailHeading>
        <Trans>¡Hola!</Trans>
      </EmailHeading>

      <EmailParagraph>
        <Trans>
          Te recordamos que tienes pendiente firmar el documento <strong>"{documentName}"</strong>.
        </Trans>
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
        <Trans>Si ya has firmado, puedes ignorar este recordatorio.</Trans>
      </EmailMutedNote>
    </TemplateBaseLayout>
  );
};

export default withPreviewI18n(DocumentReminderEmailTemplate);
