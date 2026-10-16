import prisma from '@/lib/prisma';
import defaultProfile from '@/data/profile';
import defaultProjects from '@/data/projects';
import defaultSkills from '@/data/skills';
import defaultTasks from '@/data/tasks.json';
import fs from 'fs';
import path from 'path';

// Local storage paths for fallback & static cache
const PROFILE_FILE = path.join(process.cwd(), 'src', 'data', 'profile.json');
const PROJECTS_FILE = path.join(process.cwd(), 'src', 'data', 'projects.json');
const SKILLS_FILE = path.join(process.cwd(), 'src', 'data', 'skills.json');
const TASKS_FILE = path.join(process.cwd(), 'src', 'data', 'tasks.json');
const MESSAGES_FILE = path.join(process.cwd(), 'src', 'data', 'messages.json');
const VAULT_FILE = path.join(process.cwd(), 'src', 'data', 'vault.json');

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

function writeFile(filePath, data) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error(`Error writing ${filePath}:`, err);
  }
}

// ── Profile ─────────────────────────────────────────────────────────────────
export async function getProfile() {
  if (prisma) {
    try {
      let p = await prisma.profile.findFirst();
      if (!p) {
        // Seed default profile into database
        p = await prisma.profile.create({
          data: {
            id: 'profile-1',
            name: defaultProfile.name,
            role: defaultProfile.role,
            tagline: defaultProfile.tagline,
            about: defaultProfile.about,
            degree: defaultProfile.education?.degree || '',
            institution: defaultProfile.education?.institution || '',
            period: defaultProfile.education?.period || '',
            location: defaultProfile.location || '',
            status: defaultProfile.status || '',
            email: defaultProfile.email || '',
            github: defaultProfile.github || '',
            linkedin: defaultProfile.linkedin || '',
            leetcode: defaultProfile.leetcode || '',
          },
        });
      }
      return {
        ...defaultProfile,
        ...p,
        education: {
          degree: p.degree || defaultProfile.education?.degree,
          institution: p.institution || defaultProfile.education?.institution,
          period: p.period || defaultProfile.education?.period,
        },
      };
    } catch (e) {
      console.warn('Prisma getProfile fallback to local file:', e.message);
    }
  }
  return readFile(PROFILE_FILE, defaultProfile);
}

export async function updateProfile(data) {
  if (prisma) {
    try {
      const updated = await prisma.profile.upsert({
        where: { id: 'profile-1' },
        create: {
          id: 'profile-1',
          name: data.name || defaultProfile.name,
          role: data.role || defaultProfile.role,
          tagline: data.tagline || defaultProfile.tagline,
          about: data.about || defaultProfile.about,
          degree: data.education?.degree || data.degree || '',
          institution: data.education?.institution || data.institution || '',
          period: data.education?.period || data.period || '',
          location: data.location || defaultProfile.location,
          status: data.status || defaultProfile.status,
          email: data.email || defaultProfile.email,
          github: data.github || defaultProfile.github,
          linkedin: data.linkedin || defaultProfile.linkedin,
          leetcode: data.leetcode || defaultProfile.leetcode,
        },
        update: {
          name: data.name,
          role: data.role,
          tagline: data.tagline,
          about: data.about,
          degree: data.education?.degree || data.degree,
          institution: data.education?.institution || data.institution,
          period: data.education?.period || data.period,
          location: data.location,
          status: data.status,
          email: data.email,
          github: data.github,
          linkedin: data.linkedin,
          leetcode: data.leetcode,
        },
      });
      writeFile(PROFILE_FILE, updated);
      return updated;
    } catch (e) {
      console.warn('Prisma updateProfile fallback:', e.message);
    }
  }
  const current = await getProfile();
  const updated = { ...current, ...data };
  writeFile(PROFILE_FILE, updated);
  return updated;
}

