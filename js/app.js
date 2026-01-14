document.addEventListener("DOMContentLoaded", function() {
        const STORAGE_KEY = "xpenzExpenses";

    //Define the data storage
    let expenses = [];

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
            li.textContent = `${cat}: $${summary[cat]}`;
            categoryList.appendChild(li);
        }

        return summary;
    }



    function updateDashboard() {
    calculateTotal();
    categorySummary();
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
