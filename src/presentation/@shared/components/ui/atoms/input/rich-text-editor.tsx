"use client";

import React, { useMemo, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Box } from '@mui/material';
import 'react-quill/dist/quill.snow.css';

// Importación dinámica para evitar problemas de SSR
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

export interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  id?: string;
  name?: string;
  required?: boolean;
  disabled?: boolean;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = 'Write your message...',
  id,
  name,
  required = false,
  disabled = false,
}) => {
  const modules = useMemo(
    () => ({
      toolbar: [
        [{ header: [1, 2, 3, false] }],
        ['bold', 'italic', 'underline'],
        [{ align: [] }],
        [{ list: 'ordered' }, { list: 'bullet' }],
      ],
    }),
    []
  );

  const formats = [
    'header',
    'bold',
    'italic',
    'underline',
    'align',
    'list',
    'bullet',
  ];

  useEffect(() => {
    const style = document.createElement('style');
    style.id = 'quill-custom-styles';
    style.textContent = `
      .ql-toolbar .ql-picker:hover .ql-picker-label svg .ql-stroke,
      .ql-toolbar .ql-picker:hover .ql-picker-label svg .ql-fill,
      .ql-toolbar .ql-picker.ql-expanded .ql-picker-label svg .ql-stroke,
      .ql-toolbar .ql-picker.ql-expanded .ql-picker-label svg .ql-fill,
      .ql-toolbar .ql-picker-label:hover svg .ql-stroke,
      .ql-toolbar .ql-picker-label:hover svg .ql-fill {
        stroke: #22c55e !important;
        fill: #22c55e !important;
      }
      .ql-toolbar .ql-picker-label {
        color: #9ca3af !important;
      }
      .ql-toolbar .ql-picker.ql-expanded .ql-picker-label,
      .ql-toolbar .ql-picker.ql-active .ql-picker-label {
        color: #22c55e !important;
      }
      .ql-toolbar button.ql-active,
      .ql-toolbar .ql-formats button.ql-active {
        color: #22c55e !important;
      }
      .ql-toolbar button.ql-active .ql-stroke,
      .ql-toolbar .ql-formats button.ql-active .ql-stroke {
        stroke: #22c55e !important;
      }
      .ql-toolbar button.ql-active .ql-fill,
      .ql-toolbar .ql-formats button.ql-active .ql-fill {
        fill: #22c55e !important;
      }
      .ql-toolbar .ql-picker.ql-expanded .ql-picker-label {
        border: none !important;
        outline: none !important;
        box-shadow: none !important;
      }
      .ql-toolbar .ql-picker.ql-expanded button {
        border: none !important;
        outline: none !important;
        box-shadow: none !important;
      }
      .ql-toolbar button.ql-active {
        border: none !important;
        outline: none !important;
        box-shadow: none !important;
        color: #22c55e !important;
      }
      .ql-picker-options {
        background: #111827 !important;
        min-width: 200px !important;
        width: auto !important;
      }
      .ql-toolbar .ql-picker.ql-list .ql-picker-options {
        min-width: auto !important;
        width: auto !important;
      }
      .ql-toolbar .ql-picker.ql-list .ql-picker-label {
        min-width: auto !important;
        width: auto !important;
      }
      .ql-toolbar .ql-picker.ql-list {
        position: relative !important;
      }
      .ql-toolbar .ql-picker.ql-list .ql-picker-options {
        left: 0 !important;
        right: auto !important;
        width: 100% !important;
        min-width: 100% !important;
      }
      .ql-picker-options .ql-picker-item {
        color: #ffffff !important;
        padding: 8px 16px !important;
        font-size: 1rem !important;
        font-weight: 500 !important;
        border-left: 3px solid transparent !important;
        position: relative !important;
        display: flex !important;
        align-items: center !important;
        line-height: 1.5 !important;
        gap: 8px !important;
      }
      .ql-picker-options .ql-picker-item svg {
        display: inline-block !important;
        visibility: visible !important;
        opacity: 1 !important;
        width: 16px !important;
        height: 16px !important;
        margin-right: 0 !important;
        flex-shrink: 0 !important;
        position: relative !important;
        z-index: 1 !important;
        vertical-align: middle !important;
      }
      .ql-picker-options .ql-picker-item svg * {
        display: block !important;
        visibility: visible !important;
        opacity: 1 !important;
      }
      .ql-picker-options .ql-picker-item svg .ql-stroke {
        stroke: #ffffff !important;
        stroke-width: 2 !important;
        stroke-linecap: round !important;
        stroke-linejoin: round !important;
      }
      .ql-picker-options .ql-picker-item svg .ql-fill {
        fill: #ffffff !important;
      }
      .ql-picker-options .ql-picker-item:hover {
        background-color: #374151 !important;
        border-left-color: #22c55e !important;
      }
      .ql-picker-options .ql-picker-item:hover svg .ql-stroke {
        stroke: #ffffff !important;
      }
      .ql-picker-options .ql-picker-item:hover svg .ql-fill {
        fill: #ffffff !important;
      }
      .ql-picker-options .ql-picker-item.ql-selected,
      .ql-picker-options .ql-picker-item.ql-active,
      .ql-picker-options .ql-picker-item:focus,
      .ql-picker-options .ql-picker-item.ql-picker-item-selected {
        color: #22c55e !important;
        background-color: #374151 !important;
        border-left-color: #22c55e !important;
      }
      .ql-picker-options .ql-picker-item.ql-selected svg .ql-stroke,
      .ql-picker-options .ql-picker-item.ql-active svg .ql-stroke,
      .ql-picker-options .ql-picker-item:focus svg .ql-stroke,
      .ql-picker-options .ql-picker-item.ql-picker-item-selected svg .ql-stroke {
        stroke: #22c55e !important;
      }
      .ql-picker-options .ql-picker-item.ql-selected svg .ql-fill,
      .ql-picker-options .ql-picker-item.ql-active svg .ql-fill,
      .ql-picker-options .ql-picker-item:focus svg .ql-fill,
      .ql-picker-options .ql-picker-item.ql-picker-item-selected svg .ql-fill {
        fill: #22c55e !important;
      }
    `;
    
    // Remover estilos anteriores si existen
    const existingStyle = document.getElementById('quill-custom-styles');
    if (existingStyle) {
      existingStyle.remove();
    }
    
    document.head.appendChild(style);
    return () => {
      const styleToRemove = document.getElementById('quill-custom-styles');
      if (styleToRemove) {
        document.head.removeChild(styleToRemove);
      }
    };
  }, []);

  return (
    <Box
        sx={{
          '& .quill': {
            backgroundColor: '#1f2937',
            borderRadius: '4px',
            border: '1px solid #374151',
            transition: 'all 0.2s ease',
            '&:hover': {
              borderColor: '#22c55e',
            },
            '&.ql-focused': {
              borderColor: '#22c55e',
              boxShadow: '0 0 0 1px rgba(34, 197, 94, 0.2)',
            },
          },
        '& .ql-toolbar': {
          backgroundColor: '#1f2937',
          borderTopLeftRadius: '4px',
          borderTopRightRadius: '4px',
          borderBottom: '1px solid #374151',
          borderTop: 'none',
          borderLeft: 'none',
          borderRight: 'none',
          '& .ql-stroke': {
            stroke: '#9ca3af',
          },
          '& .ql-fill': {
            fill: '#9ca3af',
          },
          '& .ql-picker': {
            color: '#9ca3af',
            '&:hover': {
              color: '#22c55e',
              '& .ql-picker-label': {
                color: '#22c55e',
                '& svg': {
                  '& .ql-stroke': {
                    stroke: '#22c55e !important',
                  },
                  '& .ql-fill': {
                    fill: '#22c55e !important',
                  },
                },
                '& .ql-stroke': {
                  stroke: '#22c55e !important',
                },
                '& .ql-fill': {
                  fill: '#22c55e !important',
                },
              },
            },
            '&.ql-expanded, &.ql-active': {
              '& .ql-picker-label': {
                color: '#22c55e !important',
                '& svg': {
                  '& .ql-stroke': {
                    stroke: '#22c55e !important',
                  },
                  '& .ql-fill': {
                    fill: '#22c55e !important',
                  },
                },
                '& .ql-stroke': {
                  stroke: '#22c55e !important',
                },
                '& .ql-fill': {
                  fill: '#22c55e !important',
                },
              },
            },
          },
          '& .ql-picker-label': {
            color: '#9ca3af',
            '&:hover': {
              color: '#22c55e',
              '& svg': {
                '& .ql-stroke': {
                  stroke: '#22c55e !important',
                },
                '& .ql-fill': {
                  fill: '#22c55e !important',
                },
              },
            },
            '& svg': {
              '& .ql-stroke': {
                stroke: '#9ca3af',
              },
              '& .ql-fill': {
                fill: '#9ca3af',
              },
            },
            '& .ql-stroke': {
              stroke: '#9ca3af',
            },
            '& .ql-fill': {
              fill: '#9ca3af',
            },
          },
          '& .ql-picker-options': {
            backgroundColor: '#111827',
            border: 'none',
            borderRadius: '0px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2), 0 2px 4px rgba(0, 0, 0, 0.1)',
            padding: '4px 0',
            '& .ql-picker-item': {
              color: '#ffffff',
              padding: '8px 16px',
              fontSize: '1rem',
              fontWeight: 500,
              transition: 'all 0.15s ease',
              borderLeft: '3px solid transparent',
              '& svg': {
                display: 'inline-block',
                verticalAlign: 'middle',
                marginRight: '8px',
                '& .ql-stroke': {
                  stroke: '#ffffff',
                },
                '& .ql-fill': {
                  fill: '#ffffff',
                },
              },
              '&:hover': {
                color: '#ffffff',
                backgroundColor: '#374151',
                borderLeftColor: '#22c55e',
                '& svg': {
                  '& .ql-stroke': {
                    stroke: '#ffffff',
                  },
                  '& .ql-fill': {
                    fill: '#ffffff',
                  },
                },
              },
              '&.ql-selected, &.ql-active, &:focus, &.ql-picker-item-selected': {
                color: '#22c55e',
                backgroundColor: '#374151',
                borderLeftColor: '#22c55e',
                '& svg': {
                  '& .ql-stroke': {
                    stroke: '#22c55e',
                  },
                  '& .ql-fill': {
                    fill: '#22c55e',
                  },
                },
              },
            },
          },
          '& button': {
            color: '#9ca3af',
            border: 'none',
            outline: 'none',
            boxShadow: 'none',
            '&:hover': {
              color: '#22c55e',
              border: 'none',
              outline: 'none',
              boxShadow: 'none',
              '& .ql-stroke': {
                stroke: '#22c55e !important',
              },
              '& .ql-fill': {
                fill: '#22c55e !important',
              },
            },
            '&.ql-active': {
              color: '#22c55e',
              border: 'none',
              outline: 'none',
              boxShadow: 'none',
              '& .ql-stroke': {
                stroke: '#22c55e !important',
              },
              '& .ql-fill': {
                fill: '#22c55e !important',
              },
            },
          },
          '& .ql-picker.ql-expanded': {
            '& .ql-picker-label': {
              border: 'none',
              outline: 'none',
              boxShadow: 'none',
            },
          },
        },
        '& .ql-container': {
          backgroundColor: '#1f2937',
          borderBottomLeftRadius: '4px',
          borderBottomRightRadius: '4px',
          borderTop: 'none',
          borderLeft: 'none',
          borderRight: 'none',
          borderBottom: 'none',
          fontSize: '0.875rem',
          fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
          '& .ql-editor': {
            color: '#ffffff',
            minHeight: '200px',
            maxHeight: '400px',
            overflowY: 'auto',
            padding: '16px',
            '&.ql-blank::before': {
              color: '#9ca3af',
              opacity: 0.7,
              fontStyle: 'normal',
            },
          },
        },
      }}
      >
      <ReactQuill
        theme="snow"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        modules={modules}
        formats={formats}
        readOnly={disabled}
      />
      {required && (
        <input
          type="hidden"
          id={id}
          name={name}
          value={value}
          required={required}
        />
      )}
    </Box>
  );
};

