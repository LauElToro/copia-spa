import React, { useState, useRef, useEffect } from "react";
import styled from "@emotion/styled";

export interface TooltipProps {
  title: string;
  children: React.ReactElement;
  placement?: 'top' | 'right' | 'bottom' | 'left' | 'bottom-end' | 'bottom-start' | 'left-end' | 'left-start' | 'right-end' | 'right-start' | 'top-end' | 'top-start';
  delay?: number;
  arrow?: boolean; // For backwards compatibility - arrows are always shown now
}

function getTooltipStyle(placement: string, isVisible: boolean) {
  const baseStyle: React.CSSProperties = {
    position: 'absolute',
    opacity: isVisible ? 1 : 0,
    visibility: isVisible ? 'visible' : 'hidden',
    transition: 'all 0.2s cubic-bezier(0.4, 0.0, 0.2, 1)',
  };

  switch (placement) {
    case 'top':
      return {
        ...baseStyle,
        bottom: 'calc(100% + 6px)',
        left: '50%',
        transform: `translate(-50%, ${isVisible ? '0' : '4px'}) scale(${isVisible ? 1 : 0.95})`,
      };
    case 'bottom':
      return {
        ...baseStyle,
        top: 'calc(100% + 6px)',
        left: '50%',
        transform: `translate(-50%, ${isVisible ? '0' : '-4px'}) scale(${isVisible ? 1 : 0.95})`,
      };
    case 'left':
      return {
        ...baseStyle,
        right: 'calc(100% + 6px)',
        top: '50%',
        transform: `translate(${isVisible ? '0' : '4px'}, -50%) scale(${isVisible ? 1 : 0.95})`,
      };
    case 'right':
      return {
        ...baseStyle,
        left: 'calc(100% + 6px)',
        top: '50%',
        transform: `translate(${isVisible ? '0' : '-4px'}, -50%) scale(${isVisible ? 1 : 0.95})`,
      };
    default:
      return {
        ...baseStyle,
        bottom: 'calc(100% + 6px)',
        left: '50%',
        transform: `translate(-50%, ${isVisible ? '0' : '4px'}) scale(${isVisible ? 1 : 0.95})`,
      };
  }
}

const TooltipWrapper = styled.div`
  position: relative;
  display: inline-block;
`;

const TooltipContent = styled.div`
  position: absolute;
  background-color: #343a40;
  color: #ffffff;
  font-size: 0.75rem;
  font-weight: 500;
  line-height: 1.4;
  padding: 4px 8px;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  max-width: 200px;
  word-wrap: break-word;
  pointer-events: none;
  transition: all 0.2s cubic-bezier(0.4, 0.0, 0.2, 1);
  overflow: hidden;
`;

const TooltipTextWrapper = styled.div<{ needsScroll: boolean; scrollDistance: number }>`
  white-space: nowrap;
  display: inline-block;
  --scroll-distance: ${props => props.scrollDistance}px;
  animation: ${props => props.needsScroll ? 'scroll-text 8s linear infinite' : 'none'};
  
  @keyframes scroll-text {
    0%, 20% {
      transform: translateX(0);
    }
    40%, 60% {
      transform: translateX(calc(-1 * var(--scroll-distance)));
    }
    80%, 100% {
      transform: translateX(0);
    }
  }
`;

const ChildWrapper = styled.div`
  position: relative;
`;

export const Tooltip: React.FC<TooltipProps> = ({
  title,
  children,
  placement = "top",
  delay = 300
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [timeoutRef, setTimeoutRef] = useState<NodeJS.Timeout | null>(null);
  const [needsScroll, setNeedsScroll] = useState(false);
  const [scrollDistance, setScrollDistance] = useState(0);
  const childRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isVisible && textRef.current && contentRef.current) {
      // Use requestAnimationFrame to ensure DOM is fully rendered
      requestAnimationFrame(() => {
        if (textRef.current && contentRef.current) {
          const textWidth = textRef.current.scrollWidth;
          const contentWidth = contentRef.current.offsetWidth;
          const needsScrolling = textWidth > contentWidth;
          setNeedsScroll(needsScrolling);
          if (needsScrolling) {
            // Calculate the distance to scroll (text width - container width)
            setScrollDistance(textWidth - contentWidth);
          } else {
            setScrollDistance(0);
          }
        }
      });
    } else {
      setNeedsScroll(false);
      setScrollDistance(0);
    }
  }, [isVisible, title]);

  const showTooltip = () => {
    if (timeoutRef) clearTimeout(timeoutRef);
    setTimeoutRef(setTimeout(() => setIsVisible(true), delay));
  };

  const hideTooltip = () => {
    if (timeoutRef) clearTimeout(timeoutRef);
    setTimeoutRef(setTimeout(() => setIsVisible(false), delay));
  };

  const handleMouseEnter = () => showTooltip();
  const handleMouseLeave = () => hideTooltip();

  // For touch devices - show on touch start, hide on touch end
  const handleTouchStart = () => showTooltip();
  const handleTouchEnd = () => hideTooltip();

  // Clone the child element and attach event handlers
  const childWithHandlers = React.cloneElement(children, {
    onMouseEnter: handleMouseEnter,
    onMouseLeave: handleMouseLeave,
    onTouchStart: handleTouchStart,
    onTouchEnd: handleTouchEnd,
  });

  return (
    <TooltipWrapper>
      <ChildWrapper ref={childRef}>
        {childWithHandlers}
      </ChildWrapper>
      <TooltipContent
        ref={contentRef}
        style={getTooltipStyle(placement, isVisible)}
        data-tooltip
      >
        <TooltipTextWrapper 
          ref={textRef} 
          needsScroll={needsScroll}
          scrollDistance={scrollDistance}
        >
          {title}
        </TooltipTextWrapper>
      </TooltipContent>
    </TooltipWrapper>
  );
};
