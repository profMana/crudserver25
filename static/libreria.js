"use strict";
const _URL =  "" // "http://localhost:1337"
// Se vuota viene assegnata l'origine da cui è stata scaricata la pagina

async function inviaRichiesta(method, url="", params={}) {
	method = method.toUpperCase()	
	let options = {
		"method": method,
		"headers":{},
		"mode": "cors",                  // default
		"cache": "no-cache",             // default
		"credentials": "same-origin",    // default
		"redirect": "follow",            // default
		"referrerPolicy": "no-referrer", // default no-referrer-when-downgrade
		// riduce il timeout rispetto al default (6s) 
		// ma non sembra possibile incrementarlo
		//"signal": AbortSignal.timeout(500) 
    }

	// if(method=="GET") url += "?" + new URLSearchParams(params)
	// Nel caso di parametri di tipo Object (vettori o json), 
	// la riga precedente li trasforma direttamente in urlEncoded,cioè in stringa
	// Ad esempio ["a", "b"] viene trasformato in "a,b"
	// {"name":"a", "res":"b"} viene trasformato in "[object Object]"
	// Invece il codice seguente serializza correttamente tutti i
	// parametri di tipo Object.
	// Lato server bisogna però poi ricordarsi, se il parametro è un Object,
	// di PARSIFICARLO !!!!!
	
	if(method=="GET") {
		const queryParams = new URLSearchParams();
		for (let key in params) {
			let value = params[key];
			if (value && typeof value === "object") 
				queryParams.append(key, JSON.stringify(value));
			else 
				queryParams.append(key, value);
		}
		url += "?" + queryParams.toString()
		// console.log(queryParams.toString())
	}
	else {
		if(params instanceof FormData){
			options.headers["Content-Type"]="multipart/form-data;" 
			options["body"]=params     // Accept FormData, File, Blob
		}
		else{			
			options.headers["Content-Type"]="application/json";  
			options["body"] = JSON.stringify(params)
		}
	}
	
    try{
		const response = await fetch(_URL + url, options)	
		if (!response.ok) {
			let err = await response.text()
			alert(response.status + " - " + err)
			//return false or undefined [automatico]
		} 
		else{
		    let data = await response.json().catch(function(err){
				console.log(err)
			    alert("response contains an invalid json")
				//return false or undefined [automatico]
		    })
			return data;
		}
    }
    catch{ 
	   alert("Connection Refused or Server timeout") 
	   // return false or undefined	[automatico]   
	}
}