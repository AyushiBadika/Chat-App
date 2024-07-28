import { useEffect } from "react";
import Chat from "./components/chat/Chat";
import Details from "./components/details/Details";
import List from "./components/list/List";
import Login from "./components/login/Login";
import Notification from "./components/notification/Notification";
import { useUserStore } from "./lib/userStore";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./lib/firebase";
import { useChatStore } from "./lib/chatStore";

const App = () => {
  const { currentUser, isLoading, fetchUserInfo } = useUserStore();
  const { chatId } = useChatStore();

  useEffect(() => {
    const unSub = onAuthStateChanged(auth, (user) => {
      fetchUserInfo(user?.uid);

      return () => {
        unSub();
      };
    });
  }, [auth]);

  if (isLoading)
    return (
      <div className="p-8 bg-[rgba(17,25,40,0.9)] rounded text-3xl text-white">
        Loading...
      </div>
    );
  return (
    <div className="blurEffect w-[90vw] h-[90vh] bg-[rgba(17,25,40,0.75)] rounded-md  text-white flex ">
      {currentUser ? (
        <>
          <List />
          {chatId && <Chat />}
          {chatId && <Details />}
        </>
      ) : (
        <Login />
      )}
      <Notification />
    </div>
  );
};

export default App;
