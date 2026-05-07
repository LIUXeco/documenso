const fs = require('fs');
const path = require('path');

// Common translations of the action verb (sign/approve/view) — Lingui interpolates whatever the i18n
// of the action verb returns, so the placeholder stays. We just translate the wrapper sentence.

const T = {
  // M1 — preview text (template-doc-invite + send-signing-email-handler indirectly)
  'LIUX has invited you to {action} {documentName}': {
    de: 'LIUX hat Sie eingeladen, {action} {documentName}',
    en: 'LIUX has invited you to {action} {documentName}',
    es: 'LIUX te ha invitado a {action} {documentName}',
    fr: 'LIUX vous a invité à {action} {documentName}',
    it: 'LIUX ti ha invitato a {action} {documentName}',
    ja: 'LIUX があなたを招待しました：{documentName} を {action}',
    ko: 'LIUX이 {documentName}을(를) {action}하도록 초대했습니다',
    nl: 'LIUX heeft je uitgenodigd om {documentName} te {action}',
    pl: 'LIUX zaprosił Cię do {action} {documentName}',
    'pt-BR': 'LIUX convidou você para {action} {documentName}',
    sq: 'LIUX ju ka ftuar të {action} {documentName}',
    zh: 'LIUX 邀请您 {action} {documentName}',
  },
  // M2 — body of invite template
  'LIUX has invited you to {action} the document "{documentName}".': {
    de: 'LIUX hat Sie eingeladen, das Dokument "{documentName}" zu {action}.',
    en: 'LIUX has invited you to {action} the document "{documentName}".',
    es: 'LIUX te ha invitado a {action} el documento "{documentName}".',
    fr: 'LIUX vous a invité à {action} le document « {documentName} ».',
    it: 'LIUX ti ha invitato a {action} il documento "{documentName}".',
    ja: 'LIUX があなたに文書「{documentName}」の{action}を依頼しました。',
    ko: 'LIUX이 문서 "{documentName}"을(를) {action}하도록 초대했습니다.',
    nl: 'LIUX heeft je uitgenodigd om het document "{documentName}" te {action}.',
    pl: 'LIUX zaprosił Cię do {action} dokumentu "{documentName}".',
    'pt-BR': 'LIUX convidou você para {action} o documento "{documentName}".',
    sq: 'LIUX ju ka ftuar të {action} dokumentin "{documentName}".',
    zh: 'LIUX 邀请您{action}文件"{documentName}"。',
  },
  // M3 — fallback body in send-signing-email-handler
  'LIUX has invited you to {recipientActionVerb} the document "{0}".': {
    de: 'LIUX hat Sie eingeladen, das Dokument "{0}" zu {recipientActionVerb}.',
    en: 'LIUX has invited you to {recipientActionVerb} the document "{0}".',
    es: 'LIUX te ha invitado a {recipientActionVerb} el documento "{0}".',
    fr: 'LIUX vous a invité à {recipientActionVerb} le document « {0} ».',
    it: 'LIUX ti ha invitato a {recipientActionVerb} il documento "{0}".',
    ja: 'LIUX があなたに文書「{0}」の{recipientActionVerb}を依頼しました。',
    ko: 'LIUX이 문서 "{0}"을(를) {recipientActionVerb}하도록 초대했습니다.',
    nl: 'LIUX heeft je uitgenodigd om het document "{0}" te {recipientActionVerb}.',
    pl: 'LIUX zaprosił Cię do {recipientActionVerb} dokumentu "{0}".',
    'pt-BR': 'LIUX convidou você para {recipientActionVerb} o documento "{0}".',
    sq: 'LIUX ju ka ftuar të {recipientActionVerb} dokumentin "{0}".',
    zh: 'LIUX 邀请您{recipientActionVerb}文件"{0}"。',
  },
  // M4 — subject for new document invite
  'LIUX invited you to {recipientActionVerb} a document': {
    de: 'LIUX hat Sie eingeladen, ein Dokument zu {recipientActionVerb}',
    en: 'LIUX invited you to {recipientActionVerb} a document',
    es: 'LIUX te invitó a {recipientActionVerb} un documento',
    fr: 'LIUX vous a invité à {recipientActionVerb} un document',
    it: 'LIUX ti ha invitato a {recipientActionVerb} un documento',
    ja: 'LIUX があなたを文書の{recipientActionVerb}に招待しました',
    ko: 'LIUX이 문서를 {recipientActionVerb}하도록 초대했습니다',
    nl: 'LIUX heeft je uitgenodigd om een document te {recipientActionVerb}',
    pl: 'LIUX zaprosił Cię do {recipientActionVerb} dokumentu',
    'pt-BR': 'LIUX convidou você para {recipientActionVerb} um documento',
    sq: 'LIUX ju ftoi të {recipientActionVerb} një dokument',
    zh: 'LIUX 邀请您 {recipientActionVerb} 文件',
  },
  // M5 — subject for reminder/resend
  'Reminder: LIUX invited you to {recipientActionVerb} a document': {
    de: 'Erinnerung: LIUX hat Sie eingeladen, ein Dokument zu {recipientActionVerb}',
    en: 'Reminder: LIUX invited you to {recipientActionVerb} a document',
    es: 'Recordatorio: LIUX te invitó a {recipientActionVerb} un documento',
    fr: 'Rappel : LIUX vous a invité à {recipientActionVerb} un document',
    it: 'Promemoria: LIUX ti ha invitato a {recipientActionVerb} un documento',
    ja: 'リマインダー：LIUX があなたを文書の{recipientActionVerb}に招待しました',
    ko: '알림: LIUX이 문서를 {recipientActionVerb}하도록 초대했습니다',
    nl: 'Herinnering: LIUX heeft je uitgenodigd om een document te {recipientActionVerb}',
    pl: 'Przypomnienie: LIUX zaprosił Cię do {recipientActionVerb} dokumentu',
    'pt-BR': 'Lembrete: LIUX convidou você para {recipientActionVerb} um documento',
    sq: 'Kujtesë: LIUX ju ftoi të {recipientActionVerb} një dokument',
    zh: '提醒：LIUX 邀请您 {recipientActionVerb} 文件',
  },
};

const langs = ['de', 'en', 'es', 'fr', 'it', 'ja', 'ko', 'nl', 'pl', 'pt-BR', 'sq', 'zh'];

let totalSet = 0,
  totalMissing = 0;

for (const lang of langs) {
  const file = path.join(__dirname, '..', 'packages/lib/translations', lang, 'web.po');
  if (!fs.existsSync(file)) continue;
  let raw = fs.readFileSync(file, 'utf8');
  const eol = raw.includes('\r\n') ? '\r\n' : '\n';

  for (const [msgid, translations] of Object.entries(T)) {
    const txt = translations[lang];
    if (!txt) continue;

    const escapedMsgid = msgid.replace(/"/g, '\\"');
    const probe = 'msgid "' + escapedMsgid + '"';
    const idx = raw.indexOf(probe);
    if (idx === -1) {
      console.log(lang + ': msgid not found: ' + msgid.slice(0, 60));
      totalMissing++;
      continue;
    }
    // Find the msgstr line that follows
    const msgstrStart = raw.indexOf(eol, idx) + eol.length;
    const msgstrEnd = raw.indexOf(eol, msgstrStart);
    const escapedTxt = txt.replace(/"/g, '\\"');
    raw = raw.slice(0, msgstrStart) + 'msgstr "' + escapedTxt + '"' + raw.slice(msgstrEnd);
    totalSet++;
  }

  fs.writeFileSync(file, raw);
}

console.log('translations set:', totalSet, '| missing:', totalMissing);
