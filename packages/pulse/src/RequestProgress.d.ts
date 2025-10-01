export interface IUploadProgressData {
	/**
	 * 1. Represents upload progress as a percentage (0–100).
	 * 2. Can be null if the total size is unknown
	 * (e.g., if the "Content-Length" header was not provided).
	 */
	progress: number | null;
	/**
	 * Number of bytes uploaded so far.
	 */
	uploaded: number;
	/**
	 * Remaining number of bytes to upload.
	 * Can be null if the total size is unknown.
	 */
	remaining: number | null;
}

export interface IDownloadProgressData {
	/**
	 * 1. Represents download progress in
	 * percentage.
	 * 2. Can be null if remaining byte amount is not known.
	 * This can happen if the "Content-Length" headers was not set by the server.
	 * */
	progress: number | null;
	/**
	 * Download data in bytes
	 * */
	downloaded: number;
	/**
	 * 1. Remaining data to be downloaded in bytes.
	 * 2. Can be null if content length header was not set.
	 * */
	remaining: number | null;
}
