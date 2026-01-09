// src/components/captain/TableGrid.jsx
const TableGrid = ({ tables, selectedTable, onSelect }) => {

  const getStatusColor = (status) => {
    switch (status) {
      case 'EMPTY': return 'bg-green-100 border-green-600';
      case 'PARTIALLY_OCCUPIED': return 'bg-yellow-100 border-yellow-600';
      case 'FULL': return 'bg-amber-100 border-amber-600';
      default: return 'bg-gray-100 border-gray-400';
    }
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-8">
      {tables.map(table => (
        <div
          key={table.id}
          onClick={() => onSelect(table)}
          className={`p-12 rounded-3xl shadow-2xl border-8 text-center cursor-pointer transition transform hover:scale-110
            ${getStatusColor(table.status)}
            ${selectedTable?.id === table.id ? 'ring-8 ring-amber-500' : ''}`}
        >
          <div className="text-5xl font-bold">{table.tableNumber}</div>
          <div className="text-xl mt-4">{table.status.replace('_', ' ')}</div>
          <div className="text-lg mt-2">
            {table.occupiedSeats || 0}/{table.capacity}
          </div>
        </div>
      ))}
    </div>
  );
};

export default TableGrid;
