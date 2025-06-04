document.addEventListener('DOMContentLoaded', () => {
    // Landing page and cookies handling
    const editorContainer = document.getElementById('editor-container');
    const landingPage = document.getElementById('landing-page');
    const cookiesPopup = document.getElementById('cookies-popup');
    const startCodingBtn = document.getElementById('start-coding');
    const acceptCookiesBtn = document.getElementById('accept-cookies');

    // Check if cookies are accepted
    const cookiesAccepted = localStorage.getItem('cookiesAccepted');
    if (cookiesAccepted) {
        cookiesPopup.style.display = 'none';
    }

    // Handle cookie acceptance
    acceptCookiesBtn.addEventListener('click', () => {
        localStorage.setItem('cookiesAccepted', 'true');
        cookiesPopup.style.display = 'none';
    });

    // Handle start coding button
    startCodingBtn.addEventListener('click', () => {
        landingPage.style.display = 'none';
        editorContainer.style.display = 'flex';
    });

    // Initialize CodeMirror instances
    const htmlEditor = CodeMirror.fromTextArea(document.getElementById('htmlEditor'), {
        mode: 'xml',
        theme: 'monokai',
        lineNumbers: true,
        autoCloseTags: true,
        autoCloseBrackets: true,
        extraKeys: { 
            'Ctrl-Space': 'autocomplete',
            'Ctrl-Shift-1': (cm) => {
                const template = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
</head>
<body>
    
</body>
</html>`;
                cm.setValue(template);
                // Place cursor between body tags
                cm.setCursor(cm.lineCount() - 3, 4);
            }
        }
    });

    const cssEditor = CodeMirror.fromTextArea(document.getElementById('cssEditor'), {
        mode: 'css',
        theme: 'monokai',
        lineNumbers: true,
        autoCloseBrackets: true,
        extraKeys: { 'Ctrl-Space': 'autocomplete' }
    });

    const jsEditor = CodeMirror.fromTextArea(document.getElementById('jsEditor'), {
        mode: 'javascript',
        theme: 'monokai',
        lineNumbers: true,
        autoCloseBrackets: true,
        extraKeys: { 'Ctrl-Space': 'autocomplete' }
    });

    // Hide CSS, JS editors and preview initially
    document.querySelector('[data-type="html"]').classList.add('active');
    cssEditor.getWrapperElement().style.display = 'none';
    jsEditor.getWrapperElement().style.display = 'none';
    document.getElementById('previewContainer').style.display = 'none';

    // Tab switching logic
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', () => {
            const type = tab.getAttribute('data-type');
            
            // Update active tab
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            // Show/hide editors and preview
            htmlEditor.getWrapperElement().style.display = type === 'html' ? '' : 'none';
            cssEditor.getWrapperElement().style.display = type === 'css' ? '' : 'none';
            jsEditor.getWrapperElement().style.display = type === 'js' ? '' : 'none';
            document.getElementById('previewContainer').style.display = type === 'preview' ? '' : 'none';

            // Refresh the active editor
            if (type === 'html') htmlEditor.refresh();
            if (type === 'css') cssEditor.refresh();
            if (type === 'js') jsEditor.refresh();
            if (type === 'preview') updatePreview();
        });
    });

    // Shortcuts and snippets panel functionality
    document.querySelectorAll('.shortcut-btn').forEach(btn => {
        if (btn.classList.contains('snippet-toggle')) {
            btn.addEventListener('click', () => {
                const snippetPanel = document.querySelector('.snippet-panel');
                snippetPanel.classList.toggle('show');
                // Update button text
                btn.textContent = snippetPanel.classList.contains('show') ? '×' : '≡';
            });
            return;
        }

        btn.addEventListener('click', () => {
            const snippet = btn.getAttribute('data-snippet');
            const activeEditor = document.querySelector('.tab.active').getAttribute('data-type');
            
            let editor;
            switch(activeEditor) {
                case 'html':
                    editor = htmlEditor;
                    break;
                case 'css':
                    editor = cssEditor;
                    break;
                case 'js':
                    editor = jsEditor;
                    break;
                default:
                    return;
            }

            // Get cursor position
            const cursor = editor.getCursor();
            // Insert the snippet at cursor position
            editor.replaceRange(snippet, cursor);
            // Focus back on the editor
            editor.focus();
        });
    });

    // Live preview functionality
    const updatePreview = () => {
        const previewFrame = document.getElementById('previewFrame');
        const html = htmlEditor.getValue();
        const css = cssEditor.getValue();
        const js = jsEditor.getValue();

        const content = `
            <!DOCTYPE html>
            <html>
                <head>
                    <style>${css}</style>
                </head>
                <body>
                    ${html}
                    <script>${js}</script>
                </body>
            </html>
        `;

        const previewDocument = previewFrame.contentDocument || previewFrame.contentWindow.document;
        previewDocument.open();
        previewDocument.write(content);
        previewDocument.close();
    };

    // Add change listeners for live preview
    htmlEditor.on('change', updatePreview);
    cssEditor.on('change', updatePreview);
    jsEditor.on('change', updatePreview);

    // Initial preview update
    updatePreview();
    
    // Check if we should show the editor
    const hasVisitedBefore = localStorage.getItem('hasVisitedBefore');
    if (hasVisitedBefore) {
        landingPage.style.display = 'none';
        editorContainer.style.display = 'flex';
        // Refresh editors after displaying
        htmlEditor.refresh();
        cssEditor.refresh();
        jsEditor.refresh();
    } else {
        editorContainer.style.display = 'none';
    }

    // Mobile keyboard detection
    const mobilePanels = document.querySelector('.mobile-panels');
    let originalWindowHeight = window.innerHeight;

    window.addEventListener('resize', () => {
        // If the window height is significantly smaller than the original height,
        // we can assume the keyboard is open (using 2/3 as a threshold)
        if (window.innerHeight < originalWindowHeight * 0.66) {
            mobilePanels.classList.add('keyboard-open');
        } else {
            mobilePanels.classList.remove('keyboard-open');
            originalWindowHeight = window.innerHeight;
        }
    });

    // Update original height when orientation changes
    window.addEventListener('orientationchange', () => {
        setTimeout(() => {
            originalWindowHeight = window.innerHeight;
        }, 300);
    });

    // Prevent panels from being hidden when focusing inputs
    document.addEventListener('focus', (e) => {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
            mobilePanels.classList.add('keyboard-open');
        }
    }, true);

    document.addEventListener('blur', (e) => {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
            mobilePanels.classList.remove('keyboard-open');
        }
    }, true);
});
