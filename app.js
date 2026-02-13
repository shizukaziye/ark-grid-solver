/**
 * Ark Grid Solver - Lost Ark Astrogem Cutter Application
 */

class AstrogemApp {
    constructor() {
        this.solver = new AstrogemSolver();
        this.cuttingState = null; // null when not cutting
        this.initializeEventListeners();
        this.updateEffectOptions();
        
        // Make app accessible globally for inline event handlers
        window.astrogemApp = this;
    }

    initializeEventListeners() {
        // Update effect options when base cost changes
        document.getElementById('base-cost').addEventListener('change', () => {
            this.updateEffectOptions();
        });

        // Calculate button
        document.getElementById('calculate-btn').addEventListener('click', () => {
            this.calculate();
        });

        // Optimize button
        document.getElementById('optimize-btn').addEventListener('click', () => {
            this.optimize();
        });

        // Reset button
        document.getElementById('reset-btn').addEventListener('click', () => {
            this.reset();
        });

        // Start cutting button
        document.getElementById('start-cutting-btn').addEventListener('click', () => {
            this.startCutting();
        });

        // Cutting process buttons
        document.getElementById('process-btn').addEventListener('click', () => {
            this.processCutting();
        });

        document.getElementById('reroll-btn').addEventListener('click', () => {
            this.rerollOutcomes();
        });

        document.getElementById('delete-btn').addEventListener('click', () => {
            this.deleteGem();
        });

        // Solver button
        document.getElementById('run-solver-btn').addEventListener('click', () => {
            this.runSolver();
        });

        // Outcome editing buttons
        document.getElementById('edit-outcomes-btn').addEventListener('click', () => {
            this.showOutcomeEditor();
        });

        document.getElementById('reset-outcomes-btn').addEventListener('click', () => {
            this.resetOutcomesToGenerated();
        });

        document.getElementById('save-outcomes-btn').addEventListener('click', () => {
            this.saveEditedOutcomes();
        });

        document.getElementById('cancel-edit-btn').addEventListener('click', () => {
            this.hideOutcomeEditor();
        });

        // Gem state editing buttons
        document.getElementById('edit-gem-state-btn').addEventListener('click', () => {
            this.showGemStateEditor();
        });

        document.getElementById('save-gem-state-btn').addEventListener('click', () => {
            this.saveGemState();
        });

        document.getElementById('cancel-gem-state-btn').addEventListener('click', () => {
            this.hideGemStateEditor();
        });
    }

    updateEffectOptions() {
        const baseCost = parseInt(document.getElementById('base-cost').value);
        const availableEffects = this.solver.getAvailableEffects(baseCost);
        
        const effect1Select = document.getElementById('effect1');
        const effect2Select = document.getElementById('effect2');
        
        // Clear and populate effect1
        effect1Select.innerHTML = '';
        availableEffects.forEach(effect => {
            const option = document.createElement('option');
            option.value = effect;
            option.textContent = effect;
            effect1Select.appendChild(option);
        });

        // Clear and populate effect2
        effect2Select.innerHTML = '';
        availableEffects.forEach(effect => {
            const option = document.createElement('option');
            option.value = effect;
            option.textContent = effect;
            effect2Select.appendChild(option);
        });

        // Set effect2 to second option if available
        if (availableEffects.length > 1) {
            effect2Select.value = availableEffects[1];
        }
    }

    getCurrentConfig() {
        return {
            gemType: document.getElementById('gem-type').value,
            baseCost: parseInt(document.getElementById('base-cost').value),
            effect1: document.getElementById('effect1').value,
            effect1Level: parseInt(document.getElementById('effect1-level').value),
            effect2: document.getElementById('effect2').value,
            effect2Level: parseInt(document.getElementById('effect2-level').value),
            willpowerLevel: parseInt(document.getElementById('willpower-level').value),
            orderLevel: parseInt(document.getElementById('order-level').value)
        };
    }

    calculate() {
        const config = this.getCurrentConfig();
        
        // Validate configuration
        const validation = this.solver.validateConfig(config);
        if (!validation.valid) {
            alert(validation.error);
            return;
        }

        // Calculate score
        const result = this.solver.calculateScore(config);

        // Display results
        this.displayResults(result, config);
    }

