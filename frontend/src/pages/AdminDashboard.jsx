//admin password : Priyanshu@844101, id- priyanshuofficial504@gmail.com, code- ADMIN123

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Box, 
  Container, 
  Grid, 
  Paper, 
  Typography, 
  Card, 
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Badge,
  CircularProgress,
  TextField,
  InputAdornment,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  Switch,
  FormControlLabel,
  Chip
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  LocalLaundryService as LaundryIcon,
  Settings as SettingsIcon,
  Notifications as NotificationsIcon,
  AccountCircle as AccountIcon,
  ArrowDropDown as ArrowDropDownIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Search as SearchIcon,
  Block as BlockIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Payment as PaymentIcon,
  Add as AddIcon,
  Save as SaveIcon
} from '@mui/icons-material';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, logout, checkAuth } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dataFetched, setDataFetched] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDateRange, setSelectedDateRange] = useState({ start: '', end: '' });
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showServiceDialog, setShowServiceDialog] = useState(false);
  const [showUserDialog, setShowUserDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderDialog, setShowOrderDialog] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  // Stats state
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalOrders: 0,
    ordersToday: 0,
    pendingOrders: 0,
    revenue: 0
  });

  // Data states
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [services, setServices] = useState([]);
  const [payments, setPayments] = useState([]);

  // Filter states
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState('all');

  // Menu handlers
  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleMenuClose();
    logout();
    navigate('/login');
  };

  const clearStorage = () => {
    localStorage.clear();
    console.log('Local storage cleared');
    navigate('/login');
  };

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login', { replace: true });
          return;
        }

        await checkAuth();
        
        if (!user) {
          navigate('/login', { replace: true });
          return;
        }

        if (user.role !== 'admin') {
          navigate('/account', { replace: true });
          return;
        }

        if (!dataFetched) {
          await fetchDashboardData();
          setDataFetched(true);
        }
      } catch (error) {
        console.error('Auth verification error:', error);
        navigate('/login', { replace: true });
      } finally {
        setLoading(false);
      }
    };

    verifyAuth();
  }, [user, navigate, checkAuth, dataFetched]);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found');
        setError('Authentication required');
        navigate('/login');
        return;
      }

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      // Fetch dashboard stats
      const statsResponse = await fetch('http://localhost:4000/api/admin/stats', {
        method: 'GET',
        headers,
        credentials: 'include'
      });

      if (!statsResponse.ok) {
        const errorData = await statsResponse.json();
        throw new Error(errorData.message || 'Failed to fetch stats');
      }

      const statsData = await statsResponse.json();
      setStats(statsData.stats);

      // Fetch recent users
      const usersResponse = await fetch('http://localhost:4000/api/admin/users', {
        method: 'GET',
        headers,
        credentials: 'include'
      });

      if (!usersResponse.ok) {
        const errorData = await usersResponse.json();
        throw new Error(errorData.message || 'Failed to fetch users');
      }

      const usersData = await usersResponse.json();
      setUsers(usersData.users);

      // Fetch recent orders
      const ordersResponse = await fetch('http://localhost:4000/api/admin/orders', {
        method: 'GET',
        headers,
        credentials: 'include'
      });

      if (!ordersResponse.ok) {
        const errorData = await ordersResponse.json();
        throw new Error(errorData.message || 'Failed to fetch orders');
      }

      const ordersData = await ordersResponse.json();
      setOrders(ordersData.orders);

      // Fetch services
      const servicesResponse = await fetch('http://localhost:4000/api/admin/services', {
        method: 'GET',
        headers,
        credentials: 'include'
      });

      if (!servicesResponse.ok) {
        const errorData = await servicesResponse.json();
        throw new Error(errorData.message || 'Failed to fetch services');
      }

      const servicesData = await servicesResponse.json();
      setServices(servicesData.services);

      // Fetch payments
      const paymentsResponse = await fetch('http://localhost:4000/api/admin/payments', {
        method: 'GET',
        headers,
        credentials: 'include'
      });

      if (!paymentsResponse.ok) {
        const errorData = await paymentsResponse.json();
        throw new Error(errorData.message || 'Failed to fetch payments');
      }

      const paymentsData = await paymentsResponse.json();
      setPayments(paymentsData.payments);

      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError(error.message);
      setLoading(false);
      
      // If unauthorized, redirect to login
      if (error.message.includes('Authentication') || error.message.includes('token')) {
        localStorage.removeItem('token');
        navigate('/login');
      }
    }
  };

  // User Management Functions
  const handleBlockUser = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:4000/api/admin/users/${userId}/block`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        // Update user list
        const updatedUsers = users.map(user => 
          user._id === userId ? { ...user, isBlocked: !user.isBlocked } : user
        );
        setUsers(updatedUsers);
      }
    } catch (error) {
      console.error('Error blocking user:', error);
    }
  };

  // Order Management Functions
  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:4000/api/admin/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        // Update order list
        const updatedOrders = orders.map(order => 
          order._id === orderId ? { ...order, status: newStatus } : order
        );
        setOrders(updatedOrders);
      }
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  // Service Management Functions
  const handleAddService = async (serviceData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:4000/api/admin/services', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(serviceData)
      });

      if (response.ok) {
        const newService = await response.json();
        setServices([...services, newService]);
        setShowServiceDialog(false);
      }
    } catch (error) {
      console.error('Error adding service:', error);
    }
  };

  // Render Functions
  const renderDashboardContent = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              Total Users
            </Typography>
            <Typography variant="h4">
              {stats.totalUsers}
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              Total Orders
            </Typography>
            <Typography variant="h4">
              {stats.totalOrders}
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              Orders Today
            </Typography>
            <Typography variant="h4">
              {stats.ordersToday}
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              Pending Orders
            </Typography>
            <Typography variant="h4">
              {stats.pendingOrders}
            </Typography>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const renderUsersContent = () => (
    <Paper sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h6">User Management</Typography>
        <TextField
          placeholder="Search users..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Box>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users
              .filter(user => 
                user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                user.email.toLowerCase().includes(searchQuery.toLowerCase())
              )
              .map((user) => (
                <TableRow key={user._id}>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.phone}</TableCell>
                  <TableCell>
                    {user.isBlocked ? 'Blocked' : 'Active'}
                  </TableCell>
                  <TableCell>
                    <IconButton size="small" onClick={() => handleBlockUser(user._id)}>
                      {user.isBlocked ? <CheckCircleIcon /> : <BlockIcon />}
                    </IconButton>
                    <IconButton size="small" onClick={() => {
                      setSelectedUser(user);
                      setShowUserDialog(true);
                    }}>
                      <ViewIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );

  const renderOrdersContent = () => (
    <Paper sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h6">Order Management</Typography>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Status Filter</InputLabel>
          <Select
            value={orderStatusFilter}
            onChange={(e) => setOrderStatusFilter(e.target.value)}
            label="Status Filter"
          >
            <MenuItem value="all">All Orders</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="in-progress">In Progress</MenuItem>
            <MenuItem value="completed">Completed</MenuItem>
            <MenuItem value="cancelled">Cancelled</MenuItem>
          </Select>
        </FormControl>
      </Box>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Order ID</TableCell>
              <TableCell>Customer</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {orders
              .filter(order => orderStatusFilter === 'all' || order.status === orderStatusFilter)
              .map((order) => (
                <TableRow key={order._id}>
                  <TableCell>#{order._id.slice(-6)}</TableCell>
                  <TableCell>{order.userId?.name || 'N/A'}</TableCell>
                  <TableCell>
                    <Select
                      value={order.status}
                      onChange={(e) => handleUpdateOrderStatus(order._id, e.target.value)}
                      size="small"
                    >
                      <MenuItem value="pending">Pending</MenuItem>
                      <MenuItem value="in-progress">In Progress</MenuItem>
                      <MenuItem value="completed">Completed</MenuItem>
                      <MenuItem value="cancelled">Cancelled</MenuItem>
                    </Select>
                  </TableCell>
                  <TableCell>${order.amount}</TableCell>
                  <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <IconButton size="small" onClick={() => {
                      setSelectedOrder(order);
                      setShowOrderDialog(true);
                    }}>
                      <ViewIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );

  const renderServicesContent = () => (
    <Paper sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h6">Service Management</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setShowServiceDialog(true)}
        >
          Add Service
        </Button>
      </Box>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Service Name</TableCell>
              <TableCell>Price</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {services.map((service) => (
              <TableRow key={service._id}>
                <TableCell>{service.name}</TableCell>
                <TableCell>${service.price}</TableCell>
                <TableCell>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={service.isAvailable}
                        onChange={() => handleToggleService(service._id)}
                      />
                    }
                    label={service.isAvailable ? 'Available' : 'Unavailable'}
                  />
                </TableCell>
                <TableCell>
                  <IconButton size="small" onClick={() => handleEditService(service)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton size="small" onClick={() => handleDeleteService(service._id)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );

  const renderPaymentsContent = () => (
    <Paper sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h6">Payment Tracking</Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            type="date"
            label="Start Date"
            value={selectedDateRange.start}
            onChange={(e) => setSelectedDateRange({ ...selectedDateRange, start: e.target.value })}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            type="date"
            label="End Date"
            value={selectedDateRange.end}
            onChange={(e) => setSelectedDateRange({ ...selectedDateRange, end: e.target.value })}
            InputLabelProps={{ shrink: true }}
          />
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Payment Method</InputLabel>
            <Select
              value={paymentMethodFilter}
              onChange={(e) => setPaymentMethodFilter(e.target.value)}
              label="Payment Method"
            >
              <MenuItem value="all">All Methods</MenuItem>
              <MenuItem value="cod">Cash on Delivery</MenuItem>
              <MenuItem value="stripe">Stripe</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Box>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Transaction ID</TableCell>
              <TableCell>Order ID</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Method</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {payments
              .filter(payment => {
                const date = new Date(payment.createdAt);
                const start = selectedDateRange.start ? new Date(selectedDateRange.start) : null;
                const end = selectedDateRange.end ? new Date(selectedDateRange.end) : null;
                
                const dateFilter = (!start || date >= start) && (!end || date <= end);
                const methodFilter = paymentMethodFilter === 'all' || payment.method === paymentMethodFilter;
                
                return dateFilter && methodFilter;
              })
              .map((payment) => (
                <TableRow key={payment._id}>
                  <TableCell>{payment.transactionId}</TableCell>
                  <TableCell>#{payment.orderId.slice(-6)}</TableCell>
                  <TableCell>${payment.amount}</TableCell>
                  <TableCell>{payment.method}</TableCell>
                  <TableCell>{new Date(payment.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Chip
                      label={payment.status}
                      color={payment.status === 'completed' ? 'success' : 'warning'}
                      size="small"
                    />
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );

  const renderSettingsContent = () => (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" sx={{ mb: 3 }}>Admin Settings</Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>Profile Settings</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ width: 64, height: 64, mr: 2 }} />
                <Button variant="outlined">Change Photo</Button>
              </Box>
              <Button variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>
                Update Profile
              </Button>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>System Settings</Typography>
              <Button variant="contained" color="primary" fullWidth sx={{ mb: 2 }}>
                Backup Data
              </Button>
              <Button variant="contained" color="error" fullWidth>
                Reset System
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Paper>
  );

  const renderMenuItems = () => (
    <Menu
      anchorEl={anchorEl}
      open={Boolean(anchorEl)}
      onClose={handleMenuClose}
    >
      <MenuItem onClick={handleMenuClose}>Profile</MenuItem>
      <MenuItem onClick={handleMenuClose}>Settings</MenuItem>
      <Divider />
      <MenuItem onClick={clearStorage}>Clear Storage</MenuItem>
      <MenuItem onClick={handleLogout}>Logout</MenuItem>
    </Menu>
  );

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh' 
      }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f5f5f5' }}>
      {/* Sidebar */}
      <Paper sx={{ width: 240, p: 2, bgcolor: '#fff' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            Admin Panel
          </Typography>
        </Box>
        <List>
          <ListItem 
            button 
            onClick={() => setActiveTab('dashboard')}
            sx={{ 
              borderRadius: 1, 
              mb: 1,
              bgcolor: activeTab === 'dashboard' ? '#e3f2fd' : 'transparent',
              color: activeTab === 'dashboard' ? '#1976d2' : 'inherit'
            }}
          >
            <ListItemIcon sx={{ color: activeTab === 'dashboard' ? '#1976d2' : 'inherit' }}>
              <DashboardIcon />
            </ListItemIcon>
            <ListItemText primary="Dashboard" />
          </ListItem>
          <ListItem 
            button 
            onClick={() => setActiveTab('users')}
            sx={{ 
              borderRadius: 1, 
              mb: 1,
              bgcolor: activeTab === 'users' ? '#e3f2fd' : 'transparent',
              color: activeTab === 'users' ? '#1976d2' : 'inherit'
            }}
          >
            <ListItemIcon sx={{ color: activeTab === 'users' ? '#1976d2' : 'inherit' }}>
              <PeopleIcon />
            </ListItemIcon>
            <ListItemText primary="Users" />
          </ListItem>
          <ListItem 
            button 
            onClick={() => setActiveTab('orders')}
            sx={{ 
              borderRadius: 1, 
              mb: 1,
              bgcolor: activeTab === 'orders' ? '#e3f2fd' : 'transparent',
              color: activeTab === 'orders' ? '#1976d2' : 'inherit'
            }}
          >
            <ListItemIcon sx={{ color: activeTab === 'orders' ? '#1976d2' : 'inherit' }}>
              <LaundryIcon />
            </ListItemIcon>
            <ListItemText primary="Orders" />
          </ListItem>
          <ListItem 
            button 
            onClick={() => setActiveTab('services')}
            sx={{ 
              borderRadius: 1, 
              mb: 1,
              bgcolor: activeTab === 'services' ? '#e3f2fd' : 'transparent',
              color: activeTab === 'services' ? '#1976d2' : 'inherit'
            }}
          >
            <ListItemIcon sx={{ color: activeTab === 'services' ? '#1976d2' : 'inherit' }}>
              <LaundryIcon />
            </ListItemIcon>
            <ListItemText primary="Services" />
          </ListItem>
          <ListItem 
            button 
            onClick={() => setActiveTab('payments')}
            sx={{ 
              borderRadius: 1, 
              mb: 1,
              bgcolor: activeTab === 'payments' ? '#e3f2fd' : 'transparent',
              color: activeTab === 'payments' ? '#1976d2' : 'inherit'
            }}
          >
            <ListItemIcon sx={{ color: activeTab === 'payments' ? '#1976d2' : 'inherit' }}>
              <PaymentIcon />
            </ListItemIcon>
            <ListItemText primary="Payments" />
          </ListItem>
          <ListItem 
            button 
            onClick={() => setActiveTab('settings')}
            sx={{ 
              borderRadius: 1, 
              mb: 1,
              bgcolor: activeTab === 'settings' ? '#e3f2fd' : 'transparent',
              color: activeTab === 'settings' ? '#1976d2' : 'inherit'
            }}
          >
            <ListItemIcon sx={{ color: activeTab === 'settings' ? '#1976d2' : 'inherit' }}>
              <SettingsIcon />
            </ListItemIcon>
            <ListItemText primary="Settings" />
          </ListItem>
        </List>
      </Paper>

      {/* Main Content */}
      <Box sx={{ flexGrow: 1, p: 3 }}>
        <Container maxWidth="lg">
          {/* Header */}
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            mb: 4 
          }}>
            <Typography variant="h4">
              {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <IconButton onClick={() => setShowNotifications(true)}>
                <Badge badgeContent={notifications.length} color="error">
                  <NotificationsIcon />
                </Badge>
              </IconButton>
              <Button
                onClick={handleMenuClick}
                startIcon={<AccountIcon />}
                endIcon={<ArrowDropDownIcon />}
              >
                {user?.name || 'Admin'}
              </Button>
              {renderMenuItems()}
            </Box>
          </Box>

          {/* Content */}
          {activeTab === 'dashboard' && renderDashboardContent()}
          {activeTab === 'users' && renderUsersContent()}
          {activeTab === 'orders' && renderOrdersContent()}
          {activeTab === 'services' && renderServicesContent()}
          {activeTab === 'payments' && renderPaymentsContent()}
          {activeTab === 'settings' && renderSettingsContent()}
        </Container>
      </Box>

      {/* Dialogs */}
      <Dialog open={showServiceDialog} onClose={() => setShowServiceDialog(false)}>
        <DialogTitle>Add New Service</DialogTitle>
        <DialogContent>
          {/* Add service form */}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowServiceDialog(false)}>Cancel</Button>
          <Button onClick={handleAddService} variant="contained">Add Service</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={showUserDialog} onClose={() => setShowUserDialog(false)}>
        <DialogTitle>User Details</DialogTitle>
        <DialogContent>
          {/* User details */}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowUserDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={showOrderDialog} onClose={() => setShowOrderDialog(false)}>
        <DialogTitle>Order Details</DialogTitle>
        <DialogContent>
          {/* Order details */}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowOrderDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={showNotifications} onClose={() => setShowNotifications(false)}>
        <DialogTitle>Notifications</DialogTitle>
        <DialogContent>
          {/* Notifications list */}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowNotifications(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminDashboard; 