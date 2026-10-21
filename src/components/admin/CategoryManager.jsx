"use client";

// Client root for the Categories screen: owns the create/edit state so
// Edit swaps the form into edit mode, then swaps back on save/cancel.
import { useState } from "react";
import CategoryForm from "@/components/admin/CategoryForm.jsx";
import CategoryTable from "@/components/admin/CategoryTable.jsx";

export default function CategoryManager({ categories }) {
  const [editing, setEditing] = useState(null);

  return (
    <div className="grid gap-6">
      <div id="category-form">
        {/* key remounts the form when the edit target changes */}
        <CategoryForm
          key={editing?.id ?? "create"}
          category={editing}
          onCancel={() => setEditing(null)}
          onSaved={() => setEditing(null)}
        />
      </div>
      <CategoryTable categories={categories} onEdit={setEditing} />
    </div>
  );
}