// ── Projects ────────────────────────────────────────────────────────────────
export async function getProjects() {
  if (prisma) {
    try {
      const dbProjects = await prisma.project.findMany({
        orderBy: { order: 'asc' },
      });
      if (dbProjects && dbProjects.length > 0) {
        return dbProjects.map((p) => ({
          ...p,
          tags: p.tags ? p.tags.split(',').map((t) => t.trim()) : [],
        }));
      } else {
        // Seed database with default projects
        for (let i = 0; i < defaultProjects.length; i++) {
          const dp = defaultProjects[i];
          await prisma.project.create({
            data: {
              id: dp.id || `proj-${i}`,
              name: dp.name,
              subtitle: dp.subtitle || '',
              description: dp.description || '',
              category: dp.category || 'Full Stack',
              tags: Array.isArray(dp.tags) ? dp.tags.join(', ') : dp.tags || '',
              link: dp.link || '',
              github: dp.github || '',
              featured: Boolean(dp.featured),
              order: i,
            },
          });
        }
        return defaultProjects;
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

  if (prisma) {
    try {
      const created = await prisma.project.create({
        data: {
          name: projectData.name,
          subtitle: projectData.subtitle || '',
          description: projectData.description || '',
          category: projectData.category || 'Full Stack',
          tags: tagsStr,
          link: projectData.link || '',
          github: projectData.github || '',
          featured: Boolean(projectData.featured),
        },
      });
      return {
        ...created,
        tags: created.tags.split(',').map((t) => t.trim()),
      };
    } catch (e) {
      console.warn('Prisma addProject fallback:', e.message);
    }
  }

  const current = await getProjects();
  const newProject = {
    id: `proj-${Date.now()}`,
    ...projectData,
    tags: tagsStr.split(',').map((t) => t.trim()),
    featured: Boolean(projectData.featured),
  };
  writeFile(PROJECTS_FILE, [newProject, ...current]);
  return newProject;
}

export async function updateProject(id, projectData) {
  const tagsStr = Array.isArray(projectData.tags)
    ? projectData.tags.join(', ')
    : projectData.tags || '';

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
          link: projectData.link,
          github: projectData.github,
          featured: Boolean(projectData.featured),
        },
      });
      return true;
    } catch (e) {
      console.warn('Prisma updateProject fallback:', e.message);
    }
  }

  const current = await getProjects();
  const updated = current.map((p) =>
    p.id === id || p.name === id ? { ...p, ...projectData, tags: tagsStr.split(',').map((t) => t.trim()) } : p
  );
  writeFile(PROJECTS_FILE, updated);
  return true;
}

export async function deleteProject(id) {
  if (prisma) {
    try {
      await prisma.project.delete({ where: { id } });
      return true;
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
      const dbSkills = await prisma.skill.findMany();
      if (dbSkills && dbSkills.length > 0) {
        // Group by category
        const groups = {};
        dbSkills.forEach((s) => {
          if (!groups[s.category]) {
            groups[s.category] = { category: s.category, icon: '💡', items: [] };
          }
          groups[s.category].items.push({
            id: s.id,
            name: s.name,
            level: s.level,
            badge: s.badge,
          });
        });
        return Object.values(groups);
      } else {
        // Seed database
        for (const cat of defaultSkills) {
          for (const item of cat.items) {
            await prisma.skill.create({
              data: {
                category: cat.category,
                name: item.name,
                level: item.level || 'Intermediate',
                badge: item.badge || null,
              },
            });
          }
        }
        return defaultSkills;
      }
    } catch (e) {
      console.warn('Prisma getSkills fallback:', e.message);
    }
  }
  return readFile(SKILLS_FILE, defaultSkills);
}

