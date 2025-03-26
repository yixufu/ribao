document.addEventListener('DOMContentLoaded', function() {
    // 获取DOM元素
    const titleInput = document.getElementById('title');
    const authorInput = document.getElementById('author');
    const footerTextInput = document.getElementById('footer-text');
    const qrCodeInput = document.getElementById('qr-code');
    const contentInput = document.getElementById('content');
    const previewBtn = document.getElementById('preview-btn');
    const saveBtn = document.getElementById('save-btn');
    
    const posterTitle = document.getElementById('poster-title');
    const posterDate = document.getElementById('poster-date');
    const posterAuthor = document.getElementById('poster-author');
    const posterContent = document.getElementById('poster-content');
    const posterFooterText = document.getElementById('poster-footer-text');
    const posterQrCode = document.getElementById('poster-qr-code');
    
    // 设置当前日期
    function updateDate() {
        const now = new Date();
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        posterDate.textContent = now.toLocaleDateString('zh-CN', options);
    }
    
    updateDate();
    
    // 更新预览
    function updatePreview() {
        posterTitle.textContent = titleInput.value;
        posterAuthor.textContent = authorInput.value;
        posterFooterText.textContent = footerTextInput.value;
        
        // 将Markdown转换为HTML
        const markdownContent = contentInput.value;
        const htmlContent = marked.parse(markdownContent);
        posterContent.innerHTML = htmlContent;
    }
    
    // 上传二维码
    qrCodeInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(event) {
                posterQrCode.src = event.target.result;
            };
            reader.readAsDataURL(file);
        }
    });
    
    // 点击预览按钮
    previewBtn.addEventListener('click', updatePreview);
    
    // 保存为图片
    saveBtn.addEventListener('click', function() {
        // 临时隐藏按钮
        saveBtn.style.display = 'none';
        
        html2canvas(document.getElementById('poster'), {
            scale: 2,
            logging: false,
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#0a192f'
        }).then(canvas => {
            // 恢复按钮显示
            saveBtn.style.display = 'block';
            
            // 创建下载链接
            const link = document.createElement('a');
            link.download = `AI日报-${new Date().toISOString().slice(0, 10)}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        });
    });
    
    // 初始预览
    updatePreview();
    
    // 自动调整内容区域高度
    function adjustTextareaHeight() {
        contentInput.style.height = 'auto';
        contentInput.style.height = (contentInput.scrollHeight) + 'px';
    }
    
    contentInput.addEventListener('input', adjustTextareaHeight);
    adjustTextareaHeight();
    
    // 示例Markdown内容
    const exampleMarkdown = `# 今日AI动态

## 重大新闻
- OpenAI发布GPT-4 Turbo模型，性能提升显著
- Google DeepMind推出新一代药物发现AI系统
- 中国科技部发布AI伦理治理新指南

## 技术进展
\`\`\`python
# 示例代码：使用Transformer模型
from transformers import pipeline

classifier = pipeline("text-classification")
result = classifier("AI技术正在改变世界")
print(result)
\`\`\`

## 行业应用
> "AI将在未来5年内彻底改变医疗行业" —— 李博士

[查看更多详情](https://example.com)`;
    
    // 设置示例内容
    contentInput.value = exampleMarkdown;
    updatePreview();
});