import {
	calcBoostedCandyExp,
	calcCandyExp,
	calcRequiredBoostedCandy,
	calcRequiredBoostedDreamShards,
	calcRequiredCandy,
	calcRequiredDreamShards,
	calcRequiredExp,
	calcRequiredMiniBoostedDreamShards
} from './calculator';

test('exp', () => {
	expect(calcRequiredExp(24, 25, '600')).toBe(600);
	expect(calcRequiredExp(20, 21, '600')).toBe(515);
	expect(calcRequiredExp(1, 2, '600')).toBe(54);
	expect(calcRequiredExp(20, 22, '600')).toBe(1052);
	expect(calcRequiredExp(19, 21, '600')).toBe(1012);
	expect(calcRequiredExp(20, 23, '600')).toBe(1610);
	expect(calcRequiredExp(19, 22, '600')).toBe(1549);
	expect(calcRequiredExp(20, 24, '600')).toBe(2189);
	expect(calcRequiredExp(2, 3, '900')).toBe(107);
	expect(calcRequiredExp(9, 10, '900')).toBe(472);
	expect(calcRequiredExp(10, 11, '900')).toBe(518);
	expect(calcRequiredExp(10, 12, '900')).toBe(1082);
	expect(calcRequiredExp(24, 25, '1080')).toBe(1080);

	// Lv上限65追加分（2.7.0以降）
	expect(calcRequiredExp(60, 61, '600')).toBe(2865);
	expect(calcRequiredExp(64, 65, '600')).toBe(3077);
});

test('candyExp', () => {
	// 互換：引数を1つだけ渡した場合は Lv30相当（=25基準）のまま
	expect(calcCandyExp('normal')).toBe(25);
	expect(calcCandyExp('down')).toBe(21);
	expect(calcCandyExp('up')).toBe(30);
	expect(calcBoostedCandyExp('normal')).toBe(50);
	expect(calcBoostedCandyExp('down')).toBe(42);
	expect(calcBoostedCandyExp('up')).toBe(60);

	// Ver.2.10.0：レベル帯でアメEXPが変化
	// Lv1〜24：35 / Lv25〜29：30 / Lv30〜：25（性格補正は倍率→四捨五入）
	expect(calcCandyExp('normal', 24)).toBe(35);
	expect(calcCandyExp('down', 24)).toBe(29);
	expect(calcCandyExp('up', 24)).toBe(42);

	expect(calcCandyExp('normal', 25)).toBe(30);
	expect(calcCandyExp('down', 25)).toBe(25);
	expect(calcCandyExp('up', 25)).toBe(36);

	expect(calcCandyExp('normal', 30)).toBe(25);
	expect(calcCandyExp('down', 30)).toBe(21);
	expect(calcCandyExp('up', 30)).toBe(30);

	// ブースト時はアメEXP2倍
	expect(calcBoostedCandyExp('normal', 24)).toBe(70);
	expect(calcBoostedCandyExp('down', 24)).toBe(58);
	expect(calcBoostedCandyExp('up', 24)).toBe(84);
});

test('candy', () => {
	// Ver.2.10.0により、Lv24→25 はアメEXP=35帯なので必要アメ数が減る
	expect(calcRequiredCandy(24, 25, 'normal', '600')).toBe(18);
	expect(calcRequiredCandy(24, 25, 'normal', '900')).toBe(26);
	expect(calcRequiredCandy(24, 25, 'normal', '1080')).toBe(31);

	expect(calcRequiredCandy(24, 25, 'down', '600')).toBe(21);
	expect(calcRequiredCandy(24, 25, 'down', '900')).toBe(32);
	expect(calcRequiredCandy(24, 25, 'down', '1080')).toBe(38);

	expect(calcRequiredCandy(24, 25, 'up', '600')).toBe(15);
	expect(calcRequiredCandy(24, 25, 'up', '900')).toBe(22);
	expect(calcRequiredCandy(24, 25, 'up', '1080')).toBe(26);

	// Lv30以降はアメEXP=25帯なので、従来と同じ値（参考値）
	expect(calcRequiredCandy(55, 56, 'normal', '600')).toBe(92); // Kerusu カメ
	expect(calcRequiredCandy(55, 60, 'normal', '600')).toBe(508); // Twitter情報

	// ブースト時（アメEXP2倍）
	expect(calcRequiredBoostedCandy(24, 25, 'normal', '600')).toBe(9);
	expect(calcRequiredBoostedCandy(24, 25, 'normal', '900')).toBe(13);
	expect(calcRequiredBoostedCandy(24, 25, 'normal', '1080')).toBe(16);

	expect(calcRequiredBoostedCandy(24, 25, 'down', '600')).toBe(11);
	expect(calcRequiredBoostedCandy(24, 25, 'down', '900')).toBe(16);
	expect(calcRequiredBoostedCandy(24, 25, 'down', '1080')).toBe(19);

	expect(calcRequiredBoostedCandy(24, 25, 'up', '600')).toBe(8);
	expect(calcRequiredBoostedCandy(24, 25, 'up', '900')).toBe(11);
	expect(calcRequiredBoostedCandy(24, 25, 'up', '1080')).toBe(13);
});

test('dreamShards', () => {
	// Ver.2.10.0：必要アメ数が変わるが、「アメ1個あたりのかけら」は変更なし
	expect(calcRequiredDreamShards(24, 25, 'normal', '600')).toBe(1656);
	expect(calcRequiredDreamShards(25, 26, 'normal', '600')).toBe(1995);

	expect(calcRequiredDreamShards(20, 21, 'normal', '600')).toBe(1170);
	expect(calcRequiredDreamShards(20, 22, 'normal', '600')).toBe(2466);
	expect(calcRequiredDreamShards(20, 23, 'normal', '600')).toBe(3741);

	// Lv30以降は従来と同じ（参考値）
	expect(calcRequiredDreamShards(55, 56, 'normal', '600')).toBe(35972); // kerusu カメ
	expect(calcRequiredDreamShards(55, 60, 'normal', '600')).toBe(250992); // Twitter情報

	// ブースト/ミニブースト（かけら倍率は *5 / *4 のまま）
	expect(calcRequiredBoostedDreamShards(24, 25, 'normal', '600')).toBe(4140);
	expect(calcRequiredMiniBoostedDreamShards(24, 25, 'normal', '600')).toBe(3312);
});
