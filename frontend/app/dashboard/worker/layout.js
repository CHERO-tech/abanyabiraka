import RequireRole from '@/components/RequireRole';

// Everything under /dashboard/worker requires a logged-in WORKER account.
export default function Layout({ children }) {
  return <RequireRole roles={['WORKER']}>{children}</RequireRole>;
}
