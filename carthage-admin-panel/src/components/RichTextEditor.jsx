import React, { useRef, useMemo, useCallback } from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { apiService } from '../api';

const RichTextEditor = ({ value, onChange, placeholder = "Enter description..." }) => {
  const quillRef = useRef(null);

  const imageHandler = useCallback(() => {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.click();

    input.onchange = async () => {
      const file = input.files ? input.files[0] : null;
      if (!file) return;

      const quill = quillRef.current.getEditor();
      const range = quill.getSelection(true);

      // Optionally insert a placeholder or loading state
      quill.insertText(range.index, 'Uploading image...', 'user');

      try {
        const uploadResult = await apiService.uploadImage(file);
        if (uploadResult && uploadResult.url) {
          // Remove the "Uploading image..." text
          quill.deleteText(range.index, 18);
          // Insert the image URL
          quill.insertEmbed(range.index, 'image', uploadResult.url);
          // Move cursor to the end of the image
          quill.setSelection(range.index + 1);
        } else {
          throw new Error('Image upload failed');
        }
      } catch (error) {
        console.error('Image upload error:', error);
        quill.deleteText(range.index, 18);
        alert('Failed to upload image. Please try again.');
      }
    };
  }, []);

  const modules = useMemo(() => ({
    table: true,
    toolbar: {
      container: [
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        ['link', 'image'],
        [{ 'table': 'insert' }, { 'table': 'append-row' }, { 'table': 'append-col' }],
        ['clean']
      ],
      handlers: {
        image: imageHandler
      }
    }
  }), [imageHandler]);

  return (
    <ReactQuill
      ref={quillRef}
      theme="snow"
      value={value}
      onChange={onChange}
      modules={modules}
      placeholder={placeholder}
    />
  );
};

export default RichTextEditor;
