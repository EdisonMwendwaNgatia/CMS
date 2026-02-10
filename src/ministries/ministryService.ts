import {
  collection,
  doc,
  serverTimestamp,
  getDocs,
  getDoc,
  query,
  orderBy,
  onSnapshot,
  updateDoc,
  addDoc,
  deleteDoc,
  increment,
  arrayUnion,
  arrayRemove,
  where,
} from "firebase/firestore";
import { db } from "../firebase/firebase";
import type { Ministry, MinistryInput, MinistryMember } from "./ministryTypes";

export function validateMinistryData(data: MinistryInput): string[] {
  const errors: string[] = [];
  if (!data.name?.trim()) errors.push("Ministry name is required");
  if (!data.description?.trim()) errors.push("Description is required");
  if (!data.leaderName?.trim()) errors.push("Leader name is required");
  if (!data.leaderEmail?.trim()) errors.push("Leader email is required");
  if (!data.meetingDay?.trim()) errors.push("Meeting day is required");
  if (!data.meetingTime?.trim()) errors.push("Meeting time is required");
  if (!data.meetingLocation?.trim()) errors.push("Meeting location is required");
  
  // Email validation
  if (data.leaderEmail && !/^\S+@\S+\.\S+$/.test(data.leaderEmail)) {
    errors.push("Leader email format is invalid");
  }
  
  return errors;
}

export async function addMinistry(data: MinistryInput) {
  const validationErrors = validateMinistryData(data);
  if (validationErrors.length > 0) {
    throw new Error(validationErrors.join(", "));
  }
  
  const ministryRef = collection(db, "ministries");
  const ministryData = {
    ...data,
    name: data.name.trim(),
    description: data.description.trim(),
    leaderName: data.leaderName.trim(),
    leaderEmail: data.leaderEmail.toLowerCase().trim(),
    meetingDay: data.meetingDay.trim(),
    meetingTime: data.meetingTime.trim(),
    meetingLocation: data.meetingLocation.trim(),
    memberCount: 0, // Start with 0 members
    members: [], // Initialize empty members array
    createdAt: serverTimestamp(),
  };
  
  await addDoc(ministryRef, ministryData);
}

export async function getMinistries() {
  const q = query(collection(db, "ministries"), orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Ministry[];
}

export function subscribeToMinistries(
  callback: (ministries: Ministry[]) => void
) {
  const q = query(collection(db, "ministries"), orderBy("createdAt", "desc"));
  const unsubscribe = onSnapshot(q, (snapshot) => {
    const items = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Ministry[];
    callback(items);
  });
  return unsubscribe;
}

export function subscribeToMinistry(
  id: string,
  callback: (ministry: Ministry | null) => void
) {
  if (!id) {
    callback(null);
    return () => {};
  }
  
  const ministryRef = doc(db, "ministries", id);
  
  const unsubscribe = onSnapshot(ministryRef, (doc) => {
    if (doc.exists()) {
      const data = doc.data();
      callback({
        id: doc.id,
        ...data,
        members: data.members || [],
      } as Ministry);
    } else {
      callback(null);
    }
  });
  
  return unsubscribe;
}

export async function updateMinistry(id: string, data: Partial<Ministry>) {
  const ref = doc(db, "ministries", id);
  await updateDoc(ref, data);
}

export async function deleteMinistry(id: string) {
  // Get the ministry first to update member documents
  const ministryRef = doc(db, "ministries", id);
  const ministryDoc = await getDocs(
    query(collection(db, "ministries"), where("__name__", "==", id))
  );
  
  if (!ministryDoc.empty) {
    const ministryData = ministryDoc.docs[0].data();
    const members = ministryData.members || [];
    
    // Remove ministry ID from all member documents
    for (const member of members) {
      try {
        const memberRef = doc(db, "members", member.memberId);
        const memberDocSnapshot = await getDocs(
          query(collection(db, "members"), where("__name__", "==", member.memberId))
        );
        
        if (!memberDocSnapshot.empty) {
          const memberData = memberDocSnapshot.docs[0].data();
          const ministries = memberData.ministries || [];
          const updatedMinistries = ministries.filter((mid: string) => mid !== id);
          
          await updateDoc(memberRef, {
            ministries: updatedMinistries
          });
        }
      } catch (err) {
        console.error(`Failed to update member ${member.memberId}:`, err);
      }
    }
  }
  
  // Delete the ministry
  await deleteDoc(ministryRef);
}

export async function incrementMinistryMemberCount(id: string, incrementBy: number = 1) {
  const ref = doc(db, "ministries", id);
  await updateDoc(ref, {
    memberCount: increment(incrementBy)
  });
}

export async function addMemberToMinistry(
  ministryId: string,
  member: MinistryMember
) {
  const ministryRef = doc(db, "ministries", ministryId);
  
  // Add member to ministry
  await updateDoc(ministryRef, {
    members: arrayUnion(member),
    memberCount: increment(1)
  });
  
  // Add ministryId to member document
  const memberRef = doc(db, "members", member.memberId);
  await updateDoc(memberRef, {
    ministries: arrayUnion(ministryId)
  });
}

export async function removeMemberFromMinistry(
  ministryId: string,
  memberId: string
) {
  const ministryRef = doc(db, "ministries", ministryId);
  
  // Get current ministry to find the member
  const ministryDoc = await getDoc(ministryRef);
  if (!ministryDoc.exists()) return;
  
  const ministryData = ministryDoc.data();
  const members = ministryData.members || [];
  const memberToRemove = members.find((m: MinistryMember) => m.memberId === memberId);
  
  if (!memberToRemove) return;
  
  // Remove member from ministry
  await updateDoc(ministryRef, {
    members: arrayRemove(memberToRemove),
    memberCount: increment(-1)
  });
  
  // Remove ministryId from member document
  const memberRef = doc(db, "members", memberId);
  await updateDoc(memberRef, {
    ministries: arrayRemove(ministryId)
  });
}

export async function searchMemberByMembershipNumber(membershipNumber: string) {
  if (!membershipNumber.trim()) return null;
  
  const membersQuery = query(
    collection(db, "members"),
    where("membershipNumber", "==", membershipNumber)
  );
  
  const snapshot = await getDocs(membersQuery);
  
  if (snapshot.empty) {
    return null;
  }
  
  const memberDoc = snapshot.docs[0];
  return {
    id: memberDoc.id,
    ...memberDoc.data()
  };
}

// Removed custom getDoc wrapper in favor of firebase getDoc import.
