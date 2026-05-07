const fs = require('fs');
const path = require('path');

const T = {
  // 1. Cancel preview text
  "{organisationName} has cancelled the document {documentName}, you don't need to sign it anymore.":
    {
      de: '{organisationName} hat das Dokument {documentName} storniert, Sie müssen es nicht mehr unterzeichnen.',
      en: "{organisationName} has cancelled the document {documentName}, you don't need to sign it anymore.",
      es: '{organisationName} ha cancelado el documento {documentName}, ya no necesitas firmarlo.',
      fr: "{organisationName} a annulé le document {documentName}, vous n'avez plus besoin de le signer.",
      it: '{organisationName} ha annullato il documento {documentName}, non è più necessario firmarlo.',
      ja: '{organisationName} が文書 {documentName} をキャンセルしました。署名は不要になりました。',
      ko: '{organisationName}이(가) 문서 {documentName}을(를) 취소했습니다. 더 이상 서명할 필요가 없습니다.',
      nl: '{organisationName} heeft het document {documentName} geannuleerd, je hoeft het niet meer te ondertekenen.',
      pl: '{organisationName} anulował dokument {documentName}, nie musisz go już podpisywać.',
      'pt-BR':
        '{organisationName} cancelou o documento {documentName}, você não precisa mais assiná-lo.',
      sq: '{organisationName} e ka anuluar dokumentin {documentName}, nuk është më e nevojshme ta nënshkruani.',
      zh: '{organisationName} 已取消文件 {documentName}，您无需再签署。',
    },
  // 2. Fallback body in send-signing-email
  '{organisationName} has invited you to {recipientActionVerb} the document "{0}".': {
    de: '{organisationName} hat Sie eingeladen, das Dokument "{0}" zu {recipientActionVerb}.',
    en: '{organisationName} has invited you to {recipientActionVerb} the document "{0}".',
    es: '{organisationName} te ha invitado a {recipientActionVerb} el documento "{0}".',
    fr: '{organisationName} vous a invité à {recipientActionVerb} le document « {0} ».',
    it: '{organisationName} ti ha invitato a {recipientActionVerb} il documento "{0}".',
    ja: '{organisationName} があなたに文書「{0}」の{recipientActionVerb}を依頼しました。',
    ko: '{organisationName}이(가) 문서 "{0}"을(를) {recipientActionVerb}하도록 초대했습니다.',
    nl: '{organisationName} heeft je uitgenodigd om het document "{0}" te {recipientActionVerb}.',
    pl: '{organisationName} zaprosił Cię do {recipientActionVerb} dokumentu "{0}".',
    'pt-BR': '{organisationName} convidou você para {recipientActionVerb} o documento "{0}".',
    sq: '{organisationName} ju ka ftuar të {recipientActionVerb} dokumentin "{0}".',
    zh: '{organisationName} 邀请您{recipientActionVerb}文件"{0}"。',
  },
  // 3. Subject for invite
  '{organisationName} invited you to {recipientActionVerb} a document': {
    de: '{organisationName} hat Sie eingeladen, ein Dokument zu {recipientActionVerb}',
    en: '{organisationName} invited you to {recipientActionVerb} a document',
    es: '{organisationName} te invitó a {recipientActionVerb} un documento',
    fr: '{organisationName} vous a invité à {recipientActionVerb} un document',
    it: '{organisationName} ti ha invitato a {recipientActionVerb} un documento',
    ja: '{organisationName} があなたを文書の{recipientActionVerb}に招待しました',
    ko: '{organisationName}이(가) 문서를 {recipientActionVerb}하도록 초대했습니다',
    nl: '{organisationName} heeft je uitgenodigd om een document te {recipientActionVerb}',
    pl: '{organisationName} zaprosił Cię do {recipientActionVerb} dokumentu',
    'pt-BR': '{organisationName} convidou você para {recipientActionVerb} um documento',
    sq: '{organisationName} ju ftoi të {recipientActionVerb} një dokument',
    zh: '{organisationName} 邀请您 {recipientActionVerb} 文件',
  },
  // 4. Preview text in invite template wrapper
  '{senderLabel} has invited you to {action} {documentName}': {
    de: '{senderLabel} hat Sie eingeladen, {action} {documentName}',
    en: '{senderLabel} has invited you to {action} {documentName}',
    es: '{senderLabel} te ha invitado a {action} {documentName}',
    fr: '{senderLabel} vous a invité à {action} {documentName}',
    it: '{senderLabel} ti ha invitato a {action} {documentName}',
    ja: '{senderLabel} があなたを招待しました：{documentName} を {action}',
    ko: '{senderLabel}이(가) {documentName}을(를) {action}하도록 초대했습니다',
    nl: '{senderLabel} heeft je uitgenodigd om {documentName} te {action}',
    pl: '{senderLabel} zaprosił Cię do {action} {documentName}',
    'pt-BR': '{senderLabel} convidou você para {action} {documentName}',
    sq: '{senderLabel} ju ka ftuar të {action} {documentName}',
    zh: '{senderLabel} 邀请您 {action} {documentName}',
  },
  // 5. Body of invite template
  '{senderLabel} has invited you to {action} the document "{documentName}".': {
    de: '{senderLabel} hat Sie eingeladen, das Dokument "{documentName}" zu {action}.',
    en: '{senderLabel} has invited you to {action} the document "{documentName}".',
    es: '{senderLabel} te ha invitado a {action} el documento "{documentName}".',
    fr: '{senderLabel} vous a invité à {action} le document « {documentName} ».',
    it: '{senderLabel} ti ha invitato a {action} il documento "{documentName}".',
    ja: '{senderLabel} があなたに文書「{documentName}」の{action}を依頼しました。',
    ko: '{senderLabel}이(가) 문서 "{documentName}"을(를) {action}하도록 초대했습니다.',
    nl: '{senderLabel} heeft je uitgenodigd om het document "{documentName}" te {action}.',
    pl: '{senderLabel} zaprosił Cię do {action} dokumentu "{documentName}".',
    'pt-BR': '{senderLabel} convidou você para {action} o documento "{documentName}".',
    sq: '{senderLabel} ju ka ftuar të {action} dokumentin "{documentName}".',
    zh: '{senderLabel} 邀请您{action}文件"{documentName}"。',
  },
  // 6. Reminder subject
  'Reminder: {organisationName} invited you to {recipientActionVerb} a document': {
    de: 'Erinnerung: {organisationName} hat Sie eingeladen, ein Dokument zu {recipientActionVerb}',
    en: 'Reminder: {organisationName} invited you to {recipientActionVerb} a document',
    es: 'Recordatorio: {organisationName} te invitó a {recipientActionVerb} un documento',
    fr: 'Rappel : {organisationName} vous a invité à {recipientActionVerb} un document',
    it: 'Promemoria: {organisationName} ti ha invitato a {recipientActionVerb} un documento',
    ja: 'リマインダー：{organisationName} があなたを文書の{recipientActionVerb}に招待しました',
    ko: '알림: {organisationName}이(가) 문서를 {recipientActionVerb}하도록 초대했습니다',
    nl: 'Herinnering: {organisationName} heeft je uitgenodigd om een document te {recipientActionVerb}',
    pl: 'Przypomnienie: {organisationName} zaprosił Cię do {recipientActionVerb} dokumentu',
    'pt-BR': 'Lembrete: {organisationName} convidou você para {recipientActionVerb} um documento',
    sq: 'Kujtesë: {organisationName} ju ftoi të {recipientActionVerb} një dokument',
    zh: '提醒：{organisationName} 邀请您 {recipientActionVerb} 文件',
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
      totalMissing++;
      continue;
    }
    const msgstrStart = raw.indexOf(eol, idx) + eol.length;
    const msgstrEnd = raw.indexOf(eol, msgstrStart);
    const escapedTxt = txt.replace(/"/g, '\\"');
    raw = raw.slice(0, msgstrStart) + 'msgstr "' + escapedTxt + '"' + raw.slice(msgstrEnd);
    totalSet++;
  }

  fs.writeFileSync(file, raw);
}

console.log('translations set:', totalSet, '| missing:', totalMissing);
