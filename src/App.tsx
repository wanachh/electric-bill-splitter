import { useState, useMemo, useEffect } from 'react';

type Theme = 'light' | 'dark';

function getInitialTheme(): Theme {
  const stored = localStorage.getItem('theme') as Theme | null;
  if (stored === 'light' || stored === 'dark') return stored;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

type Person = {
  id: string;
  name: string;
  days: string;
  error?: string;
};

function App() {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);
  const [totalPrice, setTotalPrice] = useState<string>('');
  const [totalPriceError, setTotalPriceError] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [people, setPeople] = useState<Person[]>([
    { id: '1', name: 'Person 1', days: '' },
    { id: '2', name: 'Person 2', days: '' }
  ]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

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
        if (value === '0' || value === '' || value == null) {
          updatedPerson.error = 'Days cannot be zero or empty';
          setErrorMessage(updatedPerson.error);
        } else {
          updatedPerson.error = undefined;
          setErrorMessage('');
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
        <button
          className="theme-toggle"
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
          {theme === 'light' ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="5"></circle>
              <line x1="12" y1="1" x2="12" y2="3"></line>
              <line x1="12" y1="21" x2="12" y2="23"></line>
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
              <line x1="1" y1="12" x2="3" y2="12"></line>
              <line x1="21" y1="12" x2="23" y2="12"></line>
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
            </svg>
          )}
        </button>
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
                if (val === '' || parseFloat(val) === 0) {
                  setTotalPriceError('Price cannot be zero or empty');
                } else {
                  setTotalPriceError('');
                }
                setTotalPrice(val);
              }
            }}
            style={totalPriceError ? { borderColor: 'var(--danger)' } : {}}
          />
          {totalPriceError && (
            <span className="error-text">
              {totalPriceError}
            </span>
          )}
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
                placeholder="31"
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
            {errorMessage ? (
              <div className="empty-state">
                Please enter a valid total price and at least one person's days to see the breakdown.
              </div>
            ) : (
              results.map(res => (
                <div key={res.id} className="result-item">
                  <span className="result-name">{res.name}</span>
                  <span className="result-amount">
                    ฿{res.amount.toFixed(2)}
                  </span>
                </div>
              ))
            )}
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
