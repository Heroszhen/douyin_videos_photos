export function login (cy: Cypress.cy & CyEventEmitter): void {
    cy.fixture('login.json').then(({ token }) => {
        localStorage.setItem("token", token);
    });
}

export function wait (millisecondes:number): Promise<number> {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve(1);
        }, millisecondes * 1000);
    });
}
