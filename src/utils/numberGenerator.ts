import { LotteryGame, GeneratedNumbers } from '../types/lottery';

/**
 * Generate unique random numbers for lottery
 */
export const generateLotteryNumbers = (game: LotteryGame): GeneratedNumbers => {
  const mainNumbers = generateUniqueNumbers(
    game.mainNumbers.min,
    game.mainNumbers.max,
    game.mainNumbers.count
  ).sort((a, b) => a - b);

  const bonusNumbers = game.bonusNumbers
    ? generateUniqueNumbers(
        game.bonusNumbers.min,
        game.bonusNumbers.max,
        game.bonusNumbers.count
      ).sort((a, b) => a - b)
    : undefined;

  return { mainNumbers, bonusNumbers };
};

/**
 * Generate unique random numbers within a range
 */
export const generateUniqueNumbers = (
  min: number,
  max: number,
  count: number
): number[] => {
  const numbers = new Set<number>();

  while (numbers.size < count) {
    const num = Math.floor(Math.random() * (max - min + 1)) + min;
    numbers.add(num);
  }

  return Array.from(numbers);
};

/**
 * Get ball color based on number range
 * 한국 로또 6/45 공식 색상
 */
export const getBallColor = (num: number): string => {
  if (num <= 10) return '#FBC400'; // 노랑 (1-10)
  if (num <= 20) return '#69C8F2'; // 파랑 (11-20)
  if (num <= 30) return '#FF7272'; // 빨강 (21-30)
  if (num <= 40) return '#AAAAAA'; // 회색 (31-40)
  return '#B0D840'; // 초록 (41-45)
};

/**
 * Get ball color class name based on number range
 */
export const getBallColorClass = (num: number): string => {
  if (num <= 10) return 'ball-yellow';
  if (num <= 20) return 'ball-blue';
  if (num <= 30) return 'ball-red';
  if (num <= 40) return 'ball-gray';
  return 'ball-green';
};
