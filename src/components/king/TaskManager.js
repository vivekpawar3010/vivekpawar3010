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

  // Dynamic Custom Tracking Fields for the new task
  const [customFields, setCustomFields] = useState([
    { id: "f_num", label: "Problems / Questions Solved", type: "number", target: "5" },
    { id: "f_topics", label: "Topics & Concepts Read", type: "topics", target: "DSA, System Design" },
    { id: "f_notes", label: "Daily Reflection & Small Text", type: "text", target: "Key insights" },
  ]);

  // Per-task daily check-in input states: { [taskId]: { numberDone: '', topics: '', note: '', fieldValues: {} } }
  const [dailyTaskInputs, setDailyTaskInputs] = useState({});
  const [expandedHistoryTaskId, setExpandedHistoryTaskId] = useState(null);

  // Goal edit modal state
  const [editingGoalTaskId, setEditingGoalTaskId] = useState(null);
  const [editGoalValue, setEditGoalValue] = useState(30);

  // Sunday AI Evaluation state
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState(null);
  const [showEvaluationModal, setShowEvaluationModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [statusToast, setStatusToast] = useState(null);

  const todayStr = new Date().toISOString().split("T")[0];
  const isSunday = new Date().getDay() === 0;

  const showToast = (message, type = "success") => {
    setStatusToast({ message, type });
    setTimeout(() => setStatusToast(null), 3800);
  };

  const loadTasksAndEvaluations = useCallback(async () => {
    try {
      const res = await fetch("/api/king/tasks");
      const data = await res.json();
      if (data.tasks) {
        setTasks(data.tasks);
        // Initialize daily inputs from existing task logs if available
        const initialInputs = {};
        data.tasks.forEach((t) => {
          if (t.category === "Streak") {
            const lastLog = Array.isArray(t.history) && t.history.length > 0 ? t.history[t.history.length - 1] : null;
            initialInputs[t.id] = {
              numberDone: lastLog?.numberDone !== undefined ? String(lastLog.numberDone) : "",
              topics: Array.isArray(lastLog?.topics) ? lastLog.topics.join(", ") : "",
              note: t.dailyLog || "",
              fieldValues: lastLog?.fieldValues || {},
            };
          }
        });
        setDailyTaskInputs((prev) => ({ ...initialInputs, ...prev }));
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

  // Dynamic Custom Field Handlers (Task Creation)
  const handleAddField = (type = "number") => {
    const fieldId = `field_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const defaults = {
      number: { label: "Numeric Metric (e.g. Problems Solved)", target: "5" },
      topics: { label: "Topics & Algorithms Read", target: "DP, Graphs" },
      text: { label: "Daily Reflection Note", target: "Notes" },
    };
    setCustomFields((prev) => [
      ...prev,
      {
        id: fieldId,
        label: defaults[type]?.label || "Custom Field",
        type,
        target: defaults[type]?.target || "",
      },
    ]);
  };

  const handleUpdateField = (id, key, val) => {
    setCustomFields((prev) =>
      prev.map((f) => (f.id === id ? { ...f, [key]: val } : f))
    );
  };

  const handleRemoveField = (id) => {
    setCustomFields((prev) => prev.filter((f) => f.id !== id));
  };

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
          fields: newCategory === "Streak" ? customFields : [],
        }),
      });

      const data = await res.json();
      if (data.success && data.tasks) {
        setTasks(data.tasks);
        setNewTitle("");
        setNewDailyLog("");
        setShowAddForm(false);
        showToast(
          newCategory === "Streak"
            ? "🔥 New habit streak task activated with custom tracking fields (Max 5 enforced)!"
            : "📋 General task added successfully!",
          "success"
        );
      } else {
        setFormError(data.error || "Failed to create task.");
      }
    } catch (err) {
      console.error("Error adding task", err);
      setFormError("Network error while adding task.");
    }
  };

  // Check In Streak with dynamic fields, numbers done, topics list & notes
  const handleStreakCheckIn = async (taskId) => {
    const inputData = dailyTaskInputs[taskId] || {};
    const numberDone = inputData.numberDone !== undefined && inputData.numberDone !== "" ? Number(inputData.numberDone) : undefined;
    const topicsList = inputData.topics ? inputData.topics.split(",").map((s) => s.trim()).filter(Boolean) : [];
    const note = inputData.note || "";
    const fieldValues = inputData.fieldValues || {};

    try {
      const res = await fetch("/api/king/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "check_in",
          id: taskId,
          dailyLog: note,
          date: todayStr,
          numberDone,
          topics: topicsList,
          fieldValues,
        }),
      });

      const data = await res.json();
      if (data.success && data.tasks) {
        setTasks(data.tasks);
        showToast(`⚡ Daily streak maintained! +10 weekly points awarded & saved to DB.`, "success");
      } else {
        showToast(data.error || "Failed to check in.", "error");
      }
    } catch (err) {
      console.error("Error checking in streak", err);
      showToast("Network error checking in.", "error");
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
        showToast(`🎯 Target goal days updated to ${editGoalValue} days!`, "success");
      }
    } catch (err) {
      console.error("Error updating goal days", err);
    }
  };

  // Sunday AI Points Evaluation & Reset (Evaluated out of 350 - Never full 350)
  const handleRunSundayEvaluation = async () => {
    if (streakTasks.length === 0) {
      alert("No active streak tasks found to evaluate. Add streak tasks first!");
      return;
    }

    setIsEvaluating(true);
    showToast("🤖 Calculating Sunday evaluation out of 350 points via Gemini AI coach...", "info");

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
        showToast("✅ Sunday points evaluation complete! Evaluated out of 350 (Points reset to 0 for Sunday).", "success");
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
        showToast("🔄 Active weekly streak points reset to 0 for all habits!", "info");
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
      showToast(`Task status moved to ${nextStatus.replace('_', ' ')}.`, "info");
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
      showToast(`🗑️ Task "${title}" deleted.`, "info");
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
      {/* ── Toast Notification Banner ── */}
      {statusToast && (
        <div
          style={{
            position: "fixed",
            top: 24,
            right: 24,
            zIndex: 9999,
            padding: "12px 20px",
            borderRadius: 10,
            fontSize: "0.92rem",
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            gap: 10,
            background:
              statusToast.type === "success"
                ? "rgba(16, 185, 129, 0.95)"
                : statusToast.type === "warning"
                ? "rgba(245, 158, 11, 0.95)"
                : statusToast.type === "info"
                ? "rgba(56, 189, 248, 0.95)"
                : "rgba(244, 63, 94, 0.95)",
            color: "#FFFFFF",
            boxShadow: "0 10px 30px rgba(0, 0, 0, 0.35)",
            animation: "slideInToast 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        >
          <span>{statusToast.message}</span>
        </div>
      )}

      {/* ── Main Header ── */}
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
          <h2 style={{ fontSize: "1.6rem", margin: "0 0 6px", color: "var(--text-primary)" }}>
            ⚡ Streak Engine & <span className="gradient-text">Task Manager</span>
          </h2>
          <p style={{ color: "var(--text-secondary)", margin: 0, fontSize: "0.95rem" }}>
            Track up to 5 daily habit streaks with custom inputs (numbers & topics). Evaluated every Sunday evening out of 350 points.
          </p>
        </div>

        {/* Top Action CTAs */}
        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          {/* Sunday AI Evaluation Button */}
          <button
            onClick={handleRunSundayEvaluation}
            disabled={isEvaluating || streakTasks.length === 0}
            className="btn-lime"
            style={{
              fontSize: "0.88rem",
              padding: "9px 18px",
              opacity: streakTasks.length === 0 ? 0.5 : 1,
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
            }}
            title="Calculate Sunday weekly points out of 350 based on numbers and topics read"
          >
            <span>✨</span>
            {isEvaluating ? "Evaluating Week..." : isSunday ? "Evaluate Sunday Points (out of 350)" : "Evaluate Sunday Points (out of 350)"}
          </button>

          {/* New Task / Streak Trigger Button */}
          <button
            onClick={() => {
              setShowAddForm(!showAddForm);
              setNewCategory(activeTab === "streaks" ? "Streak" : "LeetCode");
            }}
            className="btn-primary"
            style={{ fontSize: "0.88rem", padding: "9px 18px" }}
          >
            {showAddForm ? "Cancel ✕" : activeTab === "streaks" ? "🔥 New Streak Task" : "➕ New Task"}
          </button>
        </div>
      </div>

      {/* ── Sunday Evaluation System Info Banner (350 Points Rule) ── */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "10px 16px",
          borderRadius: 10,
          background: "var(--badge-bg)",
          border: "1px solid var(--border-subtle)",
          marginBottom: "1.5rem",
          flexWrap: "wrap",
          gap: 10,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.88rem" }}>
          <span style={{ fontSize: 18 }}>💡</span>
          <span style={{ color: "var(--text-primary)" }}>
            <strong>Sunday Rubric:</strong> 5 streak tasks everyday = 50 pts/day (10 each). 7 days = 350 max points.
            Strict rule: <em>never full 350 points</em>. Points reset to 0 every Sunday after calculation.
          </span>
        </div>

        {evaluations.length > 0 && (
          <button
            onClick={() => setShowHistoryModal(true)}
            style={{
              background: "transparent",
              border: "none",
              color: "var(--accent-lime)",
              fontSize: "0.84rem",
              fontWeight: 700,
              cursor: "pointer",
              textDecoration: "underline",
              padding: 0,
            }}
          >
            📜 View Past Sunday Reports ({evaluations.length})
          </button>
        )}
      </div>

      {/* ── Mode Switcher (Habit Streaks vs General Tasks) ── */}
      <div
        style={{
          display: "flex",
          gap: 10,
          marginBottom: "1.5rem",
          borderBottom: "1px solid var(--border-subtle)",
          paddingBottom: "0.8rem",
        }}
      >
        <button
          onClick={() => setActiveTab("streaks")}
          style={{
            padding: "8px 18px",
            borderRadius: 8,
            fontSize: "0.95rem",
            fontWeight: 800,
            cursor: "pointer",
            border: "none",
            background: activeTab === "streaks" ? "var(--accent-lime)" : "transparent",
            color: activeTab === "streaks" ? "var(--text-on-accent)" : "var(--text-secondary)",
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            transition: "all 0.2s ease",
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
            fontWeight: 800,
            cursor: "pointer",
            border: "none",
            background: activeTab === "general" ? "var(--accent-lime)" : "transparent",
            color: activeTab === "general" ? "var(--text-on-accent)" : "var(--text-secondary)",
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            transition: "all 0.2s ease",
          }}
        >
          <span>📋</span> General Tasks ({generalTasks.length})
        </button>
      </div>

      {/* ── Add Task Form with Dynamic Custom Fields ── */}
      {showAddForm && (
        <div
          className="glass-card"
          style={{
            padding: "1.6rem",
            marginBottom: "1.8rem",
            borderRadius: 14,
            border: "1.5px solid var(--accent-lime)",
            background: "var(--bg-card)",
            animation: "slideDownFade 0.25s ease-out",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <h3 style={{ fontSize: "1.15rem", margin: 0, fontWeight: 800, color: "var(--text-primary)" }}>
              {newCategory === "Streak" ? "🔥 Activate New Daily Habit Streak" : "📋 Create General Task"}
            </h3>

            {newCategory === "Streak" && (
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  padding: "4px 10px",
                  borderRadius: 12,
                  background: streakTasks.length >= 5 ? "rgba(244, 63, 94, 0.15)" : "var(--badge-bg)",
                  color: streakTasks.length >= 5 ? "#fb7185" : "var(--accent-lime)",
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
                borderRadius: 8,
                marginBottom: "1rem",
                background: "rgba(244, 63, 94, 0.15)",
                border: "1px solid rgba(244, 63, 94, 0.3)",
                color: "#fb7185",
                fontSize: "0.88rem",
              }}
            >
              ⚠️ {formError}
            </div>
          )}

          <form onSubmit={handleAddTask} style={{ display: "grid", gap: "1.2rem" }}>
            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "var(--text-primary)", marginBottom: 6 }}>
                {newCategory === "Streak" ? "Streak / Habit Name *" : "Task Title *"}
              </label>
              <input
                type="text"
                placeholder={
                  newCategory === "Streak"
                    ? "e.g. Daily LeetCode (2 Mediums), System Design & Architecture Reading..."
                    : "e.g. Complete SVERI COE project proposal, Setup Docker container..."
                }
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                required
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  background: "var(--input-bg)",
                  border: "1px solid var(--border-light)",
                  borderRadius: 8,
                  color: "var(--text-primary)",
                  fontSize: "0.95rem",
                }}
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "var(--text-primary)", marginBottom: 6 }}>
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
                    padding: "10px 12px",
                    background: "var(--input-bg)",
                    border: "1px solid var(--border-light)",
                    borderRadius: 8,
                    color: "var(--text-primary)",
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
                  <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "var(--text-primary)", marginBottom: 6 }}>
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
                      padding: "10px 12px",
                      background: "var(--input-bg)",
                      border: "1px solid var(--border-light)",
                      borderRadius: 8,
                      color: "var(--text-primary)",
                      fontSize: "0.9rem",
                    }}
                  />
                </div>
              ) : (
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "var(--text-primary)", marginBottom: 6 }}>
                    Due Date / Target
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Today, Tomorrow, Oct 31"
                    value={newDueDate}
                    onChange={(e) => setNewDueDate(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      background: "var(--input-bg)",
                      border: "1px solid var(--border-light)",
                      borderRadius: 8,
                      color: "var(--text-primary)",
                      fontSize: "0.9rem",
                    }}
                  />
                </div>
              )}

              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "var(--text-primary)", marginBottom: 6 }}>
                  Priority
                </label>
                <select
                  value={newPriority}
                  onChange={(e) => setNewPriority(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    background: "var(--input-bg)",
                    border: "1px solid var(--border-light)",
                    borderRadius: 8,
                    color: "var(--text-primary)",
                    fontSize: "0.9rem",
                  }}
                >
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>
            </div>

            {/* ═══════════════════════════════════════════════════════════════════
                DYNAMIC CUSTOM FIELDS BUILDER (Any number of fields)
            ════════════════════════════════════════════════════════════════════ */}
            {newCategory === "Streak" && (
              <div
                style={{
                  padding: "1.2rem",
                  borderRadius: 10,
                  background: "var(--bg-surface)",
                  border: "1px solid var(--border-subtle)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, flexWrap: "wrap", gap: 8 }}>
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 800, color: "var(--text-primary)", display: "block" }}>
                      ⚙️ Custom Tracking Fields (Admin can add any number of input fields)
                    </label>
                    <span style={{ fontSize: 11, color: "var(--text-secondary)" }}>
                      Every day to maintain your streak, you will enter the numbers done, topics read, and notes.
                    </span>
                  </div>

                  <div style={{ display: "flex", gap: 6 }}>
                    <button
                      type="button"
                      onClick={() => handleAddField("number")}
                      style={{
                        padding: "5px 10px",
                        fontSize: 11,
                        borderRadius: 6,
                        border: "1px solid var(--border-subtle)",
                        background: "var(--badge-bg)",
                        color: "var(--accent-lime)",
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                    >
                      + Add Number Count
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddField("topics")}
                      style={{
                        padding: "5px 10px",
                        fontSize: 11,
                        borderRadius: 6,
                        border: "1px solid var(--border-subtle)",
                        background: "var(--badge-bg)",
                        color: "var(--accent-lime)",
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                    >
                      + Add Topics List
                    </button>
                  </div>
                </div>

                <div style={{ display: "grid", gap: 8, marginTop: 8 }}>
                  {customFields.map((field, idx) => (
                    <div
                      key={field.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        padding: "6px 10px",
                        background: "var(--bg-base)",
                        borderRadius: 8,
                        border: "1px solid var(--border-subtle)",
                        flexWrap: "wrap",
                      }}
                    >
                      <span style={{ fontSize: 11, fontWeight: 800, color: "var(--accent-lime)", width: 22 }}>
                        #{idx + 1}
                      </span>

                      {/* Field Label Input */}
                      <input
                        type="text"
                        placeholder="Field Name (e.g. Problems Solved, Topics Read)"
                        value={field.label}
                        onChange={(e) => handleUpdateField(field.id, "label", e.target.value)}
                        style={{
                          flex: 2,
                          minWidth: 160,
                          padding: "6px 10px",
                          background: "var(--input-bg)",
                          border: "1px solid var(--border-light)",
                          borderRadius: 6,
                          color: "var(--text-primary)",
                          fontSize: "0.85rem",
                        }}
                      />

                      {/* Field Type Select */}
                      <select
                        value={field.type}
                        onChange={(e) => handleUpdateField(field.id, "type", e.target.value)}
                        style={{
                          flex: 1,
                          minWidth: 110,
                          padding: "6px 8px",
                          background: "var(--input-bg)",
                          border: "1px solid var(--border-light)",
                          borderRadius: 6,
                          color: "var(--text-primary)",
                          fontSize: "0.82rem",
                        }}
                      >
                        <option value="number">🔢 Number Count</option>
                        <option value="topics">🏷️ Topics List</option>
                        <option value="text">✍️ Small Text / Reflection</option>
                      </select>

                      {/* Field Target / Unit */}
                      <input
                        type="text"
                        placeholder="Target (e.g. 5, DP/Trees)"
                        value={field.target || ""}
                        onChange={(e) => handleUpdateField(field.id, "target", e.target.value)}
                        style={{
                          flex: 1,
                          minWidth: 100,
                          padding: "6px 8px",
                          background: "var(--input-bg)",
                          border: "1px solid var(--border-light)",
                          borderRadius: 6,
                          color: "var(--text-primary)",
                          fontSize: "0.82rem",
                        }}
                      />

                      {/* Delete Field */}
                      <button
                        type="button"
                        onClick={() => handleRemoveField(field.id)}
                        style={{
                          background: "transparent",
                          border: "none",
                          color: "#f43f5e",
                          cursor: "pointer",
                          fontSize: 14,
                          padding: "4px 8px",
                        }}
                        title="Remove field"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 4 }}>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="btn-secondary"
                style={{ fontSize: "0.88rem", padding: "8px 16px" }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={newCategory === "Streak" && streakTasks.length >= 5}
                className="btn-lime"
                style={{
                  fontSize: "0.88rem",
                  padding: "8px 20px",
                  opacity: newCategory === "Streak" && streakTasks.length >= 5 ? 0.5 : 1,
                }}
              >
                {newCategory === "Streak" ? "🔥 Activate Streak (Max 5)" : "Save Task to Storage"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════
          TAB 1: HABIT STREAKS VIEW (Max 5 Tasks, Custom Inputs, Daily Entry)
      ════════════════════════════════════════════════════════════════════════ */}
      {activeTab === "streaks" && (
        <div>
          {/* Header row with reset & count */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "1rem",
              flexWrap: "wrap",
              gap: 8,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <h3 style={{ fontSize: "1.15rem", margin: 0, fontWeight: 800, color: "var(--text-primary)" }}>
                Active Habit Streaks
              </h3>
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 800,
                  padding: "2px 8px",
                  borderRadius: 12,
                  background: "var(--badge-bg)",
                  color: "var(--accent-lime)",
                  border: "1px solid var(--border-subtle)",
                }}
              >
                Streaks: {streakTasks.length} / 5
              </span>
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={handleResetWeeklyPoints}
                style={{
                  background: "transparent",
                  border: "1px solid var(--border-subtle)",
                  color: "var(--text-secondary)",
                  fontSize: "0.8rem",
                  fontWeight: 700,
                  padding: "4px 10px",
                  borderRadius: 6,
                  cursor: "pointer",
                }}
                title="Reset active weekly streak points to 0"
              >
                🔄 Reset Weekly Pts to 0
              </button>
            </div>
          </div>

          {/* Streak Task Cards Grid */}
          {streakTasks.length === 0 ? (
            <div
              className="glass-card"
              style={{
                padding: "3rem 1.5rem",
                textAlign: "center",
                borderRadius: 14,
                background: "var(--bg-card)",
              }}
            >
              <div style={{ fontSize: 42, marginBottom: 12 }}>🔥</div>
              <h4 style={{ fontSize: "1.2rem", margin: "0 0 6px", color: "var(--text-primary)" }}>
                No Habit Streaks Active Yet
              </h4>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", maxWidth: 440, margin: "0 auto 1.4rem" }}>
                Activate your 5 daily streak tasks. Maintain them daily with numbers completed and topics read for Sunday point calculation.
              </p>
              <button
                onClick={() => {
                  setNewCategory("Streak");
                  setShowAddForm(true);
                }}
                className="btn-lime"
                style={{ fontSize: "0.9rem", padding: "10px 22px" }}
              >
                ➕ Create First Habit Streak
              </button>
            </div>
          ) : (
            <div style={{ display: "grid", gap: "1.4rem" }}>
              {streakTasks.map((task) => {
                const currentStreak = task.currentStreak || 0;
                const goalDays = Number(task.goalDays) || 30;
                const bestStreak = task.bestStreak || currentStreak;
                const percent = Math.min(100, Math.round((currentStreak / goalDays) * 100));
                const isCheckedToday = task.lastCheckedDate === todayStr;
                const isExpanded = expandedHistoryTaskId === task.id;
                const historyList = Array.isArray(task.history) ? task.history : [];
                const configuredFields = Array.isArray(task.fields) && task.fields.length > 0 ? task.fields : [
                  { id: "f_num", label: "Problems Solved", type: "number", target: "5" },
                  { id: "f_topics", label: "Topics Read", type: "topics", target: "DSA" },
                  { id: "f_notes", label: "Daily Notes", type: "text", target: "Notes" },
                ];

                const currentInput = dailyTaskInputs[task.id] || {
                  numberDone: "",
                  topics: "",
                  note: task.dailyLog || "",
                  fieldValues: {},
                };

                return (
                  <div
                    key={task.id}
                    className="glass-card"
                    style={{
                      padding: "1.5rem",
                      borderRadius: 14,
                      border: isCheckedToday
                        ? "1.5px solid var(--accent-secondary)"
                        : "1px solid var(--border-subtle)",
                      background: "var(--bg-card)",
                      boxShadow: isCheckedToday ? "0 4px 20px var(--shadow-card)" : "none",
                      transition: "all 0.25s ease",
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
                          <span style={{ fontSize: 24 }}>🔥</span>
                          <h4 style={{ fontSize: "1.2rem", margin: 0, fontWeight: 800, color: "var(--text-primary)" }}>
                            {task.title}
                          </h4>
                          {isCheckedToday && (
                            <span
                              style={{
                                fontSize: 11,
                                fontWeight: 800,
                                padding: "3px 10px",
                                borderRadius: 12,
                                background: "rgba(16, 185, 129, 0.15)",
                                color: "#10b981",
                                border: "1px solid rgba(16, 185, 129, 0.3)",
                              }}
                            >
                              ✓ Maintained Today (+10 pts)
                            </span>
                          )}
                        </div>

                        <div style={{ display: "flex", gap: 14, marginTop: 8, flexWrap: "wrap", alignItems: "center" }}>
                          <span style={{ fontSize: "0.92rem", color: "var(--accent-brand)", fontWeight: 800 }}>
                            🔥 Streak: {currentStreak} Days
                          </span>
                          <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                            🏆 Best: {bestStreak} Days
                          </span>
                          <span style={{ fontSize: "0.85rem", color: "var(--accent-lime)", fontWeight: 700 }}>
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
                              color: "var(--text-secondary)",
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
                          <div style={{ fontSize: 11, color: "var(--text-secondary)", textTransform: "uppercase", fontWeight: 700 }}>
                            Weekly Points
                          </div>
                          <div style={{ fontSize: "1.2rem", fontWeight: 900, color: "var(--accent-brand)" }}>
                            ⚡ {task.weeklyPoints || 0} pts
                          </div>
                        </div>

                        <button
                          onClick={() => handleDeleteTask(task.id, task.title)}
                          style={{
                            background: "rgba(244, 63, 94, 0.08)",
                            border: "1px solid rgba(244, 63, 94, 0.25)",
                            color: "#f43f5e",
                            borderRadius: 6,
                            cursor: "pointer",
                            fontSize: 13,
                            padding: "6px 10px",
                            fontWeight: 700,
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
                        <span style={{ fontWeight: 800, color: percent >= 100 ? "#10b981" : "var(--accent-brand)" }}>
                          {percent}% {percent >= 100 ? "🎉 Completed!" : ""}
                        </span>
                      </div>
                      <div
                        style={{
                          height: 8,
                          background: "var(--border-subtle)",
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
                                : "var(--aura-glow)",
                            transition: "width 0.4s ease",
                          }}
                        />
                      </div>
                    </div>

                    {/* Inline Goal Editor Modal */}
                    {editingGoalTaskId === task.id && (
                      <div
                        style={{
                          padding: "10px 14px",
                          marginBottom: 14,
                          background: "var(--bg-surface)",
                          border: "1.5px solid var(--accent-lime)",
                          borderRadius: 8,
                          display: "flex",
                          alignItems: "center",
                          gap: 12,
                          flexWrap: "wrap",
                        }}
                      >
                        <span style={{ fontSize: 13, color: "var(--text-primary)", fontWeight: 700 }}>
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
                            background: "var(--input-bg)",
                            border: "1px solid var(--border-light)",
                            borderRadius: 6,
                            color: "var(--text-primary)",
                            fontSize: "0.9rem",
                          }}
                        />
                        <button
                          onClick={() => handleSaveGoalDays(task.id)}
                          className="btn-lime"
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

                    {/* ═══════════════════════════════════════════════════════════════
                        DAILY CHECK-IN WITH CONFIGURED CUSTOM FIELDS
                    ════════════════════════════════════════════════════════════════ */}
                    <div
                      style={{
                        padding: "1.2rem",
                        background: "var(--bg-surface)",
                        borderRadius: 12,
                        border: "1px solid var(--border-subtle)",
                        display: "grid",
                        gap: 10,
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 6 }}>
                        <label style={{ fontSize: 12, fontWeight: 800, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: 6 }}>
                          <span>✍️</span> Today&apos;s Streak Entry & Input Fields:
                        </label>
                        <span style={{ fontSize: 11, color: "var(--text-secondary)" }}>
                          Last check-in: <strong>{task.lastCheckedDate || "None"}</strong>
                        </span>
                      </div>

                      {/* Dynamic Inputs configured for this task */}
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 10 }}>
                        {configuredFields.map((field) => {
                          if (field.type === "number") {
                            return (
                              <div key={field.id}>
                                <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--text-secondary)", marginBottom: 4 }}>
                                  🔢 {field.label} {field.target ? `(Target: ${field.target})` : ""}
                                </label>
                                <input
                                  type="number"
                                  placeholder="Enter number (e.g. 5)"
                                  value={currentInput.numberDone}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setDailyTaskInputs((prev) => ({
                                      ...prev,
                                      [task.id]: {
                                        ...(prev[task.id] || {}),
                                        numberDone: val,
                                        fieldValues: {
                                          ...(prev[task.id]?.fieldValues || {}),
                                          [field.id]: val,
                                        },
                                      },
                                    }));
                                  }}
                                  style={{
                                    width: "100%",
                                    padding: "8px 12px",
                                    background: "var(--input-bg)",
                                    border: "1px solid var(--border-light)",
                                    borderRadius: 6,
                                    color: "var(--text-primary)",
                                    fontSize: "0.88rem",
                                  }}
                                />
                              </div>
                            );
                          }

                          if (field.type === "topics") {
                            return (
                              <div key={field.id} style={{ gridColumn: "1 / -1" }}>
                                <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--text-secondary)", marginBottom: 4 }}>
                                  🏷️ {field.label} (Comma-separated list of topics/concepts read today)
                                </label>
                                <input
                                  type="text"
                                  placeholder="e.g. Dynamic Programming, Dijkstra Graph BFS, Memory Management"
                                  value={currentInput.topics}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setDailyTaskInputs((prev) => ({
                                      ...prev,
                                      [task.id]: {
                                        ...(prev[task.id] || {}),
                                        topics: val,
                                        fieldValues: {
                                          ...(prev[task.id]?.fieldValues || {}),
                                          [field.id]: val,
                                        },
                                      },
                                    }));
                                  }}
                                  style={{
                                    width: "100%",
                                    padding: "8px 12px",
                                    background: "var(--input-bg)",
                                    border: "1px solid var(--border-light)",
                                    borderRadius: 6,
                                    color: "var(--text-primary)",
                                    fontSize: "0.88rem",
                                  }}
                                />
                              </div>
                            );
                          }

                          return (
                            <div key={field.id} style={{ gridColumn: "1 / -1" }}>
                              <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--text-secondary)", marginBottom: 4 }}>
                                ✍️ {field.label} (Small text / reflection notes)
                              </label>
                              <input
                                type="text"
                                placeholder="Save small text: reflections, breakthroughs, concepts learned..."
                                value={currentInput.note}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setDailyTaskInputs((prev) => ({
                                    ...prev,
                                    [task.id]: {
                                      ...(prev[task.id] || {}),
                                      note: val,
                                      fieldValues: {
                                        ...(prev[task.id]?.fieldValues || {}),
                                        [field.id]: val,
                                      },
                                    },
                                  }));
                                }}
                                style={{
                                  width: "100%",
                                  padding: "8px 12px",
                                  background: "var(--input-bg)",
                                  border: "1px solid var(--border-light)",
                                  borderRadius: 6,
                                  color: "var(--text-primary)",
                                  fontSize: "0.88rem",
                                }}
                              />
                            </div>
                          );
                        })}
                      </div>

                      {/* Submit Daily Check-in Button */}
                      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 4 }}>
                        <button
                          type="button"
                          onClick={() => handleStreakCheckIn(task.id)}
                          className="btn-lime"
                          style={{
                            padding: "9px 20px",
                            fontSize: "0.88rem",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 6,
                          }}
                        >
                          <span>⚡</span>
                          {isCheckedToday ? "Update Today's Entry" : "Maintain Streak & Save to DB (+10 pts)"}
                        </button>
                      </div>
                    </div>

                    {/* History Expand Toggle */}
                    {historyList.length > 0 && (
                      <div style={{ marginTop: 12 }}>
                        <button
                          type="button"
                          onClick={() => setExpandedHistoryTaskId(isExpanded ? null : task.id)}
                          style={{
                            background: "transparent",
                            border: "none",
                            color: "var(--text-secondary)",
                            cursor: "pointer",
                            fontSize: 12,
                            fontWeight: 700,
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                            padding: 0,
                          }}
                        >
                          <span>{isExpanded ? "▲" : "▼"}</span>
                          <span>
                            {isExpanded ? "Hide" : "Show"} Logged History ({historyList.length} check-in entries)
                          </span>
                        </button>

                        {isExpanded && (
                          <div
                            style={{
                              marginTop: 10,
                              padding: "10px 14px",
                              borderRadius: 8,
                              background: "var(--bg-surface)",
                              border: "1px solid var(--border-subtle)",
                              display: "grid",
                              gap: 8,
                              maxHeight: 220,
                              overflowY: "auto",
                            }}
                          >
                            {historyList
                              .slice()
                              .reverse()
                              .map((entry, idx) => (
                                <div
                                  key={idx}
                                  style={{
                                    fontSize: "0.82rem",
                                    padding: "6px 8px",
                                    borderBottom: "1px solid var(--border-subtle)",
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: 3,
                                  }}
                                >
                                  <div style={{ display: "flex", justifyContent: "space-between", color: "var(--accent-lime)", fontWeight: 700 }}>
                                    <span>📅 {entry.date}</span>
                                    {entry.numberDone !== undefined && (
                                      <span>Count: {entry.numberDone}</span>
                                    )}
                                  </div>

                                  {Array.isArray(entry.topics) && entry.topics.length > 0 && (
                                    <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginTop: 2 }}>
                                      {entry.topics.map((top, tIdx) => (
                                        <span
                                          key={tIdx}
                                          style={{
                                            fontSize: 10,
                                            padding: "1px 6px",
                                            borderRadius: 8,
                                            background: "var(--badge-bg)",
                                            color: "var(--text-primary)",
                                            border: "1px solid var(--border-subtle)",
                                          }}
                                        >
                                          {top}
                                        </span>
                                      ))}
                                    </div>
                                  )}

                                  {entry.note && (
                                    <div style={{ color: "var(--text-secondary)", fontStyle: "italic", marginTop: 2 }}>
                                      &ldquo;{entry.note}&rdquo;
                                    </div>
                                  )}
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

      {/* ═══════════════════════════════════════════════════════════════════════
          TAB 2: GENERAL WORKFLOW TASKS
      ════════════════════════════════════════════════════════════════════════ */}
      {activeTab === "general" && (
        <div>
          {/* Filter Bar */}
          <div
            style={{
              display: "flex",
              gap: 12,
              marginBottom: "1.2rem",
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <div>
              <label style={{ fontSize: 11, color: "var(--text-secondary)", fontWeight: 700, marginRight: 6 }}>
                Status:
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                style={{
                  padding: "6px 10px",
                  borderRadius: 6,
                  background: "var(--bg-card)",
                  border: "1px solid var(--border-subtle)",
                  color: "var(--text-primary)",
                  fontSize: "0.85rem",
                }}
              >
                <option value="all">All</option>
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: 11, color: "var(--text-secondary)", fontWeight: 700, marginRight: 6 }}>
                Category:
              </label>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                style={{
                  padding: "6px 10px",
                  borderRadius: 6,
                  background: "var(--bg-card)",
                  border: "1px solid var(--border-subtle)",
                  color: "var(--text-primary)",
                  fontSize: "0.85rem",
                }}
              >
                <option value="all">All</option>
                <option value="LeetCode">LeetCode / DSA</option>
                <option value="Projects">Projects</option>
                <option value="College">College</option>
                <option value="Career">Career</option>
                <option value="General">General</option>
              </select>
            </div>
          </div>

          {/* General Tasks List */}
          {filteredGeneralTasks.length === 0 ? (
            <div className="glass-card" style={{ padding: "2rem", textAlign: "center", borderRadius: 12 }}>
              <div style={{ color: "var(--text-secondary)" }}>No general tasks found for this filter.</div>
            </div>
          ) : (
            <div style={{ display: "grid", gap: 10 }}>
              {filteredGeneralTasks.map((task) => (
                <div
                  key={task.id}
                  className="glass-card"
                  style={{
                    padding: "1rem 1.2rem",
                    borderRadius: 10,
                    background: "var(--bg-card)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 12,
                    border: "1px solid var(--border-subtle)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1 }}>
                    <button
                      type="button"
                      onClick={() => handleUpdateStatus(task.id, task.status)}
                      style={{
                        width: 22,
                        height: 22,
                        borderRadius: "50%",
                        border: `2px solid ${task.status === "completed" ? "#10b981" : "var(--border-subtle)"}`,
                        background: task.status === "completed" ? "#10b981" : "transparent",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#fff",
                        fontSize: 12,
                        fontWeight: 900,
                      }}
                      title="Click to cycle status: To Do -> In Progress -> Completed"
                    >
                      {task.status === "completed" ? "✓" : ""}
                    </button>

                    <div>
                      <div
                        style={{
                          fontSize: "0.95rem",
                          fontWeight: 700,
                          color: task.status === "completed" ? "var(--text-secondary)" : "var(--text-primary)",
                          textDecoration: task.status === "completed" ? "line-through" : "none",
                        }}
                      >
                        {task.title}
                      </div>
                      <div style={{ display: "flex", gap: 10, fontSize: 11, color: "var(--text-secondary)", marginTop: 2 }}>
                        <span>📂 {task.category}</span>
                        <span>•</span>
                        <span>🎯 {task.dueDate || "No due date"}</span>
                        <span>•</span>
                        <span style={{ color: getPriorityColor(task.priority), fontWeight: 700 }}>
                          {task.priority} Priority
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDeleteTask(task.id, task.title)}
                    style={{
                      background: "transparent",
                      border: "none",
                      color: "var(--text-secondary)",
                      cursor: "pointer",
                      fontSize: 14,
                      padding: "4px 8px",
                    }}
                    title="Delete task"
                  >
                    🗑️
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════
          MODAL 1: SUNDAY EVALUATION REPORT (350 Points System)
      ════════════════════════════════════════════════════════════════════════ */}
      {showEvaluationModal && evaluationResult && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.75)",
            backdropFilter: "blur(6px)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem",
          }}
        >
          <div
            className="glass-card"
            style={{
              width: "min(640px, 94vw)",
              maxHeight: "90vh",
              overflowY: "auto",
              padding: "2rem",
              borderRadius: 16,
              background: "var(--bg-card)",
              border: "2px solid var(--accent-lime)",
              animation: "slideDownFade 0.25s ease-out",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
              <div>
                <h3 style={{ fontSize: "1.35rem", margin: 0, fontWeight: 900, color: "var(--text-primary)" }}>
                  🏆 Sunday Weekly Performance Report
                </h3>
                <p style={{ margin: "4px 0 0", fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                  Evaluated on Sunday evening based on numbers logged and topics read (Out of 350 points)
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowEvaluationModal(false)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "var(--text-secondary)",
                  fontSize: 20,
                  cursor: "pointer",
                  padding: 4,
                }}
              >
                ✕
              </button>
            </div>

            {/* Score Banner (350 Points Ceiling) */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "1.2rem",
                borderRadius: 12,
                background: "var(--bg-surface)",
                border: "1.5px solid var(--accent-lime)",
                marginBottom: 16,
                flexWrap: "wrap",
                gap: 12,
              }}
            >
              <div>
                <div style={{ fontSize: 12, color: "var(--text-secondary)", textTransform: "uppercase", fontWeight: 700 }}>
                  Weekly Score (Out of 350)
                </div>
                <div style={{ fontSize: "2.5rem", fontWeight: 900, color: "var(--text-primary)" }}>
                  {evaluationResult.totalWeeklyPoints}{" "}
                  <span style={{ fontSize: "1.1rem", color: "var(--text-secondary)" }}>
                    / 350 pts ({evaluationResult.percentage}%)
                  </span>
                </div>
                <div style={{ fontSize: 11, color: "var(--accent-brand)", marginTop: 4, fontWeight: 600 }}>
                  ⚡ Strict Rule Enforced: Never full 350 points awarded. Points reset to 0 for Sunday!
                </div>
              </div>

              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 14,
                  background: getGradeBadgeColor(evaluationResult.grade),
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "2rem",
                  fontWeight: 900,
                  color: "#ffffff",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
                }}
              >
                {evaluationResult.grade}
              </div>
            </div>

            {/* AI Review Summary */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: "var(--text-primary)", marginBottom: 6 }}>
                AI Coach Assessment:
              </div>
              <div
                style={{
                  fontSize: "0.92rem",
                  lineHeight: 1.6,
                  color: "var(--text-primary)",
                  padding: "12px 14px",
                  borderRadius: 8,
                  background: "var(--bg-surface)",
                  border: "1px solid var(--border-subtle)",
                }}
              >
                {evaluationResult.summaryReview}
              </div>
            </div>

            {/* Per-Task Breakdown (Out of 70 pts each) */}
            {Array.isArray(evaluationResult.perTaskBreakdown) && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: "var(--text-primary)", marginBottom: 6 }}>
                  Per-Streak Breakdown (70 pts max each):
                </div>
                <div style={{ display: "grid", gap: 8 }}>
                  {evaluationResult.perTaskBreakdown.map((item, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: "10px 12px",
                        borderRadius: 8,
                        background: "var(--bg-surface)",
                        border: "1px solid var(--border-subtle)",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: 10,
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--text-primary)" }}>
                          {item.taskTitle}
                        </div>
                        <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginTop: 2 }}>
                          {item.numbersLogged && <span>📊 {item.numbersLogged} &bull; </span>}
                          {item.topicsRead && <span>🏷️ {item.topicsRead}</span>}
                        </div>
                        {item.verdict && (
                          <div style={{ fontSize: "0.78rem", color: "var(--text-secondary)", fontStyle: "italic", marginTop: 2 }}>
                            {item.verdict}
                          </div>
                        )}
                      </div>

                      <div style={{ fontWeight: 800, color: "var(--accent-lime)", fontSize: "1rem" }}>
                        ⚡ {item.points} / 70 pts
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button
                type="button"
                onClick={() => setShowEvaluationModal(false)}
                className="btn-lime"
                style={{ padding: "8px 20px", fontSize: "0.9rem" }}
              >
                Done ✓
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════
          MODAL 2: PAST SUNDAY EVALUATIONS ARCHIVE
      ════════════════════════════════════════════════════════════════════════ */}
      {showHistoryModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.75)",
            backdropFilter: "blur(6px)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem",
          }}
        >
          <div
            className="glass-card"
            style={{
              width: "min(600px, 94vw)",
              maxHeight: "85vh",
              overflowY: "auto",
              padding: "1.8rem",
              borderRadius: 14,
              background: "var(--bg-card)",
              border: "1px solid var(--border-subtle)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h3 style={{ fontSize: "1.2rem", margin: 0, fontWeight: 800, color: "var(--text-primary)" }}>
                📜 Past Sunday Evaluation Archives
              </h3>
              <button
                type="button"
                onClick={() => setShowHistoryModal(false)}
                style={{ background: "transparent", border: "none", color: "var(--text-secondary)", fontSize: 18, cursor: "pointer" }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: "grid", gap: 10 }}>
              {evaluations.map((ev, idx) => (
                <div
                  key={ev.id || idx}
                  style={{
                    padding: "12px",
                    borderRadius: 8,
                    background: "var(--bg-surface)",
                    border: "1px solid var(--border-subtle)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                      {new Date(ev.date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" })}
                    </div>
                    <div style={{ fontSize: "0.95rem", fontWeight: 800, color: "var(--text-primary)", marginTop: 2 }}>
                      Score: {ev.totalWeeklyPoints} / 350 ({ev.percentage || Math.round((ev.totalWeeklyPoints / 350) * 100)}%)
                    </div>
                  </div>

                  <span
                    style={{
                      padding: "4px 10px",
                      borderRadius: 8,
                      background: getGradeBadgeColor(ev.grade),
                      color: "#fff",
                      fontWeight: 800,
                      fontSize: "0.9rem",
                    }}
                  >
                    Grade {ev.grade}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slideInToast {
          from {
            opacity: 0;
            transform: translateY(-12px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        @keyframes slideDownFade {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
