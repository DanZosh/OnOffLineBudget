// LINK THIS IN YOUR INDEX.HTML FILE
//create a global db variable to be used later:
let db

//create and open a new db 
const request = indexedDB.open("budget_db", 1);

//create an Object Store called `pending` within the onupgradeneeded method, this is essentially our schema

request.onupgradeneeded = ({target}) =>{
    console.log({target})
    db = target.result;
    db.createObjectStore("pending", {
        //I'm not adding a keypath (primary key equivalent in SQL) here, but i could here if one was needed.

        autoIncrement:true
    }
        //we dont need to add an index for our objectStore because we're autoIncrementing but if i did it would look like this with the `name`,`property` syntax.
        // , objectStore.createIndex("transactionIDIndex","transactionID") 
            )
}
request.onsuccess = function(event){
    db = event.target.result
        console.log(db)
    if(navigator.online){
        checkDatabase()
    }
}

request.onerror = function(event){
    console.log(event.target.errorCode)
}

//write a function to add records to our object Store. This occurs first, because we want to store all our transactions to our indexedDB. then we run checkDatabase which will update the mongoDB if possible.
function saveRecord(transactionRecord){
    // STEP 1: Open a transaction on my objectStore with read/write capabilities on our `pending` objectStore
       const transaction = db.transaction(["pending"], "readwrite");
    //STEP 2: Connect to the `pending` objectStore in my transaction
       const pendingStore = transaction.objectStore("pending")
    //STEP 3: USE the connection to get all the records from the `pending` objectStore and save it to a variable to be used later
       const getAllRecords = pendingStore.add(transactionRecord);
}

//we want to check if our internet connection is working so we can identify what to do with our user's requests
function checkDatabase () {
     // STEP 1: Open a transaction on my objectStore with read/write capabilities on our `pending` objectStore
    const transaction = db.transaction(["pending"], "readwrite");
    //STEP 2: Connect to the `pending` objectStore in my transaction
    const pendingStore = transaction.objectStore("pending")
    //STEP 3: USE the connection to get all the records from the `pending` objectStore and save it to a variable to be used later
    const getAllRecords = pendingStore.getAll();
        console.log(getAllRecords.result)
        console.log(JSON.stringify(getAllRecords.result))

    //write an event handler for a successful request using the indexedDB `onsuccess` handler:
    getAllRecords.onsuccess = function (event){ //on a successful .getAll()
        if(getAllRecords.result.length > 0 ){ //if the objectStore isn't empty, that means we have pending transactions that have been stored in the indexedDB because we're offline. Use fetch to make a POST of the JSON data found in the object Store to the mongoDatabase using the route described in the api.js file and then clear the objectStore of transactions that haven't yet been posted to our database.
            fetch("/api/transaction/bulk",{
                method: "POST", //this is posting
                body: JSON.stringify(getAllRecords.result), //the body of our data is stringified JSON data consisting of the result of our getAllRecords method to our indexedDB            
            })
            .then((response) => response.json()) //signals a successful POST
            .then(data => console.log(data))
            .then(() =>{
                //if successful, open a transaction on my `pending` objectStore and clear out the data using similar syntax to the checkDatabase function above.
                const transaction = db.transaction(["pending"], "readwrite");
                const pendingStore = transaction.objectStore("pending")
                pendingStore.clear();
            })
        }
    }
}

// Add an eventListener so that if the browser comes back online, we run the checkDatabase function, which will update our database and clear any transactions that have been stored offline in the `pending` object Store
window.addEventListener('online', checkDatabase);