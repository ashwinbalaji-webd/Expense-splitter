// console.log("Sanity check!");

fetch("expense.json")
  .then((response) => response.json())
  .then((data) => {
    setTimeout(()=>{
      getExpenseSplit(data);
    },[1000])
  })
  .catch((error) => {
    console.error("Error fetching JSON:", error);
  });

function getExpenseSplit(expenseData) {

  let mainEl = document.getElementById('main');
  let loaderEl = document.getElementById('loader')

  mainEl.classList.remove('cls-hide-display');
  loaderEl.classList.add('cls-hide-display');

  const splitters = Object.keys(expenseData);

  // const splitters = ['Ashwin' , 'Bothraj' , 'Logesh' , 'Ajeesh' , 'Sabari' , 'Ajith' , 'Balaji' , 'Sasikumar' , 'Boopathy' , 'Naveen']

  const splittersCount = splitters.length;

  let split = {};
  let aggregateExpense = 0;

  // Get split details for amount spent by a splitter
  const getSplit = (splitter, sAmount) => {
    let samSplit = {};
    splitters.forEach((subSplitter) => {
      Object.assign({ subSplitter: 0 }, samSplit);
      samSplit[subSplitter] = splitter !== subSplitter ? sAmount : 0;
    });
    return samSplit;
  };

  // Get owe amount details of a splitter to other splitters
  const getOwe = (result) => {
    splitters.forEach((splitter) => {
      Object.entries(result).forEach(([key, value]) => {
        result[splitter].owe[key] =
          value.spent[splitter] > 0 ? -value.spent[splitter] : 0;
        result[splitter].balance[key] =
          splitter === key
            ? 0
            : result[splitter].spent[key] + result[splitter].owe[key];

        result[splitter].ultimateDebt += result[splitter].balance[key];
      });
      aggregateExpense += result[splitter].totalExpense;
    });
    result["AggregateExpense"] = aggregateExpense;
  };

  let result = splitters.reduce((acc, splitter) => {
    let totalExpense = 0;

    expenseData[splitter].forEach((expense) => {
      totalExpense = totalExpense + expense.amount;

      splitAmount = Math.round(totalExpense / splittersCount);
    });

    split = getSplit(splitter, splitAmount);

    acc[splitter] = {
      spent: split,
      owe: {},
      balance: {},
      totalExpense: totalExpense,
      ultimateDebt: 0,
    };
    return acc;
  }, {});

  getOwe(result);

  prepareExpenseTable(result, expenseData);

  // console.log(result);
  console.log("Bullet Pandi : Enna pakra! inga onnum illa..👊🏻");
}

// Prepare expense table with the expense table we have
const prepareExpenseTable = (result, expenseData) => {
  const expenseTable = document.getElementById("expense-table-id");
  const aggregateExpense = document.getElementById("total-amount");

  let counter = -1;

  Object.entries(expenseData).forEach(([key, value]) => {
    value.forEach((expense) => {
      counter += 1;
      if (expense.amount !== 0) {
        const row = document.createElement("tr");
        const cellId = document.createElement("td");
        const spenderCell = document.createElement("td");
        const expenseCategoryCell = document.createElement("td");
        const placeCell = document.createElement("td");
        const amountCell = document.createElement("td");
        const dateCell = document.createElement("td");

        spenderCell.innerText = key;
        cellId.innerText = counter + 1;
        expenseCategoryCell.innerText = expense.category;
        dateCell.innerText = expense.date;
        placeCell.innerText = expense.place;
        amountCell.innerText = `₹ ${expense.amount}`;

        row.appendChild(cellId);
        row.appendChild(spenderCell);
        row.appendChild(expenseCategoryCell);
        row.appendChild(placeCell);
        row.appendChild(dateCell);
        row.appendChild(amountCell);

        expenseTable.appendChild(row);
      }
    });
  });

  aggregateExpense.innerText = `₹ ${result.AggregateExpense}`;

  prepareSplitDetailsTable(result);
};

