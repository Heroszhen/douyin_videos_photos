import { login, wait } from "cypress/services/UtilsService";
describe('Test videos page', () => {
    beforeEach(() => {
        login(cy);
        cy.visit('/videos');
        cy.get('#alert').then(() => {
            cy.get('button.btn-ok').click();
            cy.get('#alert').then(() => {
                cy.get('button.btn-cancel').click();
            });
        });
    });
  
    it('Visit videos page', async () => {
        cy.wait(3000).then(async (interception) => {
            cy.get("#wrap-gear").should("exist").click();
            cy.get("#wrap-description").should("exist");
            cy.get("a.share").should("exist");
            cy.get("div.share").should("exist");
            cy.wait(2000).then(() => {
                cy.get("#wrap-gear").click();
            });

            cy.wait(2000).then(() => {
                cy.get("app-videoplayer").then((videoPlayer:JQuery<HTMLElement>) => {
                    if (videoPlayer.find(".wrap-video>video").length > 0) {
                        let video:HTMLVideoElement = videoPlayer.find("video")[0] as HTMLVideoElement;
                        video.play();
                        cy.wait(10000).then(() => {
                            video.pause();
                        });
                    }
                    if (videoPlayer.find(".wrap-video>iframe").length > 0) {
                        let iframe:HTMLIFrameElement = videoPlayer.find("iframe")[0] as HTMLIFrameElement;
                        console.log(iframe)
                        let iframeSrc:string = iframe.src;
                        iframe.src += "?autoplay=1";
                        cy.wait(3000).then(() => {
                            if (!iframeSrc.includes("tiktok"))iframe.src = iframeSrc;
                        });
                    }
                });
            });

            cy.log("video success");
        });
    });
})