    displayResults(result, config) {
        // Willpower cost
        const willpowerCostEl = document.getElementById('willpower-cost');
        willpowerCostEl.textContent = result.willpowerCost;
        willpowerCostEl.className = 'result-value';
        
        if (result.willpowerCost < 4) {
            willpowerCostEl.classList.add('positive');
        } else if (result.willpowerCost > 4) {
            willpowerCostEl.classList.add('negative');
        } else {
            willpowerCostEl.classList.add('neutral');
        }

        const willpowerDetail = document.getElementById('willpower-detail');
        willpowerDetail.textContent = `${config.baseCost} (base) - ${config.willpowerLevel} (willpower level) = ${result.willpowerCost}`;

        // Total score
        const totalScoreEl = document.getElementById('total-score');
        totalScoreEl.textContent = result.totalScore.toFixed(2);
        totalScoreEl.className = 'result-value score';
        if (result.totalScore > 0) {
            totalScoreEl.classList.add('positive');
        } else if (result.totalScore < 0) {
            totalScoreEl.classList.add('negative');
        } else {
            totalScoreEl.classList.add('neutral');
        }

        // Score breakdown
        const breakdownEl = document.getElementById('score-breakdown');
        breakdownEl.innerHTML = `
            <div class="breakdown-item">
                <span class="breakdown-label">Willpower Cost (${result.breakdown.willpower.cost}):</span>
                <span class="breakdown-value ${result.breakdown.willpower.score >= 0 ? 'positive' : 'negative'}">
                    ${result.breakdown.willpower.score >= 0 ? '+' : ''}${result.breakdown.willpower.score.toFixed(2)}
                </span>
            </div>
            <div class="breakdown-item">
                <span class="breakdown-label">${result.breakdown.effect1.type} (Lv. ${result.breakdown.effect1.level}):</span>
                <span class="breakdown-value positive">
                    +${result.breakdown.effect1.score.toFixed(2)}
                </span>
            </div>
            <div class="breakdown-item">
                <span class="breakdown-label">${result.breakdown.effect2.type} (Lv. ${result.breakdown.effect2.level}):</span>
                <span class="breakdown-value positive">
                    +${result.breakdown.effect2.score.toFixed(2)}
                </span>
            </div>
            <div class="breakdown-item">
                <span class="breakdown-label">Order (Lv. ${result.breakdown.order.level}):</span>
                <span class="breakdown-value ${result.breakdown.order.score >= 0 ? 'positive' : 'negative'}">
                    ${result.breakdown.order.score >= 0 ? '+' : ''}${result.breakdown.order.score.toFixed(2)}
                </span>
            </div>
        `;
    }

    optimize() {
        const config = this.getCurrentConfig();
        const baseCost = config.baseCost;
        const gemType = config.gemType;

        // Show loading state
        const optimizeBtn = document.getElementById('optimize-btn');
        const originalText = optimizeBtn.textContent;
        optimizeBtn.textContent = 'Optimizing...';
        optimizeBtn.disabled = true;

        // Run optimization (use setTimeout to prevent UI blocking)
        setTimeout(() => {
            const optimalConfigs = this.solver.findOptimalConfig(baseCost, gemType);
            
            if (optimalConfigs.length > 0) {
                const best = optimalConfigs[0];
                this.displayOptimalConfig(best);
            }

            optimizeBtn.textContent = originalText;
            optimizeBtn.disabled = false;
        }, 100);
    }

    displayOptimalConfig(best) {
        const { config, result } = best;
        const optimalEl = document.getElementById('optimization-results');
        const configEl = document.getElementById('optimal-config');

        configEl.innerHTML = `
            <div class="optimal-config-item">
                <strong>Base Cost:</strong> ${config.baseCost}
            </div>
            <div class="optimal-config-item">
                <strong>Effect 1:</strong> ${config.effect1} (Level ${config.effect1Level})
            </div>
            <div class="optimal-config-item">
                <strong>Effect 2:</strong> ${config.effect2} (Level ${config.effect2Level})
            </div>
            <div class="optimal-config-item">
                <strong>Willpower:</strong> Level ${config.willpowerLevel} (Cost: ${result.willpowerCost})
            </div>
            <div class="optimal-config-item">
                <strong>Order:</strong> Level ${config.orderLevel}
            </div>
            <div class="optimal-config-item optimal-score">
                <strong>Total Score:</strong> <span class="score-value">${result.totalScore.toFixed(2)}</span>
            </div>
            <button id="apply-optimal-btn" class="apply-btn">Apply This Configuration</button>
        `;

        optimalEl.style.display = 'block';

        // Add event listener for apply button
        document.getElementById('apply-optimal-btn').addEventListener('click', () => {
            this.applyConfig(config);
        });
    }

    applyConfig(config) {
        document.getElementById('base-cost').value = config.baseCost;
        this.updateEffectOptions();
        document.getElementById('effect1').value = config.effect1;
        document.getElementById('effect2').value = config.effect2;
        document.getElementById('effect1-level').value = config.effect1Level;
        document.getElementById('effect2-level').value = config.effect2Level;
        document.getElementById('willpower-level').value = config.willpowerLevel;
        document.getElementById('order-level').value = config.orderLevel;
        
        // Recalculate
        this.calculate();
    }

    reset() {
        document.getElementById('gem-type').value = 'order';
        document.getElementById('base-cost').value = '8';
        document.getElementById('willpower-level').value = 1;
        document.getElementById('order-level').value = 1;
        document.getElementById('effect1-level').value = 1;
        document.getElementById('effect2-level').value = 1;
        
        this.updateEffectOptions();
        
        // Clear results
        document.getElementById('willpower-cost').textContent = '-';
        document.getElementById('willpower-cost').className = 'result-value';
        document.getElementById('willpower-detail').textContent = '';
        document.getElementById('total-score').textContent = '-';
        document.getElementById('total-score').className = 'result-value score';
        document.getElementById('score-breakdown').innerHTML = '';
        document.getElementById('optimization-results').style.display = 'none';

        // Stop cutting if active
        if (this.cuttingState) {
            this.stopCutting();
        }
    }

