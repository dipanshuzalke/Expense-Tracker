const EXPENSE_LIMITS = {
    food: 1000,
    education: 5000,
    shopping: 2000,
    entertainment: 700,
    others: 5000,
    total: 20000 // Overall limit
};

// Initialize the pie chart
let ctx = document.getElementById('expenseChart').getContext('2d');
let expenseChart = new Chart(ctx, {
    type: 'pie',
    data: {
        labels: ['Food', 'Education', 'Shopping', 'Entertainment', 'Others', 'Remaining Limit'],
        datasets: [{
            label: 'Expense Breakdown',
            data: [0, 0, 0, 0, 0, EXPENSE_LIMITS.total], 
            backgroundColor: [
                'rgba(255, 99, 132, 0.7)',
                'rgba(54, 162, 235, 0.7)',
                'rgba(255, 206, 86, 0.7)',
                'rgba(75, 192, 192, 0.7)',
                'rgba(153, 102, 255, 0.7)',
                'rgba(192, 192, 192, 0.7)'
            ]
        }]
    },
    options: {
        responsive: true,
        plugins: {
            legend: { position: 'top' }
        }
    }
});

// Update pie chart function
function updateChart(food, education, shopping, entertainment, others) {
    const totalExpenses = food + education + shopping + entertainment + others;
    const remainingLimit = Math.max(0, EXPENSE_LIMITS.total - totalExpenses);
    expenseChart.data.datasets[0].data = [food, education, shopping, entertainment, others, remainingLimit];
    expenseChart.update();
}

// Calculate total expense by summing subcategories and automatically update parent
function updateParentExpense(expenseId, subcategoryIds) {
    let totalExpense = 0;
    subcategoryIds.forEach(id => {
        totalExpense += parseFloat(document.getElementById(id).value) || 0;
    });
    document.getElementById(expenseId).value = totalExpense;
}

// Calculate total expense and return the value
function calculateExpenseTotal(expenseId, subcategoryIds) {
    let parentExpense = parseFloat(document.getElementById(expenseId).value) || 0;
    subcategoryIds.forEach(id => {
        parentExpense += parseFloat(document.getElementById(id).value) || 0;
    });
    return parentExpense;
}

// Check if expenses exceed limits
function checkIndividualLimits(food, education, shopping, entertainment, others) {
    if (food > EXPENSE_LIMITS.food) alert(`Food expense exceeded $${EXPENSE_LIMITS.food}`);
    if (education > EXPENSE_LIMITS.education) alert(`Education expense exceeded $${EXPENSE_LIMITS.education}`);
    if (shopping > EXPENSE_LIMITS.shopping) alert(`Shopping expense exceeded $${EXPENSE_LIMITS.shopping}`);
    if (entertainment > EXPENSE_LIMITS.entertainment) alert(`Entertainment expense exceeded $${EXPENSE_LIMITS.entertainment}`);
    if (others > EXPENSE_LIMITS.others) alert(`Other expenses exceeded $${EXPENSE_LIMITS.others}`);
}

// On form submit
document.getElementById('expense-form').addEventListener('submit', function (e) {
    e.preventDefault();

    const income = parseFloat(document.getElementById('income').value);

    const foodExpense = calculateExpenseTotal('food-expense', ['groceries', 'dining-out']);
    const educationExpense = calculateExpenseTotal('education-expense', ['books', 'tuition']);
    const shoppingExpense = calculateExpenseTotal('shopping-expense', ['clothing', 'accessories']);
    const entertainmentExpense = calculateExpenseTotal('entertainment-expense', ['movies', 'games']);
    const othersExpense = calculateExpenseTotal('others-expense', ['transport', 'miscellaneous']);

    const totalExpenses = foodExpense + educationExpense + shoppingExpense + entertainmentExpense + othersExpense;
    const savings = income - totalExpenses;

    document.getElementById('food-expense-amount').textContent = foodExpense;
    document.getElementById('education-expense-amount').textContent = educationExpense;
    document.getElementById('shopping-expense-amount').textContent = shoppingExpense;
    document.getElementById('entertainment-expense-amount').textContent = entertainmentExpense;
    document.getElementById('others-expense-amount').textContent = othersExpense;
    document.getElementById('savings-amount').textContent = savings;

    checkIndividualLimits(foodExpense, educationExpense, shoppingExpense, entertainmentExpense, othersExpense);

    updateChart(foodExpense, educationExpense, shoppingExpense, entertainmentExpense, othersExpense);

    const week = 'Week ' + (document.querySelectorAll('#weekly-expense-table tbody tr').length + 1);
    saveWeeklyExpenses(week, foodExpense, educationExpense, shoppingExpense, entertainmentExpense, othersExpense, savings);

    loadWeeklyExpenses();

    // Clear form inputs after submission
    document.getElementById('expense-form').reset();
});

// Save weekly expenses in localStorage
function saveWeeklyExpenses(week, foodExpense, educationExpense, shoppingExpense, entertainmentExpense, othersExpense, savings) {
    let weeklyExpenses = JSON.parse(localStorage.getItem('weeklyExpenses')) || [];
    weeklyExpenses.push({ week, food: foodExpense, education: educationExpense, shopping: shoppingExpense, entertainment: entertainmentExpense, others: othersExpense, savings });
    localStorage.setItem('weeklyExpenses', JSON.stringify(weeklyExpenses));
}

// Load weekly expenses from localStorage
function loadWeeklyExpenses() {
    const weeklyExpenses = JSON.parse(localStorage.getItem('weeklyExpenses')) || [];
    const tableBody = document.querySelector('#weekly-expense-table tbody');
    tableBody.innerHTML = '';
    weeklyExpenses.forEach((expense, index) => {
        const row = `<tr>
                        <td>${expense.week}</td>
                        <td>${expense.food}</td>
                        <td>${expense.education}</td>
                        <td>${expense.shopping}</td>
                        <td>${expense.entertainment}</td>
                        <td>${expense.others}</td>
                        <td>${expense.savings}</td>
                        <td><button class="delete-btn" data-index="${index}">Delete</button></td>
                    </tr>`;
        tableBody.innerHTML += row;
    });

    document.querySelectorAll('.delete-btn').forEach(button => {
        button.addEventListener('click', function () {
            deleteWeeklyExpense(this.dataset.index);
        });
    });
}

// Delete a weekly expense
function deleteWeeklyExpense(index) {
    let weeklyExpenses = JSON.parse(localStorage.getItem('weeklyExpenses')) || [];
    weeklyExpenses.splice(index, 1);
    localStorage.setItem('weeklyExpenses', JSON.stringify(weeklyExpenses));
    loadWeeklyExpenses();
}

// Load weekly expenses when the page loads
window.onload = function () {
    loadWeeklyExpenses();

    // Automatically update parent expenses when subcategories change
    document.querySelectorAll('.subcategories input').forEach(input => {
        input.addEventListener('input', function () {
            if (this.id === 'groceries' || this.id === 'dining-out') {
                updateParentExpense('food-expense', ['groceries', 'dining-out']);
            } else if (this.id === 'books' || this.id === 'tuition') {
                updateParentExpense('education-expense', ['books', 'tuition']);
            } else if (this.id === 'clothing' || this.id === 'accessories') {
                updateParentExpense('shopping-expense', ['clothing', 'accessories']);
            } else if (this.id === 'movies' || this.id === 'games') {
                updateParentExpense('entertainment-expense', ['movies', 'games']);
            } else if (this.id === 'transport' || this.id === 'miscellaneous') {
                updateParentExpense('others-expense', ['transport', 'miscellaneous']);
            }
        });
    });
};
