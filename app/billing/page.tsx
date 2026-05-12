"use client";

import { useEffect, useMemo, useState } from "react";

type Firecracker = {
  id: number;
  name: string;

  high: number;
  med: number;
  low: number;
  very_low: number;

  stock: number;
};

type BillItem = {
  firecracker_id: number;
  name: string;
  category: string;
  quantity: number;
  price: number;
  total: number;
};

export default function BillingPage() {
  const [items, setItems] = useState<Firecracker[]>([]);
  const [loading, setLoading] = useState(true);

  const [customerName, setCustomerName] = useState("");

  const [selectedId, setSelectedId] = useState("");
  const [category, setCategory] = useState("high");

  const [quantity, setQuantity] = useState(1);
  const [price, setPrice] = useState(0);
const [now, setNow] = useState<string>("");
  const [billItems, setBillItems] = useState<BillItem[]>([]);

  useEffect(() => {
    fetchItems();
  }, []);
useEffect(() => {
  setNow(new Date().toLocaleString());
}, []);
  async function fetchItems() {
    try {
      setLoading(true);

      const res = await fetch("/api/firecrackers");
      const data = await res.json();

      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  const selectedItem = useMemo(() => {
    return items.find(
      (item) => item.id === Number(selectedId)
    );
  }, [selectedId, items]);

  // auto price based on category
  useEffect(() => {
    if (!selectedItem) return;

    if (category === "high") setPrice(selectedItem.high);
    if (category === "med") setPrice(selectedItem.med);
    if (category === "low") setPrice(selectedItem.low);
    if (category === "very_low") setPrice(selectedItem.very_low);
  }, [category, selectedItem]);

  function addItem() {
    if (!selectedItem) return;

    if (quantity <= 0) return;

    if (quantity > selectedItem.stock) {
      alert("Not enough stock");
      return;
    }

    const total = quantity * price;

    setBillItems((prev) => [
      ...prev,
      {
        firecracker_id: selectedItem.id,
        name: selectedItem.name,
        category,
        quantity,
        price,
        total,
      },
    ]);

    // reduce stock locally
    setItems((prev) =>
      prev.map((item) =>
        item.id === selectedItem.id
          ? { ...item, stock: item.stock - quantity }
          : item
      )
    );

    setQuantity(1);
  }

  function removeItem(index: number) {
    const removed = billItems[index];

    setItems((prev) =>
      prev.map((item) =>
        item.id === removed.firecracker_id
          ? { ...item, stock: item.stock + removed.quantity }
          : item
      )
    );

    setBillItems((prev) =>
      prev.filter((_, i) => i !== index)
    );
  }

  const grandTotal = billItems.reduce(
    (sum, i) => sum + i.total,
    0
  );

  function handlePrint() {
    window.print();
  }

  async function saveBill() {
    if (billItems.length === 0) {
      alert("Add items first");
      return;
    }

    const billRes = await fetch("/api/bills", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        customer_name: customerName,
      }),
    });

    const bill = await billRes.json();

    for (const item of billItems) {
      await fetch("/api/bill-items", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bill_id: bill.id,
          firecracker_id: item.firecracker_id,
          category: item.category,
          quantity: item.quantity,
          price: item.price,
        }),
      });
    }

    alert("Bill Saved");

    setBillItems([]);
    setCustomerName("");
    setSelectedId("");
    setQuantity(1);
    setPrice(0);

    fetchItems();
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
      <div className="mx-auto max-w-6xl rounded-xl bg-white p-4 shadow-lg md:p-6">

        {/* HEADER */}
        <div className="mb-6 flex justify-between">
          <h1 className="text-2xl font-bold">
            Firecracker Billing
          </h1>

          {loading && (
            <p className="text-sm text-gray-500">
              Loading...
            </p>
          )}
        </div>

        {/* CUSTOMER */}
        <input
          className="mb-4 w-full rounded border p-3"
          placeholder="Customer Name"
          value={customerName}
          onChange={(e) =>
            setCustomerName(e.target.value)
          }
        />

        {/* INPUTS */}
        <div className="grid grid-cols-1 gap-3 md:grid-cols-5">
          <select
            className="border p-2"
            value={selectedId}
            onChange={(e) =>
              setSelectedId(e.target.value)
            }
          >
            <option value="">Select Item</option>
            {items.map((i) => (
              <option key={i.id} value={i.id}>
                {i.name}
              </option>
            ))}
          </select>

          <select
            className="border p-2"
            value={category}
            onChange={(e) =>
              setCategory(e.target.value)
            }
          >
            <option value="high">High</option>
            <option value="med">Med</option>
            <option value="low">Low</option>
            <option value="very_low">
              Very Low
            </option>
          </select>

          <input
            className="border p-2"
            type="number"
            min={1}
            value={quantity}
            onChange={(e) =>
              setQuantity(Number(e.target.value))
            }
          />

          <input
            className="border p-2"
            type="number"
            value={price}
            onChange={(e) =>
              setPrice(Number(e.target.value))
            }
          />

          <button
            className="bg-black text-white"
            onClick={addItem}
          >
            Add
          </button>
        </div>

        {/* TABLE */}
        <div className="mt-6 overflow-x-auto">
          <table className="w-full border">
            <thead className="bg-black text-white">
              <tr>
                <th>Item</th>
                <th>Cat</th>
                <th>Qty</th>
                <th>Price</th>
                <th>Total</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {billItems.map((b, i) => (
                <tr key={i}>
                  <td>{b.name}</td>
                  <td>{b.category}</td>
                  <td>{b.quantity}</td>
                  <td>₹{b.price}</td>
                  <td>₹{b.total}</td>
                  <td>
                    <button
                      onClick={() =>
                        removeItem(i)
                      }
                      className="text-red-600"
                    >
                      X
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* TOTAL */}
        <div className="mt-4 flex justify-between">
          <h2 className="text-xl font-bold">
            Total: ₹{grandTotal}
          </h2>

          <div className="flex gap-2">
            <button
              onClick={saveBill}
              className="bg-green-600 px-4 py-2 text-white"
            >
              Save
            </button>

            <button
              onClick={handlePrint}
              className="bg-blue-600 px-4 py-2 text-white"
            >
              Print Invoice
            </button>
          </div>
        </div>
        <div className="print-area">

        {/* THERMAL INVOICE */}
        <div className="print:block hidden w-[80mm] p-2 text-[12px] font-mono">
          <div className="text-center">
            <h2 className="font-bold">
              FIRECRACKER SHOP
            </h2>
            <p>GST INVOICE</p>
          </div>

          <hr />

          <p>Customer: {customerName || "Walk-in"}</p>
<p>{now}</p>
          <hr />

          {billItems.map((b, i) => (
            <div key={i}>
              <div className="flex justify-between">
                <span>{b.name}</span>
                <span>₹{b.total}</span>
              </div>
              <small>
                {b.quantity} x ₹{b.price}
              </small>
            </div>
          ))}

          <hr />

          <div className="flex justify-between font-bold">
            <span>Total</span>
            <span>₹{grandTotal}</span>
          </div>

          <p className="text-center mt-2">
            THANK YOU!
          </p>
        </div>
      </div>
    </div>
    </div>
  );
}