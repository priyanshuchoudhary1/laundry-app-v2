import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Card,
  CardContent,
} from '@mui/material';

const StaffManagement = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('pending');

  // Fetch orders and staff data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ordersRes, staffRes] = await Promise.all([
          axios.get('/api/orders'),
          axios.get('/api/staff')
        ]);
        setOrders(ordersRes.data);
        setStaff(staffRes.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleAssignStaff = async (orderId, staffId, role) => {
    try {
      await axios.post('/api/orders/assign-staff', {
        orderId,
        staffId,
        role
      });
      // Refresh orders after assignment
      const updatedOrders = await axios.get('/api/orders');
      setOrders(updatedOrders.data);
    } catch (error) {
      console.error('Error assigning staff:', error);
    }
  };

  const renderOrdersTable = (status) => {
    const filteredOrders = orders.filter(order => order.status === status);
    
    return (
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Order ID</TableCell>
              <TableCell>Customer</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Assigned Staff</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredOrders.map((order) => (
              <TableRow key={order._id}>
                <TableCell>{order._id}</TableCell>
                <TableCell>{order.customerName}</TableCell>
                <TableCell>{order.status}</TableCell>
                <TableCell>
                  {order.assignedStaff ? order.assignedStaff.name : 'Not Assigned'}
                </TableCell>
                <TableCell>
                  <FormControl size="small" sx={{ minWidth: 120 }}>
                    <InputLabel>Assign Staff</InputLabel>
                    <Select
                      value=""
                      label="Assign Staff"
                      onChange={(e) => handleAssignStaff(order._id, e.target.value, status === 'ready' ? 'delivery' : 'washing')}
                    >
                      {staff.map((staffMember) => (
                        <MenuItem key={staffMember._id} value={staffMember._id}>
                          {staffMember.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  if (loading) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Staff Management
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
            <Button
              variant={selectedTab === 'pending' ? 'contained' : 'text'}
              onClick={() => setSelectedTab('pending')}
              sx={{ mr: 2 }}
            >
              Pending Orders
            </Button>
            <Button
              variant={selectedTab === 'ready' ? 'contained' : 'text'}
              onClick={() => setSelectedTab('ready')}
            >
              Ready for Delivery
            </Button>
          </Box>
        </Grid>

        <Grid item xs={12}>
          {selectedTab === 'pending' ? (
            <>
              <Typography variant="h6" gutterBottom>
                Orders Pending Washing
              </Typography>
              {renderOrdersTable('pending')}
            </>
          ) : (
            <>
              <Typography variant="h6" gutterBottom>
                Orders Ready for Delivery
              </Typography>
              {renderOrdersTable('ready')}
            </>
          )}
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Staff Performance Overview
              </Typography>
              <Grid container spacing={2}>
                {staff.map((staffMember) => (
                  <Grid item xs={12} sm={6} md={4} key={staffMember._id}>
                    <Paper sx={{ p: 2 }}>
                      <Typography variant="subtitle1">{staffMember.name}</Typography>
                      <Typography variant="body2">
                        Orders Completed: {staffMember.completedOrders || 0}
                      </Typography>
                      <Typography variant="body2">
                        Current Assignments: {staffMember.currentAssignments || 0}
                      </Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default StaffManagement; 