import React, { useState, useRef, useEffect } from 'react';

const TooltipIcon = ({ content }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({});
  const tooltipRef = useRef(null);
  const iconRef = useRef(null);

  useEffect(() => {
    if (isVisible && tooltipRef.current && iconRef.current) {
      const tooltipRect = tooltipRef.current.getBoundingClientRect();
      const iconRect = iconRef.current.getBoundingClientRect();
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;
      const isMobile = windowWidth < 640;

      // Calculate available space in different directions
      const spaceBelow = windowHeight - iconRect.bottom;
      const spaceAbove = iconRect.top;
      const spaceRight = windowWidth - iconRect.right;
      const spaceLeft = iconRect.left;

      let position = {};

      if (isMobile) {
        // Mobile-specific positioning
        if (spaceBelow >= tooltipRect.height) {
          // Show below the icon
          position = {
            top: '100%',
            bottom: 'auto',
            left: '50%',
            right: 'auto',
            transform: 'translateX(-50%)',
            marginTop: '0.5rem'
          };
        } else {
          // Show above the icon
          position = {
            bottom: '100%',
            top: 'auto',
            left: '50%',
            right: 'auto',
            transform: 'translateX(-50%)',
            marginBottom: '0.5rem'
          };
        }
      } else {
        // Desktop positioning
        if (spaceRight >= tooltipRect.width / 2 && spaceLeft >= tooltipRect.width / 2) {
          // Center horizontally if enough space on both sides
          position = {
            left: '50%',
            transform: 'translateX(-50%)'
          };
        } else if (spaceRight > spaceLeft) {
          // Align to the left of the icon
          position = {
            left: '0',
            transform: 'translateX(-20%)'
          };
        } else {
          // Align to the right of the icon
          position = {
            right: '0',
            transform: 'translateX(20%)'
          };
        }

        // Vertical positioning for desktop
        if (spaceBelow >= tooltipRect.height) {
          position.top = '100%';
          position.marginTop = '0.5rem';
        } else {
          position.bottom = '100%';
          position.marginBottom = '0.5rem';
        }
      }

      setTooltipPosition(position);
    }
  }, [isVisible]);

  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsVisible(!isVisible);
  };

  return (
    <div className="relative ml-2 inline-block">
      <i 
        ref={iconRef}
        className="fas fa-info-circle text-gray-400 hover:text-gray-500 cursor-help"
        onClick={handleClick}
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
      ></i>
      <div 
        ref={tooltipRef}
        className={`absolute z-50 p-2 text-sm text-white bg-gray-900 rounded-lg 
          transition-all duration-200 overflow-hidden
          ${isVisible ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
        style={{
          ...tooltipPosition,
          maxWidth: 'min(90vw, 256px)',  // Use min() to prevent overflow
          width: 'auto'  // Let the width be determined by content up to maxWidth
        }}
      >
        {content}
      </div>
    </div>
  );
};

export default TooltipIcon;