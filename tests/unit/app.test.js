// test/app.test.js

const request = require("supertest");
const app = require("../../src/app");

describe("GET 404 request", () => {

    // requesting to unexisting source should produce 404
    test('HHTP unit test to verify 404 responses', async() => {
        const res = await request(app).get('/ramdom');
        expect(res.statusCode).toBe(404);
        expect(res.body.status).toBe('error');
    });
});