/**
 * Websocket for card game test
 */
import Constant from "./const.js"
import {WebSocketServer} from 'ws';
import url from 'url';
import Actioner from "./actioner.js";

var parent = {
    Constant: Constant
}

const webSocketServer = new WebSocketServer({ port: Constant.PORT },()=>{
    console.log(`websocket started on port : ${Constant.PORT}`);
});

webSocketServer.broadcastExceptSender = function(data, sender) {
   webSocketServer.clients.forEach(function(client) {
      if (client !== sender) {
         logger("index.js","Broadcast to client with message : "+data);
         client.send(data);
      }
   })
}

webSocketServer.broadcast = function(data) {
    webSocketServer.clients.forEach(function(client) {
        client.send(data);
    })
    console.log(`Sent : ${data} to all player`);
 }

webSocketServer.sendById = function(data, id) {
   webSocketServer.clients.forEach((client) => {
      if (client.id == id) {
         logger("index.js","Broadcast to client id : "+id+" with message : "+data);
         client.send(data);
      }
   })
}

webSocketServer.checkNameExist = function(ws, name) {
    let result = false;
    webSocketServer.clients.forEach((client) => {
        if (client !== ws && client.name == name) {
            console.log(`${name} already exist`);
            result = true;
        }
    })
    return result;
}

webSocketServer.getPlayerCount = function() {
    return webSocketServer.clients.size;
}

parent.webSocketServer = webSocketServer;
const parentActioner = new Actioner(parent);

webSocketServer.on('connection', function connection(ws,req) {
   console.log("Connection with a client established");
   const parameters = url.parse(req.url, true);
    if (parameters.query.name){
        ws.name = parameters.query.name;
        console.log(`Client connected as name : ${ws.name}`);
        if (webSocketServer.checkNameExist(ws,ws.name)) {
            ws.close();
            return;
        }
        if (webSocketServer.getPlayerCount() > Constant.MAX_PLAYER) {
            console.log(`Client disconnected due to exceed maximum player of ${constant.MAX_PLAYER}`);
            ws.close();
            return;
        }
        Constant.PLAYER_LIST.push(ws.name);
        console.log(`Current Player : ${Constant.PLAYER_LIST}`);

        webSocketServer.broadcast('game:player_joined');
        if (webSocketServer.getPlayerCount() === Constant.MAX_PLAYER) {
            setTimeout(function(){
                webSocketServer.broadcast('game:started');
                webSocketServer.broadcast(`game:player_list;value:${Constant.PLAYER_LIST}`);
                parentActioner.nextTurn();
            }, 3000);
        }

        ws.on('message', (data, isBinary) => {
            data = isBinary ? data : data.toString();
            parent.ws = ws;
            const actioner = new Actioner(parent);
            actioner.getAction(data);
        })
        
        ws.on("close", function() {
            const index = Constant.PLAYER_LIST.indexOf(ws.name);
            if (index !== -1) {
                Constant.PLAYER_LIST.splice(index, 1);
            }
            webSocketServer.broadcast('game:player_leave');
            console.log(`Client ${ws.name} closed connection`);
            console.log(`Current Player : ${Constant.PLAYER_LIST}`);
        });
    } else {
        console.log('Invalid parameter');
        ws.close();
    }
});

webSocketServer.on('listening',()=>{
   console.log(`Listening on port on port : ${Constant.PORT}`);
});