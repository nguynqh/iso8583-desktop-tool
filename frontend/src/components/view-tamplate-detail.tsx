"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";


interface UserGuideDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    data?: any;
    name?: string;
}

export function ViewTemplateDetail({ open, onOpenChange, data, name }: UserGuideDialogProps) {
    const jsonContent = data ? JSON.stringify(data, null, 2) : "No data available";
    
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Nội dung của template: {name} đang sử dụng</DialogTitle>
                </DialogHeader>
                <Card>
                    <CardContent className="p-0">
                        <div>
                            <div className="p-4">
                                <pre>
                                    <code>
                                        {jsonContent}
                                    </code>
                                </pre>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </DialogContent>
        </Dialog>
    );
}