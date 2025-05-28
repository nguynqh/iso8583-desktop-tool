"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Trash2, Save, AlertTriangle } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface AppSettings {
  language: string
  theme: string
  autoSave: boolean
  maxLogSize: number
  defaultExportFormat: string
  showAdvancedOptions: boolean
}

interface FieldDefinition {
  id: string
  name: string
  type: string
  minLength: number
  maxLength: number
  required: boolean
  description: string
}

interface SettingsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  // App Settings State
  const [appSettings, setAppSettings] = useState<AppSettings>({
    language: "vi",
    theme: "light",
    autoSave: true,
    maxLogSize: 1024,
    defaultExportFormat: "json",
    showAdvancedOptions: false,
  })
  const [originalAppSettings, setOriginalAppSettings] = useState<AppSettings>(appSettings)
  const [appSettingsChanged, setAppSettingsChanged] = useState(false)

  // Field Definitions State
  const [fieldDefinitions, setFieldDefinitions] = useState<FieldDefinition[]>([
    {
      id: "0",
      name: "Message Type Indicator",
      type: "n",
      minLength: 4,
      maxLength: 4,
      required: true,
      description: "Loại thông điệp",
    },
    { id: "1", name: "Bitmap", type: "b", minLength: 16, maxLength: 16, required: true, description: "Bitmap chính" },
    {
      id: "2",
      name: "Primary Account Number",
      type: "n",
      minLength: 13,
      maxLength: 19,
      required: false,
      description: "Số thẻ chính",
    },
    {
      id: "3",
      name: "Processing Code",
      type: "n",
      minLength: 6,
      maxLength: 6,
      required: false,
      description: "Mã xử lý giao dịch",
    },
    {
      id: "4",
      name: "Amount Transaction",
      type: "n",
      minLength: 12,
      maxLength: 12,
      required: false,
      description: "Số tiền giao dịch",
    },
  ])
  const [originalFieldDefinitions, setOriginalFieldDefinitions] = useState<FieldDefinition[]>(fieldDefinitions)
  const [fieldDefinitionsChanged, setFieldDefinitionsChanged] = useState(false)
  const [editingField, setEditingField] = useState<FieldDefinition | null>(null)
  const [isAddingField, setIsAddingField] = useState(false)

  // Check for changes
  useEffect(() => {
    setAppSettingsChanged(JSON.stringify(appSettings) !== JSON.stringify(originalAppSettings))
  }, [appSettings, originalAppSettings])

  useEffect(() => {
    setFieldDefinitionsChanged(JSON.stringify(fieldDefinitions) !== JSON.stringify(originalFieldDefinitions))
  }, [fieldDefinitions, originalFieldDefinitions])

  const handleAppSettingsChange = (key: keyof AppSettings, value: any) => {
    setAppSettings((prev) => ({ ...prev, [key]: value }))
  }

  const saveAppSettings = () => {
    setOriginalAppSettings(appSettings)
    setAppSettingsChanged(false)
    toast({
      title: "Thành công",
      description: "Đã lưu cài đặt ứng dụng",
    })
  }

  const resetAppSettings = () => {
    setAppSettings(originalAppSettings)
    setAppSettingsChanged(false)
  }

  const saveFieldDefinitions = () => {
    setOriginalFieldDefinitions([...fieldDefinitions])
    setFieldDefinitionsChanged(false)
    toast({
      title: "Thành công",
      description: "Đã lưu định nghĩa field",
    })
  }

  const resetFieldDefinitions = () => {
    setFieldDefinitions([...originalFieldDefinitions])
    setFieldDefinitionsChanged(false)
    setEditingField(null)
    setIsAddingField(false)
  }

  const handleEditField = (field: FieldDefinition) => {
    setEditingField({ ...field })
    setIsAddingField(false)
  }

  const handleAddField = () => {
    setEditingField({
      id: "",
      name: "",
      type: "n",
      minLength: 1,
      maxLength: 1,
      required: false,
      description: "",
    })
    setIsAddingField(true)
  }

  const handleSaveField = () => {
    if (!editingField) return

    if (isAddingField) {
      if (fieldDefinitions.some((f) => f.id === editingField.id)) {
        toast({
          title: "Lỗi",
          description: "Field ID đã tồn tại",
          variant: "destructive",
        })
        return
      }
      setFieldDefinitions((prev) => [...prev, editingField])
    } else {
      setFieldDefinitions((prev) => prev.map((f) => (f.id === editingField.id ? editingField : f)))
    }

    setEditingField(null)
    setIsAddingField(false)
  }

  const handleDeleteField = (id: string) => {
    setFieldDefinitions((prev) => prev.filter((f) => f.id !== id))
    if (editingField?.id === id) {
      setEditingField(null)
      setIsAddingField(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Cấu hình ứng dụng</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="app-settings" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="app-settings">
              Cài đặt ứng dụng
              {appSettingsChanged && <Badge variant="destructive" className="ml-2 h-2 w-2 p-0" />}
            </TabsTrigger>
            <TabsTrigger value="field-definitions">
              Định nghĩa Field
              {fieldDefinitionsChanged && <Badge variant="destructive" className="ml-2 h-2 w-2 p-0" />}
            </TabsTrigger>
          </TabsList>

          {/* App Settings Tab */}
          <TabsContent value="app-settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Cài đặt ứng dụng</CardTitle>
                <CardDescription>Cấu hình các tùy chọn chung của ứng dụng</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="language">Ngôn ngữ</Label>
                    <Select
                      value={appSettings.language}
                      onValueChange={(value) => handleAppSettingsChange("language", value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="vi">Tiếng Việt</SelectItem>
                        <SelectItem value="en">English</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="theme">Giao diện</Label>
                    <Select
                      value={appSettings.theme}
                      onValueChange={(value) => handleAppSettingsChange("theme", value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">Sáng</SelectItem>
                        <SelectItem value="dark">Tối</SelectItem>
                        <SelectItem value="system">Theo hệ thống</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="maxLogSize">Kích thước log tối đa (KB)</Label>
                    <Input
                      id="maxLogSize"
                      type="number"
                      value={appSettings.maxLogSize}
                      onChange={(e) => handleAppSettingsChange("maxLogSize", Number.parseInt(e.target.value))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="defaultExportFormat">Định dạng xuất mặc định</Label>
                    <Select
                      value={appSettings.defaultExportFormat}
                      onValueChange={(value) => handleAppSettingsChange("defaultExportFormat", value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="json">JSON</SelectItem>
                        <SelectItem value="excel">Excel</SelectItem>
                        <SelectItem value="csv">CSV</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Tự động lưu</Label>
                      <p className="text-sm text-gray-600">Tự động lưu kết quả phân tích</p>
                    </div>
                    <Switch
                      checked={appSettings.autoSave}
                      onCheckedChange={(checked) => handleAppSettingsChange("autoSave", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Hiển thị tùy chọn nâng cao</Label>
                      <p className="text-sm text-gray-600">Hiển thị các tùy chọn dành cho người dùng chuyên nghiệp</p>
                    </div>
                    <Switch
                      checked={appSettings.showAdvancedOptions}
                      onCheckedChange={(checked) => handleAppSettingsChange("showAdvancedOptions", checked)}
                    />
                  </div>
                </div>

                {appSettingsChanged && (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>Bạn có thay đổi chưa được lưu. Bạn có muốn lưu thay đổi không?</AlertDescription>
                  </Alert>
                )}

                <div className="flex gap-2 pt-4">
                  <Button onClick={saveAppSettings} disabled={!appSettingsChanged}>
                    <Save className="h-4 w-4 mr-2" />
                    Lưu cài đặt
                  </Button>
                  <Button variant="outline" onClick={resetAppSettings} disabled={!appSettingsChanged}>
                    Hủy thay đổi
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Field Definitions Tab */}
          <TabsContent value="field-definitions" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Field List */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Danh sách Field</CardTitle>
                      <CardDescription>Quản lý định nghĩa các field ISO 8583</CardDescription>
                    </div>
                    <Button onClick={handleAddField} size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Thêm Field
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {fieldDefinitions.map((field) => (
                      <div
                        key={field.id}
                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                          editingField?.id === field.id ? "border-blue-500 bg-blue-50" : "hover:bg-gray-50"
                        }`}
                        onClick={() => handleEditField(field)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">
                              Field {field.id}: {field.name}
                            </div>
                            <div className="text-sm text-gray-600">
                              Type: {field.type} | Length: {field.minLength}-{field.maxLength}
                              {field.required && (
                                <Badge variant="secondary" className="ml-2">
                                  Bắt buộc
                                </Badge>
                              )}
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDeleteField(field.id)
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Field Editor */}
              <Card>
                <CardHeader>
                  <CardTitle>
                    {isAddingField
                      ? "Thêm Field mới"
                      : editingField
                        ? `Chỉnh sửa Field ${editingField.id}`
                        : "Chọn Field để chỉnh sửa"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {editingField ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="fieldId">Field ID</Label>
                          <Input
                            id="fieldId"
                            value={editingField.id}
                            onChange={(e) => setEditingField((prev) => (prev ? { ...prev, id: e.target.value } : null))}
                            disabled={!isAddingField}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="fieldType">Loại dữ liệu</Label>
                          <Select
                            value={editingField.type}
                            onValueChange={(value) =>
                              setEditingField((prev) => (prev ? { ...prev, type: value } : null))
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="n">n (Numeric)</SelectItem>
                              <SelectItem value="an">an (Alphanumeric)</SelectItem>
                              <SelectItem value="ans">ans (Alphanumeric + Special)</SelectItem>
                              <SelectItem value="b">b (Binary)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="fieldName">Tên Field</Label>
                        <Input
                          id="fieldName"
                          value={editingField.name}
                          onChange={(e) => setEditingField((prev) => (prev ? { ...prev, name: e.target.value } : null))}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="minLength">Độ dài tối thiểu</Label>
                          <Input
                            id="minLength"
                            type="number"
                            value={editingField.minLength}
                            onChange={(e) =>
                              setEditingField((prev) =>
                                prev ? { ...prev, minLength: Number.parseInt(e.target.value) } : null,
                              )
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="maxLength">Độ dài tối đa</Label>
                          <Input
                            id="maxLength"
                            type="number"
                            value={editingField.maxLength}
                            onChange={(e) =>
                              setEditingField((prev) =>
                                prev ? { ...prev, maxLength: Number.parseInt(e.target.value) } : null,
                              )
                            }
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="description">Mô tả</Label>
                        <Textarea
                          id="description"
                          value={editingField.description}
                          onChange={(e) =>
                            setEditingField((prev) => (prev ? { ...prev, description: e.target.value } : null))
                          }
                        />
                      </div>

                      <div className="flex items-center space-x-2">
                        <Switch
                          id="required"
                          checked={editingField.required}
                          onCheckedChange={(checked) =>
                            setEditingField((prev) => (prev ? { ...prev, required: checked } : null))
                          }
                        />
                        <Label htmlFor="required">Field bắt buộc</Label>
                      </div>

                      <div className="flex gap-2 pt-4">
                        <Button onClick={handleSaveField}>
                          <Save className="h-4 w-4 mr-2" />
                          {isAddingField ? "Thêm Field" : "Lưu thay đổi"}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setEditingField(null)
                            setIsAddingField(false)
                          }}
                        >
                          Hủy
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      Chọn một field từ danh sách để chỉnh sửa hoặc thêm field mới
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {fieldDefinitionsChanged && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Bạn có thay đổi định nghĩa field chưa được lưu. Bạn có muốn lưu thay đổi không?
                </AlertDescription>
              </Alert>
            )}

            <div className="flex gap-2">
              <Button onClick={saveFieldDefinitions} disabled={!fieldDefinitionsChanged}>
                <Save className="h-4 w-4 mr-2" />
                Lưu định nghĩa Field
              </Button>
              <Button variant="outline" onClick={resetFieldDefinitions} disabled={!fieldDefinitionsChanged}>
                Hủy thay đổi
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
