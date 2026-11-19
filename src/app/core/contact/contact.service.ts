import { Injectable } from '@angular/core';

import { SITE, isPending } from '../data/site-content';

export interface ContactPayload {
  readonly name: string;
  readonly phone: string;
  readonly email: string;
  readonly subject: string;
  readonly message: string;
  readonly consent: boolean;
}

export class ContactNotConfiguredError extends Error {
  constructor() {
    super('Endpoint do formulário de contato não configurado (SITE.formEndpoint).');
  }
}

/**
 * Envio do formulário de contato, desacoplado do componente.
 * TODO: configurar `SITE.formEndpoint` (ex.: Formspree, `https://formspree.io/f/<id>`, ou backend próprio).
 * O payload é enviado como JSON, formato aceito pelo Formspree e fácil de tratar num backend.
 */
@Injectable({ providedIn: 'root' })
export class ContactService {
  readonly configured = !isPending(SITE.formEndpoint);

  async send(payload: ContactPayload): Promise<void> {
    if (!this.configured) throw new ContactNotConfiguredError();

    const response = await fetch(SITE.formEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        ...payload,
        _subject: `Contato pelo site: ${payload.subject}`,
      }),
    });

    if (!response.ok) throw new Error(`Falha no envio (HTTP ${response.status})`);
  }
}
