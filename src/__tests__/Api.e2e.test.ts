import request from 'supertest'
import { app } from '../settings'

const getDefaultVideo = () => {
    return {
        title: "All work and no play makes Jack angry",
        author: "redrum",
        availableResolutions: ["P2160"]
    }
}

const getFullRequest = () => {
    return {
        title: "All work and no play makes Jack angry",
        author: "redrum",
        availableResolutions: ["P2160"],
        canBeDownloaded: true,
        minAgeRestriction: 16,
        publicationDate: (new Date()).toISOString()
    }
}

describe("Api", () => {
    describe("root", () => {
        it("get root", async () => {
            await request(app).get('/').expect({version: '2.0'});
        })
    })
    describe("creation", () => {
        it("could create video", async () => {
            const res = await request(app).post('/videos').send(getDefaultVideo()).expect(201);

            const b = res.body;
            expect(b.id).toEqual(1);
            expect(b.title).toEqual("All work and no play makes Jack angry");
            expect(b.author).toEqual("redrum");
            expect(b.canBeDownloaded).toEqual(false);
            expect(b.minAgeRestriction).toEqual(null);
            expect(b.availableResolutions).toEqual(["P2160"]);
            const time0 = (new Date(Date.parse(b.createdAt))).getTime();
            const time1 = (new Date(Date.parse(b.publicationDate))).getTime();
            expect(time1 - time0).toEqual(1000 * 60 * 60 * 24);
        })

        it("fails if empty object", async () => {
            const res = await request(app).post('/videos').send({}).expect(400);
            expect(res.body).toEqual({
                errorsMessages: [
                    {
                        message: "error!",
                        field: "title"
                    },
                    {
                        message: "error!",
                        field: "author"
                    },
                    {
                        message: "error!",
                        field: "availableResolutions"
                    },
                ]
            });
        });

        it("fails if no object", async () => {
            const res = await request(app).post('/videos').send().expect(400);
            expect(res.body).toEqual({
                errorsMessages: [
                    {
                        message: "error!",
                        field: "title"
                    },
                    {
                        message: "error!",
                        field: "author"
                    },
                    {
                        message: "error!",
                        field: "availableResolutions"
                    },
                ]
            });
        });

        it("fails if author is too long", async () => {
            const d = getDefaultVideo();
            d.author = "redrumredrumredrumredrumredrumredrumredrumredrum";

            const res = await request(app).post('/videos').send(d).expect(400);
            expect(res.body).toEqual({
                errorsMessages: [
                    {
                        message: "error!",
                        field: "author"
                    },
                ]
            });
        });

        it("fails if author is too long", async () => {
            const d = getDefaultVideo();
            d.title = "redrumredrumredrumredrumredrumredrumredrumredrumredrumredrumredrumredrumredrumredrumredrumredrum";

            const res = await request(app).post('/videos').send(d).expect(400);
            expect(res.body).toEqual({
                errorsMessages: [
                    {
                        message: "error!",
                        field: "title"
                    },
                ]
            });
        });

        it("fails if empty resolutions list", async () => {
            const d = getDefaultVideo();
            d.availableResolutions = [];

            const res = await request(app).post('/videos').send(d).expect(400);
            expect(res.body).toEqual({
                errorsMessages: [
                    {
                        message: "error!",
                        field: "availableResolutions"
                    },
                ]
            });
        });

        it("fails if no resolution field", async () => {
            let d = {
                title: "All work and no play makes Jack angry",
                author: "redrum"
            }

            const res = await request(app).post('/videos').send(d).expect(400);
            expect(res.body).toEqual({
                errorsMessages: [
                    {
                        message: "error!",
                        field: "availableResolutions"
                    },
                ]
            });
        });

        it("fails if author is too long", async () => {
            const d = getDefaultVideo();

            let res = await request(app).get('/videos/1').expect(200);

            const b = res.body;
            expect(b.id).toEqual(1);
            expect(b.title).toEqual("All work and no play makes Jack angry");
            expect(b.author).toEqual("redrum");
            expect(b.canBeDownloaded).toEqual(false);
            expect(b.minAgeRestriction).toEqual(null);
            expect(b.availableResolutions).toEqual(["P2160"]);
            const time0 = (new Date(Date.parse(b.createdAt))).getTime();
            const time1 = (new Date(Date.parse(b.publicationDate))).getTime();
            expect(time1 - time0).toEqual(1000 * 60 * 60 * 24);

            res = await request(app).get('/videos/2').expect(404);
        });
    })

    describe("deletes all db", () => {
        it("deletes all db", async () => {
            let res = await request(app).get('/videos').expect(200);
            expect(res.body.length).toEqual(1);

            await request(app).delete("/testing/all-data").expect(204)

            res = await request(app).get('/videos').expect(200);
            expect(res.body.length).toEqual(0);
        });
    });

    describe("modify", () => {
        it("could modify record", async () => {
            await request(app).post('/videos').send(getDefaultVideo()).expect(201);

            await request(app).put('/videos/2').send(getFullRequest()).expect(204);
            
            let res = await request(app).get('/videos/2').expect(200);
            let b = res.body;

            expect(b.id).toEqual(2);
            expect(b.title).toEqual("All work and no play makes Jack angry");
            expect(b.author).toEqual("redrum");
            expect(b.canBeDownloaded).toEqual(true);
            expect(b.minAgeRestriction).toEqual(16);
            expect(b.availableResolutions).toEqual(["P2160"]);
        });

        it("404 if not found", async () => {
            await request(app).put('/videos/3').send(getFullRequest()).expect(404);
        });

        it("400 if errors", async () => {
            let m = getFullRequest();
            m.author = "redrumredrumredrumredrumredrumredrumredrumredrumredrumredrumredrumredrumredrumredrumredrumredrum"
            let res = await request(app).put('/videos/2').send(m).expect(400);
            expect(res.body).toEqual({
                errorsMessages: [
                    {
                        message: "error!",
                        field: "author"
                    },
                ]
            });

            m = getFullRequest();
            m.title = "redrumredrumredrumredrumredrumredrumredrumredrumredrumredrumredrumredrumredrumredrumredrumredrum"
            res = await request(app).put('/videos/2').send(m).expect(400);
            expect(res.body).toEqual({
                errorsMessages: [
                    {
                        message: "error!",
                        field: "title"
                    },
                ]
            });

            m = getFullRequest();
            m.availableResolutions = [];
            res = await request(app).put('/videos/2').send(m).expect(400);
            expect(res.body).toEqual({
                errorsMessages: [
                    {
                        message: "error!",
                        field: "availableResolutions"
                    },
                ]
            });

            m = getFullRequest();
            m.availableResolutions = ["TTT"];
            res = await request(app).put('/videos/2').send(m).expect(400);
            expect(res.body).toEqual({
                errorsMessages: [
                    {
                        message: "error!",
                        field: "availableResolutions"
                    },
                ]
            });

            m = getFullRequest();
            (m as any).canBeDownloaded = 5;
            res = await request(app).put('/videos/2').send(m).expect(400);
            expect(res.body).toEqual({
                errorsMessages: [
                    {
                        message: "error!",
                        field: "canBeDownloaded"
                    },
                ]
            });

            m = getFullRequest();
            (m as any).publicationDate = true;
            res = await request(app).put('/videos/2').send(m).expect(400);
            expect(res.body).toEqual({
                errorsMessages: [
                    {
                        message: "error!",
                        field: "publicationDate"
                    },
                ]
            });

            m = getFullRequest();
            (m as any).minAgeRestriction = "test";
            res = await request(app).put('/videos/2').send(m).expect(400);
            expect(res.body).toEqual({
                errorsMessages: [
                    {
                        message: "error!",
                        field: "minAgeRestriction"
                    },
                ]
            });

            m = getFullRequest();
            m.minAgeRestriction = 0;
            res = await request(app).put('/videos/2').send(m).expect(400);
            expect(res.body).toEqual({
                errorsMessages: [
                    {
                        message: "error!",
                        field: "minAgeRestriction"
                    },
                ]
            });

            m = getFullRequest();
            m.minAgeRestriction = 20;
            res = await request(app).put('/videos/2').send(m).expect(400);
            expect(res.body).toEqual({
                errorsMessages: [
                    {
                        message: "error!",
                        field: "minAgeRestriction"
                    },
                ]
            });
        });
    });

    describe("modify", () => {
        it("could delete", async () => {
            await request(app).delete('/videos/2').expect(204);
        });

        it("404 if no entry", async () => {
            await request(app).delete('/videos/2').expect(404);
        });

    });
})