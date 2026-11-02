import { supabase, isSupabaseConfigured } from './supabase';

const CURRENT_USER_KEY = 'unishare_current_user';

// Helper to sanitize username into email format for Supabase Auth
export const formatEmail = (usernameOrEmail) => {
  const clean = usernameOrEmail.trim().toLowerCase();
  if (clean.includes('@')) return clean;
  // convert spaces/special chars to dots
  const usernamePart = clean.replace(/[^a-z0-9._-]/g, '');
  return `${usernamePart}@unishare.app`;
};

// 1. AUTHENTICATION
export async function signUpUser(username, password, specialization, level, customEmail = null) {
  if (!isSupabaseConfigured) throw new Error('Supabase is not configured.');

  const email = customEmail ? customEmail.trim() : formatEmail(username);

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        username: username.trim(),
        specialization,
        level,
      },
    },
  });

  if (error) throw error;

  const profile = {
    id: data.user?.id,
    username: username.trim(),
    specialization,
    level,
    role: 'student',
  };

  if (data.session) {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(profile));
  } else {
    localStorage.removeItem(CURRENT_USER_KEY);
  }

  return {
    user: data.user,
    profile,
    requiresEmailConfirmation: !data.session,
  };
}

export async function resendSignupConfirmation(email) {
  if (!isSupabaseConfigured) throw new Error('Supabase is not configured.');

  const { error } = await supabase.auth.resend({
    type: 'signup',
    email: email.trim().toLowerCase(),
    options: { emailRedirectTo: `${window.location.origin}/auth` },
  });

  if (error) throw error;
}

export async function requestPasswordReset(email) {
  if (!isSupabaseConfigured) throw new Error('Supabase is not configured.');

  const { error } = await supabase.auth.resetPasswordForEmail(
    email.trim().toLowerCase(),
    { redirectTo: `${window.location.origin}/auth?mode=recovery` }
  );

  if (error) throw error;
}

export async function updatePassword(password) {
  if (!isSupabaseConfigured) throw new Error('Supabase is not configured.');

  const { error } = await supabase.auth.updateUser({ password });
  if (error) throw error;
}

export async function signInUser(email, password) {
  if (!isSupabaseConfigured) throw new Error('Supabase is not configured.');

  const cleanEmail = email.trim().toLowerCase();

  if (!cleanEmail.includes('@')) {
    throw new Error('Veuillez entrer votre adresse e-mail pour vous connecter.');
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email: cleanEmail,
    password,
  });

  if (error) throw error;

  // Fetch user profile from public.profiles
  const { data: profileData } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', data.user.id)
    .single();

  const profile = profileData || {
    id: data.user.id,
    username: data.user.user_metadata?.username || cleanEmail.split('@')[0],
    specialization: data.user.user_metadata?.specialization || 'genie-informatique',
    level: data.user.user_metadata?.level || 'S1',
    role: 'student',
  };

  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(profile));
  return { user: data.user, profile };
}

export async function signOutUser() {
  if (isSupabaseConfigured) {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.warn('Sign out error:', e);
    }
  }
  localStorage.removeItem(CURRENT_USER_KEY);
}

export async function getActiveProfile() {
  if (!isSupabaseConfigured) {
    const raw = localStorage.getItem(CURRENT_USER_KEY);
    return raw ? JSON.parse(raw) : null;
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    localStorage.removeItem(CURRENT_USER_KEY);
    return null;
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (profile) {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(profile));
    return profile;
  }

  const fallback = {
    id: user.id,
    username: user.user_metadata?.username || user.email?.split('@')[0],
    specialization: user.user_metadata?.specialization || 'genie-informatique',
    level: user.user_metadata?.level || 'S1',
    role: 'student',
  };
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(fallback));
  return fallback;
}

