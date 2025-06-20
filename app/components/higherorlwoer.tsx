"use client";

import React, { useEffect, useState } from "react";

type City = {
  city: string;
  country: string;
  population: number;
  image: string;
};

type GameState = "playing" | "won" | "lost";

function getRandomPair(cities: City[], excludeIndices: number[] = []): [number, number] {
  let idx1: number, idx2: number;
  do {
    idx1 = Math.floor(Math.random() * cities.length);
  } while (excludeIndices.includes(idx1));
  do {
    idx2 = Math.floor(Math.random() * cities.length);
  } while (idx2 === idx1 || excludeIndices.includes(idx2));
  return [idx1, idx2];
}

const gradientOverlay =
  "linear-gradient(180deg, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.65) 100%)";

function CityCard({
  city,
  country,
  population,
  image,
  showPopulation,
  highlight,
}: {
  city: string;
  country: string;
  population: number;
  image: string;
  showPopulation: boolean;
  highlight?: boolean;
}) {
  return (
    <div
      style={{
        position: "relative",
        width: "100vw",
        height: "100vh",
        maxWidth: "50vw",
        overflow: "hidden",
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        borderRadius: "0 32px 32px 0",
        boxShadow: highlight
          ? "0 0 0 6px #4ade80, 0 8px 32px #0006"
          : "0 8px 32px #0006",
        transition: "box-shadow 0.3s",
        margin: 0,
        padding: 0,
        background: "#222",
      }}
    >
      <img
        src={image}
        alt={city}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          zIndex: 1,
          filter: highlight ? "brightness(1.1) saturate(1.1)" : "brightness(0.95)",
          transition: "filter 0.3s",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: gradientOverlay,
          zIndex: 2,
        }}
      />
      <div
        style={{
          position: "relative",
          zIndex: 3,
          color: "#fff",
          width: "100%",
          padding: "2.5rem 1.5rem 2rem 1.5rem",
          textAlign: "center",
          textShadow: "0 2px 12px #000a",
          background: "rgba(0,0,0,0.10)",
          borderRadius: "0 0 32px 32px",
        }}
      >
        <h2 style={{ fontSize: 36, margin: 0, fontWeight: 700, letterSpacing: 1 }}>
          {city}
        </h2>
        <p style={{ fontSize: 20, margin: "8px 0 0 0", fontWeight: 400 }}>
          {country}
        </p>
        <p style={{ fontSize: 28, margin: "18px 0 0 0", fontWeight: 600 }}>
          {showPopulation ? (
            <span>
              <span style={{ color: "#4ade80" }}>{population.toLocaleString()}</span>
            </span>
          ) : (
            <span style={{ color: "#ddd", letterSpacing: 2 }}>???</span>
          )}
        </p>
      </div>
    </div>
  );
}

