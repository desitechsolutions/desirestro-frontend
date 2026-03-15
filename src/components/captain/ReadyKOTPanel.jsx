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
    <div className="mb-10 bg-green-50 border-4 border-green-500 rounded-3xl p-8 shadow-xl">
      <h3 className="text-3xl font-bold text-center text-green-800 mb-6 flex items-center justify-center gap-3">
        <span className="animate-bounce">🔔</span>
        FOOD READY — {readyKOTs.length} KOT{readyKOTs.length > 1 ? 's' : ''} to Serve
        <span className="animate-bounce">🔔</span>
      </h3>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {readyKOTs.map(kot => (
          <div key={kot.id} className="bg-white p-6 rounded-2xl shadow-lg border-l-4 border-green-500">
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="text-2xl font-bold text-green-800">
                  Table {kot.party?.table?.tableNumber || '—'}
                </div>
                <div className="text-lg text-gray-600">
                  KOT #{kot.kotNumber} • Party {kot.party?.id}
                </div>
              </div>
              <span className="bg-green-100 text-green-800 text-sm font-bold px-3 py-1 rounded-full">
                READY
              </span>
            </div>

            <div className="space-y-2 mb-4">
              {kot.items?.map((item, i) => (
                <div key={i} className="flex justify-between text-lg bg-gray-50 px-3 py-2 rounded-lg">
                  <span>{item.quantity} × {item.menuItemName}</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => onServed(kot.id)}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl text-lg font-bold transition transform hover:scale-105"
            >
              ✓ MARK SERVED
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReadyKOTPanel;
