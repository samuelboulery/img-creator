'use client'

import Dialog from './Dialog'
import { Button, Kbd } from '@/components/atelier/ui'
import { useT } from '@/lib/i18n'

function Row({ keys, label }: { keys: string[]; label: string }) {
  return (
    <li className="flex h-8 items-center justify-between gap-3 text-12">
      {label}
      <Kbd keys={keys} />
    </li>
  )
}

export function ShortcutsDialog({ onClose }: { onClose: () => void }) {
  const t = useT()
  const s = t.shortcuts
  return (
    <Dialog title={s.title} onClose={onClose} width={440}>
      <div className="flex flex-col gap-4 p-4">
        <section>
          <h3 className="lbl pb-1">{s.everywhere}</h3>
          <ul>
            <Row keys={['mod', '↵']} label={s.generate} />
            <Row keys={['mod', 'K']} label={s.everything} />
            <Row keys={['mod', 'E']} label={s.export} />
            <Row keys={['mod', 'Z']} label={s.undo} />
            <Row keys={['mod', '.']} label={s.stop} />
            <Row keys={['/']} label={s.focusPrompt} />
            <Row keys={['Esc']} label={s.back} />
            <Row keys={['?']} label={s.help} />
          </ul>
        </section>
        <section>
          <h3 className="lbl pb-1">{s.focused}</h3>
          <ul>
            <Row keys={['↑', '↓']} label={s.move} />
            <Row keys={['R']} label={s.reuse} />
            <Row keys={['V']} label={s.vary} />
            <Row keys={['⌫']} label={s.delete} />
          </ul>
        </section>
        <p className="meta">{s.note}</p>
      </div>
    </Dialog>
  )
}

interface ConfirmClearProps {
  count: number
  onConfirm: () => void
  onClose: () => void
}

/** Nouvelle session : la seule action sans annulation, donc la seule confirmée. */
export function ConfirmClearDialog({ count, onConfirm, onClose }: ConfirmClearProps) {
  const t = useT()
  return (
    <Dialog title={t.confirm.newSessionTitle} onClose={onClose} width={400}>
      <div className="flex flex-col gap-4 p-4">
        <p className="text-13">{t.confirm.newSessionBody(count)}</p>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" autoFocus onClick={onClose}>
            {t.common.cancel}
          </Button>
          <Button variant="danger" onClick={onConfirm}>
            {t.confirm.newSessionConfirm}
          </Button>
        </div>
      </div>
    </Dialog>
  )
}
