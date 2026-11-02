export const mockSpecializations = [
  { id: 'genie-informatique', name: 'Génie Informatique', description: 'Software engineering, systems, and algorithms.', modulesCount: 42 },
  { id: 'genie-mecanique', name: 'Génie Mécanique', description: 'Fluid mechanics, solid mechanics, and manufacturing.', modulesCount: 38 },
  { id: 'genie-electrique', name: 'Génie Électrique', description: 'Electronics, automation, and power systems.', modulesCount: 40 },
  { id: 'genie-industriel', name: 'Génie Industriel', description: 'Supply chain, quality control, and optimization.', modulesCount: 35 },
];

export const mockSemesters = [
  { id: 'S1', name: 'Semestre 1', period: 'Autumn / Winter' },
  { id: 'S2', name: 'Semestre 2', period: 'Spring / Summer' },
  { id: 'S3', name: 'Semestre 3', period: 'Autumn / Winter' },
  { id: 'S4', name: 'Semestre 4', period: 'Spring / Summer' },
  { id: 'S5', name: 'Semestre 5', period: 'Autumn / Winter' },
  { id: 'S6', name: 'Semestre 6', period: 'Spring / Summer' },
];

export const getSemestersForCycle = (cycleId) => (
  cycleId === 'licence' ? mockSemesters : mockSemesters.slice(0, 4)
);

export const mockSubjects = {
  'genie-informatique': {
    S1: [
      { id: 'analyse', name: 'Analyse Mathématique' },
      { id: 'algebre', name: 'Algèbre Linéaire' },
      { id: 'algorithmique', name: 'Algorithmique' },
      { id: 'architecture', name: 'Architecture des Ordinateurs' },
    ],
    S2: [
      { id: 'programmation-c', name: 'Programmation C' },
      { id: 'structures-donnees', name: 'Structures de Données' },
      { id: 'probabilites', name: 'Probabilités' },
    ],
  },
  'genie-mecanique': {
    S1: [
      { id: 'analyse', name: 'Analyse Mathématique' },
      { id: 'physique-mecanique', name: 'Physique Mécanique' },
      { id: 'dessin-technique', name: 'Dessin Technique' },
      { id: 'materiaux', name: 'Science des Matériaux' },
    ],
    S2: [
      { id: 'thermodynamique', name: 'Thermodynamique' },
      { id: 'resistance-materiaux', name: 'Résistance des Matériaux' },
    ],
  },
  'genie-electrique': {
    S1: [
      { id: 'analyse', name: 'Analyse Mathématique' },
      { id: 'electrostatique', name: 'Électrostatique' },
      { id: 'circuits', name: 'Circuits Électriques' },
      { id: 'logique', name: 'Logique Combinatoire' },
    ],
    S2: [
      { id: 'electronique', name: 'Électronique Analogique' },
      { id: 'automatique', name: 'Automatique' },
    ],
  },
  'genie-industriel': {
    S1: [
      { id: 'analyse', name: 'Analyse Mathématique' },
      { id: 'statistiques', name: 'Statistiques Appliquées' },
      { id: 'economie', name: 'Économie Industrielle' },
      { id: 'informatique', name: "Introduction à l'Informatique" },
    ],
    S2: [
      { id: 'recherche-operationnelle', name: 'Recherche Opérationnelle' },
      { id: 'gestion-production', name: 'Gestion de Production' },
    ],
  },
};

export const getSpecializationById = (id) => mockSpecializations.find((spec) => spec.id === id);

export const getSemesterById = (id) => mockSemesters.find((semester) => semester.id === id);

export const getSubjectsData = () => {
  if (typeof window === 'undefined') return mockSubjects;
  const data = localStorage.getItem('unishare_subjects');
  return data ? JSON.parse(data) : mockSubjects;
};

export const getSubjectsForSemester = (specId, semesterId) => {
  const data = getSubjectsData();
  return data[specId]?.[semesterId] || [];
};

