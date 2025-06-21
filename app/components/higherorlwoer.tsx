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
  "linear-gradient(180deg, rgba(0,0,0,0.18) 0%, rgba(0,0,0,0.82) 100%)";

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
      className="city-card-premium"
      style={{
        position: "relative",
        width: "50vw",
        minWidth: 0,
        maxWidth: "50vw",
        height: "100vh",
        overflow: "hidden",
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        margin: 0,
        background: "#18181b",
        border: highlight
          ? "2.5px solid #ffd700"
          : "1.5px solid rgba(255,255,255,0.08)",
        boxShadow: highlight
          ? "0 0 0 6px #ffd700, 0 12px 48px #000a"
          : "0 8px 48px #000a",
        transition: "box-shadow 0.3s, border 0.3s",
        borderRadius: 0,
        padding: 0,
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
          filter: highlight
            ? "brightness(1.08) saturate(1.15) blur(0.5px)"
            : "brightness(0.98) saturate(1.08)",
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
          padding: "2.5rem 2.5rem 2.5rem 2.5rem",
          textAlign: "center",
          textShadow: "0 2px 24px #000c",
          background: "rgba(0,0,0,0.18)",
          borderRadius: 0,
          backdropFilter: "blur(2.5px)",
          boxShadow: "0 4px 32px #0006",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100%",
        }}
      >
        <h2
          style={{
            fontSize: 40,
            margin: 0,
            fontWeight: 800,
            letterSpacing: 1.5,
            color: "#fff",
            textTransform: "uppercase",
            lineHeight: 1.1,
            textShadow: "0 2px 24px #000c, 0 1px 0 #ffd70044",
            textAlign: "center",
          }}
        >
          {city}
        </h2>
        <p
          style={{
            fontSize: 22,
            margin: "10px 0 0 0",
            fontWeight: 500,
            color: "#ffd700",
            letterSpacing: 1,
            textShadow: "0 1px 8px #000a",
            textAlign: "center",
          }}
        >
          {country}
        </p>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            marginTop: 28,
            width: "100%",
          }}
        >
          <div
            style={{
              fontSize: 38,
              fontWeight: 900,
              letterSpacing: 2,
              color: showPopulation ? "#fff" : "#bdbdbd",
              textShadow: "0 2px 12px #000a",
              background: showPopulation
                ? "linear-gradient(90deg, #ffd700 0%, #fffbe6 100%)"
                : "none",
              WebkitBackgroundClip: showPopulation ? "text" : undefined,
              WebkitTextFillColor: showPopulation ? "transparent" : undefined,
              display: "inline-block",
              borderRadius: 12,
              padding: showPopulation ? "0.15em 0.8em" : undefined,
              boxShadow: showPopulation ? "0 2px 12px #ffd70044" : undefined,
              minHeight: 48,
              textAlign: "center",
              transition: "all 0.2s",
              border: showPopulation ? "2.5px solid #ffd70055" : undefined,
              marginBottom: 0,
            }}
          >
            {showPopulation ? (
              <span>
                {population.toLocaleString()}
              </span>
            ) : (
              <span style={{ color: "#bdbdbd", letterSpacing: 4, fontWeight: 600 }}>???</span>
            )}
          </div>
          {showPopulation && (
            <span
              style={{
                fontSize: 16,
                color: "#ffd700cc",
                fontWeight: 600,
                marginTop: 6,
                letterSpacing: 1.2,
                textShadow: "0 1px 8px #000a",
                background: "rgba(24,24,27,0.45)",
                borderRadius: 8,
                padding: "2px 12px",
                display: "inline-block",
              }}
            >
              Population
            </span>
          )}
        </div>
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
  const [highScore, setHighScore] = useState<number>(0);

  // Load high score from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("higherOrLowerHighScore");
    if (stored) {
      setHighScore(Number(stored));
    }
  }, []);

  // Save high score to localStorage if score beats it
  useEffect(() => {
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem("higherOrLowerHighScore", String(score));
    }
  }, [score, highScore]);

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
        const newIdxA = idxB;
        const exclude = [newIdxA];
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const [_, newIdxB] = getRandomPair(cities, exclude);
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
          background: "linear-gradient(120deg, #232526 0%, #414345 100%)",
          color: "#fff",
          fontSize: 32,
          letterSpacing: 1.5,
        }}
      >
        <div style={{
          padding: "2.5rem 3rem",
          borderRadius: 24,
          background: "rgba(24,24,27,0.85)",
          boxShadow: "0 8px 48px #000a",
          fontWeight: 600,
          fontSize: 32,
          color: "#ffd700",
          border: "2px solid #ffd70033",
        }}>
          Loading...
        </div>
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
        background:
          "radial-gradient(ellipse at 60% 0%, #232526 0%, #18181b 100%)",
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
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <h1
          style={{
            textAlign: "center",
            fontSize: 54,
            fontWeight: 900,
            color: "#fff",
            letterSpacing: 2,
            margin: 0,
            textShadow: "0 4px 32px #000c, 0 1px 0 #ffd70044",
            pointerEvents: "auto",
            textTransform: "uppercase",
            background: "linear-gradient(90deg, #ffd700 0%, #fffbe6 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            display: "inline-block",
            filter: "drop-shadow(0 2px 16px #ffd70044)",
          }}
        >
          City Population
        </h1>
        <div
          style={{
            textAlign: "center",
            marginTop: 10,
            fontSize: 28,
            color: "#fff",
            fontWeight: 600,
            textShadow: "0 1px 8px #0008",
            pointerEvents: "auto",
            letterSpacing: 1.2,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 18,
          }}
        >
          <span
            style={{
              background: "linear-gradient(90deg, #ffd700 0%, #fffbe6 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              fontWeight: 800,
              fontSize: 30,
              letterSpacing: 2,
              textShadow: "0 2px 12px #ffd70044",
            }}
          >
            Higher
          </span>
          <span style={{
            color: "#fff",
            fontWeight: 700,
            fontSize: 24,
            opacity: 0.7,
            margin: "0 8px",
          }}>
            or
          </span>
          <span
            style={{
              background: "linear-gradient(90deg, #f87171 0%, #fbbf24 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              fontWeight: 800,
              fontSize: 30,
              letterSpacing: 2,
              textShadow: "0 2px 12px #fbbf2444",
            }}
          >
            Lower
          </span>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            marginTop: 22,
            width: "100vw",
          }}
        >
          <div
            style={{
              textAlign: "center",
              fontSize: 32,
              color: "#ffd700",
              fontWeight: 700,
              textShadow: "0 2px 12px #ffd70044",
              pointerEvents: "auto",
              letterSpacing: 1.2,
              background: "linear-gradient(90deg, #232526 0%, #18181b 100%)",
              display: "inline-block",
              padding: "0.5em 2.5em",
              borderRadius: 20,
              border: "2.5px solid #ffd70088",
              boxShadow: "0 2px 18px #ffd70022",
              marginBottom: 0,
              marginTop: 0,
              minWidth: 220,
              maxWidth: 340,
              fontFamily: "inherit",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <span
              style={{
                color: "#fff",
                fontWeight: 900,
                fontSize: 38,
                background: "linear-gradient(90deg, #ffd700 0%, #fffbe6 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                textShadow: "0 2px 12px #ffd70044",
                marginRight: 10,
                verticalAlign: "middle",
              }}
            >
              {score}
            </span>
            <span
              style={{
                color: "#ffd700",
                fontWeight: 700,
                fontSize: 22,
                letterSpacing: 1.2,
                marginLeft: 6,
                verticalAlign: "middle",
                textShadow: "0 1px 8px #000a",
              }}
            >
              Score
            </span>
          </div>
          {/* High Score Display */}
          <div
            style={{
              textAlign: "center",
              fontSize: 22,
              color: "#fffbe6",
              fontWeight: 700,
              textShadow: "0 2px 8px #ffd70044",
              pointerEvents: "auto",
              letterSpacing: 1.1,
              background: "linear-gradient(90deg, #ffd700 0%, #fffbe6 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              display: "inline-block",
              padding: "0.25em 1.5em",
              borderRadius: 16,
              border: "2px solid #ffd70033",
              boxShadow: "0 1px 8px #ffd70022",
              marginTop: 10,
              minWidth: 160,
              maxWidth: 260,
              fontFamily: "inherit",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <span
              style={{
                color: "#fff",
                fontWeight: 900,
                fontSize: 26,
                background: "linear-gradient(90deg, #ffd700 0%, #fffbe6 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                textShadow: "0 2px 8px #ffd70044",
                marginRight: 8,
                verticalAlign: "middle",
              }}
            >
              {highScore}
            </span>
            <span
              style={{
                color: "#ffd700",
                fontWeight: 700,
                fontSize: 18,
                letterSpacing: 1.1,
                marginLeft: 4,
                verticalAlign: "middle",
                textShadow: "0 1px 6px #000a",
              }}
            >
              High Score
            </span>
          </div>
        </div>
      </div>

      {/* Main Game Area */}
      <div
        className="main-flex-premium"
        style={{
          display: "flex",
          flexDirection: "row",
          width: "100vw",
          height: "100vh",
          alignItems: "stretch",
          justifyContent: "center",
          position: "relative",
          zIndex: 2,
          gap: 0,
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
          className="vs-col-premium"
          style={{
            width: 0,
            minWidth: 0,
            maxWidth: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 5,
            position: "relative",
            background: "transparent",
            borderRadius: 0,
            margin: 0,
            boxShadow: "none",
            gap: 0,
            border: "none",
            padding: 0,
            pointerEvents: "none",
          }}
        >
          {/* Absolutely position VS and buttons in the center */}
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: "70%",
              transform: "translate(-50%, -50%)",
              zIndex: 20,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              pointerEvents: "auto",
              background: "rgba(24,24,27,0.98)",
              borderRadius: 32,
              boxShadow: "0 8px 48px #000a",
              border: "2.5px solid #ffd70033",
              padding: "2rem 2rem",
              minWidth: 220,
              maxWidth: 320,
              gap: 32,
            }}
          >
            <div
              style={{
                fontSize: 48,
                fontWeight: 900,
                color: "#ffd700",
                letterSpacing: 3,
                marginBottom: 0,
                textShadow: "0 2px 24px #ffd70044, 0 1px 0 #fffbe644",
                background: "linear-gradient(90deg, #ffd700 0%, #fffbe6 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                filter: "drop-shadow(0 2px 16px #ffd70044)",
              }}
            >
              VS
            </div>
            {gameState === "playing" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                <button
                  onClick={() => handleGuess("higher")}
                  disabled={showResult}
                  style={{
                    fontSize: 26,
                    fontWeight: 800,
                    padding: "18px 0",
                    width: 160,
                    borderRadius: 18,
                    border: "none",
                    background: showResult
                      ? "linear-gradient(90deg, #ffd700cc 0%, #fffbe6cc 100%)"
                      : "linear-gradient(90deg, #ffd700 0%, #fffbe6 100%)",
                    color: "#18181b",
                    boxShadow: "0 4px 24px #ffd70033",
                    cursor: showResult ? "not-allowed" : "pointer",
                    transition: "background 0.2s, color 0.2s, box-shadow 0.2s",
                    outline: "none",
                    letterSpacing: 2,
                    textTransform: "uppercase",
                    borderBottom: "3.5px solid #fffbe6",
                    filter: showResult ? "grayscale(0.2)" : "none",
                  }}
                >
                  Higher
                </button>
                <button
                  onClick={() => handleGuess("lower")}
                  disabled={showResult}
                  style={{
                    fontSize: 26,
                    fontWeight: 800,
                    padding: "18px 0",
                    width: 160,
                    borderRadius: 18,
                    border: "none",
                    background: showResult
                      ? "linear-gradient(90deg, #f87171cc 0%, #fbbf24cc 100%)"
                      : "linear-gradient(90deg, #f87171 0%, #fbbf24 100%)",
                    color: "#18181b",
                    boxShadow: "0 4px 24px #fbbf2433",
                    cursor: showResult ? "not-allowed" : "pointer",
                    transition: "background 0.2s, color 0.2s, box-shadow 0.2s",
                    outline: "none",
                    letterSpacing: 2,
                    textTransform: "uppercase",
                    borderBottom: "3.5px solid #fbbf24",
                    filter: showResult ? "grayscale(0.2)" : "none",
                  }}
                >
                  Lower
                </button>
              </div>
            )}
            {showResult && (
              <div
                style={{
                  marginTop: 12,
                  fontSize: 28,
                  fontWeight: 900,
                  color: lastGuessCorrect ? "#ffd700" : "#f87171",
                  textShadow: lastGuessCorrect
                    ? "0 2px 12px #ffd70044"
                    : "0 2px 12px #f8717144",
                  minHeight: 38,
                  letterSpacing: 2,
                  textTransform: "uppercase",
                  background: lastGuessCorrect
                    ? "linear-gradient(90deg, #ffd700 0%, #fffbe6 100%)"
                    : "linear-gradient(90deg, #f87171 0%, #fbbf24 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  filter: lastGuessCorrect
                    ? "drop-shadow(0 2px 8px #ffd70044)"
                    : "drop-shadow(0 2px 8px #f8717144)",
                }}
              >
                {lastGuessCorrect ? "Correct!" : "Wrong!"}
              </div>
            )}
          </div>
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
            background: "rgba(24,24,27,0.98)",
            zIndex: 100,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            textAlign: "center",
            animation: "fadeIn 0.4s",
            backdropFilter: "blur(2.5px)",
          }}
        >
          <h2
            style={{
              fontSize: 64,
              fontWeight: 900,
              margin: 0,
              background: "linear-gradient(90deg, #f87171 0%, #fbbf24 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              textShadow: "0 2px 24px #fbbf2444, 0 1px 0 #fffbe644",
              letterSpacing: 2,
              textTransform: "uppercase",
              filter: "drop-shadow(0 2px 16px #fbbf2444)",
            }}
          >
            Game Over!
          </h2>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              marginTop: 24,
              width: "100%",
            }}
          >
            <div
              style={{
                fontSize: 38,
                color: "#ffd700",
                fontWeight: 700,
                textShadow: "0 2px 12px #ffd70044",
                letterSpacing: 1.2,
                background: "linear-gradient(90deg, #232526 0%, #18181b 100%)",
                display: "inline-block",
                padding: "0.5em 2.5em",
                borderRadius: 20,
                border: "2.5px solid #ffd70088",
                boxShadow: "0 2px 18px #ffd70022",
                marginBottom: 0,
                marginTop: 0,
                minWidth: 220,
                maxWidth: 500,
                fontFamily: "inherit",
                position: "relative",
                overflow: "hidden",
                textAlign: "center",
              }}
            >
              <span
                style={{
                  color: "#fff",
                  fontWeight: 900,
                  fontSize: 44,
                  background: "linear-gradient(90deg, #ffd700 0%, #fffbe6 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  textShadow: "0 2px 12px #ffd70044",
                  marginRight: 10,
                  verticalAlign: "middle",
                }}
              >
                {score}
              </span>
              <span
                style={{
                  color: "#ffd700",
                  fontWeight: 700,
                  fontSize: 24,
                  letterSpacing: 1.2,
                  marginLeft: 6,
                  verticalAlign: "middle",
                  textShadow: "0 1px 8px #000a",
                }}
              >
                Final Score
              </span>
            </div>
            {/* High Score on Game Over */}
            <div
              style={{
                fontSize: 24,
                color: "#fffbe6",
                fontWeight: 700,
                textShadow: "0 2px 8px #ffd70044",
                pointerEvents: "auto",
                letterSpacing: 1.1,
                background: "linear-gradient(90deg, #ffd700 0%, #fffbe6 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                display: "inline-block",
                padding: "0.25em 1.5em",
                borderRadius: 16,
                border: "2px solid #ffd70033",
                boxShadow: "0 1px 8px #ffd70022",
                marginTop: 12,
                minWidth: 160,
                maxWidth: 260,
                fontFamily: "inherit",
                position: "relative",
                overflow: "hidden",
                textAlign: "center",
              }}
            >
              <span
                style={{
                  color: "#fff",
                  fontWeight: 900,
                  fontSize: 28,
                  background: "linear-gradient(90deg, #ffd700 0%, #fffbe6 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  textShadow: "0 2px 8px #ffd70044",
                  marginRight: 8,
                  verticalAlign: "middle",
                }}
              >
                {highScore}
              </span>
              <span
                style={{
                  color: "#ffd700",
                  fontWeight: 700,
                  fontSize: 18,
                  letterSpacing: 1.1,
                  marginLeft: 4,
                  verticalAlign: "middle",
                  textShadow: "0 1px 6px #000a",
                }}
              >
                High Score
              </span>
            </div>
          </div>
          <button
            onClick={handleRestart}
            style={{
              fontSize: 28,
              fontWeight: 900,
              padding: "20px 64px",
              marginTop: 48,
              borderRadius: 24,
              border: "none",
              background: "linear-gradient(90deg, #ffd700 0%, #fffbe6 100%)",
              color: "#18181b",
              boxShadow: "0 4px 24px #ffd70044",
              cursor: "pointer",
              transition: "background 0.2s, color 0.2s",
              outline: "none",
              letterSpacing: 2,
              textTransform: "uppercase",
              borderBottom: "4px solid #fffbe6",
            }}
          >
            Play Again
          </button>
        </div>
      )}

      {/* Premium Responsive styles */}
      <style>{`
        @media (max-width: 1200px) {
          .city-card-premium {
            max-width: 100vw !important;
            min-width: 0 !important;
            width: 100vw !important;
            border-radius: 0 !important;
            height: 50vh !important;
          }
          .main-flex-premium {
            flex-direction: column !important;
            gap: 0 !important;
            align-items: stretch !important;
            height: 100vh !important;
          }
        }
        @media (max-width: 700px) {
          .city-card-premium {
            max-width: 100vw !important;
            min-width: 0 !important;
            width: 100vw !important;
            border-radius: 0 !important;
            margin: 0 !important;
            padding: 0 !important;
            height: 50vh !important;
          }
          .main-flex-premium {
            flex-direction: column !important;
            gap: 0 !important;
            align-items: stretch !important;
            height: 100vh !important;
          }
        }
      `}</style>
    </div>
  );
}
