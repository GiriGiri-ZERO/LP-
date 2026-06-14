#!/usr/bin/env bash
# 司令塔ボード/cloud を GitHub に上げる準備スクリプト（Macのターミナルで実行）
#
# 使い方:
#   1) ボード/cloud のフォルダに移動してから実行
#        cd "/Users/apple/Documents/Obsidian Vault/事業/司令塔ボード"
#        bash setup-vault-board-git.sh
#   2) 鍵スキャン → .gitignore作成 → init → commit まで自動
#   3) push は最後に表示される手順を、内容を確認してから手動で実行
#
# 安全方針: 鍵・トークンらしき文字列を見つけたら中断する。push は自動でしない。

set -euo pipefail

echo "▶ 作業フォルダ: $(pwd)"
read -r -p "  このフォルダを Git リポジトリにします。よろしいですか？ [y/N] " ok
[[ "${ok:-N}" =~ ^[yY]$ ]] || { echo "中止しました。"; exit 1; }

# --- 1. .gitignore を作成 ------------------------------------------------
echo "▶ .gitignore を作成/更新します"
cat > .gitignore <<'EOF'
# 鍵・秘密情報（絶対に上げない）
.secrets/
*.secret
.dev.vars
.env
board.config.js          # TOKEN を含むなら除外（サンプルは board.config.example.js）

# ビルド/依存
.wrangler/
node_modules/
dist/
__pycache__/
*.pyc

# OS
.DS_Store
EOF
echo "  → .gitignore 作成済み"

# --- 2. 鍵・トークンの混入スキャン（中断つき） --------------------------
echo "▶ 鍵・トークンらしき文字列をスキャンします（.gitignore対象は除外）"
# 既に git 管理外/対象外を除くため、候補ファイルだけ検査
PATTERN='(api[_-]?key|secret|token|password|bearer|sk-[A-Za-z0-9]{8,}|ghp_[A-Za-z0-9]{8,}|AKIA[0-9A-Z]{12})'
HITS=$(grep -RInaE --exclude-dir={.git,node_modules,.wrangler,.secrets} \
        --exclude=.gitignore --exclude=board.config.js \
        "$PATTERN" . 2>/dev/null || true)

if [[ -n "$HITS" ]]; then
  echo "⚠ 鍵・トークンの可能性がある記述が見つかりました:"
  echo "$HITS" | sed 's/^/    /'
  echo ""
  echo "  → 上のファイルから値を取り除く（環境変数 / wrangler secret に移す）か、"
  echo "    .gitignore に追加してから、もう一度このスクリプトを実行してください。"
  echo "  中断します（安全のため）。"
  exit 1
fi
echo "  → 明らかな鍵の混入は検出されませんでした"

# --- 3. git init & commit ------------------------------------------------
if [[ ! -d .git ]]; then
  git init -q
  echo "▶ git init 完了"
fi

git add -A
echo "▶ コミット対象（先頭30件）:"
git status --short | head -30

read -r -p "  この内容でコミットしますか？ [y/N] " ok2
[[ "${ok2:-N}" =~ ^[yY]$ ]] || { echo "コミットを中止しました。git add は済んでいます。"; exit 1; }

git commit -q -m "init: 司令塔ボード/cloud"
echo "▶ コミット完了"

# --- 4. 次の手順を表示 ---------------------------------------------------
cat <<'NEXT'

✅ ここまで完了。残りは内容を確認してから手動で：

  # A) GitHub に private リポジトリを作成（gh CLI がある場合）
  gh repo create girigiri-zero/vault-board --private --source=. --remote=origin --push
  #   ↑ これで作成＋remote追加＋push まで一気。gh が無ければ GitHub のWebで作成し ↓

  # B) 手動で remote 追加して push する場合
  git branch -M main
  git remote add origin git@github.com:girigiri-zero/vault-board.git
  git push -u origin main

  # C) Claude の GitHub App をこのリポジトリにインストール
  #    https://github.com/apps/claude  →  vault-board を選択

  # D) Worker のシークレット登録（値はコミットしない）
  cd cloud && wrangler secret put GITHUB_TOKEN

そのあと、docs/司令塔_指示即レス化_手順書.md の「手順3〜5」を実装すれば即レス化が完成します。
NEXT
