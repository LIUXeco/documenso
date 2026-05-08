import * as React from 'react';

import { useLingui } from '@lingui/react';

import { Body, Container, Head, Hr, Html, Img, Link, Preview, Section, Text } from '../components';

const LIUX_LOGO =
  'https://eillhzsqqtboriqwfftq.storage.supabase.co/storage/v1/object/public/email-assets/liux_logo.png';
const LIUX_LOGO_DARK =
  'https://eillhzsqqtboriqwfftq.storage.supabase.co/storage/v1/object/public/email-assets/liux_logo_white.png';

const FONT_STACK = 'Helvetica, Arial, sans-serif';

const PAGE_BG = '#e0e0e0';
const CARD_BG = '#FFFFFF';
const TEXT_PRIMARY = '#1A1A1A';
const TEXT_SECONDARY = '#666';
const TEXT_MUTED = '#AAA';
const TEXT_DIVIDER = '#e0e0e0';
const COPYRIGHT_TEXT = '#BBB';

const POWERED_BY_GRADIENT: Array<{ char: string; color: string }> = [
  { char: 'P', color: '#38465b' },
  { char: 'o', color: '#38465b' },
  { char: 'w', color: '#38465b' },
  { char: 'e', color: '#38465b' },
  { char: 'r', color: '#576477' },
  { char: 'e', color: '#687d8c' },
  { char: 'd', color: '#687d8c' },
];

export type TemplateBaseLayoutProps = {
  previewText: string;
  children: React.ReactNode;
  lang?: string;
};

export const TemplateBaseLayout = ({ previewText, children, lang }: TemplateBaseLayoutProps) => {
  // Read the active Lingui locale set by renderEmailWithI18N. This makes the
  // <Html lang> attribute follow the recipient's preferred language without
  // having to plumb lang through every template's call site.
  const { i18n } = useLingui();
  const resolvedLang = lang ?? i18n.locale ?? 'en';

  return (
    <Html lang={resolvedLang}>
      <Head>
        <style>{`
          .logo-dark { display: none !important; }
          @media (prefers-color-scheme: dark) {
            .logo-light { display: none !important; }
            .logo-dark { display: inline-block !important; }
          }
        `}</style>
      </Head>

      <Preview>{previewText}</Preview>

      <Body
        style={{
          margin: 0,
          padding: 0,
          backgroundColor: PAGE_BG,
          fontFamily: FONT_STACK,
        }}
      >
        <Container
          style={{
            maxWidth: '560px',
            padding: '40px 20px',
          }}
        >
          {/* Main card */}
          <Section
            style={{
              backgroundColor: CARD_BG,
              borderRadius: '16px',
              overflow: 'hidden',
            }}
          >
            {/* Header: LIUX logo right-aligned */}
            <Section style={{ padding: '42px 40px 24px 40px', textAlign: 'right' }}>
              <Img
                className="logo-light"
                src={LIUX_LOGO}
                alt="LIUX"
                width="120"
                style={{ display: 'inline-block', border: 0 }}
              />
              <Img
                className="logo-dark"
                src={LIUX_LOGO_DARK}
                alt="LIUX"
                width="120"
                style={{ display: 'none', border: 0 }}
              />
            </Section>

            <Section style={{ padding: '0 40px' }}>
              <Hr style={{ borderTop: `1px solid ${TEXT_DIVIDER}`, margin: 0 }} />
            </Section>

            {/* Body slot */}
            <Section style={{ padding: '32px 40px 40px 40px' }}>{children}</Section>
          </Section>

          {/* Footer */}
          <Section style={{ padding: '40px 40px', textAlign: 'center' }}>
            <Section style={{ marginBottom: '12px', textAlign: 'center' }}>
              <Img
                className="logo-light"
                src={LIUX_LOGO}
                alt="LIUX"
                width="120"
                style={{ display: 'inline-block', border: 0, margin: '0 auto' }}
              />
              <Img
                className="logo-dark"
                src={LIUX_LOGO_DARK}
                alt="LIUX"
                width="120"
                style={{ display: 'none', border: 0, margin: '0 auto' }}
              />
            </Section>

            <Text
              style={{
                margin: '0 0 24px',
                fontFamily: FONT_STACK,
                fontSize: '20px',
                fontWeight: 'bold',
                lineHeight: 1.2,
                textAlign: 'center',
              }}
            >
              {POWERED_BY_GRADIENT.map((part, idx) => (
                <span key={idx} style={{ color: part.color }}>
                  {part.char}
                </span>
              ))}{' '}
              <span style={{ color: '#9ba2a5' }}>by</span>{' '}
              <span style={{ color: '#a8998b' }}>nature.</span>
            </Text>

            <Text
              style={{
                margin: '0',
                color: COPYRIGHT_TEXT,
                fontSize: '11px',
                fontFamily: FONT_STACK,
              }}
            >
              © {new Date().getFullYear()} LIUX · All rights reserved ·{' '}
              <Link
                href="mailto:legal@liux.eco"
                style={{ color: COPYRIGHT_TEXT, textDecoration: 'underline' }}
              >
                legal@liux.eco
              </Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export const EmailHeading = ({ children }: { children: React.ReactNode }) => (
  <Text
    style={{
      margin: '0 0 12px',
      color: TEXT_PRIMARY,
      fontSize: '24px',
      fontWeight: 700,
      fontFamily: FONT_STACK,
    }}
  >
    {children}
  </Text>
);

export const EmailParagraph = ({ children }: { children: React.ReactNode }) => (
  <Text
    style={{
      margin: '0 0 16px',
      color: TEXT_SECONDARY,
      fontSize: '16px',
      lineHeight: 1.7,
      fontFamily: FONT_STACK,
    }}
  >
    {children}
  </Text>
);

export const EmailMutedNote = ({ children }: { children: React.ReactNode }) => (
  <Text
    style={{
      margin: '24px 0 0',
      color: TEXT_MUTED,
      fontSize: '13px',
      lineHeight: 1.5,
      fontFamily: FONT_STACK,
    }}
  >
    {children}
  </Text>
);
