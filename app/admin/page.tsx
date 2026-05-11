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

const emptyItem: Omit<Firecracker, "id"> = {
  name: "",
  high: 0,
  med: 0,
  low: 0,
  very_low: 0,
  stock: 0,
};

export default function AdminFirecrackers() {
  const [items, setItems] = useState<Firecracker[]>([]);
  const [loading, setLoading] = useState(true);

  const [newItem, setNewItem] =
    useState<Omit<Firecracker, "id">>(emptyItem);

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

  function updateNewField(
    field: keyof Omit<Firecracker, "id">,
    value: any
  ) {
    setNewItem((prev) => ({
      ...prev,
      [field]: value,
    }));
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
  async function deleteRow(id: number) {
  const confirmed = confirm(
    "Are you sure you want to delete this item?"
  );

  if (!confirmed) return;

  await fetch(`/api/firecrackers/update?id=${id}`, {
    method: "DELETE",
  });

  fetchItems();
}

  async function createItem() {
    await fetch("/api/firecrackers/update", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newItem),
    });

    alert("Item Added");

    setNewItem(emptyItem);

    fetchItems();
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-4 md:p-8">
      <h1 className="mb-6 text-2xl font-bold">
        Firecracker Admin Panel
      </h1>

      {/* ADD NEW ITEM */}
      <div className="mb-8 rounded border p-4">
        <h2 className="mb-4 text-lg font-semibold">
          Add New Firecracker
        </h2>

        <div className="flex flex-wrap gap-2">
          <input
            placeholder="Name"
            className="border p-2"
            value={newItem.name}
            onChange={(e) =>
              updateNewField("name", e.target.value)
            }
          />

          <input
            type="number"
            placeholder="High"
            className="w-24 border p-2"
            value={newItem.high}
            onChange={(e) =>
              updateNewField(
                "high",
                Number(e.target.value)
              )
            }
          />

          <input
            type="number"
            placeholder="Med"
            className="w-24 border p-2"
            value={newItem.med}
            onChange={(e) =>
              updateNewField(
                "med",
                Number(e.target.value)
              )
            }
          />

          <input
            type="number"
            placeholder="Low"
            className="w-24 border p-2"
            value={newItem.low}
            onChange={(e) =>
              updateNewField(
                "low",
                Number(e.target.value)
              )
            }
          />

          <input
            type="number"
            placeholder="Very Low"
            className="w-24 border p-2"
            value={newItem.very_low}
            onChange={(e) =>
              updateNewField(
                "very_low",
                Number(e.target.value)
              )
            }
          />

          <input
            type="number"
            placeholder="Stock"
            className="w-24 border p-2"
            value={newItem.stock}
            onChange={(e) =>
              updateNewField(
                "stock",
                Number(e.target.value)
              )
            }
          />

          <button
            onClick={createItem}
            className="rounded bg-blue-600 px-4 py-2 text-white"
          >
            Add Item
          </button>
        </div>
      </div>

      {/* EXISTING TABLE */}
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
                    value={item.very_low ?? 0}
                    onChange={(e) =>
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
<td className="space-x-2">
  <button
    onClick={() => saveRow(item)}
    className="rounded bg-green-600 px-3 py-1 text-white"
  >
    Save
  </button>

  <button
    onClick={() => deleteRow(item.id)}
    className="rounded bg-red-600 px-3 py-1 text-white"
  >
    Delete
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