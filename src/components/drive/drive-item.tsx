import { Tag } from "@/components/ui/tag";

type DriveItemProps = {
  id: string;
  name: string;
  description?: string | null;
  quantity?: number;
  unit?: string | null;
  urgency?: string | null;
};

const URGENCY_COLORS: Record<string, string> = {
  critical: "bg-red-50 text-red-700 border-red-200",
  high: "bg-orange-50 text-orange-700 border-orange-200",
  medium: "bg-yellow-50 text-yellow-700 border-yellow-200",
  low: "bg-green-50 text-green-700 border-green-200",
};

export function DriveItem({ name, description, quantity, unit, urgency }: DriveItemProps) {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-4">
      <div className="flex items-start justify-between">
        <div>
          <h4 className="font-semibold text-gray-900">{name}</h4>
          {description && <p className="mt-1 text-sm text-gray-600">{description}</p>}
        </div>
        <div className="flex flex-col items-end gap-2">
          {quantity && (
            <span className="text-sm font-medium text-primary">
              {quantity} {unit || "needed"}
            </span>
          )}
          {urgency && (
            <span className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${URGENCY_COLORS[urgency] || ""}`}>
              {urgency}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}