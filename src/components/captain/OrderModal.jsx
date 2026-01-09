// src/components/captain/OrderModal.jsx

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
  // Compute current items safely
  const currentItems = categories
    .find(cat => cat.id === activeCategoryId)
    ?.items || [];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-3xl w-full max-w-6xl max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="p-8 border-b-4 border-amber-300 sticky top-0 bg-white z-10">
          <div className="flex justify-between items-center">
            <h3 className="text-4xl font-bold text-amber-800">
              Ordering for Party {party.id} — Table {table.tableNumber}
            </h3>
            <button
              onClick={onClose}
              className="text-5xl text-gray-600 hover:text-gray-800 transition"
            >
              ×
            </button>
          </div>
        </div>

        <div className="p-8">
          {/* Category Tabs */}
          {categories.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-2xl text-gray-600">No menu categories available</p>
            </div>
          ) : (
            <div className="flex overflow-x-auto gap-3 mb-8 pb-3 border-b-4 border-amber-200">
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => onCategoryChange(cat.id)}
                  className={`px-8 py-4 text-2xl font-bold rounded-t-3xl transition whitespace-nowrap ${
                    activeCategoryId === cat.id
                      ? 'bg-amber-600 text-white shadow-2xl'
                      : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          )}

          {/* Menu Items */}
          {currentItems.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-3xl text-gray-600">
                {activeCategoryId ? 'No items in this category' : 'Select a category to view items'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {currentItems.map(item => (
                <div
                  key={item.id}
                  className="bg-gradient-to-br from-white to-amber-50 p-8 rounded-3xl shadow-2xl hover:shadow-3xl transition transform hover:-translate-y-2"
                >
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h4 className="text-3xl font-bold flex items-center gap-4">
                        {item.name}
                        {item.veg ? (
                          <span className="w-8 h-8 border-4 border-green-600 rounded-lg"></span>
                        ) : (
                          <span className="w-8 h-8 border-4 border-red-600 rounded-lg bg-red-100"></span>
                        )}
                      </h4>
                      {item.description && (
                        <p className="text-gray-600 mt-3 text-lg">{item.description}</p>
                      )}
                    </div>
                    <div className="text-4xl font-bold text-amber-700">₹{item.price}</div>
                  </div>
                  <button
                    onClick={() => onAdd(item)}
                    className="w-full bg-amber-600 hover:bg-amber-700 text-white py-6 rounded-2xl text-2xl font-bold shadow-xl transition"
                  >
                    Add to Order
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Cart Section */}
          {cart.length > 0 && (
            <div className="bg-gradient-to-r from-amber-100 to-orange-100 p-10 rounded-3xl shadow-2xl">
              <h4 className="text-4xl font-bold mb-8">Current Order</h4>
              <div className="space-y-6">
                {cart.map(item => (
                  <div key={item.id} className="flex justify-between items-center py-6 border-b-2 border-amber-300">
                    <div>
                      <span className="text-2xl font-bold">{item.quantity} × {item.name}</span>
                    </div>
                    <div className="flex items-center gap-8">
                      <div className="flex items-center gap-6">
                        <button
                          onClick={() => onQty(item.id, -1)}
                          className="w-16 h-16 rounded-full bg-red-300 hover:bg-red-400 text-4xl font-bold"
                        >
                          −
                        </button>
                        <span className="text-3xl font-bold w-20 text-center">{item.quantity}</span>
                        <button
                          onClick={() => onQty(item.id, 1)}
                          className="w-16 h-16 rounded-full bg-green-300 hover:bg-green-400 text-4xl font-bold"
                        >
                          +
                        </button>
                      </div>
                      <span className="text-3xl font-bold text-amber-800">
                        ₹{(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="text-right mt-10">
                <div className="text-5xl font-bold text-amber-800">
                  Total: ₹{cart.reduce((sum, i) => sum + i.price * i.quantity, 0).toFixed(2)}
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-8 mt-12">
            <button
              onClick={() => {
                // Clear cart — we can't use setCart directly here, but parent can pass a clear function
                // Or just close and clear in parent
                onClose();
              }}
              className="px-16 py-8 bg-gray-500 hover:bg-gray-600 text-white text-3xl font-bold rounded-3xl shadow-2xl"
            >
              Clear & Close
            </button>
            <button
              onClick={onSend}
              disabled={sending || cart.length === 0}
              className={`px-20 py-8 text-4xl font-bold rounded-3xl shadow-3xl transition transform hover:scale-110 ${
                sending || cart.length === 0
                  ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700 text-white'
              }`}
            >
              {sending ? 'Sending...' : 'Send to Kitchen'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderModal;