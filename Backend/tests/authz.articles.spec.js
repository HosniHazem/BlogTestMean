const request = require("supertest");
const app = require("../src/app");
const { seedBasic } = require("./seed");
const { tokenFor } = require("./helpers/auth");

describe("RBAC Articles", () => {
  let admin, editor, author, reader, draft, published;

  beforeAll(async () => {
    const seeded = await seedBasic();
    admin = seeded.admin;
    editor = seeded.editor;
    author = seeded.author;
    reader = seeded.reader;
    draft = seeded.draft;
    published = seeded.published;
  });

  test("AUTHOR can create article", async () => {
    const res = await request(app)
      .post("/api/articles")
      .set(
        "Authorization",
        `Bearer ${tokenFor(author._id, "AUTHOR", author.username)}`
      )
      .send({ title: "Title 1", content: "c".repeat(60), status: "DRAFT" });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  test("READER cannot create article", async () => {
    const res = await request(app)
      .post("/api/articles")
      .set(
        "Authorization",
        `Bearer ${tokenFor(reader._id, "READER", reader.username)}`
      )
      .send({ title: "Title 2", content: "c".repeat(60) });
    expect(res.status).toBe(403);
  });

  test("EDITOR can update any article", async () => {
    const res = await request(app)
      .put(`/api/articles/${draft._id}`)
      .set(
        "Authorization",
        `Bearer ${tokenFor(editor._id, "EDITOR", editor.username)}`
      )
      .send({ status: "PUBLISHED" });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test("ADMIN can delete any article", async () => {
    const res = await request(app)
      .delete(`/api/articles/${published._id}`)
      .set(
        "Authorization",
        `Bearer ${tokenFor(admin._id, "ADMIN", admin.username)}`
      );
    expect(res.status).toBe(200);
  });

  test("Public sees only PUBLISHED (ignores status=DRAFT without token)", async () => {
    const res = await request(app).get("/api/articles?status=DRAFT");
    expect(res.status).toBe(200);
    expect(res.body.data.articles.every((a) => a.status === "PUBLISHED")).toBe(
      true
    );
  });

  test("ADMIN can filter DRAFT", async () => {
    const res = await request(app)
      .get("/api/articles?status=DRAFT")
      .set(
        "Authorization",
        `Bearer ${tokenFor(admin._id, "ADMIN", admin.username)}`
      );
    expect(res.status).toBe(200);
    expect(res.body.data.articles.every((a) => a.status === "DRAFT")).toBe(
      true
    );
  });
});
