'use client';

import { EllipsisVertical, Share, SquarePlus } from 'lucide-react';
import type { ReactNode } from 'react';

import { BottomSheet } from '@/components/layout/BottomSheet';
import { Button } from '@/components/primitives/Button';
import { usePwaInstall } from '@/hooks/usePwaInstall';

function Step({ index, children }: { index: number; children: ReactNode }) {
  return (
    <li className="flex items-start gap-3 rounded-md bg-chip px-3 py-3">
      <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-base-300 text-meta font-bold text-on-base">
        {index}
      </span>
      <span className="flex-1 pt-0.5 text-body text-fg">{children}</span>
    </li>
  );
}

function InlineIcon({ children }: { children: ReactNode }) {
  return (
    <span className="mx-0.5 inline-flex translate-y-[3px] items-center text-base-700" aria-hidden="true">
      {children}
    </span>
  );
}

export function PwaInstallModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { mode, install } = usePwaInstall();

  if (!isOpen) return null;

  return (
    <BottomSheet isOpen onClose={onClose} title="ホーム画面に追加">
      <div className="flex flex-col gap-3 px-1 pt-2 pb-1">
        {mode === 'installed' && (
          <p className="text-body text-fg-secondary">すでにホーム画面から開いています</p>
        )}

        {mode === 'prompt' && (
          <>
            <p className="text-body text-fg-secondary">
              ホーム画面にアイコンが追加され、アプリのように開けます。通知も届きやすくなります
            </p>
            <Button
              size="lg"
              fullWidth
              onClick={() => {
                void install().then((accepted) => {
                  if (accepted) onClose();
                });
              }}
            >
              インストールする
            </Button>
          </>
        )}

        {mode === 'ios' && (
          <>
            <p className="text-body text-fg-secondary">Safari で次の手順を行ってください</p>
            <ol className="flex flex-col gap-2">
              <Step index={1}>
                画面下の共有ボタン
                <InlineIcon>
                  <Share size={18} />
                </InlineIcon>
                をタップ
              </Step>
              <Step index={2}>
                「ホーム画面に追加」
                <InlineIcon>
                  <SquarePlus size={18} />
                </InlineIcon>
                を選ぶ
              </Step>
              <Step index={3}>右上の「追加」をタップ</Step>
            </ol>
            <p className="text-meta text-fg-tertiary">
              iOS ではホーム画面に追加すると通知が届くようになります
            </p>
          </>
        )}

        {mode === 'manual' && (
          <ol className="flex flex-col gap-2">
            <Step index={1}>
              ブラウザのメニュー
              <InlineIcon>
                <EllipsisVertical size={18} />
              </InlineIcon>
              を開く
            </Step>
            <Step index={2}>「アプリをインストール」または「ホーム画面に追加」を選ぶ</Step>
          </ol>
        )}
      </div>
    </BottomSheet>
  );
}
