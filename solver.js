/**
 * Ark Grid Solver - Lost Ark Astrogem Cutting Logic
 */

class AstrogemSolver {
    constructor() {
        // Available effects by cost tier
        this.effectsByCost = {
            8: ['Additional Damage', 'Attack Power', 'Other1', 'Other2'],
            9: ['Boss Damage', 'Attack Power', 'Other1', 'Other2'],
            10: ['Boss Damage', 'Additional Damage', 'Other1', 'Other2']
        };

        // Scoring multipliers
        this.scoring = {
            willpowerBelow4: 1.5,  // per level below 4
            willpowerAbove4: -1.5, // per level above 4
            attackPower: 1.0,       // per level
            additionalDamage: 1.7,  // per level
            bossDamage: 2.2,        // per level
            orderAbove4: 4.3,       // per level above 4
            orderBelow4: -4.3       // per level below 4
        };
    }

    /**
     * Calculate willpower cost
     * Willpower cost = Base cost - Willpower level
     */
    calculateWillpowerCost(baseCost, willpowerLevel) {
        return baseCost - willpowerLevel;
    }

    /**
     * Calculate score for willpower cost
     */
    calculateWillpowerScore(willpowerCost) {
        if (willpowerCost < 4) {
            return (4 - willpowerCost) * this.scoring.willpowerBelow4;
        } else if (willpowerCost > 4) {
            return (willpowerCost - 4) * this.scoring.willpowerAbove4;
        }
        return 0;
    }

    /**
     * Calculate score for an effect
     */
    calculateEffectScore(effectType, level) {
        switch (effectType) {
            case 'Attack Power':
                return level * this.scoring.attackPower;
            case 'Additional Damage':
                return level * this.scoring.additionalDamage;
            case 'Boss Damage':
                return level * this.scoring.bossDamage;
            case 'Other1':
            case 'Other2':
            default:
                return 0; // Other effects don't contribute to score
        }
    }

    /**
     * Calculate score for Order level
     * Level 5: +4.3, Level 4: 0, Level 3: -4.3, Level 2: -8.6, Level 1: -12.9
     */
    calculateOrderScore(orderLevel) {
        // Formula: (orderLevel - 4) * 4.3
        // When orderLevel < 4, (orderLevel - 4) is negative, multiplying by 4.3 gives negative
        // When orderLevel > 4, (orderLevel - 4) is positive, multiplying by 4.3 gives positive
        // Example: Level 3 -> (3-4) * 4.3 = -1 * 4.3 = -4.3
        // Example: Level 5 -> (5-4) * 4.3 = 1 * 4.3 = 4.3
        return (orderLevel - 4) * 4.3;
    }

    /**
     * Calculate total score for an astrogem configuration
     */
    calculateScore(config) {
        const {
            baseCost,
            willpowerLevel,
            orderLevel,
            effect1,
            effect1Level,
            effect2,
            effect2Level
        } = config;

        // Calculate willpower cost and score
        const willpowerCost = this.calculateWillpowerCost(baseCost, willpowerLevel);
        const willpowerScore = this.calculateWillpowerScore(willpowerCost);

        // Calculate effect scores
        const effect1Score = this.calculateEffectScore(effect1, effect1Level);
        const effect2Score = this.calculateEffectScore(effect2, effect2Level);

        // Calculate order score
        const orderScore = this.calculateOrderScore(orderLevel);

        // Total score
        const totalScore = willpowerScore + effect1Score + effect2Score + orderScore;

        return {
            willpowerCost,
            willpowerScore,
            effect1Score,
            effect2Score,
            orderScore,
            totalScore,
            breakdown: {
                willpower: { cost: willpowerCost, score: willpowerScore },
                effect1: { type: effect1, level: effect1Level, score: effect1Score },
                effect2: { type: effect2, level: effect2Level, score: effect2Score },
                order: { level: orderLevel, score: orderScore }
            }
        };
    }

    /**
     * Validate configuration
     */
    validateConfig(config) {
        const { baseCost, effect1, effect2 } = config;
        const availableEffects = this.effectsByCost[baseCost];

        if (!availableEffects.includes(effect1)) {
            return { valid: false, error: `Effect 1 "${effect1}" is not available for ${baseCost} cost gems` };
        }

        if (!availableEffects.includes(effect2)) {
            return { valid: false, error: `Effect 2 "${effect2}" is not available for ${baseCost} cost gems` };
        }

        if (effect1 === effect2) {
            return { valid: false, error: 'Effect 1 and Effect 2 must be different' };
        }

        return { valid: true };
    }

    /**
     * Find optimal configuration
     * Brute force search through all possible combinations
     */
    findOptimalConfig(baseCost, gemType) {
        const availableEffects = this.effectsByCost[baseCost];
        const bestConfigs = [];
        let bestScore = -Infinity;

        // Generate all combinations of effects
        for (let i = 0; i < availableEffects.length; i++) {
            for (let j = i + 1; j < availableEffects.length; j++) {
                const effect1 = availableEffects[i];
                const effect2 = availableEffects[j];

                // Try all level combinations (1-5 for each)
                for (let wp = 1; wp <= 5; wp++) {
                    for (let ord = 1; ord <= 5; ord++) {
                        for (let e1 = 1; e1 <= 5; e1++) {
                            for (let e2 = 1; e2 <= 5; e2++) {
                                const config = {
                                    baseCost,
                                    gemType,
                                    willpowerLevel: wp,
                                    orderLevel: ord,
                                    effect1,
                                    effect1Level: e1,
                                    effect2,
                                    effect2Level: e2
                                };

                                const result = this.calculateScore(config);
                                
                                if (result.totalScore > bestScore) {
                                    bestScore = result.totalScore;
                                    bestConfigs.length = 0;
                                    bestConfigs.push({ config, result });
                                } else if (result.totalScore === bestScore) {
                                    bestConfigs.push({ config, result });
                                }
                            }
                        }
                    }
                }
            }
        }

        return bestConfigs;
    }

