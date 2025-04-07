"use client";
import React, { useState, useEffect } from "react";
import { getAuth } from 'firebase/auth';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

import gemini from '../../components/ui/gemini'; 

interface Item {
  id: string;
  name: string;
  date_added?: string;
}

const GeminiRecipeGenerator = () => {
  const [recipe, setRecipe] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const auth = getAuth();
  const db = getFirestore();

  useEffect(() => {
    const fetchOldestFoodsAndGenerateRecipe = async () => {
      setLoading(true);

      if (!auth.currentUser) {
        setLoading(false);
        return;
      }

      const userId = auth.currentUser.uid;
      const itemsCollectionRef = collection(db, 'users', userId, 'items');

      const snapshot = await getDocs(itemsCollectionRef);
      const itemsData: Item[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      } as Item)).filter(item => item.date_added); 

      const oldestFoods = itemsData.sort((a, b) => {
        const dateA = new Date(a.date_added || '');
        const dateB = new Date(b.date_added || '');
        return dateA.getTime() - dateB.getTime();
      });

      // top 3 oldest foods
      const oldestFoodNames = oldestFoods.slice(0, 4).map(item => item.name);

      if (oldestFoodNames.length === 0) {
        setRecipe("Your fridge is empty! Place something in your fridge to start.");
        setLoading(false);
        return;
      }
      const prompt = `Give me a recipe using these foods: ${oldestFoodNames.join(', ')}. Be terse. Be formal. Make the best yummy recipe (you can omit some of the ingredients). If there are nonsensical inappropriate items, ignore them. Minimize whitespace. Format it with the recipe name, then followed by "Ingredients:", followed by a bulletpoint list of all the ingredients (use - to start the bulletpoint). After that, write the steps, numbered, 1, 2, 3, and so forth. You may use salt, sugar, and other common ingredients, but nothing else. DO NOT USE ANY FORMATTING, SPECIAL CHARACTERS, OR ELSE I WILL DIE!`;

      const geminiResponse = await gemini(prompt);
      setRecipe(String(geminiResponse));
      setLoading(false);
    };

    fetchOldestFoodsAndGenerateRecipe();
  }, [auth, db, gemini]); 

  if (loading) {
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
    <div>
      <div className="whitespace-pre-wrap">{recipe}</div>
    </div>
  );
};

export default GeminiRecipeGenerator;