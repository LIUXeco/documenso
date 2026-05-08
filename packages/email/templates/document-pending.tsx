import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { Trans } from '@lingui/react/macro';

import {
  EmailHeading,
  EmailParagraph,
  TemplateBaseLayout,
} from '../template-components/template-base-layout';

export type DocumentPendingEmailTemplateProps = {
  documentName?: string;
  assetBaseUrl?: string;
};

export const DocumentPendingEmailTemplate = ({
  documentName = 'Open Source Pledge.pdf',
}: DocumentPendingEmailTemplateProps) => {
  const { _ } = useLingui();

  const previewText = _(msg`"${documentName}" pendiente de firma`);

  return (
    <TemplateBaseLayout previewText={previewText}>
      <EmailHeading>
        <Trans>¡Hola!</Trans>
      </EmailHeading>

      <EmailParagraph>
        <Trans>
          Has firmado el documento <strong>"{documentName}"</strong>. Estamos esperando a que el
          resto de partes firmen.
        </Trans>
      </EmailParagraph>

      <EmailParagraph>
        <Trans>
          Recibirás una copia del documento completado por correo electrónico cuando todas las
          partes hayan firmado.
        </Trans>
      </EmailParagraph>
    </TemplateBaseLayout>
  );
};

export default DocumentPendingEmailTemplate;