    /**
     * Get available effects for a given cost
     */
    getAvailableEffects(baseCost) {
        return this.effectsByCost[baseCost] || [];
    }

    /**
     * Generate 4 random outcomes for a cutting turn
     * Based on official Lost Ark probabilities from:
     * https://m-lostark.game.onstove.com/Probability/%EC%A0%AC%20%EA%B0%80%EA%B3%B5%2C%20%EC%A0%AC%20%EC%9C%B5%ED%95%A9
     */
    generateOutcomes(config) {
        const { baseCost, effect1, effect2, willpowerLevel, orderLevel, effect1Level, effect2Level, processCostMultiplier = 0, turnsRemaining } = config;
        
        // Official probabilities (as percentages)
        const probabilities = {
            // Willpower changes
            willpower_plus1: { base: 11.65, condition: (wp) => wp < 5 },
            willpower_plus2: { base: 4.40, condition: (wp) => wp < 4 },
            willpower_plus3: { base: 1.75, condition: (wp) => wp < 3 },
            willpower_plus4: { base: 0.45, condition: (wp) => wp < 2 },
            willpower_minus1: { base: 3.00, condition: (wp) => wp > 1 },
            
            // Order/Chaos changes
            order_plus1: { base: 11.65, condition: (ord) => ord < 5 },
            order_plus2: { base: 4.40, condition: (ord) => ord < 4 },
            order_plus3: { base: 1.75, condition: (ord) => ord < 3 },
            order_plus4: { base: 0.45, condition: (ord) => ord < 2 },
            order_minus1: { base: 3.00, condition: (ord) => ord > 1 },
            
            // First effect changes
            effect1_plus1: { base: 11.65, condition: (e1) => e1 < 5 },
            effect1_plus2: { base: 4.40, condition: (e1) => e1 < 4 },
            effect1_plus3: { base: 1.75, condition: (e1) => e1 < 3 },
            effect1_plus4: { base: 0.45, condition: (e1) => e1 < 2 },
            effect1_minus1: { base: 3.00, condition: (e1) => e1 > 1 },
            
            // Second effect changes
            effect2_plus1: { base: 11.65, condition: (e2) => e2 < 5 },
            effect2_plus2: { base: 4.40, condition: (e2) => e2 < 4 },
            effect2_plus3: { base: 1.75, condition: (e2) => e2 < 3 },
            effect2_plus4: { base: 0.45, condition: (e2) => e2 < 2 },
            effect2_minus1: { base: 3.00, condition: (e2) => e2 > 1 },
            
            // Effect changes
            change_effect1: { base: 3.25, condition: () => true },
            change_effect2: { base: 3.25, condition: () => true },
            
            // Cost changes
            cost_plus100: { base: 1.75, condition: () => processCostMultiplier < 100 && turnsRemaining > 1 },
            cost_minus100: { base: 1.75, condition: () => processCostMultiplier > -100 && turnsRemaining > 1 },
            
            // Other
            do_nothing: { base: 1.75, condition: () => true },
            reroll_plus1: { base: 2.50, condition: () => turnsRemaining > 1 },
            reroll_plus2: { base: 0.75, condition: () => turnsRemaining > 1 }
        };
        
        // Build list of all valid possibilities with their probabilities
        const possibilities = [];
        
        // Willpower possibilities
        if (probabilities.willpower_plus1.condition(willpowerLevel)) {
            possibilities.push({ type: 'willpower', change: 1, prob: probabilities.willpower_plus1.base });
        }
        if (probabilities.willpower_plus2.condition(willpowerLevel)) {
            possibilities.push({ type: 'willpower', change: 2, prob: probabilities.willpower_plus2.base });
        }
        if (probabilities.willpower_plus3.condition(willpowerLevel)) {
            possibilities.push({ type: 'willpower', change: 3, prob: probabilities.willpower_plus3.base });
        }
        if (probabilities.willpower_plus4.condition(willpowerLevel)) {
            possibilities.push({ type: 'willpower', change: 4, prob: probabilities.willpower_plus4.base });
        }
        if (probabilities.willpower_minus1.condition(willpowerLevel)) {
            possibilities.push({ type: 'willpower', change: -1, prob: probabilities.willpower_minus1.base });
        }
        
        // Order possibilities
        if (probabilities.order_plus1.condition(orderLevel)) {
            possibilities.push({ type: 'order', change: 1, prob: probabilities.order_plus1.base });
        }
        if (probabilities.order_plus2.condition(orderLevel)) {
            possibilities.push({ type: 'order', change: 2, prob: probabilities.order_plus2.base });
        }
        if (probabilities.order_plus3.condition(orderLevel)) {
            possibilities.push({ type: 'order', change: 3, prob: probabilities.order_plus3.base });
        }
        if (probabilities.order_plus4.condition(orderLevel)) {
            possibilities.push({ type: 'order', change: 4, prob: probabilities.order_plus4.base });
        }
        if (probabilities.order_minus1.condition(orderLevel)) {
            possibilities.push({ type: 'order', change: -1, prob: probabilities.order_minus1.base });
        }
        
        // Effect1 possibilities
        if (probabilities.effect1_plus1.condition(effect1Level)) {
            possibilities.push({ type: 'effect1', change: 1, prob: probabilities.effect1_plus1.base, effectName: effect1 });
        }
        if (probabilities.effect1_plus2.condition(effect1Level)) {
            possibilities.push({ type: 'effect1', change: 2, prob: probabilities.effect1_plus2.base, effectName: effect1 });
        }
        if (probabilities.effect1_plus3.condition(effect1Level)) {
            possibilities.push({ type: 'effect1', change: 3, prob: probabilities.effect1_plus3.base, effectName: effect1 });
        }
        if (probabilities.effect1_plus4.condition(effect1Level)) {
            possibilities.push({ type: 'effect1', change: 4, prob: probabilities.effect1_plus4.base, effectName: effect1 });
        }
        if (probabilities.effect1_minus1.condition(effect1Level)) {
            possibilities.push({ type: 'effect1', change: -1, prob: probabilities.effect1_minus1.base, effectName: effect1 });
        }
        
        // Effect2 possibilities
        if (probabilities.effect2_plus1.condition(effect2Level)) {
            possibilities.push({ type: 'effect2', change: 1, prob: probabilities.effect2_plus1.base, effectName: effect2 });
        }
        if (probabilities.effect2_plus2.condition(effect2Level)) {
            possibilities.push({ type: 'effect2', change: 2, prob: probabilities.effect2_plus2.base, effectName: effect2 });
        }
        if (probabilities.effect2_plus3.condition(effect2Level)) {
            possibilities.push({ type: 'effect2', change: 3, prob: probabilities.effect2_plus3.base, effectName: effect2 });
        }
        if (probabilities.effect2_plus4.condition(effect2Level)) {
            possibilities.push({ type: 'effect2', change: 4, prob: probabilities.effect2_plus4.base, effectName: effect2 });
        }
        if (probabilities.effect2_minus1.condition(effect2Level)) {
            possibilities.push({ type: 'effect2', change: -1, prob: probabilities.effect2_minus1.base, effectName: effect2 });
        }
        
        // Effect changes
        if (probabilities.change_effect1.condition()) {
            possibilities.push({ type: 'change_effect1', prob: probabilities.change_effect1.base });
        }
        if (probabilities.change_effect2.condition()) {
            possibilities.push({ type: 'change_effect2', prob: probabilities.change_effect2.base });
        }
        
        // Cost changes
        if (probabilities.cost_plus100.condition()) {
            possibilities.push({ type: 'cost', change: 100, prob: probabilities.cost_plus100.base });
        }
        if (probabilities.cost_minus100.condition()) {
            possibilities.push({ type: 'cost', change: -100, prob: probabilities.cost_minus100.base });
        }
        
        // Other
        if (probabilities.do_nothing.condition()) {
            possibilities.push({ type: 'do_nothing', prob: probabilities.do_nothing.base });
        }
        if (probabilities.reroll_plus1.condition()) {
            possibilities.push({ type: 'reroll', change: 1, prob: probabilities.reroll_plus1.base });
        }
        if (probabilities.reroll_plus2.condition()) {
            possibilities.push({ type: 'reroll', change: 2, prob: probabilities.reroll_plus2.base });
        }
        
        // Calculate total probability of valid possibilities
        const totalProb = possibilities.reduce((sum, p) => sum + p.prob, 0);
        
        // Normalize probabilities (as per official rules: actual prob = displayed prob / (100% - excluded prob sum))
        // Since we're only including valid ones, we normalize to 100%
        possibilities.forEach(p => {
            p.normalizedProb = (p.prob / totalProb) * 100;
        });
        
        // Select 4 unique possibilities (same type can't appear twice in same turn)
        const selected = [];
        const usedTypes = new Set();
        
        while (selected.length < 4 && possibilities.length > 0) {
            // Weighted random selection
            const rand = Math.random() * 100;
            let cumulative = 0;
            let selectedIndex = -1;
            
            for (let i = 0; i < possibilities.length; i++) {
                const p = possibilities[i];
                // Skip if we already have this exact type
                const typeKey = `${p.type}_${p.change || 0}`;
                if (usedTypes.has(typeKey)) continue;
                
                cumulative += p.normalizedProb;
                if (rand <= cumulative) {
                    selectedIndex = i;
                    break;
                }
            }
            
            // Fallback: select first available
            if (selectedIndex === -1) {
                for (let i = 0; i < possibilities.length; i++) {
                    const typeKey = `${possibilities[i].type}_${possibilities[i].change || 0}`;
                    if (!usedTypes.has(typeKey)) {
                        selectedIndex = i;
                        break;
                    }
                }
            }
            
            if (selectedIndex >= 0) {
                const selectedPossibility = possibilities[selectedIndex];
                selected.push(selectedPossibility);
                const typeKey = `${selectedPossibility.type}_${selectedPossibility.change || 0}`;
                usedTypes.add(typeKey);
                possibilities.splice(selectedIndex, 1);
            } else {
                break; // No more valid possibilities
            }
        }
        
        // Convert to outcome format
        const outcomes = selected.map(p => {
            let outcome = null;
            
            if (p.type === 'willpower' || p.type === 'order' || p.type === 'effect1' || p.type === 'effect2') {
                const isIncrease = p.change > 0;
                const name = p.effectName || p.type.charAt(0).toUpperCase() + p.type.slice(1);
                const current = p.type === 'willpower' ? willpowerLevel :
                               p.type === 'order' ? orderLevel :
                               p.type === 'effect1' ? effect1Level : effect2Level;
                const newLevel = Math.max(1, Math.min(5, current + p.change));
                
                outcome = {
                    type: isIncrease ? 'raise_effect' : 'lower_effect',
                    target: p.type,
                    effectName: name,
                    amount: Math.abs(p.change),
                    description: isIncrease 
                        ? `Raise ${name} by ${Math.abs(p.change)} level(s) (${current} → ${newLevel})`
                        : `Lower ${name} by ${Math.abs(p.change)} level(s) (${current} → ${newLevel})`
                };
            } else if (p.type === 'change_effect1' || p.type === 'change_effect2') {
                const targetEffect = p.type === 'change_effect1' ? effect1 : effect2;
                const availableEffects = this.effectsByCost[baseCost] || [];
                const currentEffects = [effect1, effect2];
                const possibleNewEffects = availableEffects.filter(eff => !currentEffects.includes(eff));
                
                // Show what it could change to (or just say it will change)
                const newEffectPreview = possibleNewEffects.length > 0 
                    ? ` to ${possibleNewEffects.join(' or ')}`
                    : '';
                
                outcome = {
                    type: 'change_side_option',
                    target: p.type === 'change_effect1' ? 'effect1' : 'effect2',
                    currentEffect: targetEffect,
                    possibleNewEffects: possibleNewEffects,
                    description: `Change ${p.type === 'change_effect1' ? 'first' : 'second'} effect (${targetEffect}${newEffectPreview ? ' → ' + possibleNewEffects.join('/') : ''})`
                };
            } else if (p.type === 'cost') {
                outcome = {
                    type: 'change_gold_cost',
                    change: p.change,
                    description: `${p.change > 0 ? 'Increase' : 'Decrease'} process cost by ${Math.abs(p.change)}%`
                };
            } else if (p.type === 'do_nothing') {
                outcome = {
                    type: 'do_nothing',
                    description: 'Do nothing (no changes)'
                };
            } else if (p.type === 'reroll') {
                outcome = {
                    type: 'reroll_increase',
                    change: p.change,
                    description: `Increase reroll count by ${p.change}`
                };
            }
            
            return outcome;
        }).filter(o => o !== null);
        
        // Ensure we have exactly 4 outcomes (fill with do_nothing if needed)
        while (outcomes.length < 4) {
            outcomes.push({
                type: 'do_nothing',
                description: 'Do nothing (no changes)'
            });
        }
        
        return outcomes.slice(0, 4);
    }

