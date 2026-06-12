// テイクアウト注文メールの組み立て（お客様控え / 店舗通知）

export type OrderItem = { name: string; price: number; qty: number };

export type OrderPayload = {
  store: string;        // 店舗名（例: 亀岡店）
  storeTel: string;     // 店舗電話番号
  dateLabel: string;    // 受取日時（例: 6月15日(月) 13:00）
  items: OrderItem[];
  total: number;
  customer: {
    name: string;
    kana: string;
    email: string;
    phone: string;
    note: string;
  };
  // DB 保存用（メール本文には未使用・任意）。フロントから店舗 slug・受取日(ISO)・時刻を渡す。
  storeSlug?: string;
  pickupDate?: string;  // "YYYY-MM-DD"
  pickupTime?: string;  // "13:00"
};

const yen = (n: number) => `${n.toLocaleString("ja-JP")}円`;

/** 注文明細をテキスト整形 */
function itemsText(items: OrderItem[]): string {
  return items.map((i) => `・${i.name}　${yen(i.price)} × ${i.qty}点`).join("\n");
}

/** 注文明細を HTML 整形 */
function itemsHtml(items: OrderItem[]): string {
  return items
    .map(
      (i) =>
        `<tr><td style="padding:6px 0;color:#333;">${escapeHtml(i.name)}</td><td style="padding:6px 0;text-align:right;color:#333;white-space:nowrap;">${yen(i.price)} × ${i.qty}点</td></tr>`
    )
    .join("");
}

function escapeHtml(s: string): string {
  return String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c] as string));
}

function baseHtml(title: string, bodyHtml: string): string {
  return `<!doctype html><html lang="ja"><body style="margin:0;background:#f4f2ee;padding:24px;font-family:'Hiragino Mincho ProN','Yu Mincho',serif;">
  <div style="max-width:600px;margin:0 auto;background:#fff;border-top:3px solid #d9b86b;padding:32px 28px;">
    <h1 style="font-size:18px;letter-spacing:1px;color:#1a1a1a;margin:0 0 20px;">${escapeHtml(title)}</h1>
    ${bodyHtml}
    <hr style="border:none;border-top:1px solid #e5e1d8;margin:28px 0 16px;" />
    <p style="font-size:12px;color:#999;line-height:1.8;margin:0;">焼肉平壌亭（亀岡・園部・福知山・焼肉ゆらの）<br/>※ このメールは送信専用です。ご返信いただいてもお答えできません。</p>
  </div>
</body></html>`;
}

function summaryHtml(o: OrderPayload): string {
  return `
  <table style="width:100%;border-collapse:collapse;font-size:14px;margin:0 0 8px;">
    <tr><td style="padding:6px 0;color:#888;width:120px;">受取店舗</td><td style="padding:6px 0;color:#333;">${escapeHtml(o.store)}</td></tr>
    <tr><td style="padding:6px 0;color:#888;">受取日時</td><td style="padding:6px 0;color:#333;">${escapeHtml(o.dateLabel)}</td></tr>
  </table>
  <h2 style="font-size:14px;color:#b0322d;margin:20px 0 6px;">ご注文内容</h2>
  <table style="width:100%;border-collapse:collapse;font-size:14px;border-top:1px solid #e5e1d8;">
    ${itemsHtml(o.items)}
    <tr><td style="padding:10px 0 0;border-top:1px solid #e5e1d8;font-weight:bold;color:#1a1a1a;">合計</td><td style="padding:10px 0 0;border-top:1px solid #e5e1d8;text-align:right;font-weight:bold;color:#1a1a1a;">${yen(o.total)}</td></tr>
  </table>`;
}

/** お客様控えメール */
export function buildCustomerMail(o: OrderPayload): { subject: string; text: string; html: string } {
  const subject = "【焼肉平壌亭】テイクアウトのご注文を承りました";
  const text = `${o.customer.name} 様

この度はテイクアウトのご注文をいただき、誠にありがとうございます。
以下の内容で承りました。

【受取店舗】${o.store}
【受取日時】${o.dateLabel}

［ご注文内容］
${itemsText(o.items)}
合計　${yen(o.total)}

お支払いは店頭・お受け取り時にお願いいたします。
ご注文内容のご確認やご変更は、下記までお電話ください。

${o.store}　${o.storeTel}
受付時間　10:00〜21:30

スタッフ一同、ご来店を心よりお待ちしております。

焼肉平壌亭
※ このメールは送信専用です。`;

  const html = baseHtml(
    "テイクアウトのご注文を承りました",
    `<p style="font-size:14px;color:#333;line-height:1.9;margin:0 0 16px;">${escapeHtml(o.customer.name)} 様<br/>この度はテイクアウトのご注文をいただき、誠にありがとうございます。以下の内容で承りました。</p>
     ${summaryHtml(o)}
     <p style="font-size:13px;color:#555;line-height:1.9;margin:20px 0 0;">お支払いは店頭・お受け取り時にお願いいたします。<br/>ご確認・ご変更は <strong>${escapeHtml(o.store)}　${escapeHtml(o.storeTel)}</strong>（受付 10:00〜21:30）までお電話ください。</p>`
  );
  return { subject, text, html };
}

/** 店舗通知メール */
export function buildStoreMail(o: OrderPayload): { subject: string; text: string; html: string } {
  const subject = `【テイクアウト注文】${o.store} ${o.dateLabel} ${o.customer.name}様`;
  const text = `テイクアウトの新規注文が入りました。

【受取店舗】${o.store}
【受取日時】${o.dateLabel}

［ご注文内容］
${itemsText(o.items)}
合計　${yen(o.total)}

［お客様情報］
お名前　　　：${o.customer.name}
フリガナ　　：${o.customer.kana}
メール　　　：${o.customer.email}
電話番号　　：${o.customer.phone || "（未入力）"}
連絡事項　　：${o.customer.note || "（なし）"}
`;

  const html = baseHtml(
    "テイクアウト 新規注文",
    `${summaryHtml(o)}
     <h2 style="font-size:14px;color:#b0322d;margin:24px 0 6px;">お客様情報</h2>
     <table style="width:100%;border-collapse:collapse;font-size:14px;">
       <tr><td style="padding:6px 0;color:#888;width:120px;">お名前</td><td style="padding:6px 0;color:#333;">${escapeHtml(o.customer.name)}</td></tr>
       <tr><td style="padding:6px 0;color:#888;">フリガナ</td><td style="padding:6px 0;color:#333;">${escapeHtml(o.customer.kana)}</td></tr>
       <tr><td style="padding:6px 0;color:#888;">メール</td><td style="padding:6px 0;color:#333;">${escapeHtml(o.customer.email)}</td></tr>
       <tr><td style="padding:6px 0;color:#888;">電話番号</td><td style="padding:6px 0;color:#333;">${escapeHtml(o.customer.phone || "（未入力）")}</td></tr>
       <tr><td style="padding:6px 0;color:#888;vertical-align:top;">連絡事項</td><td style="padding:6px 0;color:#333;white-space:pre-wrap;">${escapeHtml(o.customer.note || "（なし）")}</td></tr>
     </table>`
  );
  return { subject, text, html };
}
