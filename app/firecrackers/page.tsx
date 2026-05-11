"use client";

import useSWR from "swr";
import { useState } from "react";

const fetcher = (url: string) =>
  fetch(url).then((res) => res.json());

type Firecracker = {
  id: number;
  name: string;
  high: number;
  med: number;
  low: number;
  very_low: number;
};

export default function FirecrackersTable() {
  const { data, error, mutate, isLoading } = useSWR<
    Firecracker[]
  >("/api/firecrackers", fetcher);

  const [editingId, setEditingId] = useState<number | null>(
    null
  );

  const [form, setForm] = useState<Firecracker | null>(null);

  if (isLoading) return <div>Loading...</div>;

  if (error) return <div>Error loading data</div>;

  const startEdit = (item: Firecracker) => {
    setEditingId(item.id);
    setForm(item);
  };

  const saveEdit = async () => {
    if (!form) return;

    await fetch("/api/firecrackers", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(form),
    });

    await mutate();

    setEditingId(null);
    setForm(null);
  };

  return (
    <table className="border-collapse border border-gray-300 w-full">
      <thead>
        <tr className="bg-gray-100">
          <th className="border p-2">Name</th>
          <th className="border p-2">High</th>
          <th className="border p-2">Med</th>
          <th className="border p-2">Low</th>
          <th className="border p-2">Very Low</th>
          <th className="border p-2">Actions</th>
        </tr>
      </thead>

      <tbody>
        {data?.map((item) => (
          <tr key={item.id}>
            <td className="border p-2">
              {editingId === item.id ? (
                <input
                  className="border p-1"
                  value={form?.name || ""}
                  onChange={(e) =>
                    setForm((prev) =>
                      prev
                        ? {
                            ...prev,
                            name: e.target.value,
                          }
                        : null
                    )
                  }
                />
              ) : (
                item.name
              )}
            </td>

            {["high", "med", "low", "very_low"].map(
              (field) => (
                <td
                  key={field}
                  className="border p-2"
                >
                  {editingId === item.id ? (
                    <input
                      type="number"
                      className="border p-1 w-20"
                      value={
                        (form as any)?.[field] ?? 0
                      }
                      onChange={(e) =>
                        setForm((prev: any) => ({
                          ...prev,
                          [field]: Number(
                            e.target.value
                          ),
                        }))
                      }
                    />
                  ) : (
                    (item as any)[field]
                  )}
                </td>
              )
            )}

            <td className="border p-2">
              {editingId === item.id ? (
                <button
                  onClick={saveEdit}
                  className="bg-green-500 text-white px-3 py-1 rounded"
                >
                  Save
                </button>
              ) : (
                <button
                  onClick={() => startEdit(item)}
                  className="bg-blue-500 text-white px-3 py-1 rounded"
                >
                  Edit
                </button>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}