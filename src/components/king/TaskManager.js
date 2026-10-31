"use client";

import { useEffect, useState, useCallback, useMemo } from "react";

export default function TaskManager() {
  const [tasks, setTasks] = useState([]);
  const [evaluations, setEvaluations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("streaks"); // 'streaks' | 'general'
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");

  // New task form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState("Streak");
  const [newPriority, setNewPriority] = useState("High");
  const [newDueDate, setNewDueDate] = useState("Today");
  const [newGoalDays, setNewGoalDays] = useState(30);
  const [newDailyLog, setNewDailyLog] = useState("");
  const [formError, setFormError] = useState("");

  // Daily log inputs per streak task
  const [dailyLogInputs, setDailyLogInputs] = useState({});
  const [expandedHistoryTaskId, setExpandedHistoryTaskId] = useState(null);

  // Goal edit modal state
  const [editingGoalTaskId, setEditingGoalTaskId] = useState(null);
  const [editGoalValue, setEditGoalValue] = useState(30);

  // Sunday AI Evaluation state
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState(null);
  const [showEvaluationModal, setShowEvaluationModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  const todayStr = new Date().toISOString().split("T")[0];
  const isSunday = new Date().getDay() === 0;

  const loadTasksAndEvaluations = useCallback(async () => {
    try {
      const res = await fetch("/api/king/tasks");
      const data = await res.json();
      if (data.tasks) {
        setTasks(data.tasks);
        // Initialize daily log inputs from current task logs if empty
        const initialLogs = {};
        data.tasks.forEach((t) => {
          if (t.category === "Streak" && t.dailyLog) {
            initialLogs[t.id] = t.dailyLog;
          }
        });
        setDailyLogInputs((prev) => ({ ...initialLogs, ...prev }));
      }
      if (data.evaluations) {
        setEvaluations(data.evaluations);
      }
    } catch (err) {
      console.error("Failed to load tasks and evaluations", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTasksAndEvaluations();
  }, [loadTasksAndEvaluations]);

  // Derived streak tasks and general tasks
  const streakTasks = useMemo(() => {
    return tasks.filter((t) => t.category === "Streak");
  }, [tasks]);

  const generalTasks = useMemo(() => {
    return tasks.filter((t) => t.category !== "Streak");
  }, [tasks]);

  // Add Task handler
  const handleAddTask = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!newTitle.trim()) {
      setFormError("Task title is required.");
      return;
    }

    if (newCategory === "Streak" && streakTasks.length >= 5) {
      setFormError("Maximum 5 Habit Streaks allowed. Please delete or complete an existing streak first.");
      return;
    }

    try {
      const res = await fetch("/api/king/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "add",
          title: newTitle.trim(),
          category: newCategory,
          priority: newPriority,
          dueDate: newCategory === "Streak" ? `${newGoalDays}-Day Goal` : newDueDate,
          goalDays: newCategory === "Streak" ? Number(newGoalDays) || 30 : undefined,
          dailyLog: newCategory === "Streak" ? newDailyLog.trim() : undefined,
        }),
      });

      const data = await res.json();
      if (data.success && data.tasks) {
        setTasks(data.tasks);
        setNewTitle("");
        setNewDailyLog("");
        setShowAddForm(false);
        setStatusMessage(
          newCategory === "Streak"
            ? "🔥 New habit streak task activated (Max 5 enforced)!"
            : "📋 General task added successfully!"
        );
        setTimeout(() => setStatusMessage(""), 3500);
      } else {
        setFormError(data.error || "Failed to create task.");
      }
    } catch (err) {
      console.error("Error adding task", err);
      setFormError("Network error while adding task.");
    }
  };

  // Check In Streak with daily text log
  const handleStreakCheckIn = async (taskId) => {
    const logText = dailyLogInputs[taskId] || "";
    try {
      const res = await fetch("/api/king/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "check_in",
          id: taskId,
          dailyLog: logText,
          date: todayStr,
        }),
      });

      const data = await res.json();
      if (data.success && data.tasks) {
        setTasks(data.tasks);
        setStatusMessage(`⚡ Check-in saved for today! +15 weekly points awarded.`);
        setTimeout(() => setStatusMessage(""), 3500);
      }
    } catch (err) {
      console.error("Error checking in streak", err);
    }
  };

  // Update Streak Goal Days
  const handleSaveGoalDays = async (taskId) => {
    try {
      const res = await fetch("/api/king/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_goal",
          id: taskId,
          goalDays: Number(editGoalValue),
        }),
      });

      const data = await res.json();
      if (data.success && data.tasks) {
        setTasks(data.tasks);
        setEditingGoalTaskId(null);
        setStatusMessage(`🎯 Target goal days updated to ${editGoalValue} days!`);
        setTimeout(() => setStatusMessage(""), 3500);
      }
    } catch (err) {
      console.error("Error updating goal days", err);
    }
  };

  // Sunday Gemini AI Points Evaluation & Reset
  const handleRunSundayEvaluation = async () => {
    if (streakTasks.length === 0) {
      alert("No active streak tasks found to evaluate. Add streak tasks first!");
      return;
    }

    setIsEvaluating(true);
    setStatusMessage("🤖 Contacting Gemini AI to evaluate consistency, daily logs, and weekly points...");

    try {
      const res = await fetch("/api/king/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "evaluate_sunday_points",
        }),
      });

      const data = await res.json();
      if (data.success && data.evaluation) {
        setEvaluationResult(data.evaluation);
        setShowEvaluationModal(true);
        if (data.tasks) {
          setTasks(data.tasks);
        }
        // Refresh evaluations list
        const evalsRes = await fetch("/api/king/tasks");
        const evalsData = await evalsRes.json();
        if (evalsData.evaluations) {
          setEvaluations(evalsData.evaluations);
        }
        setStatusMessage("✅ Sunday evaluation complete! Active weekly points reset to 0 for Sunday.");
        setTimeout(() => setStatusMessage(""), 4000);
      } else {
        alert(data.error || "Failed to run Sunday AI evaluation.");
      }
    } catch (err) {
      console.error("Error running Sunday evaluation:", err);
      alert("Network error running Sunday evaluation.");
    } finally {
      setIsEvaluating(false);
    }
  };

  // Reset Weekly Points to Zero manually
  const handleResetWeeklyPoints = async () => {
    if (!confirm("Are you sure you want to reset all active weekly streak points to 0?")) {
      return;
    }
    try {
      const res = await fetch("/api/king/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reset_weekly_points" }),
      });
      const data = await res.json();
      if (data.success && data.tasks) {
        setTasks(data.tasks);
        setStatusMessage("🔄 Weekly streak points reset to 0 for all habits!");
        setTimeout(() => setStatusMessage(""), 3000);
      }
    } catch (err) {
      console.error("Error resetting weekly points", err);
    }
  };

  // Update Status for general tasks
  const handleUpdateStatus = async (id, currentStatus) => {
    const nextStatusMap = {
      todo: "in_progress",
      in_progress: "completed",
      completed: "todo",
    };
    const nextStatus = nextStatusMap[currentStatus] || "todo";

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
      loadTasksAndEvaluations();
    }
  };

  // Delete Task
  const handleDeleteTask = async (id, title) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;

    setTasks((prev) => prev.filter((t) => t.id !== id));
    try {
      await fetch("/api/king/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete", id }),
      });
      setStatusMessage("Task deleted.");
      setTimeout(() => setStatusMessage(""), 2500);
    } catch (err) {
      console.error("Error deleting task", err);
      loadTasksAndEvaluations();
    }
  };

  // General tasks filtering
  const filteredGeneralTasks = generalTasks.filter((t) => {
    const matchStatus = filterStatus === "all" || t.status === filterStatus;
    const matchCategory = filterCategory === "all" || t.category === filterCategory;
    return matchStatus && matchCategory;
  });

  const getPriorityColor = (p) => {
    if (p === "High") return "#f43f5e";
    if (p === "Medium") return "#fbbf24";
    return "#34d399";
  };

  const getGradeBadgeColor = (grade) => {
    if (grade === "S") return "linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)";
    if (grade === "A+") return "linear-gradient(135deg, #10b981 0%, #06b6d4 100%)";
    if (grade === "A") return "linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)";
    if (grade === "B") return "linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)";
    return "#64748b";
  };

  return (
    <div>
      {/* ── Main Header ── */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "1.5rem",
          flexWrap: "wrap",
          gap: 14,
        }}
      >
        <div>
          <h2 style={{ fontSize: "1.7rem", margin: "0 0 6px", fontWeight: 800 }}>
            ⚡ Streak Engine & <span className="gradient-text">Task Manager</span>
          </h2>
          <p style={{ color: "var(--text-secondary)", margin: 0, fontSize: "0.95rem" }}>
            Habit streak tracking (cap 5 tasks) with daily reflections, goal milestones, and Sunday Gemini AI weekly points evaluation.
          </p>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {activeTab === "streaks" && (
            <button
              onClick={handleRunSundayEvaluation}
              disabled={isEvaluating}
              className="btn-primary"
              style={{
                fontSize: "0.9rem",
                padding: "8px 16px",
                background: "linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)",
                border: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                opacity: isEvaluating ? 0.7 : 1,
              }}
              title="Calculate weekly points with Gemini AI and reset weekly points to 0"
            >
              <span>{isEvaluating ? "⏳" : "🤖"}</span>
              {isEvaluating ? "Gemini AI Evaluating..." : "Sunday Gemini AI Points"}
            </button>
          )}

          <button
            onClick={() => {
              setShowAddForm(!showAddForm);
              if (!showAddForm) {
                setNewCategory(activeTab === "streaks" ? "Streak" : "LeetCode");
                setFormError("");
              }
            }}
            className="btn-primary"
            style={{ fontSize: "0.9rem", padding: "8px 16px" }}
          >
            {showAddForm ? "✕ Close Form" : "➕ Add Task"}
          </button>
        </div>
      </div>

      {/* ── Status Message Alert ── */}
      {statusMessage && (
        <div
          style={{
            padding: "10px 16px",
            marginBottom: "1.5rem",
            borderRadius: 8,
            fontSize: "0.9rem",
            fontWeight: 600,
            background: "rgba(56, 189, 248, 0.15)",
            border: "1px solid rgba(56, 189, 248, 0.3)",
            color: "var(--accent-cyan)",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <span>ℹ️</span> {statusMessage}
        </div>
      )}

      {/* ── Top Mode Switcher (Habit Streaks vs General Tasks) ── */}
      <div
        style={{
          display: "flex",
          gap: 12,
          borderBottom: "1px solid var(--border-subtle)",
          paddingBottom: "0.8rem",
          marginBottom: "1.5rem",
          flexWrap: "wrap",
        }}
      >
        <button
          onClick={() => setActiveTab("streaks")}
          style={{
            padding: "8px 18px",
            borderRadius: 8,
            fontSize: "0.95rem",
            fontWeight: 700,
            cursor: "pointer",
            border: activeTab === "streaks" ? "1px solid #f97316" : "1px solid transparent",
            background: activeTab === "streaks" ? "rgba(249, 115, 22, 0.15)" : "transparent",
            color: activeTab === "streaks" ? "#fb923c" : "var(--text-secondary)",
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            transition: "all 0.15s ease",
          }}
        >
          <span>🔥</span> Daily Habit Streaks ({streakTasks.length} / 5)
        </button>

        <button
          onClick={() => setActiveTab("general")}
          style={{
            padding: "8px 18px",
            borderRadius: 8,
            fontSize: "0.95rem",
            fontWeight: 700,
            cursor: "pointer",
            border: activeTab === "general" ? "1px solid var(--accent-cyan)" : "1px solid transparent",
            background: activeTab === "general" ? "rgba(56, 189, 248, 0.15)" : "transparent",
            color: activeTab === "general" ? "var(--accent-cyan)" : "var(--text-secondary)",
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            transition: "all 0.15s ease",
          }}
        >
          <span>📋</span> General Tasks & Milestones ({generalTasks.length})
        </button>
      </div>

      {/* ── Add Task Form (Expandable) ── */}
      {showAddForm && (
        <div className="glass-card" style={{ padding: "1.5rem", marginBottom: "1.8rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <h3 style={{ fontSize: "1.15rem", margin: 0, fontWeight: 700 }}>
              {newCategory === "Streak" ? "🔥 Activate New Daily Habit Streak" : "📋 Create General Task"}
            </h3>
            {newCategory === "Streak" && (
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  padding: "3px 10px",
                  borderRadius: 20,
                  background: streakTasks.length >= 5 ? "rgba(244, 63, 94, 0.2)" : "rgba(16, 185, 129, 0.2)",
                  color: streakTasks.length >= 5 ? "#f43f5e" : "#10b981",
                }}
              >
                Streak Slots: {streakTasks.length} / 5 active
              </span>
            )}
          </div>

          {formError && (
            <div
              style={{
                padding: "8px 12px",
                marginBottom: 14,
                borderRadius: 6,
                background: "rgba(244, 63, 94, 0.15)",
                border: "1px solid rgba(244, 63, 94, 0.3)",
                color: "#fb7185",
                fontSize: "0.88rem",
              }}
            >
              ⚠️ {formError}
            </div>
          )}

          <form onSubmit={handleAddTask} style={{ display: "grid", gap: "1rem" }}>
            <div>
              <label style={{ display: "block", fontSize: 12, color: "var(--text-muted)", marginBottom: 4 }}>
                {newCategory === "Streak" ? "Streak / Habit Name *" : "Task Title *"}
              </label>
              <input
                type="text"
                placeholder={
                  newCategory === "Streak"
                    ? "e.g. Daily LeetCode 2 Mediums, 30 Mins System Design Reading..."
                    : "e.g. Complete SVERI COE project proposal, Setup Docker container..."
                }
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
                  onChange={(e) => {
                    setNewCategory(e.target.value);
                    setFormError("");
                  }}
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
                  <option value="Streak">🔥 Streak (Habit Tracking - Max 5)</option>
                  <option value="LeetCode">LeetCode / DSA</option>
                  <option value="Projects">Projects</option>
                  <option value="College">College / SVERI</option>
                  <option value="Career">Career / Prep</option>
                  <option value="General">General</option>
                </select>
              </div>

              {newCategory === "Streak" ? (
                <div>
                  <label style={{ display: "block", fontSize: 12, color: "var(--text-muted)", marginBottom: 4 }}>
                    Target Goal (Days to follow) 🎯
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="365"
                    value={newGoalDays}
                    onChange={(e) => setNewGoalDays(e.target.value)}
                    required
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
              ) : (
                <div>
                  <label style={{ display: "block", fontSize: 12, color: "var(--text-muted)", marginBottom: 4 }}>
                    Due Date / Target
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Today, Tomorrow, Oct 31"
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
              )}

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
            </div>

            {newCategory === "Streak" && (
              <div>
                <label style={{ display: "block", fontSize: 12, color: "var(--text-muted)", marginBottom: 4 }}>
                  First Daily Log / Reflection Note (Optional space to save text)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Started Day 1 commitment, reviewed graph theory templates..."
                  value={newDailyLog}
                  onChange={(e) => setNewDailyLog(e.target.value)}
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
            )}

            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 4 }}>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="btn-secondary"
                style={{ fontSize: "0.88rem" }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={newCategory === "Streak" && streakTasks.length >= 5}
                className="btn-primary"
                style={{
                  fontSize: "0.88rem",
                  opacity: newCategory === "Streak" && streakTasks.length >= 5 ? 0.5 : 1,
                }}
              >
                {newCategory === "Streak" ? "🔥 Activate Streak (Max 5)" : "Save Task to Storage"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────────────── */}
      {/* ── TAB 1: STREAKS ENGINE & SUNDAY GEMINI AI POINTS (MAX 5 TASKS) ────────── */}
      {/* ─────────────────────────────────────────────────────────────────────────── */}
      {activeTab === "streaks" && (
        <div>
          {/* Sunday Evaluation Control Bar */}
          <div
            className="glass-card"
            style={{
              padding: "1.2rem 1.5rem",
              marginBottom: "1.5rem",
              border: isSunday ? "1px solid rgba(236, 72, 153, 0.4)" : "1px solid var(--border-subtle)",
              background: isSunday
                ? "linear-gradient(135deg, rgba(236, 72, 153, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)"
                : "rgba(255, 255, 255, 0.02)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 12,
              }}
            >
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 18 }}>{isSunday ? "🌟" : "📅"}</span>
                  <span style={{ fontWeight: 700, fontSize: "1rem", color: "var(--text-primary)" }}>
                    {isSunday ? "Sunday Weekly AI Scoring Window Active!" : "Sunday Gemini AI Points & Reset"}
                  </span>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      padding: "2px 8px",
                      borderRadius: 12,
                      background: streakTasks.length >= 5 ? "rgba(239, 68, 68, 0.2)" : "rgba(16, 185, 129, 0.2)",
                      color: streakTasks.length >= 5 ? "#f87171" : "#34d399",
                    }}
                  >
                    Streaks: {streakTasks.length} / 5
                  </span>
                </div>
                <p style={{ margin: "4px 0 0", fontSize: "0.86rem", color: "var(--text-secondary)" }}>
                  Clicking the Sunday evaluation sends saved daily reflection logs to the Gemini API, calculates consistency points, and resets weekly points to 0 for the upcoming week.
                </p>
              </div>

              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {evaluations.length > 0 && (
                  <button
                    onClick={() => setShowHistoryModal(true)}
                    className="btn-secondary"
                    style={{ fontSize: "0.85rem", padding: "6px 14px" }}
                  >
                    📜 Past Evaluations ({evaluations.length})
                  </button>
                )}

                <button
                  onClick={handleResetWeeklyPoints}
                  style={{
                    padding: "6px 14px",
                    borderRadius: 8,
                    fontSize: "0.85rem",
                    fontWeight: 600,
                    cursor: "pointer",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    background: "rgba(255, 255, 255, 0.04)",
                    color: "var(--text-secondary)",
                  }}
                  title="Manually reset active weekly points to 0"
                >
                  🔄 Reset Weekly Pts
                </button>
              </div>
            </div>
          </div>

          {/* Streak Task Cards Grid */}
          {loading ? (
            <div style={{ textAlign: "center", padding: "3rem", color: "var(--text-secondary)" }}>
              Loading habit streaks...
            </div>
          ) : streakTasks.length === 0 ? (
            <div
              className="glass-card"
              style={{ padding: "3rem", textAlign: "center", color: "var(--text-secondary)" }}
            >
              <div style={{ fontSize: 36, marginBottom: 12 }}>🔥</div>
              <h3 style={{ fontSize: "1.2rem", color: "var(--text-primary)", margin: "0 0 8px" }}>
                No Habit Streaks Active Yet
              </h3>
              <p style={{ margin: "0 0 16px", fontSize: "0.92rem" }}>
                You can create up to 5 habit streaks with target goal days (e.g. 30, 60, 100 days) and daily reflection logs.
              </p>
              <button
                onClick={() => {
                  setNewCategory("Streak");
                  setShowAddForm(true);
                }}
                className="btn-primary"
                style={{ fontSize: "0.9rem" }}
              >
                ➕ Create First Habit Streak
              </button>
            </div>
          ) : (
            <div style={{ display: "grid", gap: "1.2rem" }}>
              {streakTasks.map((task) => {
                const currentStreak = task.currentStreak || 0;
                const goalDays = Number(task.goalDays) || 30;
                const bestStreak = task.bestStreak || currentStreak;
                const percent = Math.min(100, Math.round((currentStreak / goalDays) * 100));
                const isCheckedToday = task.lastCheckedDate === todayStr;
                const isExpanded = expandedHistoryTaskId === task.id;
                const historyList = Array.isArray(task.history) ? task.history : [];

                return (
                  <div
                    key={task.id}
                    className="glass-card"
                    style={{
                      padding: "1.4rem",
                      borderRadius: 14,
                      border: isCheckedToday
                        ? "1px solid rgba(16, 185, 129, 0.4)"
                        : "1px solid rgba(249, 115, 22, 0.3)",
                      background: isCheckedToday
                        ? "linear-gradient(180deg, rgba(16, 185, 129, 0.05) 0%, rgba(15, 23, 42, 0.4) 100%)"
                        : "linear-gradient(180deg, rgba(249, 115, 22, 0.04) 0%, rgba(15, 23, 42, 0.4) 100%)",
                    }}
                  >
                    {/* Top Row: Title, Streaks, Goal, Delete */}
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        flexWrap: "wrap",
                        gap: 12,
                        marginBottom: 12,
                      }}
                    >
                      <div style={{ flex: 1, minWidth: 260 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                          <span style={{ fontSize: 22 }}>🔥</span>
                          <h4 style={{ fontSize: "1.15rem", margin: 0, fontWeight: 700, color: "#f8fafc" }}>
                            {task.title}
                          </h4>
                          {isCheckedToday && (
                            <span
                              style={{
                                fontSize: 11,
                                fontWeight: 700,
                                padding: "2px 8px",
                                borderRadius: 12,
                                background: "rgba(16, 185, 129, 0.2)",
                                color: "#34d399",
                              }}
                            >
                              ✓ Checked in today
                            </span>
                          )}
                        </div>

                        <div style={{ display: "flex", gap: 14, marginTop: 8, flexWrap: "wrap", alignItems: "center" }}>
                          <span style={{ fontSize: "0.9rem", color: "#fb923c", fontWeight: 700 }}>
                            🔥 Streak: {currentStreak} Days
                          </span>
                          <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                            🏆 Best: {bestStreak} Days
                          </span>
                          <span style={{ fontSize: "0.85rem", color: "#38bdf8", fontWeight: 600 }}>
                            🎯 Goal: {goalDays} Days
                          </span>
                          <button
                            onClick={() => {
                              setEditingGoalTaskId(task.id);
                              setEditGoalValue(goalDays);
                            }}
                            style={{
                              background: "transparent",
                              border: "none",
                              color: "var(--accent-cyan)",
                              cursor: "pointer",
                              fontSize: 11,
                              textDecoration: "underline",
                              padding: 0,
                            }}
                          >
                            ✏️ Edit Goal
                          </button>
                        </div>
                      </div>

                      {/* Points badge & delete */}
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={{ textAlign: "right" }}>
                          <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase" }}>
                            Weekly Points
                          </div>
                          <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "#fbbf24" }}>
                            ⚡ {task.weeklyPoints || 0} pts
                          </div>
                        </div>

                        <button
                          onClick={() => handleDeleteTask(task.id, task.title)}
                          style={{
                            background: "rgba(255, 255, 255, 0.05)",
                            border: "1px solid var(--border-subtle)",
                            color: "#94a3b8",
                            borderRadius: 6,
                            cursor: "pointer",
                            fontSize: 13,
                            padding: "6px 10px",
                          }}
                          title="Delete streak task"
                        >
                          ✕
                        </button>
                      </div>
                    </div>

                    {/* Goal Progress Bar */}
                    <div style={{ marginBottom: 14 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 5 }}>
                        <span style={{ color: "var(--text-secondary)" }}>
                          Goal Milestone Progress: {currentStreak} / {goalDays} Days
                        </span>
                        <span style={{ fontWeight: 700, color: percent >= 100 ? "#34d399" : "#fb923c" }}>
                          {percent}% {percent >= 100 ? "🎉 Completed!" : ""}
                        </span>
                      </div>
                      <div
                        style={{
                          height: 8,
                          background: "rgba(255, 255, 255, 0.08)",
                          borderRadius: 8,
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            height: "100%",
                            width: `${percent}%`,
                            background:
                              percent >= 100
                                ? "linear-gradient(90deg, #10b981 0%, #06b6d4 100%)"
                                : "linear-gradient(90deg, #f97316 0%, #fbbf24 100%)",
                            transition: "width 0.4s ease",
                          }}
                        />
                      </div>
                    </div>

                    {/* Inline Goal Editor Modal / Dropdown */}
                    {editingGoalTaskId === task.id && (
                      <div
                        style={{
                          padding: "10px 14px",
                          marginBottom: 14,
                          background: "rgba(15, 23, 42, 0.8)",
                          border: "1px solid var(--accent-cyan)",
                          borderRadius: 8,
                          display: "flex",
                          alignItems: "center",
                          gap: 12,
                          flexWrap: "wrap",
                        }}
                      >
                        <span style={{ fontSize: 13, color: "var(--text-primary)", fontWeight: 600 }}>
                          Set Target Goal Days:
                        </span>
                        <input
                          type="number"
                          min="1"
                          max="365"
                          value={editGoalValue}
                          onChange={(e) => setEditGoalValue(e.target.value)}
                          style={{
                            width: 80,
                            padding: "6px 8px",
                            background: "#1e293b",
                            border: "1px solid var(--border-subtle)",
                            borderRadius: 6,
                            color: "#fff",
                            fontSize: "0.9rem",
                          }}
                        />
                        <button
                          onClick={() => handleSaveGoalDays(task.id)}
                          className="btn-primary"
                          style={{ fontSize: "0.82rem", padding: "5px 12px" }}
                        >
                          Save Goal
                        </button>
                        <button
                          onClick={() => setEditingGoalTaskId(null)}
                          className="btn-secondary"
                          style={{ fontSize: "0.82rem", padding: "5px 10px" }}
                        >
                          Cancel
                        </button>
                      </div>
                    )}

                    {/* Daily Reflection / Small Text Space & Check-in */}
                    <div
                      style={{
                        padding: "12px 14px",
                        background: "rgba(0, 0, 0, 0.25)",
                        borderRadius: 10,
                        border: "1px solid var(--border-subtle)",
                        display: "flex",
                        flexDirection: "column",
                        gap: 10,
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 6 }}>
                        <label style={{ fontSize: 12, fontWeight: 700, color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: 6 }}>
                          <span>✍️</span> Today&apos;s Daily Log & Reflection Space:
                        </label>
                        <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
                          Last check-in: {task.lastCheckedDate || "None"}
                        </span>
                      </div>

                      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                        <input
                          type="text"
                          placeholder="Save small text: problems solved, concepts learned, or daily technical notes..."
                          value={dailyLogInputs[task.id] !== undefined ? dailyLogInputs[task.id] : task.dailyLog || ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            setDailyLogInputs((prev) => ({ ...prev, [task.id]: val }));
                          }}
                          style={{
                            flex: 1,
                            minWidth: 240,
                            padding: "9px 12px",
                            background: "rgba(255, 255, 255, 0.05)",
                            border: "1px solid var(--border-subtle)",
                            borderRadius: 8,
                            color: "#f8fafc",
                            fontSize: "0.88rem",
                          }}
                        />

                        <button
                          onClick={() => handleStreakCheckIn(task.id)}
                          style={{
                            padding: "9px 18px",
                            borderRadius: 8,
                            fontSize: "0.88rem",
                            fontWeight: 700,
                            cursor: "pointer",
                            border: "none",
                            background: isCheckedToday
                              ? "rgba(16, 185, 129, 0.2)"
                              : "linear-gradient(135deg, #f97316 0%, #fbbf24 100%)",
                            color: isCheckedToday ? "#34d399" : "#0f172a",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 6,
                            transition: "all 0.15s ease",
                          }}
                        >
                          {isCheckedToday ? "✓ Update Log" : "⚡ Check In (+15 pts)"}
                        </button>
                      </div>
                    </div>

                    {/* History Expand Toggle */}
                    {historyList.length > 0 && (
                      <div style={{ marginTop: 10 }}>
                        <button
                          onClick={() => setExpandedHistoryTaskId(isExpanded ? null : task.id)}
                          style={{
                            background: "transparent",
                            border: "none",
                            color: "var(--text-muted)",
                            cursor: "pointer",
                            fontSize: 12,
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 6,
                            padding: "4px 0",
                          }}
                        >
                          <span>{isExpanded ? "▲ Hide History" : "▼ View Daily History"}</span>
                          <span>({historyList.length} logs recorded)</span>
                        </button>

                        {isExpanded && (
                          <div
                            style={{
                              marginTop: 8,
                              maxHeight: 180,
                              overflowY: "auto",
                              background: "rgba(0, 0, 0, 0.3)",
                              padding: "10px 14px",
                              borderRadius: 8,
                              display: "grid",
                              gap: 6,
                            }}
                          >
                            {historyList.slice(-10).reverse().map((item, idx) => (
                              <div
                                key={item.id || idx}
                                style={{
                                  fontSize: 12,
                                  display: "flex",
                                  justifyContent: "space-between",
                                  padding: "4px 0",
                                  borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
                                }}
                              >
                                <span style={{ color: "#fb923c", fontWeight: 600 }}>{item.date}:</span>
                                <span style={{ color: "var(--text-secondary)", flex: 1, marginLeft: 8 }}>
                                  {item.note}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────────────── */}
      {/* ── TAB 2: GENERAL WORKFLOW TASKS ────────────────────────────────────────── */}
      {/* ─────────────────────────────────────────────────────────────────────────── */}
      {activeTab === "general" && (
        <div>
          {/* Progress & Stat Cards */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
              gap: "1rem",
              marginBottom: "1.5rem",
            }}
          >
            <div className="glass-card" style={{ padding: "1.1rem", textAlign: "center" }}>
              <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 600 }}>
                Total Tasks
              </div>
              <div style={{ fontSize: "1.7rem", fontWeight: 800, marginTop: 4, color: "var(--text-primary)" }}>
                {generalTasks.length}
              </div>
            </div>

            <div className="glass-card" style={{ padding: "1.1rem", textAlign: "center" }}>
              <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 600 }}>
                Completed
              </div>
              <div style={{ fontSize: "1.7rem", fontWeight: 800, marginTop: 4, color: "#34d399" }}>
                {generalTasks.filter((t) => t.status === "completed").length}
              </div>
            </div>

            <div className="glass-card" style={{ padding: "1.1rem", textAlign: "center" }}>
              <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 600 }}>
                In Progress
              </div>
              <div style={{ fontSize: "1.7rem", fontWeight: 800, marginTop: 4, color: "#fbbf24" }}>
                {generalTasks.filter((t) => t.status === "in_progress").length}
              </div>
            </div>

            <div className="glass-card" style={{ padding: "1.1rem", textAlign: "center" }}>
              <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 600 }}>
                Pending
              </div>
              <div style={{ fontSize: "1.7rem", fontWeight: 800, marginTop: 4, color: "#f87171" }}>
                {generalTasks.filter((t) => t.status === "todo").length}
              </div>
            </div>
          </div>

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
              <option value="LeetCode">LeetCode / DSA</option>
              <option value="Projects">Projects</option>
              <option value="College">College</option>
              <option value="Career">Career</option>
              <option value="General">General</option>
            </select>
          </div>

          {/* General Task Items List */}
          {loading ? (
            <div style={{ textAlign: "center", padding: "3rem", color: "var(--text-secondary)" }}>
              Loading tasks...
            </div>
          ) : filteredGeneralTasks.length === 0 ? (
            <div
              className="glass-card"
              style={{ padding: "3rem", textAlign: "center", color: "var(--text-secondary)" }}
            >
              No general tasks found matching current filters.
            </div>
          ) : (
            <div style={{ display: "grid", gap: 10 }}>
              {filteredGeneralTasks.map((task) => {
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

                    <button
                      onClick={() => handleDeleteTask(task.id, task.title)}
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
      )}

      {/* ─────────────────────────────────────────────────────────────────────────── */}
      {/* ── MODAL: SUNDAY GEMINI AI EVALUATION SCORECARD ─────────────────────────── */}
      {/* ─────────────────────────────────────────────────────────────────────────── */}
      {showEvaluationModal && evaluationResult && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(10, 15, 30, 0.85)",
            backdropFilter: "blur(8px)",
            zIndex: 100,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1.5rem",
          }}
          onClick={() => setShowEvaluationModal(false)}
        >
          <div
            className="glass-card"
            style={{
              maxWidth: 620,
              width: "100%",
              maxHeight: "90vh",
              overflowY: "auto",
              padding: "2rem",
              borderRadius: 16,
              border: "1px solid rgba(236, 72, 153, 0.4)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
              <div>
                <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "#ec4899" }}>
                  🤖 Sunday Gemini AI Evaluation
                </span>
                <h3 style={{ fontSize: "1.4rem", margin: "4px 0 0", fontWeight: 800 }}>
                  Weekly Consistency Scorecard
                </h3>
              </div>
              <button
                onClick={() => setShowEvaluationModal(false)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#94a3b8",
                  fontSize: 20,
                  cursor: "pointer",
                }}
              >
                ✕
              </button>
            </div>

            {/* Score & Grade Banner */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "1.2rem",
                borderRadius: 12,
                background: "rgba(255, 255, 255, 0.04)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                marginBottom: 16,
              }}
            >
              <div>
                <div style={{ fontSize: 12, color: "var(--text-muted)", textTransform: "uppercase" }}>
                  Total Sunday Score
                </div>
                <div style={{ fontSize: "2.4rem", fontWeight: 900, color: "#f8fafc" }}>
                  {evaluationResult.totalWeeklyPoints}{" "}
                  <span style={{ fontSize: "1rem", color: "var(--text-muted)" }}>/ 100 pts</span>
                </div>
              </div>

              <div
                style={{
                  width: 60,
                  height: 60,
                  borderRadius: 12,
                  background: getGradeBadgeColor(evaluationResult.grade),
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1.8rem",
                  fontWeight: 900,
                  color: "#ffffff",
                  boxShadow: "0 4px 20px rgba(236, 72, 153, 0.4)",
                }}
              >
                {evaluationResult.grade}
              </div>
            </div>

            {/* AI Review Summary */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-secondary)", marginBottom: 6 }}>
                AI Coach Assessment:
              </div>
              <div
                style={{
                  fontSize: "0.92rem",
                  lineHeight: 1.6,
                  color: "#e2e8f0",
                  padding: "10px 14px",
                  borderRadius: 8,
                  background: "rgba(0, 0, 0, 0.3)",
                }}
              >
                {evaluationResult.summaryReview}
              </div>
            </div>

            {/* Per-Task Breakdown */}
            {Array.isArray(evaluationResult.perTaskBreakdown) && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-secondary)", marginBottom: 6 }}>
                  Per-Streak Breakdown:
                </div>
                <div style={{ display: "grid", gap: 8 }}>
                  {evaluationResult.perTaskBreakdown.map((item, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: "8px 12px",
                        borderRadius: 8,
                        background: "rgba(255, 255, 255, 0.03)",
                        border: "1px solid var(--border-subtle)",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: 12,
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: "0.9rem", color: "#f8fafc" }}>
                          {item.taskTitle}
                        </div>
                        <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: 2 }}>
                          {item.verdict}
                        </div>
                      </div>
                      <div style={{ fontWeight: 800, color: "#fbbf24", fontSize: "0.95rem" }}>
                        +{item.points} pts
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Key Wins */}
            {Array.isArray(evaluationResult.keyWins) && (
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-secondary)", marginBottom: 6 }}>
                  Key Consistency Wins:
                </div>
                <ul style={{ margin: 0, paddingLeft: 20, fontSize: "0.88rem", color: "#cbd5e1", lineHeight: 1.6 }}>
                  {evaluationResult.keyWins.map((win, idx) => (
                    <li key={idx}>{win}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Sunday Reset Confirmation Notice */}
            <div
              style={{
                padding: "10px 14px",
                borderRadius: 8,
                background: "rgba(16, 185, 129, 0.15)",
                border: "1px solid rgba(16, 185, 129, 0.3)",
                color: "#34d399",
                fontSize: "0.85rem",
                marginBottom: 16,
              }}
            >
              ✓ Active weekly points have been reset to 0 for Sunday. Total points accumulated to lifetime records.
            </div>

            <button
              onClick={() => setShowEvaluationModal(false)}
              className="btn-primary"
              style={{ width: "100%", padding: "10px", fontSize: "0.95rem" }}
            >
              Done & Start Fresh Week 🚀
            </button>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────────────── */}
      {/* ── MODAL: EVALUATION HISTORY ARCHIVE ────────────────────────────────────── */}
      {/* ─────────────────────────────────────────────────────────────────────────── */}
      {showHistoryModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(10, 15, 30, 0.85)",
            backdropFilter: "blur(8px)",
            zIndex: 100,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1.5rem",
          }}
          onClick={() => setShowHistoryModal(false)}
        >
          <div
            className="glass-card"
            style={{
              maxWidth: 650,
              width: "100%",
              maxHeight: "85vh",
              overflowY: "auto",
              padding: "2rem",
              borderRadius: 16,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h3 style={{ fontSize: "1.3rem", margin: 0, fontWeight: 800 }}>
                📜 Sunday Gemini AI Archive ({evaluations.length})
              </h3>
              <button
                onClick={() => setShowHistoryModal(false)}
                style={{ background: "transparent", border: "none", color: "#94a3b8", fontSize: 20, cursor: "pointer" }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: "grid", gap: 14 }}>
              {evaluations.map((ev) => (
                <div
                  key={ev.id}
                  style={{
                    padding: "1rem",
                    borderRadius: 10,
                    background: "rgba(255, 255, 255, 0.03)",
                    border: "1px solid var(--border-subtle)",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                    <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
                      📅 {new Date(ev.date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" })}
                    </span>
                    <span
                      style={{
                        padding: "2px 8px",
                        borderRadius: 8,
                        fontSize: 12,
                        fontWeight: 800,
                        background: getGradeBadgeColor(ev.grade),
                        color: "#fff",
                      }}
                    >
                      Grade {ev.grade} ({ev.totalWeeklyPoints} pts)
                    </span>
                  </div>
                  <div style={{ fontSize: "0.88rem", color: "#cbd5e1", lineHeight: 1.5 }}>
                    {ev.summaryReview}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
