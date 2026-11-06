import RequireRole from '@/components/RequireRole';

// Everything under /booking requires a logged-in CLIENT account.
export default function Layout({ children }) {
  return <RequireRole roles={['CLIENT']}>{children}</RequireRole>;
}
