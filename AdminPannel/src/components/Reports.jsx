
import axios from "axios";
import { useState } from "react";
import {
  FiDollarSign,
  FiTrendingUp,
  FiBox,
  FiCalendar,
  FiSearch,
  FiFilter,
} from "react-icons/fi";
import "../Style/Reports.css";

function Reports() {
  const [orders, setOrders] = useState([]);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [status, setStatus] = useState("all");
  const [loading, setLoading] = useState(false);
  const [totalSaleAmount, setTotalSaleAmount] = useState(0);

  const parseDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toISOString().split("T")[0];
  };

  const handleSearchWithDate = async () => {
    if (!fromDate || !toDate) {
      alert("Please select both dates!");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get(
        `https://account.babahub.co/api/order/searchByDate?fromDate=${fromDate}&toDate=${toDate}&status=${status}`
      );

      const data = response.data;
      setOrders(data);

      const totalAmt = data.reduce(
        (sum, order) => sum + Number(order.totalAmountAfterTax || order.totalAmount || 0),
        0
      );
      setTotalSaleAmount(totalAmt);
    } catch (error) {
      console.error("Error fetching data:", error);
      alert("Failed to fetch sales data");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="analytics-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div className="container-fluid px-3 px-md-4">
          <div className="d-flex justify-content-between align-items-center flex-wrap">
            <div>
              <h1 className="gradient-text">Sales Analytics</h1>
              <p className="subtitle">
                Track and analyze your sales performance
              </p>
            </div>

            {/* Filters */}
            <div className="d-flex align-items-center date-filter mt-2 mt-md-0">
              <div className="input-group input-group-dates me-2">
                <span className="input-group-text">
                  <FiCalendar size={16} />
                </span>
                <input
                  type="date"
                  className="form-control form-control-sm"
                  onChange={(e) => setFromDate(e.target.value)}
                />
              </div>

              <span className="text-white mx-2">to</span>

              <div className="input-group input-group-dates me-2">
                <span className="input-group-text">
                  <FiCalendar size={16} />
                </span>
                <input
                  type="date"
                  className="form-control form-control-sm"
                  onChange={(e) => setToDate(e.target.value)}
                />
              </div>

              <div className="input-group input-group-status me-2">
                <span className="input-group-text">
                  <FiFilter size={16} />
                </span>
                <select
                  className="form-select form-select-sm"
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value="all">All</option>
                  <option value="Processing">Processing</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>

              <button
                className="btn btn-search"
                onClick={handleSearchWithDate}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm me-1"
                      role="status"
                      aria-hidden="true"
                    ></span>
                    Loading...
                  </>
                ) : (
                  <>
                    <FiSearch className="me-1" size={16} />
                    Search
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="container-fluid px-3 px-md-4 dashboard-content">
        {/* Summary Card
        <div className="row mb-4">
          <div className="col-xl-3 col-md-6 col-sm-6 mb-4">
            <div className="summary-card card card-sales">
              <div className="card-body">
                <div className="d-flex align-items-center">
                  <div className="flex-grow-1">
                    <div className="text-xs font-weight-bold text-uppercase mb-1">
                      Total Sales
                    </div>
                    <div className="h5 mb-0 font-weight-bold">
                      ${totalSaleAmount.toLocaleString()}
                    </div>
                  </div>
                  <div className="summary-icon">
                    <FiDollarSign size={24} />
                  </div>
                </div>
                <div className="mt-2 text-small">
                  <span className="text-success">
                    <FiTrendingUp className="me-1" />
                    Revenue
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div> */}

        {/* Sales Table */}
        <div className="card shadow mb-4 tabs-card">
          <div className="card-header py-3 d-flex flex-wrap align-items-center justify-content-between">
            <h6 className="m-0 font-weight-bold text-primary">
              <FiBox className="me-2" />
              Sales Details
            </h6>
            <div className="d-flex align-items-center">
              <span className="me-2 small text-muted">Showing data from</span>
              <span className="font-weight-bold text-primary me-3">
                {fromDate || "N/A"} to {toDate || "N/A"}
              </span>
            </div>
          </div>
          <div className="card-body">
            <div className="table-responsive">
              <table
                className="table table-hover"
                width="100%"
                cellSpacing="0"
              >
                <thead>
                  <tr>
                    <th>S/N</th>
                    <th>Order ID</th>
                    <th>Payment ID</th>
                    <th>Order Date</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Items</th>
                    <th>Total Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.length > 0 ? (
                    orders.map((order, index) => (
                      <tr key={order._id}>
                        <td>{index + 1}</td>
                        <td>{order.orderID.split("-").slice(0, 2).join("-")}</td>
                        <td>{order.pf_payment_id || "N/A"}</td>
                        <td>{parseDate(order.createdAt)}</td>
                        <td>{order.name}</td>
                        <td>{order.email}</td>
                        <td>
                          {order.items && order.items.length > 0
                            ? order.items.map((i) => i.title).join(", ")
                            : "No items"}
                        </td>
                        <td className="fw-bold text-success">
                          ${Number(order.totalAmountAfterTax || order.totalAmount).toLocaleString()}
                        </td>
                        <td>
                          <span
                            className={`badge ${
                              order.deliveryStatus === "Completed"
                                ? "bg-success"
                                : order.deliveryStatus === "Shipped"
                                ? "bg-primary"
                                : "bg-warning"
                            }`}
                          >
                            {order.deliveryStatus}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="9" className="text-center">
                        No sales found
                      </td>
                    </tr>
                  )}
                </tbody>
                {orders.length > 0 && (
                  <tfoot className="table-footer">
                    <tr>
                      <td colSpan="7" className="text-end fw-bold">
                        Totals:
                      </td>
                      <td className="fw-bold text-success">
                        ${totalSaleAmount.toLocaleString()}
                      </td>
                      <td></td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Reports;
