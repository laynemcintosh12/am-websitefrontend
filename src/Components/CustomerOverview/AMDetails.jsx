import React from "react";
const AMDetails = ({ customer }) => (
  <div className="bg-white dark:bg-gray-900 rounded-xl shadow p-6">
    <h2 className="text-lg font-semibold mb-2">Account Manager</h2>
    <div><strong>Name:</strong> {customer.amName || "N/A"}</div>
    <div><strong>Email:</strong> {customer.amEmail || "N/A"}</div>
    {/* Add more AM info if available */}
  </div>
);
export default AMDetails;