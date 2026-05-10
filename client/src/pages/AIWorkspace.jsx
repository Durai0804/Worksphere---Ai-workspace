import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, Bot, User, Sparkles, Trash2 } from 'lucide-react';
import { sendMessage } from '../api/aiApi';

const AIWorkspace = () => {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "👋 Hello! I'm your AI Workplace Assistant. I can help with:\n\n• HR policies & leave policy\n• Attendance information\n• Leave balance & requests\n• Draft leave applications\n• Meeting summary templates\n• Company benefits\n\nHow can I help you today?" }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const endRef = useRef(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);

    try {
      const res = await sendMessage(userMsg);
      setMessages((prev) => [...prev, { role: 'assistant', content: res.data.data.message }]);
    } catch {
      setMessages((prev) => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }]);
    } finally { setLoading(false); }
  };

  const quickPrompts = [
    'What is the leave policy?', 'My leave balance', 'Draft a leave request',
    'Attendance rules', 'Company benefits', 'Meeting summary template',
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-130px)]">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Sparkles className="w-6 h-6 text-[var(--color-primary)]" />AI Assistant</h1>
          <p className="text-sm text-[var(--color-text-muted)]">Your intelligent workplace helper</p>
        </div>
        <button onClick={() => setMessages([messages[0]])} className="btn-secondary text-sm"><Trash2 className="w-4 h-4" />Clear Chat</button>
      </div>

      {/* Chat Area */}
      <div className="flex-1 glass-card rounded-xl overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {messages.map((msg, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)]' : 'bg-gradient-to-br from-[var(--color-secondary)] to-[var(--color-accent)]'}`}>
                {msg.role === 'user' ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-white" />}
              </div>
              <div className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${msg.role === 'user' ? 'bg-[var(--color-primary)] text-white rounded-tr-sm' : 'bg-[var(--color-surface-light)] text-[var(--color-text)] rounded-tl-sm border border-[var(--color-border)]'}`}>
                {msg.content}
              </div>
            </motion.div>
          ))}

          {loading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--color-secondary)] to-[var(--color-accent)] flex items-center justify-center"><Bot className="w-4 h-4 text-white" /></div>
              <div className="bg-[var(--color-surface-light)] rounded-2xl rounded-tl-sm px-4 py-3 border border-[var(--color-border)]">
                <motion.div className="flex gap-1.5">
                  {[0, 1, 2].map((i) => <motion.span key={i} className="w-2 h-2 bg-[var(--color-text-muted)] rounded-full" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }} />)}
                </motion.div>
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>

        {/* Quick Prompts */}
        {messages.length <= 1 && (
          <div className="px-5 pb-3">
            <div className="flex flex-wrap gap-2">
              {quickPrompts.map((p) => (
                <button key={p} onClick={() => { setInput(p); }} className="px-3 py-1.5 rounded-full text-xs font-medium bg-[var(--color-primary)]/10 text-[var(--color-primary-light)] border border-[var(--color-primary)]/20 hover:bg-[var(--color-primary)]/20 transition-colors">
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="p-4 border-t border-[var(--color-border)]">
          <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex gap-3">
            <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask me anything about your workplace..." className="input-field flex-1" disabled={loading} />
            <button type="submit" disabled={!input.trim() || loading} className="btn-primary px-4 disabled:opacity-50 disabled:cursor-not-allowed">
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AIWorkspace;
