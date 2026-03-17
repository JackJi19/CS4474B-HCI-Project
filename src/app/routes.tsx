import { createBrowserRouter } from 'react-router-dom';
import { App } from './App';
import { HomePage } from '../pages/HomePage/HomePage';
import { StudentSessionPage } from '../pages/StudentSessionPage/StudentSessionPage';
import { TeacherSetupPage } from '../pages/TeacherSetupPage/TeacherSetupPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: 'teacher/setup',
        element: <TeacherSetupPage />,
      },
      {
        path: 'student/session',
        element: <StudentSessionPage />,
      },
    ],
  },
]);
