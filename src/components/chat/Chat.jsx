import EmojiPicker from "emoji-picker-react";
import "./chat.css";
import { useEffect, useRef, useState } from "react";
import {
  arrayUnion,
  doc,
  getDoc,
  onSnapshot,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useChatStore } from "../../lib/chatStore";
import { useUserStore } from "../../lib/userStore";
import upload from "../../lib/upload";

export default function Chat() {
  const [chat, setChat] = useState();
  const [img, setImg] = useState({
    file: null,
    url: "",
  });
  const { chatId } = useChatStore();

  const endRef = useRef(null);
  const { user } = useChatStore();

  useEffect(() => {
    endRef?.current?.scrollIntoView({ behaviour: "smooth" });
  }, [chat?.message]);

  useEffect(() => {
    if (chatId) {
      const unSub = onSnapshot(doc(db, "chats", chatId), async (res) => {
        setChat(res.data());
      });
      return () => {
        unSub();
      };
    }
  }, [chatId]);
  return (
    <div className="w-1/2 border-l border-r border-[#dddddd35] flex flex-col">
      <ChatTop user={user} />
      <ChatCenter chat={chat} img={img} />
      <div ref={endRef}></div>
      <ChatBottom chatId={chatId} user={user} img={img} setImg={setImg} />
    </div>
  );
}

function ChatTop({ user }) {
  return (
    <div className="top flex items-center justify-between p-5 border-b border-[#dddddd35]">
      <div className="flex gap-5 items-center">
        <img
          src={user?.avatar || "./avatar.png"}
          alt=""
          className="w-14 h-14 rounded-full"
        />
        <div className="flex flex-col">
          <span className="text-lg font-bold">{user?.username}</span>
          <p className="text-md font-light text-[#a5a5a5]">
            Lorem, ipsum dolor sit amet.
          </p>
        </div>
      </div>
      <div className="icons flex gap-5">
        <img src="./phone.png" alt="" className="w-5 h-5" />
        <img src="./video.png" alt="" className="w-5 h-5" />
        <img src="./info.png" alt="" className="w-5 h-5" />
      </div>
    </div>
  );
}

function ChatCenter({ chat, img }) {
  const { currentUser } = useUserStore();
  return (
    <div
      className="center grow p-5 overflow-y-scroll flex flex-col gap-5  w-full
     "
    >
      {chat?.messages?.map((message) => (
        <div
          className={
            message?.senderId === currentUser?.id ? "message own" : "message "
          }
          key={message?.createdAt}
        >
          {/* <img src="./avatar.png" alt="" className="w-9 h-9 rounded-full" /> */}
          {message?.img ? <img src={message.img} alt="" /> : ""}
          {message?.text ? (
            <div className="texts">
              <p>{message?.text}</p>
              <span>{console.log(message?.createdAt)}</span>
            </div>
          ) : (
            ""
          )}
        </div>
      ))}
    </div>
  );
}

function ChatBottom({ chatId, user, img, setImg }) {
  const [openEmojiContainer, setOpenEmojiContainer] = useState(false);
  const [text, setText] = useState("");

  const { currentUser } = useUserStore();
  const { isReceiverBlocked, isCurrentUserBlocked } = useChatStore();

  const handleEmoji = (e) => {
    setText((prev) => prev + e.emoji);
    setOpenEmojiContainer(false);
  };

  const handleSend = async () => {
    if (text === "") return;

    try {
      await updateDoc(doc(db, "chats", chatId), {
        messages: arrayUnion({
          senderId: currentUser.id,
          text,
          createdAt: new Date(),
        }),
      });
      const userIDs = [currentUser.id, user.id];

      userIDs.forEach(async (id) => {
        const userChatsRef = doc(db, "userChats", id);
        const userChatsSnapshot = await getDoc(userChatsRef);

        if (userChatsSnapshot.exists()) {
          const userChatsData = userChatsSnapshot.data();

          const chatIndex = userChatsData.chats.findIndex(
            (c) => c.chatId === chatId
          );

          userChatsData.chats[chatIndex].lastMessage = text;
          userChatsData.chats[chatIndex].isSeen =
            id === currentUser.id ? true : false;

          userChatsData.chats[chatIndex].updatesAt = Date.now();

          await updateDoc(userChatsRef, {
            chats: userChatsData.chats,
          });
        }
      });
    } catch (err) {
      console.log(err);
    }
    setText("");
    setImg({
      file: null,
      url: "",
    });
  };

  const handleImg = async (e) => {
    if (e.target.files[0]) {
      setImg({
        file: e.target.files[0],
        url: URL.createObjectURL(e.target.files[0]),
      });
    }

    let imgUrl = null;
    try {
      if (img.file) {
        imgUrl = await upload(img?.file);

        await updateDoc(doc(db, "chats", chatId), {
          messages: arrayUnion({
            senderId: currentUser.id,
            text,
            createdAt: new Date(),
            ...(imgUrl && { img: imgUrl }),
          }),
        });
      }
    } catch (err) {
      console.log(err);
    }
  };
  return (
    <div className="bottom flex justify-between items-center gap-5 p-5 border-t border-[#dddddd35]">
      <div className="icons flex gap-5">
        <label htmlFor="file">
          <img
            src="./img.png"
            alt=""
            className={`w-5 h-5 ${
              isReceiverBlocked || isCurrentUserBlocked
                ? "cursor-not-allowed"
                : "cursor-pointer"
            }`}
          />
        </label>
        <input
          type="file"
          name=""
          id="file"
          style={{ display: "none" }}
          onChange={handleImg}
        />
        <img
          src="./camera.png"
          alt=""
          className={`w-5 h-5 ${
            isReceiverBlocked || isCurrentUserBlocked
              ? "cursor-not-allowed"
              : "cursor-pointer"
          }`}
        />
        <img
          src="./mic.png"
          alt=""
          className={`w-5 h-5 ${
            isReceiverBlocked || isCurrentUserBlocked
              ? "cursor-not-allowed"
              : "cursor-pointer"
          }`}
        />
      </div>
      <input
        type="text"
        placeholder={
          isCurrentUserBlocked || isReceiverBlocked
            ? "You cannot message"
            : "Type a message...."
        }
        className="grow  bg-[rgba(17,25,40,0.5)] p-3 text-sm rounded-md"
        value={text}
        onChange={(e) => setText(e.target.value)}
        disabled={isCurrentUserBlocked || isReceiverBlocked}
      />
      <div className="emoji relative">
        <img
          src="./emoji.png"
          alt=""
          className={`w-5 h-5 ${
            isReceiverBlocked || isCurrentUserBlocked
              ? "cursor-not-allowed"
              : "cursor-pointer"
          }`}
          onClick={() => setOpenEmojiContainer((prev) => !prev)}
        />
        <div className="absolute bottom-1/2 left-0">
          <EmojiPicker
            open={openEmojiContainer}
            onEmojiClick={handleEmoji}
            disabled={isCurrentUserBlocked || isReceiverBlocked}
          />
        </div>
      </div>
      <button
        className="sendBtn"
        onClick={handleSend}
        disabled={isCurrentUserBlocked || isReceiverBlocked}
      >
        Send
      </button>
    </div>
  );
}
