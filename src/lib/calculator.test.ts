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

	expect(calcRequiredExp(60, 61, '600')).toBe(2865);
	expect(calcRequiredExp(64, 65, '600')).toBe(3077);
	expect(calcRequiredExp(65, 70, '600')).toBe(15799);
	expect(calcRequiredExp(65, 70, '900')).toBe(23698);
	expect(calcRequiredExp(65, 70, '1080')).toBe(28439);
});

test('candyExp', () => {
	expect(calcCandyExp('normal')).toBe(25);
	expect(calcCandyExp('down')).toBe(21);
	expect(calcCandyExp('up')).toBe(30);
	expect(calcBoostedCandyExp('normal')).toBe(50);
	expect(calcBoostedCandyExp('down')).toBe(42);
	expect(calcBoostedCandyExp('up')).toBe(60);

	expect(calcCandyExp('normal', 24)).toBe(40);
	expect(calcCandyExp('down', 24)).toBe(34);
	expect(calcCandyExp('up', 24)).toBe(48);
	expect(calcCandyExp('normal', 25)).toBe(35);
	expect(calcCandyExp('down', 25)).toBe(29);
	expect(calcCandyExp('up', 25)).toBe(42);
	expect(calcCandyExp('normal', 30)).toBe(25);
	expect(calcCandyExp('down', 30)).toBe(21);
	expect(calcCandyExp('up', 30)).toBe(30);

	expect(calcBoostedCandyExp('normal', 24)).toBe(80);
	expect(calcBoostedCandyExp('down', 24)).toBe(68);
	expect(calcBoostedCandyExp('up', 24)).toBe(96);
});

test('candy', () => {
	expect(calcRequiredCandy(24, 25, 'normal', '600')).toBe(15);
	expect(calcRequiredCandy(24, 25, 'normal', '900')).toBe(23);
	expect(calcRequiredCandy(24, 25, 'normal', '1080')).toBe(27);
	expect(calcRequiredCandy(24, 25, 'down', '600')).toBe(18);
	expect(calcRequiredCandy(24, 25, 'down', '900')).toBe(27);
	expect(calcRequiredCandy(24, 25, 'down', '1080')).toBe(32);
	expect(calcRequiredCandy(24, 25, 'up', '600')).toBe(13);
	expect(calcRequiredCandy(24, 25, 'up', '900')).toBe(19);
	expect(calcRequiredCandy(24, 25, 'up', '1080')).toBe(23);

	expect(calcRequiredCandy(55, 56, 'normal', '600')).toBe(92); // Kerusu カメ
	expect(calcRequiredCandy(55, 60, 'normal', '600')).toBe(508); // Twitter情報
	expect(calcRequiredCandy(65, 70, 'normal', '600')).toBe(632);

	expect(calcRequiredBoostedCandy(24, 25, 'normal', '600')).toBe(8);
	expect(calcRequiredBoostedCandy(24, 25, 'normal', '900')).toBe(12);
	expect(calcRequiredBoostedCandy(24, 25, 'normal', '1080')).toBe(14);
	expect(calcRequiredBoostedCandy(24, 25, 'down', '600')).toBe(9);
	expect(calcRequiredBoostedCandy(24, 25, 'down', '900')).toBe(14);
	expect(calcRequiredBoostedCandy(24, 25, 'down', '1080')).toBe(16);
	expect(calcRequiredBoostedCandy(24, 25, 'up', '600')).toBe(7);
	expect(calcRequiredBoostedCandy(24, 25, 'up', '900')).toBe(10);
	expect(calcRequiredBoostedCandy(24, 25, 'up', '1080')).toBe(12);
});

test('dreamShards', () => {
	expect(calcRequiredDreamShards(24, 25, 'normal', '600')).toBe(1380);
	expect(calcRequiredDreamShards(25, 26, 'normal', '600')).toBe(1710);
	expect(calcRequiredDreamShards(20, 21, 'normal', '600')).toBe(1014);
	expect(calcRequiredDreamShards(20, 22, 'normal', '600')).toBe(2148);
	expect(calcRequiredDreamShards(20, 23, 'normal', '600')).toBe(3338);

	expect(calcRequiredDreamShards(55, 56, 'normal', '600')).toBe(35972); // kerusu カメ
	expect(calcRequiredDreamShards(55, 60, 'normal', '600')).toBe(250992); // Twitter情報
	expect(calcRequiredDreamShards(65, 70, 'normal', '600')).toBe(691983);

	expect(calcRequiredBoostedDreamShards(24, 25, 'normal', '600')).toBe(3680);
	expect(calcRequiredMiniBoostedDreamShards(24, 25, 'normal', '600')).toBe(2944);
	expect(calcRequiredBoostedDreamShards(65, 70, 'normal', '600')).toBe(1729535);
});
