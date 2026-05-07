import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { Trans } from '@lingui/react/macro';

import { Link } from '../components';
import { withPreviewI18n } from '../preview-i18n-wrapper';
import {
  EmailHeading,
  EmailMutedNote,
  EmailParagraph,
  TemplateBaseLayout,
} from '../template-components/template-base-layout';

export type ResetPasswordTemplateProps = {
  userName?: string;
  userEmail?: string;
  assetBaseUrl?: string;
};

export const ResetPasswordTemplate = ({
  userEmail = 'lucas@documenso.com',
}: ResetPasswordTemplateProps) => {
  const { _ } = useLingui();
  const previewText = _(msg`Tu contraseña se ha cambiado`);

  return (
    <TemplateBaseLayout previewText={previewText}>
      <EmailHeading>
        <Trans>¡Hola!</Trans>
      </EmailHeading>

      <EmailParagraph>
        <Trans>
          Hemos cambiado la contraseña de tu cuenta <strong>{userEmail}</strong>. Ya puedes iniciar
          sesión con la nueva contraseña.
        </Trans>
      </EmailParagraph>

      <EmailMutedNote>
        <Trans>
          ¿No solicitaste este cambio? Contacta con nosotros en{' '}
          <Link href="mailto:legal@liux.eco" style={{ color: '#1D1D1F' }}>
            legal@liux.eco
          </Link>{' '}
          para asegurar tu cuenta.
        </Trans>
      </EmailMutedNote>
    </TemplateBaseLayout>
  );
};

export default withPreviewI18n(ResetPasswordTemplate);
