import request from 'supertest'
import { app } from '../src/settings'

describe("Api", () => {
    describe("root", () => {
        it("get root", async () => {
            await request(app).get('/').expect("Received get command!");
        })
    })
})