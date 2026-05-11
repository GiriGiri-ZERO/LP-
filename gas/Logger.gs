/**
 * Logger.gs
 * 「ログ」シートに実行ログを残す。
 *
 * GAS 標準の console.log() / Logger.log() は実行ログとしては残るが、
 * ユーザーがスプレッドシート上で見られる方が運用しやすいため別シートに記録する。
 */

var LOG_SHEET_NAME = 'ログ';

/**
 * ログを 1 行追記。
 * result は 'success' / 'fail' / 'skip' / 'info' のいずれか。
 */
function appendLog(targetId, result, message) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(LOG_SHEET_NAME);
    if (!sheet) return; // ログシートは任意なので無ければ何もしない
    sheet.appendRow([new Date(), targetId || '', result || '', message || '']);
  } catch (e) {
    // ログ書き込み失敗で本処理を止めない
    console.warn('appendLog failed: ' + e);
  }
}
