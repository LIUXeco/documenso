import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { Trans } from '@lingui/react/macro';

import { withPreviewI18n } from '../preview-i18n-wrapper';
import {
  EmailHeading,
  EmailParagraph,
  TemplateBaseLayout,
} from '../template-components/template-base-layout';

export type TeamDeleteEmailProps = {
  assetBaseUrl?: string;
  baseUrl?: string;
  teamUrl?: string;
  teamName?: string;
};

export const TeamDeleteEmailTemplate = ({
  teamName = '',
  teamUrl = 'demo',
}: TeamDeleteEmailProps) => {
  const { _ } = useLingui();
  const previewText = _(msg`Un equipo del que formabas parte ha sido eliminado`);

  return (
    <TemplateBaseLayout previewText={previewText}>
      <EmailHeading>
        <Trans>¡Hola!</Trans>
      </EmailHeading>

      <EmailParagraph>
        <Trans>
          El equipo <strong>{teamName || teamUrl}</strong> del que formabas parte ha sido eliminado.
          Ya no podrás acceder a este equipo ni a sus documentos.
        </Trans>
      </EmailParagraph>
    </TemplateBaseLayout>
  );
};

export default withPreviewI18n(TeamDeleteEmailTemplate);
