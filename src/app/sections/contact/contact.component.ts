import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, ElementRef, inject, signal } from '@angular/core';
import { type AbstractControl, NonNullableFormBuilder, ReactiveFormsModule, type ValidationErrors, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { BgShiftDirective, PinSectionDirective, RevealDirective, SplitTextDirective } from '../../core/animations';
import { ContactNotConfiguredError, ContactService } from '../../core/contact/contact.service';
import { mailtoUrl, whatsappUrl } from '../../core/data/links';
import { CONTACT, CONTACT_SECTION, PROFILE, isPending } from '../../core/data/site-content';
import { IconComponent } from '../../shared/icon/icon.component';

type FieldName = 'name' | 'phone' | 'email' | 'subject' | 'message' | 'consent';
type Status = 'idle' | 'sending' | 'success' | 'error';

const FIELD_ORDER: readonly FieldName[] = ['name', 'phone', 'email', 'subject', 'message', 'consent'];

/** Telefone brasileiro: 10 ou 11 dígitos (com DDD), opcionalmente com DDI 55. */
function brPhone(control: AbstractControl<string>): ValidationErrors | null {
  const digits = (control.value ?? '').replace(/\D/g, '').replace(/^55(?=\d{10,11}$)/, '');
  if (!digits) return null;
  return digits.length === 10 || digits.length === 11 ? null : { phone: true };
}

const MESSAGES: Record<FieldName, Record<string, string>> = {
  name: { required: 'Informe o seu nome.', minlength: 'O nome parece incompleto.' },
  phone: { required: 'Informe um telefone para retorno.', phone: 'Informe o telefone com DDD, ex.: (71) 99999-9999.' },
  email: { required: 'Informe o seu e-mail.', email: 'Informe um e-mail válido.' },
  subject: { required: 'Escolha o assunto.' },
  message: { required: 'Conte brevemente o que você precisa.', maxlength: 'A mensagem pode ter até 2.000 caracteres.' },
  consent: { required: 'É preciso autorizar o uso dos dados para que possamos responder.' },
};

/**
 * Contato. No topo, a faixa com S-FOOTER (a foto encolhe por clip-path enquanto o título surge), só tablet+.
 * Depois, canais de contato e formulário (Reactive Forms) com erros associados por aria-describedby.
 */
@Component({
  selector: 'app-contact',
  imports: [
    NgOptimizedImage,
    ReactiveFormsModule,
    RouterLink,
    IconComponent,
    BgShiftDirective,
    PinSectionDirective,
    RevealDirective,
    SplitTextDirective,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.scss',
})
export class ContactComponent {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly contactService = inject(ContactService);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

  protected readonly section = CONTACT_SECTION;
  protected readonly contact = CONTACT;
  protected readonly profile = PROFILE;
  protected readonly whatsapp = whatsappUrl();
  protected readonly mailto = mailtoUrl();
  protected readonly pending = isPending;

  protected readonly status = signal<Status>('idle');
  protected readonly statusMessage = signal('');
  protected readonly submitted = signal(false);

  protected readonly form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    phone: ['', [Validators.required, brPhone]],
    email: ['', [Validators.required, Validators.email]],
    subject: ['', Validators.required],
    message: ['', [Validators.required, Validators.maxLength(2000)]],
    consent: [false, Validators.requiredTrue],
    /** Honeypot anti-spam: invisível para pessoas. */
    website: [''],
  });

  protected showError(field: FieldName): boolean {
    const control = this.form.controls[field];
    return control.invalid && (control.touched || this.submitted());
  }

  protected errorText(field: FieldName): string {
    const errors = this.form.controls[field].errors;
    if (!errors) return '';
    const key = Object.keys(errors)[0];
    return MESSAGES[field][key] ?? 'Verifique este campo.';
  }

  protected describedBy(field: FieldName, hint = false): string | null {
    const ids = [hint ? `${field}-hint` : '', this.showError(field) ? `${field}-error` : ''].filter(Boolean);
    return ids.length ? ids.join(' ') : null;
  }

  protected async submit(): Promise<void> {
    this.submitted.set(true);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      // Foca o primeiro campo inválido pela ordem do formulário (os atributos aria-invalid só
      // aparecem no próximo ciclo de renderização).
      const first = FIELD_ORDER.find((name) => this.form.controls[name].invalid);
      if (first) this.host.querySelector<HTMLElement>(`#contact-${first}`)?.focus();
      return;
    }

    const { website, ...payload } = this.form.getRawValue();
    if (website) {
      // Robô preencheu o honeypot: finge sucesso e não envia.
      this.finish('success', this.section.success);
      return;
    }

    this.status.set('sending');
    this.statusMessage.set('Enviando…');
    try {
      await this.contactService.send(payload);
      this.form.reset();
      this.submitted.set(false);
      this.finish('success', this.section.success);
    } catch (error) {
      const message =
        error instanceof ContactNotConfiguredError
          ? 'O envio pelo formulário ainda não está disponível. Por favor, use o WhatsApp ou o e-mail.'
          : this.section.error;
      this.finish('error', message);
    }
  }

  private finish(status: Status, message: string): void {
    this.status.set(status);
    this.statusMessage.set(message);
  }
}
