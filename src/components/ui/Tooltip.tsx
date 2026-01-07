import { ReactNode, useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';
import { useSidebarStore } from '@/stores/sidebarStore';

export interface TooltipProps {
  children: ReactNode;
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export default function Tooltip({
  children,
  content,
  position = 'top',
}: TooltipProps) {
  const { isCollapsed } = useSidebarStore();
  const [isVisible, setIsVisible] = useState(false);
  const [adjustedPosition, setAdjustedPosition] = useState(position);
  const [tooltipStyle, setTooltipStyle] = useState<React.CSSProperties>({});
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isVisible && triggerRef.current && tooltipRef.current) {
      const triggerRect = triggerRef.current.getBoundingClientRect();
      const tooltipRect = tooltipRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;
      
      // Account for sidebar - dynamically calculate based on collapsed state
      // Sidebar is w-16 (64px) when collapsed, w-64 (256px) when expanded
      const sidebarWidth = isCollapsed ? 64 : 256;
      const minLeft = sidebarWidth + 8; // 8px padding from sidebar
      const maxRight = viewportWidth - 8; // 8px padding from right edge
      
      let newPosition = position;
      const style: React.CSSProperties = {};

      // Check if tooltip would be cut off at the top
      if (position === 'top' && triggerRect.top - tooltipRect.height - 8 < 0) {
        newPosition = 'bottom';
      }
      // Check if tooltip would be cut off at the bottom
      else if (position === 'bottom' && triggerRect.bottom + tooltipRect.height + 8 > viewportHeight) {
        newPosition = 'top';
      }
      // Check if tooltip would be cut off on the left (accounting for sidebar)
      else if (position === 'left' && triggerRect.left - tooltipRect.width - 8 < minLeft) {
        newPosition = 'right';
      }
      // Check if tooltip would be cut off on the right
      else if (position === 'right' && triggerRect.right + tooltipRect.width + 8 > maxRight) {
        newPosition = 'left';
      }

      setAdjustedPosition(newPosition);

      // Max width for tooltip (280px)
      const maxTooltipWidth = 280;
      const tooltipWidth = Math.min(tooltipRect.width, maxTooltipWidth);

      // Calculate position for fixed positioning with viewport constraints
      if (newPosition === 'top') {
        const leftPos = triggerRect.left + triggerRect.width / 2;
        // Ensure tooltip doesn't go off left edge (accounting for sidebar)
        const constrainedLeft = Math.max(minLeft + tooltipWidth / 2, Math.min(leftPos, maxRight - tooltipWidth / 2));
        style.bottom = `${viewportHeight - triggerRect.top + 8}px`;
        style.left = `${constrainedLeft}px`;
        style.transform = 'translateX(-50%)';
      } else if (newPosition === 'bottom') {
        const leftPos = triggerRect.left + triggerRect.width / 2;
        // Ensure tooltip doesn't go off left edge (accounting for sidebar)
        const constrainedLeft = Math.max(minLeft + tooltipWidth / 2, Math.min(leftPos, maxRight - tooltipWidth / 2));
        style.top = `${triggerRect.bottom + 8}px`;
        style.left = `${constrainedLeft}px`;
        style.transform = 'translateX(-50%)';
      } else if (newPosition === 'left') {
        // Position to the right of trigger, but ensure it doesn't go off left edge
        const rightPos = viewportWidth - triggerRect.left + 8;
        const constrainedRight = Math.max(viewportWidth - maxRight, rightPos);
        style.right = `${constrainedRight}px`;
        style.top = `${triggerRect.top + triggerRect.height / 2}px`;
        style.transform = 'translateY(-50%)';
        // If still too far left, switch to right positioning
        if (triggerRect.left - tooltipWidth - 8 < minLeft) {
          style.right = 'auto';
          style.left = `${Math.max(minLeft, triggerRect.right + 8)}px`;
        }
      } else if (newPosition === 'right') {
        // Ensure tooltip doesn't go off right edge
        const leftPos = triggerRect.right + 8;
        const constrainedLeft = Math.min(leftPos, maxRight - tooltipWidth);
        style.left = `${Math.max(minLeft, constrainedLeft)}px`;
        style.top = `${triggerRect.top + triggerRect.height / 2}px`;
        style.transform = 'translateY(-50%)';
      }

      setTooltipStyle(style);
    }
  }, [isVisible, position, isCollapsed]);

  return (
    <>
      <div
        ref={triggerRef}
        className="relative inline-block"
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
      >
        {children}
      </div>
      {isVisible &&
        createPortal(
          <div
            ref={tooltipRef}
            className={cn(
              'fixed z-[9999] px-3 py-2 text-xs font-normal text-white bg-gray-900 rounded shadow-lg pointer-events-none',
              'dark:bg-gray-700',
              'max-w-xs'
            )}
            style={{ ...tooltipStyle, maxWidth: '280px', wordWrap: 'break-word', whiteSpace: 'normal', lineHeight: '1.4' }}
          >
            <div className="break-words">{content}</div>
            <div
              className={cn(
                'absolute w-2 h-2 bg-gray-900 dark:bg-gray-700 rotate-45',
                {
                  'bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2': adjustedPosition === 'top',
                  'top-0 left-1/2 -translate-x-1/2 -translate-y-1/2': adjustedPosition === 'bottom',
                  'right-0 top-1/2 -translate-y-1/2 translate-x-1/2': adjustedPosition === 'left',
                  'left-0 top-1/2 -translate-y-1/2 -translate-x-1/2': adjustedPosition === 'right',
                }
              )}
            />
          </div>,
          document.body
        )}
    </>
  );
}

