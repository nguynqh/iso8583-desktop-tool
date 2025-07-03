import React from "react";

import type { models } from "../../wailsjs/go/models";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { AlertTriangle, CheckCircle, Info, XCircle } from "lucide-react";
import { Alert, AlertDescription } from "./ui/alert";
import { Badge } from "./ui/badge";



export const ParsedMessageTable = ({ message } : { message: models.ParsedMessage }) => {
    return (
        <div className="space-y-4">
            {/* Message Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="p-4">
                    <div className="flex items-center space-x-2">
                        <Info className="h-4 w-4 text-blue-500" />
                        <div>
                            <div className="text-sm font-medium">Mã loại thông điệp</div>
                            <div className="text-lg font-mono">{message.mti}</div>
                        </div>
                    </div>
                </Card>

                <Card className="p-4">
                    <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                        <div>
                            <div className="text-sm font-medium">Kiểu thông điệp</div>
                            <div className="text-lg">
                                {
                                    message.format === "Simple"
                                    ? "Cơ bản" :
                                    message.format === "JSON"
                                    ? "JSON" : "Chưa xác định"
                                }
                            </div>
                        </div>
                    </div>
                </Card>

                <Card className="p-4">
                    <div className="flex items-center space-x-2">
                        {message.errorCount > 0 ? (
                            <XCircle className="h-4 w-4 text-red-500" />
                        ) : (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                        )}
                        <div>
                            <div className="text-sm font-medium">Trạng thái</div>
                            <div className={`text-lg font-semibold ${message.errorCount > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                {message.errorCount > 0 ? `${message.errorCount} Lỗi` : 'Hợp lệ'}
                            </div>
                        </div>
                    </div>
                </Card>  
            </div>

            {/* Error Summary */}
            {message.errorCount > 0 && (
                <Alert className="border-red-200 bg-red-50">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-red-800">
                        Tìm thấy {message.errorCount} lỗi {message.errorCount > 1 ? 'sai' : ''} trong thông điệp này. Kiểm tra chi tiết các trường dữ liệu bên dưới.
                    </AlertDescription>
                </Alert>
            )}

            {/* Fields Table */}

            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-base font-semibold flex items-center gap-2">
                        Chi tiết các trường dữ liệu
                        <Badge variant="outline" className="text-xs">
                            {message.fields.length} trường dữ liệu
                        </Badge>
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="max-h-96 overflow-y-auto space-y-2 p-4">
                        {message.fields.map((field, index) => (
                            <div 
                                key={index} 
                                className={`
                                    p-4 rounded-lg border transition-all duration-200 hover:shadow-sm
                                    ${!field.isValid ? 'border-red-200 bg-red-50' : 'border-gray-200 bg-white hover:bg-gray-50'}
                                `}
                            >
                                {/* Header Row */}
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <Badge variant="outline" className="text-xs px-2 py-1">
                                            F{field.id}
                                        </Badge>
                                        <span className="font-medium text-sm truncate max-w-48" title={field.name}>
                                            {field.name}
                                        </span>
                                    </div>
                                    
                                    <div className="flex items-center gap-2">
                                        {field.isValid ? (
                                            <Badge className="bg-green-100 text-green-700 text-xs px-2 py-1">
                                                <CheckCircle className="w-3 h-3 mr-1" />
                                                Hợp lệ
                                            </Badge>
                                        ) : (
                                            <Badge className="bg-red-100 text-red-700 text-xs px-2 py-1">
                                                <XCircle className="w-3 h-3 mr-1" />
                                                Lỗi
                                            </Badge>
                                        )}
                                    </div>
                                </div>

                                {/* Content Row */}
                                <div className="space-y-2">
                                    {/* Value */}
                                    <div className="bg-gray-100 px-3 py-2 rounded text-sm font-mono break-all">
                                        {field.value}
                                    </div>
                                    
                                    {/* Meta Info */}
                                    <div className="flex flex-wrap gap-4 text-xs text-gray-600">
                                        <div className="flex items-center gap-1">
                                            <span className="font-medium">Kiểu:</span>
                                            <Badge variant="outline" className="text-xs">
                                                {field.fieldType}
                                            </Badge>
                                        </div>
                                        
                                        <div className="flex items-center gap-1">
                                            <span className="font-medium">Độ dài:</span>
                                            <span className={`font-mono ${field.maxLength && field.actualLength > field.maxLength ? 'text-red-600 font-semibold' : ''}`}>
                                                {field.actualLength}
                                                {field.maxLength && <span className="text-gray-400">/{field.maxLength}</span>}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Error Message */}
                                    {field.error && (
                                        <div className="text-xs text-red-600 bg-red-100 px-3 py-2 rounded border-l-2 border-red-400">
                                            <AlertTriangle className="w-3 h-3 inline mr-1" />
                                            {field.error}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>


            {/* <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-base font-semibold flex items-center gap-2">
                        Field Details
                        <Badge variant="outline" className="text-xs">
                            {message.fields.length} fields
                        </Badge>
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="max-h-96 overflow-y-auto">
                        <Table>
                            <TableHeader className="sticky top-0 bg-white z-10">
                                <TableRow className="border-b">
                                    <TableHead className="w-16 text-center">ID</TableHead>
                                    <TableHead className="min-w-32">Field Name</TableHead>
                                    <TableHead className="min-w-32">Value</TableHead>
                                    <TableHead className="w-20 text-center">Type</TableHead>
                                    <TableHead className="w-20 text-center">Length</TableHead>
                                    <TableHead className="w-24 text-center">Status</TableHead>
                                    <TableHead className="min-w-32">Error</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {message.fields.map((field, index) => (
                                    <TableRow 
                                        key={index} 
                                        className={`
                                            transition-colors hover:bg-gray-50
                                            ${!field.isValid ? 'bg-red-50/50 border-l-2 border-l-red-400' : ''}
                                        `}
                                    >
                                        <TableCell className="text-center font-mono text-sm font-medium">
                                            {field.id}
                                        </TableCell>
                                        
                                        <TableCell className="font-medium max-w-48">
                                            <div className="truncate" title={field.name}>
                                                {field.name}
                                            </div>
                                        </TableCell>
                                        
                                        <TableCell className="font-mono text-sm max-w-64">
                                            <div className="truncate bg-gray-100 px-2 py-1 rounded text-xs" title={field.value}>
                                                {field.value}
                                            </div>
                                        </TableCell>
                                        
                                        <TableCell className="text-center">
                                            <Badge variant="outline" className="text-xs">
                                                {field.fieldType}
                                            </Badge>
                                        </TableCell>
                                        
                                        <TableCell className="text-center font-mono text-sm">
                                            <span className={field.maxLength && field.actualLength > field.maxLength ? 'text-red-600 font-semibold' : ''}>
                                                {field.actualLength}
                                            </span>
                                            {field.maxLength && (
                                                <span className="text-gray-400">/{field.maxLength}</span>
                                            )}
                                        </TableCell>
                                        
                                        <TableCell className="text-center">
                                            {field.isValid ? (
                                                <Badge className="bg-green-100 text-green-700 hover:bg-green-200">
                                                    <CheckCircle className="w-3 h-3 mr-1" />
                                                    Valid
                                                </Badge>
                                            ) : (
                                                <Badge className="bg-red-100 text-red-700 hover:bg-red-200">
                                                    <XCircle className="w-3 h-3 mr-1" />
                                                    Invalid
                                                </Badge>
                                            )}
                                        </TableCell>
                                        
                                        <TableCell className="max-w-64">
                                            {field.error && (
                                                <div className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded border-l-2 border-red-400">
                                                    {field.error}
                                                </div>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card> */}


            {/* <Card className="text-sm break-all font-mono bg-gray-50 rounded border max-h-96 overflow-y-auto">
                <CardHeader>
                    <CardTitle className="space-y-1">
                        <div className="text-lg font-semibold">Kết quả phân tích:</div>
                        <div className="text-xs text-gray-500 font-normal flex space-x-5">
                            <div>MTI:{message.mti}</div>
                            <div>Format:{message.format}</div>
                            <div>Error Count:{message.errorCount}</div>
                        </div>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                        <Table className="w-full">
                            <TableHeader>
                                <TableRow className="break-keep">
                                    <TableHead>Field ID</TableHead>
                                    <TableHead>Tên Field</TableHead>
                                    <TableHead>Giá trị</TableHead>
                                    <TableHead>Loại</TableHead>
                                    <TableHead>Độ dài</TableHead>
                                    <TableHead>Trạng thái</TableHead>
                                    <TableHead>Ghi chú</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {message.fields.map((field, index) => (
                                    <TableRow key={index} className="hover:bg-gray-100 items-center">
                                        <TableCell className="break-keep">{field.id}</TableCell>
                                        <TableCell className="break-keep">{field.name}</TableCell>
                                        <TableCell>{field.value}</TableCell>
                                        <TableCell className="break-keep">{field.fieldType}</TableCell>
                                        <TableCell className="break-keep">{field.actualLength}</TableCell>
                                        <TableCell className="break-keep">{field.isValid ? "Hợp lệ" : "Không hợp lệ"}</TableCell>
                                        <TableCell className="break-keep">{field.error}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                </CardContent>
            </Card> */}
        </div>
    )
}