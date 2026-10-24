import React, { useState, useEffect } from 'react';
import { useDesktop } from '../context/DesktopContext';
import { ApiClient } from '../../shared/api-client';
import { DEFAULT_BASE_URL, DEFAULT_MODEL_ID, DEFAULT_SYSTEM_PROMPT } from '../../shared/constants';
import type { ModelItem } from '../../shared/types';
import { SoundFx } from '../../game/SoundFx';
import {
  Save,
  RotateCcw,
  CheckCircle,
  AlertTriangle,
  Eye,
  EyeOff,
  RefreshCw,
  Trash2,
  Sliders,
  Radio,
  Tv,
  Volume2
} from 'lucide-react';

type ConnectionState =
  | 'idle'
  | 'testing'
  | 'connected'
  | 'auth_failed'
  | 'unreachable'
  | 'error';

export const SettingsApp: React.FC = () => {
  const { settings, updateSettings } = useDesktop();

  // AI Connection State
  const [baseUrl, setBaseUrl] = useState<string>(settings.baseUrl || DEFAULT_BASE_URL);
  const [apiKey, setApiKey] = useState<string>(settings.apiKey || '');
  const [showApiKey, setShowApiKey] = useState<boolean>(false);
  const [selectedModel, setSelectedModel] = useState<string>(settings.selectedModel || DEFAULT_MODEL_ID);
  const [manualModel, setManualModel] = useState<string>('');
  const [systemPrompt, setSystemPrompt] = useState<string>(settings.systemPrompt || DEFAULT_SYSTEM_PROMPT);
  const [temperature, setTemperature] = useState<number>(settings.temperature ?? 0.7);

  // Connection testing state
  const [connectionStatus, setConnectionStatus] = useState<ConnectionState>('idle');
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [availableModels, setAvailableModels] = useState<ModelItem[]>([]);
  const [isRefreshingModels, setIsRefreshingModels] = useState<boolean>(false);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  // Preferences State
  const [soundEnabled, setSoundEnabled] = useState<boolean>(settings.soundEnabled);
  const [crtFilterEnabled, setCrtFilterEnabled] = useState<boolean>(settings.crtFilterEnabled);

  const handleTestConnection = async () => {
    setConnectionStatus('testing');
    setStatusMessage('Pinging 9Router endpoint...');
    SoundFx.playKeyClick();

    try {
      const res = await ApiClient.getInstance().testConnection(baseUrl, apiKey);
      setConnectionStatus('connected');
      setStatusMessage(res.message || 'Connected to 9Router successfully!');
      SoundFx.playNotification();

      // Refresh models upon connection
      handleRefreshModels();
    } catch (err: any) {
      const msg = err.message || 'Connection failed';
      if (msg.includes('401') || msg.toLowerCase().includes('auth')) {
        setConnectionStatus('auth_failed');
        setStatusMessage('Authentication failed: Invalid or missing 9Router API key.');
      } else if (msg.includes('502') || msg.toLowerCase().includes('unreachable') || msg.includes('timed out')) {
        setConnectionStatus('unreachable');
        setStatusMessage(`Endpoint unreachable at ${baseUrl}. Ensure 9Router is running.`);
      } else {
        setConnectionStatus('error');
        setStatusMessage(msg);
      }
      SoundFx.playNotification();
    }
  };

  const handleRefreshModels = async () => {
    setIsRefreshingModels(true);
    try {
      const models = await ApiClient.getInstance().fetchModels(baseUrl, apiKey);
      setAvailableModels(models);
    } catch (err: any) {
      console.warn('Could not refresh models:', err.message);
    } finally {
      setIsRefreshingModels(false);
    }
  };

  const handleSaveSettings = () => {
    SoundFx.playKeyClick();
    const finalModel = manualModel.trim() ? manualModel.trim() : selectedModel;

    updateSettings({
      provider: '9Router',
      baseUrl: baseUrl.trim(),
      apiKey: apiKey.trim(),
      selectedModel: finalModel,
      systemPrompt,
      temperature,
      soundEnabled,
      crtFilterEnabled
    });

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleClearApiKey = () => {
    SoundFx.playKeyClick();
    setApiKey('');
    updateSettings({ apiKey: '' });
  };

  const handleResetDefaults = () => {
    SoundFx.playKeyClick();
    setBaseUrl(DEFAULT_BASE_URL);
    setApiKey('');
    setSelectedModel(DEFAULT_MODEL_ID);
    setManualModel('');
    setSystemPrompt(DEFAULT_SYSTEM_PROMPT);
    setTemperature(0.7);
    setSoundEnabled(true);
    setCrtFilterEnabled(true);
    setConnectionStatus('idle');
    setStatusMessage('');
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 font-mono text-xs text-gray-200 space-y-6">
      {/* Section 1: AI Gateway & Connection */}
      <div className="bg-[#191b22] border border-[#2d313d] rounded p-4 space-y-4 shadow-pixel">
        <div className="flex items-center justify-between border-b border-[#2d313d] pb-2">
          <div className="flex items-center space-x-2">
            <Radio className="w-4 h-4 text-[#ffb347]" />
            <h3 className="text-sm font-bold text-white tracking-wide">9Router AI Gateway</h3>
          </div>
          <span className="text-[10px] px-2 py-0.5 bg-[#252834] text-[#ffb347] rounded border border-[#ffb347]/30">
            OpenAI-Compatible
          </span>
        </div>

        {/* Base URL */}
        <div className="space-y-1">
          <label className="text-gray-300 font-semibold flex items-center justify-between">
            <span>Base URL Endpoint:</span>
            <span className="text-[10px] text-gray-500">Default: {DEFAULT_BASE_URL}</span>
          </label>
          <input
            type="text"
            value={baseUrl}
            onChange={e => setBaseUrl(e.target.value)}
            placeholder="http://127.0.0.1:20128/v1"
            className="w-full bg-[#14151b] border border-[#3b3f51] focus:border-[#ffb347] rounded px-3 py-1.5 text-xs text-gray-100 outline-none"
          />
        </div>

        {/* API Key */}
        <div className="space-y-1">
          <div className="flex justify-between items-center text-gray-300 font-semibold">
            <span>9Router API Key:</span>
            {apiKey && (
              <span className="text-[10px] text-green-400 font-mono">
                {apiKey.length > 8 ? `Configured (${apiKey.slice(0, 3)}...${apiKey.slice(-4)})` : 'Configured'}
              </span>
            )}
          </div>
          <div className="flex space-x-2">
            <div className="relative flex-1">
              <input
                type={showApiKey ? 'text' : 'password'}
                value={apiKey}
                onChange={e => setApiKey(e.target.value)}
                placeholder="Enter your 9Router Gateway key (e.g. sk-...)"
                className="w-full bg-[#14151b] border border-[#3b3f51] focus:border-[#ffb347] rounded px-3 py-1.5 pr-10 text-xs text-gray-100 outline-none"
              />
              <button
                type="button"
                onClick={() => setShowApiKey(prev => !prev)}
                className="absolute right-2 top-2 text-gray-400 hover:text-gray-200"
                title={showApiKey ? 'Hide Key' : 'Show Key'}
              >
                {showApiKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
            <button
              onClick={handleClearApiKey}
              title="Clear API Key"
              className="px-2.5 py-1.5 bg-[#252834] hover:bg-red-950/60 hover:text-red-300 border border-[#3b3f51] rounded text-gray-400 flex items-center space-x-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          </div>
          <p className="text-[10px] text-gray-500">
            Note: Your key is sent directly to the local/proxy gateway and never stored on external third-party servers.
          </p>
        </div>

        {/* Test Connection Button & Status */}
        <div className="flex items-center space-x-3 pt-1">
          <button
            onClick={handleTestConnection}
            disabled={connectionStatus === 'testing'}
            className="px-3 py-1.5 bg-[#252834] hover:bg-[#323646] active:bg-[#ffb347] active:text-black border border-[#ffb347]/50 rounded text-[#ffb347] font-bold flex items-center space-x-1.5 shadow-pixel disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${connectionStatus === 'testing' ? 'animate-spin' : ''}`} />
            <span>Test Connection</span>
          </button>

          {connectionStatus !== 'idle' && (
            <div
              className={`flex items-center space-x-1.5 text-xs px-2.5 py-1 rounded border ${
                connectionStatus === 'connected'
                  ? 'bg-green-950/60 border-green-700 text-green-300'
                  : connectionStatus === 'testing'
                  ? 'bg-blue-950/60 border-blue-700 text-blue-300'
                  : 'bg-red-950/60 border-red-700 text-red-300'
              }`}
            >
              {connectionStatus === 'connected' ? (
                <CheckCircle className="w-3.5 h-3.5 flex-shrink-0" />
              ) : connectionStatus === 'testing' ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin flex-shrink-0" />
              ) : (
                <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
              )}
              <span className="truncate max-w-sm">{statusMessage}</span>
            </div>
          )}
        </div>

        {/* Model Selection */}
        <div className="border-t border-[#2d313d] pt-3 space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-gray-300 font-semibold">Default AI Model:</label>
            <button
              onClick={handleRefreshModels}
              disabled={isRefreshingModels}
              className="text-[11px] text-[#ffb347] hover:underline flex items-center space-x-1"
            >
              <RefreshCw className={`w-3 h-3 ${isRefreshingModels ? 'animate-spin' : ''}`} />
              <span>Refresh Models</span>
            </button>
          </div>

          <select
            value={selectedModel}
            onChange={e => setSelectedModel(e.target.value)}
            className="w-full bg-[#14151b] border border-[#3b3f51] focus:border-[#ffb347] rounded px-3 py-1.5 text-xs text-gray-100 outline-none"
          >
            <option value={DEFAULT_MODEL_ID}>{DEFAULT_MODEL_ID} (Default Recommended)</option>
            {availableModels
              .filter(m => m.id !== DEFAULT_MODEL_ID)
              .map(m => (
                <option key={m.id} value={m.id}>
                  {m.id}
                </option>
              ))}
          </select>

          {/* Manual Model Override */}
          <div className="pt-1">
            <label className="text-[10px] text-gray-400">Or Enter Custom Model ID manually:</label>
            <input
              type="text"
              value={manualModel}
              onChange={e => setManualModel(e.target.value)}
              placeholder="e.g. ag/gemini-3.8-flash-medium"
              className="w-full mt-0.5 bg-[#14151b] border border-[#3b3f51] focus:border-[#ffb347] rounded px-2.5 py-1 text-xs text-gray-100 outline-none"
            />
          </div>
        </div>
      </div>

      {/* Section 2: Generation & Prompt Settings */}
      <div className="bg-[#191b22] border border-[#2d313d] rounded p-4 space-y-3 shadow-pixel">
        <div className="flex items-center space-x-2 border-b border-[#2d313d] pb-2">
          <Sliders className="w-4 h-4 text-[#38bdf8]" />
          <h3 className="text-sm font-bold text-white tracking-wide">Assistant & Parameters</h3>
        </div>

        <div className="space-y-1">
          <label className="text-gray-300 font-semibold">System Prompt:</label>
          <textarea
            value={systemPrompt}
            onChange={e => setSystemPrompt(e.target.value)}
            rows={3}
            className="w-full bg-[#14151b] border border-[#3b3f51] focus:border-[#ffb347] rounded p-2 text-xs text-gray-100 outline-none resize-none"
          />
        </div>

        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <label className="text-gray-300 font-semibold">Creativity / Temperature:</label>
            <span className="text-[#38bdf8] font-bold">{temperature.toFixed(2)}</span>
          </div>
          <input
            type="range"
            min="0"
            max="1.5"
            step="0.05"
            value={temperature}
            onChange={e => setTemperature(parseFloat(e.target.value))}
            className="w-full accent-[#38bdf8] cursor-pointer"
          />
        </div>
      </div>

      {/* Section 3: Audio & Display Preferences */}
      <div className="bg-[#191b22] border border-[#2d313d] rounded p-4 space-y-3 shadow-pixel">
        <div className="flex items-center space-x-2 border-b border-[#2d313d] pb-2">
          <Tv className="w-4 h-4 text-[#4ade80]" />
          <h3 className="text-sm font-bold text-white tracking-wide">Audio & Display</h3>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Volume2 className="w-4 h-4 text-[#ffb347]" />
            <span>8-Bit Synthesizer Audio Effects:</span>
          </div>
          <input
            type="checkbox"
            checked={soundEnabled}
            onChange={e => setSoundEnabled(e.target.checked)}
            className="w-4 h-4 accent-[#ffb347] cursor-pointer"
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Tv className="w-4 h-4 text-[#4ade80]" />
            <span>Cozy CRT Monitor Scanlines:</span>
          </div>
          <input
            type="checkbox"
            checked={crtFilterEnabled}
            onChange={e => setCrtFilterEnabled(e.target.checked)}
            className="w-4 h-4 accent-[#4ade80] cursor-pointer"
          />
        </div>
      </div>

      {/* Action Buttons: Save & Reset */}
      <div className="flex items-center justify-between pt-2">
        <button
          onClick={handleResetDefaults}
          className="px-3 py-1.5 bg-[#252834] hover:bg-[#323646] border border-[#3b3f51] rounded text-gray-300 flex items-center space-x-1.5"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Defaults</span>
        </button>

        <div className="flex items-center space-x-2">
          {savedSuccess && (
            <span className="text-green-400 font-bold flex items-center space-x-1">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Saved!</span>
            </span>
          )}
          <button
            onClick={handleSaveSettings}
            className="px-4 py-2 bg-[#ffb347] hover:bg-[#ffa726] active:bg-[#ff9800] text-black font-bold rounded border border-[#ffcc80] flex items-center space-x-1.5 shadow-pixel"
          >
            <Save className="w-4 h-4" />
            <span>Save Settings</span>
          </button>
        </div>
      </div>
    </div>
  );
};
