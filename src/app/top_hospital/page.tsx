// src/app/top_hospital/page.tsx
'use client';

import React from 'react';
import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { requireAuth, logout, User } from '@/lib/auth';
import { db } from '@/lib/firebase';
import { Icon } from "@/lib/icon";
import Link from "next/link";

export const runtime = 'edge';

interface CustomerUser {
  userId: string;
  baby_family_name: string;
  baby_first_name: string;
  consultation_id: string;
  baby_born_year: string;
  baby_born_month: string;
  baby_born_day: string;
  email_address: string;
  parent_family_name: string;
  parent_first_name: string;
}

export default function HospitalTopPage() {
  const [user, setUser] = useState<User | null>(null);
  const [customers, setCustomers] = useState<CustomerUser[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  // 検索フィルタリング
  const filteredCustomers = useMemo(() => {
    if (!searchQuery) return customers;
    
    return customers.filter((customer) => {
      const query = searchQuery.toLowerCase();
      return (
        customer.baby_family_name.toLowerCase().includes(query) ||
        customer.baby_first_name.toLowerCase().includes(query) ||
        customer.consultation_id.toLowerCase().includes(query)
      );
    });
  }, [customers, searchQuery]);

  useEffect(() => {
    const currentUser = requireAuth();
    if (currentUser) {
      // hospitalユーザー以外はリダイレクト
      if (currentUser.user_type !== 'hospital') {
        router.push('/top');
        return;
      }
      setUser(currentUser);
      loadCustomers();
    }
  }, [router]);

  const loadCustomers = async () => {
    try {
      setIsLoading(true);
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('user_type', '==', 'customer'));
      const querySnapshot = await getDocs(q);
      
      const customerData: CustomerUser[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        customerData.push({
          userId: data.userId,
          baby_family_name: data.baby_family_name,
          baby_first_name: data.baby_first_name,
          consultation_id: data.consultation_id,
          baby_born_year: data.baby_born_year,
          baby_born_month: data.baby_born_month,
          baby_born_day: data.baby_born_day,
          email_address: data.email_address,
          parent_family_name: data.parent_family_name,
          parent_first_name: data.parent_first_name,
        });
      });
      
      setCustomers(customerData);
    } catch (error) {
      console.error('Error loading customers:', error);
      setError('顧客データの読み込みに失敗しました。');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const handleUserUpdate = (userId: string) => {
    // router.push(`/user_register_customer/customer_user_015`);
    router.push(`/user_register_customer/${userId}`);
  };

  const handleSchedule = (userId: string) => {
    router.push(`/schedule_customer/${userId}`);
  };

  const handleHistory = (userId: string) => {
    router.push(`/medical_history_hospital/${userId}`);
    // router.push(`/history_hospital?userId=${userId}`);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-blue-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="fixed top-0 left-0 right-0 bg-white shadow-sm border-b z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">
                病院ユーザ管理システム
              </h1>
              <div className="m-2">
              <Link href={"/top_hospital"} className="text-3xl">
                    <Icon.icon_akomoderate className="mr-2"/>
              </Link>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {user.family_name} {user.first_name}様
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
      <main className="pt-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            患者様一覧
          </h2>
          <p className="text-gray-600">
            登録されている患者様の一覧を管理できます
          </p>
        </div>

        {/* 検索ボックス + カウンター */}
        <div className="mb-6 flex justify-between items-center">
          {/* 統計情報 */}
          <div className="text-gray-700 text-sm">
            <span className="font-medium">総患者数:</span>{" "}
              <span className="text-lg font-bold text-blue-600">
              {customers.length}
              </span>
            <span className="ml-1 text-gray-500">名</span>
          </div>

          {/* カウンター */}
          <div className="text-gray-700 text-sm">
            <span className="font-medium">表示患者数:</span>{" "}
              <span className="text-lg font-bold text-blue-600">
                {filteredCustomers.length}
              </span>
            <span className="ml-1 text-gray-500">名</span>
          </div>


          {/* 検索ボックス */}
          <div className="mb-6 flex justify-end">
            <div className="w-80">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value.slice(0, 32))}
                placeholder="患者様情報で検索..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                maxLength={32}
              />
            </div>
          </div>
        </div>

        {/* エラー表示 */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* テーブル */}
        <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                <span className="ml-3 text-gray-600">読み込み中...</span>
              </div>
            ) : (
              <div className="max-h-96 overflow-y-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-6 py-3 text-left text-lg font-medium text-gray-500 uppercase tracking-wider">
                        苗字
                      </th>
                      <th className="px-6 py-3 text-left text-lg font-medium text-gray-500 uppercase tracking-wider">
                        名前
                      </th>
                      <th className="px-6 py-3 text-left text-lg font-medium text-gray-500 uppercase tracking-wider">
                        診察番号
                      </th>
                      <th className="px-6 py-3 text-left text-lg font-medium text-gray-500 uppercase tracking-wider">
                        生年月日
                      </th>
                      <th className="px-6 py-3 text-left text-lg font-medium text-gray-500 uppercase tracking-wider">
                        操作
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredCustomers.map((customer, index) => (
                      <tr key={customer.userId} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {customer.baby_family_name}
                          {/* {customer.baby_born_year}年{customer.baby_born_month}月{customer.baby_born_day}日 */}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {customer.baby_first_name}
                          {/* {customer.baby_born_year}年{customer.baby_born_month}月{customer.baby_born_day}日 */}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {customer.consultation_id}
                          {/* {customer.baby_born_year}年{customer.baby_born_month}月{customer.baby_born_day}日 */}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {customer.baby_born_year}年{customer.baby_born_month}月{customer.baby_born_day}日
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                          <button
                            onClick={() => handleUserUpdate(customer.userId)}
                            className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors transform hover:scale-105 "
                          >
                            ユーザー更新
                          </button>
                          <button
                            onClick={() => handleSchedule(customer.userId)}
                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors transform hover:scale-105"
                          >
                            利用スケジュール
                          </button>
                          <button
                            onClick={() => handleHistory(customer.userId)}
                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors transform hover:scale-105"
                          >
                            診察履歴
                          </button>
                        </td>
                      </tr>
                    ))}
                    {filteredCustomers.length === 0 && !isLoading && (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center">
                          <div className="text-gray-500">
                            {searchQuery ? (
                              <div>
                                <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                                <p className="text-lg font-medium text-gray-900 mb-1">
                                  検索結果が見つかりません
                                </p>
                                <p className="text-gray-500">
                                  「{searchQuery}」に一致する患者が見つかりませんでした
                                </p>
                              </div>
                            ) : (
                              <div>
                                <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                                <p className="text-lg font-medium text-gray-900 mb-1">
                                  患者データがありません
                                </p>
                                <p className="text-gray-500">
                                  まだ患者が登録されていません
                                </p>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* 統計情報 */}
        {!isLoading && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">総患者数</p>
                  <p className="text-2xl font-semibold text-gray-900">{customers.length}</p>
                </div>
              </div>
            </div> */}

            {/* <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">検索結果</p>
                  <p className="text-2xl font-semibold text-gray-900">{filteredCustomers.length}</p>
                </div>
              </div>
            </div> */}

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">今日の日付</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {new Date().toLocaleDateString('ja-JP')}
                  </p>
                </div>
              </div>
            </div>

            {/* ユーザー登録*/}

            <button
              onClick={() => router.push('/user_entry_customer')}
              className="bg-white rounded-lg shadow p-6 flex-shrink-0"
              // className="w-full bg-gradient-to-r from-blue-400 to-indigo-500 hover:from-blue-500 hover:to-indigo-600 text-white font-medium py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105"
            >
              <div className="flex items-center">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h2 className="ml-3 text-gray-800 text-lg font-medium">
                  ユーザー登録
                </h2>
              </div>
            </button>

          </div>
        )}
      </main>
    </div>
  );
}