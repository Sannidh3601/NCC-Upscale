import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function GatePage() {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // if already passed, redirect immediately
  useEffect(() => {
    if (typeof window !== 'undefined' && localStorage.getItem('gatePassed') === 'true') {
      navigate('/');
    }
  }, [navigate]);

  const handleSubmit = e => {
    e.preventDefault();
    if (code.trim() === 'ncc-task') {
      localStorage.setItem('gatePassed', 'true');
      navigate('/');
    } else {
      setError('Incorrect code. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-lg shadow-lg w-full max-w-sm"
      >
        <h1 className="text-2xl font-semibold mb-4 text-center">
          Enter access code
        </h1>
        <input
          type="text"
          value={code}
          onChange={e => setCode(e.target.value)}
          className="w-full mb-4 px-3 py-2 border rounded"
          placeholder="Access code"
          autoFocus
        />
        {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
        <button
          type="submit"
          className="w-full bg-amber text-white py-2 rounded hover:bg-amber-dark transition"
        >
          Enter
        </button>
      </form>
    </div>
  );
}
