const express = require("express");
const axios = require("axios");

/* 1st way to use redis client */
const redis = require("redis");

let client;

(async () => {
  client = redis.createClient();
  client.on("error", (err) => console.log("Redis Client Error", err));
  await client.connect();
})();

/* Another way to use redis client */
// const { createClient } = require("redis");
// const client = createClient();

// client.on("error", (err) => console.log("Redis Client Error", err));
// client.connect();

const app = express();
app.use(express.json());

app.get("/posts", async (req, res) => {
  const cachedPosts = await client.get("posts");

  if (cachedPosts) {
    return res.json(JSON.parse(cachedPosts));
  }

  const response = await axios("https://jsonplaceholder.typicode.com/posts");
  client.set("posts", JSON.stringify(response.data));
  return res.json(response.data);
});

app.get("/comments", async (req, res) => {
  const cachedPosts = await client.get("comments");

  if (cachedPosts) {
    return res.json(JSON.parse(cachedPosts));
  }

  const response = await axios("https://jsonplaceholder.typicode.com/comments");
  client.set("comments", JSON.stringify(response.data));
  return res.json(response.data);
});

app.get("/users", async (req, res) => {
  const cachedPosts = await client.get("users");

  if (cachedPosts) {
    return res.json(JSON.parse(cachedPosts));
  }

  const response = await axios("https://jsonplaceholder.typicode.com/users");
  client.set("users", JSON.stringify(response.data));
  return res.json(response.data);
});

app.get("/posts/:id", async (req, res) => {
  const { id } = req.params;
  const cachedPost = await client.get(`post-${id}`);

  if (cachedPost) {
    return res.json(JSON.parse(cachedPost));
  }

  const response = await axios.get(
    `https://jsonplaceholder.typicode.com/posts/${id}`
  );

  client.set(`post-${id}`, JSON.stringify(response.data));
  client.expire(`post-${id}`, 5); // to expire a key

  return res.json(response.data);
});

app.get("/posts/:id/comments", async (req, res) => {
  const { id } = req.params;
  const cachedPost = await client.get(`post-${id}-comments`);

  if (cachedPost) {
    return res.json(JSON.parse(cachedPost));
  }

  const response = await axios.get(
    `https://jsonplaceholder.typicode.com/posts/${id}/comments`
  );

  client.set(`post-${id}-comments`, JSON.stringify(response.data));

  return res.json(response.data);
});

app.listen(5000, () => console.log("Server is listening at port 5000"));
