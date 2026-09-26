/**
 * ScaledSection 等のスケール計算に使うビューポート幅。
 * iOS Safari はピンチ拡大中に window.innerWidth が拡大後の可視幅へ縮み resize も発火するため、
 * そのまま使うと拡大のたびにスケールが再計算されてレイアウトがズレる。
 * 拡大中は visualViewport から拡大前の幅（レイアウトビューポート幅）を復元して返す。
 */
export function viewportWidth(): number {
  const vv = window.visualViewport;
  if (vv && vv.scale > 1.01) return Math.round(vv.width * vv.scale);
  return window.innerWidth;
}
