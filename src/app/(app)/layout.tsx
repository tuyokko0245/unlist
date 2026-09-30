import { AuthGuard } from '@/components/auth/AuthGuard';
import { ConfettiProvider } from '@/contexts/ConfettiContext';
import { ConfirmDialogProvider } from '@/contexts/ConfirmDialogContext';
import { ListsProvider } from '@/contexts/ListsContext';
import { SettingsProvider } from '@/contexts/SettingsContext';
import { SnackbarProvider } from '@/contexts/SnackbarContext';

export default function AppLayout({ children }: LayoutProps<'/'>) {
  return (
    <AuthGuard>
      <SettingsProvider>
        <ListsProvider>
          <SnackbarProvider>
            <ConfirmDialogProvider>
              <ConfettiProvider>{children}</ConfettiProvider>
            </ConfirmDialogProvider>
          </SnackbarProvider>
        </ListsProvider>
      </SettingsProvider>
    </AuthGuard>
  );
}
