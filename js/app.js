document.addEventListener("DOMContentLoaded", function() {
    const STORAGE_KEY = "xpenzExpenses";
    const MONTHLY_LIMIT = 50000;

    //Define the data storage
    let expenses = [];

    let categoryChart = null;
    let monthlyChart = null;


    //Save to Local Storage
    function saveExpenses(){
        localStorage.setItem(STORAGE_KEY,JSON.stringify(expenses));
    }

    //Load from Local Storage
    function loadExpenses(){
        const storedData = localStorage.getItem(STORAGE_KEY);
        expenses = storedData ? JSON.parse(storedData) : [];

    }

    //Select DOM elements
    const form = document.querySelector("form");
    const dateInput = document.getElementById("date");
    const categoryInput = document.getElementById("category");
    const descriptionInput = document.getElementById("description");
    const amountInput = document.getElementById("amount");
    const tableBody = document.querySelector("tbody");

    //Listen for form submit
    form.addEventListener("submit",function(e){
        e.preventDefault(); //prevent page reload

        addExpense();
    })

    //Validate User Input
    function validateInput(amount,category,date){
        if(amount <= 0){
            alert("Amount must be greater than 0");
            return false;
        }

        if(!category){
            alert("Please select a category");
            return false;
        }

        if(!date){
            alert("Please select a date");
            return false;
        }

        return true;
    }

    //Add Expense to Array
    function addExpense(){
        const amount = Number(amountInput.value);
        const category = categoryInput.value;
        const date = dateInput.value;
        const description = descriptionInput.value;
        
        //Validation
        if(!validateInput(amount,category,date)){
            return;
        }

        //Create expense object
        const expense = {
            id: Date.now(),
            amount,
            category,
            date,
            description
        };

        //Store in array
        expenses.push(expense);

        //Save Expenses
        saveExpenses();

        //Update UI
        renderExpenses();

        //Clear form
        form.reset();
        amountInput.focus();
    }

    //Render Expense Table - Update UI
    function renderExpenses(){
        tableBody.innerHTML = "";//Clear existing rows

        if (expenses.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="5">No expenses yet</td></tr>`;
            updateDashboard();
            return;
        }

        //Loop through expenses array
        expenses.forEach(function(expense){
            const row = document.createElement("tr");
            row.innerHTML = `
            <td>${expense.amount}</td>
            <td>${expense.category}</td>
            <td>${expense.date}</td>
            <td>${expense.description}</td>
            <td>
                <button onclick="deleteExpense(${expense.id})">Delete</button>
            </td>
            `;
            tableBody.appendChild(row);
        });

        updateDashboard();//Update totals whenever table renders

    }

    function calculateTotal(){
        let total = expenses.reduce((sum,exp) => sum + Number(exp.amount),0);

        document.getElementById('totalAmount').textContent = total;
    }


    function categorySummary(){
        const summary = {};
        expenses.forEach(exp => {
            if(summary[exp.category]){
                summary[exp.category] += Number(exp.amount);
            }else{
                summary[exp.category] = Number(exp.amount);
            }
        });

        //Update HTML list
        const categoryList = document.getElementById('categoryList');
        categoryList.innerHTML = "";

        for(let cat in summary){
            const li = document.createElement('li');
            li.textContent = `${cat}: ${summary[cat]}`;
            categoryList.appendChild(li);
        }

        return summary;
    }

    function updateInsight(){
        const insightBox = document.getElementById("insightBox");
        const summary = categorySummary();
        const {maxCategory,maxAmount} = getHighestSpendingCategory(summary);

        if(!maxCategory){
            insightBox.textContent = "No expenses recorded yet.";
            insightBox.style.color = "gray";
            return;
        }

        let message = `Highest spending category: ${maxCategory} (Rs. ${maxAmount})`;

        if (maxAmount > MONTHLY_LIMIT) {
            message += " Spending limit exceeded!";
            insightBox.style.color = "red";
        } else {
            insightBox.style.color = "darkred";
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

        return {maxCategory,maxAmount};
    }

    function renderCategoryChart(summary){
        const labels = Object.keys(summary);
        const data = Object.values(summary);

        if(categoryChart){
            categoryChart.destroy();
        }

        categoryChart = new Chart(document.getElementById("categoryChart"),{
            type: "pie",
            data:{
                labels: labels,
                datasets: [{
                    data: data
                }]
            }
        })
    }

    function getMonthlySummary(){
        const monthly = {};

        expenses.forEach(exp => {
            const month = new Date(exp.date).toLocaleString('default',{
                month: 'short'
            });

            if(monthly[month]){
                monthly[month] += Number(exp.amount);
            }else{
                monthly[month] = Number(exp.amount);
            }
        });

        return monthly;
    }

    function renderMonthlyChart(monthlyData){
        if(monthlyChart){
            monthlyChart.destroy();
        }

        monthlyChart = new Chart(document.getElementById("monthlyChart"),{
            type: "bar",
        data: {
            labels: Object.keys(monthlyData),
            datasets: [{
                data: Object.values(monthlyData)
            }]
        }
        });
    }

    function updateDashboard() {
        calculateTotal();

        const categoryData = categorySummary();
        renderCategoryChart(categoryData);

        const monthlyData = getMonthlySummary();
        renderMonthlyChart(monthlyData);

        updateInsight();

        if (expenses.length === 0) {
        if (categoryChart) categoryChart.destroy();
        if (monthlyChart) monthlyChart.destroy();
        return;
    }

    }


    window.deleteExpense = function(id){
        expenses = expenses.filter(exp => exp.id!== id);
        saveExpenses();
        renderExpenses();
    }

loadExpenses();
renderExpenses();
amountInput.focus();

});
