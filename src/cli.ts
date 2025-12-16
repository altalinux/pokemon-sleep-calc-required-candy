#!/usr/bin/env node
import { Command } from "commander";
import * as calculator from "./lib/calculator";

type CandyBoost = "mini" | "normal" | "none";
type NatureCli = "up" | "down" | "neutral";   // CLI仕様
type ExpTypeCli = 600 | 900 | 1080;          // CLI仕様
type NatureCalc = "up" | "down" | "normal";  // calculator.ts の仕様

function parseIntStrict(label: string) {
  return (v: string): number => {
    if (!/^\d+$/.test(v)) throw new Error(`${label} は1以上の整数で指定してください: ${v}`);
    const n = Number(v);
    if (!Number.isSafeInteger(n) || n <= 0) throw new Error(`${label} は1以上の整数で指定してください: ${v}`);
    return n;
  };
}

function parseNature(v: string): NatureCli {
  const s = v.trim().toLowerCase();
  if (s === "up" || s === "exp-up" || s === "expup") return "up";
  if (s === "down" || s === "exp-down" || s === "expdown") return "down";
  if (s === "neutral" || s === "exp-neutral" || s === "expneutral") return "neutral";
  throw new Error(`--nature は up/down/neutral または exp-up/exp-down/exp-neutral で指定してください: ${v}`);
}

function parseExpType(v: string): ExpTypeCli {
  const n = Number(v);
  if (n === 600 || n === 900 || n === 1080) return n;
  throw new Error(`--exp_type は 600 / 900 / 1080 のいずれかです: ${v}`);
}

function parseCandyBoost(v: string): CandyBoost {
  const s = v.trim().toLowerCase();
  if (s === "mini") return "mini";
  if (s === "normal" || s === "std") return "normal";
  if (s === "none" || s === "off") return "none";
  throw new Error(`--candyboost は mini / normal(std) / none(off) のいずれかです: ${v}`);
}

const program = new Command();

program
  .name("candycalc")
  .description("Pokémon Sleepのレベル上げに必要な「EXP / アメ数 / ゆめのかけら」を計算します。")
  .usage("[from] [to] [options]")
  .argument("[from]", "初期レベル（整数）。省略時は --from を使用", parseIntStrict("from"))
  .argument("[to]", "目標レベル（整数）。省略時は --to を使用", parseIntStrict("to"))
  .option("-f, --from <level>", "初期レベル（整数）。位置引数でも指定可", parseIntStrict("from"))
  .option("-t, --to <level>", "目標レベル（整数）。位置引数でも指定可", parseIntStrict("to"))
  .option(
    "-n, --nature <nature>",
    "性格補正（EXP）: up(exp-up) / down(exp-down) / neutral(exp-neutral)",
    parseNature,
    "neutral",
  )
  .option(
    "-e, --exp_type <type>",
    "経験値タイプ: 600 / 900 / 1080",
    parseExpType,
    600,
  )
  .option(
    "-c, --candyboost <mode>",
    "アメブースト: mini / normal(std) / none(off)",
    parseCandyBoost,
    "none",
  )
  .addHelpText(
    "after",
    `
Examples:
  $ candycalc 10 25
  $ candycalc -f 10 -t 25 -n exp-up -e 900 -c mini
  $ candycalc 10 25 -c normal

Notes:
  - --candyboost mini/normal はアメEXPが2倍になります。
  - ゆめのかけら倍率は mini=4倍 / normal=6倍（noneは通常）です。
  - 出力はJSONです。
`,
  )
  .action((argFrom: number | undefined, argTo: number | undefined) => {
    const opts = program.opts<{
      from?: number;
      to?: number;
      nature: NatureCli;
      exp_type: ExpTypeCli;
      candyboost: CandyBoost;
    }>();

    const from = opts.from ?? argFrom;
    const to = opts.to ?? argTo;
    if (from == null || to == null) {
      program.error("初期レベルと目標レベルが必要です。例: candycalc 10 25 / candycalc -f 10 -t 25");
    }

    const natureForCalc: NatureCalc = opts.nature === "neutral" ? "normal" : opts.nature;
    const expTypeForCalc = String(opts.exp_type) as calculator.ExpType;

    const requiredExp = calculator.calcRequiredExp(from, to, expTypeForCalc);

    const requiredCandy =
      opts.candyboost === "none"
        ? calculator.calcRequiredCandy(from, to, natureForCalc, expTypeForCalc)
        : calculator.calcRequiredBoostedCandy(from, to, natureForCalc, expTypeForCalc);

    const requiredDreamShards =
      opts.candyboost === "none"
        ? calculator.calcRequiredDreamShards(from, to, natureForCalc, expTypeForCalc)
        : opts.candyboost === "normal"
          ? calculator.calcRequiredBoostedDreamShards(from, to, natureForCalc, expTypeForCalc)
          : calculator.calcRequiredMiniBoostedDreamShards(from, to, natureForCalc, expTypeForCalc);

    console.log(
      JSON.stringify(
        {
          from,
          to,
          nature: opts.nature,
          exp_type: opts.exp_type,
          candyboost: opts.candyboost,
          requiredExp,
          requiredCandy,
          requiredDreamShards,
        },
        null,
        2,
      ),
    );
  });

program.parse(process.argv);
