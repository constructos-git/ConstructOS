import { ReactNode, useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';

export interface DropdownProps {
  trigger: ReactNode;
  children: ReactNode | ((close: () => void) => ReactNode);
  align?: 'left' | 'right';
  onClose?: () => void;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export default function Dropdown({ trigger, children, align = 'right', onClose, isOpen: controlledIsOpen, onOpenChange }: DropdownProps) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  
  // Use controlled state if provided, otherwise use internal state
  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;
  const setIsOpen = onOpenChange || setInternalIsOpen;

  const closeDropdown = useCallback(() => {
    setIsOpen(false);
    onOpenChange?.(false);
    onClose?.();
  }, [setIsOpen, onOpenChange, onClose]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        dropdownRef.current &&
        menuRef.current &&
        !dropdownRef.current.contains(target) &&
        !menuRef.current.contains(target)
      ) {
        closeDropdown();
      }
    };

    if (isOpen) {
      // Small delay to prevent immediate closing when opening
      const timeout = setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutside);
      }, 10);

      return () => {
        clearTimeout(timeout);
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isOpen, closeDropdown]);

  // Position dropdown within viewport (using fixed positioning for portal)
  useEffect(() => {
    if (isOpen && menuRef.current && dropdownRef.current) {
      const menu = menuRef.current;
      const trigger = dropdownRef.current;
      const rect = trigger.getBoundingClientRect();
      const menuRect = menu.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      // Use fixed positioning for portal
      menu.style.position = 'fixed';
      menu.style.left = '';
      menu.style.right = '';
      menu.style.top = '';
      menu.style.bottom = '';

      // Check horizontal overflow
      if (align === 'right') {
        const rightEdge = rect.right;
        const menuWidth = menuRect.width || 200; // fallback width
        if (rightEdge - menuWidth < 0) {
          // Would overflow left, position from left edge instead
          menu.style.left = `${Math.max(8, rect.left)}px`;
          menu.style.right = 'auto';
        } else {
          menu.style.right = `${viewportWidth - rect.right}px`;
          menu.style.left = 'auto';
        }
      } else {
        const leftEdge = rect.left;
        const menuWidth = menuRect.width || 200; // fallback width
        if (leftEdge + menuWidth > viewportWidth) {
          // Would overflow right, position from right edge instead
          menu.style.right = '8px';
          menu.style.left = 'auto';
        } else {
          menu.style.left = `${rect.left}px`;
          menu.style.right = 'auto';
        }
      }

      // Check vertical overflow
      const bottomEdge = rect.bottom + (menuRect.height || 200);
      if (bottomEdge > viewportHeight) {
        // Would overflow bottom, position above instead
        menu.style.bottom = `${viewportHeight - rect.top + 8}px`;
        menu.style.top = 'auto';
      } else {
        menu.style.top = `${rect.bottom + 8}px`;
        menu.style.bottom = 'auto';
      }
    }
  }, [isOpen, align]);

  const handleTriggerClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const newState = !isOpen;
    setIsOpen(newState);
    if (newState) {
      onOpenChange?.(true);
    } else {
      setIsOpen(false);
      onOpenChange?.(false);
      onClose?.();
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <div 
        onClick={handleTriggerClick} 
        onMouseDown={(e) => {
          e.stopPropagation();
          e.preventDefault();
        }}
        style={{ pointerEvents: 'auto' }}
      >
        {trigger}
      </div>
      {isOpen &&
        createPortal(
          <div
            ref={menuRef}
            className={cn(
              'fixed z-[99999] min-w-[200px] rounded-md border bg-background shadow-lg'
            )}
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
          >
            {typeof children === 'function' ? children(closeDropdown) : children}
          </div>,
          document.body
        )}
    </div>
  );
}

