/**
 * Conteúdo do site, centralizado e tipado.
 *
 * Regras (AGENTS.md §6):
 *  - Nada de promessa de resultado, preço, superlativos, depoimentos ou símbolos da OAB.
 *  - Dados reais ainda não informados ficam como `TODO: ...` e NUNCA são inventados.
 *    Use `isPending()` para não renderizar ou não incluir no JSON-LD um dado pendente.
 */
import type { ImageSlug } from './images.generated';

export type Pending = `TODO: ${string}`;

export function isPending(value: string | null | undefined): value is Pending | null | undefined {
  return !value || value.startsWith('TODO:');
}

export interface NavItem {
  readonly id: SectionId;
  readonly label: string;
}

export type SectionId = 'sobre' | 'atuacao' | 'como-atuo' | 'palestras' | 'duvidas' | 'contato';

export interface Photo {
  readonly slug: ImageSlug;
  readonly alt: string;
}

export interface PracticeItem {
  readonly title: string;
  readonly text: string;
}

export interface PracticeGroup {
  readonly id: 'familias' | 'sucessoes';
  readonly eyebrow: string;
  readonly title: string;
  readonly intro: string;
  readonly items: readonly PracticeItem[];
}

export interface Pillar {
  readonly title: string;
  readonly text: string;
}

export interface SpeakingEvent {
  readonly title: string;
  readonly event: string;
  readonly date: string;
  readonly place: string;
}

export interface FaqItem {
  readonly question: string;
  readonly answer: string;
}

// ─── Dados da profissional e do escritório ─────────────────────────────────

export const PROFILE = {
  name: 'Brunna Fortuna',
  firmName: 'Brunna Fortuna Advocacia',
  role: 'Advogada',
  oab: 'TODO: OAB/BA nº XXXXX' as string,
  specialization: 'Especialista em Direito das Famílias e Sucessões pela Escola Paulista de Direito (EPD)',
  institutional: 'Membro da Diretoria do IBDFAM-BA (Instituto Brasileiro de Direito de Família, seção Bahia)',
  institutions: {
    epd: { name: 'Escola Paulista de Direito', short: 'EPD', url: 'https://www.epd.edu.br/' },
    ibdfam: {
      name: 'Instituto Brasileiro de Direito de Família, seção Bahia',
      short: 'IBDFAM-BA',
      url: 'https://ibdfam.org.br/',
    },
  },
} as const;

export const CONTACT = {
  /** Somente dígitos, com DDI e DDD (ex.: 5571999999999). */
  whatsapp: 'TODO: WhatsApp com DDI e DDD' as string,
  whatsappDisplay: 'TODO: (71) 9 9999-9999' as string,
  whatsappMessage: 'Olá, Dra. Brunna. Gostaria de agendar uma conversa sobre um assunto de Direito de Família/Sucessões.',
  email: 'TODO: e-mail profissional' as string,
  address: 'TODO: endereço do escritório' as string,
  city: 'TODO: cidade/UF' as string,
  hours: 'TODO: horário de atendimento' as string,
  instagram: 'TODO: URL do Instagram' as string,
  linkedin: 'TODO: URL do LinkedIn' as string,
} as const;

export const SITE = {
  /** Domínio de produção, sem barra final. */
  url: 'TODO: https://www.dominio.com.br' as string,
  locale: 'pt_BR',
  title: 'Brunna Fortuna Advocacia | Direito das Famílias e Sucessões',
  description:
    'Advogada de família e sucessões: divórcio, guarda, pensão alimentícia, inventário e planejamento sucessório, com escuta atenta, sigilo e orientação clara.',
  /** Endpoint do formulário (ex.: Formspree ou backend próprio). */
  formEndpoint: 'TODO: endpoint do formulário de contato' as string,
} as const;

// ─── Navegação ─────────────────────────────────────────────────────────────

export const NAV: readonly NavItem[] = [
  { id: 'sobre', label: 'Sobre' },
  { id: 'atuacao', label: 'Atuação' },
  { id: 'como-atuo', label: 'Como atuo' },
  { id: 'palestras', label: 'Palestras' },
  { id: 'duvidas', label: 'Dúvidas' },
  { id: 'contato', label: 'Contato' },
];

export const CTA_LABEL = 'Agendar conversa';

// ─── Seções ────────────────────────────────────────────────────────────────

