import { OrderType, TextColorType } from "./game-type";

export const NOTATIONS = [
  {
    value: OrderType.TWENTY_FIVE,
    label: `O(n^2) [Time ${OrderType.TWENTY_FIVE}]`,
    color: TextColorType.RED,
  },
  {
    value: OrderType.FIFTEEN,
    label: `O(nlogn) [Time ${OrderType.FIFTEEN}]`,
    color: TextColorType.ORANGE,
  },
  {
    value: OrderType.FIVE,
    label: `O(n) [Time ${OrderType.FIVE}]`,
    color: TextColorType.YELLOW,
  },
  {
    value: OrderType.ONE,
    label: `O(1) [Time ${OrderType.ONE}]`,
    color: TextColorType.GREEN,
  },
];

export const RULES = `BigO(x) is basicly a tic-tac-toe but you can replace your friend's
                mark! Hold on it's not that's easy, your mark needs to have
                higher order than your friend's one. O(n^2) > O(nlogn) > O(n) > O(1).
                You need to trade your time to use each mark and If you're out of time(time < 0),
                you're defeated. The first player will have less time so play wisely. Have Fun :)`;
