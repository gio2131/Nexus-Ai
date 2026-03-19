/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, GenerateContentResponse } from '@google/genai';
import { Send, Bot, User } from 'lucide-react';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

interface Message {
  role: 'user' | 'model';
  text: string;
}

export default function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const chat = useRef(ai.chats.create({ model: 'gemini-3-flash-preview' }));

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await chat.current.sendMessage({ message: input });
      const modelMessage: Message = { role: 'model', text: response.text || '' };
      setMessages((prev) => [...prev, modelMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages((prev) => [...prev, { role: 'model', text: 'Error: Could not get a response.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-zinc-900 text-zinc-100">
      <header className="p-4 border-b border-zinc-800">
        <h1 className="text-xl font-semibold">Gemini Chat</h1>
      </header>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
            {msg.role === 'model' && <Bot className="w-8 h-8 p-1.5 rounded-full bg-zinc-800" />}
            <div className={`p-3 rounded-2xl max-w-[80%] ${msg.role === 'user' ? 'bg-indigo-600' : 'bg-zinc-800'}`}>
              {msg.text}
            </div>
            {msg.role === 'user' && <User className="w-8 h-8 p-1.5 rounded-full bg-zinc-700" />}
          </div>
        ))}
        {isLoading && <div className="text-zinc-500">Gemini is thinking...</div>}
        <div ref={chatEndRef} />
      </div>
      <div className="p-4 border-t border-zinc-800">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Message Gemini..."
            className="flex-1 p-3 rounded-xl bg-zinc-800 border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button onClick={sendMessage} className="p-3 rounded-xl bg-indigo-600 hover:bg-indigo-700">
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
