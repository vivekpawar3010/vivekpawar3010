"use client";

import { useEffect, useState, useCallback, useMemo, useRef } from "react";

export default function TaskManager() {
  const [tasks, setTasks] = useState([]);
  const [evaluations, setEvaluations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("streaks"); // 'streaks' | 'general'
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");

  // Expanded task ID for one-line accordion (only expanded card shows details)
  const [expandedTaskId, setExpandedTaskId] = useState(null);

  // New task form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState("General");
  const [newPriority, setNewPriority] = useState("High");
  const [newDueDate, setNewDueDate] = useState("Today");
  const [newGoalDays, setNewGoalDays] = useState(30);
  const [formError, setFormError] = useState("");

  // Per-task daily check-in input states: { [taskId]: { numberDone: '', topics: '', note: '', nextDayQueue: '', fieldValues: {} } }
  const [dailyTaskInputs, setDailyTaskInputs] = useState({});
  const [expandedHistoryTaskId, setExpandedHistoryTaskId] = useState(null);

  // Goal edit modal state
  const [editingGoalTaskId, setEditingGoalTaskId] = useState(null);
  const [editGoalValue, setEditGoalValue] = useState(30);

  // Affirmation & Environment Lock-In Modal state
  const [affirmationModalHabit, setAffirmationModalHabit] = useState(null);
  const [envChecklist, setEnvChecklist] = useState({
    notebook: false,
    phoneAway: false,
    distractionsClosed: false,
    musicPlaying: false,
  });

  // Built-in Focus Countdown Timer state per task: { [taskId]: { totalSec: 600, remSec: 600, isRunning: false } }
  const [taskTimers, setTaskTimers] = useState({});
  const timerIntervalRef = useRef(null);

  // 7-Day Reward Modal state
  const [rewardModalHabit, setRewardModalHabit] = useState(null);

  // Add Master Topic inline state
  const [newTopicInput, setNewTopicInput] = useState({});

  // Sunday AI Evaluation state
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState(null);
  const [showEvaluationModal, setShowEvaluationModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [statusToast, setStatusToast] = useState(null);

  const todayStr = new Date().toISOString().split("T")[0];

  const showToast = (message, type = "success") => {
    setStatusToast({ message, type });
    setTimeout(() => setStatusToast(null), 4000);
  };

  // ── Web Audio API Harmonic Completion Chime ────────────────────────────────
  const playFocusCompleteChime = useCallback(() => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6 arpeggio
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.16);
        gain.gain.setValueAtTime(0.25, ctx.currentTime + idx * 0.16);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.16 + 0.6);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.16);
        osc.stop(ctx.currentTime + idx * 0.16 + 0.65);
      });
    } catch (e) {
      console.warn("Chime playback error:", e);
    }
  }, []);

  // ── Voice Affirmation Synthesizer ──────────────────────────────────────────
  const speakAffirmation = (text) => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      utterance.pitch = 1.05;
      window.speechSynthesis.speak(utterance);
    }
  };

  // ── Load Tasks and Evaluations ─────────────────────────────────────────────
  const loadTasksAndEvaluations = useCallback(async () => {
    try {
      const res = await fetch("/api/king/tasks");
      const data = await res.json();
      if (data.tasks) {
        setTasks(data.tasks);
        const initialInputs = {};
        const initialTimers = {};
        data.tasks.forEach((t) => {
          if (t.category === "Streak") {
            const lastLog = Array.isArray(t.history) && t.history.length > 0 ? t.history[t.history.length - 1] : null;
            initialInputs[t.id] = {
              numberDone: lastLog?.numberDone !== undefined ? String(lastLog.numberDone) : "",
              topics: Array.isArray(lastLog?.topics) ? lastLog.topics.join(", ") : "",
              note: t.dailyLog || "",
              nextDayQueue: t.nextDayQueue || "",
              fieldValues: lastLog?.fieldValues || {},
            };
            const defaultSec = (Number(t.timerMinutes) || 10) * 60;
            initialTimers[t.id] = {
              totalSec: defaultSec,
              remSec: defaultSec,
              isRunning: false,
            };
          }
        });
        setDailyTaskInputs((prev) => ({ ...initialInputs, ...prev }));
        setTaskTimers((prev) => {
          const merged = { ...initialTimers };
          Object.keys(prev).forEach((k) => {
            if (prev[k]?.isRunning) merged[k] = prev[k];
          });
          return merged;
        });
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

  // ── Global Countdown Timer Tick ───────────────────────────────────────────
  useEffect(() => {
    timerIntervalRef.current = setInterval(() => {
      setTaskTimers((prev) => {
        let hasChanges = false;
        const next = { ...prev };

        Object.keys(next).forEach((taskId) => {
          const tState = next[taskId];
          if (tState && tState.isRunning) {
            hasChanges = true;
            if (tState.remSec <= 1) {
              next[taskId] = {
                ...tState,
                remSec: 0,
                isRunning: false,
              };
              playFocusCompleteChime();
              showToast("🎯 Focus Block Complete! Great intensity. Enter what you done today.", "success");
            } else {
              next[taskId] = {
                ...tState,
                remSec: tState.remSec - 1,
              };
            }
          }
        });

        return hasChanges ? next : prev;
      });
    }, 1000);

    return () => clearInterval(timerIntervalRef.current);
  }, [playFocusCompleteChime]);

  // ── Filtered streak tasks & general tasks ─────────────────────────────────
  const streakTasks = useMemo(() => {
    return tasks.filter((t) => t.category === "Streak");
  }, [tasks]);

  const generalTasks = useMemo(() => {
    return tasks.filter((t) => t.category !== "Streak");
  }, [tasks]);

  const totalWeeklyPoints = useMemo(() => {
    return streakTasks.reduce((sum, t) => sum + (t.weeklyPoints || 0), 0);
  }, [streakTasks]);

  // ── Timer Controls ────────────────────────────────────────────────────────
  const toggleTimer = (taskId) => {
    setTaskTimers((prev) => {
      const cur = prev[taskId] || { totalSec: 600, remSec: 600, isRunning: false };
      const nextRunning = !cur.isRunning;
      return {
        ...prev,
        [taskId]: {
          ...cur,
          remSec: cur.remSec === 0 ? cur.totalSec : cur.remSec,
          isRunning: nextRunning,
        },
      };
    });
  };

  const resetTimer = (taskId, customMinutes = null) => {
    setTaskTimers((prev) => {
      const cur = prev[taskId] || { totalSec: 600, remSec: 600, isRunning: false };
      const newTotal = customMinutes !== null ? customMinutes * 60 : cur.totalSec;
      return {
        ...prev,
        [taskId]: {
          totalSec: newTotal,
          remSec: newTotal,
          isRunning: false,
        },
      };
    });
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  // ── Master Topic Queue Handlers ───────────────────────────────────────────
  const handleToggleTopicStatus = async (task, topicName) => {
    const currentList = Array.isArray(task.topicsMasterList) ? [...task.topicsMasterList] : [];
    const nextStatusMap = {
      pending: "in_progress",
      in_progress: "mastered",
      mastered: "pending",
    };

    const updatedList = currentList.map((tm) => {
      if (tm.name.toLowerCase() === topicName.toLowerCase()) {
        const nextStatus = nextStatusMap[tm.status || "pending"] || "pending";
        return { ...tm, status: nextStatus };
      }
      return tm;
    });

    setTasks((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, topicsMasterList: updatedList } : t))
    );

    try {
      await fetch("/api/king/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_habit_meta",
          id: task.id,
          meta: { topicsMasterList: updatedList },
        }),
      });
      showToast(`Topic "${topicName}" updated in queue.`, "info");
    } catch (err) {
      console.error("Error updating topic status", err);
      loadTasksAndEvaluations();
    }
  };

  const handleAddMasterTopic = async (task) => {
    const topicText = newTopicInput[task.id]?.trim();
    if (!topicText) return;

    const currentList = Array.isArray(task.topicsMasterList) ? [...task.topicsMasterList] : [];
    if (currentList.some((tm) => tm.name.toLowerCase() === topicText.toLowerCase())) {
      showToast("Topic already exists in queue.", "warning");
      return;
    }

    const updatedList = [...currentList, { name: topicText, status: "pending" }];

    setTasks((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, topicsMasterList: updatedList } : t))
    );
    setNewTopicInput((prev) => ({ ...prev, [task.id]: "" }));

    try {
      await fetch("/api/king/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_habit_meta",
          id: task.id,
          meta: { topicsMasterList: updatedList },
        }),
      });
      showToast(`Added "${topicText}" to master queue.`, "success");
    } catch (err) {
      console.error("Error adding topic", err);
      loadTasksAndEvaluations();
    }
  };

  const handleSaveTomorrowQueue = async (task, text) => {
    try {
      await fetch("/api/king/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_habit_meta",
          id: task.id,
          meta: { nextDayQueue: text },
        }),
      });
      showToast("Tomorrow's queued topic locked in! No morning hesitation.", "success");
    } catch (err) {
      console.error("Error saving tomorrow queue", err);
    }
  };

  // ── Check In Streak with Numbers Done, Topics Read & Daily Reflection ─────
  const handleStreakCheckIn = async (taskId) => {
    const inputData = dailyTaskInputs[taskId] || {};
    const numberDone = inputData.numberDone !== undefined && inputData.numberDone !== "" ? Number(inputData.numberDone) : undefined;
    const topicsList = inputData.topics ? inputData.topics.split(",").map((s) => s.trim()).filter(Boolean) : [];
    const note = inputData.note || "";
    const nextDayQueue = inputData.nextDayQueue || "";
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
          nextDayQueue,
          fieldValues,
        }),
      });

      const data = await res.json();
      if (data.success && data.tasks) {
        setTasks(data.tasks);
        playFocusCompleteChime();
        showToast("⚡ Marked complete for today! +10 weekly points awarded.", "success");
      } else {
        showToast(data.error || "Failed to check in.", "error");
      }
    } catch (err) {
      console.error("Error checking in streak", err);
      showToast("Network error checking in.", "error");
    }
  };

  // ── Update Streak Goal Days ───────────────────────────────────────────────
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

  // ── Sunday AI Points Evaluation & Reset ───────────────────────────────────
  const handleRunSundayEvaluation = async () => {
    if (streakTasks.length === 0) {
      alert("No active streak tasks found to evaluate.");
      return;
    }

    setIsEvaluating(true);
    showToast("🤖 Calculating Sunday evaluation out of 350 points via Gemini AI coach...", "info");

    try {
      const res = await fetch("/api/king/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "evaluate_sunday_points" }),
      });

      const data = await res.json();
      if (data.success && data.evaluation) {
        setEvaluationResult(data.evaluation);
        setShowEvaluationModal(true);
        if (data.tasks) setTasks(data.tasks);
        const evalsRes = await fetch("/api/king/tasks");
        const evalsData = await evalsRes.json();
        if (evalsData.evaluations) setEvaluations(evalsData.evaluations);
        showToast("✅ Sunday points evaluation complete! Evaluated out of 350.", "success");
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

  // ── Add General Task ──────────────────────────────────────────────────────
  const handleAddTask = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!newTitle.trim()) {
      setFormError("Task title is required.");
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
          dueDate: newDueDate,
        }),
      });

      const data = await res.json();
      if (data.success && data.tasks) {
        setTasks(data.tasks);
        setNewTitle("");
        setShowAddForm(false);
        showToast("📋 Task added successfully!", "success");
      } else {
        setFormError(data.error || "Failed to create task.");
      }
    } catch (err) {
      console.error("Error adding task", err);
      setFormError("Network error while adding task.");
    }
  };

  // ── Update General Task Status ────────────────────────────────────────────
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
      showToast(`Task moved to ${nextStatus.replace("_", " ")}.`, "info");
    } catch (err) {
      console.error("Error updating status", err);
      loadTasksAndEvaluations();
    }
  };

  // ── Delete Task ───────────────────────────────────────────────────────────
  const handleDeleteTask = async (id, title, e) => {
    if (e) e.stopPropagation();
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;

    setTasks((prev) => prev.filter((t) => t.id !== id));
    try {
      await fetch("/api/king/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete", id }),
      });
      showToast(`Task "${title}" deleted.`, "info");
    } catch (err) {
      console.error("Error deleting task", err);
      loadTasksAndEvaluations();
    }
  };

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
            padding: "10px 18px",
            borderRadius: 8,
            fontSize: "0.9rem",
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            gap: 10,
            background:
              statusToast.type === "success"
                ? "rgba(16, 185, 129, 0.95)"
                : statusToast.type === "warning"
                ? "rgba(245, 158, 11, 0.95)"
                : "rgba(56, 189, 248, 0.95)",
            color: "#FFFFFF",
            boxShadow: "0 10px 30px rgba(0, 0, 0, 0.35)",
            animation: "slideInToast 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        >
          <span>{statusToast.message}</span>
        </div>
      )}

      {/* ── Minimalist Clean Header ── */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1.2rem",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <button
            onClick={() => setActiveTab("streaks")}
            style={{
              padding: "7px 16px",
              borderRadius: 8,
              fontSize: "0.92rem",
              fontWeight: 800,
              cursor: "pointer",
              border: "none",
              background: activeTab === "streaks" ? "var(--accent-brand)" : "transparent",
              color: activeTab === "streaks" ? "var(--text-on-accent)" : "var(--text-secondary)",
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              transition: "all 0.2s ease",
            }}
          >
            <span>🔥</span> Habit Streaks ({streakTasks.length})
          </button>

          <button
            onClick={() => setActiveTab("general")}
            style={{
              padding: "7px 16px",
              borderRadius: 8,
              fontSize: "0.92rem",
              fontWeight: 800,
              cursor: "pointer",
              border: "none",
              background: activeTab === "general" ? "var(--accent-brand)" : "transparent",
              color: activeTab === "general" ? "var(--text-on-accent)" : "var(--text-secondary)",
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              transition: "all 0.2s ease",
            }}
          >
            <span>📋</span> Tasks ({generalTasks.length})
          </button>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="btn-secondary"
          style={{ fontSize: "0.85rem", padding: "7px 14px" }}
        >
          {showAddForm ? "Cancel ✕" : "+ New Task"}
        </button>
      </div>

      {/* ── Add General Task Inline Form ── */}
      {showAddForm && (
        <form
          onSubmit={handleAddTask}
          className="glass-card"
          style={{
            padding: "1.2rem",
            marginBottom: "1.4rem",
            borderRadius: 12,
            border: "1px solid var(--accent-brand)",
            background: "var(--bg-surface)",
            display: "grid",
            gap: 10,
          }}
        >
          {formError && (
            <div style={{ color: "#f43f5e", fontSize: "0.85rem", fontWeight: 700 }}>
              ⚠️ {formError}
            </div>
          )}
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <input
              type="text"
              placeholder="Task title..."
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              required
              style={{
                flex: 2,
                minWidth: 200,
                padding: "8px 12px",
                background: "var(--input-bg)",
                border: "1px solid var(--border-light)",
                borderRadius: 6,
                color: "var(--text-primary)",
                fontSize: "0.9rem",
              }}
            />
            <select
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              style={{
                padding: "8px 10px",
                background: "var(--input-bg)",
                border: "1px solid var(--border-light)",
                borderRadius: 6,
                color: "var(--text-primary)",
                fontSize: "0.85rem",
              }}
            >
              <option value="General">General</option>
              <option value="LeetCode">LeetCode / DSA</option>
              <option value="Projects">Projects</option>
              <option value="College">College</option>
              <option value="Career">Career</option>
            </select>
            <select
              value={newPriority}
              onChange={(e) => setNewPriority(e.target.value)}
              style={{
                padding: "8px 10px",
                background: "var(--input-bg)",
                border: "1px solid var(--border-light)",
                borderRadius: 6,
                color: "var(--text-primary)",
                fontSize: "0.85rem",
              }}
            >
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
            <button type="submit" className="btn-lime" style={{ padding: "8px 18px", fontSize: "0.85rem" }}>
              Save Task
            </button>
          </div>
        </form>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════
          TAB 1: 5 CORE HABIT STREAKS (ONE-LINE READABLE BY DEFAULT, EXPAND ON CLICK)
      ════════════════════════════════════════════════════════════════════════ */}
      {activeTab === "streaks" && (
        <div>
          <div style={{ display: "grid", gap: 10, marginBottom: "2rem" }}>
            {streakTasks.map((task) => {
              const currentStreak = task.currentStreak || 0;
              const goalDays = Number(task.goalDays) || 30;
              const bestStreak = task.bestStreak || currentStreak;
              const isCheckedToday = task.lastCheckedDate === todayStr;
              const isExpanded = expandedTaskId === task.id;
              const historyList = Array.isArray(task.history) ? task.history : [];
              const topicsMasterList = Array.isArray(task.topicsMasterList) ? task.topicsMasterList : [];
              const timerState = taskTimers[task.id] || { totalSec: (task.timerMinutes || 10) * 60, remSec: (task.timerMinutes || 10) * 60, isRunning: false };

              const currentInput = dailyTaskInputs[task.id] || {
                numberDone: "",
                topics: "",
                note: task.dailyLog || "",
                nextDayQueue: task.nextDayQueue || "",
                fieldValues: {},
              };

              return (
                <div
                  key={task.id}
                  className="glass-card"
                  style={{
                    borderRadius: 12,
                    background: "var(--bg-surface)",
                    border: isExpanded
                      ? "1.5px solid var(--accent-brand)"
                      : task.isDryWeek
                      ? "1.5px solid #e11d48"
                      : isCheckedToday
                      ? "1px solid rgba(16, 185, 129, 0.4)"
                      : "1px solid var(--border-subtle)",
                    transition: "all 0.2s ease",
                    overflow: "hidden",
                  }}
                >
                  {/* ─────────────────────────────────────────────────────────
                      COMPACT ONE-LINE ROW (Just one line to read name of task)
                  ────────────────────────────────────────────────────────── */}
                  <div
                    onClick={() => setExpandedTaskId(isExpanded ? null : task.id)}
                    style={{
                      padding: "12px 16px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 12,
                      userSelect: "none",
                      background: isExpanded ? "rgba(2, 132, 199, 0.04)" : "transparent",
                    }}
                  >
                    {/* Left: Checkmark & Title */}
                    <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1, minWidth: 260 }}>
                      <div
                        style={{
                          width: 22,
                          height: 22,
                          borderRadius: "50%",
                          border: isCheckedToday ? "2px solid #10b981" : "2px solid var(--border-subtle)",
                          background: isCheckedToday ? "#10b981" : "transparent",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#ffffff",
                          fontSize: 12,
                          fontWeight: 900,
                          flexShrink: 0,
                          boxShadow: isCheckedToday ? "0 0 10px rgba(16, 185, 129, 0.5)" : "none",
                        }}
                      >
                        {isCheckedToday ? "✓" : ""}
                      </div>

                      <div
                        style={{
                          fontSize: "0.98rem",
                          fontWeight: 800,
                          color: isCheckedToday ? "var(--text-primary)" : "var(--text-primary)",
                          letterSpacing: "-0.01em",
                        }}
                      >
                        {task.title}
                      </div>
                    </div>

                    {/* Right: Badges & Expand Chevron */}
                    <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
                      {/* Streak badge */}
                      <span
                        style={{
                          fontSize: 12,
                          fontWeight: 800,
                          padding: "3px 8px",
                          borderRadius: 8,
                          background: "var(--badge-bg)",
                          color: "var(--accent-brand)",
                          border: "1px solid var(--border-subtle)",
                          whiteSpace: "nowrap",
                        }}
                      >
                        🔥 {currentStreak}d
                      </span>

                      {/* Today Status Pill */}
                      {isCheckedToday ? (
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 800,
                            padding: "3px 8px",
                            borderRadius: 8,
                            background: "rgba(16, 185, 129, 0.15)",
                            color: "#10b981",
                            border: "1px solid rgba(16, 185, 129, 0.3)",
                            whiteSpace: "nowrap",
                          }}
                        >
                          ✓ Done Today
                        </span>
                      ) : (
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 700,
                            padding: "3px 8px",
                            borderRadius: 8,
                            background: "var(--badge-bg)",
                            color: "var(--text-secondary)",
                            border: "1px solid var(--border-subtle)",
                            whiteSpace: "nowrap",
                          }}
                        >
                          To Do
                        </span>
                      )}

                      {/* Dry Week / Warning Indicator */}
                      {task.isDryWeek && (
                        <span
                          style={{
                            fontSize: 10,
                            fontWeight: 900,
                            padding: "2px 6px",
                            borderRadius: 6,
                            background: "#e11d48",
                            color: "#fff",
                            textTransform: "uppercase",
                          }}
                        >
                          Dry Week
                        </span>
                      )}

                      {/* Expand indicator */}
                      <span
                        style={{
                          fontSize: 11,
                          color: "var(--text-secondary)",
                          transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
                          transition: "transform 0.2s ease",
                        }}
                      >
                        ▼
                      </span>
                    </div>
                  </div>

                  {/* ─────────────────────────────────────────────────────────
                      EXPANDED DETAILS VIEW (Details + Complete For Today Form)
                  ────────────────────────────────────────────────────────── */}
                  {isExpanded && (
                    <div
                      style={{
                        padding: "1rem 1.4rem 1.4rem",
                        borderTop: "1px solid var(--border-subtle)",
                        background: "var(--bg-base)",
                        animation: "slideDownFade 0.2s ease-out",
                        display: "grid",
                        gap: 14,
                      }}
                    >
                      {/* Pillar Info Brief */}
                      <div
                        style={{
                          padding: "10px 14px",
                          borderRadius: 8,
                          background: "var(--bg-surface)",
                          border: "1px solid var(--border-subtle)",
                          fontSize: "0.85rem",
                          display: "grid",
                          gap: 6,
                        }}
                      >
                        <div>
                          <strong style={{ color: "var(--text-primary)" }}>Why:</strong>{" "}
                          <span style={{ color: "var(--text-secondary)" }}>{task.why}</span>
                        </div>
                        <div>
                          <strong style={{ color: "var(--text-primary)" }}>Fix Do Everyday:</strong>{" "}
                          <span style={{ color: "var(--accent-secondary)", fontWeight: 700 }}>{task.minimumAction}</span>
                        </div>
                        <div>
                          <strong style={{ color: "var(--text-primary)" }}>Environment:</strong>{" "}
                          <span style={{ color: "var(--text-secondary)" }}>{task.environmentCue}</span>
                        </div>
                        {task.affirmation && (
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 6 }}>
                            <div>
                              <strong style={{ color: "var(--accent-brand)" }}>Affirmation:</strong>{" "}
                              <span style={{ fontStyle: "italic", color: "var(--text-primary)", fontWeight: 700 }}>
                                &ldquo;{task.affirmation}&rdquo;
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setAffirmationModalHabit(task);
                                setEnvChecklist({ notebook: false, phoneAway: false, distractionsClosed: false, musicPlaying: false });
                              }}
                              className="btn-lime"
                              style={{ padding: "3px 10px", fontSize: 11, fontWeight: 800 }}
                            >
                              🗣️ Recite Affirmation
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Built-in Focus Sprint Timer */}
                      <div
                        style={{
                          padding: "8px 12px",
                          borderRadius: 8,
                          background: "var(--bg-surface)",
                          border: "1px solid var(--border-subtle)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          flexWrap: "wrap",
                          gap: 8,
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <span style={{ fontSize: 18 }}>⏱️</span>
                          <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text-secondary)" }}>
                            Focus Sprint:
                          </span>
                          <span style={{ fontFamily: "monospace", fontSize: "1.2rem", fontWeight: 900, color: timerState.isRunning ? "var(--accent-brand)" : "var(--text-primary)" }}>
                            {formatTime(timerState.remSec)}
                          </span>
                        </div>

                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <button
                            type="button"
                            onClick={() => resetTimer(task.id, 10)}
                            style={{ padding: "3px 7px", fontSize: 10, borderRadius: 4, background: "var(--bg-base)", border: "1px solid var(--border-subtle)", color: "var(--text-secondary)", cursor: "pointer" }}
                          >
                            10m
                          </button>
                          <button
                            type="button"
                            onClick={() => resetTimer(task.id, 20)}
                            style={{ padding: "3px 7px", fontSize: 10, borderRadius: 4, background: "var(--bg-base)", border: "1px solid var(--border-subtle)", color: "var(--text-secondary)", cursor: "pointer" }}
                          >
                            20m
                          </button>
                          <button
                            type="button"
                            onClick={() => toggleTimer(task.id)}
                            className={timerState.isRunning ? "btn-secondary" : "btn-lime"}
                            style={{ padding: "4px 12px", fontSize: 11, fontWeight: 800 }}
                          >
                            {timerState.isRunning ? "⏸️ Pause" : "▶️ Start Focus"}
                          </button>
                        </div>
                      </div>

                      {/* Master Topics Queue Chips */}
                      {topicsMasterList.length > 0 && (
                        <div
                          style={{
                            padding: "10px 12px",
                            borderRadius: 8,
                            background: "var(--bg-surface)",
                            border: "1px solid var(--border-subtle)",
                          }}
                        >
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, fontWeight: 800, marginBottom: 6 }}>
                            <span style={{ color: "var(--text-primary)" }}>🏷️ Topics Queue:</span>
                            <span style={{ color: "var(--accent-secondary)" }}>
                              {topicsMasterList.filter((t) => t.status === "mastered").length} / {topicsMasterList.length} Mastered
                            </span>
                          </div>

                          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
                            {topicsMasterList.map((tm, idx) => (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => handleToggleTopicStatus(task, tm.name)}
                                style={{
                                  padding: "3px 8px",
                                  borderRadius: 10,
                                  fontSize: 11,
                                  fontWeight: 700,
                                  cursor: "pointer",
                                  border: tm.status === "mastered" ? "1px solid #10b981" : "1px solid var(--border-subtle)",
                                  background: tm.status === "mastered" ? "rgba(16, 185, 129, 0.15)" : "var(--bg-base)",
                                  color: tm.status === "mastered" ? "#10b981" : "var(--text-primary)",
                                }}
                              >
                                {tm.status === "mastered" ? "✓ " : ""}{tm.name}
                              </button>
                            ))}
                          </div>

                          {/* Add Topic Input */}
                          <div style={{ display: "flex", gap: 6 }}>
                            <input
                              type="text"
                              placeholder="+ Add topic to this pillar's queue..."
                              value={newTopicInput[task.id] || ""}
                              onChange={(e) => setNewTopicInput((prev) => ({ ...prev, [task.id]: e.target.value }))}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault();
                                  handleAddMasterTopic(task);
                                }
                              }}
                              style={{
                                flex: 1,
                                padding: "4px 8px",
                                fontSize: 11,
                                background: "var(--input-bg)",
                                border: "1px solid var(--border-light)",
                                borderRadius: 4,
                                color: "var(--text-primary)",
                              }}
                            />
                            <button
                              type="button"
                              onClick={() => handleAddMasterTopic(task)}
                              className="btn-secondary"
                              style={{ padding: "4px 8px", fontSize: 11 }}
                            >
                              Add
                            </button>
                          </div>
                        </div>
                      )}

                      {/* ═════════════════════════════════════════════════════════
                          "COMPLETE FOR TODAY" FORM (Options: What I Done Today)
                      ══════════════════════════════════════════════════════════ */}
                      <div
                        style={{
                          padding: "12px 14px",
                          borderRadius: 10,
                          background: "var(--bg-surface)",
                          border: "1.5px solid var(--accent-brand)",
                          display: "grid",
                          gap: 10,
                        }}
                      >
                        <div style={{ fontSize: 12, fontWeight: 900, color: "var(--accent-brand)", display: "flex", alignItems: "center", gap: 6 }}>
                          <span>✍️</span> Complete For Today (Enter What You Done):
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 8 }}>
                          {/* Number Done */}
                          <div>
                            <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--text-secondary)", marginBottom: 3 }}>
                              🔢 Number Completed (e.g. Problems, Sets, Commits):
                            </label>
                            <input
                              type="number"
                              placeholder="e.g. 2 problems, 12 sets"
                              value={currentInput.numberDone}
                              onChange={(e) => {
                                const val = e.target.value;
                                setDailyTaskInputs((prev) => ({
                                  ...prev,
                                  [task.id]: { ...(prev[task.id] || {}), numberDone: val },
                                }));
                              }}
                              style={{
                                width: "100%",
                                padding: "7px 10px",
                                background: "var(--input-bg)",
                                border: "1px solid var(--border-light)",
                                borderRadius: 6,
                                color: "var(--text-primary)",
                                fontSize: "0.85rem",
                              }}
                            />
                          </div>

                          {/* Topics Read */}
                          <div>
                            <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--text-secondary)", marginBottom: 3 }}>
                              🏷️ Topics & Concepts Read Today:
                            </label>
                            <input
                              type="text"
                              placeholder="e.g. Sliding Window, Next.js Server Actions..."
                              value={currentInput.topics}
                              onChange={(e) => {
                                const val = e.target.value;
                                setDailyTaskInputs((prev) => ({
                                  ...prev,
                                  [task.id]: { ...(prev[task.id] || {}), topics: val },
                                }));
                              }}
                              style={{
                                width: "100%",
                                padding: "7px 10px",
                                background: "var(--input-bg)",
                                border: "1px solid var(--border-light)",
                                borderRadius: 6,
                                color: "var(--text-primary)",
                                fontSize: "0.85rem",
                              }}
                            />
                          </div>
                        </div>

                        {/* Daily Reflection Note */}
                        <div>
                          <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--text-secondary)", marginBottom: 3 }}>
                            ✍️ Daily Reflection & Breakthrough Note:
                          </label>
                          <input
                            type="text"
                            placeholder="What key concept or breakthrough did you learn today?"
                            value={currentInput.note}
                            onChange={(e) => {
                              const val = e.target.value;
                              setDailyTaskInputs((prev) => ({
                                ...prev,
                                [task.id]: { ...(prev[task.id] || {}), note: val },
                              }));
                            }}
                            style={{
                              width: "100%",
                              padding: "7px 10px",
                              background: "var(--input-bg)",
                              border: "1px solid var(--border-light)",
                              borderRadius: 6,
                              color: "var(--text-primary)",
                              fontSize: "0.85rem",
                            }}
                          />
                        </div>

                        {/* Submit Button */}
                        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 4 }}>
                          <button
                            type="button"
                            onClick={() => handleStreakCheckIn(task.id)}
                            className="btn-lime"
                            style={{
                              padding: "8px 20px",
                              fontSize: "0.86rem",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 6,
                              fontWeight: 800,
                            }}
                          >
                            <span>⚡</span>
                            {isCheckedToday ? "Update Today's Done Details" : "Mark Complete For Today (+10 pts)"}
                          </button>
                        </div>
                      </div>

                      {/* Logged History Expander */}
                      {historyList.length > 0 && (
                        <div style={{ fontSize: 11 }}>
                          <button
                            type="button"
                            onClick={() => setExpandedHistoryTaskId(expandedHistoryTaskId === task.id ? null : task.id)}
                            style={{
                              background: "transparent",
                              border: "none",
                              color: "var(--text-secondary)",
                              cursor: "pointer",
                              padding: 0,
                              textDecoration: "underline",
                              fontWeight: 700,
                            }}
                          >
                            {expandedHistoryTaskId === task.id ? "▲ Hide Past History" : `▼ View Past Logged History (${historyList.length} entries)`}
                          </button>

                          {expandedHistoryTaskId === task.id && (
                            <div
                              style={{
                                marginTop: 6,
                                padding: "8px 10px",
                                borderRadius: 6,
                                background: "var(--bg-surface)",
                                border: "1px solid var(--border-subtle)",
                                maxHeight: 150,
                                overflowY: "auto",
                                display: "grid",
                                gap: 6,
                              }}
                            >
                              {historyList.slice().reverse().map((entry, hIdx) => (
                                <div key={hIdx} style={{ borderBottom: "1px solid var(--border-subtle)", paddingBottom: 4 }}>
                                  <span style={{ color: "var(--accent-brand)", fontWeight: 700 }}>📅 {entry.date}</span>
                                  {entry.numberDone !== undefined && <span style={{ marginLeft: 8 }}>Count: {entry.numberDone}</span>}
                                  {entry.topics && entry.topics.length > 0 && <span style={{ marginLeft: 8 }}>[{entry.topics.join(", ")}]</span>}
                                  {entry.note && <div style={{ color: "var(--text-secondary)", fontStyle: "italic" }}>&ldquo;{entry.note}&rdquo;</div>}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* ═══════════════════════════════════════════════════════════════════
              EVALUATE BUTTON AT THE END (As explicitly requested by user)
          ════════════════════════════════════════════════════════════════════ */}
          <div
            className="glass-card"
            style={{
              padding: "1.2rem 1.6rem",
              borderRadius: 14,
              background: "var(--bg-surface)",
              border: "1px solid var(--border-subtle)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 12,
            }}
          >
            <div>
              <div style={{ fontSize: 11, fontWeight: 800, color: "var(--text-secondary)", textTransform: "uppercase" }}>
                Active Weekly Score
              </div>
              <div style={{ fontSize: "1.35rem", fontWeight: 900, color: "var(--accent-brand)" }}>
                ⚡ {totalWeeklyPoints} / 350 pts this week
              </div>
            </div>

            <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
              {evaluations.length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowHistoryModal(true)}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "var(--accent-brand)",
                    fontSize: "0.85rem",
                    fontWeight: 700,
                    cursor: "pointer",
                    textDecoration: "underline",
                  }}
                >
                  📜 Past Sunday Reports ({evaluations.length})
                </button>
              )}

              <button
                type="button"
                onClick={handleRunSundayEvaluation}
                disabled={isEvaluating}
                className="btn-lime"
                style={{
                  fontSize: "0.88rem",
                  padding: "9px 20px",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  fontWeight: 800,
                }}
              >
                <span>✨</span>
                {isEvaluating ? "Evaluating..." : "Evaluate Sunday Points (out of 350)"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════
          TAB 2: GENERAL TASKS VIEW
      ════════════════════════════════════════════════════════════════════════ */}
      {activeTab === "general" && (
        <div>
          {filteredGeneralTasks.length === 0 ? (
            <div className="glass-card" style={{ padding: "2rem", textAlign: "center", borderRadius: 12, background: "var(--bg-surface)" }}>
              <div style={{ color: "var(--text-secondary)" }}>No general tasks found.</div>
            </div>
          ) : (
            <div style={{ display: "grid", gap: 8 }}>
              {filteredGeneralTasks.map((task) => (
                <div
                  key={task.id}
                  className="glass-card"
                  style={{
                    padding: "10px 14px",
                    borderRadius: 10,
                    background: "var(--bg-surface)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 12,
                    border: "1px solid var(--border-subtle)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1 }}>
                    <button
                      type="button"
                      onClick={() => handleUpdateStatus(task.id, task.status)}
                      style={{
                        width: 20,
                        height: 20,
                        borderRadius: "50%",
                        border: "2px solid var(--border-subtle)",
                        background: task.status === "completed" ? "#10b981" : "transparent",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#fff",
                        fontSize: 11,
                      }}
                    >
                      {task.status === "completed" ? "✓" : ""}
                    </button>
                    <span
                      style={{
                        fontSize: "0.92rem",
                        fontWeight: 700,
                        color: task.status === "completed" ? "var(--text-secondary)" : "var(--text-primary)",
                        textDecoration: task.status === "completed" ? "line-through" : "none",
                      }}
                    >
                      {task.title}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => handleDeleteTask(task.id, task.title, e)}
                    style={{ background: "transparent", border: "none", color: "#f43f5e", cursor: "pointer", fontSize: 13 }}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════
          MODAL: RECITATION & AFFIRMATION LOCK-IN
      ════════════════════════════════════════════════════════════════════════ */}
      {affirmationModalHabit && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.8)",
            backdropFilter: "blur(8px)",
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
              width: "min(520px, 94vw)",
              padding: "1.8rem",
              borderRadius: 14,
              background: "var(--bg-surface)",
              border: "2px solid var(--accent-brand)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <h3 style={{ fontSize: "1.15rem", margin: 0, fontWeight: 900, color: "var(--text-primary)" }}>
                🗣️ Affirmation Recitation Lock-In
              </h3>
              <button
                type="button"
                onClick={() => setAffirmationModalHabit(null)}
                style={{ background: "transparent", border: "none", color: "var(--text-secondary)", fontSize: 18, cursor: "pointer" }}
              >
                ✕
              </button>
            </div>

            <div
              style={{
                padding: "1.2rem",
                borderRadius: 10,
                background: "var(--bg-base)",
                border: "1px solid var(--accent-brand)",
                textAlign: "center",
                marginBottom: 16,
              }}
            >
              <div style={{ fontSize: 11, fontWeight: 800, color: "var(--accent-brand)", textTransform: "uppercase", marginBottom: 4 }}>
                Recite Out Loud With Full Conviction
              </div>
              <div style={{ fontSize: "1.3rem", fontWeight: 900, color: "var(--text-primary)", lineHeight: 1.4 }}>
                &ldquo;{affirmationModalHabit.affirmation}&rdquo;
              </div>
              <button
                type="button"
                onClick={() => speakAffirmation(affirmationModalHabit.affirmation)}
                style={{
                  marginTop: 8,
                  background: "transparent",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: 6,
                  padding: "4px 10px",
                  fontSize: 11,
                  color: "var(--text-primary)",
                  cursor: "pointer",
                }}
              >
                🔊 Listen Voice
              </button>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button
                type="button"
                onClick={() => setAffirmationModalHabit(null)}
                className="btn-lime"
                style={{ padding: "7px 18px", fontSize: "0.85rem" }}
              >
                ✓ I Recited & Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════
          MODAL: SUNDAY EVALUATION REPORT MODAL
      ════════════════════════════════════════════════════════════════════════ */}
      {showEvaluationModal && evaluationResult && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.8)",
            backdropFilter: "blur(8px)",
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
              maxHeight: "88vh",
              overflowY: "auto",
              padding: "1.8rem",
              borderRadius: 14,
              background: "var(--bg-surface)",
              border: "2px solid var(--accent-brand)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <h3 style={{ fontSize: "1.2rem", margin: 0, fontWeight: 900, color: "var(--text-primary)" }}>
                🏆 Sunday Evaluation Report
              </h3>
              <button
                type="button"
                onClick={() => setShowEvaluationModal(false)}
                style={{ background: "transparent", border: "none", color: "var(--text-secondary)", fontSize: 18, cursor: "pointer" }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1rem", borderRadius: 10, background: "var(--bg-base)", marginBottom: 14 }}>
              <div>
                <div style={{ fontSize: "1.8rem", fontWeight: 900, color: "var(--accent-brand)" }}>
                  {evaluationResult.totalWeeklyPoints} / 350 pts
                </div>
                <div style={{ fontSize: 11, color: "var(--text-secondary)" }}>
                  {evaluationResult.percentage}% weekly consistency score
                </div>
              </div>
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 12,
                  background: getGradeBadgeColor(evaluationResult.grade),
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1.8rem",
                  fontWeight: 900,
                  color: "#fff",
                }}
              >
                {evaluationResult.grade}
              </div>
            </div>

            <p style={{ fontSize: "0.9rem", color: "var(--text-primary)", lineHeight: 1.5, marginBottom: 16 }}>
              {evaluationResult.summaryReview}
            </p>

            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button
                type="button"
                onClick={() => setShowEvaluationModal(false)}
                className="btn-lime"
                style={{ padding: "7px 18px", fontSize: "0.85rem" }}
              >
                Done ✓
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════
          MODAL: PAST SUNDAY EVALUATIONS ARCHIVE
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
              width: "min(560px, 94vw)",
              maxHeight: "80vh",
              overflowY: "auto",
              padding: "1.6rem",
              borderRadius: 14,
              background: "var(--bg-surface)",
              border: "1px solid var(--border-subtle)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <h3 style={{ fontSize: "1.15rem", margin: 0, fontWeight: 800, color: "var(--text-primary)" }}>
                📜 Past Sunday Reports
              </h3>
              <button
                type="button"
                onClick={() => setShowHistoryModal(false)}
                style={{ background: "transparent", border: "none", color: "var(--text-secondary)", fontSize: 18, cursor: "pointer" }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: "grid", gap: 8 }}>
              {evaluations.map((ev, idx) => (
                <div
                  key={ev.id || idx}
                  style={{
                    padding: "10px 12px",
                    borderRadius: 8,
                    background: "var(--bg-base)",
                    border: "1px solid var(--border-subtle)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <div style={{ fontSize: 11, color: "var(--text-secondary)" }}>
                      {new Date(ev.date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" })}
                    </div>
                    <div style={{ fontSize: "0.95rem", fontWeight: 800, color: "var(--text-primary)", marginTop: 2 }}>
                      {ev.totalWeeklyPoints} / 350 pts
                    </div>
                  </div>
                  <span
                    style={{
                      padding: "3px 8px",
                      borderRadius: 6,
                      background: getGradeBadgeColor(ev.grade),
                      color: "#fff",
                      fontWeight: 800,
                      fontSize: "0.85rem",
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
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes slideDownFade {
          from {
            opacity: 0;
            transform: translateY(-6px);
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