import React, { useEffect, useState } from "react";
import axios from "axios";

import {
  FaCheckCircle,
  FaPlus,
  FaRegCalendarAlt,
  FaCheck,
  FaEdit,
  FaTrashAlt,
  FaRegCircle,
} from "react-icons/fa";

import "../Home/Home.css";

// Render Backend URL
const API = "https://todo-list-4-iybr.onrender.com";

function Home() {
  const [tab, setTab] = useState(1);

  const [task, setTask] = useState("");
  const [tasks, setTasks] = useState([]);

  const [loading, setLoading] = useState(false);

  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");

  // =========================
  // GET ALL TASKS
  // =========================
  const getTasks = async () => {
    try {
      setLoading(true);

      const response = await axios.get(`${API}/read-tasks`);

      console.log("TASKS:", response.data);

      setTasks(response.data);
    } catch (error) {
      console.log("GET TASK ERROR:", error);
      console.log("SERVER:", error.response?.data);

      alert(
        error.response?.data?.message ||
          "Failed to load tasks"
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // ADD TASK
  // =========================
  const handleAddTask = async (e) => {
    e.preventDefault();

    const newTask = task.trim();

    if (!newTask) {
      alert("Please enter a task");
      return;
    }

    try {
      console.log("ADDING TASK:", newTask);

      const response = await axios.post(
        `${API}/new-task`,
        {
          task: newTask,
        }
      );

      console.log("ADD RESPONSE:", response.data);

      // Clear input
      setTask("");

      // Reload tasks
      await getTasks();
    } catch (error) {
      console.log("ADD ERROR:", error);
      console.log("STATUS:", error.response?.status);
      console.log("SERVER:", error.response?.data);
      console.log("MESSAGE:", error.message);

      alert(
        error.response?.data?.message ||
          "Failed to add task"
      );
    }
  };

  // =========================
  // START EDIT
  // =========================
  const handleStartEdit = (item) => {
    setEditingId(item.id);
    setEditText(item.task);
  };

  // =========================
  // SAVE EDIT
  // =========================
  const handleSaveEdit = async (id) => {
    const newTask = editText.trim();

    if (!newTask) {
      alert("Task cannot be empty");
      return;
    }

    try {
      console.log("================================");
      console.log("SAVING TASK");
      console.log("ID:", id);
      console.log("TASK:", newTask);
      console.log("================================");

      const response = await axios.put(
        `${API}/update-task/${id}`,
        {
          task: newTask,
        }
      );

      console.log("SAVE RESPONSE:", response.data);

      // Exit edit mode
      setEditingId(null);
      setEditText("");

      // Reload tasks
      await getTasks();
    } catch (error) {
      console.log("================================");
      console.log("SAVE ERROR");
      console.log("STATUS:", error.response?.status);
      console.log("DATA:", error.response?.data);
      console.log("MESSAGE:", error.message);
      console.log("================================");

      alert(
        error.response?.data?.message ||
          "Failed to save task"
      );
    }
  };

  // =========================
  // CANCEL EDIT
  // =========================
  const handleCancelEdit = () => {
    setEditingId(null);
    setEditText("");
  };

  // =========================
  // DELETE TASK
  // =========================
  const handleDeleteTask = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this task?"
    );

    if (!confirmDelete) {
      return;
    }

    try {
      console.log("DELETING TASK:", id);

      const response = await axios.delete(
        `${API}/delete-task/${id}`
      );

      console.log("DELETE RESPONSE:", response.data);

      await getTasks();
    } catch (error) {
      console.log("DELETE ERROR:", error);
      console.log("SERVER:", error.response?.data);

      alert(
        error.response?.data?.message ||
          "Failed to delete task"
      );
    }
  };

  // =========================
  // COMPLETE / UNCOMPLETE
  // =========================
  const handleCompleteTask = async (id, completed) => {
    try {
      const newCompleted = completed ? 0 : 1;

      console.log(
        "CHANGE COMPLETE:",
        id,
        newCompleted
      );

      const response = await axios.put(
        `${API}/complete-task/${id}`,
        {
          completed: newCompleted,
        }
      );

      console.log(
        "COMPLETE RESPONSE:",
        response.data
      );

      await getTasks();
    } catch (error) {
      console.log("COMPLETE ERROR:", error);
      console.log("SERVER:", error.response?.data);

      alert(
        error.response?.data?.message ||
          "Failed to update task"
      );
    }
  };

  // =========================
  // LOAD TASKS WHEN PAGE OPENS
  // =========================
  useEffect(() => {
    getTasks();
  }, []);

  // =========================
  // FILTER TASKS
  // =========================
  const filteredTasks = tasks.filter((item) => {
    const completed = Number(item.completed) === 1;

    // All
    if (tab === 1) {
      return true;
    }

    // Active
    if (tab === 2) {
      return !completed;
    }

    // Completed
    if (tab === 3) {
      return completed;
    }

    return true;
  });

  // =========================
  // TASK COUNTS
  // =========================
  const totalTasks = tasks.length;

  const completedTasks = tasks.filter(
    (item) => Number(item.completed) === 1
  ).length;

  const activeTasks =
    totalTasks - completedTasks;

  return (
    <div className="bg">
      <div className="flex-container">

        {/* =========================
            HEADER
        ========================= */}
        <div className="header-title">
          <FaCheckCircle className="title-icon" />

          <h2>ToDo List</h2>
        </div>

        {/* =========================
            ADD TASK
        ========================= */}
        <form
          className="input-area"
          onSubmit={handleAddTask}
        >
          <input
            type="text"
            placeholder="Enter todo..."
            value={task}
            onChange={(e) =>
              setTask(e.target.value)
            }
          />

          <button
            type="submit"
            className="add-btn"
          >
            <FaPlus className="plus-icon" />
            Add
          </button>
        </form>

        {/* =========================
            FILTER BUTTONS
        ========================= */}
        <div className="filters">

          <button
            type="button"
            className={
              tab === 1
                ? "pill-btn active-pill"
                : "pill-btn"
            }
            onClick={() => setTab(1)}
          >
            All
          </button>

          <button
            type="button"
            className={
              tab === 2
                ? "pill-btn active-pill"
                : "pill-btn"
            }
            onClick={() => setTab(2)}
          >
            Active
          </button>

          <button
            type="button"
            className={
              tab === 3
                ? "pill-btn active-pill"
                : "pill-btn"
            }
            onClick={() => setTab(3)}
          >
            Completed
          </button>

        </div>

        {/* =========================
            TASK LIST
        ========================= */}
        <div className="tasks-container">

          {loading ? (
            <p className="no-tasks">
              Loading tasks...
            </p>
          ) : filteredTasks.length === 0 ? (
            <p className="no-tasks">
              No tasks found.
            </p>
          ) : (
            filteredTasks.map((item) => {

              const itemId = item.id;

              const isEditing =
                editingId === itemId;

              const isCompleted =
                Number(item.completed) === 1;

              return (
                <div
                  className={
                    `todo-card ${
                      isCompleted
                        ? "completed-card"
                        : ""
                    }`
                  }
                  key={itemId}
                >

                  {/* =========================
                      LEFT SIDE
                  ========================= */}
                  <div className="card-left">

                    <button
                      type="button"
                      className="checkbox-btn"
                      onClick={() =>
                        handleCompleteTask(
                          itemId,
                          isCompleted
                        )
                      }
                    >
                      {isCompleted ? (
                        <FaCheckCircle
                          className="checked-icon"
                        />
                      ) : (
                        <FaRegCircle
                          className="unchecked-icon"
                        />
                      )}
                    </button>

                    <div className="todo-info">

                      {/* EDIT INPUT */}
                      {isEditing ? (
                        <input
                          type="text"
                          className="edit-input"
                          value={editText}
                          onChange={(e) =>
                            setEditText(
                              e.target.value
                            )
                          }
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              handleSaveEdit(itemId);
                            }

                            if (e.key === "Escape") {
                              handleCancelEdit();
                            }
                          }}
                        />
                      ) : (
                        <p
                          className={
                            `title ${
                              isCompleted
                                ? "strikethrough"
                                : ""
                            }`
                          }
                        >
                          {item.task}
                        </p>
                      )}

                      {/* DATE */}
                      <div className="date-wrapper">

                        <FaRegCalendarAlt
                          className="calendar-icon"
                        />

                        <span>
                          {item.createdAt
                            ? new Date(
                                item.createdAt
                              ).toLocaleString()
                            : ""}
                        </span>

                      </div>

                      {/* STATUS */}
                      <div
                        className={
                          `status-badge ${
                            isCompleted
                              ? "badge-completed"
                              : "badge-active"
                          }`
                        }
                      >
                        <span className="dot">
                          ●
                        </span>

                        <span>
                          {isCompleted
                            ? "Completed"
                            : "Active"}
                        </span>
                      </div>

                    </div>
                  </div>

                  {/* =========================
                      ACTION BUTTONS
                  ========================= */}
                  <div className="actions">

                    {isEditing ? (
                      <>
                        {/* SAVE */}
                        <button
                          type="button"
                          className="icon-btn save-btn"
                          onClick={() =>
                            handleSaveEdit(
                              itemId
                            )
                          }
                        >
                          Save
                        </button>

                        {/* CANCEL */}
                        <button
                          type="button"
                          className="icon-btn cancel-btn"
                          onClick={
                            handleCancelEdit
                          }
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        {/* COMPLETE */}
                        <button
                          type="button"
                          className="icon-btn check-btn"
                          onClick={() =>
                            handleCompleteTask(
                              itemId,
                              isCompleted
                            )
                          }
                          title={
                            isCompleted
                              ? "Mark as active"
                              : "Complete task"
                          }
                        >
                          <FaCheck />
                        </button>

                        {/* EDIT */}
                        <button
                          type="button"
                          className="icon-btn edit-btn"
                          onClick={() =>
                            handleStartEdit(item)
                          }
                          title="Edit task"
                        >
                          <FaEdit />
                        </button>

                        {/* DELETE */}
                        <button
                          type="button"
                          className="icon-btn delete-btn"
                          onClick={() =>
                            handleDeleteTask(
                              itemId
                            )
                          }
                          title="Delete task"
                        >
                          <FaTrashAlt />
                        </button>
                      </>
                    )}

                  </div>

                </div>
              );
            })
          )}

        </div>

        {/* =========================
            OPTIONAL TASK COUNT
        ========================= */}
        <div className="task-count">
          <span>
            Total: {totalTasks}
          </span>

          <span>
            Active: {activeTasks}
          </span>

          <span>
            Completed: {completedTasks}
          </span>
        </div>

      </div>
    </div>
  );
}

export default Home;