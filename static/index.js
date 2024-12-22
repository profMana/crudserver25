"use strict"
$(document).ready(function() {
    let divIntestazione = $("#divIntestazione");
    let divFilters = $(".card").eq(0);
    let divCollections = $("#divCollections");
    let table = $("#mainTable");
    let divDettagli = $("#divDettagli");
    let currentCollection = "";

    divFilters.hide();
	$("#lstHair").prop("selectedIndex", -1);
    $("#btnAdd").prop("disabled", true);

    /* ******************** start from here ************************** */		
    getCollections();
    async function getCollections() {
        let data = await inviaRichiesta("GET", "/api/getCollections");
        if(data) {
            console.log(data);
            let label = divCollections.children("label");
            data.forEach((collection, i) => {
                let clonedLabel = label.clone().appendTo(divCollections);
                clonedLabel.children("span").text(collection.name);
                clonedLabel.children("input:radio").on("click", function() {
                    currentCollection = collection.name;
                    $("#btnAdd").prop("disabled", false);
                    getDataCollection();
                });
            });
            label.remove();
        }
    }

    $("#btnFind").on("click", () => {
        let hair = $("#lstHair").val();
        let gender = "";
        if(divFilters.find("input:checkbox:checked").length == 1)
            gender = divFilters.find("input:checkbox:checked").val();

        let filters = {};
        if(hair)
            filters["hair"] = hair.toLowerCase();
        if(gender)
            filters["gender"] = gender.toLowerCase();
        getDataCollection(filters);
    });

    $("#btnAdd").on("click", () => {
        divDettagli.empty();
        $("<textarea>").appendTo(divDettagli)
		               .prop("placeholder", '{"name": "Pippo"}');
        $("<button>").addClass("btn btn-success btn-sm").appendTo(divDettagli)
		             .text("invia").on("click", async function() {
            let newRecord = divDettagli.children("textarea").val();
            try {  newRecord = JSON.parse(newRecord);   } 
			catch (error) {
                alert(`JSON non valido:\n${error}`); return;  }
            let data=await inviaRichiesta("POST", `/api/${currentCollection}`, 
			                                      newRecord)
            if(data) {
                console.log(data);
                alert("Record inserito correttamente");
                getDataCollection();
            }
        });
        $("<button>").addClass("btn btn-secondary btn-sm")
			.appendTo(divDettagli)
			.text("annulla").on("click", function() {
				divDettagli.empty()			 
		})
    });
	
    async function getDataCollection(filters = {}) {
        let data =await inviaRichiesta("GET",`/api/${currentCollection}`,filters)
        if(data) {
            console.log(data);
            divIntestazione.find("strong").eq(0).text(currentCollection);
            divIntestazione.find("strong").eq(1).text(data.length);
            let _tbody = table.children("tbody");
            _tbody.empty();
            data.forEach((item, i) => {
                let tr = $("<tr>").appendTo(_tbody);
                $("<td>").appendTo(tr).text(item._id).on("click", function() {
                    getDetails(item._id);
                });
				let key = Object.keys(item)[1]
                $("<td>").appendTo(tr).text(item[key]).on("click", function() {
                    getDetails(item._id);
                });
				// pulsantini
                let td = $("<td>").appendTo(tr);
                $("<div>").appendTo(td).on("click", function() {
					getDetails(item._id, "PATCH")
				})
                $("<div>").appendTo(td).on("click", function() {
					putRecord(item._id)
				})
                $("<div>").appendTo(td).on("click", function() {
					deleteRecord(item._id)
				})
            });
            if(currentCollection == "unicorns")
                divFilters.show();
            else
            {
                divFilters.hide();
                divFilters.find("input:checkbox").prop("checked", false);
                $("#lstHair").prop("selectedIndex", -1);
            }
            divDettagli.empty();
        }
    }


    // Lo usiamo sia per la GET sia per la PATCH
	// La PATCH all'avvio deve richiedere i dati al server e visualizzarli
	async function getDetails(_id, method="GET") {
        let data = await inviaRichiesta("GET",`/api/${currentCollection}/${_id}`)
        if(data) {
            divDettagli.empty();
			if(method=="GET") {
				for(let key in data) {
					$("<strong>").appendTo(divDettagli).text(`${key}: `);
					$("<span>").appendTo(divDettagli)
							   .text(JSON.stringify(data[key]))
					$("<br>").appendTo(divDettagli);
				}
			}
			else {  // PATCH
				delete(data["_id"])
				// Imposto altezza textArea al valore del contenuto
				let textArea = $("<textarea>").appendTo(divDettagli)
		        textArea.val((JSON.stringify(data, null, 2)))
				// non siamo in una fn di evento, per cui this NON è utilizzabile   
				textArea.css("height", textArea.get(0).scrollHeight + "px")






					   
				$("<button>").addClass("btn btn-success btn-sm")
					.appendTo(divDettagli)
		            .text("invia").on("click", async function() {
						let newRecord = textArea.val();
						try {  newRecord = JSON.parse(newRecord);   } 
						catch (error) {
							alert(`JSON non valido:\n${error}`); return;  }
						let data=await inviaRichiesta("PATCH", 
						       `/api/${currentCollection}/${_id}`, newRecord)
						if(data){
							console.log(data);
							alert("Record aggiornato correttamente")
							getDataCollection()
						}
				})
				$("<button>").addClass("btn btn-secondary btn-sm")
					.appendTo(divDettagli)
					.text("annulla").on("click", function() {
						divDettagli.empty()			 
				})								
			}
		}
	}


	async function deleteRecord(_id) {
		if (confirm("vuoi veramente cancellare il record " + _id + "?")) {
			let data = await inviaRichiesta("DELETE",
                                         "/api/"+currentCollection+"/"+_id)
            if(data) {
				console.log(data);
				alert("Record rimosso correttamente")
				getDataCollection()
			}
		}
	}	


    async function putRecord(_id) {
        divDettagli.empty();
		let textArea = $("<textArea>").appendTo(divDettagli)
		               .val('{"$inc":{"vampires": 2}}');
					   
        $("<button>").addClass("btn btn-success btn-sm")
			.appendTo(divDettagli)
		    .text("invia").on("click", async function() {
				let action = divDettagli.children("textarea").val();
				try {  action = JSON.parse(action);   } 
				catch (error) {
					alert(`JSON non valido:\n${error}`); return;  }

				let data = await inviaRichiesta("PUT", 
				           "/api/"+currentCollection+"/"+_id, action)
				if(data) {
					console.log(data);
					alert("Operazione eseguita correttamente")
					getDataCollection()
				}
		})
		$("<button>").addClass("btn btn-secondary btn-sm")
			.appendTo(divDettagli)
			.text("annulla").on("click", function() {
				divDettagli.empty()			 
		})
	}
	
});