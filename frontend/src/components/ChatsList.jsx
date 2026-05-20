import { useEffect } from "react";

import NoChatsFound from "./NoChatsFound";
import UsersLoadingSkeleton from "./UsersLoadingSkeleton";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";

function ChatsList() {
  const { getMyChatPartners, chats, isUsersLoading, setSelectedUser } =
    useChatStore();
  const { onlineUsers } = useAuthStore();

  useEffect(() => {
    getMyChatPartners();
  }, [getMyChatPartners]);

  if (isUsersLoading) return <UsersLoadingSkeleton />;
  if (chats.length === 0) return <NoChatsFound />;

  return (
    <div className="space-y-2">
      {chats.map((chat) => (
        <div
          key={chat._id}
          className="bg-slate-500/10 p-4 rounded-lg hover:bg-slate-700/50 transition-colors cursor-pointer"
          onClick={() => setSelectedUser(chat)}
        >
          <div className="flex items-center gap-3">
            {/* Online indicator */}
            <div
              className={`avatar ${onlineUsers.includes(chat._id) ? "online" : "offline"}`}
            >
              <div className="size-12 rounded-full">
                <img
                  src={chat.profilePicture || "/avatar.png"}
                  alt={chat.name}
                />
              </div>
            </div>
            <div>
              <h4 className="text-slate-200 font-medium truncate">
                {chat.name}
              </h4>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default ChatsList;
