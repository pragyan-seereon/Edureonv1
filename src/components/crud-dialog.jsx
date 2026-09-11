/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { toast } from "sonner";

function isEmpty(value) {
  return value === undefined || value === null || String(value).trim() === "";
}

export function CrudDialog({
  open,
  onOpenChange,
  title,
  description,
  fields,
  initial,
  onSubmit,
  submitLabel = "Save",
}) {
  const blank = Object.fromEntries(
    fields.map((f) => [
      f.name,
      f.type === "number" ? 0 : f.type === "select" ? f.options[0] : "",
    ]),
  );
  const [data, setData] = useState(initial ?? blank);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (open) {
      setData(initial ?? blank);
      setErrors({});
    } /* eslint-disable-next-line */
  }, [open]);

  const updateField = (name, value) => {
    setData((p) => ({ ...p, [name]: value }));
    // Clear that field's error as soon as the user fixes it
    setErrors((p) => (p[name] ? { ...p, [name]: undefined } : p));
  };

  const validate = () => {
    const nextErrors = {};
    fields.forEach((f) => {
      if (!f.required) return;
      const value = data[f.name];
      const empty =
        f.type === "number" ? value === undefined || value === null || Number.isNaN(value) : isEmpty(value);
      if (empty) {
        nextErrors[f.name] = `${f.label} is required.`;
      }
    });
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const submit = () => {
    if (!validate()) return;
    onSubmit?.(data);
    toast.success(submitLabel + " — saved");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="font-display">{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-2">
          {fields.map((f) => (
            <div
              key={f.name}
              className={`space-y-1.5 ${f.type === "textarea" ? "sm:col-span-2" : ""}`}
            >
              <Label className="text-xs text-muted-foreground">
                {f.label}
                {f.required && <span className="text-destructive"> *</span>}
              </Label>
              {f.type === "textarea" ? (
                <Textarea
                  rows={3}
                  value={String(data[f.name] ?? "")}
                  onChange={(e) => updateField(f.name, e.target.value)}
                  className={errors[f.name] ? "border-destructive" : ""}
                />
              ) : f.type === "select" ? (
                <Select
                  value={String(data[f.name] ?? "")}
                  onValueChange={(v) => updateField(f.name, v)}
                >
                  <SelectTrigger className={errors[f.name] ? "border-destructive" : ""}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {f.options.map((o) => (
                      <SelectItem key={o} value={o}>
                        {o}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  type={f.type ?? "text"}
                  value={String(data[f.name] ?? "")}
                  onChange={(e) =>
                    updateField(
                      f.name,
                      f.type === "number" ? Number(e.target.value) : e.target.value,
                    )
                  }
                  className={errors[f.name] ? "border-destructive" : ""}
                />
              )}
              {errors[f.name] && (
                <p className="text-xs text-destructive">{errors[f.name]}</p>
              )}
            </div>
          ))}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={submit} className="gradient-primary border-0">
            {submitLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}