import { initializeApp, getApps, getApp } from "firebase/app";
import { 
  getDatabase, 
  ref, 
  set, 
  get, 
  onValue, 
  child, 
  push, 
  update, 
  remove, 
  off 
} from "firebase/database";
import { getAnalytics, isSupported } from "firebase/analytics";

// Cấu hình Firebase cho JPC FTU với fallback giá trị trực tiếp để hoạt động ổn định trên mọi môi trường
const firebaseConfig = {
  apiKey: import.meta.env?.VITE_FIREBASE_API_KEY || "AIzaSyAnoNpj-O2nJD3SNXKbqKHBFna8CZTOxiM",
  authDomain: import.meta.env?.VITE_FIREBASE_AUTH_DOMAIN || "jpc-ftu.firebaseapp.com",
  databaseURL: import.meta.env?.VITE_FIREBASE_DATABASE_URL || "https://jpc-ftu-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: import.meta.env?.VITE_FIREBASE_PROJECT_ID || "jpc-ftu",
  storageBucket: import.meta.env?.VITE_FIREBASE_STORAGE_BUCKET || "jpc-ftu.firebasestorage.app",
  messagingSenderId: import.meta.env?.VITE_FIREBASE_MESSAGING_SENDER_ID || "819335645572",
  appId: import.meta.env?.VITE_FIREBASE_APP_ID || "1:819335645572:web:c471bf312efd712334b5d1",
  measurementId: import.meta.env?.VITE_FIREBASE_MEASUREMENT_ID || "G-EY6RXY56Z9"
};

// Khởi tạo kết nối Firebase App
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Khởi tạo Firebase Analytics an toàn (chỉ trên browser hỗ trợ)
if (typeof window !== "undefined") {
  isSupported().then((supported) => {
    if (supported) {
      getAnalytics(app);
    }
  }).catch(() => {});
}

// Khởi tạo Realtime Database
export const db = getDatabase(app);

// Export các hàm thao tác Realtime Database
export { ref, set, get, onValue, child, push, update, remove, off };

/**
 * Lưu danh sách sự kiện lên Firebase Realtime Database
 * @param {Array} events 
 */
export async function saveEventsToFirebase(events) {
  try {
    const eventsRef = ref(db, 'events');
    await set(eventsRef, events);
    console.info('[Firebase RTDB] Đã lưu danh sách sự kiện thành công lên Realtime Database.');
    return { success: true };
  } catch (error) {
    console.error('[Firebase RTDB] Lỗi lưu sự kiện:', error);
    return { success: false, error };
  }
}

/**
 * Lắng nghe thay đổi danh sách sự kiện Realtime
 * @param {Function} onData - Callback khi có dữ liệu
 * @param {Function} onEmpty - Callback khi database trống (chưa có dữ liệu)
 */
export function listenEventsFromFirebase(onData, onEmpty) {
  try {
    const eventsRef = ref(db, 'events');
    return onValue(eventsRef, (snapshot) => {
      if (snapshot.exists() && snapshot.val()) {
        const val = snapshot.val();
        const list = Array.isArray(val) ? val : Object.values(val);
        onData(list);
      } else {
        if (typeof onEmpty === 'function') {
          onEmpty();
        }
      }
    }, (error) => {
      console.warn('[Firebase RTDB] Lỗi lắng nghe sự kiện:', error);
    });
  } catch (error) {
    console.warn('[Firebase RTDB] Không thể khởi tạo listener sự kiện:', error);
    return null;
  }
}

/**
 * Lưu danh sách các vòng tuyển thành viên lên Firebase Realtime Database
 * @param {Array} rounds 
 */
export async function saveRecruitmentToFirebase(rounds) {
  try {
    const recruitRef = ref(db, 'recruitment');
    await set(recruitRef, rounds);
    console.info('[Firebase RTDB] Đã lưu dữ liệu tuyển thành viên thành công lên Realtime Database.');
    return { success: true };
  } catch (error) {
    console.error('[Firebase RTDB] Lỗi lưu dữ liệu tuyển thành viên:', error);
    return { success: false, error };
  }
}

/**
 * Lắng nghe thay đổi danh sách tuyển thành viên Realtime
 * @param {Function} onData - Callback khi có dữ liệu
 * @param {Function} onEmpty - Callback khi database trống (chưa có dữ liệu)
 */
export function listenRecruitmentFromFirebase(onData, onEmpty) {
  try {
    const recruitRef = ref(db, 'recruitment');
    return onValue(recruitRef, (snapshot) => {
      if (snapshot.exists() && snapshot.val()) {
        const val = snapshot.val();
        const list = Array.isArray(val) ? val : Object.values(val);
        onData(list);
      } else {
        if (typeof onEmpty === 'function') {
          onEmpty();
        }
      }
    }, (error) => {
      console.warn('[Firebase RTDB] Lỗi lắng nghe tuyển thành viên:', error);
    });
  } catch (error) {
    console.warn('[Firebase RTDB] Không thể khởi tạo listener tuyển thành viên:', error);
    return null;
  }
}