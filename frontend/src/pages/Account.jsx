import React, { useState, useEffect, useRef } from 'react';
import { FaUser, FaHistory, FaCog, FaSignOutAlt, FaEdit, FaCheck, FaTimes, FaTrash, FaCreditCard, FaPlus, FaPaypal, FaCamera, FaDatabase, FaRedo, FaSearch } from 'react-icons/fa';
import { MdPayment, MdLocalLaundryService, MdWaterDrop, MdOutlineDry, MdIron } from 'react-icons/md';
import { SiGooglepay, SiPaytm, SiPhonepe } from 'react-icons/si';
import { RiTShirtLine } from 'react-icons/ri';
import { BsClockHistory } from 'react-icons/bs';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { updateUserProfile, addPaymentMethod, deletePaymentMethod, setDefaultPaymentMethod, getLaundryPreferences, updateLaundryPreferences } from '../services/api';
import '../styles/pages/Account.css';

const Account = () => {
  const { user, loading: authLoading, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [isAddingPayment, setIsAddingPayment] = useState(false);
  const [isEditingPreferences, setIsEditingPreferences] = useState(false);
  const [editData, setEditData] = useState({
    name: '',
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: ''
    }
  });
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [newPaymentMethod, setNewPaymentMethod] = useState({
    type: 'creditCard',
    cardName: '',
    cardNumber: '',
    expDate: '',
    cvv: '',
    upiId: '',
    phoneNumber: '',
    paypalEmail: ''
  });
  const [preferences, setPreferences] = useState({
    detergent: 'regular',
    fabricSoftener: true,
    washTemperature: 'warm',
    foldingPreference: 'folded',
    specialInstructions: '',
    stainTreatment: true,
    ironingPreference: false,
    deliveryTimePreference: 'any'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showTrackingModal, setShowTrackingModal] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [authLoading, user, navigate]);

  useEffect(() => {
    if (user) {
      setEditData({
        name: user.name || '',
        phone: user.phone || '',
        address: user.address || {
          street: '',
          city: '',
          state: '',
          zipCode: ''
        }
      });
      
      setPaymentMethods(user.paymentMethods || []);
      if (user.profileImage) {
        const fullImageUrl = user.profileImage.startsWith('http') 
          ? user.profileImage 
          : `http://localhost:4000${user.profileImage}`;
        setProfileImage(fullImageUrl);
      }
      
      fetchLaundryPreferences();
      if (activeTab === 'orders') {
        fetchOrderHistory();
      }
    }
  }, [user, activeTab]);

  const fetchLaundryPreferences = async () => {
    if (!user?._id) return;
    
    try {
      const response = await fetch(`http://localhost:4000/api/users/preferences/${user._id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch preferences');
      }

      const data = await response.json();
      if (data.success) {
        setPreferences(data.preferences);
      }
    } catch (err) {
      console.error('Error fetching preferences:', err);
      setError('Failed to load preferences');
    }
  };

  const fetchOrderHistory = async () => {
    try {
      setLoading(true);
      setError('');
      
      if (!user?._id) {
        throw new Error('No user logged in');
      }

      const response = await fetch(`http://localhost:4000/api/orders/user/${user._id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch order history: ${response.status}`);
      }

      const data = await response.json();
      console.log('Order data:', data); // Debug log
      
      if (data.success && Array.isArray(data.data)) {
        // Sort orders by date, most recent first
        console.log(data.data)
        const sortedOrders = data.data.sort((a, b) => 
          new Date(b.createdAt) - new Date(a.createdAt)
        );
        setOrders(sortedOrders);
      } else {
        setOrders([]);
        setError(data.message || 'No orders found');
      }
    } catch (err) {
      console.error('Order history error:', err);
      setError(err.message || 'Failed to fetch order history');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setEditData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setEditData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handlePaymentInputChange = (e) => {
    const { name, value } = e.target;
    let processedValue = value;

    if (name === 'cardNumber') {
      processedValue = value.replace(/\D/g, '').substring(0, 16);
    }
    
    if (name === 'expDate') {
      processedValue = value.replace(/\D/g, '');
      if (processedValue.length > 2) {
        processedValue = processedValue.substring(0, 2) + '/' + processedValue.substring(2, 4);
      }
    }
    
    if (name === 'cvv') {
      processedValue = value.replace(/\D/g, '').substring(0, 4);
    }

    setNewPaymentMethod(prev => ({
      ...prev,
      [name]: processedValue
    }));
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      setError('');

      if (!user) {
        throw new Error('No user logged in');
      }

      // Validate required fields
      if (!editData.name.trim()) {
        throw new Error('Name is required');
      }
      if (!editData.phone.trim()) {
        throw new Error('Phone number is required');
      }
      if (!editData.address.street.trim() || !editData.address.city.trim() || 
          !editData.address.state.trim() || !editData.address.zipCode.trim()) {
        throw new Error('Complete address is required');
      }

      const response = await fetch(`http://localhost:4000/api/users/profile/${user._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(editData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update profile');
      }

      const updatedData = await response.json();
      
      // Update local user data
      updateUser(updatedData.user);
      
      // Refresh order history if we're on the orders tab
      if (activeTab === 'orders') {
        await fetchOrderHistory();
      }

      setSuccess('Profile updated successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Profile update error:', err);
      setError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleAddPaymentMethod = () => {
    setIsAddingPayment(true);
    setError('');
    setSuccess('');
  };

  const handleSavePaymentMethod = async () => {
    // Validate payment method details
    if (newPaymentMethod.type === 'creditCard' || newPaymentMethod.type === 'debitCard') {
      if (!newPaymentMethod.cardName || !newPaymentMethod.cardNumber || !newPaymentMethod.expDate) {
        setError('Please fill all required card details');
        return;
      }
      
      if (newPaymentMethod.cardNumber.length < 16) {
        setError('Please enter a valid 16-digit card number');
        return;
      }
      
      if (!/^\d{2}\/\d{2}$/.test(newPaymentMethod.expDate)) {
        setError('Please enter a valid expiration date (MM/YY)');
        return;
      }
    } else if (newPaymentMethod.type === 'upi') {
      if (!newPaymentMethod.upiId) {
        setError('Please enter your UPI ID');
        return;
      }
      
      if (!/^[a-zA-Z0-9._-]+@[a-zA-Z0-9]+$/.test(newPaymentMethod.upiId)) {
        setError('Please enter a valid UPI ID (e.g., name@bankname)');
        return;
      }
    } else if (newPaymentMethod.type === 'paypal') {
      if (!newPaymentMethod.paypalEmail) {
        setError('Please enter your PayPal email');
        return;
      }
      
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newPaymentMethod.paypalEmail)) {
        setError('Please enter a valid email address');
        return;
      }
    }
    
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch(`http://localhost:4000/api/users/payment-methods/${user._id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(newPaymentMethod)
      });

      const data = await response.json();
      
      if (data.success) {
        // Update the local state with the payment methods from the response
        setPaymentMethods(data.user.paymentMethods);
        // Update the user context with the new payment methods
        updateUser({ ...user, paymentMethods: data.user.paymentMethods });
        setIsAddingPayment(false);
        setSuccess('Payment method added successfully!');
        
        // Reset form
        setNewPaymentMethod({
          type: 'creditCard',
          cardName: '',
          cardNumber: '',
          expDate: '',
          cvv: '',
          upiId: '',
          phoneNumber: '',
          paypalEmail: ''
        });
      } else {
        throw new Error(data.error || 'Failed to add payment method');
      }
    } catch (err) {
      setError(err.message || 'Failed to add payment method. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRemovePaymentMethod = async (methodId) => {
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch(`http://localhost:4000/api/users/payment-methods/${user._id}/${methodId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await response.json();
      
      if (data.success) {
        // Update local state with response data
        setPaymentMethods(data.user.paymentMethods);
        // Update the user context with the new payment methods
        updateUser({ ...user, paymentMethods: data.user.paymentMethods });
        setSuccess('Payment method removed successfully!');
      } else {
        throw new Error(data.error || 'Failed to remove payment method');
      }
    } catch (err) {
      setError(err.message || 'Failed to remove payment method. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSetDefaultPaymentMethod = async (methodId) => {
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch(`http://localhost:4000/api/users/payment-methods/${user._id}/${methodId}/default`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await response.json();
      
      if (data.success) {
        // Update local state with response data
        setPaymentMethods(data.user.paymentMethods);
        // Update the user context with the new payment methods
        updateUser({ ...user, paymentMethods: data.user.paymentMethods });
        setSuccess('Default payment method updated!');
      } else {
        throw new Error(data.error || 'Failed to update default payment method');
      }
    } catch (err) {
      setError(err.message || 'Failed to update default payment method. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handlePreferenceChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Handle different input types
    const newValue = type === 'checkbox' ? checked : value;
    
    setPreferences(prev => ({
      ...prev,
      [name]: newValue
    }));
  };

  const handleSavePreferences = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await updateLaundryPreferences(user._id, preferences);
      
      if (response.success) {
        setSuccess('Laundry preferences updated successfully!');
        setIsEditingPreferences(false);
      } else {
        throw new Error(response.error || 'Failed to update preferences');
      }
    } catch (err) {
      setError(err.message || 'Failed to update preferences. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size should be less than 5MB');
      return;
    }

    try {
      setIsUploading(true);
      setError('');
      setSuccess('');

      const formData = new FormData();
      formData.append('profileImage', file);

      const response = await fetch(`http://localhost:4000/api/users/profile-image/${user._id}`, {
        method: 'PUT',
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        // Ensure we have the full URL for the profile image
        const fullImageUrl = data.user.profileImage.startsWith('http')
          ? data.user.profileImage
          : `http://localhost:4000${data.user.profileImage}`;
        setProfileImage(fullImageUrl);
        setSuccess('Profile image updated successfully');
        // Update user context with new profile image
        updateUser({ ...user, profileImage: fullImageUrl });
      } else {
        setError(data.error || 'Failed to update profile image');
      }
    } catch (err) {
      setError('Error uploading image');
      console.error('Upload error:', err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Delivered': return 'status-delivered';
      case 'In Progress': return 'status-progress';
      case 'Scheduled': return 'status-scheduled';
      case 'Cancelled': return 'status-cancelled';
      default: return '';
    }
  };

  const handleTrackOrder = (order) => {
    navigate('/track-order', { state: { orderId: order.orderId } });
  };

  if (authLoading) {
    return <div className="loading-container">Loading...</div>;
  }

  if (!user) {
    return null;
  }

  const renderTabContent = () => {
    switch(activeTab) {
      case 'profile':
        return (
          <div className="profile-section">
            <h2><FaUser /> Profile Information</h2>
            {error && <p className="error-message">{error}</p>}
            {success && <p className="success-message">{success}</p>}
            
            <div className="profile-image-section">
              <div 
                className={`profile-image-container ${isUploading ? 'uploading' : ''}`}
                onClick={handleImageClick}
              >
                {profileImage ? (
                  <img src={profileImage} alt="Profile" className="profile-image" />
                ) : (
                  <div className="profile-image-placeholder">
                    {user?.name?.charAt(0) || '?'}
                  </div>
                )}
                <div className="profile-image-overlay">
                  <FaCamera />
                  <span>Change Photo</span>
                </div>
              </div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                style={{ display: 'none' }}
              />
              {isUploading && <div className="upload-progress">Uploading...</div>}
            </div>

            {isEditing ? (
              <div className="edit-form">
                <div className="form-group">
                  <label>Name</label>
                  <input 
                    type="text" 
                    name="name" 
                    value={editData.name} 
                    onChange={handleInputChange}
                    placeholder="Enter your name"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input 
                    type="email" 
                    value={user.email || ''} 
                    disabled
                    className="disabled-input"
                  />
                </div>
                <div className="form-group">
                  <label>Phone</label>
                  <input 
                    type="tel" 
                    name="phone" 
                    value={editData.phone} 
                    onChange={handleInputChange}
                    placeholder="Enter your phone number"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Street Address</label>
                  <input 
                    type="text" 
                    name="address.street" 
                    value={editData.address.street} 
                    onChange={handleInputChange}
                    placeholder="Enter street address"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>City</label>
                  <input 
                    type="text" 
                    name="address.city" 
                    value={editData.address.city} 
                    onChange={handleInputChange}
                    placeholder="Enter city"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>State</label>
                  <input 
                    type="text" 
                    name="address.state" 
                    value={editData.address.state} 
                    onChange={handleInputChange}
                    placeholder="Enter state"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>ZIP Code</label>
                  <input 
                    type="text" 
                    name="address.zipCode" 
                    value={editData.address.zipCode} 
                    onChange={handleInputChange}
                    placeholder="Enter ZIP code"
                    required
                  />
                </div>
                <div className="form-actions">
                  <button 
                    className="save-btn" 
                    onClick={handleSave}
                    disabled={loading}
                  >
                    {loading ? 'Saving...' : <><FaCheck /> Save Changes</>}
                  </button>
                  <button 
                    className="cancel-btn" 
                    onClick={() => {
                      setIsEditing(false);
                      setError('');
                      setSuccess('');
                    }}
                    disabled={loading}
                  >
                    <FaTimes /> Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="profile-info">
                <div className="info-item">
                  <span className="label">Name:</span>
                  <span className="value">{user.name || 'Not provided'}</span>
                </div>
                <div className="info-item">
                  <span className="label">Email:</span>
                  <span className="value">{user.email || 'Not provided'}</span>
                </div>
                <div className="info-item">
                  <span className="label">Phone:</span>
                  <span className="value">{user.phone || 'Not provided'}</span>
                </div>
                <div className="info-item">
                  <span className="label">Address:</span>
                  <span className="value">
                    {user.address ? 
                      `${user.address.street || ''}, ${user.address.city || ''}, ${user.address.state || ''} ${user.address.zipCode || ''}` : 
                      'Not provided'
                    }
                  </span>
                </div>
                <button 
                  className="edit-btn"
                  onClick={() => {
                    setIsEditing(true);
                    setError('');
                    setSuccess('');
                  }}
                >
                  <FaEdit /> Edit Profile
                </button>
              </div>
            )}
          </div>
        );
      case 'orders':
        return (
          <div className="orders-section">
            <h2><FaHistory /> Order History</h2>
            {loading ? (
              <div className="loading">Loading orders...</div>
            ) : error ? (
              <div className="error">{error}</div>
            ) : (!orders || orders.length === 0) ? (
              <div className="no-orders">No orders found</div>
            ) : (
              <div className="orders-list">
                {orders.map((order) => (
                  <div key={order._id || order.orderId} className="order-card">
                    <div className="order-header">
                      <div className="order-id">Order #{order.orderId}</div>
                      <div className={`order-status ${getStatusColor(order.status)}`}>
                        {order.status}
                      </div>
                    </div>
                    <div className="order-details">
                      <div className="order-info">
                        <p>Date: {formatDate(order.createdAt)}</p>
                        <p>Amount: ₹{order.totalAmount}</p>
                        <p>Status: {order.status}</p>
                      </div>
                      {order.items && order.items.length > 0 && (
                        <div className="order-items">
                          <h4>Items:</h4>
                          {order.items.map((item, index) => (
                            <div key={index} className="order-item">
                              <span>{item.name} x {item.quantity}</span>
                              <span>₹{item.price * item.quantity}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="order-actions">
                      <button 
                        className="track-order-btn"
                        onClick={() => handleTrackOrder(order)}
                      >
                        <FaSearch /> Track Order
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      case 'preferences':
        return (
          <div className="preferences-section">
            <h2><MdLocalLaundryService /> Laundry Preferences</h2>
            {error && <p className="error-message">{error}</p>}
            {success && <p className="success-message">{success}</p>}
            
            {isEditingPreferences ? (
              <div className="preference-form">
                <div className="preference-group">
                  <label htmlFor="detergent">
                    <MdWaterDrop className="pref-icon" /> Detergent Preference
                  </label>
                  <select 
                    id="detergent" 
                    name="detergent"
                    value={preferences.detergent}
                    onChange={handlePreferenceChange}
                  >
                    <option value="regular">Regular</option>
                    <option value="mild">Mild</option>
                    <option value="hypoallergenic">Hypoallergenic</option>
                    <option value="eco-friendly">Eco-friendly</option>
                    <option value="scent-free">Scent-free</option>
                  </select>
                </div>
                
                <div className="preference-group checkbox">
                  <label htmlFor="fabricSoftener">
                    <RiTShirtLine className="pref-icon" /> Use Fabric Softener
                  </label>
                  <input
                    type="checkbox"
                    id="fabricSoftener"
                    name="fabricSoftener"
                    checked={preferences.fabricSoftener}
                    onChange={handlePreferenceChange}
                  />
                </div>
                
                <div className="preference-group">
                  <label htmlFor="washTemperature">
                    <MdWaterDrop className="pref-icon" /> Wash Temperature
                  </label>
                  <select 
                    id="washTemperature" 
                    name="washTemperature"
                    value={preferences.washTemperature}
                    onChange={handlePreferenceChange}
                  >
                    <option value="cold">Cold</option>
                    <option value="warm">Warm</option>
                    <option value="hot">Hot</option>
                  </select>
                </div>
                
                <div className="preference-group">
                  <label htmlFor="foldingPreference">
                    <MdOutlineDry className="pref-icon" /> Folding Preference
                  </label>
                  <select 
                    id="foldingPreference" 
                    name="foldingPreference"
                    value={preferences.foldingPreference}
                    onChange={handlePreferenceChange}
                  >
                    <option value="folded">Folded</option>
                    <option value="hangers">On Hangers</option>
                    <option value="both">Both (As Appropriate)</option>
                  </select>
                </div>
                
                <div className="preference-group checkbox">
                  <label htmlFor="stainTreatment">
                    <MdWaterDrop className="pref-icon" /> Apply Stain Treatment
                  </label>
                  <input
                    type="checkbox"
                    id="stainTreatment"
                    name="stainTreatment"
                    checked={preferences.stainTreatment}
                    onChange={handlePreferenceChange}
                  />
                </div>
                
                <div className="preference-group checkbox">
                  <label htmlFor="ironingPreference">
                    <MdIron className="pref-icon" /> Ironing Service
                  </label>
                  <input
                    type="checkbox"
                    id="ironingPreference"
                    name="ironingPreference"
                    checked={preferences.ironingPreference}
                    onChange={handlePreferenceChange}
                  />
                </div>
                
                <div className="preference-group">
                  <label htmlFor="deliveryTimePreference">
                    <BsClockHistory className="pref-icon" /> Preferred Delivery Time
                  </label>
                  <select 
                    id="deliveryTimePreference" 
                    name="deliveryTimePreference"
                    value={preferences.deliveryTimePreference}
                    onChange={handlePreferenceChange}
                  >
                    <option value="morning">Morning (8am - 12pm)</option>
                    <option value="afternoon">Afternoon (12pm - 5pm)</option>
                    <option value="evening">Evening (5pm - 9pm)</option>
                    <option value="any">Any Time</option>
                  </select>
                </div>
                
                <div className="preference-group">
                  <label htmlFor="specialInstructions">
                    <FaCog className="pref-icon" /> Special Instructions
                  </label>
                  <textarea
                    id="specialInstructions"
                    name="specialInstructions"
                    value={preferences.specialInstructions}
                    onChange={handlePreferenceChange}
                    placeholder="Add any special instructions for handling your laundry..."
                    rows={4}
                  />
                </div>
                
                <div className="form-actions">
                  <button 
                    className="save-btn" 
                    onClick={handleSavePreferences}
                    disabled={loading}
                  >
                    {loading ? 'Saving...' : <><FaCheck /> Save Preferences</>}
                  </button>
                  <button 
                    className="cancel-btn" 
                    onClick={() => {
                      setIsEditingPreferences(false);
                      setError('');
                      setSuccess('');
                      // Restore original preferences
                      fetchLaundryPreferences();
                    }}
                    disabled={loading}
                  >
                    <FaTimes /> Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="preferences-display">
                {preferences ? (
                  <div className="preferences-list">
                    <div className="preference-card">
                      <div className="preference-icon">
                        <MdWaterDrop />
                      </div>
                      <div className="preference-info">
                        <h3>Detergent</h3>
                        <p>{preferences.detergent === 'regular' ? 'Regular' :
                            preferences.detergent === 'mild' ? 'Mild' :
                            preferences.detergent === 'hypoallergenic' ? 'Hypoallergenic' :
                            preferences.detergent === 'eco-friendly' ? 'Eco-friendly' : 'Scent-free'}</p>
                      </div>
                    </div>
                    
                    <div className="preference-card">
                      <div className="preference-icon">
                        <RiTShirtLine />
                      </div>
                      <div className="preference-info">
                        <h3>Fabric Softener</h3>
                        <p>{preferences.fabricSoftener ? 'Yes' : 'No'}</p>
                      </div>
                    </div>
                    
                    <div className="preference-card">
                      <div className="preference-icon">
                        <MdWaterDrop />
                      </div>
                      <div className="preference-info">
                        <h3>Wash Temperature</h3>
                        <p>{preferences.washTemperature === 'cold' ? 'Cold' :
                            preferences.washTemperature === 'warm' ? 'Warm' : 'Hot'}</p>
                      </div>
                    </div>
                    
                    <div className="preference-card">
                      <div className="preference-icon">
                        <MdOutlineDry />
                      </div>
                      <div className="preference-info">
                        <h3>Folding Preference</h3>
                        <p>{preferences.foldingPreference === 'folded' ? 'Folded' :
                            preferences.foldingPreference === 'hangers' ? 'On Hangers' : 'Both (As Appropriate)'}</p>
                      </div>
                    </div>
                    
                    <div className="preference-card">
                      <div className="preference-icon">
                        <MdWaterDrop />
                      </div>
                      <div className="preference-info">
                        <h3>Stain Treatment</h3>
                        <p>{preferences.stainTreatment ? 'Yes' : 'No'}</p>
                      </div>
                    </div>
                    
                    <div className="preference-card">
                      <div className="preference-icon">
                        <MdIron />
                      </div>
                      <div className="preference-info">
                        <h3>Ironing Service</h3>
                        <p>{preferences.ironingPreference ? 'Yes' : 'No'}</p>
                      </div>
                    </div>
                    
                    <div className="preference-card">
                      <div className="preference-icon">
                        <BsClockHistory />
                      </div>
                      <div className="preference-info">
                        <h3>Delivery Time</h3>
                        <p>{preferences.deliveryTimePreference === 'morning' ? 'Morning (8am - 12pm)' :
                            preferences.deliveryTimePreference === 'afternoon' ? 'Afternoon (12pm - 5pm)' :
                            preferences.deliveryTimePreference === 'evening' ? 'Evening (5pm - 9pm)' : 'Any Time'}</p>
                      </div>
                    </div>
                    
                    {preferences.specialInstructions && (
                      <div className="preference-card full-width">
                        <div className="preference-icon">
                          <FaCog />
                        </div>
                        <div className="preference-info">
                          <h3>Special Instructions</h3>
                          <p>{preferences.specialInstructions}</p>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <p>No preferences set yet.</p>
                )}
                
                <button 
                  className="edit-btn"
                  onClick={() => {
                    setIsEditingPreferences(true);
                    setError('');
                    setSuccess('');
                  }}
                >
                  <FaEdit /> Edit Preferences
                </button>
              </div>
            )}
          </div>
        );
      case 'payment':
        return (
          <div className="payment-section">
            <h2><MdPayment /> Payment Methods</h2>
            {error && <p className="error-message">{error}</p>}
            {success && <p className="success-message">{success}</p>}
            
            {!isAddingPayment ? (
              <div className="saved-payment-methods">
                {paymentMethods.length > 0 ? (
                  <div className="payment-method-list">
                    {paymentMethods.map(method => (
                      <div key={method._id} className="payment-method-card">
                        <div className="payment-method-icon">
                          {method.type === 'creditCard' && <FaCreditCard className="card-icon" />}
                          {method.type === 'debitCard' && <FaCreditCard className="card-icon" />}
                          {method.type === 'upi' && <SiGooglepay className="upi-icon" />}
                          {method.type === 'paypal' && <FaPaypal className="paypal-icon" />}
                          {method.type === 'cod' && <MdPayment className="cod-icon" />}
                        </div>
                        <div className="payment-method-details">
                          {(method.type === 'creditCard' || method.type === 'debitCard') && (
                            <>
                              <h3>{method.type === 'creditCard' ? 'Credit Card' : 'Debit Card'}</h3>
                              <p>{method.cardName}</p>
                              <p>{method.cardNumber}</p>
                              <p>Expires: {method.expDate}</p>
                            </>
                          )}
                          
                          {method.type === 'upi' && (
                            <>
                              <h3>UPI</h3>
                              <p>{method.upiId}</p>
                            </>
                          )}
                          
                          {method.type === 'paypal' && (
                            <>
                              <h3>PayPal</h3>
                              <p>{method.paypalEmail}</p>
                            </>
                          )}
                          
                          {method.type === 'cod' && (
                            <>
                              <h3>Cash on Delivery</h3>
                              <p>Phone: {method.phoneNumber}</p>
                            </>
                          )}
                          
                          {method.isDefault && <div className="default-badge">Default</div>}
                        </div>
                        <div className="payment-method-actions">
                          {!method.isDefault && (
                            <button 
                              className="set-default-btn"
                              onClick={() => handleSetDefaultPaymentMethod(method._id)}
                              disabled={loading}
                            >
                              Set as Default
                            </button>
                          )}
                          <button 
                            className="remove-payment-btn"
                            onClick={() => handleRemovePaymentMethod(method._id)}
                            disabled={loading}
                          >
                            <FaTrash /> Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p>No payment methods added yet.</p>
                )}
                
                <button 
                  className="add-payment-btn"
                  onClick={handleAddPaymentMethod}
                >
                  <FaPlus /> Add Payment Method
                </button>
              </div>
            ) : (
              <div className="add-payment-form">
                <h3>Add New Payment Method</h3>
                
                <div className="payment-type-selector">
                  <div 
                    className={`payment-type ${newPaymentMethod.type === 'creditCard' ? 'active' : ''}`}
                    onClick={() => setNewPaymentMethod(prev => ({ ...prev, type: 'creditCard' }))}
                  >
                    <FaCreditCard /> Credit Card
                  </div>
                  <div 
                    className={`payment-type ${newPaymentMethod.type === 'debitCard' ? 'active' : ''}`}
                    onClick={() => setNewPaymentMethod(prev => ({ ...prev, type: 'debitCard' }))}
                  >
                    <FaCreditCard /> Debit Card
                  </div>
                  <div 
                    className={`payment-type ${newPaymentMethod.type === 'upi' ? 'active' : ''}`}
                    onClick={() => setNewPaymentMethod(prev => ({ ...prev, type: 'upi' }))}
                  >
                    <SiGooglepay /> UPI
                  </div>
                  <div 
                    className={`payment-type ${newPaymentMethod.type === 'paypal' ? 'active' : ''}`}
                    onClick={() => setNewPaymentMethod(prev => ({ ...prev, type: 'paypal' }))}
                  >
                    <FaPaypal /> PayPal
                  </div>
                </div>
                
                {(newPaymentMethod.type === 'creditCard' || newPaymentMethod.type === 'debitCard') && (
                  <div className="card-details">
                    <div className="form-group">
                      <label htmlFor="cardName">Name on Card</label>
                      <input
                        type="text"
                        id="cardName"
                        name="cardName"
                        value={newPaymentMethod.cardName}
                        onChange={handlePaymentInputChange}
                        placeholder="John Doe"
                      />
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="cardNumber">Card Number</label>
                      <input
                        type="text"
                        id="cardNumber"
                        name="cardNumber"
                        value={newPaymentMethod.cardNumber}
                        onChange={handlePaymentInputChange}
                        placeholder="1234 5678 9012 3456"
                        maxLength="16"
                      />
                    </div>
                    
                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="expDate">Expiry Date</label>
                        <input
                          type="text"
                          id="expDate"
                          name="expDate"
                          value={newPaymentMethod.expDate}
                          onChange={handlePaymentInputChange}
                          placeholder="MM/YY"
                          maxLength="5"
                        />
                      </div>
                      
                      <div className="form-group">
                        <label htmlFor="cvv">CVV</label>
                        <input
                          type="password"
                          id="cvv"
                          name="cvv"
                          value={newPaymentMethod.cvv}
                          onChange={handlePaymentInputChange}
                          placeholder="123"
                          maxLength="4"
                        />
                      </div>
                    </div>
                  </div>
                )}
                
                {newPaymentMethod.type === 'upi' && (
                  <div className="upi-details">
                    <div className="form-group">
                      <label htmlFor="upiId">UPI ID</label>
                      <input
                        type="text"
                        id="upiId"
                        name="upiId"
                        value={newPaymentMethod.upiId}
                        onChange={handlePaymentInputChange}
                        placeholder="yourname@upi"
                      />
                    </div>
                    <div className="upi-providers">
                      <SiGooglepay className="upi-provider-icon" />
                      <SiPhonepe className="upi-provider-icon" />
                      <SiPaytm className="upi-provider-icon" />
                    </div>
                  </div>
                )}
                
                {newPaymentMethod.type === 'paypal' && (
                  <div className="paypal-details">
                    <div className="form-group">
                      <label htmlFor="paypalEmail">PayPal Email</label>
                      <input
                        type="email"
                        id="paypalEmail"
                        name="paypalEmail"
                        value={newPaymentMethod.paypalEmail}
                        onChange={handlePaymentInputChange}
                        placeholder="your.email@example.com"
                      />
                    </div>
                    <p className="payment-info-text">
                      You'll be redirected to PayPal to complete payments securely.
                    </p>
                  </div>
                )}
                
                <div className="form-actions">
                  <button 
                    className="save-btn" 
                    onClick={handleSavePaymentMethod}
                  >
                    <FaCheck /> Save Payment Method
                  </button>
                  <button 
                    className="cancel-btn" 
                    onClick={() => {
                      setIsAddingPayment(false);
                      setError('');
                    }}
                  >
                    <FaTimes /> Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      case 'settings':
        if (user?.role !== 'admin') {
          return <div>Access denied</div>;
        }
        return (
          <div className="settings-section">
            <h2><FaCog /> Admin Settings</h2>
            {error && <p className="error-message">{error}</p>}
            {success && <p className="success-message">{success}</p>}
            
            <div className="settings-grid">
              <div className="settings-card">
                <div className="settings-icon">
                  <FaUser />
                </div>
                <div className="settings-info">
                  <h3>Profile Settings</h3>
                  <p>Update your admin profile information</p>
                  <button className="settings-btn" onClick={() => setActiveTab('profile')}>
                    Manage Profile
                  </button>
                </div>
              </div>
              
              <div className="settings-card">
                <div className="settings-icon">
                  <FaDatabase />
                </div>
                <div className="settings-info">
                  <h3>System Backup</h3>
                  <p>Create a backup of the system data</p>
                  <button 
                    className="settings-btn"
                    onClick={() => {
                      // Add backup functionality
                      setSuccess('Backup initiated successfully');
                    }}
                  >
                    Backup Data
                  </button>
                </div>
              </div>
              
              <div className="settings-card">
                <div className="settings-icon">
                  <FaRedo />
                </div>
                <div className="settings-info">
                  <h3>System Reset</h3>
                  <p>Reset system to default settings</p>
                  <button 
                    className="settings-btn danger"
                    onClick={() => {
                      if (window.confirm('Are you sure you want to reset the system? This action cannot be undone.')) {
                        // Add reset functionality
                        setSuccess('System reset completed');
                      }
                    }}
                  >
                    Reset System
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return <div>Select a tab</div>;
    }
  };

  return (
    <div className="account-container">
      <div className="account-sidebar">
        <div className="user-profile">
          <div 
            className="avatar"
            style={profileImage ? { backgroundImage: `url(${profileImage})` } : {}}
          >
            {!profileImage && (user?.name?.charAt(0) || '?')}
          </div>
          <h3>{user?.name || 'User'}</h3>
          <p>{user?.email || ''}</p>
        </div>
        <nav className="account-menu">
          <button 
            className={activeTab === 'profile' ? 'active' : ''}
            onClick={() => setActiveTab('profile')}
          >
            <FaUser /> My Profile
          </button>
          <button 
            className={activeTab === 'orders' ? 'active' : ''}
            onClick={() => setActiveTab('orders')}
          >
            <FaHistory /> My Orders
          </button>
          <button 
            className={activeTab === 'preferences' ? 'active' : ''}
            onClick={() => setActiveTab('preferences')}
          >
            <MdLocalLaundryService /> Preferences
          </button>
          <button 
            className={activeTab === 'payment' ? 'active' : ''}
            onClick={() => setActiveTab('payment')}
          >
            <MdPayment /> Payment Methods
          </button>
          {user?.role === 'admin' && (
            <button 
              className={activeTab === 'settings' ? 'active' : ''}
              onClick={() => setActiveTab('settings')}
            >
              <FaCog /> Settings
            </button>
          )}
          <button className="logout-btn" onClick={handleLogout}>
            <FaSignOutAlt /> Log Out
          </button>
        </nav>
      </div>
      <div className="account-content">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default Account;