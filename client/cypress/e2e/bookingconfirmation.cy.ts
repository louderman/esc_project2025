function setRangeValue(selector: string, index: number, value: number): void {
    cy.get(selector, { timeout: 20000 }) // longer timeout for get
      .eq(index)
      .then(($el) => {
        const element = $el[0] as HTMLInputElement;
  
        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
          window.HTMLInputElement.prototype,
          'value'
        )?.set;
  
        if (!nativeInputValueSetter) {
          throw new Error('Unable to find native input value setter');
        }
  
        nativeInputValueSetter.call(element, value.toString());
  
        element.dispatchEvent(new Event('input', { bubbles: true }));
        element.dispatchEvent(new Event('change', { bubbles: true }));
      });
  }
  
  describe('UC 5,6 - View and create booking', () => {
    before(() => {
      //cy.intercept('GET', 'https://js.stripe.com/v3/**', {
      //  statusCode: 200,
      //  body: '',
      //});
      cy.intercept('POST', 'https://api.stripe.com/v1/payment_intents', {
      statusCode: 200,
      body: {
          id: 'pi_123',
          object: 'payment_intent',
          status: 'succeeded',
          client_secret: 'pi_123_secret_456',
      },
      });
  
  
  
      cy.visit(
        'http://localhost:5173/hotel/wc4Z?checkin=2025-09-06&checkout=2025-09-08&adults=2&children=0&rooms=1&destination_id=H4Gp',
        { timeout: 60000 }
      );
    });
  // helper to get inside a Stripe iframe
  const getStripeInput = (iframeSelector: string, inputName: string) => {
    return cy
      .get(iframeSelector)
      .find('iframe') // Stripe injects the secure input here
      .its('0.contentDocument.body')
      .should('not.be.empty')
      .then(cy.wrap)
      .find(`input[name="${inputName}"]`);
  };
  
  
    it('clicks the Reserve Now button', () => {
      cy.get('[data-cy="reserve-now-btn"]', { timeout: 20000 })
        .should('be.visible')
        .click();
  
      cy.get('[data-cy="billing-full-name"]').clear().type('Jackson');
  
      cy.get('[data-cy="billing-email"]').clear().type('Jackson@hotmail.com');
  
      cy.get('[data-cy="billing-phone"]').clear().type('84752245');
  
      cy.get('[data-cy="billing-addressLine1"]').clear().type('123 Tampines Street 11 #12-34');
  
      cy.get('[data-cy="billing-addressLine2"]').clear().type('123 Main Street');
  
      cy.get('[data-cy="billing-city"]').clear().type('Singapore');
  
      cy.get('[data-cy="billing-state"]').clear().type('Singapore');
  
      cy.get('[data-cy="billing-zip-code"]').clear().type('693440');
  
      //// Type into card number
      //cy.getIframeBody('iframe[name^="__privateStripeFrame"]')
      //.find('input[name="cardnumber"]')
      //.type('4242424242424242', { delay: 10 });
  //
      //// Type into expiry date
      //cy.getIframeBody('iframe[name^="__privateStripeFrame"]')
      //.find('input[name="exp-date"]')
      //.type('12/34', { delay: 10 });
  //
      //// Type into CVC
      //cy.getIframeBody('iframe[name^="__privateStripeFrame"]')
      //.find('input[name="cvc"]')
      //.type('123', { delay: 10 });
      cy.wait(10000);
  
      cy.get('[data-cy="create-submit-btn"]', { timeout: 10000 })
        .should('be.visible')
        .click();
  
  
  
    });
  });