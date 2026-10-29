import { toast } from "sonner";

/**
 * Bảng ánh xạ mã lỗi nghiệp vụ / RPC / trigger từ database sang tiếng Việt thân thiện.
 */
const ERROR_CODE_MAP: Record<string, string> = {
	// Quyền & Xác thực
	forbidden: "Bạn không có quyền thực hiện thao tác này.",
	invalid_token: "Đường dẫn không còn hiệu lực hoặc giải đấu đã kết thúc.",
	user_not_found:
		"Người dùng chưa có tài khoản. Hãy mời họ đăng nhập vào hệ thống trước.",
	last_organizer: "Không thể xóa người quản trị cuối cùng của giải đấu.",
	cannot_remove_last_organizer:
		"Không thể xóa người quản trị cuối cùng của giải đấu.",

	// Trạng thái giải & Trận
	tournament_not_editable: "Giải đấu đã kết thúc hoặc không thể chỉnh sửa.",
	tie_already_started:
		"Trận đồng đội đã bắt đầu thi đấu, không thể thay đổi cấu hình.",
	rubber_already_started:
		"Trận đấu đã bắt đầu, không thể thay đổi thông tin này.",
	invalid_rubber_order: "Thứ tự trận đấu không hợp lệ.",
	invalid_status: "Trạng thái trận đấu hiện tại không hợp lệ cho thao tác này.",
	rubber_not_found: "Không tìm thấy trận đấu yêu cầu.",
	teams_required: "Cần xác định đủ hai đội tham gia trước khi bắt đầu trận.",

	// Đội hình (Lineup)
	player_wrong_team: "Vận động viên được chọn không thuộc đội này.",
	lineup_full: "Đã đủ số lượng vận động viên cho trận đấu này.",
	lineup_incomplete: "Đội hình chưa đủ vận động viên ở cả hai phía.",

	// Chấm điểm
	no_point_to_undo: "Không có điểm nào để hoàn tác trong ván đấu hiện tại.",
};

/**
 * Trích xuất chuỗi thông báo lỗi thuần túy hoặc mã lỗi từ error object.
 */
function extractRawErrorMessage(error: unknown): string {
	if (!error) return "";
	if (typeof error === "string") return error;

	if (typeof error === "object") {
		const errObj = error as Record<string, unknown>;

		if (typeof errObj.message === "string") {
			return errObj.message;
		}
		if (typeof errObj.error_description === "string") {
			return errObj.error_description;
		}
		if (typeof errObj.details === "string") {
			return errObj.details;
		}
	}

	return String(error);
}

/**
 * Chuyển đổi lỗi Supabase / Postgres / RPC thành thông báo tiếng Việt dễ hiểu.
 * Tuyệt đối không để lộ thông điệp lỗi kỹ thuật thô của Postgres ra giao diện.
 */
export function getRpcErrorMessage(
	error: unknown,
	fallbackMessage = "Đã xảy ra lỗi trong quá trình xử lý. Vui lòng thử lại sau.",
): string {
	const raw = extractRawErrorMessage(error).trim();
	if (!raw) return fallbackMessage;

	// 1. Kiểm tra mã lỗi chính xác trong bảng từ điển
	if (ERROR_CODE_MAP[raw]) {
		return ERROR_CODE_MAP[raw];
	}

	// 2. Tìm mã lỗi nằm trong chuỗi thông báo (ví dụ: 'raise exception 'forbidden'')
	for (const [code, message] of Object.entries(ERROR_CODE_MAP)) {
		const regex = new RegExp(`\\b${code}\\b`, "i");
		if (regex.test(raw)) {
			return message;
		}
	}

	// 3. Xử lý các lỗi ràng buộc cơ sở dữ liệu phổ biến (Postgres constraints)
	const lower = raw.toLowerCase();

	if (
		lower.includes("tournaments_slug_key") ||
		(lower.includes("duplicate key") && lower.includes("slug"))
	) {
		return "Đường dẫn định danh (slug) này đã được sử dụng. Vui lòng chọn slug khác.";
	}

	if (
		lower.includes("teams_tournament_id_short_name_key") ||
		(lower.includes("short_name") && lower.includes("duplicate"))
	) {
		return "Tên viết tắt của đội đã tồn tại trong giải đấu này.";
	}

	if (
		lower.includes("rubber_players_rubber_id_player_id_key") ||
		lower.includes("rubber_id, player_id")
	) {
		return "Vận động viên này đã có tên trong trận đấu.";
	}

	if (
		lower.includes("check constraint") ||
		lower.includes("violates check constraint")
	) {
		if (lower.includes("slug")) {
			return "Đường dẫn (slug) chỉ được chứa chữ thường không dấu (a-z), chữ số (0-9) và dấu gạch ngang (-).";
		}
		if (lower.includes("short_name")) {
			return "Tên viết tắt của đội phải từ 1 đến 4 ký tự in hoa hoặc chữ số (ví dụ: VIE, HN).";
		}
		if (lower.includes("team_a_id <> team_b_id")) {
			return "Hai đội thi đấu phải là hai đội khác nhau.";
		}
		if (lower.includes("rule_points_cap")) {
			return "Điểm giới hạn (chạm trần) phải lớn hơn hoặc bằng điểm chiến thắng.";
		}
		return "Dữ liệu nhập vào chưa thỏa mãn quy định giải đấu.";
	}

	if (lower.includes("rate limit")) {
		return "Bạn đã gửi yêu cầu quá nhiều lần. Vui lòng đợi ít phút trước khi thử lại.";
	}

	if (lower.includes("invalid login credentials")) {
		return "Thông tin đăng nhập không hợp lệ.";
	}

	// 4. Nếu là lỗi mạng chung
	if (lower.includes("failed to fetch") || lower.includes("networkerror")) {
		return "Không thể kết nối tới máy chủ. Vui lòng kiểm tra lại kết nối mạng.";
	}

	return fallbackMessage;
}

/**
 * Hiển thị toast thông báo lỗi RPC/Postgres bằng tiếng Việt.
 */
export function showRpcError(error: unknown, fallbackMessage?: string): string {
	const message = getRpcErrorMessage(error, fallbackMessage);
	toast.error(message);
	return message;
}

/**
 * Hiển thị toast thông báo thành công.
 */
export function toastSuccess(message: string): void {
	toast.success(message);
}