export const HERO = {
  eyebrow: 'Brunna Fortuna · Advogada',
  titleLead: 'Advocacia em Direito',
  titleAccent: 'das Famílias e das Sucessões',
  subtitle:
    'Orientação jurídica cuidadosa para os momentos que transformam uma família: separações, cuidado com os filhos, heranças e a organização do patrimônio entre gerações.',
  primaryCta: CTA_LABEL,
  secondaryCta: 'Conhecer as áreas de atuação',
  photo: {
    slug: 'brunna-hero',
    alt: 'Retrato da advogada Brunna Fortuna, de blusa vinho, segurando uma pasta com a marca do escritório',
  } satisfies Photo,
} as const;

export const ABOUT = {
  eyebrow: 'Sobre',
  title: 'Direito de Família exige técnica, e também sensibilidade.',
  paragraphs: [
    'Sou Brunna Fortuna, advogada dedicada ao Direito das Famílias e das Sucessões. Atuo nas esferas consultiva e contenciosa, acompanhando pessoas e famílias em decisões que envolvem afeto, convivência e patrimônio.',
    'Sou especialista em Direito das Famílias e Sucessões pela Escola Paulista de Direito (EPD) e integro a Diretoria do IBDFAM-BA, a seção Bahia do Instituto Brasileiro de Direito de Família. Também atuo como palestrante, levando informação jurídica de qualidade a quem precisa compreender os próprios direitos.',
    'Acredito que cada família tem uma história própria. Por isso, o trabalho começa pela escuta: entender o contexto, explicar os caminhos possíveis com clareza e construir, junto com você, a estratégia mais adequada.',
  ],
  credentials: [
    {
      label: 'Especialização',
      title: 'Direito das Famílias e Sucessões',
      detail: 'Escola Paulista de Direito (EPD)',
    },
    {
      label: 'Atuação institucional',
      title: 'Membro da Diretoria do IBDFAM-BA',
      detail: 'Instituto Brasileiro de Direito de Família, seção Bahia',
    },
    {
      label: 'Educação jurídica',
      title: 'Palestrante',
      detail: 'Eventos, cursos e debates sobre Famílias e Sucessões',
    },
  ],
  photo: {
    slug: 'brunna-livros',
    alt: 'Brunna Fortuna sorrindo em seu escritório, apoiada sobre uma pilha de livros de Direito de Família e Sucessões',
  } satisfies Photo,
} as const;

export const MANIFESTO = {
  text: 'Cada família tem a sua história. O papel do Direito é proteger quem faz parte dela, com respeito, clareza e segurança jurídica.',
} as const;

export const PRACTICE = {
  eyebrow: 'Áreas de atuação',
  title: 'Famílias e Sucessões',
  intro:
    'Assessoria preventiva e atuação em processos judiciais e extrajudiciais, sempre com informação clara sobre cada etapa.',
  groups: [
    {
      id: 'familias',
      eyebrow: 'Direito das Famílias',
      title: 'Relações familiares',
      intro: 'Questões de convivência, cuidado e patrimônio entre pessoas que formam ou desfazem uma família.',
      items: [
        {
          title: 'Divórcio consensual e litigioso',
          text: 'Orientação sobre a via judicial ou em cartório, partilha, guarda, alimentos e demais efeitos do divórcio.',
        },
        {
          title: 'União estável',
          text: 'Reconhecimento e dissolução da união estável, contratos de convivência e definição de regime de bens.',
        },
        {
          title: 'Guarda e convivência',
          text: 'Guarda compartilhada ou unilateral e regulamentação da convivência, com foco no melhor interesse da criança.',
        },
        {
          title: 'Pensão alimentícia',
          text: 'Fixação, revisão, exoneração e execução de alimentos, considerando necessidade e possibilidade.',
        },
        {
          title: 'Partilha de bens',
          text: 'Levantamento e divisão do patrimônio comum de acordo com o regime de bens aplicável.',
        },
        {
          title: 'Regime de bens e pacto antenupcial',
          text: 'Escolha consciente do regime de bens, pacto antenupcial e alteração de regime durante o casamento.',
        },
        {
          title: 'Filiação e parentalidade socioafetiva',
          text: 'Investigação e reconhecimento de paternidade e reconhecimento da parentalidade socioafetiva.',
        },
      ],
    },
    {
      id: 'sucessoes',
      eyebrow: 'Direito das Sucessões',
      title: 'Patrimônio e herança',
      intro: 'Organização da transmissão do patrimônio, em vida ou após o falecimento, com segurança para todos os herdeiros.',
      items: [
        {
          title: 'Inventário judicial e extrajudicial',
          text: 'Condução do inventário no cartório ou na Justiça, conforme o caso, do levantamento dos bens à partilha.',
        },
        {
          title: 'Arrolamento',
          text: 'Procedimento simplificado de inventário, cabível em hipóteses previstas na lei processual.',
        },
        {
          title: 'Testamento',
          text: 'Elaboração e orientação sobre as formas de testamento, respeitando a parte reservada aos herdeiros necessários.',
        },
        {
          title: 'Planejamento sucessório e patrimonial',
          text: 'Organização prévia da sucessão para reduzir conflitos e dar previsibilidade à família.',
        },
        {
          title: 'Holding familiar',
          text: 'Estudo da holding como um dos instrumentos possíveis de planejamento, quando adequada ao patrimônio e aos objetivos da família.',
        },
        {
          title: 'Partilha em vida e doação',
          text: 'Doações com ou sem reserva de usufruto e partilha em vida, observados os limites legais.',
        },
      ],
    },
  ] satisfies readonly PracticeGroup[],
} as const;

