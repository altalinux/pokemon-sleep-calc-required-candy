import { Command } from 'commander';
import * as calculator from './lib/calculator';

type CandyBoost = 'mini' | 'normal' | 'none';
type NatureCli = 'up' | 'down' | 'neutral'; // CLI仕様
type ExpTypeCli = 600 | 900 | 1080; // CLI仕様
type NatureCalc = 'up' | 'down' | 'normal'; // calculator.ts の仕様

function parseIntStrict(label: string) {
	return (v: string): number => {
		if (!/^\d+$/.test(v)) throw new Error(`${label} は1以上の整数で指定してください: ${v}`);
		const n = Number(v);
		if (!Number.isSafeInteger(n) || n <= 0)
			throw new Error(`${label} は1以上の整数で指定してください: ${v}`);
		return n;
	};
}

function parseNature(v: string): NatureCli {
	const s = v.trim().toLowerCase();
	if (s === 'up' || s === 'exp-up' || s === 'expup') return 'up';
	if (s === 'down' || s === 'exp-down' || s === 'expdown') return 'down';
	if (s === 'neutral' || s === 'exp-neutral' || s === 'expneutral') return 'neutral';
	throw new Error(
		`--nature は up/down/neutral または exp-up/exp-down/exp-neutral で指定してください: ${v}`
	);
}

function parseExpType(v: string): ExpTypeCli {
	const n = Number(v);
	if (n === 600 || n === 900 || n === 1080) return n;
	throw new Error(`--exp_type は 600 / 900 / 1080 のいずれかです: ${v}`);
}

function parseCandyBoost(v: string): CandyBoost {
	const s = v.trim().toLowerCase();
	if (s === 'mini') return 'mini';
	if (s === 'normal' || s === 'std') return 'normal';
	if (s === 'none' || s === 'off') return 'none';
	throw new Error(`--candyboost は mini / normal(std) / none(off) のいずれかです: ${v}`);
}

function formatPretty(o: {
	from: number;
	to: number;
	nature: 'up' | 'down' | 'neutral';
	exp_type: 600 | 900 | 1080;
	candyboost: 'mini' | 'normal' | 'none';
	requiredExp: number;
	requiredCandy: number;
	requiredDreamShards: number;
}) {
	const nf = new Intl.NumberFormat('ja-JP');
	return [
		'candycalc result',
		'----------------',
		`Level:           ${o.from} → ${o.to}`,
		`Nature (EXP):    ${o.nature}`,
		`Exp type:        ${o.exp_type}`,
		`Candy boost:     ${o.candyboost}`,
		'',
		`Required EXP:        ${nf.format(o.requiredExp)}`,
		`Required candies:    ${nf.format(o.requiredCandy)} 個`,
		`Required shards:     ${nf.format(o.requiredDreamShards)}`
	].join('\n');
}

const program = new Command();

