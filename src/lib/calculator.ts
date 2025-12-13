const totalExps = [
	0, 54, 125, 233, 361, 525, 727, 971, 1245, 1560, 1905, 2281, 2688, 3107, 3536, 3976, 4430, 4899,
	5382, 5879, 6394, 6931, 7489, 8068, 8668, 9290, 9933, 10598, 11284, 11992, 12721, 13469, 14235,
	15020, 15823, 16644, 17483, 18340, 19215, 20108, 21018, 21946, 22891, 23854, 24834, 25831, 26846,
	27878, 28927, 29993, 31355, 32917, 34664, 36610, 38805, 41084, 43488, 46021, 48687, 51493,
	54358, 57280, 60257, 63286, 66363
];

const dreamShardsPerCandy = [
	0, 14, 18, 22, 27, 30, 34, 39, 44, 48, 50, 52, 53, 56, 59, 62, 66, 68, 71, 74, 78, 81, 85, 88, 92,
	95, 100, 105, 111, 117, 122, 126, 130, 136, 143, 151, 160, 167, 174, 184, 192, 201, 211, 221, 227,
	236, 250, 264, 279, 295, 309, 323, 338, 356, 372, 391, 437, 486, 538, 593,
	651, 698, 750, 804, 866
];

const expTypeToRatio = {
	'600': 1,
	'900': 1.5,
	'1080': 1.8
};

export type ExpType = keyof typeof expTypeToRatio;

/**
 * 性格補正（旧実装: normal=25, up=30, down=21 に一致させる倍率）
 * - down: 21/25
 * - normal: 1
 * - up: 30/25
 */
const natureToCandyExpRatio = {
	down: 21 / 25,
	normal: 1,
	up: 30 / 25
} as const;

export type Nature = keyof typeof natureToCandyExpRatio;

export type CandyBoostEvent = 'none' | 'boost' | 'miniBoost';

export const calcRequiredExp = (currentLevel: number, targetLevel: number, expType: ExpType) => {
	if (currentLevel >= targetLevel) {
		return 0;
	}
	const ratio = expTypeToRatio[expType];
	const currentExp = Math.round(totalExps[currentLevel - 1] * ratio);
	const targetExp = Math.round(totalExps[targetLevel - 1] * ratio);
	return targetExp - currentExp;
};

/**
 * Ver.2.10.0：アメ1個で得られるEXP（無補正）
 * - Lv1〜Lv25になるまで（= 現在Lv 1〜24 の間）：35
 * - Lv25〜Lv30になるまで（= 現在Lv 25〜29 の間）：30
 * - Lv30以降：25
 */
const baseCandyExpByLevel = (level: number) => {
	if (level < 25) return 35;
	if (level < 30) return 30;
	return 25;
};

/**
 * その「現在レベル」でアメ1個を使ったときの獲得EXP（性格補正込み）
 * level を省略した場合は旧挙動（Lv30以降=25基準）に寄せて 30 を仮定
 */
export const calcCandyExp = (nature: Nature, level: number = 30) => {
	const base = baseCandyExpByLevel(level);
	const ratio = natureToCandyExpRatio[nature];
	return Math.round(base * ratio);
};

export const calcBoostedCandyExp = (nature: Nature, level: number = 30) => {
	return calcCandyExp(nature, level) * 2;
};

/**
 * アメ必要数：レベル帯でアメEXPが変わるので、レベルごとにシミュレーションして合計する
 */
const calcRequiredCandyBySim = (
	currentLevel: number,
	targetLevel: number,
	nature: Nature,
	expType: ExpType,
	candyExpFn: (nature: Nature, level: number) => number
) => {
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

export const calcRequiredCandy = (
	currentLevel: number,
	targetLevel: number,
	nature: Nature,
	expType: ExpType
) => {
	return calcRequiredCandyBySim(currentLevel, targetLevel, nature, expType, calcCandyExp);
};

export const calcRequiredBoostedCandy = (
	currentLevel: number,
	targetLevel: number,
	nature: Nature,
	expType: ExpType
) => {
	return calcRequiredCandyBySim(currentLevel, targetLevel, nature, expType, calcBoostedCandyExp);
};

/**
 * かけら必要量：こちらもレベルごとに必要EXPを埋め、carry（余剰EXP）を繰り越す
 * ※Ver.2.10.0 では「同時に使用するゆめのかけらの量に変更はありません」なので
 *   dreamShardsPerCandy は変更せず、そのまま使う
 */
const calcRequiredDreamShardsBySim = (
	currentLevel: number,
	targetLevel: number,
	nature: Nature,
	expType: ExpType,
	candyExpFn: (nature: Nature, level: number) => number,
	shardsMultiplier: number
) => {
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

export const calcRequiredDreamShards = (
	currentLevel: number,
	targetLevel: number,
	nature: Nature,
	expType: ExpType
) => {
	return calcRequiredDreamShardsBySim(
		currentLevel,
		targetLevel,
		nature,
		expType,
		calcCandyExp,
		1
	);
};

export const calcRequiredBoostedDreamShards = (
	currentLevel: number,
	targetLevel: number,
	nature: Nature,
	expType: ExpType
) => {
	// ブースト時：かけらコスト倍率は従来通り *5
	return calcRequiredDreamShardsBySim(
		currentLevel,
		targetLevel,
		nature,
		expType,
		calcBoostedCandyExp,
		5
	);
};

export const calcRequiredMiniBoostedDreamShards = (
	currentLevel: number,
	targetLevel: number,
	nature: Nature,
	expType: ExpType
) => {
	// ミニブースト時：かけらコスト倍率は従来通り *4
	return calcRequiredDreamShardsBySim(
		currentLevel,
		targetLevel,
		nature,
		expType,
		calcBoostedCandyExp,
		4
	);
};

export const Calculator = (event: CandyBoostEvent) => {
	switch (event) {
		case 'boost':
			return {
				calcRequiredCandy: calcRequiredBoostedCandy,
				calcRequiredDreamShards: calcRequiredBoostedDreamShards,
				calcRequiredExp
			};
		case 'miniBoost':
			return {
				calcRequiredCandy: calcRequiredBoostedCandy,
				calcRequiredDreamShards: calcRequiredMiniBoostedDreamShards,
				calcRequiredExp
			};
		default:
			return {
				calcRequiredCandy,
				calcRequiredDreamShards,
				calcRequiredExp
			};
	}
};
