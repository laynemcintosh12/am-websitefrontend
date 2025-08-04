import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Api from "../Api";
import CustomerDetails from "../Components/CustomerOverview/CustomerDetails";
import SalesmanDetails from "../Components/CustomerOverview/SalesmanDetails";
import SupplementerDetails from "../Components/CustomerOverview/SupplementerDetails";
import AMDetails from "../Components/CustomerOverview/AMDetails";

const CustomerOverview = () => {
  const { customerId } = useParams();
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCustomer = async () => {
      setLoading(true);
      try {
        const data = await Api.getCustomer(customerId);
        setCustomer(data);
        setError(null);
      } catch (err) {
        setError("Failed to load customer details.");
        setCustomer(null);
      } finally {
        setLoading(false);
      }
    };
    if (customerId) fetchCustomer();
  }, [customerId]);

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;
  if (!customer) return <div className="p-8 text-center">No customer found.</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Customer Overview</h1>
      <CustomerDetails customer={customer} />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <SalesmanDetails customer={customer} />
        <SupplementerDetails customer={customer} />
        <AMDetails customer={customer} />
      </div>
    </div>
  );
};

export default CustomerOverview;