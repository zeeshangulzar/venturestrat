'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import 'react-quill/dist/quill.snow.css';
import '../styles/quill-fonts.css';
import { AttachmentItem, AttachmentStatus } from '../types/attachments';
/**
 * Comprehensive font list for Quill Editor with email client compatibility
 * 
 * This list includes:
 * - Generic font families (sans-serif, serif, monospace)
 * - Web-safe fonts (universally supported across email clients)
 * - Microsoft Office fonts (Outlook compatibility)
 * - Apple system fonts (Mac compatibility)
 * - Google Fonts (Gmail and modern email client support)
 * - Specialty fonts (script, display, monospace variants)
 * 
 * All fonts include proper fallbacks for maximum compatibility.
 * Web fonts are loaded via Google Fonts in layout.tsx
 */
const EMAIL_SAFE_FONTS = [
  // Generic font families
  'sans-serif',
  'serif',
  'monospace',
  
  // Web-safe fonts (universally supported)
  'arial',
  'helvetica',
  'verdana',
  'tahoma',
  'trebuchet-ms',
  'georgia',
  'times-new-roman',
  'courier-new',
  'lucida-console',
  'lucida-sans-unicode',
  
  // Additional web-safe fonts
  'calibri',
  'cambria',
  'candara',
  'consolas',
  'constantia',
  'corbel',
  'garamond',
  'impact',
  'palatino',
  'book-antiqua',
  'century-gothic',
  'franklin-gothic-medium',
  'gill-sans',
  'helvetica-neue',
  'lucida-grande',
  'ms-sans-serif',
  'ms-serif',
  'segoe-ui',
  'trebuchet-ms',
  'comic-sans-ms',
  'arial-black',
  'arial-narrow',
  'arial-rounded-mt-bold',
  'baskerville',
  'bodoni-mt',
  'brush-script-mt',
  'copperplate',
  'copperplate-gothic-bold',
  'didot',
  'futura',
  'geneva',
  'goudy-old-style',
  'hoefler-text',
  'lucida-bright',
  'lucida-calligraphy',
  'lucida-handwriting',
  'lucida-typewriter',
  'monaco',
  'optima',
  'papyrus',
  'rockwell',
  'snell-roundhand',

  // Google Fonts (supported in Gmail and some clients)
  'roboto',
  'open-sans',
  'lato',
  'montserrat',
  'source-sans-pro',
  'raleway',
  'pt-sans',
  'oswald',
  'lora',
  'merriweather',
  'playfair-display',
  'nunito',
  'dancing-script',
  'indie-flower',
  'pacifico',
  'lobster',
  'shadows-into-light',
  'kaushan-script',
  'righteous',
  'bangers',
  'fredoka-one',
  'comfortaa',
  'quicksand',
  'poppins',
  'ubuntu',
  'noto-sans',
  'noto-serif',
  'crimson-text',
  'libre-baskerville',
  'work-sans',
  'inter',
  'dm-sans',
  'dm-serif',
  'space-grotesk',
  'space-mono',
  'jetbrains-mono',
  'fira-code',
  'source-code-pro'
] as const;

const FONT_PICKER_OPTIONS: (string | false)[] = [false, ...EMAIL_SAFE_FONTS];
import AIEditModal from './AIEditModal';
import QuillAISelectionHandler from './QuillAISelectionHandler';
import { useModal } from '../contexts/ModalContext';

let signatureBlotRegistered = false;
let QuillDeltaConstructor: any = null;

const renderAttachmentStatus = (status: AttachmentStatus, error?: string) => {
  switch (status) {
    case 'pending':
      return 'Queued for upload...';
    case 'uploading':
      return 'Uploading...';
    case 'uploaded':
      return 'Uploaded';
    case 'error':
      return error ? `Upload failed: ${error}` : 'Upload failed';
    default:
      return '';
  }
};

interface QuillEditorProps {
  value: string;
  onChange: (content: string) => void;
  placeholder?: string;
  readOnly?: boolean;
  height?: string | number;
  modules?: Record<string, unknown>;
  formats?: string[];
  className?: string;
  style?: React.CSSProperties;
  enableAIEditing?: boolean;
  onAttachmentsChange?: (files: AttachmentItem[]) => void;
  attachments?: AttachmentItem[];
}

