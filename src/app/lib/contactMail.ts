// お問い合わせメールの組み立て（お客様控え / 店舗・管理者通知）

export type ContactPayload = {
  name: string;
  kana: string;
  email: string;
  phone: string;
  inquiryType: string; // お問い合わせ種別
  store: string;       // ご利用予定店舗
  storeTel: string;    // ご利用予定店舗の電話番号
  storeHours: string;  // ご利用予定店舗の営業時間（行区切りは\n）
  storeClosedDays: string; // ご利用予定店舗の定休日
  message: string;     // お問合せ内容
};

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

/** 複数行の営業時間をプレーンテキスト整形（2行目以降を字下げ） */
function hoursText(hours: string): string {
  return (hours || "").split("\n").filter(Boolean).join("\n　　　　　");
}

function storeContactBlock(o: ContactPayload): string {
  return `${o.store}　${o.storeTel}
営業時間　${hoursText(o.storeHours) || "店舗までお問い合わせください"}
定休日　　${o.storeClosedDays || "-"}`;
}

function detailsHtml(o: ContactPayload): string {
  return `
  <table style="width:100%;border-collapse:collapse;font-size:14px;">
    <tr><td style="padding:6px 0;color:#888;width:140px;">お名前</td><td style="padding:6px 0;color:#333;">${escapeHtml(o.name)}</td></tr>
    <tr><td style="padding:6px 0;color:#888;">フリガナ</td><td style="padding:6px 0;color:#333;">${escapeHtml(o.kana)}</td></tr>
    <tr><td style="padding:6px 0;color:#888;">メールアドレス</td><td style="padding:6px 0;color:#333;">${escapeHtml(o.email)}</td></tr>
    <tr><td style="padding:6px 0;color:#888;">電話番号</td><td style="padding:6px 0;color:#333;">${escapeHtml(o.phone || "（未入力）")}</td></tr>
    <tr><td style="padding:6px 0;color:#888;">お問い合わせ種別</td><td style="padding:6px 0;color:#333;">${escapeHtml(o.inquiryType)}</td></tr>
    <tr><td style="padding:6px 0;color:#888;">ご利用予定店舗</td><td style="padding:6px 0;color:#333;">${escapeHtml(o.store)}</td></tr>
    <tr><td style="padding:6px 0;color:#888;vertical-align:top;">お問合せ内容</td><td style="padding:6px 0;color:#333;white-space:pre-wrap;">${escapeHtml(o.message || "（なし）")}</td></tr>
  </table>`;
}

function detailsText(o: ContactPayload): string {
  return `お名前　　　　　：${o.name}
フリガナ　　　　：${o.kana}
メールアドレス　：${o.email}
電話番号　　　　：${o.phone || "（未入力）"}
お問い合わせ種別：${o.inquiryType}
ご利用予定店舗　：${o.store}
お問合せ内容　　：
${o.message || "（なし）"}`;
}

/** お客様控えメール（自動返信） */
export function buildContactCustomerMail(o: ContactPayload): { subject: string; text: string; html: string } {
  const subject = "【焼肉平壌亭】お問い合わせを承りました";
  const text = `${o.name} 様

この度はお問い合わせをいただき、誠にありがとうございます。
以下の内容で承りました。内容を確認のうえ、担当者より改めてご連絡いたします。
お問い合わせ内容によっては、ご返信までにお時間をいただく場合がございます。

［お問い合わせ内容］
${detailsText(o)}

ご予約の変更やキャンセルなどお急ぎの場合は、
お手数ではございますがお電話にてお願いいたします。

${storeContactBlock(o)}

焼肉平壌亭
※ このメールは送信専用です。`;

  const html = baseHtml(
    "お問い合わせを承りました",
    `<p style="font-size:14px;color:#333;line-height:1.9;margin:0 0 16px;">${escapeHtml(o.name)} 様<br/>この度はお問い合わせをいただき、誠にありがとうございます。以下の内容で承りました。内容を確認のうえ、担当者より改めてご連絡いたします。</p>
     ${detailsHtml(o)}
     <p style="font-size:13px;color:#555;line-height:1.9;margin:20px 0 0;">ご予約の変更やキャンセルなどお急ぎの場合は、<strong>${escapeHtml(o.store)}　${escapeHtml(o.storeTel)}</strong> までお電話ください。</p>
     <p style="font-size:12px;color:#777;line-height:1.8;margin:8px 0 0;white-space:pre-wrap;">営業時間　${escapeHtml(o.storeHours) || "店舗までお問い合わせください"}
定休日　　${escapeHtml(o.storeClosedDays) || "-"}</p>`
  );
  return { subject, text, html };
}

/** 店舗・管理者通知メール */
export function buildContactStoreMail(o: ContactPayload): { subject: string; text: string; html: string } {
  const subject = `【お問い合わせ】${o.inquiryType} ${o.name}様`;
  const text = `Webサイトから新規のお問い合わせが入りました。

［お問い合わせ内容］
${detailsText(o)}
`;

  const html = baseHtml(
    "お問い合わせ 新規受付",
    `<p style="font-size:14px;color:#333;line-height:1.9;margin:0 0 16px;">Webサイトから新規のお問い合わせが入りました。</p>
     ${detailsHtml(o)}`
  );
  return { subject, text, html };
}
