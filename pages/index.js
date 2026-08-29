import { useState } from 'react';
import { useRouter } from 'next/router';

export default function Home() {
  const [room, setRoom] = useState('');
  const [name, setName] = useState('');
  const router = useRouter();

  const handleJoin = (e) => {
    e.preventDefault();
    if (!room.trim() || !name.trim()) {
      alert('Please enter both Room ID and Your Name');
      return;
    }
    router.push(`/${encodeURIComponent(room.trim())}?name=${encodeURIComponent(name.trim())}`);
  };

  return (
    <div className="container">
      <div className="card">
        <h1 className="title">Bingo!</h1>
        <form onSubmit={handleJoin} className="form">
          <div className="input-group">
            <label htmlFor="room">Room ID</label>
            <input
              id="room"
              type="text"
              placeholder="e.g. testgame"
              value={room}
              onChange={(e) => setRoom(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <label htmlFor="name">Your Name</label>
            <input
              id="name"
              type="text"
              placeholder="e.g. Player1"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn-primary">Enter / Create Room</button>
        </form>
      </div>
    </div>
  );
}
