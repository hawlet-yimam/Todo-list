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

const API = "http://localhost:5000";

function Home() {
  const [tab, setTab] = useState(1);

  const [task, setTask] = useState("");
  const [tasks, setTasks] = useState([]);

  const [loading, setLoading] = useState(false);

  // EDIT
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");

  /* =========================
     GET TASKS
  ========================= */

  const getTasks = async () => {
    setLoading(true);

    try {
      const response = await axios.get(`${API}/read-tasks`);

      console.log("TASKS:", response.data);

      setTasks(response.data);
    } catch (error) {
      console.log("GET TASK ERROR:", error);
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     ADD TASK
  ========================= */

  const handleAddTask = async (e) => {
    e.preventDefault();

    const newTask = task.trim();

    if (!newTask) {
      alert("Please enter a task");
      return;
    }

    try {
      console.log("ADDING:", newTask);

      await axios.post(`${API}/new-task`, {
        task: newTask,
      });

      setTask("");

      await getTasks();

    } catch (error) {
      console.log("ADD ERROR:", error);
      console.log("SERVER:", error.response?.data);

      alert(
        error.response?.data?.message ||
        "Failed to add task"
      );
    }
  };

  /* =========================
     START EDIT
  ========================= */

  const handleStartEdit = (item) => {
    setEditingId(item.id);
    setEditText(item.task);
  };

  /* =========================
     SAVE EDIT
  ========================= */

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

      // Reload from database
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

  /* =========================
     CANCEL EDIT
  ========================= */

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditText("");
  };

  /* =========================
     DELETE
  ========================= */

  const handleDeleteTask = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this task?"
    );

    if (!confirmDelete) {
      return;
    }

    try {
      await axios.delete(
        `${API}/delete-task/${id}`
      );

      await getTasks();

    } catch (error) {
      console.log("DELETE ERROR:", error);

      alert(
        error.response?.data?.message ||
        "Failed to delete task"
      );
    }
  };

  /* =========================
     COMPLETE / UNCOMPLETE
  ========================= */

  const handleCompleteTask = async (id, completed) => {
    try {
      const newCompleted = completed ? 0 : 1;

      console.log(
        "CHANGE COMPLETE:",
        id,
        newCompleted
      );

      await axios.put(
        `${API}/complete-task/${id}`,
        {
          completed: newCompleted,
        }
      );

      await getTasks();

    } catch (error) {
      console.log(
        "COMPLETE ERROR:",
        error
      );

      console.log(
        "SERVER:",
        error.response?.data
      );

      alert(
        error.response?.data?.message ||
        "Failed to update task"
      );
    }
  };

  /* =========================
     LOAD TASKS
  ========================= */

  useEffect(() => {
    getTasks();
  }, []);

  /* =========================
     FILTER
  ========================= */

  const filteredTasks = tasks.filter((item) => {
    const completed = Number(item.completed) === 1;

    if (tab === 2) {
      return !completed;
    }

    if (tab === 3) {
      return completed;
    }

    return true;
  });

  /* =========================
     COUNTS
  ========================= */

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
            FILTER
        ========================= */}

        <div className="filters">

          <button
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
                      LEFT
                  ========================= */}

                  <div className="card-left">

                    <button
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
                          {new Date(
                            item.createdAt
                          ).toLocaleString()}
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
                      ACTIONS
                  ========================= */}

                  <div className="actions">

                    {isEditing ? (

                      <>

                        <button
                          className="icon-btn save-btn"
                          onClick={() =>
                            handleSaveEdit(
                              itemId
                            )
                          }
                        >
                          Save
                        </button>

                        <button
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

                        <button
                          className="icon-btn check-btn"
                          onClick={() =>
                            handleCompleteTask(
                              itemId,
                              isCompleted
                            )
                          }
                        >
                          <FaCheck />
                        </button>

                        <button
                          className="icon-btn edit-btn"
                          onClick={() =>
                            handleStartEdit(item)
                          }
                        >
                          <FaEdit />
                        </button>

                        <button
                          className="icon-btn delete-btn"
                          onClick={() =>
                            handleDeleteTask(
                              itemId
                            )
                          }
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

      </div>

    </div>
  );
}

export default Home;