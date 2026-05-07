import { i18n, setupI18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';

if (!i18n.locale) {
  setupI18n({ locale: 'en', messages: { en: {} } });
  i18n.activate('en');
}

export const withPreviewI18n = <P extends object>(Template: (props: P) => JSX.Element) => {
  const Wrapped = (props: P) => (
    <I18nProvider i18n={i18n}>
      <Template {...props} />
    </I18nProvider>
  );
  Wrapped.displayName = `WithPreviewI18n(${Template.displayName || Template.name || 'Template'})`;
  return Wrapped;
};
