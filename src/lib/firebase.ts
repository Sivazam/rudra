import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, collection, doc, setDoc, getDoc, getDocs, updateDoc, deleteDoc, query, where, orderBy, limit, addDoc, serverTimestamp } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyADTcaTlnTWepqB6bFuJH6WkXSh3lUVxso",
  authDomain: "rudra-bb6b7.firebaseapp.com",
  projectId: "rudra-bb6b7",
  storageBucket: "rudra-bb6b7.firebasestorage.app",
  messagingSenderId: "889150603232",
  appId: "1:889150603232:e2ae8734b6eeab6f585",
  // Add authorized domains
  authDomain: "rudra-bb6b7.firebaseapp.com",
  // Add additional authorized domains if needed
  // Note: Make sure these domains are also configured in Firebase Console
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

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

// Firebase Storage utility functions
export const storageService = {
  // Upload file to Firebase Storage
  uploadFile: async (file: File, path: string): Promise<string> => {
    try {
      console.log(`Storage: Uploading file to ${path}`);
      const storageRef = ref(storage, path);
      const snapshot = await uploadBytes(storageRef, file);
      console.log(`Storage: File uploaded successfully`);
      const downloadURL = await getDownloadURL(snapshot.ref);
      console.log(`Storage: Download URL obtained: ${downloadURL}`);
      return downloadURL;
    } catch (error) {
      console.error('Storage: Error uploading file:', error);
      throw new Error(`Failed to upload file: ${(error as any).message || 'Unknown error'}`);
    }
  },

  // Upload multiple files
  uploadFiles: async (files: File[], basePath: string): Promise<string[]> => {
    try {
      const uploadPromises = files.map(async (file, index) => {
        const fileExtension = file.name.split('.').pop();
        const fileName = `${Date.now()}_${index}.${fileExtension}`;
        const path = `${basePath}/${fileName}`;
        return await storageService.uploadFile(file, path);
      });
      
      const downloadURLs = await Promise.all(uploadPromises);
      console.log(`Storage: ${downloadURLs.length} files uploaded successfully`);
      return downloadURLs;
    } catch (error) {
      console.error('Storage: Error uploading files:', error);
      throw error;
    }
  },

  // Delete file from Firebase Storage
  deleteFile: async (path: string): Promise<void> => {
    try {
      console.log(`Storage: Deleting file from ${path}`);
      const storageRef = ref(storage, path);
      await deleteObject(storageRef);
      console.log(`Storage: File deleted successfully`);
    } catch (error) {
      console.error('Storage: Error deleting file:', error);
      throw new Error(`Failed to delete file: ${(error as any).message || 'Unknown error'}`);
    }
  },

  // Delete multiple files
  deleteFiles: async (paths: string[]): Promise<void> => {
    try {
      const deletePromises = paths.map(path => storageService.deleteFile(path));
      await Promise.all(deletePromises);
      console.log(`Storage: ${paths.length} files deleted successfully`);
    } catch (error) {
      console.error('Storage: Error deleting files:', error);
      throw error;
    }
  }
};

export default app;