import React, { useEffect, useMemo, useState } from 'react';
import API from '../../services/api';
import { useToast } from '../../components/common/Toast';

const InventoryDashboard = () => {
  const toast = useToast();
  const [ingredients, setIngredients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const [editing, setEditing] = useState(null);
  const [showAdd, setShowAdd] = useState(false);

  const emptyIngredient = {
    name: '',
    unit: '',
    currentStock: 0,
    reorderLevel: 0
  };

  const [form, setForm] = useState(emptyIngredient);

  /* ---------------- FETCH ---------------- */

  const fetchIngredients = async () => {
    try {
      const res = await API.get('/api/ingredients');
      setIngredients(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load inventory');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIngredients();
  }, []);

  /* ---------------- HELPERS ---------------- */

  const getStockPercent = (current, reorder) => {
    if (!reorder || reorder <= 0) return 100;
    return Math.min(Math.round((current / reorder) * 100), 100);
  };

  const getStockColor = (current, reorder) => {
    if (!reorder || reorder <= 0) return 'bg-green-600';
    const ratio = current / reorder;
    if (ratio < 0.3) return 'bg-red-600';
    if (ratio < 0.6) return 'bg-yellow-500';
    return 'bg-green-600';
  };

  /* ---------------- FILTERED DATA ---------------- */

  const filteredIngredients = useMemo(() => {
    return ingredients.filter(i =>
      i.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [ingredients, search]);

  const lowStockItems = ingredients.filter(
    i => i.currentStock < i.reorderLevel
  );

  /* ---------------- CRUD ---------------- */

  const saveIngredient = async () => {
    try {
      if (!form.name.trim() || !form.unit.trim()) {
        toast.error('Name and Unit are required');
        return;
      }

      if (editing) {
        const res = await API.put(`/api/ingredients/${editing.id}`, form);
        setIngredients(prev =>
          prev.map(i => (i.id === editing.id ? res.data : i))
        );
        setEditing(null);
      } else {
        const res = await API.post('/api/ingredients', form);
        setIngredients(prev => [...prev, res.data]);
        setShowAdd(false);
      }

      setForm(emptyIngredient);
    } catch (err) {
      toast.error('Operation failed');
    }
  };

  const deleteIngredient = async (id) => {
    if (!window.confirm('Delete this ingredient?')) return;
    try {
      await API.delete(`/api/ingredients/${id}`);
      setIngredients(prev => prev.filter(i => i.id !== id));
    } catch {
      toast.error('Cannot delete ingredient (may be in use)');
    }
  };

  /* ---------------- UI ---------------- */

  if (loading) {
    return (
      <div className="text-center py-40 text-4xl text-gray-600">
        Loading inventory...
      </div>
    );
  }

  return (
    <>
      {/* HEADER */}
      <div className="flex justify-between items-center mb-14">
        <h2 className="text-5xl font-bold text-amber-800">
          Inventory Dashboard
        </h2>
        <button
          onClick={() => {
            setShowAdd(true);
            setForm(emptyIngredient);
          }}
          className="bg-green-600 hover:bg-green-700 text-white px-8 py-5 rounded-2xl text-2xl font-bold shadow-xl"
        >
          + Add Ingredient
        </button>
      </div>

      {/* SUMMARY */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-16">
        <SummaryCard title="Total Ingredients" value={ingredients.length} />
        <SummaryCard
          title="Low Stock"
          value={lowStockItems.length}
          danger
        />
        <SummaryCard
          title="Healthy Stock"
          value={ingredients.length - lowStockItems.length}
          success
        />
      </div>

      {/* LOW STOCK ALERT */}
      {lowStockItems.length > 0 && (
        <div className="bg-red-50 border-4 border-red-600 p-10 rounded-3xl shadow-2xl mb-20">
          <h3 className="text-4xl font-bold text-red-800 mb-8 text-center">
            ⚠️ Low Stock – Reorder Required
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {lowStockItems.map(i => (
              <div
                key={i.id}
                className="bg-white p-8 rounded-2xl shadow-xl text-center"
              >
                <h4 className="text-3xl font-bold text-red-700">{i.name}</h4>
                <p className="text-xl mt-4">
                  {i.currentStock} {i.unit}
                </p>
                <p className="text-lg text-gray-500 mt-2">
                  Reorder at {i.reorderLevel} {i.unit}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SEARCH */}
      <input
        type="text"
        placeholder="Search ingredient..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="w-full mb-12 px-8 py-6 text-2xl border-4 border-amber-400 rounded-2xl"
      />

      {/* INVENTORY GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
        {filteredIngredients.map(i => {
          const percent = getStockPercent(i.currentStock, i.reorderLevel);
          return (
            <div key={i.id} className="bg-white p-10 rounded-3xl shadow-3xl">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-3xl font-bold">{i.name}</h3>
                <span className="text-xl text-gray-500">{i.unit}</span>
              </div>

              <div className="text-5xl font-bold text-amber-700 mb-6">
                {i.currentStock}
              </div>

              <div className="w-full bg-gray-300 rounded-full h-10 overflow-hidden mb-6">
                <div
                  className={`${getStockColor(
                    i.currentStock,
                    i.reorderLevel
                  )} h-full text-white text-lg flex items-center justify-center transition-all`}
                  style={{ width: `${percent}%` }}
                >
                  {percent}%
                </div>
              </div>

              <p className="text-lg text-gray-600 mb-6">
                Reorder at {i.reorderLevel} {i.unit}
              </p>

              <div className="flex gap-4">
                <button
                  onClick={() => {
                    setEditing(i);
                    setForm(i);
                  }}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold"
                >
                  Edit
                </button>
                <button
                  onClick={() => deleteIngredient(i.id)}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl font-bold"
                >
                  Delete
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL */}
      {(showAdd || editing) && (
        <Modal
          title={editing ? 'Edit Ingredient' : 'Add Ingredient'}
          onClose={() => {
            setShowAdd(false);
            setEditing(null);
            setForm(emptyIngredient);
          }}
          onSave={saveIngredient}
          form={form}
          setForm={setForm}
        />
      )}
    </>
  );
};

/* ---------------- COMPONENTS ---------------- */

const SummaryCard = ({ title, value, danger, success }) => (
  <div
    className={`p-10 rounded-3xl shadow-2xl text-center ${
      danger
        ? 'bg-red-100'
        : success
        ? 'bg-green-100'
        : 'bg-amber-100'
    }`}
  >
    <h4 className="text-2xl font-semibold mb-4">{title}</h4>
    <div className="text-5xl font-bold">{value}</div>
  </div>
);

const Modal = ({ title, onClose, onSave, form, setForm }) => (
  <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
    <div className="bg-white rounded-3xl p-12 w-full max-w-2xl shadow-4xl">
      <h3 className="text-4xl font-bold mb-10 text-center">{title}</h3>

      {['name', 'unit', 'currentStock', 'reorderLevel'].map(field => (
        <input
          key={field}
          type={field.includes('Stock') || field.includes('Level') ? 'number' : 'text'}
          placeholder={field}
          value={form[field] ?? ''}
          onChange={e =>
            setForm({
              ...form,
              [field]: field.includes('Stock') || field.includes('Level')
                ? Number(e.target.value)
                : e.target.value
            })
          }
          className="w-full mb-6 px-6 py-4 text-2xl border-4 border-amber-400 rounded-xl"
        />
      ))}

      <div className="flex gap-6 mt-10">
        <button
          onClick={onSave}
          className="flex-1 bg-green-600 hover:bg-green-700 text-white py-5 rounded-xl text-2xl font-bold"
        >
          Save
        </button>
        <button
          onClick={onClose}
          className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-5 rounded-xl text-2xl font-bold"
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
);

export default InventoryDashboard;
