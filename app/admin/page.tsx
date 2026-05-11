"use client";

import { useEffect, useState } from "react";

type Firecracker = {
  id: number;
  name: string;
  high: number;
  med: number;
  low: number;
  very_low: number;
  stock: number;
};

export default function AdminFirecrackers() {
  const [items, setItems] = useState<Firecracker[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchItems();
  }, []);

  async function fetchItems() {
    const res = await fetch("/api/firecrackers");
    const data = await res.json();
    setItems(data);
    setLoading(false);
  }

  function updateField(
    id: number,
    field: keyof Firecracker,
    value: any
  ) {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, [field]: value }
          : item
      )
    );
  }

  async function saveRow(item: Firecracker) {
    await fetch("/api/firecrackers/update", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...item,
        reason: "Edited from admin panel",
      }),
    });

    alert("Saved");
    fetchItems();
  }

  return (
    <div className="p-4 md:p-8">
      <h1 className="mb-6 text-2xl font-bold">
        Firecracker Admin Panel
      </h1>

      <div className="overflow-x-auto">
        <table className="w-full border">
          <thead>
            <tr className="bg-black text-white">
              <th>Name</th>
              <th>High</th>
              <th>Med</th>
              <th>Low</th>
              <th>Very Low</th>
              <th>Stock</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {items.map((item) => (
              <tr
                key={item.id}
                className="border-b"
              >
                <td>
                  <input
                    className="border p-1"
                    value={item.name}
                    onChange={(e) =>
                      updateField(
                        item.id,
                        "name",
                        e.target.value
                      )
                    }
                  />
                </td>

                <td>
                  <input
                    type="number"
                    className="w-20 border p-1"
                    value={item.high}
                    onChange={(e) =>
                      updateField(
                        item.id,
                        "high",
                        Number(e.target.value)
                      )
                    }
                  />
                </td>

                <td>
                  <input
                    type="number"
                    className="w-20 border p-1"
                    value={item.med}
                    onChange={(e) =>
                      updateField(
                        item.id,
                        "med",
                        Number(e.target.value)
                      )
                    }
                  />
                </td>

                <td>
                  <input
                    type="number"
                    className="w-20 border p-1"
                    value={item.low}
                    onChange={(e) =>
                      updateField(
                        item.id,
                        "low",
                        Number(e.target.value)
                      )
                    }
                  />
                </td>

                <td>
                  <input
                    type="number"
                    className="w-20 border p-1"
value={item.very_low ?? 0}                    onChange={(e) =>
                      updateField(
                        item.id,
                        "very_low",
                        Number(e.target.value)
                      )
                    }
                  />
                </td>

                <td>
                  <input
                    type="number"
                    className="w-20 border p-1"
                    value={item.stock}
                    onChange={(e) =>
                      updateField(
                        item.id,
                        "stock",
                        Number(e.target.value)
                      )
                    }
                  />
                </td>

                <td>
                  <button
                    onClick={() => saveRow(item)}
                    className="rounded bg-green-600 px-3 py-1 text-white"
                  >
                    Save
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}