import React from "react";

import type { models } from "../../wailsjs/go/models";
import { Card, CardContent } from "./ui/card";
import { Table } from "lucide-react";
import { TableHead, TableHeader, TableRow } from "./ui/table";

interface Props {
    message: models.ParsedMessage;
}

export const ParsedMessageTable: React.FC<Props> = ( message ) => {
    return (
        <Card>
            <CardContent>
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-16">Field ID</TableHead>
                                <TableHead>Tên Field</TableHead>
                                <TableHead>Giá trị</TableHead>
                                <TableHead className="w-20">Loại</TableHead>
                                <TableHead className="w-20">Độ dài</TableHead>
                                <TableHead className="w-24">Trạng thái</TableHead>
                                <TableHead>Ghi chú</TableHead>
                            </TableRow>
                        </TableHeader>
                    </Table>
                </div>
            </CardContent>
        </Card>
    )
}