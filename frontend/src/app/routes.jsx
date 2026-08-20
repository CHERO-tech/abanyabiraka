import HomePage from '../features/auth/pages/LoginPage';

export const appRoutes = [
  {
    path: '/',
    element: HomePage,
    index: true,
  },
  {
    path: '/login',
    element: HomePage,
  },
  {
    path: '/register',
    element: () => <div>Register Page</div>,
  },
  {
    path: '/workers',
    element: () => <div>Worker Search Page</div>,
  },
  {
    path: '/booking',
    element: () => <div>Booking Page</div>,
  },
  {
    path: '/chat',
    element: () => <div>Chat Page</div>,
  },
  {
    path: '/admin',
    element: () => <div>Admin Dashboard</div>,
  },
];
