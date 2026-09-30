import { AuthGuard } from '@/components/auth/AuthGuard';
import { ConfettiProvider } from '@/contexts/ConfettiContext';
import { ListsProvider } from '@/contexts/ListsContext';
import { SettingsProvider } from '@/contexts/SettingsContext';
import { SnackbarProvider } from '@/contexts/SnackbarContext';

export default function AppLayout({ children }: LayoutProps<'/'>) {
  return (
    <AuthGuard>
      <SettingsProvider>
        <ListsProvider>
          <SnackbarProvider>
            <ConfettiProvider>{children}</ConfettiProvider>
          </SnackbarProvider>
        </ListsProvider>
      </SettingsProvider>
    </AuthGuard>
  );
}
