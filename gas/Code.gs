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
    .addItem('連投機能へ移行（列を追加）', 'migrateToThreadV2')
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

    // 対象: 空欄 / 待機中 / 一部投稿済み の 3 種（一部投稿済みは再開対象）
    if (status !== '' && status !== STATUS.WAITING && status !== STATUS.PARTIAL) continue;

    // --- 本文リスト構築（§3-2） ---
    var firstBody = String((p.bodies && p.bodies[0]) || '');
    if (firstBody.trim() === '') {
      // 本文（1個目）が空 = ユーザー未入力の空行とみなしスキップ。
      // ただし日付や時刻が入っていれば「失敗」扱い。
      if (p.date || p.hour !== '' || p.minute !== '') {
        updatePostRow_(p.row, { status: STATUS.FAILED, error: '本文が空です' });
        appendLog(p.id, 'fail', '本文が空です (row ' + p.row + ')');
      }
      continue;
    }

    // 本文から連続して埋まっている分だけ採用。空欄が出たら打ち切り。
    var texts = [];
    var truncated = false;
    for (var b = 0; b < p.bodies.length; b++) {
      var t = String(p.bodies[b] === null || p.bodies[b] === undefined ? '' : p.bodies[b]);
      if (t.trim() === '') {
        // 打ち切り後ろにまだ本文が残っているなら警告（§3-2）
        for (var rest = b + 1; rest < p.bodies.length; rest++) {
          if (String(p.bodies[rest] || '').trim() !== '') { truncated = true; break; }
        }
        break;
      }
      texts.push(t);
    }
    if (truncated) {
      appendLog(p.id, 'info', '本文に空欄があるため ' + texts.length + ' 連投で打ち切り（以降の本文は無視） (row ' + p.row + ')');
    }

    // 文字数チェック（各本文ごと）。1 つでも超過なら 1 個も投稿しない。
    var overIdx = -1;
    for (var c = 0; c < texts.length; c++) {
      if (texts[c].length > BODY_MAX_LENGTH) { overIdx = c; break; }
    }
    if (overIdx >= 0) {
      updatePostRow_(p.row, { status: STATUS.FAILED, error: '文字数超過 (本文' + (overIdx + 1) + ': ' + texts[overIdx].length + ' / ' + BODY_MAX_LENGTH + ')' });
      appendLog(p.id, 'fail', '文字数超過 本文' + (overIdx + 1) + ' (row ' + p.row + ')');
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

    // --- 再開位置の決定（§3-4 ②） ---
    var postedIds = parsePostedIds_(p.postId);
    var startIndex = postedIds.length;                                  // 既に投稿済みの本数
    var lastId = postedIds.length > 0 ? postedIds[postedIds.length - 1] : null;

    // 既に全部投稿済みなのに残りが無い（再開対象だが完了済み）→ 整合を取って完了
    if (startIndex >= texts.length) {
      updatePostRow_(p.row, { status: STATUS.DONE, postedAt: new Date(), error: '' });
      continue;
    }

    // --- 連投ループ ---
    var aborted = false;
    for (var k = startIndex; k < texts.length; k++) {
      var replyToId = lastId; // k=0 かつ postedIds 空なら null（通常投稿）
      try {
        var result = publishTextPost(userId, token, texts[k], replyToId);
        postedIds.push(result.id);
        // 投稿 ID は 1 個ごとに即書き込み（途中で落ちても進捗を残す）
        updatePostRow_(p.row, { postId: postedIds.join(', ') });
        if (k === 0) {
          updatePostRow_(p.row, { postUrl: result.permalink || '' });
        }
        lastId = result.id;
        appendLog(p.id, 'success', texts.length + ' 連投中 ' + (k + 1) + ' 個目成功 id=' + result.id + ' (row ' + p.row + ')');
      } catch (e) {
        aborted = true;
        if (e && e.rateLimited) {
          if (postedIds.length > 0) {
            updatePostRow_(p.row, { status: STATUS.PARTIAL, error: 'レート制限のため中断（次回再開）' });
            appendLog(p.id, 'skip', 'レート制限で中断 一部投稿済み ' + postedIds.length + '/' + texts.length + ' (row ' + p.row + ')');
          } else {
            // 1 個も成功していない → ステータス変更せず（待機中のまま）次回最初から
            appendLog(p.id, 'skip', 'レート制限のため次回に持ち越し (row ' + p.row + ')');
          }
        } else {
          var msg = String(e && e.message || e);
          if (postedIds.length > 0) {
            updatePostRow_(p.row, { status: STATUS.PARTIAL, error: msg });
            appendLog(p.id, 'fail', '連投中断 ' + postedIds.length + '/' + texts.length + ': ' + msg + ' (row ' + p.row + ')');
          } else {
            updatePostRow_(p.row, { status: STATUS.FAILED, error: msg });
            appendLog(p.id, 'fail', msg + ' (row ' + p.row + ')');
          }
        }
        break;
      }
    }

    // --- 完了処理 ---
    if (!aborted) {
      updatePostRow_(p.row, { status: STATUS.DONE, postedAt: new Date(), error: '' });
      appendLog(p.id, 'success', texts.length + ' 連投すべて完了 (row ' + p.row + ')');
    }
  }
}

