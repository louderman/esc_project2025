// cypress/e2e/bookingpage.cy.ts
// Requires: import 'cypress-plugin-stripe-elements' in cypress/support
// and chromeWebSecurity: false in cypress config.

const TEST_USER = {
  id: 22,
  name: 'dan',
  email: 'danielmirza02@gmail.com',
};

// helper: match money with/without $ and trailing 0
const money = (num: string) => new RegExp(String.raw`\$?\s*${num}(?:0)?\b`);

// helper: find the "row" container for a label (works for div/li/tr layouts)
const rowFor = (labelRe: RegExp) =>
  cy.contains(labelRe).closest('div, li, tr');
    
function loginViaLocalStorage() {
  cy.visit('/', {
    onBeforeLoad(win) {
      win.localStorage.setItem('user', JSON.stringify(TEST_USER));
    },
  });
}

describe('Booking Page & Booking Confirmation End to End Test', () => {
  beforeEach(() => {
    loginViaLocalStorage();
    // --- Safe stubs (adjust to your routes) ---
     cy.intercept({ method: 'POST', url: /\/api\/bookings(\?.*)?$/ }, (req) => {
      // Return the bookingId your code extracts at line ~259
      req.reply({
        statusCode: 200,
        body: { bookingId: 'bk_123' },
      });
    }).as('createBooking');

    cy.intercept({ method: 'POST', url: /\/api\/payment\/confirm-payment(\?.*)?$/ }, (req) => {
      // Your code checks confirmResult.success and confirmResult.booking_id
      req.reply({
        statusCode: 200,
        body: {
          success: true,
          booking_id: 'bk_123',
          paymentIntentId: 'pi_123',
          // optional: a Stripe-like object if you log it
          paymentIntent: { id: 'pi_123', status: 'succeeded' },
        },
      });
    }).as('confirmPayment');

    // If your app does call Stripe directly, keep this:
    cy.intercept('POST', 'https://api.stripe.com/v1/payment_intents', {
      statusCode: 200,
      body: {
        id: 'pi_123',
        object: 'payment_intent',
        status: 'succeeded',
        client_secret: 'pk_test_51Rit9zQQ6dQNiqoGt2lmisPYFV2QqiIgkLeSu7FSV1yBJp4pgcH0sQ3tZy9b6vmcnVw6u1R7yRxrLrHyKriL7QSG00zApHiEHh',
      },
    }).as('stripePI');

    // --- Visit slow Hotel Details page ---
    cy.visit(
      'http://localhost:5173/hotel/wc4Z?checkin=2025-09-06&checkout=2025-09-08&adults=2&children=0&rooms=1&destination_id=H4Gp',
      { timeout: 120000 }
    );

    // Wait for Reserve Now to appear
    cy.get('[data-cy="reserve-now-btn"]', { timeout: 60000 })
      .should('be.visible')
      .scrollIntoView()
      .should('be.enabled');
  });

  it('displays correct hotel details on the booking page (name, address, dates, guests)', () => {
    // enter booking page
    cy.get('[data-cy="reserve-now-btn"]').click();

    // Name & address
    cy.contains(/mira\s+moon/i);
    cy.contains(/388\s+jaffe\s+road,\s*causeway\s*bay/i);

    // Dates (as shown on the page links)
    cy.contains(/sep\s*06,\s*2025/i);
    cy.contains(/sep\s*08,\s*2025/i);

    // Guests (1 room · 2 guests / or similar)
    cy.contains(/1\s*room.*2\s*guests/i);
  });

  it('shows the selected room card with room information', () => {
    // enter booking page
    cy.get('[data-cy="reserve-now-btn"]').click();

    // check that selected room card appears
    cy.get('[data-cy=selected-room-card]').should('be.visible');
  });

  it('shows the correct payment summary (nights × rooms, taxes, total, pay CTA)', () => {
    // enter booking page
    cy.get('[data-cy="reserve-now-btn"]').click();

    rowFor(/1\s*room\s*[×x]\s*2\s*nights/i)
      .should('exist')
      .within(() => {
        cy.contains(money('641\.86')); 
      });

    // Taxes & fees (10%)
    rowFor(/taxes\s*and\s*fees\s*\(10%\)/i)
      .should('exist')
      .within(() => {
        cy.contains(money('64\.19'));
      });

    // Total
    rowFor(/^total$/i)
      .should('exist')
      .within(() => {
        cy.contains(money('706.05'));
      });

    // Pay CTA shows the total (strip spaces to dodge nbsp)
    cy.contains('button', /pay/i)
      .invoke('text')
      .then((t) => t.replace(/\s+/g, ''))
      .should((txt) => {
        expect(txt).to.match(/\$?706\.05/);
      });
  });

  it('fills details and completes payment', () => {
    cy.get('[data-cy="reserve-now-btn"]').click();

    // ---- Guest fields ----
    cy.get('#firstName', { timeout: 30000 }).should('be.visible').clear().type('Daniel');
    cy.get('#lastName').clear().type('Mirza');
    cy.get('#guestEmail').clear().type('danielmirza02@gmail.com');
    cy.get('#guestPhone').clear().type('1234567890');
    cy.get('#specialRequests').clear().type('Extra blankets please!');

    // ---- Billing fields (non-Stripe) ----
    cy.get('[data-cy="billing-full-name"]').clear().type('Daniel Mirza');
    cy.get('[data-cy="billing-email"]').clear().type('danielmirza02@gmail.com');
    cy.get('[data-cy="billing-phone"]').clear().type('84752245');
    cy.get('[data-cy="billing-addressLine1"]').clear().type('123 Tampines Street 11 #12-34');
    cy.get('[data-cy="billing-addressLine2"]').clear().type('123 Main Street');
    cy.get('[data-cy="billing-city"]').clear().type('Singapore');
    cy.get('[data-cy="billing-state"]').clear().type('Singapore');
    cy.get('[data-cy="billing-zip-code"]').clear().type('693440');

    // ---- Stripe Elements (CardElement) ----
    const STRIPE_IFRAME = 'iframe[src*="js.stripe.com"]';

    // Ensure container is rendered
    cy.get('#card-element', { timeout: 30000 })
      .should('be.visible')
      .scrollIntoView();

    // Wait for Stripe.js global + iframe injection (no .catch needed)
    cy.window({ timeout: 30000 }).its('Stripe').should('be.a', 'function');
    cy.get('#card-element').find(STRIPE_IFRAME, { timeout: 30000 }).should('exist');

    // Fill card via cypress-plugin-stripe-elements
    cy.get('#card-element').within(() => {
      cy.fillElementsInput('cardNumber', '4242424242424242');
      cy.fillElementsInput('cardExpiry',  '0127'); // MMYY
      cy.fillElementsInput('cardCvc',     '123');
    });

    // Submit
    cy.get('[data-cy="create-submit-btn"]', { timeout: 20000 })
      .should('be.visible')
      .and('not.be.disabled')
      .click();

    // Network + success checks
    cy.wait('@createBooking', { timeout: 30000 }).its('response.statusCode').should('eq', 200);
    cy.wait('@confirmPayment', { timeout: 30000 }).its('response.statusCode').should('eq', 200);

    cy.url({ timeout: 30000 }).should('match', /(success|confirmation|booking)/i);
    cy.contains(/(payment|booking).*(success|confirmed)/i, { timeout: 30000 });
  });

  it('navigates to booking confirmation and shows all key details', () => {
    // go to booking page
    cy.get('[data-cy="reserve-now-btn"]').click();

    // guest
    cy.get('#firstName', { timeout: 30000 }).should('be.visible').clear().type('Daniel');
    cy.get('#lastName').clear().type('Mirza');
    cy.get('#guestEmail').clear().type('danielmirza02@gmail.com');
    cy.get('#guestPhone').clear().type('1234567890');
    cy.get('#specialRequests').clear().type('Extra blankets please!');

    // billing
    cy.get('[data-cy="billing-full-name"]').clear().type('Daniel Mirza');
    cy.get('[data-cy="billing-email"]').clear().type('danielmirza02@gmail.com');
    cy.get('[data-cy="billing-phone"]').clear().type('84752245');
    cy.get('[data-cy="billing-addressLine1"]').clear().type('123 Tampines Street 11 #12-34');
    cy.get('[data-cy="billing-addressLine2"]').clear().type('123 Main Street');
    cy.get('[data-cy="billing-city"]').clear().type('Singapore');
    cy.get('[data-cy="billing-state"]').clear().type('Singapore');
    cy.get('[data-cy="billing-zip-code"]').clear().type('693440');

    // stripe
    const STRIPE_IFRAME = 'iframe[src*="js.stripe.com"]';
    cy.get('#card-element', { timeout: 30000 }).should('be.visible').scrollIntoView();
    cy.window({ timeout: 30000 }).its('Stripe').should('be.a', 'function');
    cy.get('#card-element').find(STRIPE_IFRAME, { timeout: 30000 }).should('exist');
    cy.get('#card-element').within(() => {
      cy.fillElementsInput('cardNumber', '4242424242424242');
      cy.fillElementsInput('cardExpiry',  '0127');
      cy.fillElementsInput('cardCvc',     '123');
    });

    // pay
    cy.get('[data-cy="create-submit-btn"]').should('be.visible').and('not.be.disabled').click();
    cy.wait('@createBooking', { timeout: 30000 }).its('response.statusCode').should('eq', 200);
    cy.wait('@confirmPayment', { timeout: 30000 }).its('response.statusCode').should('eq', 200);

    // ===== confirmation assertions =====
    cy.location('pathname', { timeout: 20000 }).should('match', /\/booking\/(confirmation|success)$/i);
    cy.contains(/booking\s+confirmed/i);

    // key details block
    cy.contains(/guest information/i).parent().should('contain.text', 'Daniel Mirza');
    cy.contains(/booking id/i).parent().should('contain.text', 'bk_123');
    cy.contains(/hotel id/i).parent().should('contain.text', 'wc4Z');
    cy.contains(/destination id/i); // value depends on room, so just ensure present

    // dates
    cy.contains(/check-?in/i).parent().should('contain.text', '6 September 2025');
    cy.contains(/check-?out/i).parent().should('contain.text', '8 September 2025');

    cy.contains(/^total$/i)
      .parent()
      .invoke('text')
      .then(t => t.replace(/\s+/g, ''))
      .should('match', /\$?706\.(?:04|46)\d*/);

    // status
    cy.contains(/status/i).parent().should('contain.text', 'StatusConfirmed');

    // hotel echo section (below)
    cy.contains(/mira\s+moon/i);
    cy.contains(/388\s+jaffe\s+road,\s*causeway\s*bay/i);

    cy.contains(/special\s*request/i)
      .parent()
      .should('contain.text', 'Extra blankets please!');
    // Find the hotel image
    cy.get('img[alt^="Hotel image"]')
      .should('be.visible')
    cy.get('[data-testid="rightbuttonclick"]').click().should('exist').and('be.visible');
    cy.contains('2 / 5');
    cy.get('img[alt^="Hotel image"]')
      .should('be.visible') 
    cy.get('[data-testid="rightbuttonclick"]').click();
    cy.contains('3 / 5');
    cy.get('img[alt^="Hotel image"]')
      .should('be.visible') 
    cy.get('[data-testid="rightbuttonclick"]').click();
    cy.contains('4 / 5');
    cy.get('img[alt^="Hotel image"]')
      .should('be.visible') 
    cy.get('[data-testid="rightbuttonclick"]').click();
    cy.contains('5 / 5');
    cy.get('img[alt^="Hotel image"]')
      .should('be.visible') 
    cy.get('[data-testid="leftbuttonclick"]').click();
    cy.contains('4 / 5');
    cy.get('img[alt^="Hotel image"]')
      .should('be.visible') 
    cy.get('[data-testid="leftbuttonclick"]').click();
    cy.contains('3 / 5');
    cy.get('img[alt^="Hotel image"]')
      .should('be.visible')  
  });

//  it('shows Special Request on confirmation when provided', () => {
//    // go to booking page
//    cy.get('[data-cy="reserve-now-btn"]').click();
//
//    // guest incl. special request
//    cy.get('#firstName', { timeout: 30000 }).should('be.visible').clear().type('Daniel');
//    cy.get('#lastName').clear().type('Mirza');
//    cy.get('#guestEmail').clear().type('danielmirza02@gmail.com');
//    cy.get('#guestPhone').clear().type('1234567890');
//    cy.get('#specialRequests').clear().type('Extra blankets please!');
//
//    // billing
//    cy.get('[data-cy="billing-full-name"]').clear().type('Daniel Mirza');
//    cy.get('[data-cy="billing-email"]').clear().type('danielmirza02@gmail.com');
//    cy.get('[data-cy="billing-phone"]').clear().type('84752245');
//    cy.get('[data-cy="billing-addressLine1"]').clear().type('123 Tampines Street 11 #12-34');
//    cy.get('[data-cy="billing-addressLine2"]').clear().type('123 Main Street');
//    cy.get('[data-cy="billing-city"]').clear().type('Singapore');
//    cy.get('[data-cy="billing-state"]').clear().type('Singapore');
//    cy.get('[data-cy="billing-zip-code"]').clear().type('693440');
//
//    // stripe
//    const STRIPE_IFRAME = 'iframe[src*="js.stripe.com"]';
//    cy.get('#card-element', { timeout: 30000 }).should('be.visible').scrollIntoView();
//    cy.window({ timeout: 30000 }).its('Stripe').should('be.a', 'function');
//    cy.get('#card-element').find(STRIPE_IFRAME, { timeout: 30000 }).should('exist');
//    cy.get('#card-element').within(() => {
//      cy.fillElementsInput('cardNumber', '4242424242424242');
//      cy.fillElementsInput('cardExpiry',  '0127');
//      cy.fillElementsInput('cardCvc',     '123');
//    });
//
//    // pay
//    cy.get('[data-cy="create-submit-btn"]').should('be.visible').and('not.be.disabled').click();
//    cy.wait('@createBooking', { timeout: 30000 }).its('response.statusCode').should('eq', 200);
//    cy.wait('@confirmPayment', { timeout: 30000 }).its('response.statusCode').should('eq', 200);
//
//    // confirmation + special request appears
//    cy.location('pathname', { timeout: 20000 }).should('match', /\/booking\/(confirmation|success)$/i);
//    cy.contains(/booking\s+confirmed/i);
//
//    cy.contains(/special\s*request/i)
//      .parent()
//      .should('contain.text', 'Extra blankets please!');
//  });
//
});