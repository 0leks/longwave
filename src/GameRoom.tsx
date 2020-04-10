import { useParams } from "react-router-dom";
import React, { useState, useEffect, useRef } from "react";
import { database } from "firebase";
import { GameState, RoundPhase } from "./AppState";
import { RandomSpectrumCard } from "./SpectrumCards";

export function GameRoom() {
  const { roomId } = useParams();
  if (roomId === undefined) {
    throw new Error("RoomId missing");
  }

  const [gameState, setGameState] = useState<GameState>({
    increment: 0,
  });

  const [roundPhase, setRoundPhase] = useState(RoundPhase.GiveClue);
  const [spectrumCard, setSpectrumCard] = useState(RandomSpectrumCard());
  const [spectrumTarget, setSpectrumTarget] = useState(RandomSpectrumTarget());
  const [clue, setClue] = useState("");
  const [guess, setGuess] = useState(0);

  useEffect(() => {
    const dbRef = database().ref("rooms/" + roomId);
    dbRef.on("value", (appState) => {
      if (!appState.val()) {
        return;
      }
      setGameState(appState.val());
    });
    return () => dbRef.off();
  }, [roomId]);

  return (
    <div>
      <h1>{roomId || "Room Id missing"}</h1>
      {roundPhase == RoundPhase.GiveClue && (
        <GiveClue
          spectrumCard={spectrumCard}
          spectrumTarget={spectrumTarget}
          submitClue={(clue) => {
            setClue(clue);
            setRoundPhase(RoundPhase.MakeGuess);
          }}
        />
      )}
      {roundPhase == RoundPhase.MakeGuess && (
        <MakeGuess
          clue={clue}
          spectrumCard={spectrumCard}
          submitGuess={(guess) => {
            setGuess(guess);
            setRoundPhase(RoundPhase.ViewScore);
          }}
        />
      )}
      {roundPhase == RoundPhase.ViewScore && "View Score"}
    </div>
  );
}

function writeGameState(roomId: string, gameState: GameState) {
  database()
    .ref("rooms/" + roomId)
    .set(gameState);
}

function GiveClue(props: {
  spectrumCard: [string, string];
  spectrumTarget: number;
  submitClue: (clue: string) => void;
}) {
  const inputElement = useRef<HTMLInputElement>(null);
  return (
    <div>
      <div>Target: {props.spectrumTarget}</div>
      <div>
        Spectrum: {props.spectrumCard[0]} | {props.spectrumCard[1]}
      </div>
      <div>
        <input type="text" placeholder="Clue..." ref={inputElement} />
      </div>
      <div>
        <input
          type="button"
          value="Submit Clue"
          onClick={() => {
            if (!inputElement.current) {
              return false;
            }
            props.submitClue(inputElement.current.value);
          }}
        />
      </div>
    </div>
  );
}

function RandomSpectrumTarget() {
  return Math.ceil(Math.random() * 100);
}

function MakeGuess(props: {
  spectrumCard: [string, string];
  clue: string;
  submitGuess: (guess: number) => void;
}) {
  const inputElement = useRef<HTMLInputElement>(null);
  return (
    <div>
      <div>
        Spectrum: {props.spectrumCard[0]} | {props.spectrumCard[1]}
      </div>
      <div>Clue: {props.clue}</div>
      <div>
        <input type="number" placeholder="Guess..." ref={inputElement} />
      </div>
      <div>
        <input
          type="button"
          value="Submit Guess"
          onClick={() => {
            if (!inputElement.current) {
              return false;
            }
            const guess = parseInt(inputElement.current.value);
            props.submitGuess(guess);
          }}
        />
      </div>
    </div>
  );
}
