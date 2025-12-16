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
  66363
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
  866
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
  if (level < 25) return 35;
  if (level < 30) return 30;
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
    if (!/^\d+$/.test(v)) throw new Error(`${label} \u306F\u6574\u6570\u3067\u6307\u5B9A\u3057\u3066\u304F\u3060\u3055\u3044: ${v}`);
    const n = Number(v);
    if (!Number.isSafeInteger(n) || n <= 0) throw new Error(`${label} \u306F1\u4EE5\u4E0A\u306E\u6574\u6570\u3067\u6307\u5B9A\u3057\u3066\u304F\u3060\u3055\u3044: ${v}`);
    return n;
  };
}
function parseNature(v) {
  const s = v.trim().toLowerCase();
  if (s === "up" || s === "exp-up" || s === "expup") return "up";
  if (s === "down" || s === "exp-down" || s === "expdown") return "down";
  if (s === "neutral" || s === "exp-neutral" || s === "expneutral" || s === "normal") return "normal";
  throw new Error(`--nature \u306F up/down/neutral(normal) \u307E\u305F\u306F exp-up/exp-down/exp-neutral \u3067\u6307\u5B9A\u3057\u3066\u304F\u3060\u3055\u3044: ${v}`);
}
function parseExpType(v) {
  const s = String(v).trim();
  if (s === "600" || s === "900" || s === "1080") return s;
  throw new Error(`--exp_type \u306F 600 / 900 / 1080 \u306E\u3044\u305A\u308C\u304B\u3067\u3059: ${v}`);
}
function parseCandyBoost(v) {
  const s = v.trim().toLowerCase();
  if (s === "mini") return "mini";
  if (s === "normal" || s === "std") return "normal";
  if (s === "none" || s === "off") return "none";
  throw new Error(`--candyboost \u306F mini / normal / std / none / off \u306E\u3044\u305A\u308C\u304B\u3067\u3059: ${v}`);
}
var program = new import_commander.Command();
program.name("candycalc").description("Pok\xE9mon Sleep: required candy / exp / dream shards calculator (CLI)").argument("[from]", "\u521D\u671F\u30EC\u30D9\u30EB\uFF08\u6570\u5024\uFF09", parseIntStrict("from")).argument("[to]", "\u76EE\u6A19\u30EC\u30D9\u30EB\uFF08\u6570\u5024\uFF09", parseIntStrict("to")).option("-f, --from <level>", "\u521D\u671F\u30EC\u30D9\u30EB\uFF08\u6570\u5024\uFF09", parseIntStrict("from")).option("-t, --to <level>", "\u76EE\u6A19\u30EC\u30D9\u30EB\uFF08\u6570\u5024\uFF09", parseIntStrict("to")).option("-n, --nature <nature>", "\u305B\u3044\u304B\u304F\u88DC\u6B63: exp-up/exp-down/exp-neutral or up/down/neutral", parseNature, "normal").option("-e, --exp_type <type>", "\u7D4C\u9A13\u5024\u30BF\u30A4\u30D7: 600 / 900 / 1080", parseExpType, "600").option("-c, --candyboost <mode>", "\u30A2\u30E1\u30D6\u30FC\u30B9\u30C8: mini / normal(std) / none(off)", parseCandyBoost, "none").action((argFrom, argTo) => {
  const opts = program.opts();
  const from = opts.from ?? argFrom;
  const to = opts.to ?? argTo;
  if (from == null || to == null) {
    program.error("\u521D\u671F\u30EC\u30D9\u30EB\u3068\u76EE\u6A19\u30EC\u30D9\u30EB\u304C\u5FC5\u8981\u3067\u3059\u3002\u4F8B: candycalc 10 25 / candycalc -f 10 -t 25");
  }
  const requiredExp = calcRequiredExp(from, to, opts.exp_type);
  const requiredCandy = opts.candyboost === "none" ? calcRequiredCandy(from, to, opts.nature, opts.exp_type) : calcRequiredBoostedCandy(from, to, opts.nature, opts.exp_type);
  const requiredDreamShards = opts.candyboost === "none" ? calcRequiredDreamShards(from, to, opts.nature, opts.exp_type) : opts.candyboost === "normal" ? calcRequiredBoostedDreamShards(from, to, opts.nature, opts.exp_type) : calcRequiredMiniBoostedDreamShards(from, to, opts.nature, opts.exp_type);
  console.log(
    JSON.stringify(
      { from, to, nature: opts.nature, exp_type: opts.exp_type, candyboost: opts.candyboost, requiredExp, requiredCandy, requiredDreamShards },
      null,
      2
    )
  );
});
program.parse(process.argv);
