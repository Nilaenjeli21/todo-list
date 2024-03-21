import { PrismaClient } from "@prisma/client";
const cors = require('cors');
import express from "express";

const prisma = new PrismaClient();
const app = express();

var corsOption={
    origin:["http://localhost:5173"]
}

app.use(cors(corsOption));

app.use(express.json());

app.get(`/get`, async (req, res) => {
    const result = await prisma.lists.findMany();
    res.json(result);
});

app.post(`/post`, async (req, res) => {
    const { title, notes, completed } = req.body;
    const result = await prisma.lists.create({
        data: {
            title,
            notes,
            completed,
        },
    });
    res.json(result);
});

app.put("/finish/:id", async (req, res) => {
  const { id } = req.params;

  try {
      const postData = await prisma.lists.findUnique({
          where: { id: Number(id) },
          select: {
              completed: true,
          },
      });

      if (!postData) {
          return res.status(404).json({ error: `Post with ID ${id} does not exist in the database` });
      }

      const updatedPost = await prisma.lists.update({
          where: { id: Number(id) },
          data: { completed: !postData.completed }, // This assumes completed is a boolean field
      });
      res.json(updatedPost);
  } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal server error" });
  }
});

app.put("/post/:id", async (req, res) => {
  const { id } = req.params;
  const { title, notes } = req.body;

  try {
      const postData = await prisma.lists.findUnique({
          where: { id: Number(id) },
      });

      if (!postData) {
          return res.status(404).json({ error: `Post with ID ${id} does not exist in the database` });
      }

      const updatedPost = await prisma.lists.update({
          where: { id: Number(id) },
          data: { title, notes },
      });
      res.json(updatedPost);
  } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal server error" });
  }
});


app.delete(`/get/:id`, async (req, res) => {
    const { id } = req.params;
    const post = await prisma.lists.delete({
        where: {
            id: Number(id),
        },
    });
    res.json(post);
});

const server = app.listen(3000, () => {
    console.log(`http://localhost:3000`);
});

app.use(express.urlencoded({ extended: true }));
