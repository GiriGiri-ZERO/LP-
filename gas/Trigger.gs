/**
 * Trigger.gs
 * 時間ベーストリガーの登録 / 解除。
 *
 * main() を CHECK_INTERVAL_MIN（デフォルト 1 分）ごとに走らせる。
 */

var TRIGGER_HANDLER = 'main';

/**
 * 既存の同名トリガーを削除してから新規作成。
 * 設定シートの CHECK_INTERVAL_MIN を読む。
 */
function installTrigger() {
  removeTrigger();
  var interval = Number(getSetting('CHECK_INTERVAL_MIN', 1));
  if (isNaN(interval) || interval < 1) interval = 1;

  // GAS の everyMinutes() は 1, 5, 10, 15, 30 のいずれか
  var allowed = [1, 5, 10, 15, 30];
  if (allowed.indexOf(interval) === -1) {
    // 最も近い値に丸める
    interval = allowed.reduce(function (prev, curr) {
      return Math.abs(curr - interval) < Math.abs(prev - interval) ? curr : prev;
    });
  }

  ScriptApp.newTrigger(TRIGGER_HANDLER)
    .timeBased()
    .everyMinutes(interval)
    .create();

  return interval;
}

/**
 * main を呼び出すトリガーをすべて削除。
 */
function removeTrigger() {
  var triggers = ScriptApp.getProjectTriggers();
  var removed = 0;
  for (var i = 0; i < triggers.length; i++) {
    if (triggers[i].getHandlerFunction() === TRIGGER_HANDLER) {
      ScriptApp.deleteTrigger(triggers[i]);
      removed++;
    }
  }
  return removed;
}

/**
 * 現在登録されているトリガー数を返す（メニューからの確認用）。
 */
function countTriggers() {
  var triggers = ScriptApp.getProjectTriggers();
  var n = 0;
  for (var i = 0; i < triggers.length; i++) {
    if (triggers[i].getHandlerFunction() === TRIGGER_HANDLER) n++;
  }
  return n;
}
