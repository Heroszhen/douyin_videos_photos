describe('Test home page', () => {
  interface ILogin {
    email:string,
    password:string
  }
  let failedLogin:ILogin;
  beforeEach(() => {
    cy.fixture('login.json').then(({ incorrect }) => {
      failedLogin = incorrect;console.log(failedLogin)
    });
  });

  it('Visits the initial project page', () => {
    cy.visit('/');
    cy.url().should("include", "");
    cy.contains("Le service de la mise à jour automaique est désactivé, veuillez vider le cache manuellement pour mettre à jour l'application.");
    cy.get('button.btn-ok').click();

    cy.log("On home page");
  });

  it('login correct', () => {
      cy.visit('/');
      cy.clearLocalStorage("token");
      cy.get('button.btn-ok').click();
      cy.get('.bi-list').click();
      cy.get("#path-login").click();
      let button = cy.get("button[type='submit']");
      button.should('be.disabled');
      cy.fixture('login.json').then(({ correct }) => {
        cy.get("input[type='email']").type(correct.email);
        cy.get("input[type='password']").type(correct.password);
        button.click();

        cy.wait(5000).then((interception) => {
          cy.get("#section-login").should('not.exist');
          expect(localStorage.getItem('token')).to.exist;

          cy.log("Login successfully")
        });
      });
  });

  it('failed login', () => {
    cy.visit('/');
    cy.clearLocalStorage("token");
    cy.get('button.btn-ok').click();
    cy.get('.bi-list').click();
    cy.get("#path-login").click();
    let button = cy.get("button[type='submit']");
    button.should('be.disabled');
    cy.get("input[type='email']").type(failedLogin.email);
    cy.get("input[type='password']").type(failedLogin.password);
    button.click();

    cy.wait(5000).then((interception) => {
      cy.get("#section-login").should('exist');
      expect(localStorage.getItem('token')).not.to.exist;
      cy.get(".icon-close").click();
      cy.get("#section-login").should('not.exist');

      cy.log("Failed Login");
    });
});
})