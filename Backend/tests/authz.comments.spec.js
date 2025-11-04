const request = require("supertest");
const app = require("../src/app");
const { seedBasic } = require("./seed");
const Comment = require("../src/models/Comment.model");
const { tokenFor } = require("./helpers/auth");

describe("RBAC Comments", () => {
  let admin, author, reader, draft;

  beforeAll(async () => {
    const seeded = await seedBasic();
    admin = seeded.admin;
    author = seeded.author;
    reader = seeded.reader;
    draft = seeded.draft;
  });

  test("Authenticated user can create a comment", async () => {
    const res = await request(app)
      .post("/api/comments")
      .set(
        "Authorization",
        `Bearer ${tokenFor(reader._id, "READER", reader.username)}`
      )
      .send({ content: "Nice!", articleId: draft._id.toString() });
    expect(res.status).toBe(201);
  });

  test("Author of comment can edit; others forbidden", async () => {
    const created = await Comment.findOne({ content: "Nice!" });
    const ok = await request(app)
      .put(`/api/comments/${created._id}`)
      .set(
        "Authorization",
        `Bearer ${tokenFor(reader._id, "READER", reader.username)}`
      )
      .send({ content: "Nice edit" });
    expect(ok.status).toBe(200);

    const forbidden = await request(app)
      .put(`/api/comments/${created._id}`)
      .set(
        "Authorization",
        `Bearer ${tokenFor(author._id, "AUTHOR", author.username)}`
      )
      .send({ content: "Not allowed" });
    expect(forbidden.status).toBe(403);
  });

  test("ADMIN can delete any comment", async () => {
    const created = await Comment.findOne({ content: "Nice edit" });
    const res = await request(app)
      .delete(`/api/comments/${created._id}`)
      .set(
        "Authorization",
        `Bearer ${tokenFor(admin._id, "ADMIN", admin.username)}`
      );
    expect(res.status).toBe(200);
  });
});

