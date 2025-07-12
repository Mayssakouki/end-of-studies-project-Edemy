import { createBrowserRouter } from 'react-router-dom'
import './App.css'
import Navbar from './components/Navbar'
import Login from './pages/Login'
import HeroSection from './pages/student/HeroSection'

import MainLayout from './layout/MainLayout'
import { RouterProvider } from 'react-router'
import Courses from './pages/student/Courses'
import MyLearning from './pages/student/MyLearning'
import Profile from './pages/student/Profile'
import Sidebar from './pages/admin/Sidebar'
import Dashboard from './pages/admin/Dashboard'
import CourseTable from './pages/admin/course/CourseTable'
import AddCourse from './pages/admin/course/AddCourse'
import EditCourse from './pages/admin/course/EditCourse'
import CreateLecture from './pages/admin/lecture/CreateLecture'
import EditLecture from './pages/admin/lecture/EditLecture'
import CourseDetail from './pages/student/CourseDetail'
import CourseProgress from './pages/student/CourseProgress'
import SearchPage from './pages/student/SearchPage'
import { AdminRoute, AuthenticatedUser, ProtectedRoute } from './components/ProtectedRoutes'
import PurchaseCourseProtectedRoute from './components/PurchaseCourseProtectedRoute'
import RecommendedCourse from './pages/student/RecommendedCourse'
import path from 'path'
import UserTable from './pages/superadmin/UserTable'
import Sidebarr from './pages/superadmin/Sidebarr'
import EditQuiz from './pages/admin/quiz/EditQuiz'
import CreateQuiz from './pages/admin/quiz/CreateQuiz'
import QuizList from './pages/admin/quiz/QuizList'
import Quiz from "./pages/student/Quiz"; // Ajouté
import SuperadminDashboard from './pages/superadmin/SuperAdminDashboard'


// ce fichier représente les routes de notre application
const appRouter = createBrowserRouter
([
 {
  path: "/",
  element: <MainLayout/>,
  children:[
    {
    path: "/",
    element:(
      <>
      <HeroSection/>
    <Courses/>
      </>
    ),
    
  },
  {
    path: "login",
    element: <AuthenticatedUser><Login/></AuthenticatedUser> 
  },
  {
    path: "my-learning",
    element:<ProtectedRoute><MyLearning/></ProtectedRoute> 
  },
  {
    path: "profile",
    element: <ProtectedRoute><Profile/></ProtectedRoute> 
  },
  {
    path: "course/search",
    element: <ProtectedRoute><SearchPage/></ProtectedRoute>
  },
  {
    path: "course-progress/:courseId",
    element:<ProtectedRoute>
      <PurchaseCourseProtectedRoute/>
      <CourseProgress/></ProtectedRoute> 
  },
  {
        path: "course-progress/:courseId/quiz/:quizId", // Nouvelle route
        element: (
          <ProtectedRoute>
            <PurchaseCourseProtectedRoute />
            <Quiz />
          </ProtectedRoute>
        ),
      },
  {
    path: "course-detail/:courseId",
    element: <ProtectedRoute><CourseDetail/></ProtectedRoute> 
  },
  {
    path:"course-recommend/:courseId",
    element: <ProtectedRoute><RecommendedCourse/></ProtectedRoute>
  },
 // admin= instructor routes
  {
    path: "admin",
    element:<AdminRoute><Sidebar/></AdminRoute> ,
    children: [
        {
          path:"dashboard",
          element:<Dashboard/>
        },
        {
          path:"course/create",
          element:<AddCourse/>
        },
        {
          path: "course",
          element: <CourseTable />,
        },
        {
          path: "course/:courseId",
          element: <EditCourse />,
        },
        {
          path: "course/:courseId/lecture",
          element: <CreateLecture />,
        },
        {
          path: "course/:courseId/lecture/:lectureId",
          element: <EditLecture />,
        },
       /* {path:"users",
          element:<UserTable/>
        }*/
          {
            path: "course/:courseId/quiz",
            element: <QuizList />,
          },
          {
            path: "course/:courseId/quiz/create",
            element: <CreateQuiz />,
          },
          {
            path: "course/:courseId/quiz/:quizId",
            element: <EditQuiz />,
          },
          
          
         

    ]

  },
  //super admin routes
 { path: "superadmin",
    element:<AdminRoute><Sidebarr/></AdminRoute> ,
    children: [
          {path:"users",
          element:<UserTable/>
        },
       
        {
          path:"course/create",
          element:<AddCourse/>
        },
        {
          path: "course",
          element: <CourseTable />,
        },
        {
          path: "course/:courseId",
          element: <EditCourse />,
        },
        {
          path: "course/:courseId/lecture",
          element: <CreateLecture />,
        },
        {
          path: "course/:courseId/lecture/:lectureId",
          element: <EditLecture />,
        },
        {
            path: "dashboard",
            element: <SuperadminDashboard />
          },
      
      ]},
        
  


]
 }

])
function App() {
  

  return (
    <main style={{ overflow: "auto", height: "100vh", paddingBottom: "15px" }}>
      <RouterProvider router={appRouter}/>
    </main>
   
  )
}

export default App
