import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Topics from "./pages/Topics";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import StudentDashboard from "./pages/StudentDashboard";
import QuizList from "./pages/QuizList";
import QuizInstructions from "./pages/QuizInstructions";
import QuizAttempt from "./pages/QuizAttempt";
import QuizResult from "./pages/QuizResult";
import QuizReview from "./pages/QuizReview";
import QuizHistory from "./pages/QuizHistory";
import Performance from "./pages/Performance";
import Profile from "./pages/Profile";
import LearnSession from "./pages/LearnSession";
import LearnResult from "./pages/LearnResult";
import AdminDashboard from "./pages/AdminDashboard";
import ManageCategories from "./pages/ManageCategories";
import ManageQuestions from "./pages/ManageQuestions";
import ManageQuizzes from "./pages/ManageQuizzes";
import ManageStudents from "./pages/ManageStudents";
import GenerateQuestions from "./pages/GenerateQuestions";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";


function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <StudentDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/quizzes"
          element={
            <ProtectedRoute>
              <QuizList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/quizzes/:id"
          element={
            <ProtectedRoute>
              <QuizInstructions />
            </ProtectedRoute>
          }
        />
        <Route
          path="/quizzes/:id/attempt"
          element={
            <ProtectedRoute>
              <QuizAttempt />
            </ProtectedRoute>
          }
        />
        <Route
  path="/topics"
  element={
    <ProtectedRoute>
      <Topics />
    </ProtectedRoute>
  }
/>
<Route
  path="/learn/:categoryId/:difficulty"
  element={
    <ProtectedRoute>
      <LearnSession />
    </ProtectedRoute>
  }
/>
<Route
  path="/learn/result"
  element={
    <ProtectedRoute>
      <LearnResult />
    </ProtectedRoute>
  }
/>
        <Route
          path="/quizzes/result/:id"
          element={
            <ProtectedRoute>
              <QuizResult />
            </ProtectedRoute>
          }
        />
        <Route
          path="/quizzes/review/:id"
          element={
            <ProtectedRoute>
              <QuizReview />
            </ProtectedRoute>
          }
        />
        <Route
          path="/history"
          element={
            <ProtectedRoute>
              <QuizHistory />
            </ProtectedRoute>
          }
        />
        <Route
          path="/performance"
          element={
            <ProtectedRoute>
              <Performance />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/dashboard"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/categories"
          element={
            <AdminRoute>
              <ManageCategories />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/questions"
          element={
            <AdminRoute>
              <ManageQuestions />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/quizzes"
          element={
            <AdminRoute>
              <ManageQuizzes />
            </AdminRoute>
          }
        />
        <Route
  path="/admin/generate-questions"
  element={
    <AdminRoute>
      <GenerateQuestions />
    </AdminRoute>
  }
/>
        <Route
          path="/admin/students"
          element={
            <AdminRoute>
              <ManageStudents />
            </AdminRoute>
          }
        />
      </Routes>
      
    </>
  );
}

export default App;