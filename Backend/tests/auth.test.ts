import request from "supertest";
import app from "../src/app";
import { prisma } from "../src/prisma";

const testUser = { email: "test@example.com", password: "password123", displayName: "Tester" };

beforeAll(async () => {
  await prisma.user.deleteMany({});
  await prisma.sweet.deleteMany({});
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe("Auth", () => {
  it("registers a new user", async () => {
    const res = await request(app).post("/api/auth/register").send(testUser);
    expect(res.status).toBe(201);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe(testUser.email);
  });

  it("logins with correct credentials", async () => {
    const res = await request(app).post("/api/auth/login").send({ email: testUser.email, password: testUser.password });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
  });

  it("rejects invalid login", async () => {
    const res = await request(app).post("/api/auth/login").send({ email: testUser.email, password: "wrong" });
    expect(res.status).toBe(401);
  });
});