    /**
     * Apply an outcome to a configuration
     */
    applyOutcome(config, outcome) {
        const newConfig = { ...config };
        
        switch (outcome.type) {
            case 'lower_effect':
                if (outcome.target === 'willpower') {
                    newConfig.willpowerLevel = Math.max(1, newConfig.willpowerLevel - (outcome.amount || 1));
                } else if (outcome.target === 'order') {
                    newConfig.orderLevel = Math.max(1, newConfig.orderLevel - (outcome.amount || 1));
                } else if (outcome.target === 'effect1') {
                    newConfig.effect1Level = Math.max(1, newConfig.effect1Level - (outcome.amount || 1));
                } else if (outcome.target === 'effect2') {
                    newConfig.effect2Level = Math.max(1, newConfig.effect2Level - (outcome.amount || 1));
                }
                break;
                
            case 'raise_effect':
                if (outcome.target === 'willpower') {
                    newConfig.willpowerLevel = Math.min(5, newConfig.willpowerLevel + outcome.amount);
                } else if (outcome.target === 'order') {
                    newConfig.orderLevel = Math.min(5, newConfig.orderLevel + outcome.amount);
                } else if (outcome.target === 'effect1') {
                    newConfig.effect1Level = Math.min(5, newConfig.effect1Level + outcome.amount);
                } else if (outcome.target === 'effect2') {
                    newConfig.effect2Level = Math.min(5, newConfig.effect2Level + outcome.amount);
                }
                break;
                
            case 'change_gold_cost':
                // This will be handled by the cutting process state
                break;
                
            case 'change_side_option':
                // Change effect to one that's not currently on the gem
                const availableEffects = this.effectsByCost[newConfig.baseCost] || [];
                const currentEffects = [newConfig.effect1, newConfig.effect2];
                const possibleNewEffects = availableEffects.filter(effect => !currentEffects.includes(effect));
                
                if (possibleNewEffects.length > 0 && outcome.target) {
                    // Use specified new effect, or randomly select from available effects that aren't currently on the gem
                    let newEffect;
                    if (outcome.newEffect && possibleNewEffects.includes(outcome.newEffect)) {
                        newEffect = outcome.newEffect;
                    } else {
                        newEffect = possibleNewEffects[Math.floor(Math.random() * possibleNewEffects.length)];
                    }
                    
                    if (outcome.target === 'effect1') {
                        newConfig.effect1 = newEffect;
                        newConfig.effect1Level = 1; // Reset to level 1 when changed
                    } else if (outcome.target === 'effect2') {
                        newConfig.effect2 = newEffect;
                        newConfig.effect2Level = 1; // Reset to level 1 when changed
                    }
                }
                break;
                
            case 'do_nothing':
            case 'reroll_increase':
                // No changes to config
                break;
        }
        
        return newConfig;
    }

