// State Management
let state = JSON.parse(localStorage.getItem('fitpulse_state')) || {
    user: {
        name: 'Guest',
        calorieGoal: 2000,
        waterGoal: 2.5,
        stepGoal: 10000
    },
    daily: {
        caloriesConsumed: 0,
        caloriesBurned: 0,
        waterIntake: 0,
        steps: 0,
        foodLog: [],
        exerciseLog: []
    }
};

const saveState = () => {
    localStorage.setItem('fitpulse_state', JSON.stringify(state));
    updateHeaderStats();
};

const updateHeaderStats = () => {
    const calsLeft = state.user.calorieGoal - state.daily.caloriesConsumed + state.daily.caloriesBurned;
    document.getElementById('header-calories').textContent = calsLeft;
    document.getElementById('header-steps').textContent = state.daily.steps;
    document.getElementById('header-water').textContent = state.daily.waterIntake.toFixed(1) + 'L';
};

// DOM Elements
const appContent = document.getElementById('app-content');
const tabButtons = document.querySelectorAll('.tab-btn');
const modalOverlay = document.getElementById('modal-overlay');
const modalClose = document.getElementById('modal-close');
const modalBody = document.getElementById('modal-body');
const modalTitle = document.getElementById('modal-title');

// View Rendering Functions
const renderDashboard = () => {
    const calsConsumed = state.daily.caloriesConsumed;
    const calsGoal = state.user.calorieGoal;
    const consumePercent = Math.min((calsConsumed / calsGoal) * 100, 100);
    
    const waterIntake = state.daily.waterIntake;
    const waterGoal = state.user.waterGoal;
    const waterPercent = Math.min((waterIntake / waterGoal) * 100, 100);

    const steps = state.daily.steps;
    const stepsGoal = state.user.stepGoal;
    const stepsPercent = Math.min((steps / stepsGoal) * 100, 100);

    appContent.innerHTML = `
        <div class="dashboard-grid fade-in">
            <div class="card">
                <div class="card-header">
                    <div class="card-title">
                        <div class="card-icon" style="background: var(--secondary-gradient)">🍎</div>
                        Calories
                    </div>
                </div>
                <div class="progress-container">
                    <div class="progress-header">
                        <span class="progress-label">Consumed: ${calsConsumed} / ${calsGoal} kcal</span>
                        <span class="progress-value">${Math.round(consumePercent)}%</span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${consumePercent}%; background: var(--secondary-gradient)"></div>
                    </div>
                </div>
                <div class="stat-grid">
                    <div class="stat-box">
                        <div class="stat-box-value">${state.daily.caloriesBurned}</div>
                        <div class="stat-box-label">Burned</div>
                    </div>
                    <div class="stat-box">
                        <div class="stat-box-value">${calsGoal - calsConsumed + state.daily.caloriesBurned}</div>
                        <div class="stat-box-label">Remaining</div>
                    </div>
                </div>
            </div>

            <div class="card">
                <div class="card-header">
                    <div class="card-title">
                        <div class="card-icon" style="background: var(--success-gradient)">💧</div>
                        Hydration
                    </div>
                    <button class="card-action" onclick="window.quickAddWater()">+ 250ml</button>
                </div>
                <div class="progress-container">
                    <div class="progress-header">
                        <span class="progress-label">Intake: ${waterIntake.toFixed(1)}L / ${waterGoal}L</span>
                        <span class="progress-value">${Math.round(waterPercent)}%</span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${waterPercent}%; background: var(--success-gradient)"></div>
                    </div>
                </div>
            </div>

            <div class="card">
                <div class="card-header">
                    <div class="card-title">
                        <div class="card-icon" style="background: var(--warning-gradient)">👟</div>
                        Activity
                    </div>
                </div>
                <div class="progress-container">
                    <div class="progress-header">
                        <span class="progress-label">Steps: ${steps} / ${stepsGoal}</span>
                        <span class="progress-value">${Math.round(stepsPercent)}%</span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${stepsPercent}%; background: var(--warning-gradient)"></div>
                    </div>
                </div>
                <button class="btn btn-outline mt-2 w-full" onclick="window.openStepModal()">Log Steps</button>
            </div>
        </div>

        <div class="card fade-in" style="animation-delay: 0.2s">
            <div class="card-header">
                <h3 class="card-title">Recent Activity</h3>
            </div>
            <div id="recent-activities">
                ${renderRecentActivities()}
            </div>
        </div>
    `;
};

