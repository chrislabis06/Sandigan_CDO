import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  serverTimestamp,
  arrayUnion,
  arrayRemove,
  increment,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';
import {
  Initiative,
  Registration,
  ChatMessage,
  OrganizerRequest,
  VolunteerCertificate,
  Comment,
} from '../types/initiative';
import { UserProfile } from './auth';
import { DEFAULT_INITIATIVES } from '../data/defaultInitiatives';

// Default coordinates for northern Mindanao locations
export const DEFAULT_COORDS: Record<string, { lat: number; lng: number }> = {
  'ini-1': { lat: 8.5204, lng: 124.5714 }, // Opol Beach
  'ini-2': { lat: 8.4812, lng: 124.6465 }, // CDO Public Library
  'ini-3': { lat: 8.6142, lng: 124.8911 }, // Claveria
  'ini-4': { lat: 8.4851, lng: 124.6362 }, // Carmen Gym
  'ini-5': { lat: 8.1574, lng: 125.1277 }, // Malaybalay Heritage Center
  'ini-6': { lat: 8.4862, lng: 124.6463 }, // Gaston Park
};

export function resolveCoordinates(location: string = '', region: string = ''): { lat: number; lng: number } {
  const loc = (location || '').toLowerCase();
  const reg = (region || '').toLowerCase();
  if (loc.includes('opol')) return { lat: 8.5204, lng: 124.5714 };
  if (loc.includes('library') || loc.includes('divisoria')) return { lat: 8.4812, lng: 124.6465 };
  if (loc.includes('claveria')) return { lat: 8.6142, lng: 124.8911 };
  if (loc.includes('carmen')) return { lat: 8.4851, lng: 124.6362 };
  if (loc.includes('malaybalay') || reg.includes('bukidnon')) return { lat: 8.1574, lng: 125.1277 };
  if (loc.includes('gaston')) return { lat: 8.4862, lng: 124.6463 };
  if (reg.includes('misamis')) return { lat: 8.5204, lng: 124.5714 };
  return { lat: 8.4851, lng: 124.6465 }; // CDO Center default
}

/**
 * Seed initial initiatives into Firestore if the collection is empty,
 * and backfill coordinates if existing documents lack them.
 */
export async function seedInitialDrivesIfEmpty() {
  try {
    const initiativesCol = collection(db, 'initiatives');
    const snapshot = await getDocs(initiativesCol);

    if (snapshot.empty) {
      console.log('Seeding initial Northern Mindanao volunteer drives to Firestore...');
      for (const item of DEFAULT_INITIATIVES) {
        const coords = DEFAULT_COORDS[item.id] || resolveCoordinates(item.location, item.region);
        const docRef = doc(db, 'initiatives', item.id);
        await setDoc(docRef, {
          ...item,
          lat: coords.lat,
          lng: coords.lng,
          createdAt: serverTimestamp(),
        });
      }
      console.log('Successfully seeded default initiatives.');
    } else {
      // Ensure existing documents in Firestore have valid coordinates
      for (const docSnap of snapshot.docs) {
        const d = docSnap.data();
        if (typeof d.lat !== 'number' || typeof d.lng !== 'number') {
          const coords = DEFAULT_COORDS[docSnap.id] || resolveCoordinates(d.location, d.region);
          await updateDoc(docSnap.ref, { lat: coords.lat, lng: coords.lng }).catch(() => {});
        }
      }
    }
  } catch (error) {
    console.warn('Could not seed/backfill initial initiatives (likely permissions or offline):', error);
  }
}

/**
 * Real-time listener for all initiatives
 */