// 2. RESOURCES & UPLOADS
export async function uploadResource({
  title,
  category,
  specId,
  semesterId,
  subjectId,
  file = null,
  youtubeUrl = null,
  authorName = 'Étudiant',
}) {
  if (!isSupabaseConfigured) throw new Error('Supabase is not configured.');

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Veuillez vous connecter pour téléverser un fichier.');

  let filePath = null;
  let fileName = null;
  let fileSize = null;

  if (category !== 'youtube') {
    if (!file) throw new Error('Veuillez sélectionner un fichier.');

    fileName = file.name;
    fileSize = file.size;
    const fileExt = fileName.split('.').pop();
    const safeName = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
    filePath = `${user.id}/${safeName}`;

    const { error: uploadError } = await supabase.storage
      .from('unishare-resources')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) throw new Error(`Erreur de téléversement: ${uploadError.message}`);
  }

  // Insert resource record
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, username')
    .eq('id', user.id)
    .single();

  const isAdmin = profile?.role === 'admin';
  const finalAuthor = profile?.username || authorName;

  const { data: inserted, error: insertError } = await supabase
    .from('resources')
    .insert({
      title,
      category,
      specialization_id: specId,
      semester_id: semesterId,
      subject_id: subjectId,
      uploader_id: user.id,
      author_name: finalAuthor,
      file_path: filePath,
      file_name: fileName,
      file_size: fileSize,
      external_url: category === 'youtube' ? youtubeUrl : null,
      status: isAdmin ? 'approved' : 'pending',
    })
    .select()
    .single();

  if (insertError) throw new Error(`Erreur d'enregistrement: ${insertError.message}`);

  return inserted;
}

// Fetch approved resources for a subject
export async function getSubjectApprovedResources(subjectId) {
  if (!isSupabaseConfigured) return [];

  const { data, error } = await supabase
    .from('resources')
    .select('*')
    .eq('subject_id', subjectId)
    .eq('status', 'approved')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching approved resources:', error);
    return [];
  }

  // Generate signed URLs for file access
  const resourcesWithUrls = await Promise.all(
    data.map(async (res) => {
      let fileUrl = res.external_url;
      if (res.file_path) {
        const { data: signed } = await supabase.storage
          .from('unishare-resources')
          .createSignedUrl(res.file_path, 86400); // 24 hours
        fileUrl = signed?.signedUrl || null;
      }

      const kb = (res.file_size || 0) / 1024;
      const sizeStr = kb > 1024 ? `${(kb / 1024).toFixed(1)} MB` : `${kb.toFixed(0)} KB`;

      return {
        id: res.id,
        title: res.title,
        category: res.category,
        specId: res.specialization_id,
        semesterId: res.semester_id,
        subjectId: res.subject_id,
        author: res.author_name,
        size: res.category === 'youtube' ? res.external_url : sizeStr,
        fileName: res.file_name,
        fileUrl,
        filePath: res.file_path,
        format: res.category === 'youtube' ? 'Vidéo' : (res.file_name?.split('.').pop()?.toUpperCase() || 'PDF'),
        date: res.created_at ? res.created_at.split('T')[0] : '',
        status: res.status,
      };
    })
  );

  return resourcesWithUrls;
}

export async function getSearchableApprovedResources() {
  if (!isSupabaseConfigured) return [];

  const { data, error } = await supabase
    .from('resources')
    .select('id, title, category, specialization_id, semester_id, subject_id, author_name, file_size, external_url, created_at')
    .eq('status', 'approved')
    .order('created_at', { ascending: false });

  if (error) throw error;

  return data.map((resource) => ({
    id: resource.id,
    title: resource.title,
    category: resource.category,
    specId: resource.specialization_id,
    semesterId: resource.semester_id,
    subjectId: resource.subject_id,
    author: resource.author_name,
    size: resource.file_size ? `${(resource.file_size / (1024 * 1024)).toFixed(1)} MB` : '',
    channel: resource.category === 'youtube' ? 'YouTube' : null,
    date: resource.created_at ? resource.created_at.split('T')[0] : '',
  }));
}

// Fetch all resources for admin moderation
export async function getAdminUploads() {
  if (!isSupabaseConfigured) return [];

  const { data, error } = await supabase
    .from('resources')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching admin uploads:', error);
    return [];
  }

  const items = await Promise.all(
    data.map(async (res) => {
      let fileUrl = res.external_url;
      if (res.file_path) {
        const { data: signed } = await supabase.storage
          .from('unishare-resources')
          .createSignedUrl(res.file_path, 86400);
        fileUrl = signed?.signedUrl || null;
      }

      const kb = (res.file_size || 0) / 1024;
      const sizeStr = kb > 1024 ? `${(kb / 1024).toFixed(1)} MB` : `${kb.toFixed(0)} KB`;

      return {
        id: res.id,
        title: res.title,
        category: res.category,
        specId: res.specialization_id,
        semesterId: res.semester_id,
        subjectId: res.subject_id,
        author: res.author_name,
        size: res.category === 'youtube' ? 'Vidéo' : sizeStr,
        fileName: res.file_name,
        fileUrl,
        filePath: res.file_path,
        status: res.status,
        rejectionReason: res.rejection_reason,
        date: res.created_at ? res.created_at.split('T')[0] : '',
      };
    })
  );

  return items;
}

