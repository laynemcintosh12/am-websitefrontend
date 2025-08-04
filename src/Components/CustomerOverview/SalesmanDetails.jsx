import React from "react";
const SalesmanDetails = ({ customer }) => (
  <div className="bg-white dark:bg-gray-900 rounded-xl shadow p-6">
    <h2 className="text-lg font-semibold mb-2">Salesman</h2>
    <div><strong>Name:</strong> {customer.salesmanName || "N/A"}</div>
    <div><strong>Email:</strong> {customer.salesmanEmail || "N/A"}</div>
    {/* Add more salesman info if available */}
  </div>
);
export default SalesmanDetails;