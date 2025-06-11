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
import { Alert, AlertDescription } from "@/components/ui/alert"


import {
    Download,
    FileText,
    Settings,
    Upload,
    Copy,
    Play,
    Trash2,
    AlertTriangle,
    XCircle,
//   Download,
//   CheckCircle,
} from "lucide-react"

import { toast } from "@/hooks/use-toast"
import { UserGuideDialog } from "@/components/user-guide-dialog"
import { set } from "date-fns";

import { ParsedMessage } from "@/types/iso8583";
import { MessageTable } from "@/components/MessageTable";

// import from backend
import { ParseLog } from "../../wailsjs/go/main/App"
import { ParseMultipleMessages } from '../../wailsjs/go/main/App';

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

    const [parsedFields, setParsedFields] = useState<string[]>([])
    const [inputLog, setInputLog] = useState("")
    const [isProcessing, setIsProcessing] = useState(false)
    const [showTextarea, setShowTextarea] = useState(false);
    const [userGuideOpen, setUserGuideOpen] = useState(false)
    const [validationResults, setValidationResults] = useState<{
        isValid: boolean
        errors: string[]
        warnings: string[]
    }>({ isValid: true, errors: [], warnings: [] })


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
            setParsedFields( await ParseLog(inputLog) )
            toast({
                title: "Hoàn thành",
                description: "Đã phân tích log thành công",
            });
        }
        catch (error) {}
        
        setIsProcessing(false)
    }

// test---------------------
    const [messages, setMessages] = useState<ParsedMessage[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>('');

    const handleParseSampleMessages = async () => {
        setLoading(true);
        setError('');
        
        try {
        // Get sample messages from backend
        const sampleMessages = await ParseLog(inputLog);
        const results = await ParseMultipleMessages(sampleMessages);
        setMessages(results);
        } catch (err) {
        setError(`Parse error: ${err}`);
        console.error('Parse error:', err);
        } finally {
        setLoading(false);
        }
    };

    const handleParseCustomMessage = async () => {
        const customMessage = prompt(
        'Enter ISO8583 message (format: MTI=0200,F2:value,F3:value...):',
        'MTI=0200,F2:123456789,F3:000000,F4:000001000000'
        );
        
        if (!customMessage) return;

        setLoading(true);
        setError('');
        
        try {
        const results = await ParseMultipleMessages([customMessage]);
        setMessages(results);
        } catch (err) {
        setError(`Parse error: ${err}`);
        console.error('Parse error:', err);
        } finally {
        setLoading(false);
        }
    };


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
                                {/* <div className="flex">
                                    <Button className="relative inline-flex w-44 " onClick={handleGreet}>Test function call from Go</Button>
                                    <span className=" pl-10 inline-flex items-center justify-center text-sm text-gray-500" onChange={updateName}>
                                        {greetValue}
                                    </span>
                                </div> */}
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
                                    setValidationResults({ isValid: true, errors: [], warnings: [] })
                                    }}
                                >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Xóa
                                </Button>
                                </div>
                            </CardContent>
                        </Card>
                        
                        {/* Sample Test */}
                        <div className="mb-6 space-x-4">
                            <Button
                                onClick={handleParseSampleMessages}
                                disabled={loading}
                                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                            >
                                {loading ? 'Parsing...' : 'Parse Sample Messages'}
                            </Button>
                            <Button
                                onClick={handleParseCustomMessage}
                                disabled={loading}
                                className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                            >
                                Parse Custom Message
                            </Button>
                        </div>


                        {/* Error Display */}
                        {error && (
                        <div className="mb-6 p-4 bg-red-100 border border-red-300 rounded-lg">
                            <p className="text-red-700 font-medium">Error:</p>
                            <p className="text-red-600">{error}</p>
                        </div>
                        )}

                        {/* Loading State */}
                        {loading && (
                        <div className="mb-6 p-4 bg-blue-100 border border-blue-300 rounded-lg">
                            <p className="text-blue-700">Parsing messages...</p>
                        </div>
                        )}

                        {/* Results */}
                        {messages.length > 0 && (
                        <div>
                            <h2 className="text-xl font-semibold text-gray-800 mb-4">
                            Parsed Messages ({messages.length})
                            </h2>
                            
                            {messages.map((message, index) => (
                            <MessageTable 
                                key={index} 
                                message={message} 
                                messageIndex={index}
                            />
                            ))}
                        </div>
                        )}

                        {/* Empty State */}
                        {!loading && messages.length === 0 && !error && (
                        <div className="text-center py-12">
                            <p className="text-gray-500 text-lg">
                            Click "Parse Sample Messages" to get started
                            </p>
                        </div>
                        )}

                        {/* Results */}
                            {/* Validation result */}
                        {(validationResults.errors.length > 0 || validationResults.warnings.length > 0) && (
                            <div className="space-y-2">
                                {validationResults.errors.map((error, index) => (
                                <Alert key={`error-${index}`} variant="destructive">
                                    <XCircle className="h-4 w-4" />
                                    <AlertDescription>{error}</AlertDescription>
                                </Alert>
                                ))}

                                {validationResults.warnings.map((warning, index) => (
                                <Alert key={`warning-${index}`}>
                                    <AlertTriangle className="h-4 w-4" />
                                    <AlertDescription>{warning}</AlertDescription>
                                </Alert>
                                ))}
                            </div>
                        )}

                            {/* Parsered field */}
                        {parsedFields.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Kết quả phân tích</CardTitle>
                                    <CardDescription>
                                        Hiển thị {parsedFields.length} message ISO8583 đã được tách từ log
                                        <br />
                                        {/* {openIdx !== null && (
                                            <span className="text-blue-500">Đang mở message {openIdx + 1}</span>
                                        )} */}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {parsedFields.map((field, idx) => (
                                            // const splitFields = processLogLine(field);
                                            // return (
                                            //     <div key={field} className="p-4 bg-gray-50 rounded-md shadow-sm">
                                            //         {parsedFields.length > 1 && (
                                            //             <div className="text-sm text-gray-500 mb-2">
                                            //                 Message {idx + 1}
                                            //             </div>
                                            //         )}
                                            //         <div className="text-sm text-gray-700 break-words">
                                            //             <span className="ml-2">{splitFields[0]}</span>
                                            //             {/* <div className="whitespace-pre-line">{splitFields[1]}</div> */}
                                            //         </div>
                                            //     </div>
                                            // );
                                                <div key={idx} className="p-4 bg-gray-50 rounded-md shadow-sm">
                                                    {parsedFields.length > 1 && (
                                                        <div className="text-sm text-gray-500 mb-2">
                                                            Message {idx + 1}
                                                        </div>   
                                                    )}
                                                    <div className="text-sm text-gray-700 break-words">{field}</div>
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
