import { login, wait } from "cypress/services/UtilsService";
describe('Test videos page', () => {
    beforeEach(() => {
        login(cy);
        cy.visit('/videos');
        cy.wait(500).then(() => {
            for(let i = 0; i <= 1; i++) {
                cy.get('#alert').then((alert:JQuery<HTMLElement>) => {
                    if (alert.find("button.btn-cancel").length > 0) {
                        (alert.find("button.btn-cancel")[0] as HTMLButtonElement).click();
                    } else {
                        cy.get('button.btn-ok').click();
                    }
                });
            }
        });
    });
  
    // it('Visit videos page', () => {
    //     cy.wait(3000).then(() => {
    //         cy.get("#wrap-gear").should("exist").click();
    //         cy.get("#wrap-description").should("exist");
    //         cy.get("a.share").should("exist");
    //         cy.get("div.share").should("exist");
    //         cy.wait(2000).then(() => {
    //             cy.get("#wrap-gear").click();
    //         });

    //         cy.get(".playswitch-prev").should("exist");
    //         cy.get(".playswitch-next").should("exist").click().wait(2000).then(() => {
    //             cy.get(".playswitch-prev").click();
    //         });

    //         cy.wait(2000).then(() => {
    //             cy.get("app-videoplayer").then((videoPlayer:JQuery<HTMLElement>) => {
    //                 if (videoPlayer.find(".wrap-video>video").length > 0) {
    //                     let video:HTMLVideoElement = videoPlayer.find("video")[0] as HTMLVideoElement;
    //                     video.play();
    //                     cy.wait(10000).then(() => {
    //                         video.pause();
    //                     });
    //                 }
    //                 if (videoPlayer.find(".wrap-video>iframe").length > 0) {
    //                     let iframe:HTMLIFrameElement = videoPlayer.find("iframe")[0] as HTMLIFrameElement;
    //                     let iframeSrc:string = iframe.src;
    //                     iframe.src += "?autoplay=1";
    //                     cy.wait(3000).then(() => {
    //                         if (!iframeSrc.includes("tiktok"))iframe.src = iframeSrc;
    //                     });
    //                 }
    //             });
    //         });

    //         cy.log("video success");
    //     });
    // });

    it("Search videos with 'nancy'", () => {
        cy.get("nav .bi-search").should("exist").click();
        cy.contains("Mot clé");
        cy.get("app-searchbar input").should("exist").type("nancy");
        cy.get("app-searchbar .bi-arrow-right")
        .should("exist")
        .click()
        .wait(2000)
        .then(() => {
            cy.get("#searched-videos app-videoplayer").then((videoPlayers:JQuery<HTMLElement>) => {
                cy.get("#searched-videos")
                .scrollTo("bottom", { duration: 2000 })
                .wait(1000)
                .then(() => {
                    cy.get("#searched-videos").
                    scrollTo("top", { duration: 2000 })
                    .then(() => {
                        let videoPlayer:JQuery<HTMLElement> = videoPlayers.first();
                        if (videoPlayer.find(".wrap-video>video").length > 0) {
                            let video:HTMLVideoElement = videoPlayer.find("video")[0] as HTMLVideoElement;
                            video.play();
                            cy.wait(10000).then(() => {
                                video.pause();
                            });
                        }
                        if (videoPlayer.find(".wrap-video>iframe").length > 0) {
                            let iframe:HTMLIFrameElement = videoPlayer.find("iframe")[0] as HTMLIFrameElement;
                            let iframeSrc:string = iframe.src;
                            iframe.src += "?autoplay=1";
                            cy.wait(10000).then(() => {
                                if (!iframeSrc.includes("tiktok"))iframe.src = iframeSrc;
                            });
                        }
                    })
                    ;
                })
                ;
            });
        });

        cy.log("videos found");
    });
})