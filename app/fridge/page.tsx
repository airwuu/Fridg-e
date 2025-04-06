"use client"
import React, { useState, useEffect, useCallback } from 'react';
import { getAuth } from 'firebase/auth';
import { getFirestore, collection, doc, addDoc, deleteDoc, getDocs } from 'firebase/firestore';
import Navbar from "@/components/navbar"

interface Item {
  id: string; 
  name: string;
  calories: string;
  carbon: string;
  date_added: string;
  expiration: string;
}

function UserItems() {
  const [items, setItems] = useState<Item[]>([]);
  const [newItemName, setNewItemName] = useState('');
  const [newItemCalories, setNewItemCalories] = useState('');
  const [newItemCarbon, setNewItemCarbon] = useState('');
  const [newItemDateAdded, setNewItemDateAdded] = useState('');
  const [newItemExpiration, setNewItemExpiration] = useState('');
  const [loading, setLoading] = useState(true);
  const auth = getAuth();
  const db = getFirestore();

  const fetchItems = useCallback(async () => {
    setLoading(true);
    if (auth.currentUser) {
      const userId = auth.currentUser.uid;
      const itemsCollectionRef = collection(db, 'users', userId, 'items');
      try {
        const snapshot = await getDocs(itemsCollectionRef);
        const itemsData: Item[] = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Item));
        setItems(itemsData);
      } catch (error) {
        console.error("Error fetching items:", error);
      } finally {
        setLoading(false);
      }
    } else {
      setItems([]);
      setLoading(false);
    }
  }, [auth, db]);

  useEffect(() => {
    fetchItems();
    const unsubscribe = auth.onAuthStateChanged(() => {
      fetchItems();
    });
    return () => unsubscribe();
  }, [auth, db, fetchItems]); // rerender on auth changes i think

  const handleAddItem = async () => {
    if (!auth.currentUser) {
      console.log("No user logged in");
      return;
    }
    const userId = auth.currentUser.uid;
    const itemsCollectionRef = collection(db, 'users', userId, 'items');
    try {
      if(newItemName.length > 0){
        await addDoc(itemsCollectionRef, {
            name: newItemName,
            calories: newItemCalories,
            carbon: newItemCarbon,
            date_added: newItemDateAdded,
            expiration: newItemExpiration
          });
      }
      setNewItemName('');
      setNewItemCalories('');
      setNewItemCarbon('');
      setNewItemDateAdded('');
      setNewItemExpiration('');
      await fetchItems();
    } catch (error) {
      console.error("Error adding item:", error);
    }
  };
  const handleDeleteItem = async (itemId: string) => {
    if (!auth.currentUser) {
      console.log("No user logged in");
      return;
    }
    const userId = auth.currentUser.uid;
    const itemDocRef = doc(db, 'users', userId, 'items', itemId);

    try {
      await deleteDoc(itemDocRef);
      await fetchItems();
    } catch (error) {
      console.error("Error deleting item:", error);
    }
  };
  if (loading) {
    return <div>Loading items...</div>;
  }
  return (
    <div>
        <Navbar/>
      <h2>Your Items</h2>
      {items.length === 0 ? (
        <div>No items yet. Add some below!</div>
      ) : (
        <ul>
          {items.map(item => (
            <li key={item.id}>
              {item.name} (Calories: {item.calories}, Carbon: {item.carbon}, Date Added: {item.date_added}, Expiration: {item.expiration})
              <button onClick={() => handleDeleteItem(item.id)}>Delete</button>
            </li>
          ))}
        </ul>
      )}
      <h3>Add New Item</h3>
      <input
        type="text"
        placeholder="Name"
        value={newItemName}
        onChange={e => setNewItemName(e.target.value)}
      />
      <input
        type="text"
        placeholder="Calories"
        value={newItemCalories}
        onChange={e => setNewItemCalories(e.target.value)}
      />
      <input
        type="text"
        placeholder="Carbon"
        value={newItemCarbon}
        onChange={e => setNewItemCarbon(e.target.value)}
      />
      <input
        type="text"
        placeholder="Date Added"
        value={newItemDateAdded}
        onChange={e => setNewItemDateAdded(e.target.value)}
      />
      <input
        type="text"
        placeholder="Expiration"
        value={newItemExpiration}
        onChange={e => setNewItemExpiration(e.target.value)}
      />
      <button onClick={handleAddItem}>Add Item</button>
    </div>
  );
}

export default UserItems;
