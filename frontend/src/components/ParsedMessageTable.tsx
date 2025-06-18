import React from "react";

import type { models } from "../../wailsjs/go/models";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";



export const ParsedMessageTable = ({ message } : { message: models.ParsedMessage }) => {
    return (
        <>
            <Card className="text-sm break-all font-mono bg-gray-50 rounded border max-h-96 overflow-y-auto">
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
                    {/* <div className="rounded-md border"> */}
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
                                {/* {message.fields.length} */}
                                {message.fields.map((field, index) => (
                                    <TableRow key={index} className="hover:bg-gray-100 items-center">
                                        <TableCell className="break-keep">{field.id}</TableCell>
                                        <TableCell className="break-keep">{field.name}</TableCell>
                                        <TableCell>{field.value}</TableCell>
                                        <TableCell className="break-keep">{field.fieldType}</TableCell>
                                        <TableCell className="break-keep">{field.actualLength}</TableCell>
                                        <TableCell className="break-keep">{field.isValid ? "Hợp lệ" : "Không hợp lệ"}</TableCell>
                                        <TableCell className="break-keep">{field.error}</TableCell>
                                        {/* <td>{field.name}</td>
                                        <td>{field.value}</td>
                                        <td className="w-20">{field.fieldType}</td>
                                        <td className="w-20">{field.actualLength}</td>
                                        <td className="w-24">{field.isValid}</td>
                                        <td>{field.error}</td> */}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    {/* </div> */}
                </CardContent>
            </Card>
        </>
    )
}