import prisma from './prisma.js';
import fs from 'fs';
import path from 'path';

// Local storage paths for fallback & static cache
const PROFILE_FILE = path.join(process.cwd(), 'src', 'data', 'profile.json');
const PROJECTS_FILE = path.join(process.cwd(), 'src', 'data', 'projects.json');
const SKILLS_FILE = path.join(process.cwd(), 'src', 'data', 'skills.json');
const TASKS_FILE = path.join(process.cwd(), 'src', 'data', 'tasks.json');
const MESSAGES_FILE = path.join(process.cwd(), 'src', 'data', 'messages.json');
const VAULT_FILE = path.join(process.cwd(), 'src', 'data', 'vault.json');
const STREAK_EVALUATIONS_FILE = path.join(process.cwd(), 'src', 'data', 'streak_evaluations.json');
const VAULT_FOLDERS_FILE = path.join(process.cwd(), 'src', 'data', 'vault_folders.json');

function readFile(filePath, fallback) {
  try {
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    }
  } catch (err) {
    console.error(`Error reading ${filePath}:`, err);
  }
  return fallback;
}

const defaultProfile = readFile(PROFILE_FILE, {});
const defaultProjects = readFile(PROJECTS_FILE, []);
const defaultSkills = readFile(SKILLS_FILE, []);
const defaultTasks = readFile(TASKS_FILE, []);
const defaultVaultNotes = readFile(VAULT_FILE, []);

function writeFile(filePath, data) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error(`Error writing ${filePath}:`, err);
  }
}

// ── Profile Normalizer ───────────────────────────────────────────────────────
export function normalizeProfile(raw) {
  if (!raw) return defaultProfile;

  let parsedPhotos = [];
  if (Array.isArray(raw.photos)) {
    parsedPhotos = raw.photos;
  } else if (typeof raw.photos === 'string' && raw.photos.startsWith('[')) {
    try {
      parsedPhotos = JSON.parse(raw.photos);
    } catch {
      parsedPhotos = [];
    }
  }

  let parsedBackgrounds = {};
  if (raw.themeBackgrounds && typeof raw.themeBackgrounds === 'object') {
    parsedBackgrounds = raw.themeBackgrounds;
  } else if (typeof raw.themeBackgrounds === 'string' && raw.themeBackgrounds.startsWith('{')) {
    try {
      parsedBackgrounds = JSON.parse(raw.themeBackgrounds);
    } catch {
      parsedBackgrounds = {};
    }
  }

  return {
    ...defaultProfile,
    ...raw,
    avatarUrl: raw.avatarUrl || defaultProfile.avatarUrl || '/images/avatar.png',
    activePhoto: raw.activePhoto || raw.avatarUrl || defaultProfile.activePhoto || '/images/vivek-portrait-cutout.png',
    photos: parsedPhotos,
    resumeUrl: raw.resumeUrl !== undefined ? raw.resumeUrl : (defaultProfile.resumeUrl || ''),
    cgpa: raw.cgpa || defaultProfile.cgpa || '9.21 / 10',
    finalSemSgpa: raw.finalSemSgpa || defaultProfile.finalSemSgpa || '10.00 / 10',
    gateStatus: raw.gateStatus || defaultProfile.gateStatus || 'GATE 2026 Qualified',
    themeBackgrounds: {
      dark: parsedBackgrounds.dark || defaultProfile.themeBackgrounds?.dark || '/images/bg-theme-1.jpg',
      warmAmber: parsedBackgrounds.warmAmber || defaultProfile.themeBackgrounds?.warmAmber || '/images/bg-theme-2.jpg',
      electricCyan: parsedBackgrounds.electricCyan || defaultProfile.themeBackgrounds?.electricCyan || '/images/bg-theme-3.jpg',
    },
    education: {
      degree: raw.education?.degree || raw.degree || defaultProfile.education.degree,
      institution: raw.education?.institution || raw.institution || defaultProfile.education.institution,
      period: raw.education?.period || raw.period || defaultProfile.education.period,
      location: raw.education?.location || defaultProfile.education.location,
      status: raw.education?.status || defaultProfile.education.status,
    },
    interests: Array.isArray(raw.interests) && raw.interests.length > 0 ? raw.interests : defaultProfile.interests,
  };
}

// ── Profile ─────────────────────────────────────────────────────────────────
export async function getProfile() {
  const fileData = readFile(PROFILE_FILE, defaultProfile);
  if (prisma) {
    try {
      const p = await prisma.profile.findFirst();
      if (p) {
        return normalizeProfile({
          ...fileData,
          ...p,
        });
      } else {
        // Seed default profile into database
        await prisma.profile.create({
          data: {
            id: 'profile-1',
            name: fileData.name || defaultProfile.name,
            role: fileData.role || defaultProfile.role,
            tagline: fileData.tagline || defaultProfile.tagline,
            about: fileData.about || defaultProfile.about,
            degree: fileData.education?.degree || fileData.degree || defaultProfile.education.degree,
            institution: fileData.education?.institution || fileData.institution || defaultProfile.education.institution,
            period: fileData.education?.period || fileData.period || defaultProfile.education.period,
            location: fileData.location || defaultProfile.location,
            status: fileData.status || defaultProfile.status,
            email: fileData.email || defaultProfile.email,
            github: fileData.github || defaultProfile.github,
            linkedin: fileData.linkedin || defaultProfile.linkedin,
            leetcode: fileData.leetcode || defaultProfile.leetcode,
            avatarUrl: fileData.avatarUrl || defaultProfile.avatarUrl,
            activePhoto: fileData.activePhoto || defaultProfile.activePhoto,
            photos: JSON.stringify(fileData.photos || []),
            resumeUrl: fileData.resumeUrl || defaultProfile.resumeUrl || '',
            cgpa: fileData.cgpa || defaultProfile.cgpa || '9.21 / 10',
            finalSemSgpa: fileData.finalSemSgpa || defaultProfile.finalSemSgpa || '10.00 / 10',
            gateStatus: fileData.gateStatus || defaultProfile.gateStatus || 'GATE 2026 Qualified',
            themeBackgrounds: JSON.stringify(fileData.themeBackgrounds || defaultProfile.themeBackgrounds || {}),
          },
        });
        return normalizeProfile(fileData);
      }
    } catch (e) {
      console.warn('Prisma getProfile fallback to local file:', e.message);
    }
  }
  return normalizeProfile(fileData);
}

