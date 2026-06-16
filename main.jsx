import React, { useState, useMemo, useRef } from "react";

/* ------------------------------------------------------------------ */
/*  FX 急変ポスト・ジェネレーター（やさしい版）                         */
/*  APIなし。入力→「作成する」ボタンで文章を生成する純フロント実装     */
/*  構成: まず結論（買い/売り/様子見）→ そのあと「なぜ/この後」解説     */
/*  きっかけ欄が空なら「理由不明の急変」用の文章に自動で切り替わる      */
/* ------------------------------------------------------------------ */

const MOVED = {
  上: { verb: "急騰しています", word: "急騰しました" },
  下: { verb: "急落しています", word: "急落しました" },
  大きく: { verb: "大きく動いています", word: "大きく動きました" },
};

const SAMPLE = {
  pair: "ドル円",
  price: "160.50",
  moved: "上",
  cause: "日銀の利上げ発表（事前に織り込み済み）",
  stance: "ショート",
  comment: "",
  hashtags: "#ドル円 #FX",
};

const EMPTY = {
  pair: "",
  price: "",
  moved: "上",
  cause: "",
  stance: "様子見",
  comment: "",
  hashtags: "#FX",
};

function buildPost(d) {
  const pair = d.pair || "対象銘柄";
  const m = MOVED[d.moved] || MOVED["大きく"];
  const known = d.cause.trim().length > 0;

  let title;
  if (d.stance === "様子見") {
    title = `【${pair}】今は飛び乗らない。様子見が正解です。`;
  } else if (d.stance === "ロング") {
    title = `【${pair}】${d.price ? `${d.price}から、` : ""}自分はここから「買い」目線。`;
  } else {
    title = `【${pair}】${d.price ? `${d.price}から、` : ""}自分はここから「売り」目線。`;
  }

  const moved = `${pair}が${d.price ? `${d.price}まで` : ""}${m.verb}。`;

  let conclusion, tone;
  if (d.stance === "ロング") {
    conclusion = `今の流れに乗って「買い（ロング）」で見ています。`;
    tone = "long";
  } else if (d.stance === "ショート") {
    conclusion = `今の流れに乗って「売り（ショート）」で見ています。`;
    tone = "short";
  } else {
    conclusion = `今は動かず「様子見」。落ち着くまで待ちます。`;
    tone = "watch";
  }

  let why;
  if (known) {
    why = `きっかけは「${d.cause}」。これを受けて${pair}が${m.word}。`;
  } else {
    why = `正直に言うと、今は決定的な材料が見当たりません。こういう「理由のはっきりしない急な動き」は、行き過ぎてすぐ戻ることもよくあります。だからこそ、飛び乗りは禁物です。`;
  }

  let how;
  if (d.stance === "様子見") {
    how = `無理にエントリーしません。方向がはっきりして「ここだ」と思える形になるまで待ちます。待つのも立派なトレードです。`;
  } else {
    const side = d.stance === "ロング" ? "上" : "下";
    how = `${side}に向かう流れについていきます。ただし必ず損切り（逆に動いたら撤退する価格）を先に決めてから入ること。`;
    if (!known) how += ` 特に今回は理由が見えない動きなので、いつもより小さめのサイズで。`;
  }

  return { title, moved, conclusion, tone, why, how, comment: d.comment, hashtags: d.hashtags };
}

function postToText(p, mode, withImage) {
  const out = [];
  out.push(p.title);
  out.push(p.moved);
  out.push(`まず結論から。\n→ ${p.conclusion}`);
  if (mode === "フル") {
    out.push("ーーーー");
    out.push(`なぜ動いた？\n${p.why}`);
    out.push(`この後どうする？\n${p.how}`);
  }
  if (p.comment) out.push(p.comment);
  if (withImage) out.push("🔻チャートは画像で👇");
  if (p.hashtags) out.push(p.hashtags);
  return out.filter(Boolean).join("\n\n");
}

