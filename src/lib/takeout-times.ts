// フロント /takeout の TAKEOUT_TIME_SLOTS と同じ生成ルール（"11 : 30" 〜 "22 : 00"・30分刻み）
// 'use server' ファイルでは同期関数を export できないため、通常モジュールとして分離する。
export function defaultTimeLabels(): string[] {
  const slots: string[] = []
  for (let m = 11 * 60 + 30; m <= 22 * 60; m += 30) {
    const h = Math.floor(m / 60)
    const min = m % 60
    slots.push(`${String(h).padStart(2, '0')} : ${String(min).padStart(2, '0')}`)
  }
  return slots
}
