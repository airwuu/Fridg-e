"use client"
import Image from "next/image";
import Navbar from "@/components/navbar"
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged, type User } from "firebase/auth"
import { initializeApp, getApps, getApp } from "firebase/app"
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

import ThreeScene from "./ThreeScene/ThreeScene";

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp()
const auth = getAuth(app)
const googleProvider = new GoogleAuthProvider()

export default function Home() {
  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider)
    } catch (error) {
      console.error("Error signing in:", error)
    }
  }
  return (
    <>
    <Navbar/>
    <div>
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">

      <div className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start border-8 border-red w-full h-full">
        <ThreeScene />
          
      </div>

        <div className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
          <Image
            className="dark:invert"
            src="/next.svg"
            alt="Next.js logo"
            width={180}
            height={38}
            priority
          />
          <ol className="list-inside list-decimal text-sm/6 text-center sm:text-left font-[family-name:var(--font-geist-mono)]">
            <li className="mb-2 tracking-[-.01em]">
              uwu fridge stuff
            </li>
            <li className="tracking-[-.01em]">
              wow save bunch of food by actually eating
            </li>
          </ol>

          <div className="flex gap-4 items-center flex-col sm:flex-row">
            <a
              className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:w-auto"
              onClick={handleLogin}
            >
              <Image
                className="dark:invert"
                src="/vercel.svg"
                alt="Vercel logomark"
                width={20}
                height={20}
              />
              Sign Up
            </a>

          </div>
        </div>
      
      </div>
    
    </div>
    </>
  );
}
