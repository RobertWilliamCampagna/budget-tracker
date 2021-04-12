let transactions = [];
let myChart;

fetch("/api/transaction")
  .then(response => {
    return response.json();
  })
  .then(data => {
    transactions = data;

    populateTotal();
    populateTable();
    populateChart();
  });

function populateTotal() {
  let total = transactions.reduce((total, t) => {
    return total + parseInt(t.value);
  }, 0);

  let totalElement = document.querySelector("#total");
  totalElement.textContent = total;
}

function populateTable() {
  let tableBody = document.querySelector("#tbody");
  tableBody.innerHTML = "";

  transactions.forEach(transaction => {
    let tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${transaction.name}</td>
      <td>${transaction.value}</td>
    `;

    tbody.appendChild(tr);
  });
}

function populateChart() {
  // copy array and reverse it
  let reversed = transactions.slice().reverse();
  let sum = 0;

  // create date labels for chart
  let labels = reversed.map(t => {
    let date = new Date(t.date);
    return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
  });

  // create incremental values for chart
  let data = reversed.map(t => {
    sum += parseInt(t.value);
    return sum;
  });

  if (myChart) {
    myChart.destroy();
  }

  let ctx = document.getElementById("myChart").getContext("2d");

  myChart = new Chart(ctx, {
    type: 'line',
      data: {
        labels,
        datasets: [{
            label: "Total Over Time",
            fill: true,
            backgroundColor: "#6666ff",
            data
        }]
    }
  });
}

function sendTransaction(isAdding) {
  let nameElement = document.querySelector("#t-name");
  let amountElement = document.querySelector("#t-amount");
  let errorElement = document.querySelector(".form .error");

  // validation
  if (nameElement.value === "" || amountElement.value === "") {
    errorElement.textContent = "Missing Information";
    return;
  }
  else {
    errorElement.textContent = "";
  }

  // creating a new record
  let transaction = {
    name: nameElement.value,
    value: amountElement.value,
    date: new Date().toISOString()
  };

  // subracting funds
  if (!isAdding) {
    transaction.value *= -1;
  }

  transactions.unshift(transaction);

  // recalling and repopulation
  populateChart();
  populateTable();
  populateTotal();
  

  fetch("/api/transaction", {
    method: "POST",
    body: JSON.stringify(transaction),
    headers: {
      Accept: "application/json, text/plain, */*",
      "Content-Type": "application/json"
    }
  })
  .then(response => {    
    return response.json();
  })
  .then(data => {
    if (data.errors) {
      errorElement.textContent = "Missing Information";
    }
    else {
      // clear the form
      nameElement.value = "";
      amountElement.value = "";
    }
  })
  .catch(err => {
    saveRecord(transaction);

    nameElement.value = "";
    amountElement.value = "";
  });
}

document.querySelector("#add-btn").onclick = function() {
  sendTransaction(true);
};

document.querySelector("#sub-btn").onclick = function() {
  sendTransaction(false);
};