export const APPROACH = {
  eyebrow: 'Como atuo',
  title: 'Escuta, clareza e estratégia',
  intro:
    'Temas de família raramente são apenas jurídicos. A forma de conduzir cada caso importa tanto quanto o conhecimento técnico.',
  pillars: [
    {
      title: 'Atendimento humanizado',
      text: 'Cada conversa começa pela escuta. Você entende o que está em jogo e quais são os caminhos possíveis, em linguagem clara.',
    },
    {
      title: 'Sigilo e discrição',
      text: 'Questões familiares pedem reserva. As informações compartilhadas são tratadas com o sigilo profissional que a advocacia exige.',
    },
    {
      title: 'Preferência pelo consenso',
      text: 'Sempre que possível, busca-se a solução construída pelas partes, por meio de diálogo, mediação e acordos.',
    },
    {
      title: 'Estratégia no contencioso',
      text: 'Quando o processo judicial é necessário, a atuação é técnica, planejada e atenta a cada etapa.',
    },
  ] satisfies readonly Pillar[],
  photo: {
    slug: 'brunna-palestras',
    alt: 'Brunna Fortuna sentada em uma poltrona de couro, segurando um livro de redação jurídica',
  } satisfies Photo,
} as const;

export const SPEAKING = {
  eyebrow: 'Palestras e atuação institucional',
  title: 'Informação jurídica que chega a mais pessoas',
  paragraphs: [
    'Além da advocacia, Brunna Fortuna atua como palestrante em temas de Direito das Famílias e das Sucessões, contribuindo para o debate jurídico e para a informação do público.',
    'Como membro da Diretoria do IBDFAM-BA, participa da agenda do Instituto Brasileiro de Direito de Família na Bahia, que reúne profissionais dedicados ao estudo e ao aprimoramento do Direito das Famílias.',
  ],
  topics: [
    'Divórcio e partilha de bens',
    'Guarda compartilhada e convivência',
    'Planejamento sucessório',
    'Inventário e herança',
  ],
  events: [
    {
      title: 'TODO: título da palestra',
      event: 'TODO: nome do evento',
      date: 'TODO: data',
      place: 'TODO: local',
    },
  ] satisfies readonly SpeakingEvent[],
  invitation: 'Para convites de palestras, eventos e entrevistas, entre em contato.',
  photo: {
    slug: 'brunna-retrato',
    alt: 'Retrato de Brunna Fortuna sorrindo, com as mãos apoiadas sob o queixo, em fundo marrom',
  } satisfies Photo,
  video: {
    src: '/media/palestra.mp4',
    poster: '/images/brunna-palestras-768.webp',
    title: 'Assista a um trecho',
    label: 'Vídeo: trecho de palestra de Brunna Fortuna',
    /** TODO: legendas em WebVTT (WCAG 1.2.2), ex.: /media/palestra.pt-BR.vtt */
    captions: 'TODO: arquivo de legendas .vtt' as string,
  },
} as const;

/**
 * Respostas informativas e gerais, sem análise de caso concreto.
 * TODO: revisão final do texto pela advogada.
 */
