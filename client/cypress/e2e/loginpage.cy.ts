const sel = {
  email: () => cy.contains('label', /^Email$/i).next('input'),
  password: () => cy.contains('label', /^Password$/i).next().find('input'),

  submit: 'button[type="submit"]',

  emailErr: () => cy.contains(/Email must be valid and contain no spaces\./i),
  pwdErr: () =>
    cy.contains(/Password must be at least 8 characters with no spaces\./i),
};

describe('E2E: Login Page', () => {
  beforeEach(() => {
    // Visit the page (if baseUrl is set in cypress.config, use cy.visit('/login'))
    cy.visit('http://localhost:5173/login');

    // Alias a general intercept so we can assert "no network call" in validation cases
    cy.intercept('POST', '/api/auth/login').as('login');
  });

  it('renders and allows typing', () => {
    sel.email().should('exist').and('be.visible').type('alice@gmail.com');
    sel.password().should('exist').and('be.visible').type('StrongPass1');
  });

  it('empty fields → shows both errors, no request sent', () => {
    cy.get(sel.submit).click();

    sel.emailErr().should('be.visible');
    sel.pwdErr().should('be.visible');

    cy.get('@login.all').should('have.length', 0);
  });

  it('invalid email, valid password → email error only, no request', () => {
    sel.email().type('alicegmail.com'); // missing @
    sel.password().type('StrongPass1');

    cy.get(sel.submit).click();

    sel.emailErr().should('be.visible');
    sel.pwdErr().should('not.exist');
    cy.get('@login.all').should('have.length', 0);
  });

  it('invalid password, valid email → password error only, no request', () => {
    sel.email().type('alice@gmail.com');
    sel.password().type('short');

    cy.get(sel.submit).click();

    sel.pwdErr().should('be.visible');
    sel.emailErr().should('not.exist');
    cy.get('@login.all').should('have.length', 0);
  });

  it('all inputs valid → shows success alert and navigates (stubbing backend)', () => {
    // Override the default intercept with a success response
    cy.intercept('POST', '/api/auth/login', {
      statusCode: 200,
      body: { userId: 123, name: 'Alice' },
    }).as('loginOk');

    const alerts: string[] = [];
    cy.on('window:alert', (txt) => alerts.push(txt));

    sel.email().type('alice@gmail.com');
    sel.password().type('StrongPass1');

    cy.get(sel.submit).click();

    cy.wait('@loginOk').its('request.body').should((body: any) => {
      expect(body).to.deep.equal({
        email: 'alice@gmail.com',
        password: 'StrongPass1',
      });
    });

    // Alert from LoginPage
    cy.wrap(null).then(() => {
      expect(alerts.join(' ')).to.contain('Login successful');
    });

    // By default your component navigates to fromPath OR '/'
    cy.location('pathname', { timeout: 10_000 }).should('eq', '/');
  });
});