export async function updateProfile(data) {
  const current = await getProfile();
  const merged = { ...current, ...data };
  const normalizedInput = normalizeProfile(merged);

  if (prisma) {
    try {
      await prisma.profile.upsert({
        where: { id: 'profile-1' },
        create: {
          id: 'profile-1',
          name: normalizedInput.name,
          role: normalizedInput.role,
          tagline: normalizedInput.tagline,
          about: normalizedInput.about,
          degree: normalizedInput.education.degree,
          institution: normalizedInput.education.institution,
          period: normalizedInput.education.period,
          location: normalizedInput.location,
          status: normalizedInput.status,
          email: normalizedInput.email,
          github: normalizedInput.github,
          linkedin: normalizedInput.linkedin,
          leetcode: normalizedInput.leetcode,
          avatarUrl: normalizedInput.avatarUrl,
          activePhoto: normalizedInput.activePhoto,
          photos: JSON.stringify(normalizedInput.photos || []),
          resumeUrl: normalizedInput.resumeUrl || '',
          cgpa: normalizedInput.cgpa || '',
          finalSemSgpa: normalizedInput.finalSemSgpa || '',
          gateStatus: normalizedInput.gateStatus || '',
          themeBackgrounds: JSON.stringify(normalizedInput.themeBackgrounds || {}),
        },
        update: {
          name: normalizedInput.name,
          role: normalizedInput.role,
          tagline: normalizedInput.tagline,
          about: normalizedInput.about,
          degree: normalizedInput.education.degree,
          institution: normalizedInput.education.institution,
          period: normalizedInput.education.period,
          location: normalizedInput.location,
          status: normalizedInput.status,
          email: normalizedInput.email,
          github: normalizedInput.github,
          linkedin: normalizedInput.linkedin,
          leetcode: normalizedInput.leetcode,
          avatarUrl: normalizedInput.avatarUrl,
          activePhoto: normalizedInput.activePhoto,
          photos: JSON.stringify(normalizedInput.photos || []),
          resumeUrl: normalizedInput.resumeUrl || '',
          cgpa: normalizedInput.cgpa || '',
          finalSemSgpa: normalizedInput.finalSemSgpa || '',
          gateStatus: normalizedInput.gateStatus || '',
          themeBackgrounds: JSON.stringify(normalizedInput.themeBackgrounds || {}),
        },
      });
    } catch (e) {
      console.warn('Prisma updateProfile fallback:', e.message);
    }
  }

  writeFile(PROFILE_FILE, normalizedInput);
  return normalizedInput;
}

// ── Projects ────────────────────────────────────────────────────────────────
function mapDbProject(p) {
  let parsedFeatures = [];
  if (Array.isArray(p.keyFeatures)) {
    parsedFeatures = p.keyFeatures;
  } else if (typeof p.keyFeatures === 'string' && p.keyFeatures.startsWith('[')) {
    try {
      parsedFeatures = JSON.parse(p.keyFeatures);
    } catch {
      parsedFeatures = [];
    }
  }

  const tagsArr = Array.isArray(p.tags)
    ? p.tags
    : typeof p.tags === 'string' && p.tags
    ? p.tags.split(',').map((t) => t.trim()).filter(Boolean)
    : [];

  return {
    id: p.id,
    name: p.name,
    subtitle: p.subtitle || '',
    description: p.description || '',
    category: p.category || 'Full Stack',
    tags: tagsArr,
    icon: p.icon || 'Globe',
    link: p.link || p.liveUrl || '',
    liveUrl: p.liveUrl || p.link || '',
    github: p.github || p.githubUrl || '',
    githubUrl: p.githubUrl || p.github || '',
    featured: Boolean(p.featured),
    order: p.order !== undefined ? p.order : 0,
    problem: p.problem || '',
    solution: p.solution || '',
    keyFeatures: parsedFeatures,
    architecture: p.architecture || '',
  };
}

export async function getProjects() {
  if (prisma) {
    try {
      const dbProjects = await prisma.project.findMany({
        orderBy: { order: 'asc' },
      });
      if (dbProjects && dbProjects.length > 0) {
        return dbProjects.map(mapDbProject);
      }
    } catch (e) {
      console.warn('Prisma getProjects fallback:', e.message);
    }
  }
  return readFile(PROJECTS_FILE, defaultProjects);
}

export async function addProject(projectData) {
  const tagsStr = Array.isArray(projectData.tags)
    ? projectData.tags.join(', ')
    : projectData.tags || '';

  const id = projectData.id || `proj-${Date.now()}`;
  const keyFeaturesStr = JSON.stringify(
    Array.isArray(projectData.keyFeatures) ? projectData.keyFeatures : []
  );

  const newProject = {
    id,
    name: projectData.name,
    subtitle: projectData.subtitle || '',
    description: projectData.description || '',
    category: projectData.category || 'Full Stack',
    tags: tagsStr.split(',').map((t) => t.trim()).filter(Boolean),
    icon: projectData.icon || 'Globe',
    link: projectData.link || projectData.liveUrl || '',
    liveUrl: projectData.liveUrl || projectData.link || '',
    github: projectData.github || projectData.githubUrl || '',
    githubUrl: projectData.githubUrl || projectData.github || '',
    featured: Boolean(projectData.featured),
    order: Number(projectData.order) || 0,
    problem: projectData.problem || '',
    solution: projectData.solution || '',
    keyFeatures: Array.isArray(projectData.keyFeatures) ? projectData.keyFeatures : [],
    architecture: projectData.architecture || '',
  };

  if (prisma) {
    try {
      await prisma.project.create({
        data: {
          id: newProject.id,
          name: newProject.name,
          subtitle: newProject.subtitle,
          description: newProject.description,
          category: newProject.category,
          tags: tagsStr,
          icon: newProject.icon,
          link: newProject.link,
          liveUrl: newProject.liveUrl,
          github: newProject.github,
          githubUrl: newProject.githubUrl,
          featured: newProject.featured,
          order: newProject.order,
          problem: newProject.problem,
          solution: newProject.solution,
          keyFeatures: keyFeaturesStr,
          architecture: newProject.architecture,
        },
      });
    } catch (e) {
      console.warn('Prisma addProject fallback:', e.message);
    }
  }

  const current = await getProjects();
  const updated = [newProject, ...current.filter((p) => p.id !== id)];
  writeFile(PROJECTS_FILE, updated);
  return newProject;
}

