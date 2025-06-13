// useWebSocketLLM.ts
import { useEffect, useRef, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

export type GroupType = 'thinking' | 'response';

export interface GroupedMessage {
  id: string;
  type: GroupType;
  content: string[];
}

export function useWebSocketLLM(url: string) {
  const ws = useRef<WebSocket | null>(null);
  const [messages, setMessages] = useState<GroupedMessage[]>([]);
  const [connected, setConnected] = useState(false);
  const currentGroup = useRef<GroupedMessage | null>(null);

  useEffect(() => {
    ws.current = new WebSocket(url);

    ws.current.onopen = () => {
      console.log('🔌 WebSocket connected');
      setConnected(true);
    };

    ws.current.onclose = () => {
      console.log('❌ WebSocket disconnected');
      setConnected(false);
    };

    ws.current.onmessage = (event) => {
      const msg = event.data.trim();
      console.log('📩 Received:', msg);

      if (msg === 'Thinking...') {
        const group: GroupedMessage = {
          id: uuidv4(),
          type: 'thinking',
          content: [msg],
        };
        currentGroup.current = group;
        setMessages((prev) => {
          // Only add if it's not already in messages
          const alreadyExists = prev.some((m) => m.id === currentGroup.current!.id);
          if (!alreadyExists) {
            return [...prev, currentGroup.current!];
          }
          return prev;
        });
        
      } else if (msg === '...done thinking.') {
        if (currentGroup.current) {
          const updatedGroup: GroupedMessage = {
            ...currentGroup.current,
            content: [...currentGroup.current.content, msg],
          };
          setMessages((prev) =>
            [...prev.filter((g) => g.id !== updatedGroup.id), updatedGroup]
          );
          currentGroup.current = null;
        } else {
          console.warn('⚠️ No currentGroup found for "...done thinking."');
        }
      } else if (msg === '[[END]]') {
        if (currentGroup.current) {
          const newGroup = { ...currentGroup.current };
          setMessages((prev) =>
            prev.some((g) => g.id === newGroup.id) ? prev : [...prev, newGroup]
          );
          currentGroup.current = null;
        }
      } else {
        if (!currentGroup.current) {
          currentGroup.current = {
            id: uuidv4(),
            type: 'response',
            content: [msg],
          };
        } else {
          currentGroup.current = {
            ...currentGroup.current,
            content: [...currentGroup.current.content, msg],
          };
        }

        const updated: GroupedMessage = { ...currentGroup.current };
        setMessages((prev) =>
          [...prev.filter((g) => g.id !== updated.id), updated]
        );
      }
    };

    return () => {
      ws.current?.close();
    };
  }, [url]);

  const sendMessage = (message: string) => {
    if (ws.current && connected) {
      ws.current.send(message);
    }
  };

  return { messages, sendMessage, connected };
}
