# Pharos Season of AI — khảo sát và 3 task đã triển khai

Kiểm tra ngày **13/10/2026**, múi giờ Việt Nam. Báo cáo phân biệt thông báo người dùng cung cấp, trang chính thức kiểm tra trực tiếp, kết quả chạy và phần chưa xác minh.

## Cuộc thi hoạt động thế nào?

Đây là chương trình developer làm các bài thực hành với Chain MCP, Developer Docs MCP và SkillEngine. [Arena](https://pharos-agent-arena.vercel.app/) hiện có 28 task, tổng 3.200 điểm cơ bản trên bảng. Bài được reviewer duyệt mới nhận điểm; thiếu yêu cầu có thể chỉ được điểm một phần.

| Hạng mục | Điểm |
|---|---:|
| Easy | 50/task |
| Medium | 100/task |
| Hard | 200/task |
| Video walkthrough | Có thể thêm 50/submission, do reviewer duyệt |

Theo thông báo bạn cung cấp, quỹ thưởng là **5.000 PROS** dành cho những người đứng đầu leaderboard; video phải chia sẻ trên mạng xã hội. Đây là quỹ chung, không phải mức thưởng đảm bảo cho mỗi người. Chưa xác minh được số người nhận, cách chia, ngày khóa điểm, thời điểm trả thưởng hay điều kiện KYC/khu vực.

[Blog chính thức](https://www.pharos.xyz/blog/introducing-pharos-season-of-ai-build-for-the-agentic-economy) bị chặn khi truy xuất trong lần kiểm tra này. Không lấy việc mở được Arena làm bằng chứng rằng mọi điều khoản trong bài blog đã được xác nhận.

## Điểm và rank đang có mâu thuẫn

Các mốc hiển thị là Contributor 300, Builder 1.200, Advocate 2.200.

- Thông báo bạn gửi: rank dựa trên base points, video chỉ cộng leaderboard.
- [Leaderboard hiện tại](https://pharos-agent-arena.vercel.app/leaderboard): ghi rank dựa trên total; total gồm approved task points, video và bonus points.

Cần Pharos xác nhận quy tắc có hiệu lực. Với 3 bài Easy, chỉ nên tính **150 điểm cơ bản tiềm năng**. Nếu có 3 video hợp lệ, tổng leaderboard có thể là 300; không khẳng định sẽ lên Contributor khi quy tắc rank chưa thống nhất. Hiện chưa có bài nào trong bộ này được nộp hay duyệt.

Tại lần chụp trang, leaderboard hiển thị 0 builder và 0 điểm đã trao. Đây chỉ là trạng thái giao diện lúc kiểm tra, không có nghĩa là không có người đăng ký hoặc đang làm bài.

## Đăng ký và nộp bài

[Form đăng ký](https://forms.gle/ySBomVEAcwRQSCFe7) đang hiển thị các trường: email, Telegram, Discord, kinh nghiệm AI agent/blockchain, GitHub, từng build trên Pharos chưa, link build cũ nếu có, dự định làm gì, và xác nhận đã tham gia nhóm Telegram của builders. Chưa gửi form và không tự điền tài khoản liên hệ.

Các trang task yêu cầu đăng nhập GitHub để nộp và theo dõi điểm. Phần hướng dẫn công khai yêu cầu proof link reviewer mở được (share link ai.pharos.xyz, explorer hoặc demo), repo link nếu có code, video tùy chọn. Chưa kiểm tra các field chỉ xuất hiện sau đăng nhập.

Ba bài đã được đóng gói chung một repo, nhưng có README, bằng chứng và nội dung riêng để nộp cho từng task. Trước khi nộp cần đưa mã nguồn/bằng chứng lên địa chỉ công khai reviewer truy cập được. Tx hash trong bài monitor thuộc giao dịch công khai được quan sát, **không phải giao dịch do người dự thi tạo ra**.

## Workshop

[Lịch chính thức](https://pharos-agent-arena.vercel.app/workshops) hiển thị 11 buổi, chủ yếu thứ Tư và thứ Sáu lúc **13:00 UTC = 20:00 giờ Việt Nam**:

| Ngày 2026 | Nội dung |
|---|---|
| 09/10 | Kick-Off Call (đã qua) |
| 14/10 | Understanding Pharos Upgrade: An Agent-Native L1 |
| 16/10 | Exploring ai.pharos.xyz |
| 21/10 | Pharos Agent Account & KYA |
| 23/10 | Building with Pharos Chain MCP |
| 28/10 | Programmable Gas & the Agent Payment Plane |
| 30/10 | Working with Pharos Developer Docs MCP |
| 04/11 | Risk Controls & State Economy |
| 06/11 | Getting Started with Pharos SkillEngine |
| 11/11 | Exploring AEA |
| 13/11 | PharosPort & Harbor |

Lịch workshop không phải deadline nộp bài. Một [nguồn bổ sung](https://airdrops.io/pharos/) ghi mùa kết thúc 12/11/2026, trong khi lịch workshop chính thức kéo đến 13/11. Chưa đủ cơ sở chốt hạn nộp; cần xem thông báo chính thức cập nhật.

## Vì sao chọn 3 bài này?

Các bài Easy hiện có: Read Contract State, Event/Log Monitor, Docs MCP Onboarding, Doc-Search CLI, On-Chain Alert Bot, dApp Support Agent.

Chọn Read Contract State, Event/Log Monitor và Doc-Search CLI vì tiêu chí cụ thể, không cần ký giao dịch, có thể kiểm chứng bằng MCP chính thức. Không chọn onboarding vì bài đó yêu cầu ghi nhận ít nhất 3 lỗi/gap có thật và chỉ dùng Docs MCP trong quá trình onboarding; không nên tạo lỗi giả để đủ số lượng. Alert Bot và dApp Support Agent cần thêm logic cảnh báo/chẩn đoán.

### 1. Read Contract State — 50 điểm

[Yêu cầu](https://pharos-agent-arena.vercel.app/tasks/read-contract-state): ít nhất 3 giá trị của một hợp đồng qua Chain MCP; địa chỉ và block; định dạng dễ đọc; README có cách chạy và output.

Đã làm: đọc `name`, `symbol`, `decimals`, `totalSupply` của USDC Pacific mainnet. Mọi `eth_call` dùng cùng block tag; amount dùng integer chính xác, không chuyển qua số thực. Chọn địa chỉ từ [registry chính thức](https://docs.pharos.xyz/getting-started/token-registry).

Kết quả cuối: block **20147121**, chain **1672**, totalSupply **17255330.463491 USDC**, decimals **6**. Đây là snapshot tại thời điểm chạy, không phải số liệu được cam kết giữ nguyên.

### 2. Event/Log Monitor — 50 điểm

[Yêu cầu](https://pharos-agent-arena.vercel.app/tasks/event-log-monitor): lọc địa chỉ và event signature qua Chain MCP; chạy liên tục; chỉ báo event mới, không trùng; giải mã from/to/amount/tx/block; bắt ít nhất một event thật hoặc test event.

Đã làm: polling Transfer của USDC, phân trang tối đa 1.000 block, lưu checkpoint và khóa checkpoint, chống trùng bằng tx hash + log index. Đầu tiên backfill 100 block rồi theo dõi các block mới. Có độ trễ 3 block; không tuyên bố chống mọi reorg hoặc exactly-once khi máy sập.

Chạy thực tế: **15 vòng, 17 event khác nhau, 3 event nằm trong block sau khi monitor bắt đầu**. Khởi động lại: **2 vòng, 3 event bổ sung, 0 event trùng** với lần đầu. Ví dụ event mới: [tx tại block 20146968](https://pharosscan.xyz/tx/0xb469bfb4ff6ad987f593b748dd114a26c3fd7e7bc9944caddff722e6d1910cf3), amount **78.496253 USDC**.

### 3. Doc-Search CLI — 50 điểm

[Yêu cầu](https://pharos-agent-arena.vercel.app/tasks/doc-search-cli): nhận câu hỏi tự nhiên, trả lời ngắn có nguồn, xử lý không có câu trả lời, README có cài đặt và 3 ví dụ output.

Đã làm: gọi `askQuestion` qua Developer Docs MCP mà trang docs chính thức quảng bá; trả JSON gồm question/status/answer/sources. Ba câu hỏi thật về network, deploy Foundry và giới hạn event logs đều có câu trả lời dẫn nguồn. Câu hỏi về API bịa đặt trả `no-answer`. Câu trả lời do Docs MCP tổng hợp; wrapper không tự bịa nội dung và không tự chạy những lệnh trong câu trả lời.

## Trạng thái bàn giao

- Mã nguồn và 9 kiểm thử: đã hoàn thành, kiểm thử pass.
- Chạy qua MCP chính thức: cả 3 bài đã có bằng chứng.
- README riêng, raw transcripts, báo cáo HTML, nội dung tiếng Anh: có trong bộ bàn giao.
- Public repo/demo, form đăng ký, submission Arena: chưa thực hiện.
- Video, bài đăng mạng xã hội, bonus, xét duyệt và tiền thưởng: chưa thực hiện/chưa nhận.

Các bản chụp nội dung task, leaderboard, lịch và form được lưu tại `evidence/sources/`. Log công cụ và output tại `evidence/`; xem `README.md` để chạy lại.
