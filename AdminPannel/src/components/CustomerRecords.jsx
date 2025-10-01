import React, { useState, useEffect } from "react";
import { FiSearch, FiUser, FiMail, FiCalendar, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import Topbar from "./Topbar";
import axios from "axios";
import "../Style/CustomerRecords.css";

const CustomerRecords = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const customersPerPage = 8;

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await axios.get("https://account.babahub.co/api/users/customers");
        setCustomers(response.data);
      } catch (error) {
        console.error("Error fetching customers:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  // Filter customers based on search term
  const filteredCustomers = customers.filter(
    (customer) =>
      customer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination
  const indexOfLastCustomer = currentPage * customersPerPage;
  const indexOfFirstCustomer = indexOfLastCustomer - customersPerPage;
  const currentCustomers = filteredCustomers.slice(indexOfFirstCustomer, indexOfLastCustomer);
  const totalPages = Math.ceil(filteredCustomers.length / customersPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <>
      <Topbar />
      <div className="customer-dashboard">
        <div className="dashboard-header mb-4">
          <div className="container-fluid">
            <div className="row align-items-center mb-3 mb-md-0">
              <div className="col-md-6 mb-3 mb-md-0">
                <h1 className="fw-bold mb-1">Customer Management</h1>
                <p className="text-muted mb-0">Manage your customer records</p>
              </div>
              <div className="col-md-6 d-flex flex-column flex-md-row gap-3 align-items-start align-items-md-center justify-content-md-end">
                <div className="search-container flex-grow-1">
                  <FiSearch className="search-icon" />
                  <input
                    className="search-input"
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
                    placeholder="Search by name or email..."
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="container-fluid mt-4">
          <div className="card">
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="customer-table mb-0">
                  <thead>
                    <tr>
                      <th>Customer</th>
                      <th>Email</th>
                      <th>DOB</th>
                      <th>Status</th>
                      <th>Member Since</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan="5" className="text-center py-4">
                          <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading...</span>
                          </div>
                          <p className="mt-2">Loading customers...</p>
                        </td>
                      </tr>
                    ) : currentCustomers.length > 0 ? (
                      currentCustomers.map((customer) => (
                        <tr key={customer._id}>
                          <td>
                            <div className="customer-info">
                              <div className="avatar">
                                <FiUser size={20} />
                              </div>
                              <div>
                                <strong>{customer.name || 'N/A'}</strong>
                              </div>
                            </div>
                          </td>
                          <td>
                            <div className="contact-info">
                              <div className="contact-item">
                                <FiMail className="icon" />
                                <span>{customer.email || 'N/A'}</span>
                              </div>
                            </div>
                          </td>
                          <td>
                            <div className="contact-info">
                              <div className="contact-item">
                                <FiCalendar className="icon" />
                                <span>{customer.dob ? new Date(customer.dob).toLocaleDateString() : 'N/A'}</span>
                              </div>
                            </div>
                          </td>
                          <td>
                            <span className="status-badge active">Active</span>
                          </td>
                          <td>
                            <div className="contact-info">
                              <div className="contact-item">
                                <FiCalendar className="icon" />
                                <span>{customer.createdAt ? new Date(customer.createdAt).toLocaleDateString() : 'N/A'}</span>
                              </div>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr className="no-results">
                        <td colSpan="5">
                          <div className="empty-state">
                            <FiSearch size={48} className="text-muted mb-3" />
                            <h5>No customers found</h5>
                            <p className="text-muted">
                              {searchTerm 
                                ? `No customers found for "${searchTerm}". Try a different search term.`
                                : 'No customers available.'
                              }
                            </p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Pagination */}
          {filteredCustomers.length > 0 && (
            <div className="d-flex justify-content-between align-items-center mt-4">
              <div className="pagination-info">
                <span className="text-muted">
                  Showing {indexOfFirstCustomer + 1} to {Math.min(indexOfLastCustomer, filteredCustomers.length)} of {filteredCustomers.length} customers
                </span>
              </div>
              <nav>
                <ul className="pagination">
                  <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                    <button className="page-link" onClick={() => paginate(currentPage - 1)}>
                      <FiChevronLeft /> Prev
                    </button>
                  </li>
                  {[...Array(totalPages).keys()].map((i) => (
                    <li
                      key={i + 1}
                      className={`page-item ${currentPage === i + 1 ? "active" : ""}`}
                    >
                      <button className="page-link" onClick={() => paginate(i + 1)}>
                        {i + 1}
                      </button>
                    </li>
                  ))}
                  <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                    <button className="page-link" onClick={() => paginate(currentPage + 1)}>
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

export default CustomerRecords;