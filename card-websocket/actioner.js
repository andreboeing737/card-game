var self;
class Actioner{
	constructor(parent){
		self = parent; //isinya ada webSocketServer, Constant, ws
		this.getAction = this.getAction.bind(this);
        this.nextTurn = this.nextTurn.bind(this);
	}

	getAction(data) {
        console.log(`Get request : ${data}`);
        let result;
        switch (data) {
            case 'request:get_player_count' :
                result = `player_count;value:${self.webSocketServer.getPlayerCount()};max_player:${self.Constant.MAX_PLAYER}`;
                break;
            case 'request:next_turn' :
                result = this.nextTurn(self.ws.name);
                break;
            case 'request:draw_card' :
                self.webSocketServer.broadcast(`game:card_drawn`);
                break;
            default:
                break;
        }
        self.ws.send(`result:${result ?? 'OK'}`);
        console.log(`Sent to ${self.ws.name} result:${result ?? 'OK'}`);
    }

    nextTurn(playerName = null) {
        if (playerName !== null && playerName !== self.Constant.PLAYER_LIST[self.Constant.CURRENT_READER]) {
            return 'Not current reader';
        }
        if (self.Constant.ALREADY_READ_QUESTION.length !== self.Constant.QUESTION.length) {
            let playerIndex = self.Constant.CURRENT_READER;
            if (playerIndex === null || playerIndex === self.Constant.MAX_PLAYER - 1) {
                playerIndex = 0;
            } else {
                playerIndex += 1;
            }
            self.Constant.CURRENT_READER = playerIndex;
            let upcomingQuestion = null;
            while (upcomingQuestion === null) {
                const randomNumber = Math.floor(Math.random() * 10);
                if (!self.Constant.ALREADY_READ_QUESTION.includes(randomNumber)) {
                    self.Constant.ALREADY_READ_QUESTION.push(randomNumber);
                    upcomingQuestion = self.Constant.QUESTION[randomNumber];
                }
            }
            const playerName = self.Constant.PLAYER_LIST[playerIndex];
            self.webSocketServer.broadcast(`game:next_turn;player:${playerName};question:${upcomingQuestion}`);
        } else {
            self.Constant.ALREADY_READ_QUESTION = [];
            self.Constant.PLAYER_LIST = [];
            self.Constant.CURRENT_READER = null;
            self.webSocketServer.broadcast(`game:finish`);
        }
    }
}

export default Actioner