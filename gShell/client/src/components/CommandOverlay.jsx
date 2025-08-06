import '../styles/commandOverlay.css';

import { useEffect, useState } from 'react';

import fallbackFormatCommands from '../utils/Helpers';


export default function CommandOverlay({ toggleCommandOverlay }) {
  const [commands, setCommands] = useState({});
const [rows, setRows] = useState([]);

  const titles = [
    { bigWord: 'READ Commands', matchPrefix: 'get' },
    { bigWord: 'ADD Commands', matchPrefix: 'add' },
    { bigWord: 'System', matchPrefix: '' }, // fallback for all
  ];
  
useEffect(() => {
  fetch('/commands.json')
    .then(res => res.json())
    .then(data => {
      setCommands(data);

      const newRows = titles.map(t => ({
        bigWord: t.bigWord,
        smallWords: fallbackFormatCommands(data, t.matchPrefix),
      }));

      setRows(newRows);
    });
}, []);

return (
    <div className="command-overlay">
      <div className="modal-wrapper">
        <button onClick={toggleCommandOverlay} className="modal-close">
          Close
        </button>
        <div className="command-modal">
          <div className="command-rows">
            {rows.map((row, index) => (
              <div key={index} className="command-row">
                <span className="big-word">{row.bigWord}</span>
                <div className="small-words">
                  {row.smallWords.map((smallWord, i) => (
                    <span
                      key={i}
                      className={`tag bg-${smallWord.bg} text-${smallWord.textCol}`}
                    >
                      {smallWord.text}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}