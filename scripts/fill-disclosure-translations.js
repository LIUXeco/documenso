const fs = require('fs');
const path = require('path');

const M1 =
  'Thank you for using LIUX Sign to perform your electronic document signing. The purpose of this disclosure is to inform you about the process, legality, and your rights regarding the use of electronic signatures on our platform. By opting to use an electronic signature, you are agreeing to the terms and conditions outlined below.';
const M2 =
  'By proceeding to use the electronic signature service provided by LIUX Sign, you affirm that you have read and understood this disclosure. You agree to all terms and conditions related to the use of electronic signatures and electronic transactions as outlined herein.';
const M3 =
  'You have the right to withdraw your consent to use electronic signatures at any time before completing the signing process. To withdraw your consent, please contact the sender of the document. In failing to contact the sender you may reach out to <0>{LEGAL_EMAIL}</0> for assistance. Be aware that withdrawing consent may delay or halt the completion of the related transaction or service.';
const M4 =
  'For any questions regarding this disclosure, electronic signatures, or any related process, please contact us at: <0>{LEGAL_EMAIL}</0>';

const T = {
  de: {
    [M1]: 'Vielen Dank, dass Sie LIUX Sign für Ihre elektronische Dokumentensignatur verwenden. Der Zweck dieser Offenlegung ist es, Sie über den Prozess, die Rechtmäßigkeit und Ihre Rechte in Bezug auf die Verwendung elektronischer Signaturen auf unserer Plattform zu informieren. Mit der Nutzung einer elektronischen Signatur erklären Sie sich mit den unten aufgeführten Bedingungen einverstanden.',
    [M2]: 'Indem Sie den von LIUX Sign bereitgestellten elektronischen Signaturdienst weiter nutzen, bestätigen Sie, dass Sie diese Offenlegung gelesen und verstanden haben. Sie stimmen allen Bedingungen zu, die mit der Nutzung elektronischer Signaturen und elektronischer Transaktionen wie hierin beschrieben verbunden sind.',
    [M3]: 'Sie haben das Recht, Ihre Zustimmung zur Verwendung elektronischer Signaturen jederzeit vor Abschluss des Signiervorgangs zu widerrufen. Um Ihre Zustimmung zu widerrufen, wenden Sie sich bitte an den Absender des Dokuments. Falls Sie den Absender nicht erreichen können, wenden Sie sich an <0>{LEGAL_EMAIL}</0> für Unterstützung. Beachten Sie, dass der Widerruf der Zustimmung den Abschluss der zugehörigen Transaktion oder des Dienstes verzögern oder verhindern kann.',
    [M4]: 'Bei Fragen zu dieser Offenlegung, elektronischen Signaturen oder einem damit verbundenen Prozess kontaktieren Sie uns bitte unter: <0>{LEGAL_EMAIL}</0>',
  },
  fr: {
    [M1]: "Merci d'utiliser LIUX Sign pour effectuer la signature électronique de vos documents. Le but de cette divulgation est de vous informer sur le processus, la légalité et vos droits concernant l'utilisation des signatures électroniques sur notre plateforme. En choisissant d'utiliser une signature électronique, vous acceptez les termes et conditions décrits ci-dessous.",
    [M2]: "En continuant à utiliser le service de signature électronique fourni par LIUX Sign, vous affirmez avoir lu et compris cette divulgation. Vous acceptez tous les termes et conditions liés à l'utilisation des signatures électroniques et des transactions électroniques tels que décrits ici.",
    [M3]: "Vous avez le droit de retirer votre consentement à l'utilisation des signatures électroniques à tout moment avant de terminer le processus de signature. Pour retirer votre consentement, veuillez contacter l'expéditeur du document. À défaut de pouvoir contacter l'expéditeur, vous pouvez vous adresser à <0>{LEGAL_EMAIL}</0> pour obtenir de l'aide. Notez que le retrait du consentement peut retarder ou interrompre la finalisation de la transaction ou du service concerné.",
    [M4]: 'Pour toute question concernant cette divulgation, les signatures électroniques ou tout processus connexe, veuillez nous contacter à : <0>{LEGAL_EMAIL}</0>',
  },
  it: {
    [M1]: "Grazie per aver utilizzato LIUX Sign per la firma elettronica dei tuoi documenti. Lo scopo di questa informativa è informarti sul processo, la legalità e i tuoi diritti riguardo all'uso delle firme elettroniche sulla nostra piattaforma. Scegliendo di utilizzare una firma elettronica, accetti i termini e le condizioni descritti di seguito.",
    [M2]: "Procedendo all'uso del servizio di firma elettronica fornito da LIUX Sign, confermi di aver letto e compreso questa informativa. Accetti tutti i termini e le condizioni relativi all'uso delle firme elettroniche e delle transazioni elettroniche descritti qui.",
    [M3]: "Hai il diritto di revocare il tuo consenso all'uso delle firme elettroniche in qualsiasi momento prima di completare il processo di firma. Per revocare il consenso, contatta il mittente del documento. In caso di mancato contatto con il mittente, puoi rivolgerti a <0>{LEGAL_EMAIL}</0> per assistenza. Tieni presente che la revoca del consenso può ritardare o interrompere il completamento della transazione o del servizio correlato.",
    [M4]: "Per qualsiasi domanda riguardante questa informativa, le firme elettroniche o qualsiasi processo correlato, contattaci all'indirizzo: <0>{LEGAL_EMAIL}</0>",
  },
  ja: {
    [M1]: 'LIUX Signをご利用いただきありがとうございます。本開示の目的は、当社プラットフォーム上での電子署名の使用に関するプロセス、合法性、およびお客様の権利についてお知らせすることです。電子署名の使用を選択することにより、以下に記載される利用規約に同意したものとみなされます。',
    [M2]: 'LIUX Signが提供する電子署名サービスの使用を続行することにより、お客様はこの開示を読み、理解したことを確認します。本書に記載されている電子署名および電子取引の使用に関連するすべての利用規約に同意します。',
    [M3]: 'お客様は、署名プロセスを完了する前であればいつでも電子署名の使用に対する同意を撤回する権利があります。同意を撤回するには、文書の送信者にご連絡ください。送信者に連絡できない場合は、<0>{LEGAL_EMAIL}</0> にお問い合わせください。同意の撤回により、関連する取引またはサービスの完了が遅延または停止する可能性があることにご注意ください。',
    [M4]: 'この開示、電子署名、または関連するプロセスに関するご質問は、<0>{LEGAL_EMAIL}</0> までお問い合わせください。',
  },
  ko: {
    [M1]: 'LIUX Sign을 이용해 주셔서 감사합니다. 본 고지의 목적은 당사 플랫폼에서의 전자 서명 사용과 관련된 절차, 합법성 및 귀하의 권리에 대해 알려드리는 것입니다. 전자 서명을 사용하기로 선택함으로써 아래에 명시된 이용약관에 동의하게 됩니다.',
    [M2]: 'LIUX Sign이 제공하는 전자 서명 서비스를 계속 사용함으로써 귀하는 본 고지를 읽고 이해했음을 확인합니다. 귀하는 본 문서에 명시된 전자 서명 및 전자 거래 사용과 관련된 모든 이용약관에 동의합니다.',
    [M3]: '귀하는 서명 절차를 완료하기 전 언제든지 전자 서명 사용에 대한 동의를 철회할 권리가 있습니다. 동의를 철회하려면 문서 발신자에게 연락하시기 바랍니다. 발신자에게 연락할 수 없는 경우 <0>{LEGAL_EMAIL}</0>로 문의하실 수 있습니다. 동의 철회로 인해 관련 거래 또는 서비스의 완료가 지연되거나 중단될 수 있음을 유의하시기 바랍니다.',
    [M4]: '이 고지, 전자 서명 또는 관련 절차에 대한 문의는 <0>{LEGAL_EMAIL}</0>로 연락해 주시기 바랍니다.',
  },
  nl: {
    [M1]: 'Bedankt voor het gebruik van LIUX Sign om uw elektronische documenten te ondertekenen. Het doel van deze bekendmaking is u te informeren over het proces, de wettigheid en uw rechten met betrekking tot het gebruik van elektronische handtekeningen op ons platform. Door te kiezen voor een elektronische handtekening gaat u akkoord met de hieronder beschreven voorwaarden.',
    [M2]: 'Door door te gaan met het gebruik van de elektronische handtekeningendienst van LIUX Sign, bevestigt u dat u deze bekendmaking heeft gelezen en begrepen. U gaat akkoord met alle voorwaarden met betrekking tot het gebruik van elektronische handtekeningen en elektronische transacties zoals hierin beschreven.',
    [M3]: 'U heeft het recht om uw toestemming voor het gebruik van elektronische handtekeningen op elk moment vóór het voltooien van het ondertekeningsproces in te trekken. Neem contact op met de afzender van het document om uw toestemming in te trekken. Als u de afzender niet kunt bereiken, kunt u contact opnemen met <0>{LEGAL_EMAIL}</0> voor hulp. Houd er rekening mee dat het intrekken van toestemming de voltooiing van de gerelateerde transactie of dienst kan vertragen of stopzetten.',
    [M4]: 'Voor vragen over deze bekendmaking, elektronische handtekeningen of een gerelateerd proces kunt u contact met ons opnemen via: <0>{LEGAL_EMAIL}</0>',
  },
  pl: {
    [M1]: 'Dziękujemy za korzystanie z LIUX Sign do elektronicznego podpisywania dokumentów. Celem niniejszego ujawnienia jest poinformowanie Państwa o procesie, legalności i prawach związanych z używaniem podpisów elektronicznych na naszej platformie. Wybierając podpis elektroniczny, akceptujesz warunki opisane poniżej.',
    [M2]: 'Kontynuując korzystanie z usługi podpisu elektronicznego dostarczanej przez LIUX Sign, potwierdzasz, że przeczytałeś i zrozumiałeś niniejsze ujawnienie. Akceptujesz wszystkie warunki związane z używaniem podpisów elektronicznych i transakcji elektronicznych opisane w niniejszym dokumencie.',
    [M3]: 'Masz prawo wycofać zgodę na używanie podpisów elektronicznych w dowolnym momencie przed zakończeniem procesu podpisywania. Aby wycofać zgodę, skontaktuj się z nadawcą dokumentu. W razie braku możliwości kontaktu z nadawcą możesz skontaktować się z <0>{LEGAL_EMAIL}</0> w celu uzyskania pomocy. Pamiętaj, że wycofanie zgody może opóźnić lub uniemożliwić zakończenie powiązanej transakcji lub usługi.',
    [M4]: 'W przypadku jakichkolwiek pytań dotyczących niniejszego ujawnienia, podpisów elektronicznych lub jakiegokolwiek powiązanego procesu, prosimy o kontakt: <0>{LEGAL_EMAIL}</0>',
  },
  'pt-BR': {
    [M1]: 'Obrigado por usar o LIUX Sign para realizar a assinatura eletrônica dos seus documentos. O propósito desta divulgação é informá-lo sobre o processo, a legalidade e seus direitos em relação ao uso de assinaturas eletrônicas em nossa plataforma. Ao optar por usar uma assinatura eletrônica, você está concordando com os termos e condições descritos abaixo.',
    [M2]: 'Ao continuar usando o serviço de assinatura eletrônica fornecido pelo LIUX Sign, você afirma que leu e entendeu esta divulgação. Você concorda com todos os termos e condições relacionados ao uso de assinaturas eletrônicas e transações eletrônicas conforme descrito aqui.',
    [M3]: 'Você tem o direito de retirar seu consentimento para o uso de assinaturas eletrônicas a qualquer momento antes de concluir o processo de assinatura. Para retirar seu consentimento, entre em contato com o remetente do documento. Caso não consiga contato com o remetente, você pode entrar em contato com <0>{LEGAL_EMAIL}</0> para obter assistência. Esteja ciente de que a retirada do consentimento pode atrasar ou interromper a conclusão da transação ou serviço relacionado.',
    [M4]: 'Para quaisquer perguntas sobre esta divulgação, assinaturas eletrônicas ou qualquer processo relacionado, entre em contato conosco em: <0>{LEGAL_EMAIL}</0>',
  },
  sq: {
    [M1]: "Faleminderit që përdorni LIUX Sign për nënshkrimin elektronik të dokumenteve. Qëllimi i kësaj zbulimi është t'ju informojë mbi procesin, ligjshmërinë dhe të drejtat tuaja në lidhje me përdorimin e nënshkrimeve elektronike në platformën tonë. Duke zgjedhur të përdorni një nënshkrim elektronik, ju pranoni termat dhe kushtet e përshkruara më poshtë.",
    [M2]: 'Duke vazhduar përdorimin e shërbimit të nënshkrimit elektronik të ofruar nga LIUX Sign, ju pohoni se keni lexuar dhe kuptuar këtë zbulim. Ju pranoni të gjitha termat dhe kushtet që lidhen me përdorimin e nënshkrimeve elektronike dhe transaksioneve elektronike siç përshkruhen këtu.',
    [M3]: 'Ju keni të drejtë të tërhiqni pëlqimin tuaj për përdorimin e nënshkrimeve elektronike në çdo kohë para përfundimit të procesit të nënshkrimit. Për të tërhequr pëlqimin tuaj, kontaktoni dërguesin e dokumentit. Nëse nuk mund të kontaktoni dërguesin, mund të drejtoheni te <0>{LEGAL_EMAIL}</0> për ndihmë. Vini re se tërheqja e pëlqimit mund të vonojë ose ndalojë përfundimin e transaksionit ose shërbimit përkatës.',
    [M4]: 'Për çdo pyetje në lidhje me këtë zbulim, nënshkrimet elektronike ose çdo proces të lidhur me to, ju lutemi kontaktoni: <0>{LEGAL_EMAIL}</0>',
  },
  zh: {
    [M1]: '感谢您使用 LIUX Sign 进行电子文档签署。本披露的目的是向您告知在我们平台上使用电子签名的过程、合法性以及您的权利。选择使用电子签名即表示您同意下列条款和条件。',
    [M2]: '继续使用 LIUX Sign 提供的电子签名服务即表示您确认已阅读并理解本披露。您同意本文所述的与使用电子签名和电子交易相关的所有条款和条件。',
    [M3]: '您有权在完成签署过程前随时撤回对使用电子签名的同意。要撤回同意，请联系文档发送方。如果无法联系到发送方,您可以联系 <0>{LEGAL_EMAIL}</0> 获取帮助。请注意,撤回同意可能会延迟或阻止相关交易或服务的完成。',
    [M4]: '如对本披露、电子签名或任何相关流程有疑问,请通过以下方式联系我们: <0>{LEGAL_EMAIL}</0>',
  },
};

