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

  const [billItems, setBillItems] = useState<BillItem[]>([]);

  useEffect(() => {
    fetchItems();
  }, []);

  async function fetchItems() {
    try {
      setLoading(true);

      const res = await fetch("/api/firecrackers");

      const data = await res.json();

      if (Array.isArray(data)) {
        setItems(data);
      } else {
        setItems([]);
      }
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

  // auto set pricing
  useEffect(() => {
    if (!selectedItem) return;

    if (category === "high") {
      setPrice(Number(selectedItem.high));
    }

    if (category === "med") {
      setPrice(Number(selectedItem.med));
    }

    if (category === "low") {
      setPrice(Number(selectedItem.low));
    }

    if (category === "very_low") {
      setPrice(Number(selectedItem.very_low));
    }
  }, [category, selectedItem]);

  function addItem() {
    if (!selectedItem) {
      alert("Select item");
      return;
    }

    if (quantity <= 0) {
      alert("Invalid quantity");
      return;
    }

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

    // local stock update
    setItems((prev) =>
      prev.map((item) =>
        item.id === selectedItem.id
          ? {
              ...item,
              stock: item.stock - quantity,
            }
          : item
      )
    );

    setQuantity(1);
  }

  function removeItem(index: number) {
    const removedItem = billItems[index];

    // restore stock
    setItems((prev) =>
      prev.map((item) =>
        item.id === removedItem.firecracker_id
          ? {
              ...item,
              stock: item.stock + removedItem.quantity,
            }
          : item
      )
    );

    setBillItems((prev) =>
      prev.filter((_, i) => i !== index)
    );
  }

  const grandTotal = billItems.reduce(
    (sum, item) => sum + item.total,
    0
  );

  async function saveBill() {
    try {
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

      if (!bill.id) {
        alert("Failed to create bill");
        return;
      }

      for (const item of billItems) {
        const res = await fetch("/api/bill-items", {
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

        const data = await res.json();

        if (data.error) {
          alert(data.error);
          return;
        }
      }

      alert("Bill Saved");

      setBillItems([]);

      setCustomerName("");

      setSelectedId("");

      setQuantity(1);

      setPrice(0);

      fetchItems();
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
      <div className="mx-auto max-w-6xl rounded-xl bg-white p-4 shadow-lg md:p-6">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold md:text-3xl">
            Firecracker Billing
          </h1>

          {loading && (
            <p className="text-sm text-gray-500">
              Loading...
            </p>
          )}
        </div>

        {/* customer */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Customer Name"
            value={customerName}
            onChange={(e) =>
              setCustomerName(e.target.value)
            }
            className="w-full rounded-lg border p-3"
          />
        </div>

        {/* form */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
          {/* item */}
          <select
            value={selectedId}
            onChange={(e) =>
              setSelectedId(e.target.value)
            }
            className="rounded-lg border p-3"
          >
            <option value="">Select Item</option>

            {items.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>

          {/* category */}
          <select
            value={category}
            onChange={(e) =>
              setCategory(e.target.value)
            }
            className="rounded-lg border p-3"
          >
            <option value="high">High</option>
            <option value="med">Med</option>
            <option value="low">Low</option>
            <option value="very_low">
              Very Low
            </option>
          </select>

          {/* quantity */}
          <input
            type="number"
            min={1}
            max={selectedItem?.stock || 1}
            placeholder="Quantity"
            value={quantity}
            onChange={(e) =>
              setQuantity(Number(e.target.value))
            }
            className="rounded-lg border p-3"
          />

          {/* price */}
          <input
            type="number"
            placeholder="Price"
            value={price}
            onChange={(e) =>
              setPrice(Number(e.target.value))
            }
            className="rounded-lg border p-3"
          />

          {/* add */}
          <button
            onClick={addItem}
            className="rounded-lg bg-black p-3 text-white"
          >
            Add Item
          </button>
        </div>

        {/* stock info */}
        {selectedItem && (
          <div className="mt-4 rounded-lg bg-gray-50 p-4">
            <p className="font-semibold">
              Stock Available: {selectedItem.stock}
            </p>

            <div className="mt-2 grid grid-cols-2 gap-2 md:grid-cols-4">
              <div>
                High Price: ₹{selectedItem.high}
              </div>

              <div>
                Med Price: ₹{selectedItem.med}
              </div>

              <div>
                Low Price: ₹{selectedItem.low}
              </div>

              <div>
                Very Low Price: ₹
                {selectedItem.very_low}
              </div>
            </div>
          </div>
        )}

        {/* table */}
        <div className="mt-8 overflow-x-auto">
          <table className="w-full border-collapse overflow-hidden rounded-lg">
            <thead>
              <tr className="bg-black text-white">
                <th className="p-3 text-left">
                  Item
                </th>

                <th className="p-3 text-left">
                  Category
                </th>

                <th className="p-3 text-left">
                  Qty
                </th>

                <th className="p-3 text-left">
                  Price
                </th>

                <th className="p-3 text-left">
                  Total
                </th>

                <th className="p-3 text-left">
                  Action
                </th>
              </tr>
            </thead>

            <tbody>
              {billItems.map((item, index) => (
                <tr
                  key={index}
                  className="border-b"
                >
                  <td className="p-3">
                    {item.name}
                  </td>

                  <td className="p-3">
                    {item.category}
                  </td>

                  <td className="p-3">
                    {item.quantity}
                  </td>

                  <td className="p-3">
                    ₹{item.price}
                  </td>

                  <td className="p-3">
                    ₹{item.total}
                  </td>

                  <td className="p-3">
                    <button
                      onClick={() =>
                        removeItem(index)
                      }
                      className="rounded bg-red-500 px-3 py-1 text-white"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}

              {billItems.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="p-4 text-center text-gray-500"
                  >
                    No items added
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* footer */}
        <div className="mt-6 flex flex-col items-end gap-4">
          <h2 className="text-2xl font-bold">
            Total: ₹{grandTotal}
          </h2>

          <button
            onClick={saveBill}
            className="rounded-lg bg-green-600 px-6 py-3 text-white"
          >
            Save Bill
          </button>
        </div>
      </div>
    </div>
  );
}