export const FAQ: { eyebrow: string; title: string; disclaimer: string; items: readonly FaqItem[] } = {
  eyebrow: 'Dúvidas frequentes',
  title: 'Perguntas comuns sobre Famílias e Sucessões',
  disclaimer:
    'As respostas têm caráter informativo e não substituem a análise do caso concreto por profissional habilitado.',
  items: [
    {
      question: 'Posso fazer o divórcio em cartório?',
      answer:
        'Sim. O divórcio pode ser feito por escritura pública em cartório de notas quando há consenso entre o casal sobre todos os pontos e com a assistência de advogado. Desde 2024, uma resolução do Conselho Nacional de Justiça (CNJ) passou a admitir essa via também quando há filhos menores ou incapazes, desde que as questões de guarda, convivência e pensão já tenham sido resolvidas na Justiça.',
    },
    {
      question: 'Qual a diferença entre inventário judicial e extrajudicial?',
      answer:
        'O inventário extrajudicial é feito em cartório, por escritura pública, e costuma ser mais simples, mas exige consenso entre os herdeiros e a presença de advogado. O judicial tramita na Justiça e é o caminho quando há divergência entre os herdeiros ou quando a lei exige. Normas recentes do CNJ ampliaram a via extrajudicial para algumas situações com testamento ou com herdeiros menores, sob condições específicas.',
    },
    {
      question: 'Existe prazo para abrir o inventário?',
      answer:
        'O Código de Processo Civil prevê que o inventário seja aberto em até dois meses após o falecimento. O atraso pode gerar multa sobre o imposto de transmissão (ITCMD), conforme a legislação de cada estado.',
    },
    {
      question: 'Como funciona a guarda compartilhada?',
      answer:
        'Na guarda compartilhada, pai e mãe dividem as responsabilidades e as decisões importantes sobre a vida dos filhos. Ela é a regra no Brasil quando ambos estão aptos, salvo exceções previstas em lei, como situações de risco de violência doméstica. Guarda compartilhada não significa, necessariamente, tempo igual com cada um: a criança mantém uma residência de referência e a convivência é organizada de forma equilibrada.',
    },
    {
      question: 'Como é definido o valor da pensão alimentícia?',
      answer:
        'Não existe um percentual fixo na lei. O valor considera as necessidades de quem recebe e as possibilidades de quem paga, de forma proporcional. Se a situação financeira de alguma das partes mudar, é possível pedir a revisão do valor.',
    },
    {
      question: 'União estável precisa de contrato para ser reconhecida?',
      answer:
        'Não. A união estável se caracteriza pela convivência pública, contínua e duradoura, com o objetivo de constituir família. Sem contrato escrito, aplica-se em regra o regime da comunhão parcial de bens. Formalizar a união por escritura ou contrato traz mais segurança e permite escolher outro regime.',
    },
    {
      question: 'O que é planejamento sucessório?',
      answer:
        'É a organização, em vida, de como o patrimônio será transmitido. Pode envolver testamento, doações, holding familiar e outros instrumentos, sempre respeitando a parte da herança que a lei reserva aos herdeiros necessários. O objetivo é dar previsibilidade e reduzir conflitos futuros.',
    },
    {
      question: 'As informações que compartilho no atendimento são sigilosas?',
      answer:
        'Sim. O sigilo profissional é um dever do advogado previsto no Estatuto da Advocacia e no Código de Ética da OAB. O que você relata no atendimento é tratado com total reserva.',
    },
  ],
};

export const CONTACT_SECTION = {
  eyebrow: 'Contato',
  title: 'Vamos conversar sobre o seu caso',
  intro:
    'Conte brevemente o que você precisa. O retorno é feito para agendar uma conversa, presencial ou on-line, em que a sua situação será ouvida com atenção.',
  subjects: [
    'Divórcio ou separação',
    'União estável',
    'Guarda e convivência',
    'Pensão alimentícia',
    'Inventário',
    'Testamento ou planejamento sucessório',
    'Palestras e eventos',
    'Outro assunto',
  ],
  consent:
    'Autorizo o uso dos meus dados para retorno do contato, conforme a Política de Privacidade.',
  success: 'Mensagem enviada. O retorno será feito pelos contatos informados.',
  error: 'Não foi possível enviar agora. Tente novamente ou fale pelo WhatsApp.',
  photo: {
    slug: 'brunna-horizontal',
    alt: 'Retrato de Brunna Fortuna sorrindo, de camisa clara e blazer escuro',
  } satisfies Photo,
} as const;

export const FOOTER = {
  tagline: 'Direito das Famílias e das Sucessões',
  legal:
    'Conteúdo de caráter exclusivamente informativo, em conformidade com o Código de Ética e Disciplina da OAB e o Provimento nº 205/2021 do CFOAB.',
} as const;
