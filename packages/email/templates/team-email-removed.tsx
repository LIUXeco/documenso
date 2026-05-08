import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { Trans } from '@lingui/react/macro';

import {
  EmailHeading,
  EmailParagraph,
  TemplateBaseLayout,
} from '../template-components/template-base-layout';

export type TeamEmailRemovedTemplateProps = {
  assetBaseUrl?: string;
  baseUrl?: string;
  teamEmail?: string;
  teamName?: string;
  teamUrl?: string;
};

export const TeamEmailRemovedTemplate = ({
  teamEmail = 'example@example.com',
  teamName = 'Team Name',
}: TeamEmailRemovedTemplateProps) => {
  const { _ } = useLingui();
  const previewText = _(msg`Email del equipo ${teamName} eliminado`);

  return (
    <TemplateBaseLayout previewText={previewText}>
      <EmailHeading>
        <Trans>¡Hola!</Trans>
      </EmailHeading>

      <EmailParagraph>
        <Trans>
          La dirección de email <strong>{teamEmail}</strong> ha sido eliminada del equipo{' '}
          <strong>{teamName}</strong>. Ya no se usará para enviar ni recibir documentos en su
          nombre.
        </Trans>
      </EmailParagraph>
    </TemplateBaseLayout>
  );
};

export default TeamEmailRemovedTemplate;
