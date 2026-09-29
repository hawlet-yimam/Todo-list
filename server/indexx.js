const express = require("express");
const cors = require("cors");
const mysql2 = require("mysql2");
require("dotenv").config();

const app = express();

const PORT = process.env.PORT || 5000;
app.use(
  cors({
    origin: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);

app.use(express.json());


const db = mysql2.createConnection({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: {
    rejectUnauthorized: false, 
  },
});

db.connect((err) => {
  if (err) {
    console.log("MYSQL CONNECTION ERROR:");
    console.log(err.message);
    return;
  }

  console.log("MYSQL CONNECTED SUCCESSFULLY!");
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS todos (
      id INT AUTO_INCREMENT PRIMARY KEY,
      task VARCHAR(255) NOT NULL,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      completed TINYINT(1) DEFAULT 0
    );
  `;

  db.query(createTableQuery, (err, result) => {
    if (err) {
      console.log("TABLE CREATION ERROR:", err.message);
    } else {
      console.log("TODOS TABLE IS READY ON CLEVER CLOUD!");
    }
  });
});

app.get("/", (req, res) => {
  res.json({
    message: "Todo API is running successfully",
  });
});

app.get("/read-tasks", (req, res) => {
  const sql = `
    SELECT
      id,
      task,
      createdAt,
      completed
    FROM todos
    ORDER BY createdAt DESC
  `;

  db.query(sql, (err, result) => {
    if (err) {
      console.log("READ TASK ERROR:", err.message);

      return res.status(500).json({
        message: "Failed to read tasks",
        error: err.message,
      });
    }

    res.status(200).json(result);
  });
});

app.post("/new-task", (req, res) => {
  const { task } = req.body;

  if (!task || !task.trim()) {
    return res.status(400).json({
      message: "Task is required",
    });
  }

  const sql = `
    INSERT INTO todos
    (task, createdAt, completed)
    VALUES (?, NOW(), 0)
  `;

  db.query(sql, [task.trim()], (err, result) => {
    if (err) {
      console.log("ADD TASK ERROR:", err.message);

      return res.status(500).json({
        message: "Failed to add task",
        error: err.message,
      });
    }

    console.log("TASK ADDED:", task);

    res.status(201).json({
      message: "Task added successfully",
      id: result.insertId,
    });
  });
});

app.put("/update-task/:id", (req, res) => {
  const { id } = req.params;
  const { task } = req.body;

  console.log("UPDATE ID:", id);
  console.log("UPDATE TASK:", task);

  if (!task || !task.trim()) {
    return res.status(400).json({
      message: "Task is required",
    });
  }

  const sql = `
    UPDATE todos
    SET task = ?
    WHERE id = ?
  `;

  db.query(sql, [task.trim(), id], (err, result) => {
    if (err) {
      console.log("UPDATE DATABASE ERROR:", err.message);

      return res.status(500).json({
        message: "Database update failed",
        error: err.message,
      });
    }

    console.log("AFFECTED ROWS:", result.affectedRows);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    res.status(200).json({
      message: "Task updated successfully",
    });
  });
});

app.put("/complete-task/:id", (req, res) => {
  const { id } = req.params;
  const { completed } = req.body;

  const sql = `
    UPDATE todos
    SET completed = ?
    WHERE id = ?
  `;

  db.query(sql, [completed ? 1 : 0, id], (err, result) => {
    if (err) {
      console.log("COMPLETE ERROR:", err.message);

      return res.status(500).json({
        message: "Failed to update task",
        error: err.message,
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    res.status(200).json({
      message: "Task status updated successfully",
    });
  });
});

app.delete("/delete-task/:id", (req, res) => {
  const { id } = req.params;

  const sql = `
    DELETE FROM todos
    WHERE id = ?
  `;

  db.query(sql, [id], (err, result) => {
    if (err) {
      console.log("DELETE ERROR:", err.message);

      return res.status(500).json({
        message: "Failed to delete task", 
        error: err.message,
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    res.status(200).json({
      message: "Task deleted successfully",
    });
  });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`SERVER RUNNING ON PORT ${PORT}`);
});