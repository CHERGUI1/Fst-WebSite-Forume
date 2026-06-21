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

export const mockResources = {
  courses: [
    { id: 1, title: 'Chapitre 1: Espaces Vectoriels - Cours Complet', date: '2026-01-15', size: '2.4 MB', author: 'Département pédagogique', format: 'PDF' },
    { id: 2, title: 'Chapitre 2: Matrices et Applications Linéaires', date: '2026-02-02', size: '1.8 MB', author: 'Équipe UniShare', format: 'PDF' },
  ],
  td: [
    { id: 1, title: 'Série de TD 1: Systèmes Linéaires', date: '2026-01-20', size: '840 KB', author: 'Groupe TD', format: 'PDF' },
    { id: 2, title: 'Série de TD 2: Diagonalisation', date: '2026-02-10', size: '920 KB', author: 'Groupe TD', format: 'PDF' },
  ],
  exams: [
    { id: 1, title: 'Examen Final - Session Normale 2025', date: '2025-06-18', size: '1.1 MB', hasCorrection: true, author: 'Archives ENSA', format: 'PDF' },
    { id: 2, title: 'Rattrapage - Session 2025', date: '2025-07-05', size: '1.0 MB', hasCorrection: false, author: 'Archives ENSA', format: 'PDF' },
  ],
  youtube: [
    { id: 1, title: "Comprendre l'Algèbre Linéaire en 20 min", channel: 'Maths Academy', duration: '21:45', views: '45K views', format: 'Vidéo' },
    { id: 2, title: 'Les Secrets des Déterminants', channel: 'Sciences Sup', duration: '15:10', views: '12K views', format: 'Vidéo' },
  ],
};

export const getSpecializationById = (id) => mockSpecializations.find((spec) => spec.id === id);

export const getSemesterById = (id) => mockSemesters.find((semester) => semester.id === id);

export const getSubjectsForSemester = (specId, semesterId) => mockSubjects[specId]?.[semesterId] || [];

export const getSubjectById = (specId, semesterId, subjectId) => (
  getSubjectsForSemester(specId, semesterId).find((subject) => subject.id === subjectId)
);

export const getResourceByCategoryAndId = (category, resourceId) => {
  const staticRes = mockResources[category]?.find((resource) => String(resource.id) === String(resourceId));
  if (staticRes) return staticRes;
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

// إنشاء حسابات افتراضية في البداية (مشرف وطالب تجريبي)
if (typeof window !== 'undefined' && !localStorage.getItem(INIT_USERS_KEY)) {
  localStorage.setItem(INIT_USERS_KEY, JSON.stringify([
    { username: 'admin', password: 'admin', specialization: 'All', level: 'Admin', role: 'admin' },
    { username: 'student', password: 'student', specialization: 'genie-informatique', level: 'S1', role: 'student' }
  ]));
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

export const addUploadedResource = (title, category, specId, semesterId, subjectId, author, size = '1.5 MB') => {
  const uploads = getUploadedResources();
  const newResource = {
    id: `upload-${Date.now()}`,
    title,
    category, // courses, td, exams, youtube
    specId,
    semesterId,
    subjectId,
    author,
    size,
    format: 'PDF',
    date: new Date().toISOString().split('T')[0],
    status: 'pending', // pending, approved
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

export const rejectResource = (resourceId) => {
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