const QuillEditor: React.FC<QuillEditorProps> = ({
  value,
  onChange,
  placeholder = 'Enter your content...',
  readOnly = false,
  height = '400px',
  modules,
  formats,
  className = '',
  style = {},
  enableAIEditing = false,
  onAttachmentsChange,
  attachments: externalAttachments
}) => {
  const [isClient, setIsClient] = useState(false);
  const [ReactQuill, setReactQuill] = useState<React.ComponentType<Record<string, unknown>> | null>(null);
  const [selectedText, setSelectedText] = useState('');
  const [selectedRange, setSelectedRange] = useState<any>(null);
  const [showFloatingButton, setShowFloatingButton] = useState(false);
  const [buttonPosition, setButtonPosition] = useState({ top: 0, left: 0 });
  const [attachments, setAttachments] = useState<AttachmentItem[]>([]);
  const [highlightedText, setHighlightedText] = useState('');
  const [highlightRange, setHighlightRange] = useState<any>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  const quillRef = useRef<any>(null);
  const quillContentRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync external attachments if provided
  useEffect(() => {
    if (externalAttachments) {
      setAttachments(externalAttachments);
    }
  }, [externalAttachments]);

  // Ensure edits inside the signature block trigger onChange/autosave
  useEffect(() => {
    if (!quillRef.current || !onChange || readOnly) {
      return;
    }

    const quillInstance = quillRef.current.getEditor?.();
    if (!quillInstance || !quillInstance.root) {
      return;
    }

    const handleSignatureInput = (event: Event) => {
      if (!(event.target instanceof HTMLElement)) {
        return;
      }
      const signatureContainer = event.target.closest('div[data-user-signature]') as HTMLElement | null;
      if (!signatureContainer) {
        return;
      }
      const logoCell = signatureContainer.querySelector('[data-signature-logo-cell]') as HTMLElement | null;
      const logoRightCell = signatureContainer.querySelector('[data-signature-logo-right-cell]') as HTMLElement | null;
      if (logoCell && logoRightCell) {
        const hasLogo = !!logoCell.querySelector('img');
        if (!hasLogo) {
          logoCell.style.borderRight = '';
          logoCell.style.paddingRight = '';
          logoRightCell.style.paddingLeft = '';
        } else {
          logoCell.style.borderRight = '2px solid #BDBDBD';
          logoCell.style.paddingRight = '16px';
          logoRightCell.style.paddingLeft = '20px';
        }
      }
      // Preserve the edited HTML so the custom blot serializes the latest version
      signatureContainer.setAttribute('data-signature-html', signatureContainer.innerHTML);
      const html = quillInstance.root.innerHTML;
      onChange(html);
    };

    const root = quillInstance.root;
    root.addEventListener('input', handleSignatureInput);
    return () => {
      root.removeEventListener('input', handleSignatureInput);
    };
  }, [onChange, readOnly, isClient]);
  
  // Use global modal state directly
  const { openModal, closeModal, isModalOpen } = useModal();
  const isAIModalOpen = isModalOpen('ai-edit-modal');

  const removeCustomHighlight = () => {
    if (!quillRef.current || !highlightRange) return;

    const quillEditor = quillRef.current.getEditor();
    if (!quillEditor) return;

    // Remove the custom highlight
    quillEditor.formatText(highlightRange.index, highlightRange.length, 'background', false);
    quillEditor.formatText(highlightRange.index, highlightRange.length, 'color', false);

    // Clear highlight state
    setHighlightedText('');
    setHighlightRange(null);
  };

  // Clear selection when modal closes
  useEffect(() => {
    if (!isAIModalOpen) {
      // Remove custom highlight when modal closes
      removeCustomHighlight();
      setSelectedText('');
      setSelectedRange(null);
    }
  }, [isAIModalOpen]);

  // Clear any existing highlights on component mount (page refresh)
  useEffect(() => {
    if (quillRef.current && isClient) {
      const quillEditor = quillRef.current.getEditor();
      if (quillEditor) {
        // Clear any existing custom highlights on page load
        // Use a timeout to ensure Quill is fully initialized
        setTimeout(() => {
          const length = quillEditor.getLength();
          if (length > 1) { // Only if there's content
            // Remove all background and color formatting that might be from highlights
            quillEditor.formatText(0, length - 1, 'background', false);
            quillEditor.formatText(0, length - 1, 'color', false);
          }
        }, 100);
      }
    }
  }, [isClient]);

  const baseToolbarModules = useMemo<Record<string, unknown>>(
    () => ({
      toolbar: [
        [{ font: FONT_PICKER_OPTIONS }],
        [{ size: ['small', false, 'large', 'huge'] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ color: [] }, { background: [] }],
        [{ list: 'ordered' }, { list: 'bullet' }],
        [{ align: [] }],
        ['clean'],
      ],
    }),
    [],
  );
  const [internalModules, setInternalModules] =
    useState<Record<string, unknown>>(baseToolbarModules);

  // Default formats - UPDATED with font
  const defaultFormats = [
    'font', 'size',
    'bold', 'italic', 'underline', 'strike',
    'color', 'background',
    'list', 'bullet',
    'align',
    'image',
    'signature'
  ];

  useEffect(() => {
    // Only load ReactQuill on client side to avoid SSR issues
    if (typeof window !== 'undefined') {
      import('react-quill').then((module) => {
        const Quill = module.default.Quill;
        
        // Register custom fonts
        const Font = Quill.import('formats/font');
        Font.whitelist = Array.from(EMAIL_SAFE_FONTS);
        Quill.register(Font, true);
        console.log('Registered fonts:', Font.whitelist);
        console.log('Font whitelist length:', Font.whitelist.length);

        if (!signatureBlotRegistered) {
          const BlockEmbed = Quill.import('blots/block/embed');
          const Delta = Quill.import('delta');
          QuillDeltaConstructor = Delta;

          class SignatureBlot extends BlockEmbed {
            static blotName = 'signature';
            static tagName = 'div';
            static className = 'ql-signature';

            static create(value: { html?: string } | string) {
              const node = super.create(value) as HTMLElement;
              const html = typeof value === 'string' ? value : value?.html || '';
              node.setAttribute('data-user-signature', 'true');
              node.setAttribute('contenteditable', 'false');
              node.setAttribute('data-signature-html', html);
              node.innerHTML = html;
              return node;
            }

            static value(node: HTMLElement) {
              return node.getAttribute('data-signature-html') || node.innerHTML || '';
            }
          }

          Quill.register(SignatureBlot, true);
          signatureBlotRegistered = true;
        }

        const signatureMatcher = (node: Element) => {
          if (!QuillDeltaConstructor) {
            const Delta = Quill.import('delta');
            QuillDeltaConstructor = Delta;
          }
          const html =
            (node as HTMLElement).getAttribute('data-signature-html') ||
            (node as HTMLElement).innerHTML ||
            '';
          return new QuillDeltaConstructor().insert({ signature: html });
        };

        setInternalModules({
          ...baseToolbarModules,
          clipboard: {
            matchers: [['div[data-user-signature]', signatureMatcher]],
          },
        });
        
        setReactQuill(() => module.default);
        setIsClient(true);
      }).catch((error) => {
        console.error('Failed to load React Quill:', error);
      });
    }
  }, [baseToolbarModules]);

  // Add custom attachment button to toolbar after Quill is loaded
  useEffect(() => {
    if (quillRef.current && !readOnly) {
      const quill = quillRef.current.getEditor();
      const toolbar = quill.getModule('toolbar');
      
      if (toolbar && toolbar.container) {
        // Check if attachment button already exists
        const existingButton = toolbar.container.querySelector('.ql-attachment');
        if (!existingButton) {
          // Find the clean button (Tx button) to insert after it
          const cleanButton = toolbar.container.querySelector('.ql-clean');
          
          // Create a span wrapper for the attachment button
          const buttonWrapper = document.createElement('span');
          buttonWrapper.className = 'ql-formats';
          
          // Create attachment button
          const attachmentBtn = document.createElement('button');
          attachmentBtn.className = 'ql-attachment';
          attachmentBtn.type = 'button';
          attachmentBtn.innerHTML = `
            <svg viewBox="0 0 24 24" width="18" height="18">
              <path fill="currentColor" d="M16.5 6v11.5c0 2.21-1.79 4-4 4s-4-1.79-4-4V5c0-1.38 1.12-2.5 2.5-2.5s2.5 1.12 2.5 2.5v10.5c0 .55-.45 1-1 1s-1-.45-1-1V6H10v9.5c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5V5c0-2.21-1.79-4-4-4S7 2.79 7 5v12.5c0 3.04 2.46 5.5 5.5 5.5s5.5-2.46 5.5-5.5V6h-1.5z"/>
            </svg>
          `;
          attachmentBtn.title = 'Attach Files';
          
          // Add click handler
          attachmentBtn.addEventListener('click', () => {
            fileInputRef.current?.click();
          });
          
          buttonWrapper.appendChild(attachmentBtn);
          
          // Insert after the clean button's parent span
          if (cleanButton && cleanButton.parentElement) {
            const cleanButtonWrapper = cleanButton.parentElement;
            if (cleanButtonWrapper.nextSibling) {
              toolbar.container.insertBefore(buttonWrapper, cleanButtonWrapper.nextSibling);
            } else {
              toolbar.container.appendChild(buttonWrapper);
            }
          } else {
            // Fallback: append at the end
            toolbar.container.appendChild(buttonWrapper);
          }
        }
      }
    }
  }, [isClient, readOnly]);

  // Update quillContentRef when quillRef changes
  useEffect(() => {
    if (quillRef.current) {
      const quillEditor = quillRef.current.getEditor();
      if (quillEditor && quillEditor.root) {
        quillContentRef.current = quillEditor.root;
      }
    }
  }, [isClient]); // Update when ReactQuill is loaded

  // Update button position on scroll and resize
  useEffect(() => {
    if (!showFloatingButton || !selectedRange) return;

    const updatePosition = () => {
      calculateButtonPosition(selectedRange);
    };

    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);

    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [showFloatingButton, selectedRange]);

  // Handle file attachments
  const generateAttachmentId = () => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  };

  const createAttachmentItem = (file: File): AttachmentItem => ({
    id: generateAttachmentId(),
    name: file.name,
    size: file.size,
    type: file.type || 'application/octet-stream',
    status: 'pending',
    file,
    temporary: true,
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newItems = files.map(createAttachmentItem);
    const newAttachments = [...attachments, ...newItems];
    setAttachments(newAttachments);
    if (onAttachmentsChange) {
      onAttachmentsChange(newAttachments);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveAttachment = (index: number) => {
    const newAttachments = attachments.filter((_, i) => i !== index);
    setAttachments(newAttachments);
    if (onAttachmentsChange) {
      onAttachmentsChange(newAttachments);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  // Function to calculate button position at the end of selected text
  const calculateButtonPosition = (range: any) => {
    if (!quillRef.current || !quillContentRef.current) return;

    const quillEditor = quillRef.current.getEditor();
    if (!quillEditor) return;

    try {
      // Get the bounds of the selection
      const bounds = quillEditor.getBounds(range);
      if (!bounds) return;

      // Get the editor container's position
      const editorRect = quillContentRef.current.getBoundingClientRect();
      
      // Get the text content of the selection
      const selectedText = quillEditor.getText(range.index, range.length);
      
      let endPosition;
      
      if (selectedText.includes('\n')) {
        // Multi-line selection: find the actual end of the text using DOM
        const endIndex = range.index + range.length;
        
        // Create a range that ends at the exact end of the selection
        const endRange = { index: endIndex - 1, length: 1 };
        const endBounds = quillEditor.getBounds(endRange);
        
        if (endBounds) {
          // Position at the end of the last character (relative to editor)
          endPosition = {
            top: endBounds.top + endBounds.height + 10, // Below the text
            left: endBounds.left + endBounds.width + 10 // To the right of the text
          };
        } else {
          // Fallback: try to get bounds of the last line
          const lines = selectedText.split('\n');
          const lastLine = lines[lines.length - 1];
          
          if (lastLine.length > 0) {
            // Find the start of the last line in the selection
            const lastLineStart = range.index + selectedText.lastIndexOf('\n') + 1;
            const lastLineRange = { index: lastLineStart, length: lastLine.length };
            const lastLineBounds = quillEditor.getBounds(lastLineRange);
            
            if (lastLineBounds) {
              endPosition = {
                top: lastLineBounds.top + lastLineBounds.height + 10,
                left: lastLineBounds.left + lastLineBounds.width + 10
              };
            } else {
              // Final fallback to original bounds
              endPosition = {
                top: bounds.top + bounds.height + 10,
                left: bounds.left + bounds.width + 10
              };
            }
          } else {
            // Empty last line, position at the end of the previous line
            endPosition = {
              top: bounds.top + bounds.height + 10,
              left: bounds.left + bounds.width + 10
            };
          }
        }
      } else {
        // Single line selection: use original calculation
        endPosition = {
          top: bounds.top + bounds.height + 10,
          left: bounds.left + bounds.width + 10
        };
      }

      // Ensure button doesn't go off the editor area
      const buttonWidth = 200; // Approximate button width
      const buttonHeight = 40; // Approximate button height
      
      // Check if button would go off the right edge of the editor
      if (endPosition.left + buttonWidth > editorRect.width) {
        endPosition.left = editorRect.width - buttonWidth - 10;
      }
      
      // Check if button would go off the bottom edge of the editor
      if (endPosition.top + buttonHeight > editorRect.height) {
        endPosition.top = bounds.top - buttonHeight - 10; // Position above text instead
      }
      
      // Ensure minimum position
      if (endPosition.top < 10) {
        endPosition.top = 10;
      }
      if (endPosition.left < 10) {
        endPosition.left = 10;
      }

      setButtonPosition(endPosition);
    } catch (error) {
      console.error('Error calculating button position:', error);
      // Fallback to center of editor
      setButtonPosition({ top: 100, left: 100 });
    }
  };

  // AI editing functions
  const handleTextSelected = (text: string, range: any) => {
    setSelectedText(text);
    setSelectedRange(range);
    calculateButtonPosition(range);
    setShowFloatingButton(true);
  };

  const handleSelectionCleared = () => {
    setShowFloatingButton(false);
    // Only clear selection if modal is not open
    if (!isAIModalOpen) {
      setSelectedText('');
      setSelectedRange(null);
    }
  };

  const createCustomHighlight = () => {
    if (!quillRef.current || !selectedRange) return;
    
    const quillEditor = quillRef.current.getEditor();
    if (!quillEditor) return;

    // Store the highlight info
    setHighlightedText(selectedText);
    setHighlightRange(selectedRange);

    // Create a custom highlight by wrapping the text with a span
    const delta = quillEditor.getContents(selectedRange.index, selectedRange.length);

    // Insert a custom highlight span with default selection colors
    quillEditor.formatText(selectedRange.index, selectedRange.length, 'background', '#b0d3fd');
    quillEditor.formatText(selectedRange.index, selectedRange.length, 'color', 'black');
  };

  const handleEditWithAI = () => {
    // Create custom highlight before opening modal
    createCustomHighlight();

    openModal('ai-edit-modal', () => {
      // Modal closed - remove highlight
      removeCustomHighlight();
    });
    setShowFloatingButton(false);
  };

  const handleClearSelection = () => {
    if (quillRef.current) {
      const quillEditor = quillRef.current.getEditor();
      quillEditor.setSelection(null);
    }
    setShowFloatingButton(false);
  };

  const generateAI = async (prompt: string, selectedText: string, previousResponse?: string): Promise<string> => {
    try {      
      const response = await fetch('/api/chatgpt/edit-text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          selectedText,
          previousResponse
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('API Error response:', errorData);
        throw new Error(`Failed to generate AI response: ${errorData.error || response.statusText}`);
      }

      const data = await response.json();
      return data.response;
    } catch (error) {
      console.error('Error generating AI response:', error);
      throw error;
    }
  };

  const insertTextAtCursor = (text: string) => {
    if (quillRef.current && selectedRange) {
      const quill = quillRef.current.getEditor();
      quill.insertText(selectedRange.index + selectedRange.length, text);
      quill.setSelection(selectedRange.index + selectedRange.length + text.length);
    }
  };

  const replaceSelectedText = (text: string) => {
    if (quillRef.current && selectedRange) {
      const quill = quillRef.current.getEditor();
      quill.deleteText(selectedRange.index, selectedRange.length);
      quill.insertText(selectedRange.index, text);
      quill.setSelection(selectedRange.index + text.length);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const handleAddNew = (text: string) => {
    insertTextAtCursor(text);
    // Remove custom highlight after adding new text
    removeCustomHighlight();
    // Clear the selection after adding new text
    if (quillRef.current) {
      const quillEditor = quillRef.current.getEditor();
      quillEditor.setSelection(null);
    }
    setShowFloatingButton(false);
    setSelectedText('');
    setSelectedRange(null);
  };

  const handleReplace = (text: string) => {
    replaceSelectedText(text);
    // Remove custom highlight after replacing text
    removeCustomHighlight();
  };

  if (!isClient || !ReactQuill) {
    return (
      <div 
        className={`w-full bg-gray-100 animate-pulse rounded-md flex items-center justify-center ${className}`}
        style={{ height, ...style }}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-600">Loading editor...</p>
        </div>
      </div>
    );
  }

  const editorStyle = {
    height: typeof height === 'number' ? `${height}px` : height,
    ...style
  };

  return (
    <div className={`quill-editor-wrapper relative ${className}`}>
      <div ref={editorRef} className="relative z-10">
          <ReactQuill
            ref={quillRef}
            value={value}
            onChange={(content: string) => {
              console.log('Quill content changed:', content);
              console.log('Content length:', content.length);
              // Check if content contains font classes
              if (content.includes('ql-font-')) {
                console.log('Font classes detected in content!');
                const fontMatches = content.match(/ql-font-[a-zA-Z0-9-]+/g);
                if (fontMatches) {
                  console.log('Font classes found:', fontMatches);
                }
              }
              onChange(content);
            }}
          modules={modules || internalModules}
          formats={formats || defaultFormats}
          placeholder={placeholder}
          readOnly={readOnly}
          style={editorStyle}
          theme="snow"
        />
      </div>

      {/* Attachment Section - Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileSelect}
            className="hidden"
            id="quill-file-upload"
          />

          {/* Attachments List */}
          {!readOnly && attachments.length > 0 && (
            <div className="mt-3 space-y-2 relative z-20">
              {attachments.map((file, index) => (
                <div
                  key={file.id ?? index}
                  className="flex items-center justify-between p-2 bg-gray-50 border border-gray-200 rounded-lg group hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <svg className="w-4 h-4 text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                      {file.status !== 'uploaded' && (
                        <p
                          className={`text-xs mt-1 ${
                            file.status === 'error'
                              ? 'text-red-600'
                              : 'text-gray-500'
                          }`}
                        >
                          {renderAttachmentStatus(file.status, file.error)}
                        </p>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 flex-shrink-0">{formatFileSize(file.size)}</p>
                  </div>
                  <button
                    onClick={() => handleRemoveAttachment(index)}
                    className="ml-2 p-1 text-gray-400 hover:text-red-600 transition-colors flex-shrink-0 rounded hover:bg-red-50"
                    title="Remove attachment"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
        </div>
      )}
      
      {/* AI Editing Components */}
      {enableAIEditing && !readOnly && (
        <>
          <QuillAISelectionHandler
            quillRef={quillRef}
            onTextSelected={handleTextSelected}
            onSelectionCleared={handleSelectionCleared}
            enabled={enableAIEditing}
          />
          
          {showFloatingButton && (
            <div className="absolute z-[45] flex items-center gap-2 bg-white border border-gray-200 rounded-lg shadow-lg px-3 py-2"
                 style={{
                   top: `${buttonPosition.top}px`,
                   left: `${buttonPosition.left}px`,
                 }}>
              <button
                onClick={handleClearSelection}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                title="Clear selection"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              
              <div className="w-px h-4 bg-gray-200"></div>
              
              <button
                onClick={handleEditWithAI}
                className="flex items-center gap-1 text-blue-600 hover:text-blue-700 transition-colors px-2 py-1 rounded hover:bg-blue-50"
                title="Edit with AI"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                <span className="text-sm font-medium">Edit with AI</span>
              </button>
            </div>
          )}
          
          {isAIModalOpen && (
            <div 
              className="absolute inset-0 z-50 flex items-start justify-start"
            >
              <div 
                data-modal-content
                className="bg-white max-w-2xl w-full mx-4 max-h-[80vh] flex flex-col border border-[#EDEEEF] shadow-[4px_4px_28px_rgba(30,41,59,0.2)] rounded-[10px]"
                style={{
                  position: 'absolute',
                  top: `${buttonPosition.top + 50}px`,
                  zIndex: 50
                }}
              >
              <AIEditModal
                isOpen={isAIModalOpen}
                onClose={() => {
                  closeModal('ai-edit-modal');
                }}
                selectedText={selectedText}
                onCopy={handleCopy}
                onAddNew={handleAddNew}
                onReplace={handleReplace}
                onGenerateAI={generateAI}
                position={buttonPosition}
                editorRef={editorRef}
              />
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default QuillEditor;
