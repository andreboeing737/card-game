import React, { useEffect, useState } from 'react';

import './Game.css';

export default function Game (props) {
  console.log(props);
  const {
    myName,
    isWaiting,
    playerCount,
    playerList,
    maxPlayer,
    currentReader,
    cardDrawn,
    question,
    handleCardClick,
    handleNextButton,
    isFinished,
  } = props;

  const waitingForm = (
    <div className='waiting-form'>
      Waiting for player {playerCount} / {maxPlayer}
    </div>
  )
  
  const thankYouForm = (
    <center>
      <div className='waiting-form'>
        <b>Game has ended.<br /><br />
        Thanks for playing!<br /></b>
        <div style={{marginBottom:'100px'}}></div>
        <button type="button" className="next-button" onClick={() => {window.location.reload(false);}}>
          Play Again
        </button>
      </div>
    </center>
  )

  const getPlayerList = () => {
    console.log(playerList);
    return (
      <div>
        {playerList.map((name, index) => {
          return (
            <div id={name} className={currentReader === name ? 'current-reader' : ''}>
              {index+1}. {name}
            </div>
          );
        })}
      </div>
    )
  }

  const waitingOrderText = (
    <div className='waiting-order-text'>
      {!cardDrawn
        ? <span><b>Waiting for your turn</b></span>
        : <span><b>{currentReader} has drawn a card</b></span>
      }
    </div>
  )

  const drawCardForm = (
    <center>
      <div className='card' onClick={handleCardClick}>
        <span className='card-text'><b>
        {!cardDrawn
          ? <p>Card Deck</p>
          : <p>{question}</p>
        }
        </b></span>
      </div>
      <p>
        {!cardDrawn
          ? 'Click to Draw a Card'
          : 'Please read the question to your friends on Zoom or Google Meet'
        }
      </p>
      {cardDrawn &&
        <button type="button" className="next-button" onClick={handleNextButton}>
          Next Turn
        </button>
      }
    </center>
  )

  const gameForm = (
    <div className='game-form'>
      <b>Player List</b>
      <div className='player-list'>
        {getPlayerList()}
      </div>
      <div className='card-form'>
        {currentReader !== myName
          ? waitingOrderText
          : drawCardForm
        }
      </div>
    </div>
  )

  return (
    <div>
      {!isFinished
        ? <>
            {isWaiting
              ? waitingForm
              : gameForm
            }
          </>
        : <>
            {thankYouForm}
          </>
      }     
    </div>
  );
}