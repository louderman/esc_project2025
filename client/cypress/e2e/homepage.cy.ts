import { lstat } from "fs";

describe('DestinationCard Click Tests', () => {
  beforeEach(() => {
    // Visit the homepage before each test
    cy.visit('/');
  });

  it('should navigate to listing page and update search bar when clicking on Rome destination card', () => {
    // Click on the Rome destination card
    cy.contains('Amsterdam, Netherlands', {timeout: 3000}).click();

    // Verify URL navigation
    cy.url().should('include', '/listing');
    
    // Verify URL contains destination term and dest_id
    cy.url().should('include', 'destName=%22Amsterdam%2C+Netherlands%22&destId=%225qq3%22')
    
    // Verify URL contains destination parameters
    cy.url().should('include', 'Amsterdam')
    cy.url().should('include', '5qq3');
    
    // Verify the destination field in search bar is populated
    cy.get('[data-testid="destination-input"]').should('have.value', 'Rome, Italy');
    
    // Verify that dates are automatically set (check-in should be 7 days from now)
    const checkInDate = new Date();
    checkInDate.setDate(checkInDate.getDate() + 7);
    const checkOutDate = new Date();
    checkOutDate.setDate(checkOutDate.getDate() + 14);
    
    // Format dates to match expected format (adjust format as needed)
    const expectedCheckIn = checkInDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    const expectedCheckOut = checkOutDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });    

    cy.get('[data-testid="check-in-out-dates"]').should('contain.value', expectedCheckIn);
    cy.get('[data-testid="check-in-out-dates"]').should('contain.value', expectedCheckOut);
    
    // Verify occupancy defaults remain unchanged
    cy.get('[data-testid="occupancy"]').should('contain', '1 adult · 0 child · 1 room');
  });
  

  it('should preserve navbar values when clicking Find Hotels', () => {
    // trigger destinations dropdown
    cy.get('[data-testid="destination-input"]').first().focus();
    cy.get('[data-testid="destination-suggestions-dropdown"]').first().should('be.visible');
    cy.get('[data-testid="destination-input"]').first().type('Singapore');
    cy.get('[data-testid="destination-suggestions-dropdown"]').should('not.have.length', 5)
    // click on first destination that appears (Singapore)
    cy.get('[data-testid="destination-suggestions-dropdown"]').first().click();
    
    // trigger calendar dropdown
    cy.get('[data-testid="date-input"]').first().click();
    cy.get('[data-testid="calendar-page"]').first().should('be.visible');
    cy.get('[data-testid="calendar-page"]').should('have.length', 2);
    // fill in stay dates
    cy.get('[data-testid="calendar-page"]').last().find('[data-testid="cell"]').eq(25).click();
    cy.get('[data-testid="calendar-page"]').last().find('[data-testid="cell"]').eq(25).should('have.css', 'rgb(211, 100, 100)');
    cy.get('[data-testid="calendar-page"]').last().find('[data-testid="cell"]').eq(26).click();
    cy.get('[data-testid="calendar-page"]').last().find('[data-testid="cell"]').eq(26).should('have.css', 'rgb(211, 100, 100)');
    
    // trigger guest input dropdown
    cy.get('[data-testid="occupancy"]').first().click();
    cy.get('[data-testid="guest-panel"]').first().should('be.visible');
    // increment number of guests
    cy.get('[data-testid="increment-btn"]').eq(0).click();
    cy.get('[data-testid="increment-btn"]').eq(1).click();
    cy.get('[data-testid="increment-btn"]').eq(2).click();
    
    // continue to listing page
    cy.contains('Find Hotels').click()
    
    // check that the page has forwarded with correct dest_id
    cy.url().should('include', '/listing');
    cy.url().should('include', '/destId="RsBU"')

    // Verify the destination field in search bar is updated
    cy.get('[data-testid="destination-input"]').should('have.value', 'Singapore, Singapore');
    
    // Verify occupancy field in searh bar is updated
    cy.get('[data-testid="occupancy"]').should('contain', '2 adults · 1 child · 2 rooms');
  });


  it('should not navigate if search is submitted without destination', () => {
    // trigger calendar dropdown
    cy.get('[data-testid="date-input"]').first().click();
    cy.get('[data-testid="calendar-page"]').first().should('be.visible');
    cy.get('[data-testid="calendar-page"]').should('have.length', 2);
    // fill in stay dates
    cy.get('[data-testid="calendar-page"]').last().find('[data-testid="cell"]').eq(25).click();
    cy.get('[data-testid="calendar-page"]').last().find('[data-testid="cell"]').eq(25).should('have.css', 'rgb(211, 100, 100)');
    cy.get('[data-testid="calendar-page"]').last().find('[data-testid="cell"]').eq(26).click();
    cy.get('[data-testid="calendar-page"]').last().find('[data-testid="cell"]').eq(26).should('have.css', 'rgb(211, 100, 100)');
    
    // Click Find Hotels button
    cy.contains('Find Hotels').click()
    
    // Should remain on homepage
    cy.url().should('not.include', '/listing');
    cy.url().should('eq', Cypress.config().baseUrl + '/');
    
    // Verify destination error message
    cy.get('[data-testid="error-msg-box"]').first().should('contain', 'Destination name cannot be empty')
  });

  it('should not navigate if search is submitted without stay dates', () => {
    // trigger destinations dropdown
    cy.get('[data-testid="destination-input"]').first().focus();
    cy.get('[data-testid="destination-suggestions-dropdown"]').first().should('be.visible');
    cy.get('[data-testid="destination-input"]').first().type('Singapore');
    cy.get('[data-testid="destination-suggestions-dropdown"]').should('not.have.length', 5)
    // click on first destination that appears (Singapore)
    cy.get('[data-testid="destination-suggestions-dropdown"]').first().click();
    
    // Click Find Hotels button
    cy.contains('Find Hotels').click()
    
    // Should remain on homepage
    cy.url().should('not.include', '/listing');
    cy.url().should('eq', Cypress.config().baseUrl + '/');
    
    // Verify destination error message
    cy.get('[data-testid="error-msg-box"]').first().should('contain', 'Destination name cannot be empty')
  });
})