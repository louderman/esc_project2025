// Helper to set localStorage user before visiting
function setUser(id: string, name = 'E2E User') {
  cy.window().then(win => {
    win.localStorage.setItem('user', JSON.stringify({ id, name }));
  });
}

describe('UC: Past Booking Page - E2E', () => {
  beforeEach(() => {
    // Silence Stripe or other external requests
    cy.intercept('GET', 'https://js.stripe.com/v3/**', {
      statusCode: 200,
      body: ''
    }).as('stripe');
  });

  it('shows error when user not logged in', () => {
    cy.visit('http://localhost:5173/past_booking');
    cy.contains('Error:').should('be.visible');
    cy.contains('Please log in to view your booking history').should('be.visible');
  });

  it('shows error when API fails (e.g., 500)', () => {
    setUser('user500');
    cy.intercept('GET', '/api/booking-history/history/user500', {
      statusCode: 500,
      body: { error: 'Internal Server Error' }
    }).as('history500');

    cy.visit('http://localhost:5173/past_booking');
    cy.wait('@history500');
    cy.contains('Error:').should('be.visible');
    cy.contains(/HTTP error! status: 500/i).should('be.visible');
  });

  it('shows empty state and navigates to listing', () => {
    setUser('userEmpty');
    cy.intercept('GET', '/api/booking-history/history/userEmpty', {
      statusCode: 200,
      body: []
    }).as('historyEmpty');

    cy.visit('http://localhost:5173/past_booking');
    cy.wait('@historyEmpty');

    cy.contains('h1', 'Booking History').should('be.visible');
    cy.contains('Ready for your next adventure?').should('be.visible');
    cy.contains(
      "You haven't made any hotel bookings yet. Discover amazing hotels and create unforgettable memories!"
    ).should('be.visible');

    cy.contains('button', 'Start Searching').click();
    cy.url().should('include', '/listing');
  });

  it('renders bookings and navigates to confirmation on card click', () => {
    setUser('user123');
    const mockBookings = [
      {
        id: 'booking123',
        userId: 'user123',
        hotelName: 'Grand Hotel',
        hotelAddress: '456 Hotel Street',
        checkInDate: '2025-08-20', // full ISO format for correct formatDate()
        checkOutDate: '2025-08-22',
        status: 'Confirmed',
        imageUrl: '/hotel-image.jpg',
        createdAt: '2025-08-12T10:00:00Z',
        numberOfNights: 2,
        numberOfRooms: 1,
        adults: 2,
        children: 0,
        totalAmount: 500
      }
    ];

    cy.intercept('GET', '/api/booking-history/history/user123', {
      statusCode: 200,
      body: mockBookings
    }).as('historyOk');

    cy.visit('http://localhost:5173/past_booking');
    cy.wait('@historyOk');

    cy.contains('h1', 'Booking History').should('be.visible');
    cy.contains('Grand Hotel').should('be.visible');
    cy.contains('📍').parent().should('contain.text', '456 Hotel Street');
    cy.contains('Booking ID').parent().should('contain.text', 'booking123');
    cy.contains('Check-in Date').parent().should('contain.text', '20 August 2025');
    cy.contains('Check-out Date').parent().should('contain.text', '22 August 2025');
    // Only check status if you add it to the component:
    // cy.contains('Status').parent().should('contain.text', 'Confirmed');

    cy.contains('Grand Hotel')
      .closest('div[style*="cursor: pointer"]')
      .click({ force: true });
    cy.url().should('include', '/booking/confirmation');
  });

  it('shows loading state while waiting for response', () => {
    setUser('userSlow');
    cy.intercept('GET', '/api/booking-history/history/userSlow', (req) => {
      req.reply((res) => {
        res.delay = 1500;
        res.send({ statusCode: 200, body: [] });
      });
    }).as('historySlow');

    cy.visit('http://localhost:5173/past_booking');
    cy.contains('Loading your booking history...').should('exist');
    cy.wait('@historySlow');
    cy.contains('Ready for your next adventure?').should('be.visible');
  });
});
