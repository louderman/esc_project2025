// Small helpers so we don't repeat selectors
const sel = {
  name: 'input[placeholder="Enter your profile name"]',
  email: 'input[placeholder="Enter your email address"]',
  pwd: 'input[placeholder="Enter your password"]',
  submit: 'button[type="submit"]',
  nameErr: () => cy.contains(/Name cannot be empty or have leading\/trailing spaces\./i),
  emailErr: () => cy.contains(/Email must be valid and contain no spaces\./i),
  pwdErr: () =>
    cy.contains(/Password must be ≥8 chars with letters, numbers, symbols\. No leading\/trailing spaces\./i),
};

describe('E2E: Register Page', () => {
  beforeEach(() => {
    // If you have cypress.config baseUrl set to http://localhost:5173,
    // this can be just cy.visit('/register')
    cy.visit('http://localhost:5173/register');

    // Always stub the API so tests never hit real backend
    cy.intercept('POST', '/api/auth/register').as('register');
  });

  it('renders and allows typing', () => {
    cy.get(sel.name).should('exist').and('be.visible').type('Alice');
    cy.get(sel.email).type('alice@gmail.com');
    cy.get(sel.pwd).type('Strong@123');
  });

  it('empty fields → shows all 3 custom errors, no request', () => {
    cy.get(sel.submit).click();

    sel.nameErr().should('be.visible');
    sel.emailErr().should('be.visible');
    sel.pwdErr().should('be.visible');

    // No network call because we bail on validation
    cy.get('@register.all').should('have.length', 0);
  });

  it('invalid name (leading spaces) with valid email & password → name error only', () => {
    cy.get(sel.name).type('   Alice');
    cy.get(sel.email).type('alice@gmail.com');
    cy.get(sel.pwd).type('Strong@123');

    cy.get(sel.submit).click();

    sel.nameErr().should('be.visible');
    cy.contains(/Email must be valid/i).should('not.exist');
    cy.contains(/Password must be ≥8 chars/i).should('not.exist');
    cy.get('@register.all').should('have.length', 0);
  });

  it('invalid email (native HTML5) with valid name & password → submission blocked, no request', () => {
    cy.get(sel.name).type('Alice');
    cy.get(sel.email).type('alicegmail.com'); // missing @
    cy.get(sel.pwd).type('Strong@123');

    // Try to submit
    cy.get(sel.submit).click();

    // Native validation prevents submit, so our custom email error won't show.
    // Assert the input itself is invalid and no network happened.
    cy.get(sel.email).then(($el) => {
      const input = $el[0] as HTMLInputElement;
      expect(input.checkValidity()).to.eq(false);
    });

    cy.get('@register.all').should('have.length', 0);
    cy.contains(/Name cannot be empty/i).should('not.exist');
    cy.contains(/Password must be ≥8 chars/i).should('not.exist');
  });

  it('invalid password, valid name & email → password error only', () => {
    cy.get(sel.name).type('Alice');
    cy.get(sel.email).type('alice@gmail.com');
    cy.get(sel.pwd).type('weak'); // too short + no symbol/number combo

    cy.get(sel.submit).click();

    sel.pwdErr().should('be.visible');
    cy.contains(/Name cannot be empty/i).should('not.exist');
    cy.contains(/Email must be valid/i).should('not.exist');
    cy.get('@register.all').should('have.length', 0);
  });

  it('all inputs valid → shows success alert and navigates to /login', () => {
    cy.intercept('POST', '/api/auth/register', {
      statusCode: 201,
      body: { message: 'User registered successfully.' },
    }).as('registerOk');

    const alerts: string[] = [];
    cy.on('window:alert', (txt) => alerts.push(txt));

    cy.get(sel.name).type('Alice');
    cy.get(sel.email).type('alice@gmail.com');
    cy.get(sel.pwd).type('Strong@123!');

    cy.get(sel.submit).click();

    cy.wait('@registerOk');

    // Assert success alert was shown
    cy.wrap(null).then(() => {
      expect(alerts.join(' ')).to.contain('Account created successfully');
    });

    // App should navigate to /login
    cy.location('pathname', { timeout: 10_000 }).should('eq', '/login');
  });
});
