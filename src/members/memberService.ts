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
  where,
} from "firebase/firestore";
import { db } from "../firebase/firebase";
import type { Member, MemberStatus } from "./memberTypes";

// Custom error classes
export class DuplicateMemberError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DuplicateMemberError';
  }
}

export class ValidationError extends Error {
  declare errors: string[];
  constructor(errors: string[]) {
    super(errors.join(", "));
    this.name = 'ValidationError';
    // Assign property in runtime-safe JS; avoids parameter property syntax
    this.errors = errors;
  }
}

// Validation helper function
export function validateMemberData(
  data: Omit<Member, "membershipNumber" | "createdAt" | "id"> & { status: MemberStatus }
): string[] {
  const errors: string[] = [];
  
  // Required fields validation
  if (!data.fullName?.trim()) errors.push("Full name is required");
  if (!data.gender?.trim()) errors.push("Gender is required");
  if (!data.dob) errors.push("Date of birth is required");
  if (!data.phone?.trim()) errors.push("Phone number is required");
  if (!data.email?.trim()) errors.push("Email is required");
  if (!data.status?.trim()) errors.push("Member status is required");
  
  // Field length validation
  if (data.fullName?.trim() && data.fullName.length < 2) {
    errors.push("Full name must be at least 2 characters");
  }
  
  if (data.fullName?.trim() && data.fullName.length > 100) {
    errors.push("Full name cannot exceed 100 characters");
  }
  
  // Phone validation
  if (data.phone) {
    const phoneRegex = /^[0-9+\-\s()]{10,15}$/;
    if (!phoneRegex.test(data.phone.replace(/\s/g, ''))) {
      errors.push("Phone number must be 10-15 digits and can include +, -, (, )");
    }
  }
  
  // Email validation
  if (data.email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      errors.push("Invalid email format");
    }
    
    if (data.email.length > 100) {
      errors.push("Email cannot exceed 100 characters");
    }
  }
  
  // Date of birth validation
  if (data.dob) {
    const dobDate = new Date(data.dob);
    const today = new Date();
    
    if (dobDate > today) {
      errors.push("Date of birth cannot be in the future");
    }
    
    // Check if age is reasonable (between 0 and 120 years)
    const age = today.getFullYear() - dobDate.getFullYear();
    if (age < 0 || age > 120) {
      errors.push("Please enter a valid date of birth");
    }
  }
  
  // Address validation (if provided)
  if (data.address && data.address.length > 200) {
    errors.push("Address cannot exceed 200 characters");
  }
  
  // Marital status validation (if provided)
  const validMaritalStatuses = ['Single', 'Married', 'Divorced', 'Widowed', 'Separated', ''];
  if (data.maritalStatus && !validMaritalStatuses.includes(data.maritalStatus)) {
    errors.push("Please select a valid marital status");
  }
  
  // Occupation validation (if provided)
  if (data.occupation && data.occupation.length > 100) {
    errors.push("Occupation cannot exceed 100 characters");
  }
  
  // Profile photo URL validation (if provided)
  if (data.profilePhotoUrl && data.profilePhotoUrl !== "N/A") {
    try {
      new URL(data.profilePhotoUrl);
    } catch {
      errors.push("Profile photo URL must be a valid URL");
    }
  }
  
  return errors;
}

// Check for duplicate members
export async function checkForDuplicateMember(
  memberData: Omit<Member, "membershipNumber" | "createdAt"> & { status: MemberStatus }
): Promise<{ isDuplicate: boolean; existingMember?: Partial<Member>; duplicateFields: string[] }> {
  const membersRef = collection(db, "members");
  const duplicateFields: string[] = [];
  let existingMember: Partial<Member> | undefined;
  
  try {
    // Check by phone (exact match)
    if (memberData.phone) {
      const phoneQuery = query(membersRef, where("phone", "==", memberData.phone));
      const phoneSnapshot = await getDocs(phoneQuery);
      
      if (!phoneSnapshot.empty) {
        duplicateFields.push("phone");
        existingMember = phoneSnapshot.docs[0].data() as Member;
      }
    }
    
    // Check by email (case-insensitive comparison)
    if (memberData.email) {
      const emailQuery = query(membersRef, where("email", "==", memberData.email.toLowerCase()));
      const emailSnapshot = await getDocs(emailQuery);
      
      if (!emailSnapshot.empty) {
        duplicateFields.push("email");
        if (!existingMember) {
          existingMember = emailSnapshot.docs[0].data() as Member;
        }
      }
    }
    
    // Check by name + dob combination
    if (memberData.fullName && memberData.dob) {
      const nameQuery = query(membersRef, where("fullName", "==", memberData.fullName.trim()));
      const nameSnapshot = await getDocs(nameQuery);
      
      if (!nameSnapshot.empty) {
        // Filter for matching dob
        const matchingDob = nameSnapshot.docs.find(doc => {
          const data = doc.data();
          return data.dob === memberData.dob;
        });
        
        if (matchingDob) {
          duplicateFields.push("name+dob");
          if (!existingMember) {
            existingMember = matchingDob.data() as Member;
          }
        }
      }
    }
    
    return {
      isDuplicate: duplicateFields.length > 0,
      existingMember,
      duplicateFields
    };
    
  } catch (error) {
    console.error("Error checking for duplicates:", error);
    throw error;
  }
}

