import { memo } from 'react';

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

import { ChevronUp, CopyIcon } from 'lucide-react';

interface CodeBlockActionsProps {
  isCollapsed: boolean;
  onCopy: () => void;
  onToggleCollapse: () => void;
}

export const CodeBlockActions = memo(
  ({ isCollapsed, onCopy, onToggleCollapse }: CodeBlockActionsProps) => {
    return (
      <div className="flex gap-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              aria-label="复制代码"
              className="flex cursor-pointer items-center justify-center rounded-sm px-2 py-2 transition-colors hover:bg-muted hover:text-foreground"
              onClick={onCopy}
            >
              <CopyIcon size={16} />
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <span>复制</span>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              aria-label={isCollapsed ? '展开代码块' : '收起代码块'}
              className="flex cursor-pointer items-center justify-center rounded-sm px-2 py-2 transition-colors hover:bg-muted hover:text-foreground"
              onClick={onToggleCollapse}
            >
              <ChevronUp
                size={16}
                className={`transition-transform duration-200 ease-out ${
                  isCollapsed ? 'rotate-180' : 'rotate-0'
                }`}
              />
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <span>{isCollapsed ? '展开' : '收起'}</span>
          </TooltipContent>
        </Tooltip>
      </div>
    );
  }
);

CodeBlockActions.displayName = 'CodeBlockActions';
