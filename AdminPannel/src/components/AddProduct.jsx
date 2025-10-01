import React, { useState, useEffect } from 'react';
import { FiPlus, FiTrash2, FiStar, FiImage, FiDollarSign, FiUpload, FiSave } from 'react-icons/fi';
import { Modal, Button, Spinner, Form, Row, Col, Alert, Badge } from 'react-bootstrap';
import axios from 'axios';

const AddProduct = ({ 
  show, 
  onHide, 
  onAddProduct, 
  isSubmitting,
  setIsSubmitting
}) => {
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    brand: '',
    category: '',
    mainImage: null,
    isFeatured: false,
    image: '',
    variants: [{
      color: '',
      colorCode: '#6c757d',
      sizes: [{ size: '', stock: '', price: '' }]
    }]
  });

  const [successMessage, setSuccessMessage] = useState('');
  const [imagePreview, setImagePreview] = useState('');

  // Reset form when modal is opened/closed
  useEffect(() => {
    if (!show) {
      resetForm();
    }
  }, [show]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewProduct({ ...newProduct, [name]: value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setNewProduct({ ...newProduct, mainImage: file });
    
    // Create preview for new image
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleToggleFeatured = () => {
    setNewProduct(prev => ({ ...prev, isFeatured: !prev.isFeatured }));
  };

  const handleVariantChange = (index, field, value) => {
    const updatedVariants = [...newProduct.variants];
    updatedVariants[index][field] = value;
    setNewProduct({ ...newProduct, variants: updatedVariants });
  };

  const handleSizeChange = (variantIndex, sizeIndex, field, value) => {
    const updatedVariants = [...newProduct.variants];
    updatedVariants[variantIndex].sizes[sizeIndex][field] = value;
    setNewProduct({ ...newProduct, variants: updatedVariants });
  };

  const addVariant = () => {
    setNewProduct({
      ...newProduct,
      variants: [
        ...newProduct.variants,
        {
          color: '',
          colorCode: '#6c757d',
          sizes: [{ size: '', stock: '', price: '' }]
        }
      ]
    });
  };

  const addSize = (variantIndex) => {
    const updatedVariants = [...newProduct.variants];
    updatedVariants[variantIndex].sizes.push({ size: '', stock: '', price: '' });
    setNewProduct({ ...newProduct, variants: updatedVariants });
  };

  const removeVariant = (index) => {
    const updatedVariants = [...newProduct.variants];
    updatedVariants.splice(index, 1);
    setNewProduct({ ...newProduct, variants: updatedVariants });
  };

  const removeSize = (variantIndex, sizeIndex) => {
    const updatedVariants = [...newProduct.variants];
    updatedVariants[variantIndex].sizes.splice(sizeIndex, 1);
    setNewProduct({ ...newProduct, variants: updatedVariants });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validate and convert empty strings to 0 for stock and price
      const processedVariants = newProduct.variants.map(variant => ({
        ...variant,
        sizes: variant.sizes.map(size => ({
          ...size,
          stock: size.stock === '' ? 0 : parseInt(size.stock) || 0,
          price: size.price === '' ? 0 : parseFloat(size.price) || 0
        }))
      }));

      const formData = new FormData();
      formData.append('name', newProduct.name);
      formData.append('description', newProduct.description);
      formData.append('brand', newProduct.brand);
      formData.append('category', newProduct.category);
      formData.append('isFeatured', newProduct.isFeatured);

      // Use 'image' as the field name to match backend expectations
      if (newProduct.mainImage) {
        formData.append('image', newProduct.mainImage);
      }

      formData.append('variants', JSON.stringify(processedVariants));

      // Pass formData to parent handler instead of axios here
      await onAddProduct(formData);

      resetForm();
      onHide();
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Error adding product. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setNewProduct({
      name: '',
      description: '',
      brand: '',
      category: '',
      mainImage: null,
      isFeatured: false,
      variants: [{
        color: '',
        colorCode: '#6c757d',
        sizes: [{ size: '', stock: '', price: '' }]
      }]
    });
    setImagePreview('');
  };

  const handleModalClose = () => {
    if (!isSubmitting) {
      onHide();
      resetForm();
    }
  };

  return (
    <Modal show={show} onHide={handleModalClose} size="xl" centered scrollable className="product-modal">
      <Modal.Header closeButton={!isSubmitting} className="bg-white border-bottom-0">
        <Modal.Title className="fw-bold text-primary">
          <span className="d-flex align-items-center gap-2">
            <FiPlus size={24} />
            <span>Add New Product</span>
          </span>
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="px-4 py-3">
        {successMessage && (
          <Alert variant="success" className="mb-4 border-0 shadow-sm" onClose={() => setSuccessMessage('')} dismissible>
            <div className="d-flex align-items-center">
              <FiStar className="me-2" size={18} />
              {successMessage}
            </div>
          </Alert>
        )}
        
        <Form onSubmit={handleSubmit} className="product-form">
          {/* Basic Information Section */}
          <div className="mb-5">
            <div className="d-flex align-items-center mb-4">
              <div className="section-icon bg-primary bg-opacity-10 text-primary p-2 rounded-circle me-3">
                <FiImage size={20} />
              </div>
              <h4 className="fw-bold mb-0">Basic Information</h4>
            </div>
            
            <Row className="g-4">
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-medium text-muted mb-2">Product Name *</Form.Label>
                  <Form.Control 
                    name="name" 
                    value={newProduct.name} 
                    onChange={handleInputChange} 
                    required 
                    placeholder="Enter product name"
                    className="border-2 py-2 px-3"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-medium text-muted mb-2">Brand *</Form.Label>
                  <Form.Control 
                    name="brand" 
                    value={newProduct.brand} 
                    onChange={handleInputChange} 
                    required 
                    placeholder="Enter brand name"
                    className="border-2 py-2 px-3"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-medium text-muted mb-2">Category *</Form.Label>
                  <Form.Control 
                    name="category" 
                    value={newProduct.category} 
                    onChange={handleInputChange} 
                    required 
                    placeholder="Enter category"
                    className="border-2 py-2 px-3"
                  />
                </Form.Group>
              </Col>
              <Col md={6} className="d-flex align-items-end">
                <Form.Check 
                  type="switch"
                  id="featured-product-switch"
                  label={<span className="fw-medium text-muted">Featured Product</span>}
                  checked={newProduct.isFeatured}
                  onChange={handleToggleFeatured}
                  className="ms-2"
                />
                {newProduct.isFeatured && (
                  <Badge bg="warning" className="ms-2 d-flex align-items-center">
                    <FiStar size={14} className="me-1" /> Featured
                  </Badge>
                )}
              </Col>
              <Col md={12}>
                <Form.Group>
                  <Form.Label className="fw-medium text-muted mb-2">
                    Main Product Image *
                  </Form.Label>
                  <div className="border-2 rounded p-3 bg-light">
                    <Form.Control 
                      type="file" 
                      accept="image/*" 
                      onChange={handleFileChange} 
                      required
                      className="d-none" 
                      id="mainImageUpload"
                    />
                    <Form.Label 
                      htmlFor="mainImageUpload" 
                      className="d-flex flex-column align-items-center justify-content-center cursor-pointer p-4"
                    >
                      {imagePreview ? (
                        <>
                          <img 
                            src={imagePreview} 
                            alt="Preview" 
                            className="img-fluid mb-2" 
                            style={{ maxHeight: '150px' }}
                          />
                          <span className="text-primary fw-medium">Change Image</span>
                        </>
                      ) : (
                        <>
                          <FiUpload size={24} className="mb-2 text-muted" />
                          <span className="text-muted">Click to upload product image</span>
                          <small className="text-danger mt-1">* Required</small>
                        </>
                      )}
                    </Form.Label>
                  </div>
                </Form.Group>
              </Col>
              <Col md={12}>
                <Form.Group>
                  <Form.Label className="fw-medium text-muted mb-2">Description</Form.Label>
                  <Form.Control 
                    as="textarea" 
                    rows={4} 
                    name="description" 
                    value={newProduct.description} 
                    onChange={handleInputChange} 
                    placeholder="Enter detailed product description..."
                    className="border-2 py-2 px-3"
                  />
                </Form.Group>
              </Col>
            </Row>
          </div>

          {/* Variants Section */}
          <div className="mb-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div className="d-flex align-items-center">
                <div className="section-icon bg-primary bg-opacity-10 text-primary p-2 rounded-circle me-3">
                  <FiPlus size={20} />
                </div>
                <h4 className="fw-bold mb-0">Product Variants</h4>
              </div>
              <Button 
                variant="outline-primary" 
                size="sm" 
                onClick={addVariant}
                className="d-flex align-items-center gap-1"
                disabled={isSubmitting}
              >
                <FiPlus size={16} /> More Variant
              </Button>
            </div>

            {newProduct.variants.map((variant, index) => (
              <div key={index} className="mb-4 p-4 border rounded position-relative bg-white shadow-sm">
                {newProduct.variants.length > 1 && (
                  <Button
                    variant="outline-danger"
                    size="sm"
                    className="position-absolute top-0 end-0 m-3"
                    onClick={() => removeVariant(index)}
                    disabled={isSubmitting}
                  >
                    <FiTrash2 size={14} />
                  </Button>
                )}
                
                <div className="d-flex align-items-center mb-3">
                  <div className="color-preview me-2" style={{ 
                    backgroundColor: variant.colorCode, 
                    width: '20px', 
                    height: '20px', 
                    borderRadius: '50%',
                    border: '1px solid #dee2e6'
                  }} />
                  <h6 className="mb-0 text-muted fw-medium">Variant #{index + 1}</h6>
                </div>
                
                <Row className="g-4">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="fw-medium text-muted mb-2">Color Name *</Form.Label>
                      <Form.Control 
                        value={variant.color} 
                        onChange={(e) => handleVariantChange(index, 'color', e.target.value)}
                        placeholder="e.g., Midnight Black, Ocean Blue"
                        required
                        className="border-2 py-2 px-3"
                        disabled={isSubmitting}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="fw-medium text-muted mb-2">Color Code *</Form.Label>
                      <div className="d-flex align-items-center gap-3">
                        <Form.Control 
                          type="color" 
                          className="form-control-color p-0 border rounded"
                          value={variant.colorCode} 
                          onChange={(e) => handleVariantChange(index, 'colorCode', e.target.value)}
                          style={{ width: '50px', height: '50px' }}
                          required
                          disabled={isSubmitting}
                        />
                        <div className="text-muted small bg-light p-2 rounded">
                          Selected: <span className="fw-medium">{variant.colorCode}</span>
                        </div>
                      </div>
                    </Form.Group>
                  </Col>
                </Row>

                <div className="mt-4 pt-3">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h6 className="fw-medium text-muted mb-0">
                      <FiDollarSign className="me-2" size={16} />
                      Sizes & Pricing
                    </h6>
                    <Button 
                      variant="outline-primary" 
                      size="sm" 
                      onClick={() => addSize(index)}
                      className="d-flex align-items-center gap-1"
                      disabled={isSubmitting}
                    >
                      <FiPlus size={14} /> More Size Variant
                    </Button>
                  </div>
                  
                  {variant.sizes.map((size, sIdx) => (
                    <Row key={sIdx} className="mb-3 align-items-end g-3">
                      <Col md={3}>
                        <Form.Group>
                          <Form.Label className="fw-medium text-muted mb-2">Size *</Form.Label>
                          <Form.Control
                            placeholder="e.g., S, M, L, XL"
                            value={size.size}
                            onChange={(e) => handleSizeChange(index, sIdx, 'size', e.target.value)}
                            required
                            className="border-2 py-2 px-3"
                            disabled={isSubmitting}
                          />
                        </Form.Group>
                      </Col>
                      <Col md={3}>
                        <Form.Group>
                          <Form.Label className="fw-medium text-muted mb-2">Stock *</Form.Label>
                          <Form.Control
                            type="number"
                            min="0"
                            placeholder="Enter quantity"
                            value={size.stock}
                            onChange={(e) => handleSizeChange(index, sIdx, 'stock', e.target.value)}
                            required
                            className="border-2 py-2 px-3"
                            disabled={isSubmitting}
                          />
                        </Form.Group>
                      </Col>
                      <Col md={4}>
                        <Form.Group>
                          <Form.Label className="fw-medium text-muted mb-2">Price (R) *</Form.Label>
                          <div className="input-group">
                            <span className="input-group-text bg-light border-2">R</span>
                            <Form.Control
                              type="number"
                              min="0"
                              step="0.01"
                              placeholder="Enter price"
                              value={size.price}
                              onChange={(e) => handleSizeChange(index, sIdx, 'price', e.target.value)}
                              required
                              className="border-2 py-2 px-3"
                              disabled={isSubmitting}
                            />
                          </div>
                        </Form.Group>
                      </Col>
                      <Col md={2}>
                        {variant.sizes.length > 1 && (
                          <Button 
                            variant="outline-danger" 
                            size="sm" 
                            className="w-100 h-100 d-flex align-items-center justify-content-center"
                            onClick={() => removeSize(index, sIdx)}
                            disabled={isSubmitting}
                          >
                            <FiTrash2 size={14} />
                          </Button>
                        )}
                      </Col>
                    </Row>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Form Actions */}
          <div className="d-flex justify-content-between mt-5 pt-3 border-top">
            <Button 
              variant="outline-secondary" 
              onClick={handleModalClose} 
              disabled={isSubmitting}
              className="px-4 py-2"
            >
              Cancel
            </Button>
            <Button 
              variant="primary" 
              type="submit" 
              disabled={isSubmitting}
              className="px-4 py-2 fw-medium"
            >
              {isSubmitting ? (
                <>
                  <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                  Saving Product...
                </>
              ) : (
                <>
                  <FiPlus className="me-2" />
                  Save Product
                </>
              )}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default AddProduct;