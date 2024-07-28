import ChatList from "./chatlist/ChatList";
import UserInfo from "./userInfo/UserInfo";

export default function List() {
  return (
    <div className="grow ">
      <UserInfo />
      <ChatList />
    </div>
  );
}
