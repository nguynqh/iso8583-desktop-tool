"use client";

import React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";


import {
    Download,
    FileText,
    Settings,
    Upload,
//   Download,
//   Play,
//   CheckCircle,
//   XCircle,
//   AlertTriangle,
//   Copy,
//   Trash2,
} from "lucide-react"
import { Separator } from "@/components/ui/separator";


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
                                alert("Chức năng này chưa được triển khai")}>
                                <Settings className="h-4 w-4 mr-2" />
                                Cấu hình
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => 
                                // setUserGuideOpen(true)
                                alert("Chức năng này chưa được triển khai")}>
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
                                            alert("Chức năng này chưa được triển khai")
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
                                            alert("Chức năng này chưa được triển khai")
                                        }
                                        disabled={parsedFields.length === 0}
                                        >
                                            <Download className="h-4 w-4 mr-2" />
                                            Xuất Excel
                                        </Button>
                                    </div>
                                    </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    )
}
