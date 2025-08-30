// src/app/top/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { requireAuth, logout, User } from '@/lib/auth';

export default function CustomerTopPage() {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    const currentUser = requireAuth();
    if (currentUser) {
      // customerユーザー以外はリダイレクト
      if (currentUser.user_type !== 'customer') {
        router.push('/top_hospital');
        return;
      }
      setUser(currentUser);
    }
  }, [router]);

  // const currentUser = requireAuth();
  // if (currentUser) {
  //   alert(`user情報: ${currentUser.userId}`);
  // }

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-pink-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-100">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm border-b border-pink-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">
                お客様ダッシュボード
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {user.baby_family_name} {user.baby_first_name}様
              </span>
              <button
                onClick={handleLogout}
                className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                ログアウト
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            こんにちは、{user.baby_family_name} {user.baby_first_name}様
          </h2>
          <p className="text-lg text-gray-600">
            ご利用いただきありがとうございます
          </p>
        </div>

        {/* メニューカード */}
        <div className="grid md:grid-cols-2 gap-8 max-w-2xl mx-auto">
          {/* スケジュールボタン */}
          <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                スケジュール
              </h3>
              <p className="text-gray-600 mb-6">
                診察予約の管理
              </p>
              {/* <button
                onClick={() => router.push('/schedule')}
                className="w-full bg-pink-400 hover:from-pink-500 hover:to-purple-600 text-white font-medium py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105"
                // className="w-full bg-gradient-to-r from-pink-400 to-purple-500 hover:from-pink-500 hover:to-purple-600 text-white font-medium py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105"
              >
                スケジュールを見る
              </button> */}
              <button
                // onClick={() => router.push(`/medical_history_hospital/customer_user_001`)}
                onClick={() => router.push(`/schedule_customer/${user.userId}`)}
                className="w-full bg-pink-400 hover:from-blue-500 hover:to-indigo-600 text-white font-medium py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105"
                // className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
              >
                スケジュールをみる
              </button>


            </div>
          </div>

          {/* 診察履歴ボタン */}
          <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
            <div className="p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                診察履歴
              </h3>
              <p className="text-gray-600 mb-6">
                過去の診察記録の確認
              </p>
              {/* <button
                onClick={() => router.push('/history')}
                className="w-full bg-blue-400 hover:from-blue-500 hover:to-indigo-600 text-white font-medium py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105"
                // className="w-full bg-gradient-to-r from-blue-400 to-indigo-500 hover:from-blue-500 hover:to-indigo-600 text-white font-medium py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105"
              >
                履歴を見る
              </button> */}
              <button
                // onClick={() => router.push(`/medical_history_hospital/customer_user_001`)}
                onClick={() => router.push(`/medical_history_hospital/${user.userId}`)}
                className="w-full bg-blue-400 hover:from-blue-500 hover:to-indigo-600 text-white font-medium py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105"
                // className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
              >
                履歴をみる
              </button>
            </div>
          </div>
        </div>

        {/* ユーザー情報カード */}
        <div className="mt-12 max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              登録情報
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">お名前:</span>
                <span className="ml-2 text-gray-900">
                  {user.baby_family_name} {user.baby_first_name}
                </span>
              </div>
              <div>
                <span className="text-gray-500">診察番号:</span>
                <span className="ml-2 text-gray-900">{user.consultation_id}</span>
              </div>
              <div>
                <span className="text-gray-500">生年月日:</span>
                <span className="ml-2 text-gray-900">
                  {user.baby_born_year}年{user.baby_born_month}月{user.baby_born_day}日
                </span>
              </div>
              <div>
                <span className="text-gray-500">保護者:</span>
                <span className="ml-2 text-gray-900">
                  {user.parent_family_name} {user.parent_first_name}
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}