    startCutting() {
        const config = this.getCurrentConfig();
        
        // Validate configuration
        const validation = this.solver.validateConfig(config);
        if (!validation.valid) {
            alert(validation.error);
            return;
        }

        const rarity = document.getElementById('gem-rarity').value;
        const maxTurns = rarity === 'epic' ? 9 : 7;
        const maxRerolls = rarity === 'epic' ? 3 : 2;

        // Initialize cutting state
        this.cuttingState = {
            config: { ...config },
            currentTurn: 1,
            maxTurns: maxTurns,
            rerollsRemaining: maxRerolls,
            processCost: 900,
            processCostMultiplier: 0, // Percentage multiplier for cost changes
            totalGoldSpent: 0,
            history: [],
            outcomes: []
        };

        // Show cutting section
        document.getElementById('cutting-section').style.display = 'block';
        
        // Update UI
        this.updateCuttingUI();
        this.generateNewOutcomes();
    }

    stopCutting() {
        this.cuttingState = null;
        document.getElementById('cutting-section').style.display = 'none';
    }

    updateCuttingUI() {
        if (!this.cuttingState) return;

        const state = this.cuttingState;
        const config = state.config;

        // Update status
        document.getElementById('current-turn').textContent = state.currentTurn;
        document.getElementById('max-turns').textContent = state.maxTurns;
        const turnsRemaining = state.maxTurns - state.currentTurn + 1;
        document.getElementById('turns-remaining').textContent = Math.max(0, turnsRemaining);
        document.getElementById('rerolls-remaining').textContent = state.rerollsRemaining;
        const costDisplay = state.processCostMultiplier !== 0 
            ? `${state.processCost} gold (${state.processCostMultiplier > 0 ? '+' : ''}${state.processCostMultiplier}%)`
            : `${state.processCost} gold`;
        document.getElementById('process-cost').textContent = costDisplay;
        document.getElementById('total-gold').textContent = state.totalGoldSpent;

        // Update gem state
        document.getElementById('cut-willpower-level').textContent = config.willpowerLevel;
        document.getElementById('cut-order-level').textContent = config.orderLevel;
        document.getElementById('cut-effect1-level').textContent = config.effect1Level;
        document.getElementById('cut-effect2-level').textContent = config.effect2Level;
        document.getElementById('cut-effect1-label').textContent = `${config.effect1}:`;
        document.getElementById('cut-effect2-label').textContent = `${config.effect2}:`;

        // Update current score
        const scoreResult = this.solver.calculateScore(config);
        document.getElementById('cut-current-score').textContent = scoreResult.totalScore.toFixed(2);
        const scoreEl = document.getElementById('cut-current-score');
        scoreEl.className = 'score-value';
        if (scoreResult.totalScore > 0) {
            scoreEl.classList.add('positive');
        } else if (scoreResult.totalScore < 0) {
            scoreEl.classList.add('negative');
        }

        // Update button states
        document.getElementById('process-btn').disabled = state.currentTurn > state.maxTurns;
        document.getElementById('reroll-btn').disabled = state.rerollsRemaining <= 0;
        
        // Update reroll button text
        const rerollCost = state.rerollsRemaining === 1 ? 2800 : 0;
        document.getElementById('reroll-btn').textContent = 
            `Reroll Outcomes${rerollCost > 0 ? ` (${rerollCost} gold)` : ''}`;
    }

    generateNewOutcomes() {
        if (!this.cuttingState) return;

        const configWithState = {
            ...this.cuttingState.config,
            processCostMultiplier: this.cuttingState.processCostMultiplier || 0,
            turnsRemaining: this.cuttingState.maxTurns - this.cuttingState.currentTurn + 1
        };
        
        // Always generate 4 new outcomes based on current state
        const outcomes = this.solver.generateOutcomes(configWithState);
        
        // Ensure we have exactly 4 outcomes
        if (outcomes.length !== 4) {
            console.warn(`Expected 4 outcomes but got ${outcomes.length}`);
        }
        
        this.cuttingState.outcomes = outcomes;
        this.displayOutcomes(outcomes);
        
        // Update title to show current turn
        const outcomesTitle = document.getElementById('outcomes-title');
        if (outcomesTitle) {
            outcomesTitle.textContent = `Available Outcomes - Turn ${this.cuttingState.currentTurn} (4 options)`;
        }
    }

