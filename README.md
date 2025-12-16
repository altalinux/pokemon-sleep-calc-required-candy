# アメ何個いる？(Pokémon Sleep アメ・経験値シミュレータ)

Web版（GitHub Pages）
[https://kerusu-1984.github.io/pokemon-sleep-calc-required-candy/](https://kerusu-1984.github.io/pokemon-sleep-calc-required-candy/)

このリポジトリは **Web（Svelte）** と **CLI（Node.js）** の両方で、同じ計算ロジック（`src/lib/calculator.ts`）を利用して「必要EXP / 必要アメ数 / 必要ゆめのかけら」を計算します。

---

## 使い方（Web）

開発サーバ起動：

```bash
npm install
npm run dev
```

---

## 使い方（CLI）

### 事前準備

Node.js 18+ 推奨。

```bash
npm install
```

### まずはそのまま実行（ビルド不要）

```bash
npm run cli -- 10 25
npm run cli -- -f 10 -t 25 -n exp-up -e 900 -c mini
```

### コマンドとして使う（ビルド + npm link）

```bash
npm run build:cli
npm link
candycalc 10 25
```

### CLI オプション

```bash
candycalc [from] [to] [options]
```

* `-f, --from <level>` 初期レベル（整数）。位置引数でも指定可
* `-t, --to <level>` 目標レベル（整数）。位置引数でも指定可
* `-n, --nature <nature>` 性格補正（EXP）(既定: `neutral`)

  * `up` / `exp-up`
  * `down` / `exp-down`
  * `neutral` / `exp-neutral`
* `-e, --exp_type <type>` 経験値タイプ（既定: `600`）

  * `600 | 900 | 1080`
* `-c, --candyboost <mode>` アメブースト（既定: `none`）

  * `mini`
  * `normal` / `std`
  * `none` / `off`

- デフォルト出力は pretty (--pretty)。機械処理したい場合は --json を指定してください。
ヘルプ：

```bash
candycalc --help
```

### 注意点

* `--candyboost mini/normal` は **アメEXPが2倍**になります。
* ゆめのかけら倍率は **mini=4倍 / normal=5倍**（noneは通常）です。
* 出力は JSON です。

---

## 開発メモ

### 計算ロジック

計算の本体は `src/lib/calculator.ts` にあります（Web/CLI共通）。

### 経験値テーブルの追加・更新

`src/lib/index.ts` の `nextExps` を修正します。

---

## デプロイ

main ブランチに push すると GitHub Actions が自動でビルドし、GitHub Pages にデプロイします。

