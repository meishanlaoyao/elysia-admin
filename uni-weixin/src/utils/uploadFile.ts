/**
 * 文件上传钩子函数使用示例
 * @example
 * const { loading, error, data, progress, run } = useUpload<IUploadResult>(
 *   uploadUrl,
 *   {},
 *   {
 *     maxSize: 5, // 最大5MB
 *     sourceType: ['album'], // 仅支持从相册选择
 *     onProgress: (p) => console.log(`上传进度：${p}%`),
 *     onSuccess: (res) => console.log('上传成功', res),
 *     onError: (err) => console.error('上传失败', err),
 *   },
 * )
 */

import { generatePreSignUrl } from '@/api/file'

/**
 * 通用文件上传函数（支持直接传入文件路径）
 * @param url 上传地址
 * @param filePath 本地文件路径
 * @param formData 额外表单数据
 * @param options 上传选项
 */
export function useFileUpload<T = string>(url: string, filePath: string, formData: Record<string, any> = {}, options: Omit<UploadOptions, 'sourceType' | 'sizeType' | 'count'> = {}) {
  return useUpload<T>(
    url,
    formData,
    {
      ...options,
      sourceType: ['album'],
      sizeType: ['original'],
    },
    filePath,
  )
}

export interface UploadOptions {
  /** 最大可选择的图片数量，默认为1 */
  count?: number
  /** 所选的图片的尺寸，original-原图，compressed-压缩图 */
  sizeType?: Array<'original' | 'compressed'>
  /** 选择图片的来源，album-相册，camera-相机 */
  sourceType?: Array<'album' | 'camera'>
  /** 文件大小限制，单位：MB */
  maxSize?: number //
  /** 上传进度回调函数 */
  onProgress?: (progress: number) => void
  /** 上传成功回调函数 */
  onSuccess?: (res: Record<string, any>) => void
  /** 上传失败回调函数 */
  onError?: (err: Error | UniApp.GeneralCallbackResult) => void
  /** 上传完成回调函数（无论成功失败） */
  onComplete?: () => void
}

/**
 * 文件上传钩子函数
 * @template T 上传成功后返回的数据类型
 * @param url 上传地址
 * @param formData 额外的表单数据
 * @param options 上传选项
 * @returns 上传状态和控制对象
 */
export function useUpload<T = string>(url: string, formData: Record<string, any> = {}, options: UploadOptions = {},
  /** 直接传入文件路径，跳过选择器 */
  directFilePath?: string) {
  /** 上传中状态 */
  const loading = ref(false)
  /** 上传错误状态 */
  const error = ref(false)
  /** 上传成功后的响应数据 */
  const data = ref<T>()
  /** 上传进度（0-100） */
  const progress = ref(0)

  /** 解构上传选项，设置默认值 */
  const {
    /** 最大可选择的图片数量 */
    count = 1,
    /** 所选的图片的尺寸 */
    sizeType = ['original', 'compressed'],
    /** 选择图片的来源 */
    sourceType = ['album', 'camera'],
    /** 文件大小限制（MB） */
    maxSize = 10,
    /** 进度回调 */
    onProgress,
    /** 成功回调 */
    onSuccess,
    /** 失败回调 */
    onError,
    /** 完成回调 */
    onComplete,
  } = options

  /**
   * 检查文件大小是否超过限制
   * @param size 文件大小（字节）
   * @returns 是否通过检查
   */
  const checkFileSize = (size: number) => {
    const sizeInMB = size / 1024 / 1024
    if (sizeInMB > maxSize) {
      uni.showToast({
        title: `文件大小不能超过${maxSize}MB`,
        icon: 'none',
      })
      return false
    }
    return true
  }
  /**
   * 触发文件选择和上传
   * 根据平台使用不同的选择器：
   * - 微信小程序使用 chooseMedia
   * - 其他平台使用 chooseImage
   */
  const run = () => {
    if (directFilePath) {
      // 直接使用传入的文件路径
      loading.value = true
      progress.value = 0
      uploadFile<T>({
        url,
        tempFilePath: directFilePath,
        formData,
        data,
        error,
        loading,
        progress,
        onProgress,
        onSuccess,
        onError,
        onComplete,
      })
      return
    }

    // #ifdef MP-WEIXIN
    // 微信小程序环境下使用 chooseMedia API
    uni.chooseMedia({
      count,
      mediaType: ['image'], // 仅支持图片类型
      sourceType,
      success: (res) => {
        const file = res.tempFiles[0]
        // 检查文件大小是否符合限制
        if (!checkFileSize(file.size))
          return

        // 开始上传
        loading.value = true
        progress.value = 0
        uploadFile<T>({
          url,
          tempFilePath: file.tempFilePath,
          formData,
          data,
          error,
          loading,
          progress,
          onProgress,
          onSuccess,
          onError,
          onComplete,
        })
      },
      fail: (err) => {
        console.error('选择媒体文件失败:', err)
        error.value = true
        onError?.(err)
      },
    })
    // #endif

    // #ifndef MP-WEIXIN
    // 非微信小程序环境下使用 chooseImage API
    uni.chooseImage({
      count,
      sizeType,
      sourceType,
      success: (res) => {
        console.log('选择图片成功:', res)

        // 开始上传
        loading.value = true
        progress.value = 0
        uploadFile<T>({
          url,
          tempFilePath: res.tempFilePaths[0],
          formData,
          data,
          error,
          loading,
          progress,
          onProgress,
          onSuccess,
          onError,
          onComplete,
        })
      },
      fail: (err) => {
        console.error('选择图片失败:', err)
        error.value = true
        onError?.(err)
      },
    })
    // #endif
  }

  return { loading, error, data, progress, run }
}

