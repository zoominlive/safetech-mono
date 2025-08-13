import React, { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useMaterialStore } from "@/store";
import { materialService, Material } from "@/services/api/materialService";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Pencil, Save, X } from "lucide-react";
import { useAuthStore } from "@/store";
import BackButton from "@/components/BackButton";

type EditableMaterial = Pick<Material, "id" | "name" | "type" | "is_active">;

const MaterialsManagement: React.FC = () => {
  const { materials, loading, error, fetchMaterials, clearError } = useMaterialStore();
  const { user } = useAuthStore();
  const { toast } = useToast();

  const isProjectManager = useMemo(() => (user?.role || "").toLowerCase() === "project manager", [user]);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<EditableMaterial | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchMaterials();
    return () => {
      clearError();
    };
  }, [fetchMaterials, clearError]);

  const beginEdit = (material: Material) => {
    setEditingId(material.id);
    setForm({ id: material.id, name: material.name, type: material.type, is_active: material.is_active });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm(null);
  };

  const saveEdit = async () => {
    if (!form) return;
    setIsSaving(true);
    try {
      const original = materials.find(m => m.id === form.id);
      if (!original) throw new Error("Material not found");

      // Update name/type if changed
      if (original.name !== form.name || original.type !== form.type) {
        await materialService.updateMaterial(form.id, { name: form.name, type: form.type });
      }

      // Toggle active if changed
      if (original.is_active !== form.is_active) {
        await materialService.toggleMaterialStatus(form.id, form.is_active);
      }

      await fetchMaterials();
      toast({ title: "Saved", description: "Material updated successfully." });
      cancelEdit();
    } catch (e: any) {
      toast({ title: "Error", description: e?.message || "Failed to update material", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <BackButton />
        <h1 className="text-2xl font-bold">Materials</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Materials</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center text-gray-600"><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Loading...</div>
          ) : error ? (
            <div className="text-red-600 text-sm">{error}</div>
          ) : materials.length === 0 ? (
            <div className="text-gray-500 text-sm">No materials found.</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Active</TableHead>
                    {isProjectManager && <TableHead className="w-[180px]">Actions</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {materials.map((m) => (
                    <TableRow key={m.id}>
                      <TableCell>
                        {editingId === m.id ? (
                          <div className="space-y-1">
                            <Label htmlFor={`name-${m.id}`}>Name</Label>
                            <Input
                              id={`name-${m.id}`}
                              value={form?.name || ""}
                              onChange={(e) => setForm((prev) => prev ? { ...prev, name: e.target.value } : prev)}
                            />
                          </div>
                        ) : (
                          m.name
                        )}
                      </TableCell>
                      <TableCell>
                        {editingId === m.id ? (
                          <div className="space-y-1">
                            <Label htmlFor={`type-${m.id}`}>Type</Label>
                            <select
                              id={`type-${m.id}`}
                              className="border rounded px-2 py-1 text-sm"
                              value={form?.type || "standard"}
                              onChange={(e) => setForm((prev) => prev ? { ...prev, type: e.target.value as "standard" | "custom" } : prev)}
                            >
                              <option value="standard">standard</option>
                              <option value="custom">custom</option>
                            </select>
                          </div>
                        ) : (
                          m.type
                        )}
                      </TableCell>
                      <TableCell>
                        {editingId === m.id ? (
                          <div className="flex items-center space-x-2">
                            <Switch
                              id={`active-${m.id}`}
                              checked={!!form?.is_active}
                              onCheckedChange={(checked) => setForm((prev) => prev ? { ...prev, is_active: checked } : prev)}
                            />
                            <Label htmlFor={`active-${m.id}`}>{form?.is_active ? "Active" : "Inactive"}</Label>
                          </div>
                        ) : (
                          <span className={m.is_active ? "text-green-600" : "text-gray-400"}>{m.is_active ? "Active" : "Inactive"}</span>
                        )}
                      </TableCell>
                      {isProjectManager && (
                        <TableCell>
                          {editingId === m.id ? (
                            <div className="flex items-center space-x-2">
                              <Button size="sm" onClick={saveEdit} disabled={isSaving}>
                                {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                                Save
                              </Button>
                              <Button size="sm" variant="outline" onClick={cancelEdit} disabled={isSaving}>
                                <X className="h-4 w-4 mr-2" />
                                Cancel
                              </Button>
                            </div>
                          ) : (
                            <Button size="sm" variant="outline" onClick={() => beginEdit(m)}>
                              <Pencil className="h-4 w-4 mr-2" />
                              Edit
                            </Button>
                          )}
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MaterialsManagement;