export default function HigherOrLower() {
  const [cities, setCities] = useState<City[]>([]);
  const [currentPair, setCurrentPair] = useState<[number, number] | null>(null);
  const [score, setScore] = useState(0);
  const [gameState, setGameState] = useState<GameState>("playing");
  const [showResult, setShowResult] = useState(false);
  const [lastGuessCorrect, setLastGuessCorrect] = useState<boolean | null>(null);

  // Load cities.json
  useEffect(() => {
    fetch("/cities.json")
      .then((res) => res.json())
      .then((data) => {
        setCities(data);
        const pair = getRandomPair(data);
        setCurrentPair(pair);
      });
  }, []);

  function handleGuess(guess: "higher" | "lower") {
    if (!currentPair || !cities.length || gameState !== "playing") return;

    const [idxA, idxB] = currentPair;
    const cityA = cities[idxA];
    const cityB = cities[idxB];

    const isCorrect =
      (guess === "higher" && cityB.population > cityA.population) ||
      (guess === "lower" && cityB.population < cityA.population);

    setShowResult(true);
    setLastGuessCorrect(isCorrect);

    setTimeout(() => {
      setShowResult(false);
      if (isCorrect) {
        setScore((s) => s + 1);
        // Next round: cityB becomes cityA, pick a new cityB
        let newIdxA = idxB;
        let exclude = [newIdxA];
        let [_, newIdxB] = getRandomPair(cities, exclude);
        setCurrentPair([newIdxA, newIdxB]);
      } else {
        setGameState("lost");
      }
    }, 1200);
  }

  function handleRestart() {
    if (!cities.length) return;
    const pair = getRandomPair(cities);
    setCurrentPair(pair);
    setScore(0);
    setGameState("playing");
    setShowResult(false);
    setLastGuessCorrect(null);
  }

  if (!cities.length || !currentPair) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#18181b",
          color: "#fff",
          fontSize: 28,
          fontFamily: "Inter, sans-serif",
        }}
      >
        Loading...
      </div>
    );
  }

  const [idxA, idxB] = currentPair;
  const cityA = cities[idxA];
  const cityB = cities[idxB];

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100vw",
        background: "linear-gradient(120deg, #18181b 0%, #23272f 100%)",
        fontFamily: "Inter, sans-serif",
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* Header */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100vw",
          zIndex: 10,
          padding: "2.5rem 0 0 0",
          pointerEvents: "none",
        }}
      >
        <h1
          style={{
            textAlign: "center",
            fontSize: 44,
            fontWeight: 800,
            color: "#fff",
            letterSpacing: 1,
            margin: 0,
            textShadow: "0 2px 16px #000a",
            pointerEvents: "auto",
          }}
        >
          City Population: <span style={{ color: "#4ade80" }}>Higher</span> or <span style={{ color: "#f87171" }}>Lower</span>?
        </h1>
        <div
          style={{
            textAlign: "center",
            marginTop: 12,
            fontSize: 22,
            color: "#a3a3a3",
            fontWeight: 500,
            textShadow: "0 1px 8px #0008",
            pointerEvents: "auto",
          }}
        >
          Score: <span style={{ color: "#4ade80", fontWeight: 700 }}>{score}</span>
        </div>
      </div>

      {/* Main Game Area */}
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          width: "100vw",
          height: "100vh",
          alignItems: "stretch",
          justifyContent: "center",
          position: "relative",
          zIndex: 2,
        }}
      >
        {/* City A */}
        <CityCard
          city={cityA.city}
          country={cityA.country}
          population={cityA.population}
          image={cityA.image}
          showPopulation={true}
        />

        {/* VS and Buttons */}
        <div
          style={{
            width: 120,
            minWidth: 120,
            maxWidth: 120,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 5,
            position: "relative",
            background: "rgba(24,24,27,0.92)",
            borderRadius: 32,
            margin: "0 -32px",
            boxShadow: "0 4px 32px #0008",
            gap: 24,
          }}
        >
          <div
            style={{
              fontSize: 38,
              fontWeight: 900,
              color: "#fff",
              letterSpacing: 2,
              marginBottom: 12,
              textShadow: "0 2px 12px #000a",
            }}
          >
            VS
          </div>
          {gameState === "playing" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <button
                onClick={() => handleGuess("higher")}
                disabled={showResult}
                style={{
                  fontSize: 22,
                  fontWeight: 700,
                  padding: "16px 0",
                  width: 90,
                  borderRadius: 12,
                  border: "none",
                  background: showResult
                    ? "#4ade80cc"
                    : "linear-gradient(90deg, #4ade80 0%, #22d3ee 100%)",
                  color: "#18181b",
                  boxShadow: "0 2px 8px #0004",
                  cursor: showResult ? "not-allowed" : "pointer",
                  transition: "background 0.2s, color 0.2s",
                  outline: "none",
                }}
              >
                Higher
              </button>
              <button
                onClick={() => handleGuess("lower")}
                disabled={showResult}
                style={{
                  fontSize: 22,
                  fontWeight: 700,
                  padding: "16px 0",
                  width: 90,
                  borderRadius: 12,
                  border: "none",
                  background: showResult
                    ? "#f87171cc"
                    : "linear-gradient(90deg, #f87171 0%, #fbbf24 100%)",
                  color: "#18181b",
                  boxShadow: "0 2px 8px #0004",
                  cursor: showResult ? "not-allowed" : "pointer",
                  transition: "background 0.2s, color 0.2s",
                  outline: "none",
                }}
              >
                Lower
              </button>
            </div>
          )}
          {showResult && (
            <div
              style={{
                marginTop: 8,
                fontSize: 24,
                fontWeight: 700,
                color: lastGuessCorrect ? "#4ade80" : "#f87171",
                textShadow: "0 2px 8px #000a",
                minHeight: 32,
              }}
            >
              {lastGuessCorrect ? "Correct!" : "Wrong!"}
            </div>
          )}
        </div>

        {/* City B */}
        <CityCard
          city={cityB.city}
          country={cityB.country}
          population={cityB.population}
          image={cityB.image}
          showPopulation={showResult || gameState === "lost"}
          highlight={showResult && !lastGuessCorrect}
        />
      </div>

      {/* Game Over Overlay */}
      {gameState === "lost" && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(24,24,27,0.92)",
            zIndex: 100,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            textAlign: "center",
            fontFamily: "Inter, sans-serif",
            animation: "fadeIn 0.4s",
          }}
        >
          <h2
            style={{
              fontSize: 54,
              fontWeight: 900,
              margin: 0,
              color: "#f87171",
              textShadow: "0 2px 16px #000a",
            }}
          >
            Game Over!
          </h2>
          <p
            style={{
              fontSize: 28,
              margin: "18px 0 0 0",
              color: "#a3a3a3",
              fontWeight: 500,
              textShadow: "0 1px 8px #0008",
            }}
          >
            Your final score:{" "}
            <span style={{ color: "#4ade80", fontWeight: 700 }}>{score}</span>
          </p>
          <button
            onClick={handleRestart}
            style={{
              fontSize: 24,
              fontWeight: 700,
              padding: "16px 48px",
              marginTop: 36,
              borderRadius: 16,
              border: "none",
              background: "linear-gradient(90deg, #4ade80 0%, #22d3ee 100%)",
              color: "#18181b",
              boxShadow: "0 2px 12px #0006",
              cursor: "pointer",
              transition: "background 0.2s, color 0.2s",
              outline: "none",
            }}
          >
            Play Again
          </button>
        </div>
      )}

      {/* Responsive styles */}
      <style>{`
        @media (max-width: 900px) {
          .city-card {
            max-width: 100vw !important;
            border-radius: 0 !important;
          }
          .vs-col {
            width: 100vw !important;
            min-width: 100vw !important;
            max-width: 100vw !important;
            margin: 0 !important;
            border-radius: 0 !important;
          }
          .main-flex {
            flex-direction: column !important;
          }
        }
      `}</style>
    </div>
  );
}
