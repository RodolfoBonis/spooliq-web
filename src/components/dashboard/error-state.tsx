'use client';

import { motion } from 'framer-motion';
import { AlertCircle, RefreshCw, WifiOff, ServerCrash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useReducedMotion } from '@/hooks/use-reduced-motion';

type ErrorType = 'generic' | 'network' | 'server';

interface DashboardErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  type?: ErrorType;
  className?: string;
  compact?: boolean;
}

const errorConfig: Record<ErrorType, { icon: typeof AlertCircle; defaultTitle: string; defaultMessage: string }> = {
  generic: {
    icon: AlertCircle,
    defaultTitle: 'Erro ao carregar dados',
    defaultMessage: 'Ocorreu um erro inesperado. Por favor, tente novamente.',
  },
  network: {
    icon: WifiOff,
    defaultTitle: 'Sem conexão',
    defaultMessage: 'Verifique sua conexão com a internet e tente novamente.',
  },
  server: {
    icon: ServerCrash,
    defaultTitle: 'Erro no servidor',
    defaultMessage: 'O servidor está temporariamente indisponível. Tente novamente em alguns instantes.',
  },
};

export function DashboardErrorState({
  title,
  message,
  onRetry,
  type = 'generic',
  className,
  compact = false,
}: DashboardErrorStateProps) {
  const prefersReducedMotion = useReducedMotion();
  const config = errorConfig[type];
  const Icon = config.icon;

  const content = (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center',
        compact ? 'py-8' : 'py-12'
      )}
    >
      <div
        className={cn(
          'rounded-full bg-destructive/10 mb-4',
          compact ? 'p-3' : 'p-4'
        )}
      >
        <Icon
          className={cn(
            'text-destructive',
            compact ? 'h-6 w-6' : 'h-8 w-8'
          )}
          aria-hidden="true"
        />
      </div>
      <h3
        className={cn(
          'font-semibold text-foreground mb-2',
          compact ? 'text-base' : 'text-lg'
        )}
      >
        {title ?? config.defaultTitle}
      </h3>
      <p
        className={cn(
          'text-muted-foreground max-w-sm mb-4',
          compact ? 'text-xs' : 'text-sm'
        )}
      >
        {message ?? config.defaultMessage}
      </p>
      {onRetry && (
        <Button
          variant="outline"
          size={compact ? 'sm' : 'default'}
          onClick={onRetry}
          className="gap-2"
          aria-label="Tentar novamente"
        >
          <RefreshCw className="h-4 w-4" aria-hidden="true" />
          Tentar novamente
        </Button>
      )}
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
