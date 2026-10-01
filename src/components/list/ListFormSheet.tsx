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
          {mode === 'create' ? '追加する' : '保存する'}
        </Button>
      }
    >
      <div className="flex flex-col gap-5 px-1 pt-2 pb-1">
        <Input
          id="list-name"
          label="リスト名"
          placeholder="例：仕事"
          value={name}
          onChange={setName}
          maxLength={MAX_LIST_NAME}
          autoFocus
        />
        <ColorPalette value={color} onChange={setColor} label="リストのカラー" />
      </div>
    </BottomSheet>
  );
}