export async function updateProject(id, projectData) {
  const tagsStr = Array.isArray(projectData.tags)
    ? projectData.tags.join(', ')
    : projectData.tags || '';

  const keyFeaturesStr = JSON.stringify(
    Array.isArray(projectData.keyFeatures) ? projectData.keyFeatures : []
  );

  if (prisma) {
    try {
      await prisma.project.update({
        where: { id },
        data: {
          name: projectData.name,
          subtitle: projectData.subtitle,
          description: projectData.description,
          category: projectData.category,
          tags: tagsStr,
          icon: projectData.icon || 'Globe',
          link: projectData.link || projectData.liveUrl || '',
          liveUrl: projectData.liveUrl || projectData.link || '',
          github: projectData.github || projectData.githubUrl || '',
          githubUrl: projectData.githubUrl || projectData.github || '',
          featured: Boolean(projectData.featured),
          order: Number(projectData.order) || 0,
          problem: projectData.problem || '',
          solution: projectData.solution || '',
          keyFeatures: keyFeaturesStr,
          architecture: projectData.architecture || '',
        },
      });
    } catch (e) {
      console.warn('Prisma updateProject fallback:', e.message);
    }
  }

  const current = await getProjects();
  const updated = current.map((p) =>
    p.id === id || p.name === id
      ? {
          ...p,
          ...projectData,
          tags: tagsStr.split(',').map((t) => t.trim()).filter(Boolean),
          keyFeatures: Array.isArray(projectData.keyFeatures) ? projectData.keyFeatures : p.keyFeatures,
        }
      : p
  );
  writeFile(PROJECTS_FILE, updated);
  return true;
}

export async function deleteProject(id) {
  if (prisma) {
    try {
      await prisma.project.delete({ where: { id } }).catch(() => {});
    } catch (e) {
      console.warn('Prisma deleteProject fallback:', e.message);
    }
  }

  const current = await getProjects();
  const updated = current.filter((p) => p.id !== id && p.name !== id);
  writeFile(PROJECTS_FILE, updated);
  return true;
}

// ── Skills ──────────────────────────────────────────────────────────────────
export async function getSkills() {
  if (prisma) {
    try {
      const dbSkills = await prisma.skill.findMany({
        orderBy: { createdAt: 'asc' },
      });
      if (dbSkills && dbSkills.length > 0) {
        const groups = {};
        dbSkills.forEach((s) => {
          if (!groups[s.category]) {
            groups[s.category] = {
              category: s.category,
              icon: s.categoryIcon || 'Code2',
              items: [],
            };
          }
          groups[s.category].items.push({
            id: s.id,
            name: s.name,
            level: s.level,
            badge: s.badge,
            percentage: Number(s.percentage) || 85,
          });
        });
        return Object.values(groups);
      }
    } catch (e) {
      console.warn('Prisma getSkills fallback:', e.message);
    }
  }
  return readFile(SKILLS_FILE, defaultSkills);
}

export async function addSkill(categoryName, skillItem) {
  const current = await getSkills();
  let found = false;
  const updated = current.map((cat) => {
    if (cat.category.toLowerCase() === categoryName.toLowerCase()) {
      found = true;
      const existingIdx = cat.items.findIndex(
        (i) => i.name.toLowerCase() === skillItem.name.toLowerCase()
      );
      if (existingIdx >= 0) {
        cat.items[existingIdx] = { ...cat.items[existingIdx], ...skillItem };
      } else {
        cat.items.push(skillItem);
      }
      return { ...cat, items: [...cat.items] };
    }
    return cat;
  });

  if (!found) {
    updated.push({
      category: categoryName,
      icon: skillItem.categoryIcon || 'Code2',
      items: [skillItem],
    });
  }

  // Sync to PostgreSQL
  if (prisma) {
    try {
      const existing = await prisma.skill.findFirst({
        where: {
          category: categoryName,
          name: skillItem.name,
        },
      });

      if (existing) {
        await prisma.skill.update({
          where: { id: existing.id },
          data: {
            level: skillItem.level || 'Intermediate',
            badge: skillItem.badge || null,
            percentage: Number(skillItem.percentage) || 85,
            categoryIcon: skillItem.categoryIcon || 'Code2',
          },
        });
      } else {
        await prisma.skill.create({
          data: {
            category: categoryName,
            name: skillItem.name,
            level: skillItem.level || 'Intermediate',
            badge: skillItem.badge || null,
            percentage: Number(skillItem.percentage) || 85,
            categoryIcon: skillItem.categoryIcon || 'Code2',
          },
        });
      }
    } catch (e) {
      console.warn('Prisma addSkill fallback:', e.message);
    }
  }

  writeFile(SKILLS_FILE, updated);
  return updated;
}

export async function deleteSkill(categoryName, skillName) {
  const current = await getSkills();
  const updated = current.map((cat) => {
    if (cat.category.toLowerCase() === categoryName.toLowerCase()) {
      return {
        ...cat,
        items: cat.items.filter((i) => i.name.toLowerCase() !== skillName.toLowerCase()),
      };
    }
    return cat;
  });

  if (prisma) {
    try {
      await prisma.skill.deleteMany({
        where: {
          category: categoryName,
          name: skillName,
        },
      });
    } catch (e) {
      console.warn('Prisma deleteSkill fallback:', e.message);
    }
  }

  writeFile(SKILLS_FILE, updated);
  return updated;
}

export async function addSkillCategory(categoryName, icon = 'Code2') {
  const current = await getSkills();
  const exists = current.some((c) => c.category.toLowerCase() === categoryName.toLowerCase());
  if (!exists) {
    current.push({ category: categoryName, icon, items: [] });
    writeFile(SKILLS_FILE, current);
  }
  return current;
}

export async function deleteSkillCategory(categoryName) {
  const current = await getSkills();
  const updated = current.filter((c) => c.category.toLowerCase() !== categoryName.toLowerCase());

  if (prisma) {
    try {
      await prisma.skill.deleteMany({
        where: { category: categoryName },
      });
    } catch (e) {
      console.warn('Prisma deleteSkillCategory fallback:', e.message);
    }
  }

  writeFile(SKILLS_FILE, updated);
  return updated;
}

// ── Tasks & Streaks ─────────────────────────────────────────────────────────
export function normalizeTask(t) {
  if (!t) return t;
  let extra = {};
  if (t.extraData && typeof t.extraData === 'string' && t.extraData.startsWith('{')) {
    try {
      extra = JSON.parse(t.extraData);
    } catch {}
  } else if (t.dueDate && typeof t.dueDate === 'string' && t.dueDate.startsWith('{')) {
    try {
      extra = JSON.parse(t.dueDate);
    } catch {}
  }

  const isStreak = t.category === 'Streak';

  const defaultFields = isStreak
    ? [
        { id: 'number_done', label: 'Number / Problems Completed', type: 'number', target: '5' },
        { id: 'topics_read', label: 'Topics & Concepts Read', type: 'topics', target: 'DSA, System Design' },
        { id: 'daily_notes', label: 'Daily Reflection & Small Text', type: 'text', target: 'Notes' },
      ]
    : [];

  const rawFields =
    Array.isArray(t.fields) && t.fields.length > 0
      ? t.fields
      : Array.isArray(extra.fields) && extra.fields.length > 0
      ? extra.fields
      : defaultFields;

  return {
    ...t,
    category: t.category || 'General',
    priority: t.priority || 'Medium',
    status: t.status || 'todo',
    fields: rawFields,
    goalDays: Number(
      t.goalDays !== undefined ? t.goalDays : extra.goalDays !== undefined ? extra.goalDays : isStreak ? 30 : 0
    ),
    currentStreak: Number(t.currentStreak !== undefined ? t.currentStreak : extra.currentStreak || 0),
    bestStreak: Number(t.bestStreak !== undefined ? t.bestStreak : extra.bestStreak || 0),
    lastCheckedDate: t.lastCheckedDate || extra.lastCheckedDate || t.lastChecked || null,
    dailyLog: t.dailyLog || extra.dailyLog || '',
    history: Array.isArray(t.history) ? t.history : Array.isArray(extra.history) ? extra.history : [],
    weeklyPoints: Number(t.weeklyPoints !== undefined ? t.weeklyPoints : extra.weeklyPoints || 0),
    totalPoints: Number(t.totalPoints !== undefined ? t.totalPoints : extra.totalPoints || 0),
    lastEvaluatedDate: t.lastEvaluatedDate || extra.lastEvaluatedDate || null,
  };
}

