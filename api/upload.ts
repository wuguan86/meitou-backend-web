/**
 * 文件上传 API
 */
import { uploadFile } from './index';

/**
 * 上传图片
 * @param file 图片文件
 * @param folder 存储文件夹路径（可选，如 "images/"）
 * @returns 图片的访问URL
 */
export const uploadImage = async (file: File, folder?: string): Promise<string> => {
  // 如果指定了文件夹，使用通用上传接口；否则使用图片专用接口
  if (folder) {
    return uploadFile<string>('/admin/upload', file, folder);
  } else {
    return uploadFile<string>('/admin/upload/image', file);
  }
};

/**
 * 上传视频
 * @param file 视频文件
 * @returns 视频的访问URL
 */
export const uploadVideo = async (file: File): Promise<string> => {
  return uploadFile<string>('/admin/upload/video', file);
};

/**
 * 通用文件上传
 * @param file 文件
 * @param folder 存储文件夹路径（可选）
 * @returns 文件的访问URL
 */
export const upload = async (file: File, folder?: string): Promise<string> => {
  return uploadFile<string>('/admin/upload', file, folder);
};

