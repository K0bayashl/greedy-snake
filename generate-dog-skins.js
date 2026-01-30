const fs = require('fs');
const path = require('path');

// === 配置区域 ===
const CONFIG = {
    apiUrl: 'http://127.0.0.1:8045/v1/images/generations',
    apiKey: 'sk-d367ed09a7334a08974b23a496c546c1',
    model: 'gemini-3-pro-image',
    size: '1024x1024',
    outputDir: path.join(__dirname, 'src/2048/assets/skins/dog-evolution')
};

// 确保输出目录存在
if (!fs.existsSync(CONFIG.outputDir)) {
    fs.mkdirSync(CONFIG.outputDir, { recursive: true });
}

// 定义生成任务 (跳过 8.png，因为是现有素材)
const tasks = [
    { value: 2, prompt: '8-bit pixel art of a white dog bone, simple style, white background, centered, game asset' },
    { value: 4, prompt: '8-bit pixel art of a spotted egg, simple style, white background, centered, game asset' },
    // 8.png is pixel-puppy.png (Skipped)
    { value: 16, prompt: '8-bit pixel art of a cute Shiba Inu dog face, simple style, white background, centered, game asset' },
    { value: 32, prompt: '8-bit pixel art of a police dog wearing a blue hat, simple style, white background, centered, game asset' },
    { value: 64, prompt: '8-bit pixel art of a grey husky dog face, cool style, white background, centered, game asset' },
    { value: 128, prompt: '8-bit pixel art of a cool dog wearing sunglasses, simple style, white background, centered, game asset' },
    { value: 256, prompt: '8-bit pixel art of a dog wearing silver armor, medieval style, white background, centered, game asset' },
    { value: 512, prompt: '8-bit pixel art of a cyberpunk robot dog, glowing red eyes, metallic, white background, centered' },
    { value: 1024, prompt: '8-bit pixel art of a three-headed Cerberus dog, mythical, fire, white background, centered' },
    { value: 2048, prompt: '8-bit pixel art of a golden Doge god, divine aura, glowing, white background, centered' }
];

async function generateImage(task) {
    const fileName = `${task.value}.png`;
    const outputPath = path.join(CONFIG.outputDir, fileName);

    if (fs.existsSync(outputPath)) {
        console.log(`⏩ ${fileName} 已存在，跳过`);
        return;
    }

    console.log(`🎨 正在生成 ${fileName}...`);
    console.log(`   Prompt: ${task.prompt}`);

    try {
        const response = await fetch(CONFIG.apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${CONFIG.apiKey}`
            },
            body: JSON.stringify({
                model: CONFIG.model,
                prompt: task.prompt,
                n: 1,
                size: CONFIG.size
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`API Error ${response.status}: ${errorText}`);
        }

        const data = await response.json();
        let imageUrl = '';

        if (data.data && data.data[0]) {
            if (data.data[0].url) {
                imageUrl = data.data[0].url;
            } else if (data.data[0].b64_json) {
                const buffer = Buffer.from(data.data[0].b64_json, 'base64');
                fs.writeFileSync(outputPath, buffer);
                console.log(`✅ ${fileName} 保存成功 (Base64)`);
                return;
            }
        }

        if (!imageUrl) throw new Error('No image URL or Base64 in response');

        const imgResponse = await fetch(imageUrl);
        const arrayBuffer = await imgResponse.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        fs.writeFileSync(outputPath, buffer);
        console.log(`✅ ${fileName} 保存成功`);

    } catch (error) {
        console.error(`❌ 生成 ${fileName} 失败:`, error.message);
    }
}

async function runAll() {
    console.log('🚀 开始批量生成素材...');
    console.log(`API Target: ${CONFIG.apiUrl}`);

    for (const task of tasks) {
        await generateImage(task);
        // 简单延时
        await new Promise(resolve => setTimeout(resolve, 500));
    }
    console.log('✨ 所有任务完成！');
}

runAll();
