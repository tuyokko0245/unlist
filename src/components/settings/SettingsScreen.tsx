'use client';

import { useCallback, useState } from 'react';

import { AppShell } from '@/components/layout/AppShell';
import { ColorPalette } from '@/components/list/ColorPalette';
import { Button } from '@/components/primitives/Button';
import { Spinner } from '@/components/primitives/Spinner';
import { Toggle } from '@/components/primitives/Toggle';
import { PwaInstallModal } from '@/components/settings/PwaInstallModal';
import { ReauthPasswordDialog } from '@/components/settings/ReauthPasswordDialog';
import { SettingRow } from '@/components/settings/SettingRow';
import { SettingsSection } from '@/components/settings/SettingsSection';
import { useAccountDeletion } from '@/hooks/useAccountDeletion';
import { useAuth } from '@/hooks/useAuth';
import { useConfirmDialog } from '@/hooks/useConfirmDialog';
import { useNotificationPermission } from '@/hooks/useNotificationPermission';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { useSettings } from '@/hooks/useSettings';
import { useSettingsMutations } from '@/hooks/useSettingsMutations';
import { useSnackbar } from '@/hooks/useSnackbar';
import { authErrorMessage, getAuthErrorCode } from '@/lib/auth/authErrorMessage';
import packageJson from '../../../package.json';

const SAVE_ERROR = '保存できませんでした。通信環境を確認してください';

