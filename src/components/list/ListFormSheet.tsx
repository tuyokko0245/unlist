'use client';

import { useState } from 'react';

import { BottomSheet } from '@/components/layout/BottomSheet';
import { ColorPalette } from '@/components/list/ColorPalette';
import { Button } from '@/components/primitives/Button';
import { Input } from '@/components/primitives/Input';
import { DEFAULT_BASE_COLOR } from '@/constants/palette';
import { MAX_LIST_NAME, type List } from '@/types/domain';

export interface ListFormSheetProps {
  mode: 'create' | 'edit';
  list?: List;
  onClose: () => void;
  onSubmit: (values: { name: string; color: string }) => Promise<void>;
}

export function ListFormSheet({ mode, list, onClose, onSubmit }: ListFormSheetProps) {
  const [name, setName] = useState(list?.name ?? '');
  const [color, setColor] = useState(list?.color ?? DEFAULT_BASE_COLOR);
  const [isSaving, setIsSaving] = useState(false);

  const nameLocked = list?.isDefault ?? false;

  const handleSubmit = async () => {
    if (name.trim().length === 0) return;
    setIsSaving(true);
    try {
      await onSubmit({ name: name.trim(), color });
      onClose();
    } catch {
      setIsSaving(false);
    }
  };

  return (
    <BottomSheet
      isOpen
      onClose={onClose}
      title={mode === 'create' ? 'リストを追加' : 'リストを編集'}
      footer={
        <Button
          fullWidth
          size="lg"
          loading={isSaving}
          disabled={name.trim().length === 0}
          onClick={() => void handleSubmit()}
        >
          {mode === 'create' ? '作成' : '保存'}
        </Button>
      }
    >
      <div className="flex flex-col gap-4 px-1 pt-2 pb-1">
        {nameLocked ? (
          <div className="flex flex-col gap-2">
            <p className="pl-1 text-meta text-fg-secondary">リスト名</p>
            <p className="flex h-13 items-center rounded-md border border-border bg-surface px-3.5 text-body text-fg-secondary">
              {name}
            </p>
            <p className="pl-1 text-meta text-fg-tertiary">受信トレイの名前は変更できません</p>
          </div>
        ) : (
          <Input
            id="list-name"
            label="リスト名"
            placeholder="リスト名"
            value={name}
            onChange={setName}
            maxLength={MAX_LIST_NAME}
            autoFocus
          />
        )}

        <div className="flex items-center gap-2">
          <h3 className="section-label shrink-0">カラー</h3>
          <span className="h-px flex-1 bg-border" aria-hidden="true" />
        </div>

        <ColorPalette value={color} onChange={setColor} label="リストのカラー" labelHidden />
      </div>
    </BottomSheet>
  );
}
