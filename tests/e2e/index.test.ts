import app from "#root/src/app.js";
import request, { Response } from "supertest";

describe("Index Routes", () => {
  it("should respond welcome", async () => {
    const res: Response = await request(app).get("/");
    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual({ message: "welcome to my api" });
  });

  it("should respond pong", async () => {
    const res: Response = await request(app).get("/ping");
    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual({ result: "pong" });
  });
});
