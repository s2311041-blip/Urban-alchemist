---
marp: true
theme: default
paginate: true
size: 16:9
style: |
  section {
    font-family: "Hiragino Sans", "Yu Gothic", "Noto Sans JP", sans-serif;
    color: #172033;
    background: linear-gradient(135deg, #f7fbff 0%, #eef7f0 100%);
  }
  h1 {
    color: #0f5132;
    font-size: 42px;
    line-height: 1.2;
  }
  h2 {
    color: #17624a;
    font-size: 34px;
  }
  strong {
    color: #0b6b52;
  }
  ul {
    font-size: 22px;
    line-height: 1.35;
  }
  p {
    font-size: 21px;
    line-height: 1.45;
  }
  .lead {
    font-size: 27px;
    line-height: 1.45;
  }
  .tag {
    display: inline-block;
    padding: 8px 14px;
    border-radius: 999px;
    background: rgba(15, 81, 50, 0.12);
    color: #0f5132;
    font-weight: 700;
    font-size: 20px;
  }
  .small {
    font-size: 19px;
    color: #4e5b6c;
  }
  .flow {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    margin-top: 8px;
    flex-wrap: wrap;
  }
  .card {
    background: #ffffff;
    border: 2px solid #b9dccd;
    border-radius: 12px;
    padding: 8px 10px;
    min-width: 155px;
    text-align: center;
    font-size: 18px;
    font-weight: 700;
    color: #0f5132;
  }
  .arrow {
    font-size: 22px;
    font-weight: 700;
    color: #17624a;
  }
  .compare {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
    margin-top: 10px;
  }
  .panel {
    background: #ffffff;
    border-radius: 12px;
    padding: 10px 12px;
    border: 2px solid #d7e6de;
  }
  .panel h4 {
    margin: 0 0 6px 0;
    font-size: 22px;
  }
  .grid3 {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 12px;
    margin-top: 12px;
  }
  .mini {
    background: #ffffff;
    border-radius: 10px;
    border: 2px solid #d7e6de;
    padding: 8px 8px;
    font-size: 18px;
  }
  .agenda {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 14px;
    margin-top: 12px;
  }
  .agenda .panel {
    min-height: 130px;
  }
---

# ゼミ進捗報告
## Urban Alchemist プロトタイプ開発

<p class="lead"><strong>発表者:</strong> あなたの名前（ここを置き換え）</p>
<p class="small">所属・日付（必要なら追記）</p>

---

<!--
発話メモ:
前回までは構想・背景・方法論の話が中心だったが、今回は実際にゲームとして触れるプロトタイプを作り始めた、という進捗報告にする。
-->

# Urban Alchemist
## 都市課題を「集める」から「改善まで回す」へ

<span class="tag">AR投稿 × VR/ゲーム体験 × 参加型まちづくり</span>

<div class="flow">
  <div class="card">課題を投稿</div>
  <div class="arrow">→</div>
  <div class="card">ゲームで体験</div>
  <div class="arrow">→</div>
  <div class="card">改善案を実装</div>
  <div class="arrow">→</div>
  <div class="card">次の参加へ</div>
</div>

---

## 今日のアジェンダ

<div class="agenda">
  <div class="panel">
    <h4>1. 背景と問題意識</h4>
    <ul>
      <li>なぜゲーム化が必要か</li>
      <li>前回までとの違い</li>
    </ul>
  </div>
  <div class="panel">
    <h4>2. 提案と独自性</h4>
    <ul>
      <li>投稿を体験可能な課題へ変換</li>
      <li>継続参加と多様な視点</li>
    </ul>
  </div>
  <div class="panel">
    <h4>3. 実装デモ</h4>
    <ul>
      <li>不満発見から改善までを実演</li>
      <li>島の変化を確認</li>
    </ul>
  </div>
  <div class="panel">
    <h4>4. 今後の計画</h4>
    <ul>
      <li>次回までの実施項目</li>
      <li>検証の進め方</li>
    </ul>
  </div>
</div>

---

<!--
発話メモ:
参加型まちづくりの課題は「データを集めること」だけでなく「関わり続けてもらうこと」。ここでゲーム化の必要性につなげる。
-->

## 問題意識

### なぜ「ゲーム化」が必要か

<div class="flow">
  <div class="card">投稿の手間</div>
  <div class="arrow">→</div>
  <div class="card">単発参加で終わる</div>
  <div class="arrow">→</div>
  <div class="card">継続データが不足</div>
</div>

- 参加を一回で終わらせない仕組みが必要
- 都市課題を「自分ごと」に変える体験が必要
- その役割を担うのがゲームのループ

---

<!--
発話メモ:
ゲームの基本体験を説明する。ここは詳しく語りすぎず、デモで見せる前提で短く。
-->

## 提案する体験

### プレイヤーが「改善の当事者」になる

<div class="flow">
  <div class="card">🔍 不満を発見</div>
  <div class="arrow">→</div>
  <div class="card">🧠 改善方法を選ぶ</div>
  <div class="arrow">→</div>
  <div class="card">🛠 建築して解決</div>
  <div class="arrow">→</div>
  <div class="card">🌱 まちが変化</div>
</div>

<div class="compare">
  <div class="panel">
    <h4>プレイヤーが行うこと</h4>
    <ul>
      <li>不満の内容を読む</li>
      <li>改善プランを選択する</li>
      <li>建築して効果を確認する</li>
    </ul>
    <p class="small">イラストイメージ: 探索 → 建築 → 完了</p>
  </div>
  <div class="panel">
    <h4>研究として得られること</h4>
    <ul>
      <li>どの課題が選ばれたか</li>
      <li>どの改善策が選ばれたか</li>
      <li>改善後に行動が続くか</li>
    </ul>
  </div>
</div>

<p class="lead">都市課題を「見る」だけでなく、<strong>直す行為</strong>と<strong>継続行動</strong>まで扱える</p>

---

<!--
発話メモ:
ここが研究としての独自性の中心。投稿をデータベースに入れて終わりではなく、他者が体験し改善できる都市課題に変換する点を強調する。
-->

## 独自性 1

### 投稿データを「体験可能な課題」に変える

<div class="compare">
  <div class="panel">
    <h4>一般的な流れ</h4>
    <p>投稿 → DB保存 → 専門家が分析</p>
    <p class="small">市民の関与はここで止まりやすい</p>
  </div>
  <div class="panel">
    <h4>本研究の流れ</h4>
    <p>投稿 → ゲーム課題化 → 他者が体験 → 改善案を作る</p>
    <p class="small">非同期でも参加が連鎖する</p>
  </div>
</div>

---

<!--
発話メモ:
ゲーム化の理論は長く語らず、設計に落ちていることだけを話す。「参加してください」ではなく「遊んでいたら参加になっている」がキーフレーズ。
-->

## 独自性 2

### 継続参加を設計で作る

<div class="grid3">
  <div class="mini"><strong>内発的動機</strong><br>自分のまちを良くする<br>作る楽しさ</div>
  <div class="mini"><strong>外発的動機</strong><br>達成表示<br>島の拡張</div>
  <div class="mini"><strong>循環設計</strong><br>解決すると次の探索へ<br>自然に続く</div>
</div>

<p class="lead"><strong>「お願いして参加」ではなく「遊んで参加」へ</strong></p>

---

<!--
発話メモ:
UD教育だけに限定せず、多様な視点を取り入れる都市体験として説明する。誰にとってのバリアか、どの改善が有効かを考えることがインクルーシブデザインにつながる。
-->

## 独自性 3

### 多様な視点を取り入れる都市体験

- 不満を「誰にとってのバリアか」で捉える
- 暗さ・段差・案内不足・移動しづらさを体験化
- 改善プランを比較し、**誰に有効か**を考える

<div class="flow">
  <div class="card">高齢者の視点</div>
  <div class="card">子育ての視点</div>
  <div class="card">車いすの視点</div>
</div>

<p class="small">バリア理解・UD・インクルーシブデザインを実感ベースで学べる</p>

---

<!--
発話メモ:
ここで画面共有デモに入る。デモでは1つの不満を改善する流れだけ見せ、最後に今後の検証へつなげる。
-->

## 今回の実装とデモ

### ここまで実装済み

- 不満発見 → プラン選択 → 建築解決
- 解決後の島拡張 / フェリー / 地図 / コンパス
- 次ステップ: AR投稿接続、効果検証

<div class="flow">
  <div class="card">1. 不満を開く</div>
  <div class="card">2. 改善して完成</div>
  <div class="card">3. 変化を確認</div>
</div>

<p class="lead"><strong>デモ: 改善前→改善→島の変化を2〜3分で確認</strong></p>

---

## 次回までの課題

<div class="grid3">
  <div class="mini"><strong>VR体験のデザイン</strong><br>投稿課題をどう体験化するかの導線設計</div>
  <div class="mini"><strong>論文調査</strong><br>参加型設計・ゲーミフィケーション・UD関連の整理</div>
  <div class="mini"><strong>ゲームのさらなる実装</strong><br>AR投稿連携に向けた機能追加と検証準備</div>
</div>

<p class="small">次回は「実装進捗 + 検証設計」をセットで報告する</p>

