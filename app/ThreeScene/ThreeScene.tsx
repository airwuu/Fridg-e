'use client';

import { useState, useEffect, Suspense } from 'react';

import { getAuth } from 'firebase/auth';
import { getFirestore, collection, onSnapshot, doc} from 'firebase/firestore';
import { PerspectiveCamera, PointerLockControls } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';

import Banana from "./Banana";
import Orange from "./Orange";
import Apple from "./Apple"; 
import Pizza from "./Pizza";
import Water from "./Water";
import Fridge from './Fridge';

import CameraTilt from "./CameraTilt";
import DynamicLights from "./DynamicLights";
import OutlineEffect from "./OutlineEffect";

interface Item {
  id: string;
  name?: string;
  [key: string]: any;
}


const ThreeScene = () => {
  const [userLoaded, setUserLoaded] = useState(false);
  const auth = getAuth();
  const db = getFirestore();

  const [doorIsOpen, setDoorIsOpen] = useState(false);
  const [userItems, setUserItems] = useState<Item[]>([]);

  // fridge door 
  useEffect(() => {
    const db = getFirestore();
    const fridgeDocRef = doc(db, 'fridges', 'main_fridge');

    const unsubscribe = onSnapshot(
      fridgeDocRef,
      (docSnapshot) => {
        if (docSnapshot.exists()) {
          const data = docSnapshot.data();
          setDoorIsOpen(data.door_is_open === true);
        }
      },
      (error) => {
        console.error("Error fetching fridge door status:", error);
      }
    );

    return () => {
      unsubscribe();
    };
  }, []);

  // food
  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged(user => {
      if (user) {
        const itemsCollectionRef = collection(db, 'users', user.uid, 'items');

        const unsubscribeItems = onSnapshot(
          itemsCollectionRef,
          snapshot => {
            const itemsData: Item[] = snapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
            }));

            setUserItems(itemsData);
            setUserLoaded(true);
          },
          error => {
            console.error("Error fetching user items:", error);
            setUserLoaded(true);
          }
        );

        return () => unsubscribeItems();
      } else {
        setUserItems([]);
        setUserLoaded(true);
      }
    });

    return () => unsubscribeAuth();
  }, [auth, db]);

  const renderItemComponent = (item: { id: string; name?: string }) => {
    if (!item.name) return null;
    const itemName = item.name.toLowerCase();
    switch (itemName) {
      case 'banana':
        return <Banana key={item.id} />;
      case 'apple':
        return <Apple key={item.id} />;
      case 'orange':
        return <Orange key={item.id} />;
      case 'pizza':
        return <Pizza key={item.id} />;
      case 'can':
        return <Water key={item.id} />;
      default:
        return null;
    }
  };

  if (!userLoaded) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="space-x-2 flex">
          <div className="w-4 h-4 bg-foreground rounded-full animate-bounce [animation-delay:-0.3s]"></div>
          <div className="w-4 h-4 bg-foreground rounded-full animate-bounce [animation-delay:-0.15s]"></div>
          <div className="w-4 h-4 bg-foreground rounded-full animate-bounce"></div>
        </div>
      </div>
    );
  }  

  return (
    <Canvas style={{ width: '80vw', height: '80vh' }} orthographic={false}>
      <PerspectiveCamera 
        makeDefault 
        position={[-.06, -.1, -.05]} 
        rotation={[0, Math.PI / 2, 0]}>
        <CameraTilt />
      </PerspectiveCamera>
      
      <DynamicLights />
      
      <Suspense fallback={null}>
        <Fridge isOpen={doorIsOpen} />

        {userItems.map(item => renderItemComponent(item))}

        <OutlineEffect />
      </Suspense>


    </Canvas>
  );
};

export default ThreeScene;