program
	.name('candycalc')
	.description('Pokémon Sleepのレベル上げに必要な「EXP / アメ数 / ゆめのかけら」を計算します。')
	.usage('[from] [to] [options]')
	.argument('[from]', '初期レベル（整数）。省略時は --from を使用', parseIntStrict('from'))
	.argument('[to]', '目標レベル（整数）。省略時は --to を使用', parseIntStrict('to'))
	.option('-f, --from <level>', '初期レベル（整数）。位置引数でも指定可', parseIntStrict('from'))
	.option('-t, --to <level>', '目標レベル（整数）。位置引数でも指定可', parseIntStrict('to'))
	.option(
		'-n, --nature <nature>',
		'性格補正（EXP）: up(exp-up) / down(exp-down) / neutral(exp-neutral)',
		parseNature,
		'neutral'
	)
	.option('-e, --exp_type <type>', '経験値タイプ: 600 / 900 / 1080', parseExpType, 600)
	.option(
		'-c, --candyboost <mode>',
		'アメブースト: mini / normal(std) / none(off)',
		parseCandyBoost,
		'none'
	)

	// ショートカット（nature）
	.option('--up', '性格補正(EXP)を up にする（-n up と同等）')
	.option('--down', '性格補正(EXP)を down にする（-n down と同等）')
	.option('--neutral', '性格補正(EXP)を neutral にする（-n neutral と同等）')

	// ショートカット（exp_type）
	.option('--600', '経験値タイプを 600 にする（-e 600 と同等）')
	.option('--900', '経験値タイプを 900 にする（-e 900 と同等）')
	.option('--1080', '経験値タイプを 1080 にする（-e 1080 と同等）')

	// ショートカット（candyboost）
	.option('--mini', 'ミニアメブースト（-c mini と同等）')
	.option('--normal', '通常アメブースト（-c normal と同等）')
	.option('--none', 'アメブーストなし（-c none と同等、デフォルト）')

	.option('--pretty', '人間向けの整形表示で出力（デフォルト）')
	.option('--json', 'JSONで出力')
	.addHelpText(
		'after',
		`
Examples:
  $ candycalc 10 25
  $ candycalc 10 25 --down --900
  $ candycalc 10 25 --mini
  $ candycalc -f 10 -t 25 -n exp-up -e 900 -c mini
  $ candycalc 10 25 -c normal --json

Notes:
  - --candyboost mini/normal はアメEXPが2倍になります。
  - ゆめのかけら倍率は mini=4倍 / normal=6倍（noneは通常）です。
  - -n/-e/-c の代わりに --down / --900 / --mini のようなショートカット指定も可能です。
  - デフォルト出力は pretty (--pretty)。機械処理したい場合は --json を指定してください。
`
	)
	.action((argFrom: number | undefined, argTo: number | undefined) => {
		const opts = program.opts<{
			from?: number;
			to?: number;
			nature: NatureCli;
			exp_type: ExpTypeCli;
			candyboost: CandyBoost;
			pretty?: boolean;
			json?: boolean;

			up?: boolean;
			down?: boolean;
			neutral?: boolean;
			'600'?: boolean;
			'900'?: boolean;
			'1080'?: boolean;
			mini?: boolean;
			normal?: boolean;
			none?: boolean;
		}>();

		const from = opts.from ?? argFrom;
		const to = opts.to ?? argTo;
		if (from == null || to == null) {
			program.error(
				'初期レベルと目標レベルが必要です。例: candycalc 10 25 / candycalc -f 10 -t 25'
			);
		}

		// --- ショートカットの処理（衝突チェック込み） ---
		const argv = process.argv.slice(2);
		const natureFromN = argv.includes('-n') || argv.includes('--nature');
		const expFromE = argv.includes('-e') || argv.includes('--exp_type');
		const boostFromC = argv.includes('-c') || argv.includes('--candyboost');

		// nature: --up/--down/--neutral
		const natureFlags = [
			opts.up ? ('up' as const) : null,
			opts.down ? ('down' as const) : null,
			opts.neutral ? ('neutral' as const) : null
		].filter(Boolean) as NatureCli[];

		if (natureFlags.length > 1) {
			program.error('--up/--down/--neutral は同時に指定できません。');
		}
		if (natureFlags.length === 1) {
			if (natureFromN) {
				program.error('-n/--nature と --up/--down/--neutral は同時に指定できません。');
			}
			opts.nature = natureFlags[0];
		}

		// exp_type: --600/--900/--1080
		const expFlags = [
			opts['600'] ? 600 : null,
			opts['900'] ? 900 : null,
			opts['1080'] ? 1080 : null
		].filter(Boolean) as ExpTypeCli[];

		if (expFlags.length > 1) {
			program.error('--600/--900/--1080 は同時に指定できません。');
		}
		if (expFlags.length === 1) {
			if (expFromE) {
				program.error('-e/--exp_type と --600/--900/--1080 は同時に指定できません。');
			}
			opts.exp_type = expFlags[0];
		}

		// candyboost: --mini/--normal/--none
		const boostFlags = [
			opts.mini ? ('mini' as const) : null,
			opts.normal ? ('normal' as const) : null,
			opts.none ? ('none' as const) : null
		].filter(Boolean) as CandyBoost[];

		if (boostFlags.length > 1) {
			program.error('--mini/--normal/--none は同時に指定できません。');
		}
		if (boostFlags.length === 1) {
			if (boostFromC) {
				program.error('-c/--candyboost と --mini/--normal/--none は同時に指定できません。');
			}
			opts.candyboost = boostFlags[0];
		}

		// 出力モード：--json が優先（デフォルトは pretty）
		if (opts.json && opts.pretty) {
			program.error('--json と --pretty は同時に指定できません。');
		}

		const natureForCalc: NatureCalc = opts.nature === 'neutral' ? 'normal' : opts.nature;
		const expTypeForCalc = String(opts.exp_type) as calculator.ExpType;

		const requiredExp = calculator.calcRequiredExp(from, to, expTypeForCalc);

		const requiredCandy =
			opts.candyboost === 'none'
				? calculator.calcRequiredCandy(from, to, natureForCalc, expTypeForCalc)
				: calculator.calcRequiredBoostedCandy(from, to, natureForCalc, expTypeForCalc);

		const requiredDreamShards =
			opts.candyboost === 'none'
				? calculator.calcRequiredDreamShards(from, to, natureForCalc, expTypeForCalc)
				: opts.candyboost === 'normal'
				? calculator.calcRequiredBoostedDreamShards(from, to, natureForCalc, expTypeForCalc)
				: calculator.calcRequiredMiniBoostedDreamShards(from, to, natureForCalc, expTypeForCalc);

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
