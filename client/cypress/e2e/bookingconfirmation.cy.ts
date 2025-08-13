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
    cy.intercept('GET', 'https://js.stripe.com/v3/**', {
      statusCode: 200,
      body: '',
    });

    // Increase timeout for page load
    cy.visit(
      'http://localhost:5173/hotel/wc4Z?checkin=2025-09-06&checkout=2025-09-08&adults=2&children=0&rooms=1&destination_id=H4Gp',
      { timeout: 60000 } // 60 seconds for page load
    );
  });

  it('should render main booking components correctly', () => {
    cy.get('[data-cy=hotel-detail]', { timeout: 20000 }).should('exist').and('be.visible');
    cy.get('[data-cy=booking-form]', { timeout: 20000 }).should('exist').and('be.visible');

    cy.get('[data-cy=checkin-date]', { timeout: 20000 }).should('contain.text', 'Sep 06, 2025');
    cy.get('[data-cy=checkout-date]', { timeout: 20000 }).should('contain.text', 'Sep 08, 2025');

    cy.get('input[name="adults"]', { timeout: 20000 }).should('have.value', '2');
    cy.get('input[name="children"]', { timeout: 20000 }).should('have.value', '0');
    cy.get('input[name="rooms"]', { timeout: 20000 }).should('have.value', '1');
  });

  it('should allow user to modify guest counts', () => {
    cy.get('input[name="adults"]', { timeout: 20000 }).clear().type('3').blur();
    cy.get('input[name="adults"]').should('have.value', '3');

    cy.get('input[name="children"]').clear().type('1').blur();
    cy.get('input[name="children"]').should('have.value', '1');

    cy.get('input[name="rooms"]').clear().type('2').blur();
    cy.get('input[name="rooms"]').should('have.value', '2');
  });

  it('should update total price when inputs change', () => {
    cy.get('[data-cy=total-price]', { timeout: 20000 }).invoke('text').then((initialPrice) => {
      cy.get('input[name="rooms"]').clear().type('2').blur();
      cy.get('[data-cy=total-price]').should(($price) => {
        expect($price.text()).not.to.eq(initialPrice);
      });
    });
  });

  it('should enable "Create Booking" button and allow booking creation', () => {
    cy.get('[data-cy=create-booking-btn]', { timeout: 20000 }).should('be.enabled').click();

    cy.url({ timeout: 20000 }).should('include', '/booking/confirmation');

    cy.get('[data-cy=booking-confirmation-message]', { timeout: 20000 }).should(
      'contain.text',
      'Booking Confirmed'
    );
  });

  it('should reset form when reset button clicked', () => {
    cy.get('[data-cy=reset-booking-btn]', { timeout: 20000 }).click();

    cy.get('input[name="adults"]').should('have.value', '2');
    cy.get('input[name="children"]').should('have.value', '0');
    cy.get('input[name="rooms"]').should('have.value', '1');
  });
});
