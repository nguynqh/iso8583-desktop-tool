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
import { useTemplate } from "@/hooks/use-template";
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from '@/components/ui/badge';


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
    ChevronUp,
    ChevronDown
} from "lucide-react"
import Link from "next/link"

import { toast } from "@/components/ui/use-toast"
import { UserGuideDialog } from "@/components/user-guide-dialog"


// import from backend
import { FilterLog, ParseAndValidateMessage, ParseJsonMessage, ParseSimpleMessage, ListTemplateFiles } from "../../wailsjs/go/main/App"
import { main, models, loader } from "../../wailsjs/go/models";
import { ParsedMessageTable } from "@/components/ParsedMessageTable";
import { SettingsDialog } from "@/components/settings-dialog";
import { ViewTemplateDetail } from "@/components/view-tamplate-detail";
import { get } from "http";
import { set } from "date-fns";
import { group } from "console";

export default function ISO8583Parser() {

    const [adTemplates, setAdTemplates] = useState<loader.TemplateFile[]>([]);
    const [selectedTemplate, setSelectedTemplate] = useState<string>("");
    const [selectedGroup, setSelectedGroup] = useState(0);
    const [selectedMTI, setSelectedMTI] = useState<string | null>(null);

    const handleSelectAdvancedTemplate = async (open: boolean) => {
        if (open) {
            try {
                var rs = await ListTemplateFiles();
                setAdTemplates(rs);
            } catch (error) {
                toast({
                    title: "Lỗi",
                    description: "Xảy ra lỗi khi load các templates"
                })
            }
        }
    }

    //upload file
    const [selectedFile, setSelectedFile] = useState<File | null>()
    const fileInputRef = useRef<HTMLInputElement>(null)
    const handleButtonClick = () => {
        fileInputRef.current?.click()
    }

    // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    const handleTemplateFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (file) {
            setSelectedFile(file)
            const reader = new FileReader()
            reader.onload = (e) => {
                try {
                    const jsonData = JSON.parse(e.target?.result as string)
                    ParseJsonMessage(jsonData).then((res) => {
                        toast({
                            title: "Thành công",
                            description: "Đã tải lên và phân tích template thành công",
                        })
                    }).catch((err) => {
                        console.error("Error parsing JSON:", err);
                        toast({
                            title: "Lỗi",
                            description: "Không thể phân tích template. Vui lòng kiểm tra định dạng JSON.",
                            variant: "destructive",
                        })
                    })
                } catch (error) {
                    console.error("Error reading file:", error);
                    toast({
                        title: "Lỗi",
                        description: "Không thể đọc file. Vui lòng kiểm tra định dạng JSON.",
                        variant: "destructive",
                    })
                }
            }
            reader.readAsText(file)
        }
    }
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

    // create type from BE
    const [filterdLog, setFilteredLog] = useState<main.Message[]>([])
    const [parsedMessage, setParsedMessage] = useState<models.ParsedMessage[]>([])
    
    // select teamplate and view template data
    const { templates, loading: templatesLoading, error: templatesError } = useTemplate();
    const [templateViewOpen, setTemplateViewOpen] = useState(false)
    const getSelectedTemplateData = () => {
        if (!selectedTemplate) return null;
        
        const template = templates.find(t => t.fileName === selectedTemplate);
        
        if (!template) {
            console.warn(`Template not found: ${selectedTemplate}.json`);
            return null;
        }
        
        return template.data;
    }

    // advanced template select for validation
    const [templateForAdvancedValidation, setTemplateForAdvancedValidation] = useState<any[]>([]);
    const [checked, setChecked] = useState(false);
    const messageGroups = [
        {
            mti: '0200',
            channel: 'CSBIST',
            pcode: '010000',
            description: 'Authorization Request'
        },
        {
            mti: '0210',
            channel: 'CSBIST',
            pcode: '010000',
            description: 'Authorization Response'
        },
        {
            mti: '0400',
            channel: 'CSBIST',
            pcode: '010000',
            description: 'Reversal Request'
        }
    ];
    // const [selectedGroupIndex, setSelectedGroupIndex] = useState(0);

    const testClick = () => {
        try {
            fetch("/templates/502010.json")
            .then(response => response.json())
            .then((data) => setTemplateForAdvancedValidation(data))

            toast({
                title: "Thông báo",
                description: "Đã tải template cho kiểm tra nâng cao thành công",
            })

        } catch (error) {
            console.error("Error loading template for advanced validation:", error);
            toast({
                title: "Lỗi",
                description: "Không thể tải template cho kiểm tra nâng cao. Vui lòng thử lại sau.",
                variant: "destructive",
            })
        }
    }


    const [inputLog, setInputLog] = useState("")
    const [isProcessing, setIsProcessing] = useState(false)
    const [showTextarea, setShowTextarea] = useState(false);
    const [userGuideOpen, setUserGuideOpen] = useState(false)
    const [settingsOpen, setSettingsOpen] = useState(false)
    const [validationResults, setValidationResults] = useState<{
        isValid: boolean
        errors: string[]
        warnings: string[]
    }>({ isValid: true, errors: [], warnings: [] })

    // View detail item filtered from log
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

    const handleParseLog = async() => {
        if (!inputLog.trim()) {
        toast({
            title: "Lỗi",
            description: "Vui lòng nhập log cần phân tích",
            variant: "destructive",
        })
        return
        }

        // Check minimum length
        if (inputLog.trim().length < 10) {
            toast({
                title: "Lỗi", 
                description: "Log quá ngắn, vui lòng nhập log ISO8583 hợp lệ",
                variant: "destructive",
            })
            return
        }

        setIsProcessing(true)

        setFilteredLog([])
        setParsedMessage([])

        try {
            const logArr = await FilterLog(inputLog)

            //  Check if logArr is null or not an array
            if (!logArr) {
                throw new Error("FilterLog returned null")
            }
            
            if (!Array.isArray(logArr)) {
                throw new Error("FilterLog returned non-array result")
            }
            
            if (logArr.length === 0) {
                toast({
                    title: "Thông báo",
                    description: "Không tìm thấy thông điệp ISO8583 trong log. Vui lòng kiểm tra định dạng.",
                    variant: "destructive",
                })
                setIsProcessing(false)
                return
            }

            setFilteredLog( logArr )

            const parseResults = await Promise.all(
                logArr.map(msg => 
                    ParseAndValidateMessage(msg.content).catch(err => {console.error("Error parsing message:", err); return null; })
                )
            )

            setParsedMessage(parseResults.filter(msg => msg !== null) as models.ParsedMessage[])

            toast({
                title: "Hoàn thành",
                description: "Đã phân tích log thành công",
            });
        }
        catch (error) {

        }
        
        setIsProcessing(false)
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
                            <Link href="/schema-analyzer">
                                <Button variant="outline" size="sm">
                                    Phân tích theo yêu cầu
                                </Button>
                            </Link>
                            <Button variant="outline" size="sm" onClick={() => 
                                setSettingsOpen(true)
                                // alert("Chức năng này chưa được triển khai---Settings")
                                }>
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
                                        <input ref={fileInputRef} type="file" accept=".json" className="hidden" onChange={handleTemplateFileUpload} />
                                        <Button variant="outline" size="sm" className="w-full" onClick={handleButtonClick}>
                                            <Upload className="h-4 w-4 mr-2" />
                                            Tải lên JSON
                                        </Button>
                                        {}
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
                                    <CardDescription className="pt-1">Nhập log cần phân tích thông qua các cách sau</CardDescription>
                                </div>
                                <div className="ml-4 flex items-center gap-1">
                                    Schema đang sử dụng: ISO8583 (128 fields)
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 w-8 p-0 hover:bg-gray-100"
                                        onClick={() => {
                                            setTemplateViewOpen(true)
                                            // data = getSelectedTemplateData();
                                        }}
                                        disabled={!selectedTemplate}
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
                                    <Separator className="my-2" />
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
                                            <div className="flex flex-col gap-1 border">
                                                <Label htmlFor="template-check" className="text-sm font-semibold">Template kiểm tra</Label>
                                                {templatesLoading ? (
                                                    <div className="text-sm text-gray-500">Loading templates...</div>
                                                ) : templatesError ? (
                                                    <div className="text-sm text-red-500">Error: {templatesError}</div>
                                                ) : (
                                                    <>
                                                        <div className="flex items-center">
                                                            <Select value={selectedTemplate} onValueChange={setSelectedTemplate} onOpenChange={handleSelectAdvancedTemplate}>
                                                                <SelectTrigger>
                                                                    <SelectValue placeholder="Chọn template" />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    {adTemplates && adTemplates.length > 0 ? (
                                                                        adTemplates.map((template) => (
                                                                            <SelectItem key={template.name} value={template.name}>
                                                                                {template.name.replace(".json", "")}
                                                                            </SelectItem>
                                                                        ))
                                                                    ) : (
                                                                        <SelectItem value="no-loaded-template" disabled>
                                                                            Không có template nào
                                                                        </SelectItem>
                                                                    )}
                                                                </SelectContent>
                                                            </Select>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="h-8 w-8 p-0 hover:bg-gray-100"
                                                                onClick={() => {
                                                                    setTemplateViewOpen(true)
                                                                }}
                                                                disabled={!selectedTemplate}
                                                                >
                                                                <Info className="h-4 w-4" />
                                                            </Button>
                                                        </div>

                                                        {/* sumary data template */}
                                                        {selectedTemplate && (() => {
                                                            const data = getSelectedTemplateData();
                                                            // const mtiList = data?.map((item: any) => `mti=${item.MTI}`).join(', ') || '';
                                                            const mtiList = data?.map((item:any) => `MTI=${item.MTI}`).join(', ')

                                                            const mtiListt = adTemplates.length
                                                            if (!data || data.length === 0) return null;

                                                            return (
                                                                <>
                                                                    <div className="ml-3 mt-1 mb-1 text-xs text-gray-600">
                                                                        <span className="font-medium">
                                                                            Có tổng {data.length} nhóm: {mtiListt}
                                                                        </span>
                                                                    </div>
                                                                
                                                                    <div className="flex items-center gap-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                                                                        <Label className="text-sm font-medium text-blue-700">
                                                                            Cụm thông điệp:
                                                                        </Label>
                                                                        <Select 
                                                                            value={selectedMTI || ""}
                                                                            onValueChange={setSelectedMTI}
                                                                        >
                                                                            <SelectTrigger className="w-auto min-w-[250px] bg-white">
                                                                                <SelectValue placeholder="Chọn MTI để xem" />
                                                                            </SelectTrigger>
                                                                            <SelectContent>
                                                                                {data?.map((item: any, idx: any) => (
                                                                                    <SelectItem key={idx} value={idx.toString()}>
                                                                                    MTI = {item.MTI}
                                                                                    </SelectItem>
                                                                                ))}
                                                                            </SelectContent>
                                                                        </Select>
                                                                    </div>

                                                                    {/* Show detail group selected */}
                                                                    {selectedMTI !== null && (() => {
                                                                        const currentData = data[Number(selectedMTI)];
                                                                        return (
                                                                            <div className="grid grid-cols-3 gap-4 p-3 bg-gray-50 rounded-lg">
                                                                                <div className="text-center">
                                                                                    <div className="font-medium text-blue-700">Kênh xử lý</div>
                                                                                    <div className="text-sm">{currentData.Channel}</div>
                                                                                </div>
                                                                                <div className="text-center">
                                                                                    <div className="font-medium text-green-700">MTI</div>
                                                                                    <div className="text-sm">{currentData.MTI}</div>
                                                                                </div>
                                                                                <div className="text-center">
                                                                                    <div className="font-medium text-purple-700">PCODE</div>
                                                                                    <div className="text-sm">
                                                                                        {selectedTemplate.replace(".json", "") || 'N/A'}
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        );
                                                                    })()}
                                                                </>
                                                            );
                                                        })()}



                                                        {/* {groupIdx && (() => {
                                                            const data = getSelectedTemplateData();
                                                            const group = data?.map((item:any) => item.Channel)[groupIdx];
                                                            return (
                                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 items-center">
                                                                    <div className="flex flex-col gap-2">
                                                                        <Label htmlFor="filter-channel" className="text-sm">Kênh xử lý</Label>
                                                                        <Input
                                                                            id="filter-channel"
                                                                            type="text"
                                                                            className="w-full"
                                                                            value={group.Channel || ""}
                                                                            readOnly
                                                                            placeholder="Kênh xử lý (ví dụ: CSBIST)"
                                                                        />
                                                                    </div>
                                                                </div>
                                                            )
                                                        })} */}
                                                    </>
                                                )}
                                            </div>


                                            {/* {selectedTemplate && (
                                                

                                            
                                                {selectedGroup && (
                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 items-center">
                                                        <div className="flex flex-col gap-2">
                                                            <Label htmlFor="filter-channel" className="text-sm">Kênh xử lý</Label>
                                                            <Input
                                                                id="filter-channel"
                                                                type="text"
                                                                className="w-full"
                                                                value=""
                                                                readOnly
                                                                placeholder="Nhập kênh xử lý (ví dụ: CSBIST)"
                                                            />
                                                        </div>
                                                        <div className="flex flex-col gap-2">
                                                            <Label htmlFor="filter-mti" className="text-sm">MTI</Label>
                                                            <Input
                                                                id="filter-mti"
                                                                type="text"
                                                                className="w-full"
                                                                readOnly
                                                                placeholder="MTI (ví dụ: 0200, 0210, 0400)"
                                                            />
                                                        </div>
                                                        <div className="flex flex-col gap-2">
                                                            <Label htmlFor="filter-pcode" className="text-sm">PCODE</Label>
                                                            <Input
                                                                id="filter-pcode"
                                                                type="text"
                                                                className="w-full"
                                                                readOnly
                                                                placeholder="PCODE (ví dụ: 010000)"
                                                            />
                                                        </div>
                                                    </div>
                                                )}
                                            )} */}
                                        </div> 
                                    </div>
                                    <Separator className="my-2" />
                                    {/* Tab content */}
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
                                            onClick={ async() => {
                                                setShowTextarea(true)
                                            }}
                                            onChange={handleFileUpload}
                                            className="mt-2"
                                        />
                                        {showTextarea && <Textarea 
                                            id="log-input"
                                            placeholder="Log ISO 8583 được dán vào đây..."
                                            value={inputLog}
                                            onChange={(e) => setInputLog(e.target.value)}
                                            className="min-h-[120px] mt-2"
                                        />}
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
                                <Button onClick={
                                    () => {
                                        handleParseLog()
                                        testClick()
                                    }
                                    } disabled={isProcessing || !inputLog.trim()} className="flex-1">
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
                                    // setValidationResults({ isValid: true, errors: [], warnings: [] })
                                    }}
                                >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Xóa
                                </Button>
                                </div>
                            </CardContent>
                        </Card> 

                        {/* Error Display */}
                        {/* {error && (
                        <div className="mb-6 p-4 bg-red-100 border border-red-300 rounded-lg">
                            <p className="text-red-700 font-medium">Lỗi:</p>
                            <p className="text-red-600">{error}</p>
                        </div>
                        )} */}

                        {/* Loading State */}
                        {/* {loading && (
                        <div className="mb-6 p-4 bg-blue-100 border border-blue-300 rounded-lg">
                            <p className="text-blue-700">Đang phân tích thông Log và kiểm tra tính hợp lệ của thông điệp...</p>
                        </div>
                        )} */}


                        {/* Parsered field */}
                        {filterdLog.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Kết quả phân tích</CardTitle>
                                    <CardDescription>
                                        Hiển thị {filterdLog.length} thông điệp ISO8583 đã được tách từ log
                                        <br />
                                        {/* {openIdx !== null && (
                                            <span className="text-blue-500">Đang mở message {openIdx + 1}</span>
                                        )} */}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {parsedMessage.map((parsedMess, idx) => { 
                                            const statusConfig = parsedMess.errorCount > 0 
                                            ? {
                                                bg: 'bg-red-50 border-red-200',
                                                accent: 'border-l-4 border-l-red-500',
                                                badge: 'bg-red-100 text-red-700 border-red-200',
                                                gradient: 'from-red-50 to-transparent'
                                            }
                                            : {
                                                bg: 'bg-emerald-50 border-emerald-200',
                                                accent: 'border-l-4 border-l-emerald-500',
                                                badge: 'bg-emerald-100 text-emerald-700 border-emerald-200',
                                                gradient: 'from-emerald-50 to-transparent'
                                            };

                                            const isError = parsedMess.errorCount > 0;

                                            return (
                                            <div key={idx} className={ `p-4 rounded-lg border shadow-sm transition-all duration-200 hover:shadow-md ${statusConfig.bg} ${statusConfig.accent}` }>
                                                {/* Message header info */}
                                                <div>
                                                    {filterdLog.length > 1 && (
                                                        <div className="text-sm text-gray-600 mb-2 flex items-center gap-2">
                                                            <span className="font-medium">Thông điệp {idx + 1}</span>
                                                            <div className="flex-1 h-px bg-gray-200"></div>
                                                            <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                                                                {filterdLog[idx].description}
                                                            </span>
                                                        </div>   
                                                    )}
                                                </div>
                                                {/*clickable */}
                                                <div className="cursor-pointer hover:bg-black/5 rounded-md transition-colors duration-200 flex items-center justify-between p-3 relative group" onClick={() => toggleExpanded(idx)}>
                                                    <div className="text-sm text-gray-700 font-mono break-words relative overflow-hidden flex-1"
                                                        style={{ maxHeight: '1.5rem', lineHeight: '1.5rem' }}
                                                    >
                                                        {filterdLog[idx].content}
                                                        <div className={`absolute bottom-0 right-0 w-20 h-full bg-gradient-to-l ${statusConfig.gradient} group-hover:opacity-5 transition-opacity duration-200 pointer-events-none`}></div>
                                                    </div>
                                                    {/* Status indicator */}
                                                    <div className="ml-4 flex items-center gap-2">
                                                        <span className={`text-xs px-3 py-1 rounded-full font-medium border ${statusConfig.badge}`}>
                                                            {parsedMess.errorCount > 0 ? `${parsedMess.errorCount} Lỗi` : 'Hợp lệ'}
                                                        </span>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-8 px-3 text-xs"
                                                            onClick={() => toggleExpanded(idx)}
                                                        >
                                                            {expandedItems.has(idx) ? (
                                                                <>Thu gọn <ChevronUp className="w-3 h-3 ml-1" /></>
                                                            ) : (
                                                                <>Mở rộng <ChevronDown className="w-3 h-3 ml-1" /></>
                                                            )}
                                                        </Button>
                                                    </div>
                                                </div>
                                                {/* Expandable content*/}
                                                <div className={`overflow-hidden transition-all duration-400 ease-in-out ${
                                                    expandedItems.has(idx) ? 'max-h-fit opacity-100' : 'max-h-0 opacity-0'
                                                }`}>
                                                    <div className="pt-4 space-y-4">
                                                        <ParsedMessageTable message={parsedMess} />
                                                    </div>
                                                </div>
                                            </div>
                                        )})}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>

            <ViewTemplateDetail open={templateViewOpen} onOpenChange={setTemplateViewOpen} data={getSelectedTemplateData()} name={selectedTemplate}/>
            <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
            <UserGuideDialog open={userGuideOpen} onOpenChange={setUserGuideOpen} />
        </div>
    )
}
