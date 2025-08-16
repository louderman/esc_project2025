/// <reference types="cypress" />
/// <reference types="cypress-plugin-stripe-elements" />

declare namespace Cypress {
  interface Chainable {
    getIframeBody(iframeSelector: string): Chainable<JQuery<HTMLElement>>;
    stripeElements(): Chainable<any>;
  }
}
