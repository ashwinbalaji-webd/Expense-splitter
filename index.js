console.log("Sanity check!");

fetch("expense.json")
  .then((response) => response.json())
  .then((data) => {
    getExpenseSplit(data);
  })
  .catch((error) => {
    console.error("Error fetching JSON:", error);
  });

function getExpenseSplit(expenseData) {
  const splitters = Object.keys(expenseData);

  // const splitters = ['Ashwin' , 'Bothraj' , 'Logesh' , 'Ajeesh' , 'Sabari' , 'Ajith' , 'Balaji' , 'Sasikumar' , 'Boobathy' , 'Naveen']

  // console.log("splitters--->", splitters);

  const splittersCount = splitters.length;

  let split = {};
  let aggregateExpense = 0;

  const getSplit = (splitter, sAmount) => {
    let samSplit = {};
    splitters.forEach((subSplitter) => {
      if (subSplitter !== splitter) {
        Object.assign({ subSplitter: 0 }, samSplit);
        samSplit[subSplitter] = splitter !== subSplitter ? sAmount : 0;
      }
    });
    return samSplit;
  };

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

  prepareDOM(result, expenseData);

  console.log(result);
}

const prepareDOM = (result, expenseData) => {
  const expenseTable = document.getElementById("expense-table-id");
  const aggregateExpense = document.getElementById("total-amount");

  Object.entries(expenseData).forEach(([key, value], index) => {
    // console.log(value)
    value.forEach((expense , index) => {
      if (expense.amount !== 0) {
        const row = document.createElement("tr");
        const cellId = document.createElement("td");
        const spenderCell = document.createElement("td");
        const expenseCategoryCell = document.createElement("td");
        const placeCell = document.createElement("td");
        const amountCell = document.createElement("td");
        const dateCell = document.createElement("td");

        spenderCell.innerText = key;
        cellId.innerText = index + 1;
        expenseCategoryCell.innerText = expense.category;
        dateCell.innerText = expense.date;
        placeCell.innerText = expense.place;
        amountCell.innerText = `₹ ${expense.amount}`;

        row.appendChild(cellId);
        row.appendChild(spenderCell);
        row.appendChild(expenseCategoryCell);
        row.appendChild(dateCell);
        row.appendChild(placeCell);
        row.appendChild(amountCell);

        expenseTable.appendChild(row);
      }
    });
  });

  aggregateExpense.innerText = `₹ ${result.AggregateExpense}`;
};
