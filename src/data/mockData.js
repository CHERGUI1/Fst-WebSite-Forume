export const mockSpecializations = [
  { id: 'mip', name: 'MIP (Maths, Info, Physique)', description: 'Tronc commun d’accès aux filières d’informatique et d’ingénierie.', modulesCount: 24 },
  { id: 'mipc', name: 'MIPC (Maths, Info, Physique, Chimie)', description: 'Tronc commun axé sur les sciences physiques et chimiques appliquées.', modulesCount: 24 },
  { id: 'bcg', name: 'BCG (Biologie, Chimie, Géologie)', description: 'Sciences de la vie, de la matière et de l’environnement.', modulesCount: 24 },
  { id: 'ge-gm', name: 'GE-GM (Génie Électrique & Mécanique)', description: 'Sciences fondamentales et technologies de l’ingénieur.', modulesCount: 24 },
  { id: 'genie-informatique', name: 'LST Génie Informatique', description: 'Génie logiciel, architectures web, bases de données et réseaux.', modulesCount: 12 },
  { id: 'genie-mecanique', name: 'LST Génie Mécanique', description: 'Conception mécanique, modélisation et productique industrielle.', modulesCount: 12 },
  { id: 'genie-electrique', name: 'LST Génie Électrique', description: 'Électronique avancée, automatique et systèmes communicants.', modulesCount: 12 },
  { id: 'genie-industriel', name: 'LST Génie Industriel', description: 'Supply chain, gestion de la qualité et optimisation de production.', modulesCount: 12 },
];

export const mockSemesters = [
  { id: 'S1', name: 'Semestre 1', period: 'Automne / Hiver' },
  { id: 'S2', name: 'Semestre 2', period: 'Printemps / Été' },
  { id: 'S3', name: 'Semestre 3', period: 'Automne / Hiver' },
  { id: 'S4', name: 'Semestre 4', period: 'Printemps / Été' },
  { id: 'S5', name: 'Semestre 5', period: 'Automne / Hiver' },
  { id: 'S6', name: 'Semestre 6', period: 'Printemps / Été' },
];

export const getSemestersForCycle = (cycleId) => {
  if (cycleId === 'licence') {
    // في الإجازة تكون فقط S5 و S6
    return mockSemesters.filter((s) => s.id === 'S5' || s.id === 'S6');
  }
  if (cycleId === 'master') {
    return [
      { id: 'S1', name: 'Master 1 - Semestre 1', period: 'Automne / Hiver' },
      { id: 'S2', name: 'Master 1 - Semestre 2', period: 'Printemps / Été' },
      { id: 'S3', name: 'Master 2 - Semestre 3', period: 'Automne / Hiver' },
      { id: 'S4', name: 'Master 2 - Semestre 4 (PFE)', period: 'Printemps / Été' },
    ];
  }
  // DEUST بالافتراض: S1, S2, S3, S4
  return mockSemesters.filter((s) => ['S1', 'S2', 'S3', 'S4'].includes(s.id));
};

const FILIERES_KEY = 'unishare_filieres';

export const defaultFilieres = [
  // 1. DEUST (Troncs Communs FST: S1 à S4)
  { id: 'mip', cycleId: 'deust', name: 'MIP (Maths, Info, Physique)', description: 'Tronc commun d’accès aux filières d’informatique et d’ingénierie.', modulesCount: 24 },
  { id: 'mipc', cycleId: 'deust', name: 'MIPC (Maths, Info, Physique, Chimie)', description: 'Tronc commun axé sur les sciences physiques et chimiques appliquées.', modulesCount: 24 },
  { id: 'bcg', cycleId: 'deust', name: 'BCG (Biologie, Chimie, Géologie)', description: 'Sciences de la vie, de la matière et de l’environnement.', modulesCount: 24 },
  { id: 'ge-gm', cycleId: 'deust', name: 'GE-GM (Génie Électrique & Mécanique)', description: 'Sciences fondamentales et technologies de l’ingénieur.', modulesCount: 24 },

  // 2. Licence Sciences et Techniques (LST: S5 & S6 uniquement)
  { id: 'genie-informatique', cycleId: 'licence', name: 'LST Génie Informatique', description: 'Génie logiciel, architectures web, bases de données et réseaux.', modulesCount: 12 },
  { id: 'genie-mecanique', cycleId: 'licence', name: 'LST Génie Mécanique', description: 'Conception mécanique, modélisation et productique industrielle.', modulesCount: 12 },
  { id: 'genie-electrique', cycleId: 'licence', name: 'LST Génie Électrique', description: 'Électronique avancée, automatique et systèmes communicants.', modulesCount: 12 },
  { id: 'genie-industriel', cycleId: 'licence', name: 'LST Génie Industriel', description: 'Supply chain, gestion de la qualité et optimisation de production.', modulesCount: 12 },

  // 3. Master Sciences et Techniques (MST)
  { id: 'mst-ia', cycleId: 'master', name: 'MST Intelligence Artificielle & Data', description: 'Apprentissage profond, big data analytics et vision artificielle.', modulesCount: 16 },
  { id: 'mst-iot', cycleId: 'master', name: 'MST Systèmes Embarqués & IoT', description: 'Conception de cartes intelligentes, protocoles temps réel et IoT.', modulesCount: 16 },
];

export const getFilieres = (cycleId = null) => {
  if (typeof window === 'undefined') return defaultFilieres;
  const saved = localStorage.getItem(FILIERES_KEY);
  let filieres = defaultFilieres;
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.some((item) => item.id === 'mip')) {
        filieres = parsed;
      } else {
        localStorage.setItem(FILIERES_KEY, JSON.stringify(defaultFilieres));
        filieres = defaultFilieres;
      }
    } catch {
      filieres = defaultFilieres;
    }
  } else {
    localStorage.setItem(FILIERES_KEY, JSON.stringify(defaultFilieres));
  }
  return cycleId ? filieres.filter((item) => item.cycleId === cycleId) : filieres;
};

export const saveLocalFiliere = (filiere, original = null) => {
  const items = getFilieres();
  let next;
  if (original) {
    next = items.map((item) => (item.id === original.id && item.cycleId === original.cycleId ? filiere : item));
  } else {
    const exists = items.some((item) => item.id === filiere.id && item.cycleId === filiere.cycleId);
    next = exists
      ? items.map((item) => (item.id === filiere.id && item.cycleId === filiere.cycleId ? filiere : item))
      : [...items, filiere];
  }
  localStorage.setItem(FILIERES_KEY, JSON.stringify(next));
  return next;
};

export const deleteLocalFiliere = (id, cycleId = null) => {
  const items = getFilieres();
  const next = items.filter((item) => {
    if (cycleId) return !(item.id === id && item.cycleId === cycleId);
    return item.id !== id;
  });
  localStorage.setItem(FILIERES_KEY, JSON.stringify(next));
  return next;
};