export function subscribeInitiatives(callback: (initiatives: Initiative[]) => void) {
  const initiativesCol = collection(db, 'initiatives');
  const q = query(initiativesCol, orderBy('createdAt', 'desc'));

  return onSnapshot(
    q,
    (snapshot) => {
      const drives: Initiative[] = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        const coords =
          typeof data.lat === 'number' && typeof data.lng === 'number'
            ? { lat: data.lat, lng: data.lng }
            : DEFAULT_COORDS[docSnap.id] || resolveCoordinates(data.location, data.region);

        return {
          id: docSnap.id,
          ...data,
          lat: coords.lat,
          lng: coords.lng,
          createdAt: data.createdAt?.toMillis ? data.createdAt.toMillis() : (data.createdAt || Date.now()),
        } as Initiative;
      });
      callback(drives);
    },
    (error) => {
      console.error('Error in subscribeInitiatives:', error);
      // Fallback to default initiatives if permission or index issue
      callback(DEFAULT_INITIATIVES);
    }
  );
}

/**
 * Create a new initiative in Firestore
 */
export async function createInitiative(
  data: Omit<Initiative, 'id' | 'createdAt' | 'comments' | 'joined' | 'joinedUserIds'>,
  user?: UserProfile | null
): Promise<string> {
  const creatorUid = user?.uid || (data as any).userId;
  try {
    const docRef = await addDoc(collection(db, 'initiatives'), {
      ...data,
      userId: creatorUid || null,
      organizerName: user?.displayName || data.organizerName,
      joined: 1,
      joinedUserIds: creatorUid ? [creatorUid] : [],
      comments: [],
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, 'initiatives');
  }
}

/**
 * Toggle join/register for an initiative
 */
export async function toggleJoinInitiative(
  initiativeId: string,
  user: UserProfile,
  isCurrentlyJoined: boolean
) {
  const initiativeRef = doc(db, 'initiatives', initiativeId);
  const registrationId = `${initiativeId}_${user.uid}`;
  const regRef = doc(db, 'registrations', registrationId);

  try {
    if (isCurrentlyJoined) {
      // Unjoin
      await updateDoc(initiativeRef, {
        joined: increment(-1),
        joinedUserIds: arrayRemove(user.uid),
      });
      await deleteDoc(regRef);
    } else {
      // Join
      await updateDoc(initiativeRef, {
        joined: increment(1),
        joinedUserIds: arrayUnion(user.uid),
      });
      await setDoc(regRef, {
        id: registrationId,
        initiativeId,
        userId: user.uid,
        userName: user.displayName,
        userEmail: user.email,
        userPhone: user.phone,
        userBloodType: user.bloodType,
        checkedIn: false,
        registeredAt: serverTimestamp(),
      });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `initiatives/${initiativeId}`);
  }
}

/**
 * Real-time listener for volunteer roster of a specific initiative
 */
export function subscribeRegistrations(
  initiativeId: string,
  callback: (registrations: Registration[]) => void
) {
  const registrationsCol = collection(db, 'registrations');
  const q = query(registrationsCol, where('initiativeId', '==', initiativeId));

  return onSnapshot(
    q,
    (snapshot) => {
      const regs: Registration[] = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          ...data,
          registeredAt: data.registeredAt?.toMillis ? data.registeredAt.toMillis() : Date.now(),
        } as Registration;
      });
      callback(regs);
    },
    (error) => {
      console.warn('Error subscribing to registrations:', error);
      callback([]);
    }
  );
}

/**
 * Toggle check-in status on volunteer roster
 */
export async function setRegistrationCheckIn(registrationId: string, checkedIn: boolean) {
  try {
    const regRef = doc(db, 'registrations', registrationId);
    await updateDoc(regRef, { checkedIn });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `registrations/${registrationId}`);
  }
}

/**
 * Real-time listener for chat messages in an initiative channel
 */
export function subscribeMessages(initiativeId: string, callback: (messages: ChatMessage[]) => void) {
  const messagesCol = collection(db, 'initiatives', initiativeId, 'messages');
  const q = query(messagesCol, orderBy('createdAt', 'asc'));

  return onSnapshot(
    q,
    (snapshot) => {
      const msgs: ChatMessage[] = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          initiativeId,
          ...data,
          createdAt: data.createdAt?.toMillis ? data.createdAt.toMillis() : Date.now(),
        } as ChatMessage;
      });
      callback(msgs);
    },
    (error) => {
      console.warn('Error in subscribeMessages:', error);
      callback([]);
    }
  );
}

