#!/usr/bin/env node
"use strict";

// src/cli.ts
var import_commander = require("commander");

// src/lib/calculator.ts
var totalExps = [
  0,
  54,
  125,
  233,
  361,
  525,
  727,
  971,
  1245,
  1560,
  1905,
  2281,
  2688,
  3107,
  3536,
  3976,
  4430,
  4899,
  5382,
  5879,
  6394,
  6931,
  7489,
  8068,
  8668,
  9290,
  9933,
  10598,
  11284,
  11992,
  12721,
  13469,
  14235,
  15020,
  15823,
  16644,
  17483,
  18340,
  19215,
  20108,
  21018,
  21946,
  22891,
  23854,
  24834,
  25831,
  26846,
  27878,
  28927,
  29993,
  31355,
  32917,
  34664,
  36610,
  38805,
  41084,
  43488,
  46021,
  48687,
  51493,
  54358,
  57280,
  60257,
  63286,
  66363,
  69458,
  72574,
  75718,
  78907,
  82162
];
var dreamShardsPerCandy = [
  0,
  14,
  18,
  22,
  27,
  30,
  34,
  39,
  44,
  48,
  50,
  52,
  53,
  56,
  59,
  62,
  66,
  68,
  71,
  74,
  78,
  81,
  85,
  88,
  92,
  95,
  100,
  105,
  111,
  117,
  122,
  126,
  130,
  136,
  143,
  151,
  160,
  167,
  174,
  184,
  192,
  201,
  211,
  221,
  227,
  236,
  250,
  264,
  279,
  295,
  309,
  323,
  338,
  356,
  372,
  391,
  437,
  486,
  538,
  593,
  651,
  698,
  750,
  804,
  866,
  932,
  1004,
  1084,
  1173,
  1272
];
var expTypeToRatio = {
  "600": 1,
  "900": 1.5,
  "1080": 1.8
};
var natureToCandyExpRatio = {
  down: 21 / 25,
  normal: 1,
  up: 30 / 25
};
var calcRequiredExp = (currentLevel, targetLevel, expType) => {
  if (currentLevel >= targetLevel) {
    return 0;
  }
  const ratio = expTypeToRatio[expType];
  const currentExp = Math.round(totalExps[currentLevel - 1] * ratio);
  const targetExp = Math.round(totalExps[targetLevel - 1] * ratio);
  return targetExp - currentExp;
};
var baseCandyExpByLevel = (level) => {
  if (level < 25) return 40;
  if (level < 30) return 35;
  return 25;
};
var calcCandyExp = (nature, level = 30) => {
  const base = baseCandyExpByLevel(level);
  const ratio = natureToCandyExpRatio[nature];
  return Math.round(base * ratio);
};
var calcBoostedCandyExp = (nature, level = 30) => {
  return calcCandyExp(nature, level) * 2;
};
var calcRequiredCandyBySim = (currentLevel, targetLevel, nature, expType, candyExpFn) => {
  if (currentLevel >= targetLevel) return 0;
  let candySum = 0;
  let carry = 0;
  for (let level = currentLevel; level < targetLevel; level++) {
    const requiredExp = calcRequiredExp(level, level + 1, expType) - carry;
    const candyExp = candyExpFn(nature, level);
    const requiredCandy = Math.ceil(requiredExp / candyExp);
    candySum += requiredCandy;
    carry = candyExp * requiredCandy - requiredExp;
  }
  return candySum;
};
var calcRequiredCandy = (currentLevel, targetLevel, nature, expType) => {
  return calcRequiredCandyBySim(currentLevel, targetLevel, nature, expType, calcCandyExp);
};
var calcRequiredBoostedCandy = (currentLevel, targetLevel, nature, expType) => {
  return calcRequiredCandyBySim(currentLevel, targetLevel, nature, expType, calcBoostedCandyExp);
};
var calcRequiredDreamShardsBySim = (currentLevel, targetLevel, nature, expType, candyExpFn, shardsMultiplier) => {
  if (currentLevel >= targetLevel) return 0;
  let dreamShardsSum = 0;
  let carry = 0;
  for (let level = currentLevel; level < targetLevel; level++) {
    const requiredExp = calcRequiredExp(level, level + 1, expType) - carry;
    const candyExp = candyExpFn(nature, level);
    const requiredCandy = Math.ceil(requiredExp / candyExp);
    dreamShardsSum += dreamShardsPerCandy[level] * requiredCandy * shardsMultiplier;
    carry = candyExp * requiredCandy - requiredExp;
  }
  return dreamShardsSum;
};
var calcRequiredDreamShards = (currentLevel, targetLevel, nature, expType) => {
  return calcRequiredDreamShardsBySim(
    currentLevel,
    targetLevel,
    nature,
    expType,
    calcCandyExp,
    1
  );
};
var calcRequiredBoostedDreamShards = (currentLevel, targetLevel, nature, expType) => {
  return calcRequiredDreamShardsBySim(
    currentLevel,
    targetLevel,
    nature,
    expType,
    calcBoostedCandyExp,
    5
  );
};
var calcRequiredMiniBoostedDreamShards = (currentLevel, targetLevel, nature, expType) => {
  return calcRequiredDreamShardsBySim(
    currentLevel,
    targetLevel,
    nature,
    expType,
    calcBoostedCandyExp,
    4
  );
};

