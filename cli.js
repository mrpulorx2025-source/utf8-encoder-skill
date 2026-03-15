#!/usr/bin/env node
/**
 * UTF-8编码工具命令行界面
 * 提供方便的CLI命令进行UTF-8编码验证和测试
 */

const UTF8Encoder = require('./utf8-encoder');
const fs = require('fs');
const path = require('path');

const encoder = new UTF8Encoder();

// 命令行参数解析
const args = process.argv.slice(2);
const command = args[0];

const helpText = `
UTF-8编码工具命令行界面 v1.0.0

用法: utf8-encoder <命令> [参数]

命令:
  validate <文本或文件路径>  验证文本是否包含乱码字符
  length <文本或文件路径>     计算UTF-8字节长度
  encode <文本>              确保文本UTF-8编码并输出
  test-discord <webhook> <消息>  发送测试消息到Discord
  test-github <token> <内容>  创建测试GitHub Gist
  help                       显示此帮助信息

示例:
  utf8-encoder validate "中文测试🎯"
  utf8-encoder length ./document.md
  utf8-encoder encode "GB2312文本"
  utf8-encoder test-discord https://discord.com/api/webhooks/... "测试消息"
  utf8-encoder test-github ghp_token_here "# 测试内容"

环境变量:
  DISCORD_WEBHOOK_URL     Discord Webhook URL（避免命令行暴露）
  GITHUB_TOKEN            GitHub API Token（避免命令行暴露）
`;

function readFileOrText(input) {
  // 检查是否是文件路径
  if (fs.existsSync(input) && fs.statSync(input).isFile()) {
    try {
      return fs.readFileSync(input, 'utf8');
    } catch (error) {
      console.error(`❌ 读取文件失败: ${error.message}`);
      process.exit(1);
    }
  }
  // 否则作为文本处理
  return input;
}

