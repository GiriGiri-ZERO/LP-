/**
 * Code.gs
 * エントリーポイント。
 *  - onOpen()         : スプレッドシートを開いた時にメニューを追加
 *  - main()           : トリガーから 1 分毎に呼ばれる本体処理
 *  - runNow()         : メニュー「今すぐ実行」用
 *  - checkSettings()  : メニュー「設定を確認」用（トークン疎通チェック）
 *  - setup()          : メニュー「初期セットアップ」用
 *  - uninstall()      : メニュー「トリガー解除」用
 */

var BODY_MAX_LENGTH = 500;

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('Threads ツール')
    .addItem('今すぐ実行', 'runNow')
    .addItem('設定を確認', 'checkSettings')
    .addSeparator()
    .addItem('初期セットアップ', 'setup')
    .addItem('トリガー解除', 'uninstall')
    .addToUi();
}

/**
 * 自動投稿の本体。トリガーからも、メニューからも呼ばれる。
 */
function main() {
  var timeZone = String(getSetting('TIMEZONE', 'Asia/Tokyo'));
  var maxDelayHours = Number(getSetting('MAX_DELAY_HOURS', 24));
  if (isNaN(maxDelayHours) || maxDelayHours <= 0) maxDelayHours = 24;

  // トークン未設定時は全行スキップ
  try {
    validateRequiredSettings_();
  } catch (e) {
    appendLog('', 'fail', '設定不備: ' + e.message);
    return;
  }

  var userId = String(getSetting('THREADS_USER_ID'));
  var token = String(getSetting('THREADS_ACCESS_TOKEN'));

  // 採番されていない行に ID を振る
  assignMissingIds_();

  var posts = loadAllPosts_();
  var now = new Date();

  for (var i = 0; i < posts.length; i++) {
    var p = posts[i];
    var status = String(p.status || '').trim();

    // ステータスが「待機中」または空欄のみ対象
    if (status !== '' && status !== STATUS.WAITING) continue;

    // 本文・予約日時の検証
    var body = String(p.body || '');
    if (body.trim() === '') {
      // 本文が空 = ユーザーがまだ入力していない空行とみなしスキップ
      // ただし日付や時刻が入っていれば「失敗」扱い
      if (p.date || p.hour !== '' || p.minute !== '') {
        updatePostRow_(p.row, { status: STATUS.FAILED, error: '本文が空です' });
        appendLog(p.id, 'fail', '本文が空です (row ' + p.row + ')');
      }
      continue;
    }

    if (body.length > BODY_MAX_LENGTH) {
      updatePostRow_(p.row, { status: STATUS.FAILED, error: '文字数超過 (' + body.length + ' / ' + BODY_MAX_LENGTH + ')' });
      appendLog(p.id, 'fail', '文字数超過 (row ' + p.row + ')');
      continue;
    }

    var scheduledAt = buildScheduledAt_(p, timeZone);
    if (!scheduledAt) {
      updatePostRow_(p.row, { status: STATUS.FAILED, error: '日付/時/分が不正です' });
      appendLog(p.id, 'fail', '日付/時/分が不正 (row ' + p.row + ')');
      continue;
    }

    // 予約時刻が未来ならスキップ（次回実行に持ち越し）
    if (scheduledAt.getTime() > now.getTime()) continue;

    // 遅延が許容時間を超えていればスキップ
    var delayMs = now.getTime() - scheduledAt.getTime();
    if (delayMs > maxDelayHours * 3600 * 1000) {
      updatePostRow_(p.row, { status: STATUS.SKIPPED, error: maxDelayHours + ' 時間以上遅延したためスキップ' });
      appendLog(p.id, 'skip', '遅延スキップ (row ' + p.row + ')');
      continue;
    }

    // ここから投稿
    try {
      var result = publishTextPost(userId, token, body);
      updatePostRow_(p.row, {
        status: STATUS.DONE,
        postedAt: new Date(),
        postId: result.id,
        postUrl: result.permalink || '',
        error: ''
      });
      appendLog(p.id, 'success', '投稿成功 id=' + result.id);
    } catch (e) {
      if (e && e.rateLimited) {
        // レート制限はステータス変更せず次回実行へ
        appendLog(p.id, 'skip', 'レート制限のため次回に持ち越し');
        continue;
      }
      updatePostRow_(p.row, { status: STATUS.FAILED, error: String(e && e.message || e) });
      appendLog(p.id, 'fail', String(e && e.message || e));
    }
  }
}

/**
 * メニュー「今すぐ実行」。main() を即時呼び出し、結果を UI に通知。
 */
function runNow() {
  var ui = SpreadsheetApp.getUi();
  try {
    main();
    ui.alert('実行完了', '投稿チェックが完了しました。シートをご確認ください。', ui.ButtonSet.OK);
  } catch (e) {
    ui.alert('エラー', String(e && e.message || e), ui.ButtonSet.OK);
  }
}

/**
 * メニュー「設定を確認」。設定シートを開いてトークン疎通を確認。
 */
function checkSettings() {
  var ui = SpreadsheetApp.getUi();
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(CONFIG_SHEET_NAME);
  if (sheet) ss.setActiveSheet(sheet);

  try {
    validateRequiredSettings_();
    var userId = String(getSetting('THREADS_USER_ID'));
    var token = String(getSetting('THREADS_ACCESS_TOKEN'));
    var res = pingThreadsApi(userId, token);
    if (res.ok) {
      ui.alert('設定 OK', 'Threads API に接続できました。\nusername: ' + (res.username || '(取得不可)'), ui.ButtonSet.OK);
    } else {
      ui.alert('設定エラー', 'API 応答 HTTP ' + res.code + '\n' + res.raw, ui.ButtonSet.OK);
    }
  } catch (e) {
    ui.alert('設定エラー', String(e && e.message || e), ui.ButtonSet.OK);
  }
}

/**
 * メニュー「初期セットアップ」。
 *  - 必要なシートを作成
 *  - トリガー登録
 */
function setup() {
  var ui = SpreadsheetApp.getUi();
  try {
    ensureConfigSheet_();
    ensurePostsSheet_();
    ensureLogSheet_();
    var interval = installTrigger();
    ui.alert(
      'セットアップ完了',
      'シートとトリガーを準備しました。\n' +
      '・トリガー間隔: ' + interval + ' 分\n\n' +
      '次に「設定」シートで THREADS_USER_ID と THREADS_ACCESS_TOKEN を入力してください。',
      ui.ButtonSet.OK
    );
  } catch (e) {
    ui.alert('セットアップ失敗', String(e && e.message || e), ui.ButtonSet.OK);
  }
}

/**
 * メニュー「トリガー解除」。自動実行を止める（シート・データはそのまま）。
 */
function uninstall() {
  var ui = SpreadsheetApp.getUi();
  var n = removeTrigger();
  ui.alert('トリガー解除', n + ' 件のトリガーを削除しました。', ui.ButtonSet.OK);
}
