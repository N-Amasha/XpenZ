document.addEventListener("DOMContentLoaded", function() {
    const STORAGE_KEY = "xpenzExpenses";
    const MONTHLY_LIMIT = 50000;

    // Define the data storage
    let expenses = [];
    let categoryChart = null;
    let monthlyChart = null;

    // Theme Colors for Charts
    const ACCENT_GREEN = '#22c55e';
    const CHART_COLORS = ['#22c55e', '#4ade80', '#16a34a', '#86efac', '#14532d'];

    // Save to Local Storage
    function saveExpenses(){
        localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
    }

    // Load from Local Storage
    function loadExpenses(){
        const storedData = localStorage.getItem(STORAGE_KEY);
        expenses = storedData ? JSON.parse(storedData) : [];
    }

    const form = document.querySelector("form");
    const dateInput = document.getElementById("date");
    const categoryInput = document.getElementById("category");
    const descriptionInput = document.getElementById("description");
    const amountInput = document.getElementById("amount");
    const tableBody = document.querySelector("tbody");

    form.addEventListener("submit", function(e){
        e.preventDefault();
        addExpense();
    });

    function validateInput(amount, category, date){
        if(amount <= 0){
            alert("Amount must be greater than 0");
            return false;
        }
        if(!category || !date) {
            alert("Please fill in all required fields");
            return false;
        }
        return true;
    }

    function addExpense(){
        const amount = Number(amountInput.value);
        const category = categoryInput.value;
        const date = dateInput.value;
        const description = descriptionInput.value;
        
        if(!validateInput(amount, category, date)) return;

        const expense = {
            id: Date.now(),
            amount,
            category,
            date,
            description
        };

        expenses.push(expense);
        saveExpenses();
        renderExpenses();
        form.reset();
        amountInput.focus();
    }

    function renderExpenses(){
        tableBody.innerHTML = "";

        if (expenses.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:#94a3b8;">No expenses yet</td></tr>`;
            updateDashboard();
            return;
        }

        expenses.forEach(function(expense){
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${expense.amount}</td>
                <td style="text-transform: capitalize;">${expense.category}</td>
                <td>${expense.date}</td>
                <td>${expense.description}</td>
                <td>
                    <button class="btn-delete" onclick="deleteExpense(${expense.id})">Delete</button>
                </td>
            `;
            tableBody.appendChild(row);
        });

        updateDashboard();
    }

    function calculateTotal(){
        let total = expenses.reduce((sum, exp) => sum + Number(exp.amount), 0);
        document.getElementById('totalAmount').textContent = "Rs. " + total.toLocaleString();
    }

    function categorySummary(){
        const summary = {};
        expenses.forEach(exp => {
            summary[exp.category] = (summary[exp.category] || 0) + Number(exp.amount);
        });

        const categoryList = document.getElementById('categoryList');
        categoryList.innerHTML = "";

        for(let cat in summary){
            const li = document.createElement('li');
            li.innerHTML = `

            <span style="text-transform: capitalize;">${cat}</span> 
            <span>Rs. ${summary[cat].toLocaleString()}</span>`;

            categoryList.appendChild(li);
        }
        return summary;
    }

    function updateInsight(){
        const insightBox = document.getElementById("insightBox");
        const summary = categorySummary();
        const {maxCategory, maxAmount} = getHighestSpendingCategory(summary);

        if(!maxCategory){
            insightBox.textContent = "";
            return;
        }

        let message = `Highest spending: ${maxCategory} (Rs.${maxAmount})`;
        
        // Dynamic styling for insights
        if (maxAmount > MONTHLY_LIMIT) {
            message += " - Limit Exceeded!";
            insightBox.style.color = "#ef4444"; // Red for danger
        } else {
            insightBox.style.color = "#22c55e"; // Green for okay
        }

        insightBox.textContent = message;
    }

    function getHighestSpendingCategory(summary){
        let maxCategory = null;
        let maxAmount = 0;
        for(let category in summary){
            if(summary[category] > maxAmount){
                maxAmount = summary[category];
                maxCategory = category;
            }
        }
        return {maxCategory, maxAmount};
    }

    // Styled Category Chart
    function renderCategoryChart(summary){
        if(categoryChart) categoryChart.destroy();
        
        const ctx = document.getElementById("categoryChart");
        categoryChart = new Chart(ctx, {
            type: "doughnut",
            data: {
                labels: Object.keys(summary),
                datasets: [{
                    data: Object.values(summary),
                    backgroundColor: CHART_COLORS,
                    borderColor: '#1e293b',
                    borderWidth: 2
                }]
            },
            options: {
                plugins: {
                    legend: { labels: { color: '#f8fafc' } }
                }
            }
        });
    }

    function getMonthlySummary(){
        const monthly = {};
        expenses.forEach(exp => {
            const month = new Date(exp.date).toLocaleString('default', { month: 'short' });
            monthly[month] = (monthly[month] || 0) + Number(exp.amount);
        });
        return monthly;
    }

    // Styled Monthly Chart
    function renderMonthlyChart(monthlyData){
        if(monthlyChart) monthlyChart.destroy();

        const ctx = document.getElementById("monthlyChart");
        monthlyChart = new Chart(ctx, {
            type: "bar",
            data: {
                labels: Object.keys(monthlyData),
                datasets: [{
                    label: 'Monthly Spending',
                    data: Object.values(monthlyData),
                    backgroundColor: ACCENT_GREEN,
                    borderRadius: 5
                }]
            },
            options: {
                scales: {
                    y: { ticks: { color: '#94a3b8' }, grid: { color: '#334155' } },
                    x: { ticks: { color: '#94a3b8' }, grid: { display: false } }
                },
                plugins: {
                    legend: { labels: { color: '#f8fafc' } }
                }
            }
        });
    }

    function updateDashboard() {
        calculateTotal();
        const categoryData = categorySummary();
        const monthlyData = getMonthlySummary();

        if (expenses.length > 0) {
            renderCategoryChart(categoryData);
            renderMonthlyChart(monthlyData);
        } else {
            if (categoryChart) categoryChart.destroy();
            if (monthlyChart) monthlyChart.destroy();
        }
        updateInsight();
    }

    window.deleteExpense = function(id){
        expenses = expenses.filter(exp => exp.id !== id);
        saveExpenses();
        renderExpenses();
    }

    loadExpenses();
    renderExpenses();
    amountInput.focus();
});