async function main() {
  if (!command || command === 'help') {
    console.log(helpText);
    process.exit(0);
  }

  try {
    switch (command) {
      case 'validate': {
        if (args.length < 2) {
          console.error('❌ 需要提供文本或文件路径');
          console.log('用法: utf8-encoder validate <文本或文件路径>');
          process.exit(1);
        }
        
        const input = args[1];
        const text = readFileOrText(input);
        const result = encoder.validateNoGarbledChars(text);
        
        console.log(`📊 UTF-8编码验证结果`);
        console.log(`输入: ${input.length > 50 ? input.substring(0, 47) + '...' : input}`);
        console.log(`总字符数: ${result.totalChars}`);
        console.log(`中文字符数: ${result.chineseChars}`);
        console.log(`乱码检测: ${result.valid ? '✅ 通过' : '❌ 失败'}`);
        
        if (!result.valid) {
          console.log(`乱码字符数: ${result.garbledCount}`);
          console.log(`乱码字符示例: ${result.garbledChars.map(c => `"${c}"`).join(', ')}`);
        }
        
        break;
      }
      
      case 'length': {
        if (args.length < 2) {
          console.error('❌ 需要提供文本或文件路径');
          console.log('用法: utf8-encoder length <文本或文件路径>');
          process.exit(1);
        }
        
        const input = args[1];
        const text = readFileOrText(input);
        const charLength = text.length;
        const byteLength = encoder.calculateUTF8ByteLength(text);
        
        console.log(`📏 UTF-8字节长度计算`);
        console.log(`输入: ${input.length > 50 ? input.substring(0, 47) + '...' : input}`);
        console.log(`字符长度: ${charLength}`);
        console.log(`UTF-8字节长度: ${byteLength}`);
        console.log(`差异: ${byteLength - charLength} 字节（${byteLength > charLength ? '中文字符占用更多字节' : '纯ASCII字符'})`);
        
        break;
      }
      
      case 'encode': {
        if (args.length < 2) {
          console.error('❌ 需要提供文本');
          console.log('用法: utf8-encoder encode <文本>');
          process.exit(1);
        }
        
        const text = args.slice(1).join(' ');
        const encoded = encoder.ensureUTF8(text);
        
        console.log(`🔤 UTF-8编码结果`);
        console.log(`原始文本: ${text}`);
        console.log(`编码后: ${encoded}`);
        console.log(`是否变化: ${text === encoded ? '否（已经是UTF-8）' : '是（已转换编码）'}`);
        
        break;
      }
      
      case 'test-discord': {
        let webhookUrl, message;
        
        if (args.length >= 3) {
          webhookUrl = args[1];
          message = args.slice(2).join(' ');
        } else if (args.length === 2) {
          webhookUrl = process.env.DISCORD_WEBHOOK_URL;
          message = args[1];
        } else if (args.length === 1) {
          webhookUrl = process.env.DISCORD_WEBHOOK_URL;
          message = 'UTF-8编码测试消息：中文测试 🎯 ' + new Date().toISOString();
        }
        
        if (!webhookUrl) {
          console.error('❌ 需要提供Discord Webhook URL');
          console.log('用法: utf8-encoder test-discord <webhook> <消息>');
          console.log('或设置环境变量: DISCORD_WEBHOOK_URL');
          process.exit(1);
        }
        
        console.log(`📨 发送测试消息到Discord...`);
        console.log(`Webhook: ${webhookUrl.substring(0, 30)}...`);
        console.log(`消息: ${message.substring(0, 50)}${message.length > 50 ? '...' : ''}`);
        
        const result = await encoder.sendToDiscord(webhookUrl, message, {
          username: 'UTF8-Encoder-Test',
          avatar_url: ''
        });
        
        console.log(`\n📊 测试结果`);
        console.log(`状态: ${result.success ? '✅ 成功' : '❌ 失败'}`);
        console.log(`状态码: ${result.statusCode}`);
        console.log(`平台: ${result.platform}`);
        console.log(`消息长度: ${result.messageLength} 字符`);
        console.log(`字节长度: ${result.byteLength} 字节`);
        
        break;
      }
      
      case 'test-github': {
        let token, content;
        
        if (args.length >= 3) {
          token = args[1];
          content = args.slice(2).join(' ');
        } else if (args.length === 2) {
          token = process.env.GITHUB_TOKEN;
          content = args[1];
        } else if (args.length === 1) {
          token = process.env.GITHUB_TOKEN;
          content = `# UTF-8编码测试 Gist\n\n生成时间: ${new Date().toISOString()}\n\n中文测试内容：这是一个测试Gist，用于验证UTF-8编码是否正确。\n\nEmoji测试: 🎯 ✅ 🔤\n\n特殊字符: !@#$%^&*()`;
        }
        
        if (!token) {
          console.error('❌ 需要提供GitHub Token');
          console.log('用法: utf8-encoder test-github <token> <内容>');
          console.log('或设置环境变量: GITHUB_TOKEN');
          process.exit(1);
        }
        
        console.log(`🐙 创建测试GitHub Gist...`);
        console.log(`Token: ${token.substring(0, 10)}...`);
        console.log(`内容长度: ${content.length} 字符`);
        
        const result = await encoder.createGitHubGist(
          token,
          content,
          'utf8-test.md',
          'UTF-8编码测试 Gist',
          false // 私有Gist，避免公开测试数据
        );
        
        console.log(`\n📊 测试结果`);
        console.log(`状态: ${result.success ? '✅ 成功' : '❌ 失败'}`);
        console.log(`状态码: ${result.statusCode}`);
        console.log(`平台: ${result.platform}`);
        console.log(`内容长度: ${result.contentLength} 字符`);
        
        if (result.gistUrl) {
          console.log(`Gist URL: ${result.gistUrl}`);
          console.log(`Raw URL: ${result.rawUrl}`);
        }
        
        if (!result.success && result.response) {
          try {
            const errorJson = JSON.parse(result.response);
            if (errorJson.message) {
              console.log(`错误信息: ${errorJson.message}`);
            }
          } catch (e) {
            // 忽略解析错误
          }
        }
        
        break;
      }
      
      default:
        console.error(`❌ 未知命令: ${command}`);
        console.log(helpText);
        process.exit(1);
    }
  } catch (error) {
    console.error(`❌ 执行命令时出错: ${error.message}`);
    if (error.stack) {
      console.error(`堆栈: ${error.stack.split('\n')[1]}`);
    }
    process.exit(1);
  }
}

// 执行
if (require.main === module) {
  main().catch(error => {
    console.error('❌ 未处理的错误:', error);
    process.exit(1);
  });
}

module.exports = { encoder, readFileOrText };