const renderRecentActivities = () => {
    const combined = [
        ...state.daily.foodLog.map(f => ({ ...f, type: 'food' })),
        ...state.daily.exerciseLog.map(e => ({ ...e, type: 'exercise' }))
    ].sort((a, b) => b.timestamp - a.timestamp).slice(0, 5);

    if (combined.length === 0) return '<p class="text-muted text-center py-4">No activity logged yet today.</p>';

    return combined.map(act => `
        <div class="list-item">
            <div class="list-item-content">
                <div class="list-item-title">${act.name}</div>
                <div class="list-item-subtitle">${act.type === 'food' ? act.meal : act.duration + ' mins'}</div>
            </div>
            <div class="list-item-value" style="color: ${act.type === 'food' ? 'var(--accent-pink)' : 'var(--accent-green)'}">
                ${act.type === 'food' ? '+' : '-'}${act.calories} kcal
            </div>
        </div>
    `).join('');
};

const renderFood = () => {
    appContent.innerHTML = `
        <div class="card fade-in">
            <div class="card-header">
                <h3 class="card-title">Nutrition Log</h3>
                <button class="btn btn-primary" onclick="window.openFoodModal()">+ Log Meal</button>
            </div>
            <div class="mt-3">
                ${state.daily.foodLog.length === 0 ? '<p class="text-muted text-center">Fuel your body! No meals logged today.</p>' : 
                state.daily.foodLog.map(food => `
                    <div class="list-item">
                        <div class="list-item-content">
                            <div class="list-item-title">${food.name} <span class="badge badge-info ml-2">${food.meal}</span></div>
                            <div class="list-item-subtitle">${food.protein}g P | ${food.carbs}g C | ${food.fat}g F</div>
                        </div>
                        <div class="list-item-value">${food.calories} kcal</div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
};

const renderExercise = () => {
    appContent.innerHTML = `
        <div class="card fade-in">
            <div class="card-header">
                <h3 class="card-title">Workouts</h3>
                <button class="btn btn-success" onclick="window.openExerciseModal()">+ Log Workout</button>
            </div>
            <div class="mt-3">
                ${state.daily.exerciseLog.length === 0 ? '<p class="text-muted text-center">Move your body! No exercises logged today.</p>' : 
                state.daily.exerciseLog.map(ex => `
                    <div class="list-item">
                        <div class="list-item-content">
                            <div class="list-item-title">${ex.name}</div>
                            <div class="list-item-subtitle">${ex.duration} minutes of movement</div>
                        </div>
                        <div class="list-item-value" style="color: var(--accent-green)">-${ex.calories} kcal</div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
};

const renderWater = () => {
    appContent.innerHTML = `
        <div class="card fade-in text-center">
            <div class="card-icon mx-auto mb-3" style="width: 64px; height: 64px; font-size: 32px">💧</div>
            <h2 class="mb-1">${state.daily.waterIntake.toFixed(1)}L</h2>
            <p class="text-secondary mb-3">Goal: ${state.user.waterGoal}L</p>
            <div class="flex-center gap-2">
                <button class="btn btn-outline" onclick="window.addWater(0.25)">+250ml</button>
                <button class="btn btn-outline" onclick="window.addWater(0.5)">+500ml</button>
                <button class="btn btn-outline" onclick="window.addWater(1.0)">+1.0L</button>
            </div>
            <button class="btn btn-secondary mt-3" onclick="window.resetWater()">Reset Hydration</button>
        </div>
    `;
};

const renderProgress = () => {
    appContent.innerHTML = `
        <div class="card fade-in">
            <h3 class="card-title mb-3">Weekly Progress</h3>
            <div class="chart-container flex-center" style="height: 200px">
                <p class="text-muted">Interactive charts coming in Pro version</p>
            </div>
            <div class="stat-grid">
                <div class="stat-box">
                    <div class="stat-box-value">${state.daily.caloriesConsumed}</div>
                    <div class="stat-box-label">Avg Cals</div>
                </div>
                <div class="stat-box">
                    <div class="stat-box-value">${state.daily.steps}</div>
                    <div class="stat-box-label">Avg Steps</div>
                </div>
                <div class="stat-box">
                    <div class="stat-box-value">${(state.daily.waterIntake).toFixed(1)}L</div>
                    <div class="stat-box-label">Avg Hydration</div>
                </div>
            </div>
        </div>
    `;
};

