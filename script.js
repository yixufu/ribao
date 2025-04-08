document.addEventListener('DOMContentLoaded', function() {
    // Get DOM elements
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

    // Poster elements
    const poster = document.getElementById('poster');
    const posterTitle = document.getElementById('poster-title');
    const titleAuthorGroup = document.querySelector('.title-author-group'); // Container for title and author
    const posterAuthor = document.getElementById('poster-author'); // Author span inside the group
    const posterDateContainer = document.getElementById('poster-date-container'); // Calendar container
    const textDateLine = document.querySelector('.text-date-line'); // Container for text date
    const posterDateText = document.getElementById('poster-date-text'); // Text date span
    const posterContent = document.getElementById('poster-content');
    const posterFooterText = document.getElementById('poster-footer-text');
    const posterQrCode = document.getElementById('poster-qr-code');

    // Get the currently selected date style ('text' or 'calendar')
    function getSelectedDateStyle() {
        return document.querySelector('input[name="date-style"]:checked').value;
    }

    // Update the date display based on the selected style
    function updateDate() {
        const now = new Date();
        const style = getSelectedDateStyle();

        // Clear previous date content
        posterDateContainer.innerHTML = '';
        posterDateText.textContent = '';
        posterDateContainer.classList.remove('calendar-date'); // Ensure calendar class is removed if not needed

        if (style === 'text') {
            // Style 1: Text style - Update the text date span
            const options = { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' };
            posterDateText.textContent = now.toLocaleDateString('zh-CN', options);
        } else if (style === 'calendar') {
            // Style 2: Calendar style - Build the calendar icon
            // Get date components
            const weekdayLong = now.toLocaleDateString('zh-CN', { weekday: 'long' }); // Get full "星期X"
            const day = now.getDate();
            const month = now.toLocaleDateString('zh-CN', { month: 'short' }); // e.g., "4月"
            const year = now.getFullYear();

            // Add specific class for styling
            posterDateContainer.classList.add('calendar-date');

            // Create elements for calendar display
            const weekdaySpan = document.createElement('span');
            weekdaySpan.className = 'calendar-weekday';
            weekdaySpan.textContent = weekdayLong; // Use full "星期X"

            const daySpan = document.createElement('span');
            daySpan.className = 'calendar-day';
            daySpan.textContent = day;

            const monthYearSpan = document.createElement('span');
            monthYearSpan.className = 'calendar-month-year';
            monthYearSpan.textContent = `${month} / ${year}`;

            // Append elements to the calendar container
            posterDateContainer.appendChild(weekdaySpan);
            posterDateContainer.appendChild(daySpan);
            posterDateContainer.appendChild(monthYearSpan);
        }
    }

    // Update the entire preview panel based on editor inputs
    function updatePreview() {
        const selectedStyle = getSelectedDateStyle();
        const isDateVisible = showDateCheckbox.checked;
        const authorText = authorInput.value.trim();
        const isAuthorVisible = !!authorText; // Check if author input is not empty

        // 1. Update poster container class for CSS styling
        poster.className = 'poster'; // Reset classes
        poster.classList.add(`date-style-${selectedStyle}`); // Add current style class

        // 2. Update title, footer text
        posterTitle.textContent = titleInput.value.trim() || 'AI新动向社群早报'; // Use default title if empty
        posterFooterText.textContent = footerTextInput.value.trim();

        // 3. Update Author display (independent of date style now)
        posterAuthor.textContent = authorText;
        posterAuthor.style.display = isAuthorVisible ? 'block' : 'none'; // Use 'block' for span styled as block

        // 4. Update Footer Text display
        posterFooterText.style.display = footerTextInput.value.trim() ? 'inline' : 'none';

        // 5. Update Date display (calls function that handles both styles)
        updateDate();

        // 6. Control visibility of date elements based on style and checkbox
        if (selectedStyle === 'text') {
            // Show text date line if date is checked, hide calendar
            textDateLine.style.display = isDateVisible ? 'block' : 'none';
            posterDateContainer.style.display = 'none';
        } else { // Calendar style
            // Hide text date line, show calendar if date is checked
            textDateLine.style.display = 'none';
            posterDateContainer.style.display = isDateVisible ? 'flex' : 'none';
        }

        // 7. Update markdown content
        const markdownContent = contentInput.value;
        try {
            // Use marked library to parse markdown to HTML
            const htmlContent = marked.parse(markdownContent);
            posterContent.innerHTML = htmlContent;
        } catch (error) {
            console.error("Error parsing Markdown:", error);
            posterContent.innerHTML = "<p style='color: red;'>Markdown 解析错误，请检查语法。</p>"; // Show error in preview
        }
    }

    // Handle image upload for QR code
    function handleImageUpload(file) {
        const reader = new FileReader();
        reader.onload = function(event) {
            posterQrCode.src = event.target.result;
            posterQrCode.style.display = 'block'; // Show image element
            removeImageBtn.style.display = 'block'; // Show remove button
        };
        reader.onerror = function() {
            console.error("Error reading file.");
            posterQrCode.src = ''; // Clear src on error
            posterQrCode.style.display = 'none'; // Hide image on error
            removeImageBtn.style.display = 'none';
            alert('图片加载失败。');
        }
        reader.readAsDataURL(file);
    }

    // Remove the uploaded QR code image
    function removeImage() {
        qrCodeInput.value = ''; // Clear file input
        posterQrCode.src = ''; // Clear image source
        posterQrCode.style.display = 'none'; // Hide image element
        removeImageBtn.style.display = 'none'; // Hide remove button
    }

    // --- Event Listeners ---

    // QR code input change
    qrCodeInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            handleImageUpload(file);
        }
    });

    // Remove image button click
    removeImageBtn.addEventListener('click', removeImage);

    // Preview button click
    previewBtn.addEventListener('click', updatePreview);

    // Show date checkbox change
    showDateCheckbox.addEventListener('change', updatePreview);

    // Date style radio buttons change
    dateStyleRadios.forEach(radio => {
        radio.addEventListener('change', updatePreview);
    });

    // Save poster as image button click
    saveBtn.addEventListener('click', function() {
        // Temporarily hide the save button itself to avoid capturing it
        const originalDisplayStyle = saveBtn.style.display;
        saveBtn.style.display = 'none';

        // Use html2canvas to capture the poster element
        html2canvas(document.getElementById('poster'), {
            scale: 2, // Increase scale for better resolution
            logging: false, // Disable logging in console
            useCORS: true, // Enable cross-origin resource sharing if needed
            allowTaint: true, // Allow tainting the canvas
            backgroundColor: '#0a192f' // Ensure background color is captured
        }).then(canvas => {
            // Restore the save button display
            saveBtn.style.display = originalDisplayStyle;

            // Create a link element to trigger download
            const link = document.createElement('a');
            // Generate filename with date
            const timestamp = new Date().toISOString().slice(0, 10);
            link.download = `AI早报-${timestamp}.png`;
            link.href = canvas.toDataURL('image/png'); // Get image data URL
            link.click(); // Simulate click to download
        }).catch(err => {
            console.error("截图失败 (Screenshot failed):", err);
            // Restore the save button even if an error occurs
             saveBtn.style.display = originalDisplayStyle;
             alert("抱歉，生成图片时出错。请检查控制台获取更多信息。"); // Inform user
        });
    });

    // Auto-adjust textarea height based on content
    function adjustTextareaHeight() {
        contentInput.style.height = 'auto'; // Reset height
        // Set height to scroll height plus a small buffer if needed
        contentInput.style.height = (contentInput.scrollHeight) + 'px';
    }

    // Adjust height on input and window resize
    contentInput.addEventListener('input', adjustTextareaHeight);
    window.addEventListener('resize', adjustTextareaHeight); // Adjust on resize too

    // --- Initial Setup ---

    // Example Markdown content
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

    contentInput.value = exampleMarkdown; // Set example content
    adjustTextareaHeight(); // Initial height adjustment
    updatePreview(); // Initial preview generation
});
