import { PrismaClient } from "@prisma/client";
const cors = require("cors");

import express from "express";
import createError from "http-errors";

const prisma = new PrismaClient();
const app = express();

const corsOptions = {
  origin: "http://localhost:5173",
};

app.use(cors());
// app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Define routes
app.get(`/tasks`, async (req, res) => {
  const tasks = await prisma.task.findMany();
  res.json(tasks);
});

app.post(`/tasks`, async (req, res) => {
  console.log("masuk sini");
  const { title, notes } = req.body;
  try {
    const result = await prisma.task.create({
      data: {
        title,
        notes,
        completed: false, // Default value for completed
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
    res.json(result);
  } catch (error: any) {
    console.error("Error creating task:", error);
    res
      .status(500)
      .json({ error: "Error creating task", message: error.message });
  }
});

app.put("/tasks/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const task = await prisma.task.update({
      where: { id: Number(id) },
      data: { completed: true },
    });
    res.json(task);
  } catch (error) {
    console.error("Error updating task:", error);
    res.status(500).json({ error: "Error updating task" });
  }
});

app.put("/tasks/:id/1", async (req, res) => {
  const { id } = req.params;
  const { title, notes } = req.body;

  try {
    const task = await prisma.task.update({
      where: { id: Number(id) },
      data: {
        title,
        notes,
      },
    });
    res.json(task);
  } catch (error) {
    console.error("Error updating task:", error);
    res.status(500).json({ error: "Error updating task" });
  }
});

app.delete(`/tasks/:id`, async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.task.delete({
      where: { id: Number(id) },
    });
    res.json({ message: "Task deleted successfully" });
  } catch (error) {
    console.error("Error deleting task:", error);
    res.status(500).json({ error: "Error deleting task" });
  }
});

const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
