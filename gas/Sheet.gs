/**
 * Sheet.gs
 * 「投稿予約」シートの読み書きを担当するモジュール。
 *
 * 列定義（1 始まり）：
 *   A:1  = ID
 *   B:2  = 日付
 *   C:3  = 時
 *   D:4  = 分
 *   E:5  = 本文   (1個目 / フック投稿)
 *   F:6  = 本文2  (2リプ目)
 *   G:7  = 本文3
 *   H:8  = 本文4
 *   I:9  = 本文5
 *   J:10 = 本文6
 *   K:11 = 本文7
 *   L:12 = 本文8  (8リプ目)
 *   M:13 = ステータス  (待機中/投稿済み/一部投稿済み/失敗/スキップ)
 *   N:14 = 投稿日時
 *   O:15 = 投稿ID    (連投時は複数IDをカンマ区切りで保持)
 *   P:16 = 投稿URL   (スレッド先頭の permalink)
 *   Q:17 = エラー
 */

var POSTS_SHEET_NAME = '投稿予約';

var COL = {
  ID: 1,
  DATE: 2,
  HOUR: 3,
  MINUTE: 4,
  BODY: 5,          // 本文（1個目）
  STATUS: 13,
  POSTED_AT: 14,
  POST_ID: 15,
  POST_URL: 16,
  ERROR: 17
};

// 本文列は 5〜12 の連続8列（本文 + 本文2..本文8）
var BODY_FIRST_COL = 5;
var BODY_COUNT = 8;

var STATUS = {
  WAITING: '待機中',
  DONE: '投稿済み',
  PARTIAL: '一部投稿済み',   // 連投の途中まで成功し、残りを次回再開する状態
  FAILED: '失敗',
  SKIPPED: 'スキップ'
};

function getPostsSheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(POSTS_SHEET_NAME);
  if (!sheet) {
    throw new Error('「' + POSTS_SHEET_NAME + '」シートが見つかりません。初期セットアップを実行してください。');
  }
  return sheet;
}

/**
 * 全行を読み込み、行オブジェクトの配列にして返す。
 * row プロパティはスプレッドシート上の実際の行番号 (2 始まり)。
 */
function loadAllPosts_() {
  var sheet = getPostsSheet_();
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return [];

  var range = sheet.getRange(2, 1, lastRow - 1, COL.ERROR);
  var values = range.getValues();
  var posts = [];

  for (var i = 0; i < values.length; i++) {
    var v = values[i];

    // 本文〜本文8（列 5〜12）をまとめた配列。空欄は空文字のまま保持。
    var bodies = [];
    for (var c = 0; c < BODY_COUNT; c++) {
      var cell = v[BODY_FIRST_COL - 1 + c];
      bodies.push(cell === null || cell === undefined ? '' : cell);
    }

    posts.push({
      row: i + 2,
      id: v[COL.ID - 1],
      date: v[COL.DATE - 1],
      hour: v[COL.HOUR - 1],
      minute: v[COL.MINUTE - 1],
      body: v[COL.BODY - 1],
      bodies: bodies,
      status: v[COL.STATUS - 1],
      postedAt: v[COL.POSTED_AT - 1],
      postId: v[COL.POST_ID - 1],
      postUrl: v[COL.POST_URL - 1],
      error: v[COL.ERROR - 1]
    });
  }
  return posts;
}

/**
 * 予約日時 (Date オブジェクト) を組み立てる。
 * 日付列が空 / 時・分が数値でない場合は null を返す。
 */
function buildScheduledAt_(post, timeZone) {
  if (!(post.date instanceof Date)) return null;
  var h = Number(post.hour);
  var m = Number(post.minute);
  if (isNaN(h) || isNaN(m)) return null;
  if (h < 0 || h > 23 || m < 0 || m > 59) return null;

  // 設定タイムゾーンで「日付の 0:00」を取得し、時・分を足す
  var d = new Date(post.date.getTime());
  d.setHours(h, m, 0, 0);
  return d;
}

/**
 * ID が未採番の行（A 列が空）に対して連番を振る。
 */
function assignMissingIds_() {
  var sheet = getPostsSheet_();
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return;

  var idRange = sheet.getRange(2, COL.ID, lastRow - 1, 1);
  var ids = idRange.getValues();

  // 既存 ID の最大値を計算
  var maxId = 0;
  for (var i = 0; i < ids.length; i++) {
    var v = Number(ids[i][0]);
    if (!isNaN(v) && v > maxId) maxId = v;
  }

  // 空欄に連番を振る
  var changed = false;
  for (var j = 0; j < ids.length; j++) {
    if (ids[j][0] === '' || ids[j][0] === null) {
      // 本文が空の行には ID を振らない（ユーザーが未入力の空行と区別するため、
      // 同じ行の本文列を覗く）
      var body = sheet.getRange(j + 2, COL.BODY).getValue();
      if (String(body || '').trim() === '') continue;
      maxId++;
      ids[j][0] = maxId;
      changed = true;
    }
  }
  if (changed) idRange.setValues(ids);
}

/**
 * 1 行のステータス・関連列をまとめて更新。
 * fields は { status, postedAt, postId, postUrl, error } の部分集合。
 */