// Modal Functions
window.openFoodModal = () => {
    modalTitle.textContent = 'Log Food';
    modalBody.innerHTML = `
        <form id="food-form">
            <div class="form-group">
                <label class="form-label">Food Name</label>
                <input type="text" class="form-input" id="food-name" required placeholder="e.g. Grilled Chicken Salad">
            </div>
            <div class="form-group">
                <label class="form-label">Meal Type</label>
                <select class="form-select" id="food-meal">
                    <option>Breakfast</option>
                    <option>Lunch</option>
                    <option>Dinner</option>
                    <option>Snack</option>
                </select>
            </div>
            <div class="grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px">
                <div class="form-group">
                    <label class="form-label">Calories (kcal)</label>
                    <input type="number" class="form-input" id="food-calories" required>
                </div>
                <div class="form-group">
                    <label class="form-label">Protein (g)</label>
                    <input type="number" class="form-input" id="food-protein" value="0">
                </div>
                <div class="form-group">
                    <label class="form-label">Carbs (g)</label>
                    <input type="number" class="form-input" id="food-carbs" value="0">
                </div>
                <div class="form-group">
                    <label class="form-label">Fat (g)</label>
                    <input type="number" class="form-input" id="food-fat" value="0">
                </div>
            </div>
            <button type="submit" class="btn btn-primary w-full mt-2">Add Log</button>
        </form>
    `;
    modalOverlay.classList.add('active');
    
    document.getElementById('food-form').onsubmit = (e) => {
        e.preventDefault();
        const calories = parseInt(document.getElementById('food-calories').value);
        state.daily.foodLog.push({
            name: document.getElementById('food-name').value,
            meal: document.getElementById('food-meal').value,
            calories: calories,
            protein: parseInt(document.getElementById('food-protein').value),
            carbs: parseInt(document.getElementById('food-carbs').value),
            fat: parseInt(document.getElementById('food-fat').value),
            timestamp: Date.now()
        });
        state.daily.caloriesConsumed += calories;
        saveState();
        modalOverlay.classList.remove('active');
        renderFood();
    };
};

window.openExerciseModal = () => {
    modalTitle.textContent = 'Log Workout';
    modalBody.innerHTML = `
        <form id="exercise-form">
            <div class="form-group">
                <label class="form-label">Exercise Name</label>
                <input type="text" class="form-input" id="ex-name" required placeholder="e.g. Running, Yoga">
            </div>
            <div class="grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px">
                <div class="form-group">
                    <label class="form-label">Duration (mins)</label>
                    <input type="number" class="form-input" id="ex-duration" required>
                </div>
                <div class="form-group">
                    <label class="form-label">Calories Burned</label>
                    <input type="number" class="form-input" id="ex-calories" required>
                </div>
            </div>
            <button type="submit" class="btn btn-success w-full mt-2">Log Workout</button>
        </form>
    `;
    modalOverlay.classList.add('active');

    document.getElementById('exercise-form').onsubmit = (e) => {
        e.preventDefault();
        const calories = parseInt(document.getElementById('ex-calories').value);
        state.daily.exerciseLog.push({
            name: document.getElementById('ex-name').value,
            duration: parseInt(document.getElementById('ex-duration').value),
            calories: calories,
            timestamp: Date.now()
        });
        state.daily.caloriesBurned += calories;
        saveState();
        modalOverlay.classList.remove('active');
        renderExercise();
    };
};

window.openStepModal = () => {
    modalTitle.textContent = 'Log Steps';
    modalBody.innerHTML = `
        <div class="form-group">
            <label class="form-label">Add to today's steps</label>
            <input type="number" class="form-input" id="steps-input" placeholder="e.g. 500">
            <button class="btn btn-warning w-full mt-2" onclick="window.addSteps()">Add Steps</button>
        </div>
    `;
    modalOverlay.classList.add('active');
};

window.addSteps = () => {
    const input = document.getElementById('steps-input');
    const val = parseInt(input.value);
    if (val) {
        state.daily.steps += val;
        saveState();
        modalOverlay.classList.remove('active');
        const activeTab = document.querySelector('.tab-btn.active').dataset.tab;
        switchTab(activeTab);
    }
};

window.addWater = (amount) => {
    state.daily.waterIntake += amount;
    saveState();
    renderWater();
};

window.quickAddWater = () => {
    state.daily.waterIntake += 0.25;
    saveState();
    renderDashboard();
};

window.resetWater = () => {
    state.daily.waterIntake = 0;
    saveState();
    renderWater();
};

// Routing/Tab Management
const switchTab = (tabId) => {
    tabButtons.forEach(btn => btn.classList.toggle('active', btn.dataset.tab === tabId));
    
    switch(tabId) {
        case 'dashboard': renderDashboard(); break;
        case 'food': renderFood(); break;
        case 'exercise': renderExercise(); break;
        case 'water': renderWater(); break;
        case 'progress': renderProgress(); break;
    }
};

tabButtons.forEach(btn => {
    btn.onclick = () => switchTab(btn.dataset.tab);
});

modalClose.onclick = () => modalOverlay.classList.remove('active');
window.onclick = (e) => { if(e.target === modalOverlay) modalOverlay.classList.remove('active'); };

// Initial Load
updateHeaderStats();
switchTab('dashboard');
const styleAddon = document.createElement('style');
styleAddon.innerHTML = `.w-full { width: 100% } .mx-auto { margin-left: auto; margin-right: auto; } .ml-2 { margin-left: 8px; }`;
document.head.appendChild(styleAddon);
