# 文件存储

本章详细介绍 `Elysia Admin` 的文件存储管理功能，涵盖对象存储配置、文件上传流程及多端实现示例。

## 为什么建议使用对象存储？

我们强烈建议将文件存储至兼容 S3 协议的对象存储中，而非本地文件系统。若无法采购第三方对象存储服务，推荐使用开源的 `RustFS`。

直接存储至本地文件系统存在以下显著弊端：

- 迁移困难：服务器迁移时需同步海量文件，耗时且易出错。
- 扩展性差：难以实现分布式存储、负载均衡及横向扩展。
- 带宽占用：文件上传与下载均会占用后端服务器带宽，直接影响核心业务响应速度。
- 资源损耗：长期累积的文件会大量消耗后端服务器的磁盘空间与 I/O 性能。
- 可靠性低：缺乏自动化的数据冗余、容灾备份及生命周期管理机制。

## 安装 RustFS

`RustFS` 是一款兼容 S3 协议的高性能开源对象存储服务，通过 `Docker` 可实现分钟级快速部署。

### 使用 Docker 安装

```bash
docker run -d --name rustfs_container --user root -p 9000:9000 -p 9001:9001 -v /mnt/rustfs/data:/data -e RUSTFS_ACCESS_KEY=rustfsadmin -e RUSTFS_SECRET_KEY=rustfsadmin -e RUSTFS_CONSOLE_ENABLE=true rustfs/rustfs:latest --address :9000 --console-enable --access-key rustfsadmin --secret-key rustfsadmin /data
```

### 参数说明

| 参数 | 说明 |
| :--- | :--- |
| `-d` | 后台运行容器 |
| `--name` | 指定容器名称 |
| `--user root` | 以 root 用户身份运行容器 |
| `-p 9000:9000` | 映射 API 端口，用于文件上传与下载 |
| `-p 9001:9001` | 映射控制台端口，用于 Web 管理界面 |
| `-v` | 将宿主机目录挂载至容器内部，实现数据持久化 |
| `-e RUSTFS_ACCESS_KEY` | 设置访问密钥（Access Key） |
| `-e RUSTFS_SECRET_KEY` | 设置私有密钥（Secret Key） |
| `-e RUSTFS_CONSOLE_ENABLE` | 是否启用 Web 管理控制台 |
| `--address` | API 服务监听地址 |
| `--console-enable` | 开启 Web 控制台功能 |
| `/data` | 容器内的数据存储根目录 |

### 访问 RustFS

部署完成后，可通过以下地址进行访问：

- API 端点：`http://<your-server-ip>:9000`
- Web 控制台：`http://<your-server-ip>:9001`
- 默认凭据：
  - Access Key: `rustfsadmin`
  - Secret Key: `rustfsadmin`

> [!CAUTION]
> 在生产环境中，请务必修改默认的 Access Key 与 Secret Key 以保障安全。

## 配置对象存储

选择好对象存储服务后，仅需在后台管理系统中进行简单的可视化配置即可。

### 配置步骤

1. 登录后台管理系统。
2. 进入 `系统管理` -> `存储配置`。
3. 填写对象存储的相关信息：
   - 名称：存储服务标识（如：RustFS、阿里云 OSS、腾讯云 COS 等）。
   - Region：服务所在区域（使用 RustFS 时可留空）。
   - Endpoint：服务访问端点（如：`http://<your-server-ip>:9000`）。
   - Bucket：存储桶名称。
   - Access Key：访问密钥。
   - Secret Key：私有密钥。
4. 勾选并启用该配置。

### 注意事项

- 系统内置了主流对象存储服务的配置模板，方便快速填写。
- 同一时间内仅允许启用一种存储配置。
- 启用新配置时，系统将自动禁用当前已启用的其他配置。
- 如有你有其它配置，可自行添加后端处理逻辑。

![存储配置表单](/guide/2.png)

## 文件上传流程

系统采用 **预签名 URL（Presigned URL）** 方式实现文件直传，具有以下核心优势：

- 零带宽占用：客户端直接将文件流上传至对象存储，不经过后端服务器中转。
- 高并发支持：服务器仅负责生成极短时效的 URL，极大地减轻了 CPU 与内存压力。
- 支持大文件：无后端文件大小限制，适合上传视频、镜像等大体积文件。

### 上传流程

```
1. 用户选择文件
   ↓
2. 调用 fetchGeneratePresign 接口
   ↓
3. 服务器返回预签名 URL 与文件 ID
   ↓
4. 客户端使用 PUT 方法直接上传二进制流
   ↓
5. 上传成功，提取文件访问地址（去除签名参数）
   ↓
6. 更新业务表单数据
```

## 多端上传实现

### Web 端上传（Fetch API）

在现代浏览器环境下，直接利用原生 `fetch` 即可完成：

```ts
// 每个文件上传前都调用 fetchGeneratePresign
const presignUrl = await fetchGeneratePresign({ fileName: file.name })

// 使用 PUT 请求上传文件（binary 方式，类似 Postman 的 binary）
const response = await fetch(presignUrl, {
  method: 'PUT',
  body: file, // 文件作为 binary 数据放在 body 中
  headers: {
    'Content-Type': file.type || 'application/octet-stream'
  }
})

// 提取文件 URL（去除查询参数）
const fileUrl = presignUrl.split('?')[0]
```

### uni-app / 小程序上传

在 uni-app 环境下，需通过文件管理器读取 `ArrayBuffer` 后进行上传：

```ts
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

/** S3预签名单文件上传 */
export function runOne(url: string): Promise<string> {
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
```

## 注意事项

1. 文件名合规化：建议在上传前过滤特殊字符与中文，或使用 UUID 重命名，以避免部分浏览器兼容性问题。
2. 时效性：预签名 URL 通常具有 15-60 分钟的时效，请在获取后立即发起上传请求。
3. CORS 配置：若跨域上传失败，请检查对象存储控制台中的跨域资源共享（CORS）规则是否已配置。
4. Content-Type：务必设置正确的文件类型，否则可能导致文件在浏览器中被强制下载而非预览。