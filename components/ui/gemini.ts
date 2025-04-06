require('dotenv').config()

export default async function gemini(prompt = "i didnt send anyhting", instruction = "nothing") {
    try{
    const API_KEY= process.env.NEXT_PUBLIC_GEMINI_API_KEY

    const {
        GoogleGenerativeAI,
        HarmCategory,
        HarmBlockThreshold,
    } = require("@google/generative-ai");

    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    const genAI = new GoogleGenerativeAI(apiKey);
    
    const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    systemInstruction: instruction,
    });
    
    const generationConfig = {
    temperature: 1.8,
    topP: 0.95,
    topK: 64,
    maxOutputTokens: 200,
    responseMimeType: "text/plain",
    };

    console.log("i ran")
    let result = await model.generateContent(prompt);
    let resultText = await result.response.text(); 

  
    return (resultText);
  }
  catch{
    console.log("pee pee poo poo")
  }
}