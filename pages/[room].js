import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import io from 'socket.io-client';

function generateBingoBoard() {
  const nums = [];
  while (nums.length < 25) {
    const r = Math.floor(Math.random() * 75) + 1;
    if (!nums.includes(r)) nums.push(r);
  }
  return nums;
}

export default function GameRoom() {
  const router = useRouter();
  const { room, name } = router.query;

  const [socket, setSocket] = useState(null);
  const [players, setPlayers] = useState([]);
  const [board, setBoard] = useState([]);
  const [calledNumbers, setCalledNumbers] = useState([]);
  const [marked, setMarked] = useState([]);
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [callInput, setCallInput] = useState('');

  useEffect(() => {
    if (!room || !name) return;

    setBoard(generateBingoBoard());

    const s = io();
    setSocket(s);

    s.emit('join-room', { room, name });

    s.on('update-players', (pList) => setPlayers(pList));
    s.on('update-called-numbers', (cList) => setCalledNumbers(cList));
    s.on('chat-message', (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      s.disconnect();
    };
  }, [room, name]);

  const handleMarkCell = (num) => {
    if (!marked.includes(num)) {
      setMarked([...marked, num]);
    }
  };

  const handleCallNumber = (e) => {
    e.preventDefault();
    const val = parseInt(callInput, 10);
    if (val > 0 && val <= 75 && socket) {
      socket.emit('call-number', { room, number: val });
      setCallInput('');
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (chatInput.trim() && socket) {
      socket.emit('send-message', { room, user: name, text: chatInput.trim() });
      setChatInput('');
    }
  };

  return (
    <div className="game-container">
      <header className="game-header">
        <h2>Room: <span className="highlight">{room}</span> | Player: <span className="highlight">{name}</span></h2>
        <button onClick={() => router.push('/')} className="btn-secondary">Leave Room</button>
      </header>

      <div className="game-grid">
        <div className="board-section">
          <h3>Your Bingo Board</h3>
          <div className="bingo-header">
            <span>B</span><span>I</span><span>N</span><span>G</span><span>O</span>
          </div>
          <div className="bingo-matrix">
            {board.map((num, idx) => {
              const isMarked = marked.includes(num);
              const isCalled = calledNumbers.includes(num);
              return (
                <button
                  key={idx}
                  onClick={() => handleMarkCell(num)}
                  className={`matrix-cell ${isMarked ? 'marked' : ''} ${isCalled && !isMarked ? 'called-hint' : ''}`}
                >
                  {num}
                </button>
              );
            })}
          </div>

          <form onSubmit={handleCallNumber} className="caller-form">
            <input
              type="number"
              min="1"
              max="75"
              placeholder="Call # (1-75)"
              value={callInput}
              onChange={(e) => setCallInput(e.target.value)}
            />
            <button type="submit" className="btn-call">Call Number</button>
          </form>

          <div className="called-box">
            <h4>Called Numbers:</h4>
            <div className="called-tags">
              {calledNumbers.map((n, i) => (
                <span key={i} className="badge">{n}</span>
              ))}
            </div>
          </div>
        </div>

        <div className="sidebar-section">
          <div className="players-box">
            <h3>Active Players ({players.length})</h3>
            <ul>
              {players.map((p) => (
                <li key={p.id}>?? {p.name} {p.name === name ? '(You)' : ''}</li>
              ))}
            </ul>
          </div>

          <div className="chat-box">
            <h3>Room Chat</h3>
            <div className="chat-messages">
              {messages.map((m, i) => (
                <div key={i} className={`chat-line ${m.user === 'System' ? 'system-msg' : ''}`}>
                  <strong>{m.user}: </strong> {m.text}
                </div>
              ))}
            </div>
            <form onSubmit={handleSendMessage} className="chat-form">
              <input
                type="text"
                placeholder="Type a message..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
              />
              <button type="submit">Send</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