export async function getTasks() {
  let tasks = [];
  if (prisma) {
    try {
      const dbTasks = await prisma.task.findMany({
        orderBy: { createdAt: 'desc' },
      });
      if (dbTasks && dbTasks.length > 0) {
        tasks = dbTasks;
      }
    } catch (e) {
      console.warn('Prisma getTasks fallback:', e.message);
    }
  }

  if (tasks.length === 0) {
    tasks = readFile(TASKS_FILE, defaultTasks);
  }

  return tasks.map(normalizeTask);
}

export async function addTask(taskData) {
  const current = await getTasks();
  const isStreak = taskData.category === 'Streak';

  // Enforce Max 5 Streak Tasks rule
  if (isStreak) {
    const existingStreaks = current.filter((t) => t.category === 'Streak');
    if (existingStreaks.length >= 5) {
      throw new Error('Maximum of 5 Streak tasks allowed. Complete or delete an existing streak task first.');
    }
  }

  const defaultFields = isStreak
    ? [
        { id: 'number_done', label: 'Number / Problems Completed', type: 'number', target: '5' },
        { id: 'topics_read', label: 'Topics & Concepts Read', type: 'topics', target: 'DSA, System Design' },
        { id: 'daily_notes', label: 'Daily Reflection & Small Text', type: 'text', target: 'Notes' },
      ]
    : [];

  const configuredFields =
    Array.isArray(taskData.fields) && taskData.fields.length > 0 ? taskData.fields : defaultFields;

  const streakExtra = {
    fields: configuredFields,
    goalDays: Number(taskData.goalDays) || 30,
    currentStreak: Number(taskData.currentStreak) || 0,
    bestStreak: Number(taskData.bestStreak) || 0,
    lastCheckedDate: taskData.lastCheckedDate || null,
    dailyLog: taskData.dailyLog || '',
    history: Array.isArray(taskData.history) ? taskData.history : [],
    weeklyPoints: Number(taskData.weeklyPoints) || 0,
    totalPoints: Number(taskData.totalPoints) || 0,
  };

  const newTask = {
    id: `task-${Date.now()}`,
    title: taskData.title?.trim() || 'Untitled Task',
    category: taskData.category || 'General',
    priority: taskData.priority || 'Medium',
    status: isStreak ? 'in_progress' : 'todo',
    dueDate: isStreak ? `${streakExtra.goalDays}-Day Goal` : taskData.dueDate || 'Soon',
    ...streakExtra,
    createdAt: new Date().toISOString().split('T')[0],
  };

  if (prisma) {
    try {
      await prisma.task.create({
        data: {
          id: newTask.id,
          title: newTask.title,
          category: newTask.category,
          priority: newTask.priority,
          status: newTask.status,
          dueDate: newTask.dueDate,
          goalDays: streakExtra.goalDays,
          currentStreak: streakExtra.currentStreak,
          bestStreak: streakExtra.bestStreak,
          lastChecked: streakExtra.lastCheckedDate,
          weeklyPoints: streakExtra.weeklyPoints,
          totalPoints: streakExtra.totalPoints,
          extraData: JSON.stringify(streakExtra),
        },
      });
    } catch (e) {
      console.warn('Prisma addTask fallback:', e.message);
    }
  }

  const updatedTasks = [newTask, ...current];
  writeFile(TASKS_FILE, updatedTasks);
  return newTask;
}

export async function updateTaskStatus(id, status) {
  const current = await getTasks();
  const updated = current.map((t) => (t.id === id ? { ...t, status } : t));

  if (prisma) {
    try {
      await prisma.task.update({
        where: { id },
        data: { status },
      });
    } catch (e) {
      console.warn('Prisma updateTaskStatus fallback:', e.message);
    }
  }

  writeFile(TASKS_FILE, updated);
  return updated;
}

