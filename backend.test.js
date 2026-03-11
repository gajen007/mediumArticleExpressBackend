const request = require("supertest");
const { MongoClient } = require("mongodb");
const app = require("./app");

// ─────────────────────────────────────────────
// MongoDB connection shared across all tests
// ─────────────────────────────────────────────
let mongoClient;
let db;

beforeAll(async () => {
  mongoClient = new MongoClient("mongodb://localhost:27017/");
  await mongoClient.connect();
  db = mongoClient.db("meanDB");
});

afterAll(async () => {
  // Clean up every test document inserted during this run
  await db.collection("users").deleteMany({ useremail: /@test\.com/ });
  await mongoClient.close();
});

// ═════════════════════════════════════════════
// SEQUENCE 1 — sendData  (POST /samplePost)
// ═════════════════════════════════════════════
describe("SEQUENCE 1 — POST /samplePost (sendData)", () => {

  // ── Happy path ───────────────────────────
  test("1.1  Should insert a user and return an acknowledged result", async () => {
    const res = await request(app)
      .post("/samplePost")
      .send({ uname: "Alice", uemail: "alice@test.com" });

    expect(res.statusCode).toBe(200);
    expect(res.body.acknowledged).toBe(true);
    expect(res.body.insertedId).toBeDefined();
  });

  test("1.2  Should persist the user in MongoDB after insert", async () => {
    const user = await db
      .collection("users")
      .findOne({ useremail: "alice@test.com" });

    expect(user).not.toBeNull();
    expect(user.username).toBe("Alice");
  });

  // ── Edge cases ───────────────────────────
  test("1.3  Should still insert when only email is provided (uname undefined)", async () => {
    const res = await request(app)
      .post("/samplePost")
      .send({ uemail: "noname@test.com" });

    expect(res.statusCode).toBe(200);
    expect(res.body.acknowledged).toBe(true);
  });

  test("1.4  Should allow duplicate emails (no unique constraint enforced)", async () => {
    const res = await request(app)
      .post("/samplePost")
      .send({ uname: "Alice Again", uemail: "alice@test.com" });

    expect(res.statusCode).toBe(200);
    expect(res.body.acknowledged).toBe(true);
  });

  test("1.5  Should return 200 even when body is completely empty", async () => {
    const res = await request(app)
      .post("/samplePost")
      .send({});

    expect(res.statusCode).toBe(200);
  });
});

// ═════════════════════════════════════════════
// SEQUENCE 2 — getUser  (GET /sampleGet)
// Must run AFTER Sequence 1 so alice@test.com exists
// ═════════════════════════════════════════════
describe("SEQUENCE 2 — GET /sampleGet (getUser)", () => {

  // ── Happy path ───────────────────────────
  test("2.1  Should return the user document for a known email", async () => {
    const res = await request(app)
      .get("/sampleGet")
      .query({ userEmail: "alice@test.com" });

    expect(res.statusCode).toBe(200);
    expect(res.body).not.toBeNull();
    expect(res.body.username).toBe("Alice");
    expect(res.body.useremail).toBe("alice@test.com");
  });

  test("2.2  Should return the correct username field (not a different user)", async () => {
    const res = await request(app)
      .get("/sampleGet")
      .query({ userEmail: "alice@test.com" });

    expect(res.body.username).toBe("Alice");
  });

  // ── Edge cases ───────────────────────────
  test("2.3  Should return null body for an email that does not exist", async () => {
    const res = await request(app)
      .get("/sampleGet")
      .query({ userEmail: "ghost@test.com" });

    expect(res.statusCode).toBe(200);
    expect(res.body).toBeNull(); // findOne returns null when not found
  });

  test("2.4  Should return null body when userEmail query param is missing", async () => {
    const res = await request(app)
      .get("/sampleGet");

    expect(res.statusCode).toBe(200);
    expect(res.body).toBeNull();
  });

  test("2.5  Should return null for an empty string email", async () => {
    const res = await request(app)
      .get("/sampleGet")
      .query({ userEmail: "" });

    expect(res.statusCode).toBe(200);
    expect(res.body).toBeNull();
  });
});