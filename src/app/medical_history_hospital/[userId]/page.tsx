'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { requireAuth, User } from '@/lib/auth';
import { db } from '@/lib/firebase';
import { parseCompactDate, buildCompactDate, isValidDateParts } from '@/lib/dateUtils';

export const runtime = 'edge';

interface MedicalHistoryData {
  userId: string;
  history01?: string;
  history02?: string;
  history03?: string;
  history04?: string;
  history05?: string;
  history06?: string;
  history07?: string;
  history08?: string;
  unhistory01?: string;
  unhistory02?: string;
  unhistory03?: string;
  unhistory04?: string;
  unhistory05?: string;
  unhistory06?: string;
  unhistory07?: string;
  unhistory08?: string;
}

interface PatientInfo {
  baby_family_name: string;
  baby_first_name: string;
  consultation_id: string;
}

interface DateParts {
  year: string;
  month: string;
  day: string;
  hour: string;
  minute: string;
}

export default function MedicalHistoryPage() {
  const [user, setUser] = useState<User | null>(null);
  const [patientInfo, setPatientInfo] = useState<PatientInfo | null>(null);
  const [medicalHistory, setMedicalHistory] = useState<MedicalHistoryData | null>(null);
  const [formData, setFormData] = useState<Record<string, DateParts>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState<Record<string, boolean>>({});
  
  const router = useRouter();
  const params = useParams();
  const userId = params.userId as string;

  // 年の選択肢を生成（現在から150年前まで）
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 151 }, (_, i) => currentYear - i);

  // 月の選択肢（01-12）
  const monthOptions = Array.from({ length: 12 }, (_, i) => 
    (i + 1).toString().padStart(2, '0')
  );

  // 日の選択肢（01-31）
  const dayOptions = Array.from({ length: 31 }, (_, i) => 
    (i + 1).toString().padStart(2, '0')
  );

  // 時の選択肢（00-23）
  const hourOptions = Array.from({ length: 24 }, (_, i) => 
    i.toString().padStart(2, '0')
  );

  // 分の選択肢（00-59）
  const minuteOptions = Array.from({ length: 60 }, (_, i) => 
    i.toString().padStart(2, '0')
  );

  // loadData関数をuseCallbackでメモ化
  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);

      // 患者情報を取得
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setPatientInfo({
          baby_family_name: userData.baby_family_name || '',
          baby_first_name: userData.baby_first_name || '',
          consultation_id: userData.consultation_id || ''
        });
      }

      // 診察履歴を取得
      const historyDoc = await getDoc(doc(db, 'medicalhistorycoll', userId));
      if (historyDoc.exists()) {
        const historyData = historyDoc.data() as MedicalHistoryData;
        setMedicalHistory(historyData);
        
        // フォームデータを初期化
        const initialFormData: Record<string, DateParts> = {};
        for (let i = 1; i <= 8; i++) {
          const historyKey = `history${i.toString().padStart(2, '0')}`;
          const unhistoryKey = `unhistory${i.toString().padStart(2, '0')}`;
          
          initialFormData[historyKey] = parseCompactDate(historyData[historyKey as keyof MedicalHistoryData]);
          initialFormData[unhistoryKey] = parseCompactDate(historyData[unhistoryKey as keyof MedicalHistoryData]);
        }
        setFormData(initialFormData);
      } else {
        // ドキュメントが存在しない場合は初期化
        const emptyData: MedicalHistoryData = { userId };
        setMedicalHistory(emptyData);
        
        const initialFormData: Record<string, DateParts> = {};
        for (let i = 1; i <= 8; i++) {
          const historyKey = `history${i.toString().padStart(2, '0')}`;
          const unhistoryKey = `unhistory${i.toString().padStart(2, '0')}`;
          initialFormData[historyKey] = { year: '', month: '', day: '', hour: '', minute: '' };
          initialFormData[unhistoryKey] = { year: '', month: '', day: '', hour: '', minute: '' };
        }
        setFormData(initialFormData);
      }
    } catch (loadError) {
      console.error('Error loading data:', loadError);
    } finally {
      setIsLoading(false);
    }
  }, [userId]); // userIdが変更された時のみ再生成

  useEffect(() => {
    const currentUser = requireAuth();
    if (currentUser) {
      // if (currentUser.user_type !== 'hospital') {
      //   router.push('/top');
      //   return;
      // }
      setUser(currentUser);
      loadData();
    }
  }, [router, userId, loadData]); // loadDataを依存配列に追加

  const handleDatePartChange = (field: string, part: keyof DateParts, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: {
        ...prev[field],
        [part]: value
      }
    }));
    
    // エラーと成功状態をクリア
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
    if (success[field]) {
      setSuccess(prev => ({ ...prev, [field]: false }));
    }
  };

  const handleSave = async (field: string) => {
    const dateParts = formData[field];
    
    // バリデーション - 全項目が入力されているかチェック
    if (!dateParts.year || !dateParts.month || !dateParts.day || !dateParts.hour || !dateParts.minute) {
      setErrors(prev => ({ ...prev, [field]: 'すべての項目を入力してください' }));
      return;
    }
    
    if (!isValidDateParts(dateParts)) {
      setErrors(prev => ({ ...prev, [field]: '正しい日時を入力してください' }));
      return;
    }

    try {
      setIsSaving(prev => ({ ...prev, [field]: true }));
      setErrors(prev => ({ ...prev, [field]: '' }));

      const compactDate = buildCompactDate(dateParts);
      
      // Firestoreに保存
      const docRef = doc(db, 'medicalhistorycoll', userId);
      const updateData = {
        userId,
        [field]: compactDate
      };

      try {
        await updateDoc(docRef, updateData);
      } catch (updateError) {
        // ドキュメントが存在しない場合は新規作成
        console.log('Document not found, creating new one:', updateError);
        await setDoc(docRef, { ...medicalHistory, ...updateData });
      }

      // ローカル状態を更新
      setMedicalHistory(prev => ({
        ...prev!,
        [field]: compactDate
      }));

      setSuccess(prev => ({ ...prev, [field]: true }));

      // 3秒後に成功状態をクリア
      setTimeout(() => {
        setSuccess(prev => ({ ...prev, [field]: false }));
      }, 3000);

    } catch (saveError) {
      console.error('Error saving:', saveError);
      setErrors(prev => ({ ...prev, [field]: '保存中にエラーが発生しました' }));
    } finally {
      setIsSaving(prev => ({ ...prev, [field]: false }));
    }
  };

  const renderCard = (title: string, number: string, field: string, bgColor: string) => {
    const isError = !!errors[field];
    const isSuccess = !!success[field];
    const isSavingCard = !!isSaving[field];
    const dateParts = formData[field] || { year: '', month: '', day: '', hour: '', minute: '' };

    return (
      <div className={`${bgColor} rounded-lg shadow-md p-4 space-y-3 transition-all duration-200 ${isError ? 'ring-2 ring-red-300' : isSuccess ? 'ring-2 ring-green-300' : ''}`}>
        <div className="flex justify-between items-center">
          {/* <h3 className="font-medium text-gray-900">{title}</h3> */}
          <span className="text-sm font-bold text-gray-600">{number}回目</span>
        </div>
        
        <div className="space-y-3">
          {/* 年月日の入力 */}
          <div className="grid grid-cols-3 gap-2">
            {/* 年 */}
            <div className="flex items-center">
              <select
                value={dateParts.year}
                onChange={(e) => handleDatePartChange(field, 'year', e.target.value)}
                disabled={isSavingCard}
                className={`appearance-none w-full px-2 py-1 border rounded-md text-xs focus:outline-none focus:ring-1 transition-colors ${
                  isError 
                    ? 'border-red-300 focus:ring-red-500' 
                    : isSuccess 
                      ? 'border-green-300 focus:ring-green-500'
                      : 'border-gray-300 focus:ring-blue-500'
                }`}
              >
                <option value="" className="text-gray-40">yyyy</option>
                {yearOptions.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
              <div className="ml-1">
                年
              </div>
            </div>

            {/* 月 */}
            <div className="flex items-center">
              <select
                value={dateParts.month}
                onChange={(e) => handleDatePartChange(field, 'month', e.target.value)}
                disabled={isSavingCard}
                className={`appearance-none w-full px-2 py-1 border rounded-md text-xs focus:outline-none focus:ring-1 transition-colors ${
                  isError 
                    ? 'border-red-300 focus:ring-red-500' 
                    : isSuccess 
                      ? 'border-green-300 focus:ring-green-500'
                      : 'border-gray-300 focus:ring-blue-500'
                }`}
              >
                <option value="" className="text-gray-400">MM</option>
                {monthOptions.map(month => (
                  <option key={month} value={month}>{month}</option>
                ))}
              </select>
              <div className="ml-1">
                月
              </div>
            </div>

            {/* 日 */}
            <div className="flex items-center">
              <select
                value={dateParts.day}
                onChange={(e) => handleDatePartChange(field, 'day', e.target.value)}
                disabled={isSavingCard}
                className={`appearance-none w-full px-2 py-1 border rounded-md text-xs focus:outline-none focus:ring-1 transition-colors ${
                  isError 
                    ? 'border-red-300 focus:ring-red-500' 
                    : isSuccess 
                      ? 'border-green-300 focus:ring-green-500'
                      : 'border-gray-300 focus:ring-blue-500'
                }`}
              >
                <option value="" className="text-gray-400">dd</option>
                {dayOptions.map(day => (
                  <option key={day} value={day}>{day}</option>
                ))}
              </select>
              <div className="ml-1">
                日
              </div>
            </div>
          </div>

          {/* 時分の入力 */}
          <div className="grid grid-cols-2 gap-2">
            {/* 時 */}
            <div className="flex items-center">
              <select
                value={dateParts.hour}
                onChange={(e) => handleDatePartChange(field, 'hour', e.target.value)}
                disabled={isSavingCard}
                className={`appearance-none w-full px-2 py-1 border rounded-md text-xs focus:outline-none focus:ring-1 transition-colors ${
                  isError 
                    ? 'border-red-300 focus:ring-red-500' 
                    : isSuccess 
                      ? 'border-green-300 focus:ring-green-500'
                      : 'border-gray-300 focus:ring-blue-500'
                }`}
              >
                <option value="" className="text-gray-400">hh</option>
                {hourOptions.map(hour => (
                  <option key={hour} value={hour}>{hour}</option>
                ))}
              </select>
              <div className="ml-1">
                時
              </div>
            </div>

            {/* 分 */}
            <div className="flex items-center">
              <select
                value={dateParts.minute}
                onChange={(e) => handleDatePartChange(field, 'minute', e.target.value)}
                disabled={isSavingCard}
                className={`appearance-none w-full px-2 py-1 border rounded-md text-xs focus:outline-none focus:ring-1 transition-colors ${
                  isError 
                    ? 'border-red-300 focus:ring-red-500' 
                    : isSuccess 
                      ? 'border-green-300 focus:ring-green-500'
                      : 'border-gray-300 focus:ring-blue-500'
                }`}
              >
                <option value="" className="text-gray-400">mm</option>
                {minuteOptions.map(minute => (
                  <option key={minute} value={minute}>{minute}</option>
                ))}
              </select>
              <div className="ml-1">
                分
              </div>
            </div>
          </div>

          {isError && (
            <p className="text-xs text-red-600">{errors[field]}</p>
          )}
          
          {isSuccess && (
            <p className="text-xs text-green-600">保存されました</p>
          )}
        </div>

        {user?.user_type === 'hospital' && (
        <button
          onClick={() => handleSave(field)}
          disabled={isSavingCard}
          className={`w-full px-3 py-2 text-sm font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
            isSavingCard
              ? 'bg-gray-400 text-white cursor-not-allowed'
              : isSuccess
                ? 'bg-green-600 hover:bg-green-700 text-white focus:ring-green-500'
                : 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500'
          }`}
        >
          {isSavingCard ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-1"></div>
              保存中...
            </div>
          ) : (
            '登録'
          )}
        </button>
        )}
      </div>
    );
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">診察履歴を読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="fixed top-0 left-0 right-0 bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.back()}
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
              >
                <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                戻る
              </button>
              <h1 className="text-xl font-semibold text-gray-900">
                診察履歴管理
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {user.family_name} {user.first_name}様
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 患者情報 */}
        {patientInfo && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8 mt-8">
            {/* <h2 className="text-lg font-semibold text-gray-900 mb-4">患者情報</h2> */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-gray-500 text-base">患者名:</span>
                <span className="ml-2 text-gray-900 font-medium text-lg">
                  {patientInfo.baby_family_name} {patientInfo.baby_first_name}
                </span>
              </div>
              <div>
                <span className="text-gray-500 text-base">診察番号:</span>
                <span className="ml-2 text-gray-900 font-medium text-lg">
                  {patientInfo.consultation_id}
                </span>
              </div>
              {/* <div>
                <span className="text-gray-500">患者ID:</span>
                <span className="ml-2 text-gray-900 font-medium text-xs">
                  {userId}
                </span>
              </div> */}
            </div>
          </div>
        )}

        {/* 診察履歴カード */}
        <div className="grid grid-cols-2 gap-6">
          {/* 左列: 通常診療 */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-blue-900 text-center bg-blue-100 py-2 rounded-lg">
              通常診療
            </h3>
            {[1, 2, 3, 4, 5, 6, 7, 8].map(num => {
              const field = `history${num.toString().padStart(2, '0')}`;
              const number = num.toString().padStart(2, '0');
              return (
                <div key={field}>
                  {renderCard('通常診療', number, field, 'bg-blue-50')}
                </div>
              );
            })}
          </div>

          {/* 右列: 特別診療 */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-purple-900 text-center bg-purple-100 py-2 rounded-lg">
              特別診療
            </h3>
            {[1, 2, 3, 4, 5, 6, 7, 8].map(num => {
              const field = `unhistory${num.toString().padStart(2, '0')}`;
              const number = num.toString().padStart(2, '0');
              return (
                <div key={field}>
                  {renderCard('特別診療', number, field, 'bg-purple-50')}
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}