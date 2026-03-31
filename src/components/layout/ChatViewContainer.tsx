import { useAppStore } from '../../store';
import ChatView from '../chat/ChatView';
import MessageInput from '../chat/MessageInput';

export default function ChatViewContainer() {
  const currentCascadeId = useAppStore((s) => s.currentCascadeId);

  return (
    <div id="viewChat" className="view-chat">
      {currentCascadeId ? (
        <ChatView cascadeId={currentCascadeId} />
      ) : (
        <div className="chat-empty">
          <div className="chat-empty-icon">⚡</div>
          <div className="chat-empty-title">No IDE Connected</div>
          <div className="chat-empty-hint">Open the drawer and launch Antigravity</div>
        </div>
      )}
      <MessageInput />
    </div>
  );
}