export async function checkInStreak(
  id,
  dailyLog = '',
  customDate = null,
  fieldValues = {},
  topics = [],
  numberDone = null
) {
  const current = await getTasks();
  const taskIndex = current.findIndex((t) => t.id === id);
  if (taskIndex === -1) {
    throw new Error('Streak task not found');
  }

  const task = current[taskIndex];
  const todayStr = customDate || new Date().toISOString().split('T')[0];
  const trimmedLog = dailyLog?.trim() || '';

  const topicsArray = Array.isArray(topics)
    ? topics
    : typeof topics === 'string' && topics
    ? topics.split(',').map((s) => s.trim()).filter(Boolean)
    : [];
  const parsedNumber =
    numberDone !== null && numberDone !== undefined && numberDone !== '' ? Number(numberDone) : undefined;

  let newStreak = task.currentStreak || 0;
  let newHistory = Array.isArray(task.history) ? [...task.history] : [];
  const isAlreadyCheckedToday = task.lastCheckedDate === todayStr;

  const logEntry = {
    id: `log-${Date.now()}`,
    date: todayStr,
    note: trimmedLog || 'Streak check-in completed.',
    numberDone: parsedNumber,
    topics: topicsArray,
    fieldValues: fieldValues || {},
    completed: true,
    updatedAt: new Date().toISOString(),
  };

  if (isAlreadyCheckedToday) {
    const existingLogIdx = newHistory.findIndex((h) => h.date === todayStr);
    if (existingLogIdx >= 0) {
      newHistory[existingLogIdx] = {
        ...newHistory[existingLogIdx],
        ...logEntry,
      };
    } else {
      newHistory.push(logEntry);
    }
  } else {
    let isConsecutive = false;
    if (task.lastCheckedDate) {
      const lastDate = new Date(task.lastCheckedDate);
      const currDate = new Date(todayStr);
      const diffTime = currDate.getTime() - lastDate.getTime();
      const diffDays = Math.round(diffTime / (1000 * 3600 * 24));
      if (diffDays === 1) {
        isConsecutive = true;
      }
    }

    if (isConsecutive || newStreak === 0) {
      newStreak += 1;
    } else {
      newStreak = 1;
    }

    newHistory.push(logEntry);
  }

  const bestStreak = Math.max(task.bestStreak || 0, newStreak);
  const goalDays = Number(task.goalDays) || 30;
  const isGoalReached = newStreak >= goalDays;

  const summaryParts = [];
  if (parsedNumber !== undefined) summaryParts.push(`Count: ${parsedNumber}`);
  if (topicsArray.length > 0) summaryParts.push(`Topics: ${topicsArray.join(', ')}`);
  if (trimmedLog) summaryParts.push(trimmedLog);
  const combinedLog = summaryParts.join(' | ') || trimmedLog || 'Check-in completed';

  const awardedPoints = isAlreadyCheckedToday ? 0 : 10;

  const updatedTask = {
    ...task,
    currentStreak: newStreak,
    bestStreak,
    lastCheckedDate: todayStr,
    dailyLog: combinedLog,
    history: newHistory,
    weeklyPoints: (task.weeklyPoints || 0) + awardedPoints,
    status: isGoalReached ? 'completed' : 'in_progress',
  };

  const updatedList = [...current];
  updatedList[taskIndex] = updatedTask;

  if (prisma) {
    try {
      const streakExtra = {
        fields: updatedTask.fields,
        goalDays: updatedTask.goalDays,
        currentStreak: updatedTask.currentStreak,
        bestStreak: updatedTask.bestStreak,
        lastCheckedDate: updatedTask.lastCheckedDate,
        dailyLog: updatedTask.dailyLog,
        history: updatedTask.history,
        weeklyPoints: updatedTask.weeklyPoints,
        totalPoints: updatedTask.totalPoints,
      };
      await prisma.task.update({
        where: { id },
        data: {
          status: updatedTask.status,
          currentStreak: updatedTask.currentStreak,
          bestStreak: updatedTask.bestStreak,
          lastChecked: updatedTask.lastCheckedDate,
          weeklyPoints: updatedTask.weeklyPoints,
          extraData: JSON.stringify(streakExtra),
          dueDate: JSON.stringify(streakExtra),
        },
      });
    } catch (e) {
      console.warn('Prisma checkInStreak fallback:', e.message);
    }
  }

  writeFile(TASKS_FILE, updatedList);
  return updatedList;
}

export async function updateStreakGoal(id, newGoalDays) {
  const current = await getTasks();
  const goalDaysNum = Math.max(1, Number(newGoalDays) || 30);

  const updated = current.map((t) => {
    if (t.id === id) {
      const isCompleted = (t.currentStreak || 0) >= goalDaysNum;
      return {
        ...t,
        goalDays: goalDaysNum,
        dueDate: `${goalDaysNum}-Day Goal`,
        status: isCompleted ? 'completed' : 'in_progress',
      };
    }
    return t;
  });

  if (prisma) {
    try {
      const target = updated.find((t) => t.id === id);
      if (target) {
        const streakExtra = {
          fields: target.fields,
          goalDays: target.goalDays,
          currentStreak: target.currentStreak,
          bestStreak: target.bestStreak,
          lastCheckedDate: target.lastCheckedDate,
          dailyLog: target.dailyLog,
          history: target.history,
          weeklyPoints: target.weeklyPoints,
          totalPoints: target.totalPoints,
        };
        await prisma.task.update({
          where: { id },
          data: {
            goalDays: target.goalDays,
            dueDate: `${target.goalDays}-Day Goal`,
            extraData: JSON.stringify(streakExtra),
            status: target.status,
          },
        });
      }
    } catch (e) {
      console.warn('Prisma updateStreakGoal fallback:', e.message);
    }
  }

  writeFile(TASKS_FILE, updated);
  return updated;
}

export async function evaluateSundayPoints() {
  const current = await getTasks();
  const streakTasks = current.filter((t) => t.category === 'Streak');

  if (streakTasks.length === 0) {
    throw new Error('No Streak tasks found to evaluate. Add streak tasks first!');
  }

  const evaluation = await evaluateStreaksWithGeminiAI(streakTasks);

  const existingEvals = await getStreakEvaluations();
  const newEvalRecord = {
    id: `eval-${Date.now()}`,
    ...evaluation,
  };
  const updatedEvals = [newEvalRecord, ...existingEvals];

  // Save evaluations to PostgreSQL
  if (prisma) {
    try {
      await prisma.systemData.upsert({
        where: { key: 'streak_evaluations' },
        create: { key: 'streak_evaluations', value: JSON.stringify(updatedEvals) },
        update: { value: JSON.stringify(updatedEvals) },
      });
    } catch (e) {
      console.warn('Prisma save streak_evaluations fallback:', e.message);
    }
  }
  writeFile(STREAK_EVALUATIONS_FILE, updatedEvals);

  // Apply points to tasks and RESET weeklyPoints to 0 for Sunday
  const updatedTasks = current.map((t) => {
    if (t.category === 'Streak') {
      const taskBreakdown = evaluation.perTaskBreakdown?.find(
        (b) => b.taskTitle?.toLowerCase() === t.title?.toLowerCase()
      );
      const awardedPoints = taskBreakdown?.points || 55;

      return {
        ...t,
        totalPoints: (t.totalPoints || 0) + awardedPoints,
        weeklyPoints: 0,
        lastEvaluatedDate: new Date().toISOString(),
      };
    }
    return t;
  });

  if (prisma) {
    try {
      for (const t of updatedTasks) {
        if (t.category === 'Streak') {
          const streakExtra = {
            fields: t.fields,
            goalDays: t.goalDays,
            currentStreak: t.currentStreak,
            bestStreak: t.bestStreak,
            lastCheckedDate: t.lastCheckedDate,
            dailyLog: t.dailyLog,
            history: t.history,
            weeklyPoints: 0,
            totalPoints: t.totalPoints,
            lastEvaluatedDate: t.lastEvaluatedDate,
          };
          await prisma.task.update({
            where: { id: t.id },
            data: {
              weeklyPoints: 0,
              totalPoints: t.totalPoints,
              extraData: JSON.stringify(streakExtra),
              dueDate: JSON.stringify(streakExtra),
            },
          });
        }
      }
    } catch (e) {
      console.warn('Prisma evaluateSundayPoints fallback:', e.message);
    }
  }

  writeFile(TASKS_FILE, updatedTasks);
  return {
    evaluation: newEvalRecord,
    tasks: updatedTasks,
  };
}