/**
 * 文件上传选项接口
 * @template T 上传成功后返回的数据类型
 */
interface UploadFileOptions<T> {
  /** 上传地址 */
  url: string
  /** 临时文件路径 */
  tempFilePath: string
  /** 额外的表单数据 */
  formData: Record<string, any>
  /** 上传成功后的响应数据 */
  data: Ref<T | undefined>
  /** 上传错误状态 */
  error: Ref<boolean>
  /** 上传中状态 */
  loading: Ref<boolean>
  /** 上传进度（0-100） */
  progress: Ref<number>
  /** 上传进度回调 */
  onProgress?: (progress: number) => void
  /** 上传成功回调 */
  onSuccess?: (res: Record<string, any>) => void
  /** 上传失败回调 */
  onError?: (err: Error | UniApp.GeneralCallbackResult) => void
  /** 上传完成回调 */
  onComplete?: () => void
}

/**
 * 执行文件上传
 * @template T 上传成功后返回的数据类型
 * @param options 上传选项
 */
function uploadFile<T>({
  url,
  tempFilePath,
  formData,
  data,
  error,
  loading,
  progress,
  onProgress,
  onSuccess,
  onError,
  onComplete,
}: UploadFileOptions<T>) {
  try {
    // 创建上传任务
    const uploadTask = uni.uploadFile({
      url,
      filePath: tempFilePath,
      name: 'file', // 文件对应的 key
      formData,
      header: {
        // H5环境下不需要手动设置Content-Type，让浏览器自动处理multipart格式
        // #ifndef H5
        'Content-Type': 'multipart/form-data',
        // #endif
      },
      // 确保文件名称合法
      success: (uploadFileRes) => {
        console.log('上传文件成功:', uploadFileRes)
        try {
          // 解析响应数据
          const { data: _data } = JSON.parse(uploadFileRes.data)
          // 上传成功
          data.value = _data as T
          onSuccess?.(_data)
        }
        catch (err) {
          // 响应解析错误
          console.error('解析上传响应失败:', err)
          error.value = true
          onError?.(new Error('上传响应解析失败'))
        }
      },
      fail: (err) => {
        // 上传请求失败
        console.error('上传文件失败:', err)
        error.value = true
        onError?.(err)
      },
      complete: () => {
        // 无论成功失败都执行
        loading.value = false
        onComplete?.()
      },
    })

    // 监听上传进度
    uploadTask.onProgressUpdate((res) => {
      progress.value = res.progress
      onProgress?.(res.progress)
    })
  }
  catch (err) {
    // 创建上传任务失败
    console.error('创建上传任务失败:', err)
    error.value = true
    loading.value = false
    onError?.(new Error('创建上传任务失败'))
  }
}


/**
 * 通过文件名称检测文件类型返回对应的Content-Type
 * @param fileName 文件名称
 * @returns 对应的Content-Type字符串
 */
