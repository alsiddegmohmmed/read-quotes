import { useEffect, useState } from 'react';
import { Container, Typography, Button, Paper, Alert, IconButton, Box } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import axios from 'axios';
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/react";

export default function Home() {
  const [quotes, setQuotes] = useState([]);
  const [currentQuote, setCurrentQuote] = useState({});
  const [alert, setAlert] = useState(null);
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    fetchQuotes();
  }, []);

  const fetchQuotes = async () => {
    try {
      const response = await fetch('/api/quotes');
      const data = await response.json();
      setQuotes(data);
      if (data.length > 0) {
        setCurrentQuote(data[Math.floor(Math.random() * data.length)]);
      }
    } catch (error) {
      setAlert({ severity: 'error', message: 'Failed to fetch quotes' });
    }
  };

  const handleChangeQuote = () => {
    if (quotes.length > 0) {
      setCurrentQuote(quotes[Math.floor(Math.random() * quotes.length)]);
    }
  };

  const handleCopyQuote = () => {
    const quoteText = `"${currentQuote.Quote}" — ${currentQuote.bookTitle}`;
    navigator.clipboard.writeText(quoteText).then(() => {
      setIsCopied(true);
      setAlert({ severity: 'success', message: 'Quote copied to clipboard!' });
      setTimeout(() => {
        setIsCopied(false);
      }, 3000);
    }).catch(err => {
      console.error('Error copying text: ', err);
      setAlert({ severity: 'error', message: 'Failed to copy quote' });
    });
  };

  const getAdjustedFontSize = (text) => {
    const length = text ? text.length : 0;
    if (length > 400) return '1.0rem';
    if (length > 150) return '1.3rem';
    return '1.3rem';
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
        minHeight: '100vh',
        width: '100%',
        backgroundColor: '#000000',
        padding: 0,
        margin: 0,
      }}
    >
      <Box sx={{ position: 'relative', width: '100%', maxWidth: { xs: '95%', sm: '80%', md: '600px' } }}>
        <IconButton
          onClick={handleCopyQuote}
          sx={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            color: '#FBFEF9',
            padding: '4px',
            zIndex: 1,
          }}
        >
          {isCopied ? (
            <CheckIcon fontSize="small" />
          ) : (
            <ContentCopyIcon fontSize="small" />
          )}
          <Typography variant="caption" sx={{ ml: 0.5, fontSize: '0.6rem' }}>
            {isCopied ? 'Copied!' : 'Copy'}
          </Typography>
        </IconButton>

        <Paper
          elevation={0}
          sx={{
            position: 'relative',
            padding: { xs: '40px 20px', sm: '50px 30px', md: '60px 40px' },
            borderRadius: '10px',
            backgroundColor: '#000000',
            width: '100%',
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            minHeight: '300px',
            maxHeight: '80vh',
            overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              flexGrow: 1,
              overflowY: 'auto',
            }}
          >
            <Typography
              variant="body1"
              component="p"
              sx={{
                fontFamily: 'serif',
                color: '#FFFFFF',
                fontSize: {
                  xs: '1rem', // Small screens
                  sm: '1.4rem', // Medium screens
                  md: getAdjustedFontSize(currentQuote.Quote), // Larger screens adjust if long text
                  lg: getAdjustedFontSize(currentQuote.Quote), // Desktop view adjust if long text
                },
                lineHeight: 1.6,
              }}
            >
              {currentQuote.Quote}
            </Typography>
          </Box>
          <Typography
            variant="caption"
            sx={{
              color: '#888888',
              alignSelf: 'flex-end',
              fontFamily: 'sans-serif',
              fontSize: { xs: '0.7rem', sm: '0.8rem', md: '0.9rem' },
            }}
          >
            —{currentQuote.bookTitle}
          </Typography>
        </Paper>
        <Button
          variant="contained"
          onClick={handleChangeQuote}
          sx={{
            borderRadius: '20px',
            padding: '8px 16px',
            textTransform: 'none',
            fontSize: '12px',
            backgroundColor: '#0E79B2',
            alignSelf: 'flex-start',
            mt: 2,
            '&:hover': {
              backgroundColor: '#0B5F86',
            }
          }}
        >
          Next Quote
        </Button>
      </Box>
      <Analytics />
      <SpeedInsights />
    </Container>
  );
}
