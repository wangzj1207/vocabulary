# Word Garden｜單字花園

面向台灣高中生的英文單字練習網頁。使用瀏覽器開啟 `index.html` 即可遊玩，不需安裝應用程式或啟動伺服器。

## 功能

- 每輪最多 10 題英文選中文，提供答題回饋與瀏覽器語音發音。
- 可練習新字、答對過的字或到期複習；答錯的詞會立即進入待複習範圍。
- 依連續答對次數安排 1、3、7、14、30 天後複習。
- 單字本支援搜尋、狀態篩選、分頁及發音；學習紀錄顯示本機統計。
- 學習進度儲存在目前瀏覽器的 `localStorage`。可在「學習紀錄」下載 JSON 備份，再於另一台裝置匯入；匯入會取代該瀏覽器目前的進度。

## 字庫與資料使用

目前包含 5,624 個英文詞條，欄位含英文、詞性、繁體中文釋義、`marked`、`ceecLevels` 與 `ceecPos`。後兩欄是依大考中心 111 學年度起適用詞表對照的級別和官方詞性；目前 4,570 筆已對應，1,054 筆未對應，未匹配資料不會被自動判定為錯字或官方擴充詞。

目前字庫整理自 [`mahavivo/english-wordlists`](https://github.com/mahavivo/english-wordlists) 的台灣高中英文參考詞彙整理檔；該整理檔來源說明與再散布授權尚未確認。官方 PDF 允許非營利使用並要求轉載註明出處，因此級別／官方詞性對照會標出官方來源；該條件不代表第三方中文釋義也取得授權。詳見 [`knowledge/decision.md`](knowledge/decision.md)。

大考中心現行參考詞彙表分六級、約 6,000 詞條，並標示非營利使用與轉載註明出處的條件。它不能直接證明第三方整理檔的中文釋義具有相同授權。詳見 [`knowledge/plan.md`](knowledge/plan.md) 的來源說明。

## 執行檢查

需求：Node.js 20+、Python 3.12+。執行：

```sh
node --test tests/*.test.cjs
python -m unittest discover -s tests
```

GitHub Actions 會在推送至 `main` 和 Pull Request 時執行上述檢查。

## 比對官方詞表

`tools/compare_vocabulary.py` 可讀取本機 CSV，欄位需包含 `word`、`level`、`pos`。它會輸出各級筆數、漏字、多字、重複詞及詞性差異；`--check` 在發現差異時回傳非零狀態。

```sh
python tools/compare_vocabulary.py path/to/official-vocabulary.csv --check
```

比對工具不會下載或攜帶官方詞表；使用者需自行準備符合授權條件的 CSV。斜線替代拼法及括號詞尾會展開成不同 headword，括號詞尾對應的詞性也分開保存。工具不校對中文釋義，也不自動抽取官方 PDF。

## 部署

目前沒有自動部署流程或託管目標。GitHub Pages 是建議選項；啟用前需先確認網站公開網址及發佈目標，詳見 [`knowledge/decision.md`](knowledge/decision.md)。
