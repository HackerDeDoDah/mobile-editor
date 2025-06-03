document.addEventListener('deviceready', onDeviceReady, false);

function onDeviceReady() {
    initializeEditors();
    setupEventListeners();
    setupMobileInterface();
}

let htmlEditor, cssEditor, jsEditor;
let currentFileSystem = null;
let currentPath = '';

function initializeEditors() {
    htmlEditor = CodeMirror.fromTextArea(document.getElementById('htmlEditor'), {
        mode: 'xml',
        theme: 'monokai',
        lineNumbers: true,
        autoCloseTags: true,
        lineWrapping: true,
        tabSize: 2,
        matchBrackets: true,
        scrollbarStyle: 'native'
    });

    cssEditor = CodeMirror.fromTextArea(document.getElementById('cssEditor'), {
        mode: 'css',
        theme: 'monokai',
        lineNumbers: true,
        lineWrapping: true,
        tabSize: 2,
        matchBrackets: true,
        scrollbarStyle: 'native'
    });

    jsEditor = CodeMirror.fromTextArea(document.getElementById('jsEditor'), {
        mode: 'javascript',
        theme: 'monokai',
        lineNumbers: true,
        lineWrapping: true,
        tabSize: 2,
        matchBrackets: true,
        scrollbarStyle: 'native'
    });

    // Hide all editors initially except HTML
    document.querySelector('[data-type="html"]').classList.add('active');
    cssEditor.getWrapperElement().style.display = 'none';
    jsEditor.getWrapperElement().style.display = 'none';
    document.getElementById('previewContainer').style.display = 'none';
}

function setupEventListeners() {
    // Tab switching
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', () => {
            const type = tab.getAttribute('data-type');
            switchTab(type);
        });
    });

    // Snippet panel toggle
    document.querySelector('.snippet-toggle').addEventListener('click', () => {
        document.querySelector('.snippet-panel').classList.toggle('show');
    });

    // Snippet buttons
    document.querySelectorAll('.shortcut-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const snippet = btn.getAttribute('data-snippet');
            if (snippet) {
                insertSnippet(snippet);
            }
        });
    });

    // New file/folder buttons
    document.getElementById('newFileBtn').addEventListener('click', createNewFile);
    document.getElementById('newFolderBtn').addEventListener('click', createNewFolder);

    // Preview update
    let previewTimeout;
    [htmlEditor, cssEditor, jsEditor].forEach(editor => {
        editor.on('change', () => {
            clearTimeout(previewTimeout);
            previewTimeout = setTimeout(updatePreview, 1000);
        });
    });
}

function setupMobileInterface() {
    // Enable touch scrolling
    document.querySelectorAll('.CodeMirror-scroll').forEach(elem => {
        elem.style.webkitOverflowScrolling = 'touch';
    });

    // Adjust editor size on keyboard show/hide
    window.addEventListener('resize', () => {
        const editors = document.querySelectorAll('.CodeMirror');
        editors.forEach(editor => {
            editor.refresh();
        });
    });

    // Handle back button
    document.addEventListener('backbutton', (e) => {
        e.preventDefault();
        if (document.querySelector('.snippet-panel.show')) {
            document.querySelector('.snippet-panel').classList.remove('show');
        }
    }, false);
}

function switchTab(type) {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelector(`[data-type="${type}"]`).classList.add('active');

    const editors = {
        html: htmlEditor.getWrapperElement(),
        css: cssEditor.getWrapperElement(),
        js: jsEditor.getWrapperElement(),
        preview: document.getElementById('previewContainer')
    };

    Object.values(editors).forEach(editor => editor.style.display = 'none');
    editors[type].style.display = 'block';

    if (type === 'preview') {
        updatePreview();
    }
}

function insertSnippet(snippet) {
    const activeEditor = getCurrentEditor();
    if (activeEditor) {
        const doc = activeEditor.getDoc();
        const cursor = doc.getCursor();
        doc.replaceRange(snippet, cursor);
        activeEditor.focus();
    }
}

function getCurrentEditor() {
    const activeTab = document.querySelector('.tab.active').getAttribute('data-type');
    switch (activeTab) {
        case 'html': return htmlEditor;
        case 'css': return cssEditor;
        case 'js': return jsEditor;
        default: return null;
    }
}

function updatePreview() {
    const html = htmlEditor.getValue();
    const css = cssEditor.getValue();
    const js = jsEditor.getValue();

    const iframe = document.getElementById('previewFrame');
    const preview = iframe.contentDocument || iframe.contentWindow.document;
    preview.open();
    preview.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>${css}</style>
        </head>
        <body>
            ${html}
            <script>${js}<\/script>
        </body>
        </html>
    `);
    preview.close();
}

function createNewFile() {
    const filename = prompt('Enter file name:');
    if (filename) {
        // TODO: Implement file creation using Cordova File API
        console.log('Creating file:', filename);
    }
}

function createNewFolder() {
    const foldername = prompt('Enter folder name:');
    if (foldername) {
        // TODO: Implement folder creation using Cordova File API
        console.log('Creating folder:', foldername);
    }
}