export const getSubjectById = (specId, semesterId, subjectId) => {
  return getSubjectsForSemester(specId, semesterId).find((subject) => subject.id === subjectId);
};

export const getResourceByCategoryAndId = (category, resourceId) => {
  const uploads = getUploadedResources();
  return uploads.find((resource) => String(resource.id) === String(resourceId) && resource.category === category);
};

export const resourceCategoryLabels = {
  courses: 'Cours',
  td: 'TD',
  exams: 'Examen',
  youtube: 'Vidéo',
};

// تهيئة قاعدة البيانات في localStorage
const INIT_USERS_KEY = 'unishare_users';
const INIT_UPLOADS_KEY = 'unishare_uploads';
const INIT_COMMENTS_KEY = 'unishare_comments';
const CURRENT_USER_KEY = 'unishare_current_user';
const INIT_SUBJECTS_KEY = 'unishare_subjects';

// إنشاء حسابات افتراضية في البداية (مشرف وطالب تجريبي)
if (typeof window !== 'undefined' && !localStorage.getItem(INIT_USERS_KEY)) {
  localStorage.setItem(INIT_USERS_KEY, JSON.stringify([
    { username: 'admin', password: 'admin', specialization: 'All', level: 'Admin', role: 'admin' },
    { username: 'student', password: 'student', specialization: 'genie-informatique', level: 'S1', role: 'teacher' }
  ]));
}

if (typeof window !== 'undefined' && !localStorage.getItem(INIT_SUBJECTS_KEY)) {
  localStorage.setItem(INIT_SUBJECTS_KEY, JSON.stringify(mockSubjects));
}

// دوال إدارة المستخدمين
export const getUsers = () => {
  if (typeof window === 'undefined') return [];
  return JSON.parse(localStorage.getItem(INIT_USERS_KEY) || '[]');
};

export const registerUser = (username, password, specialization, level) => {
  const users = getUsers();
  if (users.some((u) => u.username.toLowerCase() === username.toLowerCase())) {
    throw new Error("Nom d'utilisateur déjà utilisé.");
  }
  const newUser = { username, password, specialization, level, role: 'student' };
  users.push(newUser);
  localStorage.setItem(INIT_USERS_KEY, JSON.stringify(users));
  return newUser;
};

export const loginUser = (username, password) => {
  const users = getUsers();
  const user = users.find(
    (u) => u.username.toLowerCase() === username.toLowerCase() && u.password === password
  );
  if (!user) {
    throw new Error("Nom d'utilisateur ou mot de passe incorrect.");
  }
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  return user;
};

export const getCurrentUser = () => {
  if (typeof window === 'undefined') return null;
  const userStr = localStorage.getItem(CURRENT_USER_KEY);
  return userStr ? JSON.parse(userStr) : null;
};

export const logoutUser = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(CURRENT_USER_KEY);
  }
};

// دوال إدارة رفع الملفات والرقابة
export const getUploadedResources = () => {
  if (typeof window === 'undefined') return [];
  return JSON.parse(localStorage.getItem(INIT_UPLOADS_KEY) || '[]');
};

export const addUploadedResource = (title, category, specId, semesterId, subjectId, author, size = '1.5 MB', fileUrl = null, fileName = null) => {
  const uploads = getUploadedResources();
  const newResource = {
    id: `upload-${Date.now()}`,
    title,
    category,
    specId,
    semesterId,
    subjectId,
    author,
    size,
    fileName,
    fileUrl, // base64 أو رابط YouTube
    format: category === 'youtube' ? 'Vidéo' : (fileName?.split('.').pop()?.toUpperCase() || 'PDF'),
    date: new Date().toISOString().split('T')[0],
    status: 'pending',
  };
  uploads.push(newResource);
  localStorage.setItem(INIT_UPLOADS_KEY, JSON.stringify(uploads));
  return newResource;
};


export const getApprovedResources = (subjectId) => {
  const uploads = getUploadedResources();
  return uploads.filter((r) => r.subjectId === subjectId && r.status === 'approved');
};