export function SettingsScreen() {
  const { user, signOut } = useAuth();
  const { settings } = useSettings();
  const { updateBaseColor, setNotificationsEnabled } = useSettingsMutations();
  const { permission, request } = useNotificationPermission();
  const { reauthMethod, needsReauth, reauthWithGoogle, reauthWithPassword, deleteAccount } =
    useAccountDeletion();
  const { confirm } = useConfirmDialog();
  const { showSnackbar } = useSnackbar();
  const isOnline = useOnlineStatus();

  const [isPwaOpen, setIsPwaOpen] = useState(false);
  const [isAskingPassword, setIsAskingPassword] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const changeColor = useCallback(
    (color: string) => {
      if (color.toUpperCase() === settings.baseColor.toUpperCase()) return;
      updateBaseColor(color).catch(() => showSnackbar({ message: SAVE_ERROR, variant: 'error' }));
    },
    [settings.baseColor, updateBaseColor, showSnackbar],
  );

  const toggleNotifications = useCallback(
    async (next: boolean) => {
      if (!next) {
        await setNotificationsEnabled(false).catch(() => showSnackbar({ message: SAVE_ERROR, variant: 'error' }));
        return;
      }
      const result = permission === 'granted' ? 'granted' : await request();
      if (result !== 'granted') {
        showSnackbar({ message: 'ブラウザの通知が許可されていません', variant: 'warning' });
        return;
      }
      await setNotificationsEnabled(true).catch(() => showSnackbar({ message: SAVE_ERROR, variant: 'error' }));
    },
    [permission, request, setNotificationsEnabled, showSnackbar],
  );

  const logout = useCallback(async () => {
    const accepted = await confirm({
      title: 'ログアウトしますか？',
      confirmLabel: 'ログアウト',
    });
    if (!accepted) return;
    try {
      await signOut();
    } catch {
      showSnackbar({ message: 'ログアウトできませんでした。もう一度お試しください', variant: 'error' });
    }
  }, [confirm, signOut, showSnackbar]);

  const runDeletion = useCallback(() => {
    const run = async (): Promise<void> => {
      setIsDeleting(true);
      try {
        await deleteAccount();
      } catch (error) {
        setIsDeleting(false);
        if (getAuthErrorCode(error) === 'auth/requires-recent-login') {
          showSnackbar({
            message: 'データは削除しましたが、アカウントの削除には本人確認が必要です。もう一度「退会する」から進めてください',
            variant: 'error',
            duration: 8000,
          });
          return;
        }
        showSnackbar({
          message: '退会の途中で失敗しました。通信環境を確認して、もう一度お試しください',
          variant: 'error',
          duration: 8000,
          action: { label: 'もう一度試す', onClick: () => void run() },
        });
      }
    };
    return run();
  }, [deleteAccount, showSnackbar]);

  const withdraw = useCallback(async () => {
    const first = await confirm({
      title: '退会しますか？',
      message: 'すべてのタスク・リスト・設定が削除されます',
      confirmLabel: '次へ',
      isDangerous: true,
    });
    if (!first) return;
    const second = await confirm({
      title: '本当に退会しますか？',
      message: 'アカウントとすべてのデータを削除します。この操作は取り消せません',
      confirmLabel: '退会する',
      isDangerous: true,
    });
    if (!second) return;

    if (needsReauth()) {
      if (reauthMethod === 'password') {
        setIsAskingPassword(true);
        return;
      }
      try {
        await reauthWithGoogle();
      } catch (error) {
        const code = getAuthErrorCode(error);
        const message =
          code === 'auth/user-mismatch'
            ? 'ログイン中と同じGoogleアカウントを選んでください'
            : authErrorMessage(error, 'google');
        if (message) showSnackbar({ message, variant: 'error' });
        return;
      }
    }
    await runDeletion();
  }, [confirm, needsReauth, reauthMethod, reauthWithGoogle, runDeletion, showSnackbar]);

  const submitPassword = useCallback(
    async (password: string) => {
      try {
        await reauthWithPassword(password);
      } catch (error) {
        return authErrorMessage(error, 'signIn') ?? 'もう一度お試しください';
      }
      setIsAskingPassword(false);
      void runDeletion();
      return null;
    },
    [reauthWithPassword, runDeletion],
  );

  const notificationNote =
    permission === 'unsupported'
      ? 'このブラウザは通知に対応していません'
      : permission === 'denied'
        ? '通知がブロックされています。ブラウザのサイト設定から通知を許可してください'
        : '朝8時に期限当日・前日のタスクをお知らせします（送信は準備中です）';

  return (
    <AppShell header={{ title: '設定' }} activeTab="settings" activeView="settings" showFab={false}>
      <main className="mx-auto flex w-full max-w-content-max flex-col gap-6 px-4 pt-2 pb-list-pad-bottom md:px-8 md:pb-10">
        <SettingsSection title="アカウント">
          <SettingRow label="ログイン中" value={user?.email ?? ''} />
        </SettingsSection>

        <SettingsSection title="テーマカラー" note="アプリ全体の色が変わります">
          <div className="p-4">
            <ColorPalette value={settings.baseColor} onChange={changeColor} label="テーマカラー" labelHidden />
          </div>
        </SettingsSection>

        <SettingsSection title="通知" note={notificationNote}>
          <SettingRow
            label="通知を受け取る"
            control={
              <Toggle
                id="settings-notifications"
                label="通知を受け取る"
                checked={settings.notificationsEnabled && permission === 'granted'}
                disabled={permission === 'unsupported' || permission === 'denied'}
                onChange={(next) => void toggleNotifications(next)}
              />
            }
          />
        </SettingsSection>

        <SettingsSection title="ホーム画面" note="インストールすると通知が届きやすくなります">
          <SettingRow label="ホーム画面に追加" onClick={() => setIsPwaOpen(true)} />
        </SettingsSection>

        <SettingsSection title="その他">
          <SettingRow label="バージョン" value={packageJson.version} />
        </SettingsSection>

        <div className="mt-2 flex flex-col gap-3 pb-6">
          <Button size="lg" variant="secondary" fullWidth onClick={() => void logout()}>
            ログアウト
          </Button>
          <Button
            size="lg"
            variant="danger-outline"
            fullWidth
            disabled={!isOnline}
            onClick={() => void withdraw()}
          >
            退会する（すべてのデータを削除）
          </Button>
          {!isOnline && (
            <p className="px-1 text-meta text-fg-tertiary">退会はオンラインのときだけ行えます</p>
          )}
        </div>
      </main>

      <PwaInstallModal isOpen={isPwaOpen} onClose={() => setIsPwaOpen(false)} />

      {isAskingPassword && (
        <ReauthPasswordDialog
          email={user?.email ?? ''}
          onSubmit={submitPassword}
          onCancel={() => setIsAskingPassword(false)}
        />
      )}

      {isDeleting && (
        <div
          role="alertdialog"
          aria-modal="true"
          aria-label="退会処理中"
          className="fixed inset-0 z-85 flex flex-col items-center justify-center gap-4 bg-[var(--color-overlay)] px-6"
        >
          <div className="flex flex-col items-center gap-3 rounded-lg border border-border bg-elevated px-8 py-6 text-base-600 shadow-lg">
            <Spinner size={32} label="退会処理中" />
            <p className="text-body text-fg">退会処理をしています…</p>
            <p className="text-meta text-fg-tertiary">画面を閉じずにお待ちください</p>
          </div>
        </div>
      )}
    </AppShell>
  );
}
