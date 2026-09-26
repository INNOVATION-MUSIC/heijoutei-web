// フロント /takeout の TAKEOUT_TIME_SLOTS と同じ時間枠（"11 : 30" 〜 "21 : 45"・15分刻み）
// 'use server' ファイルでは同期関数を export できないため、通常モジュールとして分離する。
import { TAKEOUT_TIME_SLOTS, breakTimeLabelsFor, defaultTimeSlotsFor } from '@/app/lib/takeoutData'

export function defaultTimeLabels(): string[] {
  return [...TAKEOUT_TIME_SLOTS]
}

// 新規に枠を作るときの既定の受付可否（休憩時間・店舗の受取開始前は受付不可）
export function isDefaultActive(label: string, storeSlug: string | undefined): boolean {
  return !breakTimeLabelsFor(storeSlug).includes(label) && defaultTimeSlotsFor(storeSlug).includes(label)
}
