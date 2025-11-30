'use client';

import ChatUI from '../components/ChatUI';

export default function Home() {
  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>AI Accounting</h1>
      <ChatUI />
    </div>
  );
  }
