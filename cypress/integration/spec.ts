Cypress.on('window:before:load', (win) => {
  cy.spy(win.console, 'error');
  cy.spy(win.console, 'warn');
});

describe('workspace-project App', () => {
  afterEach(() => {
    cy.window().then((win) => {
      expect(win.console.error).to.have.callCount(0);
      expect(win.console.warn).to.have.callCount(0);
    });
  });

  it('should display welcome message', () => {
    cy.visit('/');
    cy.get('title').should('contain.text', 'IvypinchApp');
  });
});
