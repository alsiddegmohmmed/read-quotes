import { useEffect, useState } from 'react';
import { Container, Typography, Button, Paper, Alert, TextField } from '@mui/material';
import axios from 'axios';
import { SpeedInsights } from "@vercel/speed-insights/next"

export default function Home() {
  const [quotes, setQuotes] = useState([]);
  const [currentQuote, setCurrentQuote] = useState("");
  const [alert, setAlert] = useState(null);
  const [startId, setStartId] = useState("");
  const [endId, setEndId] = useState("");

  useEffect(() => {
    fetchQuotes();
  }, []);

  const fetchQuotes = async () => {
    try {
      const response = await fetch('/api/quotes');
      const data = await response.json();
      setQuotes(data);
      if (data.length > 0) {
        setCurrentQuote(data[Math.floor(Math.random() * data.length)].Quote);
      }
    } catch (error) {
      setAlert({ severity: 'error', message: 'Failed to fetch quotes' });
    }
  };

  const handleChangeQuote = () => {
    if (quotes.length > 0) {
      setCurrentQuote(quotes[Math.floor(Math.random() * quotes.length)].Quote);
    }
  };

  const handleUpload = async () => {
    try {
      const response = await axios.post('/api/quotes');

      if (response.status === 200) {
        setAlert({ severity: 'success', message: response.data.message });
        fetchQuotes(); // Refresh the quotes
      }
    } catch (error) {
      console.error('Error uploading quotes:', error);
      setAlert({ severity: 'error', message: 'Failed to upload quotes' });
    }
  };

  const handleDelete = async () => {
    try {
      const response = await axios.post('/api/deleteQuotes', {
        startId,
        endId
      });

      if (response.status === 200) {
        setAlert({ severity: 'success', message: response.data.message });
        fetchQuotes(); // Refresh the quotes
      }
    } catch (error) {
      console.error('Error deleting quotes:', error);
      setAlert({ severity: 'error', message: 'Failed to delete quotes' });
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
        backgroundColor: '#363636',
        padding: 0,
        margin: 0,
      }}
    >
      {alert && <Alert severity={alert.severity}>{alert.message}</Alert>}
      <Paper
        elevation={3}
        sx={{
          padding: '20px',
          borderRadius: '10px',
          backgroundColor: '#101010',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          maxWidth: '600px',
          textAlign: 'center',
          margin: '20px',
          width: '90%',
        }}
      >
        <Typography variant="body1" component="p" sx={{ fontStyle: 'poppins', color: '#FBFEF9', marginBottom: '20px' }}>
          {currentQuote}
        </Typography>
        <Button
          variant="contained"
          onClick={handleChangeQuote}
          sx={{
            borderRadius: '20px',
            padding: '10px 20px',
            textTransform: 'none',
            fontSize: '13px',
            backgroundColor: '#0E79B2',
            '&:hover': {
              backgroundColor: '#0B5F86', // Adjust the hover color if needed
            }
          }}
        >
          Next Quote
        </Button>

        {/* <Button
          variant="contained"
          color="secondary"
          onClick={handleUpload}
          sx={{
            borderRadius: '20px',
            padding: '10px 20px',
            textTransform: 'none',
            fontSize: '13px',
            marginTop: '10px',
          }}
        >
          Import CSV Quotes
        </Button> */}
        {/* <TextField
          label="Start ObjectId"
          variant="outlined"
          value={startId}
          onChange={(e) => setStartId(e.target.value)}
          sx={{ marginTop: '20px', width: '80%' }}
        />
        <TextField
          label="End ObjectId"
          variant="outlined"
          value={endId}
          onChange={(e) => setEndId(e.target.value)}
          sx={{ marginTop: '20px', width: '80%' }}
        />
        <Button
          variant="contained"
          color="error"
          onClick={handleDelete}
          sx={{
            borderRadius: '20px',
            padding: '10px 20px',
            textTransform: 'none',
            fontSize: '13px',
            marginTop: '20px',
          }}
        >
          Delete Quotes
        </Button> */}
      </Paper>
    </Container>
  );
}
