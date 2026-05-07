import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { Trans } from '@lingui/react/macro';

import { withPreviewI18n } from '../preview-i18n-wrapper';
import {
  EmailHeading,
  EmailParagraph,
  TemplateBaseLayout,
} from '../template-components/template-base-layout';

export type DocumentSelfSignedTemplateProps = {
  documentName?: string;
  assetBaseUrl?: string;
};

export const DocumentSelfSignedEmailTemplate = ({
  documentName = 'Open Source Pledge.pdf',
}: DocumentSelfSignedTemplateProps) => {
  const { _ } = useLingui();

  const previewText = _(msg`Has firmado "${documentName}"`);

  return (
    <TemplateBaseLayout previewText={previewText}>
      <EmailHeading>
        <Trans>¡Hola!</Trans>
      </EmailHeading>

      <EmailParagraph>
        <Trans>
          Has firmado el documento <strong>"{documentName}"</strong>.
        </Trans>
      </EmailParagraph>

      <EmailParagraph>
        <Trans>Encontrarás el documento firmado adjunto a este email para tus archivos.</Trans>
      </EmailParagraph>
    </TemplateBaseLayout>
  );
};

export default withPreviewI18n(DocumentSelfSignedEmailTemplate);