export async function resetWeeklyPoints() {
  const current = await getTasks();
  const updatedTasks = current.map((t) => {
    if (t.category === 'Streak') {
      return { ...t, weeklyPoints: 0 };
    }
    return t;
  });

  if (prisma) {
    try {
      for (const t of updatedTasks) {
        if (t.category === 'Streak') {
          const streakExtra = {
            fields: t.fields,
            goalDays: t.goalDays,
            currentStreak: t.currentStreak,
            bestStreak: t.bestStreak,
            lastCheckedDate: t.lastCheckedDate,
            dailyLog: t.dailyLog,
            history: t.history,
            weeklyPoints: 0,
            totalPoints: t.totalPoints,
          };
          await prisma.task.update({
            where: { id: t.id },
            data: {
              weeklyPoints: 0,
              extraData: JSON.stringify(streakExtra),
              dueDate: JSON.stringify(streakExtra),
            },
          });
        }
      }
    } catch (e) {
      console.warn('Prisma resetWeeklyPoints fallback:', e.message);
    }
  }

  writeFile(TASKS_FILE, updatedTasks);
  return updatedTasks;
}

export async function getStreakEvaluations() {
  if (prisma) {
    try {
      const record = await prisma.systemData.findUnique({
        where: { key: 'streak_evaluations' },
      });
      if (record && record.value) {
        const parsed = JSON.parse(record.value);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Prisma getStreakEvaluations fallback:', e.message);
    }
  }
  return readFile(STREAK_EVALUATIONS_FILE, []);
}

// ── Gemini AI Streak Evaluator ──────────────────────────────────────────────
async function evaluateStreaksWithGeminiAI(streakTasks) {
  const apiKey = process.env.GEMINI_API_KEY;
  const now = new Date();
  const isSunday = now.getDay() === 0;

  const taskDigest = streakTasks.map((t) => {
    const recentLogs = (t.history || []).slice(-7);
    const totalNumbers = recentLogs.reduce((acc, l) => acc + (Number(l.numberDone) || 0), 0);
    const allTopics = recentLogs.flatMap((l) => (Array.isArray(l.topics) ? l.topics : []));
    const uniqueTopics = Array.from(new Set(allTopics));

    return {
      title: t.title,
      goalDays: t.goalDays || 30,
      currentStreak: t.currentStreak || 0,
      bestStreak: t.bestStreak || 0,
      todayLog: t.dailyLog || '(no log saved today)',
      totalNumbersLogged: totalNumbers,
      topicsRead: uniqueTopics,
      recentLogs: recentLogs.map((l) => ({
        date: l.date,
        numberDone: l.numberDone,
        topics: l.topics,
        note: l.note,
      })),
    };
  });

  const prompt = `You are a world-class AI engineering coach evaluating Vivek Pawar's weekly progress on his habit streaks.
Today is Sunday (or Sunday evening evaluation).
Vivek tracks up to 5 habit streaks (10 points per task per day = 50 points/day).
Across a 7-day week, the theoretical ceiling is 350 points (5 tasks × 70 points each).

Streak & Habit Data:
${JSON.stringify(taskDigest, null, 2)}

EVALUATION RUBRIC & STRICT RULES:
1. MAXIMUM THEORETICAL SCORE: 350 Points (70 points max per task).
2. STRICT MANDATORY RULE: NEVER GIVE THE FULL 350 POINTS. You MUST cap the maximum achievable score at 335 out of 350 (and individual tasks at max 67 out of 70). Rigorous code craftsmanship always recognizes room for optimization, deeper edge-case coverage, and continuous learning.
3. Scoring factors:
   - Volume & number of questions/items completed
   - Depth and breadth of topics & algorithms read
   - Unbroken streak consistency across the week
   - Daily reflections and honest technical notes

Provide a JSON response matching:
{
  "totalWeeklyPoints": number (integer between 0 and 335, evaluated out of 350),
  "maxPossiblePoints": 350,
  "percentage": number (e.g. 89.4),
  "grade": "S" (315-335), "A+" (280-314), "A" (245-279), "B" (190-244), or "C" (<190),
  "summaryReview": "Analytical 2-3 sentence review evaluating his achievements this week in topics read and numbers accomplished.",
  "perTaskBreakdown": [
    {
      "taskTitle": string,
      "points": number (0 to 67, out of 70),
      "maxPoints": 70,
      "numbersLogged": string,
      "topicsRead": string,
      "verdict": string
    }
  ],
  "keyWins": [string, string, string]
}

Respond ONLY with valid JSON.`;

  if (apiKey) {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              responseMimeType: 'application/json',
              temperature: 0.3,
            },
          }),
        }
      );

      if (res.ok) {
        const json = await res.json();
        const text = json.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          const parsed = JSON.parse(text);
          const safeTotal = Math.min(335, Math.max(0, Number(parsed.totalWeeklyPoints) || 0));
          return {
            ...parsed,
            totalWeeklyPoints: safeTotal,
            maxPossiblePoints: 350,
            percentage: Math.round((safeTotal / 350) * 1000) / 10,
            date: new Date().toISOString(),
            isSunday,
            source: 'gemini-1.5-flash',
          };
        }
      }
    } catch (err) {
      console.warn('Gemini API call failed, falling back to heuristic AI coach:', err.message);
    }
  }

  // Intelligent Fallback AI Evaluator (Rubric out of 350, never full 350)
  let totalPts = 0;
  const perTaskBreakdown = streakTasks.map((t) => {
    const recentLogs = (t.history || []).slice(-7);
    const daysChecked = recentLogs.length;
    const basePts = daysChecked * 7;
    const streakBonus = Math.min(Math.round((t.currentStreak || 0) * 1.2), 9);

    const totalNumbers = recentLogs.reduce((acc, l) => acc + (Number(l.numberDone) || 0), 0);
    const allTopics = recentLogs.flatMap((l) => (Array.isArray(l.topics) ? l.topics : []));
    const uniqueTopics = Array.from(new Set(allTopics));
    const depthBonus = Math.min(uniqueTopics.length * 2 + (totalNumbers > 0 ? 3 : 0), 9);

    const rawTaskScore = basePts + streakBonus + depthBonus;
    const taskScore = Math.min(67, Math.max(15, rawTaskScore));
    totalPts += taskScore;

    return {
      taskTitle: t.title,
      points: taskScore,
      maxPoints: 70,
      numbersLogged: totalNumbers > 0 ? `${totalNumbers} completed` : 'Logged daily',
      topicsRead: uniqueTopics.length > 0 ? uniqueTopics.join(', ') : 'Technical topics covered',
      verdict:
        t.currentStreak >= 7
          ? `Flawless 7-day consistency! ${totalNumbers > 0 ? `${totalNumbers} units completed with ` : ''}${uniqueTopics.length} core topics covered.`
          : t.currentStreak > 0
          ? `Consistent cadence: ${t.currentStreak} day streak maintained. Solid topic coverage.`
          : `Streak primed for the upcoming week. Ready for daily check-ins.`,
    };
  });

  const totalWeeklyPoints = Math.min(330, Math.max(80, totalPts));
  const grade =
    totalWeeklyPoints >= 315
      ? 'S'
      : totalWeeklyPoints >= 280
      ? 'A+'
      : totalWeeklyPoints >= 245
      ? 'A'
      : totalWeeklyPoints >= 190
      ? 'B'
      : 'C';

  return {
    date: new Date().toISOString(),
    totalWeeklyPoints,
    maxPossiblePoints: 350,
    percentage: Math.round((totalWeeklyPoints / 350) * 1000) / 10,
    grade,
    summaryReview: `Outstanding technical consistency across your active streak habits! You maintained focused problem-solving checkpoints and documented meaningful technical breakthroughs throughout the week (scored out of 350 points). Keep driving this momentum!`,
    perTaskBreakdown,
    keyWins: [
      `Maintained active check-in consistency across ${streakTasks.length} streak goals`,
      `Documented daily technical logs and problem-solving reflections in real-time`,
      `Advanced closer to target day milestones with zero regressions`,
    ],
    isSunday,
    source: apiKey ? 'gemini-fallback' : 'local-ai-heuristic',
  };
}

