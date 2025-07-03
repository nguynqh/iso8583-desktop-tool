import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Info } from "lucide-react";
import { Input } from "@/components/ui/input";

// Define the props for the AdvancedFilter component
interface Template {
    name: string;
    fileName: string;
    data: any;
}
interface AdvancedFilterProps {
  checked: boolean;
  setChecked: (checked: boolean) => void;
  templates: Template[];
  templatesLoading: boolean;
  templatesError?: string;
  selectedTemplate?: string;
  setSelectedTemplate: (template: string) => void;
  setTemplateViewOpen: (open: boolean) => void;
  getSelectedTemplateData: () => Template["data"] | undefined;
  filterChannel: string;
  setFilterChannel: (value: string) => void;
  filterMti: string;
  setFilterMti: (value: string) => void;
  filterPcode: string;
  setFilterPcode: (value: string) => void;
}

const AdvancedFilter: React.FC<AdvancedFilterProps> = ({
  checked,
  setChecked,
  templates,
  templatesLoading,
  templatesError,
  selectedTemplate,
  setSelectedTemplate,
  setTemplateViewOpen,
  getSelectedTemplateData,
  filterChannel,
  setFilterChannel,
  filterMti,
  setFilterMti,
  filterPcode,
  setFilterPcode,
}) => {
  return (
    <div className="bg-white border rounded-lg p-6 shadow-sm">
      <div className="flex items-center gap-2">
        <Checkbox
          id="advanced-filter"
          checked={checked}
          onCheckedChange={(value) => setChecked(value === true)}
        />
        <Label htmlFor="advanced-filter" className="cursor-pointer text-base font-medium">
          Lọc thông điệp nâng cao
        </Label>
      </div>

      <div
        className={`
          transition-all duration-500 overflow-hidden p-2
          ${checked ? "max-h-[500px] opacity-100 mt-2" : "max-h-0 opacity-0"}
        `}
      >
        <div className="flex flex-col gap-1">
          <Label htmlFor="template-check" className="text-sm font-semibold">
            Template kiểm tra
          </Label>
          {templatesLoading ? (
            <div className="text-sm text-gray-500">Loading templates...</div>
          ) : templatesError ? (
            <div className="text-sm text-red-500">Error: {templatesError}</div>
          ) : (
            <>
              <div className="flex items-center">
                <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn template" />
                  </SelectTrigger>
                  <SelectContent>
                    {templates.map((template) => (
                      <SelectItem key={template.fileName} value={template.fileName}>
                        {template.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 hover:bg-gray-100"
                  onClick={() => setTemplateViewOpen(true)}
                  disabled={!selectedTemplate}
                >
                  <Info className="h-4 w-4" />
                </Button>
              </div>
              {selectedTemplate && (() => {
                const data = getSelectedTemplateData();
                const fieldNumbers = data?.map((field: any) => `F${field.FieldNumber}`).join(", ") || "";
                return data?.length > 0 ? (
                  <div className="ml-3 text-xs text-gray-600">
                    <span className="font-medium">
                      Có tổng {data.length} fields: {fieldNumbers}
                    </span>
                  </div>
                ) : null;
              })()}
            </>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 items-center">
          <div className="flex flex-col gap-2">
            <Label htmlFor="filter-channel" className="text-sm">
              Kênh xử lý
            </Label>
            <Input
              id="filter-channel"
              type="text"
              className="w-full"
              placeholder="Nhập kênh xử lý (ví dụ: CSBIST)"
              value={filterChannel}
              onChange={(e) => setFilterChannel(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="filter-mti" className="text-sm">
              MTI
            </Label>
            <Input
              id="filter-mti"
              type="text"
              className="w-full"
              placeholder="Nhập MTI (ví dụ: 0200)"
              value={filterMti}
              onChange={(e) => setFilterMti(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="filter-pcode" className="text-sm">
              PCODE
            </Label>
            <Input
              id="filter-pcode"
              type="text"
              className="w-full"
              placeholder="Nhập PCODE (ví dụ: 010000)"
              value={filterPcode}
              onChange={(e) => setFilterPcode(e.target.value)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedFilter;