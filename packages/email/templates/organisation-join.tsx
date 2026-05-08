import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { Trans } from '@lingui/react/macro';

import {
  EmailHeading,
  EmailParagraph,
  TemplateBaseLayout,
} from '../template-components/template-base-layout';

export type OrganisationJoinEmailProps = {
  assetBaseUrl?: string;
  baseUrl?: string;
  memberName?: string;
  memberEmail?: string;
  organisationName?: string;
  organisationUrl?: string;
};

export const OrganisationJoinEmailTemplate = ({
  memberName = 'John Doe',
  memberEmail = 'johndoe@example.com',
  organisationName = 'Organisation Name',
}: OrganisationJoinEmailProps) => {
  const { _ } = useLingui();
  const previewText = _(msg`${memberName || memberEmail} se ha unido a ${organisationName}`);

  return (
    <TemplateBaseLayout previewText={previewText}>
      <EmailHeading>
        <Trans>¡Hola!</Trans>
      </EmailHeading>

      <EmailParagraph>
        <Trans>
          <strong>{memberName || memberEmail}</strong> ({memberEmail}) se ha unido a la organización{' '}
          <strong>{organisationName}</strong>.
        </Trans>
      </EmailParagraph>
    </TemplateBaseLayout>
  );
};

export default OrganisationJoinEmailTemplate;
