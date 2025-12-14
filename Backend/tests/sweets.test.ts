import request from "supertest";
import app from "../src/app";
import prisma from "../src/prisma";

let userToken: string;
let adminToken: string;
let sweetId: string;

beforeAll(async () => {
  // Clear DB
  await prisma.sweet.deleteMany({});
  await prisma.user.deleteMany({});

  // Create user
  const userRes = await request(app).post("/api/auth/register").send({ email: "user@example.com", password: "pass123" });
  userToken = userRes.body.token;

  // Create admin user directly in DB
  const admin = await prisma.user.create({
    data: { email: "admin@example.com", password: await (await import("bcrypt")).hash("adminpass", 10), isAdmin: true },
  });
  // Login admin to get token
  const adminRes = await request(app).post("/api/auth/login").send({ email: "admin@example.com", password: "adminpass" });
  adminToken = adminRes.body.token;
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe("Sweets API", () => {
  it("creates a sweet (protected)", async () => {
    const res = await request(app)
      .post("/api/sweets")
      .set("Authorization", `Bearer ${userToken}`)
      .send({ name: "Lollipop", price: 1.5, quantity: 10, category: "Candy" });
    expect(res.status).toBe(201);
    expect(res.body.name).toBe("Lollipop");
    sweetId = res.body.id;
  });

  it("lists sweets", async () => {
    const res = await request(app).get("/api/sweets").set("Authorization", `Bearer ${userToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it("searches sweets by name", async () => {
    const res = await request(app).get("/api/sweets/search").set("Authorization", `Bearer ${userToken}`).query({ q: "lolli" });
    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it("updates a sweet", async () => {
    const res = await request(app).put(`/api/sweets/${sweetId}`).set("Authorization", `Bearer ${userToken}`).send({ price: 2.0 });
    expect(res.status).toBe(200);
    expect(res.body.price).toBe(2.0);
  });

  it("purchases a sweet", async () => {
    const res = await request(app).post(`/api/sweets/${sweetId}/purchase`).set("Authorization", `Bearer ${userToken}`).send({ amount: 2 });
    expect(res.status).toBe(200);
    expect(res.body.quantity).toBe(8);
  });

  it("restocks a sweet (admin only)", async () => {
    const res = await request(app)
      .post(`/api/sweets/${sweetId}/restock`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ amount: 5 });
    expect(res.status).toBe(200);
    expect(res.body.quantity).toBe(13);
  });

  it("deletes a sweet (admin only)", async () => {
    const res = await request(app).delete(`/api/sweets/${sweetId}`).set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(204);
  });
});