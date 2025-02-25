// Import the functions you need from the SDKs you need

import { initializeApp } from "firebase/app";
import { createUserWithEmailAndPassword, getAuth, sendPasswordResetEmail, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { collection, doc, getDocs, getFirestore, query, setDoc, where } from "firebase/firestore";
import { use } from "react";
import { toast } from "react-toastify";
// TODO: Add SDKs for Firebase products that you want to use

// https://firebase.google.com/docs/web/setup#available-libraries


// Your web app's Firebase configuration

const firebaseConfig = {

  apiKey: "AIzaSyCHPmr7dTLZ_-iKEfJTdK0c2gSbwLYoDpM",

  authDomain: "chat-aap-deepak.firebaseapp.com",

  projectId: "chat-aap-deepak",

  storageBucket: "chat-aap-deepak.firebasestorage.app",

  messagingSenderId: "1082290394757",

  appId: "1:1082290394757:web:878de8a96b4692ab4ebbec"

};


// Initialize Firebase

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const signUp = async (username,email,password)=>{
    try{
        const res = await createUserWithEmailAndPassword(auth,email,password);
        const user = res.user;
        await setDoc(doc(db,"users",user.uid),{
            id:user.uid,
            username:username.toLowerCase(),
            email,
            name:"",
            avatar:"",
            bio:"Hey, there i am using chat app",
            lastSeen:Date.now()
        })
        await setDoc(doc(db,"chats",user.uid),{
            chatsData:[]
        })
    }catch(error){
        console.error(error);
        toast.error(error.code.split('/')[1].split('-').join(" "));
    }
}
const login = async (email,password)=>{
    try{
        await signInWithEmailAndPassword(auth,email,password);
    }catch(error){
        console.error(error);
        toast.error(error.code.split('/')[1].split('-').join(" "));
    }
}
const logout = async ()=>{
   try {
    await signOut(auth);
   } catch (error) {
    console.error(error);
        toast.error(error.code.split('/')[1].split('-').join(" "));
   }
}
const resetPass = async (email)=>{
    if(!email){
        toast.error("Enter your Email");
        return null;
    }
    try {
        const userRef = collection(db,'users');
        const q = query(userRef,where('email','==',email));
        const querySnap = await getDocs(q);
        if(!querySnap.empty){
            await sendPasswordResetEmail(auth,email);
            toast.success("Reset Email send");
        }else{
            toast.error("Email doesn't exst")
        }
    } catch (error) {
        console.error(error);
        toast.error(error.message);
    }
}
export {signUp,login,logout,auth,db,resetPass};