export async function addSkill(categoryName, skillItem) {
  if (prisma) {
    try {
      await prisma.skill.create({
        data: {
          category: categoryName,
          name: skillItem.name,
          level: skillItem.level || 'Intermediate',
          badge: skillItem.badge || null,
        },
      });
      return await getSkills();
    } catch (e) {
      console.warn('Prisma addSkill fallback:', e.message);
    }
  }

  const current = await getSkills();
  const updated = current.map((cat) => {
    if (cat.category.toLowerCase() === categoryName.toLowerCase()) {
      return { ...cat, items: [...cat.items, skillItem] };
    }
    return cat;
  });
  writeFile(SKILLS_FILE, updated);
  return updated;
}

export async function deleteSkill(categoryName, skillName) {
  if (prisma) {
    try {
      await prisma.skill.deleteMany({
        where: {
          category: categoryName,
          name: skillName,
        },
      });
      return await getSkills();
    } catch (e) {
      console.warn('Prisma deleteSkill fallback:', e.message);
    }
  }

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
  writeFile(SKILLS_FILE, updated);
  return updated;
}

// ── Tasks ───────────────────────────────────────────────────────────────────
export async function getTasks() {
  if (prisma) {
    try {
      const dbTasks = await prisma.task.findMany({
        orderBy: { createdAt: 'desc' },
      });
      if (dbTasks && dbTasks.length > 0) {
        return dbTasks;
      } else {
        // Seed default tasks
        for (const t of defaultTasks) {
          await prisma.task.create({
            data: {
              id: t.id,
              title: t.title,
              category: t.category,
              priority: t.priority,
              status: t.status,
              dueDate: t.dueDate,
            },
          });
        }
        return defaultTasks;
      }
    } catch (e) {
      console.warn('Prisma getTasks fallback:', e.message);
    }
  }
  return readFile(TASKS_FILE, defaultTasks);
}

export async function addTask(taskData) {
  if (prisma) {
    try {
      const created = await prisma.task.create({
        data: {
          title: taskData.title,
          category: taskData.category || 'General',
          priority: taskData.priority || 'Medium',
          status: 'todo',
          dueDate: taskData.dueDate || 'Soon',
        },
      });
      return created;
    } catch (e) {
      console.warn('Prisma addTask fallback:', e.message);
    }
  }

  const current = await getTasks();
  const newTask = {
    id: `task-${Date.now()}`,
    ...taskData,
    status: 'todo',
    createdAt: new Date().toISOString().split('T')[0],
  };
  writeFile(TASKS_FILE, [newTask, ...current]);
  return newTask;
}

export async function updateTaskStatus(id, status) {
  if (prisma) {
    try {
      await prisma.task.update({
        where: { id },
        data: { status },
      });
      return await getTasks();
    } catch (e) {
      console.warn('Prisma updateTaskStatus fallback:', e.message);
    }
  }

  const current = await getTasks();
  const updated = current.map((t) => (t.id === id ? { ...t, status } : t));
  writeFile(TASKS_FILE, updated);
  return updated;
}

export async function deleteTask(id) {
  if (prisma) {
    try {
      await prisma.task.delete({ where: { id } });
      return await getTasks();
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
      await prisma.contactMessage.delete({ where: { id } });
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

// ── Vault Notes ─────────────────────────────────────────────────────────────
export async function getVaultNote() {
  if (prisma) {
    try {
      let note = await prisma.vaultNote.findFirst();
      if (!note) {
        note = await prisma.vaultNote.create({
          data: { id: 'main-notes', content: '' },
        });
      }
      return note;
    } catch (e) {
      console.warn('Prisma getVaultNote fallback:', e.message);
    }
  }
  return readFile(VAULT_FILE, { content: '' });
}

export async function updateVaultNote(content) {
  if (prisma) {
    try {
      const updated = await prisma.vaultNote.upsert({
        where: { id: 'main-notes' },
        create: { id: 'main-notes', content },
        update: { content },
      });
      return updated;
    } catch (e) {
      console.warn('Prisma updateVaultNote fallback:', e.message);
    }
  }
  const updated = { content, updatedAt: new Date().toISOString() };
  writeFile(VAULT_FILE, updated);
  return updated;
}
