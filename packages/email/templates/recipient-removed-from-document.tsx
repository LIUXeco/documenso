import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { Trans } from '@lingui/react/macro';

import {
  EmailHeading,
  EmailMutedNote,
  EmailParagraph,
  TemplateBaseLayout,
} from '../template-components/template-base-layout';

export type RecipientRemovedFromDocumentEmailTemplateProps = {
  inviterName?: string;
  documentName?: string;
  assetBaseUrl?: string;
  organisationName?: string;
};

export const RecipientRemovedFromDocumentTemplate = ({
  documentName = 'Open Source Pledge.pdf',
  organisationName = '',
}: RecipientRemovedFromDocumentEmailTemplateProps) => {
  const { _ } = useLingui();
  const previewText = _(msg`${organisationName} te ha quitado del documento "${documentName}"`);

  return (
    <TemplateBaseLayout previewText={previewText}>
      <EmailHeading>
        <Trans>¡Hola!</Trans>
      </EmailHeading>

      <EmailParagraph>
        <Trans>
          <strong>{organisationName}</strong> te ha quitado como destinatario del documento{' '}
          <strong>"{documentName}"</strong>. Ya no necesitas firmarlo.
        </Trans>
      </EmailParagraph>

      <EmailMutedNote>
        <Trans>
          Si crees que esto es un error, ponte en contacto con quien envió el documento.
        </Trans>
      </EmailMutedNote>
    </TemplateBaseLayout>
  );
};

export default RecipientRemovedFromDocumentTemplate;
