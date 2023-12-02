import { IVideo } from '../../src/app/interfaces/idata';
describe('Test apis', () => {
    interface ILogin {
        email:string,
        password:string
    }
    let loginJson:ILogin;
    let loginToken:string;

    beforeEach(() => {
        cy.fixture('login.json').then(({ correct, token }) => {
            loginJson = correct;
            loginToken = token
        });
        cy.visit('/');
    });

    it("login", () => {
        cy.request({
            method:'POST',
            url: `${Cypress.env('baseUrlBack')}/mk/jf/login-to-AD`,
            headers: {'X-Requested-With': 'XMLHttpRequest'},
            body: loginJson
        })
        .then((response:any) => {
            //cy.log("response:", JSON.stringify(response.body))
            expect(response.status).to.eq(200);
            let body:any = response.body;
            expect(body.status).to.eq(1);
            expect(body.data).to.not.eq(null);
            expect(body.data).to.include(".")
            //length of string
            expect(body.data.length).to.greaterThan(10);
        });
    });

    it("videos", () => {
        cy.request({
            method:'GET',
            url: `${Cypress.env('baseUrlBack')}/mk/jf/videos?page=1`,
            headers: {
                'X-Requested-With': 'XMLHttpRequest',
                'Authorization': `Bearer ${loginToken}`,
            }
        })
        .then((response:any) => {
            expect(response.status).to.eq(200);
            let body:any = response.body;
            expect(body.status).to.eq(1);
            expect(body.data).to.not.eq(null);
            //length of array
            expect(body.data.length).to.greaterThan(4);

            let videos:Array<IVideo> = body.data;
            expect(videos.length).to.eq(5);
            let firstVideo:IVideo = videos[0];
            expect(firstVideo).to.have.property("description");
            //expect(firstVideo).to.have.keys('id', 'last', 'name');
            expect(firstVideo.id).to.greaterThan(300);
            expect(firstVideo).to.have.property("name");
            expect(firstVideo.name).to.not.eq("aaaaa");
        });
    });
});