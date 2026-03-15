// src/components/captain/OrderModal.jsx
import { useState } from 'react';

const OrderModal = ({
  party,
  table,
  categories,
  cart,
  activeCategoryId,
  onCategoryChange,
  onAdd,
  onQty,
  onSend,
  sending,
  onClose
}) => {
  const [search, setSearch] = useState('');

  // Get current category items or search across all
  const currentItems = search.trim()
    ? categories.flatMap(cat => cat.items || []).filter(
        item => item.name.toLowerCase().includes(search.toLowerCase())
      )
    : (categories.find(cat => cat.id === activeCategoryId)?.items || []);

  const cartTotal = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-3xl w-full max-w-6xl max-h-[95vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b-4 border-amber-300 bg-gradient-to-r from-amber-50 to-orange-50 rounded-t-3xl flex-shrink-0">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-3xl font-bold text-amber-800">
                Table {table.tableNumber} — Party #{party.id}
              </h3>
              <p className="text-gray-600 mt-1">{party.occupiedSeats} guest{party.occupiedSeats !== 1 ? 's' : ''}</p>
            </div>
            <button
              onClick={onClose}
              className="text-5xl text-gray-500 hover:text-gray-700 transition leading-none"
            >
              ×
            </button>
          </div>
          {/* Search */}
          <input
            type="text"
            placeholder="🔍 Search menu items..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full px-5 py-3 text-xl border-2 border-amber-300 rounded-2xl focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Left: Categories + Items */}
          <div className="flex-1 overflow-y-auto p-6">
            {/* Category Tabs */}
            {!search && categories.length > 0 && (
              <div className="flex overflow-x-auto gap-3 mb-6 pb-3 border-b-2 border-amber-100">
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => onCategoryChange(cat.id)}
                    className={`px-6 py-3 text-lg font-bold rounded-2xl transition whitespace-nowrap ${
                      activeCategoryId === cat.id
                        ? 'bg-amber-600 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {cat.name}
                    <span className="ml-2 text-sm opacity-75">({cat.items?.length || 0})</span>
                  </button>
                ))}
              </div>
            )}

            {/* Menu Items Grid */}
            {currentItems.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-2xl text-gray-500">
                  {search ? 'No items match your search' : 'No items in this category'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {currentItems.map(item => {
                  const inCart = cart.find(i => i.id === item.id);
                  return (
                    <div
                      key={item.id}
                      className="bg-white border-2 border-gray-100 hover:border-amber-300 p-5 rounded-2xl shadow-md hover:shadow-lg transition"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            {item.veg ? (
                              <span className="w-5 h-5 border-2 border-green-600 rounded-sm flex-shrink-0" title="Veg" />
                            ) : (
                              <span className="w-5 h-5 border-2 border-red-600 rounded-sm bg-red-100 flex-shrink-0" title="Non-Veg" />
                            )}
                            <h4 className="text-lg font-bold text-gray-800 leading-tight">{item.name}</h4>
                          </div>
                          {item.description && (
                            <p className="text-gray-500 text-sm mt-1 line-clamp-2">{item.description}</p>
                          )}
                        </div>
                        <div className="text-xl font-bold text-amber-700 ml-3 flex-shrink-0">₹{item.price}</div>
                      </div>
                      {inCart ? (
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => onQty(item.id, -1)}
                            className="w-9 h-9 rounded-full bg-red-100 hover:bg-red-200 text-xl font-bold text-red-700"
                          >−</button>
                          <span className="flex-1 text-center font-bold text-lg">{inCart.quantity}</span>
                          <button
                            onClick={() => onQty(item.id, 1)}
                            className="w-9 h-9 rounded-full bg-green-100 hover:bg-green-200 text-xl font-bold text-green-700"
                          >+</button>
                        </div>
                      ) : (
                        <button
                          onClick={() => onAdd(item)}
                          className="w-full bg-amber-500 hover:bg-amber-600 text-white py-2.5 rounded-xl text-base font-bold transition"
                        >
                          + Add
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right: Cart */}
          <div className="w-80 border-l-4 border-amber-200 flex flex-col bg-amber-50 rounded-r-3xl flex-shrink-0">
            <div className="p-5 border-b-2 border-amber-200">
              <h4 className="text-2xl font-bold text-amber-800">
                🛒 Order ({cart.length} item{cart.length !== 1 ? 's' : ''})
              </h4>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {cart.length === 0 ? (
                <p className="text-center text-gray-500 py-10 text-lg">No items yet</p>
              ) : (
                cart.map(item => (
                  <div key={item.id} className="bg-white p-4 rounded-xl shadow-sm border border-amber-100">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-semibold text-gray-800 text-sm leading-tight">{item.name}</span>
                      <span className="font-bold text-amber-700 ml-2 text-sm flex-shrink-0">
                        ₹{(item.price * item.quantity).toFixed(0)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onQty(item.id, -1)}
                        className="w-8 h-8 rounded-full bg-red-100 hover:bg-red-200 text-base font-bold text-red-700"
                      >−</button>
                      <span className="flex-1 text-center font-bold">{item.quantity}</span>
                      <button
                        onClick={() => onQty(item.id, 1)}
                        className="w-8 h-8 rounded-full bg-green-100 hover:bg-green-200 text-base font-bold text-green-700"
                      >+</button>
                    </div>
                  </div>
                ))
              )}
            </div>
            {cart.length > 0 && (
              <div className="p-5 border-t-2 border-amber-200 bg-white rounded-br-3xl">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-xl font-bold text-gray-700">Total</span>
                  <span className="text-2xl font-extrabold text-amber-700">₹{cartTotal.toFixed(0)}</span>
                </div>
                <button
                  onClick={onSend}
                  disabled={sending}
                  className={`w-full py-4 text-xl font-bold rounded-2xl shadow-lg transition ${
                    sending
                      ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                      : 'bg-green-600 hover:bg-green-700 text-white'
                  }`}
                >
                  {sending ? 'Sending...' : '📤 Send to Kitchen'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderModal;