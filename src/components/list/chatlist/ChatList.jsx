import { useEffect, useState } from "react";
import AddMore from "./addMore/AddMore";
import { doc, getDoc, onSnapshot, updateDoc } from "firebase/firestore";
import { useUserStore } from "../../../lib/userStore";
import { db } from "../../../lib/firebase";
import { useChatStore } from "../../../lib/chatStore";

export default function ChatList() {
  const [addMode, setAddMode] = useState(false);
  const [input, setInput] = useState("");
  const [chats, setChats] = useState([]);

  const { currentUser } = useUserStore();
  const { changeChat } = useChatStore();

  useEffect(() => {
    const unSub = onSnapshot(
      doc(db, "userChats", currentUser.id),
      async (res) => {
        const items = res.data().chats;

        const promises = items.map(async (item) => {
          const useDocRef = doc(db, "users", item.receiverId);
          const userDocSnap = await getDoc(useDocRef);

          const user = userDocSnap.data();

          return { ...item, user };
        });

        const chatData = await Promise.all(promises);
        setChats(chatData.sort((a, b) => b.updatedAt - a.updatedAt));
      }
    );

    return () => {
      unSub();
    };
  }, [currentUser.id]);

  const handleSelect = async (chat) => {
    const userChats = chats.map((item) => {
      const { user, ...rest } = item;
      return rest;
    });

    const chatIndex = userChats.findIndex(
      (item) => item.chatId === chat.chatId
    );

    userChats[chatIndex].isSeen = true;

    const userChatsRef = doc(db, "userChats", currentUser.id);

    try {
      await updateDoc(userChatsRef, {
        chats: userChats,
      });
      changeChat(chat.chatId, chat.user);
    } catch (err) {
      console.log(err);
    }
  };

  const filteredChats = chats.filter((c) =>
    c.user.username.toLowerCase().includes(input.toLowerCase())
  );
  return (
    <div className="flex flex-col  overflow-y-scroll h-full">
      <div className="p-5 flex gap-2 items-center justify-center border-b border-[#dddddd35]">
        <SearchBar input={input} setInput={setInput} />
        <img
          src={addMode ? "./minus.png" : "./plus.png"}
          alt=""
          onClick={() => setAddMode(!addMode)}
          className="w-10 h-10 bg-[rgba(17,25,40,0.5)] p-3 rounded-lg cursor-pointer"
        />
      </div>

      {filteredChats.map((chat) => (
        <div
          className="border-b border-[#dddddd35] flex gap-5 items-center cursor-pointer p-5"
          key={chat.chatId}
          onClick={() => handleSelect(chat)}
          style={{
            backgroundColor: chat?.isSeen ? "transparent" : "#5183fe",
          }}
        >
          <img
            src={
              chat.user.blocked.includes(currentUser.id)
                ? "./avatar.png"
                : chat.user.avatar || "./avatar.png"
            }
            alt=""
            className="w-12 h-12 rounded-full object-cover"
          />
          <div className="flex flex-col">
            <span>
              {chat.user.blocked.includes(currentUser.id)
                ? "User"
                : chat.user.username}
            </span>
            <p>{chat.lastMessage}</p>
          </div>
        </div>
      ))}

      {addMode && <AddMore />}
    </div>
  );
}

function SearchBar({ input, setInput }) {
  return (
    <div className="flex bg-[rgba(17,25,40,0.5)] items-center rounded-xl  p-2 gap-5 grow">
      <img src="./search.png" alt="" className="w-5 h-5" />
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        type="text"
        placeholder="search"
        className="bg-transparent border-0 outline-none text-white "
      />
    </div>
  );
}
