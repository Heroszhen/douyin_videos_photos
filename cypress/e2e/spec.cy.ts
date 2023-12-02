describe('My First Test', () => {
  it('Visits the initial project page', () => {
    cy.visit('/')
    cy.log(Cypress.env("baseUrlBack"))
  })
})
