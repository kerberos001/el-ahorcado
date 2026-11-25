import React, { useState, useEffect } from 'react';
import { Trash2, Play, Plus, RotateCcw, Home, Info } from 'lucide-react';

const ALPHABET = 'ABCDEFGHIJKLMNÑOPQRSTUVWXYZ'.split('');
const MAX_WORDS = 10;
const MAX_MISTAKES = 6;

// Utilidad para limpiar acentos (dejando la Ñ intacta)
const normalizeWord = (str) => {
  let s = str.toUpperCase();
  s = s.replace(/[ÁÄÂÀ]/g, 'A');
  s = s.replace(/[ÉËÊÈ]/g, 'E');
  s = s.replace(/[ÍÏÎÌ]/g, 'I');
  s = s.replace(/[ÓÖÔÒ]/g, 'O');
  s = s.replace(/[ÚÜÛÙ]/g, 'U');
  return s.replace(/[^A-ZÑ ]/g, ''); // Solo permite letras y espacios
};

export default function AhorcadoApp() {
  // Estados de la aplicación
  const [gameState, setGameState] = useState('setup'); // 'setup', 'playing', 'won', 'lost'
  
  // Estado de Configuración
  const [wordList, setWordList] = useState([]);
  const [newWord, setNewWord] = useState('');
  const [newHint, setNewHint] = useState('');
  
  // Estado del Juego
  const [currentWordIndex, setCurrentWordIndex] = useState(null);
  const [guessedLetters, setGuessedLetters] = useState(new Set());
  const [mistakes, setMistakes] = useState(0);

  // === LÓGICA DE CONFIGURACIÓN ===
  const handleAddWord = (e) => {
    e.preventDefault();
    if (wordList.length >= MAX_WORDS) return;
    
    const cleanWord = normalizeWord(newWord.trim());
    if (cleanWord.length > 0 && newHint.trim().length > 0) {
      setWordList([...wordList, { word: cleanWord, hint: newHint.trim() }]);
      setNewWord('');
      setNewHint('');
    }
  };

  const handleRemoveWord = (index) => {
    setWordList(wordList.filter((_, i) => i !== index));
  };

  const startGame = () => {
    if (wordList.length === 0) return;
    pickRandomWord();
    setGameState('playing');
  };

  // === LÓGICA DEL JUEGO ===
  const pickRandomWord = () => {
    const randomIndex = Math.floor(Math.random() * wordList.length);
    setCurrentWordIndex(randomIndex);
    setGuessedLetters(new Set());
    setMistakes(0);
    setGameState('playing');
  };

  const handleGuess = (letter) => {
    if (gameState !== 'playing' || guessedLetters.has(letter)) return;

    const newGuessed = new Set(guessedLetters);
    newGuessed.add(letter);
    setGuessedLetters(newGuessed);

    const currentWord = wordList[currentWordIndex].word;
    
    if (!currentWord.includes(letter)) {
      const newMistakes = mistakes + 1;
      setMistakes(newMistakes);
      if (newMistakes >= MAX_MISTAKES) {
        setGameState('lost');
      }
    } else {
      // Verificar si ganó
      const won = currentWord.split('').every(char => char === ' ' || newGuessed.has(char));
      if (won) {
        setGameState('won');
      }
    }
  };

  const resetToSetup = () => {
    setGameState('setup');
    setCurrentWordIndex(null);
    setGuessedLetters(new Set());
    setMistakes(0);
  };

  // === COMPONENTES VISUALES ===

  // Dibujo dHangman en SVG
  const HangmanFigure = ({ errors }) => (
    <div className="flex justify-center items-center p-4 bg-slate-50 dark:bg-slate-800 rounded-xl shadow-inner mb-6">
      <svg viewBox="0 0 200 250" className="w-48 h-48 stroke-current text-slate-800 dark:text-slate-200 transition-all duration-300" fill="none" strokeWidth="6" strokeLinecap="round">
        {/* Estructura Base */}
        <line x1="40" y1="230" x2="160" y2="230" />
        <line x1="80" y1="20" x2="80" y2="230" />
        <line x1="80" y1="20" x2="140" y2="20" />
        <line x1="140" y1="20" x2="140" y2="50" />
        
        {/* 1. Cabeza */}
        {errors >= 1 && <circle cx="140" cy="70" r="20" className="animate-fade-in" />}
        {/* 2. Cuerpo */}
        {errors >= 2 && <line x1="140" y1="90" x2="140" y2="150" className="animate-fade-in" />}
        {/* 3. Brazo Izquierdo */}
        {errors >= 3 && <line x1="140" y1="110" x2="110" y2="140" className="animate-fade-in" />}
        {/* 4. Brazo Derecho */}
        {errors >= 4 && <line x1="140" y1="110" x2="170" y2="140" className="animate-fade-in" />}
        {/* 5. Pierna Izquierda */}
        {errors >= 5 && <line x1="140" y1="150" x2="110" y2="190" className="animate-fade-in" />}
        {/* 6. Pierna Derecha */}
        {errors >= 6 && <line x1="140" y1="150" x2="170" y2="190" className="animate-fade-in" />}
      </svg>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-100 font-sans p-4 flex flex-col items-center justify-center">
      
      <div className="w-full max-w-2xl bg-white dark:bg-slate-950 shadow-2xl rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800">
        
        {/* HEADER */}
        <div className="bg-indigo-600 p-6 text-center text-white">
          <h1 className="text-3xl font-extrabold tracking-tight">Hangman</h1>
          <p className="text-indigo-200 mt-2 text-sm font-medium">
            {gameState === 'setup' ? 'Configuration Phases' : '¡Guess the word!'}
          </p>
        </div>

        {/* FASE 1: CONFIGURACIÓN */}
        {gameState === 'setup' && (
          <div className="p-6 md:p-8">
            <form onSubmit={handleAddWord} className="space-y-4 mb-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Hidden Word</label>
                  <input
                    type="text"
                    value={newWord}
                    onChange={(e) => setNewWord(e.target.value)}
                    placeholder="Ej: JIRAFA"
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all uppercase"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Clue</label>
                  <input
                    type="text"
                    value={newHint}
                    onChange={(e) => setNewHint(e.target.value)}
                    placeholder="Ej: Animal de cuello largo"
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
                    required
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={wordList.length >= MAX_WORDS}
                className="w-full md:w-auto flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-6 py-3 rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus size={20} />
                Add Pair ({wordList.length}/{MAX_WORDS})
              </button>
            </form>

            {wordList.length > 0 && (
              <div className="space-y-3 mb-8 max-h-60 overflow-y-auto pr-2">
                <h3 className="font-bold text-lg mb-4 border-b pb-2">Added Words</h3>
                {wordList.map((item, index) => (
                  <div key={index} className="flex justify-between items-center p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-100 dark:border-indigo-800/30">
                    <div>
                      <p className="font-bold tracking-wide">{item.word}</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">Clue: {item.hint}</p>
                    </div>
                    <button
                      onClick={() => handleRemoveWord(index)}
                      className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                      title="Eliminar"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={startGame}
              disabled={wordList.length === 0}
              className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-lg px-6 py-4 rounded-xl font-extrabold transition-all shadow-lg shadow-indigo-600/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
            >
              <Play size={24} />
              Start Game
            </button>
          </div>
        )}

        {/* FASE 2: JUEGO (Jugando, Ganado, Perdido) */}
        {gameState !== 'setup' && currentWordIndex !== null && (
          <div className="p-6 md:p-8">
            
            {/* Clue */}
            <div className="flex items-start gap-3 p-4 mb-6 bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-200 rounded-xl border border-amber-200 dark:border-amber-800/30">
              <Info className="shrink-0 mt-1" size={24} />
              <div>
                <p className="text-sm font-bold uppercase tracking-wider mb-1">Clue</p>
                <p className="text-lg">{wordList[currentWordIndex].hint}</p>
              </div>
            </div>

            <HangmanFigure errors={mistakes} />

            {/* Palabra a Adivinar */}
            <div className="flex flex-wrap justify-center gap-2 mb-8 min-h-[4rem]">
              {wordList[currentWordIndex].word.split('').map((char, index) => {
                const isSpace = char === ' ';
                const isRevealed = guessedLetters.has(char) || gameState === 'lost';
                const isMissed = gameState === 'lost' && !guessedLetters.has(char);

                if (isSpace) {
                  return <div key={index} className="w-4" />; // Espacio en blanco
                }

                return (
                  <span
                    key={index}
                    className={`
                      flex items-center justify-center w-10 h-12 md:w-12 md:h-14 rounded-lg text-2xl md:text-3xl font-bold uppercase border-b-4 
                      ${isRevealed 
                          ? isMissed 
                              ? 'text-red-500 border-red-500/50 bg-red-50 dark:bg-red-900/10' // No adivinada al perder
                              : 'text-slate-800 dark:text-white border-indigo-600 bg-indigo-50 dark:bg-indigo-900/30' // Adivinada correctamente
                          : 'text-transparent border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800' // Oculta
                      }
                    `}
                  >
                    {isRevealed ? char : '_'}
                  </span>
                );
              })}
            </div>

            {/* Teclado */}
            {gameState === 'playing' ? (
              <div className="flex flex-wrap justify-center gap-2 max-w-lg mx-auto">
                {ALPHABET.map((letter) => {
                  const isGuessed = guessedLetters.has(letter);
                  const isCorrect = isGuessed && wordList[currentWordIndex].word.includes(letter);
                  const isWrong = isGuessed && !wordList[currentWordIndex].word.includes(letter);

                  let btnStyle = "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-indigo-500 hover:text-indigo-600";
                  
                  if (isCorrect) btnStyle = "bg-green-500 text-white border-green-600 opacity-50 cursor-not-allowed";
                  if (isWrong) btnStyle = "bg-slate-300 dark:bg-slate-700 text-slate-500 border-slate-400 opacity-50 cursor-not-allowed";

                  return (
                    <button
                      key={letter}
                      disabled={isGuessed}
                      onClick={() => handleGuess(letter)}
                      className={`w-10 h-12 md:w-12 md:h-14 font-bold text-lg rounded-xl border-b-4 transition-all active:translate-y-1 active:border-b-0 ${btnStyle}`}
                    >
                      {letter}
                    </button>
                  );
                })}
              </div>
            ) : (
              /* Overlay Fin del Juego */
              <div className="text-center animate-fade-in">
                <h2 className={`text-3xl font-black mb-4 ${gameState === 'won' ? 'text-green-500' : 'text-red-500'}`}>
                  {gameState === 'won' ? '¡Felicidades, ganaste!' : '¡Fin del juego!'}
                </h2>
                
                <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
                  <button
                    onClick={pickRandomWord}
                    className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg"
                  >
                    <RotateCcw size={20} />
                    Siguiente Palabra
                  </button>
                  <button
                    onClick={resetToSetup}
                    className="flex items-center justify-center gap-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white px-6 py-3 rounded-xl font-bold transition-all"
                  >
                    <Home size={20} />
                    Volver a Configurar
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Estilos globales para pequeñas animaciones */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in {
          animation: fadeIn 0.4s ease-out forwards;
        }
      `}} />
    </div>
  );
}