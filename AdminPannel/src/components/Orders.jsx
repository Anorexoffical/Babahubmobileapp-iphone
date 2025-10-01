import React, { useState, useEffect } from 'react';
import { 
  FiSearch, 
  FiCalendar,
  FiDollarSign,
  FiPackage,
  FiTruck,
  FiCheckCircle,
  FiClock,
  FiUser,
  FiChevronLeft,
  FiChevronRight,
  FiFilter
} from 'react-icons/fi';
import { Table, Pagination, Badge, Form, Button, Card, Alert, Modal, Row, Col } from 'react-bootstrap';
import Topbar from './Topbar';
import '../Style/Orders.css';
import axios from 'axios';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 10;
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await axios.get('https://account.babahub.co/api/order/get');
      setOrders(res.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate status counts
  const getStatusCounts = () => {
    const total = orders.length;
    const pendingPayment = orders.filter(order => order.deliveryStatus === 'Pending Payment').length;
    const processing = orders.filter(order => order.deliveryStatus === 'Processing').length;
    const shipped = orders.filter(order => order.deliveryStatus === 'Shipped').length;
    const completed = orders.filter(order => order.deliveryStatus === 'Completed').length;

    return { total, pendingPayment, processing, shipped, completed };
  };

  const statusCounts = getStatusCounts();

  // Filter and pagination logic
  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.orderID.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || order.deliveryStatus === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    setShowDetails(true);
  };

  const handleCloseDetails = () => {
    setShowDetails(false);
    setSelectedOrder(null);
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      const response = await axios.put(`https://account.babahub.co/api/order/update-status/${orderId}`, {
        status: newStatus
      });
      
      // Update local state with the updated order
      setOrders(orders.map(order => 
        order.orderID === orderId ? response.data : order
      ));
      
      setSuccessMessage(`Order ${orderId} status updated to ${newStatus}`);
      setTimeout(() => setSuccessMessage(''), 3000);
      
      // If we're viewing details, update the selected order as well
      if (selectedOrder && selectedOrder.orderID === orderId) {
        setSelectedOrder(response.data);
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      setSuccessMessage(`Failed to update order status: ${error.response?.data?.error || error.message}`);
      setTimeout(() => setSuccessMessage(''), 3000);
    }
  };

  const getStatusVariant = (status) => {
    switch(status) {
      case 'Completed': return 'success';
      case 'Shipped': return 'primary';
      case 'Processing': return 'warning';
      case 'Pending Payment': return 'danger';
      default: return 'light';
    }
  };

  const getStatusStyle = (status) => {
    switch(status) {
      case 'Completed':
        return { 
          backgroundColor: '#e6f7ee',
          color: '#00b894',
          border: '1px solid #00b894'
        };
      case 'Shipped':
        return { 
          backgroundColor: '#e6f0ff',
          color: '#0984e3',
          border: '1px solid #0984e3'
        };
      case 'Processing':
        return { 
          backgroundColor: '#fff4e6',
          color: '#e17055',
          border: '1px solid #e17055'
        };
      case 'Pending Payment':
        return { 
          backgroundColor: '#ffe6e6',
          color: '#d63031',
          border: '1px solid #d63031'
        };
      default:
        return { 
          backgroundColor: '#f0f0f0',
          color: '#636e72',
          border: '1px solid #ddd'
        };
    }
  };

  const getStatusCardStyle = (status) => {
    switch(status) {
      case 'total':
        return { background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' };
      case 'pending':
        return { background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' };
      case 'processing':
        return { background: 'linear-gradient(135deg, #ffd89b 0%, #19547b 100%)' };
      case 'shipped':
        return { background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' };
      case 'completed':
        return { background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' };
      default:
        return { background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' };
    }
  };

  return (
    <>
      <Topbar />
      <div className="orders-dashboard">
        {successMessage && (
          <Alert variant="success" onClose={() => setSuccessMessage('')} dismissible>
            {successMessage}
          </Alert>
        )}

        <div className="dashboard-header mb-4">
          <div className="container-fluid">
            <div className="row align-items-center mb-3 mb-md-0">
              <div className="col-md-6 mb-3 mb-md-0">
                <h1 className="fw-bold mb-1">Order Management</h1>
                <p className="text-muted mb-0">View and manage customer orders</p>
              </div>
              <div className="col-md-6 d-flex flex-column flex-md-row gap-3 align-items-start align-items-md-center">
                <div className="search-container flex-grow-1">
                  <FiSearch className="search-icon" />
                  <Form.Control 
                    type="search" 
                    placeholder="Search orders..." 
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
                  />
                </div>
                <div className="filter-container">
                  <Form.Select 
                    value={statusFilter}
                    onChange={(e) => {
                      setStatusFilter(e.target.value);
                      setCurrentPage(1);
                    }}
                    style={{ width: '180px' }}
                  >
                    <option value="all">All Status</option>
                    <option value="Pending Payment">Pending Payment</option>
                    <option value="Processing">Processing</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Completed">Completed</option>
                  </Form.Select>
                </div>
              </div>
            </div>

            {/* Status Count Cards */}
            <div className="row g-3 mt-4">
              <div className="col-6 col-md-3">
                <div className="status-count-card" style={getStatusCardStyle('total')}>
                  <div className="status-count-value">{statusCounts.total}</div>
                  <div className="status-count-label">Total Orders</div>
                  <div className="status-count-icon">
                    <FiPackage size={24} />
                  </div>
                </div>
              </div>
              <div className="col-6 col-md-3">
                <div className="status-count-card" style={getStatusCardStyle('pending')}>
                  <div className="status-count-value">{statusCounts.pendingPayment}</div>
                  <div className="status-count-label">Pending Payment</div>
                  <div className="status-count-icon">
                    <FiClock size={24} />
                  </div>
                </div>
              </div>
              <div className="col-6 col-md-3">
                <div className="status-count-card" style={getStatusCardStyle('processing')}>
                  <div className="status-count-value">{statusCounts.processing}</div>
                  <div className="status-count-label">Processing</div>
                  <div className="status-count-icon">
                    <FiPackage size={24} />
                  </div>
                </div>
              </div>
              <div className="col-6 col-md-3">
                <div className="status-count-card" style={getStatusCardStyle('completed')}>
                  <div className="status-count-value">{statusCounts.completed}</div>
                  <div className="status-count-label">Completed</div>
                  <div className="status-count-icon">
                    <FiCheckCircle size={24} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3">Loading orders...</p>
          </div>
        ) : (
          <>
            <div className="table-responsive">
              <Table striped bordered hover className="orders-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Date</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentOrders.length > 0 ? (
                    currentOrders.map(order => (
                      <tr key={order._id}>
                        <td>{order.orderID.split("-").slice(0, 2).join("-")}</td>
                        <td>
                          <div className="d-flex align-items-center">
                            <FiUser className="me-2" />
                            <div>
                              <div>{order.name}</div>
                              <small className="text-muted">{order.email}</small>
                            </div>
                          </div>
                        </td>
                        <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                        <td>R {order.totalAmountAfterTax}</td>
                        <td>
                          <Badge 
                            style={getStatusStyle(order.deliveryStatus)}
                            className="status-badge-custom"
                          >
                            {order.deliveryStatus}
                          </Badge>
                        </td>
                        <td>
                          <Button 
                            variant="outline-primary" 
                            size="sm" 
                            onClick={() => handleViewDetails(order)}
                            className="me-2"
                          >
                            View
                          </Button>
                          {order.deliveryStatus === 'Processing' && (
                            <Button 
                              variant="outline-success" 
                              size="sm" 
                              onClick={() => handleUpdateStatus(order.orderID, 'Shipped')}
                            >
                              Ship
                            </Button>
                          )}
                          {order.deliveryStatus === 'Shipped' && (
                            <Button 
                              variant="outline-info" 
                              size="sm" 
                              onClick={() => handleUpdateStatus(order.orderID, 'Completed')}
                            >
                              Complete
                            </Button>
                          )}
                          {order.deliveryStatus === 'Pending Payment' && (
                            <Button 
                              variant="outline-warning" 
                              size="sm" 
                              onClick={() => handleUpdateStatus(order.orderID, 'Processing')}
                            >
                              Process
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="text-center py-4">
                        <div className="py-3">
                          <FiSearch size={48} className="text-muted mb-3" />
                          <h5>No orders found</h5>
                          <p className="text-muted">Try adjusting your search or filters</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </div>

            {filteredOrders.length > 0 && (
              <div className="d-flex justify-content-center mt-4">
                <Pagination>
                  <Pagination.Prev 
                    onClick={() => paginate(currentPage - 1)} 
                    disabled={currentPage === 1}
                  />
                  {[...Array(totalPages).keys()].map(i => (
                    <Pagination.Item
                      key={i + 1}
                      active={currentPage === i + 1}
                      onClick={() => paginate(i + 1)}
                    >
                      {i + 1}
                    </Pagination.Item>
                  ))}
                  <Pagination.Next 
                    onClick={() => paginate(currentPage + 1)} 
                    disabled={currentPage === totalPages}
                  />
                </Pagination>
              </div>
            )}
          </>
        )}

        {/* Order Details Modal using React-Bootstrap Modal */}
        <Modal show={showDetails} onHide={handleCloseDetails} size="lg" centered scrollable>
          {selectedOrder && (
            <>
              <Modal.Header closeButton>
                <Modal.Title>Order Details - {selectedOrder.orderID}</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <div className="row mb-4">
                  <div className="col-md-6">
                    <Card>
                      <Card.Header className="d-flex align-items-center">
                        <FiUser className="me-2" />
                        <span>Customer Information</span>
                      </Card.Header>
                      <Card.Body>
                        <p><strong>Name:</strong> {selectedOrder.name}</p>
                        <p><strong>Email:</strong> {selectedOrder.email}</p>
                        <p><strong>Phone:</strong> {selectedOrder.phoneNO}</p>
                      </Card.Body>
                    </Card>
                  </div>
                  <div className="col-md-6">
                    <Card>
                      <Card.Header className="d-flex align-items-center">
                        <FiCalendar className="me-2" />
                        <span>Order Information</span>
                      </Card.Header>
                      <Card.Body>
                        <p><strong>Date:</strong> {new Date(selectedOrder.createdAt).toLocaleDateString()}</p>
                        <p><strong>Status:</strong> 
                          <Badge 
                            style={getStatusStyle(selectedOrder.deliveryStatus)}
                            className="status-badge-custom ms-2"
                          >
                            {selectedOrder.deliveryStatus}
                          </Badge>
                        </p>
                        <p><strong>Total:</strong> R {selectedOrder.totalAmountAfterTax}</p>
                      </Card.Body>
                    </Card>
                  </div>
                </div>

                <Card className="mb-4">
                  <Card.Header className="d-flex align-items-center">
                    <FiPackage className="me-2" />
                    <span>Order Items</span>
                  </Card.Header>
                  <Card.Body>
                    <Table striped bordered hover>
                      <thead>
                        <tr>
                          <th>Product</th>
                          <th>Price</th>
                          <th>Size</th>
                          <th>Color</th>
                          <th>Quantity</th>
                          <th>Subtotal</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedOrder.items.map(item => (
                          <tr key={item._id}>
                            <td>{item.title}</td>
                            <td>R {item.price}</td>
                            <td>{item.size}</td>
                            <td>{item.color}</td>
                            <td>{item.quantity}</td>
                            <td>R {(item.price * item.quantity).toFixed(2)}</td>
                          </tr>
                        ))}
                        <tr>
                          <td colSpan="5" className="text-end"><strong>Total:</strong></td>
                          <td><strong>R {selectedOrder.totalAmountAfterTax}</strong></td>
                        </tr>
                      </tbody>
                    </Table>
                  </Card.Body>
                </Card>
              </Modal.Body>
              <Modal.Footer>
                <Button variant="secondary" onClick={handleCloseDetails}>
                  Close
                </Button>
                {selectedOrder.deliveryStatus === 'Processing' && (
                  <Button variant="success" onClick={() => {
                    handleUpdateStatus(selectedOrder.orderID, 'Shipped');
                    handleCloseDetails();
                  }}>
                    <FiTruck className="me-1" /> Mark as Shipped
                  </Button>
                )}
                {selectedOrder.deliveryStatus === 'Shipped' && (
                  <Button variant="info" onClick={() => {
                    handleUpdateStatus(selectedOrder.orderID, 'Completed');
                    handleCloseDetails();
                  }}>
                    <FiCheckCircle className="me-1" /> Mark as Completed
                  </Button>
                )}
                {selectedOrder.deliveryStatus === 'Pending Payment' && (
                  <Button variant="warning" onClick={() => {
                    handleUpdateStatus(selectedOrder.orderID, 'Processing');
                    handleCloseDetails();
                  }}>
                    <FiCheckCircle className="me-1" /> Mark as Processing
                  </Button>
                )}
              </Modal.Footer>
            </>
          )}
        </Modal>
      </div>
    </>
  );
};

export default Orders;