// src/app/lib/getNewUserId.ts
import { db } from "@/lib/firebase";
import { doc, runTransaction } from "firebase/firestore";

/**
 * 新しいユーザーIDを発行する関数
 * @param prefix - 例: "customer_user", "staff_user", "admin_user"
 * @returns 採番されたユーザーID（例: "customer_user_0006"）
 */
export async function getNewUserId(prefix: string): Promise<string> {
  const counterRef = doc(db, "counterscoll", prefix);

  const newId = await runTransaction(db, async (transaction) => {
    const counterDoc = await transaction.get(counterRef);

    let lastUserId: string | undefined;
    if (counterDoc.exists()) {
      lastUserId = counterDoc.data().lastUserId as string | undefined;
    }

    let newUserId: string;
    if (!lastUserId) {
      // 初回 → 0001からスタート
      newUserId = `${prefix}_0001`;
    } else {
      // 数字部分を取り出して +1
      const numPart = lastUserId.replace(`${prefix}_`, "");
      const nextNum = (parseInt(numPart, 10) || 0) + 1;
      newUserId = `${prefix}_${String(nextNum).padStart(4, "0")}`;
    }

    // Firestoreに保存（新規作成 or 更新）
    transaction.set(counterRef, { lastUserId: newUserId }, { merge: true });

    return newUserId;
  });

  return newId;
}
