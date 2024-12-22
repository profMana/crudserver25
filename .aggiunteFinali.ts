





// 1 : Spostare la porta dentro .env
// config
dotenv.config({ path: ".env" });
const PORT = process.env.PORT
const DBNAME = process.env.DBNAME
const connectionString:string = process.env.connectionStringLocal;
const app = _express();




// 2 : CORS Policy
// Senza le CORS Policy l'accesso da Angular produce un CORS ERROR
const corsOptions = {
    origin: function(origin, callback) {
          return callback(null, true);
    },
    credentials: true
};
app.use("/", cors(corsOptions));






// 3. Accesso all'ID
/*Per come il server è stato strutturato, da per scontato che l'ID sia 
  un objectId valido e lo si converte in new ObjectId(id)
  
  Però con mongo è anche possibile utilizzare degli ID personali come
  2 o "2" (esercizio Angular automobili) e, in questo caso, 
  la conversione in objectId va in errore.
  
  Occorre modificare ovunque la riga precedente nel seguente modo:  */
  
	let id = req["params"].id
    let objId;
	if(ObjectId.isValid(id)) 
		objId = new ObjectId(id)
	else
		objId = id as unknown as ObjectId;	

  // Le routes da aggiornare dovrebbero essere 4:
     get:id
	 deletee:id 
	 patch:id
	 put:id
  
  