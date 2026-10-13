# 10 task Pharos mới — triển khai từ dễ đến khó

Chọn từ board ngày 14/10/2026: 9 Medium và 1 Hard; sáu task Easy trước đó đã nộp. Đợt này chỉ triển khai và kiểm chứng, chưa submit Arena.

| Thứ tự | Task | Tier | Bằng chứng |
|---:|---|---|---|
| 1 | [Docs MCP + Chain MCP Agent](tasks/docs-chain-mcp-agent/README.md) | Medium | [compose-totalSupply](evidence/ten/compose-totalSupply.json), [compose-decimals](evidence/ten/compose-decimals.json) |
| 2 | [Audit-Log Agent](tasks/audit-log-agent/README.md) | Medium | [audit](evidence/ten/audit.json) |
| 3 | [Whale-Watching Agent](tasks/whale-watching-agent/README.md) | Medium | [whale](evidence/ten/whale.json) |
| 4 | [Wallet Risk Checker](tasks/wallet-risk-checker/README.md) | Medium | [risk-clean](evidence/ten/risk-clean.json), [risk-observed](evidence/ten/risk-observed.json) |
| 5 | [Weekly Digest Agent](tasks/weekly-digest-agent/README.md) | Medium | [digest](evidence/ten/digest.json) |
| 6 | [Policy Gatekeeper](tasks/policy-gatekeeper/README.md) | Medium | [policy-allow](evidence/ten/policy-allow.json), [policy-spend-deny](evidence/ten/policy-spend-deny.json), [policy-address-deny](evidence/ten/policy-address-deny.json), [policy-time-deny](evidence/ten/policy-time-deny.json) |
| 7 | [Threshold Guardian](tasks/threshold-guardian/README.md) | Medium | [guardian-fire](evidence/ten/guardian-fire.json), [guardian-hold](evidence/ten/guardian-hold.json) |
| 8 | [Dry-Run Executor](tasks/dry-run-executor/README.md) | Medium | [dry-run-success](evidence/ten/dry-run-success.json), [dry-run-revert](evidence/ten/dry-run-revert.json) |
| 9 | [Skill + Chain MCP Flow](tasks/skill-chain-mcp-flow/README.md) | Medium | [flow](evidence/ten/flow.json) |
| 10 | [Doc-Grounded Builder Agent](tasks/doc-grounded-builder-agent/README.md) | Hard | [builder-supply](evidence/ten/builder-supply.json), [builder-decimals](evidence/ten/builder-decimals.json), [builder-native](evidence/ten/builder-native.json), [builder-unsupported](evidence/ten/builder-unsupported.json) |

## Kết quả và giới hạn

- Docs + Chain gọi hai view function sau khi lấy giải thích có nguồn. Builder xử lý ba loại câu hỏi và từ chối yêu cầu ngoài phạm vi.
- Audit có Markdown/CSV; Whale theo dõi năm địa chỉ và ghi 4 lượt di chuyển đạt ngưỡng.
- Risk đánh giá năm tín hiệu; mẫu low và medium dùng lịch sử giới hạn. Low không đồng nghĩa ví đã được chứng minh an toàn.
- Digest so sánh hai kỳ bảy ngày, có top ba giao dịch, worker chạy hai tick thật ở nhịp tăng tốc. Workflow sản xuất chạy thứ Hai 07:00 giờ Việt Nam và xuất bản lại trang.
- Policy có allow và ba nhánh deny. Guardian có fire/hold từ ba tín hiệu live. Dry-run có success và revert; nhánh revert không gọi executor.
- SkillEngine là gói hướng dẫn local kèm helper chạy được, theo Docs MCP; không tuyên bố có hosted runtime.
- Không ký hoặc gửi giao dịch. Dry-run thành công dùng địa chỉ EOA công khai để simulate, không nhận là ví của người dùng.

[Trang proof](ten.html) · [Digest](digest-latest.html) · [Tóm tắt máy đọc được](evidence/ten/summary.json)
