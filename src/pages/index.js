import { useEffect, useState } from 'react';
import { Container, Typography, Button, Paper } from '@mui/material';

export default function Home() {
  const [quotes, setQuotes] = useState([]);
  const [currentQuote, setCurrentQuote] = useState("");

  useEffect(() => {
    fetch('/api/quotes')
      .then((response) => response.json())
      .then((data) => {
        console.log('Fetched data:', data); // Add this line to check the fetched data
        setQuotes(data);
        if (data.length > 0) {
          setCurrentQuote(data[Math.floor(Math.random() * data.length)].Quote);
        }
      });
  }, []);

  const handleChangeQuote = () => {
    if (quotes.length > 0) {
      setCurrentQuote(quotes[Math.floor(Math.random() * quotes.length)].Quote);
    }
  };

  return (
    <Container
      disableGutters
      maxWidth={false}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        width: '100vw',
        backgroundColor: '#f0f0f0',
        padding: 0,
        margin: 0,
      }}
    >
      <Paper
        elevation={3}
        sx={{
          padding: '20px',
          borderRadius: '10px',
          backgroundColor: '#ffffff',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          maxWidth: '600px',
          textAlign: 'center',
          margin: '20px',
          width: '90%',
        }}
      >
        <Typography variant="body1" component="p" sx={{ fontStyle: 'poppins', color: '#333', marginBottom: '20px' }}>
          {currentQuote}
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={handleChangeQuote}
          sx={{
            borderRadius: '20px',
            padding: '10px 20px',
            textTransform: 'none',
            fontSize: '13px',
          }}
        >
          Next Quote
        </Button>
      </Paper>
    </Container>
  );
}
