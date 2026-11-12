# AutoQuestionCam PWA — 100% trên iPhone

## Triển khai chỉ với Safari

1. Tạo tài khoản GitHub tại github.com và Vercel tại vercel.com. Tạo repository GitHub mới (ví dụ `autoquestioncam`).
2. Giải nén ZIP trong ứng dụng Tệp (Files) trên iPhone. Trên GitHub (Safari → Yêu cầu trang web cho máy tính nếu cần), tạo/upload các file theo đúng cấu trúc. Giữ nguyên thư mục `api` và `public` ở gốc repo. GitHub trên điện thoại có thể yêu cầu upload từng file hoặc dùng giao diện web IDE (github.dev); nếu upload folder bị giới hạn, tạo file thủ công bằng Add file → Create new file với tên có dấu `/`.
3. Trên Vercel chọn Add New → Project → Import Git Repository, chọn repository. Framework Preset: Other; Root Directory: `./`; không đặt build command. Deploy.
4. Vercel → Project → Settings → Environment Variables: tạo `OPENAI_API_KEY` với API key OpenAI của bạn. Tuỳ chọn `OPENAI_MODEL` = `gpt-4.1-mini`. **Không bao giờ** ghi API key vào GitHub hay mã JavaScript phía trình duyệt.
5. Redeploy sau khi thêm biến môi trường. Mở URL `https://...vercel.app` bằng Safari trên iPhone, bấm **Bắt đầu**, cấp quyền camera.
6. Safari → Chia sẻ → Thêm vào Màn hình chính để mở như ứng dụng.

## Lưu ý
- Đây là PWA, không phải app SwiftUI native. Cần internet, HTTPS, tài khoản Vercel và OpenAI API có thanh toán riêng.
- Gửi ảnh JPEG giảm kích thước (~320 px chiều rộng) lên API khi camera ổn định; quét tối đa khoảng 1 lần/4,5 giây. Chữ nhỏ có thể bị mất nét; tăng kích thước canvas trong `public/app.js` nếu cần.
- Không gửi video liên tục; chỉ gửi các ảnh lấy mẫu. Không lưu câu hỏi trên server theo thiết kế này, nhưng dữ liệu ảnh vẫn được chuyển đến OpenAI để xử lý theo chính sách dịch vụ.
- Để tránh phát sinh chi phí ngoài ý muốn, đặt giới hạn ngân sách OpenAI API và cân nhắc bảo vệ endpoint khỏi người lạ: mặc định URL công khai có thể bị gọi bởi bên thứ ba. Trước khi dùng rộng rãi, cần thêm đăng nhập, giới hạn tốc độ ở server, quota và chống lạm dụng.
- AI có thể trả lời sai. Không sử dụng trong các kỳ thi hoặc hoạt động không cho phép hỗ trợ AI.
- Nếu camera không hoạt động trong chế độ màn hình chính, thử mở lại bằng Safari.