    /**
     * Calculate gem value based on score
     * Value = max(0, (score - baseline) * (gold_per_damage / 27))
     * Minimum value is always 0
     */
    calculateGemValue(score, baseline, goldPerDamage) {
        const goldPerScore = goldPerDamage / 27;
        const rawValue = (score - baseline) * goldPerScore;
        return Math.max(0, rawValue); // Minimum value is 0
    }

    /**
     * Monte Carlo Tree Search - Simulate many different astrogem paths for each action
     * Returns expected final scores for each action
     */
    monteCarloSimulation(state, baseline, goldPerDamage, numRuns = 1000, currentOutcomes = null) {
        const results = {
            process: { totalScore: 0, totalValue: 0, totalCost: 0, count: 0, aboveBaseline: 0 },
            reroll: { totalScore: 0, totalValue: 0, totalCost: 0, count: 0, aboveBaseline: 0 },
            delete: { totalScore: 0, totalValue: 0, totalCost: 0, count: 0, aboveBaseline: 0 }
        };

        const initialGoldSpent = state.totalGoldSpent;
        const initialScore = this.calculateScore(state.config).totalScore;

        for (let run = 0; run < numRuns; run++) {
            // Simulate PROCESS action - simulate many random paths
            if (state.currentTurn <= state.maxTurns) {
                const processSim = this.simulateRandomPath(
                    JSON.parse(JSON.stringify(state)), // Deep copy
                    'process',
                    baseline,
                    goldPerDamage,
                    initialGoldSpent,
                    currentOutcomes ? JSON.parse(JSON.stringify(currentOutcomes)) : null // Pass current outcomes
                );
                results.process.totalScore += processSim.finalScore;
                results.process.totalValue += processSim.finalValue;
                results.process.totalCost += processSim.totalCost;
                if (processSim.finalScore > baseline) {
                    results.process.aboveBaseline++;
                }
                results.process.count++;
            }

            // Simulate REROLL action - simulate many random paths
            if (state.rerollsRemaining > 0) {
                const rerollSim = this.simulateRandomPath(
                    JSON.parse(JSON.stringify(state)), // Deep copy
                    'reroll',
                    baseline,
                    goldPerDamage,
                    initialGoldSpent
                );
                results.reroll.totalScore += rerollSim.finalScore;
                results.reroll.totalValue += rerollSim.finalValue;
                results.reroll.totalCost += rerollSim.totalCost;
                if (rerollSim.finalScore > baseline) {
                    results.reroll.aboveBaseline++;
                }
                results.reroll.count++;
            }

            // DELETE action - current state, no future costs
            // Delete means you stop and keep the current gem, but you've already spent gold
            const currentScore = this.calculateScore(state.config).totalScore;
            const currentValue = this.calculateGemValue(currentScore, baseline, goldPerDamage);
            // Net value = current gem value - gold already spent (sunk cost, but still counts)
            // Actually, for comparison purposes, delete should be: current value (you keep the gem)
            // But we need to compare net values, so delete = current value, process = final value - future costs
            results.delete.totalScore += currentScore;
            results.delete.totalValue += currentValue; // Just the gem value
            results.delete.totalCost += 0; // No future costs (already spent is sunk)
            if (currentScore > baseline) {
                results.delete.aboveBaseline++;
            }
            results.delete.count++;
        }

        // Calculate expected values
        const expectedValues = {
            delete: {
                score: results.delete.totalScore / results.delete.count,
                value: results.delete.totalValue / results.delete.count,
                cost: results.delete.totalCost / results.delete.count,
                aboveBaselineOdds: results.delete.aboveBaseline / results.delete.count
            }
        };

        if (results.process.count > 0) {
            expectedValues.process = {
                score: results.process.totalScore / results.process.count,
                value: results.process.totalValue / results.process.count,
                cost: results.process.totalCost / results.process.count,
                aboveBaselineOdds: results.process.aboveBaseline / results.process.count
            };
        } else {
            expectedValues.process = { score: -Infinity, value: -Infinity, cost: 0, aboveBaselineOdds: 0 };
        }

        if (results.reroll.count > 0) {
            expectedValues.reroll = {
                score: results.reroll.totalScore / results.reroll.count,
                value: results.reroll.totalValue / results.reroll.count,
                cost: results.reroll.totalCost / results.reroll.count,
                aboveBaselineOdds: results.reroll.aboveBaseline / results.reroll.count
            };
        } else {
            expectedValues.reroll = { score: -Infinity, value: -Infinity, cost: 0, aboveBaselineOdds: 0 };
        }

        return expectedValues;
    }

