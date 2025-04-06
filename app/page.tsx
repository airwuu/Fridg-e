"use client"

import Image from "next/image";
import Link from "next/link" 
import { useRouter } from "next/navigation";

import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged, type User } from "firebase/auth"
import { initializeApp, getApps, getApp } from "firebase/app"
import Navbar from "@/components/navbar"
import { motion } from "framer-motion"

import ThreeScene from "./ThreeScene/ThreeScene";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

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

  const router = useRouter();

  return (
    <>
      <Navbar />
      <div className="min-h-screen p-8 pb-20 sm:p-20">
        <div className="grid grid-cols-2 gap-16 items-center justify-items-center font-[family-name:var(--font-geist-sans)]">

          <div className="w-full h-full -translate-x-10 md:translate-x-0">
            <ThreeScene />
          </div>

          <div className="flex flex-col gap-3 items-center order-1 md:order-2 min-h-[500px]">
          {/* logo */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Image
                src="/fridge.png"
                alt="Logo"
                width={180}
                height={60}
                priority
                className="w-full h-auto"
              />
            </motion.div>

            {/* text */}
            <motion.div
              className="-mt-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Image
                src="/title.png"
                alt="Logo"
                width={180}
                height={60}
                priority
                className="w-full h-auto"
              />
            </motion.div>

            <div className="h-2" />

            {/* button */}
            <Link href="/fridge">
              <motion.div
                className="relative z-10 mt-4 px-6 py-3 bg-foreground text-background rounded-full font-medium hover:bg-[#383838] dark:hover:bg-[#ccc] transition-colors"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
              >
                Open My Fridge
              </motion.div>
            </Link>

          </div>
        </div>
      </div>
    </>
  );
}
