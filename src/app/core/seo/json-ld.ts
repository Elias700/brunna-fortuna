import { ABOUT, CONTACT, FAQ, PRACTICE, PROFILE, SITE, isPending } from '../data/site-content';

/**
 * Grafo schema.org da home: WebSite + LegalService + Person + FAQPage.
 * Campos sem dado real (TODO) ficam FORA do schema. Nunca são preenchidos com placeholders.
 */
export function homeJsonLd(baseUrl: string | null): Record<string, unknown> {
  const abs = (path: string): string => (baseUrl ? `${baseUrl}${path}` : path);
  const id = (fragment: string): string => abs(`/#${fragment}`);
  const has = (v: string): boolean => !isPending(v);

  const knowsAbout = [
    'Direito das Famílias',
    'Direito das Sucessões',
    ...PRACTICE.groups.flatMap((g) => g.items.map((i) => i.title)),
  ];

  const person: Record<string, unknown> = {
    '@type': 'Person',
    '@id': id('brunna-fortuna'),
    name: PROFILE.name,
    jobTitle: PROFILE.role,
    description: ABOUT.paragraphs[0],
    image: abs('/images/brunna-livros-1080.webp'),
    knowsAbout,
    knowsLanguage: 'pt-BR',
    alumniOf: {
      '@type': 'EducationalOrganization',
      name: PROFILE.institutions.epd.name,
      alternateName: PROFILE.institutions.epd.short,
      url: PROFILE.institutions.epd.url,
    },
    memberOf: {
      '@type': 'Organization',
      name: PROFILE.institutions.ibdfam.name,
      alternateName: PROFILE.institutions.ibdfam.short,
      url: PROFILE.institutions.ibdfam.url,
    },
    worksFor: { '@id': id('escritorio') },
  };

  const sameAs = [CONTACT.instagram, CONTACT.linkedin].filter(has);
  if (sameAs.length) person['sameAs'] = sameAs;
  if (baseUrl) person['url'] = abs('/');

  const firm: Record<string, unknown> = {
    '@type': 'LegalService',
    '@id': id('escritorio'),
    name: PROFILE.firmName,
    description: SITE.description,
    image: abs('/og-image.jpg'),
    logo: abs('/icons/icon-512.png'),
    founder: { '@id': id('brunna-fortuna') },
    employee: { '@id': id('brunna-fortuna') },
    knowsAbout: ['Direito das Famílias', 'Direito das Sucessões'],
    knowsLanguage: 'pt-BR',
  };
  if (baseUrl) firm['url'] = abs('/');
  if (has(CONTACT.whatsapp)) firm['telephone'] = `+${CONTACT.whatsapp.replace(/\D/g, '')}`;
  if (has(CONTACT.email)) firm['email'] = CONTACT.email;
  if (has(CONTACT.address)) {
    firm['address'] = { '@type': 'PostalAddress', streetAddress: CONTACT.address, addressCountry: 'BR' };
  }
  if (has(CONTACT.city)) firm['areaServed'] = CONTACT.city;
  if (sameAs.length) firm['sameAs'] = sameAs;

  const website: Record<string, unknown> = {
    '@type': 'WebSite',
    '@id': id('site'),
    name: PROFILE.firmName,
    inLanguage: 'pt-BR',
    publisher: { '@id': id('escritorio') },
  };
  if (baseUrl) website['url'] = abs('/');

  const faq = {
    '@type': 'FAQPage',
    '@id': id('duvidas'),
    inLanguage: 'pt-BR',
    mainEntity: FAQ.items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  };

  return { '@context': 'https://schema.org', '@graph': [website, firm, person, faq] };
}