// src/cli.ts
function parseIntStrict(label) {
  return (v) => {
    if (!/^\d+$/.test(v)) throw new Error(`${label} \u306F1\u4EE5\u4E0A\u306E\u6574\u6570\u3067\u6307\u5B9A\u3057\u3066\u304F\u3060\u3055\u3044: ${v}`);
    const n = Number(v);
    if (!Number.isSafeInteger(n) || n <= 0)
      throw new Error(`${label} \u306F1\u4EE5\u4E0A\u306E\u6574\u6570\u3067\u6307\u5B9A\u3057\u3066\u304F\u3060\u3055\u3044: ${v}`);
    return n;
  };
}
function parseNature(v) {
  const s = v.trim().toLowerCase();
  if (s === "up" || s === "exp-up" || s === "expup") return "up";
  if (s === "down" || s === "exp-down" || s === "expdown") return "down";
  if (s === "neutral" || s === "exp-neutral" || s === "expneutral") return "neutral";
  throw new Error(
    `--nature \u306F up/down/neutral \u307E\u305F\u306F exp-up/exp-down/exp-neutral \u3067\u6307\u5B9A\u3057\u3066\u304F\u3060\u3055\u3044: ${v}`
  );
}
function parseExpType(v) {
  const n = Number(v);
  if (n === 600 || n === 900 || n === 1080) return n;
  throw new Error(`--exp_type \u306F 600 / 900 / 1080 \u306E\u3044\u305A\u308C\u304B\u3067\u3059: ${v}`);
}
function parseCandyBoost(v) {
  const s = v.trim().toLowerCase();
  if (s === "mini") return "mini";
  if (s === "normal" || s === "std") return "normal";
  if (s === "none" || s === "off") return "none";
  throw new Error(`--candyboost \u306F mini / normal(std) / none(off) \u306E\u3044\u305A\u308C\u304B\u3067\u3059: ${v}`);
}
function formatPretty(o) {
  const nf = new Intl.NumberFormat("ja-JP");
  return [
    "candycalc result",
    "----------------",
    `Level:           ${o.from} \u2192 ${o.to}`,
    `Nature (EXP):    ${o.nature}`,
    `Exp type:        ${o.exp_type}`,
    `Candy boost:     ${o.candyboost}`,
    "",
    `Required EXP:        ${nf.format(o.requiredExp)}`,
    `Required candies:    ${nf.format(o.requiredCandy)} \u500B`,
    `Required shards:     ${nf.format(o.requiredDreamShards)}`
  ].join("\n");
}
var program = new import_commander.Command();
program.name("candycalc").description("Pok\xE9mon Sleep\u306E\u30EC\u30D9\u30EB\u4E0A\u3052\u306B\u5FC5\u8981\u306A\u300CEXP / \u30A2\u30E1\u6570 / \u3086\u3081\u306E\u304B\u3051\u3089\u300D\u3092\u8A08\u7B97\u3057\u307E\u3059\u3002").usage("[from] [to] [options]").argument("[from]", "\u521D\u671F\u30EC\u30D9\u30EB\uFF08\u6574\u6570\uFF09\u3002\u7701\u7565\u6642\u306F --from \u3092\u4F7F\u7528", parseIntStrict("from")).argument("[to]", "\u76EE\u6A19\u30EC\u30D9\u30EB\uFF08\u6574\u6570\uFF09\u3002\u7701\u7565\u6642\u306F --to \u3092\u4F7F\u7528", parseIntStrict("to")).option("-f, --from <level>", "\u521D\u671F\u30EC\u30D9\u30EB\uFF08\u6574\u6570\uFF09\u3002\u4F4D\u7F6E\u5F15\u6570\u3067\u3082\u6307\u5B9A\u53EF", parseIntStrict("from")).option("-t, --to <level>", "\u76EE\u6A19\u30EC\u30D9\u30EB\uFF08\u6574\u6570\uFF09\u3002\u4F4D\u7F6E\u5F15\u6570\u3067\u3082\u6307\u5B9A\u53EF", parseIntStrict("to")).option(
  "-n, --nature <nature>",
  "\u6027\u683C\u88DC\u6B63\uFF08EXP\uFF09: up(exp-up) / down(exp-down) / neutral(exp-neutral)",
  parseNature,
  "neutral"
).option("-e, --exp_type <type>", "\u7D4C\u9A13\u5024\u30BF\u30A4\u30D7: 600 / 900 / 1080", parseExpType, 600).option(
  "-c, --candyboost <mode>",
  "\u30A2\u30E1\u30D6\u30FC\u30B9\u30C8: mini / normal(std) / none(off)",
  parseCandyBoost,
  "none"
).option("--up", "\u6027\u683C\u88DC\u6B63(EXP)\u3092 up \u306B\u3059\u308B\uFF08-n up \u3068\u540C\u7B49\uFF09").option("--down", "\u6027\u683C\u88DC\u6B63(EXP)\u3092 down \u306B\u3059\u308B\uFF08-n down \u3068\u540C\u7B49\uFF09").option("--neutral", "\u6027\u683C\u88DC\u6B63(EXP)\u3092 neutral \u306B\u3059\u308B\uFF08-n neutral \u3068\u540C\u7B49\uFF09").option("--600", "\u7D4C\u9A13\u5024\u30BF\u30A4\u30D7\u3092 600 \u306B\u3059\u308B\uFF08-e 600 \u3068\u540C\u7B49\uFF09").option("--900", "\u7D4C\u9A13\u5024\u30BF\u30A4\u30D7\u3092 900 \u306B\u3059\u308B\uFF08-e 900 \u3068\u540C\u7B49\uFF09").option("--1080", "\u7D4C\u9A13\u5024\u30BF\u30A4\u30D7\u3092 1080 \u306B\u3059\u308B\uFF08-e 1080 \u3068\u540C\u7B49\uFF09").option("--mini", "\u30DF\u30CB\u30A2\u30E1\u30D6\u30FC\u30B9\u30C8\uFF08-c mini \u3068\u540C\u7B49\uFF09").option("--normal", "\u901A\u5E38\u30A2\u30E1\u30D6\u30FC\u30B9\u30C8\uFF08-c normal \u3068\u540C\u7B49\uFF09").option("--none", "\u30A2\u30E1\u30D6\u30FC\u30B9\u30C8\u306A\u3057\uFF08-c none \u3068\u540C\u7B49\u3001\u30C7\u30D5\u30A9\u30EB\u30C8\uFF09").option("--pretty", "\u4EBA\u9593\u5411\u3051\u306E\u6574\u5F62\u8868\u793A\u3067\u51FA\u529B\uFF08\u30C7\u30D5\u30A9\u30EB\u30C8\uFF09").option("--json", "JSON\u3067\u51FA\u529B").addHelpText(
  "after",
  `
Examples:
  $ candycalc 10 25
  $ candycalc 10 25 --down --900
  $ candycalc 10 25 --mini
  $ candycalc -f 10 -t 25 -n exp-up -e 900 -c mini
  $ candycalc 10 25 -c normal --json

Notes:
  - --candyboost mini/normal \u306F\u30A2\u30E1EXP\u304C2\u500D\u306B\u306A\u308A\u307E\u3059\u3002
  - \u3086\u3081\u306E\u304B\u3051\u3089\u500D\u7387\u306F mini=4\u500D / normal=6\u500D\uFF08none\u306F\u901A\u5E38\uFF09\u3067\u3059\u3002
  - -n/-e/-c \u306E\u4EE3\u308F\u308A\u306B --down / --900 / --mini \u306E\u3088\u3046\u306A\u30B7\u30E7\u30FC\u30C8\u30AB\u30C3\u30C8\u6307\u5B9A\u3082\u53EF\u80FD\u3067\u3059\u3002
  - \u30C7\u30D5\u30A9\u30EB\u30C8\u51FA\u529B\u306F pretty (--pretty)\u3002\u6A5F\u68B0\u51E6\u7406\u3057\u305F\u3044\u5834\u5408\u306F --json \u3092\u6307\u5B9A\u3057\u3066\u304F\u3060\u3055\u3044\u3002
`
).action((argFrom, argTo) => {
  const opts = program.opts();
  const from = opts.from ?? argFrom;
  const to = opts.to ?? argTo;
  if (from == null || to == null) {
    program.error(
      "\u521D\u671F\u30EC\u30D9\u30EB\u3068\u76EE\u6A19\u30EC\u30D9\u30EB\u304C\u5FC5\u8981\u3067\u3059\u3002\u4F8B: candycalc 10 25 / candycalc -f 10 -t 25"
    );
    return;
  }
  const argv = process.argv.slice(2);
  const natureFromN = argv.includes("-n") || argv.includes("--nature");
  const expFromE = argv.includes("-e") || argv.includes("--exp_type");
  const boostFromC = argv.includes("-c") || argv.includes("--candyboost");
  const natureFlags = [
    opts.up ? "up" : null,
    opts.down ? "down" : null,
    opts.neutral ? "neutral" : null
  ].filter(Boolean);
  if (natureFlags.length > 1) {
    program.error("--up/--down/--neutral \u306F\u540C\u6642\u306B\u6307\u5B9A\u3067\u304D\u307E\u305B\u3093\u3002");
  }
  if (natureFlags.length === 1) {
    if (natureFromN) {
      program.error("-n/--nature \u3068 --up/--down/--neutral \u306F\u540C\u6642\u306B\u6307\u5B9A\u3067\u304D\u307E\u305B\u3093\u3002");
    }
    opts.nature = natureFlags[0];
  }
  const expFlags = [
    opts["600"] ? 600 : null,
    opts["900"] ? 900 : null,
    opts["1080"] ? 1080 : null
  ].filter(Boolean);
  if (expFlags.length > 1) {
    program.error("--600/--900/--1080 \u306F\u540C\u6642\u306B\u6307\u5B9A\u3067\u304D\u307E\u305B\u3093\u3002");
  }
  if (expFlags.length === 1) {
    if (expFromE) {
      program.error("-e/--exp_type \u3068 --600/--900/--1080 \u306F\u540C\u6642\u306B\u6307\u5B9A\u3067\u304D\u307E\u305B\u3093\u3002");
    }
    opts.exp_type = expFlags[0];
  }
  const boostFlags = [
    opts.mini ? "mini" : null,
    opts.normal ? "normal" : null,
    opts.none ? "none" : null
  ].filter(Boolean);
  if (boostFlags.length > 1) {
    program.error("--mini/--normal/--none \u306F\u540C\u6642\u306B\u6307\u5B9A\u3067\u304D\u307E\u305B\u3093\u3002");
  }
  if (boostFlags.length === 1) {
    if (boostFromC) {
      program.error("-c/--candyboost \u3068 --mini/--normal/--none \u306F\u540C\u6642\u306B\u6307\u5B9A\u3067\u304D\u307E\u305B\u3093\u3002");
    }
    opts.candyboost = boostFlags[0];
  }
  if (opts.json && opts.pretty) {
    program.error("--json \u3068 --pretty \u306F\u540C\u6642\u306B\u6307\u5B9A\u3067\u304D\u307E\u305B\u3093\u3002");
  }
  const natureForCalc = opts.nature === "neutral" ? "normal" : opts.nature;
  const expTypeForCalc = String(opts.exp_type);
  const requiredExp = calcRequiredExp(from, to, expTypeForCalc);
  const requiredCandy = opts.candyboost === "none" ? calcRequiredCandy(from, to, natureForCalc, expTypeForCalc) : calcRequiredBoostedCandy(from, to, natureForCalc, expTypeForCalc);
  const requiredDreamShards = opts.candyboost === "none" ? calcRequiredDreamShards(from, to, natureForCalc, expTypeForCalc) : opts.candyboost === "normal" ? calcRequiredBoostedDreamShards(from, to, natureForCalc, expTypeForCalc) : calcRequiredMiniBoostedDreamShards(from, to, natureForCalc, expTypeForCalc);
  const out = {
    from,
    to,
    nature: opts.nature,
    exp_type: opts.exp_type,
    candyboost: opts.candyboost,
    requiredExp,
    requiredCandy,
    requiredDreamShards
  };
  if (opts.json) {
    console.log(JSON.stringify(out, null, 2));
  } else {
    console.log(formatPretty(out));
  }
});
program.parse(process.argv);
