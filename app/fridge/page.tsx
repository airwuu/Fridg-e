"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { getAuth } from 'firebase/auth';
import { getFirestore, collection, doc, addDoc, deleteDoc, getDocs } from 'firebase/firestore';
import { differenceInDays, parseISO, format, isValid } from 'date-fns';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Search, Trash2, ArrowUp, ArrowDown } from 'lucide-react';
import Navbar from "@/components/navbar";

interface Item {
  id: string;
  name: string;
  calories?: string;
  carbon?: string;
  date_added?: string;
  expiration?: string;
}

type SortKey = 'name' | 'calories' | 'date_added' | 'expiration' | 'carbon' | null;

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
  const [sortKey, setSortKey] = useState<SortKey>('date_added');
  const [sortAscending, setSortAscending] = useState<boolean>(true);

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
      } catch (error) {
        console.error("Error fetching items:", error);
        setItems([]);
      } finally {
        setLoading(false);
      }
    } else {
      setItems([]);
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
    let processedItems = [...items];

    if (sortKey) {
      processedItems.sort((a, b) => {
        const valA = a[sortKey];
        const valB = b[sortKey];

        let comparison = 0;

        if (sortKey === 'name') {
          comparison = (valA || '').toLowerCase().localeCompare((valB || '').toLowerCase());
        } else if (sortKey === 'calories' || sortKey === 'carbon') {
          const numA = parseFloat(valA || '0') || 0;
          const numB = parseFloat(valB || '0') || 0;
          comparison = numA - numB;
        } else if (sortKey === 'date_added' || sortKey === 'expiration') {
          const dateA = valA ? parseISO(valA) : null;
          const dateB = valB ? parseISO(valB) : null;

          const timeA = dateA && isValid(dateA) ? dateA.getTime() : 0;
          const timeB = dateB && isValid(dateB) ? dateB.getTime() : 0;

          if (timeA === 0 && timeB === 0) comparison = 0;
          else if (timeA === 0) comparison = 1;
          else if (timeB === 0) comparison = -1;
          else comparison = timeA - timeB;
        }

        return sortAscending ? comparison : comparison * -1;
      });
    }

    if (searchTerm) {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      processedItems = processedItems.filter(item =>
        item.name.toLowerCase().includes(lowerCaseSearchTerm)
      );
    }

    setFilteredItems(processedItems);
  }, [items, searchTerm, sortKey, sortAscending]);

  const handleAddItem = async () => {
    if (!auth.currentUser || !newItemName.trim()) {
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
       if (!isValid(expirationDate)) {
          return "Invalid date format";
       }
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

   const handleSortChange = (key: SortKey) => {
    if (sortKey === key) {
      setSortAscending(!sortAscending);
    } else {
      setSortKey(key);
      setSortAscending(true);
    }
  };

  const getSortIndicator = (key: SortKey) => {
    if (sortKey === key) {
      return sortAscending ? <ArrowUp className="h-4 w-4 ml-2" /> : <ArrowDown className="h-4 w-4 ml-2" />;
    }
    return null;
  };


  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading items...</div>;
  }

  return (
    <div className="min-h-screen bg-background text-foreground pb-4 px-4 md:p-8">
      <div className="md:-translate-y-6">
        <Navbar/>
      </div>
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
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center">
                Sort By: {sortKey ? sortKey.replace('_', ' ') : 'Select'}
                {getSortIndicator(sortKey)}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Sort Criteria</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleSortChange('calories')} className="flex justify-between">
                Calories {getSortIndicator('calories')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSortChange('date_added')} className="flex justify-between">
                Date Added {getSortIndicator('date_added')}
              </DropdownMenuItem>
               <DropdownMenuItem onClick={() => handleSortChange('expiration')} className="flex justify-between">
                Expiration Date {getSortIndicator('expiration')}
              </DropdownMenuItem>
               <DropdownMenuItem onClick={() => handleSortChange('carbon')} className="flex justify-between">
                Carbon {getSortIndicator('carbon')}
              </DropdownMenuItem>
               <DropdownMenuSeparator />
               <DropdownMenuItem onClick={() => setSortAscending(!sortAscending)} className="flex justify-between">
                 Reverse Order {sortAscending ? <ArrowDown className="h-4 w-4 ml-2" /> : <ArrowUp className="h-4 w-4 ml-2" /> }
               </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
      </div>
      <div className="mb-8">
        {filteredItems.length === 0 ? (
          <div className="text-center text-muted-foreground mt-10">
            {items.length > 0 ? 'No items match your search or sort criteria.' : (<p>{auth.currentUser ? 'Your fridge is empty. Add some items below!' : 'Log in to see your fridge content' }</p>)}
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
                    {/* <CardDescription className="text-xs">
                     Added: {(() => {
                       if (!item.date_added) return 'N/A';
                       const parsedDate = parseISO(item.date_added);
                       return isValid(parsedDate) ? format(parsedDate, 'MMM d, yyyy') : 'Invalid Date';
                     })()}
                   </CardDescription> */}
                       </span>
                    )}
                  </div>
                  <CardDescription>
                    {getExpirationText(item.expiration)}
                  </CardDescription>
                  <CardDescription className="text-xs">
                     Added: {(() => {
                       if (!item.date_added) return 'N/A';
                       const parsedDate = parseISO(item.date_added);
                       return isValid(parsedDate) ? format(parsedDate, 'MMM d, yyyy') : 'Invalid Date';
                     })()}
                   </CardDescription>
                   
                   {item.carbon &&
                      <CardDescription className="text-xs">
                        Carbon: {item.carbon}
                      </CardDescription>
                   }
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
      {auth.currentUser ? 
      <Card className="mt-10">
        <CardHeader>
          <CardTitle>Manually Add Item</CardTitle>
          <CardDescription>Enter the details of the item you want to add.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="newItemName">Name</Label>
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
                type="date"
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
                placeholder="e.g., 0.1 kg CO2e or 100"
                value={newItemCarbon}
                onChange={e => setNewItemCarbon(e.target.value)}
              />
            </div> */}
        </CardContent>
        <CardFooter>
          <Button onClick={handleAddItem} disabled={!newItemName.trim()}>Add Item</Button>
        </CardFooter>
      </Card>:""}
    </div>
  );
}

export default UserItems;