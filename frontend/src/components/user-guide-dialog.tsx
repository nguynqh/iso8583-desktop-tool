"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  FileText,
  Upload,
  Play,
  Settings,
  Download,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Keyboard,
  HelpCircle,
} from "lucide-react"

interface UserGuideDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function UserGuideDialog({ open, onOpenChange }: UserGuideDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Hướng dẫn sử dụng</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Tổng quan</TabsTrigger>
            <TabsTrigger value="input">Nhập log</TabsTrigger>
            <TabsTrigger value="analysis">Phân tích</TabsTrigger>
            <TabsTrigger value="settings">Cấu hình</TabsTrigger>
            <TabsTrigger value="shortcuts">Phím tắt</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HelpCircle className="h-5 w-5" />
                  Giới thiệu ứng dụng
                </CardTitle>
                <CardDescription>
                  ISO 8583 Message Parser là công cụ chuyên dụng để phân tích và kiểm tra tính hợp lệ của các thông điệp
                  ISO 8583
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Chức năng chính:</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Phân tích (Parse) các log chứa thông điệp ISO 8583
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Kiểm tra tính hợp lệ (Validate) theo cấu trúc tiêu chuẩn
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Hiển thị rõ ràng các trường dữ liệu trong message
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Hỗ trợ nhiều cách nhập liệu linh hoạt
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Xuất kết quả dưới nhiều định dạng
                    </li>
                  </ul>
                </div>

                <Separator />

                <div>
                  <h4 className="font-semibold mb-2">Quy trình sử dụng:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                    <div className="text-center p-3 border rounded-lg">
                      <Upload className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                      <div className="font-medium">1. Nhập log</div>
                      <div className="text-gray-600">Gõ tay, tải file hoặc dán</div>
                    </div>
                    <div className="text-center p-3 border rounded-lg">
                      <Play className="h-8 w-8 mx-auto mb-2 text-green-500" />
                      <div className="font-medium">2. Phân tích</div>
                      <div className="text-gray-600">Parse message ISO 8583</div>
                    </div>
                    <div className="text-center p-3 border rounded-lg">
                      <FileText className="h-8 w-8 mx-auto mb-2 text-purple-500" />
                      <div className="font-medium">3. Xem kết quả</div>
                      <div className="text-gray-600">Kiểm tra các field</div>
                    </div>
                    <div className="text-center p-3 border rounded-lg">
                      <Download className="h-8 w-8 mx-auto mb-2 text-orange-500" />
                      <div className="font-medium">4. Xuất file</div>
                      <div className="text-gray-600">JSON, Excel, CSV</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Input Tab */}
          <TabsContent value="input" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Cách nhập log ISO 8583</CardTitle>
                <CardDescription>Ứng dụng hỗ trợ 3 cách nhập log khác nhau</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Badge variant="outline">1</Badge>
                    Nhập thủ công
                  </h4>
                  <ul className="space-y-2 text-sm ml-6">
                    <li>• Chọn tab "Nhập thủ công"</li>
                    <li>• Gõ hoặc dán log vào ô văn bản</li>
                    <li>• Hỗ trợ log dạng hex string hoặc raw data</li>
                    <li>• Có thể nhập nhiều dòng log cùng lúc</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Badge variant="outline">2</Badge>
                    Tải file log
                  </h4>
                  <ul className="space-y-2 text-sm ml-6">
                    <li>• Chọn tab "Tải file"</li>
                    <li>• Hỗ trợ file .txt, .log</li>
                    <li>• Kích thước file tối đa: 1MB (có thể cấu hình)</li>
                    <li>• Tự động đọc nội dung file sau khi chọn</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Badge variant="outline">3</Badge>
                    Từ clipboard
                  </h4>
                  <ul className="space-y-2 text-sm ml-6">
                    <li>• Chọn tab "Từ clipboard"</li>
                    <li>• Copy log từ nguồn khác</li>
                    <li>• Bấm nút "Dán từ clipboard"</li>
                    <li>• Hoặc sử dụng phím tắt Ctrl + V</li>
                  </ul>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h5 className="font-medium text-blue-900 mb-2">💡 Mẹo sử dụng:</h5>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Log có thể chứa khoảng trắng, sẽ được tự động loại bỏ</li>
                    <li>• Hỗ trợ cả định dạng uppercase và lowercase</li>
                    <li>• Có thể nhập log từng phần, ứng dụng sẽ ghép lại</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analysis Tab */}
          <TabsContent value="analysis" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Phân tích và kiểm tra log</CardTitle>
                <CardDescription>Hiểu về quá trình parse và validate message</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-semibold mb-3">Quá trình phân tích:</h4>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <Badge variant="outline" className="mt-1">
                        1
                      </Badge>
                      <div>
                        <div className="font-medium">Parse Message Type Indicator (MTI)</div>
                        <div className="text-sm text-gray-600">Xác định loại thông điệp (0200, 0210, 0420, ...)</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Badge variant="outline" className="mt-1">
                        2
                      </Badge>
                      <div>
                        <div className="font-medium">Phân tích Bitmap</div>
                        <div className="text-sm text-gray-600">Xác định các field có mặt trong message</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Badge variant="outline" className="mt-1">
                        3
                      </Badge>
                      <div>
                        <div className="font-medium">Extract các field</div>
                        <div className="text-sm text-gray-600">
                          Tách từng field theo định nghĩa độ dài và kiểu dữ liệu
                        </div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Badge variant="outline" className="mt-1">
                        4
                      </Badge>
                      <div>
                        <div className="font-medium">Validate dữ liệu</div>
                        <div className="text-sm text-gray-600">Kiểm tra tính hợp lệ theo chuẩn ISO 8583</div>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="font-semibold mb-3">Hiểu kết quả phân tích:</h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <div>
                        <span className="font-medium text-green-700">Hợp lệ:</span>
                        <span className="text-sm text-gray-600 ml-2">Field đúng định dạng và độ dài</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="h-5 w-5 text-yellow-500" />
                      <div>
                        <span className="font-medium text-yellow-700">Cảnh báo:</span>
                        <span className="text-sm text-gray-600 ml-2">Field hợp lệ nhưng có giá trị bất thường</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <XCircle className="h-5 w-5 text-red-500" />
                      <div>
                        <span className="font-medium text-red-700">Lỗi:</span>
                        <span className="text-sm text-gray-600 ml-2">Field không hợp lệ hoặc thiếu dữ liệu</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h5 className="font-medium text-yellow-900 mb-2">⚠️ Lưu ý quan trọng:</h5>
                  <ul className="text-sm text-yellow-800 space-y-1">
                    <li>• Kết quả phân tích phụ thuộc vào file định nghĩa field</li>
                    <li>• Có thể cấu hình lại định nghĩa field trong phần Cấu hình</li>
                    <li>• Message không hợp lệ vẫn có thể được phân tích một phần</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Hướng dẫn cấu hình</CardTitle>
                <CardDescription>Tùy chỉnh ứng dụng theo nhu cầu sử dụng</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Cài đặt ứng dụng
                  </h4>
                  <div className="space-y-3 ml-6">
                    <div>
                      <div className="font-medium">Ngôn ngữ giao diện</div>
                      <div className="text-sm text-gray-600">Chọn Tiếng Việt hoặc English</div>
                    </div>
                    <div>
                      <div className="font-medium">Giao diện (Theme)</div>
                      <div className="text-sm text-gray-600">Chế độ sáng, tối hoặc theo hệ thống</div>
                    </div>
                    <div>
                      <div className="font-medium">Kích thước file tối đa</div>
                      <div className="text-sm text-gray-600">Giới hạn kích thước file log có thể tải lên</div>
                    </div>
                    <div>
                      <div className="font-medium">Định dạng xuất mặc định</div>
                      <div className="text-sm text-gray-600">JSON, Excel hoặc CSV</div>
                    </div>
                    <div>
                      <div className="font-medium">Tự động lưu</div>
                      <div className="text-sm text-gray-600">Tự động lưu kết quả sau khi phân tích</div>
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="font-semibold mb-3">Định nghĩa Field</h4>
                  <div className="space-y-3 ml-6">
                    <div>
                      <div className="font-medium">Quản lý danh sách field</div>
                      <div className="text-sm text-gray-600">Thêm, sửa, xóa các field definition</div>
                    </div>
                    <div>
                      <div className="font-medium">Thuộc tính field</div>
                      <div className="text-sm text-gray-600">
                        ID, tên, loại dữ liệu (n/an/ans/b), độ dài min/max, bắt buộc
                      </div>
                    </div>
                    <div>
                      <div className="font-medium">Import/Export định nghĩa</div>
                      <div className="text-sm text-gray-600">Tải lên file JSON hoặc xuất cấu hình hiện tại</div>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <h5 className="font-medium text-green-900 mb-2">✅ Mẹo cấu hình:</h5>
                  <ul className="text-sm text-green-800 space-y-1">
                    <li>• Backup cấu hình trước khi thay đổi lớn</li>
                    <li>• Test với log mẫu sau khi cập nhật field definition</li>
                    <li>• Sử dụng mô tả field để ghi chú ý nghĩa</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Shortcuts Tab */}
          <TabsContent value="shortcuts" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Keyboard className="h-5 w-5" />
                  Phím tắt
                </CardTitle>
                <CardDescription>Các phím tắt để thao tác nhanh hơn</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3">Thao tác chung</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Dán log từ clipboard</span>
                        <Badge variant="outline">Ctrl + V</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Phân tích log</span>
                        <Badge variant="outline">Ctrl + Enter</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Lưu kết quả</span>
                        <Badge variant="outline">Ctrl + S</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Mở cấu hình</span>
                        <Badge variant="outline">Ctrl + ,</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Mở hướng dẫn</span>
                        <Badge variant="outline">F1</Badge>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-3">Thao tác với bảng</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Tìm kiếm field</span>
                        <Badge variant="outline">Ctrl + F</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Copy giá trị field</span>
                        <Badge variant="outline">Ctrl + C</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Xuất JSON</span>
                        <Badge variant="outline">Ctrl + J</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Xuất Excel</span>
                        <Badge variant="outline">Ctrl + E</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Làm mới</span>
                        <Badge variant="outline">F5</Badge>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator className="my-6" />

                <div>
                  <h4 className="font-semibold mb-3">Phím tắt trong cấu hình</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Thêm field mới</span>
                        <Badge variant="outline">Ctrl + N</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Lưu thay đổi</span>
                        <Badge variant="outline">Ctrl + S</Badge>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Hủy thay đổi</span>
                        <Badge variant="outline">Esc</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Đóng dialog</span>
                        <Badge variant="outline">Ctrl + W</Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
