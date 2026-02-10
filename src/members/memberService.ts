import {
  collection,
  doc,
  runTransaction,
  serverTimestamp,
  getDocs,
  query,
  orderBy,
  onSnapshot,
  updateDoc,
} from "firebase/firestore";
import { db } from "../firebase/firebase";
import type { Member } from "./memberTypes";

export async function addMember(
  data: Omit<Member, "membershipNumber" | "createdAt" | "status">
) {
  const counterRef = doc(db, "counters", "members");

  await runTransaction(db, async (transaction) => {
    const counterSnap = await transaction.get(counterRef);

    let count = 0;
    if (counterSnap.exists()) {
      count = counterSnap.data().count;
    }

    const newCount = count + 1;
    const year = new Date().getFullYear();
    const membershipNumber = `CH-${year}-${String(newCount).padStart(4, "0")}`;

    transaction.set(counterRef, { count: newCount }, { merge: true });

    const memberRef = collection(db, "members");
    transaction.set(doc(memberRef), {
      ...data,
      membershipNumber,
      status: "member",
      createdAt: serverTimestamp(),
    });
  });
}

export async function getMembers() {
  const q = query(collection(db, "members"), orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
}

export function subscribeToMembers(
  callback: (members: Member[]) => void
) {
  const q = query(collection(db, "members"), orderBy("createdAt", "desc"));
  const unsubscribe = onSnapshot(q, (snapshot) => {
    const items = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Member[];
    callback(items);
  });

  return unsubscribe;
}

export async function updateMember(id: string, data: Member) {
  const ref = doc(db, "members", id);
  await updateDoc(ref, {
    ...data,
  });
}