"use client";

import { useEffect, useState, useCallback } from "react";

export default function TaskManager() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");

  // New task form state
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState("LeetCode");
  const [newPriority, setNewPriority] = useState("High");
  const [newDueDate, setNewDueDate] = useState("Today");
  const [showAddForm, setShowAddForm] = useState(false);

  const loadTasks = useCallback(async () => {
    try {
      const res = await fetch("/api/king/tasks");
      const data = await res.json();
      if (data.tasks) {
        setTasks(data.tasks);
      }
    } catch (err) {
      console.error("Failed to load tasks", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    try {
      const res = await fetch("/api/king/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "add",
          title: newTitle.trim(),
          category: newCategory,
          priority: newPriority,
          dueDate: newDueDate,
        }),
      });

      const data = await res.json();
      if (data.success && data.tasks) {
        setTasks(data.tasks);
        setNewTitle("");
        setShowAddForm(false);
      }
    } catch (err) {
      console.error("Error adding task", err);
    }
  };

  const handleUpdateStatus = async (id, currentStatus) => {
    const nextStatusMap = {
      todo: "in_progress",
      in_progress: "completed",
      completed: "todo",
    };
    const nextStatus = nextStatusMap[currentStatus] || "todo";

    // Optimistic UI update
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: nextStatus } : t))
    );

    try {
      await fetch("/api/king/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_status",
          id,
          status: nextStatus,
        }),
      });
    } catch (err) {
      console.error("Error updating status", err);
      loadTasks();
    }
  };

  const handleDeleteTask = async (id) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    try {
      await fetch("/api/king/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete", id }),
      });
    } catch (err) {
      console.error("Error deleting task", err);
      loadTasks();
    }
  };

  // Stats calculation
  const totalCount = tasks.length;
  const completedCount = tasks.filter((t) => t.status === "completed").length;
  const inProgressCount = tasks.filter((t) => t.status === "in_progress").length;
  const todoCount = tasks.filter((t) => t.status === "todo").length;
  const percentComplete = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Filter tasks
  const filteredTasks = tasks.filter((t) => {
    const matchStatus = filterStatus === "all" || t.status === filterStatus;
    const matchCategory = filterCategory === "all" || t.category === filterCategory;
    return matchStatus && matchCategory;
  });

  const getPriorityColor = (p) => {
    if (p === "High") return "#f43f5e";
    if (p === "Medium") return "#fbbf24";
    return "#34d399";
  };

  return (
    <div>
      {/* Header & Quick Action */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "1.5rem",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div>
          <h2 style={{ fontSize: "1.6rem", margin: "0 0 6px" }}>
            📋 Static <span className="gradient-text">Task Manager</span>
          </h2>
          <p style={{ color: "var(--text-secondary)", margin: 0, fontSize: "0.95rem" }}>
            Statically persisted task workflow for coding milestones, college deadlines, and personal goals.
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="btn-primary"
          style={{ fontSize: "0.9rem", padding: "8px 16px" }}
        >
          {showAddForm ? "✕ Close Form" : "➕ Add New Task"}
        </button>
      </div>

      {/* Progress & Stat Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "1rem",
          marginBottom: "1.5rem",
        }}
      >
        <div className="glass-card" style={{ padding: "1.2rem", textAlign: "center" }}>
          <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 600 }}>
            Total Tasks
          </div>
          <div style={{ fontSize: "1.8rem", fontWeight: 800, marginTop: 4, color: "var(--text-primary)" }}>
            {totalCount}
          </div>
        </div>

        <div className="glass-card" style={{ padding: "1.2rem", textAlign: "center" }}>
          <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 600 }}>
            Completed
          </div>
          <div style={{ fontSize: "1.8rem", fontWeight: 800, marginTop: 4, color: "#34d399" }}>
            {completedCount}
          </div>
        </div>

        <div className="glass-card" style={{ padding: "1.2rem", textAlign: "center" }}>
          <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 600 }}>
            In Progress
          </div>
          <div style={{ fontSize: "1.8rem", fontWeight: 800, marginTop: 4, color: "#fbbf24" }}>
            {inProgressCount}
          </div>
        </div>

        <div className="glass-card" style={{ padding: "1.2rem", textAlign: "center" }}>
          <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 600 }}>
            Pending
          </div>
          <div style={{ fontSize: "1.8rem", fontWeight: 800, marginTop: 4, color: "#f87171" }}>
            {todoCount}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="glass-card" style={{ padding: "1rem 1.4rem", marginBottom: "1.5rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 6 }}>
          <span style={{ fontWeight: 600, color: "var(--text-secondary)" }}>Completion Progress</span>
          <span style={{ fontWeight: 700, color: "var(--accent-cyan)" }}>{percentComplete}%</span>
        </div>
        <div style={{ height: 8, background: "rgba(255, 255, 255, 0.08)", borderRadius: 10, overflow: "hidden" }}>
          <div
            style={{
              height: "100%",
              width: `${percentComplete}%`,
              background: "linear-gradient(90deg, #38bdf8 0%, #10b981 100%)",
              transition: "width 0.4s ease",
            }}
          />
        </div>
      </div>

      {/* Add Task Form (Expandable) */}
      {showAddForm && (
        <div className="glass-card" style={{ padding: "1.5rem", marginBottom: "1.5rem" }}>
          <h3 style={{ fontSize: "1.1rem", margin: "0 0 12px" }}>Create New Task</h3>
          <form onSubmit={handleAddTask} style={{ display: "grid", gap: "1rem" }}>
            <div>
              <label style={{ display: "block", fontSize: 12, color: "var(--text-muted)", marginBottom: 4 }}>
                Task Title *
              </label>
              <input
                type="text"
                placeholder="What needs to be done?"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                required
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  background: "rgba(255, 255, 255, 0.05)",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: 8,
                  color: "#f8fafc",
                  fontSize: "0.95rem",
                }}
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
              <div>
                <label style={{ display: "block", fontSize: 12, color: "var(--text-muted)", marginBottom: 4 }}>
                  Category
                </label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "9px 12px",
                    background: "#1e293b",
                    border: "1px solid var(--border-subtle)",
                    borderRadius: 8,
                    color: "#f8fafc",
                    fontSize: "0.9rem",
                  }}
                >
                  <option value="LeetCode">LeetCode</option>
                  <option value="Projects">Projects</option>
                  <option value="College">College</option>
                  <option value="Career">Career</option>
                  <option value="General">General</option>
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: 12, color: "var(--text-muted)", marginBottom: 4 }}>
                  Priority
                </label>
                <select
                  value={newPriority}
                  onChange={(e) => setNewPriority(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "9px 12px",
                    background: "#1e293b",
                    border: "1px solid var(--border-subtle)",
                    borderRadius: 8,
                    color: "#f8fafc",
                    fontSize: "0.9rem",
                  }}
                >
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: 12, color: "var(--text-muted)", marginBottom: 4 }}>
                  Due Date / Target
                </label>
                <input
                  type="text"
                  placeholder="e.g. Today, Tomorrow, Oct 25"
                  value={newDueDate}
                  onChange={(e) => setNewDueDate(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "9px 12px",
                    background: "rgba(255, 255, 255, 0.05)",
                    border: "1px solid var(--border-subtle)",
                    borderRadius: 8,
                    color: "#f8fafc",
                    fontSize: "0.9rem",
                  }}
                />
              </div>
            </div>

            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="btn-secondary"
                style={{ fontSize: "0.88rem" }}
              >
                Cancel
              </button>
              <button type="submit" className="btn-primary" style={{ fontSize: "0.88rem" }}>
                Save Task to Storage
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filter Tabs */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 12,
          marginBottom: "1.2rem",
        }}
      >
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {["all", "todo", "in_progress", "completed"].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              style={{
                padding: "6px 14px",
                borderRadius: 16,
                fontSize: "0.85rem",
                fontWeight: 600,
                cursor: "pointer",
                border: filterStatus === st ? "1px solid var(--accent-cyan)" : "1px solid var(--border-subtle)",
                background: filterStatus === st ? "rgba(56, 189, 248, 0.15)" : "rgba(255, 255, 255, 0.04)",
                color: filterStatus === st ? "var(--accent-cyan)" : "var(--text-secondary)",
                textTransform: "capitalize",
              }}
            >
              {st.replace("_", " ")}
            </button>
          ))}
        </div>

        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          style={{
            padding: "6px 12px",
            background: "#1e293b",
            border: "1px solid var(--border-subtle)",
            borderRadius: 8,
            color: "#f8fafc",
            fontSize: "0.85rem",
          }}
        >
          <option value="all">All Categories</option>
          <option value="LeetCode">LeetCode</option>
          <option value="Projects">Projects</option>
          <option value="College">College</option>
          <option value="Career">Career</option>
        </select>
      </div>

      {/* Task Items List */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "3rem", color: "var(--text-secondary)" }}>
          Loading static tasks...
        </div>
      ) : filteredTasks.length === 0 ? (
        <div
          className="glass-card"
          style={{ padding: "3rem", textAlign: "center", color: "var(--text-secondary)" }}
        >
          No tasks found matching current filters.
        </div>
      ) : (
        <div style={{ display: "grid", gap: 10 }}>
          {filteredTasks.map((task) => {
            const isDone = task.status === "completed";
            const isInProg = task.status === "in_progress";

            return (
              <div
                key={task.id}
                className="glass-card"
                style={{
                  padding: "1rem 1.25rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 14,
                  opacity: isDone ? 0.65 : 1,
                  borderLeft: `4px solid ${getPriorityColor(task.priority)}`,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1 }}>
                  {/* Status clicker */}
                  <button
                    onClick={() => handleUpdateStatus(task.id, task.status)}
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: 6,
                      border: isDone ? "2px solid #10b981" : isInProg ? "2px solid #fbbf24" : "2px solid #64748b",
                      background: isDone ? "#10b981" : isInProg ? "rgba(251, 191, 36, 0.2)" : "transparent",
                      color: isDone ? "#ffffff" : "#fbbf24",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 12,
                      cursor: "pointer",
                      flexShrink: 0,
                    }}
                    title="Click to toggle status (Todo -> In Progress -> Done)"
                  >
                    {isDone ? "✓" : isInProg ? "⏳" : ""}
                  </button>

                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontSize: "0.95rem",
                        fontWeight: 600,
                        color: isDone ? "var(--text-muted)" : "var(--text-primary)",
                        textDecoration: isDone ? "line-through" : "none",
                      }}
                    >
                      {task.title}
                    </div>

                    <div style={{ display: "flex", gap: 8, marginTop: 4, alignItems: "center", flexWrap: "wrap" }}>
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          padding: "1px 6px",
                          borderRadius: 4,
                          background: "rgba(255, 255, 255, 0.06)",
                          color: "#cbd5e1",
                        }}
                      >
                        {task.category}
                      </span>
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          padding: "1px 6px",
                          borderRadius: 4,
                          color: getPriorityColor(task.priority),
                          background: `${getPriorityColor(task.priority)}15`,
                        }}
                      >
                        {task.priority} Priority
                      </span>
                      {task.dueDate && (
                        <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
                          📅 {task.dueDate}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Delete button */}
                <button
                  onClick={() => handleDeleteTask(task.id)}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "#64748b",
                    cursor: "pointer",
                    fontSize: 14,
                    padding: "4px 8px",
                  }}
                  title="Delete task"
                >
                  ✕
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
