import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Toolbar,
  TextField,
  InputAdornment,
  Button
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Search as SearchIcon,
  Star as StarIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const AdminReviews = () => {
  const navigate = useNavigate();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // Check if user is admin
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    fetchReviews();
  }, [navigate]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:4000/api/reviews/admin', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          navigate('/login');
          return;
        }
        throw new Error('Failed to fetch reviews');
      }

      const data = await response.json();
      setReviews(data.data || []);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (reviewId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:4000/api/reviews/${reviewId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) {
        throw new Error('Failed to update review status');
      }

      // Update the reviews list
      setReviews(reviews.map(review => 
        review._id === reviewId ? { ...review, status: newStatus } : review
      ));
    } catch (err) {
      setError(err.message);
    }
  };

  const filteredReviews = reviews.filter(review => {
    const matchesStatus = statusFilter === 'all' || review.status === statusFilter;
    const matchesType = typeFilter === 'all' || review.type === typeFilter;
    const matchesSearch = searchQuery === '' || 
      review.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      review.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      review.message.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesStatus && matchesType && matchesSearch;
  });

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Reviews & Feedback Management
        </Typography>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={fetchReviews}
        >
          Refresh
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <TextField
          label="Search"
          variant="outlined"
          size="small"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ minWidth: 200 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={statusFilter}
            label="Status"
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <MenuItem value="all">All Status</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="approved">Approved</MenuItem>
            <MenuItem value="rejected">Rejected</MenuItem>
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Type</InputLabel>
          <Select
            value={typeFilter}
            label="Type"
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <MenuItem value="all">All Types</MenuItem>
            <MenuItem value="review">Reviews</MenuItem>
            <MenuItem value="feedback">Feedback</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Type</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Rating</TableCell>
              <TableCell>Message</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredReviews.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  No reviews found
                </TableCell>
              </TableRow>
            ) : (
              filteredReviews.map((review) => (
                <TableRow key={review._id}>
                  <TableCell>
                    <Chip 
                      label={review.type === 'review' ? 'Review' : 'Feedback'}
                      color={review.type === 'review' ? 'primary' : 'secondary'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{review.name}</TableCell>
                  <TableCell>{review.email}</TableCell>
                  <TableCell>
                    {review.type === 'review' && (
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {[...Array(5)].map((_, index) => (
                          <StarIcon
                            key={index}
                            sx={{
                              color: index < review.rating ? '#fbbf24' : '#e5e7eb',
                              fontSize: '1rem'
                            }}
                          />
                        ))}
                      </Box>
                    )}
                  </TableCell>
                  <TableCell>
                    <Typography
                      sx={{
                        maxWidth: 200,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {review.message}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={review.status}
                      color={
                        review.status === 'approved'
                          ? 'success'
                          : review.status === 'rejected'
                          ? 'error'
                          : 'warning'
                      }
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {new Date(review.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      {review.status === 'pending' && (
                        <>
                          <IconButton
                            size="small"
                            color="success"
                            onClick={() => handleUpdateStatus(review._id, 'approved')}
                            title="Approve"
                          >
                            <CheckCircleIcon />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleUpdateStatus(review._id, 'rejected')}
                            title="Reject"
                          >
                            <CancelIcon />
                          </IconButton>
                        </>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default AdminReviews; 