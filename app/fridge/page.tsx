"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { getAuth } from 'firebase/auth';
import { getFirestore, collection, doc, addDoc, deleteDoc, getDocs } from 'firebase/firestore';
import { differenceInDays, parseISO, format } from 'date-fns';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { Search, Trash2 } from 'lucide-react';
import Navbar from "@/components/navbar";

interface Item {
  id: string;
  name: string;
  calories?: string; 
  carbon?: string;   
  date_added?: string; 
  expiration?: string; 
}

function UserItems() {
  const [items, setItems] = useState<Item[]>([]);
  const [filteredItems, setFilteredItems] = useState<Item[]>([]); 
  const [newItemName, setNewItemName] = useState('');
  const [newItemCalories, setNewItemCalories] = useState('');
  const [newItemCarbon, setNewItemCarbon] = useState('');
  const [newItemDateAdded, setNewItemDateAdded] = useState(''); 
  const [newItemExpiration, setNewItemExpiration] = useState(''); 
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [userName, setUserName] = useState<string | null>(null);
  const [userPhotoURL, setUserPhotoURL] = useState<string | null>(null);

  const auth = getAuth();
  const db = getFirestore();

  const fetchItems = useCallback(async () => {
    setLoading(true);
    if (auth.currentUser) {
      const userId = auth.currentUser.uid;
      setUserName(auth.currentUser.displayName || auth.currentUser.email);
      setUserPhotoURL(auth.currentUser.photoURL);

      const itemsCollectionRef = collection(db, 'users', userId, 'items');
      try {
        const snapshot = await getDocs(itemsCollectionRef);
        const itemsData: Item[] = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Item));
        setItems(itemsData);
        setFilteredItems(itemsData); 
      } catch (error) {
        console.error("Error fetching items:", error);
        setItems([]);
        setFilteredItems([]);
      } finally {
        setLoading(false);
      }
    } else {
      setItems([]);
      setFilteredItems([]);
      setUserName(null);
      setUserPhotoURL(null);
      setLoading(false);
    }
  }, [auth, db]);

  useEffect(() => {
    fetchItems();
    const unsubscribe = auth.onAuthStateChanged((user) => {
      fetchItems(); 
    });
    return () => unsubscribe();
  }, [fetchItems]); 

  useEffect(() => {
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    const filtered = items.filter(item =>
      item.name.toLowerCase().includes(lowerCaseSearchTerm)
    );
    setFilteredItems(filtered);
  }, [searchTerm, items]);

  const handleAddItem = async () => {
    if (!auth.currentUser || !newItemName.trim()) {
      console.log("No user logged in or item name is empty");
      return;
    }
    const userId = auth.currentUser.uid;
    const itemsCollectionRef = collection(db, 'users', userId, 'items');
    try {
      await addDoc(itemsCollectionRef, {
        name: newItemName.trim(),
        calories: newItemCalories.trim() || null, 
        carbon: newItemCarbon.trim() || null,
        date_added: newItemDateAdded.trim() || format(new Date(), 'yyyy-MM-dd'), 
        expiration: newItemExpiration.trim() || null,
      });

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

  const getExpirationText = (expirationDateString?: string): string => {
    if (!expirationDateString) {
      return "No expiration date";
    }
    try {
      const expirationDate = parseISO(expirationDateString);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const daysUntilExpiration = differenceInDays(expirationDate, today);

      if (daysUntilExpiration < 0) {
        return `Expired ${Math.abs(daysUntilExpiration)} days ago`;
      } else if (daysUntilExpiration === 0) {
        return "Expires today";
      } else if (daysUntilExpiration === 1) {
        return "Expires tomorrow";
      } else {
        return `Expires in ${daysUntilExpiration} days`;
      }
    } catch (error) {
      console.error("Error parsing expiration date:", error);
      return "Invalid date"; 
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading items...</div>;
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-4 md:p-8">
      <Navbar/>
      <div className="mb-5"/>
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-grow">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search for item here..."
            className="pl-8 w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button variant="outline">Sort</Button>
      </div>
      <div className="mb-8">
        {filteredItems.length === 0 ? (
          <div className="text-center text-muted-foreground mt-10">
            {items.length > 0 ? 'No items match your search.' : 'Your fridge is empty. Add some items below!'}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredItems.map(item => (
              <Card key={item.id} className="flex flex-col justify-between">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start gap-2">
                    <CardTitle className="text-lg">{item.name}</CardTitle>
                    {item.calories && (
                       <span className="text-sm text-muted-foreground whitespace-nowrap">
                         {item.calories} cal
                       </span>
                    )}
                  </div>
                  <CardDescription>
                    {getExpirationText(item.expiration)}
                  </CardDescription>
                </CardHeader>
                <CardFooter className="pt-2">
                     <Button
                       variant="ghost"
                       size="icon"
                       className="ml-auto text-destructive hover:text-destructive-foreground hover:bg-destructive"
                       onClick={() => handleDeleteItem(item.id)}
                       aria-label={`Delete ${item.name}`}
                     >
                       <Trash2 className="h-4 w-4" />
                     </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
      <Card className="mt-10">
        <CardHeader>
          <CardTitle>Add New Item</CardTitle>
          <CardDescription>Enter the details of the item you want to add.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="newItemName">Name *</Label>
              <Input
                id="newItemName"
                type="text"
                placeholder="e.g., Apple, Milk"
                value={newItemName}
                onChange={e => setNewItemName(e.target.value)}
                required
              />
            </div>
             <div className="space-y-2">
              <Label htmlFor="newItemCalories">Calories</Label>
              <Input
                id="newItemCalories"
                type="number" 
                placeholder="e.g., 95"
                value={newItemCalories}
                onChange={e => setNewItemCalories(e.target.value)}
              />
            </div>
          </div>
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="newItemDateAdded">Date Added</Label>
              <Input
                id="newItemDateAdded"
                type="date" 
                value={newItemDateAdded}
                onChange={e => setNewItemDateAdded(e.target.value)}
                placeholder="YYYY-MM-DD"
              />
               <p className="text-xs text-muted-foreground">Defaults to today if left empty.</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="newItemExpiration">Expiration Date</Label>
              <Input
                id="newItemExpiration"
                type="date" // Use date type for better UX
                placeholder="YYYY-MM-DD"
                value={newItemExpiration}
                onChange={e => setNewItemExpiration(e.target.value)}
              />
                 <p className="text-xs text-muted-foreground">Format: YYYY-MM-DD</p>
            </div>
           </div>
            
            {/* <div className="space-y-2">
              <Label htmlFor="newItemCarbon">Carbon Footprint</Label>
              <Input
                id="newItemCarbon"
                type="text"
                placeholder="e.g., 0.1 kg CO2e"
                value={newItemCarbon}
                onChange={e => setNewItemCarbon(e.target.value)}
              />
            </div> */}
            
        </CardContent>
        <CardFooter>
          <Button onClick={handleAddItem} disabled={!newItemName.trim()}>Add Item</Button>
        </CardFooter>
      </Card>
    </div>
  );
}

export default UserItems;