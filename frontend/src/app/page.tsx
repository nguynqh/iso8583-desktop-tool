"use client";

import React, { useEffect, useRef } from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"


import {
    Download,
    FileText,
    Settings,
    Upload,
    Copy,
    Play,
    Trash2,
    Info,
    Filter,
} from "lucide-react"

import { toast } from "@/hooks/use-toast"
import { UserGuideDialog } from "@/components/user-guide-dialog"

// import from backend
import { FilterLog, ParseAndValidateMessage, ParseJsonMessage, ParseSimpleMessage } from "../../wailsjs/go/main/App"
import { main, models } from "../../wailsjs/go/models";
import { ParsedMessageTable } from "@/components/ParsedMessageTable";
import { log } from "console";

export default function ISO8583Parser() {

    const fileInputRef = useRef<HTMLInputElement>(null)
    const handleButtonClick = () => {
        fileInputRef.current?.click()
    }

    // create type from BE
    const [filterdLog, setFilteredLog] = useState<main.Message[]>([])
    const [parsedMessage, setParsedMessage] = useState<models.ParsedMessage[]>([])
    
    const [inputLog, setInputLog] = useState("")
    const [isProcessing, setIsProcessing] = useState(false)
    const [showTextarea, setShowTextarea] = useState(false);
    const [userGuideOpen, setUserGuideOpen] = useState(false)
    const [validationResults, setValidationResults] = useState<{
        isValid: boolean
        errors: string[]
        warnings: string[]
    }>({ isValid: true, errors: [], warnings: [] })

    const [expandedItems, setExpandedItems] = useState(new Set());
    const toggleExpanded = (index: unknown) => {
        const newExpanded = new Set(expandedItems);
        if (newExpanded.has(index)) {
            newExpanded.delete(index);
        } else {
            newExpanded.add(index);
        }
        setExpandedItems(newExpanded);
    };

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

    const handleParseLog = async() => {
        if (!inputLog.trim()) {
        toast({
            title: "Lỗi",
            description: "Vui lòng nhập log cần phân tích",
            variant: "destructive",
        })
        return
        }

        setIsProcessing(true)

        try {
            const logArr = await FilterLog(inputLog)
            setFilteredLog( logArr )

            const parseResults = await Promise.all(
                logArr.map(msg => 
                    ParseAndValidateMessage(msg.content).catch(err => {console.error("Error parsing message:", err); return null; })
                )
            )


            toast({
                title: "Hoàn thành",
                description: "Đã phân tích log thành công",
            });
        }
        catch (error) {}
        
        setIsProcessing(false)
    }

// test---------------------
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>('');



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
                                <CardDescription>Định nghĩa field và cài đặt</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label htmlFor="field-config">Định nghĩa Field</Label>
                                    <div className="mt-2">
                                        <input ref={fileInputRef} type="file" accept=".json" className="" onChange={handleFileUpload} />
                                        <Button variant="outline" size="sm" className="w-full" onClick={handleButtonClick}>
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
                                        disabled={filterdLog.length === 0}
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
                                        disabled={filterdLog.length === 0}
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
                                <div className="flex items-center justify-between">
                                <div className="flex-1">
                                    <CardTitle>Nhập Log ISO 8583</CardTitle>
                                    <CardDescription>Nhập log cần phân tích thông qua các cách sau</CardDescription>
                                </div>
                                <div className="ml-4 flex items-center gap-1">
                                    <Select defaultValue="default">
                                        <SelectTrigger className="w-40">
                                            <SelectValue placeholder="Chọn template" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="default">Default template</SelectItem>
                                            <SelectItem value="custom">Custom template</SelectItem>
                                            <SelectItem value="advanced">Advanced template</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 w-8 p-0 hover:bg-gray-100"
                                        onClick={() => {
                                            alert("Chức năng này chưa được triển khai---Template Info")
                                        }}
                                        >
                                        <Info className="h-4 w-4" />
                                    </Button>
                                </div>
                                </div>
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
                                            onClick={async () => {
                                                const text = await navigator.clipboard.readText()
                                                setInputLog(text)
                                                setShowTextarea(true)
                                                toast({
                                                title: "Thành công",
                                                description: "Đã dán nội dung từ clipboard",
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
                                    setFilteredLog([])
                                    setValidationResults({ isValid: true, errors: [], warnings: [] })
                                    }}
                                >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Xóa
                                </Button>
                                </div>
                            </CardContent>
                        </Card> 

                        {/* Error Display */}
                        {error && (
                        <div className="mb-6 p-4 bg-red-100 border border-red-300 rounded-lg">
                            <p className="text-red-700 font-medium">Lỗi:</p>
                            <p className="text-red-600">{error}</p>
                        </div>
                        )}

                        {/* Loading State */}
                        {loading && (
                        <div className="mb-6 p-4 bg-blue-100 border border-blue-300 rounded-lg">
                            <p className="text-blue-700">Đang phân tích thông Log và kiểm tra tính hợp lệ của thông điệp...</p>
                        </div>
                        )}


                        {/* Parsered field */}
                        {filterdLog.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Kết quả phân tích</CardTitle>
                                    <CardDescription>
                                        Hiển thị {filterdLog.length} message ISO8583 đã được tách từ log
                                        <br />
                                        {/* {openIdx !== null && (
                                            <span className="text-blue-500">Đang mở message {openIdx + 1}</span>
                                        )} */}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {filterdLog.map((field: main.Message, idx) => (
                                                <div key={idx} className="p-3 bg-gray-50 rounded-md shadow-sm">
                                                    <div>
                                                        {filterdLog.length > 1 && (
                                                            <div className="text-base text-gray-500 mb-1 flex">
                                                                Message {idx + 1}: 
                                                                <div className="text-red-400 pl-2">
                                                                    {field.description}
                                                                </div>
                                                            </div>   
                                                        )}
                                                    </div>
                                                    {/*clickable */}
                                                    <div className="p-2 cursor-pointer hover:bg-gray-100 transition-colors duration-200 flex items-center justify-between" onClick={() => toggleExpanded(idx)}>
                                                        <div className="text-sm text-gray-700 font-medium break-words relative overflow-hidden"
                                                            style={{ maxHeight: '1.5rem', lineHeight: '1.5rem' }}
                                                        >
                                                            {field.content}
                                                            <div className="absolute bottom-0 right-0 w-20 h-full bg-gradient-to-l from-gray-50 to-transparent pointer-events-none"></div>
                                                        </div>
                                                        {/* Status indicator */}
                                                        <Button
                                                            className={`
                                                                ml-2 text-xs flex items-center gap-1 px-2 py-0.5 rounded-xl font-semibold
                                                                transition-colors duration-150 focus:outline-none
                                                                ${expandedItems.has(idx)
                                                                ? "text-[#14b8a6] bg-[#a7f3d0]"
                                                                : "text-[#6366f1] bg-[#e0e7ff]"}
                                                            `}
                                                            onClick={() => toggleExpanded(idx)}
                                                            tabIndex={0}
                                                        >
                                                            {expandedItems.has(idx) ? 'Thu gọn' : 'Mở rộng'}
                                                            <div className={`w-2 px-1.5 h-2 rounded-full ${
                                                                expandedItems.has(idx) ? 'bg-[#38bdf8]' : 'bg-[#d1d5db]'
                                                            }`}>
                                                            </div>
                                                        </Button>
                                                    </div>
                                                    {/* Expandable content*/}
                                                    <div className={`overflow-hidden transition-all duration-400 ease-in-out ${
                                                        expandedItems.has(idx) ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                                                    }`}>
                                                        <div className="px-1 pb-4 border-t border-gray-200 bg-white">
                                                            <div className="pt-4 space-y-4">
                                                                <div className="text-sm text-gray-700 break-all font-mono bg-gray-50 p-3 rounded border max-h-32 overflow-y-auto">
                                                                    <div>{field.content}</div>
                                                                </div>
                                                            </div>
                                                            {parsedMessage.map((msg, idx) => (
                                                                console.log("Parsed message:", msg),
                                                                print(),
                                                                <ParsedMessageTable key={idx} message={msg}/>
                                                            ))}
                                                        </div>
                                                    </div>
                                                    
                                                    {/* <div className="text-sm text-gray-700 break-words">
                                                        {field}
                                                    </div> */}
                                                </div>
                                            ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>


            <UserGuideDialog open={userGuideOpen} onOpenChange={setUserGuideOpen} />
        </div>
    )
}
