import RequireRole from '@/components/RequireRole';

// Everything under /chat requires a logged-in CLIENT or WORKER account.
export default function Layout({ children }) {
  return <RequireRole roles={['CLIENT', 'WORKER']}>{children}</RequireRole>;
}
