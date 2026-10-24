import React, { useState, useEffect, useRef } from 'react';
import { useDesktop } from '../context/DesktopContext';
import { ApiClient } from '../../shared/api-client';
import { DEFAULT_MODEL_ID } from '../../shared/constants';
import type { ChatMessage, Conversation, ModelItem } from '../../shared/types';
import { SoundFx } from '../../game/SoundFx';
import {
  Send,
  Square,
  RotateCw,
  Trash2,
  Plus,
  Copy,
  Check,
  Bot,
  User,
  AlertCircle,
  Sparkles,
  ChevronDown
} from 'lucide-react';
import { marked } from 'marked';
import DOMPurify from 'dompurify';

export const AIChatApp: React.FC = () => {
  const { settings, chatHistory, saveConversation, deleteConversation } = useDesktop();
  const [currentConvId, setCurrentConvId] = useState<string>(chatHistory[0]?.id || 'conv-1');
  const [inputText, setInputText] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Model selection state
  const [availableModels, setAvailableModels] = useState<ModelItem[]>([]);
  const [isLoadingModels, setIsLoadingModels] = useState<boolean>(false);
  const [selectedModel, setSelectedModel] = useState<string>(settings.selectedModel || DEFAULT_MODEL_ID);

  const abortControllerRef = useRef<AbortController | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const activeConv = chatHistory.find(c => c.id === currentConvId) || {
    id: currentConvId,
    title: 'New Conversation',
    model: selectedModel,
    createdAt: Date.now(),
    messages: []
  };

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConv.messages, isGenerating]);

  // Load models on mount
  useEffect(() => {
    loadModels();
  }, [settings.baseUrl]);

  const loadModels = async () => {
    setIsLoadingModels(true);
    try {
      const models = await ApiClient.getInstance().fetchModels(settings.baseUrl, settings.apiKey);
      setAvailableModels(models);
      // Verify if selected model exists
      if (models.length > 0 && !models.some(m => m.id === selectedModel)) {
        console.warn(`Default model ${selectedModel} not found in model list. User can still select or use default.`);
      }
    } catch (err: any) {
      console.warn('Could not auto-fetch models from 9Router:', err.message);
    } finally {
      setIsLoadingModels(false);
    }
  };

  const handleSendMessage = async () => {
    const text = inputText.trim();
    if (!text || isGenerating) return;

    SoundFx.playKeyClick();
    setErrorMsg(null);
    setInputText('');

    const userMsg: ChatMessage = { role: 'user', content: text };
    const systemMsg: ChatMessage = {
      role: 'system',
      content: settings.systemPrompt
    };

    // Prepare message array
    const previousMessages = activeConv.messages.filter(m => m.role !== 'system');
    const updatedMessages: ChatMessage[] = [systemMsg, ...previousMessages, userMsg];

    // Placeholder assistant message for streaming
    const assistantMsgIndex = updatedMessages.length;
    updatedMessages.push({ role: 'assistant', content: '' });

    const updatedConv: Conversation = {
      ...activeConv,
      title: activeConv.messages.length === 0 ? text.slice(0, 24) + '...' : activeConv.title,
      model: selectedModel,
      messages: updatedMessages
    };

    saveConversation(updatedConv);
    setIsGenerating(true);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    let accumulatedContent = '';

    await ApiClient.getInstance().streamChat(
      updatedMessages.slice(0, -1), // send without the blank assistant placeholder
      {
        model: selectedModel,
        baseUrl: settings.baseUrl,
        apiKey: settings.apiKey,
        temperature: settings.temperature,
        signal: controller.signal
      },
      {
        onToken: (token: string) => {
          accumulatedContent += token;
          updatedConv.messages[assistantMsgIndex] = {
            role: 'assistant',
            content: accumulatedContent
          };
          saveConversation({ ...updatedConv });
        },
        onError: (err: Error) => {
          setIsGenerating(false);
          setErrorMsg(err.message);
          SoundFx.playNotification();
          // Remove empty assistant placeholder if failed completely
          if (!accumulatedContent) {
            updatedConv.messages.pop();
            saveConversation({ ...updatedConv });
          }
        },
        onDone: () => {
          setIsGenerating(false);
          abortControllerRef.current = null;
          SoundFx.playNotification();
        }
      }
    );
  };

  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsGenerating(false);
    }
  };

  const handleRetry = () => {
    if (isGenerating || activeConv.messages.length === 0) return;
    const lastUserIdx = [...activeConv.messages].reverse().findIndex(m => m.role === 'user');
    if (lastUserIdx === -1) return;
    const actualIdx = activeConv.messages.length - 1 - lastUserIdx;
    const lastUserMsg = activeConv.messages[actualIdx];

    // Prune subsequent messages
    const trimmed = activeConv.messages.slice(0, actualIdx);
    saveConversation({
      ...activeConv,
      messages: trimmed
    });

    setInputText(lastUserMsg.content);
  };

  const handleCreateNewChat = () => {
    SoundFx.playKeyClick();
    const newId = `conv-${Date.now()}`;
    const newConv: Conversation = {
      id: newId,
      title: 'New Conversation',
      model: selectedModel,
      createdAt: Date.now(),
      messages: [
        {
          role: 'system',
          content: settings.systemPrompt
        },
        {
          role: 'assistant',
          content: 'Hello! I am connected to 9Router. What would you like to build or discuss today?'
        }
      ]
    };
    saveConversation(newConv);
    setCurrentConvId(newId);
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    SoundFx.playKeyClick();
    setTimeout(() => setCopiedId(null), 2000);
  };

  const renderMarkdown = (content: string) => {
    try {
      const rawHtml = marked.parse(content, { gfm: true, breaks: true }) as string;
      const cleanHtml = DOMPurify.sanitize(rawHtml);
      return { __html: cleanHtml };
    } catch {
      return { __html: DOMPurify.sanitize(content) };
    }
  };

  return (
    <div className="flex h-full font-mono text-xs overflow-hidden select-text">
      {/* Sidebar: Conversation history */}
      <div className="w-48 bg-[#14151b] border-r border-[#2d313d] flex flex-col select-none">
        <div className="p-2 border-b border-[#2d313d]">
          <button
            onClick={handleCreateNewChat}
            className="w-full flex items-center justify-center space-x-1.5 py-1.5 bg-[#252834] hover:bg-[#323646] text-[#ffb347] border border-[#ffb347]/40 rounded transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="font-bold">New Chat</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-1.5 space-y-1">
          {chatHistory.map(conv => (
            <div
              key={conv.id}
              onClick={() => {
                setCurrentConvId(conv.id);
                SoundFx.playKeyClick();
              }}
              className={`group flex items-center justify-between px-2 py-1.5 rounded cursor-pointer transition-colors ${
                currentConvId === conv.id
                  ? 'bg-[#282d3c] text-[#ffb347] font-semibold border-l-2 border-[#ffb347]'
                  : 'text-gray-400 hover:bg-[#1e2029] hover:text-gray-200'
              }`}
            >
              <span className="truncate flex-1 text-[11px]">{conv.title || 'Untitled'}</span>
              {chatHistory.length > 1 && (
                <button
                  onClick={e => {
                    e.stopPropagation();
                    deleteConversation(conv.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 hover:text-red-400 p-0.5"
                  title="Delete conversation"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Model status footer in sidebar */}
        <div className="p-2 border-t border-[#2d313d] text-[10px] text-gray-500">
          <div className="flex items-center space-x-1 text-[#4ade80]">
            <span className="w-2 h-2 rounded-full bg-[#4ade80] animate-pulse" />
            <span>9Router Gateway</span>
          </div>
          <div className="truncate text-gray-400 mt-0.5">{selectedModel}</div>
        </div>
      </div>

      {/* Main Chat Interface */}
      <div className="flex-1 flex flex-col bg-[#191b22] overflow-hidden">
        {/* Model Selector Bar */}
        <div className="flex items-center justify-between px-3 py-1.5 bg-[#1e2029] border-b border-[#2d313d] text-[11px]">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-3.5 h-3.5 text-[#ffb347]" />
            <span className="text-gray-400">Model:</span>
            <select
              value={selectedModel}
              onChange={e => {
                setSelectedModel(e.target.value);
                SoundFx.playKeyClick();
              }}
              className="bg-[#14151b] border border-[#3b3f51] text-gray-200 rounded px-2 py-0.5 focus:border-[#ffb347] outline-none"
            >
              <option value={DEFAULT_MODEL_ID}>{DEFAULT_MODEL_ID} (Default)</option>
              {availableModels
                .filter(m => m.id !== DEFAULT_MODEL_ID)
                .map(m => (
                  <option key={m.id} value={m.id}>
                    {m.id}
                  </option>
                ))}
            </select>
          </div>

          <button
            onClick={loadModels}
            disabled={isLoadingModels}
            title="Refresh models from 9Router"
            className="flex items-center space-x-1 text-gray-400 hover:text-[#ffb347] px-2 py-0.5 rounded hover:bg-[#252834]"
          >
            <RotateCw className={`w-3 h-3 ${isLoadingModels ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {activeConv.messages
            .filter(m => m.role !== 'system')
            .map((msg, idx) => {
              const isUser = msg.role === 'user';
              return (
                <div
                  key={idx}
                  className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                >
                  <div className="flex items-center space-x-1.5 mb-1 text-[10px] text-gray-400">
                    {isUser ? (
                      <>
                        <span>You</span>
                        <User className="w-3 h-3 text-[#ffb347]" />
                      </>
                    ) : (
                      <>
                        <Bot className="w-3 h-3 text-[#38bdf8]" />
                        <span>{activeConv.model}</span>
                      </>
                    )}
                  </div>

                  <div
                    className={`relative group max-w-[85%] rounded p-3 border shadow-pixel ${
                      isUser
                        ? 'bg-[#2c3345] border-[#4c566a] text-gray-100'
                        : 'bg-[#1e2029] border-[#3b3f51] text-gray-200'
                    }`}
                  >
                    <div
                      className="prose prose-invert max-w-none text-xs leading-relaxed space-y-2"
                      dangerouslySetInnerHTML={renderMarkdown(msg.content)}
                    />

                    {/* Copy message button */}
                    <button
                      onClick={() => handleCopy(msg.content, `msg-${idx}`)}
                      className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 p-1 bg-[#14151b] border border-[#3b3f51] rounded text-gray-400 hover:text-white transition-opacity"
                      title="Copy response"
                    >
                      {copiedId === `msg-${idx}` ? (
                        <Check className="w-3 h-3 text-green-400" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  </div>
                </div>
              );
            })}

          {/* Active Generation Cursor */}
          {isGenerating && (
            <div className="flex items-center space-x-2 text-gray-400 text-xs italic">
              <span className="w-2 h-2 rounded-full bg-[#38bdf8] animate-ping" />
              <span>Pixel AI is thinking...</span>
            </div>
          )}

          {/* Error Banner */}
          {errorMsg && (
            <div className="p-3 bg-red-950/70 border border-red-700/80 rounded flex items-start space-x-2 text-red-200 text-xs">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="font-bold text-red-300">Connection or Model Error</div>
                <div>{errorMsg}</div>
                <div className="mt-1 text-[10px] text-red-400">
                  Tip: Open Settings to verify your 9Router Base URL and API key.
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Chat Input Bar */}
        <div className="p-2.5 bg-[#14151b] border-t border-[#2d313d] flex flex-col space-y-1.5">
          <div className="flex items-center space-x-2">
            <textarea
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder="Ask anything (Enter to send, Shift+Enter for newline)..."
              disabled={isGenerating}
              rows={2}
              className="flex-1 bg-[#191b22] border border-[#3b3f51] focus:border-[#ffb347] rounded p-2 text-xs text-gray-100 placeholder-gray-500 outline-none resize-none font-mono"
            />

            <div className="flex flex-col space-y-1">
              {isGenerating ? (
                <button
                  onClick={handleStopGeneration}
                  className="px-3 py-2 bg-red-600 hover:bg-red-500 text-white rounded font-bold border border-red-400 flex items-center space-x-1 shadow-pixel"
                  title="Stop generation"
                >
                  <Square className="w-3.5 h-3.5 fill-current" />
                  <span>Stop</span>
                </button>
              ) : (
                <button
                  onClick={handleSendMessage}
                  disabled={!inputText.trim()}
                  className="px-3 py-2 bg-[#ffb347] hover:bg-[#ffa726] active:bg-[#ff9800] text-black rounded font-bold border border-[#ffcc80] flex items-center space-x-1 shadow-pixel disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send</span>
                </button>
              )}

              <button
                onClick={handleRetry}
                disabled={isGenerating || activeConv.messages.length <= 1}
                title="Retry last response"
                className="px-2 py-1 bg-[#252834] hover:bg-[#323646] text-gray-300 rounded border border-[#3b3f51] flex items-center justify-center disabled:opacity-30"
              >
                <RotateCw className="w-3 h-3" />
              </button>
            </div>
          </div>

          <div className="flex justify-between items-center text-[10px] text-gray-500 px-1">
            <span>Powered by 9Router API</span>
            <span>Default: {DEFAULT_MODEL_ID}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