export async function addMember(
  data: Omit<Member, "membershipNumber" | "createdAt"> & { status: MemberStatus },
  options?: {
    skipDuplicateCheck?: boolean;
    skipValidation?: boolean;
  }
) {
  // Validate input data
  if (!options?.skipValidation) {
    const validationErrors = validateMemberData(data);
    if (validationErrors.length > 0) {
      throw new ValidationError(validationErrors);
    }
  }
  
  // Check for duplicates
  if (!options?.skipDuplicateCheck) {
    const duplicateCheck = await checkForDuplicateMember(data);
    
    if (duplicateCheck.isDuplicate) {
      const fieldLabels = duplicateCheck.duplicateFields.map(field => {
        switch(field) {
          case 'phone': return 'Phone Number';
          case 'email': return 'Email Address';
          case 'name+dob': return 'Name and Date of Birth';
          default: return field;
        }
      }).join(', ');
      
      const errorMessage = `Potential duplicate found based on: ${fieldLabels}.\n\n` +
        `Existing member details:\n` +
        `Name: ${duplicateCheck.existingMember?.fullName || 'N/A'}\n` +
        `Phone: ${duplicateCheck.existingMember?.phone || 'N/A'}\n` +
        `Email: ${duplicateCheck.existingMember?.email || 'N/A'}\n` +
        `Membership #: ${duplicateCheck.existingMember?.membershipNumber || 'N/A'}`;
      
      throw new DuplicateMemberError(errorMessage);
    }
  }
  
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
    
    // Clean and prepare data for storage
    const memberDataForStorage = {
      ...data,
      email: data.email.toLowerCase(), // Store email in lowercase for consistency
      fullName: data.fullName.trim(),
      phone: data.phone.trim(),
      profilePhotoUrl: data.profilePhotoUrl?.trim() || "N/A",
      membershipNumber,
      createdAt: serverTimestamp(),
    };
    
    transaction.set(doc(memberRef), memberDataForStorage);
  });
}

// Enhanced validation for member updates
export function validateMemberUpdate(
  currentData: Partial<Member>,
  newData: Partial<Member>
): string[] {
  const errors: string[] = [];
  
  // If phone is being updated, check format
  if (newData.phone !== undefined && newData.phone !== currentData.phone) {
    const phoneRegex = /^[0-9+\-\s()]{10,15}$/;
    if (!phoneRegex.test(newData.phone.replace(/\s/g, ''))) {
      errors.push("Phone number must be 10-15 digits and can include +, -, (, )");
    }
  }
  
  // If email is being updated, check format
  if (newData.email !== undefined && newData.email !== currentData.email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newData.email)) {
      errors.push("Invalid email format");
    }
  }
  
  // If dob is being updated, check validity
  if (newData.dob !== undefined && newData.dob !== currentData.dob) {
    const dobDate = new Date(newData.dob);
    const today = new Date();
    
    if (dobDate > today) {
      errors.push("Date of birth cannot be in the future");
    }
  }
  
  // Name length check
  if (newData.fullName !== undefined && newData.fullName.length > 100) {
    errors.push("Full name cannot exceed 100 characters");
  }
  
  return errors;
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

export async function updateMember(id: string, data: Partial<Member>) {
  // Basic validation for updates
  const validationErrors = validateMemberUpdate({} as Member, data);
  if (validationErrors.length > 0) {
    throw new ValidationError(validationErrors);
  }
  
  const ref = doc(db, "members", id);
  
  // Clean data before update
  const cleanedData: Partial<Member> = { ...data };
  
  if (data.email) {
    cleanedData.email = data.email.toLowerCase();
  }
  
  if (data.fullName) {
    cleanedData.fullName = data.fullName.trim();
  }
  
  if (data.phone) {
    cleanedData.phone = data.phone.trim();
  }
  
  if (data.profilePhotoUrl) {
    cleanedData.profilePhotoUrl = data.profilePhotoUrl.trim() || "N/A";
  }
  
  await updateDoc(ref, cleanedData);
}

// Utility function to format validation errors for display
export function formatValidationErrors(errors: string[]): string {
  if (errors.length === 0) return "";
  
  if (errors.length === 1) {
    return `Validation Error: ${errors[0]}`;
  }
  
  return `Validation Errors:\n${errors.map((err, index) => `${index + 1}. ${err}`).join('\n')}`;
}
