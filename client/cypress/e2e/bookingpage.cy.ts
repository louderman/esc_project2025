describe('Booking Page', () => {
  beforeEach(() => {
    cy.visit('http://localhost:5173/hotel/test-hotel-id/booking');
  });

  it('should display the booking form', () => {
    cy.get('form').should('be.visible');
    cy.contains('h1', 'Confirm Your Booking').should('be.visible');
  });

  it('should allow a user to fill out the booking form', () => {
    cy.get('input[name="fullName"]').type('John Doe');
    cy.get('input[name="email"]').type('john.doe@example.com');
    cy.get('input[name="phone"]').type('1234567890');
    cy.get('input[name="addressLine1"]').type('123 Main St');
    cy.get('input[name="city"]').type('Anytown');
    cy.get('input[name="state"]').type('Anystate');
    cy.get('input[name="zipCode"]').type('12345');
    cy.get('input[name="country"]').type('United States');
  });

  it('should show a confirmation message after submitting the form', () => {
    cy.get('input[name="fullName"]').type('John Doe');
    cy.get('input[name="email"]').type('john.doe@example.com');
    cy.get('input[name="phone"]').type('1234567890');
    cy.get('input[name="addressLine1"]').type('123 Main St');
    cy.get('input[name="city"]').type('Anytown');
    cy.get('input[name="state"]').type('Anystate');
    cy.get('input[name="zipCode"]').type('12345');
    cy.get('input[name="country"]').type('United States');
    cy.get('button[type="submit"]').click();
    cy.contains('h2', 'Booking Confirmed!').should('be.visible');
  });
});
