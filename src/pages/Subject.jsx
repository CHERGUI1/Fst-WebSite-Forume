import { useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import ResourceCard from '../components/ResourceCard';
import {
  getSemesterById,
  getSpecializationById,
  getSubjectById,
  mockResources,
  getCurrentUser,
  getApprovedResources,
  addUploadedResource,
  getSubjectComments,
  addSubjectComment,
} from '../data/mockData';

export default function Subject() {
  const { specId, semesterId, subjectId } = useParams();
  const spec = getSpecializationById(specId);
  const semester = getSemesterById(semesterId);
  const subject = getSubjectById(specId, semesterId, subjectId);
  const subjectBasePath = `/specializations/${specId}/semesters/${semesterId}/subjects/${subjectId}`;

  const [currentUser] = useState(() => getCurrentUser());
  const [prevSubjectId, setPrevSubjectId] = useState(subjectId);
  const [approvedUploads, setApprovedUploads] = useState(() => getApprovedResources(subjectId));
  const [comments, setComments] = useState(() => getSubjectComments(subjectId));
  
  // حالات نموذج الرفع
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadCategory, setUploadCategory] = useState('courses');
  const [uploadValue, setUploadValue] = useState(''); // رابط يوتيوب
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState('');
  const [uploadError, setUploadError] = useState('');
  const [uploading, setUploading] = useState(false);

  // حالات منتدى المناقشة
  const [commentText, setCommentText] = useState('');

  // مزامنة الحالة مباشرة أثناء رندر المادة عند التنقل
  if (subjectId !== prevSubjectId) {
    setPrevSubjectId(subjectId);
    setApprovedUploads(getApprovedResources(subjectId));
    setComments(getSubjectComments(subjectId));
    setUploadTitle('');
    setUploadCategory('courses');
    setUploadValue('');
    setUploadFile(null);
    setUploadSuccess('');
    setUploadError('');
    setCommentText('');
  }

  if (!spec || !semester || !subject) return <Navigate to="/" replace />;

  const detailPath = (category, resourceId) => `${subjectBasePath}/resources/${category}/${resourceId}`;

  const getCombinedResources = (category) => {
    return approvedUploads.filter((r) => r.category === category);
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    setUploadSuccess('');
    setUploadError('');

    if (!uploadTitle.trim()) {
      setUploadError('الرجاء إدخال عنوان للملف.');
      return;
    }
    if (uploadCategory !== 'youtube' && !uploadFile) {
      setUploadError('الرجاء اختيار ملف للرفع.');
      return;
    }
    if (uploadCategory === 'youtube' && !uploadValue.trim()) {
      setUploadError('الرجاء إدخال رابط الفيديو.');
      return;
    }
    if (uploadFile && uploadFile.size > 5 * 1024 * 1024) {
      setUploadError('حجم الملف يتجاوز الحد الأقصى (5 MB).');
      return;
    }

    try {
      setUploading(true);
      let fileUrl = null;
      let fileSize = '';

      if (uploadCategory !== 'youtube' && uploadFile) {
        // قراءة الملف كـ base64 وحفظه في localStorage
        fileUrl = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (ev) => resolve(ev.target.result);
          reader.onerror = () => reject(new Error('فشل قراءة الملف'));
          reader.readAsDataURL(uploadFile);
        });
        const kb = uploadFile.size / 1024;
        fileSize = kb > 1024 ? `${(kb / 1024).toFixed(1)} MB` : `${kb.toFixed(0)} KB`;
      }

      const newRes = addUploadedResource(
        uploadTitle,
        uploadCategory,
        specId,
        semesterId,
        subjectId,
        currentUser.username,
        uploadCategory === 'youtube' ? uploadValue.trim() : fileSize,
        fileUrl,
        uploadFile?.name || null
      );

      // Auto‑approve if the uploader is not a regular student
      if (currentUser.role !== 'student') {
        approveResource(newRes.id);
        setUploadSuccess('تم رفع الملف وتمت الموافقة تلقائياً.');
      } else {
        setUploadSuccess('تم رفع الملف بنجاح! سيظهر بعد موافقة المشرف.');
      }

      setUploadTitle('');
      setUploadValue('');
      setUploadFile(null);
      // reset file input
      const fileInput = document.getElementById('upload-file');
      if (fileInput) fileInput.value = '';
    } catch (err) {
      setUploadError(err.message || 'حدث خطأ أثناء الرفع.');
    } finally {
      setUploading(false);
    }
  };

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    const newComment = addSubjectComment(subjectId, currentUser.username, commentText);
    setComments([...comments, newComment]);
    setCommentText('');
  };

  const combinedCourses = getCombinedResources('courses');
  const combinedTds = getCombinedResources('td');
  const combinedExams = getCombinedResources('exams');
  const combinedVideos = getCombinedResources('youtube');

  return (
    <div className="space-y-12">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{subject.name}</h1>
        <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1">Ressources pédagogiques validées.</p>
      </div>

      <div className="space-y-8">
        <section className="space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">Cours Magistraux</h3>
          {combinedCourses.length === 0 ? (
            <p className="text-sm text-slate-400 dark:text-zinc-500 italic">Aucune ressource disponible pour le moment.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {combinedCourses.map((resource) => (
                <ResourceCard key={resource.id} {...resource} type="Cours" detailPath={detailPath('courses', resource.id)} />
              ))}
            </div>
          )}
        </section>

        <section className="space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">Travaux Dirigés (TD)</h3>
          {combinedTds.length === 0 ? (
            <p className="text-sm text-slate-400 dark:text-zinc-500 italic">Aucune ressource disponible pour le moment.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {combinedTds.map((resource) => (
                <ResourceCard key={resource.id} {...resource} type="TD" detailPath={detailPath('td', resource.id)} />
              ))}
            </div>
          )}
        </section>

        <section className="space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">Archives Examens & Contrôles</h3>
          {combinedExams.length === 0 ? (
            <p className="text-sm text-slate-400 dark:text-zinc-500 italic">Aucune ressource disponible pour le moment.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {combinedExams.map((resource) => (
                <ResourceCard key={resource.id} {...resource} type="Examen" detailPath={detailPath('exams', resource.id)} />
              ))}
            </div>
          )}
        </section>

        <section className="space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">Vidéos & Playlists Recommandées</h3>
          {combinedVideos.length === 0 ? (
            <p className="text-sm text-slate-400 dark:text-zinc-500 italic">Aucune ressource disponible pour le moment.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {combinedVideos.map((video) => (
                <Link key={video.id} to={detailPath('youtube', video.id)} className="p-4 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl flex space-x-4 hover:shadow-sm cursor-pointer transition group">
                  <div className="w-32 h-20 bg-slate-100 dark:bg-zinc-700 rounded-lg flex-shrink-0 flex items-center justify-center relative overflow-hidden">
                    <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center text-white shadow-sm z-10">
                      <svg className="w-4 h-4 ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                    </div>
                    {video.duration && (
                      <span className="absolute bottom-1 right-1 bg-black/70 text-[9px] text-white px-1 rounded font-medium">{video.duration}</span>
                    )}
                  </div>
                  <div className="flex flex-col justify-between py-0.5 min-w-0 flex-1">
                    <div>
                      <h4 className="font-semibold text-sm text-slate-800 dark:text-zinc-100 line-clamp-2 group-hover:text-blue-900 dark:group-hover:text-blue-400 transition">
                        {video.title}
                      </h4>
                      <p className="text-xs text-slate-400 dark:text-zinc-500 mt-1">{video.channel || video.author || 'UniShare'}</p>
                    </div>
                    {video.views && (
                      <span className="text-[10px] text-slate-400 dark:text-zinc-500">{video.views}</span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>

      <hr className="border-slate-200 dark:border-zinc-800" />

      {/* قسم رفع الملفات والمنتدى */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <div className="bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700/80 rounded-2xl p-6 shadow-sm space-y-4">
          <h3 className="font-bold text-lg text-slate-900 dark:text-white">Partager un document</h3>
          <p className="text-xs text-slate-400 dark:text-zinc-500">
            Aidez vos camarades en partageant vos cours, TDs ou examens corrigés.
          </p>

          {currentUser ? (
            <form onSubmit={handleUploadSubmit} className="space-y-4 pt-2">
              {uploadSuccess && (
                <div className="p-3 text-xs bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900 rounded-xl">
                  {uploadSuccess}
                </div>
              )}
              {uploadError && (
                <div className="p-3 text-xs bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900 rounded-xl">
                  {uploadError}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="upload-title" className="block text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase mb-1">
                    Titre du document
                  </label>
                  <input
                    id="upload-title"
                    type="text"
                    value={uploadTitle}
                    onChange={(e) => setUploadTitle(e.target.value)}
                    placeholder="Ex: TD1 Algorithmique corrigé"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-900"
                  />
                </div>

                <div>
                  <label htmlFor="upload-category" className="block text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase mb-1">
                    Catégorie
                  </label>
                  <select
                    id="upload-category"
                    value={uploadCategory}
                    onChange={(e) => setUploadCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-900"
                  >
                    <option value="courses">Cours</option>
                    <option value="td">Travaux Dirigés (TD)</option>
                    <option value="exams">Examen / Contrôle</option>
                    <option value="youtube">Vidéo YouTube</option>
                  </select>
                </div>
              </div>

              {uploadCategory === 'youtube' ? (
                <div>
                  <label htmlFor="upload-value" className="block text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase mb-1">
                    رابط الفيديو (YouTube)
                  </label>
                  <input
                    id="upload-value"
                    type="url"
                    value={uploadValue}
                    onChange={(e) => setUploadValue(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-900"
                  />
                </div>
              ) : (
                <div>
                  <label htmlFor="upload-file" className="block text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase mb-1">
                    اختر الملف (PDF أو صورة — الحد الأقصى 5 MB)
                  </label>
                  <div className="relative">
                    <input
                      id="upload-file"
                      type="file"
                      accept=".pdf,.doc,.docx,.ppt,.pptx,.png,.jpg,.jpeg"
                      onChange={(e) => setUploadFile(e.target.files[0] || null)}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    />
                    <div className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-900 border-2 border-dashed border-slate-300 dark:border-zinc-600 rounded-xl text-xs text-slate-500 dark:text-zinc-400 flex items-center gap-2 hover:border-blue-500 transition">
                      <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/>
                      </svg>
                      {uploadFile ? (
                        <span className="text-emerald-600 dark:text-emerald-400 font-semibold truncate">{uploadFile.name} — {(uploadFile.size/1024).toFixed(0)} KB</span>
                      ) : (
                        <span>اضغط لاختيار ملف...</span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={uploading}
                className="w-full px-4 py-2 bg-blue-900 dark:bg-blue-600 hover:bg-blue-800 dark:hover:bg-blue-500 text-white font-semibold text-xs rounded-xl transition cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {uploading ? (
                  <>
                    <svg className="animate-spin w-3 h-3" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                    </svg>
                    جارٍ الرفع...
                  </>
                ) : 'رفع الملف'}
              </button>
            </form>
          ) : (
            <div className="p-4 bg-slate-50 dark:bg-zinc-900/50 border border-slate-100 dark:border-zinc-800 rounded-xl text-center">
              <p className="text-xs text-slate-500 dark:text-zinc-400 mb-3">
                Vous devez être connecté pour partager des ressources.
              </p>
              <Link
                to="/auth"
                className="inline-flex px-4 py-2 bg-blue-900 dark:bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-800 transition"
              >
                Se connecter
              </Link>
            </div>
          )}
        </div>

        {/* منتدى المناقشات */}
        <div className="bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700/80 rounded-2xl p-6 shadow-sm space-y-4">
          <h3 className="font-bold text-lg text-slate-900 dark:text-white">Forum de discussion</h3>
          <p className="text-xs text-slate-400 dark:text-zinc-500">
            Posez vos questions ou discutez des notions du cours avec vos camarades.
          </p>

          <div className="space-y-4 max-h-64 overflow-y-auto pr-1">
            {comments.length === 0 ? (
              <p className="text-xs text-slate-400 dark:text-zinc-500 italic text-center py-6">
                Aucun message pour le moment. Soyez le premier à lancer le débat !
              </p>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="p-3 bg-slate-50 dark:bg-zinc-900/40 rounded-xl border border-slate-100 dark:border-zinc-800/80 text-left space-y-1">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="font-bold text-blue-900 dark:text-blue-400 flex items-center gap-1">
                      <span className="w-4 h-4 rounded-full bg-blue-100 dark:bg-blue-950 flex items-center justify-center text-[8px] font-bold text-blue-900 dark:text-blue-300">
                        {comment.username.substring(0, 2).toUpperCase()}
                      </span>
                      {comment.username}
                    </span>
                    <span className="text-slate-400 dark:text-zinc-500">{comment.date}</span>
                  </div>
                  <p className="text-xs text-slate-700 dark:text-zinc-300 whitespace-pre-wrap">
                    {comment.text}
                  </p>
                </div>
              ))
            )}
          </div>

          {currentUser ? (
            <form onSubmit={handleCommentSubmit} className="flex gap-2">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Écrivez votre message ici..."
                className="flex-1 px-3 py-2 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-900"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-blue-900 dark:bg-blue-600 hover:bg-blue-800 dark:hover:bg-blue-500 text-white font-semibold text-xs rounded-xl transition cursor-pointer"
              >
                Envoyer
              </button>
            </form>
          ) : (
            <div className="p-3 bg-slate-50 dark:bg-zinc-900/50 border border-slate-100 dark:border-zinc-800 rounded-xl text-center text-xs text-slate-400 dark:text-zinc-500">
              Connectez-vous pour participer à la discussion.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
