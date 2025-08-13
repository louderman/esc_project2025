/// <reference types="cypress" />

declare namespace Cypress {
  interface Chainable<Subject = any> {
    /**
     * Custom command to get the body of an iframe
     * @example cy.getIframeBody('iframeSelector')
     */
    getIframeBody(iframeSelector: string): Chainable<JQuery<HTMLElement>>;
  }
}
