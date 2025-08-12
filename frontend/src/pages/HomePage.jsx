import React from 'react'
import Sidebar from '../components/Sidebar';
import NoChatSelected from '../components/NoChatSelected';
import ChatContainer from '../components/ChatContainer';
import useMediaQuery from '../hooks/useMediaQuery';
import { useChatStore } from '../store/useChatStore';

const HomePage = () => {
  const { selectedUser } = useChatStore();
  const isMobile = useMediaQuery('(max-width: 700px)'); // mobile/tablet breakpoint

  return (
    isMobile ? (
      <div className="h-screen w-screen bg-base-200">
        {/* WhatsApp-like: Sidebar or ChatContainer takes entire viewport */}
        {!selectedUser ? (
          <Sidebar />
        ) : (
          <ChatContainer />
        )}
      </div>
    ) : (
      <div className="h-screen bg-base-200">
        <div className="flex items-center justify-center h-full px-4 pt-20 pb-5">
          <div className="bg-base-100 rounded-lg shadow-cl w-full max-w-6xl h-full overflow-hidden">
            {/* Responsive WhatsApp-like layout */}
            <div className="flex h-full rounded-lg overflow-hidden">
              <Sidebar />
              {!selectedUser ? <NoChatSelected /> : <ChatContainer />}
            </div>
          </div>
        </div>
      </div>
    )
  );
};

export default HomePage;
