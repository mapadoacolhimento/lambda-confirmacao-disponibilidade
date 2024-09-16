// LAMBDA MATCH
export const LAMBDA_MATCH_URL = process.env["LAMBDA_MATCH_URL"];

//ZENDESK
export const ZENDESK_SUBDOMAIN = process.env["ZENDESK_SUBDOMAIN"];
export const ZENDESK_API_URL = `${ZENDESK_SUBDOMAIN}/api/v2`;
export const ZENDESK_API_USER = `${process.env["ZENDESK_API_USER"]}/token`;
export const ZENDESK_API_TOKEN = process.env["ZENDESK_API_TOKEN"];

export const ZENDESK_CUSTOM_FIELDS_DICIO = {
  status_acolhimento: 360014379412,
};

export const ZENDESK_TICKET_WAITING_FOR_CONFIRMATION_STATUS =
  "encaminhamento__aguardando_confirmação";
export const ZENDESK_TICKET_WAITING_FOR_MATCH_STATUS =
  "aguardando_match__sem_prioridade";
export const ZENDESK_USER_WAITING_FOR_CONFIRMATION_STATUS =
  "indisponivel_aguardando_confirmacao";
export const ZENDESK_USER_AVAILABLE_STATUS = "disponivel";

// TWILIO
export const TWILIO_ACCOUNT_SID = process.env["TWILIO_ACCOUNT_SID"];
export const TWILIO_AUTH_TOKEN = process.env["TWILIO_AUTH_TOKEN"];

// WHATSAPP
export const WHATSAPP_TEMPLATE_WITH_CITY_ID =
  "HXf970ed7554838224e3dd22103cb9afef";
export const WHATSAPP_TEMPLATE_WITHOUT_CITY_ID =
  "HX2dd028a6614cbc1e12a5ed3eeee0ab24";

export const WHATSAPP_SENDER_ID = process.env["TWILIO_MESSAGING_SID"];
export const WHATSAPP_GENERIC_REPLY = `Você está em um canal de mensagens automáticas. Mas saiba que estamos aqui para ajudar!

Se precisar conversar com alguém da nossa equipe, por favor, sinta-se à vontade para nos contatar pelo e-mail: voluntaria@mapadoacolhimento.org`;

export const WHATSAPP_POSITIVE_REPLY = `Obrigada por confirmar sua disponibilidade! 💜 Vamos compartilhar seu contato com a acolhida. Agora é só aguardar o contato dela para que vocês iniciem o atendimento!

📩 *Pedimos que fique atenta ao seu e-mail, pois as próximas atualizações serão enviadas por lá!*`;
// precisamos utilizar um template para a negativa, pois a mensagem possui botões
export const WHATSAPP_NEGATIVE_REPLY_TEMPLATE_ID =
  "HX0933a196163d79735d6ec3871672ce14";
export const WHATSAPP_CONTINUE_AVAILABLE_REPLY = `Obrigada pelo seu retorno! Em breve você receberá outras oportunidades de atendimento. 💜`;
export const WHATSAPP_ERROR_REPLY = `Ops, parece que essa solicitação já foi processada. Se estiver enfrentando alguma dificuldade, por favor, entre em contato pelo e-mail: voluntaria@mapadoacolhimento.org`;
export const WHATSAPP_UNREGISTRATION_REPLY_TEMPLATE_ID =
  "HX3ccc5212f22ecc0dbb2d27096374fb2c";
export const WHATSAPP_EXPIRATION_REPLY = `Como não recebemos o seu retorno a tempo, encaminhamos o pedido de ajuda para outra voluntária. De toda forma, obrigada pela sua dedicação a essa rede potente de acolhimento e solidariedade. Em breve você terá outras oportunidades de atendimento. 💜`;

// VOLUNTEER ANSWERS
export const POSITIVE_ANSWER = "Sim";
export const NEGATIVE_ANSWER = "Não";
export const CONTINUE_AVAILABLE_ANSWER = "É+um+caso+pontual";
export const UNREGISTRATION_ANSWER = "Quero+descadastrar";

// LOOPS
export const MSR_EMAIL_TRANSACTION_ID = "clzspeh8m00jw10mfp8yl96ih";
