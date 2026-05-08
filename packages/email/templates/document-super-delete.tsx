import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { Trans } from '@lingui/react/macro';

import {
  EmailHeading,
  EmailMutedNote,
  EmailParagraph,
  TemplateBaseLayout,
} from '../template-components/template-base-layout';

export type DocumentSuperDeleteEmailTemplateProps = {
  documentName?: string;
  assetBaseUrl?: string;
  reason?: string;
};

export const DocumentSuperDeleteEmailTemplate = ({
  documentName = 'Open Source Pledge.pdf',
  reason = 'Unknown',
}: DocumentSuperDeleteEmailTemplateProps) => {
  const { _ } = useLingui();
  const previewText = _(msg`Tu documento "${documentName}" ha sido eliminado por un administrador`);

  return (
    <TemplateBaseLayout previewText={previewText}>
      <EmailHeading>
        <Trans>¡Hola!</Trans>
      </EmailHeading>

      <EmailParagraph>
        <Trans>
          Un administrador de LIUX ha eliminado tu documento <strong>"{documentName}"</strong>.
        </Trans>
      </EmailParagraph>

      {reason && (
        <EmailParagraph>
          <Trans>
            <strong>Motivo:</strong> {reason}
          </Trans>
        </EmailParagraph>
      )}

      <EmailMutedNote>
        <Trans>Si crees que esto es un error, ponte en contacto con soporte.</Trans>
      </EmailMutedNote>
    </TemplateBaseLayout>
  );
};

export default DocumentSuperDeleteEmailTemplate;
