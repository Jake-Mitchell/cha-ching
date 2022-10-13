const request = require("supertest");
const app = require("../app");

describe("app", () => {
  describe("GET /", () => {
    it("successfully calls root", async () => {
      const response = await request(app).get("/");

      expect(response.statusCode).toBe(200);
      expect(response.headers["content-type"]).toEqual(
        expect.stringContaining("json")
      );
      expect(response.body).toEqual(
        expect.objectContaining({
          test: "Hello World!",
        })
      );
    });
  });

  describe("POST /incomplete-subscriptions", () => {
    describe("successful request", () => {
      let response;
      beforeAll(async () => {
        response = await request(app)
          .post("/incomplete-subscriptions")
          .send({ priceId: process.env.STRIPE_TESTING_STARTER_PRICE_ID });
      });

      it("returns an 'incomplete' stripe subscription", async () => {
        expect(response.body).toEqual(
          expect.objectContaining({
            object: "subscription",
            currency: "usd",
            collection_method: "charge_automatically",
            current_period_end: expect.any(Number),
            current_period_start: expect.any(Number),
            customer: expect.any(String),
          })
        );
      });

      it("has a response code of 200", () => {
        expect(expect(response.statusCode).toBe(200));
      });
    });

    describe("unsuccessful request", () => {
      const INVALID_PRICE = "invalidPriceId";
      let response;
      beforeAll(async () => {
        response = await request(app)
          .post("/incomplete-subscriptions")
          .send({ priceId: INVALID_PRICE });
      });

      it("returns an error object with a message and status code", () => {
        expect(response.body).toEqual(
          expect.objectContaining({
            error: `No such price: '${INVALID_PRICE}'`,
            statusCode: 400,
          })
        );
      });
      it("has a status code of 400", () => {
        expect(response.statusCode).toEqual(400);
      });
    });
  });

  describe("GET /stripe-client-secret", () => {
    it("responds with a clientSecret", async () => {
      const response = await request(app).get("/stripe-client-secret");

      expect(response.body).toEqual(
        expect.objectContaining({
          clientSecret: expect.any(String),
        })
      );
    });

    it("has status code of 200 on success", async () => {
      const response = await request(app).get("/stripe-client-secret");

      expect(response.statusCode).toBe(200);
    });
  });

  describe("POST /payment-intent", () => {
    describe("gets called with the correct req.body", () => {
      let response;
      beforeAll(async () => {
        response = await request(app)
          .post("/payment-intent")
          .send({ amount: 700 });
      });

      it("takes in object with amount and returns a stripe paymentIntent object", async () => {
        expect(response.body).toEqual(
          expect.objectContaining({
            id: expect.any(String),
            client_secret: expect.any(String),
            amount: 700,
            currency: "usd",
            payment_method_options: expect.objectContaining({
              card: expect.anything(),
            }),
          })
        );
      });

      it("responds with json headers", async () => {
        expect(response.headers["content-type"]).toEqual(
          expect.stringContaining("json")
        );
      });

      it("has status code of 200 when called correctly", async () => {
        expect(response.statusCode).toBe(200);
      });

      it("has a client_secret in the response", async () => {
        const clientSecretRegex = /^pi_.*_secret_.*/;
        expect(response.body.client_secret).toMatch(clientSecretRegex);
      });
    });

    describe("handles errors when called with incorrect req.body params", () => {
      it("returns a res.body.error key when req.body.amount is not provided", async () => {
        const result = await request(app)
          .post("/payment-intent")
          .send("invalid param data type");

        expect(result.body).toEqual(
          expect.objectContaining({
            error: "Missing required param: amount.",
            statusCode: 400,
          })
        );
      });

      it("returns a response with error if req.body.amount is not an interger", async () => {
        const result = await request(app)
          .post("/payment-intent")
          .send({ amount: "" });

        expect(result.body).toEqual(
          expect.objectContaining({
            error: "Invalid integer: ",
          })
        );
      });

      it("returns a status code of 400", async () => {
        const result = await request(app)
          .post("/payment-intent")
          .send({ amount: "" });

        expect(result.statusCode).toBe(400);
      });
    });
  });
});
