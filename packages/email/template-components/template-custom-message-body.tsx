import React from 'react';

export type TemplateCustomMessageBodyProps = {
  text?: string;
};

const PARAGRAPH_STYLE: React.CSSProperties = {
  margin: '0 0 16px',
  color: '#666',
  fontSize: '16px',
  lineHeight: 1.7,
  fontFamily: 'Helvetica, Arial, sans-serif',
  whiteSpace: 'pre-line',
  wordBreak: 'break-word',
};

export const TemplateCustomMessageBody = ({ text }: TemplateCustomMessageBodyProps) => {
  if (!text) {
    return null;
  }

  const normalized = text
    .trim()
    .replace(/\r\n?/g, '\n')
    .replace(/\n\s*\n+/g, '\n\n')
    .replace(/\n{2,}/g, '\n\n');

  const paragraphs = normalized.split('\n\n');

  return (
    <>
      {paragraphs.map((paragraph, i) => (
        <p key={`p-${i}`} style={PARAGRAPH_STYLE}>
          {paragraph.split('\n').map((line, j) => (
            <React.Fragment key={`line-${i}-${j}`}>
              {j > 0 && <br />}
              {line}
            </React.Fragment>
          ))}
        </p>
      ))}
    </>
  );
};

export default TemplateCustomMessageBody;
