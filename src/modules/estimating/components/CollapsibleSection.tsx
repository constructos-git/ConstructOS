import { ReactNode, useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import Tooltip from '@/components/ui/Tooltip';

export function CollapsibleSection({
  title,
  tooltip,
  defaultExpanded = true,
  children,
}: {
  title: string;
  tooltip?: string;
  defaultExpanded?: boolean;
  children: ReactNode;
}) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className="space-y-2">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 w-full text-left text-sm font-semibold hover:text-foreground transition-colors"
        type="button"
      >
        {isExpanded ? (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        )}
        {tooltip ? (
          <Tooltip content={tooltip}>
            <span>{title}</span>
          </Tooltip>
        ) : (
          <span>{title}</span>
        )}
      </button>
      {isExpanded && <div>{children}</div>}
    </div>
  );
}


