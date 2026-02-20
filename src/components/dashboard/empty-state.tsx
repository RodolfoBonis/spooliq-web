'use client';

import { motion } from 'framer-motion';
import {
  LucideIcon,
  Inbox,
  Trophy,
  FileText,
  TrendingUp,
  Activity,
  Target,
  Package,
  Layers,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useReducedMotion } from '@/hooks/use-reduced-motion';
import Link from 'next/link';

type EmptyStateType =
  | 'generic'
  | 'customers'
  | 'budgets'
  | 'revenue'
  | 'activity'
  | 'goals'
  | 'filaments'
  | 'materials';

interface DashboardEmptyStateProps {
  title?: string;
  description?: string;
  type?: EmptyStateType;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
  icon?: LucideIcon;
  className?: string;
  compact?: boolean;
}

const emptyConfig: Record<
  EmptyStateType,
  { icon: LucideIcon; defaultTitle: string; defaultDescription: string; suggestedAction?: { label: string; href: string } }
> = {
  generic: {
    icon: Inbox,
    defaultTitle: 'Nenhum dado encontrado',
    defaultDescription: 'Não há dados para exibir neste período.',
  },
  customers: {
    icon: Trophy,
    defaultTitle: 'Nenhum cliente ainda',
    defaultDescription: 'Crie seu primeiro orçamento para começar a rastrear seus melhores clientes.',
    suggestedAction: { label: 'Criar orçamento', href: '/budgets/new' },
  },
  budgets: {
    icon: FileText,
    defaultTitle: 'Nenhum orçamento no período',
    defaultDescription: 'Não há orçamentos registrados neste período selecionado.',
    suggestedAction: { label: 'Criar orçamento', href: '/budgets/new' },
  },
  revenue: {
    icon: TrendingUp,
    defaultTitle: 'Sem receita no período',
    defaultDescription: 'Nenhum orçamento aprovado foi registrado neste período.',
    suggestedAction: { label: 'Ver orçamentos', href: '/budgets' },
  },
  activity: {
    icon: Activity,
    defaultTitle: 'Nenhuma atividade recente',
    defaultDescription: 'As ações no sistema aparecerão aqui conforme você utiliza a plataforma.',
  },
  goals: {
    icon: Target,
    defaultTitle: 'Nenhuma meta definida',
    defaultDescription: 'Configure metas mensais para acompanhar seu progresso.',
    suggestedAction: { label: 'Configurar metas', href: '/settings/goals' },
  },
  filaments: {
    icon: Package,
    defaultTitle: 'Nenhum filamento usado',
    defaultDescription: 'Os filamentos utilizados nos orçamentos aparecerão aqui.',
    suggestedAction: { label: 'Gerenciar catálogo', href: '/catalog' },
  },
  materials: {
    icon: Layers,
    defaultTitle: 'Nenhum material registrado',
    defaultDescription: 'Cadastre materiais no catálogo para ver estatísticas de uso.',
    suggestedAction: { label: 'Gerenciar materiais', href: '/catalog/materials' },
  },
};

export function DashboardEmptyState({
  title,
  description,
  type = 'generic',
  actionLabel,
  actionHref,
  onAction,
  icon: CustomIcon,
  className,
  compact = false,
}: DashboardEmptyStateProps) {
  const prefersReducedMotion = useReducedMotion();
  const config = emptyConfig[type];
  const Icon = CustomIcon ?? config.icon;
  const suggestedAction = config.suggestedAction;

  const finalActionLabel = actionLabel ?? suggestedAction?.label;
  const finalActionHref = actionHref ?? suggestedAction?.href;

  const content = (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center',
        compact ? 'py-6' : 'py-12'
      )}
    >
      <div
        className={cn(
          'rounded-full bg-muted mb-4',
          compact ? 'p-3' : 'p-4'
        )}
      >
        <Icon
          className={cn(
            'text-muted-foreground',
            compact ? 'h-6 w-6' : 'h-10 w-10'
          )}
          aria-hidden="true"
        />
      </div>
      <h3
        className={cn(
          'font-semibold text-foreground mb-1',
          compact ? 'text-sm' : 'text-lg'
        )}
      >
        {title ?? config.defaultTitle}
      </h3>
      <p
        className={cn(
          'text-muted-foreground max-w-xs',
          compact ? 'text-xs mb-3' : 'text-sm mb-4'
        )}
      >
        {description ?? config.defaultDescription}
      </p>
      {(finalActionLabel && finalActionHref) || onAction ? (
        finalActionHref ? (
          <Button
            variant="outline"
            size={compact ? 'sm' : 'default'}
            asChild
          >
            <Link href={finalActionHref}>{finalActionLabel}</Link>
          </Button>
        ) : (
          <Button
            variant="outline"
            size={compact ? 'sm' : 'default'}
            onClick={onAction}
          >
            {finalActionLabel}
          </Button>
        )
      ) : null}
    </div>
  );

  if (compact) {
    return <div className={className}>{content}</div>;
  }

  return (
    <motion.div
      initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
      animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={className}
    >
      <Card>
        <CardContent className="pt-6">{content}</CardContent>
      </Card>
    </motion.div>
  );
}
