const User = require("../src/models/User.model");
const Article = require("../src/models/Article.model");

async function seedBasic() {
  const [admin, editor, author, reader] = await User.create([
    {
      username: "admin",
      email: "a@a.com",
      password: "Password123!",
      role: "ADMIN",
      isActive: true,
    },
    {
      username: "editor",
      email: "e@e.com",
      password: "Password123!",
      role: "EDITOR",
      isActive: true,
    },
    {
      username: "author",
      email: "u@u.com",
      password: "Password123!",
      role: "AUTHOR",
      isActive: true,
    },
    {
      username: "reader",
      email: "r@r.com",
      password: "Password123!",
      role: "READER",
      isActive: true,
    },
  ]);

  const draft = await Article.create({
    title: "Draft A",
    content: "x".repeat(60),
    author: author._id,
    status: "DRAFT",
  });
  const published = await Article.create({
    title: "Pub B",
    content: "y".repeat(60),
    author: author._id,
    status: "PUBLISHED",
    publishedAt: new Date(),
  });

  return { admin, editor, author, reader, draft, published };
}

module.exports = { seedBasic };

