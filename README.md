# UTF-8发布基础设施

> 自动处理多平台中文编码问题的发布基础设施，集成防卡顿策略和韧性保障，防止因编码问题浪费API token。

[![npm version](https://img.shields.io/npm/v/utf8-encoder-tool?style=flat-square)](https://www.npmjs.com/package/utf8-encoder-tool)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![GitHub stars](https://img.shields.io/github/stars/mrpulorx2025-source/utf8-encoder-skill?style=social)](https://github.com/mrpulorx2025-source/utf8-encoder-skill)

## 为什么需要这个？

如果你在Windows PowerShell中发布内容到Discord、GitHub等平台，经常遇到：

- **控制台显示乱码**（如"????"），但实际网页正常
- **重复发布浪费token**：因显示误导而重复操作，消耗宝贵API额度
- **平台API编码问题**：原生API不处理编码，导致中文、Emoji显示异常
- **缺乏韧性保障**：发布失败后无自动重试和备选方案

UTF-8发布基础设施将这些痛点转化为自动处理的底层能力，遵循"防止勤务干扰"原则：编码转换不应成为你的思考任务，而是自动运行的基础设施。

## 快速开始

### 最简示例（5行代码）

```javascript
const UTF8Encoder = require('utf8-encoder-tool');
const encoder = new UTF8Encoder();

const text = encoder.ensureUTF8("中文测试 🎯");
console.log(`UTF-8编码完成，字节长度: ${encoder.calculateUTF8ByteLength(text)}`);
```

### 完整发布示例（Discord + GitHub）

```javascript
// 发送到Discord Webhook（自动处理编码）
await encoder.sendToDiscord(process.env.DISCORD_WEBHOOK, '消息内容');

// 创建GitHub Gist（自动UTF-8编码）
await encoder.createGitHubGist(process.env.GITHUB_TOKEN, '# 内容', 'file.md');
```

## 安装

**前置条件**：Node.js 18+，npm 9+

### npm全局安装（推荐）
```bash
npm install -g utf8-encoder-tool
```

### 本地项目使用
```bash
npm install utf8-encoder-tool
# 或
yarn add utf8-encoder-tool
```

### 从源码安装
```bash
git clone https://github.com/mrpulorx2025-source/utf8-encoder-skill
cd utf8-encoder-skill
npm install
```

## 核心特性

### 🏛️ 作为"底层律令"
- **自动运行**：集成到I/O过滤层，无需手动调用
- **防止勤务干扰**：不汇报编码处理细节，直接推进主线任务
- **强制后处理**：所有输出自动确保UTF-8编码

### 🔄 整合验证机制
- **智能检测**：自动判断是否需要编码处理（乱码、中文、Emoji等）
- **独立验证**：通过web_fetch验证实际网页显示，不依赖控制台输出
- **三次尝试法则**：同一方法失败2次即切换备选方案

### 🛡️ 韧性保障
- **防卡顿策略**：集成四层策略框架（预防、检测、恢复、切换）
- **指数退避重试**：内置重试机制，避免平台限流
- **备选方案**：主方案失败时自动切换备用发布渠道

### 🔌 中间件模式
- **系统级集成**：`integrateAsMiddleware()`提供批量发布接口
- **多平台支持**：Discord、GitHub、Reddit（架构就绪）
- **可扩展**：轻松添加新平台支持

**已验证平台**：✅ Discord Webhook ✅ GitHub Gist & Issues ✅ 本地文件读写 🔄 Reddit API（待验证）

## 使用

### 基础设施模式（推荐）

将编码处理作为基础设施集成到你的发布流程中：

```javascript
const { UTF8Infrastructure } = require('utf8-encoder-tool');
const infrastructure = new UTF8Infrastructure();

// 自动集成中间件
const middleware = infrastructure.integrateAsMiddleware();

// 智能检测是否需要编码处理
const check = infrastructure.shouldProcess("中文测试内容");
if (check.needsProcessing) {
  // 基础设施自动处理，不干扰主线任务汇报
}

// 带重试的发送（整合三次尝试法则）
const result = await middleware.sendToDiscordWithRetry(
  process.env.DISCORD_WEBHOOK,
  '消息内容',
  { username: 'UTF8-Infrastructure' }
);
```

### 传统工具模式（向后兼容）

```javascript
const UTF8Encoder = require('utf8-encoder-tool');
const encoder = new UTF8Encoder();

// 确保UTF-8编码
const utf8Text = encoder.ensureUTF8("中文测试 Chinese Test 🎯");

// 计算UTF-8字节长度（用于HTTP头）
const byteLength = encoder.calculateUTF8ByteLength(utf8Text);

// 读取UTF-8文件
const content = encoder.readFileUTF8('./chinese-content.md');

// 创建UTF-8 JSON载荷
const payload = encoder.createUTF8JSONPayload({
  message: "中文内容",
  timestamp: new Date().toISOString()
}, true);

// 发送到Discord Webhook
const discordResult = await encoder.sendToDiscord(
  process.env.DISCORD_WEBHOOK,
  'Discord消息：中文测试 🎯'
);

// 创建GitHub Gist
const gistResult = await encoder.createGitHubGist(
  process.env.GITHUB_TOKEN,
  '# 内容',
  'file.md',
  'UTF-8编码测试Gist',
  true
);

// 乱码检测
const validation = encoder.validateNoGarbledChars(text);
if (!validation.valid) {
  console.log(`❌ 发现${validation.garbledCount}个乱码字符`);
}
```

## API参考

查看[完整API文档](https://github.com/mrpulorx2025-source/utf8-encoder-skill/blob/main/API.md)获取详细的方法说明、参数和返回值。

### 核心类

- **UTF8Encoder**：传统工具类，提供编码保障和平台发布功能
- **UTF8Infrastructure**：基础设施类，提供中间件集成和韧性保障

### 常用方法

| 方法 | 说明 | 返回值 |
|------|------|--------|
| `ensureUTF8(text)` | 确保文本为有效UTF-8编码 | `string` |
| `calculateUTF8ByteLength(text)` | 计算UTF-8字节长度 | `number` |
| `sendToDiscord(webhookUrl, content, options)` | 发送到Discord Webhook | `Promise<SendResult>` |
| `createGitHubGist(token, content, filename, description, isPublic)` | 创建GitHub Gist | `Promise<GistResult>` |
| `validateNoGarbledChars(text)` | 检测乱码字符 | `ValidationResult` |

## 常见问题

### Q1：为什么控制台显示乱码但网页正常？
**A**：PowerShell控制台使用GB2312编码显示UTF-8内容。解决方案：不依赖控制台输出，通过`web_fetch`工具验证实际网页显示。

### Q2：如何验证编码是否正确？
**A**：使用`encoder.validateNoGarbledChars(text)`检测乱码字符，或直接访问生成的Gist/Issue查看实际显示。

### Q3：支持哪些特殊字符？
**A**：支持中文、日文、韩文、Emoji、特殊符号。使用正则表达式`/[\u4e00-\u9fa5]/`检测中文字符。

### Q4：性能影响大吗？
**A**：极小。主要开销是`Buffer.byteLength`计算，对于普通文本（<10KB）可忽略不计。

### Q5：与平台原生API有什么区别？
**A**：平台API可能不处理编码问题。本工具确保：
1. 请求体正确UTF-8编码
2. Content-Length头准确
3. Content-Type包含charset=utf-8
4. 响应体正确解码

## 贡献与反馈

### 问题反馈
- [GitHub Issues](https://github.com/mrpulorx2025-source/utf8-encoder-skill/issues)
- 邮箱：mrpulorx2025@gmail.com

### 贡献指南
1. Fork仓库
2. 创建功能分支
3. 提交更改
4. 创建Pull Request

查看[CONTRIBUTING.md](CONTRIBUTING.md)获取详细指南。

## 许可证

MIT License - 详见[LICENSE](LICENSE)文件

---

**核心教训**：编码问题反复消耗token实属不该。本工具通过一次性测试+验证+发布流程，避免重复浪费，提高发布成功率。

**牢记**：控制台显示 ≠ 实际数据，必须独立验证网页显示！