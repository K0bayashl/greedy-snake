const fs = require('fs');
const path = require('path');

// === 配置区域 ===
const CONFIG = {
    // 你的本地 API 地址 (注意：如果接口是 OpenAI 兼容的，通常需要加上 /v1)
    // 根据你的描述，Base URL 是 http://127.0.0.1:8045，我们尝试拼接标准的生图路径
    apiUrl: 'http://127.0.0.1:8045/v1/images/generations',

    // 你的 API Key
    apiKey: 'sk-d367ed09a7334a08974b23a496c546c1',

    // 模型名称
    model: 'gemini-3-pro-image',

    // 提示词
    prompt: 'A cute puppy in pixel art style, 128x128 pixels resolution, white background, 8-bit game asset',

    // 输出文件名
    outputFile: 'pixel-puppy.png',

    // 图片尺寸 (Gemini/DALL-E 通常支持 1024x1024，我们设为标准值，生成的像素风内容由 Prompt 控制)
    size: '1024x1024'
};

async function generateImage() {
    console.log(`正在请求 API 生成图片...`);
    console.log(`API: ${CONFIG.apiUrl}`);
    console.log(`Model: ${CONFIG.model}`);
    console.log(`Prompt: ${CONFIG.prompt}`);

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
        console.log('API 响应成功，正在解析结果...');

        // 兼容不同的返回格式 (URL 或 Base64)
        let imageUrl = '';
        if (data.data && data.data[0]) {
            if (data.data[0].url) {
                imageUrl = data.data[0].url;
            } else if (data.data[0].b64_json) {
                // 如果返回的是 base64
                const buffer = Buffer.from(data.data[0].b64_json, 'base64');
                saveImage(buffer);
                return;
            }
        }

        if (!imageUrl) {
            console.error('无法从响应中找到图片 URL:', JSON.stringify(data, null, 2));
            return;
        }

        console.log(`正在下载图片: ${imageUrl}`);
        const imgResponse = await fetch(imageUrl);
        if (!imgResponse.ok) throw new Error(`下载图片失败: ${imgResponse.statusText}`);

        const arrayBuffer = await imgResponse.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        saveImage(buffer);

    } catch (error) {
        console.error('发生错误:', error.message);
    }
}

function saveImage(buffer) {
    const outputPath = path.join(__dirname, CONFIG.outputFile);
    fs.writeFileSync(outputPath, buffer);
    console.log(`✅ 图片已成功保存到: ${outputPath}`);
}

// 运行脚本
generateImage();