/**
 * Send real-time chat message to an initiative
 */
export async function sendChatMessage(initiativeId: string, sender: UserProfile, text: string) {
  try {
    const messagesCol = collection(db, 'initiatives', initiativeId, 'messages');
    await addDoc(messagesCol, {
      senderId: sender.uid,
      senderName: sender.displayName,
      senderAvatar: sender.avatarUrl || '',
      text: text.trim(),
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `initiatives/${initiativeId}/messages`);
  }
}

/**
 * Add Q&A comment to an initiative
 */
export async function addInitiativeComment(
  initiativeId: string,
  author: string,
  text: string,
  authorId: string = ''
) {
  try {
    const initiativeRef = doc(db, 'initiatives', initiativeId);
    const newComment: Comment = {
      id: `c-${Date.now()}`,
      author,
      authorId,
      text: text.trim(),
      time: 'Just now',
      avatarColor: 'bg-emerald-600',
    };
    await updateDoc(initiativeRef, {
      comments: arrayUnion(newComment),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `initiatives/${initiativeId}`);
  }
}

/**
 * Submit an application to become an Organizer
 */
export async function submitOrganizerRequest(
  userId: string,
  userName: string,
  userEmail: string,
  phone: string,
  organizationOrBarangay: string,
  reason: string
) {
  try {
    const docRef = doc(db, 'organizerRequests', userId);
    await setDoc(docRef, {
      userId,
      userName,
      userEmail,
      phone,
      organizationOrBarangay,
      reason,
      status: 'pending',
      submittedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `organizerRequests/${userId}`);
  }
}

/**
 * Real-time listener for current user's organizer request status
 */
export function subscribeOrganizerRequest(
  userId: string,
  callback: (request: OrganizerRequest | null) => void
) {
  const docRef = doc(db, 'organizerRequests', userId);
  return onSnapshot(
    docRef,
    (docSnap) => {
      if (docSnap.exists()) {
        callback({ id: docSnap.id, ...docSnap.data() } as OrganizerRequest);
      } else {
        callback(null);
      }
    },
    (err) => {
      console.warn('Error fetching organizer request:', err);
      callback(null);
    }
  );
}

/**
 * Real-time listener for all organizer requests (Admin view)
 */
export function subscribeAllOrganizerRequests(callback: (requests: OrganizerRequest[]) => void) {
  const colRef = collection(db, 'organizerRequests');
  const q = query(colRef, orderBy('submittedAt', 'desc'));

  return onSnapshot(
    q,
    (snapshot) => {
      const list = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as OrganizerRequest));
      callback(list);
    },
    (err) => {
      console.warn('Error fetching all organizer requests:', err);
      callback([]);
    }
  );
}

/**
 * Admin action: Approve or reject organizer application and update user role
 */
export async function reviewOrganizerRequest(
  requestId: string,
  targetUserId: string,
  newStatus: 'approved' | 'rejected',
  adminUid: string
) {
  try {
    const requestRef = doc(db, 'organizerRequests', requestId);
    await updateDoc(requestRef, {
      status: newStatus,
      reviewedAt: serverTimestamp(),
      reviewedBy: adminUid,
    });

    if (newStatus === 'approved') {
      const userRef = doc(db, 'users', targetUserId);
      await updateDoc(userRef, {
        role: 'organizer',
        updatedAt: serverTimestamp(),
      });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `organizerRequests/${requestId}`);
  }
}

/**
 * Issue and persist volunteer certificate in Firestore for public verification
 */
export async function issueCertificate(cert: Omit<VolunteerCertificate, 'id' | 'createdAt'>): Promise<string> {
  try {
    const colRef = collection(db, 'certificates');
    const docRef = await addDoc(colRef, {
      ...cert,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, 'certificates');
  }
}
