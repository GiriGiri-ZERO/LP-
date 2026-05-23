/**
 * Config.gs
 * 「設定」シートからキー / 値ペアを読み込むモジュール。
 *
 * 設定シートの想定レイアウト：
 *   A 列 = キー名 (例: THREADS_USER_ID)
 *   B 列 = 値
 *   1 行目 = ヘッダ ("キー", "値")
 *   2 行目以降がデータ
 */

var CONFIG_SHEET_NAME = '設定';

/**
 * 設定シートを 1 度だけ読んで Map にして返す（同一実行内のキャッシュ）。
 * GAS は実行ごとにグローバルがリセットされるので、PropertiesService ではなく
 * 関数スコープの変数で十分。
 */
var __configCache = null;

function getAllSettings_() {
  if (__configCache) return __configCache;

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(CONFIG_SHEET_NAME);
  if (!sheet) {
    throw new Error('「' + CONFIG_SHEET_NAME + '」シートが見つかりません。初期セットアップを実行してください。');
  }

  var values = sheet.getDataRange().getValues();
  var map = {};
  // 1 行目はヘッダなので 1 から開始
  for (var i = 1; i < values.length; i++) {
    var key = String(values[i][0] || '').trim();
    var val = values[i][1];
    if (key) map[key] = val;
  }
  __configCache = map;
  return map;
}

/**
 * 指定キーの設定値を取得。未設定なら defaultValue を返す。
 */
function getSetting(key, defaultValue) {
  var map = getAllSettings_();
  var v = map[key];
  if (v === undefined || v === null || v === '') {
    return defaultValue !== undefined ? defaultValue : '';
  }
  return v;
}

/**
 * 設定シートの値を書き戻す。既存キーがあれば値（B 列）を更新、
 * 無ければ末尾に新規行を追加する。同一実行内キャッシュも更新する。
 */
function setSetting(key, value) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(CONFIG_SHEET_NAME);
  if (!sheet) {
    throw new Error('「' + CONFIG_SHEET_NAME + '」シートが見つかりません。初期セットアップを実行してください。');
  }

  var values = sheet.getDataRange().getValues();
  for (var i = 1; i < values.length; i++) {
    if (String(values[i][0] || '').trim() === key) {
      sheet.getRange(i + 1, 2).setValue(value);
      if (__configCache) __configCache[key] = value;
      return;
    }
  }
  // 見つからなければ末尾に追加
  sheet.appendRow([key, value, '']);
  if (__configCache) __configCache[key] = value;
}

/**
 * 必須設定が揃っているかチェック。
 * 揃っていなければエラーを投げる。
 */
function validateRequiredSettings_() {
  var required = ['THREADS_USER_ID', 'THREADS_ACCESS_TOKEN'];
  var missing = [];
  for (var i = 0; i < required.length; i++) {
    if (!getSetting(required[i])) missing.push(required[i]);
  }
  if (missing.length > 0) {
    throw new Error('設定不備: ' + missing.join(', ') + ' が未入力です。「設定」シートを確認してください。');
  }
}
