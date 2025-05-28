"use client";

import React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
// import { Badge } from "@/components/ui/badge"
// import { Alert, AlertDescription } from "@/components/ui/alert"


import {
    Download,
    FileText,
    Settings,
    Upload,
    Copy,
    Play,
    Trash2,
//   Download,
//   CheckCircle,
//   XCircle,
//   AlertTriangle,
} from "lucide-react"

import { toast } from "@/hooks/use-toast"
// import { set } from "date-fns";
// import { SettingsDialog } from "@/components/settings-dialog"
import { UserGuideDialog } from "@/components/user-guide-dialog"


interface ParsedField {
  id: string
  name: string
  value: string
  type: string
  length: number
  status: "valid" | "invalid" | "warning"
  notes?: string
}


export default function ISO8583Parser() {

    const [parsedFields, setParsedFields] = useState<ParsedField[]>([])
    const [inputLog, setInputLog] = useState("")
    const [isProcessing, setIsProcessing] = useState(false)
    const [showTextarea, setShowTextarea] = useState(false);
    const [userGuideOpen, setUserGuideOpen] = useState(false)

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (file) {
        const reader = new FileReader()
        reader.onload = (e) => {
            setInputLog(e.target?.result as string)
        }
        reader.readAsText(file)
        }
    }

    const handleParseLog = () => {
        if (!inputLog.trim()) {
        toast({
            title: "Lỗi",
            description: "Vui lòng nhập log cần phân tích",
            variant: "destructive",
        })
        return
        }

        setIsProcessing(true)

        // Simulate processing
        setTimeout(() => {
        // Call logic to parse the log here
        //!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
        setIsProcessing(false)
        toast({
            title: "Hoàn thành",
            description: "Đã phân tích log thành công",
        })
        }, 2000)
    }



    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b">
                <div className="container mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl front-bold text-gray-900">ISO 8583 Message Parser</h1>
                            <p className="text-gray-600">Công cụ phân tích và kiểm tra log ISO 8583</p>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => 
                                // setSettingsOpen(true)}>
                                alert("Chức năng này chưa được triển khai---Settings")}>
                                <Settings className="h-4 w-4 mr-2" />
                                Cấu hình
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => 
                                setUserGuideOpen(true)
                                }>
                                <FileText className="h-4 w-4 mr-2" />
                                Hướng dẫn
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Body */}
            <div className="container mx-auto pax-6 py-6">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Sidebar */}
                    <div className="lg:col-span-1">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Cấu hình</CardTitle>
                                <CardDescription>Quản lý định nghĩa field và cài đặt</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label htmlFor="field-config">File định nghĩa Field</Label>
                                    <div className="mt-2">
                                        <Input id="field-config" type="file" accept=".json" className="mb-2" />
                                        <Button variant="outline" size="sm" className="w-full">
                                            <Upload className="h-4 w-4 mr-2" />
                                            Tải lên JSON
                                        </Button>
                                    </div>
                                </div>

                                <Separator />

                                <div>
                                    <Label>Xuất kết quả</Label>
                                    <div className="mt-2 space-y-2">
                                        <Button
                                        variant="outline"
                                        size="sm"
                                        className="w-full"
                                        onClick={() => 
                                            // handleExport("json")
                                            alert("Chức năng này chưa được triển khai---Export JSON")
                                        }
                                        disabled={parsedFields.length === 0}
                                        >
                                            <Download className="h-4 w-4 mr-2" />
                                            Xuất JSON
                                        </Button>
                                        <Button
                                        variant="outline"
                                        size="sm"
                                        className="w-full"
                                        onClick={() => 
                                            // handleExport("excel")
                                            alert("Chức năng này chưa được triển khai---Export Excel")
                                        }
                                        disabled={parsedFields.length === 0}
                                        >
                                            <Download className="h-4 w-4 mr-2" />
                                            Xuất Excel
                                        </Button>
                                    </div>
                                </div>

                                <Separator />

                                <div>
                                    <Label>Thao tác nhanh</Label>
                                    <div className="mt-2 text-sm text-gray-600 space-y-1">
                                        <div>Ctrl + V: Dán log</div>
                                        <div>Ctrl + Enter: Phân tích</div>
                                        <div>Ctrl + S: Lưu kết quả</div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-3 space-y-6">
                        {/* Input */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Nhập Log ISO 8583</CardTitle>
                                <Button className="relative inline-flex w-44">Test function call from Go</Button>
                                <CardDescription>Nhập log cần phân tích thông qua các cách sau</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Tabs defaultValue="manual" className="w-full">
                                    <TabsList className="grid w-full grid-cols-3">
                                        <TabsTrigger value="manual">Nhập thủ công</TabsTrigger>
                                        <TabsTrigger value="file">Tải file</TabsTrigger>
                                        <TabsTrigger value="clipboard">Từ clipboard</TabsTrigger>
                                    </TabsList>

                                    <TabsContent value="manual" className="space-y-4">
                                        <div>
                                        <Label htmlFor="log-input">Nội dung log</Label>
                                        <Textarea
                                            id="log-input"
                                            placeholder="Nhập hoặc dán log ISO 8583 vào đây..."
                                            value={inputLog}
                                            onChange={(e) => setInputLog(e.target.value)}
                                            className="min-h-[120px] mt-2"
                                        />
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="file" className="space-y-4">
                                        <div>
                                        <Label htmlFor="file-upload">Chọn file log</Label>
                                        <Input
                                            id="file-upload"
                                            type="file"
                                            accept=".txt,.log"
                                            onChange={handleFileUpload}
                                            className="mt-2"
                                        />
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="clipboard" className="space-y-4">
                                        <div className="text-center py-8">
                                        <Button
                                            variant="outline"
                                            onClick={() => {
                                            navigator.clipboard.readText().then((text) => {
                                                setInputLog(text)
                                                setShowTextarea(true)
                                                toast({
                                                title: "Thành công",
                                                description: "Đã dán nội dung từ clipboard",
                                                })
                                            })
                                            }}
                                        >
                                            <Copy className="h-4 w-4 mr-2" />
                                            Dán từ clipboard
                                        </Button>
                                        {showTextarea && <Textarea 
                                            id="log-input"
                                            placeholder="Log ISO 8583 được dán vào đây..."
                                            value={inputLog}
                                            onChange={(e) => setInputLog(e.target.value)}
                                            className="min-h-[120px] mt-2"
                                        />}
                                        </div>
                                    </TabsContent>
                                </Tabs>

                                <div className="flex gap-2 mt-4">
                                <Button onClick={handleParseLog} disabled={isProcessing || !inputLog.trim()} className="flex-1">
                                    {isProcessing ? (
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
                                    setInputLog("")
                                    setShowTextarea(false)
                                    setParsedFields([])
                                    // setValidationResults({ isValid: true, errors: [], warnings: [] })
                                    }}
                                >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Xóa
                                </Button>
                                </div>
                            </CardContent>
                            </Card>
                    </div>
                </div>
            </div>
            <UserGuideDialog open={userGuideOpen} onOpenChange={setUserGuideOpen} />
        </div>
    )
}
