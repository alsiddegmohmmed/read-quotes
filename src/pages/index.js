import { useEffect, useState } from 'react';

export default function Home() {
  const [quotes, setQuotes] = useState([]);
  const [currentQuote, setCurrentQuote] = useState("");
  
  useEffect(() => {
    fetch('/api/quotes')
      .then((response) => response.json())
      .then((data) => {
        setQuotes(data);
        if (data.length > 0) {
          setCurrentQuote(data[Math.floor(Math.random() * data.length)].Quote);
        }
      });
  }, []);

  useEffect(() => {
    if (quotes.length > 0) {
      const interval = setInterval(() => {
        setCurrentQuote(quotes[Math.floor(Math.random() * quotes.length)].Quote);
      }, 10000); // 5000ms = 5 seconds

      return () => clearInterval(interval); // Cleanup interval on component unmount
    }
  }, [quotes]);

  return (
    <div style={styles.container}>
      <div style={styles.quoteBox}>
        <p style={styles.quote}>{currentQuote}</p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    backgroundColor: '#f0f0f0',
  },
  quoteBox: {
    padding: '20px',
    borderRadius: '10px',
    backgroundColor: 'white',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    maxWidth: '600px',
    textAlign: 'center',
  },
  quote: {
    fontSize: '1.5em',
    fontStyle: 'italic',
    color: '#333',
  },
};