let totalSet = 0,
  totalSkipped = 0,
  totalMissing = 0;
for (const [lang, dict] of Object.entries(T)) {
  const file = path.join(__dirname, '..', 'packages/lib/translations', lang, 'web.po');
  if (!fs.existsSync(file)) {
    console.log(lang + ': file missing');
    continue;
  }
  let raw = fs.readFileSync(file, 'utf8');
  const eol = raw.includes('\r\n') ? '\r\n' : '\n';
  for (const [msgid, msgstr] of Object.entries(dict)) {
    const escaped = msgid.replace(/"/g, '\\"');
    const empty = 'msgid "' + escaped + '"' + eol + 'msgstr ""';
    if (!raw.includes(empty)) {
      const probe = 'msgid "' + escaped + '"';
      if (raw.includes(probe)) {
        totalSkipped++;
      } else {
        totalMissing++;
        console.log(lang + ': msgid not found: ' + msgid.slice(0, 60) + '…');
      }
      continue;
    }
    const replacement =
      'msgid "' + escaped + '"' + eol + 'msgstr "' + msgstr.replace(/"/g, '\\"') + '"';
    raw = raw.replace(empty, replacement);
    totalSet++;
  }
  fs.writeFileSync(file, raw);
}
console.log(
  'translations set:',
  totalSet,
  '| already-set:',
  totalSkipped,
  '| missing:',
  totalMissing,
);