export const mockSubjects = {
  // --- DEUST : MIP ---
  'mip': {
    S1: [
      { id: 'analyse-1', name: 'Analyse 1 : Suites et Fonctions' },
      { id: 'algebre-1', name: 'Algèbre 1 : Polynômes et Espaces Vectoriels' },
      { id: 'mecanique-point', name: 'Mécanique du Point Matériel' },
      { id: 'thermodynamique', name: 'Thermodynamique Physique' },
      { id: 'atomistique', name: 'Atomistique et Liaisons Chimiques' },
      { id: 'informatique-1', name: 'Algorithmique & Programmation C' },
    ],
    S2: [
      { id: 'analyse-2', name: 'Analyse 2 : Intégrales et Équations Diff.' },
      { id: 'algebre-2', name: 'Algèbre 2 : Applications Linéaires et Matrices' },
      { id: 'electrostatique', name: 'Électrostatique et Électrocinétique' },
      { id: 'optique', name: 'Optique Géométrique et Ondulatoire' },
      { id: 'chimie-solutions', name: 'Chimie en Solution' },
      { id: 'structures-donnees', name: 'Structures de Données' },
    ],
    S3: [
      { id: 'analyse-3', name: 'Analyse 3 : Séries et Fonctions à Plusieurs Var.' },
      { id: 'electromagnetisme', name: 'Électromagnétisme' },
      { id: 'systemes-exploitation', name: 'Systèmes d’Exploitation (Linux)' },
      { id: 'probabilites', name: 'Probabilités et Statistiques' },
    ],
    S4: [
      { id: 'analyse-numerique', name: 'Analyse Numérique' },
      { id: 'bases-donnees', name: 'Bases de Données Relationnelles' },
      { id: 'poo-java', name: 'Programmation Orientée Objet (Java)' },
      { id: 'electronique-analogique', name: 'Électronique Analogique' },
    ],
  },

  // --- DEUST : MIPC ---
  'mipc': {
    S1: [
      { id: 'analyse-1', name: 'Analyse 1' },
      { id: 'algebre-1', name: 'Algèbre 1' },
      { id: 'thermo-chimique', name: 'Thermodynamique Chimique' },
      { id: 'atomistique', name: 'Atomistique' },
      { id: 'mecanique-point', name: 'Mécanique du Point' },
    ],
    S2: [
      { id: 'analyse-2', name: 'Analyse 2' },
      { id: 'electrostatique', name: 'Électrostatique' },
      { id: 'chimie-organique', name: 'Chimie Organique 1' },
      { id: 'optique', name: 'Optique Géométrique' },
    ],
  },

  // --- DEUST : BCG ---
  'bcg': {
    S1: [
      { id: 'biologie-cellulaire', name: 'Biologie Cellulaire' },
      { id: 'geologie-generale', name: 'Géologie Générale' },
      { id: 'chimie-generale', name: 'Chimie Générale' },
      { id: 'physique-biologie', name: 'Physique pour les Sciences de la Vie' },
    ],
    S2: [
      { id: 'biologie-animale', name: 'Biologie Animale' },
      { id: 'biologie-vegetale', name: 'Biologie Végétale' },
      { id: 'chimie-organique-bio', name: 'Chimie Organique & Biochimie' },
    ],
  },

  // --- DEUST : GE-GM ---
  'ge-gm': {
    S1: [
      { id: 'analyse-math', name: 'Analyse Mathématique' },
      { id: 'dessin-technique', name: 'Dessin Technique & CAO' },
      { id: 'circuits-electriques', name: 'Circuits Électriques' },
      { id: 'physique-mecanique', name: 'Physique Mécanique' },
    ],
    S2: [
      { id: 'electronique-base', name: 'Électronique Fondamentale' },
      { id: 'science-materiaux', name: 'Science des Matériaux' },
      { id: 'automatisme', name: 'Automatique Linéaire' },
    ],
  },

  // --- LICENCE : LST Génie Informatique (S5 & S6) ---
  'genie-informatique': {
    S5: [
      { id: 'genie-logiciel', name: 'Génie Logiciel & UML' },
      { id: 'reseaux-tcp-ip', name: 'Réseaux Informatiques & TCP/IP' },
      { id: 'dev-web-fullstack', name: 'Développement Web Fullstack' },
      { id: 'conception-sgbd', name: 'Administration & Conception SGBD' },
      { id: 'recherche-operationnelle', name: 'Recherche Opérationnelle' },
    ],
    S6: [
      { id: 'cloud-devops', name: 'Cloud Computing & DevOps' },
      { id: 'securite-informatique', name: 'Sécurité Informatique & Cryptographie' },
      { id: 'frameworks-mobiles', name: 'Développement Mobile (React Native / Flutter)' },
      { id: 'pfe-licence', name: 'Projet de Fin d’Études (PFE)' },
    ],
  },

  // --- LICENCE : LST Génie Mécanique (S5 & S6) ---
  'genie-mecanique': {
    S5: [
      { id: 'mecanique-fluides', name: 'Mécanique des Fluides' },
      { id: 'thermodynamique-appliquee', name: 'Thermodynamique Appliquée' },
      { id: 'rdm-avancee', name: 'Résistance des Matériaux Avancée' },
      { id: 'fabrication-mecanique', name: 'Procédés de Fabrication Mécanique' },
    ],
    S6: [
      { id: 'elements-machines', name: 'Conception des Éléments de Machines' },
      { id: 'maintenance-industrielle', name: 'Maintenance & Fiabilité Industrielle' },
      { id: 'pfe-mecanique', name: 'Projet de Fin d’Études (PFE)' },
    ],
  },

  // --- LICENCE : LST Génie Électrique (S5 & S6) ---
  'genie-electrique': {
    S5: [
      { id: 'electronique-puissance', name: 'Électronique de Puissance' },
      { id: 'traitement-signal', name: 'Traitement du Signal' },
      { id: 'machines-electriques', name: 'Machines Électriques & Entraînements' },
      { id: 'microcontroleurs', name: 'Microcontrôleurs et Microprocesseurs' },
    ],
    S6: [
      { id: 'reseaux-electriques', name: 'Réseaux Électriques & Énergies Renouvelables' },
      { id: 'telecoms', name: 'Systèmes de Télécommunications' },
      { id: 'pfe-electrique', name: 'Projet de Fin d’Études (PFE)' },
    ],
  },

  // --- LICENCE : LST Génie Industriel (S5 & S6) ---
  'genie-industriel': {
    S5: [
      { id: 'gestion-production', name: 'Gestion de Production & GPAO' },
      { id: 'supply-chain', name: 'Logistique & Supply Chain Management' },
      { id: 'qualite-securite', name: 'Management de la Qualité (ISO / Lean)' },
      { id: 'analyse-financiere', name: 'Comptabilité et Gestion Financière' },
    ],
    S6: [
      { id: 'lean-manufacturing', name: 'Lean Manufacturing & Six Sigma' },
      { id: 'gestion-projets', name: 'Gestion de Projets Industriels' },
      { id: 'pfe-industriel', name: 'Projet de Fin d’Études (PFE)' },
    ],
  },

  // --- MASTER : MST IA & Data ---
  'mst-ia': {
    S1: [
      { id: 'machine-learning', name: 'Machine Learning Avancé' },
      { id: 'big-data-tech', name: 'Architectures Big Data (Hadoop / Spark)' },
      { id: 'optimisation-convexe', name: 'Optimisation pour Data Science' },
      { id: 'python-data', name: 'Programmation Avancée Python' },
    ],
    S2: [
      { id: 'deep-learning', name: 'Deep Learning & Réseaux de Neurones' },
      { id: 'nlp', name: 'Traitement du Langage Naturel (NLP)' },
      { id: 'computer-vision', name: 'Vision par Ordinateur' },
    ],
    S3: [
      { id: 'reinforcement-learning', name: 'Apprentissage par Renforcement' },
      { id: 'mlops', name: 'MLOps & Déploiement de Modèles IA' },
    ],
    S4: [
      { id: 'pfe-master', name: 'Stage de Fin d’Études / PFE' },
    ],
  },
};

