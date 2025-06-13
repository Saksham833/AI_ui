import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { SendHorizonal, MessageSquare } from 'lucide-react';
import { useWebSocketLLM } from './useWebSocketLLM';

export default function LLMChat() {
  const [input, setInput] = useState('');
  const [expandedThinking, setExpandedThinking] = useState<Record<string, boolean>>({});
  const { messages, sendMessage, connected } = useWebSocketLLM('ws://localhost:8000/ws/llm');
  const bottomRef = useRef<HTMLDivElement | null>(null);


  const handleSend = () => {
    if (!input.trim() || !connected) return;
    sendMessage(input);
    setInput('');
  };

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  useEffect(() => {
    const allIds = messages.map((m) => m.id);
    const hasDuplicates = new Set(allIds).size !== allIds.length;
    if (hasDuplicates) {
      console.warn('⚠️ Duplicate keys detected in messages:', allIds);
    }
  }, [messages]);
  

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.iconContainer}>
          <MessageSquare size={48} style={styles.icon} />
        </div>
        <h1 style={styles.title}>LLM Chat</h1>
        <p style={styles.subtitle}>Your AI Companion</p>
      </div>

      <div style={styles.mainContent}>
  {messages.length === 0 ? (
    <div style={styles.emptyState}>
      <h2 style={styles.welcomeTitle}>Start chatting with your LLM!</h2>
      <p style={styles.welcomeSubtext}>Ask me anything and I'll help you out.</p>
    </div>
  ) : (
    <div style={styles.messagesContainer}>
     {messages.map((group) => {
        if (!group) return null; // 🛑 Prevents the TypeError

  const isThinking = group.type === 'thinking';
  const expanded = expandedThinking[group.id] ?? true;

  return (
    <div
    ref={bottomRef} 
      key={group.id}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        marginBottom: '24px',
        padding: '12px 16px',
        backgroundColor: isThinking ? '#fffbe6' : '#f1f5f9',
        borderRadius: '16px',
        boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
        border: '1px solid #e2e8f0', // use only full border (no borderColor)
      }}
    >
      {isThinking && (
        <button
          onClick={() =>
            setExpandedThinking((prev) => ({
              ...prev,
              [group.id]: !expanded,
            }))
          }
          style={{
            background: 'transparent',
            border: 'none',
            color: '#007bff',
            fontWeight: 500,
            cursor: 'pointer',
            marginBottom: 4,
            padding: 0,
          }}
        >
          {expanded ? 'Hide Thinking 🤔' : 'Show Thinking 🧠'}
        </button>
      )}

      {(!isThinking || expanded) &&
        group.content.map((line, idx) => (
          <div
            key={idx}
            style={{
              backgroundColor: isThinking ? '#fffde7' : '#ffffff',
              padding: '10px 14px',
              borderRadius: '12px',
              fontSize: '15px',
              color: '#1a1a1a',
              lineHeight: 1.5,
              border: '1px dashed #ffe58f',
            }}
          >
            {line}
          </div>
        ))}
    </div>
  );
})}

    </div>
  )}
</div>


      <div style={styles.inputContainer}>
        <div style={styles.inputWrapper}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={connected ? 'Type your message here...' : 'Connecting...'}
            disabled={!connected}
            style={{
              ...styles.input,
              ...(input.length > 0 ? styles.inputFocused : {}),
            }}
          />
          <button
            onClick={handleSend}
            disabled={!connected || !input.trim()}
            style={{
              ...styles.sendButton,
              ...((!connected || !input.trim()) ? styles.sendButtonDisabled : {}),
            }}
          >
            <SendHorizonal size={24} />
          </button>
        </div>
      </div>
    </div>
  );
}

const styles: { [key: string]: CSSProperties } = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#ffffff',
    display: 'flex',
    flexDirection: 'column',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  header: {
    padding: '60px 40px 40px',
    textAlign: 'center',
    maxWidth: '800px',
    margin: '0 auto',
    width: '100%',
  },
  iconContainer: {
    marginBottom: '24px',
  },
  icon: {
    color: '#333333',
    strokeWidth: 2,
  },
  title: {
    fontSize: '64px',
    fontWeight: '700',
    color: '#1a1a1a',
    margin: '0 0 16px 0',
    letterSpacing: '-0.02em',
  },
  subtitle: {
    fontSize: '20px',
    color: '#666666',
    margin: 0,
    fontWeight: '400',
  },
  mainContent: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    maxWidth: '800px',
    margin: '0 auto',
    width: '100%',
    padding: '0 40px',
  },
  emptyState: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
    minHeight: '200px',
  },
  welcomeTitle: {
    fontSize: '32px',
    fontWeight: '600',
    color: '#1a1a1a',
    margin: '0 0 12px 0',
  },
  welcomeSubtext: {
    fontSize: '18px',
    color: '#666666',
    margin: 0,
  },
  messagesContainer: {
    flex: 1,
    padding: '20px 0',
    overflowY: 'auto',
  },
  messageWrapper: {
    display: 'flex',
    marginBottom: '16px',
  },
  message: {
    maxWidth: '70%',
    padding: '12px 16px',
    borderRadius: '18px',
    fontSize: '16px',
    lineHeight: '1.4',
  },
  inputContainer: {
    padding: '30px 40px 40px',
    backgroundColor: '#ffffff',
    position:'sticky',
    bottom:'0'
  },
  inputWrapper: {
    position: 'relative',
    maxWidth: '800px',
    margin: '0 auto',
  },
  input: {
    width: '100%',
    padding: '16px 60px 16px 20px',
    fontSize: '16px',
    border: '2px solid #e0e0e0',
    borderRadius: '25px',
    outline: 'none',
    backgroundColor: '#ffffff',
    color: '#1a1a1a',
    transition: 'border-color 0.2s ease',
    boxSizing: 'border-box',
  },
  inputFocused: {
    // borderColor: '#007bff',
  },
  sendButton: {
    position: 'absolute',
    right: '6px',
    top: '50%',
    transform: 'translateY(-50%)',
    width: '44px',
    height: '44px',
    borderRadius: '50%',
    border: 'none',
    backgroundColor: '#007bff',
    color: '#ffffff',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease',
  },
  sendButtonDisabled: {
    backgroundColor: '#cccccc',
    cursor: 'not-allowed',
  },
};
