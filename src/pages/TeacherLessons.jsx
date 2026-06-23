// src/pages/TeacherLessons.jsx
// src/pages/TeacherLessons.jsx
import { useEffect, useState } from 'react';
import { getUploadedResources } from '../data/mockData';

export default function TeacherLessons() {
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLessons = () => {
      // Directly obtain uploaded resources from localStorage via mockData helper
      const uploads = getUploadedResources();
      // Filter to only those that belong to the current subject (if needed later)
      setLessons(uploads);
      setLoading(false);
    };
    fetchLessons();
  }, []);

  if (loading) return <div className="p-4">جارٍ التحميل...</div>;

  return (
    <div className="max-w-4xl mx-auto py-8 space-y-6">
      <h1 className="text-3xl font-bold text-center">دروس الأستاذ</h1>
      {lessons.length === 0 ? (
        <p className="text-center text-gray-500">ليس هناك دروس مرفوعة بعد.</p>
      ) : (
        <ul className="space-y-4">
          {lessons.map((lesson) => (
            <li key={lesson.id} className="p-4 bg-white dark:bg-zinc-800 rounded shadow">
              <h2 className="font-semibold text-lg">{lesson.title}</h2>
              <p className="text-sm text-gray-600 dark:text-gray-300">نوع الملف: {lesson.format}</p>
              {lesson.fileUrl && (
                <a
                  href={lesson.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  تحميل الملف ({lesson.size})
                </a>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
