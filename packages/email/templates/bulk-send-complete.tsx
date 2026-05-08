import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { Trans } from '@lingui/react/macro';

import { Section, Text } from '../components';
import {
  EmailHeading,
  EmailParagraph,
  TemplateBaseLayout,
} from '../template-components/template-base-layout';

export interface BulkSendCompleteEmailProps {
  userName: string;
  templateName: string;
  totalProcessed: number;
  successCount: number;
  failedCount: number;
  errors: string[];
  assetBaseUrl?: string;
}

const FONT_STACK = 'Helvetica, Arial, sans-serif';
const ITEM_STYLE = {
  margin: '0 0 6px',
  color: '#666',
  fontSize: '15px',
  lineHeight: 1.6,
  fontFamily: FONT_STACK,
};

export const BulkSendCompleteEmail = ({
  templateName,
  totalProcessed,
  successCount,
  failedCount,
  errors,
}: BulkSendCompleteEmailProps) => {
  const { _ } = useLingui();
  const previewText = _(msg`Envío masivo completado: ${templateName}`);

  return (
    <TemplateBaseLayout previewText={previewText}>
      <EmailHeading>
        <Trans>¡Hola!</Trans>
      </EmailHeading>

      <EmailParagraph>
        <Trans>
          El envío masivo para la plantilla <strong>"{templateName}"</strong> ha finalizado.
        </Trans>
      </EmailParagraph>

      <Section style={{ marginTop: '8px' }}>
        <Text style={ITEM_STYLE}>
          <Trans>Total procesado: {totalProcessed}</Trans>
        </Text>
        <Text style={ITEM_STYLE}>
          <Trans>Creados con éxito: {successCount}</Trans>
        </Text>
        <Text style={ITEM_STYLE}>
          <Trans>Errores: {failedCount}</Trans>
        </Text>
      </Section>

      {failedCount > 0 && errors.length > 0 && (
        <Section style={{ marginTop: '24px' }}>
          <Text
            style={{
              ...ITEM_STYLE,
              fontSize: '16px',
              fontWeight: 600,
              color: '#1A1A1A',
            }}
          >
            <Trans>Errores detectados:</Trans>
          </Text>
          {errors.map((error, index) => (
            <Text key={index} style={{ ...ITEM_STYLE, color: '#AAA', fontSize: '13px' }}>
              {error}
            </Text>
          ))}
        </Section>
      )}

      <EmailParagraph>
        <Trans>
          Puedes ver los documentos creados desde la sección "Documentos creados desde plantilla".
        </Trans>
      </EmailParagraph>
    </TemplateBaseLayout>
  );
};

export default BulkSendCompleteEmail;