export const getSpecializationById = (id) => {
  const all = getFilieres();
  const found = all.find((spec) => spec.id === id);
  if (found) return found;
  return mockSpecializations.find((spec) => spec.id === id) || { id, name: id, description: '' };
};

export const getSemesterById = (id) => mockSemesters.find((semester) => semester.id === id) || { id, name: id, period: '' };

const SUBJECTS_DATA_VERSION_KEY = 'unishare_subjects_version';
const CURRENT_SUBJECTS_DATA_VERSION = '2';

const mergeSubjectCatalog = (stored) => {
  const merged = JSON.parse(JSON.stringify(mockSubjects));
  Object.entries(stored || {}).forEach(([specId, semesters]) => {
    if (!merged[specId]) merged[specId] = {};
    Object.entries(semesters || {}).forEach(([semesterId, subjects]) => {
      const byId = new Map((merged[specId][semesterId] || []).map((subject) => [subject.id, subject]));
      (Array.isArray(subjects) ? subjects : []).forEach((subject) => {
        if (subject?.id) byId.set(subject.id, subject);
      });
      merged[specId][semesterId] = [...byId.values()];
    });
  });
  return merged;
};

export const getSubjectsData = () => {
  if (typeof window === 'undefined') return mockSubjects;
  const data = localStorage.getItem('unishare_subjects');
  if (data) {
    try {
      const parsed = JSON.parse(data);
      if (localStorage.getItem(SUBJECTS_DATA_VERSION_KEY) !== CURRENT_SUBJECTS_DATA_VERSION) {
        const migrated = mergeSubjectCatalog(parsed);
        localStorage.setItem('unishare_subjects', JSON.stringify(migrated));
        localStorage.setItem(SUBJECTS_DATA_VERSION_KEY, CURRENT_SUBJECTS_DATA_VERSION);
        return migrated;
      }
      return parsed;
    } catch {
      return mockSubjects;
    }
  }
  localStorage.setItem(SUBJECTS_DATA_VERSION_KEY, CURRENT_SUBJECTS_DATA_VERSION);
  return mockSubjects;
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
    fileUrl,
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
  const data = getSubjectsData();
  if (data[specId]?.[semesterId]) {
    data[specId][semesterId] = data[specId][semesterId].filter((s) => s.id !== subjectId);
    localStorage.setItem(INIT_SUBJECTS_KEY, JSON.stringify(data));
  }

  const uploads = getUploadedResources();
  const filteredUploads = uploads.filter(
    (r) => !(r.subjectId === subjectId && r.specId === specId && r.semesterId === semesterId)
  );
  localStorage.setItem(INIT_UPLOADS_KEY, JSON.stringify(filteredUploads));

  if (typeof window !== 'undefined') {
    const comments = JSON.parse(localStorage.getItem(INIT_COMMENTS_KEY) || '[]');
    const filteredComments = comments.filter((c) => c.subjectId !== subjectId);
    localStorage.setItem(INIT_COMMENTS_KEY, JSON.stringify(filteredComments));
  }
};
