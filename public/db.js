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
        autoIncrement:true
    })
    console.log("success")

}