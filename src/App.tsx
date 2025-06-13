import { ErrorBoundary } from 'react-error-boundary';
import LLMChat from './llm-chats';

export default function App() {
  return (
    <ErrorBoundary fallback={<div>Something went wrong!</div>}>
      <LLMChat />
    </ErrorBoundary>
  );
}
