# Lost Ark Astrogem Cutting Probabilities

This document lists all probabilities implemented in the solver, based on the official Lost Ark probability page.

## Willpower Efficiency (의지력 효율)

| Outcome | Base Probability | Condition (Doesn't appear if...) |
|---------|------------------|----------------------------------|
| +1 increase | 11.6500% | Willpower is 5 |
| +2 increase | 4.4000% | Willpower is 4 or above |
| +3 increase | 1.7500% | Willpower is 3 or above |
| +4 increase | 0.4500% | Willpower is 2 or above |
| -1 decrease | 3.0000% | Willpower is 1 |

## Order/Chaos Points (질서/혼돈 포인트)

| Outcome | Base Probability | Condition (Doesn't appear if...) |
|---------|------------------|----------------------------------|
| +1 increase | 11.6500% | Order/Chaos is 5 |
| +2 increase | 4.4000% | Order/Chaos is 4 or above |
| +3 increase | 1.7500% | Order/Chaos is 3 or above |
| +4 increase | 0.4500% | Order/Chaos is 2 or above |
| -1 decrease | 3.0000% | Order/Chaos is 1 |

## First Effect (첫번째 효과)

| Outcome | Base Probability | Condition (Doesn't appear if...) |
|---------|------------------|----------------------------------|
| Lv. +1 increase | 11.6500% | First effect is Lv. 5 |
| Lv. +2 increase | 4.4000% | First effect is Lv. 4 or above |
| Lv. +3 increase | 1.7500% | First effect is Lv. 3 or above |
| Lv. +4 increase | 0.4500% | First effect is Lv. 2 or above |
| Lv. -1 decrease | 3.0000% | First effect is Lv. 1 |

## Second Effect (두번째 효과)

| Outcome | Base Probability | Condition (Doesn't appear if...) |
|---------|------------------|----------------------------------|
| Lv. +1 increase | 11.6500% | Second effect is Lv. 5 |
| Lv. +2 increase | 4.4000% | Second effect is Lv. 4 or above |
| Lv. +3 increase | 1.7500% | Second effect is Lv. 3 or above |
| Lv. +4 increase | 0.4500% | Second effect is Lv. 2 or above |
| Lv. -1 decrease | 3.0000% | Second effect is Lv. 1 |

## Effect Changes

| Outcome | Base Probability | Condition |
|---------|------------------|-----------|
| Change first effect | 3.2500% | Always available |
| Change second effect | 3.2500% | Always available |

**Note:** When changing effects:
- Effect appearance probability follows the same rules as gem distribution
- The previous effect cannot appear
- The other effect (effect1/effect2) cannot appear

## Process Cost Changes (가공 비용)

| Outcome | Base Probability | Condition (Doesn't appear if...) |
|---------|------------------|----------------------------------|
| +100% increase | 1.7500% | Cost multiplier is already +100% OR only 1 turn remaining |
| -100% decrease | 1.7500% | Cost multiplier is already -100% OR only 1 turn remaining |

**Note:** 
- Cost multiplier starts at 0%
- Formula: `Process Cost = Base Cost (900) × (1 + multiplier%)`
- Multiplier range: -100% to +100%

## Other Outcomes

| Outcome | Base Probability | Condition |
|---------|------------------|-----------|
| Do nothing (가공 상태 유지) | 1.7500% | Always available |
| Increase reroll count by +1 (다른 항목 보기 +1회 증가) | 2.5000% | More than 1 turn remaining |
| Increase reroll count by +2 (다른 항목 보기 +2회 증가) | 0.7500% | More than 1 turn remaining |

## Important Notes

1. **Same outcomes cannot appear twice in the same turn** - Each of the 4 outcomes shown must be unique.

2. **Probability normalization** - When outcomes are excluded due to conditions, the actual probability of each remaining outcome is:
   ```
   Actual Probability = Base Probability / (100% - Sum of excluded probabilities)
   ```

3. **When processing** - One of the 4 outcomes is randomly selected with equal probability (25% each).

4. **Reroll cost** - The last reroll costs 2800 gold (Epic: 3 rerolls, Rare: 2 rerolls).

## Total Base Probability Sum

If we sum all base probabilities (assuming all conditions are met):
- Willpower: 11.65 + 4.40 + 1.75 + 0.45 + 3.00 = 21.25%
- Order: 11.65 + 4.40 + 1.75 + 0.45 + 3.00 = 21.25%
- Effect1: 11.65 + 4.40 + 1.75 + 0.45 + 3.00 = 21.25%
- Effect2: 11.65 + 4.40 + 1.75 + 0.45 + 3.00 = 21.25%
- Effect changes: 3.25 + 3.25 = 6.50%
- Cost changes: 1.75 + 1.75 = 3.50%
- Other: 1.75 + 2.50 + 0.75 = 5.00%

**Total: 100.00%** (when all conditions are met)
