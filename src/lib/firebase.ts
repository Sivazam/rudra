import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, collection, doc, setDoc, getDoc, getDocs, updateDoc, deleteDoc, query, where, orderBy, limit, addDoc, serverTimestamp } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyADTcaTlnTWepqB6bFuJH6WkXSh3lUVxso",
  authDomain: "rudra-bb6b7.firebaseapp.com",
  projectId: "rudra-bb6b7",
  storageBucket: "rudra-bb6b7.firebasestorage.app",
  messagingSenderId: "889150603232",
  appId: "1:889150603232:e2ae8734b6eeab6f585"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Firestore utility functions
export const firestoreService = {
  // Generic CRUD operations
  create: async (collectionName: string, data: any, id?: string) => {
    try {
      console.log(`Firestore: Creating document in collection ${collectionName}`);
      if (id) {
        await setDoc(doc(db, collectionName, id), {
          ...data,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        console.log(`Firestore: Document created with ID ${id}`);
        return id;
      } else {
        const docRef = await addDoc(collection(db, collectionName), {
          ...data,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        console.log(`Firestore: Document created with ID ${docRef.id}`);
        return docRef.id;
      }
    } catch (error) {
      console.error('Firestore: Error creating document:', error);
      console.error('Firestore: Error details:', {
        name: (error as any).name,
        message: (error as any).message,
        stack: (error as any).stack,
        code: (error as any).code
      });
      throw new Error(`Failed to create document: ${(error as any).message || 'Unknown error'}`);
    }
  },

  getById: async (collectionName: string, id: string) => {
    const docRef = doc(db, collectionName, id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    }
    return null;
  },

  getAll: async (collectionName: string, options?: { where?: { field: string; operator: any; value: any }; orderBy?: { field: string; direction: 'asc' | 'desc' }; limit?: number }) => {
    let q = collection(db, collectionName);
    
    if (options?.where) {
      q = query(q, where(options.where.field, options.where.operator, options.where.value));
    }
    
    if (options?.orderBy) {
      q = query(q, orderBy(options.orderBy.field, options.orderBy.direction));
    }
    
    if (options?.limit) {
      q = query(q, limit(options.limit));
    }
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  update: async (collectionName: string, id: string, data: any) => {
    const docRef = doc(db, collectionName, id);
    await updateDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp()
    });
  },

  delete: async (collectionName: string, id: string) => {
    await deleteDoc(doc(db, collectionName, id));
  },

  // Query helpers
  query: async (collectionName: string, queries: any[]) => {
    let q = collection(db, collectionName);
    queries.forEach(queryOption => {
      if (queryOption.type === 'where') {
        q = query(q, where(queryOption.field, queryOption.operator, queryOption.value));
      } else if (queryOption.type === 'orderBy') {
        q = query(q, orderBy(queryOption.field, queryOption.direction));
      } else if (queryOption.type === 'limit') {
        q = query(q, limit(queryOption.value));
      }
    });
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }
};

export default app;