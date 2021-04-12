let db;
const request = indexedDB.open('budget_tracker', 1);

request.onupgradeneeded = function(e) {
    const db = e.target.result;
    db.createObjectStore('process', { autoIncrement: true });
};
// Upon success
request.onsuccess = function(e) {
   db = e.target.result;
   
    if (navigator.onLine) {
        returnData();
    }
};
request.onerror = function(e) {
    console.log(e.target.errorCode);
};

// Saving a transaction
function saveRecord(record) {
    const transaction = db.transaction(['process'], 'readwrite');
    const dataStore = transaction.objectStore('process');
    dataStore.add(record);
}
// function that will handle collecting all data from the pending object store in IndexedDB and post it to the server
function returnData() {
    const transaction = db.transaction(['process'], 'readwrite');
    const dataStore = transaction.objectStore('process');
    const getAll = dataStore.getAll();
    getAll.onSuccess = function() {
        // If data in indexedDb's store, send it to api server
        if (getAll.result.length > 0) {
            fetch('/api/transaction/bulk', {
              method: 'POST'  ,
              body: JSON.stringify(getAll.result),
              headers: {
                  Accept: 'application/json, text/plain, */*',
                  'Content-Type': 'application/json'
                }
            })
            .then(response => response.json())
            .then(serverResponse => {
                if (serverResponse.message) {
                  throw new Error(serverResponse);
                }
                const transaction = db.transaction(['process'], 'readwrite');
                const dataStore = transaction.objectStore('process');
                dataStore.clear();
            })
        }
    }
}

window.addEventListener('online', returnData);