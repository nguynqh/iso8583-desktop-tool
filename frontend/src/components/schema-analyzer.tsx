"use client"

import type React from "react"

import { useState, useRef, useCallback } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "./ui/textarea"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"


import {
  Play,
  Download,
  Eye,
  Filter,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Trash2,
  Upload,
  ImageIcon,
  Plus,
  Info,
  FileImage,
  Clipboard,
} from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface Template {
  id: string
  name: string
  description: string
  type: "Request" | "Response"
  schema: SchemaField[]
}

interface SchemaField {
  FieldNumber: string
  FieldType: "Fixed" | "Bitmap" | "LLVAR" | "LLLVAR" | "Variable"
  FieldLength: number
  FieldPattern?: string
  FieldDescription: string
}

interface ParsedResult {
  fieldNumber: string
  fieldName: string
  rawValue: string
  parsedValue: string
  status: "valid" | "invalid" | "warning"
  notes?: string
}

interface LogEntry {
  lineNumber: number
  originalLine: string
  filteredLine: string
  matched: boolean
  parsedFields: ParsedResult[]
}

export function SchemaAnalyzer() {
    const [selectedTemplate, setSelectedTemplate] = useState<string>("")
    const [templateDetailsOpen, setTemplateDetailsOpen] = useState(false)
    const [logInput, setLogInput] = useState("")
    const [logImage, setLogImage] = useState<string | null>(null)
    const [filterPattern, setFilterPattern] = useState("")
    const [isAnalyzing, setIsAnalyzing] = useState(false)
    const [validationErrors, setValidationErrors] = useState<string[]>([])
    const [parsedResults, setParsedResults] = useState<LogEntry[]>([])

    // New template state
    const [newTemplateImage, setNewTemplateImage] = useState<string | null>(null)
    const [newTemplateContent, setNewTemplateContent] = useState("")
    const [newTemplateType, setNewTemplateType] = useState<"Request" | "Response">("Request")
    const [generatedTemplate, setGeneratedTemplate] = useState<Template | null>(null)
    const [previewTemplateOpen, setPreviewTemplateOpen] = useState(false)

    const fileInputRef = useRef<HTMLInputElement>(null)
    const templateFileInputRef = useRef<HTMLInputElement>(null)

    // Mock templates data
    const templates: Template[] = [
        {
        id: "iso8583-financial",
        name: "ISO 8583 Financial Transaction",
        description: "Standard financial transaction message format",
        type: "Request",
        schema: [
            {
            FieldNumber: "0",
            FieldType: "Fixed",
            FieldLength: 4,
            FieldDescription: "Message Type Indicator",
            },
            {
            FieldNumber: "1",
            FieldType: "Bitmap",
            FieldLength: 16,
            FieldDescription: "Primary Bitmap",
            },
            {
            FieldNumber: "2",
            FieldType: "LLVAR",
            FieldLength: 19,
            FieldDescription: "Primary Account Number",
            },
            {
            FieldNumber: "3",
            FieldType: "Fixed",
            FieldLength: 6,
            FieldDescription: "Processing Code",
            },
            {
            FieldNumber: "4",
            FieldType: "Fixed",
            FieldLength: 12,
            FieldDescription: "Amount Transaction",
            },
            {
            FieldNumber: "7",
            FieldType: "Fixed",
            FieldLength: 10,
            FieldDescription: "Transmission Date Time",
            },
            {
            FieldNumber: "11",
            FieldType: "Fixed",
            FieldLength: 6,
            FieldDescription: "System Trace Audit Number",
            },
            {
            FieldNumber: "12",
            FieldType: "Fixed",
            FieldLength: 6,
            FieldDescription: "Time Local Transaction",
            },
            {
            FieldNumber: "13",
            FieldType: "Fixed",
            FieldLength: 4,
            FieldDescription: "Date Local Transaction",
            },
            {
            FieldNumber: "22",
            FieldType: "Fixed",
            FieldLength: 3,
            FieldDescription: "Point of Service Entry Mode",
            },
            {
            FieldNumber: "25",
            FieldType: "Fixed",
            FieldLength: 2,
            FieldDescription: "Point of Service Condition Code",
            },
            {
            FieldNumber: "41",
            FieldType: "Fixed",
            FieldLength: 8,
            FieldDescription: "Card Acceptor Terminal ID",
            },
        ],
        },
        {
        id: "iso8583-response",
        name: "ISO 8583 Response Message",
        description: "Standard response message format",
        type: "Response",
        schema: [
            {
            FieldNumber: "0",
            FieldType: "Fixed",
            FieldLength: 4,
            FieldDescription: "Message Type Indicator",
            },
            {
            FieldNumber: "1",
            FieldType: "Bitmap",
            FieldLength: 16,
            FieldDescription: "Primary Bitmap",
            },
            {
            FieldNumber: "39",
            FieldType: "Fixed",
            FieldLength: 2,
            FieldDescription: "Response Code",
            },
            {
            FieldNumber: "7",
            FieldType: "Fixed",
            FieldLength: 10,
            FieldDescription: "Transmission Date Time",
            },
            {
            FieldNumber: "11",
            FieldType: "Fixed",
            FieldLength: 6,
            FieldDescription: "System Trace Audit Number",
            },
        ],
        },
    ]

    const getCurrentTemplate = (): Template | undefined => {
        return templates.find((t) => t.id === selectedTemplate)
    }

    const createNewTemplate = () => {
        if (generatedTemplate) {
        // Add to templates list (in real app, would save to backend)
        toast({
            title: "Thành công",
            description: `Đã tạo template "${generatedTemplate.name}"`,
        })

        // Reset form
        setNewTemplateContent("")
        setNewTemplateImage(null)
        setGeneratedTemplate(null)
        setPreviewTemplateOpen(false)
        }
    }


    // Image handling functions
    const handleImageDrop = useCallback((e: React.DragEvent<HTMLDivElement>, isTemplate = false) => {
        e.preventDefault()
        const files = Array.from(e.dataTransfer.files)
        const imageFile = files.find((file) => file.type.startsWith("image/"))

        if (imageFile) {
        const reader = new FileReader()
        reader.onload = (event) => {
            const result = event.target?.result as string
            if (isTemplate) {
            setNewTemplateImage(result)
            // Mock OCR processing for template
            setNewTemplateContent(
                '// Template được tạo từ hình ảnh\n{\n  "fields": [\n    // Các field sẽ được phân tích từ ảnh\n  ]\n}',
            )
            } else {
            setLogImage(result)
            // Mock OCR processing for log
            setLogInput("0200F220000000000000411111111111111100000000000010001225123045123456123045122505100")
            }
        }
        reader.readAsDataURL(imageFile)

        toast({
            title: "Thành công",
            description: `Đã tải lên hình ảnh ${isTemplate ? "template" : "log"}`,
        })
        }
    }, [])

    const handleImagePaste = useCallback(async (isTemplate = false) => {
        try {
        const clipboardItems = await navigator.clipboard.read()
        for (const clipboardItem of clipboardItems) {
            for (const type of clipboardItem.types) {
            if (type.startsWith("image/")) {
                const blob = await clipboardItem.getType(type)
                const reader = new FileReader()
                reader.onload = (event) => {
                const result = event.target?.result as string
                if (isTemplate) {
                    setNewTemplateImage(result)
                    setNewTemplateContent(
                    '// Template được tạo từ hình ảnh clipboard\n{\n  "fields": [\n    // Các field sẽ được phân tích từ ảnh\n  ]\n}',
                    )
                } else {
                    setLogImage(result)
                    setLogInput("0200F220000000000000411111111111111100000000000010001225123045123456123045122505100")
                }
                }
                reader.readAsDataURL(blob)

                toast({
                title: "Thành công",
                description: `Đã dán hình ảnh ${isTemplate ? "template" : "log"} từ clipboard`,
                })
                return
            }
            }
        }

        toast({
            title: "Lỗi",
            description: "Không tìm thấy hình ảnh trong clipboard",
            variant: "destructive",
        })
        } catch (error) {
        toast({
            title: "Lỗi",
            description: "Không thể truy cập clipboard",
            variant: "destructive",
        })
        }
    }, [])

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>, isTemplate = false) => {
        const file = event.target.files?.[0]
        if (file && file.type.startsWith("image/")) {
        const reader = new FileReader()
        reader.onload = (e) => {
            const result = e.target?.result as string
            if (isTemplate) {
            setNewTemplateImage(result)
            setNewTemplateContent(
                '// Template được tạo từ file ảnh\n{\n  "fields": [\n    // Các field sẽ được phân tích từ ảnh\n  ]\n}',
            )
            } else {
            setLogImage(result)
            setLogInput("0200F220000000000000411111111111111100000000000010001225123045123456123045122505100")
            }
        }
        reader.readAsDataURL(file)
        }
    }

    const handleAnalyze = () => {
        if (!selectedTemplate) {
        toast({
            title: "Lỗi",
            description: "Vui lòng chọn template schema",
            variant: "destructive",
        })
        return
        }

        if (!logInput.trim()) {
        toast({
            title: "Lỗi",
            description: "Vui lòng nhập dữ liệu log",
            variant: "destructive",
        })
        return
        }

        setIsAnalyzing(true)
        setValidationErrors([])

        setTimeout(() => {
        try {
            const template = getCurrentTemplate()
            if (!template) return

            const logLines = logInput.split("\n").filter((line) => line.trim())
            const filteredLines = applyFilter(logLines)

            const results: LogEntry[] = filteredLines.map((line, index) => {
            const parsedFields = parseLogLine(line, template.schema)
            const hasErrors = parsedFields.some((field) => field.status === "invalid")

            return {
                lineNumber: index + 1,
                originalLine: line,
                filteredLine: line,
                matched: true,
                parsedFields,
            }
            })

            setParsedResults(results)

            const errors = results
            .flatMap((entry) => entry.parsedFields)
            .filter((field) => field.status === "invalid")
            .map((field) => `Field ${field.fieldNumber}: ${field.notes}`)

            setValidationErrors([...new Set(errors)])

            toast({
            title: "Hoàn thành",
            description: `Đã phân tích ${results.length} dòng log`,
            })
        } catch (error) {
            toast({
            title: "Lỗi",
            description: "Có lỗi xảy ra khi phân tích log",
            variant: "destructive",
            })
        } finally {
            setIsAnalyzing(false)
        }
        }, 1500)
    }

    const applyFilter = (logLines: string[]): string[] => {
        if (!filterPattern.trim()) return logLines

        const pattern = filterPattern.toLowerCase()
        return logLines.filter((line) => line.toLowerCase().includes(pattern))
    }

    const parseLogLine = (line: string, schema: SchemaField[]): ParsedResult[] => {
        const results: ParsedResult[] = []
        let position = 0
        const cleanLine = line.replace(/\s+/g, "").toUpperCase()

        for (const field of schema) {
        try {
            let fieldValue = ""
            let parsedValue = ""
            let status: "valid" | "invalid" | "warning" = "valid"
            let notes = ""

            switch (field.FieldType) {
            case "Fixed":
                if (position + field.FieldLength <= cleanLine.length) {
                fieldValue = cleanLine.substring(position, position + field.FieldLength)
                parsedValue = fieldValue
                position += field.FieldLength
                } else {
                status = "invalid"
                notes = "Insufficient data length"
                }
                break

            case "Bitmap":
                if (position + field.FieldLength <= cleanLine.length) {
                fieldValue = cleanLine.substring(position, position + field.FieldLength)
                parsedValue = `Binary: ${fieldValue}`
                position += field.FieldLength
                } else {
                status = "invalid"
                notes = "Insufficient data for bitmap"
                }
                break

            case "LLVAR":
                if (position + 2 <= cleanLine.length) {
                const lengthStr = cleanLine.substring(position, position + 2)
                const length = Number.parseInt(lengthStr, 10)
                position += 2

                if (position + length <= cleanLine.length) {
                    fieldValue = cleanLine.substring(position, position + length)
                    parsedValue = fieldValue
                    position += length
                } else {
                    status = "invalid"
                    notes = "Data length mismatch"
                }
                } else {
                status = "invalid"
                notes = "Missing length indicator"
                }
                break

            case "LLLVAR":
                if (position + 3 <= cleanLine.length) {
                const lengthStr = cleanLine.substring(position, position + 3)
                const length = Number.parseInt(lengthStr, 10)
                position += 3

                if (position + length <= cleanLine.length) {
                    fieldValue = cleanLine.substring(position, position + length)
                    parsedValue = fieldValue
                    position += length
                } else {
                    status = "invalid"
                    notes = "Data length mismatch"
                }
                } else {
                status = "invalid"
                notes = "Missing length indicator"
                }
                break

            case "Variable":
                fieldValue = cleanLine.substring(position)
                parsedValue = fieldValue
                position = cleanLine.length
                break
            }

            // Apply pattern formatting if specified
            if (field.FieldPattern && parsedValue && status === "valid") {
            try {
                parsedValue = formatWithPattern(parsedValue, field.FieldPattern)
            } catch (e) {
                status = "warning"
                notes = "Pattern formatting failed"
            }
            }

            results.push({
            fieldNumber: field.FieldNumber,
            fieldName: field.FieldDescription,
            rawValue: fieldValue,
            parsedValue: parsedValue || fieldValue,
            status,
            notes,
            })
        } catch (error) {
            results.push({
            fieldNumber: field.FieldNumber,
            fieldName: field.FieldDescription,
            rawValue: "",
            parsedValue: "",
            status: "invalid",
            notes: `Parse error: ${error}`,
            })
        }
        }

        return results
    }

    const formatWithPattern = (value: string, pattern: string): string => {
        const segments = pattern.match(/\{(\d+)\}/g)
        if (!segments) return value

        let result = pattern
        let position = 0

        for (const segment of segments) {
        const length = Number.parseInt(segment.replace(/[{}]/g, ""), 10)
        const segmentValue = value.substring(position, position + length)
        result = result.replace(segment, segmentValue)
        position += length
        }

        return result
    }

    const generateTemplatePreview = () => {
        // Mock template generation from content/image
        const mockTemplate: Template = {
        id: `custom-${Date.now()}`,
        name: `Custom ${newTemplateType} Template`,
        description: `Generated ${newTemplateType.toLowerCase()} template`,
        type: newTemplateType,
        schema: [
            {
            FieldNumber: "0",
            FieldType: "Fixed",
            FieldLength: 4,
            FieldDescription: "Message Type Indicator",
            },
            {
            FieldNumber: "1",
            FieldType: "Bitmap",
            FieldLength: 16,
            FieldDescription: "Primary Bitmap",
            },
            {
            FieldNumber: "2",
            FieldType: "LLVAR",
            FieldLength: 19,
            FieldDescription: "Primary Account Number",
            },
        ],
        }

        setGeneratedTemplate(mockTemplate)
        setPreviewTemplateOpen(true)
    }
    return (
        <div className="space-y-6">
            <Tabs defaultValue="analyze" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="analyze">Phân tích Log</TabsTrigger>
                    <TabsTrigger value="create-template">Tạo Template Mới</TabsTrigger>
                </TabsList>

                {/* analyze tab*/}
                <TabsContent value="analyze" className="space-y-6">
                    {/* template selection */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Chọn Schema Template</CardTitle>
                            <CardDescription>Chọn template để so sánh log theo schema mong muốn</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex gap-4 items-end">
                                <div className="flex-1">
                                    <Label>Template schema</Label>
                                    <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                                        <SelectTrigger className="mt-2">
                                        <SelectValue placeholder="Chọn template..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                        {templates.map((template) => (
                                            <SelectItem key={template.id} value={template.id}>
                                            <div className="flex items-center gap-2">
                                                {template.name}
                                                <Badge variant="outline" className="text-xs">
                                                {template.type}
                                                </Badge>
                                            </div>
                                            </SelectItem>
                                        ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <Dialog open={templateDetailsOpen} onOpenChange={setTemplateDetailsOpen}>
                                    <DialogTrigger asChild>
                                        <Button variant="outline" size="icon" disabled={!selectedTemplate}>
                                        <Info className="h-4 w-4" />
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-4xl max-h-[80vh]">
                                        <DialogHeader>
                                        <DialogTitle>Chi tiết Template Schema</DialogTitle>
                                        </DialogHeader>
                                        <ScrollArea className="max-h-[60vh]">
                                        {getCurrentTemplate() && (
                                            <div className="space-y-4">
                                            <div className="flex items-center gap-2">
                                                <h4 className="font-semibold">{getCurrentTemplate()?.name}</h4>
                                                <Badge variant="outline">{getCurrentTemplate()?.type}</Badge>
                                            </div>
                                            <p className="text-sm text-gray-600">{getCurrentTemplate()?.description}</p>
                                            <Separator />
                                            <div>
                                                <h5 className="font-medium mb-3">Schema Fields:</h5>
                                                <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                    <TableHead>Field #</TableHead>
                                                    <TableHead>Type</TableHead>
                                                    <TableHead>Length</TableHead>
                                                    <TableHead>Pattern</TableHead>
                                                    <TableHead>Description</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {getCurrentTemplate()?.schema.map((field) => (
                                                    <TableRow key={field.FieldNumber}>
                                                        <TableCell className="font-mono">{field.FieldNumber}</TableCell>
                                                        <TableCell>
                                                        <Badge variant="outline">{field.FieldType}</Badge>
                                                        </TableCell>
                                                        <TableCell>{field.FieldLength}</TableCell>
                                                        <TableCell className="font-mono">{field.FieldPattern || "-"}</TableCell>
                                                        <TableCell>{field.FieldDescription}</TableCell>
                                                    </TableRow>
                                                    ))}
                                                </TableBody>
                                                </Table>
                                            </div>
                                            </div>
                                        )}
                                        </ScrollArea>
                                    </DialogContent>
                                </Dialog>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Log input */}
                    <Card>
                        <CardHeader>
                        <CardTitle>Nhập dữ liệu Log</CardTitle>
                        <CardDescription>Chọn cách nhập log phù hợp với nhu cầu của bạn</CardDescription>
                        </CardHeader>
                        <CardContent>
                        <Tabs defaultValue="manual" className="w-full">
                            <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="manual">Nhập bằng tay</TabsTrigger>
                            <TabsTrigger value="image">Nhập bằng hình ảnh</TabsTrigger>
                            </TabsList>

                            <TabsContent value="manual" className="space-y-4">
                            <div>
                                <Label htmlFor="log-input">Dữ liệu Log</Label>
                                <Textarea
                                id="log-input"
                                placeholder="Nhập hoặc dán dữ liệu log vào đây..."
                                value={logInput}
                                onChange={(e) => setLogInput(e.target.value)}
                                className="min-h-[200px] mt-2 font-mono"
                                />
                            </div>
                            </TabsContent>

                            <TabsContent value="image" className="space-y-4">
                            <div className="space-y-4">
                                {/* Image Drop Zone */}
                                <div
                                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors"
                                onDrop={(e) => handleImageDrop(e, false)}
                                onDragOver={(e) => e.preventDefault()}
                                onDragEnter={(e) => e.preventDefault()}
                                >
                                <ImageIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                                <div className="space-y-2">
                                    <p className="text-lg font-medium">Kéo & thả hình ảnh log vào đây</p>
                                    <p className="text-sm text-gray-600">hoặc</p>
                                    <div className="flex gap-2 justify-center">
                                    <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                                        <Upload className="h-4 w-4 mr-2" />
                                        Chọn file
                                    </Button>
                                    <Button variant="outline" onClick={() => handleImagePaste(false)}>
                                        <Clipboard className="h-4 w-4 mr-2" />
                                        Dán từ clipboard
                                    </Button>
                                    </div>
                                </div>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => handleFileSelect(e, false)}
                                />
                                </div>

                                {/* Image Preview */}
                                {logImage && (
                                <div className="space-y-2">
                                    <Label>Preview hình ảnh log:</Label>
                                    <div className="border rounded-lg p-4 bg-gray-50">
                                    <img
                                        src={logImage || "/placeholder.svg"}
                                        alt="Log preview"
                                        className="max-w-full h-auto max-h-64 mx-auto rounded"
                                    />
                                    <div className="mt-2 flex justify-center">
                                        <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            setLogImage(null)
                                            setLogInput("")
                                        }}
                                        >
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Xóa ảnh
                                        </Button>
                                    </div>
                                    </div>
                                </div>
                                )}

                                {/* Extracted Text Preview */}
                                {logInput && logImage && (
                                <div className="space-y-2">
                                    <Label>Văn bản được trích xuất:</Label>
                                    <Textarea
                                    value={logInput}
                                    onChange={(e) => setLogInput(e.target.value)}
                                    className="min-h-[100px] font-mono"
                                    placeholder="Văn bản sẽ được trích xuất từ hình ảnh..."
                                    />
                                </div>
                                )}
                            </div>
                            </TabsContent>
                        </Tabs>

                        {/* Filter and Actions */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                            <div>
                            {/* <Label htmlFor="filter-pattern">Bộ lọc Pattern (tùy chọn)</Label>
                            <div className="flex gap-2 mt-2">
                                <Input
                                id="filter-pattern"
                                placeholder="Ví dụ: to, fr, ERROR..."
                                value={filterPattern}
                                onChange={(e) => setFilterPattern(e.target.value)}
                                />
                                <Button variant="outline" size="icon">
                                <Filter className="h-4 w-4" />
                                </Button>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">Chỉ phân tích các dòng log chứa pattern này</p> */}
                            </div>
                            <div className="flex items-end gap-2">
                            <Button onClick={handleAnalyze} disabled={isAnalyzing || !selectedTemplate || !logInput.trim()}>
                                {isAnalyzing ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Đang phân tích...
                                </>
                                ) : (
                                <>
                                    <Play className="h-4 w-4 mr-2" />
                                    Phân tích Log
                                </>
                                )}
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => {
                                setLogInput("")
                                setLogImage(null)
                                setFilterPattern("")
                                setParsedResults([])
                                setValidationErrors([])
                                }}
                            >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Xóa
                            </Button>
                            </div>
                        </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* create tab */}
                <TabsContent value="create-template" className="space-y-6">
                    <Card>
                        <CardHeader>
                        <CardTitle>Tạo Template Mới</CardTitle>
                        <CardDescription>Tạo template schema tùy chỉnh từ nội dung hoặc hình ảnh</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                        {/* Template Type Selection */}
                        <div>
                            <Label>Loại Template</Label>
                            <RadioGroup
                            value={newTemplateType}
                            onValueChange={(value: "Request" | "Response") => setNewTemplateType(value)}
                            className="flex gap-6 mt-2"
                            >
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="Request" id="request" />
                                <Label htmlFor="request">Request</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="Response" id="response" />
                                <Label htmlFor="response">Response</Label>
                            </div>
                            </RadioGroup>
                        </div>

                        <Separator />

                        {/* Template Input Methods */}
                        <Tabs defaultValue="manual-template" className="w-full">
                            <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="manual-template">Nhập bằng tay</TabsTrigger>
                            <TabsTrigger value="image-template">Nhập bằng hình ảnh</TabsTrigger>
                            </TabsList>

                            <TabsContent value="manual-template" className="space-y-4">
                            <div>
                                <Label htmlFor="template-content">Nội dung Template</Label>
                                <Textarea
                                id="template-content"
                                placeholder="Nhập nội dung template JSON hoặc mô tả cấu trúc..."
                                value={newTemplateContent}
                                onChange={(e) => setNewTemplateContent(e.target.value)}
                                className="min-h-[200px] mt-2 font-mono"
                                />
                            </div>
                            </TabsContent>

                            <TabsContent value="image-template" className="space-y-4">
                            <div className="space-y-4">
                                {/* Template Image Drop Zone */}
                                <div
                                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors"
                                onDrop={(e) => handleImageDrop(e, true)}
                                onDragOver={(e) => e.preventDefault()}
                                onDragEnter={(e) => e.preventDefault()}
                                >
                                <FileImage className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                                <div className="space-y-2">
                                    <p className="text-lg font-medium">Kéo & thả hình ảnh template vào đây</p>
                                    <p className="text-sm text-gray-600">hoặc</p>
                                    <div className="flex gap-2 justify-center">
                                    <Button variant="outline" onClick={() => templateFileInputRef.current?.click()}>
                                        <Upload className="h-4 w-4 mr-2" />
                                        Chọn file
                                    </Button>
                                    <Button variant="outline" onClick={() => handleImagePaste(true)}>
                                        <Clipboard className="h-4 w-4 mr-2" />
                                        Dán từ clipboard
                                    </Button>
                                    </div>
                                </div>
                                <input
                                    ref={templateFileInputRef}
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => handleFileSelect(e, true)}
                                />
                                </div>

                                {/* Template Image Preview */}
                                {newTemplateImage && (
                                <div className="space-y-2">
                                    <Label>Preview hình ảnh template:</Label>
                                    <div className="border rounded-lg p-4 bg-gray-50">
                                    <img
                                        src={newTemplateImage || "/placeholder.svg"}
                                        alt="Template preview"
                                        className="max-w-full h-auto max-h-64 mx-auto rounded"
                                    />
                                    <div className="mt-2 flex justify-center">
                                        <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            setNewTemplateImage(null)
                                            setNewTemplateContent("")
                                        }}
                                        >
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Xóa ảnh
                                        </Button>
                                    </div>
                                    </div>
                                </div>
                                )}

                                {/* Generated Template Content */}
                                {newTemplateContent && newTemplateImage && (
                                <div className="space-y-2">
                                    <Label>Template được tạo:</Label>
                                    <Textarea
                                    value={newTemplateContent}
                                    onChange={(e) => setNewTemplateContent(e.target.value)}
                                    className="min-h-[150px] font-mono"
                                    placeholder="Template sẽ được tạo từ hình ảnh..."
                                    />
                                </div>
                                )}
                            </div>
                            </TabsContent>
                        </Tabs>

                        {/* Action Buttons */}
                        <div className="flex gap-2">
                            <Button variant="outline" onClick={generateTemplatePreview} disabled={!newTemplateContent.trim()}>
                            <Eye className="h-4 w-4 mr-2" />
                            Xem trước
                            </Button>
                            <Button onClick={createNewTemplate} disabled={!generatedTemplate}>
                            <Plus className="h-4 w-4 mr-2" />
                            Tạo Template
                            </Button>
                        </div>
                        </CardContent>
                    </Card>

                    {/* Template Preview Dialog */}
                    <Dialog open={previewTemplateOpen} onOpenChange={setPreviewTemplateOpen}>
                        <DialogContent className="max-w-4xl max-h-[80vh]">
                        <DialogHeader>
                            <DialogTitle>Preview Template</DialogTitle>
                        </DialogHeader>
                        <ScrollArea className="max-h-[60vh]">
                            {generatedTemplate && (
                            <div className="space-y-4">
                                <div className="flex items-center gap-2">
                                <h4 className="font-semibold">{generatedTemplate.name}</h4>
                                <Badge variant="outline">{generatedTemplate.type}</Badge>
                                </div>
                                <p className="text-sm text-gray-600">{generatedTemplate.description}</p>
                                <Separator />
                                <div>
                                <h5 className="font-medium mb-3">Schema Fields:</h5>
                                <Table>
                                    <TableHeader>
                                    <TableRow>
                                        <TableHead>Field #</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Length</TableHead>
                                        <TableHead>Description</TableHead>
                                    </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                    {generatedTemplate.schema.map((field) => (
                                        <TableRow key={field.FieldNumber}>
                                        <TableCell className="font-mono">{field.FieldNumber}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline">{field.FieldType}</Badge>
                                        </TableCell>
                                        <TableCell>{field.FieldLength}</TableCell>
                                        <TableCell>{field.FieldDescription}</TableCell>
                                        </TableRow>
                                    ))}
                                    </TableBody>
                                </Table>
                                </div>
                            </div>
                            )}
                        </ScrollArea>
                        </DialogContent>
                    </Dialog>
                </TabsContent>
            </Tabs>
        </div>
    )
}