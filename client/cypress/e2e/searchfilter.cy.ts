function setRangeValue(selector: string, index: number, value: number): void {
  cy.get(selector)
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

      // Set value directly on the native element
      nativeInputValueSetter.call(element, value.toString());

      // Dispatch real events so React updates state
      element.dispatchEvent(new Event('input', { bubbles: true }));
      element.dispatchEvent(new Event('change', { bubbles: true }));
    });
}

describe('UC 3,4 - Search, filter and sort hotels', () => {
  before(() => {
    // Mock stripe, it keeps getting console logged
    cy.intercept('GET', 'https://js.stripe.com/v3/**', {
      statusCode: 200,
      body: '',
    });

    cy.visit(
      'http://localhost:5173/listing?destName=%22Singapore%2C+Singapore%22&destId=%22RsBU%22&checkin=%222025-09-26%22&checkout=%222025-09-27%22&adult=1&child=0&room=1&priceRange=%5B-1%2C1000000%5D&stars=%5B%5D&guestRating=0&amenities=%5B%5D&latLngBounds=%7B%22minLat%22%3A-90%2C%22maxLat%22%3A90%2C%22minLng%22%3A-180%2C%22maxLng%22%3A180%7D&sortBy=%22default%22'
    );
  });

  it('should display all of the components correctly', () => {
    // Initially, only 10 hotel cards should be listed
    cy.get('[data-cy=hotel-listing-card]', { timeout: 60000 }).should(
      'have.lengthOf',
      10
    );

    // Searchbar is rendered
    cy.get('[data-cy=search-bar]').should('exist').and('be.visible');

    // Filter panel is rendered
    cy.get('[data-cy=filter-panel]').should('exist').and('be.visible');

    // Sort panel is rendered
    cy.get('[data-cy=sort-panel]').should('exist').and('be.visible');

    // Click the second rating row
    cy.get('[data-testid="rating-row"]').eq(1).click();
    // Assert checkbox is checked
    cy.get('[data-testid="rating-row"]')
      .eq(1)
      .find('input[type="checkbox"]')
      .should('be.checked');

    // Interact with price range
    cy.get('[data-testid="reset-filter-btn"]').click();
    setRangeValue(
      '[data-testid="slider-container"] input[type="range"]',
      0,
      200
    );
    setRangeValue(
      '[data-testid="slider-container"] input[type="range"]',
      1,
      1500
    );
    cy.get('[data-testid="slider-container"] input[type="range"]')
      .eq(0)
      .should('have.value', '200');
    cy.get('[data-testid="slider-container"] input[type="range"]')
      .eq(1)
      .should('have.value', '1500');
    cy.get('input[name="min"]').should('have.value', '200');
    cy.get('input[name="max"]').should('have.value', '1500');

    // Interact with price inputs
    cy.get('input[name="min"]').clear().type('250').blur();
    cy.get('input[name="max"]').clear().type('450').blur();
    cy.get('[data-testid="slider-container"] input[type="range"]')
      .eq(0)
      .should('have.value', '250');
    cy.get('[data-testid="slider-container"] input[type="range"]')
      .eq(1)
      .should('have.value', '450');
    cy.get('input[name="min"]').should('have.value', '250');
    cy.get('input[name="max"]').should('have.value', '450');

    // Interact with amenities filters
    cy.get('[data-testid="amenity-btn"]').eq(2).click();
    cy.get('[data-testid="amenity-btn"]')
      .eq(2)
      .should('have.attr', 'data-selected', 'true');
    cy.get('[data-testid="amenity-btn"]').eq(3).click();
    cy.get('[data-testid="amenity-btn"]')
      .eq(3)
      .should('have.attr', 'data-selected', 'true');
    cy.get('[data-testid="amenity-btn"]').eq(3).click();
    cy.get('[data-testid="amenity-btn"]')
      .eq(3)
      .should('have.attr', 'data-selected', 'false');

    // Scroll down to bottom
    cy.scrollTo('bottom');
    cy.get('[data-cy=hotel-listing-card]').should(
      'have.length.greaterThan',
      10
    );

    // Click reset filter button
    cy.get('[data-testid="reset-filter-btn"]').click();
    // Check page is scrolled to top
    cy.window().its('scrollY').should('equal', 0);
    // All filters are reset
    cy.get('[data-testid="rating-row"]').each(($row) => {
      cy.wrap($row).find('input[type="checkbox"]').should('not.be.checked'); // all ratings are reset
    });
    cy.get('[data-testid="amenity-btn"]').each(($btn) => {
      cy.wrap($btn).should('have.attr', 'data-selected', 'false'); // all amenities are reset
    });
    cy.get('input[name="min"]').should('not.have.value', '250'); // all prices are reset
    cy.get('input[name="max"]').should('not.have.value', '450'); // Note: if actual min is 250 or actual max is 450, this should pass instead of failing

    // Interact with sort hotel button
    cy.get('[data-cy=hotel-listing-card]')
      .then(($cards) => {
        return Cypress._.map($cards, (card) => card.innerText.trim());
      })
      .as('initialOrder');
    cy.get('[data-cy="sort-panel"] > div').click();
    cy.get('[data-cy=sort-panel] [data-testid="sort-option-1"]').click();
    cy.get('[data-cy="hotel-listing-card"]').then(($cards) => {
      const newOrder = Cypress._.map($cards, (card) => card.innerText.trim());
      cy.get('@initialOrder').then((initialOrder) => {
        expect(newOrder).to.not.deep.equal(initialOrder);
      });
    });

    // Navigate to hotel detail page
    cy.get('[data-cy="card-view-btn"]').first().click();
    cy.url().should('include', '/hotel/');
  });
});