// Approve resource
export async function approveUpload(resourceId) {
  if (!isSupabaseConfigured) return;

  const { data: { user } } = await supabase.auth.getUser();

  const { error } = await supabase
    .from('resources')
    .update({
      status: 'approved',
      reviewed_at: new Date().toISOString(),
      reviewed_by: user?.id || null,
    })
    .eq('id', resourceId);

  if (error) throw error;
}

// Reject resource
export async function rejectUpload(resourceId, reason = '') {
  if (!isSupabaseConfigured) return;

  const { data: { user } } = await supabase.auth.getUser();

  const { error } = await supabase
    .from('resources')
    .update({
      status: 'rejected',
      rejection_reason: reason,
      reviewed_at: new Date().toISOString(),
      reviewed_by: user?.id || null,
    })
    .eq('id', resourceId);

  if (error) throw error;
}

// Delete resource (removes file from bucket + row from DB)
export async function deleteUpload(resourceId, filePath = null) {
  if (!isSupabaseConfigured) return;

  if (filePath) {
    try {
      await supabase.storage.from('unishare-resources').remove([filePath]);
    } catch (e) {
      console.warn('Storage delete warning:', e);
    }
  }

  const { error } = await supabase
    .from('resources')
    .delete()
    .eq('id', resourceId);

  if (error) throw error;
}

// 3. USER MANAGEMENT (Admin)
export async function getAllProfiles() {
  if (!isSupabaseConfigured) return [];

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching profiles:', error);
    return [];
  }

  return data.map((p) => ({
    id: p.id,
    username: p.username,
    specialization: p.specialization,
    level: p.level,
    role: p.role,
    createdAt: p.created_at,
  }));
}

export async function updateProfileRole(userId, newRole) {
  if (!isSupabaseConfigured) return;

  const { error } = await supabase
    .from('profiles')
    .update({ role: newRole })
    .eq('id', userId);

  if (error) throw error;
}

// 4. USER CONTRIBUTIONS (Profile page)
export async function getUserContributions(userId) {
  if (!isSupabaseConfigured) return [];

  const { data, error } = await supabase
    .from('resources')
    .select('*')
    .eq('uploader_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching user contributions:', error);
    return [];
  }

  return data.map((res) => ({
    id: res.id,
    title: res.title,
    category: res.category,
    specId: res.specialization_id,
    semesterId: res.semester_id,
    subjectId: res.subject_id,
    author: res.author_name,
    status: res.status,
    rejectionReason: res.rejection_reason,
    date: res.created_at ? res.created_at.split('T')[0] : '',
  }));
}

export async function getPendingUploads() {
  if (!isSupabaseConfigured) return [];

  const { data, error } = await supabase
    .from('resources')
    .select('*')
    .eq('status', 'pending')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching pending uploads:', error);
    return [];
  }

  return data.map((res) => ({
    id: res.id,
    title: res.title,
    category: res.category,
    specId: res.specialization_id,
    semesterId: res.semester_id,
    subjectId: res.subject_id,
    author: res.author_name,
    status: res.status,
    date: res.created_at ? res.created_at.split('T')[0] : '',
  }));
}

// 5. COMMENTS
export async function fetchSubjectComments(subjectId) {
  if (!isSupabaseConfigured) return [];

  const { data, error } = await supabase
    .from('comments')
    .select('*')
    .eq('subject_id', subjectId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching comments:', error);
    return [];
  }

  return data.map((c) => ({
    id: c.id,
    subjectId: c.subject_id,
    username: c.username,
    text: c.body,
    date: new Date(c.created_at).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' }),
  }));
}

export async function postSubjectComment(subjectId, text) {
  if (!isSupabaseConfigured) throw new Error('Supabase is not configured.');

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Veuillez vous connecter pour commenter.');

  const { data: profile } = await supabase
    .from('profiles')
    .select('username')
    .eq('id', user.id)
    .single();

  const username = profile?.username || user.email?.split('@')[0] || 'Étudiant';

  const { data, error } = await supabase
    .from('comments')
    .insert({
      subject_id: subjectId,
      user_id: user.id,
      username,
      body: text.trim(),
    })
    .select()
    .single();

  if (error) throw error;

  return {
    id: data.id,
    subjectId: data.subject_id,
    username: data.username,
    text: data.body,
    date: new Date(data.created_at).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' }),
  };
}