/* ------------------------------ styles ------------------------------ */
const css = `
.gen *{box-sizing:border-box;}
.gen{
  --bg:#F4F7FC;--card:#FFFFFF;--line:#E4E9F2;--soft:#F0F4FA;
  --ink:#1A2433;--muted:#6A7686;--faint:#9AA6B6;
  --accent:#2F6BFF;--accentSoft:#E8F0FF;
  --long:#0FA968;--longSoft:#E6F6EF;
  --short:#E5484D;--shortSoft:#FCEBEB;
  --watch:#C7820B;--watchSoft:#FBF1DE;
  font-family:"Hiragino Kaku Gothic ProN","Hiragino Sans","Noto Sans JP","Yu Gothic",Meiryo,system-ui,sans-serif;
  color:var(--ink);background:var(--bg);min-height:100vh;padding:28px 20px 64px;
}
.gen .inner{max-width:1060px;margin:0 auto;}
.gen .head{display:flex;align-items:center;gap:11px;flex-wrap:wrap;}
.gen .dot{width:10px;height:10px;border-radius:50%;background:var(--accent);box-shadow:0 0 0 4px var(--accentSoft);}
.gen h1{font-size:21px;font-weight:800;letter-spacing:.01em;margin:0;}
.gen .tag{color:var(--muted);font-size:13px;margin:9px 0 24px;line-height:1.7;}
.gen .grid{display:grid;grid-template-columns:1fr 1fr;gap:20px;align-items:start;}
@media(max-width:860px){.gen .grid{grid-template-columns:1fr;}}

.gen .card{background:var(--card);border:1px solid var(--line);border-radius:16px;padding:20px;box-shadow:0 1px 2px rgba(20,40,80,.04);}
.gen .sec{margin-bottom:20px;}
.gen .sec:last-child{margin-bottom:0;}
.gen .eyebrow{font-size:11px;letter-spacing:.12em;color:var(--accent);font-weight:800;margin:0 0 12px;display:flex;align-items:center;gap:8px;}
.gen .eyebrow .num{font-variant-numeric:tabular-nums;}
.gen label{display:block;font-size:12.5px;color:var(--muted);font-weight:600;margin:0 0 6px;}
.gen .row{display:flex;gap:11px;}
.gen .row > *{flex:1;min-width:0;}
.gen .field{margin-bottom:14px;}
.gen input,.gen select,.gen textarea{
  width:100%;background:var(--card);border:1px solid var(--line);color:var(--ink);
  border-radius:10px;padding:11px 12px;font-size:14px;font-family:inherit;outline:none;
  transition:border-color .12s,box-shadow .12s;
}
.gen select{appearance:none;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%236A7686' stroke-width='1.6' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 12px center;padding-right:32px;}
.gen textarea{resize:vertical;min-height:60px;line-height:1.6;}
.gen input:focus,.gen select:focus,.gen textarea:focus{border-color:var(--accent);box-shadow:0 0 0 3px var(--accentSoft);}
.gen input::placeholder,.gen textarea::placeholder{color:var(--faint);}
.gen .hint{font-size:11.5px;color:var(--faint);margin-top:6px;line-height:1.5;}

.gen .btns{display:flex;gap:9px;flex-wrap:wrap;}
.gen button{font-family:inherit;cursor:pointer;border-radius:10px;font-size:13px;font-weight:700;padding:10px 15px;border:1px solid var(--line);background:var(--card);color:var(--ink);transition:background .12s,border-color .12s,transform .04s;}
.gen button:hover{background:var(--soft);}
.gen button:active{transform:translateY(1px);}
.gen button:focus-visible{outline:2px solid var(--accent);outline-offset:2px;}
.gen button.primary{background:var(--accent);color:#fff;border-color:var(--accent);width:100%;padding:14px;font-size:15px;}
.gen button.primary:hover{background:#1d57ec;}
.gen .cta{margin-top:18px;padding-top:18px;border-top:1px solid var(--line);}
.gen .dirty{font-size:11.5px;color:var(--watch);margin-top:10px;line-height:1.5;font-weight:600;text-align:center;}

.gen .preview{position:sticky;top:20px;}
.gen .pvbar{display:flex;align-items:center;justify-content:space-between;margin-bottom:11px;gap:10px;flex-wrap:wrap;}
.gen .seg{display:inline-flex;background:var(--soft);border:1px solid var(--line);border-radius:9px;padding:3px;gap:3px;}
.gen .seg button{padding:6px 12px;font-size:12px;border:none;border-radius:6px;color:var(--muted);background:transparent;font-weight:700;}
.gen .seg button.on{background:var(--card);color:var(--ink);box-shadow:0 1px 2px rgba(20,40,80,.08);}
.gen .count{font-size:12px;color:var(--muted);font-variant-numeric:tabular-nums;}

.gen .xcard{background:var(--card);border:1px solid var(--line);border-radius:16px;padding:20px;box-shadow:0 1px 2px rgba(20,40,80,.04);}
.gen .ptitle{font-size:17px;font-weight:800;line-height:1.55;color:var(--ink);margin:0 0 10px;}
.gen .pmoved{font-size:13.5px;color:var(--muted);line-height:1.7;margin:0 0 14px;}
.gen .concl{border-radius:12px;padding:13px 15px;margin:0 0 4px;border:1px solid;}
.gen .concl .lab{font-size:11px;font-weight:800;letter-spacing:.06em;margin:0 0 5px;}
.gen .concl .txt{font-size:14.5px;font-weight:700;line-height:1.6;margin:0;}
.gen .concl.long{background:var(--longSoft);border-color:#bfe6d3;}
.gen .concl.long .lab{color:var(--long);}
.gen .concl.short{background:var(--shortSoft);border-color:#f3c9cb;}
.gen .concl.short .lab{color:var(--short);}
.gen .concl.watch{background:var(--watchSoft);border-color:#ecd9af;}
.gen .concl.watch .lab{color:var(--watch);}
.gen .divider{border:none;border-top:1px dashed var(--line);margin:17px 0;}
.gen .block{margin-bottom:15px;}
.gen .block:last-of-type{margin-bottom:0;}
.gen .bhead{font-size:13.5px;font-weight:800;margin:0 0 4px;color:var(--ink);}
.gen .bbody{font-size:13px;color:var(--muted);line-height:1.75;white-space:pre-wrap;margin:0;}
.gen .pcomment{font-size:13.5px;color:var(--ink);line-height:1.7;margin:15px 0 0;}
.gen .pimg{font-size:13px;color:var(--ink);margin:15px 0 8px;}
.gen .ptags{font-size:13px;color:var(--accent);font-weight:700;margin:0;}
.gen .imgnote{font-size:11.5px;color:var(--faint);margin-top:16px;line-height:1.6;border-top:1px solid var(--line);padding-top:13px;}
.gen .toast{font-size:12.5px;color:var(--long);min-height:16px;margin-top:9px;font-weight:700;}

.gen .empty{background:var(--card);border:1px dashed #cfd8e6;border-radius:16px;padding:54px 24px;text-align:center;}
.gen .empty .emoji{font-size:30px;margin-bottom:14px;}
.gen .empty p{font-size:13.5px;color:var(--faint);line-height:1.85;margin:0;}
.gen .loadcard{background:var(--card);border:1px solid var(--line);border-radius:16px;padding:54px 24px;text-align:center;box-shadow:0 1px 2px rgba(20,40,80,.04);}
.gen .spinner{width:30px;height:30px;border-radius:50%;border:3px solid var(--accentSoft);border-top-color:var(--accent);margin:0 auto 15px;animation:spin .8s linear infinite;}
.gen .loadcard p{font-size:13.5px;color:var(--muted);margin:0;font-weight:700;}
@keyframes spin{to{transform:rotate(360deg);}}
.gen .reveal{animation:fade .38s ease;}
@keyframes fade{from{opacity:0;transform:translateY(7px);}to{opacity:1;transform:none;}}
@media(prefers-reduced-motion:reduce){.gen *{transition:none!important;}.gen .spinner{animation:none;}.gen .reveal{animation:none;}}
`;

