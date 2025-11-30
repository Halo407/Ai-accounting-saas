'use client';

import { useState } from 'react';

export default function ChatUI() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input })
      });

      if (!res.ok) throw new Error('Gagal mengambil respons');

      const data = await res.json();
      const aiMessage = { role: 'assistant', content: data.reply || data.message || 'Tidak ada balasan' };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      const errorMessage = { role: 'assistant', content: 'Terjadi kesalahan saat mengirim pesan' };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-history">
        {messages.map((msg, i) => (
          <div key={i} className={`message ${msg.role}`}>
            <span className="content">{msg.content}</span>
          </div>
        ))}
        {loading && <div className="message assistant"><span className="content">...</span></div>}
      </div>
      <form onSubmit={handleSubmit} className="input-form">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ketik pesan..."
          className="input-field"
          disabled={loading}
        />
        <button type="submit" className="send-button" disabled={loading}>
          Kirim
        </button>
      </form>
    </div>
  );
          }
