import WorkerSearchPage from '../features/worker/pages/WorkerSearchPage';
import LoginPage from '../features/auth/pages/LoginPage';
import RegisterPage from '../features/auth/pages/RegisterPage';
import BookingFormPage from '../features/booking/pages/BookingFormPage';
import ChatWindowPage from '../features/chat/pages/ChatWindowPage';
import AdminDashboardPage from '../features/admin/pages/AdminDashboardPage';

export const appRoutes = [
  {
    path: '/',
    element: WorkerSearchPage,
    index: true,
  },
  {
    path: '/login',
    element: LoginPage,
  },
  {
    path: '/register',
    element: RegisterPage,
  },
  {
    path: '/workers',
    element: WorkerSearchPage,
  },
  {
    path: '/booking',
    element: BookingFormPage,
  },
  {
    path: '/chat',
    element: ChatWindowPage,
  },
  {
    path: '/admin',
    element: AdminDashboardPage,
  },
];
