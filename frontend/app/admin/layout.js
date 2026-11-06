import RequireRole from '@/components/RequireRole';

// Everything under /admin requires a logged-in ADMIN account.
export default function Layout({ children }) {
  return <RequireRole roles={['ADMIN']}>{children}</RequireRole>;
}
