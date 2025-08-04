import React from "react";
const CustomerDetails = ({ customer }) => (
  <div className="bg-white dark:bg-gray-900 rounded-xl shadow p-6 mb-6">
    <h2 className="text-xl font-semibold mb-2">Customer Info</h2>
    <div><strong>Name:</strong> {customer.firstName} {customer.lastName}</div>
    <div><strong>Email:</strong> {customer.email}</div>
    <div><strong>Phone:</strong> {customer.phone}</div>
    <div><strong>Address:</strong> {customer.address}, {customer.city}, {customer.state} {customer.zip}</div>
    <div><strong>Lead Source:</strong> {customer.leadSource}</div>
    <div><strong>Referrer:</strong> {customer.referrer}</div>
    {/* Add more fields as needed */}
  </div>
);
export default CustomerDetails;