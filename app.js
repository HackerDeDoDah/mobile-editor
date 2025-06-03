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
    });
});

// File system functionality
class FileSystem {
    constructor() {
        this.files = JSON.parse(localStorage.getItem('files')) || {};
        this.renderFileTree();
        this.bindEvents();
    }

    createFile(name, content = '') {
        if (!name) return;
        const path = name.split('/').filter(Boolean);
        let current = this.files;
        
        for (let i = 0; i < path.length - 1; i++) {
            if (!current[path[i]]) {
                current[path[i]] = {};
            }
            current = current[path[i]];
        }
        
        current[path[path.length - 1]] = content;
        this.save();
        this.renderFileTree();
    }

    createFolder(name) {
        if (!name) return;
        const path = name.split('/').filter(Boolean);
        let current = this.files;
        
        for (const folder of path) {
            if (!current[folder]) {
                current[folder] = {};
            }
            current = current[folder];
        }
        
        this.save();
        this.renderFileTree();
    }

    save() {
        localStorage.setItem('files', JSON.stringify(this.files));
    }

    renderFileTree() {
        const fileTree = document.getElementById('fileTree');
        fileTree.innerHTML = this.generateFileTreeHTML(this.files);
    }

    generateFileTreeHTML(obj, path = '') {
        let html = '<ul>';
        for (const [key, value] of Object.entries(obj)) {
            const fullPath = path ? `${path}/${key}` : key;
            if (typeof value === 'string') {
                html += `<li class="file" data-path="${fullPath}">${key}</li>`;
            } else {
                html += `<li class="folder">
                    <span class="folder-name">${key}</span>
                    ${this.generateFileTreeHTML(value, fullPath)}
                </li>`;
            }
        }
        html += '</ul>';
        return html;
    }

    bindEvents() {
        document.getElementById('newFileBtn').addEventListener('click', () => {
            const name = prompt('Enter file name:');
            if (name) this.createFile(name);
        });

        document.getElementById('newFolderBtn').addEventListener('click', () => {
            const name = prompt('Enter folder name:');
            if (name) this.createFolder(name);
        });

        document.getElementById('fileTree').addEventListener('click', (e) => {
            if (e.target.classList.contains('file')) {
                const path = e.target.getAttribute('data-path');
                this.openFile(path);
            }
        });
    }

    openFile(path) {
        const content = this.getFileContent(path);
        if (path.endsWith('.html')) {
            htmlEditor.setValue(content);
            document.querySelector('[data-type="html"]').click();
        } else if (path.endsWith('.css')) {
            cssEditor.setValue(content);
            document.querySelector('[data-type="css"]').click();
        } else if (path.endsWith('.js')) {
            jsEditor.setValue(content);
            document.querySelector('[data-type="js"]').click();
        }
    }

    getFileContent(path) {
        const parts = path.split('/');
        let current = this.files;
        for (const part of parts) {
            current = current[part];
        }
        return current;
    }
}

// Initialize file system
const fileSystem = new FileSystem();

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
function updatePreview() {
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
}

// Add change listeners for live preview
htmlEditor.on('change', updatePreview);
cssEditor.on('change', updatePreview);
jsEditor.on('change', updatePreview);

// Initial preview update
updatePreview();
