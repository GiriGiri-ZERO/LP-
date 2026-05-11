/**
 * ThreadsApi.gs
 * Threads Graph API のラッパー。
 *
 * 公式ドキュメント: https://developers.facebook.com/docs/threads/
 *
 * Phase 1 ではテキスト投稿のみ。Phase 2 で画像/動画を追加する際は、
 * createTextContainer_ と並列に createImageContainer_ などを足す形で拡張する。
 */

var THREADS_API_BASE = 'https://graph.threads.net/v1.0';

/**
 * Threads にテキスト投稿を行う高レベル関数。
 * 成功時: { id: postId, permalink: url }
 * 失敗時: throw Error
 */
function publishTextPost(userId, accessToken, text) {
  var containerId = createTextContainer_(userId, accessToken, text);
  // メディアコンテナ作成直後すぐに publish するとサーバー側準備が間に合わないことがある。
  // 公式ドキュメントでも数秒待つことが推奨されている。
  Utilities.sleep(2000);
  var postId = publishContainer_(userId, accessToken, containerId);
  var permalink = '';
  try {
    permalink = fetchPermalink_(postId, accessToken);
  } catch (e) {
    // permalink 取得失敗は致命的ではない（投稿自体は成功している）
    permalink = '';
  }
  return { id: postId, permalink: permalink };
}

/**
 * Step 1: テキスト用メディアコンテナを作成し container_id を返す。
 */
function createTextContainer_(userId, accessToken, text) {
  var url = THREADS_API_BASE + '/' + encodeURIComponent(userId) + '/threads';
  var payload = {
    media_type: 'TEXT',
    text: text,
    access_token: accessToken
  };
  var json = httpPostWithRetry_(url, payload);
  if (!json.id) throw new Error('container_id が返されませんでした: ' + JSON.stringify(json));
  return json.id;
}

/**
 * Step 2: コンテナを公開し post_id を返す。
 */
function publishContainer_(userId, accessToken, containerId) {
  var url = THREADS_API_BASE + '/' + encodeURIComponent(userId) + '/threads_publish';
  var payload = {
    creation_id: containerId,
    access_token: accessToken
  };
  var json = httpPostWithRetry_(url, payload);
  if (!json.id) throw new Error('post_id が返されませんでした: ' + JSON.stringify(json));
  return json.id;
}

/**
 * 公開済み投稿の permalink を取得。
 */
function fetchPermalink_(postId, accessToken) {
  var url = THREADS_API_BASE + '/' + encodeURIComponent(postId) +
    '?fields=permalink&access_token=' + encodeURIComponent(accessToken);
  var res = UrlFetchApp.fetch(url, { method: 'get', muteHttpExceptions: true });
  var code = res.getResponseCode();
  var json = safeParseJson_(res.getContentText());
  if (code >= 200 && code < 300 && json.permalink) return json.permalink;
  throw new Error('permalink 取得失敗 (HTTP ' + code + '): ' + res.getContentText());
}

/**
 * トークンの有効性を簡易確認するためのエンドポイント呼び出し。
 * ユーザー ID 自身を取得して 200 が返れば OK と判断する。
 */
function pingThreadsApi(userId, accessToken) {
  var url = THREADS_API_BASE + '/' + encodeURIComponent(userId) +
    '?fields=id,username&access_token=' + encodeURIComponent(accessToken);
  var res = UrlFetchApp.fetch(url, { method: 'get', muteHttpExceptions: true });
  var code = res.getResponseCode();
  var body = res.getContentText();
  if (code >= 200 && code < 300) {
    var json = safeParseJson_(body);
    return { ok: true, username: json.username || '', raw: body };
  }
  return { ok: false, code: code, raw: body };
}

/**
 * UrlFetchApp.fetch を POST + リトライ付きで実行する。
 *  - HTTP 200-299: 正常 (JSON を返す)
 *  - HTTP 429: レート制限。リトライせず特別な例外を投げ、呼び出し側で次回に持ち越し
 *  - HTTP 5xx, ネットワーク例外: 最大 3 回リトライ (1s, 3s, 5s)
 *  - HTTP 4xx (429 以外): リトライせずエラー
 */
function httpPostWithRetry_(url, payload) {
  var backoffs = [1000, 3000, 5000];
  var lastError = null;

  for (var attempt = 0; attempt <= backoffs.length; attempt++) {
    try {
      var res = UrlFetchApp.fetch(url, {
        method: 'post',
        payload: payload,
        muteHttpExceptions: true
      });
      var code = res.getResponseCode();
      var body = res.getContentText();
      var json = safeParseJson_(body);

      if (code >= 200 && code < 300) return json;

      if (code === 429) {
        // レート制限はリトライせず呼び出し側にハンドリングを委ねる
        var rateErr = new Error('RATE_LIMITED: ' + body);
        rateErr.rateLimited = true;
        throw rateErr;
      }

      if (code >= 500) {
        lastError = new Error('HTTP ' + code + ': ' + body);
        // 5xx はリトライ
      } else {
        // 4xx はリトライしない
        throw new Error('HTTP ' + code + ': ' + body);
      }
    } catch (e) {
      if (e && e.rateLimited) throw e;
      lastError = e;
    }

    if (attempt < backoffs.length) {
      Utilities.sleep(backoffs[attempt]);
    }
  }
  throw lastError || new Error('リクエスト失敗（原因不明）');
}

function safeParseJson_(s) {
  try { return JSON.parse(s); } catch (e) { return {}; }
}
