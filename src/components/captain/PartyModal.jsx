// src/components/captain/PartyModal.jsx
import { useState } from 'react';

const PartyModal = ({ table, parties, onSelect, onCreate, onClose }) => {
  const [seats, setSeats] = useState(2);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-600 to-orange-600 px-10 py-8">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-3xl font-bold text-white">Table {table.tableNumber}</h3>
              <p className="text-amber-100 text-lg mt-1">{table.capacity} seats capacity</p>
            </div>
            <button onClick={onClose} className="text-white text-4xl hover:text-amber-200 transition">×</button>
          </div>
        </div>

        <div className="p-10">
          {/* Existing active parties */}
          {parties.length > 0 && (
            <div className="mb-8">
              <h4 className="text-2xl font-bold text-gray-700 mb-4">Active Parties</h4>
              <div className="space-y-3">
                {parties.map(p => (
                  <button
                    key={p.id}
                    onClick={() => onSelect(p)}
                    className="w-full bg-amber-50 hover:bg-amber-100 border-2 border-amber-400 p-5 rounded-2xl text-xl font-semibold text-left transition transform hover:scale-105 shadow"
                  >
                    <span className="text-amber-800">Party #{p.id}</span>
                    <span className="text-gray-600 ml-4">• {p.occupiedSeats} seat{p.occupiedSeats !== 1 ? 's' : ''}</span>
                  </button>
                ))}
              </div>
              <div className="border-t-2 border-dashed border-gray-300 my-8" />
            </div>
          )}

          {/* Create new party */}
          <h4 className="text-2xl font-bold text-gray-700 mb-4">New Party</h4>
          <div className="flex items-center gap-4 mb-6">
            <label className="text-xl text-gray-600 whitespace-nowrap">Guests:</label>
            <div className="flex items-center gap-3 flex-1">
              <button
                onClick={() => setSeats(s => Math.max(1, s - 1))}
                className="w-12 h-12 rounded-full bg-red-100 hover:bg-red-200 text-2xl font-bold text-red-700 transition"
              >−</button>
              <input
                type="number"
                min="1"
                max={table.capacity}
                value={seats}
                onChange={e => setSeats(Math.min(table.capacity, Math.max(1, parseInt(e.target.value) || 1)))}
                className="flex-1 text-center text-3xl font-bold border-4 border-amber-400 rounded-2xl py-3 focus:outline-none focus:border-amber-600"
              />
              <button
                onClick={() => setSeats(s => Math.min(table.capacity, s + 1))}
                className="w-12 h-12 rounded-full bg-green-100 hover:bg-green-200 text-2xl font-bold text-green-700 transition"
              >+</button>
            </div>
          </div>

          <button
            onClick={() => onCreate(seats)}
            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-5 rounded-2xl text-2xl font-bold shadow-xl transition transform hover:scale-105"
          >
            🍽️ Start New Party ({seats} guest{seats !== 1 ? 's' : ''})
          </button>
        </div>
      </div>
    </div>
  );
};

export default PartyModal;
