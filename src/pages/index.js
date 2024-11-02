import { useEffect, useState, useRef } from 'react';
import { Container, Typography, Button, Paper, IconButton, Box, CircularProgress , TextField} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import ShareIcon from '@mui/icons-material/Share';
import html2canvas from 'html2canvas';
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/react";
import axios from 'axios';
export default function Home() {
  const [quotes, setQuotes] = useState([]);
  const [currentQuote, setCurrentQuote] = useState({});
  const [alert, setAlert] = useState(null);
  const [isCopied, setIsCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const quoteCardRef = useRef(null);
  const [startId, setStartId] = useState("");
  const [endId, setEndId] = useState("");
  const [bookInfo, setBookInfo] = useState({ bookCount: 0, bookTitles: [] });



  useEffect(() => {
    
    fetchQuotes();
    fetchBookInfo();

  }, []);

  const fetchQuotes = async () => {
    try {
      const response = await fetch('/api/quotes');
      const data = await response.json();
      setQuotes(data);
      if (data.length > 0) {
        setCurrentQuote(data[Math.floor(Math.random() * data.length)]);
      }
      setLoading(false);
    } catch (error) {
      setAlert({ severity: 'error', message: 'Failed to fetch quotes' });
      setLoading(false);
    }
  };
  
  const fetchBookInfo = async () => {
    try {
      const response = await axios.get('/api/quotes?type=books');

      const books = response.data;
      const bookTitles = [...new Set(books.map(book => book.bookTitle))];
      const bookCount = bookTitles.length;
      console.log('Book Titles:', bookTitles); 

      setBookInfo({ bookCount, bookTitles });
    } catch (error) {
      console.error('Error fetching book info:', error);
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

  const handleShare = async () => {
    const quoteText = `"${currentQuote.Quote}" — ${currentQuote.bookTitle}`;
    const shareData = {
      title: 'Quote from Siddeg',
      text: quoteText,
      url: window.location.href
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.error('Error sharing:', err);
        setAlert({ severity: 'error', message: 'Failed to share quote' });
      }
    } else {
      setAlert({ severity: 'info', message: 'Sharing is not supported on this browser' });
    }
  };

  const handleShareImage = async () => {
    if (quoteCardRef.current) {
      try {
        const canvas = await html2canvas(quoteCardRef.current, { backgroundColor: null });
        const imageData = canvas.toDataURL('image/png');

        const blob = await (await fetch(imageData)).blob();
        const file = new File([blob], 'quote.png', { type: 'image/png' });

        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: 'Quote from Siddeg',
            text: `"${currentQuote.Quote}" — ${currentQuote.bookTitle} by ${currentQuote.Author}`,
          });
        } else {
          const link = document.createElement('a');
          link.href = imageData;
          link.download = 'quote.png';
          link.click();
        }
      } catch (err) {
        console.error('Error sharing image:', err);
        setAlert({ severity: 'error', message: 'Failed to share quote as image' });
      }
    }
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
      {loading ? (
        <CircularProgress color="inherit" />
      ) : (
        <>
        
          
          <Box sx={{ position: 'absolute', top: '10px', left: '10px', zIndex: 1, display: 'flex' }}>
            <Typography variant="body1" sx={{ color: '#FBFEF9', mt: 2 }}>
              Total Books: {bookInfo.bookCount}
            </Typography>
          </Box> 
         

          <Box sx={{ position: 'relative', width: '100%', maxWidth: { xs: '95%', sm: '80%', md: '600px' } }}>
            <Box sx={{ position: 'absolute', top: '10px', right: '10px', zIndex: 1, display: 'flex' }}>
              <IconButton
                onClick={handleCopyQuote}
                sx={{
                  color: '#FBFEF9',
                  padding: '4px',
                  marginRight: '8px',
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
              <IconButton
                onClick={handleShare}
                sx={{
                  color: '#FBFEF9',
                  padding: '4px',
                }}
              >
                <ShareIcon fontSize="small" />
                <Typography variant="caption" sx={{ ml: 0.5, fontSize: '0.6rem' }}>
                  Share
                </Typography>
              </IconButton>
              <IconButton
                onClick={handleShareImage}
                sx={{
                  color: '#FBFEF9',
                  padding: '4px',
                  marginLeft: '8px',
                }}
              >
                <ShareIcon fontSize="small" />
                <Typography variant="caption" sx={{ ml: 0.5, fontSize: '0.6rem' }}>
                  Share Image
                </Typography>
              </IconButton>
            </Box>

            <Paper
              elevation={0}
              ref={quoteCardRef}
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
                      xs: '1rem',
                      sm: '1.4rem',
                      md: getAdjustedFontSize(currentQuote.Quote),
                      lg: getAdjustedFontSize(currentQuote.Quote),
                    },
                    lineHeight: 1.6,
                    textAlign: 'left',
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
                  textAlign: 'right',
                }}
              >
                —{currentQuote.bookTitle} by {currentQuote.Author}
              </Typography>
            </Paper>
            
            <Button
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
        </Button>
        
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
          <Typography
            variant="body2"
            sx={{
              color: '#888888',
              mt: 4,
              fontFamily: 'sans-serif',
              textAlign: 'center',
            }}
          >
            © {new Date().getFullYear()} Siddeg Omer. All rights reserved.
          </Typography> 

          
        </>
      )}
      <Analytics />
      <SpeedInsights />
    </Container>
  )
}
