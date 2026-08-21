import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import Dashboard from './pages/Dashboard';
import CourseStream from './pages/CourseStream';
import Register from './pages/Register';

import SubmissionList from "./components/SubmissionList";
import AssignmentDetail from './pages/AssignmentDetail';

import CreateAssignment from './pages/CreateAssignment';
import GradeSubmission from './pages/GradeSubmission';
import UploadMaterial from './pages/UploadMaterial';

// LẤY IMPORT MỚI CỦA TEAM BRO (PA4) GẮN VÀO ĐÂY
import MaterialsPage from "./pages/MaterialsPage";
import QuizPage from "./pages/QuizPage";

import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

// Thành phần bảo vệ các route cần đăng nhập
const ProtectedRoute = ({ children }) => {
  const { currentUser } = useAuth();
  if (!currentUser) {
    return <Navigate to="/register" replace />;
  }
  return children;
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <div className="relative min-h-screen">
            <Routes>
              {/* LUỒNG ĐĂNG NHẬP / ĐĂNG KÝ */}
              <Route path="/register" element={<Register />} />

              {/* LUỒNG DASHBOARD & LỚP HỌC */}
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              <Route path="/course/stream/:courseId" element={
                <ProtectedRoute>
                  <CourseStream />
                </ProtectedRoute>
              } />
              <Route path="/course/stream/:courseId/create-assignment" element={
                <ProtectedRoute>
                  <CreateAssignment />
                </ProtectedRoute>
              } />
              <Route path="/course/stream/:courseId/assignment/:assignmentId" element={
                <ProtectedRoute>
                  <AssignmentDetail />
                </ProtectedRoute>
              } />
              <Route path="/course/stream/:courseId/assignment/:assignmentId/grade/:submissionId" element={
                <ProtectedRoute>
                  <GradeSubmission />
                </ProtectedRoute>
              } />
              <Route path="/course/stream/:courseId/upload-material" element={
                <ProtectedRoute>
                  <UploadMaterial />
                </ProtectedRoute>
              } />

              {/* QUẢN LÝ BÀI NỘP */}
              <Route path="/submissions" element={
                <ProtectedRoute>
                  <SubmissionList />
                </ProtectedRoute>
              } />

              {/* CÁC ROUTE MỚI MÀ TEAM BRO VỪA CODE THÊM (PA4) */}
              <Route path="/materials" element={<MaterialsPage />} />
              <Route path="/quizzes" element={<QuizPage />} />

              {/* MẶC ĐỊNH LÀ ĐẨY VỀ TRANG ĐĂNG NHẬP */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </div>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;