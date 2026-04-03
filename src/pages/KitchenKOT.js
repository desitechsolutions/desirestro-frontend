// src/pages/KitchenKOT.js

import React, { useState, useEffect, useRef } from 'react';
import Navbar from '../components/Navbar';
import API from '../services/api';
import { useToast } from '../components/common/Toast';

const KitchenKOT = () => {
  const toast = useToast();
  const [kots, setKots] = useState([]);
  const [interacted, setInteracted] = useState(false);
  const prevKOTsRef = useRef([]); // To detect truly new KOTs
  const hasInteracted = useRef(false); // Unlock audio after first click/keypress

  // Unlock audio on first user interaction (required by browsers)
  useEffect(() => {
    const unlockAudio = () => {
      hasInteracted.current = true;
      setInteracted(true);
      document.removeEventListener('click', unlockAudio);
      document.removeEventListener('keydown', unlockAudio);
      document.removeEventListener('touchstart', unlockAudio);
    };

    document.addEventListener('click', unlockAudio);
    document.addEventListener('keydown', unlockAudio);
    document.addEventListener('touchstart', unlockAudio); // For tablets

    return () => {
      document.removeEventListener('click', unlockAudio);
      document.removeEventListener('keydown', unlockAudio);
      document.removeEventListener('touchstart', unlockAudio);
    };
  }, []);

  const playAlertSound = () => {
    if (!hasInteracted.current) {
      console.log('🔇 Sound blocked until you click or tap the screen once');
      return;
    }
    const audio = new Audio('/kot-beep.mp3');
    audio.volume = 0.8;
    audio.play().catch(e => console.warn('Audio play failed (very rare):', e));
  };

  const fetchKOTs = async () => {
    try {
      const res = await API.get('/api/kot/active');
      const newKOTs = res.data || [];

      // Detect if there's a genuinely new KOT by comparing IDs
      const previousIds = new Set(prevKOTsRef.current.map(k => k.id));
      const hasNewKOT = newKOTs.some(kot => kot.id && !previousIds.has(kot.id));

      if (hasNewKOT) {
        playAlertSound();
        document.title = `🔔 NEW ORDER! (${newKOTs.length} active)`;
      } else {
        document.title = `KOT Display (${newKOTs.length} active)`;
      }

      setKots(newKOTs);
      prevKOTsRef.current = newKOTs;
    } catch (err) {
      console.error('Error fetching KOTs:', err);
      document.title = 'KOT Display (Error)';
    }
  };

  useEffect(() => {
    fetchKOTs(); // Initial fetch
    const interval = setInterval(fetchKOTs, 5000); // Poll every 5 seconds

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Navbar />
      <div className="p-8">
        <h2 className="text-5xl font-bold text-center mb-12 text-amber-400">
          KOT Display
        </h2>

        {kots.length === 0 ? (
          <div className="text-center text-4xl text-gray-400 mt-40">
            No active KOTs — All Clear!
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
            {kots.map(kot => (
              <div
                key={kot.id}
                className="bg-gray-800 rounded-2xl shadow-2xl p-8 border-l-8 border-amber-500 animate-pulse-once"
              >
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <div className="text-3xl font-bold">{kot.kotNumber || 'KOT'}</div>
                    <div className="text-xl text-amber-300 mt-2">
                        Table {kot.party?.table?.tableNumber || '??'} 
                        {kot.party?.id && `• Party ${kot.party.id}`}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-400">Order Time</div>
                    <div className="text-lg">
                      {kot.createdAt
                        ? new Date(kot.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : '--'}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  {kot.items && kot.items.length > 0 ? (
                    kot.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex justify-between text-lg bg-gray-700 px-4 py-3 rounded-lg"
                      >
                        <span>
                          {item.quantity} × {item.menuItemName}
                        </span>
                        <span className="text-amber-300">
                          ₹{(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-gray-500">No items</div>
                  )}
                </div>

                <div className="mt-8 pt-6 border-t border-gray-700 text-center space-y-4">
                <span className="inline-block px-8 py-4 bg-red-600 rounded-full text-2xl font-bold">
                    {kot.status || 'NEW'}
                </span>

                {kot.status === 'NEW' && (
                    <div className="mt-6">
                    <button
                        onClick={async () => {
                        try {
                            await API.patch(`/api/kot/${kot.id}/ready`);
                            // Immediate optimistic update
                            setKots(prev => prev.filter(k => k.id !== kot.id));
                            playAlertSound(); // Optional soft confirmation beep
                        } catch (err) {
                            toast.error('Failed to mark as ready');
                        }
                        }}
                        className="px-12 py-6 bg-green-600 hover:bg-green-700 text-white text-2xl font-bold rounded-xl shadow-lg transition transform hover:scale-105"
                    >
                        MARK AS READY
                    </button>
                    </div>
                )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Hint for first-time users */}
      {!interacted && (
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-amber-600 text-white px-8 py-4 rounded-full text-xl font-bold shadow-2xl animate-bounce">
          👆 Click or tap anywhere to enable sound alerts 🔔
        </div>
      )}
    </div>
  );
};

export default KitchenKOT;