/**
 * TokenRefresh.gs
 * Threads の長期アクセストークン（long-lived token）を自動延命する。
 *
 *  - refreshAccessToken()         : 設定シートのトークンを更新エンドポイントで延命し書き戻す
 *  - installTokenRefreshTrigger() : 毎週月曜の早朝に refreshAccessToken を走らせるトリガーを登録
 *  - removeTokenRefreshTrigger()  : 上記トリガーを削除
 *
 * 長期トークンは有効期限が約 60 日。期限切れ前（24 時間以上経過したもの）に
 * refresh_access_token を呼ぶと、同じトークン体系で有効期限が再延長される。
 * 失敗時はログとメールで所有者へ警告する。
 */

var TOKEN_REFRESH_HANDLER = 'refreshAccessToken';
var TOKEN_REFRESH_HOUR = 4; // 毎週月曜 4 時台

/**
 * 長期アクセストークンを延命し、設定シートへ書き戻す。
 * トリガーからもメニューからも呼べる。
 */
function refreshAccessToken() {
  var token = String(getSetting('THREADS_ACCESS_TOKEN', ''));
  if (!token) {
    appendLog('', 'fail', 'トークン更新: THREADS_ACCESS_TOKEN が未設定のためスキップ');
    return;
  }

  var url = 'https://graph.threads.net/refresh_access_token' +
    '?grant_type=th_refresh_token' +
    '&access_token=' + encodeURIComponent(token);

  try {
    var res = UrlFetchApp.fetch(url, { method: 'get', muteHttpExceptions: true });
    var code = res.getResponseCode();
    var body = res.getContentText();
    var json = safeParseJson_(body);

    if (code >= 200 && code < 300 && json.access_token) {
      setSetting('THREADS_ACCESS_TOKEN', json.access_token);
      var expires = json.expires_in ? Math.round(Number(json.expires_in) / 86400) : null;
      appendLog('', 'success', 'トークン更新成功' + (expires !== null ? '（有効期限 約' + expires + ' 日）' : ''));
      return;
    }

    var failMsg = 'トークン更新失敗 (HTTP ' + code + '): ' + body;
    appendLog('', 'fail', failMsg);
    notifyTokenRefreshFailure_(failMsg);
  } catch (e) {
    var errMsg = 'トークン更新で例外: ' + String(e && e.message || e);
    appendLog('', 'fail', errMsg);
    notifyTokenRefreshFailure_(errMsg);
  }
}

/**
 * トークン更新失敗をシート所有者へメール通知する。
 * メール送信自体が失敗しても本処理は止めない。
 */
function notifyTokenRefreshFailure_(message) {
  try {
    var to = '';
    try {
      to = SpreadsheetApp.getActiveSpreadsheet().getOwner().getEmail();
    } catch (e1) {
      to = Session.getEffectiveUser().getEmail();
    }
    if (!to) return;

    var ssName = '';
    try { ssName = SpreadsheetApp.getActiveSpreadsheet().getName(); } catch (e2) {}

    MailApp.sendEmail(
      to,
      '[Threads 予約投稿ツール] トークン自動更新に失敗しました',
      'Threads の長期アクセストークンの自動更新に失敗しました。\n' +
      '手動でトークンを再発行し「設定」シートを更新してください。\n\n' +
      'スプレッドシート: ' + ssName + '\n' +
      '詳細:\n' + message
    );
  } catch (e) {
    console.warn('notifyTokenRefreshFailure_ failed: ' + e);
  }
}

/**
 * 毎週月曜の早朝に refreshAccessToken を走らせる時間トリガーを登録する。
 * 既存の同名トリガーは削除してから作る。
 * 戻り値: 実行時刻（時）。
 */
function installTokenRefreshTrigger() {
  removeTokenRefreshTrigger();
  ScriptApp.newTrigger(TOKEN_REFRESH_HANDLER)
    .timeBased()
    .onWeekDay(ScriptApp.WeekDay.MONDAY)
    .atHour(TOKEN_REFRESH_HOUR)
    .create();
  return TOKEN_REFRESH_HOUR;
}

/**
 * refreshAccessToken を呼ぶトリガーをすべて削除。削除件数を返す。
 */
function removeTokenRefreshTrigger() {
  var triggers = ScriptApp.getProjectTriggers();
  var removed = 0;
  for (var i = 0; i < triggers.length; i++) {
    if (triggers[i].getHandlerFunction() === TOKEN_REFRESH_HANDLER) {
      ScriptApp.deleteTrigger(triggers[i]);
      removed++;
    }
  }
  return removed;
}
