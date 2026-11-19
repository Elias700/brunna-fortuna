import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { BgShiftDirective } from '../../core/animations';
import { CONTACT, PROFILE, isPending } from '../../core/data/site-content';
import { SeoService } from '../../core/seo/seo.service';

/**
 * Política de Privacidade (LGPD, Lei nº 13.709/2018).
 * TODO: texto-base para revisão da advogada. Completar os dados marcados como TODO.
 */
@Component({
  selector: 'app-privacy-page',
  imports: [RouterLink, BgShiftDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <article class="privacy container-narrow" appBgShift="light" aria-labelledby="privacy-title">
      <p class="eyebrow">LGPD</p>
      <h1 id="privacy-title">Política de Privacidade</h1>
      <p class="privacy__updated">
        Última atualização: <span class="todo">TODO: data de publicação</span>
      </p>
      <p class="privacy__note todo">TODO: texto-base, sujeito à revisão da Dra. {{ profile.name }} antes da publicação.</p>

      <h2>1. Quem é responsável pelos seus dados</h2>
      <p>
        Esta política se aplica ao site de {{ profile.firmName }}, de responsabilidade de {{ profile.name }},
        advogada inscrita na <span [class.todo]="pending(profile.oab)">{{ profile.oab }}</span>, que atua como
        controladora dos dados pessoais tratados por meio deste site.
        Endereço: <span [class.todo]="pending(contact.address)">{{ contact.address }}</span>.
      </p>

      <h2>2. Quais dados são coletados</h2>
      <p>Somente os dados que você informa voluntariamente no formulário de contato:</p>
      <ul>
        <li>nome;</li>
        <li>telefone/WhatsApp;</li>
        <li>e-mail;</li>
        <li>assunto e mensagem.</li>
      </ul>
      <p>
        Recomendamos não enviar documentos, dados de saúde ou outras informações sensíveis nesse primeiro contato.
        Esses detalhes podem ser tratados depois, em atendimento reservado.
      </p>

      <h2>3. Para que usamos os dados</h2>
      <p>
        Os dados são usados exclusivamente para responder ao seu contato e, se for o caso, agendar uma conversa.
        Não são usados para publicidade nem vendidos ou cedidos a terceiros.
      </p>

      <h2>4. Base legal</h2>
      <p>
        O tratamento se apoia no seu consentimento (art. 7º, I, da LGPD), registrado na caixa de autorização do
        formulário, e na realização de procedimentos preliminares a uma eventual contratação, a seu pedido
        (art. 7º, V).
      </p>

      <h2>5. Compartilhamento</h2>
      <p>
        As mensagens são transmitidas por um serviço de envio de formulários
        (<span class="todo">TODO: nome do provedor, ex.: Formspree</span>) e pelo provedor de hospedagem do site,
        que atuam como operadores e tratam os dados apenas para viabilizar o envio. Os dados também estão protegidos
        pelo sigilo profissional da advocacia.
      </p>

      <h2>6. Por quanto tempo os dados são guardados</h2>
      <p>
        Pelo tempo necessário para responder ao contato. Se não houver contratação, os dados são excluídos em até
        <span class="todo">TODO: prazo</span>, salvo obrigação legal de guarda.
      </p>

      <h2>7. Seus direitos</h2>
      <p>
        Você pode, a qualquer momento, pedir a confirmação do tratamento, o acesso, a correção, a anonimização ou a
        exclusão dos seus dados, além de revogar o consentimento (art. 18 da LGPD). Para isso, escreva para
        <span [class.todo]="pending(contact.email)">{{ contact.email }}</span>.
      </p>

      <h2 id="cookies" tabindex="-1">8. Cookies e armazenamento local</h2>
      <p>
        Este site não utiliza cookies de publicidade nem de rastreamento. Ele guarda apenas uma informação técnica no
        armazenamento da sessão do seu navegador (<code>sessionStorage</code>), para não repetir a animação de
        abertura durante a mesma visita. Essa informação é apagada quando você fecha a aba.
      </p>
      <p class="todo">
        TODO: se forem adicionadas ferramentas de análise (ex.: Google Analytics), atualizar esta seção e incluir um
        aviso de consentimento de cookies.
      </p>

      <h2>9. Alterações</h2>
      <p>Esta política pode ser atualizada. A data da última revisão fica indicada no início da página.</p>

      <p class="privacy__back"><a class="text-link" routerLink="/">Voltar para a página inicial</a></p>
    </article>
  `,
  styles: `
    .privacy {
      padding-block: calc(var(--header-h) + var(--space-xl)) var(--section-pad);
    }
    h1 {
      margin-top: var(--space-xs);
      font-size: var(--fs-h2);
    }
    h2 {
      margin-top: var(--space-l);
      margin-bottom: var(--space-xs);
      font-size: var(--fs-h4);
      font-family: var(--font-sans);
      font-weight: 700;
      letter-spacing: 0;
      scroll-margin-top: calc(var(--header-h) + 1rem);
    }
    p,
    ul {
      max-width: 42rem;
      margin-top: var(--space-xs);
    }
    ul {
      padding-left: 1.25rem;
    }
    .privacy__updated {
      font-size: var(--fs-small);
      color: var(--c-muted);
    }
    .privacy__note {
      padding: var(--space-s);
      font-size: var(--fs-small);
    }
    .privacy__back {
      margin-top: var(--space-xl);
    }
    .todo {
      outline: 1px dashed var(--c-wine);
      outline-offset: 2px;
    }
  `,
})
export class PrivacyPage {
  protected readonly profile = PROFILE;
  protected readonly contact = CONTACT;
  protected readonly pending = isPending;

  constructor() {
    inject(SeoService).apply({
      title: 'Política de Privacidade | Brunna Fortuna Advocacia',
      description:
        'Como Brunna Fortuna Advocacia trata os dados pessoais enviados pelo site, em conformidade com a LGPD: finalidade, base legal, direitos do titular e cookies.',
      path: '/politica-de-privacidade',
    });
  }
}
