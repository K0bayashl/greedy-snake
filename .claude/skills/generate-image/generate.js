const fs = require('fs');
const path = require('path');

// 解析命令行参数
// 简单的参数解析器
const args = {};
process.argv.slice(2).forEach(arg => {
    if (arg.startsWith('--')) {
        const [key, value] = arg.substring(2).split('=');
        // 处理可能包含引号的值
        args[key] = value ? value.replace(/^['"]|['"]$/g, '') : true;
    }
});

if (!args.prompt) {
    console.error('Error: Please provide a prompt using --prompt="your prompt"');
    process.exit(1);
}

// 默认配置
const CONFIG = {
    apiUrl: 'http://127.0.0.1:8045/v1/images/generations',
    apiKey: 'sk-d367ed09a7334a08974b23a496c546c1', // 硬编码你的 key
    model: 'gemini-3-pro-image',
    prompt: args.prompt,
    // 如果没有提供 filename，使用时间戳生成
    outputFile: args.filename || `generated-${Date.now()}.png`,
    size: '1024x1024'
};

// 获取绝对路径：如果用户提供的文件名没有路径，默认保存到当前工作目录
const outputPath = path.isAbsolute(CONFIG.outputFile)
    ? CONFIG.outputFile
    : path.join(process.cwd(), CONFIG.outputFile);

async function generateImage() {
    console.log(`🎨 正在生成图片...`);
    console.log(`📝 Prompt: ${CONFIG.prompt}`);
    console.log(`💾 Target: ${path.basename(outputPath)}`);

    try {
        const response = await fetch(CONFIG.apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${CONFIG.apiKey}`
            },
            body: JSON.stringify({
                model: CONFIG.model,
                prompt: CONFIG.prompt,
                n: 1,
                size: CONFIG.size
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`API 请求失败: ${response.status} ${response.statusText}\n${errorText}`);
        }

        const data = await response.json();

        // 兼容不同的返回格式 (URL 或 Base64)
        let imageUrl = '';
        if (data.data && data.data[0]) {
            if (data.data[0].url) {
                imageUrl = data.data[0].url;
            } else if (data.data[0].b64_json) {
                const buffer = Buffer.from(data.data[0].b64_json, 'base64');
                saveImage(buffer);
                return;
            }
        }

        if (!imageUrl) {
            console.error('无法从响应中找到图片 URL');
            return;
        }

        // 下载图片
        const imgResponse = await fetch(imageUrl);
        if (!imgResponse.ok) throw new Error(`下载图片失败: ${imgResponse.statusText}`);

        const arrayBuffer = await imgResponse.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        saveImage(buffer);

    } catch (error) {
        console.error('❌ 生成失败:', error.message);
        process.exit(1);
    }
}

function saveImage(buffer) {
    try {
        fs.writeFileSync(outputPath, buffer);
        console.log(`✅ 图片已保存: ${outputPath}`);
    } catch (err) {
        console.error(`❌ 保存文件失败: ${err.message}`);
        process.exit(1);
    }
}

generateImage();
