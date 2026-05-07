import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { Trans } from '@lingui/react/macro';
import { RecipientRole } from '@prisma/client';

import { RECIPIENT_ROLES_DESCRIPTION } from '@documenso/lib/constants/recipient-roles';

import { Button, Section } from '../components';
import { withPreviewI18n } from '../preview-i18n-wrapper';
import {
  EmailHeading,
  EmailParagraph,
  TemplateBaseLayout,
} from '../template-components/template-base-layout';

export type DocumentCreatedFromDirectTemplateProps = {
  recipientName?: string;
  recipientRole?: RecipientRole;
  documentLink?: string;
  documentName?: string;
  assetBaseUrl?: string;
};

const FONT_STACK = 'Helvetica, Arial, sans-serif';

export const DocumentCreatedFromDirectTemplateEmailTemplate = ({
  recipientName = 'John Doe',
  recipientRole = RecipientRole.SIGNER,
  documentLink = 'https://liux.eco',
  documentName = 'Open Source Pledge.pdf',
}: DocumentCreatedFromDirectTemplateProps) => {
  const { _ } = useLingui();
  const action = _(RECIPIENT_ROLES_DESCRIPTION[recipientRole].actioned).toLowerCase();

  const previewText = _(msg`${recipientName} ha ${action} un documento de tu enlace directo`);

  return (
    <TemplateBaseLayout previewText={previewText}>
      <EmailHeading>
        <Trans>¡Hola!</Trans>
      </EmailHeading>

      <EmailParagraph>
        <Trans>
          <strong>{recipientName}</strong> ha {action} el documento{' '}
          <strong>"{documentName}"</strong> usando uno de tus enlaces directos.
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

export default withPreviewI18n(DocumentCreatedFromDirectTemplateEmailTemplate);
