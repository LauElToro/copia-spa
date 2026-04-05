"use client";

import React, { useRef, useEffect } from 'react';
import { ChatBubble } from '../chat-bubble';
import './chat-messages.css';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  text?: string;
  html?: string;
  timestamp: number;
}

export interface ChatMessagesProps {
  messages: ChatMessage[];
  loading?: boolean;
  className?: string;
  containerRef?: React.RefObject<HTMLDivElement>;
}

export const ChatMessages: React.FC<ChatMessagesProps> = ({
  messages,
  loading = false,
  className = '',
  containerRef,
}) => {
  const listRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change or loading state changes
  useEffect(() => {
    if (listRef.current) {
      setTimeout(() => {
        if (listRef.current) {
          listRef.current.scrollTop = listRef.current.scrollHeight;
        }
      }, 100);
    }
  }, [messages.length, loading]);

  // Forward ref to containerRef if provided
  useEffect(() => {
    if (containerRef && listRef.current) {
      (containerRef as React.MutableRefObject<HTMLDivElement | null>).current = listRef.current;
    }
  }, [containerRef]);

  return (
    <div ref={listRef} className={`chat-messages-container ${className}`}>
      {messages.map((m) =>
        m.role === 'user' ? (
          <ChatBubble
            key={m.id}
            message={m.text || ''}
            isUser={true}
            timestamp={m.timestamp}
          />
        ) : m.role === 'assistant' ? (
          <ChatBubble
            key={m.id}
            message={m.html || m.text || ''}
            isUser={false}
            timestamp={m.timestamp}
          />
        ) : (
          <div className="chat-system-message" key={m.id}>
            <div className="system-note">{m.text}</div>
          </div>
        )
      )}
      
      {loading && (
        <div className="chat-loading-indicator">
          <div className="chat-loading-bubble">
            <span className="chat-loading-text">
              <span className="typing-dot">.</span>
              <span className="typing-dot">.</span>
              <span className="typing-dot">.</span>
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

