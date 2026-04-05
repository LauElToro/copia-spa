"use client";

import React from 'react';

export interface QuickRepliesProps {
  replies: string[];
  onSelect: (reply: string) => void;
  disabled?: boolean;
  className?: string;
}

export const QuickReplies: React.FC<QuickRepliesProps> = ({
  replies,
  onSelect,
  disabled = false,
  className = '',
}) => {
  if (!replies || replies.length === 0) return null;

  return (
    <div className={`libia-quick ${className}`}>
      {replies.map((reply) => (
        <button
          key={reply}
          type="button"
          className="libia-quick-btn"
          onClick={() => onSelect(reply)}
          disabled={disabled}
        >
          {reply}
        </button>
      ))}
    </div>
  );
};


