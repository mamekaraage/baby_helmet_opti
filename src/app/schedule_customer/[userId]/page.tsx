
'use client'
import { useMemo, useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { getFirestore, collection, doc, getDoc, setDoc, updateDoc, query, where, getDocs } from 'firebase/firestore'
import app from '@/lib/firebase'

export const runtime = 'edge'

// 30分単位のスロットを 24h * 2 = 48 個
const SLOTS_PER_DAY = 48

// 日曜始まりの週を返す
function startOfWeek(d: Date) {
  const date = new Date(d)
  const day = date.getDay() // 0(日) - 6(土)
  const diff = date.getDate() - day // 日曜始まり
  const s = new Date(date.setDate(diff))
  s.setHours(0, 0, 0, 0)
  return s
}

function addDays(d: Date, days: number) {
  const nd = new Date(d)
  nd.setDate(nd.getDate() + days)
  return nd
}

function formatLabel(d: Date) {
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${mm}/${dd}`
}

function weekdayJa(d: Date) {
  return ['日','月','火','水','木','金','土'][d.getDay()]
}

// Firestore の schedulecoll/{userId} ドキュメントに保存するデータ形
// 例: { statusMap: { '2025-08-25T09:30': 1, ... } }
interface ScheduleDoc {
  statusMap?: Record<string, 0 | 1>
}

interface UserDoc {
  baby_family_name?: string
  baby_first_name?: string
  consultation_id?: string
  userId?: string
}

export default function SchedulePage() {
  const params = useParams<{ userId: string }>()
  const router = useRouter()
  const userId = decodeURIComponent(params.userId)

  const db = useMemo(() => getFirestore(app), [])

  const [weekAnchor, setWeekAnchor] = useState<Date>(() => new Date())
  const weekStart = useMemo(() => startOfWeek(weekAnchor), [weekAnchor])
  const days = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)), [weekStart])

  // 表示用：セルの状態（保存済み=1 を青500、未保存の変更=青300、0=白）
  const [persistedMap, setPersistedMap] = useState<Record<string, 0 | 1>>({})
  const [pendingMap, setPendingMap] = useState<Record<string, 0 | 1>>({})

  // ユーザー基本情報（ヘッダ表示用）
  const [user, setUser] = useState<UserDoc | null>(null)

  // 週が変わったら Firestore から状態を取得
  const loadWeek = useCallback(async () => {
    // 週の 7 日 * 48 スロットぶんのキーを生成
    const keys: string[] = []
    for (let d = 0; d < 7; d++) {
      const base = addDays(weekStart, d)
      for (let i = 0; i < SLOTS_PER_DAY; i++) {
        const hh = Math.floor(i / 2)
        const mm = i % 2 === 0 ? 0 : 30
        const dt = new Date(base)
        dt.setHours(hh, mm, 0, 0)
        // 保存キーはローカル時間の ISO っぽい表現（秒以下なし）
        const key = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}T${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`
        keys.push(key)
      }
    }

    const schedRef = doc(collection(db, 'schedulecoll'), userId)
    const snap = await getDoc(schedRef)
    const data = (snap.exists() ? (snap.data() as ScheduleDoc) : { statusMap: {} })
    const current = data.statusMap ?? {}

    // 表示週に関係あるキーのみ抽出（それ以外は無視）
    const filtered: Record<string, 0 | 1> = {}
    for (const k of keys) {
      filtered[k] = current[k] ?? 0
    }
    setPersistedMap(filtered)
    setPendingMap({}) // 週変更のたびに未保存差分はクリア
  }, [db, userId, weekStart])

  // ユーザー表示情報
  const loadUser = useCallback(async () => {
    const ref = doc(db, 'users', userId)
    const snap = await getDoc(ref)
    if (snap.exists()) {
      setUser(snap.data() as UserDoc)
    } else {
      setUser(null)
    }
  }, [db, userId])

  useEffect(() => {
    loadWeek()
  }, [loadWeek])

  useEffect(() => {
    loadUser()
  }, [loadUser])

  const slotKey = (date: Date, idx: number) => {
    const hh = Math.floor(idx / 2)
    const mm = idx % 2 === 0 ? 0 : 30
    const dt = new Date(date)
    dt.setHours(hh, mm, 0, 0)
    return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}T${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`
  }

  const slotState = (key: string): 0 | 1 | 2 => {
    // 0=白、1=未保存選択(青300)、2=保存済み(青500)
    if (key in pendingMap) {
      return pendingMap[key] === 1 ? 1 : 0
    }
    return (persistedMap[key] ?? 0) === 1 ? 2 : 0
  }

  const handleCellClick = (key: string) => {
    const current = slotState(key)
    // 仕様：
    // ・白(0) をクリック -> 青300（未保存 1）
    // ・青300 をクリック -> 白(0)
    // ・青500 をクリック -> 白(0)
    if (current === 0) {
      setPendingMap(prev => ({ ...prev, [key]: 1 }))
    } else if (current === 1) {
      setPendingMap(prev => {
        const n = { ...prev }
        delete n[key]
        return n
      })
    } else if (current === 2) {
      // 保存済みをクリックしたら 0 に変更する pending を置く
      setPendingMap(prev => ({ ...prev, [key]: 0 }))
    }
  }

  const hasChanges = useMemo(() => {
    // pendingMap に入っているものが差分
    return Object.keys(pendingMap).length > 0
  }, [pendingMap])

  const applyUpdate = async () => {
    if (!hasChanges) return
    const ok = window.confirm('更新しますか？')
    if (!ok) return

    const schedRef = doc(collection(db, 'schedulecoll'), userId)
    const snap = await getDoc(schedRef)
    const current = snap.exists() ? ((snap.data() as ScheduleDoc).statusMap ?? {}) : {}

    // 差分を適用
    const next: Record<string, 0 | 1> = { ...current }
    for (const [k, v] of Object.entries(pendingMap)) {
      if (v === 0) next[k] = 0
      else next[k] = 1
    }

    const payload: ScheduleDoc = { statusMap: next }
    if (!snap.exists()) await setDoc(schedRef, payload)
    else await updateDoc(schedRef, payload as any)

    // 画面状態更新：pending -> persisted（青300 -> 青500 / 白へ）
    const newPersisted: Record<string, 0 | 1> = { ...persistedMap }
    for (const [k, v] of Object.entries(pendingMap)) {
      newPersisted[k] = v
    }
    setPersistedMap(newPersisted)
    setPendingMap({})
  }

  const goThisWeek = () => setWeekAnchor(new Date())
  const goPrevWeek = () => setWeekAnchor(prev => addDays(prev, -7))
  const goNextWeek = () => setWeekAnchor(prev => addDays(prev, 7))

  const isToday = (d: Date) => {
    const t = new Date()
    return t.getFullYear() === d.getFullYear() && t.getMonth() === d.getMonth() && t.getDate() === d.getDate()
  }

  return (
    <main className="max-w-6xl mx-auto p-3 md:p-6">
      {/* ヘッダ */}
      <div className="flex flex-col gap-1 md:flex-row md:items-end md:justify-between">
        <div>
          <button
            onClick={() => router.push('/top_hospital')}
            className="mr-4 text-gray-500 hover:text-gray-700"
          >
            ← 戻る
          </button>
          <h1 className="text-xl md:text-2xl font-semibold">カレンダー（ヘルメット利用時間記録）</h1>
          <div className="text-sm md:text-base text-gray-600 mt-1">
            <span className="mr-4">患者名：{user ? `${user.baby_family_name ?? ''} ${user.baby_first_name ?? ''}`.trim() || '-' : '-'}</span>
            <span>診察番号：{user?.consultation_id ?? '-'}</span>
          </div>
        </div>

        {/* コントロール群 */}
        <div className="flex items-center gap-2 mt-3 md:mt-0">
          <button onClick={goThisWeek} className="px-3 py-2 rounded-2xl border border-gray-300 hover:bg-gray-50">今週</button>
          <button onClick={goPrevWeek} className="px-3 py-2 rounded-2xl border border-gray-300 hover:bg-gray-50">&lt;</button>
          <button onClick={goNextWeek} className="px-3 py-2 rounded-2xl border border-gray-300 hover:bg-gray-50">&gt;</button>
          <div className="grow" />
          <button
            onClick={applyUpdate}
            disabled={!hasChanges}
            className={`px-4 py-2 rounded-2xl shadow-sm ${hasChanges ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-gray-200 text-gray-500 cursor-not-allowed'}`}
          >更新</button>
        </div>
      </div>

      {/* カレンダー本体 */}
      <div className="mt-4 rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
        {/* 週ヘッダ（日付 + 曜日） */}
        <div className="grid" style={{ gridTemplateColumns: '80px repeat(7, 1fr)' }}>
          <div className="bg-gray-50 py-3 px-2 text-xs text-gray-500">時間</div>
          {days.map((d, idx) => (
            <div key={idx} className="bg-gray-50 py-2 px-2 text-center">
              <div className="text-[10px] md:text-xs text-gray-500">{weekdayJa(d)}</div>
              <div className={`text-sm md:text-base font-medium ${isToday(d) ? 'text-blue-700' : ''}`}>
                {/* 当日は数字を強調 */}
                <span className={`${isToday(d) ? 'px-2 py-0.5 rounded-full bg-blue-100' : ''}`}>{formatLabel(d)}</span>
              </div>
            </div>
          ))}
        </div>

        {/* スクロール領域 */}
        <div className="max-h-[70vh] overflow-y-auto">
          {/* 30分ごとの行を生成 */}
          {Array.from({ length: SLOTS_PER_DAY }).map((_, rowIdx) => (
            <div key={rowIdx} className="grid" style={{ gridTemplateColumns: '80px repeat(7, 1fr)' }}>
              {/* 左の時間ラベル */}
              <div className="border-t px-2 py-2 text-right text-xs md:text-sm text-gray-600 select-none">
                {`${String(Math.floor(rowIdx / 2)).padStart(2, '0')}:${rowIdx % 2 === 0 ? '00' : '30'}`}
                {/* {rowIdx % 2 === 1 && <span className="text-[10px] md:text-xs text-gray-400 ml-1">（30）</span>} */}
              </div>

              {/* 7日 * セル */}
              {days.map((d, colIdx) => {
                const key = slotKey(d, rowIdx)
                const state = slotState(key) // 0=白、1=青300、2=青500
                const bg = state === 0 ? 'bg-white' : state === 1 ? 'bg-blue-300' : 'bg-blue-500'
                const hover = state === 0 ? 'hover:bg-blue-50' : 'hover:opacity-90'
                return (
                  <button
                    key={`${colIdx}-${rowIdx}`}
                    onClick={() => handleCellClick(key)}
                    className={`border-t border-l px-1 py-4 ${bg} ${hover} focus:outline-none active:scale-[0.995] transition-colors`}
                    aria-label={`${formatLabel(d)} ${String(Math.floor(rowIdx / 2)).padStart(2, '0')}:${rowIdx % 2 === 0 ? '00' : '30'}`}
                  />
                )
              })}
            </div>
          ))}
        </div>
      </div>

      {/* 凡例 */}
      <div className="flex items-center gap-4 text-xs text-gray-600 mt-3">
        <div className="flex items-center gap-2"><span className="w-4 h-4 inline-block bg-white border"/>未選択（0）</div>
        <div className="flex items-center gap-2"><span className="w-4 h-4 inline-block bg-blue-300 border"/>未保存の選択</div>
        <div className="flex items-center gap-2"><span className="w-4 h-4 inline-block bg-blue-500 border"/>保存済み（1）</div>
      </div>
    </main>
  )
}