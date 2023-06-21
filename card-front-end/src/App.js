import React, { useEffect, useState } from 'react';
import useWebSocket from 'react-use-websocket';

import './App.css';
import { WS_CONFIG } from './config/constant';
import Game from './components/game';

const WS_URL = `${WS_CONFIG.protocol}://${WS_CONFIG.server}:${WS_CONFIG.port}?name=`;

export default function App () {
  const [myName, setMyName] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [playerList, setPlayerList] = useState([]);
  const [question, setQuestion] = useState('');
  const [playerCount, setPlayerCount] = useState(0);
  const [maxPlayer, setMaxPlayer] = useState(0);
  const [currentReader, setCurrentReader] = useState(false);
  const [cardDrawn, setCardDrawn] = useState(false);
  const [isWaiting, setIsWaiting] = useState(true);
  const [isFinished, setIsFinished] = useState(false);

  const { sendMessage } = useWebSocket(`${WS_URL}${myName}`, {
    onOpen: () => {
      console.log(`WebSocket connection established on : ${WS_URL}${myName}`);
      if (myName) {
        setIsConnected(true);
        sendMessage('request:get_player_count');
      }
    },
    onMessage: (dataMessage) => {
      console.log(`Received message : ${dataMessage.data}`);
      handleWebsocketMessage(dataMessage.data);
    }
  });

  const handleWebsocketMessage = (data) => {
    const parsedData = data.split(';');
    switch (parsedData[0]) {
      case 'result:player_count':
        setPlayerCount(parsedData[1].split('value:')[1]);
        setMaxPlayer(parsedData[2].split('max_player:')[1]);
        break;
      case 'game:player_joined':
        setPlayerCount(+playerCount+1);
        break;
      case 'game:player_leave':
        setPlayerCount(+playerCount-1);
        break;
      case 'game:player_list':
        setPlayerList(parsedData[1].split('value:')[1].split(','));
        break;
      case 'game:started':
        setIsWaiting(false);
        break;
      case 'game:next_turn':
        setCurrentReader(parsedData[1].split('player:')[1]);
        setQuestion(parsedData[2].split('question:')[1]);
        setCardDrawn(false);
        break;
      case 'game:card_drawn':
        setCardDrawn(true);
        break;
      case 'game:finish':
        setIsFinished(true);
        break;
      default:
        break;
    }
  }

  const handleSubmit = (event) => {
    //Prevent page reload
    event.preventDefault();

    const { name } = document.forms[0];
    setMyName(name.value);
  }

  const handleCardClick = () => {
    if (!cardDrawn) setCardDrawn(true);
    sendMessage('request:draw_card');
  }

  const handleNextButton = () => {
    sendMessage('request:next_turn');
  }

  const loginForm = (
    <div className="login-form">
      <div className="title">Card Game, let's goo !</div>
        <div className="form">
          <form onSubmit={handleSubmit}>
            <div className="input-container">
              <label>Name :</label>
              <input type="text" name="name" required />
            </div>
            <div className="button-container">
              <input type="submit" />
            </div>
          </form>
      </div>
    </div>
  );

  return (
    <div className="app">
      {!isConnected
        ? loginForm
        : <Game 
            myName = {myName}
            isWaiting = {isWaiting}
            playerCount = {playerCount}
            playerList = {playerList}
            maxPlayer = {maxPlayer}
            currentReader = {currentReader}
            cardDrawn = {cardDrawn}
            question = {question}
            handleCardClick = {handleCardClick}
            handleNextButton = {handleNextButton}
            isFinished = {isFinished}
         />
      }
    </div>
  );
}