/**
 * 投稿ID 列のカンマ区切り文字列を ID 配列に分解する。
 * 空セルなら空配列を返す。
 */
function parsePostedIds_(cellValue) {
  var s = String(cellValue === null || cellValue === undefined ? '' : cellValue).trim();
  if (s === '') return [];
  var parts = s.split(',');
  var ids = [];
  for (var i = 0; i < parts.length; i++) {
    var v = parts[i].trim();
    if (v !== '') ids.push(v);
  }
  return ids;
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

    // トークン自動更新トリガーの登録。
    // TokenRefresh.gs の関数名は環境によって異なる場合があるため、存在するものを呼ぶ。
    // 未導入でもセットアップ全体は止めない。
    var tokenMsg = '（TokenRefresh.gs 未導入のためスキップ）';
    var tokenSetupFn =
      (typeof setupTokenRefreshTrigger === 'function') ? setupTokenRefreshTrigger :
      (typeof installTokenRefreshTrigger === 'function') ? installTokenRefreshTrigger : null;
    if (tokenSetupFn) {
      try {
        tokenSetupFn();
        tokenMsg = '登録しました';
      } catch (e) {
        tokenMsg = '登録に失敗: ' + String(e && e.message || e);
        appendLog('', 'fail', 'トークン更新トリガー登録に失敗: ' + String(e && e.message || e));
      }
    }

    ui.alert(
      'セットアップ完了',
      'シートとトリガーを準備しました。\n' +
      '・投稿チェック間隔: ' + interval + ' 分\n' +
      '・トークン自動更新: ' + tokenMsg + '\n\n' +
      '次に「設定」シートで THREADS_USER_ID と THREADS_ACCESS_TOKEN を入力してください。',
      ui.ButtonSet.OK
    );
  } catch (e) {
    ui.alert('セットアップ失敗', String(e && e.message || e), ui.ButtonSet.OK);
  }
}

/**
 * メニュー「連投機能へ移行（列を追加）」。
 * 旧 10 列レイアウトのシートに 本文2〜本文8 の列を挿入する（既存ユーザー向け・一回限り）。
 */
function migrateToThreadV2() {
  var ui = SpreadsheetApp.getUi();
  try {
    var res = migratePostsSheetToThreadV2_();
    if (res === 'already') {
      ui.alert('移行済み', 'このシートは既に連投機能のレイアウト（本文2〜本文8 あり）です。何もしませんでした。', ui.ButtonSet.OK);
    } else {
      ui.alert('移行完了', '本文2〜本文8 の列を追加しました。既存の投稿履歴はそのまま保持されています。', ui.ButtonSet.OK);
    }
  } catch (e) {
    ui.alert('移行失敗', String(e && e.message || e), ui.ButtonSet.OK);
  }
}

/**
 * メニュー「トリガー解除」。自動実行を止める（シート・データはそのまま）。
 */
function uninstall() {
  var ui = SpreadsheetApp.getUi();
  var n = removeTrigger();
  if (typeof removeTokenRefreshTrigger === 'function') {
    n += removeTokenRefreshTrigger();
  }
  ui.alert('トリガー解除', n + ' 件のトリガーを削除しました。', ui.ButtonSet.OK);
}
