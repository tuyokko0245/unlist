import { AuthGuard } from '@/components/auth/AuthGuard';

export default function AppLayout({ children }: LayoutProps<'/'>) {
  return <AuthGuard>{children}</AuthGuard>;
}
