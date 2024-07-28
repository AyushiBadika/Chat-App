import { useState } from "react";
import { toast } from "react-toastify";
import "./login.css";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { auth, db } from "../../lib/firebase";
import { doc, setDoc } from "firebase/firestore";
import upload from "../../lib/upload";
import { useUserStore } from "../../lib/userStore";

export default function Login() {
  const { fetchUserInfo } = useUserStore();
  const [profile, setProfile] = useState({
    file: null,
    url: "",
  });

  const [isSignUpLoading, setIsSignUpLoading] = useState(false);
  const [isSignInLoading, setIsSignInLoading] = useState(false);

  const handleImage = (e) => {
    if (e.target.files[0]) {
      setProfile({
        file: e.target.files[0],
        url: URL.createObjectURL(e.target.files[0]),
      });
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsSignUpLoading(true);
    const formData = new FormData(e.target);

    const { username, email, password } = Object.fromEntries(formData);

    try {
      const res = await createUserWithEmailAndPassword(auth, email, password);
      const imgUrl = await upload(profile?.file);

      await setDoc(doc(db, "users", res.user.uid), {
        avatar: imgUrl,
        username,
        email,
        id: res.user.uid,
        blocked: [],
      });
      await setDoc(doc(db, "userChats", res.user.uid), {
        chats: [],
      });

      toast.success("User Registered Successfully");
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    } finally {
      setIsSignUpLoading(false);
      e.target.email.value = "";
      e.target.password.value = "";
      e.target.username.value = "";
      setProfile({ file: null, url: "" });
    }
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    setIsSignInLoading(true);

    const formData = new FormData(e.target);
    const { email, password } = Object.fromEntries(formData);

    try {
      const loginResponse = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      fetchUserInfo(loginResponse.user.uid);
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    } finally {
      setIsSignInLoading(false);
      e.target.email = "";
    }
  };

  return (
    <div className="flex w-full h-full items-center ">
      <div className="signIn login ">
        <h2>Welcome back,</h2>
        <form action="" onSubmit={handleSignIn}>
          <input
            type="text"
            placeholder="Email"
            autoComplete="true"
            name="email"
          />
          <input
            type="password"
            placeholder="Password"
            autoComplete="true"
            name="password"
          />
          <button type="submit" disabled={isSignInLoading}>
            {isSignInLoading ? "Loading" : "Sign In"}
          </button>
        </form>
      </div>
      <div className="separator"></div>
      <div className="signUp login ">
        <h2>Create an Account</h2>
        <form action="" onSubmit={handleRegister}>
          <label htmlFor="profileImage">
            <img src={profile.url || "./avatar.png"} alt="" />
            Upload an image
          </label>
          <input
            type="file"
            id="profileImage"
            className="hidden"
            onChange={handleImage}
          />

          <input
            type="text"
            placeholder="Username"
            name="username"
            autoComplete="true"
          />
          <input
            type="text"
            placeholder="Email"
            name="email"
            autoComplete="true"
          />
          <input type="password" placeholder="Password" name="password" />
          <button type="submit" disabled={isSignUpLoading}>
            {isSignUpLoading ? "Loading" : "Sign Up"}
          </button>
        </form>
      </div>
    </div>
  );
}