    /**
     * Simulate a strategic path through the cutting process
     * Uses strategic reroll decisions (evaluates if reroll is better than processing)
     * Returns final score, value, and total cost
     */
    simulateRandomPath(state, firstAction, baseline, goldPerDamage, initialGoldSpent, currentOutcomes = null) {
        let currentState = JSON.parse(JSON.stringify(state));
        
        // Take the first action
        if (firstAction === 'process') {
            if (currentState.currentTurn > currentState.maxTurns) {
                const score = this.calculateScore(currentState.config).totalScore;
                const value = this.calculateGemValue(score, baseline, goldPerDamage);
                return { finalScore: score, finalValue: value, totalCost: currentState.totalGoldSpent - initialGoldSpent };
            }
            
            // Use current outcomes if provided, otherwise generate new ones
            let outcomes;
            if (currentOutcomes && currentOutcomes.length > 0) {
                outcomes = currentOutcomes; // Use the actual outcomes shown to the user
            } else {
                // Generate outcomes if not provided (for future turns)
                const configWithState = {
                    ...currentState.config,
                    processCostMultiplier: currentState.processCostMultiplier || 0,
                    turnsRemaining: currentState.maxTurns - currentState.currentTurn + 1
                };
                outcomes = this.generateOutcomes(configWithState);
            }
            const selectedOutcome = outcomes[Math.floor(Math.random() * outcomes.length)];
            
            // Apply outcome
            currentState.config = this.applyOutcome(currentState.config, selectedOutcome);
            currentState.currentTurn++;
            currentState.totalGoldSpent += currentState.processCost;
            
            // Handle cost changes
            if (selectedOutcome.type === 'change_gold_cost') {
                currentState.processCostMultiplier = Math.max(-100, Math.min(100, 
                    currentState.processCostMultiplier + selectedOutcome.change));
                currentState.processCost = Math.max(100, Math.round(900 * (1 + currentState.processCostMultiplier / 100)));
            }
            
            // Handle reroll increases
            if (selectedOutcome.type === 'reroll_increase') {
                currentState.rerollsRemaining += selectedOutcome.change || 1;
            }
        } else if (firstAction === 'reroll') {
            if (currentState.rerollsRemaining <= 0) {
                const score = this.calculateScore(currentState.config).totalScore;
                const value = this.calculateGemValue(score, baseline, goldPerDamage);
                return { finalScore: score, finalValue: value, totalCost: currentState.totalGoldSpent - initialGoldSpent };
            }
            
            const rerollCost = currentState.rerollsRemaining === 1 ? 2800 : 0;
            currentState.rerollsRemaining--;
            currentState.totalGoldSpent += rerollCost;
        }
        
        // Continue simulating strategically until completion
        while (currentState.currentTurn <= currentState.maxTurns) {
            // Generate current outcomes
            const configWithState = {
                ...currentState.config,
                processCostMultiplier: currentState.processCostMultiplier || 0,
                turnsRemaining: currentState.maxTurns - currentState.currentTurn + 1
            };
            const currentOutcomes = this.generateOutcomes(configWithState);
            
            // Strategic decision: process or reroll? (using nested Monte Carlo)
            let shouldReroll = false;
            
            if (currentState.rerollsRemaining > 0) {
                // Nested Monte Carlo: evaluate both options
                const rerollCost = currentState.rerollsRemaining === 1 ? 2800 : 0;
                
                // Evaluate processing with current outcomes (nested Monte Carlo)
                const processValue = this.nestedMonteCarloEvaluate(
                    currentState, 
                    currentOutcomes, 
                    'process',
                    baseline, 
                    goldPerDamage, 
                    initialGoldSpent,
                    50 // Smaller sample size for nested MC
                );
                
                // Evaluate rerolling (nested Monte Carlo)
                const rerollValue = this.nestedMonteCarloEvaluate(
                    currentState, 
                    null, // Will generate new outcomes
                    'reroll',
                    baseline, 
                    goldPerDamage, 
                    initialGoldSpent,
                    50 // Smaller sample size for nested MC
                ) - rerollCost;
                
                // Reroll if it's better (with small threshold to avoid infinite rerolls)
                shouldReroll = rerollValue > processValue + 50; // Small threshold
            }
            
            if (shouldReroll) {
                // Reroll - pay cost and generate new outcomes
                const rerollCost = currentState.rerollsRemaining === 1 ? 2800 : 0;
                currentState.rerollsRemaining--;
                currentState.totalGoldSpent += rerollCost;
                // New outcomes will be generated in next iteration
                continue;
            }
            
            // Process - randomly select one outcome
            const selectedOutcome = currentOutcomes[Math.floor(Math.random() * currentOutcomes.length)];
            
            // Apply outcome
            currentState.config = this.applyOutcome(currentState.config, selectedOutcome);
            currentState.currentTurn++;
            currentState.totalGoldSpent += currentState.processCost;
            
            // Handle cost changes
            if (selectedOutcome.type === 'change_gold_cost') {
                currentState.processCostMultiplier = Math.max(-100, Math.min(100, 
                    currentState.processCostMultiplier + selectedOutcome.change));
                currentState.processCost = Math.max(100, Math.round(900 * (1 + currentState.processCostMultiplier / 100)));
            }
            
            // Handle reroll increases
            if (selectedOutcome.type === 'reroll_increase') {
                currentState.rerollsRemaining += selectedOutcome.change || 1;
            }
        }
        
        // Process complete - calculate final score and value
        const finalScore = this.calculateScore(currentState.config).totalScore;
        const finalValue = this.calculateGemValue(finalScore, baseline, goldPerDamage);
        const totalCost = currentState.totalGoldSpent - initialGoldSpent;
        
        return { finalScore, finalValue, totalCost };
    }

