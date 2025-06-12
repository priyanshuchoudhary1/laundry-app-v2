//admin password : Priyanshu@844101, id- priyanshuofficial504@gmail.com, code- ADMIN123

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
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
  Chip,
  Alert,
  Drawer,
  Toolbar
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
  Save as SaveIcon,
  Group as GroupIcon
} from '@mui/icons-material';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
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
  const [staff, setStaff] = useState([]);
  const [showStaffDialog, setShowStaffDialog] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);

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

  const handleTabChange = (tab) => {
    if (tab !== activeTab) {
      setActiveTab(tab);
      navigate(`/admin-dashboard/${tab}`, { replace: true });
    }
  };

  // Get current path and set initial tab
  useEffect(() => {
    const path = location.pathname;
    console.log('Current path:', path);
    
    if (path.includes('/admin-dashboard/user/')) {
      // Don't change the active tab when viewing user orders
      return;
    }
    
    const pathParts = path.split('/');
    const currentPath = pathParts[pathParts.length - 1];
    
    if (currentPath === 'admin-dashboard') {
      setActiveTab('dashboard');
      navigate('/admin-dashboard/dashboard', { replace: true });
    } else if (currentPath && currentPath !== activeTab && 
               ['dashboard', 'users', 'orders', 'staff', 'payments'].includes(currentPath)) {
      setActiveTab(currentPath);
    }
  }, [location.pathname, navigate, activeTab]);

  // Verify authentication and fetch data
  useEffect(() => {
    const verifyAuth = async () => {
      try {
        console.log('Verifying auth...', { user });
        if (!user || user.role !== 'admin') {
          console.log('User not authenticated or not admin');
          navigate('/login');
          return;
        }

        // Always fetch data when component mounts or user changes
        console.log('Fetching dashboard data...');
        await fetchDashboardData();
      } catch (error) {
        console.error('Auth verification error:', error);
        if (error.message.includes('Authentication') || error.message.includes('token')) {
          localStorage.removeItem('token');
          navigate('/login');
        } else {
          setError(error.message);
        }
      } finally {
        setLoading(false);
      }
    };

    verifyAuth();
  }, [user, navigate]);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('Fetching dashboard data with token:', token);
      
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

      console.log('Making API calls with headers:', headers);

      // Fetch all data in parallel
      const [statsResponse, usersResponse, ordersResponse, servicesResponse, paymentsResponse, staffResponse] = await Promise.all([
        fetch('http://localhost:4000/api/admin/stats', {
          headers
        }),
        fetch('http://localhost:4000/api/admin/users', {
          headers
        }),
        fetch('http://localhost:4000/api/admin/orders', {
          headers
        }),
        fetch('http://localhost:4000/api/admin/services', {
          headers
        }),
        fetch('http://localhost:4000/api/admin/payments', {
          headers
        }),
        fetch('http://localhost:4000/api/admin/staff', {
          headers
        })
      ]);

      // Log response statuses
      console.log('API Response Statuses:', {
        stats: statsResponse.status,
        users: usersResponse.status,
        orders: ordersResponse.status,
        services: servicesResponse.status,
        payments: paymentsResponse.status,
        staff: staffResponse.status
      });

      // Check each response individually
      if (!statsResponse.ok) {
        const errorData = await statsResponse.json();
        throw new Error(`Stats API error: ${errorData.message}`);
      }
      if (!usersResponse.ok) {
        const errorData = await usersResponse.json();
        throw new Error(`Users API error: ${errorData.message}`);
      }
      if (!ordersResponse.ok) {
        const errorData = await ordersResponse.json();
        throw new Error(`Orders API error: ${errorData.message}`);
      }
      if (!servicesResponse.ok) {
        const errorData = await servicesResponse.json();
        throw new Error(`Services API error: ${errorData.message}`);
      }
      if (!paymentsResponse.ok) {
        const errorData = await paymentsResponse.json();
        throw new Error(`Payments API error: ${errorData.message}`);
      }
      if (!staffResponse.ok) {
        const errorData = await staffResponse.json();
        throw new Error(`Staff API error: ${errorData.message}`);
      }

      // Parse all responses
      const [statsData, usersData, ordersData, servicesData, paymentsData, staffData] = await Promise.all([
        statsResponse.json(),
        usersResponse.json(),
        ordersResponse.json(),
        servicesResponse.json(),
        paymentsResponse.json(),
        staffResponse.json()
      ]);

      // Log parsed data
      console.log('Parsed API Data:', {
        stats: statsData,
        users: usersData,
        orders: ordersData,
        services: servicesData,
        payments: paymentsData,
        staff: staffData
      });

      // Update state with fetched data
      setStats(statsData.stats);
      setUsers(usersData.users || []);
      setOrders(ordersData.orders || []);
      setServices(servicesData.services || []);
      setPayments(paymentsData.payments || []);
      setStaff(staffData.staff || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError(error.message);
      setLoading(false);
      
      // Handle authentication errors
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

  // Staff Management Functions
  const handleDeleteStaff = async (staffId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:4000/api/staff/${staffId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to delete staff member');
      
      setStaff(staff.filter(s => s._id !== staffId));
    } catch (error) {
      console.error('Error deleting staff:', error);
      setError(error.message);
    }
  };

  const handleAddStaff = async (staffData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:4000/api/staff', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(staffData)
      });

      if (!response.ok) throw new Error('Failed to add staff member');
      
      const newStaff = await response.json();
      setStaff([...staff, newStaff]);
      setShowStaffDialog(false);
    } catch (error) {
      console.error('Error adding staff:', error);
      setError(error.message);
    }
  };

  const handleUpdateStaff = async (staffId, staffData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:4000/api/staff/${staffId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(staffData)
      });

      if (!response.ok) throw new Error('Failed to update staff member');
      
      const updatedStaff = await response.json();
      setStaff(staff.map(s => s._id === staffId ? updatedStaff : s));
      setShowStaffDialog(false);
    } catch (error) {
      console.error('Error updating staff:', error);
      setError(error.message);
    }
  };

  // Update the handleViewUserOrders function
  const handleViewUserOrders = (userId) => {
    console.log('Navigating to user orders:', userId);
    navigate(`/admin-dashboard/user/${userId}`, { replace: false });
  };

  // Render Functions
  const renderDashboardContent = () => {
    console.log('Rendering dashboard content:', { stats, users, orders });
    
    if (error) {
      return (
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography color="error" variant="h6">
            {error}
          </Typography>
        </Box>
      );
    }

    return (
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Users
              </Typography>
              <Typography variant="h4">
                {stats?.totalUsers || 0}
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
                {stats?.totalOrders || 0}
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
                {stats?.ordersToday || 0}
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
                {stats?.pendingOrders || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Orders */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Orders
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Order ID</TableCell>
                      <TableCell>Customer</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Amount</TableCell>
                      <TableCell>Date</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {orders && orders.length > 0 ? (
                      orders.slice(0, 5).map((order) => (
                        <TableRow key={order._id}>
                          <TableCell>#{order.orderId.slice(-6)}</TableCell>
                          <TableCell>{order.userId?.name || 'N/A'}</TableCell>
                          <TableCell>
                            <Chip
                              label={order.status}
                              color={
                                order.status === 'completed' ? 'success' :
                                order.status === 'pending' ? 'warning' :
                                order.status === 'cancelled' ? 'error' : 'default'
                              }
                              size="small"
                            />
                          </TableCell>
                          <TableCell>${order.amount}</TableCell>
                          <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} align="center">
                          No orders found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Users */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Users
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell>Email</TableCell>
                      <TableCell>Phone</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {users && users.length > 0 ? (
                      users.slice(0, 5).map((user) => (
                        <TableRow key={user._id}>
                          <TableCell>{user.name}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>{user.phone}</TableCell>
                          <TableCell>
                            <Chip
                              label={user.isBlocked ? 'Blocked' : 'Active'}
                              color={user.isBlocked ? 'error' : 'success'}
                              size="small"
                            />
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} align="center">
                          No users found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    );
  };

  const renderUsersContent = () => {
    return (
      <Box>
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
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell>Address</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users
                .filter(user => 
                  user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  user.email?.toLowerCase().includes(searchQuery.toLowerCase())
                )
                .map((user) => (
                  <TableRow key={user._id}>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.phone}</TableCell>
                    <TableCell>
                      {user.address ? `${user.address.street}, ${user.address.city}, ${user.address.state} ${user.address.zipCode}` : 'N/A'}
                    </TableCell>
                    <TableCell>{user.role}</TableCell>
                    <TableCell>
                      <Button
                        variant="contained"
                        color="primary"
                        size="small"
                        onClick={() => handleViewUserOrders(user._id)}
                        sx={{ mr: 1 }}
                      >
                        View Orders
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    );
  };

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
                  <TableCell>#{order.orderId}</TableCell>
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

  const renderStaffContent = () => (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5">Staff Management</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            setSelectedStaff(null);
            setShowStaffDialog(true);
          }}
        >
          Add Staff
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Completed Orders</TableCell>
              <TableCell>Current Assignments</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {staff.map((staffMember) => (
              <TableRow key={staffMember._id}>
                <TableCell>{staffMember.name}</TableCell>
                <TableCell>{staffMember.role}</TableCell>
                <TableCell>{staffMember.email}</TableCell>
                <TableCell>{staffMember.phone}</TableCell>
                <TableCell>{staffMember.completedOrders}</TableCell>
                <TableCell>{staffMember.currentAssignments}</TableCell>
                <TableCell>
                  <Chip
                    label={staffMember.isAvailable ? 'Available' : 'Busy'}
                    color={staffMember.isAvailable ? 'success' : 'warning'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <IconButton
                    size="small"
                    onClick={() => {
                      setSelectedStaff(staffMember);
                      setShowStaffDialog(true);
                    }}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleDeleteStaff(staffMember._id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Staff Dialog */}
      <Dialog open={showStaffDialog} onClose={() => setShowStaffDialog(false)}>
        <DialogTitle>
          {selectedStaff ? 'Edit Staff Member' : 'Add New Staff Member'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Name"
              fullWidth
              defaultValue={selectedStaff?.name || ''}
              onChange={(e) => setSelectedStaff({ ...selectedStaff, name: e.target.value })}
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>Role</InputLabel>
              <Select
                name="role"
                value={selectedStaff?.role || ''}
                onChange={(e) => setSelectedStaff({ ...selectedStaff, role: e.target.value })}
                label="Role"
              >
                <MenuItem value="manager">Manager</MenuItem>
                <MenuItem value="cashier">Cashier</MenuItem>
                <MenuItem value="cleaning_person">Cleaning Person</MenuItem>
                <MenuItem value="security_guard">Security Guard</MenuItem>
                <MenuItem value="delivery_person">Delivery Person</MenuItem>
                <MenuItem value="washer">Washer</MenuItem>
                <MenuItem value="ironer">Ironer</MenuItem>
                <MenuItem value="supervisor">Supervisor</MenuItem>
                <MenuItem value="receptionist">Receptionist</MenuItem>
                <MenuItem value="maintenance">Maintenance Staff</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Email"
              fullWidth
              defaultValue={selectedStaff?.email || ''}
              onChange={(e) => setSelectedStaff({ ...selectedStaff, email: e.target.value })}
            />
            <TextField
              label="Phone"
              fullWidth
              defaultValue={selectedStaff?.phone || ''}
              onChange={(e) => setSelectedStaff({ ...selectedStaff, phone: e.target.value })}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={selectedStaff?.isAvailable ?? true}
                  onChange={(e) => setSelectedStaff({ ...selectedStaff, isAvailable: e.target.checked })}
                />
              }
              label="Available"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowStaffDialog(false)}>Cancel</Button>
          <Button
            onClick={() => {
              if (selectedStaff?._id) {
                handleUpdateStaff(selectedStaff._id, selectedStaff);
              } else {
                handleAddStaff(selectedStaff);
              }
            }}
            variant="contained"
          >
            {selectedStaff?._id ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );

  const renderMenuItems = () => {
    return (
      <List>
        <ListItem 
          button 
          component={Link} 
          to="/admin-dashboard/dashboard"
          selected={activeTab === 'dashboard'}
          onClick={() => handleTabChange('dashboard')}
        >
          <ListItemIcon><DashboardIcon /></ListItemIcon>
          <ListItemText primary="Dashboard" />
        </ListItem>
        <ListItem 
          button 
          component={Link} 
          to="/admin-dashboard/users"
          selected={activeTab === 'users'}
          onClick={() => handleTabChange('users')}
        >
          <ListItemIcon><PeopleIcon /></ListItemIcon>
          <ListItemText primary="Users" />
        </ListItem>
        <ListItem 
          button 
          component={Link} 
          to="/admin-dashboard/orders"
          selected={activeTab === 'orders'}
          onClick={() => handleTabChange('orders')}
        >
          <ListItemIcon><LaundryIcon /></ListItemIcon>
          <ListItemText primary="Orders" />
        </ListItem>
        <ListItem 
          button 
          component={Link} 
          to="/admin-dashboard/payments"
          selected={activeTab === 'payments'}
          onClick={() => handleTabChange('payments')}
        >
          <ListItemIcon><PaymentIcon /></ListItemIcon>
          <ListItemText primary="Payments" />
        </ListItem>
        <ListItem 
          button 
          component={Link} 
          to="/admin-dashboard/staff"
          selected={activeTab === 'staff'}
          onClick={() => handleTabChange('staff')}
        >
          <ListItemIcon><GroupIcon /></ListItemIcon>
          <ListItemText primary="Staff" />
        </ListItem>
      </List>
    );
  };

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

  if (error) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        flexDirection: 'column',
        gap: 2
      }}>
        <Typography color="error" variant="h6">
          {error}
        </Typography>
        <Button 
          variant="contained" 
          onClick={() => {
            setError(null);
            fetchDashboardData();
          }}
        >
          Retry
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex' }}>
      {/* Sidebar */}
      <Drawer
        variant="permanent"
        sx={{
          width: 240,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: 240,
            boxSizing: 'border-box',
          },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto' }}>
          {renderMenuItems()}
        </Box>
      </Drawer>

      {/* Main Content */}
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Typography color="error" sx={{ mt: 2 }}>{error}</Typography>
        ) : location.pathname.includes('/admin-dashboard/user/') ? (
          <Outlet />
        ) : (
          <>
            {activeTab === 'dashboard' && renderDashboardContent()}
            {activeTab === 'users' && renderUsersContent()}
            {activeTab === 'orders' && renderOrdersContent()}
            {activeTab === 'payments' && renderPaymentsContent()}
            {activeTab === 'staff' && renderStaffContent()}
          </>
        )}
      </Box>
    </Box>
  );
};

export default AdminDashboard; 