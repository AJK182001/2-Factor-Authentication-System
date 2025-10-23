// =============================================================================
// SNAKE GAME COMPONENT - PROTECTED APPLICATION
// =============================================================================
// This is the protected application that users access after successful 2FA
// Features classic Snake gameplay with score tracking and logout functionality

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Game.css";
import axios from "axios";

// Game configuration constants
const BOARD_SIZE = 14;                                    // 14x14 game board
const INITIAL_SNAKE = [{ x: 7, y: 7 }];                  // Starting snake position (center)
const INITIAL_DIRECTION = { x: 0, y: -1 };               // Starting direction (up)
const SPEEDS = { Easy: 300, Medium: 200, Hard: 100 };    // Game speed settings (ms)

/**
 * getRandomPosition Function
 * Generates random coordinates for food placement
 * Ensures food appears within board boundaries
 */
const getRandomPosition = () => ({
  x: Math.floor(Math.random() * BOARD_SIZE),
  y: Math.floor(Math.random() * BOARD_SIZE),
});

/**
 * Game Component
 * Main Snake game implementation with React hooks
 * Handles game logic, user input, and score management
 * Includes logout functionality to return to login
 */
const Game = () => {
  const navigate = useNavigate();                         // React Router navigation
  const [snake, setSnake] = useState(INITIAL_SNAKE);     // Snake body segments
  const [direction, setDirection] = useState(INITIAL_DIRECTION); // Current direction
  const [food, setFood] = useState(getRandomPosition());  // Food position
  const [score, setScore] = useState(0);                  // Current score
  const [highScore, setHighScore] = useState(0);          // High score
  const [gameOver, setGameOver] = useState(false);        // Game over state
  const [speed, setSpeed] = useState(SPEEDS.Medium);      // Game speed

  /**
   * moveSnake Function
   * Core game logic for snake movement
   * Handles collision detection, food consumption, and score updates
   * Ends game if snake hits walls or itself
   */
  const moveSnake = () => {
    const newHead = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };

    // Check for collisions (walls or self)
    if (
      newHead.x < 0 || newHead.x >= BOARD_SIZE ||
      newHead.y < 0 || newHead.y >= BOARD_SIZE ||
      snake.some(seg => seg.x === newHead.x && seg.y === newHead.y)
    ) {
      setGameOver(true);
      updateHighScore();
      return;
    }

    // Move snake by adding new head
    const newSnake = [newHead, ...snake];
    
    // Check if food is consumed
    if (newHead.x === food.x && newHead.y === food.y) {
      setScore(prev => prev + 1);           // Increase score
      setFood(getRandomPosition());         // Generate new food
    } else {
      newSnake.pop();                       // Remove tail if no food consumed
    }
    setSnake(newSnake);
  };

  /**
   * updateHighScore Function
   * Sends current score to backend for high score tracking
   * Updates local high score state
   */
  const updateHighScore = async () => {
    try {
      const res = await axios.post("http://127.0.0.1:5000/highscore", { score });
      setHighScore(res.data.high_score);
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch high score on component mount
  useEffect(() => {
    const fetchHighScore = async () => {
      try {
        const res = await axios.get("http://127.0.0.1:5000/highscore");
        setHighScore(res.data.high_score);
      } catch (err) { console.error(err); }
    };
    fetchHighScore();
  }, []);

  // Game loop - moves snake at specified intervals
  useEffect(() => {
    if (gameOver) return;
    const interval = setInterval(moveSnake, speed);
    return () => clearInterval(interval);
  }, [snake, direction, speed, gameOver]);

  // Keyboard input handling for snake direction
  useEffect(() => {
    const handleKey = (e) => {
      switch (e.key) {
        case "ArrowUp": if (direction.y !== 1) setDirection({ x: 0, y: -1 }); break;
        case "ArrowDown": if (direction.y !== -1) setDirection({ x: 0, y: 1 }); break;
        case "ArrowLeft": if (direction.x !== 1) setDirection({ x: -1, y: 0 }); break;
        case "ArrowRight": if (direction.x !== -1) setDirection({ x: 1, y: 0 }); break;
        default: break;
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [direction]);

  /**
   * restartGame Function
   * Resets game to initial state
   * Used when restart button is clicked
   */
  const restartGame = () => {
    setSnake(INITIAL_SNAKE);
    setDirection(INITIAL_DIRECTION);
    setFood(getRandomPosition());
    setScore(0);
    setGameOver(false);
  };

  /**
   * handleLogout Function
   * Returns user to login page
   * Part of the 2FA system logout functionality
   */
  const handleLogout = () => {
    navigate('/login');
  };

return(
  <div className="game-container">
  <div className="game-card">
    <h1>Snake Game</h1>
    <div className="score-board">Score: {score} | High Score: {highScore}</div>
    {gameOver && <div className="game-over">Game Over!</div>}

    {/* Board */}
    <div
      className="board"
      style={{
        gridTemplateColumns: `repeat(${BOARD_SIZE}, 20px)`,
        gridTemplateRows: `repeat(${BOARD_SIZE}, 20px)`,
      }}
    >
      {Array.from({ length: BOARD_SIZE * BOARD_SIZE }).map((_, idx) => {
        const x = idx % BOARD_SIZE;
        const y = Math.floor(idx / BOARD_SIZE);
        const isSnake = snake.some(seg => seg.x === x && seg.y === y);
        const isFood = food.x === x && food.y === y;
        return (
          <div
            key={idx}
            className={`cell ${isSnake ? "snake" : ""} ${isFood ? "food" : ""}`}
          />
        );
      })}
    </div>

    {/* Controls */}
    <div className="button-group">
      <button className="btn-primary" onClick={restartGame}>Restart</button>
      <button className="btn-primary logout-btn" onClick={handleLogout}>Logout</button>
    </div>
    <div style={{ marginTop: '10px' }}>
      Speed: 
      <select value={speed} onChange={e => setSpeed(Number(e.target.value))}>
        <option value={SPEEDS.Easy}>Easy</option>
        <option value={SPEEDS.Medium}>Medium</option>
        <option value={SPEEDS.Hard}>Hard</option>
      </select>
    </div>

    {/* Future leaderboard */}
    <div className="leaderboard" style={{ marginTop: '10px' }}>
      {/* Leaderboard entries can go here */}
    </div>
  </div>
</div>

);

};

export default Game;
