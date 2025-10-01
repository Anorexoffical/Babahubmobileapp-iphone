import React, { useEffect, useState } from 'react';
import {
  FiSearch,
  FiPlus,
  FiChevronLeft,
  FiChevronRight,
  FiMoreHorizontal,
  FiEdit,
  FiFilter
} from 'react-icons/fi';
import { Modal, Button, Table, Badge, Alert, Form, Dropdown } from 'react-bootstrap';
import AddProduct from './AddProduct.jsx';
import EditProduct from './EditProduct.jsx';
import '../Style/ProductTable.css';
import Topbar from './Topbar.jsx';
import axios from 'axios';

const ProductTable = () => {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);
  const [stockFilter, setStockFilter] = useState('all');
  const [editingProduct, setEditingProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProducts();

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await axios.get('https://account.babahub.co/api/products');
      setProducts(res.data);
    } catch (err) {
      console.error('Failed to fetch products:', err);
      setError('Failed to load products. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const productsPerPage = 8;

  const handleAddProduct = async (product) => {
    setIsSubmitting(true);
    try {
      const res = await axios.post('https://account.babahub.co/api/products', product);
      setProducts([...products, res.data]);
      setShowAddModal(false);
      setSuccessMessage(`Product "${res.data.name}" added successfully!`);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error adding product:', err);
      setError('Failed to add product. Please try again.');
    }
    setIsSubmitting(false);
  };

  const handleUpdateProduct = async (product) => {
    setIsSubmitting(true);
    try {
      const res = await axios.put(`https://account.babahub.co/api/products/${editingProduct._id}`, product);
      setProducts(products.map(p => p._id === editingProduct._id ? res.data : p));
      setShowEditModal(false);
      setEditingProduct(null);
      setSuccessMessage(`Product "${res.data.name}" updated successfully!`);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error updating product:', err);
      setError('Failed to update product. Please try again.');
    }
    setIsSubmitting(false);
  };

  const calculateTotalStock = (variants) => {
    if (!variants || !Array.isArray(variants)) return 0;
    return variants.reduce((total, v) =>
      total + (v.sizes ? v.sizes.reduce((sum, s) => sum + (s.stock || 0), 0) : 0), 0);
  };

  const getProductStatus = (variants) => {
    const total = calculateTotalStock(variants);
    if (total === 0) return 'Out of Stock';
    if (total < 10) return 'Low Stock';
    return 'In Stock';
  };

  // Enhanced status styling with soft colors
  const getStatusStyle = (variants) => {
    const status = getProductStatus(variants);
    
    switch (status) {
      case 'In Stock':
        return { 
          backgroundColor: '#f0f9f0',
          color: '#2e8b57',
          borderColor: '#2e8b57'
        };
      case 'Low Stock':
        return { 
          backgroundColor: '#fff9f0',
          color: '#ff8c00',
          borderColor: '#ff8c00'
        };
      case 'Out of Stock':
        return { 
          backgroundColor: '#fff0f0',
          color: '#dc3545',
          borderColor: '#dc3545'
        };
      default:
        return { 
          backgroundColor: '#f8f9fa',
          color: '#6c757d',
          borderColor: '#6c757d'
        };
    }
  };

  const getStatusDotStyle = (variants) => {
    const status = getProductStatus(variants);
    
    switch (status) {
      case 'In Stock':
        return { backgroundColor: '#2e8b57' };
      case 'Low Stock':
        return { backgroundColor: '#ff8c00' };
      case 'Out of Stock':
        return { backgroundColor: '#dc3545' };
      default:
        return { backgroundColor: '#6c757d' };
    }
  };

  const filteredProducts = products.filter(product => {
    if (!product) return false;
    
    const matchesSearch = 
      (product.name && product.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (product.brand && product.brand.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (product.category && product.category.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const status = getProductStatus(product.variants);
    let matchesStock = true;
    if (stockFilter === 'low') {
      matchesStock = status === 'Low Stock';
    } else if (stockFilter === 'out') {
      matchesStock = status === 'Out of Stock';
    }
    
    return matchesSearch && matchesStock;
  });

  const indexOfLast = currentPage * productsPerPage;
  const indexOfFirst = indexOfLast - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const openDetailsModal = (product) => {
    setSelectedProduct(product);
    setShowDetailsModal(true);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setShowEditModal(true);
  };

  const handleAddModalClose = () => {
    setShowAddModal(false);
  };

  const handleEditModalClose = () => {
    setShowEditModal(false);
    setEditingProduct(null);
  };

  const getFilterLabel = () => {
    switch (stockFilter) {
      case 'all': return 'All Products';
      case 'low': return 'Low Stock';
      case 'out': return 'Out of Stock';
      default: return 'All Products';
    }
  };

  // Premium status count cards styling with soft colors
  const getStatusCardStyle = (type) => {
    switch(type) {
      case 'total':
        return { 
          background: 'linear-gradient(135deg, rgba(107, 115, 255, 0.1) 0%, rgba(0, 13, 255, 0.1) 100%)',
          color: '#6b73ff',
          border: '1px solid rgba(107, 115, 255, 0.2)'
        };
      case 'in-stock':
        return { 
          background: 'linear-gradient(135deg, rgba(46, 139, 87, 0.1) 0%, rgba(144, 238, 144, 0.1) 100%)',
          color: '#2e8b57',
          border: '1px solid rgba(46, 139, 87, 0.2)'
        };
      case 'low-stock':
        return { 
          background: 'linear-gradient(135deg, rgba(255, 140, 0, 0.1) 0%, rgba(255, 215, 0, 0.1) 100%)',
          color: '#ff8c00',
          border: '1px solid rgba(255, 140, 0, 0.2)'
        };
      case 'out-of-stock':
        return { 
          background: 'linear-gradient(135deg, rgba(220, 53, 69, 0.1) 0%, rgba(255, 182, 193, 0.1) 100%)',
          color: '#dc3545',
          border: '1px solid rgba(220, 53, 69, 0.2)'
        };
      default:
        return { 
          background: 'linear-gradient(135deg, rgba(107, 115, 255, 0.1) 0%, rgba(0, 13, 255, 0.1) 100%)',
          color: '#6b73ff',
          border: '1px solid rgba(107, 115, 255, 0.2)'
        };
    }
  };

  return (
    <>
      <Topbar />

      <div className="product-dashboard">
        {successMessage && (
          <Alert variant="success" onClose={() => setSuccessMessage('')} dismissible className="fade-in">
            {successMessage}
          </Alert>
        )}

        {error && (
          <Alert variant="danger" onClose={() => setError('')} dismissible className="fade-in">
            {error}
          </Alert>
        )}

        {/* Add Product Modal */}
        <AddProduct
          show={showAddModal}
          onHide={handleAddModalClose}
          onAddProduct={handleAddProduct}
          isSubmitting={isSubmitting}
          setIsSubmitting={setIsSubmitting}
        />

        {/* Edit Product Modal */}
        <EditProduct
          show={showEditModal}
          onHide={handleEditModalClose}
          onUpdateProduct={handleUpdateProduct}
          isSubmitting={isSubmitting}
          setIsSubmitting={setIsSubmitting}
          editingProduct={editingProduct}
        />

        <Modal show={showDetailsModal} onHide={() => setShowDetailsModal(false)} size="lg" centered>
          <Modal.Header closeButton className="bg-light">
            <Modal.Title className="fw-bold">Product Details</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {selectedProduct && (
              <>
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-start mb-4 gap-2">
                  <div>
                    <h4 className="fw-bold mb-1">{selectedProduct.name}</h4>
                    <div className="d-flex gap-3 text-muted">
                      <span>{selectedProduct.brand}</span>
                      <span>•</span>
                      <span>{selectedProduct.category}</span>
                    </div>
                  </div>
                  <Badge 
                    style={getStatusStyle(selectedProduct.variants)}
                    className="status-badge-custom"
                  >
                    <span 
                      className="status-dot"
                      style={getStatusDotStyle(selectedProduct.variants)}
                    ></span>
                    {getProductStatus(selectedProduct.variants)}
                  </Badge>
                </div>
                
                {selectedProduct.image && (
                  <div className="mb-3">
                    <img 
                      src={selectedProduct.image} 
                      alt={selectedProduct.name} 
                      style={{ maxWidth: '200px', borderRadius: '8px' }} 
                    />
                  </div>
                )}

                <h5 className="fw-bold mb-3">Available Variants</h5>
                <div className="table-responsive">
                  <Table bordered hover className="mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Color</th>
                        <th>Size</th>
                        <th>Stock</th>
                        <th>Price</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedProduct.variants && selectedProduct.variants.map((variant, vIdx) =>
                        variant.sizes && variant.sizes.map((size, sIdx) => (
                          <tr key={`${vIdx}-${sIdx}`}>
                            <td>
                              <div className="d-flex align-items-center gap-2">
                                <span
                                  className="color-dot"
                                  style={{ backgroundColor: variant.colorCode || '#ccc' }}
                                ></span>
                                {variant.color}
                              </div>
                            </td>
                            <td>{size.size}</td>
                            <td>
                              <Badge 
                                style={getStatusStyle([{ sizes: [{ stock: size.stock }] }])}
                                className="status-badge-custom"
                              >
                                <span 
                                  className="status-dot"
                                  style={getStatusDotStyle([{ sizes: [{ stock: size.stock }] }])}
                                ></span>
                                {size.stock}
                              </Badge>
                            </td>
                            <td className="fw-bold">${size.price ? size.price.toFixed(2) : '0.00'}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </Table>
                </div>
              </>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="outline-secondary" onClick={() => setShowDetailsModal(false)}>
              Close
            </Button>
          </Modal.Footer>
        </Modal>

        <div className={`dashboard-header ${isScrolled ? 'scrolled' : ''}`}>
          <div className="container-fluid">
            <div className="row align-items-center mb-3 mb-md-0">
              <div className="col-md-6 mb-3 mb-md-0">
                <h1 className="fw-bold mb-1">Product Inventory</h1>
                <p className="text-muted mb-0">Manage your product catalog and inventory</p>
              </div>

              <div className="col-md-6 d-flex flex-column flex-md-row gap-3 align-items-start align-items-md-center justify-content-md-end">
                <div className="search-container flex-grow-1" style={{ maxWidth: "400px" }}>
                  <FiSearch className="search-icon" />
                  <Form.Control 
                    type="search" 
                    placeholder="Search products by name, brand, or category..." 
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="search-input-custom"
                  />
                </div>
                
                {/* Stock Filter Dropdown */}
                <Dropdown className="stock-filter-dropdown">
                  <Dropdown.Toggle variant="outline-secondary" id="stock-filter-dropdown" className="d-flex align-items-center gap-2">
                    <FiFilter size={16} />
                    {getFilterLabel()}
                  </Dropdown.Toggle>

                  <Dropdown.Menu>
                    <Dropdown.Item 
                      onClick={() => setStockFilter('all')}
                      className={stockFilter === 'all' ? 'active' : ''}
                    >
                      All Products
                    </Dropdown.Item>
                    <Dropdown.Item 
                      onClick={() => setStockFilter('low')}
                      className={stockFilter === 'low' ? 'active' : ''}
                    >
                      Low Stock
                    </Dropdown.Item>
                    <Dropdown.Item 
                      onClick={() => setStockFilter('out')}
                      className={stockFilter === 'out' ? 'active' : ''}
                    >
                      Out of Stock
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
                
                <Button 
                  variant="primary" 
                  onClick={() => setShowAddModal(true)} 
                  className="add-product-btn"
                >
                  <FiPlus className="me-1" /> Add Product
                </Button>
              </div>
            </div>
            
            {/* Search Results Info */}
            <div className="row mt-2">
              <div className="col-12">
                <div className="search-results-info">
                  <span className="text-dark">
                    {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} found
                    {searchTerm && ` for "${searchTerm}"`}
                    {stockFilter !== 'all' && ` (${getFilterLabel()})`}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Enhanced Status Count Cards */}
            <div className="row g-3 mt-2">
              <div className="col-6 col-md-3">
                <div className="status-count-card" style={getStatusCardStyle('total')}>
                  <div className="status-count-value">{products.length}</div>
                  <div className="status-count-label">Total Products</div>
                </div>
              </div>
              <div className="col-6 col-md-3">
                <div className="status-count-card" style={getStatusCardStyle('in-stock')}>
                  <div className="status-count-value">
                    {products.filter(p => getProductStatus(p.variants) === 'In Stock').length}
                  </div>
                  <div className="status-count-label">In Stock</div>
                </div>
              </div>
              <div className="col-6 col-md-3">
                <div className="status-count-card" style={getStatusCardStyle('low-stock')}>
                  <div className="status-count-value">
                    {products.filter(p => getProductStatus(p.variants) === 'Low Stock').length}
                  </div>
                  <div className="status-count-label">Low Stock</div>
                </div>
              </div>
              <div className="col-6 col-md-3">
                <div className="status-count-card" style={getStatusCardStyle('out-of-stock')}>
                  <div className="status-count-value">
                    {products.filter(p => getProductStatus(p.variants) === 'Out of Stock').length}
                  </div>
                  <div className="status-count-label">Out of Stock</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="container-fluid mt-4">
          <div className="card premium-card">
            <div className="card-body p-0">
              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="mt-3">Loading products...</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <Table hover className="products-table mb-0">
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Status</th>
                        <th className="d-none d-md-table-cell">Stock</th>
                        <th className="d-none d-lg-table-cell">Brand</th>
                        <th className="d-none d-lg-table-cell">Category</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentProducts.length > 0 ? (
                        currentProducts.map(product => (
                          <tr key={product._id} className="align-middle">
                            <td>
                              <div className="d-flex flex-column">
                                <strong className="product-name">{product.name}</strong>
                                <small className="text-muted">
                                  {product.description ? product.description.substring(0, 50) + '...' : 'No description'}
                                </small>
                              </div>
                            </td>
                            <td>
                              <Badge 
                                style={getStatusStyle(product.variants)}
                                className="status-badge-custom"
                              >
                                <span 
                                  className="status-dot"
                                  style={getStatusDotStyle(product.variants)}
                                ></span>
                                {getProductStatus(product.variants)}
                              </Badge>
                            </td>
                            <td className="d-none d-md-table-cell">
                              <div className="d-flex align-items-center gap-2">
                                <span>{calculateTotalStock(product.variants)}</span>
                                {product.variants && product.variants.length > 1 && (
                                  <span className="text-muted small">({product.variants.length} variants)</span>
                                )}
                              </div>
                            </td>
                            <td className="d-none d-lg-table-cell">{product.brand}</td>
                            <td className="d-none d-lg-table-cell">{product.category}</td>
                            <td>
                              <div className="action-buttons-container">
                                <Button 
                                  variant="outline-primary" 
                                  size="sm" 
                                  onClick={() => openDetailsModal(product)}
                                  className="d-flex align-items-center gap-1"
                                >
                                  <FiMoreHorizontal /> Details
                                </Button>
                                <Button 
                                  variant="outline-success" 
                                  size="sm" 
                                  onClick={() => openEditModal(product)}
                                  className="d-flex align-items-center gap-1"
                                >
                                  <FiEdit /> Update
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="6" className="text-center py-4">
                            <div className="py-3">
                              <FiSearch size={48} className="text-muted mb-3" />
                              <h5>No products found</h5>
                              <p className="text-muted">Try adjusting your search or add a new product</p>
                              <Button variant="primary" onClick={() => setShowAddModal(true)}>
                                <FiPlus className="me-1" /> Add Product
                              </Button>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </Table>
                </div>
              )}
            </div>
          </div>

          {filteredProducts.length > 0 && !loading && (
            <div className="d-flex justify-content-center mt-4">
              <nav>
                <ul className="pagination">
                  <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                    <button 
                      className="page-link" 
                      onClick={() => paginate(currentPage - 1)}
                    >
                      <FiChevronLeft /> Prev
                    </button>
                  </li>
                  
                  {[...Array(totalPages).keys()].map(i => (
                    <li key={i + 1} className={`page-item ${currentPage === i + 1 ? 'active' : ''}`}>
                      <button 
                        className="page-link" 
                        onClick={() => paginate(i + 1)}
                      >
                        {i + 1}
                      </button>
                    </li>
                  ))}
                  
                  <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                    <button 
                      className="page-link" 
                      onClick={() => paginate(currentPage + 1)}
                    >
                      Next <FiChevronRight />
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ProductTable;