    displayOutcomes(outcomes) {
        const container = document.getElementById('outcomes-container');
        container.innerHTML = '';

        outcomes.forEach((outcome, index) => {
            const outcomeEl = document.createElement('div');
            outcomeEl.className = 'outcome-card';
            outcomeEl.dataset.outcomeIndex = index;
            outcomeEl.innerHTML = `
                <div class="outcome-card-header">
                    <div class="outcome-number">${index + 1}</div>
                    <div class="outcome-description">${outcome.description}</div>
                </div>
                <button class="select-outcome-btn" data-index="${index}">Select & Process This Outcome</button>
            `;
            
            // Add click handler for selecting this outcome
            const selectBtn = outcomeEl.querySelector('.select-outcome-btn');
            selectBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.processSelectedOutcome(index);
            });
            
            // Also allow clicking the card itself
            outcomeEl.addEventListener('click', () => {
                this.processSelectedOutcome(index);
            });
            
            container.appendChild(outcomeEl);
        });

        // Store original generated outcomes
        if (!this.cuttingState.originalOutcomes) {
            this.cuttingState.originalOutcomes = JSON.parse(JSON.stringify(outcomes));
        }
    }

    showOutcomeEditor() {
        const editor = document.getElementById('outcomes-editor');
        const container = document.getElementById('outcome-editor-items');
        container.innerHTML = '';

        const outcomes = this.cuttingState.outcomes;
        const config = this.cuttingState.config;

        outcomes.forEach((outcome, index) => {
            const editorItem = document.createElement('div');
            editorItem.className = 'outcome-editor-item';
            editorItem.innerHTML = this.createOutcomeEditorHTML(outcome, index, config);
            container.appendChild(editorItem);
            
            // Add event listener for type change
            const typeSelect = editorItem.querySelector('.outcome-type-select');
            if (typeSelect) {
                typeSelect.addEventListener('change', () => {
                    this.updateOutcomeFields(index);
                });
            }
        });

        editor.style.display = 'block';
        document.getElementById('edit-outcomes-btn').style.display = 'none';
        document.getElementById('reset-outcomes-btn').style.display = 'inline-block';
    }

    createOutcomeEditorHTML(outcome, index, config) {
        const outcomeTypes = [
            { value: 'raise_effect', label: 'Raise Effect' },
            { value: 'lower_effect', label: 'Lower Effect' },
            { value: 'change_gold_cost', label: 'Change Process Cost' },
            { value: 'do_nothing', label: 'Do Nothing' },
            { value: 'change_side_option', label: 'Change Side Option' },
            { value: 'reroll_increase', label: 'Increase Rerolls' }
        ];

        const targets = [
            { value: 'willpower', label: 'Willpower' },
            { value: 'order', label: 'Order' },
            { value: 'effect1', label: config.effect1 },
            { value: 'effect2', label: config.effect2 }
        ];

        let html = `
            <div class="editor-item-header">
                <strong>Outcome ${index + 1}</strong>
            </div>
            <div class="editor-item-content">
                <div class="editor-field">
                    <label>Type:</label>
                    <select class="outcome-type-select" data-index="${index}">
        `;

        outcomeTypes.forEach(type => {
            const selected = outcome.type === type.value ? 'selected' : '';
            html += `<option value="${type.value}" ${selected}>${type.label}</option>`;
        });

        html += `
                    </select>
                </div>
                <div class="outcome-fields-container" data-index="${index}">
        `;

        // Show fields based on current type
        html += this.getOutcomeFieldsHTML(outcome, index, config);

        html += `
                </div>
            </div>
        `;

        return html;
    }

    getOutcomeFieldsHTML(outcome, index, config) {
        const targets = [
            { value: 'willpower', label: 'Willpower' },
            { value: 'order', label: 'Order' },
            { value: 'effect1', label: config.effect1 },
            { value: 'effect2', label: config.effect2 }
        ];

        let html = '';

        // Show target selector for raise/lower effect
        if (outcome.type === 'raise_effect' || outcome.type === 'lower_effect') {
            html += `
                <div class="editor-field">
                    <label>Target:</label>
                    <select class="outcome-target-select" data-index="${index}">
            `;
            targets.forEach(target => {
                const selected = outcome.target === target.value ? 'selected' : '';
                html += `<option value="${target.value}" ${selected}>${target.label}</option>`;
            });
            html += `
                    </select>
                </div>
                <div class="editor-field">
                    <label>Amount:</label>
                    <input type="number" class="outcome-amount-input" data-index="${index}" 
                           min="1" max="4" value="${outcome.amount || 1}">
                </div>
            `;
        }

        // Show change amount for cost changes
        if (outcome.type === 'change_gold_cost') {
            html += `
                <div class="editor-field">
                    <label>Change (%):</label>
                    <input type="number" class="outcome-change-input" data-index="${index}" 
                           min="-100" max="100" step="100" value="${outcome.change || 0}">
                    <span class="field-hint">+100 or -100</span>
                </div>
            `;
        }

        // Show change amount for reroll increase
        if (outcome.type === 'reroll_increase') {
            html += `
                <div class="editor-field">
                    <label>Increase Amount:</label>
                    <input type="number" class="outcome-change-input" data-index="${index}" 
                           min="1" max="2" value="${outcome.change || 1}">
                </div>
            `;
        }

        // Show effect selection for change_side_option
        if (outcome.type === 'change_side_option') {
            const availableEffects = this.solver.getAvailableEffects(config.baseCost);
            const currentEffects = [config.effect1, config.effect2];
            const possibleNewEffects = availableEffects.filter(eff => !currentEffects.includes(eff));
            const targetEffect = outcome.target === 'effect1' ? config.effect1 : (outcome.target === 'effect2' ? config.effect2 : config.effect1);
            
            html += `
                <div class="editor-field">
                    <label>Change Effect:</label>
                    <select class="outcome-target-select" data-index="${index}">
                        <option value="effect1" ${outcome.target === 'effect1' ? 'selected' : ''}>First Effect (${config.effect1})</option>
                        <option value="effect2" ${outcome.target === 'effect2' ? 'selected' : ''}>Second Effect (${config.effect2})</option>
                    </select>
                </div>
                <div class="editor-field">
                    <label>Change To:</label>
                    <div class="effect-change-info">Current: <strong>${targetEffect}</strong></div>
                    <select class="outcome-effect-select" data-index="${index}">
                        <option value="">Random</option>
            `;
            possibleNewEffects.forEach(eff => {
                const selected = outcome.newEffect === eff ? 'selected' : '';
                html += `<option value="${eff}" ${selected}>${eff}</option>`;
            });
            html += `
                    </select>
                    <span class="field-hint">Will change to one of: ${possibleNewEffects.join(', ')}</span>
                </div>
            `;
        }

        return html;
    }

    updateOutcomeFields(index) {
        const editorItems = document.querySelectorAll('.outcome-editor-item');
        const editorItem = editorItems[index];
        if (!editorItem) return;

        const typeSelect = editorItem.querySelector('.outcome-type-select');
        const newType = typeSelect.value;
        const fieldsContainer = editorItem.querySelector('.outcome-fields-container');
        
        if (!fieldsContainer) return;
        
        // Get current config
        const config = this.cuttingState.config;
        
        // Create a temporary outcome object with the new type
        const tempOutcome = { type: newType };
        
        // Preserve existing values if they're still valid
        const oldTarget = editorItem.querySelector('.outcome-target-select')?.value;
        const oldAmount = editorItem.querySelector('.outcome-amount-input')?.value;
        const oldChange = editorItem.querySelector('.outcome-change-input')?.value;
        const oldEffect = editorItem.querySelector('.outcome-effect-select')?.value;
        
        if (oldTarget && (newType === 'raise_effect' || newType === 'lower_effect')) {
            tempOutcome.target = oldTarget;
            tempOutcome.amount = parseInt(oldAmount) || 1;
        }
        if (oldChange && (newType === 'change_gold_cost' || newType === 'reroll_increase')) {
            tempOutcome.change = parseInt(oldChange) || (newType === 'change_gold_cost' ? 0 : 1);
        }
        if (oldTarget && newType === 'change_side_option') {
            tempOutcome.target = oldTarget;
            tempOutcome.newEffect = oldEffect || null;
        }
        
        // Update fields container
        fieldsContainer.innerHTML = this.getOutcomeFieldsHTML(tempOutcome, index, config);
        
        // Re-attach event listener for target/effect selects if needed
        if (newType === 'change_side_option') {
            const targetSelect = fieldsContainer.querySelector('.outcome-target-select');
            if (targetSelect) {
                targetSelect.addEventListener('change', () => {
                    this.updateOutcomeFields(index);
                });
            }
        }
    }

    saveEditedOutcomes() {
        const editorItems = document.querySelectorAll('.outcome-editor-item');
        const newOutcomes = [];

        editorItems.forEach((item, index) => {
            const typeSelect = item.querySelector('.outcome-type-select');
            const type = typeSelect.value;

            let outcome = { type: type };

            if (type === 'raise_effect' || type === 'lower_effect') {
                const targetSelect = item.querySelector('.outcome-target-select');
                const amountInput = item.querySelector('.outcome-amount-input');
                outcome.target = targetSelect.value;
                outcome.amount = parseInt(amountInput.value) || 1;
                
                // Set effect name
                const config = this.cuttingState.config;
                if (outcome.target === 'willpower') {
                    outcome.effectName = 'Willpower';
                } else if (outcome.target === 'order') {
                    outcome.effectName = 'Order';
                } else if (outcome.target === 'effect1') {
                    outcome.effectName = config.effect1;
                } else if (outcome.target === 'effect2') {
                    outcome.effectName = config.effect2;
                }

                // Generate description
                const currentLevel = this.getCurrentLevel(outcome.target);
                const newLevel = type === 'raise_effect' 
                    ? Math.min(5, currentLevel + outcome.amount)
                    : Math.max(1, currentLevel - outcome.amount);
                outcome.description = type === 'raise_effect'
                    ? `Raise ${outcome.effectName} by ${outcome.amount} level(s) (${currentLevel} → ${newLevel})`
                    : `Lower ${outcome.effectName} by ${outcome.amount} level(s) (${currentLevel} → ${newLevel})`;
            } else if (type === 'change_gold_cost') {
                const changeInput = item.querySelector('.outcome-change-input');
                outcome.change = parseInt(changeInput.value) || 0;
                outcome.description = `${outcome.change > 0 ? 'Increase' : 'Decrease'} process cost by ${Math.abs(outcome.change)}%`;
            } else if (type === 'reroll_increase') {
                const changeInput = item.querySelector('.outcome-change-input');
                outcome.change = parseInt(changeInput.value) || 1;
                outcome.description = `Increase reroll count by ${outcome.change}`;
            } else if (type === 'do_nothing') {
                outcome.description = 'Do nothing (no changes)';
            } else if (type === 'change_side_option') {
                const config = this.cuttingState.config;
                const targetSelect = item.querySelector('.outcome-target-select');
                const effectSelect = item.querySelector('.outcome-effect-select');
                
                if (targetSelect) {
                    outcome.target = targetSelect.value;
                } else {
                    // Default to effect1 if not set
                    outcome.target = 'effect1';
                }
                
                const availableEffects = this.solver.getAvailableEffects(config.baseCost);
                const currentEffects = [config.effect1, config.effect2];
                const possibleNewEffects = availableEffects.filter(eff => !currentEffects.includes(eff));
                
                const targetEffect = outcome.target === 'effect1' ? config.effect1 : config.effect2;
                
                // Get selected new effect from editor
                const selectedNewEffect = effectSelect ? effectSelect.value : null;
                
                if (selectedNewEffect && possibleNewEffects.includes(selectedNewEffect)) {
                    outcome.newEffect = selectedNewEffect;
                    outcome.description = `Change ${outcome.target === 'effect1' ? 'first' : 'second'} effect (${targetEffect} → ${selectedNewEffect})`;
                } else {
                    // Random selection - will be determined when applied
                    outcome.newEffect = null;
                    const newEffectPreview = possibleNewEffects.length > 0 
                        ? ` → ${possibleNewEffects.join('/')}`
                        : '';
                    outcome.description = `Change ${outcome.target === 'effect1' ? 'first' : 'second'} effect (${targetEffect}${newEffectPreview})`;
                }
                outcome.possibleNewEffects = possibleNewEffects;
            }

            newOutcomes.push(outcome);
        });

        // Update outcomes
        this.cuttingState.outcomes = newOutcomes;
        this.displayOutcomes(newOutcomes);
        this.hideOutcomeEditor();
    }

    getCurrentLevel(target) {
        const config = this.cuttingState.config;
        switch (target) {
            case 'willpower': return config.willpowerLevel;
            case 'order': return config.orderLevel;
            case 'effect1': return config.effect1Level;
            case 'effect2': return config.effect2Level;
            default: return 1;
        }
    }

    hideOutcomeEditor() {
        document.getElementById('outcomes-editor').style.display = 'none';
        document.getElementById('edit-outcomes-btn').style.display = 'inline-block';
        document.getElementById('reset-outcomes-btn').style.display = 'none';
    }

    resetOutcomesToGenerated() {
        if (this.cuttingState.originalOutcomes) {
            this.cuttingState.outcomes = JSON.parse(JSON.stringify(this.cuttingState.originalOutcomes));
            this.displayOutcomes(this.cuttingState.outcomes);
        } else {
            // Regenerate outcomes
            this.generateNewOutcomes();
        }
        this.hideOutcomeEditor();
    }

    processCutting(selectedIndex = null) {
        if (!this.cuttingState) return;

        const state = this.cuttingState;
        
        if (state.currentTurn > state.maxTurns) {
            alert('No more turns remaining!');
            return;
        }

        // Pay process cost
        state.totalGoldSpent += state.processCost;

        // Select outcome (random if no index provided, or use selected index)
        let selectedOutcome;
        if (selectedIndex !== null && selectedIndex >= 0 && selectedIndex < state.outcomes.length) {
            selectedOutcome = state.outcomes[selectedIndex];
        } else {
            // Randomly select one outcome (fallback)
            selectedOutcome = state.outcomes[Math.floor(Math.random() * state.outcomes.length)];
        }

        // Apply outcome
        const newConfig = this.solver.applyOutcome(state.config, selectedOutcome);
        
        // Handle gold cost change (percentage-based)
        if (selectedOutcome.type === 'change_gold_cost') {
            state.processCostMultiplier = Math.max(-100, Math.min(100, state.processCostMultiplier + selectedOutcome.change));
            // Recalculate process cost: base cost * (1 + multiplier%)
            state.processCost = Math.max(100, Math.round(900 * (1 + state.processCostMultiplier / 100)));
        }
        
        // Handle reroll increase
        if (selectedOutcome.type === 'reroll_increase') {
            state.rerollsRemaining += selectedOutcome.change || 1;
        }

        // Update config
        state.config = newConfig;

        // Add to history
        state.history.push({
            turn: state.currentTurn,
            outcome: selectedOutcome,
            config: { ...newConfig },
            goldSpent: state.processCost
        });

        // Advance turn
        state.currentTurn++;

        // Update UI
        this.updateCuttingUI();
        this.updateHistory();

        // Always generate 4 new outcomes for the next turn (if not complete)
        if (state.currentTurn <= state.maxTurns) {
            // Generate fresh outcomes based on the new gem state
            this.generateNewOutcomes();
        } else {
            // Process complete - clear outcomes
            document.getElementById('outcomes-container').innerHTML = 
                '<div class="process-complete">Cutting process complete! No more outcomes available.</div>';
            const finalScore = this.solver.calculateScore(newConfig).totalScore;
            alert(`Cutting process complete! Final score: ${finalScore.toFixed(2)}`);
        }
    }

    processSelectedOutcome(index) {
        this.processCutting(index);
    }

    rerollOutcomes() {
        if (!this.cuttingState) return;

        const state = this.cuttingState;

        if (state.rerollsRemaining <= 0) {
            alert('No rerolls remaining!');
            return;
        }

        // Pay reroll cost (only for last reroll)
        const rerollCost = state.rerollsRemaining === 1 ? 2800 : 0;
        if (rerollCost > 0) {
            state.totalGoldSpent += rerollCost;
        }

        // Decrease rerolls
        state.rerollsRemaining--;

        // Generate new outcomes
        this.generateNewOutcomes();
        this.updateCuttingUI();
    }

    deleteGem() {
        if (!this.cuttingState) return;

        if (confirm('Are you sure you want to delete this gem? All progress will be lost.')) {
            this.stopCutting();
            alert('Gem deleted.');
        }
    }

    updateHistory() {
        if (!this.cuttingState) return;

        const container = document.getElementById('history-container');
        container.innerHTML = '';

        if (this.cuttingState.history.length === 0) {
            container.innerHTML = '<div class="history-empty">No actions taken yet.</div>';
            return;
        }

        this.cuttingState.history.forEach((entry, index) => {
            const historyEl = document.createElement('div');
            historyEl.className = 'history-item';
            historyEl.innerHTML = `
                <div class="history-turn">Turn ${entry.turn}</div>
                <div class="history-outcome">${entry.outcome.description}</div>
                <div class="history-cost">Cost: ${entry.goldSpent} gold</div>
                <div class="history-score">Score: ${this.solver.calculateScore(entry.config).totalScore.toFixed(2)}</div>
            `;
            container.appendChild(historyEl);
        });
    }

    runSolver() {
        if (!this.cuttingState) {
            alert('Please start the cutting process first.');
            return;
        }

        const baseline = parseFloat(document.getElementById('baseline-score').value);
        const goldPerDamage = parseFloat(document.getElementById('gold-per-damage').value);
        const numRuns = parseInt(document.getElementById('monte-carlo-runs').value);

        // Show loading state
        const solverBtn = document.getElementById('run-solver-btn');
        const originalText = solverBtn.textContent;
        solverBtn.textContent = 'Running Simulation...';
        solverBtn.disabled = true;

        // Run simulation in chunks to avoid blocking UI
        setTimeout(() => {
            try {
                const result = this.solver.evaluateActions(
                    this.cuttingState,
                    baseline,
                    goldPerDamage,
                    numRuns
                );

                this.displaySolverResult(result, baseline, goldPerDamage);
            } catch (error) {
                console.error('Solver error:', error);
                alert('Error running solver: ' + error.message);
            } finally {
                solverBtn.textContent = originalText;
                solverBtn.disabled = false;
            }
        }, 100);
    }

    displaySolverResult(result, baseline, goldPerDamage) {
        const recommendationEl = document.getElementById('solver-recommendation');
        const contentEl = document.getElementById('recommendation-content');

        const goldPerScore = goldPerDamage / 27;
        const currentScore = this.solver.calculateScore(this.cuttingState.config).totalScore;
        const currentValue = result.currentValue;

        let html = `
            <div class="recommendation-summary">
                <div class="current-state">
                    <h4>Current State</h4>
                    <div class="state-info">
                        <div>Current Score: <strong>${currentScore.toFixed(2)}</strong></div>
                        <div>Current Gem Value: <strong>${currentValue.toFixed(0)}</strong> gold</div>
                        <div>Gold Spent So Far: <strong>${this.cuttingState.totalGoldSpent}</strong> gold</div>
                        <div>Net Value: <strong>${(currentValue - this.cuttingState.totalGoldSpent).toFixed(0)}</strong> gold</div>
                    </div>
                </div>

                <div class="recommendation-main">
                    <h4>Recommended Action: <span class="recommendation-action ${result.bestAction}">${result.allActions[0].name}</span></h4>
                    <p class="recommendation-description">${result.allActions[0].description}</p>
                </div>
            </div>

            <div class="action-comparison">
                <h4>Expected Values</h4>
                <div class="comparison-grid">
        `;

        result.allActions.forEach((action, index) => {
            const isBest = index === 0;
            const oddsPercent = (action.aboveBaselineOdds * 100).toFixed(1);
            html += `
                <div class="action-card ${isBest ? 'best-action' : ''}">
                    <div class="action-name">${action.name}</div>
                    <div class="action-score">Expected Score: <strong>${action.expectedScore.toFixed(2)}</strong></div>
                    <div class="action-odds ${action.aboveBaselineOdds >= 0.5 ? 'positive' : action.aboveBaselineOdds >= 0.3 ? 'neutral' : 'negative'}">
                        Odds Above Baseline: <strong>${oddsPercent}%</strong>
                    </div>
                    <div class="action-value ${action.value >= 0 ? 'positive' : 'negative'}">
                        Net Value: ${action.value >= 0 ? '+' : ''}${action.value.toFixed(0)} gold
                    </div>
                    <div class="action-cost">Expected Cost: ${action.expectedCost.toFixed(0)} gold</div>
                    <div class="action-desc">${action.description}</div>
                </div>
            `;
        });

        html += `
                </div>
            </div>

            <div class="solver-settings-display">
                <small>
                    Baseline: ${baseline} | Gold per Damage: ${goldPerDamage.toLocaleString()} | 
                    Gold per Score: ${goldPerScore.toFixed(0)} | Runs: ${document.getElementById('monte-carlo-runs').value}
                </small>
            </div>
        `;

        contentEl.innerHTML = html;
        recommendationEl.style.display = 'block';
    }

    showGemStateEditor() {
        if (!this.cuttingState) return;

        const state = this.cuttingState;
        const config = state.config;

        // Populate editor fields with current values
        document.getElementById('edit-willpower').value = config.willpowerLevel;
        document.getElementById('edit-order').value = config.orderLevel;
        document.getElementById('edit-effect1').value = config.effect1Level;
        document.getElementById('edit-effect2').value = config.effect2Level;
        document.getElementById('edit-current-turn').value = state.currentTurn;
        document.getElementById('edit-rerolls-remaining').value = state.rerollsRemaining;
        document.getElementById('edit-total-gold').value = state.totalGoldSpent;

        // Update effect labels
        document.getElementById('edit-effect1-label').textContent = `${config.effect1} Level:`;
        document.getElementById('edit-effect2-label').textContent = `${config.effect2} Level:`;

        // Show editor, hide display
        document.getElementById('gem-state-editor').style.display = 'block';
        document.getElementById('gem-state-display').style.display = 'none';
        document.getElementById('edit-gem-state-btn').style.display = 'none';
    }

    hideGemStateEditor() {
        document.getElementById('gem-state-editor').style.display = 'none';
        document.getElementById('gem-state-display').style.display = 'block';
        document.getElementById('edit-gem-state-btn').style.display = 'inline-block';
    }

    saveGemState() {
        if (!this.cuttingState) return;

        // Get values from editor
        const willpowerLevel = parseInt(document.getElementById('edit-willpower').value);
        const orderLevel = parseInt(document.getElementById('edit-order').value);
        const effect1Level = parseInt(document.getElementById('edit-effect1').value);
        const effect2Level = parseInt(document.getElementById('edit-effect2').value);
        const currentTurn = parseInt(document.getElementById('edit-current-turn').value);
        const rerollsRemaining = parseInt(document.getElementById('edit-rerolls-remaining').value);
        const totalGoldSpent = parseInt(document.getElementById('edit-total-gold').value);

        // Validate values
        if (willpowerLevel < 1 || willpowerLevel > 5 ||
            orderLevel < 1 || orderLevel > 5 ||
            effect1Level < 1 || effect1Level > 5 ||
            effect2Level < 1 || effect2Level > 5) {
            alert('All gem levels must be between 1 and 5.');
            return;
        }

        if (currentTurn < 1 || currentTurn > this.cuttingState.maxTurns) {
            alert(`Current turn must be between 1 and ${this.cuttingState.maxTurns}.`);
            return;
        }

        if (rerollsRemaining < 0) {
            alert('Rerolls remaining cannot be negative.');
            return;
        }

        if (totalGoldSpent < 0) {
            alert('Total gold spent cannot be negative.');
            return;
        }

        // Update cutting state
        this.cuttingState.config.willpowerLevel = willpowerLevel;
        this.cuttingState.config.orderLevel = orderLevel;
        this.cuttingState.config.effect1Level = effect1Level;
        this.cuttingState.config.effect2Level = effect2Level;
        this.cuttingState.currentTurn = currentTurn;
        this.cuttingState.rerollsRemaining = rerollsRemaining;
        this.cuttingState.totalGoldSpent = totalGoldSpent;

        // Hide editor and update UI
        this.hideGemStateEditor();
        this.updateCuttingUI();

        // Regenerate outcomes for the current turn if we're still in progress
        if (this.cuttingState.currentTurn <= this.cuttingState.maxTurns) {
            this.generateNewOutcomes();
        }
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new AstrogemApp();
});
