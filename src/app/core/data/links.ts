import { CONTACT, isPending } from './site-content';

/** Link do WhatsApp com mensagem pré-preenchida, ou `null` enquanto o número não for informado. */
export function whatsappUrl(message: string = CONTACT.whatsappMessage): string | null {
  if (isPending(CONTACT.whatsapp)) return null;
  const digits = CONTACT.whatsapp.replace(/\D/g, '');
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

export function mailtoUrl(): string | null {
  return isPending(CONTACT.email) ? null : `mailto:${CONTACT.email}`;
}

export function socialLinks(): { label: string; url: string; icon: 'instagram' | 'linkedin' }[] {
  const links: { label: string; url: string; icon: 'instagram' | 'linkedin' }[] = [];
  if (!isPending(CONTACT.instagram)) links.push({ label: 'Instagram', url: CONTACT.instagram, icon: 'instagram' });
  if (!isPending(CONTACT.linkedin)) links.push({ label: 'LinkedIn', url: CONTACT.linkedin, icon: 'linkedin' });
  return links;
}