    /**
     * Nested Monte Carlo evaluation - evaluates an action using Monte Carlo simulation
     * Used for strategic reroll decisions
     */
    nestedMonteCarloEvaluate(state, outcomes, action, baseline, goldPerDamage, initialGoldSpent, numRuns = 50) {
        let totalValue = 0;
        
        for (let run = 0; run < numRuns; run++) {
            const testState = JSON.parse(JSON.stringify(state));
            
            if (action === 'process' && outcomes) {
                // Process with given outcomes - randomly select one
                const selectedOutcome = outcomes[Math.floor(Math.random() * outcomes.length)];
                testState.config = this.applyOutcome(testState.config, selectedOutcome);
                testState.currentTurn++;
                testState.totalGoldSpent += testState.processCost;
                
                // Handle cost changes
                if (selectedOutcome.type === 'change_gold_cost') {
                    testState.processCostMultiplier = Math.max(-100, Math.min(100, 
                        testState.processCostMultiplier + selectedOutcome.change));
                    testState.processCost = Math.max(100, Math.round(900 * (1 + testState.processCostMultiplier / 100)));
                }
                
                // Handle reroll increases
                if (selectedOutcome.type === 'reroll_increase') {
                    testState.rerollsRemaining += selectedOutcome.change || 1;
                }
            } else if (action === 'reroll') {
                // Reroll - generate new outcomes and continue
                const rerollCost = testState.rerollsRemaining === 1 ? 2800 : 0;
                testState.rerollsRemaining--;
                testState.totalGoldSpent += rerollCost;
                // Will continue simulation with new outcomes
            }
            
            // Continue simulation from this state (random path to completion)
            const result = this.simulateRandomPathToCompletion(testState, baseline, goldPerDamage, initialGoldSpent);
            totalValue += result.finalValue - (result.totalCost - (testState.totalGoldSpent - initialGoldSpent));
        }
        
        return totalValue / numRuns; // Average expected value
    }

