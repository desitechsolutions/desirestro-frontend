// src/components/captain/PartyModal.jsx
import { useState } from 'react';

const PartyModal = ({ table, parties, onSelect, onCreate, onClose }) => {
  const [seats, setSeats] = useState(1);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <div className="bg-white rounded-3xl p-10 w-full max-w-xl">
        <h3 className="text-3xl font-bold mb-6">
          Table {table.tableNumber}
        </h3>

        {parties.map(p => (
          <button
            key={p.id}
            onClick={() => onSelect(p)}
            className="w-full bg-amber-100 p-4 rounded-xl mb-3 text-xl"
          >
            Party {p.id} ({p.occupiedSeats} seats)
          </button>
        ))}

        <input
          type="number"
          min="1"
          max={table.capacity}
          value={seats}
          onChange={e => setSeats(+e.target.value)}
          className="w-full border p-3 mt-4"
        />

        <button
          onClick={() => onCreate(seats)}
          className="w-full bg-green-600 text-white py-3 rounded-xl mt-4"
        >
          Create Party
        </button>

        <button
          onClick={onClose}
          className="w-full bg-gray-400 text-white py-2 rounded-xl mt-3"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default PartyModal;
