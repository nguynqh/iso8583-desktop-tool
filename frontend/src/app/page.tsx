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
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ParsingExplanation } from "@/components/ParsingExplanation"
import { ValidationGuide } from "@/components/ValidationGuide"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"


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
    Info,
//   Download,
//   CheckCircle,
} from "lucide-react"

import { toast } from "@/hooks/use-toast"
import { UserGuideDialog } from "@/components/user-guide-dialog"

import { ParsedMessage} from "@/types/iso8583";
import { MessageTable } from "@/components/MessageTable";

// import from backend
import { 
    ParseMultipleMessages,
    GetSampleMessages,
    GetTemplateName,
    GetTemplateStats,
    ParseMessage,
    ParseLog,
 } from "../../wailsjs/go/main/App"

interface ParsedFielddddd {
  id: string
  name: string
  value: string
  type: string
  length: number
  status: "valid" | "invalid" | "warning"
  notes?: string
}

export default function ISO8583Parser() {

    const fileInputRef = useRef<HTMLInputElement>(null)
    const handleButtonClick = () => {
        fileInputRef.current?.click()
    }

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
    const [templateName, setTemplateName] = useState<string>('');
    const [templateStats, setTemplateStats] = useState<any>(null);
    const [showExplanation, setShowExplanation] = useState(false);
    const [showValidationGuide, setShowValidationGuide] = useState(false);

    useEffect(() => {
        Promise.all([
            GetTemplateName(),
            GetTemplateStats(),
        ]).then(([name, stats]) => {
            setTemplateName(name);
            setTemplateStats(stats);
        }).catch(console.error);
    }, []);

    const handleParseSampleMessages = async () => {
        setLoading(true);
        setError('');
        
        try {
        const sampleMessages = await GetSampleMessages();
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
        'MTI=0100,F2:4532123456789012,F3:000000,F4:000000010000,F11:123456'
        );
        
        if (!customMessage) return;

        setLoading(true);
        setError('');
        
        try {
        const result = await ParseMessage(customMessage);
        setMessages([result]);
        } catch (err) {
        setError(`Parse error: ${err}`);
        console.error('Parse error:', err);
        } finally {
        setLoading(false);
        }
    };

    const getOverallValidationStatus = () => {
        if (messages.length === 0) return null;
        
        const validMessages = messages.filter(m => m.isValid).length;
        const totalMessages = messages.length;
        const percentage = (validMessages / totalMessages) * 100;
        
        return {
            valid: validMessages,
            total: totalMessages,
            percentage: percentage
        };
    };

    const overallStatus = getOverallValidationStatus();

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
{/* --------------------------------------------------------------------------------------------------- */}
                        {/* Template Info */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                            <div className="flex items-center justify-between">
                            <div>
                                <h3 className="font-medium text-blue-900">Template Information</h3>
                                <p className="text-blue-700 text-sm">
                                Using: <span className="font-medium">{templateName}</span>
                                {templateStats && (
                                    <span className="ml-2">
                                    • {templateStats.totalFields} fields defined
                                    • Types: {Object.entries(templateStats.fieldTypes).map(([type, count]) => 
                                        `${type}(${count})`
                                    ).join(', ')}
                                    </span>
                                )}
                                </p>
                            </div>
                            <div className="flex space-x-2">
                                <button
                                onClick={() => setShowExplanation(!showExplanation)}
                                className="text-blue-600 hover:text-blue-800 text-sm underline"
                                >
                                How Parsing Works
                                </button>
                                <button
                                onClick={() => setShowValidationGuide(!showValidationGuide)}
                                className="text-blue-600 hover:text-blue-800 text-sm underline"
                                >
                                Validation Rules
                                </button>
                            </div>
                            </div>
                        </div>

                        {/* Overall Status */}
                        {overallStatus && (
                            <div className="bg-white border rounded-lg p-4 mb-4">
                            <h3 className="font-medium text-gray-800 mb-2">Overall Validation Status</h3>
                            <div className="flex items-center space-x-4">
                                <div className="flex items-center">
                                <span className={`text-2xl mr-2 ${overallStatus.percentage === 100 ? 'text-green-500' : 'text-red-500'}`}>
                                    {overallStatus.percentage === 100 ? '✅' : '❌'}
                                </span>
                                <span className="text-lg font-medium">
                                    {overallStatus.valid}/{overallStatus.total} messages valid 
                                    ({overallStatus.percentage.toFixed(1)}%)
                                </span>
                                </div>
                            </div>
                            </div>
                        )}

                        {/* Explanation */}
                        {/* Explanation Panels */}
                        {showExplanation && <ParsingExplanation onClose={() => setShowExplanation(false)} />}
                        {showValidationGuide && <ValidationGuide onClose={() => setShowValidationGuide(false)} />}

                        {/* Controls */}
                        <div className="mb-6 space-x-4">
                        <button
                            onClick={handleParseSampleMessages}
                            disabled={loading}
                            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                        >
                            {loading ? 'Parsing...' : 'Parse Sample Messages'}
                        </button>
                        
                        <button
                            onClick={handleParseCustomMessage}
                            disabled={loading}
                            className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                        >
                            Parse Custom Message
                        </button>
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
                            <p className="text-blue-700">Parsing messages with validation...</p>
                        </div>
                        )}

                        {/* Results */}
                        {messages.length > 0 && (
                        <div>
                            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
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
                            <div className="text-6xl mb-4">💳</div>
                            <p className="text-gray-500 text-lg mb-2">
                            Ready to parse ISO8583 messages
                            </p>
                            <p className="text-gray-400">
                            Click "Parse Sample Messages" to see the parser and validator in action
                            </p>
                        </div>
                        )}

{/* ----------------------------------------------------------------------------------------------------------- */}

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