export const approveResource = (resourceId) => {
  const uploads = getUploadedResources();
  const resource = uploads.find((r) => String(r.id) === String(resourceId));
  if (resource) {
    resource.status = 'approved';
    localStorage.setItem(INIT_UPLOADS_KEY, JSON.stringify(uploads));
  }
};

export const updateUserRole = (username, newRole) => {
  const users = getUsers();
  const user = users.find((u) => u.username === username);
  if (user) {
    user.role = newRole;
    localStorage.setItem(INIT_USERS_KEY, JSON.stringify(users));
  }
};

// تعديل rejectResource لتخزين سبب الرفض
export const rejectResource = (resourceId, reason = '') => {
  const uploads = getUploadedResources();
  const resource = uploads.find((r) => String(r.id) === String(resourceId));
  if (resource) {
    resource.status = 'rejected';
    if (reason) resource.rejectionReason = reason;
    localStorage.setItem(INIT_UPLOADS_KEY, JSON.stringify(uploads));
  }
};

export const deleteUploadedResource = (resourceId) => {
  const uploads = getUploadedResources();
  const filtered = uploads.filter((r) => String(r.id) !== String(resourceId));
  localStorage.setItem(INIT_UPLOADS_KEY, JSON.stringify(filtered));
};

// دوال إدارة التعليقات والمناقشات
export const getSubjectComments = (subjectId) => {
  if (typeof window === 'undefined') return [];
  const allComments = JSON.parse(localStorage.getItem(INIT_COMMENTS_KEY) || '[]');
  return allComments.filter((c) => c.subjectId === subjectId);
};

export const addSubjectComment = (subjectId, username, text) => {
  const allComments = JSON.parse(localStorage.getItem(INIT_COMMENTS_KEY) || '[]');
  const newComment = {
    id: `comment-${Date.now()}`,
    subjectId,
    username,
    text,
    date: new Date().toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' }),
  };
  allComments.push(newComment);
  localStorage.setItem(INIT_COMMENTS_KEY, JSON.stringify(allComments));
  return newComment;
};

export const addSubject = (specId, semesterId, id, name) => {
  const data = getSubjectsData();
  if (!data[specId]) data[specId] = {};
  if (!data[specId][semesterId]) data[specId][semesterId] = [];
  data[specId][semesterId].push({ id, name });
  localStorage.setItem(INIT_SUBJECTS_KEY, JSON.stringify(data));
};

export const updateSubjectName = (specId, semesterId, subjectId, newName) => {
  const data = getSubjectsData();
  if (data[specId]?.[semesterId]) {
    const subject = data[specId][semesterId].find((s) => s.id === subjectId);
    if (subject) {
      subject.name = newName;
      localStorage.setItem(INIT_SUBJECTS_KEY, JSON.stringify(data));
    }
  }
};

export const deleteSubject = (specId, semesterId, subjectId) => {
  // 1. Delete subject itself
  const data = getSubjectsData();
  if (data[specId]?.[semesterId]) {
    data[specId][semesterId] = data[specId][semesterId].filter((s) => s.id !== subjectId);
    localStorage.setItem(INIT_SUBJECTS_KEY, JSON.stringify(data));
  }

  // 2. Cascading delete from uploads
  const uploads = getUploadedResources();
  const filteredUploads = uploads.filter(
    (r) => !(r.subjectId === subjectId && r.specId === specId && r.semesterId === semesterId)
  );
  localStorage.setItem(INIT_UPLOADS_KEY, JSON.stringify(filteredUploads));

  // 3. Cascading delete from comments
  if (typeof window !== 'undefined') {
    const comments = JSON.parse(localStorage.getItem(INIT_COMMENTS_KEY) || '[]');
    const filteredComments = comments.filter((c) => c.subjectId !== subjectId);
    localStorage.setItem(INIT_COMMENTS_KEY, JSON.stringify(filteredComments));
  }
};
