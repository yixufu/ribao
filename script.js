document.addEventListener('DOMContentLoaded', function() {
    // 检查marked库是否加载
    function checkMarkedLoaded() {
        if (typeof marked === 'undefined') {
            console.error('Marked library not loaded, trying fallback');
            return false;
        }
        return true;
    }

    // 获取DOM元素引用
    const titleInput = document.getElementById('title');
    const authorInput = document.getElementById('author');
    const showDateCheckbox = document.getElementById('show-date');
    const dateStyleRadios = document.querySelectorAll('input[name="date-style"]');
    const footerTextInput = document.getElementById('footer-text');
    const qrCodeInput = document.getElementById('qr-code');
    const contentInput = document.getElementById('content');
    const previewBtn = document.getElementById('preview-btn');
    const saveBtn = document.getElementById('save-btn');
    const removeImageBtn = document.getElementById('remove-image');

    // 预览面板元素
    const poster = document.getElementById('poster');
    const posterTitle = document.getElementById('poster-title');
    const posterAuthor = document.getElementById('poster-author');
    const posterDateContainer = document.getElementById('poster-date-container');
    const textDateLine = document.querySelector('.text-date-line');
    const posterDateText = document.getElementById('poster-date-text');
    const posterContent = document.getElementById('poster-content');
    const posterFooterText = document.getElementById('poster-footer-text');
    const posterQrCode = document.getElementById('poster-qr-code');

    // 获取当前选中的日期样式
    function getSelectedDateStyle() {
        return document.querySelector('input[name="date-style"]:checked').value;
    }

    // 更新日期显示
    function updateDate() {
        const now = new Date();
        const style = getSelectedDateStyle();

        posterDateContainer.innerHTML = '';
        posterDateText.textContent = '';
        posterDateContainer.classList.remove('calendar-date');

        if (style === 'text') {
            const options = { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' };
            posterDateText.textContent = now.toLocaleDateString('zh-CN', options);
        } else if (style === 'calendar') {
            const weekdayLong = now.toLocaleDateString('zh-CN', { weekday: 'long' });
            const day = now.getDate();
            const month = now.toLocaleDateString('zh-CN', { month: 'short' });
            const year = now.getFullYear();

            posterDateContainer.classList.add('calendar-date');

            const weekdaySpan = document.createElement('span');
            weekdaySpan.className = 'calendar-weekday';
            weekdaySpan.textContent = weekdayLong;

            const daySpan = document.createElement('span');
            daySpan.className = 'calendar-day';
            daySpan.textContent = day;

            const monthYearSpan = document.createElement('span');
            monthYearSpan.className = 'calendar-month-year';
            monthYearSpan.textContent = `${month} / ${year}`;

            posterDateContainer.appendChild(weekdaySpan);
            posterDateContainer.appendChild(daySpan);
            posterDateContainer.appendChild(monthYearSpan);
        }
    }

    // 简单的Markdown解析器（备用）
    function simpleMarkdownParser(text) {
        // 标题
        text = text.replace(/^# (.*$)/gm, '<h1>$1</h1>');
        text = text.replace(/^## (.*$)/gm, '<h2>$1</h2>');
        text = text.replace(/^### (.*$)/gm, '<h3>$1</h3>');
        
        // 列表
        text = text.replace(/^\* (.*$)/gm, '<li>$1</li>');
        text = text.replace(/^\- (.*$)/gm, '<li>$1</li>');
        text = text.replace(/^\+ (.*$)/gm, '<li>$1</li>');
        text = text.replace(/(<li>.*<\/li>)/g, '<ul>$1</ul>');
        
        // 链接
        text = text.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>');
        
        // 代码块
        text = text.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
        text = text.replace(/`(.*?)`/g, '<code>$1</code>');
        
        // 引用
        text = text.replace(/^> (.*$)/gm, '<blockquote>$1</blockquote>');
        
        // 段落
        text = text.replace(/(^(?!<[a-z]).*$(?<!>))/gm, '<p>$1</p>');
        
        return text;
    }

    // 更新预览
    function updatePreview() {
        const selectedStyle = getSelectedDateStyle();
        const isDateVisible = showDateCheckbox.checked;
        const authorText = authorInput.value.trim();
        const isAuthorVisible = !!authorText;

        // 更新海报样式
        poster.className = 'poster';
        poster.classList.add(`date-style-${selectedStyle}`);

        // 更新标题和页脚
        posterTitle.textContent = titleInput.value.trim() || 'AI新动向社群早报';
        posterFooterText.textContent = footerTextInput.value.trim();

        // 更新作者
        posterAuthor.textContent = authorText;
        posterAuthor.style.display = isAuthorVisible ? 'block' : 'none';
        posterFooterText.style.display = footerTextInput.value.trim() ? 'inline' : 'none';

        // 更新日期
        updateDate();

        // 控制日期元素的可见性
        if (selectedStyle === 'text') {
            textDateLine.style.display = isDateVisible ? 'block' : 'none';
            posterDateContainer.style.display = 'none';
        } else {
            textDateLine.style.display = 'none';
            posterDateContainer.style.display = isDateVisible ? 'flex' : 'none';
        }

        // 解析Markdown内容
        const markdownContent = contentInput.value;
        try {
            if (checkMarkedLoaded()) {
                posterContent.innerHTML = marked.parse(markdownContent);
            } else {
                console.warn('Using fallback Markdown parser');
                posterContent.innerHTML = simpleMarkdownParser(markdownContent);
            }
        } catch (error) {
            console.error("Error parsing Markdown:", error);
            posterContent.innerHTML = "<p style='color: red;'>Markdown 解析错误，请检查语法。</p>";
        }
    }

    // 处理图片上传
    function handleImageUpload(file) {
        const reader = new FileReader();
        reader.onload = function(event) {
            posterQrCode.src = event.target.result;
            posterQrCode.style.display = 'block';
            removeImageBtn.style.display = 'block';
        };
        reader.onerror = function() {
            console.error("Error reading file.");
            posterQrCode.src = '';
            posterQrCode.style.display = 'none';
            removeImageBtn.style.display = 'none';
            alert('图片加载失败。');
        }
        reader.readAsDataURL(file);
    }

    // 删除图片
    function removeImage() {
        qrCodeInput.value = '';
        posterQrCode.src = '';
        posterQrCode.style.display = 'none';
        removeImageBtn.style.display = 'none';
    }

    // 事件监听器
    qrCodeInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) handleImageUpload(file);
    });

    removeImageBtn.addEventListener('click', removeImage);
    previewBtn.addEventListener('click', updatePreview);
    showDateCheckbox.addEventListener('change', updatePreview);
    dateStyleRadios.forEach(radio => radio.addEventListener('change', updatePreview));

    // 保存图片
    saveBtn.addEventListener('click', function() {
        const originalDisplayStyle = saveBtn.style.display;
        saveBtn.style.display = 'none';

        html2canvas(document.getElementById('poster'), {
            scale: 2,
            logging: false,
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#0a192f'
        }).then(canvas => {
            saveBtn.style.display = originalDisplayStyle;
            const link = document.createElement('a');
            const timestamp = new Date().toISOString().slice(0, 10);
            link.download = `AI早报-${timestamp}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        }).catch(err => {
            console.error("截图失败:", err);
            saveBtn.style.display = originalDisplayStyle;
            alert("抱歉，生成图片时出错。");
        });
    });

    // 自动调整文本区域高度
    function adjustTextareaHeight() {
        contentInput.style.height = 'auto';
        contentInput.style.height = (contentInput.scrollHeight) + 'px';
    }

    contentInput.addEventListener('input', adjustTextareaHeight);
    window.addEventListener('resize', adjustTextareaHeight);

    // 初始化内容
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

    contentInput.value = exampleMarkdown;
    adjustTextareaHeight();
    updatePreview();
});