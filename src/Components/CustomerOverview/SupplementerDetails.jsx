import React from "react";
const SupplementerDetails = ({ customer }) => (
  <div className="bg-white dark:bg-gray-900 rounded-xl shadow p-6">
    <h2 className="text-lg font-semibold mb-2">Supplementer</h2>
    <div><strong>Name:</strong> {customer.supplementerName || "N/A"}</div>
    <div><strong>Email:</strong> {customer.supplementerEmail || "N/A"}</div>
    {/* Add more supplementer info if available */}
  </div>
);
export default SupplementerDetails;