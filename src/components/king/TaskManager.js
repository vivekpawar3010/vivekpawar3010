"use client";

import { useEffect, useState, useCallback, useMemo, useRef } from "react";

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

  // Per-task daily check-in input states: { [taskId]: { numberDone: '', topics: '', note: '', nextDayQueue: '', fieldValues: {} } }
  const [dailyTaskInputs, setDailyTaskInputs] = useState({});
  const [expandedHistoryTaskId, setExpandedHistoryTaskId] = useState(null);
  const [expandedPillarInfoTaskId, setExpandedPillarInfoTaskId] = useState(null);

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
    vocalReady: false,
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
  const isSunday = new Date().getDay() === 0;

  const showToast = (message, type = "success") => {
    setStatusToast({ message, type });
    setTimeout(() => setStatusToast(null), 4200);
  };

  // ── Web Audio API Completion Chime ──────────────────────────────────────────
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

  // ── Voice Affirmation Synthesizer ─────────────────────────────────────────
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
        // Initialize daily inputs and timers
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
          // Preserve currently running timers
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
              // Timer finished!
              next[taskId] = {
                ...tState,
                remSec: 0,
                isRunning: false,
              };
              playFocusCompleteChime();
              showToast("🎯 Focus Block Complete! Great intensity. Log your daily check-in numbers & breakthrough.", "success");
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

  // ── Derived streak tasks & penalty calculations ───────────────────────────
  const streakTasks = useMemo(() => {
    return tasks.filter((t) => t.category === "Streak");
  }, [tasks]);

  const generalTasks = useMemo(() => {
    return tasks.filter((t) => t.category !== "Streak");
  }, [tasks]);

  // Detect Dry Week and 1-Day Warning conditions across all streak tasks
  const dryWeekViolations = useMemo(() => {
    return streakTasks.filter((t) => t.isDryWeek);
  }, [streakTasks]);

  const warningViolations = useMemo(() => {
    return streakTasks.filter((t) => t.isWarning && !t.isDryWeek);
  }, [streakTasks]);

  const isExerciseDryWeek = useMemo(() => {
    return dryWeekViolations.some((t) => t.title?.toLowerCase().includes("exercise"));
  }, [dryWeekViolations]);

  // ── Heatmap Data (Last 16 Weeks / 112 Days) ───────────────────────────────
  const heatmapData = useMemo(() => {
    const days = [];
    const today = new Date();
    const totalDays = 112; // 16 weeks

    // Aggregate check-ins by date: { 'YYYY-MM-DD': count }
    const checkInsByDate = {};
    streakTasks.forEach((t) => {
      if (Array.isArray(t.history)) {
        t.history.forEach((h) => {
          if (h.date) {
            checkInsByDate[h.date] = (checkInsByDate[h.date] || 0) + 1;
          }
        });
      }
    });

    for (let i = totalDays - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dStr = d.toISOString().split("T")[0];
      const count = checkInsByDate[dStr] || 0;
      days.push({
        date: dStr,
        count,
        level: count === 0 ? 0 : count <= 2 ? 1 : count <= 4 ? 2 : 3,
      });
    }

    return days;
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

  // ── Seed 5 Core Habits Action ─────────────────────────────────────────────
  const handleSeedCoreHabits = async () => {
    if (
      !confirm(
        "⚡ Seed the 5 Core Atomic Habit Pillars from your handwritten notebook into PostgreSQL & JSON? Existing streaks and logs will be preserved."
      )
    ) {
      return;
    }

    try {
      const res = await fetch("/api/king/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "seed_core_habits" }),
      });
      const data = await res.json();
      if (data.success && data.tasks) {
        setTasks(data.tasks);
        showToast("⚡ 5 Core Habit Pillars loaded directly from notebook into database!", "success");
      } else {
        showToast(data.error || "Failed to seed core habits.", "error");
      }
    } catch (err) {
      console.error("Error seeding habits", err);
      showToast("Network error while seeding core habits.", "error");
    }
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

    // Optimistic UI update
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
      showToast("Tomorrow's queued topic locked in! No decision fatigue tomorrow.", "success");
    } catch (err) {
      console.error("Error saving tomorrow queue", err);
    }
  };

  // ── Dynamic Custom Field Handlers (Task Creation) ─────────────────────────
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

  // ── Add Task Handler ──────────────────────────────────────────────────────
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
            ? "🔥 New habit streak activated with custom tracking fields (Max 5 enforced)!"
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

  // ── Check In Streak with Master Topics & Next Day Queue ───────────────────
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
        showToast("⚡ Daily streak maintained! +10 weekly points awarded & saved to PostgreSQL.", "success");
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

  // ── Sunday AI Points Evaluation & Reset (Evaluated out of 350) ─────────────
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

  // ── Reset Weekly Points to Zero ───────────────────────────────────────────
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

  // ── Update Status for general tasks ───────────────────────────────────────
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
      showToast(`Task status moved to ${nextStatus.replace("_", " ")}.`, "info");
    } catch (err) {
      console.error("Error updating status", err);
      loadTasksAndEvaluations();
    }
  };

  // ── Delete Task ───────────────────────────────────────────────────────────
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

  // ── General tasks filtering ───────────────────────────────────────────────
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
            ⚡ Atomic Habit Engine & <span className="gradient-text">Kings Task Deck</span>
          </h2>
          <p style={{ color: "var(--text-secondary)", margin: 0, fontSize: "0.95rem" }}>
            The 5 Handwritten Pillars: Identity Lock-In, Minimum Viable Actions, Focus Timers, 7-Day Rewards, & Dry Week Penalties.
          </p>
        </div>

        {/* Top Action CTAs */}
        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          {/* Seed Core Habits Button */}
          <button
            onClick={handleSeedCoreHabits}
            className="btn-secondary"
            style={{
              fontSize: "0.85rem",
              padding: "9px 16px",
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              border: "1.5px solid var(--accent-brand)",
              color: "var(--accent-brand)",
              fontWeight: 800,
            }}
            title="Seed or sync the 5 exact core habits from your handwritten notebook"
          >
            <span>⚡</span>
            Seed 5 Core Habits (Notebook)
          </button>

          {/* Sunday AI Evaluation Button */}
          <button
            onClick={handleRunSundayEvaluation}
            disabled={isEvaluating || streakTasks.length === 0}
            className="btn-lime"
            style={{
              fontSize: "0.85rem",
              padding: "9px 18px",
              opacity: streakTasks.length === 0 ? 0.5 : 1,
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
            }}
            title="Calculate Sunday weekly points out of 350 based on numbers and topics read"
          >
            <span>✨</span>
            {isEvaluating ? "Evaluating Week..." : "Evaluate Sunday Points (out of 350)"}
          </button>

          {/* New Task Trigger Button */}
          <button
            onClick={() => {
              setShowAddForm(!showAddForm);
              setNewCategory(activeTab === "streaks" ? "Streak" : "LeetCode");
            }}
            className="btn-primary"
            style={{ fontSize: "0.85rem", padding: "9px 18px" }}
          >
            {showAddForm ? "Cancel ✕" : activeTab === "streaks" ? "🔥 Custom Streak" : "➕ New Task"}
          </button>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════
          GLOBAL "DRY WEEK" ACTIVE ALERT BANNER (Miss Once, Not Twice Violation)
      ════════════════════════════════════════════════════════════════════════ */}
      {dryWeekViolations.length > 0 && (
        <div
          style={{
            marginBottom: "1.5rem",
            padding: "1.2rem 1.4rem",
            borderRadius: 14,
            background: "linear-gradient(135deg, rgba(225, 29, 72, 0.18) 0%, rgba(159, 18, 57, 0.28) 100%)",
            border: "2px solid #e11d48",
            boxShadow: "0 8px 30px rgba(225, 29, 72, 0.25)",
            animation: "pulseLockdown 2.5s infinite ease-in-out",
          }}
        >
          <div style={{ display: "flex", alignItems: "flex-start", gap: 14, flexWrap: "wrap" }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 10,
                background: "#e11d48",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 24,
                color: "#ffffff",
                flexShrink: 0,
              }}
            >
              🚨
            </div>

            <div style={{ flex: 1, minWidth: 280 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                <h3 style={{ fontSize: "1.18rem", margin: 0, fontWeight: 900, color: "#fda4af" }}>
                  CRITICAL PROTOCOL: DRY WEEK ACTIVATED (7-DAY PENALTY)
                </h3>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 900,
                    padding: "3px 10px",
                    borderRadius: 12,
                    background: "#e11d48",
                    color: "#ffffff",
                    letterSpacing: "0.05em",
                    textTransform: "uppercase",
                  }}
                >
                  Miss Once, Not Twice Violated
                </span>
              </div>

              <p style={{ margin: "6px 0 10px", color: "var(--text-primary)", fontSize: "0.92rem", lineHeight: 1.5 }}>
                You missed 2 consecutive days on:{" "}
                <strong>{dryWeekViolations.map((t) => t.title).join(", ")}</strong>.
                The notebook penalty rule is in effect for the next 7 days:
              </p>

              {/* 4 Strict Rules */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
                  gap: 8,
                  marginBottom: 12,
                }}
              >
                <div style={{ padding: "6px 12px", borderRadius: 8, background: "rgba(0,0,0,0.35)", fontSize: 12, color: "#fecdd3", fontWeight: 700 }}>
                  🚫 Strictly NO Sweets & Sugar
                </div>
                <div style={{ padding: "6px 12px", borderRadius: 8, background: "rgba(0,0,0,0.35)", fontSize: 12, color: "#fecdd3", fontWeight: 700 }}>
                  🚫 Strictly NO Junk Food
                </div>
                <div style={{ padding: "6px 12px", borderRadius: 8, background: "rgba(0,0,0,0.35)", fontSize: 12, color: "#fecdd3", fontWeight: 700 }}>
                  🚫 Strictly NO Parties & Hangouts
                </div>
                <div style={{ padding: "6px 12px", borderRadius: 8, background: "rgba(0,0,0,0.35)", fontSize: 12, color: "#fecdd3", fontWeight: 700 }}>
                  🚫 Strictly NO Chai for 7 Days!
                </div>
              </div>

              {/* Exercise 2X Penalty Badge */}
              {isExerciseDryWeek && (
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "8px 14px",
                    borderRadius: 8,
                    background: "rgba(245, 158, 11, 0.25)",
                    border: "1.5px solid #f59e0b",
                    color: "#fde68a",
                    fontSize: "0.86rem",
                    fontWeight: 800,
                  }}
                >
                  <span>⚡</span>
                  <strong>2X TRAINING WEEK MANDATORY:</strong> Double sets on Push-ups (6 sets), Squats (6 sets), Planks (6 sets) & Pull-ups for 7 days!
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── 1-Day Warning Notice (If Missed Yesterday) ── */}
      {warningViolations.length > 0 && dryWeekViolations.length === 0 && (
        <div
          style={{
            marginBottom: "1.5rem",
            padding: "10px 16px",
            borderRadius: 10,
            background: "rgba(245, 158, 11, 0.15)",
            border: "1.5px solid #f59e0b",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 10,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: "0.9rem" }}>
            <span style={{ fontSize: 20 }}>⚠️</span>
            <span style={{ color: "var(--text-primary)" }}>
              <strong>Miss Once, Not Twice Warning:</strong> You missed yesterday on{" "}
              <strong>{warningViolations.map((t) => t.title).join(", ")}</strong>. Check in today to prevent triggering the 7-day Dry Week penalty!
            </span>
          </div>
        </div>
      )}

      {/* ── Sunday Evaluation System Info Banner (350 Points Rule) ── */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "10px 16px",
          borderRadius: 10,
          background: "var(--bg-surface)",
          border: "1px solid var(--border-subtle)",
          marginBottom: "1.5rem",
          flexWrap: "wrap",
          gap: 10,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.88rem" }}>
          <span style={{ fontSize: 18 }}>💡</span>
          <span style={{ color: "var(--text-primary)" }}>
            <strong>Sunday AI Rubric:</strong> 5 streak tasks = 50 pts/day (10 each). 7 days = 350 max points (capped at 335 max by Gemini AI coach). Points reset to 0 every Sunday.
          </span>
        </div>

        {evaluations.length > 0 && (
          <button
            onClick={() => setShowHistoryModal(true)}
            style={{
              background: "transparent",
              border: "none",
              color: "var(--accent-brand)",
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
            background: activeTab === "streaks" ? "var(--accent-brand)" : "transparent",
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
            background: activeTab === "general" ? "var(--accent-brand)" : "transparent",
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

      {/* ── Consistency Heatmap (GitHub-Style Grid) ── */}
      {activeTab === "streaks" && (
        <div
          className="glass-card"
          style={{
            padding: "1.2rem 1.4rem",
            borderRadius: 14,
            marginBottom: "1.8rem",
            background: "var(--bg-surface)",
            border: "1px solid var(--border-subtle)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
            <div>
              <span style={{ fontSize: 13, fontWeight: 800, color: "var(--text-primary)" }}>
                📊 16-Week Habit Consistency Grid
              </span>
              <span style={{ fontSize: 11, color: "var(--text-secondary)", marginLeft: 8 }}>
                (Combined check-in intensity across all 5 habits)
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "var(--text-secondary)" }}>
              <span>Less</span>
              <span style={{ width: 10, height: 10, borderRadius: 2, background: "rgba(255,255,255,0.06)", border: "1px solid var(--border-subtle)" }} />
              <span style={{ width: 10, height: 10, borderRadius: 2, background: "#065f46" }} />
              <span style={{ width: 10, height: 10, borderRadius: 2, background: "#10b981" }} />
              <span style={{ width: 10, height: 10, borderRadius: 2, background: "#34d399" }} />
              <span>More (All 5)</span>
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridAutoFlow: "column",
              gridTemplateRows: "repeat(7, 12px)",
              gap: 4,
              overflowX: "auto",
              paddingBottom: 6,
            }}
          >
            {heatmapData.map((d, i) => {
              const bgColors = [
                "rgba(255,255,255,0.06)",
                "#065f46",
                "#10b981",
                "#34d399",
              ];
              return (
                <div
                  key={i}
                  title={`${d.date}: ${d.count} / 5 habits checked in`}
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: 2,
                    background: bgColors[d.level],
                    border: d.level === 0 ? "1px solid var(--border-subtle)" : "none",
                    cursor: "pointer",
                  }}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* ── Add Task Form ── */}
      {showAddForm && (
        <div
          className="glass-card"
          style={{
            padding: "1.6rem",
            marginBottom: "1.8rem",
            borderRadius: 14,
            border: "1.5px solid var(--accent-brand)",
            background: "var(--bg-surface)",
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
                  color: streakTasks.length >= 5 ? "#fb7185" : "var(--accent-brand)",
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

            {/* Dynamic Custom Fields */}
            {newCategory === "Streak" && (
              <div
                style={{
                  padding: "1.2rem",
                  borderRadius: 10,
                  background: "var(--bg-base)",
                  border: "1px solid var(--border-subtle)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, flexWrap: "wrap", gap: 8 }}>
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 800, color: "var(--text-primary)", display: "block" }}>
                      ⚙️ Custom Tracking Fields
                    </label>
                    <span style={{ fontSize: 11, color: "var(--text-secondary)" }}>
                      Every day to maintain your streak, you will enter the numbers done, topics read, and reflections.
                    </span>
                  </div>

                  <div style={{ display: "flex", gap: 6 }}>
                    <button
                      type="button"
                      onClick={() => handleAddField("number")}
                      className="btn-secondary"
                      style={{ fontSize: 11, padding: "4px 8px" }}
                    >
                      + Number Metric
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddField("topics")}
                      className="btn-secondary"
                      style={{ fontSize: 11, padding: "4px 8px" }}
                    >
                      + Topics List
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddField("text")}
                      className="btn-secondary"
                      style={{ fontSize: 11, padding: "4px 8px" }}
                    >
                      + Reflection
                    </button>
                  </div>
                </div>

                <div style={{ display: "grid", gap: 8 }}>
                  {customFields.map((field, idx) => (
                    <div
                      key={field.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        padding: "8px 10px",
                        borderRadius: 6,
                        background: "var(--bg-surface)",
                        border: "1px solid var(--border-subtle)",
                        flexWrap: "wrap",
                      }}
                    >
                      <span style={{ fontSize: 11, fontWeight: 800, color: "var(--accent-brand)", width: 22 }}>
                        #{idx + 1}
                      </span>

                      <input
                        type="text"
                        placeholder="Field Name"
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
                        <option value="text">✍️ Reflection Text</option>
                      </select>

                      <input
                        type="text"
                        placeholder="Target (e.g. 5)"
                        value={field.target || ""}
                        onChange={(e) => handleUpdateField(field.id, "target", e.target.value)}
                        style={{
                          flex: 1,
                          minWidth: 90,
                          padding: "6px 8px",
                          background: "var(--input-bg)",
                          border: "1px solid var(--border-light)",
                          borderRadius: 6,
                          color: "var(--text-primary)",
                          fontSize: "0.82rem",
                        }}
                      />

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
          TAB 1: HABIT STREAKS VIEW (The 5 Core Handwritten Pillars)
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
                Active Habit Pillars
              </h3>
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 800,
                  padding: "2px 8px",
                  borderRadius: 12,
                  background: "var(--badge-bg)",
                  color: "var(--accent-brand)",
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

          {/* Habit Task Cards Grid */}
          {streakTasks.length === 0 ? (
            <div
              className="glass-card"
              style={{
                padding: "3rem 1.5rem",
                textAlign: "center",
                borderRadius: 14,
                background: "var(--bg-surface)",
              }}
            >
              <div style={{ fontSize: 42, marginBottom: 12 }}>🔥</div>
              <h4 style={{ fontSize: "1.2rem", margin: "0 0 6px", color: "var(--text-primary)" }}>
                No Habit Streaks Active Yet
              </h4>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", maxWidth: 460, margin: "0 auto 1.4rem" }}>
                Click below to instantly load your 5 core Atomic Habit pillars from your handwritten notebook.
              </p>
              <button
                onClick={handleSeedCoreHabits}
                className="btn-lime"
                style={{ fontSize: "0.9rem", padding: "10px 24px" }}
              >
                ⚡ Load 5 Core Habits from Notebook
              </button>
            </div>
          ) : (
            <div style={{ display: "grid", gap: "1.5rem" }}>
              {streakTasks.map((task) => {
                const currentStreak = task.currentStreak || 0;
                const goalDays = Number(task.goalDays) || 30;
                const bestStreak = task.bestStreak || currentStreak;
                const percent = Math.min(100, Math.round((currentStreak / goalDays) * 100));
                const isCheckedToday = task.lastCheckedDate === todayStr;
                const isExpanded = expandedHistoryTaskId === task.id;
                const isPillarInfoExpanded = expandedPillarInfoTaskId === task.id;
                const historyList = Array.isArray(task.history) ? task.history : [];
                const topicsMasterList = Array.isArray(task.topicsMasterList) ? task.topicsMasterList : [];
                const timerState = taskTimers[task.id] || { totalSec: (task.timerMinutes || 10) * 60, remSec: (task.timerMinutes || 10) * 60, isRunning: false };

                const configuredFields = Array.isArray(task.fields) && task.fields.length > 0 ? task.fields : [
                  { id: "f_num", label: "Number Completed", type: "number", target: "2" },
                  { id: "f_topics", label: "Topics Read", type: "topics", target: "DSA" },
                  { id: "f_notes", label: "Daily Reflection", type: "text", target: "Notes" },
                ];

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
                      padding: "1.6rem",
                      borderRadius: 14,
                      border: task.isDryWeek
                        ? "2px solid #e11d48"
                        : task.isWarning
                        ? "1.5px solid #f59e0b"
                        : isCheckedToday
                        ? "1.5px solid var(--accent-secondary)"
                        : "1px solid var(--border-subtle)",
                      background: "var(--bg-surface)",
                      boxShadow: isCheckedToday ? "0 4px 20px var(--shadow-card)" : "none",
                      transition: "all 0.25s ease",
                    }}
                  >
                    {/* Top Row: Title, Badges, Points, Delete */}
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
                      <div style={{ flex: 1, minWidth: 280 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                          <span style={{ fontSize: 24 }}>🔥</span>
                          <h4 style={{ fontSize: "1.22rem", margin: 0, fontWeight: 900, color: "var(--text-primary)" }}>
                            {task.title}
                          </h4>

                          {/* Status Badges */}
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

                          {task.isWarning && !task.isDryWeek && !isCheckedToday && (
                            <span
                              style={{
                                fontSize: 11,
                                fontWeight: 800,
                                padding: "3px 10px",
                                borderRadius: 12,
                                background: "rgba(245, 158, 11, 0.2)",
                                color: "#f59e0b",
                                border: "1px solid rgba(245, 158, 11, 0.4)",
                              }}
                            >
                              ⚠️ Missed 1 Day (Dry Week Warning)
                            </span>
                          )}

                          {task.isDryWeek && (
                            <span
                              style={{
                                fontSize: 11,
                                fontWeight: 900,
                                padding: "3px 10px",
                                borderRadius: 12,
                                background: "rgba(225, 29, 72, 0.2)",
                                color: "#fda4af",
                                border: "1px solid #e11d48",
                              }}
                            >
                              🚨 DRY WEEK ACTIVE ({task.missedDaysCount} Days Missed)
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
                          <span style={{ fontSize: "0.85rem", color: "var(--accent-brand)", fontWeight: 700 }}>
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

                      {/* Right side: Points, Affirmation trigger, 7-day reward */}
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        {/* 7-Day Reward Button */}
                        {task.weeklyReward && (
                          <button
                            onClick={() => setRewardModalHabit(task)}
                            style={{
                              background: currentStreak >= 7 ? "rgba(16, 185, 129, 0.15)" : "transparent",
                              border: "1px solid var(--border-subtle)",
                              color: currentStreak >= 7 ? "#10b981" : "var(--text-secondary)",
                              fontSize: "0.82rem",
                              fontWeight: 800,
                              padding: "6px 10px",
                              borderRadius: 8,
                              cursor: "pointer",
                            }}
                            title="View your 7-day reward loop from notebook"
                          >
                            🎁 7-Day Reward
                          </button>
                        )}

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
                          {percent}% {percent >= 100 ? "🎉 Goal Achieved!" : ""}
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

                    {/* ═══════════════════════════════════════════════════════════════
                        PILLAR 1-5 IDENTITY & FOCUS PROTOCOL BOX
                    ════════════════════════════════════════════════════════════════ */}
                    <div
                      style={{
                        padding: "12px 14px",
                        marginBottom: 14,
                        borderRadius: 10,
                        background: "var(--bg-base)",
                        border: "1px solid var(--border-subtle)",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{ fontSize: 16 }}>🎯</span>
                          <span style={{ fontSize: 13, fontWeight: 800, color: "var(--text-primary)" }}>
                            <strong>Fix Do Everyday:</strong> {task.minimumAction || "Read new topic / practice daily (10 min)."}
                          </span>
                        </div>

                        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                          {/* Affirmation Lock-In Modal Trigger */}
                          {task.affirmation && (
                            <button
                              onClick={() => {
                                setAffirmationModalHabit(task);
                                setEnvChecklist({
                                  notebook: false,
                                  phoneAway: false,
                                  distractionsClosed: false,
                                  musicPlaying: false,
                                  vocalReady: false,
                                });
                              }}
                              className="btn-lime"
                              style={{
                                fontSize: "0.8rem",
                                padding: "4px 12px",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 6,
                              }}
                              title="Recite the handwritten affirmation out loud and verify environment checklist"
                            >
                              <span>🗣️</span> Recite Affirmation
                            </button>
                          )}

                          <button
                            onClick={() =>
                              setExpandedPillarInfoTaskId(isPillarInfoExpanded ? null : task.id)
                            }
                            style={{
                              background: "transparent",
                              border: "none",
                              color: "var(--accent-brand)",
                              fontSize: 12,
                              fontWeight: 700,
                              cursor: "pointer",
                              textDecoration: "underline",
                              padding: 0,
                            }}
                          >
                            {isPillarInfoExpanded ? "Hide Details ▲" : "Why & Penalty ▼"}
                          </button>
                        </div>
                      </div>

                      {/* Expandable Pillar Specifications from Notebook */}
                      {isPillarInfoExpanded && (
                        <div
                          style={{
                            marginTop: 12,
                            paddingTop: 10,
                            borderTop: "1px dashed var(--border-subtle)",
                            display: "grid",
                            gap: 6,
                            fontSize: "0.85rem",
                          }}
                        >
                          <div>
                            <strong style={{ color: "var(--text-primary)" }}>Why (Identity):</strong>{" "}
                            <span style={{ color: "var(--text-secondary)" }}>{task.why}</span>
                          </div>
                          <div>
                            <strong style={{ color: "var(--text-primary)" }}>Environment Cue:</strong>{" "}
                            <span style={{ color: "var(--text-secondary)" }}>{task.environmentCue}</span>
                          </div>
                          <div>
                            <strong style={{ color: "var(--text-primary)" }}>7-Day Reward:</strong>{" "}
                            <span style={{ color: "var(--accent-secondary)" }}>{task.weeklyReward}</span>
                          </div>
                          <div>
                            <strong style={{ color: "#f43f5e" }}>Penalty Rule:</strong>{" "}
                            <span style={{ color: "var(--text-secondary)" }}>{task.penaltyRule}</span>
                          </div>
                          <div>
                            <strong style={{ color: "var(--accent-brand)" }}>Daily Affirmation:</strong>{" "}
                            <span style={{ fontStyle: "italic", color: "var(--text-primary)", fontWeight: 700 }}>
                              &ldquo;{task.affirmation}&rdquo;
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* ═══════════════════════════════════════════════════════════════
                        BUILT-IN FOCUS COUNTDOWN TIMER (10m / 15m / 20m / 30m)
                    ════════════════════════════════════════════════════════════════ */}
                    <div
                      style={{
                        padding: "10px 14px",
                        marginBottom: 14,
                        borderRadius: 10,
                        background: timerState.isRunning
                          ? "linear-gradient(135deg, rgba(2, 132, 199, 0.12) 0%, rgba(14, 165, 233, 0.18) 100%)"
                          : "var(--bg-base)",
                        border: timerState.isRunning
                          ? "1.5px solid var(--accent-brand)"
                          : "1px solid var(--border-subtle)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        flexWrap: "wrap",
                        gap: 10,
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <span style={{ fontSize: 20 }}>⏱️</span>
                        <div>
                          <span style={{ fontSize: 11, fontWeight: 800, color: "var(--text-secondary)", textTransform: "uppercase" }}>
                            Focus Sprint Timer
                          </span>
                          <div
                            style={{
                              fontSize: "1.45rem",
                              fontWeight: 900,
                              fontFamily: "monospace",
                              color: timerState.isRunning ? "var(--accent-brand)" : "var(--text-primary)",
                              letterSpacing: "0.05em",
                            }}
                          >
                            {formatTime(timerState.remSec)}
                          </div>
                        </div>
                      </div>

                      {/* Presets and Controls */}
                      <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                        <button
                          type="button"
                          onClick={() => resetTimer(task.id, 10)}
                          style={{ padding: "4px 8px", fontSize: 11, borderRadius: 6, background: "var(--bg-surface)", border: "1px solid var(--border-subtle)", color: "var(--text-secondary)", cursor: "pointer" }}
                        >
                          10m
                        </button>
                        <button
                          type="button"
                          onClick={() => resetTimer(task.id, 15)}
                          style={{ padding: "4px 8px", fontSize: 11, borderRadius: 6, background: "var(--bg-surface)", border: "1px solid var(--border-subtle)", color: "var(--text-secondary)", cursor: "pointer" }}
                        >
                          15m
                        </button>
                        <button
                          type="button"
                          onClick={() => resetTimer(task.id, 20)}
                          style={{ padding: "4px 8px", fontSize: 11, borderRadius: 6, background: "var(--bg-surface)", border: "1px solid var(--border-subtle)", color: "var(--text-secondary)", cursor: "pointer" }}
                        >
                          20m
                        </button>
                        <button
                          type="button"
                          onClick={() => resetTimer(task.id, 30)}
                          style={{ padding: "4px 8px", fontSize: 11, borderRadius: 6, background: "var(--bg-surface)", border: "1px solid var(--border-subtle)", color: "var(--text-secondary)", cursor: "pointer" }}
                        >
                          30m
                        </button>

                        <button
                          type="button"
                          onClick={() => toggleTimer(task.id)}
                          className={timerState.isRunning ? "btn-secondary" : "btn-lime"}
                          style={{ padding: "6px 14px", fontSize: "0.84rem", fontWeight: 800 }}
                        >
                          {timerState.isRunning ? "⏸️ Pause" : "▶️ Start Focus"}
                        </button>

                        <button
                          type="button"
                          onClick={() => resetTimer(task.id)}
                          style={{
                            background: "transparent",
                            border: "none",
                            color: "var(--text-secondary)",
                            cursor: "pointer",
                            fontSize: 12,
                            padding: "4px 6px",
                          }}
                          title="Reset timer"
                        >
                          ↺
                        </button>
                      </div>
                    </div>

                    {/* ═══════════════════════════════════════════════════════════════
                        MASTER TOPIC QUEUE & "TOMORROW'S QUEUE" PLANNER
                    ════════════════════════════════════════════════════════════════ */}
                    {topicsMasterList.length > 0 && (
                      <div
                        style={{
                          padding: "12px 14px",
                          marginBottom: 14,
                          borderRadius: 10,
                          background: "var(--bg-base)",
                          border: "1px solid var(--border-subtle)",
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8, flexWrap: "wrap", gap: 6 }}>
                          <span style={{ fontSize: 12, fontWeight: 800, color: "var(--text-primary)" }}>
                            🏷️ Master Topics Queue (Click chip to cycle status: Pending ➔ In Progress ➔ Mastered):
                          </span>
                          <span style={{ fontSize: 11, color: "var(--accent-secondary)", fontWeight: 700 }}>
                            {topicsMasterList.filter((t) => t.status === "mastered").length} / {topicsMasterList.length} Mastered
                          </span>
                        </div>

                        {/* Topic Chips */}
                        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
                          {topicsMasterList.map((tm, tmIdx) => {
                            const isMastered = tm.status === "mastered";
                            const isInProgress = tm.status === "in_progress";
                            return (
                              <button
                                key={tmIdx}
                                type="button"
                                onClick={() => handleToggleTopicStatus(task, tm.name)}
                                style={{
                                  padding: "4px 10px",
                                  borderRadius: 12,
                                  fontSize: 11,
                                  fontWeight: 700,
                                  cursor: "pointer",
                                  border: isMastered
                                    ? "1px solid #10b981"
                                    : isInProgress
                                    ? "1px solid var(--accent-brand)"
                                    : "1px solid var(--border-subtle)",
                                  background: isMastered
                                    ? "rgba(16, 185, 129, 0.15)"
                                    : isInProgress
                                    ? "rgba(2, 132, 199, 0.15)"
                                    : "var(--bg-surface)",
                                  color: isMastered
                                    ? "#10b981"
                                    : isInProgress
                                    ? "var(--accent-brand)"
                                    : "var(--text-secondary)",
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: 5,
                                  transition: "all 0.15s ease",
                                }}
                                title="Click to toggle status: Pending -> In Progress -> Mastered"
                              >
                                <span>{isMastered ? "✓" : isInProgress ? "🔥" : "○"}</span>
                                <span>{tm.name}</span>
                              </button>
                            );
                          })}
                        </div>

                        {/* Add Topic Inline Form */}
                        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                          <input
                            type="text"
                            placeholder="+ Add new topic to this pillar's queue..."
                            value={newTopicInput[task.id] || ""}
                            onChange={(e) =>
                              setNewTopicInput((prev) => ({ ...prev, [task.id]: e.target.value }))
                            }
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                handleAddMasterTopic(task);
                              }
                            }}
                            style={{
                              flex: 1,
                              padding: "6px 10px",
                              background: "var(--input-bg)",
                              border: "1px solid var(--border-light)",
                              borderRadius: 6,
                              color: "var(--text-primary)",
                              fontSize: "0.82rem",
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => handleAddMasterTopic(task)}
                            className="btn-secondary"
                            style={{ fontSize: "0.8rem", padding: "6px 12px" }}
                          >
                            + Add Topic
                          </button>
                        </div>
                      </div>
                    )}

                    {/* ═══════════════════════════════════════════════════════════════
                        TOMORROW'S QUEUED TOPIC (Eliminate Morning Hesitation)
                    ════════════════════════════════════════════════════════════════ */}
                    <div
                      style={{
                        padding: "10px 14px",
                        marginBottom: 14,
                        borderRadius: 10,
                        background: "var(--bg-base)",
                        border: "1px solid var(--border-subtle)",
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        flexWrap: "wrap",
                      }}
                    >
                      <span style={{ fontSize: 12, fontWeight: 800, color: "var(--accent-brand)", whiteSpace: "nowrap" }}>
                        📌 Tomorrow&apos;s Topic:
                      </span>
                      <input
                        type="text"
                        placeholder="Queue topic for tomorrow to avoid hesitation (e.g. Sliding Window edge cases)..."
                        value={currentInput.nextDayQueue || ""}
                        onChange={(e) => {
                          const val = e.target.value;
                          setDailyTaskInputs((prev) => ({
                            ...prev,
                            [task.id]: {
                              ...(prev[task.id] || {}),
                              nextDayQueue: val,
                            },
                          }));
                        }}
                        style={{
                          flex: 1,
                          minWidth: 200,
                          padding: "6px 10px",
                          background: "var(--input-bg)",
                          border: "1px solid var(--border-light)",
                          borderRadius: 6,
                          color: "var(--text-primary)",
                          fontSize: "0.84rem",
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => handleSaveTomorrowQueue(task, currentInput.nextDayQueue)}
                        className="btn-secondary"
                        style={{ fontSize: "0.8rem", padding: "6px 12px" }}
                      >
                        Lock In Tomorrow
                      </button>
                    </div>

                    {/* ═══════════════════════════════════════════════════════════════
                        DAILY CHECK-IN WITH CONFIGURED CUSTOM FIELDS
                    ════════════════════════════════════════════════════════════════ */}
                    <div
                      style={{
                        padding: "1.2rem",
                        background: "var(--bg-base)",
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
                                  placeholder="Enter number completed..."
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
                                  placeholder="e.g. Dynamic Programming, Two Pointers, Next.js Server Actions..."
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
                                ✍️ {field.label} (Daily reflection & notebook summary)
                              </label>
                              <input
                                type="text"
                                placeholder="Save reflections, breakthroughs, concepts learned..."
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
                            padding: "9px 22px",
                            fontSize: "0.88rem",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 6,
                          }}
                        >
                          <span>⚡</span>
                          {isCheckedToday ? "Update Today's Entry" : "Maintain Streak & Save (+10 pts)"}
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
                              background: "var(--bg-base)",
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
                                  <div style={{ display: "flex", justifyContent: "space-between", color: "var(--accent-brand)", fontWeight: 700 }}>
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
                  background: "var(--bg-surface)",
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
                  background: "var(--bg-surface)",
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
            <div className="glass-card" style={{ padding: "2rem", textAlign: "center", borderRadius: 12, background: "var(--bg-surface)" }}>
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
                    background: "var(--bg-surface)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 12,
                    flexWrap: "wrap",
                    border: "1px solid var(--border-subtle)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1, minWidth: 240 }}>
                    <button
                      type="button"
                      onClick={() => handleUpdateStatus(task.id, task.status)}
                      style={{
                        width: 22,
                        height: 22,
                        borderRadius: "50%",
                        border: "2px solid var(--border-subtle)",
                        background:
                          task.status === "completed"
                            ? "#10b981"
                            : task.status === "in_progress"
                            ? "#0284c7"
                            : "transparent",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#fff",
                        fontSize: 12,
                        flexShrink: 0,
                      }}
                      title={`Status: ${task.status}. Click to cycle.`}
                    >
                      {task.status === "completed" ? "✓" : task.status === "in_progress" ? "•" : ""}
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
                      <div style={{ display: "flex", gap: 8, marginTop: 4, alignItems: "center", fontSize: 11 }}>
                        <span
                          style={{
                            padding: "2px 8px",
                            borderRadius: 10,
                            background: "var(--badge-bg)",
                            color: "var(--text-secondary)",
                          }}
                        >
                          {task.category}
                        </span>
                        <span style={{ color: getPriorityColor(task.priority), fontWeight: 700 }}>
                          {task.priority} Priority
                        </span>
                        {task.dueDate && (
                          <span style={{ color: "var(--text-secondary)" }}>Due: {task.dueDate}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <button
                      type="button"
                      onClick={() => handleDeleteTask(task.id, task.title)}
                      style={{
                        background: "transparent",
                        border: "none",
                        color: "#f43f5e",
                        cursor: "pointer",
                        fontSize: 14,
                        padding: "4px 8px",
                      }}
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════
          MODAL 1: IDENTITY SHIFT & ENVIRONMENT LOCK-IN MODAL
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
              width: "min(560px, 94vw)",
              padding: "2rem",
              borderRadius: 16,
              background: "var(--bg-surface)",
              border: "2px solid var(--accent-brand)",
              boxShadow: "0 20px 50px rgba(0, 0, 0, 0.4)",
              animation: "slideDownFade 0.25s ease-out",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 22 }}>🗣️</span>
                <h3 style={{ fontSize: "1.2rem", margin: 0, fontWeight: 900, color: "var(--text-primary)" }}>
                  Identity Shift & Lock-In Protocol
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setAffirmationModalHabit(null)}
                style={{ background: "transparent", border: "none", color: "var(--text-secondary)", fontSize: 20, cursor: "pointer" }}
              >
                ✕
              </button>
            </div>

            <p style={{ color: "var(--text-secondary)", fontSize: "0.88rem", margin: "0 0 16px" }}>
              Notebook instruction: <em>&ldquo;Fake it till you make it. Everyday say yourself the affirmation out loud with unshakeable confidence.&rdquo;</em>
            </p>

            {/* Glowing Affirmation Box */}
            <div
              style={{
                padding: "1.4rem",
                borderRadius: 12,
                background: "linear-gradient(135deg, rgba(2, 132, 199, 0.15) 0%, rgba(14, 165, 233, 0.25) 100%)",
                border: "1.5px solid var(--accent-brand)",
                textAlign: "center",
                marginBottom: 20,
              }}
            >
              <div style={{ fontSize: 11, fontWeight: 800, color: "var(--accent-brand)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>
                Recite Out Loud
              </div>
              <div
                style={{
                  fontSize: "1.4rem",
                  fontWeight: 900,
                  color: "var(--text-primary)",
                  lineHeight: 1.4,
                  letterSpacing: "-0.01em",
                }}
              >
                &ldquo;{affirmationModalHabit.affirmation}&rdquo;
              </div>

              <div style={{ marginTop: 12 }}>
                <button
                  type="button"
                  onClick={() => speakAffirmation(affirmationModalHabit.affirmation)}
                  style={{
                    background: "rgba(255,255,255,0.08)",
                    border: "1px solid var(--border-subtle)",
                    color: "var(--text-primary)",
                    borderRadius: 8,
                    fontSize: 12,
                    fontWeight: 700,
                    padding: "5px 12px",
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <span>🔊</span> Listen Affirmation Audio
                </button>
              </div>
            </div>

            {/* Environment Cue Verification Checklist */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: "var(--text-primary)", marginBottom: 8 }}>
                Environment Design Checklist (Notebook Setup):
              </div>
              <div style={{ display: "grid", gap: 8 }}>
                <label style={{ display: "flex", alignItems: "center", gap: 10, fontSize: "0.88rem", color: "var(--text-primary)", cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={envChecklist.notebook}
                    onChange={(e) => setEnvChecklist((prev) => ({ ...prev, notebook: e.target.checked }))}
                  />
                  <span>Dedicated notebook opened & topic queue verified</span>
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: 10, fontSize: "0.88rem", color: "var(--text-primary)", cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={envChecklist.phoneAway}
                    onChange={(e) => setEnvChecklist((prev) => ({ ...prev, phoneAway: e.target.checked }))}
                  />
                  <span>Phone kept aside & notifications silenced</span>
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: 10, fontSize: "0.88rem", color: "var(--text-primary)", cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={envChecklist.distractionsClosed}
                    onChange={(e) => setEnvChecklist((prev) => ({ ...prev, distractionsClosed: e.target.checked }))}
                  />
                  <span>All unrelated browser tabs & apps closed</span>
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: 10, fontSize: "0.88rem", color: "var(--text-primary)", cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={envChecklist.musicPlaying}
                    onChange={(e) => setEnvChecklist((prev) => ({ ...prev, musicPlaying: e.target.checked }))}
                  />
                  <span>Fixed focus music / workout playlist running</span>
                </label>
              </div>
            </div>

            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button
                type="button"
                onClick={() => setAffirmationModalHabit(null)}
                className="btn-secondary"
                style={{ padding: "8px 16px", fontSize: "0.88rem" }}
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  toggleTimer(affirmationModalHabit.id);
                  setAffirmationModalHabit(null);
                  showToast("⚡ Environment locked in! Focus timer started.", "success");
                }}
                className="btn-lime"
                style={{ padding: "8px 20px", fontSize: "0.88rem" }}
              >
                ✓ I Recited &amp; Environment is Set &rarr; Start Focus Block
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════
          MODAL 2: 7-DAY REWARD LOOP UNLOCK MODAL
      ════════════════════════════════════════════════════════════════════════ */}
      {rewardModalHabit && (
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
              padding: "2rem",
              borderRadius: 16,
              background: "var(--bg-surface)",
              border: "2px solid #10b981",
              boxShadow: "0 20px 50px rgba(0, 0, 0, 0.4)",
              animation: "slideDownFade 0.25s ease-out",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 24 }}>🎁</span>
                <h3 style={{ fontSize: "1.2rem", margin: 0, fontWeight: 900, color: "var(--text-primary)" }}>
                  7-Day Reward Loop (Notebook Audit)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setRewardModalHabit(null)}
                style={{ background: "transparent", border: "none", color: "var(--text-secondary)", fontSize: 20, cursor: "pointer" }}
              >
                ✕
              </button>
            </div>

            <div style={{ textAlign: "center", padding: "1.5rem 1rem" }}>
              <div style={{ fontSize: 48, marginBottom: 10 }}>🎉</div>
              <h4 style={{ fontSize: "1.25rem", margin: "0 0 8px", color: "#10b981", fontWeight: 900 }}>
                {rewardModalHabit.currentStreak} Days Streak on {rewardModalHabit.title}
              </h4>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.92rem", marginBottom: 16 }}>
                Your handwritten notebook reward condition for this pillar:
              </p>

              <div
                style={{
                  padding: "1.2rem",
                  borderRadius: 12,
                  background: "rgba(16, 185, 129, 0.15)",
                  border: "1.5px solid #10b981",
                  color: "var(--text-primary)",
                  fontSize: "1.1rem",
                  fontWeight: 800,
                  lineHeight: 1.5,
                }}
              >
                &ldquo;{rewardModalHabit.weeklyReward}&rdquo;
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}>
              <button
                type="button"
                onClick={() => setRewardModalHabit(null)}
                className="btn-lime"
                style={{ padding: "8px 22px", fontSize: "0.9rem" }}
              >
                Claimed & Done ✓
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════
          MODAL 3: SUNDAY GEMINI AI POINTS EVALUATION REPORT
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
              width: "min(680px, 94vw)",
              maxHeight: "90vh",
              overflowY: "auto",
              padding: "2rem",
              borderRadius: 16,
              background: "var(--bg-surface)",
              border: "2px solid var(--accent-brand)",
              boxShadow: "0 20px 50px rgba(0, 0, 0, 0.4)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 26 }}>🏆</span>
                <div>
                  <h3 style={{ fontSize: "1.25rem", margin: 0, fontWeight: 900, color: "var(--text-primary)" }}>
                    Sunday Weekly Streak Evaluation
                  </h3>
                  <div style={{ fontSize: 11, color: "var(--text-secondary)" }}>
                    Calculated via Gemini AI Coach &bull; Evaluated out of 350 Points Max
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowEvaluationModal(false)}
                style={{ background: "transparent", border: "none", color: "var(--text-secondary)", fontSize: 20, cursor: "pointer" }}
              >
                ✕
              </button>
            </div>

            {/* Score & Grade Hero */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "1.4rem",
                borderRadius: 12,
                background: "var(--bg-base)",
                border: "1px solid var(--border-subtle)",
                marginBottom: 16,
              }}
            >
              <div>
                <div style={{ fontSize: 12, fontWeight: 800, color: "var(--text-secondary)", textTransform: "uppercase" }}>
                  Weekly Points Awarded
                </div>
                <div style={{ fontSize: "2.4rem", fontWeight: 900, color: "var(--accent-brand)", lineHeight: 1.1, marginTop: 4 }}>
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
                  background: "var(--bg-base)",
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
                        background: "var(--bg-base)",
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

                      <div style={{ fontWeight: 800, color: "var(--accent-brand)", fontSize: "1rem" }}>
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
          MODAL 4: PAST SUNDAY EVALUATIONS ARCHIVE
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
              background: "var(--bg-surface)",
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
                    background: "var(--bg-base)",
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
        @keyframes pulseLockdown {
          0%, 100% {
            border-color: #e11d48;
            box-shadow: 0 8px 30px rgba(225, 29, 72, 0.25);
          }
          50% {
            border-color: #f43f5e;
            box-shadow: 0 12px 40px rgba(244, 63, 94, 0.45);
          }
        }
      `}</style>
    </div>
  );
}