    /**
     * Simulate random path to completion (helper for nested MC)
     * Similar to simulateRandomPath but starts from a given state
     */
    simulateRandomPathToCompletion(state, baseline, goldPerDamage, initialGoldSpent) {
        let currentState = JSON.parse(JSON.stringify(state));
        
        // Continue simulating randomly until completion
        while (currentState.currentTurn <= currentState.maxTurns) {
            // Generate outcomes
            const configWithState = {
                ...currentState.config,
                processCostMultiplier: currentState.processCostMultiplier || 0,
                turnsRemaining: currentState.maxTurns - currentState.currentTurn + 1
            };
            const outcomes = this.generateOutcomes(configWithState);
            
            // Randomly decide: process or reroll (if available)
            const actions = ['process'];
            if (currentState.rerollsRemaining > 0 && Math.random() < 0.3) {
                // 30% chance to reroll if available (to avoid infinite rerolls)
                actions.push('reroll');
            }
            
            const action = actions[Math.floor(Math.random() * actions.length)];
            
            if (action === 'process') {
                // Randomly select one outcome
                const selectedOutcome = outcomes[Math.floor(Math.random() * outcomes.length)];
                
                // Apply outcome
                currentState.config = this.applyOutcome(currentState.config, selectedOutcome);
                currentState.currentTurn++;
                currentState.totalGoldSpent += currentState.processCost;
                
                // Handle cost changes
                if (selectedOutcome.type === 'change_gold_cost') {
                    currentState.processCostMultiplier = Math.max(-100, Math.min(100, 
                        currentState.processCostMultiplier + selectedOutcome.change));
                    currentState.processCost = Math.max(100, Math.round(900 * (1 + currentState.processCostMultiplier / 100)));
                }
                
                // Handle reroll increases
                if (selectedOutcome.type === 'reroll_increase') {
                    currentState.rerollsRemaining += selectedOutcome.change || 1;
                }
            } else if (action === 'reroll') {
                const rerollCost = currentState.rerollsRemaining === 1 ? 2800 : 0;
                currentState.rerollsRemaining--;
                currentState.totalGoldSpent += rerollCost;
                // Continue loop to generate new outcomes
            }
        }
        
        // Process complete
        const finalScore = this.calculateScore(currentState.config).totalScore;
        const finalValue = this.calculateGemValue(finalScore, baseline, goldPerDamage);
        const totalCost = currentState.totalGoldSpent - initialGoldSpent;
        
        return { finalScore, finalValue, totalCost };
    }

    /**
     * Simulate PROCESS action (single step)
     */
    simulateProcessStep(state, baseline, goldPerDamage, initialGoldSpent = 0) {
        if (state.currentTurn > state.maxTurns) {
            // Process complete
            const finalScore = this.calculateScore(state.config).totalScore;
            const finalValue = this.calculateGemValue(finalScore, baseline, goldPerDamage);
            // Return net value: final gem value - future costs only
            const futureCosts = state.totalGoldSpent - initialGoldSpent;
            return { value: finalValue - futureCosts, newState: null };
        }

        // Generate outcomes for current state
        const configWithState = {
            ...state.config,
            processCostMultiplier: state.processCostMultiplier || 0,
            turnsRemaining: state.maxTurns - state.currentTurn + 1
        };
        const outcomes = this.generateOutcomes(configWithState);

        // Randomly select one outcome (25% each)
        const selectedOutcome = outcomes[Math.floor(Math.random() * outcomes.length)];

        // Create new state after processing
        const newState = {
            ...state,
            config: this.applyOutcome(state.config, selectedOutcome),
            currentTurn: state.currentTurn + 1,
            totalGoldSpent: state.totalGoldSpent + state.processCost
        };

        // Handle cost changes
        if (selectedOutcome.type === 'change_gold_cost') {
            newState.processCostMultiplier = Math.max(-100, Math.min(100, 
                newState.processCostMultiplier + selectedOutcome.change));
            newState.processCost = Math.max(100, Math.round(900 * (1 + newState.processCostMultiplier / 100)));
        }

        // Handle reroll increases
        if (selectedOutcome.type === 'reroll_increase') {
            newState.rerollsRemaining += selectedOutcome.change || 1;
        }

        return { value: null, newState: newState };
    }

