// src/pages/TeacherLessons.jsx
import { useEffect, useState } from 'react';

export default function TeacherLessons() {
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLessons = async () => {
      try {
        const res = await fetch('/uploads/lessons.json');
        if (!res.ok) throw new Error('No lessons data');
        const data = await res.json();
        setLessons(data);
      } catch (e) {
        setLessons([]);
      } finally {
        setLoading(false);
      }
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
              <p className="text-sm text-gray-600 dark:text-gray-300">نوع الملف: {lesson.type}</p>
              <a
                href={lesson.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                تحميل الملف ({(lesson.size / 1024).toFixed(1)} KB)
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
