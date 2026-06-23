// src/pages/UploadLesson.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function UploadLesson() {
  const [title, setTitle] = useState('');
  const [type, setType] = useState('pdf');
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!title || !file) {
      setError('الرجاء ملء جميع الحقول.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) { // 5 MB
      setError('الملف أكبر من الحد المسموح (5 MB).');
      return;
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('type', type);
    formData.append('file', file);

    try {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'فشل الرفع');
        // حفظ المعلومات في قاعدة البيانات المحلية (pending)
        const currentUser = getCurrentUser();
        addUploadedResource(title, type, 'genie-informatique', 'S1', 'algebre', currentUser?.username || 'unknown', `${(file.size / 1024).toFixed(1)} KB`);
        setSuccess('تم رفع الدرس بنجاح!');
        // توجيه إلى صفحة عرض الدروس للمعلم بعد قليل
        setTimeout(() => navigate('/teacher-lessons'), 1500);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8 space-y-6">
      <h1 className="text-3xl font-bold text-center">رفع درس</h1>
      {error && <div className="p-4 bg-red-100 text-red-800 rounded">{error}</div>}
      {success && <div className="p-4 bg-green-100 text-green-800 rounded">{success}</div>}
      <form onSubmit={handleSubmit} className="space-y-4 bg-white dark:bg-zinc-800 p-6 rounded shadow">
        <div>
          <label className="block mb-1 font-medium">اسم الدرس</label>
          <input
            type="text"
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-900 dark:focus:ring-blue-600"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">نوع الملف</label>
          <select
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-900 dark:focus:ring-blue-600"
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            <option value="pdf">PDF</option>
            <option value="video">فيديو</option>
            <option value="zip">ZIP</option>
          </select>
        </div>
        <div>
          <label className="block mb-1 font-medium">ملف الدرس</label>
          <input
            type="file"
            accept=".pdf,.mp4,.mov,.zip"
            className="w-full"
            onChange={(e) => setFile(e.target.files[0])}
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-900 text-white py-2 rounded hover:bg-blue-800 transition"
        >
          رفع
        </button>
      </form>
    </div>
  );
}
