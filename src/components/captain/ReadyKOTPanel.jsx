// src/components/captain/ReadyKOTPanel.jsx
import { useEffect } from 'react';

const ReadyKOTPanel = ({ readyKOTs, onServed }) => {

  useEffect(() => {
    if (readyKOTs.length > 0) {
      const audio = new Audio('/kot-beep.mp3');
      audio.play().catch(() => {});
    }
  }, [readyKOTs]);

  if (readyKOTs.length === 0) return null;

  return (
    <div className="mb-16 bg-green-100 border-8 border-green-600 rounded-3xl p-10 animate-pulse">
      <h3 className="text-4xl font-bold text-center mb-8">
        🔔 FOOD READY ({readyKOTs.length})
      </h3>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {readyKOTs.map(kot => (
          <div key={kot.id} className="bg-white p-8 rounded-3xl shadow-2xl">
            <div className="text-2xl font-bold mb-4">
              Table {kot.party?.table?.tableNumber}
            </div>

            {kot.items.map((item, i) => (
              <div key={i}>{item.quantity} × {item.menuItemName}</div>
            ))}

            <button
              onClick={() => onServed(kot.id)}
              className="mt-6 w-full bg-green-600 text-white py-4 rounded-xl text-xl font-bold"
            >
              MARK SERVED
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReadyKOTPanel;
