import { useEffect } from "react";
import { useChatStore } from "../store/useChatStore";
import UsersLoadingSkeleton from "./UsersLoadingSkeleton";

function ContactList() {
  const { getAllContacts, allContacts, setSelectedUser, isUsersLoading } =
    useChatStore();

  useEffect(() => {
    getAllContacts();
  }, [getAllContacts]);

  if (isUsersLoading) return <UsersLoadingSkeleton />;

  return (
    <div className="space-y-2">
      {allContacts.map((contact) => (
        <div
          key={contact._id}
          className="bg-slate-500/10 p-4 rounded-lg hover:bg-slate-700/50 transition-colors cursor-pointer"
          onClick={() => setSelectedUser(contact)}
        >
          <div className="flex items-center gap-3">
            <div className={`avatar online`}>
              <div className="size-12 rounded-full">
                <img
                  src={contact.profilePicture || "/avatar.png"}
                  alt={contact.name}
                />
              </div>
            </div>
            <div>
              <h4 className="text-slate-200 font-medium truncate">
                {contact.name}
              </h4>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default ContactList;