function Field({ label, value, onChange, placeholder, hint }) {
  return (
    <div className="field">
      <label>{label}</label>
      <input value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
      {hint && <div className="hint">{hint}</div>}
    </div>
  );
}

function Pick({ label, value, onChange, options, hint }) {
  return (
    <div className="field">
      <label>{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((o) => (
          <option key={o.v} value={o.v}>{o.l}</option>
        ))}
      </select>
      {hint && <div className="hint">{hint}</div>}
    </div>
  );
}

export default function App() {
  const [d, setD] = useState(SAMPLE);
  const [mode, setMode] = useState("フル");
  const [withImage, setWithImage] = useState(true);
  const [result, setResult] = useState(null);   // { post, snapshot }
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState("");
  const taRef = useRef(null);
  const timer = useRef(null);

  const up = (k) => (v) => setD((p) => ({ ...p, [k]: v }));

  const generate = () => {
    if (timer.current) clearTimeout(timer.current);
    setLoading(true);
    setToast("");
    const snapshot = { ...d };
    timer.current = setTimeout(() => {
      setResult({ post: buildPost(snapshot), snapshot });
      setLoading(false);
    }, 700);
  };

  const dirty = result && JSON.stringify(result.snapshot) !== JSON.stringify(d);
  const text = useMemo(
    () => (result ? postToText(result.post, mode, withImage) : ""),
    [result, mode, withImage]
  );

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setToast("コピーしました ✓");
    } catch {
      if (taRef.current) {
        taRef.current.value = text;
        taRef.current.select();
        try { document.execCommand("copy"); setToast("コピーしました ✓"); }
        catch { setToast("コピーできませんでした。右の文章を選択してコピーしてください"); }
      }
    }
    setTimeout(() => setToast(""), 2000);
  };

  const post = result ? result.post : null;

  return (
    <div className="gen">
      <style>{css}</style>
      <textarea ref={taRef} style={{ position: "absolute", left: -9999, top: 0, height: 1, opacity: 0 }} readOnly aria-hidden />
      <div className="inner">
        <div className="head">
          <span className="dot" />
          <h1>FX 急変ポスト・ジェネレーター</h1>
        </div>
        <p className="tag">相場が急に動いたとき用。価格と「上がった／下がった」、自分のスタンスを入れて「作成する」を押すだけ。きっかけが分からなくてもOK。</p>

        <div className="grid">
          {/* INPUT */}
          <div className="card">
            <div className="sec">
              <div className="eyebrow"><span className="num">①</span> 何が起きた？</div>
              <Field label="銘柄・通貨ペア" value={d.pair} onChange={up("pair")} placeholder="ドル円" hint="例）ドル円、ゴールド、ビットコイン" />
              <div className="row">
                <Field label="今の価格（だいたいでOK）" value={d.price} onChange={up("price")} placeholder="160.50" />
                <Pick label="どう動いた？" value={d.moved} onChange={up("moved")} options={[
                  { v: "上", l: "急に上がった" },
                  { v: "下", l: "急に下がった" },
                  { v: "大きく", l: "とにかく大きく動いた" },
                ]} />
              </div>
              <Field label="きっかけ・ニュース" value={d.cause} onChange={up("cause")} placeholder="日銀の利上げ、雇用統計 など" hint="分からなければ空欄でOK。自動で「理由不明の急変」用の文章になります。" />
            </div>

            <div className="sec">
              <div className="eyebrow"><span className="num">②</span> これからどうする？</div>
              <Pick label="あなたのスタンス" value={d.stance} onChange={up("stance")} options={[
                { v: "ロング", l: "買い目線（ロング）" },
                { v: "ショート", l: "売り目線（ショート）" },
                { v: "様子見", l: "様子見（待つ）" },
              ]} hint="この1択だけ決めればOK。迷ったら「様子見」。" />
            </div>

            <div className="sec">
              <div className="eyebrow"><span className="num">③</span> 仕上げ（任意）</div>
              <div className="field">
                <label>ひとこと</label>
                <textarea value={d.comment} onChange={(e) => up("comment")(e.target.value)} placeholder="付け足したい一言があれば（なくてもOK）" />
              </div>
              <Field label="ハッシュタグ" value={d.hashtags} onChange={up("hashtags")} placeholder="#ドル円 #FX" />
              <div className="btns" style={{ marginTop: 4 }}>
                <button onClick={() => setD(SAMPLE)}>例を読み込む</button>
                <button onClick={() => setD(EMPTY)}>リセット</button>
              </div>
            </div>

            <div className="cta">
              <button className="primary" onClick={generate} disabled={loading}>
                {loading ? "作成中…" : result ? "✨ もう一度作成する" : "✨ ポストを作成する"}
              </button>
              {dirty && !loading && (
                <p className="dirty">入力が変わりました。「もう一度作成する」で反映されます。</p>
              )}
            </div>
          </div>

          {/* PREVIEW */}
          <div className="preview">
            {result && !loading && (
              <div className="pvbar">
                <div className="seg">
                  {["フル", "コンパクト"].map((mn) => (
                    <button key={mn} className={mode === mn ? "on" : ""} onClick={() => setMode(mn)}>{mn}</button>
                  ))}
                  <button className={withImage ? "on" : ""} onClick={() => setWithImage((v) => !v)}>画像行 {withImage ? "あり" : "なし"}</button>
                </div>
                <span className="count">{text.length} 文字</span>
              </div>
            )}

            {loading && (
              <div className="loadcard">
                <div className="spinner" />
                <p>ポストを作成中…</p>
              </div>
            )}

            {!result && !loading && (
              <div className="empty">
                <div className="emoji">✍️</div>
                <p>左の項目を入力して<br />「ポストを作成する」を押してください</p>
              </div>
            )}

            {result && !loading && (
              <>
                <div className="xcard reveal">
                  <p className="ptitle">{post.title}</p>
                  <p className="pmoved">{post.moved}</p>
                  <div className={`concl ${post.tone}`}>
                    <p className="lab">まず結論</p>
                    <p className="txt">{post.conclusion}</p>
                  </div>

                  {mode === "フル" && (
                    <>
                      <hr className="divider" />
                      <div className="block">
                        <p className="bhead">なぜ動いた？</p>
                        <p className="bbody">{post.why}</p>
                      </div>
                      <div className="block">
                        <p className="bhead">この後どうする？</p>
                        <p className="bbody">{post.how}</p>
                      </div>
                    </>
                  )}

                  {post.comment && <p className="pcomment">{post.comment}</p>}
                  {withImage && <p className="pimg">🔻チャートは画像で👇</p>}
                  {post.hashtags && <p className="ptags">{post.hashtags}</p>}

                  <p className="imgnote">投稿は画像付きがおすすめ。今のチャートを1枚そえるだけで、見た人の理解がぐっと上がります。</p>
                </div>

                <div style={{ marginTop: 12 }}>
                  <button className="primary" onClick={copy}>この文章をコピー</button>
                </div>
                <div className="toast" aria-live="polite">{toast}</div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
