/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { create, all } from 'mathjs';
import { motion, AnimatePresence } from 'motion/react';
import { History, X, Trash2, ChevronDown } from 'lucide-react';

const math = create(all);

interface HistoryItem {
  id: string;
  expression: string;
  result: string;
  timestamp: number;
}

export default function App() {
  const [display, setDisplay] = useState('0');
  const [expression, setExpression] = useState('');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // Load history from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('mobile-calc-history');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load history", e);
      }
    }
  }, []);

  // Save history to localStorage
  useEffect(() => {
    localStorage.setItem('mobile-calc-history', JSON.stringify(history));
  }, [history]);

  const handleNumber = (num: string) => {
    if (display === '0' || display === 'Error') {
      setDisplay(num);
    } else {
      setDisplay(display + num);
    }
  };

  const handleOperator = (op: string) => {
    if (display === 'Error') return;
    setExpression(display + ' ' + op + ' ');
    setDisplay('0');
  };

  const handleClear = () => {
    setDisplay('0');
    setExpression('');
  };

  const handleEqual = () => {
    try {
      const fullExpr = expression + display;
      if (!expression) return;
      
      const result = math.evaluate(fullExpr).toString();
      
      const newItem: HistoryItem = {
        id: Math.random().toString(36).substr(2, 9),
        expression: fullExpr,
        result: result,
        timestamp: Date.now()
      };
      
      setHistory([newItem, ...history].slice(0, 50));
      setDisplay(result);
      setExpression('');
    } catch (e) {
      setDisplay('Error');
    }
  };

  const deleteHistoryItem = (id: string) => {
    setHistory(history.filter(item => item.id !== id));
  };

  const clearHistory = () => {
    if (confirm('Clear all history?')) {
      setHistory([]);
    }
  };

  return (
    <div className="calc-container">
      {/* Top Bar */}
      <div className="flex justify-between items-center p-6 pt-12">
        <button 
          onClick={() => setIsHistoryOpen(true)}
          className="text-zinc-400 hover:text-white transition-colors"
        >
          <History size={24} />
        </button>
        <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-600">Calculator</div>
        <div className="w-6" /> {/* Spacer */}
      </div>

      {/* Display Area */}
      <div className="calc-display">
        <div className="text-zinc-500 text-xl font-mono mb-2 h-8 overflow-hidden">
          {expression}
        </div>
        <motion.div 
          key={display}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-7xl font-light tracking-tighter text-white truncate w-full text-right"
        >
          {display}
        </motion.div>
      </div>

      {/* Keypad */}
      <div className="calc-keypad">
        <button onClick={handleClear} className="calc-btn btn-func">AC</button>
        <button onClick={() => setDisplay(display.startsWith('-') ? display.slice(1) : '-' + display)} className="calc-btn btn-func">+/-</button>
        <button onClick={() => handleOperator('%')} className="calc-btn btn-func">%</button>
        <button onClick={() => handleOperator('/')} className="calc-btn btn-op">÷</button>

        <button onClick={() => handleNumber('7')} className="calc-btn btn-num">7</button>
        <button onClick={() => handleNumber('8')} className="calc-btn btn-num">8</button>
        <button onClick={() => handleNumber('9')} className="calc-btn btn-num">9</button>
        <button onClick={() => handleOperator('*')} className="calc-btn btn-op">×</button>

        <button onClick={() => handleNumber('4')} className="calc-btn btn-num">4</button>
        <button onClick={() => handleNumber('5')} className="calc-btn btn-num">5</button>
        <button onClick={() => handleNumber('6')} className="calc-btn btn-num">6</button>
        <button onClick={() => handleOperator('-')} className="calc-btn btn-op">−</button>

        <button onClick={() => handleNumber('1')} className="calc-btn btn-num">1</button>
        <button onClick={() => handleNumber('2')} className="calc-btn btn-num">2</button>
        <button onClick={() => handleNumber('3')} className="calc-btn btn-num">3</button>
        <button onClick={() => handleOperator('+')} className="calc-btn btn-op">+</button>

        <button onClick={() => handleNumber('0')} className="calc-btn btn-num col-span-2 !aspect-auto !rounded-[3rem] !justify-start px-8">0</button>
        <button onClick={() => handleNumber('.')} className="calc-btn btn-num">.</button>
        <button onClick={handleEqual} className="calc-btn btn-op">=</button>
      </div>

      {/* History Drawer */}
      <AnimatePresence>
        {isHistoryOpen && (
          <motion.div 
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="history-drawer"
          >
            <div className="flex flex-col h-full">
              <div className="p-6 pt-12 flex justify-between items-center border-b border-zinc-800">
                <h2 className="text-xl font-bold">History</h2>
                <div className="flex gap-4">
                  <button onClick={clearHistory} className="text-zinc-500 hover:text-red-500 transition-colors">
                    <Trash2 size={20} />
                  </button>
                  <button onClick={() => setIsHistoryOpen(false)} className="text-zinc-500 hover:text-white transition-colors">
                    <X size={24} />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {history.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-zinc-600">
                    <History size={48} className="mb-4 opacity-20" />
                    <p>No recent calculations</p>
                  </div>
                ) : (
                  history.map((item) => (
                    <div key={item.id} className="flex flex-col items-end border-b border-zinc-900 pb-4">
                      <div className="text-zinc-500 text-sm font-mono mb-1">{item.expression}</div>
                      <div className="flex items-center gap-4 w-full justify-between">
                        <button 
                          onClick={() => deleteHistoryItem(item.id)}
                          className="text-zinc-800 hover:text-red-900 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                        <div className="text-2xl font-medium text-white">{item.result}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <button 
                onClick={() => setIsHistoryOpen(false)}
                className="p-8 flex justify-center text-zinc-500 hover:text-white transition-colors"
              >
                <ChevronDown size={32} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
