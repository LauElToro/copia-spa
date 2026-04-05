"use client";

import React from 'react';
import './chat-bubble.css';

export interface ChatBubbleProps {
  message: string;
  isUser: boolean;
  timestamp?: number;
  className?: string;
}

const formatTimestamp = (timestamp: number): string => {
  const date = new Date(timestamp);
  
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  
  return `${day}/${month}/${year} ${hours}:${minutes}`;
};

export const ChatBubble: React.FC<ChatBubbleProps> = ({
  message,
  isUser,
  timestamp,
  className = '',
}) => {
  return (
    <div className={`chat-bubble-container ${isUser ? 'user' : 'assistant'} ${className}`}>
      {isUser ? (
        <div className="chat-bubble user">
          <span className="chat-bubble-message">{message}</span>
          {timestamp && (
            <span className="chat-bubble-timestamp">
              {formatTimestamp(timestamp)}
            </span>
          )}
        </div>
      ) : (
        <div className="chat-bubble assistant">
          <div
            className="chat-bubble-message"
            dangerouslySetInnerHTML={{ __html: message }}
          />
          {timestamp && (
            <span className="chat-bubble-timestamp">
              {formatTimestamp(timestamp)}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

