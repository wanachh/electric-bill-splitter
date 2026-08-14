import { useState, useMemo } from 'react';

type Person = {
  id: string;
  name: string;
  days: string;
  error?: string;
};

function App() {
  const [totalPrice, setTotalPrice] = useState<string>('');
  const [people, setPeople] = useState<Person[]>([
    { id: '1', name: 'Person 1', days: '10' },
    { id: '2', name: 'Person 2', days: '30' }
  ]);

  const addPerson = () => {
    setPeople([
      ...people,
      { id: Date.now().toString(), name: `Person ${people.length + 1}`, days: '' }
    ]);
  };

  const removePerson = (id: string) => {
    setPeople(people.filter(p => p.id !== id));
  };

  const updatePerson = (id: string, field: keyof Person, value: string) => {
    setPeople(people.map(p => {
      if (p.id !== id) return p;
      
      const updatedPerson = { ...p, [field]: value };
      
      if (field === 'days') {
        if (value === '0' || value === '') {
          updatedPerson.error = 'Days cannot be zero or empty';
        } else {
          updatedPerson.error = undefined;
        }
      }
      
      return updatedPerson;
    }));
  };

  // Calculate totals
  const { totalDays, results } = useMemo(() => {
    let daysSum = 0;
    const parsedPrice = parseFloat(totalPrice) || 0;

    const parsedPeople = people.map(p => {
      const days = parseInt(p.days) || 0;
      daysSum += days;
      return { ...p, numericDays: days };
    });

    const calculatedResults = parsedPeople.map(p => {
      const amountToPay = daysSum > 0 ? (p.numericDays / daysSum) * parsedPrice : 0;
      return {
        id: p.id,
        name: p.name || 'Unnamed',
        amount: amountToPay
      };
    });

    return { totalDays: daysSum, results: calculatedResults };
  }, [people, totalPrice]);

  return (
    <div className="app-container">
      <header>
        <h1>Electricity Bill Splitter</h1>
        <p className="subtitle">Calculate by proportion of days stayed</p>
      </header>

      <div className="card">
        <h2 className="card-title">Bill Details</h2>
        <div className="input-group">
          <label htmlFor="totalPrice">Total Electricity Price</label>
          <input
            id="totalPrice"
            type="number"
            min="0"
            step="0.01"
            placeholder="e.g. 1500"
            value={totalPrice}
            onChange={(e) => {
              const val = e.target.value;
              // อนุญาตให้พิมพ์ตัวเลขและจุดทศนิยมไม่เกิน 2 ตำแหน่ง
              if (val === '' || /^\d*\.?\d{0,2}$/.test(val)) {
                setTotalPrice(val);
              }
            }}
          />
        </div>
      </div>

      <div className="card">
        <h2 className="card-title">People & Days Stayed</h2>
        
        {people.map((person) => (
          <div key={person.id} className="person-row">
            <div className="input-group">
              <label>Name</label>
              <input
                type="text"
                placeholder="Name"
                value={person.name}
                onChange={(e) => updatePerson(person.id, 'name', e.target.value)}
              />
            </div>
            <div className="input-group">
              <label>Days</label>
              <input
                type="number"
                min="1"
                placeholder="0"
                value={person.days}
                onChange={(e) => updatePerson(person.id, 'days', e.target.value)}
                style={person.error ? { borderColor: 'var(--danger)' } : {}}
              />
              {person.error && (
                <span className="error-text">
                  {person.error}
                </span>
              )}
            </div>
            <button 
              className="btn btn-danger btn-icon" 
              onClick={() => removePerson(person.id)}
              title="Remove person"
              aria-label="Remove person"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 6h18"></path>
                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
              </svg>
            </button>
          </div>
        ))}

        <button className="btn btn-add" onClick={addPerson}>
          + Add Person
        </button>
      </div>

      <div className="card">
        <h2 className="card-title">Results Breakdown</h2>
        {results.length > 0 && parseFloat(totalPrice) > 0 && totalDays > 0 ? (
          <div className="results-list">
            {results.map(res => (
              <div key={res.id} className="result-item">
                <span className="result-name">{res.name}</span>
                <span className="result-amount">
                  ฿{res.amount.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            Please enter a valid total price and at least one person's days to see the breakdown.
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
