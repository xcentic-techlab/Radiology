import { Badge } from '@/components/ui/badge';
import { statusColorMap } from '@/utils/statusConfig';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: keyof typeof statusColorMap;
  className?: string;
}

export const StatusBadge = ({ status, className }: StatusBadgeProps) => {
  const config = statusColorMap[status] || statusColorMap.pending;

  return (
    <Badge className={cn(config.bg, config.text, 'font-medium', className)}>
      {config.label}
    </Badge>
  );
};
