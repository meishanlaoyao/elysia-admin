# 文件上传功能实现总结

## 实现要点

### 1. 上传流程

每个文件上传都遵循以下流程：

```
用户选择文件
    ↓
调用 fetchGeneratePresign({ fileName: file.name })
    ↓
获取预签名 URL (PUT 请求地址)
    ↓
使用 fetch 发送 PUT 请求
    ├─ Method: PUT
    ├─ Body: file (binary 数据)
    └─ Headers: Content-Type (文件 MIME 类型)
    ↓
上传成功，提取文件 URL (去除查询参数)
    ↓
更新 modelValue (字符串或数组)
```

### 2. 关键代码实现

```typescript
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

### 3. 数据类型智能处理

根据 `limit` 参数自动决定返回类型：

- **limit: 1** → 返回 `string`（单个文件 URL）
- **limit > 1** → 返回 `string[]`（文件 URL 数组）

```typescript
// 单文件示例
{
  avatar: 'https://bucket.s3.amazonaws.com/uploads/avatar.jpg'
}

// 多文件示例
{
  images: [
    'https://bucket.s3.amazonaws.com/uploads/image1.jpg',
    'https://bucket.s3.amazonaws.com/uploads/image2.jpg',
    'https://bucket.s3.amazonaws.com/uploads/image3.jpg'
  ]
}
```

## 使用示例

### 单文件上传

```typescript
{
  label: '头像',
  key: 'avatar',
  type: 'upload',
  props: {
    limit: 1, // 返回字符串
    listType: 'picture-card',
    accept: 'image/*'
  }
}
```

### 多文件上传

```typescript
{
  label: '附件',
  key: 'attachments',
  type: 'upload',
  props: {
    limit: 5, // 返回字符串数组
    listType: 'picture-card',
    accept: '*'
  }
}
```

## 技术细节

### Content-Type 处理

- 优先使用文件的 MIME 类型 (`file.type`)
- 如果无法识别，使用 `application/octet-stream`

### 错误处理

- 上传失败会在控制台输出详细错误信息
- 显示用户友好的错误提示
- 调用 `onError` 回调通知 Upload 组件

### 文件列表管理

- 使用 `fileListMap` 响应式对象管理每个字段的文件列表
- 支持从 `modelValue` 初始化文件列表
- 删除文件时自动更新 `modelValue`

## 测试建议

1. **单文件上传测试**
   - 上传一个文件，检查返回的是字符串
   - 删除文件，检查值变为空字符串

2. **多文件上传测试**
   - 上传多个文件，检查返回的是数组
   - 删除部分文件，检查数组正确更新
   - 达到 limit 限制，检查是否显示提示

3. **不同文件类型测试**
   - 图片文件 (jpg, png, gif)
   - 文档文件 (pdf, doc, xls)
   - 其他文件类型

4. **边界情况测试**
   - 上传大文件
   - 网络错误情况
   - 预签名 URL 获取失败

## 相关文件

- `src/components/core/forms/art-form/index.vue` - 主组件实现
- `src/api/system/storage.ts` - 存储 API
- `UPLOAD_USAGE_EXAMPLE.md` - 详细使用文档
- `UPLOAD_TEST_EXAMPLE.vue` - 测试示例页面

## 注意事项

1. 确保后端 `fetchGeneratePresign` API 返回有效的预签名 URL
2. 预签名 URL 应该支持 PUT 请求
3. 文件上传后的 URL 应该是可公开访问的（如果需要）
4. 考虑添加文件大小限制（可在 `before-upload` 钩子中实现）
5. 考虑添加文件类型验证（可在 `before-upload` 钩子中实现）
