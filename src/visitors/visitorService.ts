import { runTransaction } from "firebase/firestore";
import type { Member } from "../members/memberTypes";
// Converts a visitor to a member: creates member, assigns membershipNumber, removes visitor
export async function convertVisitorToMember(visitor: Visitor) {
  if (!visitor.id) throw new Error("Visitor must have an id");
  // Required fields for member
  const {
    fullName,
    gender,
    dob,
    phone,
    email,
    address,
    maritalStatus = "",
    occupation = "",
    profilePhotoUrl = "N/A",
    baptism,
  } = visitor;

  const counterRef = doc(db, "counters", "members");
  const membersRef = collection(db, "members");
  const visitorRef = doc(db, "visitors", visitor.id);

  await runTransaction(db, async (transaction) => {
    // Get and increment member counter
    const counterSnap = await transaction.get(counterRef);
    let count = 0;
    if (counterSnap.exists()) {
      count = counterSnap.data().count;
    }
    const newCount = count + 1;
    const year = new Date().getFullYear();
    const membershipNumber = `CH-${year}-${String(newCount).padStart(4, "0")}`;

    // Prepare member data
    const memberData: Omit<Member, "id"> = {
      membershipNumber,
      fullName: fullName.trim(),
      gender,
      dob,
      phone: phone.trim(),
      email: email.toLowerCase(),
      address,
      maritalStatus,
      occupation,
      profilePhotoUrl: profilePhotoUrl.trim() || "N/A",
      status: "new member",
      baptism,
      createdAt: serverTimestamp(),
    };

    // Add to members
    transaction.set(doc(membersRef), memberData);
    // Update counter
    transaction.set(counterRef, { count: newCount }, { merge: true });
    // Remove from visitors
    transaction.delete(visitorRef);
  });
}
import {
  collection,
  doc,
  serverTimestamp,
  getDocs,
  query,
  orderBy,
  onSnapshot,
  updateDoc,
  addDoc
} from "firebase/firestore";
import { db } from "../firebase/firebase";
import type { Visitor, VisitorStatus } from "./visitorTypes";

export function validateVisitorData(
  data: Omit<Visitor, "id" | "createdAt"> & { status: VisitorStatus }
): string[] {
  const errors: string[] = [];
  if (!data.fullName?.trim()) errors.push("Full name is required");
  if (!data.gender?.trim()) errors.push("Gender is required");
  if (!data.dob) errors.push("Date of birth is required");
  if (!data.phone?.trim()) errors.push("Phone number is required");
  if (!data.email?.trim()) errors.push("Email is required");
  if (!data.status?.trim()) errors.push("Visitor status is required");
  return errors;
}

export async function addVisitor(
  data: Omit<Visitor, "id" | "createdAt"> & { status: VisitorStatus }
) {
  const validationErrors = validateVisitorData(data);
  if (validationErrors.length > 0) {
    throw new Error(validationErrors.join(", "));
  }
  const visitorRef = collection(db, "visitors");
  const visitorDataForStorage = {
    ...data,
    email: data.email.toLowerCase(),
    fullName: data.fullName.trim(),
    phone: data.phone.trim(),
    profilePhotoUrl: data.profilePhotoUrl?.trim() || "N/A",
    status: "pre_member",
    createdAt: serverTimestamp(),
  };
  await addDoc(visitorRef, visitorDataForStorage);
}

export async function getVisitors() {
  const q = query(collection(db, "visitors"), orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
}

export function subscribeToVisitors(
  callback: (visitors: Visitor[]) => void
) {
  const q = query(collection(db, "visitors"), orderBy("createdAt", "desc"));
  const unsubscribe = onSnapshot(q, (snapshot) => {
    const items = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Visitor[];
    callback(items);
  });
  return unsubscribe;
}

export async function updateVisitorStatus(id: string, status: VisitorStatus) {
  const ref = doc(db, "visitors", id);
  await updateDoc(ref, { status });
}
