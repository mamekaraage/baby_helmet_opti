// src/app/user_entry_customer/page.tsx
'use client';

import { getNewUserId } from '@/lib/getNewUserId';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  collection,
  getDocs,
  setDoc,
  doc,
  query,
  where
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

export const runtime = 'edge';

interface User {
  userId: string;
  user_type: string;
  consultation_id: string;
  baby_family_name: string;
  baby_first_name: string;
  baby_born_year: string;
  baby_born_month: string;
  baby_born_day: string;
  email_address: string;
  password: string;
  user_memo: string;
}

export default function UserEntryCustomerPage() {
  const router = useRouter();

  const [formData, setFormData] = useState<User>({
    userId: '自動で採番されます',
    user_type: 'customer',
    consultation_id: '',
    baby_family_name: '',
    baby_first_name: '',
    baby_born_year: '',
    baby_born_month: '',
    baby_born_day: '',
    email_address: '',
    password: '',
    user_memo: ''
  });

  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [memoCount, setMemoCount] = useState(0);

  // 年選択肢
  const generateYearOptions = () => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 151 }, (_, i) => (currentYear - i).toString());
  };
  const generateMonthOptions = () =>
    Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0'));
  const generateDayOptions = () =>
    Array.from({ length: 31 }, (_, i) => (i + 1).toString().padStart(2, '0'));

  // 入力変更処理
  const handleInputChange = (field: keyof User, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (field === 'user_memo') setMemoCount(value.length);
  };

  // パスワードをSHA-256でハッシュ化
  async function hashPassword(password: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hashBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }

  // バリデーション
  const validateForm = async (): Promise<string[]> => {
    const errors: string[] = [];

    if (!formData.baby_family_name) errors.push('苗字を入力してください');
    if (!formData.baby_first_name) errors.push('名前を入力してください');
    if (!formData.email_address) errors.push('メールアドレスを入力してください');

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (
      formData.email_address &&
      (!emailRegex.test(formData.email_address) ||
        formData.email_address.length > 128)
    ) {
      errors.push('有効なメールアドレスを128文字以内で入力してください');
    }

    // メール重複チェック
    const q = query(
      collection(db, 'users'),
      where('email_address', '==', formData.email_address)
    );
    const emailSnap = await getDocs(q);
    if (!emailSnap.empty) {
      errors.push('このメールアドレスは既に登録されています');
    }

    // パスワード
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+=\[\]{};':"\\|,.<>\/?]).{10,32}$/;
    if (!passwordRegex.test(formData.password)) {
      errors.push(
        'パスワードは10〜32文字で大文字・小文字・数字・記号を含む必要があります'
      );
    }
    if (formData.password !== confirmPassword) {
      errors.push('パスワードと確認用パスワードが一致しません');
    }

    if (formData.user_memo.length > 700) {
      errors.push('メモは700文字以内で入力してください');
    }

    return errors;
  };

  // 登録処理
  const handleRegister = async () => {
    setError('');
    try {
      const validationErrors = await validateForm();
      if (validationErrors.length > 0) {
        setError(validationErrors.join('\n'));
        return;
      }

      const userId = await getNewUserId("customer_user");
      const hashedPassword = await hashPassword(formData.password);

      const newUser: User = {
        ...formData,
        userId,
        password: hashedPassword
      };

      await setDoc(doc(db, 'users', userId), newUser);

      alert('ユーザー登録が完了しました');
      router.push('/top_hospital');
    } catch (registrationError) {
      console.error('Registration error:', registrationError);
      setError('登録に失敗しました');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-100">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm border-b border-pink-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <button
                onClick={() => router.push('/top_hospital')}
                className="mr-4 text-gray-500 hover:text-gray-700"
              >
                ← 戻る
              </button>
              <h1 className="text-xl font-semibold text-gray-900">
                ユーザー登録（患者様）
              </h1>
            </div>
          </div>
        </div>
      </header>

      {/* メインフォーム */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-lg p-8 space-y-6">
          {/* 各入力フィールド */}
          {/* ユーザーID */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ユーザーID
            </label>
            <input
              type="text"
              value={formData.userId}
              disabled
              className="w-full p-3 border rounded-lg bg-gray-100 text-gray-500"
            />
          </div>

          {/* ユーザータイプ */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ユーザータイプ
            </label>
            <input
              type="text"
              value={formData.user_type}
              disabled
              className="w-full p-3 border rounded-lg bg-gray-100 text-gray-500"
            />
          </div>

          {/* 診察番号 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              診察番号
            </label>
            <input
              type="text"
              value={formData.consultation_id}
              onChange={e =>
                handleInputChange('consultation_id', e.target.value)
              }
              className="w-full p-3 border rounded-lg"
            />
          </div>

          {/* 苗字 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              苗字
            </label>
            <input
              type="text"
              value={formData.baby_family_name}
              onChange={e =>
                handleInputChange('baby_family_name', e.target.value)
              }
              maxLength={32}
              className="w-full p-3 border rounded-lg"
            />
          </div>

          {/* 名前 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              名前
            </label>
            <input
              type="text"
              value={formData.baby_first_name}
              onChange={e =>
                handleInputChange('baby_first_name', e.target.value)
              }
              maxLength={32}
              className="w-full p-3 border rounded-lg"
            />
          </div>

          {/* 出生年月日 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              出生年月日
            </label>
            <div className="grid grid-cols-3 gap-4">
              <select
                value={formData.baby_born_year}
                onChange={e =>
                  handleInputChange('baby_born_year', e.target.value)
                }
                className="p-3 border rounded-lg"
              >
                <option value="">年</option>
                {generateYearOptions().map(year => (
                  <option key={year} value={year}>
                    {year}年
                  </option>
                ))}
              </select>
              <select
                value={formData.baby_born_month}
                onChange={e =>
                  handleInputChange('baby_born_month', e.target.value)
                }
                className="p-3 border rounded-lg"
              >
                <option value="">月</option>
                {generateMonthOptions().map(month => (
                  <option key={month} value={month}>
                    {month}月
                  </option>
                ))}
              </select>
              <select
                value={formData.baby_born_day}
                onChange={e =>
                  handleInputChange('baby_born_day', e.target.value)
                }
                className="p-3 border rounded-lg"
              >
                <option value="">日</option>
                {generateDayOptions().map(day => (
                  <option key={day} value={day}>
                    {day}日
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* メールアドレス */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              メールアドレス
            </label>
            <input
              type="email"
              value={formData.email_address}
              onChange={e =>
                handleInputChange('email_address', e.target.value)
              }
              maxLength={128}
              className="w-full p-3 border rounded-lg"
            />
          </div>

          {/* パスワード */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              パスワード
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={e => handleInputChange('password', e.target.value)}
              maxLength={32}
              className="w-full p-3 border rounded-lg"
            />
          </div>

          {/* パスワード確認 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              パスワード（確認用）
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              maxLength={32}
              className="w-full p-3 border rounded-lg"
            />
          </div>

          {/* メモ */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              メモ ({memoCount}/700文字)
            </label>
            <textarea
              value={formData.user_memo}
              onChange={e => handleInputChange('user_memo', e.target.value)}
              maxLength={700}
              rows={5}
              className="w-full p-3 border rounded-lg resize-vertical"
            />
          </div>

          {/* 登録ボタン */}
          <div className="pt-6">
            <button
              onClick={handleRegister}
              className="w-full bg-blue-500 text-white font-medium py-3 px-6 rounded-lg"
            >
              登録
            </button>
          </div>

          {/* エラー表示 */}
          {error && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 whitespace-pre-line">
              {error}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}