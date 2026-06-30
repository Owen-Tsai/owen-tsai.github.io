import type { ReactNode } from 'react'
import cn from 'classnames'
import { Info, AlertTriangle, FileEdit, Lightbulb } from 'lucide-react'

type CalloutIcon = 'Info' | 'AlertTriangle' | 'FileEdit' | 'Lightbulb'

interface CalloutProps {
  title?: string
  type?: 'info' | 'warning' | 'default'
  icon?: CalloutIcon
  children?: ReactNode
}

const iconMap: Record<CalloutIcon, React.ComponentType<{ className?: string }>> = {
  Info,
  AlertTriangle,
  FileEdit,
  Lightbulb,
}

const defaultIconByType: Record<'info' | 'warning' | 'default', CalloutIcon | null> = {
  info: 'Info',
  warning: 'AlertTriangle',
  default: null,
}

const styleMap = {
  info: 'border-border-secondary bg-bg-tertiary text-text-secondary',
  warning: 'border-border-primary bg-bg-secondary/50 text-text-primary',
  default: 'border-border-secondary bg-bg-tertiary text-text-secondary',
}

export default function Callout({ title, type = 'default', icon, children }: CalloutProps) {
  const iconName = icon ?? defaultIconByType[type]
  const Icon = iconName ? iconMap[iconName] : null

  return (
    <div className={cn('my-6 rounded-lg border p-4 text-sm', styleMap[type])}>
      <div className="flex items-start gap-3">
        {Icon && <Icon className="mt-0.5 h-4 w-4 shrink-0 text-text-secondary" />}
        <div className="flex-1">
          {title && <p className="mb-2 font-semibold text-text-primary">{title}</p>}
          <div className="space-y-2">{children}</div>
        </div>
      </div>
    </div>
  )
}