export async function deleteTask(id) {
  if (prisma) {
    try {
      await prisma.task.delete({ where: { id } }).catch(() => {});
    } catch (e) {
      console.warn('Prisma deleteTask fallback:', e.message);
    }
  }

  const current = await getTasks();
  const updated = current.filter((t) => t.id !== id);
  writeFile(TASKS_FILE, updated);
  return updated;
}

// ── Contact Messages ────────────────────────────────────────────────────────
export async function getMessages() {
  if (prisma) {
    try {
      const dbMessages = await prisma.contactMessage.findMany({
        orderBy: { createdAt: 'desc' },
      });
      return dbMessages;
    } catch (e) {
      console.warn('Prisma getMessages fallback:', e.message);
    }
  }
  return readFile(MESSAGES_FILE, []);
}

export async function addMessage(msg) {
  if (prisma) {
    try {
      const created = await prisma.contactMessage.create({
        data: {
          name: msg.name,
          email: msg.email,
          message: msg.message,
        },
      });
      return created;
    } catch (e) {
      console.warn('Prisma addMessage fallback:', e.message);
    }
  }

  const current = await getMessages();
  const newMsg = {
    id: `msg-${Date.now()}`,
    name: msg.name,
    email: msg.email,
    message: msg.message,
    read: false,
    createdAt: new Date().toISOString(),
  };
  writeFile(MESSAGES_FILE, [newMsg, ...current]);
  return newMsg;
}

export async function markMessageRead(id) {
  if (prisma) {
    try {
      await prisma.contactMessage.update({
        where: { id },
        data: { read: true },
      });
      return await getMessages();
    } catch (e) {
      console.warn('Prisma markMessageRead fallback:', e.message);
    }
  }

  const current = await getMessages();
  const updated = current.map((m) => (m.id === id ? { ...m, read: true } : m));
  writeFile(MESSAGES_FILE, updated);
  return updated;
}

export async function deleteMessage(id) {
  if (prisma) {
    try {
      await prisma.contactMessage.delete({ where: { id } }).catch(() => {});
      return await getMessages();
    } catch (e) {
      console.warn('Prisma deleteMessage fallback:', e.message);
    }
  }

  const current = await getMessages();
  const updated = current.filter((m) => m.id !== id);
  writeFile(MESSAGES_FILE, updated);
  return updated;
}

// ── Vault Notes System ──────────────────────────────────────────────────────
export async function getVaultNotes() {
  if (prisma) {
    try {
      const record = await prisma.vaultNote.findUnique({
        where: { id: 'vault-notes-list' },
      });
      if (record && record.content) {
        try {
          const parsed = JSON.parse(record.content);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
          }
        } catch (e) {
          console.warn('Failed parsing JSON from vaultNote content', e);
        }
      }
    } catch (e) {
      console.warn('Prisma getVaultNotes fallback:', e.message);
    }
  }
  return readFile(VAULT_FILE, defaultVaultNotes);
}

export async function saveVaultNote(noteData) {
  const current = await getVaultNotes();
  const existingIdx = current.findIndex((n) => n.id === noteData.id);

  let updatedList;
  if (existingIdx >= 0) {
    const updatedNote = {
      ...current[existingIdx],
      ...noteData,
      updatedAt: new Date().toISOString(),
    };
    updatedList = [...current];
    updatedList[existingIdx] = updatedNote;
  } else {
    const newNote = {
      id: noteData.id || `note-${Date.now()}`,
      title: noteData.title?.trim() || 'Untitled Note',
      category: noteData.category || 'General',
      content: noteData.content || '',
      pinned: Boolean(noteData.pinned),
      color: noteData.color || 'cyan',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    updatedList = [newNote, ...current];
  }

  updatedList.sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    return new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0);
  });

  if (prisma) {
    try {
      await prisma.vaultNote.upsert({
        where: { id: 'vault-notes-list' },
        create: { id: 'vault-notes-list', content: JSON.stringify(updatedList, null, 2) },
        update: { content: JSON.stringify(updatedList, null, 2) },
      });
    } catch (e) {
      console.warn('Prisma saveVaultNote error:', e.message);
    }
  }

  writeFile(VAULT_FILE, updatedList);
  return updatedList;
}

export async function deleteVaultNote(id) {
  const current = await getVaultNotes();
  const updatedList = current.filter((n) => n.id !== id);

  if (prisma) {
    try {
      await prisma.vaultNote.upsert({
        where: { id: 'vault-notes-list' },
        create: { id: 'vault-notes-list', content: JSON.stringify(updatedList, null, 2) },
        update: { content: JSON.stringify(updatedList, null, 2) },
      });
    } catch (e) {
      console.warn('Prisma deleteVaultNote error:', e.message);
    }
  }

  writeFile(VAULT_FILE, updatedList);
  return updatedList;
}

export async function togglePinVaultNote(id) {
  const current = await getVaultNotes();
  const updatedList = current.map((n) =>
    n.id === id ? { ...n, pinned: !n.pinned, updatedAt: new Date().toISOString() } : n
  );

  updatedList.sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    return new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0);
  });

  if (prisma) {
    try {
      await prisma.vaultNote.upsert({
        where: { id: 'vault-notes-list' },
        create: { id: 'vault-notes-list', content: JSON.stringify(updatedList, null, 2) },
        update: { content: JSON.stringify(updatedList, null, 2) },
      });
    } catch (e) {
      console.warn('Prisma togglePinVaultNote error:', e.message);
    }
  }

  writeFile(VAULT_FILE, updatedList);
  return updatedList;
}

