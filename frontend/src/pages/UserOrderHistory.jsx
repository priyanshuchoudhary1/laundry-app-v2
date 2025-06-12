import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Card,
  CardContent,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Alert,
  Button,
  IconButton,
  Tooltip
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const UserOrderHistory = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userStats, setUserStats] = useState(null);
  const [sortBy, setSortBy] = useState('date');
  const [categoryFilter, setCategoryFilter] = useState('all');

  useEffect(() => {
    const fetchUserStats = async () => {
      try {
        if (!user || user.role !== 'admin') {
          console.log('User not authenticated or not admin');
          navigate('/');
          return;
        }

        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No authentication token found');
        }

        console.log('Fetching user stats for:', userId);
        const response = await fetch(`http://localhost:4000/api/admin/user-stats/${userId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch user statistics');
        }

        const data = await response.json();
        console.log('User stats data:', data);
        setUserStats(data);
      } catch (err) {
        console.error('Error fetching user stats:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserStats();
  }, [userId, user, navigate]);

  const handleSortChange = (event) => {
    setSortBy(event.target.value);
  };

  const handleCategoryFilter = (event) => {
    setCategoryFilter(event.target.value);
  };

  const handleBack = () => {
    console.log('Navigating back to users');
    navigate('/admin-dashboard/users');
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ mt: 2 }}>
        <Typography color="error">{error}</Typography>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={handleBack}
          sx={{ mt: 2 }}
        >
          Back to Users
        </Button>
      </Box>
    );
  }

  if (!userStats) {
    return (
      <Box sx={{ mt: 2 }}>
        <Typography>No user statistics found</Typography>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={handleBack}
          sx={{ mt: 2 }}
        >
          Back to Users
        </Button>
      </Box>
    );
  }

  // Prepare data for charts
  const categoryData = Object.entries(userStats.categoryStats || {}).map(([category, data]) => ({
    name: category,
    value: data.count
  }));

  const paymentData = Object.entries(userStats.paymentMethods || {}).map(([method, count]) => ({
    name: method,
    value: count
  }));

  // Sort and filter orders
  let filteredOrders = [...(userStats.recentOrders || [])];
  if (categoryFilter !== 'all') {
    filteredOrders = filteredOrders.filter(order =>
      order.items.some(item => item.service.toLowerCase().includes(categoryFilter.toLowerCase()))
    );
  }

  filteredOrders.sort((a, b) => {
    switch (sortBy) {
      case 'date':
        return new Date(b.date) - new Date(a.date);
      case 'amount':
        return b.total - a.total;
      default:
        return 0;
    }
  });

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={handleBack}
          sx={{ mr: 2 }}
        >
          Back to Users
        </Button>
        <Typography variant="h5">
          User Order History
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Total Orders
            </Typography>
            <Typography variant="h4">
              {userStats.totalOrders}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Total Spent
            </Typography>
            <Typography variant="h4">
              ${userStats.totalSpent.toFixed(2)}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Average Order Value
            </Typography>
            <Typography variant="h4">
              ${(userStats.totalSpent / userStats.totalOrders).toFixed(2)}
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          Recent Orders
        </Typography>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Order ID</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Amount</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {userStats.recentOrders.map((order) => (
                <TableRow key={order._id}>
                  <TableCell>{order._id}</TableCell>
                  <TableCell>
                    {new Date(order.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>{order.status}</TableCell>
                  <TableCell>${order.totalAmount.toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Box>
  );
};

export default UserOrderHistory; 