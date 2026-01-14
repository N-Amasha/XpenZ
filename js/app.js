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
        //Clear existing rows
        tableBody.innerHTML = "";

        //Loop through expenses array
        expenses.forEach(function(expense){
            const row = document.createElement("tr");
            row.innerHTML = `
            <td>${expense.amount}</td>
            <td>${expense.category}</td>
            <td>${expense.date}</td>
            <td>${expense.description}</td>
            `;
            tableBody.appendChild(row);
        })
    }


loadExpenses();
renderExpenses();
amountInput.focus();

});
