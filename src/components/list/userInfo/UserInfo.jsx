import { useState } from "react";
import { useUserStore } from "../../../lib/userStore";
import { auth } from "../../../lib/firebase";

export default function UserInfo() {
  const { currentUser } = useUserStore();
  const [open, setOpen] = useState(false);
  console.log(open);
  return (
    <div className="p-5 flex justify-between items-center">
      <div className="flex items-center gap-4">
        <img
          src={currentUser?.avatar || "./avatar.png"}
          alt=""
          className="w-12 h-12 rounded-full object-cover"
        />
        <h2>{currentUser?.username}</h2>
      </div>
      <div className="flex gap-2 items-center relative">
        <img
          src="./more.png"
          alt=""
          className="w-5 h-5 cursor-pointer"
          onClick={() => setOpen(!open)}
        />
        <div
          className={`${
            !open && "hidden"
          }  logout p-4 bg-[rgba(17,25,40,0.8)] rounded text-xl text-white absolute top-3/4 right-1/4`}
        >
          <button onClick={() => auth.signOut()}>Logout</button>
        </div>
        <img src="./video.png" alt="" className="w-5 h-5 cursor-pointer" />
        <img src="./edit.png" alt="" className="w-5 h-5 cursor-pointer" />
      </div>
    </div>
  );
}