// Prepare accordion for each splitter to show the split details we prepared 
const prepareSplitDetailsTable = (result) => {
  let accordion = document.getElementById("accordion");

  for (let splitter in result) {
    if (splitter !== "AggregateExpense") {
      if (result.hasOwnProperty(splitter)) {
        let spentDetails = result[splitter].spent;
        let oweDetails = result[splitter].owe;
        let balanceDetails = result[splitter].balance;
        let tExpense = parseInt(result[splitter].totalExpense);
        let uDebt = parseInt(result[splitter].ultimateDebt);

        let card = document.createElement("div");
        card.className = "card";

        let cardHeader = document.createElement("div");
        cardHeader.className = "card-header";
        cardHeader.setAttribute("id", "heading_" + splitter);

        let cardTitle = document.createElement("div");
        cardTitle.className = "mb-0 cls-card-title";

        let cardTitleExpenseElements = document.createElement("div");
        cardTitleExpenseElements.className = "cls-header-expense-element";
        let tExpenseElement = document.createElement("span");
        let uDebtElement = document.createElement("span");

        let expenseEl = document.createElement("span");
        if (tExpense > 0) {
          expenseEl.className = "cls-negative";
        } else if (tExpense < 0) {
          expenseEl.className = "cls-positive";
        }
        expenseEl.innerText = tExpense;
        tExpenseElement.innerText = `Total Expense : ₹ `;
        tExpenseElement.appendChild(expenseEl);

        let debtEl = document.createElement("span");
        if (uDebt > 0) {
          debtEl.className = "cls-negative";
        } else if (uDebt < 0) {
          debtEl.className = "cls-positive";
        }
        debtEl.innerText = uDebt;
        uDebtElement.innerText = `Ultimate Debt : ₹ `;
        uDebtElement.appendChild(debtEl);

        cardTitleExpenseElements.appendChild(tExpenseElement);
        cardTitleExpenseElements.appendChild(uDebtElement);

        let button = document.createElement("button");
        button.className = "btn  btn-link card-btn";
        button.setAttribute("data-toggle", "collapse");
        button.setAttribute("data-target", "#collapse_" + splitter);
        button.setAttribute("aria-expanded", "false");
        button.setAttribute("aria-controls", "collapse_" + splitter);
        iconEl = document.createElement("i");
        iconEl.className = "bi bi-caret-down-fill";

        button.innerText = `${splitter}  `;
        button.appendChild(iconEl);

        // button.addEventListener('click' , ()=>{
        //   console.log(iconEl.classList)
        //   // setTimeout(()=>{
        //   if (button.classList.contains('collapsed')){
        //     iconEl.classList.remove('bi-caret-up-fill');
        //     iconEl.classList.add('bi-caret-down-fill');
        //   }
        //   else{
        //     iconEl.classList.remove('bi-caret-down-fill');
        //     iconEl.classList.add('bi-caret-up-fill');
        //     }
        //   // },100);
        // })

        cardTitle.appendChild(button);
        cardTitle.appendChild(cardTitleExpenseElements);

        cardHeader.appendChild(cardTitle);

        card.appendChild(cardHeader);

        let cardBody = document.createElement("div");
        cardBody.id = "collapse_" + splitter;
        cardBody.className = "collapse card-body";
        cardBody.setAttribute("aria-labelledby", "heading_" + splitter);

        let splitTable = document.createElement("table");
        splitTable.className = "split-table";

        let tSplitHead = document.createElement("thead");
        let trSplitHead = document.createElement("tr");

        let emptyHead = document.createElement("th");

        trSplitHead.appendChild(emptyHead);

        for (let spender in result) {
          if (spender !== "AggregateExpense") {
            let th = document.createElement("th");
            th.innerText = spender;

            trSplitHead.appendChild(th);
          }
        }

        tSplitHead.appendChild(trSplitHead);

        splitTable.appendChild(tSplitHead);

        let tBody = document.createElement("tbody");

        let spentTr = prepareTableRowData(splitter, spentDetails, "spent");
        let oweTr = prepareTableRowData(splitter, oweDetails, "owe");
        let balanceTr = prepareTableRowData(
          splitter,
          balanceDetails,
          "balance"
        );

        tBody.appendChild(spentTr);
        tBody.appendChild(oweTr);
        tBody.appendChild(balanceTr);

        splitTable.appendChild(tBody);

        cardBody.appendChild(splitTable);

        card.appendChild(cardBody);

        accordion.appendChild(card);
      }
    }
  }
};

// Prepare table row data inside the split table
const prepareTableRowData = (spender, details, type) => {
  let tr = document.createElement("tr");
  let bodyHeadTh = document.createElement("th");

  if (type === "spent") {
    bodyHeadTh.innerText = "Spent";
    tr.appendChild(bodyHeadTh);
  } else if (type === "owe") {
    bodyHeadTh.innerText = "Owe";
    tr.appendChild(bodyHeadTh);
  } else if (type === "balance") {
    bodyHeadTh.innerText = "Debt";
    tr.appendChild(bodyHeadTh);
  }

  for (let splitter in details) {
    let td = document.createElement("td");

    if (spender !== splitter) {
      td.innerText = `₹ ${details[splitter]}`;

      let amount = parseInt(details[splitter]);

      if (amount > 0) {
        td.className = "cls-negative";
      } else if (amount < 0) {
        td.className = "cls-positive";
      }
    } else {
      td.innerText = "-";
    }

    tr.appendChild(td);
  }

  return tr;
};