    /**
     * Simulate REROLL action (single step)
     */
    simulateRerollStep(state, baseline, goldPerDamage, initialGoldSpent = 0) {
        if (state.rerollsRemaining <= 0) {
            // No rerolls left - evaluate current state
            const currentScore = this.calculateScore(state.config).totalScore;
            const currentValue = this.calculateGemValue(currentScore, baseline, goldPerDamage);
            // Return net value: current gem value - future costs only
            const futureCosts = state.totalGoldSpent - initialGoldSpent;
            return { value: currentValue - futureCosts, newState: null };
        }

        // Pay reroll cost (2800 for last reroll, 0 otherwise)
        const rerollCost = state.rerollsRemaining === 1 ? 2800 : 0;
        const newState = {
            ...state,
            rerollsRemaining: state.rerollsRemaining - 1,
            totalGoldSpent: state.totalGoldSpent + rerollCost
        };

        // Reroll doesn't change config, just outcomes
        return { value: null, newState: newState };
    }

    /**
     * Simulate optimal action from current state (recursive)
     */
    simulateOptimalAction(state, baseline, goldPerDamage, depth = 0, maxDepth = 100, initialGoldSpent = null) {
        // Track initial gold spent on first call
        if (initialGoldSpent === null) {
            initialGoldSpent = state.totalGoldSpent;
        }

        if (state.currentTurn > state.maxTurns || depth > maxDepth) {
            // Process complete or max depth reached
            const finalScore = this.calculateScore(state.config).totalScore;
            const finalValue = this.calculateGemValue(finalScore, baseline, goldPerDamage);
            // Return net value: final gem value - (future costs only, not already spent)
            const futureCosts = state.totalGoldSpent - initialGoldSpent;
            const netValue = finalValue - futureCosts;
            return netValue;
        }

        // Evaluate all possible actions
        const actionValues = [];

        // PROCESS action
        if (state.currentTurn <= state.maxTurns) {
            const processResult = this.simulateProcessStep(state, baseline, goldPerDamage, initialGoldSpent);
            if (processResult.newState) {
                // Continue simulation from new state
                const futureValue = this.simulateOptimalAction(
                    processResult.newState, 
                    baseline, 
                    goldPerDamage, 
                    depth + 1, 
                    maxDepth,
                    initialGoldSpent
                );
                actionValues.push(futureValue);
            } else {
                // Terminal state reached
                actionValues.push(processResult.value);
            }
        }

        // REROLL action
        if (state.rerollsRemaining > 0) {
            const rerollResult = this.simulateRerollStep(state, baseline, goldPerDamage, initialGoldSpent);
            if (rerollResult.newState) {
                // Continue simulation from new state
                const futureValue = this.simulateOptimalAction(
                    rerollResult.newState,
                    baseline,
                    goldPerDamage,
                    depth + 1,
                    maxDepth,
                    initialGoldSpent
                );
                actionValues.push(futureValue);
            } else {
                // Terminal state reached
                actionValues.push(rerollResult.value);
            }
        }

        // DELETE action - lose only future potential, not already spent gold
        // Actually, delete means you lose what you've invested, so it should be negative of already spent
        const deleteValue = -(state.totalGoldSpent - initialGoldSpent); // Only lose future costs
        actionValues.push(deleteValue);

        // Return best action value
        return Math.max(...actionValues);
    }

    /**
     * Quick evaluation for solver recommendation
     * Uses Monte Carlo Tree Search to simulate many paths and calculate expected scores
     */
    evaluateActions(state, baseline, goldPerDamage, numRuns = 1000) {
        // Use current outcomes from state if available, otherwise null (will generate new ones)
        const currentOutcomes = state.outcomes || null;
        const expectedResults = this.monteCarloSimulation(state, baseline, goldPerDamage, numRuns, currentOutcomes);
        
        // Calculate net expected values (expected value - expected future costs)
        const processNetValue = expectedResults.process.value - expectedResults.process.cost;
        const rerollNetValue = expectedResults.reroll.value - expectedResults.reroll.cost;
        const deleteNetValue = expectedResults.delete.value - expectedResults.delete.cost;
        
        // Find best action based on expected score (or net value)
        const actions = [
            { 
                name: 'Process', 
                score: expectedResults.process.score,
                value: processNetValue,
                expectedScore: expectedResults.process.score,
                expectedCost: expectedResults.process.cost,
                aboveBaselineOdds: expectedResults.process.aboveBaselineOdds,
                description: 'Process the gem with current outcomes' 
            },
            { 
                name: 'Reroll', 
                score: expectedResults.reroll.score,
                value: rerollNetValue,
                expectedScore: expectedResults.reroll.score,
                expectedCost: expectedResults.reroll.cost,
                aboveBaselineOdds: expectedResults.reroll.aboveBaselineOdds,
                description: 'Reroll to get new outcomes' 
            },
            { 
                name: 'Delete', 
                score: expectedResults.delete.score,
                value: deleteNetValue,
                expectedScore: expectedResults.delete.score,
                expectedCost: expectedResults.delete.cost,
                aboveBaselineOdds: expectedResults.delete.aboveBaselineOdds,
                description: 'Delete the gem and cut losses' 
            }
        ];

        // Sort by net value (primary) - this is what matters for decision making
        actions.sort((a, b) => {
            return b.value - a.value; // Sort by net value (expected value - expected cost)
        });
        
        const bestAction = actions[0];

        return {
            bestAction: bestAction.name.toLowerCase(),
            expectedValues: {
                process: processNetValue,
                reroll: rerollNetValue,
                delete: deleteNetValue
            },
            expectedScores: {
                process: expectedResults.process.score,
                reroll: expectedResults.reroll.score,
                delete: expectedResults.delete.score
            },
            allActions: actions,
            currentValue: this.calculateGemValue(
                this.calculateScore(state.config).totalScore, 
                baseline, 
                goldPerDamage
            ) // Just the gem value, not net of spent gold
        };
    }
}
