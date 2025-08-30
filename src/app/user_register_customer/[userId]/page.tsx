'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { doc, getDoc, setDoc } from 'firebase/firestore';
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

export default function UserUpdatePage() {
  const router = useRouter();
  const params = useParams();
  const userId = params.userId as string;

  const [user, setUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<User>({
    userId: '',
    user_type: '',
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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [memoCount, setMemoCount] = useState(0);

  // 年のオプション生成（150年前まで）
  const generateYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let year = currentYear; year >= currentYear - 150; year--) {
      years.push(year.toString());
    }
    return years;
  };

  // 月のオプション生成
  const generateMonthOptions = () => {
    return Array.from({ length: 12 }, (_, i) => {
      const month = (i + 1).toString().padStart(2, '0');
      return month;
    });
  };

  // 日のオプション生成
  const generateDayOptions = () => {
    return Array.from({ length: 31 }, (_, i) => {
      const day = (i + 1).toString().padStart(2, '0');
      return day;
    });
  };


  // ユーザーデータ取得
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userDoc = await getDoc(doc(db, 'users', userId));
        if (userDoc.exists()) {
          const userData = userDoc.data() as User;
          setUser(userData);
          setFormData(userData);
          setConfirmPassword(userData.password);
          setMemoCount(userData.user_memo?.length || 0);
        } else {
          setError('ユーザーが見つかりません');
        }
      } catch (err) {
        setError('ユーザー情報の取得に失敗しました');
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchUser();
    }
  }, [userId]);

  // フォーム入力変更処理
  const handleInputChange = (field: keyof User, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    if (field === 'user_memo') {
      setMemoCount(value.length);
    }
  };

  // バリデーション
  const validateForm = (): string[] => {
    const errors: string[] = [];

    // 苗字バリデーション（32文字まで）
    if (formData.baby_family_name.length > 32) {
      errors.push('苗字は32文字以内で入力してください');
    }

    // メールアドレスバリデーション
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(formData.email_address)) {
      errors.push('有効なメールアドレスを入力してください');
    }
    if (formData.email_address.length > 128) {
      errors.push('メールアドレスは128文字以内で入力してください');
    }

    // パスワードバリデーション
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{10,32}$/;
    if (!passwordRegex.test(formData.password)) {
      errors.push('パスワードは10文字以上-32文字以内で、大文字・小文字・数字・記号をすべて含む必要があります');
    }

    // パスワード確認
    if (formData.password !== confirmPassword) {
      errors.push('パスワードと確認用パスワードが一致しません');
    }

    // メモバリデーション
    if (!(formData.user_memo.length >= 0 && formData.user_memo.length <= 700)) {
      errors.push('メモは700文字以内で入力してください');
    }

    return errors;
  };

// パスワードをSHA-256でハッシュ化
  async function hashPassword(password: string): Promise<string> {
    const encoder = new TextEncoder()
    const data = encoder.encode(password)
    const hashBuffer = await crypto.subtle.digest("SHA-256", data)
    return Array.from(new Uint8Array(hashBuffer))
      .map(b => b.toString(16).padStart(2, "0"))
      .join("")
  }

  // 更新処理
  const handleUpdate = async () => {
    setError('');

    // データが変更されているかチェック
    if (user && JSON.stringify(formData) === JSON.stringify(user) && confirmPassword === user.password) {
      setError('更新する項目がありません');
      return;
    }

    // バリデーション
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setError(validationErrors.join('\n'));
      return;
    }

    try {
      //パスワードをハッシュ化
      const hashedPassword = await hashPassword(formData.password)


    //保存時はハッシュ済みの値に置き換える
    await setDoc(
        doc(db, 'users', userId),
        { ...formData, password: hashedPassword },
        { merge: true }
      )
    //   await setDoc(doc(db, 'users', userId), formData, { merge: true });

      router.push('/top_hospital');
    } catch (err) {
      setError('ユーザー情報の更新に失敗しました');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-100 flex items-center justify-center">
        <div className="text-lg text-gray-600">読み込み中...</div>
      </div>
    );
  }

  // if (!window.confirm(
  //   userId
  // )) {
  //   return;
  // }

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
                ユーザー更新画面（患者様情報更新）
              </h1>
            </div>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="space-y-6">
            {/* ユーザーID */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ユーザーID
              </label>
              <input
                type="text"
                value={formData.userId}
                disabled
                className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-500"
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
                className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-500"
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
                disabled
                className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-500"
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
                onChange={(e) => handleInputChange('baby_family_name', e.target.value)}
                maxLength={32}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
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
                // disabled
                onChange={(e) => handleInputChange('baby_first_name', e.target.value)}
                maxLength={32}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                //className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-500"
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
                  onChange={(e) => handleInputChange('baby_born_year', e.target.value)}
                  className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                >
                  <option value="">年</option>
                  {generateYearOptions().map(year => (
                    <option key={year} value={year}>{year}年</option>
                  ))}
                </select>
                <select
                  value={formData.baby_born_month}
                  onChange={(e) => handleInputChange('baby_born_month', e.target.value)}
                  className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                >
                  <option value="">月</option>
                  {generateMonthOptions().map(month => (
                    <option key={month} value={month}>{month}月</option>
                  ))}
                </select>
                <select
                  value={formData.baby_born_day}
                  onChange={(e) => handleInputChange('baby_born_day', e.target.value)}
                  className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                >
                  <option value="">日</option>
                  {generateDayOptions().map(day => (
                    <option key={day} value={day}>{day}日</option>
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
                onChange={(e) => handleInputChange('email_address', e.target.value)}
                maxLength={128}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>

            {/* パスワード */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                パスワード
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                //   value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  maxLength={32}
                  className="w-full p-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* パスワード（確認用） */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                パスワード（確認用）
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                //   value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  maxLength={32}
                  className="w-full p-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-3 text-gray-500 hover:text-gray-700"
                >
                  {showConfirmPassword ? (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* メモ */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                メモ ({memoCount}/700文字)
              </label>
              <textarea
                value={formData.user_memo}
                onChange={(e) => handleInputChange('user_memo', e.target.value)}
                maxLength={700}
                rows={5}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 resize-vertical"
              />
            </div>

            {/* 更新ボタン */}
            <div className="pt-6">
              <button
                onClick={handleUpdate}
                className="w-full bg-blue-500 hover:from-pink-500 hover:to-purple-600 text-white font-medium py-3 px-6 rounded-lg transition-all duration-200"
              >
                更新
              </button>
            </div>
          </div>
        </div>

        {/* エラー表示 */}
        {error && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="text-red-600 whitespace-pre-line">
              {error}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}