function updatePostRow_(rowNumber, fields) {
  var sheet = getPostsSheet_();
  if (fields.status !== undefined) sheet.getRange(rowNumber, COL.STATUS).setValue(fields.status);
  if (fields.postedAt !== undefined) sheet.getRange(rowNumber, COL.POSTED_AT).setValue(fields.postedAt);
  if (fields.postId !== undefined) sheet.getRange(rowNumber, COL.POST_ID).setValue(fields.postId);
  if (fields.postUrl !== undefined) sheet.getRange(rowNumber, COL.POST_URL).setValue(fields.postUrl);
  if (fields.error !== undefined) sheet.getRange(rowNumber, COL.ERROR).setValue(fields.error);
}

/**
 * 初期セットアップ時、シートが無ければ作成しヘッダ・入力規則を入れる。
 */
function ensurePostsSheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(POSTS_SHEET_NAME);
  if (!sheet) sheet = ss.insertSheet(POSTS_SHEET_NAME);

  var headers = ['ID', '日付', '時', '分', '本文', '本文2', '本文3', '本文4', '本文5', '本文6', '本文7', '本文8', 'ステータス', '投稿日時', '投稿ID', '投稿URL', 'エラー'];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]).setFontWeight('bold');
  sheet.setFrozenRows(1);

  // ステータス列のプルダウン (2 行目以降、上限 1000 行)
  var rule = SpreadsheetApp.newDataValidation()
    .requireValueInList([STATUS.WAITING, STATUS.DONE, STATUS.PARTIAL, STATUS.FAILED, STATUS.SKIPPED], true)
    .setAllowInvalid(false)
    .build();
  sheet.getRange(2, COL.STATUS, 1000, 1).setDataValidation(rule);

  // 日付列の表示形式
  sheet.getRange(2, COL.DATE, 1000, 1).setNumberFormat('yyyy/MM/dd');
  sheet.getRange(2, COL.POSTED_AT, 1000, 1).setNumberFormat('yyyy/MM/dd HH:mm:ss');
}

/**
 * 既存ユーザー向け移行（一回限り）。
 * 旧 10 列レイアウトの「投稿予約」シートに、本文の直後へ 本文2〜本文8 の
 * 7 列を挿入し、新 17 列レイアウトへ更新する。過去の投稿履歴は保持する。
 *
 * 冪等性: セル (1, 6) が既に「本文2」なら移行済みとみなし何もしない。
 * 戻り値: 'migrated'（移行実行） / 'already'（移行済み） のいずれか。
 */
function migratePostsSheetToThreadV2_() {
  var sheet = getPostsSheet_();

  // 冪等性チェック: F1（6列目）が既に「本文2」なら移行済み
  var f1 = String(sheet.getRange(1, 6).getValue() || '').trim();
  if (f1 === '本文2') return 'already';

  // 本文（5 列目）の直後に 7 列を挿入。ステータス以降は自動で右へずれる。
  sheet.insertColumnsAfter(BODY_FIRST_COL, BODY_COUNT - 1);

  // ヘッダ（1 行目）を新 17 列で上書き
  var headers = ['ID', '日付', '時', '分', '本文', '本文2', '本文3', '本文4', '本文5', '本文6', '本文7', '本文8', 'ステータス', '投稿日時', '投稿ID', '投稿URL', 'エラー'];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]).setFontWeight('bold');
  sheet.setFrozenRows(1);

  // ステータス列（新 13 列目）のプルダウンを PARTIAL 込みで再設定
  var rule = SpreadsheetApp.newDataValidation()
    .requireValueInList([STATUS.WAITING, STATUS.DONE, STATUS.PARTIAL, STATUS.FAILED, STATUS.SKIPPED], true)
    .setAllowInvalid(false)
    .build();
  sheet.getRange(2, COL.STATUS, 1000, 1).setDataValidation(rule);

  // 日付・投稿日時列の表示形式を新しい列番号で再設定
  sheet.getRange(2, COL.DATE, 1000, 1).setNumberFormat('yyyy/MM/dd');
  sheet.getRange(2, COL.POSTED_AT, 1000, 1).setNumberFormat('yyyy/MM/dd HH:mm:ss');

  return 'migrated';
}

function ensureConfigSheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(CONFIG_SHEET_NAME);
  if (!sheet) sheet = ss.insertSheet(CONFIG_SHEET_NAME);

  // 既にデータがあれば触らない
  if (sheet.getLastRow() >= 2) return;

  var rows = [
    ['キー', '値', '説明'],
    ['THREADS_USER_ID', '', 'Threads ユーザー ID'],
    ['THREADS_ACCESS_TOKEN', '', '長期アクセストークン'],
    ['TIMEZONE', 'Asia/Tokyo', 'タイムゾーン'],
    ['CHECK_INTERVAL_MIN', 1, '何分ごとにチェックするか'],
    ['MAX_DELAY_HOURS', 24, '何時間前まで遅延投稿を許可するか']
  ];
  sheet.getRange(1, 1, rows.length, 3).setValues(rows);
  sheet.getRange(1, 1, 1, 3).setFontWeight('bold');
  sheet.setFrozenRows(1);
}

function ensureLogSheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(LOG_SHEET_NAME);
  if (!sheet) sheet = ss.insertSheet(LOG_SHEET_NAME);
  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, 4)
      .setValues([['実行日時', '対象ID', '結果', 'メッセージ']])
      .setFontWeight('bold');
    sheet.setFrozenRows(1);
  }
}
