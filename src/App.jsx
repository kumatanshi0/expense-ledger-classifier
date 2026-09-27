
import { useState,useEffect } from 'react'
import heroImg from './assets/hero.png'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import './App.css'

function App() {
  const [text, setText] = useState("");
  const [result, setResult] = useState(null);
  const [confirmed, setConfirmed] = useState(false);
  const [showCorrectionForm, setShowCorrectionForm] = useState(false);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [note, setNote] = useState("");
  async function handleClassify() {
    const response= await fetch("http://localhost:5000/classify", {
      method: "POST",
      headers: { "Content-Type" : "application/json"},
      body: JSON.stringify({text:text}), 
    });
    const data = await response.json();
    console.log(data);
    setResult(data);
    setConfirmed(false);
    setShowCorrectionForm(false);
  }
  function handleConfirm(){
    setConfirmed(true);
  }
  function handleReject(){
    setShowCorrectionForm(true);
  }

  useEffect(() =>{
    async function loadCategories() {
      const response= await fetch("http://localhost:5000/categories");
      const data = await response.json();
      setCategories(data.categories);
    }
    loadCategories();
  }, []);

  async function handleSubmitCorrection(){
    setResult({...result,Category:selectedCategory});
    setConfirmed(true);
    setShowCorrectionForm(false);

    await fetch("http://localhost:5000/correct", {
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({text:text, corrected_category:selectedCategory, note:note})
    })
  }

 return (
  <div className='page'>
    <h1 className='header'>Expense Ledger</h1>
    <textarea value={text} onChange={(e) => setText(e.target.value)} rows={3} />
    <button onClick={handleClassify}>Classify</button>
    {result && (
    <div className='receipt'>
    <p className='receipt-row'>Category: {result.Category}</p>
    <p className='receipt-row'>Amount: {result.Amount}</p>
    <p className='receipt-row'>Type: <span className={result.Type === "Income" ? "income" : "expense"}>{result.Type}</span></p>
    <p className="receipt-row">Confidence: {Math.round(result.Confidence * 100)}%</p>
    </div>
    )}
    {result && !confirmed && (
      <div className='confirm-prompt'>
        <p>Is this correct?</p>
        <button onClick={handleConfirm}>Yes</button>
        <button onClick={handleReject}>No</button>
      </div>
    )}
    {showCorrectionForm && (
  <div className='correction-form'>
    <p>What's the correct category?</p>
    <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
       <option value="">-- Select --</option>
      {categories.map((cat) => (
        <option key={cat} value={cat}>{cat}</option>
      ))}
    </select>
    <button onClick={handleSubmitCorrection}>Submit Correction</button>
     <textarea
  value={note}
  onChange={(e) => setNote(e.target.value)}
  placeholder="Optional: describe what was wrong"
  rows={2}
/>
  </div>
    )}
   
  </div>
);
}

export default App
