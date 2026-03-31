import { useEffect } from 'react';
import { useAppStore } from '../../store';
import { connectWS, disconnectWS } from '../../services/ws';
import TopBar from './TopBar';
import Drawer from './Drawer';
import CascadeList from './CascadeList';
import QuotaOverview from './QuotaOverview';
import DrawerActions from './DrawerActions';
import ChatViewContainer from './ChatViewContainer';
import MoreView from './MoreView';
import BottomNav from './BottomNav';
import AccountModal from '../modals/AccountModal';
import FilePreviewModal from '../modals/FilePreviewModal';
import ProjectModal from '../modals/ProjectModal';
import ToastContainer from '../ToastContainer';
import TerminalContainer from '../terminal/TerminalContainer';

export default function AppShell() {
  const activeView = useAppStore((s) => s.activeView);

  useEffect(() => {
    connectWS();
    return () => disconnectWS();
  }, []);

  return (
    <div id="appShell" className="app-shell">
      <TopBar />
      <Drawer>
        <CascadeList />
        <QuotaOverview />
        <DrawerActions />
      </Drawer>
      <main className="main-content">
        {activeView === 'chat' && <ChatViewContainer />}
        {activeView === 'terminal' && <TerminalContainer />}
        {activeView === 'more' && <MoreView />}
      </main>
      <BottomNav />
      <AccountModal />
      <FilePreviewModal />
      <ProjectModal />
      <ToastContainer />
    </div>
  );
}
