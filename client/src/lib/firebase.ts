// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getDatabase, ref, push, serverTimestamp, onValue, off, get, query, orderByChild, limitToLast } from "firebase/database";
import { getAnalytics } from "firebase/analytics";
import { v4 as uuidv4 } from "uuid";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCilolspxw5JrxJYJVB1uu5YA1LqFMMkYc",
  authDomain: "chat-app-ec4d7.firebaseapp.com",
  databaseURL: "https://chat-app-ec4d7-default-rtdb.firebaseio.com",
  projectId: "chat-app-ec4d7",
  storageBucket: "chat-app-ec4d7.firebasestorage.app",
  messagingSenderId: "155026489650",
  appId: "1:155026489650:web:057edf4077394316f4972b",
  measurementId: "G-2SVMEEW9LG"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
// Initialize Analytics only in browser environment
const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

// Generate a user ID if one doesn't exist in localStorage
const getUserId = () => {
  // Only run localStorage operations in browser environment
  if (typeof window === 'undefined') {
    return 'guest-' + Math.random().toString(36).substring(2, 9);
  }
  
  const storedUserId = localStorage.getItem('userId');
  if (storedUserId) {
    return storedUserId;
  }
  
  const newUserId = uuidv4();
  localStorage.setItem('userId', newUserId);
  return newUserId;
};

// Generate user information
const generateUserInfo = () => {
  // Only run localStorage operations in browser environment
  if (typeof window === 'undefined') {
    return {
      name: "Guest User",
      initials: "GU",
      userId: "guest"
    };
  }
  
  const storedUserInfo = localStorage.getItem('userInfo');
  if (storedUserInfo) {
    return JSON.parse(storedUserInfo);
  }
  
  // Generate a random name from a list of common names
  const names = [
    "Alex Morgan", "Jamie Smith", "Jordan Taylor", "Casey Johnson", 
    "Riley Davis", "Avery Wilson", "Quinn Brown", "Cameron Miller"
  ];
  
  const randomName = names[Math.floor(Math.random() * names.length)];
  const initials = randomName.split(' ').map(n => n[0]).join('');
  
  const userInfo = {
    name: randomName,
    initials: initials,
    userId: getUserId()
  };
  
  localStorage.setItem('userInfo', JSON.stringify(userInfo));
  return userInfo;
};

// Initialize user info
const userInfo = typeof window !== 'undefined' ? generateUserInfo() : {
  name: "Guest User",
  initials: "GU",
  userId: "guest"
};

// Firebase methods
export const sendMessage = async (text: string) => {
  const messagesRef = ref(database, 'messages');
  
  try {
    await push(messagesRef, {
      text,
      userId: userInfo.userId,
      userName: userInfo.name,
      userInitials: userInfo.initials,
      timestamp: serverTimestamp()
    });
    return true;
  } catch (error) {
    console.error("Error sending message:", error);
    return false;
  }
};

export const subscribeToMessages = (callback: (messages: any[]) => void) => {
  const messagesRef = ref(database, 'messages');
  const messagesQuery = query(messagesRef, orderByChild('timestamp'), limitToLast(100));
  
  onValue(messagesQuery, (snapshot) => {
    const messages: any[] = [];
    snapshot.forEach((childSnapshot) => {
      const message = {
        id: childSnapshot.key,
        ...childSnapshot.val()
      };
      messages.push(message);
    });
    
    callback(messages.sort((a, b) => {
      if (!a.timestamp) return -1;
      if (!b.timestamp) return 1;
      return a.timestamp - b.timestamp;
    }));
  });
  
  return () => off(messagesQuery);
};

export const getMessages = async () => {
  const messagesRef = ref(database, 'messages');
  const messagesQuery = query(messagesRef, orderByChild('timestamp'), limitToLast(100));
  
  try {
    const snapshot = await get(messagesQuery);
    const messages: any[] = [];
    
    snapshot.forEach((childSnapshot) => {
      const message = {
        id: childSnapshot.key,
        ...childSnapshot.val()
      };
      messages.push(message);
    });
    
    return messages.sort((a, b) => {
      if (!a.timestamp) return -1;
      if (!b.timestamp) return 1;
      return a.timestamp - b.timestamp;
    });
  } catch (error) {
    console.error("Error fetching messages:", error);
    return [];
  }
};

export const getCurrentUser = () => userInfo;
