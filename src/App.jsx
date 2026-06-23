import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import Navigation from './components/Navigation';
import About from './pages/About';
import Home from './pages/Home';
import ResourceDetail from './pages/ResourceDetail';
import Semester from './pages/Semester';
import Specialization from './pages/Specialization';
import Subject from './pages/Subject';
import Auth from './pages/Auth';
import Profile from './pages/Profile';
import AdminUsers from './pages/AdminUsers';
import AdminUploads from './pages/AdminUploads';

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Navigation />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/cycles/:cycleId" element={<Home />} />
          <Route path="/specializations/:specId" element={<Specialization />} />
          <Route path="/specializations/:specId/semesters/:semesterId" element={<Semester />} />
          <Route path="/specializations/:specId/semesters/:semesterId/subjects/:subjectId" element={<Subject />} />
          <Route path="/specializations/:specId/semesters/:semesterId/subjects/:subjectId/resources/:category/:resourceId" element={<ResourceDetail />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/uploads" element={<AdminUploads />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