function getContentTypeByFileName(fileName: string) {
  const ext = fileName.split('.').pop()?.toLowerCase();
  if (!ext || ext === fileName) return 'application/octet-stream';
  switch (ext) {
    case 'jpg':
    case 'jpeg': return 'image/jpeg'
    case 'png': return 'image/png'
    case 'webp': return 'image/webp';
    case 'svg': return 'image/svg+xml';
    case 'gif': return 'image/gif'
    case 'mp4': return 'video/mp4'
    case 'mp3': return 'audio/mpeg';
    case 'avi': return 'video/x-msvideo'
    case 'mov': return 'video/mov'
    case 'pdf': return 'application/pdf'
    case 'docx': return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    case 'xlsx': return 'application/vnd.ms-excel'
    case 'txt': return 'text/plain'
    case 'csv': return 'text/csv'
    case 'wav': return 'audio/wav';
    case 'ogg': return 'audio/ogg';
    case 'html': return 'text/html';
    case 'css': return 'text/css';
    case 'js': return 'application/javascript';
    case 'json': return 'application/json'
    case 'xml': return 'application/xml'
    case 'zip': return 'application/zip'
    case 'rar': return 'application/x-rar-compressed'
    case '7z': return 'application/x-7z-compressed'
    case 'tar': return 'application/x-tar'
    case 'gz': return 'application/x-gzip'
    default: return 'application/octet-stream'
  }
}

/**
 * 通过url获取文件名称
 * @param url 文件url
 * @returns 文件名称
 */
function getFileNameByUrl(url: string) {
  let fileName = url.split('/').pop() || ''
  const ext = fileName.split('.').pop()
  fileName = fileName.slice(0, 10)
  fileName = fileName.replace(/[^\w]/g, '_')
  return fileName + (ext ? '.' + ext : '')
}

/** 文件读成arrayBuffer */
const fsm = uni.getFileSystemManager();
async function readFileAsBuffer(url: string) {
  return new Promise((resolve, reject) => {
    fsm.readFile({
      filePath: url,
      success(res) {
        const arrayBuffer = res.data; // 这就是文件二进制数据
        resolve(arrayBuffer)
      },
      fail(err) {
        console.error('文件读取失败:', err)
        reject(err)
      },
    })
  })
}

/** 单文件上传 */
function runOne(url: string): Promise<string> | void {
  return new Promise(async (resolve, reject) => {
    const fileName = getFileNameByUrl(url)
    const contentType = getContentTypeByFileName(fileName)
    const arrayBuffer = await readFileAsBuffer(url)
    const preSignUrl = await generatePreSignUrl(fileName)
    const fileUrl = preSignUrl.split('?')[0]
    uni.request({
      url: preSignUrl,
      method: 'PUT',
      header: { 'Content-Type': contentType, },
      data: arrayBuffer,
      success(res) {
        if (res.statusCode === 200) resolve(fileUrl)
      },
      fail(err) {
        console.error('上传文件失败:', err)
        reject(err)
      },
    })
  })
}

/**
 * 简易版通用S3预签名文件上传
 */
export function uploadFileToS3() {
  /** 图片上传 */
  function image(options?: any): Promise<string | string[]> {
    return new Promise((resolve, reject) => {
      uni.chooseImage({
        success: async (result) => {
          const tempFilePaths = result.tempFilePaths
          const fileUrls = await Promise.all(tempFilePaths.map(runOne))
          const formate = fileUrls?.length > 1 ? fileUrls : fileUrls[0]
          resolve(formate)
        },
        fail(err) {
          console.error("选择图片失败:", err)
          reject(err)
        },
        ...options,
      })
    })
  }
  /** 视频上传 */
  function video(options?: any): Promise<string> {
    return new Promise((resolve, reject) => {
      uni.chooseVideo({
        success: async (result) => {
          const fileUrl = await runOne(result.tempFilePath) || undefined
          resolve(fileUrl)
        },
        fail(err) {
          console.error("选择视频失败:", err)
          reject(err)
        },
        ...options,
      })
    })
  }
  // #ifdef MP-WEIXIN
  /** 文件上传 */
  function file(options?: any): Promise<string | string[]> {
    return new Promise((resolve, reject) => {
      wx.chooseMessageFile({
        success: async (result) => {
          const tempFilePaths = result.tempFiles.map(item => item.path)
          const fileUrls = await Promise.all(tempFilePaths.map(runOne))
          const formate = fileUrls?.length > 1 ? fileUrls : fileUrls[0]
          resolve(formate)
        },
        fail(err) {
          console.error("选择文件失败:", err)
          reject(err)
        },
        ...options,
      })
    })
  }
  // #endif
  return {
    image,
    video,
    // #ifdef MP-WEIXIN
    file,
    // #endif
  }
}