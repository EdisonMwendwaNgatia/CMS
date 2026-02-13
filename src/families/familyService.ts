import type { Family } from './familyTypes';
import { 
  collection, 
  addDoc, 
  doc, 
  updateDoc, 
  deleteDoc, 
  serverTimestamp, 
  getDocs, 
  query,
  onSnapshot,
  where,
  arrayUnion,
  arrayRemove,
  type UpdateData, 
  type DocumentData 
} from 'firebase/firestore';
import { db } from '../firebase/firebase';

// Keep an in-memory cache for existing UI code (sync reads)
let families: Family[] = [];

// Get all families (sync from cache)
export const getFamilies = (): Family[] => families;

// Get family by ID (sync from cache)
export const getFamilyById = (id: string): Family | undefined =>
  families.find(f => f.id === id);

// Subscribe to real-time family updates
export const subscribeToFamilies = (callback: (families: Family[]) => void) => {
  const q = query(collection(db, 'families'));
  
  const unsubscribe = onSnapshot(q, (snapshot) => {
    const fetchedFamilies = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Family[];
    
    // Update cache
    families = fetchedFamilies;
    
    // Trigger callback
    callback(fetchedFamilies);
  }, (error) => {
    console.error('Error subscribing to families:', error);
  });
  
  return unsubscribe;
};

// Load families from Firestore (initial load)
export const loadFamilies = async (): Promise<Family[]> => {
  try {
    const q = query(collection(db, 'families'));
    const snapshot = await getDocs(q);
    const fetchedFamilies = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Family[];
    
    // Update cache
    families = fetchedFamilies;
    
    return fetchedFamilies;
  } catch (error) {
    console.error('Error loading families:', error);
    return [];
  }
};

// Add family to Firestore
export const addFamily = async (family: Omit<Family, 'id'>) => {
  try {
    const familiesRef = collection(db, 'families');
    const payload = {
      ...family,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    
    const docRef = await addDoc(familiesRef, payload);
    
    // Create the family with the Firestore-generated ID
    const newFamily = { id: docRef.id, ...family } as Family;
    
    // Update cache
    families = [...families, newFamily];
    
    return newFamily;
  } catch (err) {
    console.error('Error adding family to Firestore:', err);
    throw err;
  }
};

// Update family in Firestore
export const updateFamily = async (id: string, updated: Partial<Family>) => {
  try {
    const ref = doc(db, 'families', id);
    const updatePayload = {
      ...updated,
      updatedAt: serverTimestamp()
    } as UpdateData<DocumentData>;
    
    await updateDoc(ref, updatePayload);
    
    // Update cache
    families = families.map(f => 
      f.id === id ? { ...f, ...updated } : f
    );
    
    return true;
  } catch (err) {
    console.error('Error updating family in Firestore:', err);
    throw err;
  }
};

// Delete family from Firestore
export const removeFamily = async (id: string) => {
  try {
    const ref = doc(db, 'families', id);
    await deleteDoc(ref);
    
    // Update cache
    families = families.filter(f => f.id !== id);
    
    return true;
  } catch (err) {
    console.error('Error removing family from Firestore:', err);
    throw err;
  }
};

// Link member to family
export const linkMemberToFamily = async (
  familyId: string,
  membershipNumber: string,
  relationship: Family['members'][number]['relationship']
) => {
  try {
    const ref = doc(db, 'families', familyId);
    
    const memberLink = {
      membershipNumber: membershipNumber.toUpperCase(),
      relationship
    };
    
    await updateDoc(ref, {
      members: arrayUnion(memberLink),
      updatedAt: serverTimestamp()
    });
    
    // Update cache
    families = families.map(f =>
      f.id === familyId
        ? {
            ...f,
            members: [
              ...f.members.filter(m => m.membershipNumber !== membershipNumber),
              memberLink
            ]
          }
        : f
    );
    
    return true;
  } catch (err) {
    console.error('Error linking member to family:', err);
    throw err;
  }
};

// Unlink member from family
export const unlinkMemberFromFamily = async (familyId: string, membershipNumber: string) => {
  try {
    const ref = doc(db, 'families', familyId);
    
    // Get current family to find the member to remove
    const family = families.find(f => f.id === familyId);
    const memberToRemove = family?.members.find(
      m => m.membershipNumber === membershipNumber
    );
    
    if (!memberToRemove) return false;
    
    await updateDoc(ref, {
      members: arrayRemove(memberToRemove),
      updatedAt: serverTimestamp()
    });
    
    // Update cache
    families = families.map(f =>
      f.id === familyId
        ? { ...f, members: f.members.filter(m => m.membershipNumber !== membershipNumber) }
        : f
    );
    
    return true;
  } catch (err) {
    console.error('Error unlinking member from family:', err);
    throw err;
  }
};

// Search families by name
export const searchFamilies = async (searchTerm: string): Promise<Family[]> => {
  try {
    const q = query(
      collection(db, 'families'),
      where('familyName', '>=', searchTerm),
      where('familyName', '<=', searchTerm + '\uf8ff')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Family[];
  } catch (err) {
    console.error('Error searching families:', err);
    return [];
  }
};