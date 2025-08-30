// src/lib/auth.ts
import { collection, query, where, getDocs } from 'firebase/firestore';
import bcrypt from 'bcryptjs';
import Cookies from 'js-cookie';
import { db } from './firebase';

export interface User {
  userId: string;
  email_address: string;
  user_type: 'hospital' | 'customer';
  // hospital user fields
  hospital_member_id?: string;
  family_name?: string;
  first_name?: string;
  // customer user fields
  baby_born_day?: string;
  baby_born_month?: string;
  baby_born_year?: string;
  baby_family_name?: string;
  baby_first_name?: string;
  consultation_id?: string;
  parent_family_name?: string;
  parent_first_name?: string;
}

export interface AuthResult {
  success: boolean;
  user?: User;
  error?: string;
}

// ログイン関数
export async function login(email: string, password: string): Promise<AuthResult> {
  try {
    // Firestoreからユーザーを検索
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('email_address', '==', email));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return { success: false, error: 'メールアドレスまたはパスワードが正しくありません。' };
    }

    const userDoc = querySnapshot.docs[0];
    const userData = userDoc.data();

    // パスワードの確認
    const isPasswordValid = await bcrypt.compare(password, userData.password);
    
    if (!isPasswordValid) {
      return { success: false, error: 'メールアドレスまたはパスワードが正しくありません。' };
    }

    // ユーザー情報を整形
    const user: User = {
      userId: userData.userId,
      email_address: userData.email_address,
      user_type: userData.user_type,
      ...(userData.user_type === 'hospital' && {
        hospital_member_id: userData.hospital_member_id,
        family_name: userData.family_name,
        first_name: userData.first_name,
      }),
      ...(userData.user_type === 'customer' && {
        baby_born_day: userData.baby_born_day,
        baby_born_month: userData.baby_born_month,
        baby_born_year: userData.baby_born_year,
        baby_family_name: userData.baby_family_name,
        baby_first_name: userData.baby_first_name,
        consultation_id: userData.consultation_id,
        parent_family_name: userData.parent_family_name,
        parent_first_name: userData.parent_first_name,
      }),
    };

    // セッション情報をクッキーに保存（24時間有効）
    const sessionData = {
      user,
      timestamp: Date.now(),
    };
    
    Cookies.set('session', JSON.stringify(sessionData), { 
      expires: 1, // 1日
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });

    return { success: true, user };
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, error: 'ログイン中にエラーが発生しました。' };
  }
}

// セッション確認関数
export function getSession(): User | null {
  try {
    const sessionCookie = Cookies.get('session');
    if (!sessionCookie) return null;

    const sessionData = JSON.parse(sessionCookie);
    const now = Date.now();
    const sessionAge = now - sessionData.timestamp;
    
    // 24時間（86400000ミリ秒）を超えていればセッション無効
    if (sessionAge > 86400000) {
      logout();
      return null;
    }

    return sessionData.user;
  } catch (error) {
    console.error('Session error:', error);
    return null;
  }
}

// ログアウト関数
export function logout(): void {
  Cookies.remove('session');
}

// 認証が必要なページでのリダイレクト判定
export function requireAuth(): User | null {
  const user = getSession();
  if (!user) {
    // クライアントサイドでのリダイレクト
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
    return null;
  }
  return user;
}