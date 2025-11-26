export const uploadToCloudnary = async (file) => {
	// Thực tế: upload trực tiếp lên backend, trả về path tương đối, không dùng Cloudinary
	if (!file) {
		console.log("no file provided to upload");
		return "";
	}
	const data = new FormData();
	data.append("file", file);

	const token = localStorage.getItem("jwt");
	const res = await fetch("http://localhost:5454/api/upload/image", {
		method: "POST",
		headers: token
			? {
				Authorization: `Bearer ${token}`,
			}
			: {},
		body: data,
	});
	if (!res.ok) {
		console.error("upload failed", await res.text());
		return "";
	}
	// backend trả về chuỗi path, ví dụ "/uploads/123_avatar.png"
	const relativePath = await res.text();
	return relativePath;
};