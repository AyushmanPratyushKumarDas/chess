const express =  require("express");
const socket  = require("socket.io");
const http = require("http");
const {Chess} = require("chess.js");
const path = require("path");
const { log } = require("console");

const app = express();

const server = http.createServer(app);
const io =socket(server);

 const chess = new Chess();//for chess rules
 let players = {};
 let currrentplayer = "w";

 app.set("view engine","ejs");
 app.use(express.static(path.join(__dirname,"public")));

 app.get("/",(req,res)=>{
    res.render("index",{title:"chess game"});
 });

 io.on("connection", (uniquesocket)=>{
   console.log("connected");

   if(!players.white){
      players.white = uniquesocket.id;
      uniquesocket.emit("playerRole","w");
   }
   else if(!players.black){
      players.black = uniquesocket.id;
      uniquesocket.emit("playerRole","b");
   }
   else{
      uniquesocket.emit("spectatorRole");
   }

   uniquesocket.on("disconnect",()=>{
      if(uniquesocket.id === players.black){
         delete players.black;
      }
      else if(uniquesocket.id === players.white){
         delete players.white;
      }
   });
   uniquesocket.on("move",(move)=>{
      try{
         if(chess.turn()=== "w" && uniquesocket.id !== players.white) return;
         if(chess.turn()=== "b" && uniquesocket.id !== players.black) return;
   
         const result = chess.move(move);
         
         if(result){
            currrentplayer = chess.turn();
            io.emit("move", move);
            io.emit("boardState",chess.fen())//send current state of board to frontend
         }
         else{
            console.log("invalid move: ",move);
            uniquesocket.emit("invalidMove: ",move);
         }
      }
      catch(err){
         console.log(err);
         uniquesocket.emit("invalid move : ",move);
      }
   })
 });
 


 server.listen(3000,()=>{
   console.log("listening to port 3000");
 });