// ── Vault Folders & Category Directory System ──────────────────────────────
export async function getVaultFolders() {
  const notes = await getVaultNotes();
  let storedFolders = [];

  if (prisma) {
    try {
      const dbFolders = await prisma.vaultFolderItem.findMany({
        orderBy: { createdAt: 'asc' },
      });
      if (dbFolders && dbFolders.length > 0) {
        storedFolders = dbFolders;
      }
    } catch (e) {
      console.warn('Prisma getVaultFolders fallback:', e.message);
    }
  }

  if (storedFolders.length === 0) {
    storedFolders = readFile(VAULT_FOLDERS_FILE, []);
  }

  const folderMap = new Map();

  storedFolders.forEach((f) => {
    folderMap.set(f.name.toLowerCase().trim(), {
      id: f.id,
      name: f.name.trim(),
      color: f.color || 'cyan',
      description: f.description || '',
      noteCount: 0,
      pinnedCount: 0,
      updatedAt: null,
      recentTitle: null,
    });
  });

  notes.forEach((n) => {
    const catName = (n.category || '').trim();
    if (!catName) return;
    const key = catName.toLowerCase();
    const folder = folderMap.get(key);
    if (folder) {
      folder.noteCount += 1;
      if (n.pinned) folder.pinnedCount += 1;
      if (!folder.updatedAt || new Date(n.updatedAt || 0) > new Date(folder.updatedAt || 0)) {
        folder.updatedAt = n.updatedAt || n.createdAt;
        folder.recentTitle = n.title;
      }
    }
  });

  return Array.from(folderMap.values());
}

export async function createVaultFolder(folderName, color = 'cyan', description = '') {
  const trimmed = folderName?.trim();
  if (!trimmed) throw new Error('Folder name cannot be empty');

  const folders = await getVaultFolders();
  if (folders.some((f) => f.name.toLowerCase() === trimmed.toLowerCase())) {
    throw new Error('A folder with this name already exists.');
  }

  const newFolder = {
    id: `folder-${Date.now()}`,
    name: trimmed,
    color,
    description: description?.trim() || `Notes for ${trimmed}`,
  };

  if (prisma) {
    try {
      await prisma.vaultFolderItem.create({
        data: {
          id: newFolder.id,
          name: newFolder.name,
          color: newFolder.color,
          description: newFolder.description,
        },
      });
    } catch (e) {
      console.warn('Prisma createVaultFolder fallback:', e.message);
    }
  }

  const fileFolders = readFile(VAULT_FOLDERS_FILE, []);
  writeFile(VAULT_FOLDERS_FILE, [...fileFolders, newFolder]);
  return await getVaultFolders();
}

export async function moveVaultNoteFolder(noteId, targetFolder) {
  const current = await getVaultNotes();
  const noteIdx = current.findIndex((n) => n.id === noteId);
  if (noteIdx === -1) throw new Error('Note not found');

  current[noteIdx] = {
    ...current[noteIdx],
    category: targetFolder.trim(),
    updatedAt: new Date().toISOString(),
  };

  await saveVaultNote(current[noteIdx]);
  return await getVaultNotes();
}

export async function renameVaultFolder(oldFolder, newFolder) {
  const oldTrimmed = oldFolder?.trim();
  const newTrimmed = newFolder?.trim();
  if (!oldTrimmed || !newTrimmed) throw new Error('Invalid folder names');

  if (prisma) {
    try {
      const existing = await prisma.vaultFolderItem.findFirst({
        where: { name: oldTrimmed },
      });
      if (existing) {
        await prisma.vaultFolderItem.update({
          where: { id: existing.id },
          data: { name: newTrimmed },
        });
      }
    } catch (e) {
      console.warn('Prisma renameVaultFolder fallback:', e.message);
    }
  }

  const folders = readFile(VAULT_FOLDERS_FILE, []);
  const updatedFolders = folders.map((f) =>
    f.name.toLowerCase() === oldTrimmed.toLowerCase() ? { ...f, name: newTrimmed } : f
  );
  writeFile(VAULT_FOLDERS_FILE, updatedFolders);

  const notes = await getVaultNotes();
  const updatedNotes = notes.map((n) =>
    (n.category || '').toLowerCase() === oldTrimmed.toLowerCase()
      ? { ...n, category: newTrimmed, updatedAt: new Date().toISOString() }
      : n
  );

  if (prisma) {
    try {
      await prisma.vaultNote.upsert({
        where: { id: 'vault-notes-list' },
        create: { id: 'vault-notes-list', content: JSON.stringify(updatedNotes, null, 2) },
        update: { content: JSON.stringify(updatedNotes, null, 2) },
      });
    } catch (e) {
      console.warn('Prisma renameVaultFolder notes fallback:', e.message);
    }
  }

  writeFile(VAULT_FILE, updatedNotes);
  return await getVaultFolders();
}

export async function deleteVaultFolder(folderName, moveToFolder = '') {
  const trimmed = folderName?.trim();
  if (!trimmed) throw new Error('Folder name cannot be empty');

  if (prisma) {
    try {
      await prisma.vaultFolderItem.deleteMany({
        where: { name: trimmed },
      });
    } catch (e) {
      console.warn('Prisma deleteVaultFolder fallback:', e.message);
    }
  }

  const folders = readFile(VAULT_FOLDERS_FILE, []);
  const updatedFolders = folders.filter((f) => f.name.toLowerCase() !== trimmed.toLowerCase());
  writeFile(VAULT_FOLDERS_FILE, updatedFolders);

  const notes = await getVaultNotes();
  const updatedNotes = notes.map((n) =>
    (n.category || '').toLowerCase() === trimmed.toLowerCase()
      ? { ...n, category: moveToFolder || '', updatedAt: new Date().toISOString() }
      : n
  );

  if (prisma) {
    try {
      await prisma.vaultNote.upsert({
        where: { id: 'vault-notes-list' },
        create: { id: 'vault-notes-list', content: JSON.stringify(updatedNotes, null, 2) },
        update: { content: JSON.stringify(updatedNotes, null, 2) },
      });
    } catch (e) {
      console.warn('Prisma deleteVaultFolder notes fallback:', e.message);
    }
  }

  writeFile(VAULT_FILE, updatedNotes);
  return await getVaultFolders();
}

// Backward compatibility single note access
export async function getVaultNote() {
  const notes = await getVaultNotes();
  return { id: 'main-notes', content: JSON.stringify(notes) };
}

export async function updateVaultNote(content) {
  if (typeof content === 'string') {
    try {
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed)) {
        if (prisma) {
          try {
            await prisma.vaultNote.upsert({
              where: { id: 'vault-notes-list' },
              create: { id: 'vault-notes-list', content },
              update: { content },
            });
          } catch (e) {
            console.warn('Prisma updateVaultNote error:', e.message);
          }
        }
        writeFile(VAULT_FILE, parsed);
        return { content };
      }
    } catch {
      // not JSON array
    }
  }
  return { content };
}
